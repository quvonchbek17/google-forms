import { verifyAccessToken } from "@middlewares"
import { AuthRouter, FormsRouter, ItemsRouter } from "@modules"

const { Router } = require("express")

const router = Router()

router.use("/auth", AuthRouter)
router.use("/forms", verifyAccessToken, FormsRouter)
router.use("/form-items", verifyAccessToken, ItemsRouter)


export default router