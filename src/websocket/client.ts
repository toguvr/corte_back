import { io } from "../http";

import RoomsService from "../services/RoomsService";

interface IParams {
  text: string;
  email: string;
}

const connectedUsers = {} as { [key: string]: any };

io.on("connect", (socket) => {
  const user_id = socket.handshake.query.user_id as string;

  connectedUsers[user_id] = socket.id;

  const roomsService = new RoomsService();
  socket.on("newRoom", (room_id) => {
    socket.join(`room${room_id}`);
    socket.to(`room${room_id}`).emit("joinRoom");
  });

  socket.on("newMsg", ({ room_id, msg, user }) => {
    socket.broadcast
      .to(`room${room_id}`)
      .emit("newMsg", { room_id, msg, user });
  });

  socket.on("leaveRoom", async (room_id) => {
    await roomsService.deleteFromRoom(user_id);
    socket.leave(`room${room_id}`);
  });

  socket.on("disconnect", async () => {
    await roomsService.deleteFromRoom(user_id);
    delete connectedUsers[user_id];
    socket.broadcast.emit("AnyleaveRoom");
  });
});
