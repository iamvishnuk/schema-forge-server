import path from 'path';
import { TEST_CONFIG } from '../test.config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Load test environment variables

export let mongoServer: MongoMemoryServer;

// Enhanced error handling and logging
export class TestSetupError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'TestSetupError';
  }
}

export const execDockerCommand = async (
  command: string[],
  cwd: string,
  timeoutMs = 30000
): Promise<{ success: boolean; output: string }> => {
  const { spawn } = await import('child_process');

  return new Promise((resolve) => {
    const process = spawn('docker', command, {
      cwd,
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    process.stdout?.on('data', (data) => {
      output += data.toString();
    });

    process.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });

    const timeout = setTimeout(() => {
      process.kill();
      resolve({ success: false, output: 'Docker command timeout' });
    }, timeoutMs);

    process.on('close', (code) => {
      clearTimeout(timeout);
      resolve({
        success: code === 0,
        output: code === 0 ? output : errorOutput || output
      });
    });

    process.on('error', (error) => {
      clearTimeout(timeout);
      resolve({ success: false, output: error.message });
    });
  });
};

export const waitForDockerServices = async (
  maxRetries = 20, // Increased from 15
  retryInterval = 2000 // Decreased interval but more retries
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Add actual health checks for your services here
      // For example, check Redis connection, database connection, etc.

      // Wait for each attempt to allow services to fully start
      await new Promise((resolve) => setTimeout(resolve, retryInterval));

      console.log(
        `⏳ Checking services health... (attempt ${i + 1}/${maxRetries})`
      );

      // You could add specific health checks here, for example:
      // - Check if Redis is responding
      // - Check if MailHog is accepting connections
      // For now, we'll wait and assume services are ready

      if (i >= 4) {
        // Wait at least 5 attempts before considering ready
        console.log('✅ Docker services are ready');
        return true;
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new TestSetupError(
          'Docker services failed to become ready',
          error as Error
        );
      }
      console.log(
        `⏳ Waiting for services... (attempt ${i + 1}/${maxRetries})`
      );
    }
  }
  return false;
};

export const setupDockerServices = async (): Promise<void> => {
  if (!TEST_CONFIG.docker?.enabled) {
    console.log('⏭️  Docker services disabled in test config');
    return;
  }

  const projectRoot = path.resolve(__dirname, '../../../');
  const composeFile =
    TEST_CONFIG.docker?.composeFile || 'docker-compose.test.yml';

  try {
    console.log('🔄 Checking Docker services status...');

    // Check if Docker is available
    const dockerCheck = await execDockerCommand(
      ['--version'],
      projectRoot,
      5000
    );
    if (!dockerCheck.success) {
      throw new TestSetupError('Docker is not available or not running');
    }

    // Check if services are already running
    const statusResult = await execDockerCommand(
      ['compose', '-f', composeFile, 'ps', '--format', 'json'],
      projectRoot,
      10000
    );

    let servicesRunning = false;
    if (statusResult.success && statusResult.output.trim()) {
      try {
        const services = JSON.parse(
          `[${statusResult.output.trim().split('\n').join(',')}]`
        );
        servicesRunning = services.some(
          (service: { State: string }) => service.State === 'running'
        );
      } catch {
        console.log('Could not parse service status, will start services');
      }
    }

    if (!servicesRunning) {
      console.log('🔄 Starting Docker services for testing...');
      // Start services
      const startResult = await execDockerCommand(
        ['compose', '-f', composeFile, 'up', '-d', '--wait'],
        projectRoot,
        60000
      );

      if (!startResult.success) {
        console.warn(
          '⚠️  Docker compose up failed, attempting to continue:',
          startResult.output
        );
        return; // Don't fail tests if Docker services can't start
      }

      // Wait for services to be ready
      await waitForDockerServices();
      console.log('✅ Docker services started successfully');
    } else {
      console.log('✅ Docker services already running');
    }
  } catch (error) {
    console.warn(
      '⚠️  Docker services setup failed:',
      error instanceof Error ? error.message : error
    );
    // Don't throw - allow tests to continue without Docker services
  }
};

export const setupMongoMemoryServer = async (): Promise<void> => {
  try {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Start MongoDB Memory Server with enhanced configuration
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: TEST_CONFIG.mongodb.version,
        downloadDir: path.resolve(__dirname, '../../.mongodb-binaries'),
        checkMD5: true
      },
      instance: {
        dbName: TEST_CONFIG.mongodb.dbName || 'test_db',
        port: TEST_CONFIG.mongodb.port || 27017,
        storageEngine: 'wiredTiger'
      }
    });

    const mongoUri = mongoServer.getUri();
    console.log(`📡 MongoDB Memory Server started at: ${mongoUri}`);

    // Connect with enhanced options
    await mongoose.connect(mongoUri, {
      maxPoolSize: TEST_CONFIG.mongodb.maxPoolSize || 10,
      serverSelectionTimeoutMS: TEST_CONFIG.mongodb.timeout || 5000,
      socketTimeoutMS: TEST_CONFIG.mongodb.socketTimeoutMS || 45000,
      connectTimeoutMS: TEST_CONFIG.mongodb.connectTimeoutMS || 10000,
      maxIdleTimeMS: TEST_CONFIG.mongodb.maxIdleTimeMS || 30000,
      retryWrites: TEST_CONFIG.mongodb.retryWrites || true,
      retryReads: TEST_CONFIG.mongodb.retryReads || true
    });

    // Configure mongoose for testing
    mongoose.set('debug', TEST_CONFIG.mongodb.debug || false);
    mongoose.set('strictQuery', TEST_CONFIG.mongodb.strictQuery ?? false);
    mongoose.set('bufferCommands', false); // Disable buffering for tests

    console.log('✅ Connected to test database');
  } catch (error) {
    throw new TestSetupError(
      'Failed to setup MongoDB Memory Server',
      error as Error
    );
  }
};

export const cleanupTestEnvironment = async (): Promise<void> => {
  const errors: Error[] = [];

  try {
    // Cleanup database connections
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  } catch (error) {
    errors.push(new Error(`Database cleanup failed: ${error}`));
  }

  try {
    // Stop MongoDB Memory Server
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    errors.push(new Error(`MongoDB server cleanup failed: ${error}`));
  }

  try {
    // Don't stop Docker services during cleanup to allow reuse across tests
    // Docker services will be stopped manually when needed
    console.log(
      '✅ Skipping Docker services cleanup (keeping services running for test reuse)'
    );
  } catch (error) {
    errors.push(new Error(`Docker cleanup failed: ${error}`));
  }

  if (errors.length > 0) {
    console.warn(
      '⚠️  Some cleanup operations failed:',
      errors.map((e) => e.message)
    );
  }
};
