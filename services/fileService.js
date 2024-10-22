const { v4: uuidv4 } = require("uuid");
const SingleFile = require("../models/singlefile");
const { fileSizeFormatter } = require("../utils/fileSizeFormatter");

const uploadSingleFile = async (file) => {
  try {
    const newFile = new SingleFile({
      id: uuidv4(),
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: fileSizeFormatter(file.size, 2)
    });

    await newFile.save();
    return newFile;
  } catch (error) {
    throw new Error("File upload failed: " + error.message);
  }
};

module.exports = { uploadSingleFile };
