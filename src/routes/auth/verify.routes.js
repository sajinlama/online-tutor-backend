
import express from "express";
import verifyAuth from "../../controllers/auth/authController.js";

const router = express.Router();

router.get("/",verifyAuth);

export default router;