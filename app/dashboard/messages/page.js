// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useSession } from "next-auth/react";
// import io from "socket.io-client";

// let socket;

// export default function ChatPage() {
//   const { data: session, status } = useSession();

//   const [users, setUsers] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([]);
//   const [online, setOnline] = useState([]);
//   const [toast, setToast] = useState("");

//   const chatEndRef = useRef(null);
//   const selectedRef = useRef(null);

//   useEffect(() => {
//     selectedRef.current = selected;
//   }, [selected]);

//   useEffect(() => {
//     if (status !== "authenticated" || !session?.user?.id) return;

//     socket = io();

//     socket.emit("join", session.user.id);

//     socket.on("receive-message", (data) => {
//       const selectedId = selectedRef.current?._id?.toString();
//       const senderId = data?.sender?.toString?.() || data?.sender?.toString();
//       const receiverId = data?.receiver?.toString?.() || data?.receiver?.toString();
//       const currentUserId = session.user.id?.toString();

//       const belongsToOpenChat =
//         !!selectedId &&
//         ((senderId === selectedId && receiverId === currentUserId) ||
//           (senderId === currentUserId && receiverId === selectedId));

//       if (belongsToOpenChat) {
//         setChat((prev) => [...prev, data]);
//       }

//       setToast("New message");
//       setTimeout(() => setToast(""), 3000);
//       fetchUsers();
//     });

//     socket.on("online-users", setOnline);

//     fetchUsers();

//     return () => {
//       socket.off("receive-message");
//       socket.off("online-users");
//       socket.disconnect();
//     };
//   }, [status, session?.user?.id]);

//   async function fetchUsers() {
//     const res = await fetch("/api/users/list", {
//       credentials: "include",
//     });
//     const data = await res.json();
//     setUsers(data.users || []);
//   }

//   async function loadMessages(userId) {
//     const res = await fetch(`/api/conversations?userId=${userId}`, {
//       credentials: "include",
//     });
//     const data = await res.json();
//     setChat(data.messages || []);
//   }

//   async function send(e) {
//     e.preventDefault();

//     if (!message.trim() || !selected?._id) return;

//     const payload = {
//       receiverId: selected._id,
//       text: message,
//     };

//     const res = await fetch("/api/messages", {
//       method: "POST",
//       credentials: "include",
//       body: JSON.stringify(payload),
//       headers: { "Content-Type": "application/json" },
//     });

//     const data = await res.json();

//     if (!res.ok || !data?.message) {
//       setToast(data?.error || "Unable to send message");
//       setTimeout(() => setToast(""), 3000);
//       return;
//     }

//     socket.emit("send-message", data.message);

//     setChat((prev) => [...prev, data.message]);
//     setMessage("");
//     fetchUsers();
//   }

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chat]);

//   if (status === "loading") return <div>Loading...</div>;

//   return (
//     <div className="flex h-screen bg-black text-white">

//       {toast && (
//         <div className="fixed top-4 right-4 bg-cyan-500 px-4 py-2 rounded">
//           {toast}
//         </div>
//       )}

//       <div className="w-1/4 border-r p-4">
//         {users.map((u) => (
//           <div
//             key={u._id}
//             onClick={() => {
//               setSelected(u);
//               loadMessages(u._id);
//             }}
//             className="p-2 cursor-pointer hover:bg-gray-800 flex justify-between"
//           >
//             <span>
//               {u.name} {online.includes(u._id?.toString()) && "🟢"}
//             </span>

//             {u.unread > 0 && (
//               <span className="bg-red-500 px-2 rounded text-xs">
//                 {u.unread}
//               </span>
//             )}
//           </div>
//         ))}
//       </div>

//       <div className="flex-1 flex flex-col">
//         <div className="flex-1 p-4 overflow-y-auto">
//           {chat.map((m, i) => (
//             <div
//               key={i}
//               className={`mb-2 p-2 rounded max-w-xs ${
//                   (m?.sender?.toString?.() || m?.sender?.toString()) ===
//                   session?.user?.id?.toString()
//                   ? "bg-cyan-500 ml-auto"
//                   : "bg-gray-700"
//               }`}
//             >
//               {m.text}
//             </div>
//           ))}
//           <div ref={chatEndRef} />
//         </div>

