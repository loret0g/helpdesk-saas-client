import http from "./http";

// GET - /api/categories
export async function listCategories(options = {}) {
  const res = await http.get("/api/categories", {
    signal: options.signal,
  });
  return res.data; // { categories: [...] } o [...]
}