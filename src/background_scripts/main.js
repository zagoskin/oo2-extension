class BackgroundExtension{
  getCurrentTab(callback) {
    var theTab;
		return chrome.tabs.query({active: true,	currentWindow: true}, function(tabs) {
      callback(tabs[0])
    });
	}

  saySomething(tab){
    chrome.tabs.sendMessage(tab.id, {
      call: "hola",
      args: {phrase: "hello"}
    });
    console.log("dentro de saySomething");
	}
}

var startBackground = function(config) {
	var extension = new BackgroundExtension(config.apiUrl);
  console.log("iniciando background script");
	chrome.browserAction.onClicked.addListener(() => {
	  extension.getCurrentTab(extension.saySomething);
	});

	// chrome.runtime.onMessage.addListener((request, sender) => {
	// 	console.log("[background-side] calling the message: " + request.call);
	// 	if(extension[request.call]){
	// 		return extension[request.call](request.args);
	// 	}
	// });
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
