import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Chat} from "./chat";
import {ChatMember} from "./chat-member";

@Entity()
export class ChatMessage {
    constructor(x?: Partial<ChatMessage>) {
        Object.assign(this, x)
    }

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @ManyToOne(() => Chat)
    @JoinColumn({name: "chatId"})
    chat: Chat;

    @Column({type: "number"})
    chatId: number;

    @ManyToOne(() => ChatMember, {eager: true})
    @JoinColumn({name: "userId"})
    chatMember: ChatMember;

    @Column({type: "bigint"})
    chatMemberId: number;

    @Column({type: "text"})
    content: string;

    @Column({type: "text", nullable: true})
    attachment?: string;
}