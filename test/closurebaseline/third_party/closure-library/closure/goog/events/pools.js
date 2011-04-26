
goog.provide('goog.events.pools'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.Listener'); 
goog.require('goog.structs.SimplePool'); 
goog.require('goog.userAgent.jscript'); 
goog.events.ASSUME_GOOD_GC = false; 
goog.events.pools.getObject; 
goog.events.pools.releaseObject; 
goog.events.pools.getArray; 
goog.events.pools.releaseArray; 
goog.events.pools.getProxy; 
goog.events.pools.setProxyCallbackFunction; 
goog.events.pools.releaseProxy; 
goog.events.pools.getListener; 
goog.events.pools.releaseListener; 
goog.events.pools.getEvent; 
goog.events.pools.releaseEvent; 
(function() { 
  var BAD_GC = ! goog.events.ASSUME_GOOD_GC && goog.userAgent.jscript.HAS_JSCRIPT && ! goog.userAgent.jscript.isVersion('5.7'); 
  function getObject() { 
    return { 
      count_: 0, 
      remaining_: 0 
    }; 
  } 
  function getArray() { 
    return[]; 
  } 
  var proxyCallbackFunction; 
  goog.events.pools.setProxyCallbackFunction = function(cb) { 
    proxyCallbackFunction = cb; 
  }; 
  function getProxy() { 
    var f = function(eventObject) { 
      return proxyCallbackFunction.call(f.src, f.key, eventObject); 
    }; 
    return f; 
  } 
  function getListener() { 
    return new goog.events.Listener(); 
  } 
  function getEvent() { 
    return new goog.events.BrowserEvent(); 
  } 
  if(! BAD_GC) { 
    goog.events.pools.getObject = getObject; 
    goog.events.pools.releaseObject = goog.nullFunction; 
    goog.events.pools.getArray = getArray; 
    goog.events.pools.releaseArray = goog.nullFunction; 
    goog.events.pools.getProxy = getProxy; 
    goog.events.pools.releaseProxy = goog.nullFunction; 
    goog.events.pools.getListener = getListener; 
    goog.events.pools.releaseListener = goog.nullFunction; 
    goog.events.pools.getEvent = getEvent; 
    goog.events.pools.releaseEvent = goog.nullFunction; 
  } else { 
    goog.events.pools.getObject = function() { 
      return objectPool.getObject(); 
    }; 
    goog.events.pools.releaseObject = function(obj) { 
      objectPool.releaseObject(obj); 
    }; 
    goog.events.pools.getArray = function() { 
      return(arrayPool.getObject()); 
    }; 
    goog.events.pools.releaseArray = function(obj) { 
      arrayPool.releaseObject(obj); 
    }; 
    goog.events.pools.getProxy = function() { 
      return(proxyPool.getObject()); 
    }; 
    goog.events.pools.releaseProxy = function(obj) { 
      proxyPool.releaseObject(getProxy()); 
    }; 
    goog.events.pools.getListener = function() { 
      return(listenerPool.getObject()); 
    }; 
    goog.events.pools.releaseListener = function(obj) { 
      listenerPool.releaseObject(obj); 
    }; 
    goog.events.pools.getEvent = function() { 
      return(eventPool.getObject()); 
    }; 
    goog.events.pools.releaseEvent = function(obj) { 
      eventPool.releaseObject(obj); 
    }; 
    var OBJECT_POOL_INITIAL_COUNT = 0; 
    var OBJECT_POOL_MAX_COUNT = 600; 
    var objectPool = new goog.structs.SimplePool(OBJECT_POOL_INITIAL_COUNT, OBJECT_POOL_MAX_COUNT); 
    objectPool.setCreateObjectFn(getObject); 
    var ARRAY_POOL_INITIAL_COUNT = 0; 
    var ARRAY_POOL_MAX_COUNT = 600; 
    var arrayPool = new goog.structs.SimplePool(ARRAY_POOL_INITIAL_COUNT, ARRAY_POOL_MAX_COUNT); 
    arrayPool.setCreateObjectFn(getArray); 
    var HANDLE_EVENT_PROXY_POOL_INITIAL_COUNT = 0; 
    var HANDLE_EVENT_PROXY_POOL_MAX_COUNT = 600; 
    var proxyPool = new goog.structs.SimplePool(HANDLE_EVENT_PROXY_POOL_INITIAL_COUNT, HANDLE_EVENT_PROXY_POOL_MAX_COUNT); 
    proxyPool.setCreateObjectFn(getProxy); 
    var LISTENER_POOL_INITIAL_COUNT = 0; 
    var LISTENER_POOL_MAX_COUNT = 600; 
    var listenerPool = new goog.structs.SimplePool(LISTENER_POOL_INITIAL_COUNT, LISTENER_POOL_MAX_COUNT); 
    listenerPool.setCreateObjectFn(getListener); 
    var EVENT_POOL_INITIAL_COUNT = 0; 
    var EVENT_POOL_MAX_COUNT = 600; 
    var eventPool = new goog.structs.SimplePool(EVENT_POOL_INITIAL_COUNT, EVENT_POOL_MAX_COUNT); 
    eventPool.setCreateObjectFn(getEvent); 
  } 
})(); 
