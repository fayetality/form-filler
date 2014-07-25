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

function onRequest(request, sender, callback) {
    if (request.action == 'fetch_json' || request.action == 'fetch_files_json' || request.action == 'fetch_proposal_text') {
        fetch_json(request.url, callback);
    }
}

chrome.extension.onRequest.addListener(onRequest);