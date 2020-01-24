class ContentPageManager{
  hola(args){
    if (args.phrase == "hello")
      alert("goodbye");
    else
      alert("help me");
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
