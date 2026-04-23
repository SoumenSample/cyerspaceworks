"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";

export const dynamic = "force-dynamic";

const priorityStyles = {
  high: { label: "HIGH", tone: "border-red-400/40 bg-red-400/10 text-red-200" },
  medium: { label: "MEDIUM", tone: "border-amber-400/40 bg-amber-400/10 text-amber-200" },
  low: { label: "LOW", tone: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" },
};

const statusStyles = {
  open: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
  "in-progress": "border-amber-400/30 bg-amber-400/10 text-amber-100",
  closed: "border-zinc-400/30 bg-zinc-400/10 text-zinc-100",
};

const roleNotes = {
  admin: "Monitor the queue, assign work, and close tickets when the issue is resolved.",
  employee: "Take ownership of open requests, update progress, and collaborate with clients.",
  client: "Create support requests and follow updates on your own tickets.",
};

function formatUser(user) {
  if (!user) return "Unassigned";
  return user.name || user.email || "Unknown user";
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeTicket(ticket) {
  return {
    ...ticket,
    _id: ticket._id?.toString?.() ?? ticket._id,
    createdBy: ticket.createdBy || null,
    assignedTo: ticket.assignedTo || null,
  };
}

export default function TicketsPage() {
  const [session, setSession] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const socketRef = useRef(null);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
  });

  const [replyForm, setReplyForm] = useState({
    message: "",
    file: null,
  });

  const [ticketForm, setTicketForm] = useState({
    status: "",
    priority: "",
    assignedTo: "",
  });

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket._id === selectedId) || null,
    [tickets, selectedId]
  );

  useEffect(() => {
    loadEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      setTicketForm({
        status: selectedTicket.status || "open",
        priority: selectedTicket.priority || "medium",
        assignedTo: selectedTicket.assignedTo?._id || "",
      });
    }
  }, [selectedTicket]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    const socket = io();
    socketRef.current = socket;

    socket.emit("join", userId);

    socket.on("ticket-updated", (payload) => {
      if (!payload?.ticket) return;

      const incoming = normalizeTicket(payload.ticket);

      setTickets((current) => {
        const exists = current.some((ticket) => ticket._id === incoming._id);

        if (!exists) {
          return [incoming, ...current];
        }

        return current.map((ticket) => (ticket._id === incoming._id ? incoming : ticket));
      });

      setNotice(payload.changeType === "created" ? "New ticket arrived." : "Ticket updated in realtime.");
    });

    socket.on("notification", (payload) => {
      if (payload?.type === "ticket") {
        setNotice(payload.text || "Ticket update");
      }
    });

    return () => {
      socket.off("ticket-updated");
      socket.off("notification");
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [session?.user?.id]);

  async function loadEverything() {
    setLoading(true);
    setError("");

    try {
      const [sessionRes, ticketRes, usersRes] = await Promise.all([
        fetch("/api/auth/session", { cache: "no-store" }),
        fetch("/api/tickets", { cache: "no-store" }),
        fetch("/api/users/list", { credentials: "include", cache: "no-store" }),
      ]);

      const sessionData = await sessionRes.json();
      const ticketData = await ticketRes.json();
      const usersData = await usersRes.json();

      if (!sessionRes.ok) throw new Error(sessionData.error || "Failed to load session");
      if (!ticketRes.ok) throw new Error(ticketData.error || "Failed to load tickets");

      setSession(sessionData);
      setTickets((ticketData.tickets || []).map(normalizeTicket));
      setUsers((usersData.users || []).filter((user) => user.role === "employee" || user.role === "client" || user.role === "admin"));

      if (!selectedId && ticketData.tickets?.length) {
        setSelectedId(normalizeTicket(ticketData.tickets[0])._id);
      }
    } catch (err) {
      setError(err.message || "Failed to load ticket workspace");
    } finally {
      setLoading(false);
    }
  }

  async function createTicket(event) {
    event.preventDefault();
    setActionLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create ticket");
      }

      const nextTicket = normalizeTicket(data.ticket);
      setTickets((current) => [nextTicket, ...current.filter((ticket) => ticket._id !== nextTicket._id)]);
      setSelectedId(nextTicket._id);
      setCreateForm({ title: "", description: "", priority: "medium", assignedTo: "" });
      setShowCreateTicket(false);
      setNotice("Ticket created successfully.");
    } catch (err) {
      setError(err.message || "Failed to create ticket");
    } finally {
      setActionLoading(false);
    }
  }

  async function updateTicket(payload) {
    if (!selectedTicket) return;

    setActionLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/tickets/${selectedTicket._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update ticket");
      }

      const nextTicket = normalizeTicket(data.ticket);
      setTickets((current) => current.map((ticket) => (ticket._id === nextTicket._id ? nextTicket : ticket)));
      setSelectedId(nextTicket._id);
      setNotice("Ticket updated.");
      setReplyForm((current) => ({ ...current, message: "", file: null }));
    } catch (err) {
      setError(err.message || "Failed to update ticket");
    } finally {
      setActionLoading(false);
    }
  }

  async function sendReply(event) {
    event.preventDefault();

    if (!replyForm.message.trim() && !replyForm.file) return;

    setActionLoading(true);
    setError("");
    setNotice("");

    try {
      let fileUrl = "";

      if (replyForm.file) {
        const formData = new FormData();
        formData.append("file", replyForm.file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "Failed to upload file");
        }

        fileUrl = uploadData.url;
      }

      await updateTicket({ message: replyForm.message, file: fileUrl || undefined });
    } finally {
      setActionLoading(false);
    }
  }

  const role = session?.user?.role || "client";
  const isAdmin = role === "admin";
  const isEmployee = role === "employee";
  const isClient = role === "client";
  const canCreate = true;
  const canManageSelected = Boolean(selectedTicket) && (isAdmin || isEmployee);
  const wrapperClassName = isClient
    ? "grid gap-4 xl:grid-cols-[0.3fr_0.7fr]"
    : "grid gap-4 xl:grid-cols-[1.05fr_1.35fr_minmax(20rem,1fr)]";

  return (
    <div className={wrapperClassName}>
      {!isClient && (
      <section className="min-w-0 rounded-xl border border-cyan-500/20 bg-black/40 p-5 shadow-[0_0_50px_rgba(6,182,212,0.08)] backdrop-blur-xl">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Ticket system</p>
          <h2 className="mt-1 text-2xl font-bold text-cyan-50">Support workspace</h2>
          <p className="mt-2 text-sm text-cyan-100/70">{roleNotes[role]}</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-3">
            <div className="text-xs uppercase tracking-[0.18em] text-cyan-200/60">Open</div>
            <div className="mt-1 text-lg font-semibold text-cyan-50">{tickets.filter((ticket) => ticket.status === "open").length}</div>
          </div>
          <div className="rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-3">
            <div className="text-xs uppercase tracking-[0.18em] text-cyan-200/60">In progress</div>
            <div className="mt-1 text-lg font-semibold text-cyan-50">{tickets.filter((ticket) => ticket.status === "in-progress").length}</div>
          </div>
          <div className="rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-3">
            <div className="text-xs uppercase tracking-[0.18em] text-cyan-200/60">Closed</div>
            <div className="mt-1 text-lg font-semibold text-cyan-50">{tickets.filter((ticket) => ticket.status === "closed").length}</div>
          </div>
          <div className="rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-3">
            <div className="text-xs uppercase tracking-[0.18em] text-cyan-200/60">High priority</div>
            <div className="mt-1 text-lg font-semibold text-cyan-50">{tickets.filter((ticket) => ticket.priority === "high").length}</div>
          </div>
        </div>

        {/* {isAdmin && (
          <div className="mb-4 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-100/90">
            Admin can assign, reassign, and close any ticket. Use this view to balance the queue.
          </div>
        )} */}

        {canCreate && (
          <form onSubmit={createTicket} className="space-y-3 rounded-lg border border-cyan-500/15 bg-black/30 p-4">
            <div>
              <label className="mb-1 block text-sm text-cyan-100/80">Create ticket</label>
              <input
                className="h-10 w-full rounded-md border border-cyan-500/20 bg-black/60 px-3 text-sm text-cyan-50 outline-none placeholder:text-cyan-100/30"
                placeholder="Short title"
                value={createForm.title}
                onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </div>

            <div>
              <textarea
                className="min-h-28 w-full rounded-md border border-cyan-500/20 bg-black/60 px-3 py-2 text-sm text-cyan-50 outline-none placeholder:text-cyan-100/30"
                placeholder="Describe the issue, request, or blocker's context."
                value={createForm.description}
                onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                className="h-10 rounded-md border border-cyan-500/20 bg-black/60 px-3 text-sm text-cyan-50 outline-none"
                value={createForm.priority}
                onChange={(event) => setCreateForm((current) => ({ ...current, priority: event.target.value }))}
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>

              {isAdmin ? (
                <select
                  className="h-10 rounded-md border border-cyan-500/20 bg-black/60 px-3 text-sm text-cyan-50 outline-none"
                  value={createForm.assignedTo}
                  onChange={(event) => setCreateForm((current) => ({ ...current, assignedTo: event.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {users.filter((user) => user.role === "employee").map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex min-h-10 items-center rounded-md border border-cyan-500/20 bg-black/40 px-3 py-2 text-xs leading-tight text-cyan-100/60 wrap-break-word">
                  {isEmployee ? "Created by employee, auto-owned by you" : "Client-created tickets start in the open queue"}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-cyan-400 px-4 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading ? "Working..." : "Create ticket"}
            </button>
          </form>
        )}
      </section>
      )}

      <section className="min-w-0 rounded-xl border border-cyan-500/20 bg-black/40 p-5 shadow-[0_0_50px_rgba(6,182,212,0.08)] backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Queue</p>
            <h3 className="text-xl font-semibold text-cyan-50">Tickets</h3>
          </div>
          <div className="flex items-center gap-2">
            {isClient && (
              <button
                type="button"
                onClick={() => setShowCreateTicket((current) => !current)}
                className="rounded-md border border-cyan-400/40 px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100/90 transition hover:bg-cyan-500/10"
              >
                {showCreateTicket ? "Close" : "Create ticket"}
              </button>
            )}
            <button
              type="button"
              onClick={loadEverything}
              className="rounded-md border border-cyan-500/25 px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100/80 transition hover:bg-cyan-500/10"
            >
              Refresh
            </button>
          </div>
        </div>

        {isClient && showCreateTicket && (
          <form onSubmit={createTicket} className="mb-4 space-y-3 rounded-lg border border-cyan-500/15 bg-black/30 p-4">
            <div>
              <label className="mb-1 block text-sm text-cyan-100/80">Create ticket</label>
              <input
                className="h-10 w-full rounded-md border border-cyan-500/20 bg-black/60 px-3 text-sm text-cyan-50 outline-none placeholder:text-cyan-100/30"
                placeholder="Short title"
                value={createForm.title}
                onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </div>

            <div>
              <textarea
                className="min-h-28 w-full rounded-md border border-cyan-500/20 bg-black/60 px-3 py-2 text-sm text-cyan-50 outline-none placeholder:text-cyan-100/30"
                placeholder="Describe the issue, request, or blocker's context."
                value={createForm.description}
                onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                required
              />
            </div>

            <div className="flex h-10 items-center rounded-md border border-cyan-500/20 bg-black/40 px-3 text-sm text-cyan-100/60">
              Priority is set by support after review.
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-cyan-400 px-4 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionLoading ? "Working..." : "Create ticket"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="rounded-lg border border-dashed border-cyan-500/20 p-6 text-sm text-cyan-100/60">Loading ticket data...</div>
        ) : tickets.length === 0 ? (
          <div className="rounded-lg border border-dashed border-cyan-500/20 p-6 text-sm text-cyan-100/60">No tickets match your access level yet.</div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const priority = priorityStyles[ticket.priority] || priorityStyles.medium;
              const selected = ticket._id === selectedId;

              return (
                <button
                  key={ticket._id}
                  type="button"
                  onClick={() => setSelectedId(ticket._id)}
                  className={`w-full min-w-0 rounded-xl border p-4 text-left transition ${selected ? "border-cyan-300/60 bg-cyan-500/10" : "border-cyan-500/15 bg-black/30 hover:border-cyan-400/30 hover:bg-cyan-500/5"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="wrap-break-word text-sm font-semibold text-cyan-50">{ticket.title}</div>
                      <div className="mt-1 wrap-break-word text-xs text-cyan-100/60">{ticket.description}</div>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${priority.tone}`}>
                      {priority.label}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-cyan-100/65">
                    <span className={`rounded-full border px-2 py-1 uppercase tracking-[0.16em] ${statusStyles[ticket.status] || statusStyles.open}`}>
                      {ticket.status}
                    </span>
                    <span className="wrap-break-word">Created by {formatUser(ticket.createdBy)}</span>
                    <span className="wrap-break-word">Assigned to {formatUser(ticket.assignedTo)}</span>
                    <span>{ticket.messages?.length || 0} messages</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="min-w-0 rounded-xl border border-cyan-500/20 bg-black/40 p-5 shadow-[0_0_50px_rgba(6,182,212,0.08)] backdrop-blur-xl">
        {selectedTicket ? (
          <div className="flex h-full flex-col">
            <div className="border-b border-cyan-500/15 pb-4">
              <div className="grid items-start gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">Selected ticket</p>
                  <h3 className="mt-1 wrap-break-word text-2xl font-bold text-cyan-50">{selectedTicket.title}</h3>
                  <p className="mt-2 wrap-break-word text-sm text-cyan-100/70">{selectedTicket.description}</p>
                </div>
                <div className="shrink-0 space-y-2 text-left text-xs text-cyan-100/70 md:text-right">
                  <div className={`inline-flex rounded-full border px-2 py-1 uppercase tracking-[0.18em] ${statusStyles[selectedTicket.status] || statusStyles.open}`}>{selectedTicket.status}</div>
                  <div className={`inline-flex rounded-full border px-2 py-1 uppercase tracking-[0.18em] ${(priorityStyles[selectedTicket.priority] || priorityStyles.medium).tone}`}>
                    {(priorityStyles[selectedTicket.priority] || priorityStyles.medium).label}
                  </div>
                  <div>Created {formatDate(selectedTicket.createdAt)}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-cyan-100/70 lg:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-lg border border-cyan-500/15 bg-black/30 p-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-cyan-300/60">Created by</div>
                  <div className="mt-1 wrap-break-word font-medium text-cyan-50">{formatUser(selectedTicket.createdBy)}</div>
                </div>
                <div className="rounded-lg border border-cyan-500/15 bg-black/30 p-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-cyan-300/60">Assigned to</div>
                  <div className="mt-1 wrap-break-word font-medium text-cyan-50">{formatUser(selectedTicket.assignedTo)}</div>
                </div>
                <div className="rounded-lg border border-cyan-500/15 bg-black/30 p-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-cyan-300/60">Updated</div>
                  <div className="mt-1 wrap-break-word font-medium text-cyan-50">{formatDate(selectedTicket.updatedAt)}</div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {(selectedTicket.messages || []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-cyan-500/20 p-6 text-sm text-cyan-100/60">No messages yet. Add the first update or assignment note.</div>
              ) : (
                selectedTicket.messages.map((message, index) => {
                  const isOwn = message.sender?._id === session?.user?.id;

                  return (
                    <div
                      key={`${message._id || index}`}
                      className={`max-w-[86%] min-w-0 rounded-xl border p-4 ${isOwn ? "ml-auto border-cyan-400/30 bg-cyan-500/10" : "border-cyan-500/15 bg-black/30"}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-cyan-100/60">
                        <span className="wrap-break-word">{formatUser(message.sender)}</span>
                        <span className="wrap-break-word">{formatDate(message.createdAt)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm text-cyan-50">{message.text || "File attachment only"}</p>
                      {message.file && (
                        <a className="mt-3 inline-flex rounded-md border border-cyan-400/20 px-2 py-1 text-xs text-cyan-200 transition hover:bg-cyan-500/10" href={message.file} target="_blank" rel="noreferrer">
                          View attachment
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-cyan-500/15 pt-4">
              {canManageSelected && (
                <div className="mb-4 grid gap-3 md:grid-cols-3">
                  <select
                    className="h-10 rounded-md border border-cyan-500/20 bg-black/60 px-3 text-sm text-cyan-50 outline-none"
                    value={ticketForm.status}
                    onChange={(event) => setTicketForm((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In progress</option>
                    <option value="closed">Closed</option>
                  </select>

                  <select
                    className="h-10 rounded-md border border-cyan-500/20 bg-black/60 px-3 text-sm text-cyan-50 outline-none"
                    value={ticketForm.priority}
                    onChange={(event) => setTicketForm((current) => ({ ...current, priority: event.target.value }))}
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                  </select>

                  <select
                    className="h-10 rounded-md border border-cyan-500/20 bg-black/60 px-3 text-sm text-cyan-50 outline-none"
                    value={ticketForm.assignedTo}
                    onChange={(event) => setTicketForm((current) => ({ ...current, assignedTo: event.target.value }))}
                  >
                    <option value="">Unassigned</option>
                    {users.filter((user) => user.role === "employee").map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <form onSubmit={sendReply} className="space-y-3">
                <textarea
                  className="min-h-24 w-full rounded-md border border-cyan-500/20 bg-black/60 px-3 py-2 text-sm text-cyan-50 outline-none placeholder:text-cyan-100/30"
                  placeholder={isClientOrEmployee(role) ? "Write an update to the ticket..." : "Add an internal note or client reply..."}
                  value={replyForm.message}
                  onChange={(event) => setReplyForm((current) => ({ ...current, message: event.target.value }))}
                />

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex h-10 cursor-pointer items-center rounded-md border border-cyan-500/20 px-3 text-sm text-cyan-100/80 transition hover:bg-cyan-500/10">
                    Attach file
                    <input
                      className="hidden"
                      type="file"
                      onChange={(event) => setReplyForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
                    />
                  </label>

                  {replyForm.file && <span className="text-sm text-cyan-100/60">{replyForm.file.name}</span>}

                  {canManageSelected && (
                    <button
                      type="button"
                      onClick={() => updateTicket(ticketForm)}
                      disabled={actionLoading}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-cyan-400/30 px-4 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save ticket
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={actionLoading || (!replyForm.message.trim() && !replyForm.file)}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-cyan-400 px-4 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading ? "Working..." : "Send message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-cyan-500/20 p-8 text-sm text-cyan-100/60">
            Select a ticket to inspect details, change ownership, and track progress.
          </div>
        )}
      </section>

      {(error || notice) && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-cyan-500/20 bg-black/90 px-4 py-3 text-sm text-cyan-50 shadow-2xl backdrop-blur-xl">
          {error || notice}
        </div>
      )}
    </div>
  );
}

function isClientOrEmployee(role) {
  return role === "client" || role === "employee";
}