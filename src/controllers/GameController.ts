import { Request, Response } from "express";
import RoomsService from "../services/RoomsService";
import GameService from "../services/GameService";
import { io } from "src/http";

export default class GameController {
  async create(req: Request, response: Response) {
    const { sala_id, user_id } = req.body;

    const gameService = new GameService();

    try {
      const room = await gameService.create({
        sala_id,
        user_id,
      });

      io.emit("startRoom");
      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message,
      });
    }
  }

  async action(req: Request, response: Response) {
    const { sala_id, user_id, action, victim_id, doubtActionType } = req.body;

    const gameService = new GameService();

    try {
      const room = await gameService.action({
        sala_id,
        user_id,
        action,
        victim_id,
        doubtActionType,
      });

      io.emit("actionDid");
      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message,
      });
    }
  }

  async actionDoubt(req: Request, response: Response) {
    const { sala_id, user_id, action, doubtActionType, victim } = req.body;

    const gameService = new GameService();

    try {
      const room = await gameService.actionDoubt({
        sala_id,
        user_id,
        action,
        doubtActionType,
      });

      io.emit("actionDoubt", {
        sala_id,
        user_id,
        action,
        doubtActionType,
        victim,
      });

      // return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message,
      });
    }
  }

  async actionDoubtBlock(req: Request, response: Response) {
    const { sala_id, user_id, action, doubtActionType, victim } = req.body;

    const gameService = new GameService();

    try {
      const user = await gameService.actionDoubtBlock({
        sala_id,
        user_id,
        action,
        doubtActionType,
      });

      io.emit("actionDoubtBlock", {
        sala_id,
        user_id,
        action,
        doubtActionType,
        victim,
        user,
      });

      // return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message,
      });
    }
  }

  async answerDoubt(req: Request, response: Response) {
    const { sala_id, user_id, doubt } = req.body;

    const gameService = new GameService();

    try {
      const room = await gameService.anserdoubt({
        sala_id,
        user_id,
        doubt,
      });

      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message,
      });
    }
  }

  async doubtDuque(req: Request, response: Response) {
    const { sala_id, user_id, victim_id, doubt } = req.body;

    const gameService = new GameService();

    try {
      const room = await gameService.doubtDuque({
        sala_id,
        user_id,
        victim_id,
        doubt,
      });

      // io.emit("doubt", { action, victim_id, user_id });
      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message,
      });
    }
  }

  async doubtDuquePower(req: Request, response: Response) {
    const { sala_id, user_id, victim_id, doubt, doubtActionType } = req.body;

    const gameService = new GameService();

    try {
      const room = await gameService.doubtDuquePower({
        sala_id,
        user_id,
        victim_id,
        doubt,
        doubtActionType,
      });

      // io.emit("doubt", { action, victim_id, user_id });
      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message,
      });
    }
  }

  async doubtCapitaoPower(req: Request, response: Response) {
    const { sala_id, user_id, victim_id, doubtType, doubtActionType } =
      req.body;

    const gameService = new GameService();

    try {
      const room = await gameService.doubtCapitaoPower({
        sala_id,
        user_id,
        victim_id,
        doubtType,
        doubtActionType,
      });

      // io.emit("doubt", { action, victim_id, user_id });
      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message,
      });
    }
  }

  async doubtEmbaixadorPower(req: Request, response: Response) {
    const { sala_id, user_id, victim_id, doubtType, doubtActionType } =
      req.body;

    const gameService = new GameService();

    try {
      const room = await gameService.doubtEmbaixadorPower({
        sala_id,
        user_id,
        victim_id,
        doubtType,
        doubtActionType,
      });

      // io.emit("doubt", { action, victim_id, user_id });
      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message,
      });
    }
  }

  async doubtAssassinoPower(req: Request, response: Response) {
    const { sala_id, user_id, victim_id, doubtType, doubtActionType } =
      req.body;

    const gameService = new GameService();

    try {
      const room = await gameService.doubtAssassinoPower({
        sala_id,
        user_id,
        victim_id,
        doubtType,
        doubtActionType,
      });

      // io.emit("doubt", { action, victim_id, user_id });
      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message,
      });
    }
  }
}
