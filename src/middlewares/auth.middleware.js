import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
import {ApiErrors} from "../utils/apiErrors.js"
export const verifyUser = asyncHandler(async (req,res,next)=>{

    // steps to logout user 
    // get the access token from the cookies or header
    // then verify it using the jwt and by using the secret keys
    // now we have decoded token and as we know when we create the token we actully send some data along the token so from that data extract the id of the use
    // then call the database and remove the refresh token and password 
    // then add that user to the req 
    // pass the next() method to give shift the controll to the next 


    // as we use the cookie parser now we have access to the cookies on only server side because we secure them so now we know we pas the access token to the cookie so we can collect them 
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
 
     if (!token) {
         throw new ApiErrors(400,"unaturized access");
         
     }
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
     if (!decodedToken) {
         throw new ApiErrors(400,"token invalid");
     }
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
     if (!user) {
         throw new ApiErrors(400,"ivalid access token");
         
     }
     req.user = user
 
     next()
   } catch (error) {
    throw new ApiErrors(400, "something went wrong while doing logout ")
   }
})