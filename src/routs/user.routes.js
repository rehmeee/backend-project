import { Router } from "express";
import { genrateTokens, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyUser } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {name : "avtar", maxCount : 1},
        {name : "coverImage", maxCount : 1}
    ])
    ,registerUser)

router.route("/login").post(loginUser) // upload.none() , now we send the form data through json so 

router.route("/logout").post(verifyUser,logoutUser)
router.route("/tokens").post(genrateTokens)
export default router