'use strict';

var gcloud = require('gcloud');
var config = require('../config');

//var CLOUD_BUCKET = config.get('CLOUD_BUCKET');

/*
* Reference the bucket variables declared in our config.js file:
*/
var PHOTO_BUCKET = config.get('PHOTO_BUCKET');
var VIDEO_BUCKET = config.get('VIDEO_BUCKET');
var OTHER_BUCKET = config.get('OTHER_BUCKET');

/*
* Get the project id of our project by requesting project var from config.js
* to gcloud method
*/
var storage = gcloud.storage({
  projectId: config.get('GCLOUD_PROJECT')
});

/* Functions that return the public, anonymously accessable URL to a given Cloud Storage
*  object.
*/
function getPhotoBucketUrl(filename) {
  return 'https://storage.googleapis.com/' + PHOTO_BUCKET + '/' + filename;
}
function getVideoBucketUrl(filename) {
  return 'https://storage.googleapis.com/' + VIDEO_BUCKET + '/' + filename;
}
function getOtherBucketUrl(filename) {
  return 'https://storage.googleapis.com/' + OTHER_BUCKET + '/' + filename;
}
// Express middleware that will automatically pass uploads to Cloud Storage.
// req.file is processed and will have two new properties:
// * ``cloudStorageObject`` the object name in cloud storage.
// * ``cloudStoragePublicUrl`` the public url to the object.
// [START process]
function sendUploadToGCS (req, res, next) {
  //set default acls for buckets to be publicly accessible
  makeBucketsPublic();

  if (!req.file) {
    return next();
  }

  //Name of the file uploaded by the user
  var gcsname = req.file.originalname;
  //'bucket' will be assigned to the appropriate bucket depending on
  //type of file. 'pic' and 'vid' booleans also assigned depending on
  //type of file.
  var bucket;
  var pic = false;
  var vid = false;

  //check file name extensions to upload to appropriate folders
  //Note: was fairly new to JS syntax when I wrote this. There are definitely
  //different ways to go about checking file extensions in the file names, if
  //your needs require more specific checking.
  if (gcsname.includes(".jpg") || gcsname.includes(".JPG") ||
      gcsname.includes(".jpeg") || gcsname.includes(".JPEG") ||
      gcsname.includes(".png") || gcsname.includes(".PNG") ||
      gcsname.includes(".tiff") || gcsname.includes(".TIFF")) {
    pic = true;
    bucket = storage.bucket(PHOTO_BUCKET);
  } else if (gcsname.includes(".mov") || gcsname.includes(".MOV") ||
             gcsname.includes(".mp4") || gcsname.includes(".MP4") ||
             gcsname.includes(".mpeg") || gcsname.includes(".MPEG") ||
             gcsname.includes(".mpg") || gcsname.includes(".MPG") ||
             gcsname.includes(".gif") || gcsname.includes(".GIF")) {
    vid = true;
    bucket = storage.bucket(VIDEO_BUCKET);
  } else {
    bucket = storage.bucket(OTHER_BUCKET);
  }

  //Create the bucket file object
  var file = bucket.file(gcsname);
  //Initialize stream to cloud storage
  var stream = file.createWriteStream();
  stream.on('error', function (err) {
    req.file.cloudStorageError = err;
    next(err);
  });

  //give req.file it's two new parameters, and continue the crud.js function
  //that invoked this function:
  stream.on('finish', function () {
    req.file.cloudStorageObject = gcsname;
    if (pic) {
      req.file.cloudStoragePublicUrl = getPhotoBucketUrl(gcsname);
    } else if (vid) {
      req.file.cloudStoragePublicUrl = getVideoBucketUrl(gcsname);
    } else {
      req.file.cloudStoragePublicUrl = getOtherBucketUrl(gcsname);
    }
    next();
  });
  //End the stream
  stream.end(req.file.buffer);
}

/* Function to make buckets publicly accessible. */
function makeBucketsPublic() {
  var photos = storage.bucket(PHOTO_BUCKET);
  photos.acl.default.add({
    entity: 'allUsers',
    role: storage.acl.READER_ROLE
  }, function(err, aclObject) {});

  var videos = storage.bucket(VIDEO_BUCKET);
  videos.acl.default.add({
    entity: 'allUsers',
    role: storage.acl.READER_ROLE
  }, function(err, aclObject) {});

  var other = storage.bucket(VIDEO_BUCKET);
  other.acl.default.add({
    entity: 'allUsers',
    role: storage.acl.READER_ROLE
  }, function(err, aclObject) {});
}

// Multer handles parsing multipart/form-data requests.
// This instance is configured to store images in memory and re-name to avoid
// conflicting with existing objects. This makes it straightforward to upload
// to Cloud Storage.
var multer = require('multer')({
  inMemory: true,
  fileSize: 5 * 1024 * 1024, // no larger than 5mb
  rename: function (fieldname, filename) {
    // generate a unique filename
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
  }
});

module.exports = {
  getVideoBucketUrl: getVideoBucketUrl,
  getPhotoBucketUrl: getPhotoBucketUrl,
  getOtherBucketUrl: getOtherBucketUrl,
  sendUploadToGCS: sendUploadToGCS,
  multer: multer
};
