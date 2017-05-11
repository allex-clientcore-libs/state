function createLimitedLiveData(lib,Collection){
  'use strict';
  function LimitedCollection(limit){
    Collection.call(this);
    this.limit = limit;
  }
  lib.inherit(LimitedCollection,Collection);
  LimitedCollection.prototype.set = function(){
    if(this.data.count>=this.limit){
      return;
    }
    return Collection.prototype.set.apply(this,arguments);
  };
  return LimitedCollection;
}

module.exports = createLimitedLiveData;
