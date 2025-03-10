import multer from "multer";
// Multer, a middleware used in Node.js for handling file uploads.


//multer.diskStorage() defines how and where the uploaded files should be stored.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
 export  const upload = multer({ storage: storage })

 /*

 a. destination Function:

Determines the folder where files will be saved.
In this case, files will be stored in the ./public/temp folder.
cb is a callback function that tells Multer where to save the file. The null means no error occurred.
b. filename Function:

Determines the name of the saved file.
file.originalname ensures the file keeps its original name
 */