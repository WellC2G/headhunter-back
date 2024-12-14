import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/user');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error('Недопустимый тип файла. Пожалуйста, загрузите изображение (JPEG, PNG, GIF).');
        cb(error);
    }
};

export const upload = multer({ storage: storage, fileFilter: fileFilter});

export class AvatarUserController {
    async uploadUserProfile(req: Request, res: Response):Promise<void> {
        const userId = (req as any).user.id;
        const updateData = (req as any).body;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({id: userId});
            if (!user) {
                res.status(404).json({message: 'Пользователь не найден'});
                return;
            }

            if ((req as any).fileValidationError) {
                 res.status(400).json({ message: (req as any).fileValidationError.message});
                return;
            }

            Object.assign(user, updateData);
            if ((req as any).file) {
                user.avatar = (req as any).file.path;
            }

            await userRepository.save(user);
            res.status(200).json({ message: 'Профиль успешно обновлен' });
            return;
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при обновлении профиля' });
            return;
        }
    }
}
