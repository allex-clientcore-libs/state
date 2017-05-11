function createSubServiceExtractor(lib,StreamSource){
  'use strict';

  function SubSinkDestroyedListener(sse, cb, sink, subservicename) {
    this.name = subservicename;
    this.sse = sse;
    this.item = null;
    this.cb = cb;
    this.listener = null;
    if (sse && sse.listeners && sink && sink.destroyed) {
      this.item = sse.listeners.add(this);
      this.listener = sink.destroyed.attach(this.destroy.bind(this));
      this.cb(sink);
    } else {
      this.destroy();
    }
  }
  SubSinkDestroyedListener.prototype.destroy = function() {
    //console.log('SubSinkDestroyedListener',this.name,'firing destroyed');
    if (!this.listener) {
      return;
    }
    this.listener.destroy();
    this.listener = null;
    this.cb();
    this.cb = null;
    this.sse.listeners.removeOne(this.item);
    this.item = null;
    this.sse = null;
    this.name = null;
  };

  function SubServiceExtractor(supersink,initmap,destroysinktoo){
    StreamSource.call(this,destroysinktoo);
    this.supersink = supersink;
    if(!(initmap && initmap.count)){
      //console.log('SubServiceExtractor will not work without init parameters in initmap');
    }
    this.initmap = initmap;
    this.listeners = new lib.SortedList();
    supersink.extendTo(this); //fasten the safety belt
  }
  lib.inherit(SubServiceExtractor,StreamSource);
  SubServiceExtractor.prototype.destroy = function(){
    //I might be called for several times
    if(!this.initmap){
      return;
    }
    if (this.listeners) {
      lib.containerDestroyAll(this.listeners);
      this.listeners.destroy();
    }
    this.listeners = null;
    this.initmap.destroy();
    this.initmap = null;
    this.supersink = null;
    StreamSource.prototype.destroy.call(this);
  };
  SubServiceExtractor.prototype.onStream = function(item){
    var p = item.p,
      subservicename,
      initparams;
    if(p && p.length===1 && p[0].indexOf('have')===0 && item.o==='s' && item.d===true) {
      subservicename = p[0].substring(4);
      initparams = this.initmap.get(subservicename);
      if(initparams){
        //console.log('SubServiceExtractor trying to subConnect to', subservicename, 'as', initparams);
        this.supersink.subConnect(subservicename,initparams.identity,initparams.propertyhash).done(
          this.onSubConnected.bind(this,initparams.cb,subservicename),
          this.onSubConnectFailed.bind(this,initparams.cb,subservicename)
        );
      }
    }
    this.handleStreamItem(item);
  };
  SubServiceExtractor.prototype.onSubConnected = function(cb,subservicename,sink){
    //console.log('SubServiceExtractor got',subservicename,'sink');
    new SubSinkDestroyedListener(this,cb,sink,subservicename);
  };
  SubServiceExtractor.prototype.onSubConnectFailed = function(cb,subservicename,reason){
    //console.error('SubServiceExtractor got',reason,'trying to subConnect to',subservicename);
    cb(null);
  };
  return SubServiceExtractor;
}

module.exports = createSubServiceExtractor;
