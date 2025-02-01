import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("uq_admin_username", ["username"], { unique: true })
@Entity("admin", { schema: "country_quiz" })
export class Admin {
  @PrimaryGeneratedColumn({ type: "int", name: "admin_id", unsigned: true })
  adminId: number;

  @Column("varchar", {
    name: "username",
    unique: true,
    length: 50,
    default: () => "'0'",
  })
  username: string;

  @Column("varchar", {
    name: "password_hash",
    length: 255,
    default: () => "'0'",
  })
  passwordHash: string;
}
