class Searcher {
  constructor(){
    this.hostnames =  new Array("www.google.com", "www.bing.com", "duckduckgo.com");
    this.results = [];
  }

  get results (){
    return this.results;
  }

  get hostnames (){
    return this.hostnames;
  }

  searchKeyword (keyword){
    var oReq = new XMLHttpRequest();
    oReq.onload = function(e) {
      oReq.onreadystatechange = function() {
        if (oReq.readystate == XMLHttpRequest.DONE){
          this.results.push(oReq.responseText);
          console.log(this.results());
        }
      };
      for (var i = 0; i < this.hostnames.length; i++){
        if (this.hostnames[i] == "duckduckgo.com") {
          oReq.open("GET", this.hostnames[i] + "/?q=" + keyword);
          oReq.send();
        }
        else {
          oReq.open("GET", this.hostnames[i] + "/search?q=" + keyword);
          oReq.send();
        }
      }
    }
  }
}
