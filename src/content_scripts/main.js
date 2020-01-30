class SearchResultParser {
  constructor(dom){
    var host = window.location.hostname;
    if (host == 'duckduckgo.com'){
      var parsedResults = new Array();
      // var resultados = dom.getElementById("links").querySelectorAll("div:not(#organic-module):not(.result):not(.result--more)");
      var divResults = dom.getElementById("links").childNodes;

      for (var i = 0; i < divResults.length; i++) {
        if (divResults[i].id != "organic-module" && divResults[i].className != "result result--more" && divResults[i].className != "js-result-hidden-el"){
          parsedResults.push({
            "urlsrc": host,
            "urltarget": divResults[i].querySelector(".result__title").querySelector(".result__a").href,
            "text": divResults[i].querySelector(".result__title").innerText,
            "rank": i
          });
        }
      }
      console.log(parsedResults);
      // resultados.forEach(resultado => {
      //   titulos.push(resultado.querySelector(".result__title").querySelector(".result__a").innerHTML);
      // });
    }
    this.results = parsedResults;
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
