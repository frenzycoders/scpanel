import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Server extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ip: string;

    @Column()
    port: string;

    @Column()
    status: Boolean;

    @Column()
    error: Boolean;

    @ManyToOne(
        () => User,
        user => user.server,
    )
    @JoinColumn({ name: 'server-name' })
    user: User

    @Column()
    email: string;

    @Column()
    homeDir: string
}