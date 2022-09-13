const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const app = express();
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
const mongoURI = "mongodb+srv://affan:123@cluster0.lprma.mongodb.net/postDB?retryWrites=true&w=majority";
const conn = mongoose.createConnection(mongoURI);
let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("Personal");
});

conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("Office");
});

const storage = new GridFsStorage({
    url: mongoURI,
    file: function (req, file) {
        console.log(req.body.typeOfFile);
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const fileInfo = {
                    filename: file.originalname,
                    bucketName: req.body.typeOfFile,
                };
                resolve(fileInfo);

            });
        });
    },
});

const upload = multer({

    fileFilter: function (req, file, cb) {
        // console.log(req.body.);
        gfs.files.find({ filename: file.originalname })
            .toArray((err, files) => {
                if (files.length != 0) {
                    req.fileValidationError = "You cant upload this since its already uploaded";
                    cb(null, false, req.fileValidationError);
                } else {
                   
                    cb(null, true,req.body.typeOfFile);
                }
            })
      
    }, storage
});

app.post("/upload", upload.single("file"), (req, res) => {

    if (req.fileValidationError) {
        res.send(req.fileValidationError)
    }
    else
        res.send("File uploaded successfully");
}
);
const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
