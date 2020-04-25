class ContentPageManager{
  constructor(){
    this.peersCount = 0;
    this.matchedResults = new Array(100).fill(0);
  }
  extractSearchString(args){
    var searchString = document.getElementsByName("q")[0].value;
    var resultsparser = new SearchResultParser(document);
    allresults.push(resultsparser.results);

    browser.runtime.sendMessage({
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
    window.onload = browser.runtime.sendMessage({
                      "call": "sendResultsToMainContent",
                      "args": {
                        "searchresults": resultsparser.results,
                        "originaltabid": args.originaltabid,
                        "newtabid": args.newtabid
                      }
                    });
  }

  extractSearchResultsForPeer(){
    var resultsparser = new SearchResultParser(document);
    return resultsparser.results;
  }

  updateCurrentDOM(args){
    var host = window.location.hostname;
    allresults.push(args.searchresults);

    this.updateContentOfDomain({
      "host": host,
      "searchresults": args.searchresults
    });
  }

  updateContentOfDomain(args){
    var resultsparser = new SearchResultParser(document);
    var currentresults = resultsparser.results;

    var parsingFromPeer = (args.host == args.searchresults[0].urlsrc);

    var divResults = this.getResultsFromCurrentDOM(args.host);
    var div = document.createElement("div");

    if (!parsingFromPeer){
      var img = this.createLogo(args.searchresults[0].urlsrc);
      div.appendChild(img);
    } else {
      this.peersCount++;
    }

    div.style.float = "left";
    div.style.width = "14%";


    for (var i = 0; i < currentresults.length; i++) {
      var j = 0;
      var go = true;
      while ((j < args.searchresults.length) && (go)) {
        if (currentresults[i].equals(args.searchresults[j]))
        {
          go = false;
        }
        else {
          j++;
        }
      }
      if (parsingFromPeer){
        if (divResults[i].querySelector("#p2pComparisson") == null){
          if (j != args.searchresults.length){
            this.matchedResults[i]++;
          }
          var span = this.createRank(this.matchedResults[i] + " of " + this.peersCount);
          span.style.float = "left";
          //width?
          span.id = "p2pComparisson";
          this.appendToResult(span, divResults[i], args.host);
        }
        else {
          if (j != args.searchresults.length){
            this.matchedResults[i]++;
          }
          divResults[i].querySelector("#p2pComparisson").textContent = this.matchedResults[i] + " of " + this.peersCount;
        }
      }
      else {
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
      imgelem.src = browser.runtime.getURL("resources/duckduckgologo48.png");
    }
    if (url == "www.bing.com") {
      imgelem.src = browser.runtime.getURL("resources/binglogo48.png");
    }
    if (url == "www.google.com") {
      imgelem.src = browser.runtime.getURL("resources/googlelogo48.png");
    }

    imgelem.title = "logo";
    imgelem.alt = "logo";
    imgelem.style.padding = "4px";

    return imgelem;
  }
}
function startExtension(){
  // setTimeout(function () {
  browser.runtime.sendMessage({
                      "call": "startExtension",
                    });
  // }, 2000);
}
var pageManager = new ContentPageManager();
var allresults = new Array();
browser.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.call == "extractSearchResultsP2P"){
      var searchResults =pageManager.extractSearchResultsForPeer();
      sendResponse({
        results: searchResults
      });
    }
    else {
      if(request.call == "devolverNumero"){
        sendResponse({
          results: allresults
        });
      }
      else {
        if(pageManager[request.call]){
           pageManager[request.call](request.args);
        }
      }
    }
  }
);


window.onload = browser.storage.local.get('expandSearch', function (items) {
                  if(items.expandSearch == 0){
                    startExtension();
                  }
                });
