import { updateProfile } from "../controllers/update.controller.js";
import express from "express"

const router = express.Router();

router.put("/", updateProfile);

export default router;