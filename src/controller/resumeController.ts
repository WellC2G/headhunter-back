import { Request, Response } from 'express';
import { AppDataSource } from "../data-source";
import { Resume } from "../entity/Resume";
import {role, User} from "../entity/User";

export class ResumeController {
    async createResume(req: Request, res: Response) {
        const resumeData: Resume = req.body;
        const userId: number = req.user.id;

        try {
            const resumeRepository = AppDataSource.getRepository(Resume);
            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository.findOneBy({ id: userId });

            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            const newResume = resumeRepository.create(resumeData);

            newResume.user = user;

            user.resumes.push(newResume);

            await resumeRepository.save(newResume);
            await userRepository.save(user);

            return res.status(201).json({ message: 'Резюме успешно создано', resume: newResume });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ошибка при создании резюме' });
        }
    }
    async updateResume(req: Request, res: Response) {
        const resumeId = parseInt(req.params.resumeId);
        const updateData: Resume = req.body;

        try {
            const resumeRepository = AppDataSource.getRepository(Resume);
            const userRepository = AppDataSource.getRepository(User);

            const resume= await resumeRepository.findOneBy({id: resumeId});
            if (!resume) {
                return res.status(404).json({message: 'Резюме не найдено'});
            }

            const user = await userRepository.findOneBy({id: req.user.id});

            if (['applicant'].includes(user.role)) {
                return res.status(403).json({message: 'Нет доступа к редактированию этого резюме'});
            }

            Object.assign(resume, updateData);
            await resumeRepository.save(resume);

            return res.status(200).json({message: 'Резюме успешно обновлено'});
        } catch (err) {
            console.error(err);
            return res.status(500).json({message: 'Ошибка при обновлении резюме'});
        }
    }
}