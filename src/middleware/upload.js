const util = require("util");
const Multer = require("multer");
const maxSize = 2 * 1024 * 1024; //imit: 2MB

let processFile = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: maxSize },
}).single("file");
let processFileMiddleware = util.promisify(processFile);
module.exports = processFileMiddleware;