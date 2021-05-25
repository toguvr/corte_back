import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Index,
} from "typeorm";
import Room from "./Room";

@Index("room_cards_room_id_fk", ["room_id"], {})
@Entity("card")
export default class Card {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  room_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Room, (room) => room.cards, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "room_id", referencedColumnName: "id" }])
  room: Room;
}
