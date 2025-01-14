import {Request, Response} from 'express';
import { AppDataSource} from "../data-source";
import { Resume} from "../entity/Resume";
import { User} from "../entity/User";
import {Vacancy} from "../entity/Vacancy";

export class ResumeController {
    async createResume(req: Request, res: Response) {
        const resumeData: Resume = req.body;
        const userId = (req as any).user.id;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const resumeRepository = AppDataSource.getRepository(Resume);

            const user = await userRepository.findOne({
                where: { id: userId },
                relations: ['resumes']
            });

            if (!user || ['manager', 'generalManager'].includes(user.role)) {
                res.status(404).json({ message: 'Пользователь не найден' });
                return;
            }

            const newResume = resumeRepository.create(resumeData);

            newResume.user = user;

            await resumeRepository.save(newResume);

            user.resumes.push(newResume);
            await userRepository.save(user);

            res.status(201).json({ message: 'Резюме успешно создана'});
            return;
        } catch (error) {
            console.error('Ошибка при создании резюме:', error);
            res.status(500).json({ message: 'Ошибка при создании резюме' });
            return;
        }
    }

    async updateResume(req: Request, res: Response) {
        const resumeId = parseInt(req.params.resumeId);
        const updateData: Resume = req.body;
        const userId = (req as any).user.id;

        try {
            const resumeRepository = AppDataSource.getRepository(Resume);
            const userRepository = AppDataSource.getRepository(User);

            const resume = await resumeRepository.findOne({
                where: {id: resumeId},
                relations: ['user']
            });

            if (!resume) {
                res.status(404).json({ message: 'Резюме не найдена' });
                return;
            }

            const user = await userRepository.findOne({
                where: {id: userId},
                relations: ['resumes']
            });

            if ((!user || (user.id !== resume.user.id) && ['applicant'].includes(user.role))) {
                res.status(403).json({ message: 'Нет доступа к редактированию этого резюме' });
                return;
            }

            Object.assign(resume, updateData);

            await resumeRepository.save(resume);

            res.status(200).json({ message: 'Резюме успешно обновлено' });
            return;
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при обновлении резюме' });
            return;
        }
    }

    async getResumeById(req: Request, res: Response) {
        const resumeId = parseInt(req.params.resumeId);
        const userId = (req as any).user.id;

        try {
            const resumeRepository = AppDataSource.getRepository(Resume);
            const userRepository = AppDataSource.getRepository(User);

            const resume = await resumeRepository.findOne({
                where: {id: resumeId},
                relations: ['user']
            });

            if (!resume) {
                res.status(404).json({ message: 'Резюме не найдена' });
                return;
            }

            const user = await userRepository.findOneBy({id: userId});

            if ((!user || ['applicant'].includes(user.role))) {
                res.status(403).json({ message: 'Нет доступа к просмотру этого резюме' });
                return;
            }

            res.status(200).json(resume);
            return;
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при получении резюме' });
            return;
        }
    }

    async getResumeByIdForCreator(req: Request, res: Response) {
        const resumeId = parseInt(req.params.resumeId);
        const userId = (req as any).user.id;

        try {
            const resumeRepository = AppDataSource.getRepository(Resume);
            const userRepository = AppDataSource.getRepository(User);

            const resume = await resumeRepository.findOne({
                where: {id: resumeId},
                relations: ['user']
            });

            const user = await userRepository.findOne({
                where: {id: userId},
                relations: ['resumes']
            });

            if(!user || (['applicant'].includes(user.role)))

            if (!resume) {
                res.status(404).json({ message: 'Резюме не найдена' });
                return;
            }

            res.status(200).json(resume);
            return;
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при получении резюме' });
            return;
        }
    }

    async getResumes(req: Request, res: Response) {
        const userId = (req as any).user.id;

        try {
            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository.findOne({
                where: {id: userId},
                relations: ['resumes', 'resumes.submittedResumes', 'resumes.submittedResumes.company']
            });

            if (!user || ['manager', 'generalManager'].includes(user.role)) {
                res.status(403).json({ message: 'Нет доступа к просмотру резюме' });
                return;
            }

            res.status(200).json(user.resumes);
            return;
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при получении резюме' });
            return;
        }
    }


    async deleteResume(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const resumeId = parseInt(req.params.resumeId);

        try {
            const userRepository = AppDataSource.getRepository(User);
            const resumeRepository = AppDataSource.getRepository(Resume);
            const vacancyRepository = AppDataSource.getRepository(Vacancy);

            const user = await userRepository.findOne({
                where: { id: userId },
                relations: ['resumes', 'appliedVacancies', 'appliedVacancies.receivedResumes']
            });

            if (!user) {
                res.status(404).json({ message: 'Пользователь не найдена' });
                return;
            }

            const resumeToDelete = await resumeRepository.findOne({
                where: { id: resumeId},
                relations: ['user', 'submittedResumes']
            });

            if (!resumeToDelete) {
                res.status(404).json({ message: 'Резюме не найдено' });
                return;
            }

            if (resumeToDelete.submittedResumes && resumeToDelete.submittedResumes.length > 0) {
                for (const vacancy of resumeToDelete.submittedResumes) {
                    const vacancyToRemoveResumeFrom = await vacancyRepository.findOne({
                        where: { id: vacancy.id },
                        relations: ['receivedResumes', 'applicants']
                    });

                    if (vacancyToRemoveResumeFrom) {
                        vacancyToRemoveResumeFrom.receivedResumes = vacancyToRemoveResumeFrom.receivedResumes.filter(
                            (resume) => resume.id !== resumeId);

                        vacancyToRemoveResumeFrom.applicants = vacancyToRemoveResumeFrom.applicants.filter(
                            (user) => user.id !== userId);

                        await vacancyRepository.save(vacancyToRemoveResumeFrom);
                    }
                }
            }

            resumeToDelete.submittedResumes = [];
            resumeToDelete.user = null;
            await resumeRepository.save(resumeToDelete);

            user.resumes = user.resumes.filter(resume => resume.id !== resumeId);
            user.appliedVacancies = user.appliedVacancies.filter(
                (vacancy) => !vacancy.receivedResumes.some((resume) => resume.id === resumeId)
            );

            await userRepository.save(user);

            await resumeRepository.remove(resumeToDelete);

            res.status(200).json({ message: 'Резюме успешно удалено' });
            return;

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при удалении резюме' });
            return;
        }
    }
}