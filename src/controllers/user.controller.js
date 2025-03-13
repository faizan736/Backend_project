import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary}  from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

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


export {registerUser}