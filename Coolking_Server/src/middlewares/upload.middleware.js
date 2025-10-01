const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("file");



const uploadd = multer({
storage: multer.memoryStorage(),
limits: { fileSize: 10 * 1024 * 1024 },
}).array("files");

module.exports = { upload, uploadd };