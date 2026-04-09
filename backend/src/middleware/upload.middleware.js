const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} = require("../config/serverConfig");

cloudinary.config({
    cloud_name : CLOUDINARY_CLOUD_NAME,
    api_key : CLOUDINARY_API_KEY,
    api_secret : CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits:{ fileSize : 5 * 1024 * 1024 },
    fileFilter: (req,file,cb)=>{
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if(allowed.includes(file.mimetype)){
            cb(null,true);
        } else {
            cb(new Error("Only jpg, png and webp images are allowed"),false);
        }
    },
});

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "unitrade",
                transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        Readable.from(buffer).pipe(stream);
    });
};

module.exports = {upload, uploadToCloudinary};