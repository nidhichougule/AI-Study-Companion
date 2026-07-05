
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  searchChunks,
} = require("../controllers/retrievalController");

router.get("/test", (req, res) => {
  res.json({
    message: "Retrieval route working",
  });
});

router.post("/search", auth, searchChunks);

module.exports = router;