import {Request, Response} from 'express';
import { AppDataSource} from "../data-source";
import { Vacancy} from "../entity/Vacancy";
import { User} from "../entity/User";
import {Company} from "../entity/Company";
import {ILike} from "typeorm";

export class VacancyController {
    async createVacancy(req: Request, res: Response) {
        const vacancyData: Vacancy = req.body;
        const userId = (req as any).user.id;
        const companyId = parseInt(req.params.companyId);

        try {
            const userRepository = AppDataSource.getRepository(User);
            const vacancyRepository = AppDataSource.getRepository(Vacancy);
            const companyRepository = AppDataSource.getRepository(Company);

            const user = await userRepository.findOne({
                where: { id: userId },
                relations: ['manager']
            });

            if (!user) {
                res.status(404).json({ message: 'Менеджер не найден' });
                return;
            }

            if(user.manager.id !== companyId && ['manager', 'generalManager'].includes(user.role)){
                res.status(403).json({ message: 'Менеджер не принадлежит к этой компании' });
                return;
            }

            const company = await companyRepository.findOne({
                where: { id: companyId },
                relations: ['vacancies']
            });

            if (!company) {
                res.status(404).json({ message: 'Компания не найдена' });
                return;
            }
            const newVacancy = vacancyRepository.create(vacancyData);

            newVacancy.company = company;

            await vacancyRepository.save(newVacancy);

            company.vacancies.push(newVacancy);
            await companyRepository.save(company);

            res.status(201).json({ message: 'Вакансия успешно создана'});
            return;
        } catch (error) {
            console.error('Ошибка при создании вакансии:', error);
            res.status(500).json({ message: 'Ошибка при создании вакансии' });
            return;
        }
    }

    async updateVacancy(req: Request, res: Response) {
        const vacancyId = parseInt(req.params.vacancyId);
        const updateData: Vacancy = req.body;
        const userId = (req as any).user.id;

        try {
            const vacancyRepository = AppDataSource.getRepository(Vacancy);
            const userRepository = AppDataSource.getRepository(User);

            const vacancy = await vacancyRepository.findOne({
                where: {id: vacancyId},
                relations: ['company']
            });

            if (!vacancy) {
                res.status(404).json({ message: 'Вакансия не найдена' });
                return;
            }

            const user = await userRepository.findOne({
                where: {id: userId},
                relations: ['manager']
            });

            if ((!user || (user.manager.id !== vacancy.company.id) && ['manager', 'generalManager'].includes(user.role))) {
                res.status(403).json({ message: 'Нет доступа к редактированию этой вакансии' });
                return;
            }

            Object.assign(vacancy, updateData);
            await vacancyRepository.save(vacancy);

            res.status(200).json({ message: 'Вакансия успешно обновлена' });
            return;
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при обновлении вакансии' });
            return;
        }
    }
    async getVacancyById(req: Request, res: Response) {
        const vacancyId = parseInt(req.params.vacancyId);
        const userId = (req as any).user.id;

        try {
            const vacancyRepository = AppDataSource.getRepository(Vacancy);
            const userRepository = AppDataSource.getRepository(User);

            const vacancy = await vacancyRepository.findOne({
                where: {id: vacancyId},
                relations: ['company']
            });

            if (!vacancy) {
                res.status(404).json({ message: 'Вакансия не найдена' });
                return;
            }

            const user = await userRepository.findOne({
                where: {id: userId},
                relations: ['manager']
            });

            if ((!user || (user.manager.id !== vacancy.company.id) && ['manager', 'generalManager'].includes(user.role))) {
                res.status(403).json({ message: 'Нет доступа к редактированию этой вакансии' });
                return;
            }

            res.status(200).json(vacancy);
            return;
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при получении вакансии' });
            return;
        }
    }

    async getVacancyByIdNotAuth(req: Request, res: Response) {
        const vacancyId = parseInt(req.params.vacancyId);

        try {
            const vacancyRepository = AppDataSource.getRepository(Vacancy);

            const vacancy = await vacancyRepository.findOne({
                where: {id: vacancyId},
                relations: ['company']
            });

            if (!vacancy) {
                res.status(404).json({ message: 'Вакансия не найдена' });
                return;
            }

            res.status(200).json(vacancy);
            return;
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при получении вакансии' });
            return;
        }
    }
    async getVacanciesById(req: Request, res: Response) {
        const companyId = parseInt(req.params.companyId);
        const userId = (req as any).user.id;

        try {
            const companyRepository = AppDataSource.getRepository(Company);
            const userRepository = AppDataSource.getRepository(User);

            const company = await companyRepository.findOne({
                where: {id: companyId},
                relations: ['vacancies']
            });

            if (!company) {
                res.status(404).json({ message: 'Компания не найдена' });
                return;
            }

            const user = await userRepository.findOne({
                where: {id: userId},
                relations: ['manager']
            });

            if ((!user || (user.manager.id !== company.id) && ['manager', 'generalManager'].includes(user.role))) {
                res.status(403).json({ message: 'Нет доступа к редактированию этой вакансии' });
                return;
            }

            res.status(200).json(company.vacancies);
            return;
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при получении вакансий' });
            return;
        }
    }

    async searchVacancies(req: Request, res: Response) {
        const title = req.query.title as string;

        try {
            const vacancyRepository = AppDataSource.getRepository(Vacancy);
            let vacancies;

            if (title) {
                vacancies = await vacancyRepository.find({
                    where: {title: ILike(`%${title}%`)},
                    relations: ['company']
                })
            } else {
                vacancies = await vacancyRepository.find()
            }

            res.status(200).json(vacancies);

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при получении вакансий' });
            return;
        }
    }

    async deleteVacancy(req: Request, res: Response) {
        const companyId = parseInt(req.params.companyId);
        const vacancyId = parseInt(req.params.vacancyId);

        try {
            const companyRepository = AppDataSource.getRepository(Company);
            const vacancyRepository = AppDataSource.getRepository(Vacancy);

            const company = await companyRepository.findOne({
                where: { id: companyId },
                relations: ['vacancies']
            });

            if (!company) {
                res.status(404).json({ message: 'Компания не найдена' });
                return;
            }

            const vacancyToDelete = await vacancyRepository.findOne({
                where: { id: vacancyId},
                relations: ['company', 'applicants']
            });

            if (!vacancyToDelete) {
                res.status(404).json({ message: 'Вакансия не найдена' });
                return;
            }

            vacancyToDelete.applicants = [];
            vacancyToDelete.company = null;
            await vacancyRepository.save(vacancyToDelete);

            company.vacancies = company.vacancies.filter(vacancy => vacancy.id !== vacancyId);
            await companyRepository.save(company);

            await vacancyRepository.remove(vacancyToDelete);

            res.status(200).json({ message: 'Вакансия успешно удалена' });
            return;

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при удалении вакансии' });
            return;
        }
    }
}