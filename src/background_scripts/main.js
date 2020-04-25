class BackgroundExtension extends AbstractP2PExtensionBackground{
  // decirHola(){
  //   console.log("hola");
  // }
  peers = [];

  constructor(){
		super();
	}

  startExtension(){
    this.getCurrentTab(this.extractSearchString);
  }

  getExtensionName(){
		return "bubblePop";
	}

	getExtensionId(){
		return "bubblePop@info";
	}

  getCurrentTab(callback) {
    var theTab;
		return browser.tabs.query({active: true,	currentWindow: true}, function(tabs) {
      callback(tabs[0])
    });
	}

  getCurrentTabFF(callback) {
		return browser.tabs.query({
			active: true,
			currentWindow: true
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

    try {
			this.sendRequest({
				'hostname': args.hostname,
        'keywords': args.keywords,
				automatic:true,
				withoutcheck:true
			  },"All");
		}catch(error){
			     console.log("Error al utilizar sendurl");
	  }

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
  }

  setPeers(event){
		self = extension;
		try {
			let listaUsuarios = extension.getDataCallBack();
			console.log('Usuarios peers');
			console.log(listaUsuarios);
			self.peers = [];
			for (let i in listaUsuarios){
				if (listaUsuarios.hasOwnProperty(i)){
				  self.peers.push(listaUsuarios[i]);
				}
			};
		} catch(e) {
				console.log("Error al cargar lista de usuarios");
				console.log(e);
		}
  }

  async automaticProcessing(msg , peer){
    //BUSCAR RESULTADOS DE SEARCH DEL DOMAIN QUE VIENE POR MENSAJE
    var searcher = new Searcher();
    var searchUrl = searcher.searchUrlForDomain(msg.keywords, msg.hostname);

    browser.tabs.create({'url': searchUrl}, function(tab){
      browser.tabs.onUpdated.addListener(function listener (tabId, info) {
        if (info.status === 'complete' && tabId === tab.id) {
          browser.tabs.onUpdated.removeListener(listener);
          browser.tabs.sendMessage(tab.id, {
            call: 'extractSearchResultsP2P'
          }, function(response) {
            this.sendResponse({
              'searchresults': response.results,
              automatic:true,
              withoutcheck:true
            },peer);

            browser.tabs.remove(tab.id);
            this.getCurrentTabFF().then((tabs) => {
        			browser.tabs.highlight({'tabs': tabs[0].index}, function() {});
        		});
          });
        }
      });
    });
  }
}
var extension;

var startBackground = async function(config) {
  browser.storage.local.set({
    expandSearch: 0
  });
	extension = new BackgroundExtension(config.apiUrl);
  extension.connect();

  await extension.getPeers(extension.setPeers);

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
