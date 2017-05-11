function createScalarListener(lib,StreamPathListener){
  'use strict';
  function ScalarListener(pathmask, destroysinktoo){
    StreamPathListener.call(this, pathmask, destroysinktoo);
  }
  lib.inherit(ScalarListener,StreamPathListener);
  ScalarListener.prototype.onItem = function(item){
    var o = item.o;
    if(o[0]!=='c'){
      this.handleStreamItem(item);
    }
  };
  return ScalarListener;
}

module.exports = createScalarListener;
