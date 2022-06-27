function createStreamPathListener(lib,StreamSource, Stream2Map){
  'use strict';
  function StringComparer(str){
    this.string = str;
  }
  StringComparer.prototype.destroy = function(){
    this.string = null;
  };
  StringComparer.prototype.matches = function(string){
    return this.string === string;
  };
  StringComparer.prototype.criterion = function () {
    return this.string;
  }
  function RegExpComparer(regexp){
    this.regexp = regexp;
  }
  RegExpComparer.prototype.matches = function(string){
    return this.regexp.test(string);
  }
  RegExpComparer.prototype.criterion = function () {
    return this.regexp;
  };
  function ArrayComparer(arry){
    this.array = arry;
  }
  ArrayComparer.prototype.destroy = function(){
    this.array = null;
  };
  ArrayComparer.prototype.matches = function(string){
    return this.array.indexOf(string)>=0;
  };
  ArrayComparer.prototype.criterion = function () {
    return this.array;
  };
  function AllPassComparer(){
  }
  AllPassComparer.prototype.destroy = lib.dummyFunc;
  AllPassComparer.prototype.matches = function(){
    return true;
  };
  AllPassComparer.prototype.criterion = function () {
    return '*';
  };
  function createComparer(something){
    if(lib.isArray(something)){
      return new ArrayComparer(something);
    }
    if(lib.isString(something)){
      return new StringComparer(something);
    }
    if(something instanceof RegExp){
      return new RegExpComparer(something);
    }
    if(something === null){
      return new AllPassComparer;
    }
  }
  function StreamPathListener(pathmask,destroysinktoo){
    //console.trace();
    //console.log('new StreamPathListener', pathmask);
    StreamSource.call(this,destroysinktoo);
    this.pathmask = pathmask.map(createComparer);
    if(!(this.pathmask && lib.isArray(this.pathmask))){
      throw 'StreamPathListener needs a pathmask in constructor';
    }
    this.masklen = this.pathmask.length;
  };
  lib.inherit(StreamPathListener,StreamSource);
  StreamPathListener.prototype.destroy = function(){
    if(!this.pathmask){
      return;
    }
    lib.arryDestroyAll(this.pathmask);
    this.masklen = null;
    this.pathmask = null;
    StreamSource.prototype.destroy.call(this);
  };
  function comparer(path,pathmitem,index,pathm){
    if(!pathmitem){
      console.error("What's wrong with",pathm,"?!");
    }
    return pathmitem.matches(path[index]);
  }
  StreamPathListener.prototype.onStream = function(item){
    if(!item.p){
      return;
    }
    if(!this.masklen){
      return;
    }
    //console.log(item,'for',this.pathmask,this.masklen);
    //console.log(item,'for length of pathmask',this.masklen);
    var path = item.p;
    if(path.length!==this.masklen){
      //console.log('nok');
      return;
    }
    if(this.pathmask.every(comparer.bind(null,path))){
      this.handleStreamItemSuper(item);
    }/*else{
      //console.log(process.pid, 'nok', item.p, 'because', this.pathmask.map(function(item){return item.criterion();}));
    }*/
    path = null;
  };
  StreamPathListener.prototype.handleStreamItem = StreamPathListener.prototype.onStream;
  StreamPathListener.prototype.handleStreamItemSuper = function (item) {
    StreamSource.prototype.handleStreamItem.call(this, item);
  };
  return StreamPathListener;
}

module.exports = createStreamPathListener;
