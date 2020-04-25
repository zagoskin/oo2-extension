class Searcher {
  constructor(){
    this.hostnames =  new Array("www.google.com", "www.bing.com", "duckduckgo.com");
  }

  searchUrlForDomain(keyword, hostname){
    var searchUrl;
    if (hostname == "duckduckgo.com") {
      searchUrl ='https://' + hostname + '/?q=' + keyword;

    }
    else {
      searchUrl ='https://' + hostname + '/search?q=' + keyword;
    }
    return searchUrl;
  }

  searchKeyword (keyword){

    var searchurls = new Array();
    this.hostnames.forEach(function(hostname){

      if (hostname == "duckduckgo.com") {
        var url ='https://' + hostname + '/?q=' + keyword;
        searchurls.push(url)
      }
      else {
        var url ='https://' + hostname + '/search?q=' + keyword;
        searchurls.push(url)
      }
    });
    return searchurls;
  }

  searchWithoutDomain (keyword,domain){

    var searchurls = new Array();
    var newHosts = this.hostnames.slice();
    newHosts.splice(newHosts.indexOf(domain),1);

    newHosts.forEach(function(hostname){

      if (hostname == "duckduckgo.com") {
        var url ='https://' + hostname + '/?q=' + keyword;
        searchurls.push(url)
      }
      else {
        var url ='https://' + hostname + '/search?q=' + keyword;
        searchurls.push(url)
      }
    });
    return searchurls;
  }
}
