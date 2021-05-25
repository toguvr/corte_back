"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _GameService = _interopRequireDefault(require("../services/GameService"));

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
      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message
      });
    }
  }

}

exports.default = GameController;