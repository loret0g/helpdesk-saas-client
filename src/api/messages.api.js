import http from "./http";

// GET - /api/tickets/:id/messages
export async function listMessages(ticketId) {
  const res = await http.get(`/api/tickets/${ticketId}/messages`);
  return res.data; // { messages: [...] } o [...]
}

// POST - /api/tickets/:id/messages
export async function createMessage(ticketId, body) {
  const res = await http.post(`/api/tickets/${ticketId}/messages`, body);
  return res.data; // { message: ... } o ...
}