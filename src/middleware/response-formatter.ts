import type { NextFunction, Request, Response } from "express";

// Attaches res.sendSuccess / res.sendError so every response shares one
// JSON envelope:
//   success: { success: true, data, message?, meta? }
//   error:   { success: false, message, detail? }
export function responseFormatter(_req: Request, res: Response, next: NextFunction): void {
  res.sendSuccess = ({ data, message, statusCode = 200, meta }) => {
    res.status(statusCode).json({ success: true, data, message, meta });
  };
  res.sendError = ({ message, statusCode = 500, detail }) => {
    res.status(statusCode).json({ success: false, message, detail });
  };
  next();
}
