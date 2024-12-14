import {Router} from "express";
import {EditUserController} from "../controller/editUserController";
import {authMiddleware} from "../middleware/authMiddleware";
import {AvatarUserController, upload} from "../controller/avatarUserController";

const router = Router();
const {updateProfile}: EditUserController = new EditUserController();
const {uploadUserProfile}: AvatarUserController = new AvatarUserController();

router.put("/profile", authMiddleware, updateProfile);
router.post('/upload', authMiddleware, upload.single('avatar'), uploadUserProfile);

export default router;