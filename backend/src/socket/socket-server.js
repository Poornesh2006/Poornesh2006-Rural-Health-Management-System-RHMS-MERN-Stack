import { metricsService } from "../services/metrics.service.js";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { env } from "../config/env.js";

let io;

export function initializeSocket(httpServer, corsOrigin) {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const publicDisplay = socket.handshake.auth?.publicDisplay === true;

    if (!token) {
      if (publicDisplay) {
        socket.data.publicDisplay = true;
        return next();
      }

      const error = new Error("Socket authentication required");
      error.data = { statusCode: 401 };
      return next(error);
    }

    try {
      socket.data.user = jwt.verify(token, env.jwtSecret);
      return next();
    } catch {
      const error = new Error("Invalid socket token");
      error.data = { statusCode: 401 };
      return next(error);
    }
  });

  io.on("connection", (socket) => {
    metricsService.setActiveSockets(io.engine.clientsCount);

    if (socket.data.user?.sub) {
      socket.join(`user:${socket.data.user.sub}`);
      socket.join(`role:${socket.data.user.role}`);
    }

    socket.on("subscribe:role", (role) => {
      if (!socket.data.user || socket.data.user.role !== role) {
        return;
      }
      socket.join(`role:${role}`);
    });

    socket.on("subscribe:doctor", (doctorId) => {
      const actorId = socket.data.user?.sub;
      if (!actorId || actorId !== doctorId) {
        return;
      }
      socket.join(`doctor:${doctorId}`);
    });

    socket.on("subscribe:department", (department) => {
      if (!department) {
        return;
      }

      socket.join(`department:${department}`);

      if (socket.data.publicDisplay || socket.data.user) {
        socket.join(`public-display:${department}`);
      }
    });

    socket.on("disconnect", () => {
      metricsService.setActiveSockets(io.engine.clientsCount);
    });
  });

  return io;
}

export function getIo() {
  return io;
}
