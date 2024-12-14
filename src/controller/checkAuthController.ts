import { Request, Response } from 'express';
import {User} from '../entity/User';
import {AppDataSource} from '../data-source'

export class CheckAuthController {
    async getUserById(req: Request, res: Response) {
        const userId: number = (req as any).user.id;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: userId });
            const avatarUrl = req.protocol + '://' + req.get('host') + '/' + user.avatar;

            if (!user) {
                res.status(404).json({ message: 'Пользователь не найден' });
                return;
            }
            res.status(200).json({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                description: user.description,
                email: user.email,
                avatar: avatarUrl,
                role: user.role,
            });
            return;
        } catch (error) {
            res.status(500).json({ message: 'Ошибка при получении пользователя' });
            console.error(error);
            return;
        }
    }
}