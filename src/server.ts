import express from "express";
import path from "path";
import fs from "fs";
import app from "./app";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from /public
app.use("/static", express.static(path.join(__dirname, "..", "public")));

const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "http://localhost:3000", // ganti dengan domain frontend di production
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });
  socket.on("disconnect", () => {});
});

httpServer.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

export { io };
