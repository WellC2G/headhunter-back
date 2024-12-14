import {Request, Response} from "express";
import {AuthService} from "../service/authService";

const authService = new AuthService();

export const register = async (req: Request, res: Response)  => {
    try {
        const {email, password, firstName, lastName} = req.body;
        const token = await authService.register(email, password, firstName, lastName);
        res.json({token});
    } catch (error) {
        if (error.message === "Пользователь с таким email уже существует") {
            res.status(409).json({ error: error.message });
            return;
        }
        res.status(400).json({error: error.message});
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        const token = await authService.login(email, password);
        res.json({token});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};