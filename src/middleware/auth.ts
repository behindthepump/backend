import type { NextFunction, Request, Response } from "express";
import { auth } from "../config/firebase.js";
import { Forbidden, Unauthorized } from "../utils/errors.js";

// Verifies the Firebase ID token from `Authorization: Bearer <token>` and
// populates req.userId / req.role (coach comes from the custom claim).
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header) return next(Unauthorized("Missing Authorization header."));

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next(Unauthorized("Malformed Authorization header."));

  auth
    .verifyIdToken(token)
    .then((decoded) => {
      req.userId = decoded.uid;
      req.role = decoded.role === "coach" ? "coach" : "client";
      next();
    })
    .catch(() => next(Unauthorized("Invalid or expired session.")));
}

// Guard for coach-only routes. Must run after authMiddleware.
export function requireCoach(req: Request, _res: Response, next: NextFunction): void {
  if (req.role !== "coach") return next(Forbidden("Coaches only."));
  next();
}
