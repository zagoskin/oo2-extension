class Searcher {
  constructor(){
    this.hostnames =  new Array("www.google.com", "www.bing.com", "duckduckgo.com");
    this.results = new Array();
  }

  searchKeyword (keyword){

    this.hostnames.forEach(function(hostname){

      var oReq = new XMLHttpRequest();
      if (hostname == "duckduckgo.com") {
        var url = new URL('https://' + hostname + '/');
        url.searchParams.set('q', keyword);
        console.log(url);
        oReq.open("GET", url);
        oReq.responseType = 'text';
        oReq.send();
      }
      else {
        var url = new URL('https://' + hostname + '/search');
        url.searchParams.set('q', keyword);
        console.log(url);
        oReq.open("GET", url);
        oReq.responseType = 'text';
        oReq.send();
      }
      oReq.onload = function() {
        console.log(oReq.responseURL);
        console.log(oReq.response);
      };

      oReq.onerror = function() {
        console.log("failed");
      }
    });
  }
}

class BackgroundExtension{
  getCurrentTab(callback) {
    var theTab;
		return chrome.tabs.query({active: true,	currentWindow: true}, function(tabs) {
      callback(tabs[0])
    });
	}

  extractSearchString(tab){
    var url = new URL(tab.url)
    console.log(url.hostname);
    chrome.tabs.sendMessage(tab.id, {
      call: "extractSearchString"
    });
	}

  retrieveSearchResults(args){
    var searcher = new Searcher();
    searcher.searchKeyword(args.keywords);
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
