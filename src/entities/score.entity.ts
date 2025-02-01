import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

@Index("fk_score_user_id", ["userId"], {})
@Entity("score", { schema: "country_quiz" })
export class Score {
  @PrimaryGeneratedColumn({ type: "int", name: "score_id", unsigned: true })
  scoreId: number;

  @Column("int", { name: "user_id", unsigned: true, default: () => "'0'" })
  userId: number;

  @Column("int", { name: "total_score", unsigned: true, default: () => "'0'" })
  totalScore: number;

  @Column("timestamp", { name: "created_at", default: () => "'now()'" })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.scores, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
