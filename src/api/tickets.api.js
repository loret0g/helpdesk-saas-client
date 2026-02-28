import http from "./http";

// GET /api/tickets (con filtros por querystring)
export async function listTickets(params = {}, options = {}) {
  const res = await http.get("/api/tickets", {
    params,
    signal: options.signal,
  });
  return res.data;
}

// GET /api/tickets/:id
export async function getTicket(id, options = {}) {
  const res = await http.get(`/api/tickets/${id}`, {
    signal: options.signal,
  });
  return res.data;
}

// POST /api/tickets
export async function createTicket(payload) {
  const res = await http.post("/api/tickets", payload);
  return res.data;
}

// PATCH /api/tickets/:id/assign
export async function assignTicket(id) {
  const res = await http.patch(`/api/tickets/${id}/assign`);
  return res.data;
}

// PATCH /api/tickets/:id/status
export async function updateTicketStatus(id, status) {
  const res = await http.patch(`/api/tickets/${id}/status`, { status });
  return res.data;
}

// PATCH /api/tickets/:id/assignee
export async function setTicketAssignee(id, assigneeId) {
  const res = await http.patch(`/api/tickets/${id}/assignee`, { assigneeId });
  return res.data;
}