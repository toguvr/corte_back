import express, { Request, Response, NextFunction } from "express";

import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { routes } from "./routes";
import cors from "cors";

import "./database";
import AppError from "./errors/AppError";

const app = express();

const http = createServer(app); // Criando Protocolo HTTP
const io = new Server(http); // Criando Protocolo WS

const connectedUsers = {};

io.on("connection", (socket: Socket) => {
  const user_id = socket.handshake.query.user_id as string;

  connectedUsers[user_id] = socket.id;

  socket.on("disconnect", () => {
    delete connectedUsers[user_id];
  });
});

app.use(
  cors({
    origin: [process.env.APP_WEB_URL, "http://localhost:3000"],
  })
);

app.use(express.json());
app.use(routes);

app.use(
  async (err: Error, request: Request, response: Response, _: NextFunction) => {
    if (err instanceof AppError) {
      return response.status(err.statusCode).json({
        status: "error",
        message: err.message,
      });
    }
  }
);

export { http, io, connectedUsers };
