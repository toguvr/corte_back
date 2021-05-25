import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import UserCard from "./UserCard";
import Room from "./Room";

@Index("user_rooms_users_id_fk", ["room_id"], {})
@Entity("user")
export default class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  username: string;

  @Column()
  room_id: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  doubt: boolean;

  @Column({ default: false })
  pass: boolean;

  @Column({ default: 0 })
  coins: number;

  @OneToMany(() => UserCard, (card) => card.user)
  cards: UserCard[];

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Room, (user) => user.users, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "room_id", referencedColumnName: "id" }])
  room: Room;
}
