import { Request, Response, NextFunction } from "express";
import { AspectError } from "../errors/aspectError";
import { config } from "../config/config";
import logger from "../logger/logger";

export const errorHandler = (
  err: Error | AspectError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (config.NODE_ENV !== "production") {
    console.error(`[Error]: ${message}`);
    message = err.message || message;
    statusCode = err instanceof AspectError ? err.statusCode : 500;
  }

  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  res.status(statusCode).json({
    status: "error",
    message,
  });
};
