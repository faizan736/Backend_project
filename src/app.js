import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))

//app.use used for the middlewares
//means we allowing data that comes from json
app.use(express.json({limit:"16kb"}))
//means we allowing data that comes from url
app.use(express.urlencoded({extended:true,limit:"16kb"}))
//tells the Express.js server to serve static files (like HTML, CSS, images, etc.) from the "public" directory.
app.use(express.static("public"))


app.use(cookieParser())


//routes importes
import userRouter from "./routes/user.routes.js"


//routes declaration
app.use("/api/v1/users",userRouter)
//this is a middleware (so we used app.use )that redirects into the routes page 
//https://localhost:8000//api/v1/user/register 
//https://localhost:8000//api/v1/user/login 


export {app}