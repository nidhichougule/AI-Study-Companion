
const express = require("express");
const router = express.Router();
console.log("retrievalRoutes loaded");
const {
  searchChunks,
} = require("../controllers/retrievalController");

router.get("/test", (req, res) => {
  res.json({
    message: "Retrieval route working",
  });
});

router.post("/search", searchChunks);

module.exports = router;