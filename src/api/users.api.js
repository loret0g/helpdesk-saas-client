import http from "./http";

// GET /api/users/agents
export async function listAgents(options = {}) {
  const res = await http.get("/api/users/agents", {
    signal: options.signal,
  });
  return res.data; // { agents: [...] } o [...]
}