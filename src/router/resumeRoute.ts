import express from 'express';
import {ResumeController} from "../controller/resumeController";
import {authMiddleware} from "../middleware/authMiddleware";

const router = express.Router();
const resumeController = new ResumeController();

router.post('/create', authMiddleware, resumeController.createResume);
router.post('/edit', authMiddleware, resumeController.updateResume);

export default router;