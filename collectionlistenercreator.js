function createCollectionListener(lib,StreamPathListener){
  'use strict';
  function CollectionListener(pathmask, destroysinktoo){
    StreamPathListener.call(this, pathmask, destroysinktoo);
  }
  lib.inherit(CollectionListener,StreamPathListener);
  CollectionListener.prototype.onItem = function(item){
    console.trace();
    var o = item.o;
    if(o[0] === 'c'){
      this.handleStreamItem(item);
    }
  };
  return CollectionListener;
}

module.exports = createCollectionListener;
