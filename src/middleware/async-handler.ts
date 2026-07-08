import type { NextFunction, Request, RequestHandler, Response } from "express";

// Wraps an async handler so a rejected promise reaches the error handler
// via next(err) instead of crashing the process.
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
