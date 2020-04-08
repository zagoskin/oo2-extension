class BackgroundExtension{
  // decirHola(){
  //   console.log("hola");
  // }
  startExtension(){
    this.getCurrentTab(this.extractSearchString);
  }
  getCurrentTab(callback) {
    var theTab;
		return browser.tabs.query({active: true,	currentWindow: true}, function(tabs) {
      callback(tabs[0])
    });
	}

  extractSearchString(tab){
    var url = new URL(tab.url)
    console.log(tab.id);

    browser.tabs.sendMessage(tab.id, {
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
    browser.storage.local.set({
      expandSearch: 2
    });
    searchUrls.forEach(function(url){
      browser.tabs.create({'url': url}, function(tab){
        browser.tabs.onUpdated.addListener(function listener (tabId, info) {
            if (info.status === 'complete' && tabId === tab.id) {
                browser.tabs.onUpdated.removeListener(listener);
                browser.tabs.sendMessage(tab.id, {
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
    browser.tabs.remove(args.newtabid);
    this.enableAugmentation();
    browser.tabs.get(args.originaltabid, function(tab) {
      browser.tabs.highlight({'tabs': tab.index}, function() {});
    });

    browser.tabs.sendMessage(args.originaltabid, {
      call: "updateCurrentDOM",
      args: {
        "searchresults": args.searchresults
      }
    });
  }

  enableAugmentation(){
    browser.storage.local.get('expandSearch').then(items => {
                      if(items.expandSearch > 0){
                        browser.storage.local.set({
                          expandSearch: items.expandSearch-1
                        });
                      }
                    });
    // if (searchedCount = 2){
    //   searchedCount = 0;
    //   chrome.storage.local.set({
    //     expandSearch: true
    //   });
    // }
  }
}

var startBackground = function(config) {
  browser.storage.local.set({
    expandSearch: 0
  });
	var extension = new BackgroundExtension(config.apiUrl);

  // chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
  //     chrome.declarativeContent.onPageChanged.addRules([{
  //       conditions: [
  //         new chrome.declarativeContent.PageStateMatcher({
  //           pageUrl: {urlContains: 'www.google.com/search?'},
  //         }),
  //         new chrome.declarativeContent.PageStateMatcher({
  //           pageUrl: {urlContains: 'www.bing.com/search?'},
  //         }),
  //         new chrome.declarativeContent.PageStateMatcher({
  //           pageUrl: {urlContains: 'duckduckgo.com/?q'},
  //         })
  //       ],
  //       actions: [new chrome.declarativeContent.ShowPageAction()]
  //     }]);
  //   });
	browser.runtime.onMessage.addListener((request, sender) => {
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

var numero = 5;

browser.storage.local.get("config").then(data => {
    if (!checkExpectedParameters(data.config)) {
        data.config = {
        	"apiUrl": ""
        };
        browser.storage.local.set({"config": data.config }).then(() => startBackground(data.config));
    }
    else startBackground(data.config);

});
