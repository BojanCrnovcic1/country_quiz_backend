import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GameAttempt } from "./game-attempt.entity";

@Index("name", ["name"], { unique: true })
@Entity("country", { schema: "country_quiz" })
export class Country {
  @PrimaryGeneratedColumn({ type: "int", name: "country_id", unsigned: true })
  countryId: number;

  @Column("varchar", { name: "name", unique: true, length: 100 })
  name: string;

  @Column("enum", {
    name: "continent",
    enum: [
      "Afrika",
      "Azija",
      "Evropa",
      "Sjeverna Amerika",
      "Južna Amerika",
      "Okeanija",
    ],
  })
  continent:
    | "Afrika"
    | "Azija"
    | "Evropa"
    | "Sjeverna Amerika"
    | "Južna Amerika"
    | "Okeanija";

  @Column("varchar", { name: "capital", length: 100 })
  capital: string;

  @Column("int", { name: "population", unsigned: true, default: 0 })
  population: number;

  @Column("varchar", { name: "flag_url", length: 255 })
  flagUrl: string;

  @OneToMany(() => GameAttempt, (gameAttempt) => gameAttempt.country)
  gameAttempts: GameAttempt[];
}
