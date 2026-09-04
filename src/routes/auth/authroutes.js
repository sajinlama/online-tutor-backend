import { Router } from "express";
import verifyAuth from "../../controllers/auth/authController.js";
import userLogout from "../../controllers/users/logoutController.js";
import userLogin from "../../controllers/users/userLogin.controllers.js";
import register from "../../controllers/users/register.controllers.js";
import authMiddleware from "../../middlewares/user.auth.js";

const router = Router()

  router.post("/logout", authMiddleware, userLogout);
  router.get("/verify",verifyAuth);
  router.post("/login",userLogin);
  router.post("/register",register)
  
export default router