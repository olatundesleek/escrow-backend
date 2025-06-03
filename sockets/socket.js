// socket.js
const socketio = require("socket.io");
const { verifySocketToken } = require("../middleware/authMiddleware");

const connectedUsers = new Map(); // userId -> socketId

let io = null;

function emitActiveUsersToAdmins() {
  const activeUsers = Array.from(connectedUsers.values()).map(
    (u) => u.username
  );
  const count = activeUsers.length;

  io.sockets.sockets.forEach((socket) => {
    if (socket.role === "admin") {
      socket.emit("activeUsers", { count, users: activeUsers });
    }
  });
}

function initSocket(server) {
  io = socketio(server, {
    cors: {
      origin: "*", // Adjust this to your frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  console.log("got here in socket.js initSocket");
  io.use(verifySocketToken);

  io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);
    const userId = socket.userId;
    connectedUsers.set(userId, {
      socketId: socket.id,
      username: socket.username,
    });

    emitActiveUsersToAdmins();

    // Join escrow room logic
    socket.on("joinEscrowRoom", (escrowId) => {
      socket.join(`escrow-${escrowId}`);
    });

    socket.on("leaveEscrowRoom", (escrowId) => {
      socket.leave(`escrow-${escrowId}`);
    });

    // Optional: Handle chat
    socket.on("sendMessage", ({ escrowId, message }) => {
      io.to(`escrow-${escrowId}`).emit("newMessage", {
        userId: socket.userId,
        message,
        timestamp: new Date(),
      });
    });

    socket.on("disconnect", () => {
      connectedUsers.delete(userId);

      emitActiveUsersToAdmins();
    });
  });
}

function getIo() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

function getConnectedUsers() {
  return connectedUsers;
}

module.exports = {
  initSocket,
  getIo,
  getConnectedUsers,
  emitActiveUsersToAdmins,
};
