"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typeorm = require("typeorm");

var _AppError = _interopRequireDefault(require("../errors/AppError"));

var _RoomsRepository = _interopRequireDefault(require("../repositories/RoomsRepository"));

var _UsersRepository = _interopRequireDefault(require("../repositories/UsersRepository"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RoomsService {
  constructor() {
    this.usersRepository = void 0;
    this.roomsRepository = void 0;
    this.usersRepository = (0, _typeorm.getCustomRepository)(_UsersRepository.default);
    this.roomsRepository = (0, _typeorm.getCustomRepository)(_RoomsRepository.default);
  }

  async deleteRoom(room_id) {
    var _roomExist$users;

    const roomExist = await this.roomsRepository.findOne({
      relations: ["users"],
      where: {
        id: room_id
      }
    });

    if ((roomExist === null || roomExist === void 0 ? void 0 : (_roomExist$users = roomExist.users) === null || _roomExist$users === void 0 ? void 0 : _roomExist$users.length) === 0) {
      await this.roomsRepository.remove(roomExist);
    }
  }

  async deleteFromRoom(user_id) {
    const userExist = await this.usersRepository.findOne({
      id: user_id
    });

    if (!userExist) {
      throw new _AppError.default("Usuário não existe.");
    }

    const room_id = userExist === null || userExist === void 0 ? void 0 : userExist.id;
    await this.usersRepository.remove(userExist);
    await this.deleteRoom(room_id);
  }

  async show(room_id) {
    const roomExists = await this.roomsRepository.findOne({
      relations: ["users", "users.cards", "cards"],
      where: {
        id: room_id
      }
    });
    return roomExists;
  }

  async create({
    nome_sala,
    nome_usuario,
    avatar
  }) {
    const roomExists = await this.roomsRepository.findOne({
      relations: ["users"],
      where: {
        name: nome_sala
      }
    });

    if (roomExists) {
      const existUserInRoom = await this.usersRepository.findOne({
        username: nome_usuario,
        room_id: roomExists.id
      });

      if (existUserInRoom) {
        throw new _AppError.default("Já existe um usuário com este nome nesta sala.");
      }

      const user = this.usersRepository.create({
        username: nome_usuario,
        avatar,
        room_id: roomExists.id
      });
      await this.usersRepository.save(user);
      return {
        room: roomExists,
        user
      };
    }

    const room = this.roomsRepository.create({
      name: nome_sala
    });
    await this.roomsRepository.save(room);
    const existUserInRoom = await this.usersRepository.findOne({
      username: nome_usuario,
      room_id: room.id
    });

    if (existUserInRoom) {
      throw new _AppError.default("Já existe um usuário com este nome nesta sala.");
    }

    const user = this.usersRepository.create({
      username: nome_usuario,
      avatar,
      room_id: room.id
    });
    await this.usersRepository.save(user);
    return {
      room,
      user
    };
  }

}

exports.default = RoomsService;