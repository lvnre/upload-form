'use strict';

var express = require('express');
var config = require('../config');
var images = require('../lib/images');
var datastore = require('./model-datastore');

var router = express.Router();

// Set Content-Type for all responses for these routes
router.use(function (req, res, next) {
  res.set('Content-Type', 'text/html');
  next();
});

/*
*  Handles every GET request to the root URL '/'. app.js specified that the
*  root url redirects to /submissions, so this will be the page rendered at
*  localhost:8080/submissions (the home page, essentially).
*  The home page consists of a list of every file in your Datastore. This
*  calls the list() function in model-datastore.js, and passes it 'limit'
*  (the max number of files to be listed), 'req.query.pageToken' (to allow the
*   'more' button in list.jade view to load another page listing more files),
*   and a callback function that takes the entities from datastore, and the
*   boolean value of 'cursor' specifying if there are more entities to list.
*   These get stored as 'submissions' and 'entities', respectively, then the
*   list.jade file renders the list by looping through the entities array, and
*   displays a 'more' button if nextPageToken is true.
*/
router.get('/', function list (req, res, next) {
  datastore.list(10, req.query.pageToken, function (err, entities, cursor) {
    if (err) {
      return next(err);
    }
    res.render('submissions/list.jade', {
      submissions: entities,
      nextPageToken: cursor
    });
  });
});

/*
* Handles every GET request to /add. In this case, handles the request to
* load the submission form. Renders the form.jade file. Refers to the path
* submissions/form.jade since it is being called from the base.jade view.
*/
router.get('/add', function addForm (req, res) {
  res.render('submissions/form.jade', {
    submission: {},
    action: 'Add'
  });
});

/*
*  Handles every POST request from /add. In this case, handles the post request
*  from the form submission. Has 3 parts, essentially:
*  1. images.multer.single('image'): calls the multer() function in
*     images.js to temporarily store the user's uploaded file in memory
*
*  2. images.sendUploadToGCS: calls the sendUploadToGCS() function in
*     images.js to send the user's file to the apprpriate bucket in
*     Google Cloud. Also processes req.file (the 'req' parameter referring
*     to the file that was uploaded in the form), and adds two parameters:
*     --req.file.cloudStorageObject - the name of the object in Google Cloud
*     --req.file.cloudStoragePublicUrl - the url of the object in Google Cloud
*
*  3. insert(req, res, next): Takes the info from the form and stores it into
*     the variable 'data'. Then checks if a file was uploaded (if req.file exists),
*     and if it was successfully uploaded to Google Cloud (if req.file has the
*     cloudStoragePublicUrl parameter). If so, it assigns the public url to
*     data.imageUrl, which it then passes to the create() function in
*     model-datastore.js (referred to by the variable 'datastore', declared)
*     at the top of this file, which uploads the form data to Datastore.
*     Then redirects to a page to view the newly uploaded file.
*/
router.post(
  '/add',
  images.multer.single('image'),
  images.sendUploadToGCS,
  function insert (req, res, next) {
    var data = req.body;
    // Was a file uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      data.imageUrl = req.file.cloudStoragePublicUrl;
    }

    // Save the data to the database.
    datastore.create(data, function (err, savedData) {
      if (err) {
        return next(err);
      }
      res.redirect(req.baseUrl + '/' + savedData.id);
    });
  }
);

/*
 * Handles all GET requests to /:submission. In this case, either every time
 * a submission is clicked on, or when the upload POST function in this file
 * redirects to the file itself.
 * Calls the read() function in model-datastore(), and passes it
 * 'req.params.submission', which is the id of the submission. The read()
 * function translates the datastore data to a format that is JS-readable, and
 * returns it to teh callback function. The callback function then renders the
 * view.jade view with the entity returned from read().
 */
router.get('/:submission', function get (req, res, next) {
  datastore.read(req.params.submission, function (err, entity) {
    if (err) {
      return next(err);
    }
    res.render('submissions/view.jade', {
      submission: entity
    });
  });
});

/**
 * Errors on "/submissions/*" routes.
 */
router.use(function handleRpcError (err, req, res, next) {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = err.message;
  next(err);
});

module.exports = router;
