function createStream2Array(lib,StreamSink){
  'use strict';
  function Stream2Array(arry){
    lib.Destroyable.call(this);
    this.arry = arry || [];
  }
  lib.inherit(Stream2Array,lib.Destroyable);
  Stream2Array.prototype.__cleanUp = function(){
    this.arry = null;
    lib.Destroyable.prototype.__cleanUp.call(this);
  };
  Stream2Array.prototype.onStream = function(item){
    this.arry.push(item);
  };
  return Stream2Array;
}

module.exports = createStream2Array;
