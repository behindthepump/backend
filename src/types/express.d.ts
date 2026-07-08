import "express";

export interface SendSuccessProps {
  data?: unknown;
  message?: string;
  statusCode?: number;
  meta?: Record<string, unknown>;
}

export interface SendErrorProps {
  message: string;
  statusCode?: number;
  detail?: unknown;
}

declare global {
  namespace Express {
    interface Request {
      // Populated by authMiddleware after verifying the Firebase ID token.
      userId: string;
      role: "coach" | "client";
    }
    interface Response {
      sendSuccess: (props: SendSuccessProps) => void;
      sendError: (props: SendErrorProps) => void;
    }
  }
}
