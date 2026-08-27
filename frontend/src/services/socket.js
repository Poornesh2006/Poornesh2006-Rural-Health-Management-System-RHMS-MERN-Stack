import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket;

export function getSocket() {
  if (!socket) {
    const token = window.localStorage.getItem("rhms-access-token");
    socket = io(SOCKET_URL, {
      auth: token ? { token } : undefined,
      autoConnect: true,
    });
  }

  return socket;
}

export function createPublicDisplaySocket() {
  return io(SOCKET_URL, {
    auth: { publicDisplay: true },
    autoConnect: true,
  });
}
