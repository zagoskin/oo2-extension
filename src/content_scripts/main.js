class SearchResultParser {
  constructor(dom){
    var host = window.location.hostname;

    if (host == 'duckduckgo.com'){
      this.results = this.parseFromDuckDuckGo(dom);
    }

    if (host == 'www.bing.com'){
      this.results = this.parseFromBing(dom);
    }

    if (host == 'www.google.com'){
      this.results = this.parseFromGoogle(dom);
    }
  }

  parseFromDuckDuckGo(dom){
    var parsedResults = new Array();
    // var resultados = dom.getElementById("links").querySelectorAll("div:not(#organic-module):not(.result):not(.result--more)");
    var ads = dom.querySelector("div.results--main").querySelectorAll(".result__title");

    for (var i = 0; i < ads.length; i++) {
      parsedResults.push({
        "urlsrc": 'duckduckgo.com',
        "urltarget": ads[i].querySelector(".result__a").href,
        "text": ads[i].textContent,
        "rank": parsedResults.length
      });
    }

    return parsedResults;
  }

  parseFromBing(dom){
    var parsedResults = new Array();

    var divResults = dom.getElementById("b_results").childNodes;
    for (var i = 0; i < divResults.length; i++) {
      if (divResults[i].className != "b_pag" && divResults[i].className != "b_ans"){
        parsedResults.push({
          "urlsrc": 'www.bing.com',
          "urltarget": divResults[i].querySelector("a").href,
          "text": divResults[i].querySelector("a").textContent,
          "rank": parsedResults.length
        });
      }
    }

    return parsedResults;
  }

  parseFromGoogle(dom){
    var parsedResults = new Array();

    var divResults = dom.getElementById("search").querySelectorAll("div.r");
    for (var i = 0; i < divResults.length; i++) {
      parsedResults.push({
        "urlsrc": 'www.google.com',
        "urltarget": divResults[i].querySelector("a").href,
        "text": divResults[i].querySelector("a").querySelector("h3").textContent,
        "rank": parsedResults.length
      });
    }

    return parsedResults;
  }

}

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
    var resultsparser = new SearchResultParser(document);
    alert("hola");
    // alert(resultsparser.results);
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
