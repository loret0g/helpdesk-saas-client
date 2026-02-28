import http from "./http";

// GET - /api/tickets/:id/messages
export async function listMessages(ticketId, options = {}) {
  const res = await http.get(`/api/tickets/${ticketId}/messages`, {
    signal: options.signal,
  });
  return res.data; // { messages: [...] } o [...]
}

// POST - /api/tickets/:id/messages
export async function createMessage(ticketId, body, options = {}) {
  const res = await http.post(`/api/tickets/${ticketId}/messages`, body, {
    signal: options.signal,
  });
  return res.data; // { message: ... , ticket: ... } o ...
}