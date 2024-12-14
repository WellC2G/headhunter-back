import {Request, Response} from "express";
import {AppDataSource} from "../data-source";
import {Company} from "../entity/Company";
import {role ,User} from "../entity/User";


export class ManagerCompanyController {
    async getManager(req:Request, res:Response) {
        const companyId = parseInt(req.params.companyId);

        try {
            const companyRepository = AppDataSource.getRepository(Company);

            const company = await companyRepository.findOne({
                where: { id: companyId },
                relations: ['managers']
            });

            if (!company) {
                res.status(404).json({message: 'Компания не найдена'})
            }

            res.status(200).json({ message: 'Менеджеры успешно получены',
            managers: company.managers,
            });

            return;
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при назначении менеджеров' });
            return;
        }
    }

    async assignManager(req:Request, res:Response) {
        const companyId = parseInt(req.params.companyId);
        const userId = (req as any).user.id;

        try {
            const companyRepository = AppDataSource.getRepository(Company);
            const userRepository = AppDataSource.getRepository(User);

            const company = await companyRepository.findOne({
                where: { id: companyId },
                relations: ['managers']
            });

            if (!company) {
                res.status(404).json({message: 'Компания не найдена'})
                return;
            }

            const managerToAdd = await userRepository.findOne({
                where: { id: userId },
                relations: ['manager']
            });

            if (!managerToAdd) {
                res.status(404).json({ message: 'Пользователь не найден' });
                return;
            }

            if(managerToAdd.manager !== null && managerToAdd.manager !== undefined) {
                res.status(201).json({ message: 'Пользователь уже является менеджером' });
                return;
            }

            company.managers.push(managerToAdd);
            managerToAdd.manager = company;
            managerToAdd.role = "manager" as role;

            await userRepository.save(managerToAdd);
            await companyRepository.save(company);

            res.status(200).json({ message: 'Менеджеры успешно назначены', companyId: company.id });
            return;
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при назначении менеджеров' });
            return;
        }
    }
    async deleteManager(req:Request, res:Response):Promise<void> {
        const companyId = parseInt(req.params.companyId);
        const userId = parseInt(req.params.managerId);

        try {
            const companyRepository = AppDataSource.getRepository(Company);
            const userRepository = AppDataSource.getRepository(User);

            const company = await companyRepository.findOne({
                where: { id: companyId },
                relations: ['managers']
            });

            if (!company) {
                res.status(404).json({ message: 'Компания не найдена' });
                return;
            }

            const managerToDelete = await userRepository.findOneBy({ id: userId });

            if (!managerToDelete) {
                res.status(404).json({ message: 'Пользователь не найден' });
                return;
            }

            company.managers = company.managers.filter(manager => manager.id !== userId);
            managerToDelete.manager = undefined;
            managerToDelete.role = "applicant" as role;

            await userRepository.save(managerToDelete);
            await companyRepository.save(company);

            res.status(200).json({ message: 'Менеджер успешно удален' });
            return;

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при удалении менеджера' });
            return;
        }
    }
}