const admin = require('firebase-admin')
const serviceAccount = require("../../../.vscode/serviceAccountKey.json");
const BUCKET = "platform-recommedation.appspot.com";
// Initialize firebase admin SDK

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: BUCKET,
});
  // Cloud storage
const bucket = admin.storage().bucket();

const uploadMutipleFiles = (req, res, next) => {
  if (!req.files) return next();
  if (!req.files.dataSourceKey) return next();
  if (req.files.dataSourceRequest) {
    uploadFile(req.files.dataSourceRequest[0]);
  }
  if (req.files.dataSourceObject) {
    uploadFile(req.files.dataSourceObject[0]);
  }
  uploadFile(req.files.dataSourceKey[0]);
  next();
}

const uploadFile = async (req) => {
  const fileName = req.fieldname + '-' + Date.now() + "-" + req.originalname;
  req.firebaseUrl = `http://storage.googleapis.com/${BUCKET}/${fileName}`;
  const fileUpload = bucket.file(fileName);
  const stream = fileUpload.createWriteStream({
    metadata: { 
      contentType: req.minetype,
    },
  });
  stream.on("error", (err) => {
    console.log(err);
  });
  await stream.on("finish", async () => {
    try{
      await fileUpload.makePublic();
      return;
    } catch(error) {
      console.log(error);
    }
  });
  stream.end(req.buffer);
}
module.exports = uploadMutipleFiles;
