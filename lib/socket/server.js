import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

export function initSocket(server) {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {

    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.on("send-message", (data) => {
      const receiverId = data?.receiverId?.toString?.() || data?.receiver?.toString?.();
      const receiverSocket = onlineUsers.get(receiverId);

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", data);
        io.to(receiverSocket).emit("notification", {
          text: "New message",
        });
      }
    });

    socket.on("disconnect", () => {
      for (let [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) onlineUsers.delete(uid);
      }
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });
}