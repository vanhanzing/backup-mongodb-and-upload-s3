require('dotenv/config');
const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');

const ID = process.env.BUCKET_ID;
const SECRET = process.env.BUCKET_KEY;
const BUCKET_NAME = process.env.BUCKET_NAME;

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

const uploadFile = async (fileContent, file) => {
  const fileName = path.basename(file);
  const fileType = path.extname(file);

  try {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '-' + dd + '-' + yyyy;

    const params = {
      Bucket: BUCKET_NAME,
      Key: `BACK_UP_ON_${today}/${fileName}`,
      Body: fileContent,
      ContentType: fileType,
      ACL: 'public-read',
    };

    await s3.upload(params, async (err, data) => {
      if (err) {
        console.log(err);
      }
      console.log(data);
    });
  } catch (error) {
    console.log(error);
  }
};
exports.getFile = async () => {
  const directoryPath = path.join(__dirname, './backDB/');
  //passsing directoryPath and callback function
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      const data = fs.readFileSync(directoryPath + file);
      uploadFile(data, file);
    });
  });
};
