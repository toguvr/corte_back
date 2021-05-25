import { EntityRepository, Repository } from "typeorm";

import UserCard from "../entities/UserCard";

@EntityRepository(UserCard)
export default class UserCardRepository extends Repository<UserCard> {}
