import express from "express";
import {ChatService, SendMassage} from "../service/chatService";
import {authMiddleware} from "../middleware/authMiddleware";
import {ioSocket} from "../index";
import {User} from "../entity/User";
import {AppDataSource} from "../data-source";

const router = express();

const chatService = new ChatService();

router.get("/userId/:userId", authMiddleware, async (req , res) => {
    const userId = (req as any).user.id;

    try {
        const userRepo = AppDataSource.getRepository(User);

        const user = await userRepo.findOneOrFail({where: {id: userId},
        relations: ["manager"]});

        const chat = await chatService.findExistingChat(parseInt(req.params.userId), user.manager.id!);

    res.json(chat);
    } catch (err) {
        res.status(500).send("Ошибка сервера");
        return;
    }
});

router.get("/companyId/:companyId", authMiddleware, async (req , res) => {
    const chat = await chatService.findExistingChat((req as any).user.id! , parseInt(req.params.companyId));

    res.json(chat);
});

router.post("/send/user", authMiddleware, async (req , res) => {
    const data = req.body as SendMassage;
    const userId = (req as any).user.id;

    try {
        const result = await chatService.sendMessageUser(userId, data);

        result.chat.members.forEach(member => {
            if (member.userId) {
                ioSocket.to(`user:${member.userId}`).emit("newMessage", result);
            }
            if (member.companyId) {
                ioSocket.to(`company:${member.companyId}`).emit("newMessage", result);
            }
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send message", error: (error as Error).message });
    }
});

router.post("/send/company", authMiddleware, async (req , res) => {
    const data = req.body as SendMassage;
    const userId = (req as any).user.id;

    try {
        const userRepo = AppDataSource.getRepository(User);

        const user = await userRepo.findOneOrFail({where: {id: userId},
            relations: ["manager"]});

        const result = await chatService.sendMessageCompany(user.manager.id, data);

        result.chat.members.forEach(member => {
            if (member.userId) {
                ioSocket.to(`user:${member.userId}`).emit("newMessage", result);
            }
            if (member.companyId) {
                ioSocket.to(`company:${member.companyId}`).emit("newMessage", result);
            }
        });

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send message", error: (error as Error).message });
    }
});

router.get("/messages/:chatId", authMiddleware, async (req , res) => {
    if(!req.params.chatId || req.params.chatId === "undefined") {
        res.status(400).send("Chat ID is required");
        return;
    }

    res.json(await chatService.getChatMessages(parseInt(req.params.chatId)));
});

router.get("/list", authMiddleware, async (req , res) => {
    res.json(await chatService.findChatListByUserId((req as any).user.id!));
});

export default router;