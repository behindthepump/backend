import type { NextFunction, Request, Response } from "express";

// Redact credential-bearing query params before logging (defensive - we
// don't use them today, but never log a token/password if one appears).
function redactQuery(url: string): string {
  return url.replace(/([?&](?:token|key|api_?key|password)=)[^&]*/gi, "$1[REDACTED]");
}

// One line per request, logged when the response finishes so it can include
// the outcome: method, path, status, duration, and the authed uid (set by
// authMiddleware by the time `finish` fires).
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const who = req.userId ? ` uid=${req.userId}` : "";
    console.log(
      `${new Date().toISOString()} ${req.method} ${redactQuery(req.originalUrl)} ` +
        `${res.statusCode} ${ms.toFixed(1)}ms${who}`
    );
  });
  next();
}
