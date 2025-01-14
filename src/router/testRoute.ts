import express, {Request, Response} from "express";
import {authMiddleware} from "../middleware/authMiddleware";
import {User} from "../entity/User";
import {AppDataSource} from "../data-source";

const router = express();

router.get("/user", authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    try {
        const userRepo = AppDataSource.getRepository(User);

        const user = await userRepo.findOne({
            where: {id: userId},
            relations: ['resumes', 'resumes.submittedResumes', 'appliedVacancies']
        });

        res.json(user);

    } catch (err) {
        res.status(500).json({ message: 'Ошибкa' });
    }
});

export default router;