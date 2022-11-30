const processFile = require("../middleware/upload");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");
// Instantiate a storage client with credentials
const storage = new Storage({ keyFilename: "google-cloud-key.json" });
const bucket = storage.bucket("image_carpool_bucket");

const upload = async (req, res) => {
    try {
        await processFile(req, res);
    
        if (!req.file) {
          return res.status(400).send({ message: "Please upload a file!" });
        }

        // Create a new blob in the bucket and upload the file data.
        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        blobStream.on("error", (err) => {
            res.status(500).send({ message: err.message });
        });

        blobStream.on("finish", async (data) => {
            // Create URL for directly file access via HTTP.
            const publicUrl = format(
              `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );
              res.status(200).send(publicUrl)
            });
        
            blobStream.end(req.file.buffer);
    } catch (err) {
        if (err.code == "LIMIT_FILE_SIZE") {
          return res.status(500).send({
            message: "File size cannot be larger than 2MB!",
          });
        }
        res.status(500).send({
            message: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
    }
};
  
const getListFiles = async (req, res) => {
    try {
        const [files] = await bucket.getFiles();
        let fileInfos = [];
    
        files.forEach((file) => {
          fileInfos.push({
            name: file.name,
            url: file.metadata.mediaLink,
          });
        });
    
        res.status(200).send(fileInfos);
      } catch (err) {
        console.log(err);
    
        res.status(500).send({
          message: "Unable to read list of files!",
        });
      }
};
  
const download = async (req, res) => {
    try {
      const [metaData] = await bucket.file(req.params.name).getMetadata();
      res.redirect(metaData.mediaLink);
      
    } catch (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  };
  
  
module.exports = {
    upload,
    getListFiles,
    download,
};