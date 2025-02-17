import express from 'express';
import {VacancyController} from '../controller/vacancyController'
import {authMiddleware} from "../middleware/authMiddleware";

const router = express.Router();
const vacancyController = new VacancyController();

router.post('/create/:companyId', authMiddleware, vacancyController.createVacancy);
router.put('/edit/:vacancyId', authMiddleware, vacancyController.updateVacancy);
router.get('/:vacancyId', authMiddleware, vacancyController.getVacancyById);
router.get('/info/:vacancyId', vacancyController.getVacancyByIdNotAuth);
router.get('/vacancies/:companyId', authMiddleware, vacancyController.getVacanciesById);
router.get('/resumes/:companyId', authMiddleware, vacancyController.getVacanciesAndResumesById);
router.delete('/:vacancyId/delete/:companyId', authMiddleware, vacancyController.deleteVacancy);
router.get('/home/search', vacancyController.searchVacancies);
router.get('/home/user-vacancies', authMiddleware, vacancyController.getUserVacancies);

export default router;