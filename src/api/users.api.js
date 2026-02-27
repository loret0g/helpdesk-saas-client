import http from "./http";

// GET /api/users/agents
export async function listAgents() {
  const res = await http.get("/api/users/agents");
  return res.data; // { agents: [...] }
}