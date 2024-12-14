import {Router} from "express";
import {CompanyController} from "../controller/сompanyController";
import {authMiddleware} from "../middleware/authMiddleware";
import {AvatarCompanyController, upload} from "../controller/avatarCompanyController";
import {ManagerCompanyController} from "../controller/managerCompanyController";

const router = Router();
const companyController: CompanyController= new CompanyController();
const {uploadCompanyProfile}: AvatarCompanyController = new AvatarCompanyController();
const {getManager, assignManager, deleteManager}: ManagerCompanyController = new ManagerCompanyController();

router.put("/edit/:companyId", authMiddleware, companyController.updateProfile);
router.get("/get-company/:companyId", authMiddleware, companyController.getCompanyById)
router.get("/get-company-id", authMiddleware, companyController.getCompanyId)
router.post("/create", authMiddleware, companyController.createCompany);
router.post('/upload/:companyId', authMiddleware, upload.single('avatar'), uploadCompanyProfile);
router.get('/managers/:companyId', authMiddleware, getManager);
router.put('/managers/add/:companyId', authMiddleware, assignManager);
router.delete('/managers/:managerId/delete/:companyId', authMiddleware, deleteManager);

export default router;