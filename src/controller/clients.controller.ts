import { asyncHandler } from "../middleware/async-handler.js";
import { ClientService } from "../service/client.service.js";

// Pull only the allowed profile fields off the body so a caller can't set
// role / status by injecting them.
function readProfileFields(body: Record<string, unknown> = {}) {
  return {
    name: String(body.name ?? "").trim(),
    age: Number(body.age),
    gender: String(body.gender ?? ""),
    height: Number(body.height),
    starting_weight: Number(body.starting_weight),
    target_weight: Number(body.target_weight),
    bmr: Number(body.bmr)
  };
}

export class ClientsController {
  constructor(private clients: ClientService) {}

  list = asyncHandler(async (req, res) => {
    const data = await this.clients.listPage({
      search: req.query.search,
      cursor: req.query.cursor,
      limit: req.query.limit
    });
    res.sendSuccess({ data });
  });

  listRequests = asyncHandler(async (_req, res) => {
    const data = await this.clients.listRequests();
    res.sendSuccess({ data });
  });

  getData = asyncHandler(async (req, res) => {
    const data = await this.clients.getClientData(req.params.uid!);
    res.sendSuccess({ data });
  });

  approve = asyncHandler(async (req, res) => {
    const data = await this.clients.approve(req.params.uid!, (req.body ?? {}) as Record<string, unknown>);
    res.sendSuccess({ data, message: "Client approved." });
  });

  decline = asyncHandler(async (req, res) => {
    await this.clients.decline(req.params.uid!);
    res.sendSuccess({ message: "Request declined." });
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
