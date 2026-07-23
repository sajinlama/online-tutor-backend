import express from "express"
import userLogout from "../../controllers/users/logoutController.js";
const router = express.Router();


router.post("/", userLogout);

export default router;