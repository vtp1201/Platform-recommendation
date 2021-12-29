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
  return new Promise((resolve, reject) => {
    if (!req.files) return next();
    if (!req.files.dataSourceKey) return next();
    const resultRequest = 'error';
    const resultObject = 'error';
    const resultKey = 'error';
    uploadFile(req.files.dataSourceKey[0])
    .then((a) => {
      /* console.log('Uploaded key'); */
      if (req.files.dataSourceRequest) {
        uploadFile(req.files.dataSourceRequest[0])
        .then((a) => {
          /* console.log('Uploaded request'); */
          if (req.files.dataSourceObject) {
            uploadFile(req.files.dataSourceObject[0])
            .then((a) => {
              resultObject = a;
              /* console.log('Uploaded obj'); */
              resolve('ok');
            })
            .catch((error) => {
              /* console.log('Uploaded obj failed'); */
              resolve('ok');
            })
            .finally(() => {
              /* console.log('Uploaded key and re'); */
              resolve('ok');
            })
          }
          resolve('ok');
        })
        .catch((error) => reject('error'))
      }
      else{
        reject('error');
      }
    })
    .catch((error) => reject('error'))
  });
}

const uploadFile = (req) => {
  return new Promise((resolve, reject) => {
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
    stream.on("finish", async () => {
      try{
        await fileUpload.makePublic();
        resolve('ok')
      } catch(error) {
        console.log(error);
        reject('error')
      }
      });
    stream.end(req.buffer);
  })
}
module.exports = uploadMutipleFiles;
