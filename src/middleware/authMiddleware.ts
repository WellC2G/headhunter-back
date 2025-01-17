import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from "express";
import {Socket} from "socket.io";

export class Auth {
    userId: number | null;
    companyId: string | null;
}

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

export const authSocket = (socket: Socket) => {
    const token = socket.handshake.auth.Authorization?.replace('Bearer ', '');
    const companyId = socket.handshake.query.companyId;
    let companyIdString: string | undefined;

    if (Array.isArray(companyId)) {
        companyIdString = companyId[0];
    } else {
        companyIdString = companyId;
    }

    const auth = new Auth();

    try {
        if (!companyId || companyId !== "null") {
            auth.companyId = companyIdString;
        }

        const decoded = jwt.verify(token, 'fed2010') as { userId: number };

        auth.userId = decoded.userId;

        return auth;
    } catch (error) {
        socket.disconnect();
        return;
    }
}