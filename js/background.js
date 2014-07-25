//Calls for a response from the url that is passed in so that the callback can return the data back to the popup to use
function fetch_json(url, callback) {
  var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(data) {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          var data = xhr.responseText;
          callback(data);
        } else {
          console.log('response was not 200', xhr.status)
          callback(null);
        }
      }
    }
    xhr.open('GET', url, true);
    xhr.send();
} 

//If the request action matches any of the below, it will call the fetch_json function to grab a response
function onRequest(request, sender, callback) {
    if (request.action == 'fetch_json' || request.action == 'fetch_files_json' || request.action == 'fetch_proposal_text') {
        fetch_json(request.url, callback);
    }
}

//Sets up a listener to wait for a request from the popup
chrome.extension.onRequest.addListener(onRequest);