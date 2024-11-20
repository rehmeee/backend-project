import { Router } from "express";
import { genrateTokens, loginUser, logoutUser, registerUser, updateAvtar } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyUser } from "../middlewares/auth.middleware.js";
const router = Router()

// register or signup the user 
router.route("/register").post(
    upload.fields([
        {name : "avtar", maxCount : 1},
        {name : "coverImage", maxCount : 1}
    ])
    ,registerUser)

// login the user 
router.route("/login").post(loginUser) // upload.none() , now we send the form data through json so 

// logout the user 
router.route("/logout").post(verifyUser,logoutUser);

// to genrate the access token 
router.route("/tokens").post(genrateTokens)

// to update the user avtar 
// here is somethig that is more important tha here we know user send a file and also we chck the user so we have to use the two middlewares first we use multer and then we use the authuntication

router.route("/updateAvtar").post(upload.single("avtar"),verifyUser, updateAvtar)
export default router