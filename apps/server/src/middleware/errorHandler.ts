import { Request, Response, NextFunction } from "express";
import { AspectError } from "../errors/aspectError";

export const errorHandler = (
  err: Error | AspectError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err instanceof AspectError ? err.statusCode : 500;
  const message = err.message || "Something went wrong";

  if (process.env.NODE_ENV !== "production") {
    console.error(`[Error]: ${message}`);
  }

  res.status(statusCode).json({
    status: "error",
    message,
  });
};
