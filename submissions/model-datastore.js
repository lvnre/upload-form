'use strict';

//Google cloud API
var gcloud = require('gcloud');
//Configuration file
var config = require('../config');
//Slack notifications
//var slack = require('../lib/notify-slack');
//initialize datastore
var ds = gcloud.datastore({
  projectId: config.get('GCLOUD_PROJECT')
});
var kind = 'Submission';

//Translate datastore object to JS object
function fromDatastore (obj) {
  obj.data.id = obj.key.id;
  return obj.data;
}
//Vice versa, use the resulting array's content for the
//notifications, and confirmation emails and texts
function toDatastore (obj, nonIndexed) {
  nonIndexed = nonIndexed || [];
  var results = [];
  Object.keys(obj).forEach(function (k) {
    if (obj[k] === undefined) {
      return;
    }
    results.push({
      name: k,
      value: obj[k],
      excludeFromIndexes: nonIndexed.indexOf(k) !== -1
    });
  });
  var name = results[0].value;
  var address = results[1].value;

  /*
  * OPTIONAL: Uncomment the postToSlack() invocation below, uncomment
  * the 'var slack = require(../lib/notify-slack)' line at the top of this file,
  * and edit the lib/notify-slack.js file to integrate a slack
  * webhook notification, if desired. Be sure to run 'npm install slack-node'
  * in your Terminal!
  */

  //notify slack, send entire results array
  //slack.postToSlack(name, address);
}

// Lists all submissions in the Datastore sorted alphabetically by title.
// The ``limit`` argument determines the maximum amount of results to
// return per page. The ``token`` argument allows requesting additional
// pages. The callback is invoked with ``(err, submissions, nextPageToken)``.
function list (limit, token, cb) {
  /*
  * 'q' holds a datastore query of the 'kind' of entity (specified at top
  * of the file), with a limit (passed by the function in crud.js), parameter
  * by which to order the query, and a start parameter, which indicates where
  * to start the query (mostly utilizes when user clicks the 'more' button to
  * display the rest of the files in datastore, if any)
  */
  var q = ds.createQuery([kind])
    .limit(limit)
    .order('name')
    .start(token);

  //Run the query, send err, entities, and nextQuery in the callback function
  ds.runQuery(q, function (err, entities, nextQuery) {
    if (err) {
      return cb(err);
    }
    /*
    * hasMore = If the number of entities === the limit, returns the starting
    * point of the next query. Else, it returns false, telling crud.js function
    * that there are no more entities to list.
    */
    var hasMore = entities.length === limit ? nextQuery.startVal : false;
    cb(null, entities.map(fromDatastore), hasMore);
  });
}

// Creates a new submission or updates an existing submission with new data. The provided
// data is automatically translated into Datastore format. The submission will be
// queued for background processing.
function create(data, cb) {

  //Create the entity to be saved in datastore. Each datastore object, or 'entity',
  //consists of a key specifying what 'kind' of entity it is, and the data of the
  //entity.
  var key = ds.key(kind);
  var entity = {
    key: key,
    //Translate the form data from JS-readable to Datastore-readable format.
    //The second paramter indicates which data from the form you don't want
    //to be indexed in datastore, if so.
    data: toDatastore(data, ['description'])
  };

  //Save the entity in datastore.
  ds.save(
    entity,
    function (err) {
      data.id = entity.key.id;
      cb(err, err ? null : data);
    }
  );
}

/*
* Returns data from a specific entity in datastore. Called by a crud.js function
* that passes it the id of the submission, this function then translates the
* entity retrieved from datastore to JS-readable format, and returns it to the
* crud.js function. If there is no entity, or if there was an error retrieving
* the entity, it returns an error in the callback.
*/
function read (id, cb) {
  var key = ds.key([kind, parseInt(id, 10)]);
  ds.get(key, function (err, entity) {
    if (err) {
      return cb(err);
    }
    if (!entity) {
      return cb({
        code: 404,
        message: 'Not found'
      });
    }
    cb(null, fromDatastore(entity));
  });
}

module.exports = {
  create: create,
  read: read,
  update: update,
  list: list
};
