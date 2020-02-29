class Result {
  constructor(urlsrc,urltarget,text,rank){
    this.urlsrc = urlsrc;
    this.urltarget = urltarget;
    this.text = text;
    this.rank = rank;
  }

  equals (resultado) {
    resultado = new Result(resultado.urlsrc,resultado.urltarget,resultado.text,resultado.rank);

    return ((this.extractDomainFromTarget() == resultado.extractDomainFromTarget()) && (this.text.substring(0,30) == (resultado.text.substring(0,30))));
  }

  extractDomainFromTarget() {
    var url = this.urltarget;
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
      domain = url.split('/')[2];
    }
    else {
      domain = url.split('/')[0];
    }

    //find & remove www
    if (domain.indexOf("www.") > -1) {
      domain = domain.split('www.')[1];
    }

    domain = domain.split(':')[0]; //find & remove port number
    domain = domain.split('?')[0]; //find & remove url params

    return domain;
  }
}
