import { afterAll, beforeAll, beforeEach } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  try {
    console.log('🧪 Setting up test environment...');

    // Set test environment
    process.env.NODE_ENV = 'test';

    // Start the in-memory MongoDB server with configuration
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '6.0.0' // Specify MongoDB version for consistency
      },
      instance: {
        dbName: 'test_db'
        // port: 27017, // Optional: specify port
      }
    });

    const mongoUri = mongoServer.getUri();
    console.log(`📡 MongoDB Memory Server started at: ${mongoUri}`);

    // Connect to the in-memory MongoDB server with options
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    // Disable debug in tests for cleaner output (set to true if you need debugging)
    mongoose.set('debug', false);
    mongoose.set('strictQuery', false);

    console.log('✅ Connected to test database');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    process.exit(1);
  }
}, 30000); // 30 second timeout for setup

// Global teardown - runs once after all tests
afterAll(async () => {
  try {
    console.log('🧹 Cleaning up test environment...');

    // Check if connection exists before cleanup
    if (mongoose.connection.readyState === 1) {
      // Drop database before closing connection
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }

    // Stop MongoDB instance
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log('✅ Test cleanup completed');
  } catch (error) {
    console.error('❌ Error during test cleanup:', error);
  }
}, 30000); // 30 second timeout for cleanup

// Clean database before each test
beforeEach(async () => {
  try {
    // Ensure connection is ready
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not ready');
    }

    const collections = mongoose.connection.collections;

    // Use Promise.all for better performance
    const clearPromises = Object.keys(collections).map(async (key) => {
      const collection = collections[key];
      await collection.deleteMany({});
    });

    await Promise.all(clearPromises);
  } catch (error) {
    console.error('❌ Error clearing database between tests:', error);
    throw error; // Re-throw to fail the test if cleanup fails
  }
});
export { mongoServer, mongoose }; // Export for use in tests
export default {}; // Default export to ensure this file is treated as a module
