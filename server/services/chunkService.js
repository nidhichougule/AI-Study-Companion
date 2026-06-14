const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

const splitIntoChunks = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  return await splitter.splitText(text);
};

module.exports = { splitIntoChunks };