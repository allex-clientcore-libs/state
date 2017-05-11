function createStateLib (lib) {
  'use strict';

  var streamlib = require('allex_streamclientcorelib')(lib),
      StateCoder = require('./codercreator')(lib),
      StateSource = streamlib.streamSourceCreator(StateCoder),
      State2Array = require('./stream2arraysinkcreator')(lib,streamlib.StreamSink),
      State2Defer = require('./stream2defersinkcreator')(lib,streamlib.StreamSink),
      StateDecoder = require('./streamdecodercreator')(lib,streamlib.StreamSink),
      State2Map = require('./stream2mapsinkcreator')(lib,StateDecoder),
      StatePathModifier = require('./streampathmodifiercreator')(lib,StateSource),
      StatePathListener = require('./streampathlistenercreator')(lib,StateSource,State2Map),
      StateCollectionListener = require('./collectionlistenercreator')(lib,StatePathListener),
      StateScalarListener = require('./scalarlistenercreator')(lib,StatePathListener),
      StateSubServiceExtractor = require('./subserviceextractorcreator')(lib,StateSource),
      ADS = require('./adscreator')(lib,StateDecoder,StateSource,StatePathListener,StateCollectionListener,StateScalarListener),
      StateBuffer = require('./streambuffercreator')(lib,StateSource,StateDecoder,streamlib.StreamDistributor,StateCoder),
      Collection = require('./collectioncreator')(lib,StateBuffer),
      LimitedCollection = require('./limitedcollectioncreator')(lib,Collection);

  return {
    StateCoder: StateCoder,
    StateSource: StateSource,
    State2Array: State2Array,
    State2Defer: State2Defer,
    StateDecoder: StateDecoder,
    State2Map: State2Map,
    StatePathModifier: StatePathModifier,
    StatePathListener: StatePathListener,
    StateCollectionListener: StateCollectionListener,
    StateScalarListener: StateScalarListener,
    StateSubServiceExtractor: StateSubServiceExtractor,
    ADS: ADS,
    Collection: Collection,
    LimitedCollection: LimitedCollection
  };
}

module.exports = createStateLib;
