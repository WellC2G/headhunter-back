import {Router} from "express";
import {authMiddleware} from "../middleware/authMiddleware";
import {CheckAuthController} from "../controller/checkAuthController";

const router = Router();
const {getUserById}: CheckAuthController= new CheckAuthController();

router.get("/check-auth", authMiddleware, getUserById);


export default router;