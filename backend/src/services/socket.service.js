import { getIo } from "../socket/socket-server.js";

export const socketService = {
  emit(event, payload, rooms = []) {
    const io = getIo();

    if (!io) {
      return;
    }

    if (!rooms.length) {
      io.emit(event, payload);
      return;
    }

    rooms.forEach((room) => {
      io.to(room).emit(event, payload);
    });
  },
};
