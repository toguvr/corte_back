"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _GameService = _interopRequireDefault(require("../services/GameService"));

var _http = require("../http");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GameController {
  async create(req, response) {
    const {
      sala_id,
      user_id
    } = req.body;
    const gameService = new _GameService.default();

    try {
      const room = await gameService.create({
        sala_id,
        user_id
      });

      _http.io.emit("startRoom");

      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message
      });
    }
  }

  async action(req, response) {
    const {
      sala_id,
      user_id,
      action,
      victim_id,
      doubtActionType
    } = req.body;
    const gameService = new _GameService.default();

    try {
      const room = await gameService.action({
        sala_id,
        user_id,
        action,
        victim_id,
        doubtActionType
      });

      _http.io.emit("actionDid");

      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message
      });
    }
  }

  async actionDoubt(req, response) {
    const {
      sala_id,
      user_id,
      action,
      doubtActionType,
      victim
    } = req.body;
    const gameService = new _GameService.default();

    try {
      const room = await gameService.actionDoubt({
        sala_id,
        user_id,
        action,
        doubtActionType
      });

      _http.io.emit("actionDoubt", {
        sala_id,
        user_id,
        action,
        doubtActionType,
        victim
      }); // return response.json(room);

    } catch (error) {
      return response.status(400).json({
        message: error.message
      });
    }
  }

  async actionDoubtBlock(req, response) {
    const {
      sala_id,
      user_id,
      action,
      doubtActionType,
      victim
    } = req.body;
    const gameService = new _GameService.default();

    try {
      const user = await gameService.actionDoubtBlock({
        sala_id,
        user_id,
        action,
        doubtActionType
      });

      _http.io.emit("actionDoubtBlock", {
        sala_id,
        user_id,
        action,
        doubtActionType,
        victim,
        user
      }); // return response.json(room);

    } catch (error) {
      return response.status(400).json({
        message: error.message
      });
    }
  }

  async answerDoubt(req, response) {
    const {
      sala_id,
      user_id,
      doubt
    } = req.body;
    const gameService = new _GameService.default();

    try {
      const room = await gameService.anserdoubt({
        sala_id,
        user_id,
        doubt
      });
      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message
      });
    }
  }

  async doubtDuque(req, response) {
    const {
      sala_id,
      user_id,
      victim_id,
      doubt
    } = req.body;
    const gameService = new _GameService.default();

    try {
      const room = await gameService.doubtDuque({
        sala_id,
        user_id,
        victim_id,
        doubt
      }); // io.emit("doubt", { action, victim_id, user_id });

      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message
      });
    }
  }

  async doubtDuquePower(req, response) {
    const {
      sala_id,
      user_id,
      victim_id,
      doubt,
      doubtActionType
    } = req.body;
    const gameService = new _GameService.default();

    try {
      const room = await gameService.doubtDuquePower({
        sala_id,
        user_id,
        victim_id,
        doubt,
        doubtActionType
      }); // io.emit("doubt", { action, victim_id, user_id });

      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message
      });
    }
  }

  async doubtCapitaoPower(req, response) {
    const {
      sala_id,
      user_id,
      victim_id,
      doubtType,
      doubtActionType
    } = req.body;
    const gameService = new _GameService.default();

    try {
      const room = await gameService.doubtCapitaoPower({
        sala_id,
        user_id,
        victim_id,
        doubtType,
        doubtActionType
      }); // io.emit("doubt", { action, victim_id, user_id });

      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message
      });
    }
  }

  async doubtEmbaixadorPower(req, response) {
    const {
      sala_id,
      user_id,
      victim_id,
      doubtType,
      doubtActionType
    } = req.body;
    const gameService = new _GameService.default();

    try {
      const room = await gameService.doubtEmbaixadorPower({
        sala_id,
        user_id,
        victim_id,
        doubtType,
        doubtActionType
      }); // io.emit("doubt", { action, victim_id, user_id });

      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message
      });
    }
  }

  async doubtAssassinoPower(req, response) {
    const {
      sala_id,
      user_id,
      victim_id,
      doubtType,
      doubtActionType
    } = req.body;
    const gameService = new _GameService.default();

    try {
      const room = await gameService.doubtAssassinoPower({
        sala_id,
        user_id,
        victim_id,
        doubtType,
        doubtActionType
      }); // io.emit("doubt", { action, victim_id, user_id });

      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message
      });
    }
  }

}

exports.default = GameController;