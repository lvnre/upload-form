/*
* File: notify-slack.js
* Author: Lanre Akomolafe
* Purpose: called by toDatastore() function in model-datastore.js, which translates
* the data recieved from the upload form to a Datastore-readable
* format for datastore storage. It then passes the name and email address to
* postToSlack() function within this file. postToSlack() will generate an
* informative slack notification for your team.
*/

'use strict';

/*
*  TODO: - change the value of 'webhookUri' to your own slack webhook uri
         - change the slack.webhook function to fit your needs
*/

var Slack = require('slack-node');
var webhookUri = 'YOUR_WEBHOOK_URI';

//Post upload notification to slack channel
function postToSlack(name, address) {

  var slack = new Slack();

  slack.setWebhook(webhookUri);
  slack.webhook({
    channel: "#general",
    username: "submission-bot",
    text: "Photo Submitted!" +
          "\n Name: " + name +
          "\n Email: " + address
  }, function(err, response) {
    console.log(response);
  });
}

//make methods accessible by other files
module.exports = {
  postToSlack : postToSlack
}
