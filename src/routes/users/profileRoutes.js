import { changePassword, updateProfile } from "../../controllers/users/update.controller.js";
import express from "express"

const router = express.Router();

router.put("/update-profile", updateProfile);
router.put("/update-password", changePassword);

export default router;