const Chunk = require("../models/Chunk");

const searchChunks = async (req, res) => {
  try {
    const { keyword } = req.body;

    const results = await Chunk.find({
      content: {
        $regex: keyword,
        $options: "i",
      },
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { searchChunks };