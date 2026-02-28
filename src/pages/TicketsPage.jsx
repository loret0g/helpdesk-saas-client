import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listTickets } from "../api/tickets.api";
import { useAuth } from "../auth/AuthContext";

import "../styles/pages/tickets.css";

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

function statusToClass(status) {
  switch (status) {
    case "OPEN":
      return "badge--status-open";
    case "IN_PROGRESS":
      return "badge--status-progress";
    case "WAITING_ON_CUSTOMER":
      return "badge--status-waiting";
    case "RESOLVED":
      return "badge--status-resolved";
    case "CLOSED":
      return "badge--status-closed";
    default:
      return "badge--muted";
  }
}

function priorityToClass(priority) {
  switch (priority) {
    case "LOW":
      return "badge--priority-low";
    case "NORMAL":
      return "badge--priority-normal";
    case "HIGH":
      return "badge--priority-high";
    case "URGENT":
      return "badge--priority-urgent";
    default:
      return "badge--muted";
  }
}

export default function TicketsPage() {
  const { user } = useAuth();
  const isCustomer = user?.role === "CUSTOMER";
  const isStaff = user?.role === "AGENT" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Toolbar UI state
  const [q, setQ] = useState("");
  const [assigned, setAssigned] = useState("all"); // all | unassigned | me
  const [status, setStatus] = useState(isStaff ? "ALL_EXCEPT_CLOSED" : "ALL");
  const [priority, setPriority] = useState("ALL");

  // Construye params para backend (evita mandar "ruido")
  const params = useMemo(() => {
    const p = {};

    // Búsqueda
    if (q && q.trim()) p.q = q.trim();

    // Assigned (solo staff; y para ADMIN no tiene sentido "me")
    if (isStaff) {
      if (assigned === "unassigned") p.assigned = "unassigned";
      else if (assigned === "me" && !isAdmin) p.assigned = "me";
      // si es "all", no enviamos nada
    }

    // Status
    if (status && status !== "ALL") p.status = status;

    // Priority
    if (priority && priority !== "ALL") p.priority = priority;

    return p;
  }, [q, assigned, status, priority, isStaff, isAdmin]);

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    // Debounce para q (queda más pro)
    const t = setTimeout(async () => {
      try {
        setError("");
        setLoading(true);

        const data = await listTickets(params, { signal: controller.signal });
        if (!alive) return;

        setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!alive) return;
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setError(err?.response?.data?.message || "Error loading tickets");
      } finally {
        if (alive) setLoading(false);
      }
    }, 300);

    return () => {
      alive = false;
      clearTimeout(t);
      controller.abort();
    };
  }, [params]);

  function resetFilters() {
    setQ("");
    setAssigned("all");
    setStatus(isStaff ? "ALL_EXCEPT_CLOSED" : "ALL");
    setPriority("ALL");
  }

  return (
    <div className="page ticketsPage">
      <div className="container">
        {/* Header */}
        <div className="pageHeader">
          <div>
            <h1 className="pageTitle">Tickets</h1>
          </div>

          {isCustomer && (
            <Link className="btn btn--primary" to="/tickets/new">
              <img src="/add.png" alt="" className="btn__icon" />
              New ticket
            </Link>
          )}
        </div>

        {/* Toolbar */}
        <div className="toolbarShell ticketsToolbar">
          <div className="field">
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by code or subject…"
            />
          </div>

          {isStaff && (
            <div className="field">
              <select
                className="select"
                value={assigned}
                onChange={(e) => setAssigned(e.target.value)}
              >
                <option value="all">All</option>
                <option value="unassigned">Unassigned</option>
                {/* ADMIN no se asigna: no mostramos "Assigned to me" */}
                {!isAdmin && <option value="me">Assigned to me</option>}
              </select>
            </div>
          )}

          <div className="field">
            <select
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {isStaff && (
                <option value="ALL_EXCEPT_CLOSED">Inbox (open)</option>
              )}
              <option value="ALL">All statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WAITING_ON_CUSTOMER">WAITING_ON_CUSTOMER</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="field">
            <select
              className="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="ALL">All priorities</option>
              <option value="LOW">LOW</option>
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          <button
            className="btn btn--ghost ticketsToolbar__reset"
            onClick={resetFilters}
            type="button"
          >
            Reset
          </button>

          <div className="ticketsToolbar__count toolbarShell__count">
            Results: <b>{tickets.length}</b>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="ticketsList">
            <div className="ticketRow skeletonRow" />
            <div className="ticketRow skeletonRow" />
            <div className="ticketRow skeletonRow" />
          </div>
        ) : error ? (
          <div className="alert alert--danger">
            <b>Oops.</b> {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty">
            <div className="empty__title">No tickets found</div>
            <div className="empty__text">
              Try changing filters or creating a new ticket.
            </div>
          </div>
        ) : (
          <div className="ticketsList">
            {tickets.map((t) => (
              <Link key={t._id} to={`/tickets/${t._id}`} className="ticketRow">
                <div className="ticketRow__main">
                  <div className="ticketRow__top">
                    <div className="ticketRow__code">{t.code}</div>
                    <div className="ticketRow__subject">{t.subject}</div>
                  </div>

                  <div className="ticketRow__meta">
                    <span className={`badge ${priorityToClass(t.priority)}`}>
                      {t.priority}
                    </span>
                    <span className={`badge ${statusToClass(t.status)}`}>
                      {t.status}
                    </span>

                    <span className="metaDot">•</span>
                    <span className="metaText">
                      Category: {t.categoryId?.name || "—"}
                    </span>

                    {isStaff && (
                      <>
                        <span className="metaDot">•</span>
                        <span className="metaText">
                          Assignee: {t.assigneeId?.name || "Unassigned"}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="ticketRow__right">
                  <div className="ticketRow__time">
                    {formatDateTime(t.lastMessageAt)}
                  </div>
                  <div className="ticketRow__cta">
                    View <span aria-hidden>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
