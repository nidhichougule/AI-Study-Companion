const express = require("express");
const multer = require("multer");
const { uploadPDF } = require("../controllers/uploadController");

const router = express.Router();

// file storage folder
const upload = multer({ dest: "uploads/" });

// ✅ THIS IS THE IMPORTANT LINE
router.post("/", upload.single("pdf"), uploadPDF);

module.exports = router;