// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import connectDB from './db/index.js'
import {app} from './app.js'
dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 6000,()=>{
        console.log(`server is running at port : ${process.env.PORT}`)
    })
    app.on("Error",(error)=>{
        console.log("Error",error)
        process.exit()
    })
})
.catch((err)=>{
    console.log("Mongo Db connection failed !!! ",err)
})
















// code for connecting data base directly from the index page
/*
import express from "express";
const app = express();
(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("Error",(error)=>{
            console.log("ERRR",error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listing on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("Error",error)
        throw error
    }
})()
*/