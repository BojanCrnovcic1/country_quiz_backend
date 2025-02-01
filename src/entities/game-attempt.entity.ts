import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Country } from "./country.entity";
import { User } from "./user.entity";
import { GameType } from "src/misc/game.type";

@Index("fk_game_attempt_country_id", ["countryId"], {})
@Index("fk_game_attempt_user_id", ["userId"], {})
@Entity("game_attempt", { schema: "country_quiz" })
export class GameAttempt {
  @PrimaryGeneratedColumn({ type: "int", name: "game_id", unsigned: true })
  gameId: number;

  @Column("int", { name: "user_id", unsigned: true, default: () => "'0'" })
  userId: number;

  @Column("enum", {
    name: "game_type",
    enum: GameType,
  })
  gameType: GameType;

  @Column("int", { name: "country_id", unsigned: true, default: () => "'0'" })
  countryId: number;

  @Column("varchar", { name: "answer", length: 255, default: () => "'0'" })
  answer: string;

  @Column("tinyint", { name: "is_correct", width: 1, default: () => "'1'" })
  isCorrect: boolean;

  @Column("int", { name: "points", default: () => "'0'" })
  points: number;

  @Column("timestamp", { name: "attempt_time", default: () => "'now()'" })
  attemptTime: Date;

  @ManyToOne(() => Country, (country) => country.gameAttempts, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "country_id", referencedColumnName: "countryId" }])
  country: Country;

  @ManyToOne(() => User, (user) => user.gameAttempts, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
