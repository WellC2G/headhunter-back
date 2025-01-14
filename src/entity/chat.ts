import { CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {ChatMember} from "./chat-member";

@Entity()
export class Chat{
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @OneToMany(() => ChatMember, chatMember => chatMember.chat, {eager: true})
    members: ChatMember[];
}