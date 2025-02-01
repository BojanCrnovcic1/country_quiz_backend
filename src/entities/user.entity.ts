import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GameAttempt } from "./game-attempt.entity";
import { Score } from "./score.entity";

@Index("uq_user_username", ["username"], { unique: true })
@Entity("user")
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "user_id", unsigned: true })
  userId: number;

  @Column("varchar", { name: "username", unique: true, length: 50 })
  username: string;

  @Column("varchar", { name: "profile_picture_url", length: 255, nullable: true })
  profilePictureUrl: string | null;

  @Column("timestamp", { name: "created_at", default: () => "'now()'" })
  createdAt: Date;

  @Column("boolean", { name: "is_logged_in", default: false })
  isLoggedIn: boolean;

  @OneToMany(() => GameAttempt, (gameAttempt) => gameAttempt.user)
  gameAttempts: GameAttempt[];

  @OneToMany(() => Score, (score) => score.user)
  scores: Score[];
}
