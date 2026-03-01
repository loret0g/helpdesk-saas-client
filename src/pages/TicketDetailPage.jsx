import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  assignTicket,
  getTicket,
  setTicketAssignee,
  updateTicketStatus,
} from "../api/tickets.api";
import { createMessage, listMessages } from "../api/messages.api";
import { listAgents } from "../api/users.api";
import { useAuth } from "../auth/AuthContext";

import "../styles/pages/ticket-detail.css";

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
}

function statusToBadge(status) {
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

function priorityToBadge(priority) {
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

/**
 * Extrae el id independientemente de si viene como string
 * o como documento populado desde el backend.
 */
function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const isAgent = user?.role === "AGENT";
  const isAdmin = user?.role === "ADMIN";
  const isStaff = isAgent || isAdmin;

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);

  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [assigneePick, setAssigneePick] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");

  const canReply = useMemo(() => !!user, [user]);
  const myId = getId(user);

  /**
   * Carga ticket + mensajes de forma sincronizada.
   * Usa AbortController para evitar estados inconsistentes
   * si el usuario cambia rápidamente de ticket.
   */
  async function loadAll(signal) {
    setError("");
    setLoading(true);

    try {
      const t = await getTicket(id, { signal });
      setTicket(t);

      const m = await listMessages(id, { signal });
      setMessages(Array.isArray(m) ? m : m?.messages || []);

      const currentAssigneeId = getId(t?.assigneeId);
      setAssigneePick(currentAssigneeId || "");
    } catch (err) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") return;
      setError(err?.response?.data?.message || "Error loading ticket");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadAll(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Solo ADMIN necesita la lista completa de agentes.
   */
  useEffect(() => {
    if (!isAdmin) return;

    const controller = new AbortController();
    let alive = true;

    async function loadAgents() {
      setAgentsLoading(true);
      try {
        const data = await listAgents({ signal: controller.signal });
        const list = Array.isArray(data) ? data : data?.agents || [];
        if (!alive) return;
        setAgents(list);
      } catch (err) {
        if (!alive) return;
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        console.error(err);
      } finally {
        if (alive) setAgentsLoading(false);
      }
    }

    loadAgents();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [isAdmin]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    setError("");

    try {
      await createMessage(id, { body: text.trim() });
      setText("");
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Error sending message");
    } finally {
      setSending(false);
    }
  }

  async function handleAssignToMe() {
    setBusy(true);
    setError("");

    try {
      await assignTicket(id);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Error assigning ticket");
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusChange(e) {
    const nextStatus = e.target.value;

    setBusy(true);
    setError("");

    try {
      await updateTicketStatus(id, nextStatus);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Error updating status");
    } finally {
      setBusy(false);
    }
  }

  async function handleSetAssignee(e) {
    const next = e.target.value;
    setAssigneePick(next);

    setBusy(true);
    setError("");

    try {
      await setTicketAssignee(id, next ? next : null);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Error updating assignee");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="page ticketDetailPage">
        <div className="container">
          <div className="ticketTopbar">
            <Link className="btn btn--ghost" to="/tickets">
              ← Back
            </Link>
          </div>

          <div className="card card--pad ticketSkeleton" />
          <div className="card card--pad ticketSkeleton" />
          <div className="card card--pad ticketSkeleton" />
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="page ticketDetailPage">
        <div className="container">
          <div className="ticketTopbar">
            <Link className="btn btn--ghost" to="/tickets">
              ← Back
            </Link>
          </div>

          <div className="alert alert--danger">
            <b>Oops.</b> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page ticketDetailPage">
      <div className="container ticketLayout">
        <div className="ticketTopbar">
          <Link className="btn btn--ghost" to="/tickets">
            ← Back
          </Link>

          <div className="ticketTopbar__right">
            <span className={`badge ${priorityToBadge(ticket?.priority)}`}>
              {ticket?.priority || "—"}
            </span>
            <span className={`badge ${statusToBadge(ticket?.status)}`}>
              {ticket?.status || "—"}
            </span>
          </div>
        </div>

        <div className="card card--pad ticketHeader">
          <div className="ticketHeader__row">
            <div className="ticketHeader__left">
              <div className="ticketTitleWrap">
                <h1 className="ticketTitle">
                  <span className="ticketCode">{ticket?.code}</span>
                  <span className="ticketDash">—</span>
                  <span className="ticketSubject">{ticket?.subject}</span>
                </h1>

                <div className="ticketMeta">
                  <div className="metaItem">
                    <span className="metaLabel">Category</span>
                    <span className="metaValue">
                      {ticket?.categoryId?.name || "—"}
                    </span>
                  </div>

                  <div className="metaItem">
                    <span className="metaLabel">Requester</span>
                    <span className="metaValue">
                      {ticket?.requesterId?.name || "—"}
                    </span>
                  </div>

                  <div className="metaItem">
                    <span className="metaLabel">Assignee</span>
                    <span className="metaValue">
                      {ticket?.assigneeId?.name || "Unassigned"}
                    </span>
                  </div>

                  <div className="metaItem">
                    <span className="metaLabel">Last message</span>
                    <span className="metaValue">
                      {formatDateTime(ticket?.lastMessageAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isStaff && (
              <div className="ticketHeader__right">
                {isAgent && (
                  <button
                    className="btn btn--primary ticketAssignBtn"
                    onClick={handleAssignToMe}
                    disabled={busy || !!ticket?.assigneeId}
                    type="button"
                  >
                    {ticket?.assigneeId
                      ? "Assigned"
                      : busy
                        ? "Assigning…"
                        : "Assign to me"}
                  </button>
                )}

                {isAdmin && (
                  <div className="ticketAssigneeField">
                    <select
                      className="select"
                      value={assigneePick}
                      onChange={handleSetAssignee}
                      disabled={busy || agentsLoading}
                    >
                      <option value="">
                        {agentsLoading ? "Loading agents…" : "Unassigned"}
                      </option>

                      {agents.map((a) => {
                        const aid = getId(a);
                        const label = a?.name
                          ? `${a.name} (${a.email})`
                          : a?.email || aid;

                        return (
                          <option key={aid} value={aid}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div className="ticketStatusField">
                  <select
                    className="select"
                    value={ticket?.status || "OPEN"}
                    onChange={handleStatusChange}
                    disabled={busy}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="WAITING_ON_CUSTOMER">
                      WAITING_ON_CUSTOMER
                    </option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {ticket?.description && (
            <div className="ticketDescription card card--soft card--pad">
              <div className="sectionTitle">Description</div>
              <div className="ticketText">{ticket.description}</div>
            </div>
          )}

          {error && (
            <div className="alert alert--danger ticketInlineError">
              <b>Oops.</b> {error}
            </div>
          )}
        </div>

        <div className="card card--pad ticketMessages">
          <div className="sectionHeader">
            <h2 className="sectionTitle">Messages</h2>
            <div className="sectionHint">{messages.length} total</div>
          </div>

          {messages.length === 0 ? (
            <div className="empty">
              <div className="empty__title">No messages yet</div>
              <div className="empty__text">Start the conversation below.</div>
            </div>
          ) : (
            <ul className="messageList">
              {messages.map((m) => {
                const authorId = getId(m.authorId) || String(m.authorId || "");
                const isMine =
                  myId && authorId && String(myId) === String(authorId);

                return (
                  <li
                    key={m._id}
                    className={`message ${isMine ? "message--mine" : "message--other"}`}
                  >
                    <div className="message__bubble">
                      <div className="message__header">
                        <div className="message__author">
                          <span className="message__name">
                            {m.authorId?.name ||
                              m.authorId?.email ||
                              "Unknown"}
                          </span>

                          {m.authorId?.role === "ADMIN" && (
                            <span className="roleBadge roleBadge--admin">
                              ADMIN
                            </span>
                          )}

                          {m.authorId?.role === "AGENT" && (
                            <span className="roleBadge roleBadge--agent">
                              AGENT
                            </span>
                          )}
                        </div>

                        <div className="message__time">
                          {formatDateTime(m.createdAt)}
                        </div>
                      </div>

                      <div className="message__body">{m.body}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card card--pad ticketReply">
          <div className="sectionHeader">
            <h2 className="sectionTitle">Reply</h2>
            <div className="sectionHint">
              {canReply ? "Visible to all participants" : "Login required"}
            </div>
          </div>

          {!canReply ? (
            <div className="alert">You can't reply right now.</div>
          ) : (
            <form className="replyForm" onSubmit={handleSend}>
              <textarea
                className="textarea replyForm__textarea"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your message…"
                disabled={sending}
              />

              <div className="replyForm__footer">
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={sending || !text.trim()}
                >
                  {sending ? "Sending…" : "Send message"}
                </button>

                <div className="replyForm__hint">
                  Tip: include steps + expected result.
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}