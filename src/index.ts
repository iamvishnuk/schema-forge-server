import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './config/env';
import morgan from 'morgan';
import helmet from 'helmet';
import logger from './utils/logger';
import { connectDB } from './infrastructure/database/connection';
import router from './interface/routes';
import { errorHandler } from './interface/middlewares/errorHandler.middleware';
import { AppError } from './utils/appError';
import passport from './interface/middlewares/passport.middleware';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true
  })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(helmet());

// Setup request logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  })
);

app.use(`${config.BASE_PATH}`, router);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(YAML.load('./swagger.yaml'))
);

app.all('*', (req, res, next) => {
  const err = new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404);
  next(err);
});

app.use(errorHandler);

app.listen(config.PORT, async () => {
  logger.info(
    `Server is running on port http://localhost:${config.PORT}${config.BASE_PATH} on ${config.NODE_ENV} mode`
  );
  logger.info(`Swagger is running on http://localhost:${config.PORT}/api-docs`);
  await connectDB();
});
