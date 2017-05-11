function createStream2Map(lib,StreamDecoder){
  'use strict';

  function isAddable (thingy) {
    return thingy && (lib.isFunction(thingy.add) || lib.isFunction(thingy.set));
  }

  function addTo (addable, key, value) {
    if (lib.isFunction(addable.add)) {
      return addable.add(key, value);
    }
    if (lib.isFunction(addable.set)) {
      return addable.set(key, value);
    }
    throw new lib.Error('NOT_ADDABLE', 'Cannot add');
  }

  function replaceOn (replaceable, key, value) {
    if (lib.isFunction(replaceable.replace)) {
      return replaceable.replace(key, value);
    }
    if (lib.isFunction(replaceable.set)) {
      replaceable.set(key, null);
      return replaceable.set(key, value);
    }
  }

  function Stream2Map(map){
    StreamDecoder.call(this);
    this.mymap = null;
    this.map = null;
    if (map) {
      this.map = map;
      this.mymap = false;
    } else {
      this.map = new lib.Map();
      this.map.purge();
      this.mymap = true;
    }
  }
  lib.inherit(Stream2Map,StreamDecoder);
  Stream2Map.prototype.destroy = function(){
    if (this.mymap) {
      this.map.destroy();
    }
    this.map = null;
    this.mymap = null;
  };
  function pathTraverser(finalizer,mapobj,item,itemindex,path){
    if(!isAddable(mapobj.map)) {
      throw lib.Error("map not a map at itemindex "+itemindex);
    }
    if(itemindex<path.length-1){
      var c = mapobj.map.get(item);
      if(!c){
        c = new lib.Map();
        addTo(mapobj.map, item, c);
        //mapobj.map.add(item,c);
      }
      mapobj.map = c;
    }else{
      finalizer(mapobj,item);
    }
  }
  function collectionCreator(mapobj,item){
    addTo(mapobj.map, item, new lib.Map());
    //mapobj.map.add(item,new lib.Map());
  }
  function scalarCreator(mapobj,item){
    addTo(mapobj.map, item, mapobj.value);
    //mapobj.map.add(item,mapobj.value);
  }
  function scalarUpdater(mapobj,item){
    replaceOn(mapobj.map, item, mapobj.value);
    //mapobj.map.replace(item,mapobj.value);
  }
  function elementDeleter(mapobj,item){
    mapobj.map.remove(item);
  };
  Stream2Map.prototype.onStreamCollectionCreated = function(path){
    path.forEach(pathTraverser.bind(null,collectionCreator,{map:this.map}));
  };
  Stream2Map.prototype.onStreamScalarCreated = function(path,value){
    path.forEach(pathTraverser.bind(null,scalarCreator,{map:this.map,value:value}));
  };
  Stream2Map.prototype.onStreamScalarUpdated = function(path,value,oldvalue){
    path.forEach(pathTraverser.bind(null,scalarUpdater,{map:this.map,value:value}));
  };
  Stream2Map.prototype.onStreamCollectionRemoved = function(path){
    path.forEach(pathTraverser.bind(null,elementDeleter,{map:this.map}));
  };
  Stream2Map.prototype.onStreamScalarRemoved = function(path,lastvalue){
    path.forEach(pathTraverser.bind(null,elementDeleter,{map:this.map}));
  };
  return Stream2Map;
}

module.exports = createStream2Map;
