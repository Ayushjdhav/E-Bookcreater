const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// CHECK File type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Error: Images Only! (jpeg, jpg, png, gif)"));
    }
}

// Initial upload configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// Wrapper middleware to catch Multer errors gracefully (like file size limit exceeded)
const uploadMiddleware = (fieldName) => {
    return (req, res, next) => {
        const uploadSingle = upload.single(fieldName);

        uploadSingle(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading (e.g. file size too large)
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ message: "File is too large. Max limit is 2MB." });
                }
                return res.status(400).json({ message: err.message });
            } else if (err) {
                // An unknown error occurred (e.g. our custom checkFileType error)
                return res.status(400).json({ message: err.message });
            }
            // Everything went smoothly, proceed to controller
            next();
        });
    };
};

module.exports = uploadMiddleware;