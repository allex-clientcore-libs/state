function createStreamPathModifier(lib,StreamSource){
  'use strict';
  function StreamPathModifier(modifierfunc,destroysinktoo){
    StreamSource.call(this,destroysinktoo);
    this.modifierfunc = modifierfunc;
  }
  lib.inherit(StreamPathModifier,StreamSource);
  StreamPathModifier.prototype.destroy = function(){
    this.modifierfunc = null;
    StreamSource.prototype.destroy.call(this);
  };
  StreamPathModifier.prototype.onStream = function(item){
    var originalp = item.p, p = this.modifierfunc(originalp);
    if(p instanceof Array){
      item.p = p;
      this.handleStreamItem(item);
      item.p = originalp;
    }
  };
  return StreamPathModifier;
}

module.exports = createStreamPathModifier;
