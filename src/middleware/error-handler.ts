import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/errors.js";

// Terminal error middleware (must be registered last, with 4 args). 4xx
// echoes the message; 5xx is logged and returns a generic message so
// internals never leak to the client.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) return next(err);

  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const detail = err instanceof HttpError ? err.detail : undefined;

  if (statusCode >= 500) {
    console.error("[error]", err);
    res.sendError({ message: "Something went wrong.", statusCode: 500 });
    return;
  }

  res.sendError({
    message: err instanceof Error ? err.message : "Request failed.",
    statusCode,
    detail
  });
}
