import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db";
import { config } from "./config/env";
import morgan from "morgan";
import helmet from "helmet";
import logger from "./utils/logger";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(helmet());

// Setup request logging
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

app.listen(config.PORT, async () => {
  logger.info(
    `Server is running on port ${config.PORT} on ${config.NODE_ENV} mode`
  );
  await connectDB();
});
