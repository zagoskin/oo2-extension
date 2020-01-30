class SearchResultParser {
  constructor(dom){
    var host = window.location.hostname;
    if (host == 'duckduckgo.com'){
      var titulos = new Array();
      // var resultados = dom.getElementById("links").querySelectorAll("div:not(#organic-module):not(.result):not(.result--more)");
      var resultados = dom.getElementById("links").childNodes;

      for (var i = 0; i < resultados.length; i++) {
        if (resultados[i].id != "organic-module" && resultados[i].className != "result result--more" && resultados[i].className != "js-result-hidden-el"){
          titulos.push(resultados[i]);
        }
      }
      console.log(titulos);
      // resultados.forEach(resultado => {
      //   titulos.push(resultado.querySelector(".result__title").querySelector(".result__a").innerHTML);
      // });
    }
    this.urlsrc = 'hola';
    this.urltarget = 'hola';
    this.text = titulos;
    this.rank = 'hola';
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
    var result = new SearchResultParser(document);
    alert(result.text);
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
