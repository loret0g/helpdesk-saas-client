import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listKbArticles } from "../api/kb.api";
import { listCategories } from "../api/categories.api";

import "../styles/pages/kb.css";

function statusToBadge(status) {
  switch (status) {
    case "DRAFT":
      return "badge--warning";
    case "PUBLISHED":
      return "badge--success";
    case "ARCHIVED":
      return "badge--muted";
    default:
      return "badge--muted";
  }
}

export default function KbPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "AGENT" || user?.role === "ADMIN";

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);

  const [q, setQ] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [status, setStatus] = useState(""); // staff

  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState("");

  // params para backend (solo enviamos lo que tenga valor)
  const params = useMemo(() => {
    const p = {};
    if (q.trim()) p.q = q.trim();
    if (categorySlug) p.categorySlug = categorySlug;
    if (isStaff && status) p.status = status;
    return p;
  }, [q, categorySlug, status, isStaff]);

  // Cargar categorías
  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        setCatLoading(true);
        const data = await listCategories({ signal: controller.signal });
        setCategories(data?.categories || []);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        console.error(err);
      } finally {
        setCatLoading(false);
      }
    }

    loadCategories();
    return () => controller.abort();
  }, []);

  // Cargar artículos con filtros
  useEffect(() => {
    const controller = new AbortController();

    async function loadKb() {
      try {
        setError("");
        setLoading(true);

        const data = await listKbArticles(params, {
          signal: controller.signal,
        });
        setArticles(data || []);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setError(err?.response?.data?.message || "Error loading KB");
      } finally {
        setLoading(false);
      }
    }

    loadKb();
    return () => controller.abort();
  }, [params]);

  function clearFilters() {
    setQ("");
    setCategorySlug("");
    setStatus("");
  }

  return (
    <div className="page kbPage">
      <div className="container">
        {/* Header */}
        <div className="pageHeader">
          <div>
            <h1 className="pageTitle">Knowledge Base</h1>
          </div>

          {isStaff && (
            <Link className="btn btn--primary kb__editBtn" to="/kb/new">
              <img src="/add.png" alt="" className="btn__icon" />
              New article
            </Link>
          )}
        </div>

        {/* Toolbar */}
        <div className="toolbarShell kbToolbar">
          <div className="field">
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title…"
            />
          </div>

          <div className="field">
            {catLoading ? (
              <div className="kbToolbar__loading">Loading categories…</div>
            ) : (
              <select
                className="select"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {isStaff && (
            <div className="field">
              <select
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          )}

          <button
            type="button"
            className="btn btn--ghost kbToolbar__clear"
            onClick={clearFilters}
          >
            Reset
          </button>

          <div className="kbToolbar__count toolbarShell__count">
            Results: <b>{loading ? "…" : articles.length}</b>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="kbList">
            <div className="kbRow kbRow--skeleton" />
            <div className="kbRow kbRow--skeleton" />
            <div className="kbRow kbRow--skeleton" />
          </div>
        ) : error ? (
          <div className="alert alert--danger">
            <b>Oops.</b> {error}
          </div>
        ) : articles.length === 0 ? (
          <div className="empty">
            <div className="empty__title">No articles found</div>
            <div className="empty__text">Try adjusting your filters.</div>
          </div>
        ) : (
          <div className="kbList">
            {articles.map((a) => (
              <Link key={a._id} to={`/kb/${a.slug}`} className="kbRow">
                <div className="kbRow__main">
                  <div className="kbRow__title">{a.title}</div>

                  <div className="kbRow__meta">
                    {a.categoryId?.name ? (
                      <span className="badge badge--muted">
                        {a.categoryId.name}
                      </span>
                    ) : (
                      <span className="badge badge--muted">Uncategorized</span>
                    )}

                    {isStaff && a.status ? (
                      <span className={`badge ${statusToBadge(a.status)}`}>
                        {a.status}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="kbRow__cta">
                  Read <span aria-hidden>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
