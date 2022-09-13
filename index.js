const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { readdir } = require('node:fs/promises');
var fs = require('file-system');
const mongoose = require("mongoose");
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const crypto = require('crypto');

const app = express();

app.use(express.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(cors())

// const conn=mongoose.connect(
//     "mongodb+srv://Shaad:Vinove321@quiz.gal2t.mongodb.net/users?retryWrites=true&w=majority"
  
//   ).then(console.log("connected"));


//   // init gfs 

//   let gfs;
//   mongoose.connection.once('open',function(){
//       var gfs=new Grid(conn.db,mongoose.mongo)
//       gfs.collection('uploads')

//   })

const mongoURI = 'mongodb+srv://Shaad:Vinove321@quiz.gal2t.mongodb.net/users?retryWrites=true&w=majority';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});
 // Create Storage Engine

 const storage = new GridFsStorage({
    url: "mongodb+srv://Shaad:Vinove321@quiz.gal2t.mongodb.net/users?retryWrites=true&w=majority",
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });


const newUploads = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "uploads")
            console.log(req)
        },
        filename: function (req, file, cb) {
            // fs.exists("uploads" + file.originalname, function(exists) {
            //   let uploadedFileName;
            //   if (exists) {
            //      console.log("already exist")
            //   } else {
            //       uploadedFileName = file.originalname;
            //   } 
            //   cb(null, uploadedFileName)
            // });

            if (fs.existsSync(path.join("uploads", file.originalname))) {
                req.fileValidationError = "You cant upload this since its already uploaded";
                // console.log(req.fileValidationError)
                cb(null, req.fileValidationError);
            } else {
                cb(null, file.originalname)
            }
            // cb(null,file.originalname)
        }
    })
}).single("user_file")

// const upload = multer({ storage });



app.post('/upload', storage, async (req, res) => {
    if (req.fileValidationError) {
        res.send(req.fileValidationError)
    }
    else {
        res.json({file:req.file})
        res.send('uploaded file')
    }
})


// app.post("/patientEntry", async (req, res) => {
//     console.log(req.body, " hi");
//   const patient = new PatientModel({ patientName: req.body.patientName, price: req.body.price });
//   try {
//     await patient.save();
//   } catch (err) {
//     console.log(err);
//   }
//   res.send("data");
// });

// app.get("/patientRecords",(req,res)=>{
//   PatientModel.find({},(err,result)=>{
//     console.log(result);
//    if(err)
//    res.send(err)
//    else
//    res.json(result)
//   })
// })


app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

const port = 4001;
app.listen(port, () => {
    console.log(`Server running on ${port} `);
});