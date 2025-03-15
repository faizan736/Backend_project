import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary}  from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
       const refreshToken=  user.generateRefreshToken()
       const accessToken = user.generateAccessToken()

       user.refreshToken = refreshToken
       await user.save({validateBeforeSave:false})

       return {accessToken,refreshToken}


    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh or access token")
    }
}

const registerUser = asyncHandler(async  (req,res)=>{
    // res.status(200).json({
    //     message:"Changes made successfully"
    // })

    //steps
    //get user details from frontend -> we send through postman
    //validation ->not empty
    //check if user already exists : using username or email 
    //check for images,check for avatar
    //upload them to cloudinary , avatar 
    //create user object - create entry in db 
    //remove password and refresh token field from response
    //check for user creation
    //return res



    const {fullname,email,username,password} = req.body //this data we send through postman for now
    // console.log(fullname,email,passowrd);


    // if(fullname === ""){
    //     throw new ApiError(400,"full name is required")
    // }
    if(
        [fullname,email,username,password].some((field)=>
        field?.trim() === "") //trim() method in JavaScript removes any extra spaces
    ){
        throw new ApiError(400,"All fields are required")
    }


    const existedUser = await User.findOne({
        $or: [{username},{email}] //his means it is checking if either:A document exists where username matches the provided value. OR a document exists where email matches the provided value.
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exist")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath ;
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length> 0){
        coverImageLocalPath = req.files?.coverImage[0].path
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar files is required")
    }


   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   if(!avatar){
    throw new ApiError(400,"Avatar files is required")
   }


   const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase(),
   })
   const createdUSer = await User.findById(user._id).select(
    "-password -refreshToken" // we r not taking this feilds this are exclued 
   )


   if(!createdUSer){
        throw new ApiError(500,"Something went wrong while registering the user")
   }


   return res.status(201).json(
        new ApiResponse(200,createdUSer,"User registered successfully")
   )









})


const loginUser = asyncHandler(async(req,res)=>{
    //req body ->data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookies


    const {username,email,password} = req.body;

    if(!username && !email){
        throw new ApiError(400,"Username or email required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User doesnot exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password")
    }

    const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id)

    //when user found above, it automatically created garbage refrsh token(beacuse we defined in model) so after we create refreshtoken  separetely we store in loggedInuser and remobe the password and garbage refreshToken
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   //means only backend people can edit tokens 
   const options = {
        httpOnly:true,
        secure:true
   }

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in succesfully"
        )
   )





})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly:true,
        secure:true
   }

   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"user loggod out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
   if(incomingRefreshToken){
    throw new ApiError(401,"Unautorized request")
   }

   try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     const user = await User.findById(decodedToken?._id)
 
    if(!user){
     throw new ApiError(401,"Invalid refresh token")
    }
 
    if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(401,"refresh token is used or expired")
    }
 
    const options ={
     httpOnly:true,
     secure :true
    }
 
     const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
 
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
     new ApiResponse(
         200,
         {accessToken,refreshToken:newRefreshToken},
         "Access Token refreshed"
     )
    )
   } catch (error) {
        throw new ApiError(401,error?.message||"Invalid refresh token")
   }

})
export {registerUser,loginUser,logoutUser,refreshAccessToken}