
import express from "express";
import verifyAuth from "../controllers/authController.js";

const router = express.Router();

router.get("/",verifyAuth);

export default router;