//         {selected && (
//           <form onSubmit={send} className="p-4 flex gap-2">
//             <input
//               className="flex-1 p-2 text-black"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//             />
//             <button className="bg-cyan-500 px-4">Send</button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import io from "socket.io-client";

export default function ChatPage() {
  const { data: session, status } = useSession();

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [online, setOnline] = useState([]);
  const [toast, setToast] = useState("");

  const chatEndRef = useRef(null);
  const selectedRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const currentSocket = io();
    socketRef.current = currentSocket;

    currentSocket.emit("join", session.user.id);

    currentSocket.on("receive-message", (data) => {
      const selectedId = selectedRef.current?._id?.toString();
      const senderId = data?.sender?.toString?.() || data?.sender?.toString();
      const receiverId = data?.receiver?.toString?.() || data?.receiver?.toString();
      const currentUserId = session.user.id?.toString();

      const belongsToOpenChat =
        !!selectedId &&
        ((senderId === selectedId && receiverId === currentUserId) ||
          (senderId === currentUserId && receiverId === selectedId));

      if (belongsToOpenChat) {
        setChat((prev) => [...prev, data]);
      }

      setToast("New message");
      setTimeout(() => setToast(""), 3000);
      fetchUsers();
    });

    currentSocket.on("online-users", setOnline);
    fetchUsers();

    return () => {
      currentSocket.off("receive-message");
      currentSocket.off("online-users");
      currentSocket.disconnect();
      if (socketRef.current === currentSocket) {
        socketRef.current = null;
      }
    };
  }, [status, session?.user?.id]);

  async function fetchUsers() {
    const res = await fetch("/api/users/list", { credentials: "include" });
    const data = await res.json();
    setUsers(data.users || []);
  }

  async function loadMessages(userId) {
    const res = await fetch(`/api/conversations?userId=${userId}`, { credentials: "include" });
    const data = await res.json();
    setChat(data.messages || []);
  }

  async function send(e) {
    e.preventDefault();
    if (!message.trim() || !selected?._id) return;

    const payload = { receiverId: selected._id, text: message };
    const res = await fetch("/api/messages", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok || !data?.message) {
      setToast(data?.error || "Unable to send message");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    const activeSocket = socketRef.current;
    if (activeSocket?.connected) {
      activeSocket.emit("send-message", data.message);
    }
    setChat((prev) => [...prev, data.message]);
    setMessage("");
    fetchUsers();
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  if (status === "loading") return (
    <div style={styles.loadingScreen}>
      <div style={styles.loadingDot} />
      <span style={styles.loadingText}>Connecting...</span>
    </div>
  );

  const getInitials = (name) => name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div className="csw-toast">
          <span className="csw-toast-dot" />
          {toast}
        </div>
      )}

      <div className="csw-chat-root">
        {/* Sidebar */}
        <aside className="csw-sidebar">
          <div className="csw-sidebar-header">
            <span className="csw-sidebar-label">MESSAGES</span>
            <span className="csw-sidebar-count">{users.length}</span>
          </div>

          <div className="csw-user-list">
            {users.length === 0 && (
              <p className="csw-empty">No contacts found.</p>
            )}
            {users.map((u) => {
              const isOnline = online.includes(u._id?.toString());
              const isSelected = selected?._id === u._id;
              return (
                <div
                  key={u._id}
                  className={`csw-user-item ${isSelected ? "csw-user-item--active" : ""}`}
                  onClick={() => { setSelected(u); loadMessages(u._id); }}
                >
                  <div className="csw-avatar">
                    {getInitials(u.name)}
                    <span className={`csw-status-dot ${isOnline ? "csw-status-dot--online" : ""}`} />
                  </div>
                  <div className="csw-user-info">
                    <span className="csw-user-name">{u.name}</span>
                    <span className="csw-user-status">{isOnline ? "Online" : "Offline"}</span>
                  </div>
                  {u.unread > 0 && (
                    <span className="csw-badge">{u.unread}</span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="csw-main">
          {/* Chat Header */}
          {selected ? (
            <div className="csw-chat-header">
              <div className="csw-chat-header-avatar">{getInitials(selected.name)}</div>
              <div>
                <div className="csw-chat-header-name">{selected.name}</div>
                <div className="csw-chat-header-status">
                  <span className={`csw-status-dot csw-status-dot--sm ${online.includes(selected._id?.toString()) ? "csw-status-dot--online" : ""}`} />
                  {online.includes(selected._id?.toString()) ? "Active now" : "Offline"}
                </div>
              </div>
            </div>
          ) : (
            <div className="csw-chat-header csw-chat-header--empty">
              <span className="csw-chat-header-hint">Select a conversation</span>
            </div>
          )}

          {/* Messages */}
          <div className="csw-messages">
            {!selected && (
              <div className="csw-placeholder">
                <div className="csw-placeholder-icon">💬</div>
                <p>Pick a contact to start chatting</p>
              </div>
            )}
            {selected && chat.length === 0 && (
              <div className="csw-placeholder">
                <div className="csw-placeholder-icon">👋</div>
                <p>No messages yet. Say hello!</p>
              </div>
            )}
            {chat.map((m, i) => {
              const isMine = (m?.sender?.toString?.() || m?.sender?.toString()) === session?.user?.id?.toString();
              return (
                <div key={i} className={`csw-msg-row ${isMine ? "csw-msg-row--mine" : ""}`}>
                  {!isMine && (
                    <div className="csw-msg-avatar">{getInitials(selected?.name)}</div>
                  )}
                  <div className={`csw-bubble ${isMine ? "csw-bubble--mine" : "csw-bubble--theirs"}`}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          {selected && (
            <form className="csw-input-bar" onSubmit={send}>
              <input
                className="csw-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message ${selected.name}...`}
                autoComplete="off"
              />
              <button
                type="submit"
                className="csw-send-btn"
                disabled={!message.trim()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Send
              </button>
            </form>
          )}
        </main>
      </div>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --cyan: #00e5ff;
    --cyan-dim: rgba(0,229,255,0.15);
    --cyan-glow: rgba(0,229,255,0.08);
    --bg: #080c10;
    --bg-2: #0d1117;
    --bg-3: #111820;
    --border: rgba(0,229,255,0.12);
    --border-hover: rgba(0,229,255,0.3);
    --text: #e8f4f8;
    --text-dim: #5a7a85;
    --mine-bg: linear-gradient(135deg, #00c8e0 0%, #0099b8 100%);
    --theirs-bg: #151e26;
    --radius: 14px;
  }

  .csw-chat-root {
    display: flex;
    height: 100vh;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    overflow: hidden;
  }

  /* ── TOAST ── */
  .csw-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    background: var(--bg-3);
    border: 1px solid var(--border-hover);
    color: var(--cyan);
    padding: 10px 18px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 0 20px rgba(0,229,255,0.15);
    animation: slideIn 0.3s ease;
  }
  .csw-toast-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 8px var(--cyan);
  }

  /* ── LOADING ── */
  .csw-loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: var(--bg);
    gap: 12px;
    color: var(--cyan);
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    letter-spacing: 0.1em;
  }

  /* ── SIDEBAR ── */
  .csw-sidebar {
    width: 280px;
    min-width: 240px;
    background: var(--bg-2);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .csw-sidebar-header {
    padding: 24px 20px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .csw-sidebar-label {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--cyan);
  }

  .csw-sidebar-count {
    background: var(--cyan-dim);
    color: var(--cyan);
    border: 1px solid var(--border-hover);
    font-size: 11px;
    font-weight: 600;
    padding: 2px 9px;
    border-radius: 20px;
  }

  .csw-user-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 10px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .csw-empty {
    color: var(--text-dim);
    font-size: 13px;
    padding: 20px;
    text-align: center;
  }

  .csw-user-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 10px;
    border-radius: var(--radius);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    border: 1px solid transparent;
    margin-bottom: 3px;
  }
  .csw-user-item:hover {
    background: var(--cyan-glow);
    border-color: var(--border);
  }
  .csw-user-item--active {
    background: var(--cyan-dim);
    border-color: var(--border-hover);
  }

  .csw-avatar {
    position: relative;
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0d2030, #0a3040);
    border: 1.5px solid var(--border-hover);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--cyan);
    flex-shrink: 0;
  }

  .csw-status-dot {
    position: absolute;
    bottom: 1px; right: 1px;
    width: 9px; height: 9px;
    border-radius: 50%;
    background: var(--text-dim);
    border: 2px solid var(--bg-2);
  }
  .csw-status-dot--online {
    background: #00e676;
    box-shadow: 0 0 6px #00e676;
  }
  .csw-status-dot--sm {
    position: static;
    display: inline-block;
    width: 7px; height: 7px;
    border: none;
    vertical-align: middle;
    margin-right: 5px;
  }

  .csw-user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .csw-user-name {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text);
  }
  .csw-user-status {
    font-size: 11px;
    color: var(--text-dim);
  }

  .csw-badge {
    background: #ff1744;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 20px;
    flex-shrink: 0;
  }

  /* ── MAIN ── */
  .csw-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg);
    min-width: 0;
  }

  /* ── CHAT HEADER ── */
  .csw-chat-header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-2);
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }
  .csw-chat-header--empty {
    justify-content: center;
  }
  .csw-chat-header-hint {
    font-size: 13px;
    color: var(--text-dim);
    letter-spacing: 0.05em;
  }
  .csw-chat-header-avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0d2030, #0a3040);
    border: 1.5px solid var(--cyan);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--cyan);
    box-shadow: 0 0 12px rgba(0,229,255,0.2);
  }
  .csw-chat-header-name {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }
  .csw-chat-header-status {
    font-size: 12px;
    color: var(--text-dim);
    display: flex;
    align-items: center;
    margin-top: 2px;
  }

  /* ── MESSAGES ── */
  .csw-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .csw-placeholder {
    margin: auto;
    text-align: center;
    color: var(--text-dim);
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .csw-placeholder-icon {
    font-size: 40px;
    opacity: 0.4;
  }

  .csw-msg-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    animation: fadeUp 0.2s ease;
  }
  .csw-msg-row--mine {
    flex-direction: row-reverse;
  }

  .csw-msg-avatar {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0d2030, #0a3040);
    border: 1px solid var(--border-hover);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 10px;
    font-weight: 700;
    color: var(--cyan);
    flex-shrink: 0;
  }

  .csw-bubble {
    max-width: 62%;
    padding: 10px 16px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.55;
    word-break: break-word;
  }
  .csw-bubble--mine {
    background: var(--mine-bg);
    color: #fff;
    border-bottom-right-radius: 4px;
    box-shadow: 0 4px 16px rgba(0,180,220,0.25);
  }
  .csw-bubble--theirs {
    background: var(--theirs-bg);
    color: var(--text);
    border: 1px solid var(--border);
    border-bottom-left-radius: 4px;
  }

  /* ── INPUT BAR ── */
  .csw-input-bar {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    background: var(--bg-2);
    display: flex;
    gap: 12px;
    align-items: center;
    flex-shrink: 0;
  }

  .csw-input {
    flex: 1;
    background: var(--bg-3);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 12px 18px;
    border-radius: 50px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .csw-input::placeholder { color: var(--text-dim); }
  .csw-input:focus {
    border-color: var(--cyan);
    box-shadow: 0 0 0 3px rgba(0,229,255,0.08);
  }

  .csw-send-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--cyan);
    color: #020d12;
    border: none;
    padding: 12px 22px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    flex-shrink: 0;
    box-shadow: 0 0 16px rgba(0,229,255,0.3);
  }
  .csw-send-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 24px rgba(0,229,255,0.45);
  }
  .csw-send-btn:active:not(:disabled) { transform: translateY(0); }
  .csw-send-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    box-shadow: none;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const styles = {
  loadingScreen: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100vh", background: "#080c10", gap: 12, color: "#00e5ff",
    fontFamily: "monospace", fontSize: 14, letterSpacing: "0.1em"
  },
};