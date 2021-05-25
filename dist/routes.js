"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routes = void 0;

var _express = require("express");

var _RoomController = _interopRequireDefault(require("./controllers/RoomController"));

var _GameController = _interopRequireDefault(require("./controllers/GameController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const roomController = new _RoomController.default();
const gameController = new _GameController.default();
const routes = (0, _express.Router)();
exports.routes = routes;
routes.get("/sala/:room_id", roomController.show);
routes.post("/sala", roomController.create);
routes.post("/sala/iniciar", gameController.create);