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
  // alertHola(){
  //   console.log("hola!");
  // }
  extractSearchString(args){
    var searchString = document.getElementsByName("q")[0].value;

    chrome.runtime.sendMessage({
      "call": "retrieveSearchResults",
      "args": {
        "keywords": searchString,
        "hostname": args.hostname,
        "originaltabid": args.originaltabid
      }
    });
  }

  extractSearchResults(args){
    var resultsparser = new SearchResultParser(document);
    window.onload = chrome.runtime.sendMessage({
                      "call": "sendResultsToMainContent",
                      "args": {
                        "searchresults": resultsparser.results,
                        "originaltabid": args.originaltabid,
                        "newtabid": args.newtabid
                      }
                    });
  }

  updateCurrentDOM(args){
    var host = window.location.hostname;

    this.updateContentOfDomain({
      "host": host,
      "searchresults": args.searchresults
    });
  }

  updateDuckDuckGo(searchresults){

  }

  updateBing(searchresults){

  }

  updateGoogle(searchresults){
    var divResults = document.getElementById("search").querySelectorAll("div.r");

    var div = document.createElement("div");

    var img = this.createLogo(searchresults[0].urlsrc);
    var span = document.createElement("span");
    span.textContent = "5";
    span.style.width = "16px";
    span.style.height = "16px";
    span.style.position = "absolute";
    span.style.fontSize = "16px";
    span.style.color = "fff";
    span.style.fontWeight = "900";

    div.style.float = "left";
    div.style.width = "14%";
    div.appendChild(img);
    div.appendChild(span);
    for (var i = 0; i < divResults.length; i++) {
      // divResults[i].style.overflow = "hidden";
      // divResults[i].querySelector("h3").style.float = "left";
      divResults[i].appendChild(div.cloneNode(true));
    }

  }

  createLogo(url){
    var imgelem = document.createElement("img");

    if (url == "duckduckgo.com"){
      imgelem.src = "chrome-extension://pegagencoflfghdhhihallhncmdojpgp/resources/duckduckgologo48.png";
    }
    if (url == "www.bing.com"){
      imgelem.src = "chrome-extension://pegagencoflfghdhhihallhncmdojpgp/resources/binglogo48.png";
    }
    //falta la de google
    imgelem.title = "logo";
    imgelem.alt = "logo";
    imgelem.style.padding = "4px";

    return imgelem;
  }

  updateContentOfDomain(args){
    if (args.host == 'duckduckgo.com'){
      this.updateDuckDuckGo(args.searchresults);
    }

    if (args.host == 'www.bing.com'){
      this.updateBing(args.searchresults);
    }

    if (args.host == 'www.google.com'){
      this.updateGoogle(args.searchresults);
    }
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
