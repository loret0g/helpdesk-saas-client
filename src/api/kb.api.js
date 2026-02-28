import http from "./http";

// GET /api/kb?status=&categorySlug=&q=
export async function listKbArticles(params = {}, options = {}) {
  const res = await http.get("/api/kb", {
    params,
    signal: options.signal,
  });
  return res.data;
}

// GET /api/kb/id/:id
export async function getKbArticleById(id, options = {}) {
  const res = await http.get(`/api/kb/id/${id}`, {
    signal: options.signal,
  });
  return res.data;
}

// GET /api/kb/:slug
export async function getKbArticle(slug, options = {}) {
  const res = await http.get(`/api/kb/${slug}`, {
    signal: options.signal,
  });
  return res.data;
}

// POST /api/kb
export async function createKbArticle(payload) {
  const res = await http.post("/api/kb", payload);
  return res.data;
}

// PATCH /api/kb/:id
export async function updateKbArticle(id, payload) {
  const res = await http.patch(`/api/kb/${id}`, payload);
  return res.data;
}

// DELETE /api/kb/:id
export async function archiveKbArticle(id) {
  const res = await http.delete(`/api/kb/${id}`);
  return res.data;
}