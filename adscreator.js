function createADS(lib,StreamDecoder
/*all ctors after this are for the helper function(s) listenToScalar(s),listenToCollection(s)*/
  ,StreamSource,StreamPathListener,StreamCollectionListener,StreamScalarListener){
  'use strict';
  function ADS(listenerpack){
    StreamDecoder.call(this);
    this.ctx = listenerpack.ctx || this;
    if(listenerpack.activator){
      this.a = listenerpack.activator;
    }
    if(listenerpack.setter){
      this.s = listenerpack.setter;
    }
    if(listenerpack.deactivator){
      this.d = listenerpack.deactivator;
    }
    if(listenerpack.rawsetter){
      this.r = listenerpack.rawsetter;
    }
  }
  lib.inherit(ADS,StreamDecoder);
  ADS.prototype.destroy = function(){
    if(this.a){
      this.a = null;
    }
    if(this.s){
      this.s = null;
    }
    if(this.r){
      this.r = null;
    }
    if(this.d){
      this.d = null;
    }
  };
  ADS.prototype.onStreamCollectionCreated = function(path){
    if(this.a){
      this.a.call(this.ctx,path);
    }
  };
  ADS.prototype.onStreamScalarCreated = function(path,value){
    if(this.a){
      this.a.call(this.ctx,path);
    }
    if(this.s){
      this.s.call(this.ctx,path,value,void 0);
    }
    if(this.r){
      this.r.call(this.ctx,value,void 0);
    }
  };
  ADS.prototype.onStreamScalarUpdated = function(path,value,oldvalue){
    if(this.s){
      this.s.call(this.ctx,path,value,oldvalue);
    }
    if(this.r){
      this.r.call(this.ctx,value,oldvalue);
    }
  };
  ADS.prototype.onStreamCollectionRemoved = function(path){
    if(this.d){
      this.d.call(this.ctx,path);
    }
  };
  ADS.prototype.onStreamScalarRemoved = function(path,lastvalue){
    if(this.s){
      this.s.call(this.ctx,path,void 0,lastvalue);
    }
    if(this.r){
      this.r.call(this.ctx,void 0,lastvalue);
    }
    if(this.d){
      this.d.call(this.ctx,path);
    }
  };
  function compose(listenerctor,path,listenerpack){
    var l = new listenerctor(path,true);
    if(!listenerpack.ctx){
      listenerpack.ctx = l;
    }
    return StreamSource.chain([
      l,
      new ADS(listenerpack)
    ]);
  }
  ADS.listenToScalar = function(path,listenerpack){
    return compose(StreamScalarListener,path,listenerpack);
  };
  ADS.listenToCollection = function(path,listenerpack){
    return compose(StreamCollectionListener,path,listenerpack);
  };
  return ADS;
}

module.exports = createADS;
