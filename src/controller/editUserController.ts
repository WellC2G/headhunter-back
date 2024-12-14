import { Request, Response } from 'express';
import {User} from '../entity/User';
import {AppDataSource} from '../data-source'

export class EditUserController {
    async updateProfile(req: Request, res: Response) {
        const userId: number = (req as any).user.id;
        const updateData = req.body;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({id: userId});

            if (!user) {
                res.status(404).json({message: 'Пользователь не найдена'})
                return;
            }

            Object.assign(user, updateData);
            await userRepository.save(user);

            res.status(200).json({message: 'Профиль успешно обновлен'});
            return;
        } catch (error) {
            res.status(500).json({message: 'Ошибка при изменении профиля'});
            return;
        }
    }
}