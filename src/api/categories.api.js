import http from "./http";

// GET - /api/categories
export async function listCategories() {
  const res = await http.get("/api/categories");
  return res.data;
}