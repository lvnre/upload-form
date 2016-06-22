# User file upload to Google Cloud/Datastore/Slack

This project's purpose is to present the user with a form to upload a file
which will then be uploaded to a Google Cloud Bucket and Google Datastore,
while also notifying a Slack channel of the upload.

# Summary

I took a look at Google Cloud's NodeJS documentation, and, being fairly new
to Web Development at the time, found it almost impossible to understand. Now that
I have much more experience, I decided to tweak their documentation into a more
functional and understandable project for both experienced and fairly new
Web Developers.

This app will have three main views. The root URL will direct to a listening
page, which will list each file you have in your Google Datastore Database.
There will be a button titled 'Add Submission', which will direct to the form!
Upon completion of the form and specification of the file to be uploaded, the
server will upload the file itself to a Google Cloud bucket depending on the
type of file uploaded, upload the form contents to Google Datastore, and notify
a Slack channel of the upload as it happens! It will then redirect to a page
rendering the newly uploaded file.

## Requirements

-[Node.JS][nodejs]

-[Google Cloud Storage][gcloud-storage]

## OPTIONAL

-[Slack Webhook Integration][slack-webhook]

### Setup:

Create a project, and 3 buckets in your Google Cloud Console: one for Photos
files, Video files, and a default file bucket (name it something like "other").

Open the `config.js` file and specify your Google Cloud Project name and the
names of the three Buckets you created.

Open Terminal, and navigate to the root folder of this project.

Run `npm install`, and then run `npm start`.

The app will now be accessible at http://localhost:8080 !

### Setup Slack Notifications (optional)

The invocation of the function to notify a slack channel is located in
`model-datastore.js`, and the actual code is located in `notify-slack.js`.
Setup your Slack Webhook integration [here][slack-webhook], and read the
comments in both of the aforementioned files to quickly and easily integrate
Slack notifications!

# Help/Issues

Contact me on [Twitter][lanre-twitter], or leave an issue under the 'Issues'
tab on GitHub to notify me of any mishaps in this code!


[nodejs]: https://nodejs.org/en/download/
[gcloud-storage]: https://cloud.google.com/free-trial/
[slack-webhook]: https://api.slack.com/
[lanre-twitter]: https://twitter.com/lvnre
