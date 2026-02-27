import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createKbArticle } from "../api/kb.api";
import { listCategories } from "../api/categories.api";

import "../styles/pages/create-kb-article.css";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

export default function CreateKbArticlePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAgent = user?.role === "AGENT" || user?.role === "ADMIN";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [categorySlug, setCategorySlug] = useState("");

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generatedSlug = useMemo(() => slugify(title), [title]);

  useEffect(() => {
    if (!isAgent) return;

    let alive = true;

    async function loadCategories() {
      try {
        setError("");
        setCatLoading(true);

        const data = await listCategories(); // { categories }
        if (!alive) return;

        const items = data.categories || [];
        setCategories(items);

        if (!categorySlug && items.length) {
          setCategorySlug(items[0].slug);
        }
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || "Error loading categories");
      } finally {
        if (alive) setCatLoading(false);
      }
    }

    loadCategories();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAgent]);

  if (!isAgent) {
    return (
      <div className="page createKbPage">
        <div className="container">
          <div className="createKb__topbar">
            <Link className="btn btn--ghost" to="/kb">
              ← Back
            </Link>
          </div>

          <div className="alert alert--danger">
            <b>Access denied.</b> Only AGENT/ADMIN can manage articles.
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim() || !categorySlug) {
      setError("Please fill Title, Content and Category.");
      return;
    }

    setLoading(true);
    try {
      const article = await createKbArticle({
        title: title.trim(),
        slug: generatedSlug,
        content: content.trim(),
        status,
        categorySlug,
      });

      navigate(`/kb/${article.slug}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Error creating article");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page createKbPage">
      <div className="container createKb__layout">
        {/* Topbar */}
        <div className="createKb__topbar">
          <Link className="btn btn--ghost" to="/kb">
            ← Back
          </Link>

          <div className="createKb__topbarRight">
            <span className={`badge ${statusToBadge(status)}`}>{status}</span>

            <button
              className="btn btn--primary"
              type="submit"
              disabled={loading || catLoading}
            >
              {loading ? "Creating…" : "Create article"}
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="createKb__header">
          <div>
            <h1 className="createKb__title">New KB Article</h1>
            <p className="createKb__subtitle">
              Create a knowledge base article for customers and agents.
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="card card--pad createKb__form" onSubmit={handleSubmit}>
          <div className="createKb__grid">
            <div className="field createKb__titleField">
              <label className="field__label">Title</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reset your password"
              />
            </div>

            <div className="field">
              <label className="field__label">Category</label>
              {catLoading ? (
                <div className="createKb__hint">Loading categories…</div>
              ) : (
                <select
                  className="select"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="field">
              <label className="field__label">Status</label>
              <select
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            {/* Slug preview */}
            <div className="createKb__slugCard card card--soft card--pad">
              <div className="createKb__slugLabel">URL slug</div>
              <div className="createKb__slugValue">
                <code>{generatedSlug || "—"}</code>
              </div>
              <div className="createKb__slugHint">
                Auto-generated from the title (stable once created).
              </div>
            </div>
          </div>

          <div className="field">
            <label className="field__label">Content</label>
            <textarea
              className="textarea createKb__textarea"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the solution step-by-step…"
            />
          </div>

          {error ? (
            <div className="alert alert--danger createKb__error">
              <b>Oops.</b> {error}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
