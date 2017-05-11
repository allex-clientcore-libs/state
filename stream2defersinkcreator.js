function createStream2Defer(lib,StreamSink){
  'use strict';
  function Stream2Defer(defer){
    lib.Destroyable.call(this);
    this.defer = defer;
  }
  lib.inherit(Stream2Defer,lib.Destroyable);
  Stream2Defer.prototype.__cleanUp = function(){
    this.defer.resolve('end');
    this.defer = null;
    lib.Destroyable.prototype.__cleanUp.call(this);
  };
  Stream2Defer.prototype.onStream = function(item){
    this.defer.notify(item);
  };
  return Stream2Defer;
}

module.exports = createStream2Defer;

