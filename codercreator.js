function createStateCoder(lib){
  'use strict';
  function StateCoder(){
  }
  StateCoder.prototype.destroy = lib.dummyFunc;
  StateCoder.prototype.newCollection = function(path){
    return {
      p:path.slice(),
      o:'c'
    };
  };
  StateCoder.prototype.newScalar = function(path,value){
    return {
      p:path.slice(),
      o:'s',
      d:value
    };
  };
  StateCoder.prototype.updateScalar = function(path,value,oldvalue){
    return {
      p: path.slice(),
      o:'u',
      d:[value,oldvalue]
    };
  };
  StateCoder.prototype.removeCollection = function(path){
    return {
      p: path.slice(),
      o:'cr'
    };
  };
  StateCoder.prototype.removeScalar = function(path,lastvalue){
    return {
      p: path.slice(),
      o:'sr',
      d:lastvalue
    };
  };
  return StateCoder;
}

module.exports = createStateCoder;
