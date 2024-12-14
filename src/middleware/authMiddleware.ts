import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        res.status(401).json({ error: 'Нет доступа' });
        return;
    }

    try {
        const decoded = jwt.verify(token, 'fed2010')  as { userId: number };;
        (req as any).user = {id: decoded.userId};
        next();
    } catch (error) {
        res.status(401).json({ error: 'Неверный токен' });
        return;
    }
}