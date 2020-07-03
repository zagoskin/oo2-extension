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
    var divResults = dom.querySelector("div.results--main").querySelectorAll(".result__title");

    for (var i = 0; i < divResults.length; i++) {
      parsedResults.push(new Result('duckduckgo.com', divResults[i].querySelector(".result__a").href, divResults[i].querySelector(".result__a").textContent, parsedResults.length));
    }
    return parsedResults;
  }

  parseFromBing(dom){
    var parsedResults = new Array();

    var divResults = dom.getElementById("b_results").childNodes;
    for (var i = 0; i < divResults.length; i++) {
      if (divResults[i].className != "b_pag" && divResults[i].className != "b_ans"){
        parsedResults.push(new Result('www.bing.com', divResults[i].querySelector("a").href, divResults[i].querySelector("a").textContent, parsedResults.length));
      }
    }

    return parsedResults;
  }

  parseFromGoogle(dom){
    var parsedResults = new Array();

    var divResults = dom.getElementById("search").querySelectorAll("div.r");
    for (var i = 0; i < divResults.length; i++) {
      parsedResults.push(new Result('www.google.com', divResults[i].querySelector("a").href, divResults[i].querySelector("a").querySelector("h3").textContent, parsedResults.length));
    }

    return parsedResults;
  }

}
