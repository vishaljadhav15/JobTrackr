const pdfParse = require("pdf-parse");

const parseResume = async (fileBuffer) => {
  try {
    const parser = new pdfParse.PDFParse({
      data: fileBuffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    const extractedText = result.text
      .replace(/\s+/g, " ")
      .trim();

    return extractedText;
  } catch (error) {
    console.error("Resume parsing error:", error);
    throw new Error("Failed to extract text from resume");
  }
};

module.exports = parseResume;