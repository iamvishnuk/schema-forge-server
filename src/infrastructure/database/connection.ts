import mongoose from 'mongoose';
import logger from '../../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    // Skip connection in test environment as it's handled by test setup
    if (process.env.NODE_ENV === 'test') {
      logger.info('Skipping MongoDB connection in test environment');
      return;
    }

    // set debug to true to log all queries
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    logger.info(`MongoDB Connected: ${conn.connection.db?.databaseName}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error connecting to MongoDB: ${error.message}`);
    } else {
      logger.error('Unknown error connecting to MongoDB');
    }
    process.exit(1);
  }
};
