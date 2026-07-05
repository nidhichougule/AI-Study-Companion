const express = require("express");
const multer = require("multer");
const { uploadPDF } = require("../controllers/uploadController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/pdf", auth, upload.single("pdf"), uploadPDF);

module.exports = router;