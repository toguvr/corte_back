import { Request, Response } from "express";
import RoomsService from "../services/RoomsService";

export default class RoomController {
  async create(request: Request, response: Response) {
    const { nome_sala, nome_usuario, avatar } = request.body;

    const roomsService = new RoomsService();
    try {
      const room = await roomsService.create({
        nome_sala,
        nome_usuario,
        avatar,
      });

      return response.json(room);
    } catch (error) {
      return response.status(400).json({
        message: error.message,
      });
    }
  }

  async clean(request: Request, response: Response) {
    const roomsService = new RoomsService();
    try {
      const room = await roomsService.clean();

      return response.status(200).send();
    } catch (error) {
      return response.status(400).json({
        message: error.message,
      });
    }
  }

  async show(request: Request, response: Response) {
    const { room_id } = request.params;

    const roomsService = new RoomsService();

    const room = await roomsService.show(room_id);

    return response.json(room);
  }
}
