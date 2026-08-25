const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadPDF } = require("../controllers/uploadController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + (file.originalname || "document.pdf"));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post(
  "/pdf",
  auth,
  (req, res, next) => {
    upload.single("pdf")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message || "PDF upload failed." });
      }
      next();
    });
  },
  uploadPDF
);

module.exports = router;