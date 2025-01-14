import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Chat} from "./chat";
import {User} from "./User";
import {Company} from "./Company";

@Entity()
export class ChatMember {
    constructor(x?: Partial<ChatMember>) {
        Object.assign(this, x)
    }

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Chat, chat => chat.members)
    @JoinColumn({name: "chatId"})
    chat: Chat;

    @Column({type: "number"})
    chatId: number;

    @ManyToOne(() => User, {eager: true, nullable: true})
    @JoinColumn({name: "userId"})
    user: User;

    @Column({type: "number", nullable: true})
    userId: number;

    @ManyToOne(() => Company, {eager: true, nullable: true})
    @JoinColumn({name: "companyId"})
    company: Company;

    @Column({type: "number", nullable: true})
    companyId: number;

}