import http from "./http";

// GET /api/tickets
export async function listTickets() {
  const res = await http.get("/api/tickets");
  return res.data; // array de tickets
}

// GET /api/tickets/:id
export async function getTicket(id) {
  const res = await http.get(`/api/tickets/${id}`);
  return res.data; // ticket
}

// POST /api/tickets
export async function createTicket(payload) {
  const res = await http.post("/api/tickets", payload);
  return res.data; // ticket
}

// PATCH /api/tickets/:id/assign
export async function assignTicket(id) {
  const res = await http.patch(`/api/tickets/${id}/assign`);
  return res.data; // ticket
}

// PATCH /api/tickets/:id/status
export async function updateTicketStatus(id, status) {
  const res = await http.patch(`/api/tickets/${id}/status`, { status });
  return res.data; // ticket
}

// PATCH /api/tickets/:id/assignee
export async function setTicketAssignee(id, assigneeId) {
  const res = await http.patch(`/api/tickets/${id}/assignee`, { assigneeId });
  return res.data; // ticket
}