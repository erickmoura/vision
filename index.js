var google = require('googleapis');
var storage = google.storage('v1');
var jsonfile = require('jsonfile')
var request = require('request');

//detectLabels("06005-002.jpg");
//

console.log(1);
google.auth.getApplicationDefault(function(err, authClient) {
  console.log(2);
  if (err) {
    console.log('Authentication failed because of ', err);
    return;
  }
  if (authClient.createScopedRequired && authClient.createScopedRequired()) {
    console.log(3);
    var scopes = ['https://www.googleapis.com/auth/cloud-platform'];
    authClient = authClient.createScoped(scopes);
  }

  var request = {
    // TODO: Change placeholders below to appropriate parameter values for the 'list' method:

    // * Name of the bucket in which to look for objects.
    bucket: "1-images-test-100",

    // Auth client
    auth: authClient
  };

  var recur = function(err, result) {
    if (err) {
      console.log(err);
    } else {

      for(var item in result["items"]){
        file_name = result.items[item].name;
        detectLabels(file_name);
      }
      if (result.nextPageToken) {
        request.pageToken = result.nextPageToken;
        storage.objects.list(request, recur);
      }
    }
  };

  storage.objects.list(request, recur);
});

function detectLabels (inputFile) {
  request.post(
      'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBDnMk6vKwdjvEW2ATzzfwA6pbAQ9GkAnA',
      { 
        json: {
          "requests":
            [
            {
              "features":
                [
                {
                  "type": "FACE_DETECTION",
                  "maxResults": 4,
                } 
                ],
                "image":
                {
                  "source":
                  {
                    "gcsImageUri": "gs://1-images-test-100/" + inputFile
                  }
                }
            }
            ]
        }
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          name = inputFile.replace(/\.[^/.]+$/, "");
          jsonfile.writeFile("./faces/" + name + ".json", body, function (err) {
            console.error(err);
          })
        }
        console.log(body);
      }
  );
}
