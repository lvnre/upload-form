'use strict';

// Hierarchical node.js configuration with command-line arguments, environment
// variables, and files.
var nconf = module.exports = require('nconf');
var path = require('path');

nconf
  // 1. Command-line arguments
  .argv()
  // 2. Environment variables
  .env([
    'PHOTO_BUCKET',
    'VIDEO_BUCKET',
    'OTHER_BUCKET',
    'DATA_BACKEND',
    'GCLOUD_PROJECT',
    'PORT'
  ])
  // 3. Config file
  .file({ file: path.join(__dirname, 'config.json') })
  // 4. Defaults
  .defaults({
    /*
    * TODO: Create 3 buckets in your Google Cloud Console. One for image files,
    * one for video files, and one for any other file type. Replace the
    * variables with the names of your buckets.
    */
    PHOTO_BUCKET: 'YOUR_PHOTO_BUCKET',
    VIDEO_BUCKET: 'YOUR_VIDEO_BUCKET',
    OTHER_BUCKET: 'YOUR_OTHER_BUCKET',

    /*
    * This specifies the backend database service used. In our case, Google
    * Datastore, which can be accessed from the Google Cloud Console.
    */
    DATA_BACKEND: 'datastore',

    /* This is the id of your project in the Google Cloud Developers Console.
    *  TODO: Replace the value of GCLOUD_PROJECT with the id of your project.
    */
    GCLOUD_PROJECT: 'YOUR_CLOUD_PROJECT_ID',

    /*
    * Port the HTTP server.
    * this app will be served from http://localhost:8080
    */
    PORT: 8080
  });

/*
* checkConfig() makes sure you specified the required cloud configuration
* settings.
*/
checkConfig('GCLOUD_PROJECT');
checkConfig('PHOTO_BUCKET');
checkConfig('VIDEO_BUCKET');
checkConfig('OTHER_BUCKET');

function checkConfig (setting) {
  if (!nconf.get(setting)) {
    throw new Error('You must set the ' + setting + ' environment variable ' +
      'in config.js!');
  }
}
