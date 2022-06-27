function createStreamPathListener(lib,StreamSource, Stream2Map){
  'use strict';
  function ListenerBundle(len){
    Stream2Map.call(this);
    this.targetlen = len;
  }
  lib.inherit(ListenerBundle,Stream2Map);
  ListenerBundle.prototype.destroy = function(){
    this.targetlen = null;
    Stream2Map.prototype.destroy.call(this);
  };
  ListenerBundle.prototype.satisfied = function(){
    return this.map.count===this.targetlen;
  };

  function StreamPathListener(pathmask,destroysinktoo){
    StreamSource.call(this,destroysinktoo);
    this.pathmask = pathmask;
    if(!(this.pathmask && lib.isArray(this.pathmask))){
      throw 'StreamPathListener needs a pathmask in constructor';
    }
    this.masklen = this.pathmask.length;
    var lastmaskelement = this.pathmask[this.masklen-1];
    if(lib.isArray(lastmaskelement)){
      this.bundle = new ListenerBundle(lastmaskelement.length);
    }
  };
  lib.inherit(StreamPathListener,StreamSource);
  StreamPathListener.prototype.destroy = function(){
    if(!this.pathmask){
      return;
    }
    if(this.bundle){
      this.bundle.destroy();
      this.bundle = null;
    }
    this.masklen = null;
    this.pathmask = null;
    StreamSource.prototype.destroy.call(this);
  };
  function comparer(path,pathmitem,index){
    return path[index]===pathmitem;
  }
  function bundleComparer(spl,item,pathmitem,index){
    if(spl.masklen-1===index){
      var pathitem = item.p[index];
      if(pathmitem.indexOf(pathitem)>=0){
        spl.bundle.onStream({
          p:[pathitem],
          o:item.o,
          d:item.d
        });
        return true;
      }
    }else{
      return comparer(item.p,pathmitem,index);
    }
  }
  StreamPathListener.prototype.onStream = function(item){
    if(!item.p){
      return;
    }
    var path = item.p;
    if(path.length!==this.masklen){
      return;
    }
    if(this.bundle){
      var originallysatisfied = this.bundle.satisfied();
      if(this.pathmask.every(bundleComparer.bind(null,this,item))){
        var satisfiednow = this.bundle.satisfied();
        if(satisfiednow){
          if(!originallysatisfied){
            this.handleStreamItem({
              p: item.p,
              o: 's',
              d: this.bundle.map
            });
          }else{
            this.handleStreamItem({
              p: item.p,
              o: 'u',
              d: this.bundle.map
            });
          }
        }else{
          if(originallysatisfied){
            this.handleStreamItem({
              p: item.p,
              o: 'sr',
              d: this.bundle.map
            });
          }
        }
      }
    }else{
      if(this.pathmask.every(comparer.bind(null,path))){
        this.handleStreamItem(item);
      }
    }
    item = null;
    path = null;
  };
  return StreamPathListener;
}

module.exports = createStreamPathListener;
