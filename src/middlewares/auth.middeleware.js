import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";



export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401,"Unautorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
    
            throw new ApiError(401,"Invalid access token")
        }
        //Once we verify the token and fetch the user from the database, we need to make this user information available for the next middleware or route handler.
        //By attaching it to req, it stays available throughout the request-response cycle.
        //Any subsequent middleware or route handler can simply access req.user instead of fetching the user again from the database
        req.user = user;
        /*
              ✅ Use req.user to store user data because it persists throughout the request cycle.
             ❌ Avoid res.user because res is for sending responses, not storing request-related data.
        */
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }

})
