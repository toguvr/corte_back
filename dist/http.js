"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.io = exports.http = void 0;

var _express = _interopRequireDefault(require("express"));

var _http = require("http");

var _socket = require("socket.io");

var _routes = require("./routes");

var _cors = _interopRequireDefault(require("cors"));

require("./database");

var _AppError = _interopRequireDefault(require("./errors/AppError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();
const http = (0, _http.createServer)(app); // Criando Protocolo HTTP

exports.http = http;
const io = new _socket.Server(http); // Criando Protocolo WS

exports.io = io;
io.on("connection", socket => {// console.log("Se conectou", socket.id);
});
app.use((0, _cors.default)({
  origin: [process.env.APP_WEB_URL, "http://localhost:3000"]
}));
app.use(_express.default.json());
app.use(_routes.routes);
app.use(async (err, request, response, _) => {
  if (err instanceof _AppError.default) {
    return response.status(err.statusCode).json({
      status: "error",
      message: err.message
    });
  }
});