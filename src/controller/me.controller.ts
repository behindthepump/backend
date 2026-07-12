import { asyncHandler } from "../middleware/async-handler.js";
import { ClientService, OnboardingFields } from "../service/client.service.js";
import { SessionService } from "../service/session.service.js";

// Pull only the allowed onboarding fields off the body; email comes from the
// verified token, everything else (role, status, bmr) is server-derived.
function readOnboardingFields(body: Record<string, unknown> = {}): OnboardingFields {
  return {
    name: String(body.name ?? "").trim(),
    age: Number(body.age),
    gender: String(body.gender ?? ""),
    height: Number(body.height),
    starting_weight: Number(body.starting_weight),
    target_weight: Number(body.target_weight)
  };
}

export class MeController {
  constructor(
    private sessions: SessionService,
    private clients: ClientService
  ) {}

  getSession = asyncHandler(async (req, res) => {
    const data = await this.sessions.buildSession(req.userId, req.role);
    res.sendSuccess({ data });
  });

  onboard = asyncHandler(async (req, res) => {
    await this.clients.onboard(
      req.userId,
      req.email,
      readOnboardingFields(req.body as Record<string, unknown>)
    );
    res.sendSuccess({ message: "Request submitted.", statusCode: 201 });
  });
}
