import { asyncHandler } from "../middleware/async-handler.js";
import { ClientService } from "../service/client.service.js";

// Pull only the allowed profile fields off the body so a caller can't set
// role / must_change_password by injecting them.
function readProfileFields(body: Record<string, unknown> = {}) {
  return {
    name: String(body.name ?? "").trim(),
    age: Number(body.age),
    gender: String(body.gender ?? ""),
    starting_weight: Number(body.starting_weight),
    target_weight: Number(body.target_weight),
    bmr: Number(body.bmr)
  };
}

export class ClientsController {
  constructor(private clients: ClientService) {}

  list = asyncHandler(async (_req, res) => {
    const data = await this.clients.listClients();
    res.sendSuccess({ data });
  });

  create = asyncHandler(async (req, res) => {
    const b = (req.body ?? {}) as Record<string, unknown>;
    const data = await this.clients.createClient({
      ...readProfileFields(b),
      email: String(b.email ?? "").trim().toLowerCase(),
      program_start_date: String(b.program_start_date ?? "")
    });
    res.sendSuccess({ data, message: "Client created.", statusCode: 201 });
  });

  remove = asyncHandler(async (req, res) => {
    await this.clients.deleteClient(req.params.uid!);
    res.sendSuccess({ message: "Client removed." });
  });

  updateProfile = asyncHandler(async (req, res) => {
    await this.clients.updateProfile(
      req.params.uid!,
      readProfileFields(req.body as Record<string, unknown>)
    );
    res.sendSuccess({ message: "Profile updated." });
  });
}
