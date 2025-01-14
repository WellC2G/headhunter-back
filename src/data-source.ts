import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import {Company} from "./entity/Company";
import {Vacancy} from "./entity/Vacancy";
import {Resume} from "./entity/Resume";
import {ChatMember} from "./entity/chat-member";
import {Chat} from "./entity/chat";
import {ChatMessage} from "./entity/chat-message";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "fedor",
    password: "1234",
    database: "headhunter",
    synchronize: true,
    logging: false,
    entities: [User, Company, Vacancy, Resume, ChatMember, Chat, ChatMessage],
    migrations: [],
    subscribers: [],
})
