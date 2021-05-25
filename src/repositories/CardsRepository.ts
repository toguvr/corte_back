import { EntityRepository, Repository } from "typeorm";
import Card from "../entities/Card";

@EntityRepository(Card)
export default class CardsRepository extends Repository<Card> {}
