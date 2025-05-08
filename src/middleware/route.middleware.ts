import { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (res.headersSent) {
    return next(err);
  }

  const errorResponse =
    process.env.NODE_ENV === "development"
      ? {
          error: err.message,
          stack: err.stack,
        }
      : {
          error: "Internal server error",
        };

  res.status(500);
  res.json({ ...errorResponse });
}
