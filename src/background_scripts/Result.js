export default class Result {
  constructor(urlsrc, urltarget, text, rank){
    this.urlsrc = urlsrc;
    this.urltarget = urltarget;
    this.text = text;
    this.rank = rank;
  }

  get urlsrc (){
    return this.urlsrc;
  }

  get urltarget (){
    return this.urltarget;
  }

  get text (){
    return this.text;
  }

  get rank (){
    return this.rank;
  }
}
