import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Server } from "./server";
import { Token } from "./token";

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: "username" })
    host_user: string;

    @Column({ name: 'my-password' })
    password: string;

    @OneToMany(() => Token,
        token => token.user
    )
    tokens: Token[]

    @OneToMany(() => Server,
        server => server.user
    )
    server: Server[]

}