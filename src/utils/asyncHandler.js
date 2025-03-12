const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=> next(err))
    }
}


export {asyncHandler}



//normal function
// const asyncHandler = ()=>{}
//higher order function -> retruns function
// const asyncHandler = (func) => {()=>{}}
//or 
// const asyncHandler = (func) => ()=>{}

//try-catch method
// const asyncHandler = (fn)=> async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             messgae:error.messgae
//         })
//     }
// }