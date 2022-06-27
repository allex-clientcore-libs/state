function createStreamBufferCtor(lib,StreamSource,StreamDecoder,StreamDistributor,StreamCoder){
  'use strict';
  function StateStreamPathMismatchError(path,itemindex){
    var ret = new lib.Error('STATE_STREAM_PATH_MISMATCH','Path item '+path[itemindex]+' does not point to a State SubCollection');
    ret.path = path.slice();
    ret.itemindex = itemindex;
    return ret;
  }
  lib.inherit(StateStreamPathMismatchError,lib.Error);

  function StreamBuffer(){
    StreamSource.call(this); //do not destroy sink - that is the StreamDistributor - by default
    StreamDecoder.call(this);
    this.stream = new StreamDistributor();
    this.data = this.createContainer();
    StreamSource.prototype.setSink.call(this,this.stream);
  }
  lib.inherit(StreamBuffer,StreamSource);
  StreamBuffer.prototype.destroy = function(){
    //TODO: notify destruction of all
    this.data.destroy();
    this.data = null;
    this.stream.destroy();
    this.stream = null;
    StreamDecoder.prototype.destroy.call(this);
    StreamSource.prototype.destroy.call(this);
  };
  StreamBuffer.prototype.createContainer = function(){
    throw "StreamBuffer has no generic Container creator";
  };
  StreamBuffer.prototype.nodeCtor = function(){
    throw "StreamBuffer has no generic NodeCtor";
  };
  StreamBuffer.prototype.onStream = StreamDecoder.prototype.onStream;
  StreamBuffer.prototype.onStreamCollectionCreated = function(path){
    this.set(path,new (this.nodeCtor()));
  };
  StreamBuffer.prototype.onStreamScalarCreated = function(path,value){
    this.set(path,value);
  };
  StreamBuffer.prototype.onStreamScalarUpdated = function(path,value,oldvalue){
    this.set(path,value);
  };
  StreamBuffer.prototype.onStreamCollectionRemoved = function(path){
    this.remove(path);
  };
  StreamBuffer.prototype.onStreamScalarRemoved = function(path,lastvalue){
    this.remove(path);
  };
  StreamBuffer.prototype.setSink = function(handler){
    this.dump(handler);
    return this.stream.attach(handler);
  };
  StreamBuffer.prototype.upsert = function(name,val,namearray,target){
    var old, ret;
    if (!this.data) {
      return;
    }
    var old = this.data.replace(name, val);
    if (old!==val) {
      ret = target.updateScalar.bind(target,namearray,val,old);
      target = null;
      namearray = null;
      val = null;
      return ret;
    }
    ret = val instanceof this.nodeCtor() ? target.newCollection.bind(target,namearray) : target.newScalar.bind(target,namearray,val);
    target = null;
    namearray = null;
    val = null;
    return ret;
  };
  StreamBuffer.prototype.createIfNotExists = function(createobj,name,nameindex,namearry){
    var target, item, und, slc;
    if(nameindex>=namearry.length-1){
      createobj.events.push(createobj.target.upsert(name,createobj.val,namearry,this));
      return;
    }
    target=createobj.target;
    if(!(target.data && 'function' === typeof target.data.get)){
      throw new lib.Error(namearry,nameindex);
    }
    item = target.data.get(name);
    if(item===und){
      if('function' !== typeof target.data.add){
        throw new lib.Error(namearry,nameindex);
      }
      item = new (this.nodeCtor());
      target.data.add(name,item);
      slc = namearry.slice(0,nameindex+1);
      createobj.events.push(this.newCollection.bind(this,slc));
      slc = null;
    }
    createobj.target = item;
  };
  function _executor(e) {
    e();
  }
  StreamBuffer.prototype.set = function(name,val){ //throws
    var ton = typeof name, ups, createobj;
    if('string' === ton || name instanceof String){
      ups = this.upsert(name,val,[name],this);
      if (ups) {
        ups();
      }
    }else if('object' === ton && name instanceof Array){
      try{
        createobj = {target:this,events:[],val:val};
        name.forEach(this.createIfNotExists.bind(this,createobj));
        createobj.events.forEach(_executor);
        createobj.target = null;
        createobj.events = null;
        createobj = null;
      }
      catch(er){
        console.error(er);
      }
    }
    return val;
  };
  StreamBuffer.prototype.getInner = function(name,index,collection){
    if(index===name.length-1){
      return collection.get(name[index]);
    }
    collection = collection.get(name[index]);
    if(collection){
      return this.getInner(name,index+1,collection);
    }
    return;
  };
  StreamBuffer.prototype.get = function(name){
    if(!this.data){
      return null;
    }
    if(typeof name==='string'){
      return this.data.get(name);
    }
    if(name instanceof Array){
      return this.getInner(name,0,this);
    }
  };
  StreamBuffer.prototype.reportRemoval = function(name,removeret){
    if('undefined' !== typeof removeret){
      if(removeret instanceof (this.nodeCtor())){
        this.removeCollection(name);
      }else{
        this.removeScalar(name,removeret);
      }
      //console.log(name,'removed =>',removeret);
    }
  };
  StreamBuffer.prototype.actualRemove = function(name){
    if (!this.data) {
      return;
    }
    var removeret = this.data.remove(name);
    this.reportRemoval([name],removeret);
    return removeret;
  };
  StreamBuffer.prototype.remove = function(name,index,collection){
    if (!this.data) {
      return;
    }
    var ton = typeof name;
    if('string' === ton || name instanceof String){
      return this.actualRemove(name);
    }else{
      collection = collection||this;
      //console.log('current collection is',collection,'on',name,index,name[index]);
      index = index||0;
      if(index === name.length-1){
        var ret = collection.actualRemove(name[index]);
        if(index>0){
          this.reportRemoval(name,ret);
        }
        return ret;
      }else{
        var di = collection.data.get(name[index]);
        if('undefined' !== typeof di){
          return this.remove(name,index+1,di);
        }else{
          return;
        }
      }
    }
  };
  //static
  function doItem(path,item,itemname){
    if('object' === typeof item){
      path.push(itemname);
      lib.traverse(item,doItem.bind(this,path));
      path.pop();
      path = null;
      return;
    }
    path.push(itemname);
    this.set(path,item);
    path.pop();
  }
  StreamBuffer.prototype.loadHash = function(hash){
    lib.traverse(hash,doItem.bind(this,[]));
  };
  function StreamBufferDumper(coll,sink,start,length){
    var emptyarry = [];
    this.sink = sink;
    if('undefined' !== typeof start && 'undefined' !== typeof length){
      coll.data.page(this.onItem.bind(this,emptyarry),start,length);
      emptyarry = null;
      return;
    }
    coll.data.traverse(this.onItem.bind(this,emptyarry));
    emptyarry = null;
  }
  lib.inherit(StreamBufferDumper,StreamCoder);
  StreamBufferDumper.prototype.destroy = function(){
    this.sink = null;
    StreamCoder.prototype.destroy.call(this);
  };
  StreamBufferDumper.prototype.newCollection = function(path){
    this.sink.onStream(StreamCoder.prototype.newCollection.call(this,path));
  };
  StreamBufferDumper.prototype.newScalar = function(path,value){
    this.sink.onStream(StreamCoder.prototype.newScalar.call(this,path,value));
  };
  StreamBufferDumper.prototype.onItem = function(path,item,name){
    if(item && 'function' === typeof item.nodeCtor && item instanceof item.nodeCtor()){
      path.push(name);
      this.newCollection(path);
      item.data.traverse(this.onItem.bind(this,path));
      path.pop(name);
      path = null;
      return;
    }
    path.push(name);
    this.newScalar(path,item);
    path.pop();
  };
  StreamBuffer.prototype.dump = function(func){
    var d = new StreamBufferDumper(this,func);
    d.destroy();
    //return this.data.traverseConditionally(dumper.bind(null,func,path||[]));
  };
  StreamBuffer.prototype.digestHash = function(hash){
    var ss = new StreamSource(),
      f = StreamSource.chain([ss,this]);
    ss.doHash(hash);
    f.destroy();
    ss.destroy();
  };
  return StreamBuffer;
}

module.exports = createStreamBufferCtor;
