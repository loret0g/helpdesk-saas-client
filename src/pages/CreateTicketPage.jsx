import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createTicket } from "../api/tickets.api";
import { listCategories } from "../api/categories.api";

import "../styles/pages/create-ticket.css";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isCustomer = user?.role === "CUSTOMER";

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [priority, setPriority] = useState("NORMAL");

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const disableSubmit = useMemo(() => {
    return (
      loading ||
      catLoading ||
      categories.length === 0 ||
      !subject.trim() ||
      !description.trim() ||
      !categorySlug.trim()
    );
  }, [
    loading,
    catLoading,
    categories.length,
    subject,
    description,
    categorySlug,
  ]);

  useEffect(() => {
    if (!isCustomer) return;

    let alive = true;

    async function loadCategories() {
      try {
        setError("");
        setCatLoading(true);

        const data = await listCategories();

        if (!alive) return;

        const items = Array.isArray(data) ? data : data?.categories || [];
        setCategories(items);

        if (!categorySlug && items.length > 0) {
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
  }, [isCustomer]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const nextSubject = subject.trim();
    const nextDescription = description.trim();
    const nextCategorySlug = categorySlug.trim();

    if (!nextSubject || !nextDescription || !nextCategorySlug) {
      setError("Please fill Subject, Description and Category.");
      return;
    }

    if (nextDescription.length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      const ticket = await createTicket({
        subject: nextSubject,
        description: nextDescription,
        categorySlug: nextCategorySlug,
        priority,
      });

      navigate(`/tickets/${ticket._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Error creating ticket");
    } finally {
      setLoading(false);
    }
  }

  if (!isCustomer) {
    return (
      <div className="page createTicketPage">
        <div className="container">
          <div className="createTicket__topbar">
            <Link className="btn btn--ghost" to="/tickets">
              ← Back
            </Link>
          </div>

          <div className="alert alert--danger" role="alert">
            <b>Access denied.</b> Only CUSTOMER users can create tickets in this
            MVP.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page createTicketPage">
      <div className="container createTicket__layout">
        <div className="createTicket__topbar">
          <Link className="btn btn--ghost" to="/tickets">
            ← Back
          </Link>

          <div className="createTicket__topbarRight">
            <span className="badge badge--muted">Customer</span>
          </div>
        </div>

        <div className="createTicket__header">
          <div>
            <h1 className="createTicket__title">New ticket</h1>
            <p className="createTicket__subtitle">
              Describe the issue clearly and we’ll get back to you.
            </p>
          </div>
        </div>

        <form
          className="card card--pad createTicket__form"
          onSubmit={handleSubmit}
        >
          <div className="createTicket__grid">
            <div className="field createTicket__subjectField">
              <label className="field__label" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. I can’t log in"
                disabled={loading}
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="category">
                Category
              </label>

              {catLoading ? (
                <div className="createTicket__hint">Loading categories…</div>
              ) : categories.length === 0 ? (
                <div className="createTicket__hint createTicket__hint--danger">
                  No categories found. Run the seed or create categories in the
                  DB.
                </div>
              ) : (
                <select
                  id="category"
                  className="select"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  disabled={loading}
                  required
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
              <label className="field__label" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                className="select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
              >
                <option value="LOW">LOW</option>
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="textarea createTicket__textarea"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened? What did you expect? Steps to reproduce…"
              disabled={loading}
              required
            />
          </div>

          {error ? (
            <div
              className="alert alert--danger createTicket__error"
              role="alert"
              aria-live="polite"
            >
              <b>Oops.</b> {error}
            </div>
          ) : null}

          <div className="createTicket__actions">
            <button
              className="btn btn--primary"
              type="submit"
              disabled={disableSubmit}
            >
              {loading ? "Creating…" : "Create ticket"}
            </button>

            <div className="createTicket__actionsHint">
              Tip: include the exact error message if you have one.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
