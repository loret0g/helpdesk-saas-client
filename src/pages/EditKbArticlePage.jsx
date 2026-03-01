import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { archiveKbArticle, updateKbArticle, getKbArticleById } from "../api/kb.api";
import { listCategories } from "../api/categories.api";

import "../styles/pages/kb-edit.css";

export default function EditKbArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStaff = user?.role === "AGENT" || user?.role === "ADMIN";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [categorySlug, setCategorySlug] = useState("");

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState("");

  const isBusy = useMemo(() => saving || archiving, [saving, archiving]);

  useEffect(() => {
    if (!isStaff) return;

    const controller = new AbortController();
    let alive = true;

    async function load() {
      try {
        setError("");
        setLoading(true);

        const [article, catData] = await Promise.all([
          getKbArticleById(id, { signal: controller.signal }),
          listCategories({ signal: controller.signal }),
        ]);

        if (!alive) return;

        const cats = Array.isArray(catData) ? catData : catData?.categories || [];

        setTitle(article?.title || "");
        setSlug(article?.slug || "");
        setContent(article?.content || "");
        setStatus(article?.status || "DRAFT");
        setCategorySlug(article?.categoryId?.slug || "");
        setCategories(cats);

        if (!article?.categoryId?.slug && cats.length > 0) {
          setCategorySlug(cats[0].slug);
        }
      } catch (err) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        if (!alive) return;
        setError(err?.response?.data?.message || "Error loading article");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [id, isStaff]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    const nextTitle = title.trim();
    const nextContent = content.trim();
    const nextCategorySlug = categorySlug?.trim();

    if (!nextTitle || !nextContent || !nextCategorySlug) {
      setError("Please complete title, category and content.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateKbArticle(id, {
        title: nextTitle,
        content: nextContent,
        status,
        categorySlug: nextCategorySlug,
      });

      navigate(`/kb/${updated.slug}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Error saving article");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    const ok = window.confirm("Archive this article?");
    if (!ok) return;

    setError("");
    setArchiving(true);
    try {
      await archiveKbArticle(id);
      navigate("/kb");
    } catch (err) {
      setError(err?.response?.data?.message || "Error archiving article");
    } finally {
      setArchiving(false);
    }
  }

  if (!isStaff) {
    return (
      <div className="page kbEditPage">
        <div className="container">
          <div className="kbEdit__topbar">
            <Link className="btn btn--ghost" to="/kb">
              ← Back
            </Link>
          </div>

          <div className="alert alert--danger" role="alert">
            <b>Access denied.</b> Only AGENT/ADMIN can edit KB articles.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page kbEditPage">
        <div className="container">
          <div className="kbEdit__topbar">
            <Link className="btn btn--ghost" to="/kb">
              ← Back
            </Link>
          </div>

          <div className="card card--pad kbEdit__skeleton" />
          <div className="card card--pad kbEdit__skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="page kbEditPage">
      <div className="container kbEdit__layout">
        <div className="kbEdit__topbar">
          <Link className="btn btn--ghost" to="/kb">
            ← Back
          </Link>

          <div className="kbEdit__topbarRight">
            <button
              className="btn btn--danger"
              type="button"
              onClick={handleArchive}
              disabled={isBusy}
              title="Archive article"
            >
              {archiving ? "Archiving…" : "Archive"}
            </button>

            <button
              className="btn btn--primary"
              type="submit"
              form="kbEditForm"
              disabled={isBusy}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        <div className="card card--pad kbEdit__header">
          <div className="kbEdit__titleWrap">
            <h1 className="kbEdit__title">Edit article</h1>
            <div className="kbEdit__slug">
              URL slug (stable): <code>{slug || "—"}</code>
            </div>
          </div>

          {error ? (
            <div className="alert alert--danger kbEdit__inlineError" role="alert" aria-live="polite">
              <b>Oops.</b> {error}
            </div>
          ) : null}

          <form id="kbEditForm" className="kbEdit__form" onSubmit={handleSave}>
            <label className="label">
              <span>Title</span>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How to reset password"
                disabled={isBusy}
              />
            </label>

            <div className="kbEdit__row">
              <label className="label">
                <span>Category</span>
                <select
                  className="select"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  disabled={isBusy}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="label">
                <span>Status</span>
                <select
                  className="select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isBusy}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </label>
            </div>

            <label className="label">
              <span>Content</span>
              <textarea
                className="textarea kbEdit__textarea"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the article content…"
                disabled={isBusy}
              />
            </label>

            <div className="kbEdit__mobileActions">
              <button className="btn btn--primary" type="submit" disabled={isBusy}>
                {saving ? "Saving…" : "Save"}
              </button>

              <button className="btn btn--danger" type="button" onClick={handleArchive} disabled={isBusy}>
                {archiving ? "Archiving…" : "Archive"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}