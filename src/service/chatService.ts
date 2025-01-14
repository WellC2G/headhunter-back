import {Chat} from "../entity/chat";
import {User} from "../entity/User";
import {AppDataSource} from "../data-source";
import {ChatMember} from "../entity/chat-member";
import {ChatMessage} from "../entity/chat-message";
import {Company} from "../entity/Company";

export interface SendMassage {
    targetId: number;
    content: string;
    attachment?: string;

}

export class ChatService {
    async findExistingChat(userId: number, companyId: number) {
        const chatRepo = AppDataSource.getRepository(Chat);
        const result = await chatRepo
            .createQueryBuilder('chat')
            .select('chat.id', 'chatId')
            .innerJoin("chat.members", "cme")
            .where(qb => {
                const subQuery1 = qb.subQuery()
                    .select("subChat.id")
                    .from(Chat, "subChat")
                    .innerJoin("subChat.members", "subCme")
                    .where("subCme.userId = :userId", { userId })
                    .getQuery();

                const subQuery2 = qb.subQuery()
                    .select("subChat.id")
                    .from(Chat, "subChat")
                    .innerJoin("subChat.members", "subCme")
                    .where("subCme.companyId = :companyId", { companyId })
                    .getQuery();

                return "chat.id IN (" + subQuery1 + ") AND chat.id IN (" + subQuery2 + ")";
            })
            .getRawOne();

        if (!result) return null;

        return chatRepo.findOne({where: {id: (result as any).chatId}});
    }

    async createOrFindChatMembers(userId: number, companyId: number) {
        const chat = await this.findExistingChat(userId, companyId);

        if (chat) return chat;

        const chatRepo = AppDataSource.getRepository(Chat);

        const newChat = new Chat();
        await chatRepo.save(newChat);

        try {

            const user = await AppDataSource.getRepository(User).findOneOrFail(
                { where: { id: userId } }
            );

            const company = await AppDataSource.getRepository(Company).findOneOrFail(
                { where: { id: companyId } })
            ;

            const chatMemberUser = new ChatMember({
                chatId: newChat.id,
                userId: user.id,
                user: user,
                company: null,
                companyId: null
            });

            const chatMemberCompany = new ChatMember({
                chatId: newChat.id,
                companyId: company.id,
                company: company,
                user: null,
                userId: null
            });

            const members = [chatMemberUser, chatMemberCompany];
            await AppDataSource.getRepository(ChatMember).save(members);

            newChat.members = members;

            return newChat;

        } catch (err) {
            console.log(err)
        }
    }

    async sendMessageUser(userId: number, data: SendMassage) {
        const chat = await this.createOrFindChatMembers(userId, data.targetId);

        const chatMember = chat.members.find(member => member.userId === userId)!;

        const message = new ChatMessage({
            chatId: chat.id,
            chatMemberId: chatMember.id,
            content: data.content,
            chatMember: chatMember,
        })

        await AppDataSource.getRepository(ChatMessage).save(message);

        return {chat, message};
    }

    async sendMessageCompany(companyId: number, data: SendMassage) {
        const chat = await this.createOrFindChatMembers(data.targetId, companyId);

        const chatMember = chat.members.find(member => member.companyId === companyId);

        const message = new ChatMessage({
            chatId: chat.id,
            chatMemberId: chatMember.id,
            content: data.content,
            chatMember: chatMember,
        });

        await AppDataSource.getRepository(ChatMessage).save(message);

        return {chat, message};
    }


    async findChatListByUserId(userId: number) {
        return AppDataSource.getRepository(ChatMember)
            .createQueryBuilder("chat")
            .innerJoin("chat.members", "cme", "cme.userId = :userId", {userId: userId})
            .leftJoinAndSelect("chat.members", "members")
            .getMany();
    }

    async getChatMessages(chatId: number) {
        return AppDataSource.getRepository(ChatMessage)
            .find({where: {chatId}, order: {createdAt: "DESC"}})
    }
}