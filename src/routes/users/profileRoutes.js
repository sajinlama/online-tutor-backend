import { changePassword, updateProfile } from "../../controllers/users/update.controller.js";
import express from "express"

const router = express.Router();

router.put("/", updateProfile);
router.post("/", changePassword);

export default router;