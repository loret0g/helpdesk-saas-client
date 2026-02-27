import http from "./http";

// GET - /api/kb?status=&categorySlug=&q=
export async function listKbArticles(params = {}) {
  const res = await http.get("/api/kb", { params });
  return res.data; // backend devuelve array de artículos
}

// GET - /api/kb/id/:id
export async function getKbArticleById(id) {
  const res = await http.get(`/api/kb/id/${id}`);
  return res.data;
}

// GET - /api/kb/:slug
export async function getKbArticle(slug) {
  const res = await http.get(`/api/kb/${slug}`);
  return res.data;
}

// POST - /api/kb
export async function createKbArticle(payload) {
  const res = await http.post("/api/kb", payload);
  return res.data;
}

// PATCH - /api/kb/:id
export async function updateKbArticle(id, payload) {
  const res = await http.patch(`/api/kb/${id}`, payload);
  return res.data;
}

// DELETE - /api/kb/:id
export async function archiveKbArticle(id) {
  const res = await http.delete(`/api/kb/${id}`);
  return res.data;
}