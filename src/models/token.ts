import { User } from "./user";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Token extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => User,
        user => user.tokens
    )
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ unique: true })
    token: string;
}