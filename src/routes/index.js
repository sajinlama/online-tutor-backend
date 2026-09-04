import { Router } from "express"

import authRoutes from "./auth/authRoutes.js"
import englishRoutes from "./english/englishRoutes.js"
import scienceRoutes from "./science/scienceRoute.js"
import mathRoutes from "./maths/mathsRoutes.js"
import userProfileRoutes from "./users/profileRoutes.js"
import totoalRoutes from "./totalScore/totalScore.routes.js"
import authMiddleware from "../middlewares/user.auth.js"

const router = Router()

router.use("/auth",authRoutes)
router.use("/english",authMiddleware,englishRoutes)
router.use("/science",authMiddleware,scienceRoutes)
router.use("/maths",authMiddleware,mathRoutes)
router.use("/profile",authMiddleware,userProfileRoutes)
router.use("/score",authMiddleware,totoalRoutes)


export  default router