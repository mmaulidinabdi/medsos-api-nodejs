import multer from "multer";
import path from "path";

// penyimpanan sementara di memory ram
const storage = multer.memoryStorage();

const fileFilter = (req,file,cb)=>{
    const ext = path.extname(file.originalname).toLowerCase();

    if(ext !== ".jpg" && ext !== "/jpeg" && ext !== ".png"){
        return cb(new Error("Hanya menerima file dengan ekstensi .jpg .jpeg .png"));
    }
     cb(null,true);
};

const upload = multer({storage,fileFilter});

export default upload;
