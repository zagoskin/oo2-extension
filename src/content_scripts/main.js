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

  updateContentOfDomain(args){
    var divResults = this.getResultsFromCurrentDOM(args.host);

    var div = document.createElement("div");

    var img = this.createLogo(args.searchresults[0].urlsrc);

    div.style.float = "left";
    div.style.width = "14%";
    div.appendChild(img);

    for (var i = 0; i < divResults.length; i++) {
      var j = 0;

      while ((j < args.searchresults.length) && (this.getHrefFromResult(divResults[i], args.host) != args.searchresults[j].urltarget)) {
        j++;
      }

      if (j == args.searchresults.length){
        var span = this.createRank("X");
      }
      else {
        var span = this.createRank(j+1);
      }

      var newDiv = div.cloneNode(true);
      newDiv.appendChild(span);
      this.appendToResult(newDiv, divResults[i], args.host);
      this.addBorderToResult(divResults[i], args.host);

    }
  }

  appendToResult(newDiv, divresult, currentHostname){
    if (currentHostname == "www.google.com") {
      divresult.appendChild(newDiv);
    }
    if (currentHostname == "www.bing.com") {
      divresult.appendChild(newDiv);
    }
    if (currentHostname == "duckduckgo.com") {
      divresult.parentNode.appendChild(newDiv);
    }
  }

  addBorderToResult(divresult, currentHostname){
    if (currentHostname == "www.google.com"){
      divresult.parentNode.style.border = "thin dotted red";
      divresult.parentNode.style.padding = "10px"
      divresult.parentNode.style.marginBottom = "20px";
    }
    if (currentHostname == "www.bing.com"){
      divresult.style.border = "thin dotted red";
      divresult.style.marginBottom = "20px";
    }
    if (currentHostname == "duckduckgo.com"){
      divresult.parentNode.style.border = "thin dotted red";
      divresult.parentNode.style.marginBottom = "20px";
    }

  }

  getHrefFromResult(divresult, currentHostname){

    if (currentHostname == "www.google.com"){
      return divresult.querySelector("a").href;
    }
    if (currentHostname == "www.bing.com"){
      return divresult.querySelector("a").href;
    }
    if (currentHostname == "duckduckgo.com"){
      return divresult.querySelector(".result__a").href;
    }
  }

  getResultsFromCurrentDOM(host){
    if (host == "www.google.com"){
        return document.getElementById("search").querySelectorAll("div.r");
    }
    if (host == "www.bing.com"){
        return document.getElementById("b_results").querySelectorAll("li.b_ad, li.b_algo, li.b_ans.b_mop");
    }
    if (host == "duckduckgo.com"){
        return document.querySelector("div.results--main").querySelectorAll(".result__title");
    }
  }

  createRank(textcontent){
    var spanelem = document.createElement("span");

    spanelem.textContent = textcontent;
    spanelem.style.borderRadius = "50%";
    spanelem.style.width = "24px";
    spanelem.style.height = "24px";
    spanelem.style.lineHeight = "24px";
    spanelem.style.textAlign = "center";
    if (textcontent != "X") {
      spanelem.style.background = "#81f090";
    }
    else {
      spanelem.style.background = "#f26d66";
    }
    spanelem.style.position = "absolute";
    spanelem.style.fontSize = "16px";
    spanelem.style.color = "fff";
    spanelem.style.fontWeight = "650";

    return spanelem;
  }

  createLogo(url){
    var imgelem = document.createElement("img");

    if (url == "duckduckgo.com") {
      imgelem.src = "chrome-extension://pegagencoflfghdhhihallhncmdojpgp/resources/duckduckgologo48.png";
    }
    if (url == "www.bing.com") {
      imgelem.src = "chrome-extension://pegagencoflfghdhhihallhncmdojpgp/resources/binglogo48.png";
    }
    if (url == "www.google.com") {
      imgelem.src = "chrome-extension://pegagencoflfghdhhihallhncmdojpgp/resources/googlelogo48.png";
    }

    imgelem.title = "logo";
    imgelem.alt = "logo";
    imgelem.style.padding = "4px";

    return imgelem;
  }
}
function startExtension(){
  setTimeout(function () {
    chrome.runtime.sendMessage({
                      "call": "startExtension",
                    });
  }, 2000);
}
var pageManager = new ContentPageManager();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(pageManager[request.call]){
       pageManager[request.call](request.args);
    }
  }
);

window.onload = startExtension();
