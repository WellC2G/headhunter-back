import { Request, Response } from 'express';
import {AppDataSource} from '../data-source'
import {Company} from "../entity/Company";
import {role, User} from "../entity/User";

export class CompanyController {
    async createCompany(req: Request, res: Response): Promise<void> {
        const companyData: Company = req.body;
        const userId = (req as any).user.id;

        try {
            const companyRepository = AppDataSource.getRepository(Company);
            const userRepository = AppDataSource.getRepository(User);

            const newCompany: Company = companyRepository.create(companyData);

            const user = await userRepository.findOneBy({id: userId});

            if (!user) {
                res.status(404).json({message: 'Пользователь не найден'});
                return;
            }

            newCompany.managers = [user];
            user.role = 'generalManager' as role;
            user.manager = newCompany;

            await companyRepository.save(newCompany);
            await userRepository.save(user);

            res.status(201).json({message: 'Компания успешно создана', companyId: newCompany.id});
            return;
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Ошибка при создании компании'});
            return;
        }
    }

    async updateProfile(req: Request, res: Response): Promise<void> {
        const companyId = parseInt(req.params.companyId);
        const updateData = req.body;

        try {
            const companyRepository = AppDataSource.getRepository(Company);
            const company = await companyRepository.findOneBy({id: companyId});

            if (!company) {
                res.status(404).json({message: 'Компания не найдена'});
                return;
            }

            Object.assign(company, updateData);
            await companyRepository.save(company);

            res.status(200).json({message: 'Профиль успешно обновлен'});
            return;
        } catch (error) {
            res.status(500).json({message: 'Ошибка при изменении профиля'});
            return;
        }
    }

    async getCompanyId(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user.id;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const companyRepository = AppDataSource.getRepository(Company);
            const user = await userRepository.findOne({
                where: {id: userId},
                relations: ['manager']
            });

            if (user.manager) {
                const company = await companyRepository.findOneBy({id: user.manager.id});
                res.status(200).json({
                    companyId: company.id,
                });
                return;
            }
            res.status(404).json({message: 'У пользователя нет компании'});
            return;
        } catch (error) {
            res.status(500).json({message: 'Ошибка при получении компании'});
            console.error(error);
            return;
        }
    }

    async getCompanyById(req: Request, res: Response): Promise<void> {
        const companyId = parseInt(req.params.companyId);
        const userId = (req as any).user.id;

        try {
            const userRepository = AppDataSource.getRepository(User);
            const companyRepository = AppDataSource.getRepository(Company);
            const user = await userRepository.findOne({
                where: {id: userId},
                relations: ['manager']
            });
            const company = await companyRepository.findOneBy({id: companyId});
            const avatarUrl = req.protocol + '://' + req.get('host') + '/' + company.avatar;

            if (user.manager.id != companyId) {
                res.status(403).json({message: 'Пользователь не принадлежит компании'});
            }

            if (!company) {
                res.status(404).json({message: 'Компания не найден'});
                return;
            }
            res.status(200).json({
                name: company.name,
                description: company.description,
                avatar: avatarUrl
            });

            return;
        } catch (error) {
            res.status(500).json({message: 'Ошибка при получении компании'});
            console.error(error);
            return;
        }
    }
}