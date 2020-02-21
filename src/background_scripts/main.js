class BackgroundExtension{
  // decirHola(){
  //   console.log("hola");
  // }
  getCurrentTab(callback) {
    var theTab;
		return chrome.tabs.query({active: true,	currentWindow: true}, function(tabs) {
      callback(tabs[0])
    });
	}

  extractSearchString(tab){
    var url = new URL(tab.url)
    console.log(tab.id);

    chrome.tabs.sendMessage(tab.id, {
      call: "extractSearchString",
      args: {
        "originaltabid": tab.id,
        "hostname": url.hostname
      }
    });
	}

  retrieveSearchResults(args){
    var searcher = new Searcher();

    var searchUrls = searcher.searchWithoutDomain(args.keywords, args.hostname);

    searchUrls.forEach(function(url){
      chrome.tabs.create({'url': url}, function(tab){
        chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
            if (info.status === 'complete' && tabId === tab.id) {
                chrome.tabs.onUpdated.removeListener(listener);
                chrome.tabs.sendMessage(tab.id, {
                  call: 'extractSearchResults',
                  args: {
                    "originaltabid": args.originaltabid,
                    "newtabid": tab.id
                  }
                });
            }
        });
      });
    });
  }

  sendResultsToMainContent(args){
    chrome.tabs.remove(args.newtabid);
    chrome.tabs.get(args.originaltabid, function(tab) {
      chrome.tabs.highlight({'tabs': tab.index}, function() {});
    });
    console.log(args.searchresults);
    chrome.tabs.sendMessage(args.originaltabid, {
      call: "updateCurrentDOM",
      args: {
        "searchresults": args.searchresults
      }
    });
  }
}

var startBackground = function(config) {
	var extension = new BackgroundExtension(config.apiUrl);

	chrome.browserAction.onClicked.addListener(() => {
	  extension.getCurrentTab(extension.extractSearchString);
	});

	chrome.runtime.onMessage.addListener((request, sender) => {
		console.log("[background-side] calling the message: " + request.call);
		if(extension[request.call]){
			extension[request.call](request.args);
		}
	});
}

function checkExpectedParameters(config){

	if (config == undefined)
		return false;

    var foundParams = ["apiUrl"].filter(param => (param && config.hasOwnProperty(param)));
    return (config.length == foundParams.length);
}

chrome.storage.local.get("config", function(data) {
    if (!checkExpectedParameters(data.config)) {
        data.config = {
        	"apiUrl": ""
        };
        chrome.storage.local.set({"config": data.config }, function() {
          startBackground(data.config);
        });
    }
    else startBackground(data.config);

});
