class ContentPageManager{
  extractSearchString(args){
    var searchString = document.getElementsByName("q")[0].value;

    chrome.runtime.sendMessage({
      "call": "retrieveSearchResults",
      "args": {
        "keywords": searchString
      }
    })
  }
}

var pageManager = new ContentPageManager();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(pageManager[request.call]){
    	pageManager[request.call](request.args);
    }
  }
);
