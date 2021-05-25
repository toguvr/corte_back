import { EntityRepository, Repository } from "typeorm";

import Room from "../entities/Room";

@EntityRepository(Room)
export default class RoomsRepository extends Repository<Room> {}
