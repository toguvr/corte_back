import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

import User from "./User";
import Card from "./Card";

@Entity("room")
export default class Room {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: false })
  waiting: boolean;

  @Column({ default: 0 })
  round: number;

  @OneToMany(() => User, (user) => user.room)
  users: User[];

  @OneToMany(() => Card, (card) => card.room)
  cards: Card[];

  @CreateDateColumn()
  created_at: Date;
}
