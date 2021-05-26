import { Router } from "express";

import RoomController from "./controllers/RoomController";
import GameController from "./controllers/GameController";

const roomController = new RoomController();
const gameController = new GameController();

const routes = Router();

routes.get("/sala/:room_id", roomController.show);
routes.post("/sala", roomController.create);
routes.get("/sala/clean-all", gameController.clean);
routes.post("/sala/iniciar", gameController.create);
routes.post("/sala/action", gameController.action);
routes.post("/sala/acao-duvido-start", gameController.actionDoubt);
routes.post("/sala/acao-duvido-start-block", gameController.actionDoubtBlock);
routes.post("/sala/resposta-duvido", gameController.answerDoubt);
routes.post("/sala/duvido", gameController.doubtDuque);
routes.post("/sala/duvido/poder/duque", gameController.doubtDuquePower);
routes.post("/sala/duvido/poder/assassino", gameController.doubtAssassinoPower);
routes.post("/sala/duvido/poder/capitao", gameController.doubtCapitaoPower);
routes.post(
  "/sala/duvido/poder/embaixador",
  gameController.doubtEmbaixadorPower
);

export { routes };
