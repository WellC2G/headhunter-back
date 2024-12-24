import {Request, Response} from "express";
import {AppDataSource} from "../data-source";
import {User} from "../entity/User";
import {Resume} from "../entity/Resume";
import {Vacancy} from "../entity/Vacancy";

export class ResponseToVacancyController {
    async createResponseToVacancy(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const resumeId = parseInt(req.params.resumeId);
        const vacancyId = parseInt(req.params.vacancyId);

        try {
            const userRepository = AppDataSource.getRepository(User);
            const resumeRepository = AppDataSource.getRepository(Resume);
            const vacancyRepository = AppDataSource.getRepository(Vacancy);

            const user = await userRepository.findOne({
                where: { id: userId },
                relations: ['appliedVacancies']
            });

            if (!user) {
                res.status(404).json({ message: 'Пользователь не найден' });
                return;
            }

            const resume = await resumeRepository.findOne({
                where: { id: resumeId },
                relations: ['submittedResumes']
            });

            if (!resume) {
                res.status(404).json({ message: 'Резюме не найдена' });
                return;
            }

            const vacancy = await vacancyRepository.findOne({
                where: { id: vacancyId },
                relations: ['receivedResumes', 'applicants']
            });

            if (!vacancy) {
                res.status(404).json({ message: 'Вакансия не найдена не найдена' });
                return;
            }

            user.appliedVacancies.push(vacancy);

            resume.submittedResumes.push(vacancy);

            vacancy.receivedResumes.push(resume);
            vacancy.applicants.push(user);

            await userRepository.save(user);
            await resumeRepository.save(resume);
            await vacancyRepository.save(vacancy);

            res.status(200).json({message: "Пользователь успешно откликнулся на вакансию"});
            return;

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при создании связи' });
            return;
        }
    }

    async deleteResponseToVacancy(req: Request, res: Response) {
        const userId = (req as any).user.id;
        const resumeId = parseInt(req.params.resumeId);
        const vacancyId = parseInt(req.params.vacancyId);

        try {
            const userRepository = AppDataSource.getRepository(User);
            const resumeRepository = AppDataSource.getRepository(Resume);
            const vacancyRepository = AppDataSource.getRepository(Vacancy);

            const user = await userRepository.findOneBy({id: userId})

            if ((!user || ['applicant'].includes(user.role))) {
                res.status(404).json({ message: 'Пользователь не найден или не является мендежером' });
                return;
            }

            const resume = await resumeRepository.findOne({
                where: { id: resumeId },
                relations: ['submittedResumes', 'user']
            });

            if (!resume) {
                res.status(404).json({ message: 'Резюме не найдена' });
                return;
            }

            const vacancy = await vacancyRepository.findOne({
                where: { id: vacancyId },
                relations: ['receivedResumes', 'applicants']
            });

            if (!vacancy) {
                res.status(404).json({ message: 'Вакансия не найдена не найдена' });
                return;
            }

            const creatorUserId = resume.user.id;

            const creatorUser = await userRepository.findOne({
                where: { id: creatorUserId },
                relations: ['appliedVacancies']
            });

            if (!creatorUser) {
                res.status(404).json({ message: 'Пользователь-создатель резюме не найден' });
                return;
            }

            const userVacancyIndex = creatorUser.appliedVacancies.findIndex(v => v.id === vacancy.id);
            if (userVacancyIndex === -1) {
                res.status(404).json({ message: 'Связь между пользователем и вакансией не найдена' });
                return;
            }
            creatorUser.appliedVacancies.splice(userVacancyIndex, 1);

            const resumeVacancyIndex = resume.submittedResumes.findIndex(v => v.id === vacancy.id);
            if (resumeVacancyIndex === -1) {
                res.status(404).json({ message: 'Связь между резюме и вакансией не найдена' });
                return;
            }
            resume.submittedResumes.splice(resumeVacancyIndex, 1);

            const vacancyResumeIndex = vacancy.receivedResumes.findIndex(r => r.id === resume.id);
            if (vacancyResumeIndex === -1) {
                res.status(404).json({ message: 'Связь между вакансией и резюме не найдена' });
                return;
            }
            vacancy.receivedResumes.splice(vacancyResumeIndex, 1);

            const vacancyUserIndex = vacancy.applicants.findIndex(u => u.id === creatorUser.id);
            if (vacancyUserIndex === -1) {
                res.status(404).json({ message: 'Связь между вакансией и пользователем не найдена' });
                return;
            }
            vacancy.applicants.splice(vacancyUserIndex, 1);

            await userRepository.save(user);
            await resumeRepository.save(resume);
            await vacancyRepository.save(vacancy);

            res.status(200).json({message: "Связь успешно удалена"});
            return;

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при удалении связи' });
            return;
        }
    }
}