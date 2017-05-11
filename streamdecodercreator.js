function createStreamDecoder(lib,StreamSink){
  'use strict';
  function StreamDecoder(){
    StreamSink.call(this);
  }
  lib.inherit(StreamDecoder,StreamSink);
  StreamDecoder.prototype.onStream = function(item){
    if(item.o==='c'){
      this.onStreamCollectionCreated(item.p);
    }else if(item.o==='s'){
      if (!this.onStreamScalarCreated) {
        console.trace();
        console.error('dafuq am I?', this);
        process.exit(0);
        return;
      }
      this.onStreamScalarCreated(item.p,item.d);
    }else if(item.o==='u'){
      this.onStreamScalarUpdated(item.p,item.d[0],item.d[1]);
    }else if(item.o==='cr'){
      this.onStreamCollectionRemoved(item.p);
    }else if(item.o==='sr'){
      this.onStreamScalarRemoved(item.p,item.d);
    }
  };
  StreamDecoder.prototype.onStreamCollectionCreated = function(path){
  };
  StreamDecoder.prototype.onStreamScalarCreated = function(path,value){
  };
  StreamDecoder.prototype.onStreamScalarUpdated = function(path,value,oldvalue){
  };
  StreamDecoder.prototype.onStreamCollectionRemoved = function(path){
  };
  StreamDecoder.prototype.onStreamScalarRemoved = function(path,lastvalue){
  };
  return StreamDecoder;
}

module.exports = createStreamDecoder;
