import path from 'path';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

export const TEST_CONFIG = {
  services: {
    timeout: parseInt(process.env.TEST_SERVICES_TIMEOUT || '60000'),
    healthCheckRetries: parseInt(process.env.TEST_HEALTH_CHECK_RETRIES || '10'),
    healthCheckInterval: parseInt(
      process.env.TEST_HEALTH_CHECK_INTERVAL || '2000'
    )
  },
  mongodb: {
    dbName: process.env.TEST_MONGODB_DB_NAME || 'schema_forge_test',
    port: parseInt(process.env.TEST_MONGODB_PORT || '27017'),
    version: process.env.TEST_MONGODB_VERSION || '7.0.0',
    maxPoolSize: parseInt(process.env.TEST_MONGODB_POOL_SIZE || '10'),
    timeout: parseInt(process.env.TEST_MONGODB_TIMEOUT || '5000'),
    socketTimeoutMS: parseInt(
      process.env.TEST_MONGODB_SOCKET_TIMEOUT || '45000'
    ),
    connectTimeoutMS: parseInt(
      process.env.TEST_MONGODB_CONNECT_TIMEOUT || '10000'
    ),
    maxIdleTimeMS: parseInt(process.env.TEST_MONGODB_MAX_IDLE_TIME || '30000'),
    retryWrites: process.env.TEST_MONGODB_RETRY_WRITES === 'true',
    retryReads: process.env.TEST_MONGODB_RETRY_READS === 'true',
    debug: process.env.TEST_MONGODB_DEBUG === 'true',
    strictQuery: process.env.TEST_MONGODB_STRICT_QUERY === 'true'
  },
  redis: {
    host: process.env.TEST_REDIS_HOST || 'localhost',
    port: parseInt(process.env.TEST_REDIS_PORT || '6379')
  },
  mailhog: {
    host: process.env.TEST_MAILHOG_HOST || 'localhost',
    smtpPort: parseInt(process.env.TEST_MAILHOG_SMTP_PORT || '1025'),
    webPort: parseInt(process.env.TEST_MAILHOG_WEB_PORT || '8025')
  },
  docker: {
    enabled: process.env.TEST_DOCKER_ENABLED === 'true',
    composeFile:
      process.env.TEST_DOCKER_COMPOSE_FILE || 'docker-compose.test.yml',
    timeout: parseInt(process.env.TEST_DOCKER_TIMEOUT || '60000')
  }
} as const;
