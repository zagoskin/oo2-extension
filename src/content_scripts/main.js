class ContentPageManager{
  extractSearchString(args){
    var searchString = document.getElementsByName("q")[0].value;

    chrome.runtime.sendMessage({
      "call": "retrieveSearchResults",
      "args": {
        "keywords": searchString,
        "hostname": args.hostname
      }
    });
  }

  extractSearchResults(){
    alert("hola, desde extractSearchResults");
    console.log("mierrr");
    // chrome.runtime.sendMessage({
    //   "call": "decirHola"
    // });
  }
}

var pageManager = new ContentPageManager();
// alert(Date.now());
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(pageManager[request.call]){
       pageManager[request.call](request.args);
    }
  }
);
// window.addEventListener("load",
//   function(request, sender, sendResponse){
//     // alert(request.call);
//     if(request.call == "extractSearchResults"){
//       alert("llamando!");
//       // pageManager.extractSearchResults();
//     }
// });
