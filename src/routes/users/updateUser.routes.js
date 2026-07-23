import express from "express";
import { changePassword } from "../../controllers/users/update.controller.js";


const router = express.Router();

router.post("/", changePassword);

export default router;