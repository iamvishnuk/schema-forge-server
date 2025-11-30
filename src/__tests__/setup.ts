import { afterAll, beforeAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { TEST_CONFIG } from './test.config';
import {
  cleanupTestEnvironment,
  setupDockerServices,
  setupMongoMemoryServer,
  TestSetupError
} from './helpers/util';

export let isSetupComplete = false;

beforeAll(async () => {
  if (isSetupComplete) {
    console.log('Test setup already completed, skipping...');
    return;
  }

  try {
    console.log('🔧 Setting up test environment...');

    // Set test environment variables
    process.env.NODE_ENV = 'test';

    if (!TEST_CONFIG) {
      throw new TestSetupError('TEST_CONFIG is not defined');
    }

    await Promise.all([setupDockerServices(), setupMongoMemoryServer()]);

    isSetupComplete = true;

    console.log('✅ Test environment setup complete');
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);

    // Cleanup on failure
    await cleanupTestEnvironment();

    if (error instanceof TestSetupError) {
      throw error;
    }
    throw new TestSetupError('Test setup failed', error as Error);
  }
}, 30000);

// Global teardown - runs once after all tests
afterAll(async () => {
  try {
    console.log('🧹 Cleaning up test environment...');
    await cleanupTestEnvironment();
    isSetupComplete = false;
    console.log('✅ Test cleanup completed successfully');
  } catch (error) {
    console.error('❌ Error during test cleanup:', error);
  }
}, 30000);

// Clean database before each test
beforeEach(async () => {
  try {
    // Ensure setup is complete
    if (!isSetupComplete) {
      throw new TestSetupError('Test setup was not completed successfully');
    }

    // Verify database connection with reduced retries
    let connectionAttempts = 0;
    const maxConnectionAttempts = 3; // Reduced from 5

    while (connectionAttempts < maxConnectionAttempts) {
      if (mongoose.connection.readyState === 1) {
        break;
      }
      connectionAttempts++;
      if (connectionAttempts >= maxConnectionAttempts) {
        throw new TestSetupError('Database connection not ready after retries');
      }
      await new Promise((resolve) => setTimeout(resolve, 200)); // Reduced from 1000ms
    }

    // Clear collections with optimized performance
    const collections = Object.values(mongoose.connection.collections);

    if (collections.length > 0) {
      // Parallel cleanup for better performance
      await Promise.all(
        collections.map(async (collection) => {
          try {
            // Use deleteMany instead of drop for faster cleanup
            await collection.deleteMany({});
          } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            if (
              !err?.message?.includes('ns not found') &&
              !err?.message?.includes('NamespaceNotFound') &&
              !err?.message?.includes('drop')
            ) {
              console.warn(
                `Warning: Failed to clear collection ${collection.collectionName}:`,
                err.message
              );
            }
          }
        })
      );
    }

    // Minimal delay for cleanup completion
    await new Promise((resolve) => setTimeout(resolve, 50)); // Reduced from 500ms

    // Reset any global state, mocks, etc.
    // Example: jest.clearAllMocks() if using Jest
  } catch (error) {
    console.error('❌ Error in beforeEach setup:', error);
    throw new TestSetupError(
      'Failed to prepare test environment for individual test',
      error as Error
    );
  }
});
export default {};
