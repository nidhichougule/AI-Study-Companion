const PAGE_BREAK_REGEX = /\f/g;
const SENTENCE_SPLIT_REGEX = /(?<=[.!?])\s+(?=[A-Z0-9"'])/g;

const normalizeWhitespace = (text) =>
  String(text || "")
    .replace(/\r/g, " ")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const splitPdfIntoPages = (fullText) => {
  const normalized = normalizeWhitespace(fullText);
  if (!normalized) return [];

  const rawPages = normalized.split(PAGE_BREAK_REGEX).map((page) => page.trim()).filter(Boolean);
  if (rawPages.length) return rawPages;

  return [normalized];
};

const splitParagraphToSentences = (paragraph) => {
  const normalized = normalizeWhitespace(paragraph);
  if (!normalized) return [];

  const sentences = normalized.split(SENTENCE_SPLIT_REGEX).map((item) => item.trim()).filter(Boolean);
  if (sentences.length > 1) return sentences;

  // Fallback for text that lacks clear punctuation.
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length <= 40) return [normalized];

  const fallbackSentences = [];
  const windowSize = 35;
  for (let index = 0; index < words.length; index += windowSize) {
    fallbackSentences.push(words.slice(index, index + windowSize).join(" "));
  }
  return fallbackSentences;
};

const buildChunksFromPage = ({
  pageText,
  pageNumber,
  maxChunkChars = 900,
  minChunkChars = 250,
  overlapSentenceCount = 1,
}) => {
  const paragraphs = normalizeWhitespace(pageText)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks = [];
  let currentSentences = [];
  let currentLength = 0;

  const flushChunk = () => {
    if (!currentSentences.length) return;

    const chunkText = normalizeWhitespace(currentSentences.join(" "));
    if (!chunkText) return;

    chunks.push({
      text: chunkText,
      page: pageNumber,
    });

    const overlapStart = Math.max(0, currentSentences.length - overlapSentenceCount);
    currentSentences = currentSentences.slice(overlapStart);
    currentLength = normalizeWhitespace(currentSentences.join(" ")).length;
  };

  for (const paragraph of paragraphs) {
    const sentences = splitParagraphToSentences(paragraph);

    for (const sentence of sentences) {
      const sentenceLength = sentence.length;
      const nextLength = currentLength + sentenceLength + 1;

      if (nextLength > maxChunkChars && currentLength >= minChunkChars) {
        flushChunk();
      }

      currentSentences.push(sentence);
      currentLength = normalizeWhitespace(currentSentences.join(" ")).length;
    }
  }

  // Flush remaining text.
  currentSentences = currentSentences.filter(Boolean);
  flushChunk();

  return chunks;
};

const deduplicateChunks = (chunks) => {
  const seen = new Set();

  return chunks.filter((chunk) => {
    const key = normalizeWhitespace(chunk.text).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const splitPdfIntoChunks = (fullText) => {
  const pages = splitPdfIntoPages(fullText);

  const chunkItems = pages.flatMap((pageText, index) =>
    buildChunksFromPage({
      pageText,
      pageNumber: index + 1,
    })
  );

  return deduplicateChunks(chunkItems);
};

// Backward-compatible legacy export used by local scripts.
const splitIntoChunks = (text) => splitPdfIntoChunks(text).map((chunk) => chunk.text);

module.exports = {
  splitPdfIntoChunks,
  splitIntoChunks,
};