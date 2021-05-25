"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RoomsService = _interopRequireDefault(require("../services/RoomsService"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RoomController {
  async create(request, response) {
    const {
      nome_sala,
      nome_usuario,
      avatar
    } = request.body;
    const roomsService = new _RoomsService.default();

    try {
      const room = await roomsService.create({
        nome_sala,
        nome_usuario,
        avatar
      });
      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message
      });
    }
  }

  async show(request, response) {
    const {
      room_id
    } = request.params;
    const roomsService = new _RoomsService.default();
    const room = await roomsService.show(room_id);
    return response.json(room);
  }

}

exports.default = RoomController;