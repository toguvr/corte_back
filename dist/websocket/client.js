"use strict";

var _GameService = _interopRequireDefault(require("../../src/services/GameService"));

var _http = require("../http");

var _RoomsService = _interopRequireDefault(require("../services/RoomsService"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const connectedUsers = {};

_http.io.on("connect", socket => {
  const user_id = socket.handshake.query.user_id;
  connectedUsers[user_id] = socket.id;
  const gameService = new _GameService.default();
  const roomsService = new _RoomsService.default();
  socket.on("newRoom", room_id => {
    socket.join(`room${room_id}`);
    socket.to(`room${room_id}`).emit("joinRoom");
  });
  socket.on("startGame", async ({
    usuario_id,
    sala_id
  }) => {
    try {
      const newGame = await gameService.create({
        user_id: usuario_id,
        sala_id
      });
      return socket.to(`room${sala_id}`).emit("startGame", newGame);
    } catch (error) {
      return socket.to(user_id).emit("alert", error.message);
    }
  });
  socket.on("leaveRoom", async room_id => {
    await roomsService.deleteFromRoom(user_id);
    socket.leave(`room${room_id}`);
  });
  socket.on("disconnect", async () => {
    await roomsService.deleteFromRoom(user_id);
    delete connectedUsers[user_id];
    socket.broadcast.emit("AnyleaveRoom");
  });
});