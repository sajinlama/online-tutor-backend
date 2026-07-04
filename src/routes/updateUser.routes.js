import express from "express";
import { changePassword } from "../controllers/update.controller.js";


const router = express.Router();

router.post("/", changePassword);

export default router;