import express from 'express';
import {authMiddleware} from "../middleware/authMiddleware";
import {ResponseToVacancyController} from "../controller/responseToVacancyController";

const router = express.Router();
const responseToVacancyController = new ResponseToVacancyController();

router.put('/:resumeId/create/:vacancyId', authMiddleware, responseToVacancyController.createResponseToVacancy);
router.delete('/:resumeId/delete/:vacancyId', authMiddleware, responseToVacancyController.deleteResponseToVacancy);

export default router;