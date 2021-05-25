import { getCustomRepository, Repository } from "typeorm";
import AppError from "../errors/AppError";
import Room from "../entities/Room";
import User from "../entities/User";
import RoomsRepository from "../repositories/RoomsRepository";
import UsersRepository from "../repositories/UsersRepository";

interface IRoomsCreate {
  nome_sala: string;
  nome_usuario: string;
  avatar: string;
}

export default class RoomsService {
  private usersRepository: Repository<User>;
  private roomsRepository: Repository<Room>;

  constructor() {
    this.usersRepository = getCustomRepository(UsersRepository);
    this.roomsRepository = getCustomRepository(RoomsRepository);
  }

  async deleteRoom(room_id: string) {
    const roomExist = await this.roomsRepository.findOne({
      relations: ["users"],
      where: { id: room_id },
    });

    if (roomExist?.users?.length === 0) {
      await this.roomsRepository.remove(roomExist);
    }
  }

  async deleteFromRoom(user_id: string) {
    const userExist = await this.usersRepository.findOne({ id: user_id });

    if (!userExist) {
      throw new AppError("Usuário não existe.");
    }

    const room_id = userExist?.id;
    await this.usersRepository.remove(userExist);
    await this.deleteRoom(room_id);
  }

  async show(room_id: string) {
    const roomExists = await this.roomsRepository.findOne({
      relations: ["users", "users.cards", "cards"],
      where: {
        id: room_id,
      },
    });

    return roomExists;
  }

  async create({ nome_sala, nome_usuario, avatar }: IRoomsCreate) {
    const roomExists = await this.roomsRepository.findOne({
      relations: ["users"],
      where: {
        name: nome_sala,
      },
    });

    if (roomExists) {
      const existUserInRoom = await this.usersRepository.findOne({
        username: nome_usuario,
        room_id: roomExists.id,
      });

      if (existUserInRoom) {
        throw new AppError("Já existe um usuário com este nome nesta sala.");
      }

      const user = this.usersRepository.create({
        username: nome_usuario,
        avatar,
        room_id: roomExists.id,
      });

      await this.usersRepository.save(user);

      return { room: roomExists, user };
    }

    const room = this.roomsRepository.create({
      name: nome_sala,
    });

    await this.roomsRepository.save(room);

    const existUserInRoom = await this.usersRepository.findOne({
      username: nome_usuario,
      room_id: room.id,
    });

    if (existUserInRoom) {
      throw new AppError("Já existe um usuário com este nome nesta sala.");
    }
    const user = this.usersRepository.create({
      username: nome_usuario,
      avatar,
      room_id: room.id,
    });

    await this.usersRepository.save(user);

    return { room, user };
  }
}
