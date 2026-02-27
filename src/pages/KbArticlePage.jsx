import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getKbArticle } from "../api/kb.api";
import { useAuth } from "../auth/AuthContext";

import "../styles/pages/kb-article.css";

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

export default function KbArticlePage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const isStaff = user?.role === "AGENT" || user?.role === "ADMIN";

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setError("");
        setLoading(true);

        const a = await getKbArticle(slug, { signal: controller.signal });
        setArticle(a);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setError(err?.response?.data?.message || "Error loading article");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <div className="page kbArticlePage">
        <div className="container kbArticle__layout">
          <div className="kbArticle__topbar">
            <Link className="btn btn--ghost" to="/kb">
              ← Back
            </Link>
          </div>

          <div className="kbArticle__skeletonTop" />
          <div className="kbArticle__skeletonBody" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="page kbArticlePage">
        <div className="container kbArticle__layout">
          <div className="kbArticle__topbar">
            <Link className="btn btn--ghost" to="/kb">
              ← Back
            </Link>
          </div>

          <div className="alert alert--danger">
            <b>Oops.</b> {error || "Article not found"}
          </div>
        </div>
      </div>
    );
  }

  const categoryName = article?.categoryId?.name || "—";

  return (
    <div className="page kbArticlePage">
      <div className="container kbArticle__layout">
        {/* Topbar */}
        <div className="kbArticle__topbar">
          <Link className="btn btn--ghost" to="/kb">
            ← Back
          </Link>

          <div className="kbArticle__topbarRight">
            {article?.categoryId?.name ? (
              <span className="badge">{categoryName}</span>
            ) : null}

            {isStaff ? (
              <span className={`badge ${statusToBadge(article?.status)}`}>
                {article?.status || "—"}
              </span>
            ) : null}

            {isStaff && article?._id ? (
              <Link
                className="btn btn--primary kbArticle__editBtn"
                to={`/kb/${article._id}/edit`}
              >
                <img src="/edit.png" alt="" className="btn__icon" />
                Edit
              </Link>
            ) : null}
          </div>
        </div>

        {/* Article */}
        <article className="kbArticle__card">
          <header className="kbArticle__header">
            <h1 className="kbArticle__title">{article.title}</h1>
          </header>

          <section className="kbArticle__content" aria-label="Article content">
            <div className="kbArticle__text">{article.content}</div>
          </section>
        </article>
      </div>
    </div>
  );
}
