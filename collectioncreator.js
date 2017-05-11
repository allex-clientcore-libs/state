function createCollection(lib,StreamBuffer){
  'use strict';
  function Collection(){
    StreamBuffer.call(this);
  }
  lib.inherit(Collection,StreamBuffer);
  Collection.prototype.createContainer = function(){
    return new lib.ListenableMap();
  };
  Collection.prototype.nodeCtor = function(){
    return Collection;
  };
  return Collection;
}

module.exports = createCollection;
