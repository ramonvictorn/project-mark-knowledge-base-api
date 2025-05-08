import { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof RequestError) {
    res.status(err.status);
    res.json({ error: err.message });
    return;
  }

  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

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

class RequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);

    this.name = "RequestError";
    this.status = status;
  }
}

export class NotFoundError extends RequestError {
  constructor(message: string) {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends RequestError {
  constructor(message: string) {
    super(400, message);
    this.name = "BadRequestError";
  }
}

export class ForbiddenError extends RequestError {
  constructor(message: string) {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends RequestError {
  constructor(message: string) {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}
