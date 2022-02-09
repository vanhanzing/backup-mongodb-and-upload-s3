require('dotenv/config');
const fs = require('fs');
const mongoose = require('mongoose');
const uploadFile = require('./uploadToS3');

let count = 0;
let collectionLength = 0;

let db = process.env.DB_URL;

console.log(db);
/**
 *  Note: useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are no longer supported options.
 *  Mongoose 6 always behaves as if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true, and useFindAndModify is false.
 *  Please remove these options from your code/.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log('MongoDB connected!');

    getListOfCollections(mongoose.connection.db);
  } catch (error) {
    console.log('MongoDB Network Error::', error);
    process.exit(1); // exit process with failure
  }
};
const getListOfCollections = (db) => {
  db.listCollections().toArray((err, result) => {
    if (err) throw err;
    collectionLength = result.length;
    result.forEach((item) => {
      console.log(item.name);
      getDocuments(db, item.name, result.length);
    });
  });
};

const getDocuments = (db, name) => {
  const query = {}; // this is your query criteria
  db.collection(name)
    .find()
    .toArray(function (err, result) {
      if (err) throw err;
      generateDocuments(name, result);
    });
};

const generateDocuments = (fileName, details) => {
  try {
    fs.writeFileSync(`./backUpDB/${fileName}.json`, JSON.stringify(details));
    console.log(`Done writing to file ${fileName}`);
    count++;
  } catch (err) {
    console.log('Error writing to file', err);
  }
  if (collectionLength == count) {
    uploadFile.getFile();
    console.log('Connected successfully to closed');
    mongoose.connection.close();
  }
};

connectDB();
