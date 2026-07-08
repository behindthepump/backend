import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/logger.js";
import { responseFormatter } from "./middleware/response-formatter.js";
import v1Router from "./routes/index.js";

const app = express();

// In production set CORS_ORIGIN to the frontend URL(s), comma-separated
// (e.g. "https://app.behindthepump.com"). Unset -> reflect the request origin
// (fine for local dev).
const corsOrigins = process.env.CORS_ORIGIN?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins && corsOrigins.length ? corsOrigins : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
// Before express.json so res.sendError exists even if body parsing fails.
app.use(responseFormatter);
app.use(requestLogger);
app.use(express.json());

app.get("/health", (_req, res) => res.sendSuccess({ message: "ok" }));
app.use("/v1", v1Router);

// Must be last.
app.use(errorHandler);

export default app;
