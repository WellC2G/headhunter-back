import express from 'express';
import {ResumeController} from "../controller/resumeController";
import {authMiddleware} from "../middleware/authMiddleware";

const router = express.Router();
const resumeController = new ResumeController();

router.post('/create', authMiddleware, resumeController.createResume);
router.put('/edit/:resumeId', authMiddleware, resumeController.updateResume);
router.get('/:resumeId', authMiddleware, resumeController.getResumeById);
router.get('/info/:resumeId', resumeController.getResumeByIdNotAuth);
router.get('/list/resumes', authMiddleware, resumeController.getResumes);
router.delete('/:resumeId/delete', authMiddleware, resumeController.deleteResume);

export default router;