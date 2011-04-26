
goog.provide('goog.events'); 
goog.require('goog.array'); 
goog.require('goog.debug.entryPointRegistry'); 
goog.require('goog.debug.errorHandlerWeakDep'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventWrapper'); 
goog.require('goog.events.pools'); 
goog.require('goog.object'); 
goog.require('goog.userAgent'); 
goog.events.listeners_ = { }; 
goog.events.listenerTree_ = { }; 
goog.events.sources_ = { }; 
goog.events.onString_ = 'on'; 
goog.events.onStringMap_ = { }; 
goog.events.keySeparator_ = '_'; 
goog.events.requiresSyntheticEventPropagation_; 
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) { 
  if(! type) { 
    throw Error('Invalid event type'); 
  } else if(goog.isArray(type)) { 
    for(var i = 0; i < type.length; i ++) { 
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler); 
    } 
    return null; 
  } else { 
    var capture = ! ! opt_capt; 
    var map = goog.events.listenerTree_; 
    if(!(type in map)) { 
      map[type]= goog.events.pools.getObject(); 
    } 
    map = map[type]; 
    if(!(capture in map)) { 
      map[capture]= goog.events.pools.getObject(); 
      map.count_ ++; 
    } 
    map = map[capture]; 
    var srcUid = goog.getUid(src); 
    var listenerArray, listenerObj; 
    map.remaining_ ++; 
    if(! map[srcUid]) { 
      listenerArray = map[srcUid]= goog.events.pools.getArray(); 
      map.count_ ++; 
    } else { 
      listenerArray = map[srcUid]; 
      for(var i = 0; i < listenerArray.length; i ++) { 
        listenerObj = listenerArray[i]; 
        if(listenerObj.listener == listener && listenerObj.handler == opt_handler) { 
          if(listenerObj.removed) { 
            break; 
          } 
          return listenerArray[i].key; 
        } 
      } 
    } 
    var proxy = goog.events.pools.getProxy(); 
    proxy.src = src; 
    listenerObj = goog.events.pools.getListener(); 
    listenerObj.init(listener, proxy, src, type, capture, opt_handler); 
    var key = listenerObj.key; 
    proxy.key = key; 
    listenerArray.push(listenerObj); 
    goog.events.listeners_[key]= listenerObj; 
    if(! goog.events.sources_[srcUid]) { 
      goog.events.sources_[srcUid]= goog.events.pools.getArray(); 
    } 
    goog.events.sources_[srcUid].push(listenerObj); 
    if(src.addEventListener) { 
      if(src == goog.global || ! src.customEvent_) { 
        src.addEventListener(type, proxy, capture); 
      } 
    } else { 
      src.attachEvent(goog.events.getOnString_(type), proxy); 
    } 
    return key; 
  } 
}; 
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) { 
  if(goog.isArray(type)) { 
    for(var i = 0; i < type.length; i ++) { 
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler); 
    } 
    return null; 
  } 
  var key = goog.events.listen(src, type, listener, opt_capt, opt_handler); 
  var listenerObj = goog.events.listeners_[key]; 
  listenerObj.callOnce = true; 
  return key; 
}; 
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) { 
  wrapper.listen(src, listener, opt_capt, opt_handler); 
}; 
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) { 
  if(goog.isArray(type)) { 
    for(var i = 0; i < type.length; i ++) { 
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler); 
    } 
    return null; 
  } 
  var capture = ! ! opt_capt; 
  var listenerArray = goog.events.getListeners_(src, type, capture); 
  if(! listenerArray) { 
    return false; 
  } 
  for(var i = 0; i < listenerArray.length; i ++) { 
    if(listenerArray[i].listener == listener && listenerArray[i].capture == capture && listenerArray[i].handler == opt_handler) { 
      return goog.events.unlistenByKey(listenerArray[i].key); 
    } 
  } 
  return false; 
}; 
goog.events.unlistenByKey = function(key) { 
  if(! goog.events.listeners_[key]) { 
    return false; 
  } 
  var listener = goog.events.listeners_[key]; 
  if(listener.removed) { 
    return false; 
  } 
  var src = listener.src; 
  var type = listener.type; 
  var proxy = listener.proxy; 
  var capture = listener.capture; 
  if(src.removeEventListener) { 
    if(src == goog.global || ! src.customEvent_) { 
      src.removeEventListener(type, proxy, capture); 
    } 
  } else if(src.detachEvent) { 
    src.detachEvent(goog.events.getOnString_(type), proxy); 
  } 
  var srcUid = goog.getUid(src); 
  var listenerArray = goog.events.listenerTree_[type][capture][srcUid]; 
  if(goog.events.sources_[srcUid]) { 
    var sourcesArray = goog.events.sources_[srcUid]; 
    goog.array.remove(sourcesArray, listener); 
    if(sourcesArray.length == 0) { 
      delete goog.events.sources_[srcUid]; 
    } 
  } 
  listener.removed = true; 
  listenerArray.needsCleanup_ = true; 
  goog.events.cleanUp_(type, capture, srcUid, listenerArray); 
  delete goog.events.listeners_[key]; 
  return true; 
}; 
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) { 
  wrapper.unlisten(src, listener, opt_capt, opt_handler); 
}; 
goog.events.cleanUp_ = function(type, capture, srcUid, listenerArray) { 
  if(! listenerArray.locked_) { 
    if(listenerArray.needsCleanup_) { 
      for(var oldIndex = 0, newIndex = 0; oldIndex < listenerArray.length; oldIndex ++) { 
        if(listenerArray[oldIndex].removed) { 
          var proxy = listenerArray[oldIndex].proxy; 
          proxy.src = null; 
          goog.events.pools.releaseProxy(proxy); 
          goog.events.pools.releaseListener(listenerArray[oldIndex]); 
          continue; 
        } 
        if(oldIndex != newIndex) { 
          listenerArray[newIndex]= listenerArray[oldIndex]; 
        } 
        newIndex ++; 
      } 
      listenerArray.length = newIndex; 
      listenerArray.needsCleanup_ = false; 
      if(newIndex == 0) { 
        goog.events.pools.releaseArray(listenerArray); 
        delete goog.events.listenerTree_[type][capture][srcUid]; 
        goog.events.listenerTree_[type][capture].count_ --; 
        if(goog.events.listenerTree_[type][capture].count_ == 0) { 
          goog.events.pools.releaseObject(goog.events.listenerTree_[type][capture]); 
          delete goog.events.listenerTree_[type][capture]; 
          goog.events.listenerTree_[type].count_ --; 
        } 
        if(goog.events.listenerTree_[type].count_ == 0) { 
          goog.events.pools.releaseObject(goog.events.listenerTree_[type]); 
          delete goog.events.listenerTree_[type]; 
        } 
      } 
    } 
  } 
}; 
goog.events.removeAll = function(opt_obj, opt_type, opt_capt) { 
  var count = 0; 
  var noObj = opt_obj == null; 
  var noType = opt_type == null; 
  var noCapt = opt_capt == null; 
  opt_capt = ! ! opt_capt; 
  if(! noObj) { 
    var srcUid = goog.getUid((opt_obj)); 
    if(goog.events.sources_[srcUid]) { 
      var sourcesArray = goog.events.sources_[srcUid]; 
      for(var i = sourcesArray.length - 1; i >= 0; i --) { 
        var listener = sourcesArray[i]; 
        if((noType || opt_type == listener.type) &&(noCapt || opt_capt == listener.capture)) { 
          goog.events.unlistenByKey(listener.key); 
          count ++; 
        } 
      } 
    } 
  } else { 
    goog.object.forEach(goog.events.sources_, function(listeners) { 
      for(var i = listeners.length - 1; i >= 0; i --) { 
        var listener = listeners[i]; 
        if((noType || opt_type == listener.type) &&(noCapt || opt_capt == listener.capture)) { 
          goog.events.unlistenByKey(listener.key); 
          count ++; 
        } 
      } 
    }); 
  } 
  return count; 
}; 
goog.events.getListeners = function(obj, type, capture) { 
  return goog.events.getListeners_(obj, type, capture) ||[]; 
}; 
goog.events.getListeners_ = function(obj, type, capture) { 
  var map = goog.events.listenerTree_; 
  if(type in map) { 
    map = map[type]; 
    if(capture in map) { 
      map = map[capture]; 
      var objUid = goog.getUid(obj); 
      if(map[objUid]) { 
        return map[objUid]; 
      } 
    } 
  } 
  return null; 
}; 
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) { 
  var capture = ! ! opt_capt; 
  var listenerArray = goog.events.getListeners_(src, type, capture); 
  if(listenerArray) { 
    for(var i = 0; i < listenerArray.length; i ++) { 
      if(listenerArray[i].listener == listener && listenerArray[i].capture == capture && listenerArray[i].handler == opt_handler) { 
        return listenerArray[i]; 
      } 
    } 
  } 
  return null; 
}; 
goog.events.hasListener = function(obj, opt_type, opt_capture) { 
  var objUid = goog.getUid(obj); 
  var listeners = goog.events.sources_[objUid]; 
  if(listeners) { 
    var hasType = goog.isDef(opt_type); 
    var hasCapture = goog.isDef(opt_capture); 
    if(hasType && hasCapture) { 
      var map = goog.events.listenerTree_[opt_type]; 
      return ! ! map && ! ! map[opt_capture]&& objUid in map[opt_capture]; 
    } else if(!(hasType || hasCapture)) { 
      return true; 
    } else { 
      return goog.array.some(listeners, function(listener) { 
        return(hasType && listener.type == opt_type) ||(hasCapture && listener.capture == opt_capture); 
      }); 
    } 
  } 
  return false; 
}; 
goog.events.expose = function(e) { 
  var str =[]; 
  for(var key in e) { 
    if(e[key]&& e[key].id) { 
      str.push(key + ' = ' + e[key]+ ' (' + e[key].id + ')'); 
    } else { 
      str.push(key + ' = ' + e[key]); 
    } 
  } 
  return str.join('\n'); 
}; 
goog.events.getOnString_ = function(type) { 
  if(type in goog.events.onStringMap_) { 
    return goog.events.onStringMap_[type]; 
  } 
  return goog.events.onStringMap_[type]= goog.events.onString_ + type; 
}; 
goog.events.fireListeners = function(obj, type, capture, eventObject) { 
  var map = goog.events.listenerTree_; 
  if(type in map) { 
    map = map[type]; 
    if(capture in map) { 
      return goog.events.fireListeners_(map[capture], obj, type, capture, eventObject); 
    } 
  } 
  return true; 
}; 
goog.events.fireListeners_ = function(map, obj, type, capture, eventObject) { 
  var retval = 1; 
  var objUid = goog.getUid(obj); 
  if(map[objUid]) { 
    map.remaining_ --; 
    var listenerArray = map[objUid]; 
    if(! listenerArray.locked_) { 
      listenerArray.locked_ = 1; 
    } else { 
      listenerArray.locked_ ++; 
    } 
    try { 
      var length = listenerArray.length; 
      for(var i = 0; i < length; i ++) { 
        var listener = listenerArray[i]; 
        if(listener && ! listener.removed) { 
          retval &= goog.events.fireListener(listener, eventObject) !== false; 
        } 
      } 
    } finally { 
      listenerArray.locked_ --; 
      goog.events.cleanUp_(type, capture, objUid, listenerArray); 
    } 
  } 
  return Boolean(retval); 
}; 
goog.events.fireListener = function(listener, eventObject) { 
  var rv = listener.handleEvent(eventObject); 
  if(listener.callOnce) { 
    goog.events.unlistenByKey(listener.key); 
  } 
  return rv; 
}; 
goog.events.getTotalListenerCount = function() { 
  return goog.object.getCount(goog.events.listeners_); 
}; 
goog.events.dispatchEvent = function(src, e) { 
  var type = e.type || e; 
  var map = goog.events.listenerTree_; 
  if(!(type in map)) { 
    return true; 
  } 
  if(goog.isString(e)) { 
    e = new goog.events.Event(e, src); 
  } else if(!(e instanceof goog.events.Event)) { 
    var oldEvent = e; 
    e = new goog.events.Event(type, src); 
    goog.object.extend(e, oldEvent); 
  } else { 
    e.target = e.target || src; 
  } 
  var rv = 1, ancestors; 
  map = map[type]; 
  var hasCapture = true in map; 
  var targetsMap; 
  if(hasCapture) { 
    ancestors =[]; 
    for(var parent = src; parent; parent = parent.getParentEventTarget()) { 
      ancestors.push(parent); 
    } 
    targetsMap = map[true]; 
    targetsMap.remaining_ = targetsMap.count_; 
    for(var i = ancestors.length - 1; ! e.propagationStopped_ && i >= 0 && targetsMap.remaining_; i --) { 
      e.currentTarget = ancestors[i]; 
      rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type, true, e) && e.returnValue_ != false; 
    } 
  } 
  var hasBubble = false in map; 
  if(hasBubble) { 
    targetsMap = map[false]; 
    targetsMap.remaining_ = targetsMap.count_; 
    if(hasCapture) { 
      for(var i = 0; ! e.propagationStopped_ && i < ancestors.length && targetsMap.remaining_; i ++) { 
        e.currentTarget = ancestors[i]; 
        rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type, false, e) && e.returnValue_ != false; 
      } 
    } else { 
      for(var current = src; ! e.propagationStopped_ && current && targetsMap.remaining_; current = current.getParentEventTarget()) { 
        e.currentTarget = current; 
        rv &= goog.events.fireListeners_(targetsMap, current, e.type, false, e) && e.returnValue_ != false; 
      } 
    } 
  } 
  return Boolean(rv); 
}; 
goog.events.protectBrowserEventEntryPoint = function(errorHandler) { 
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(goog.events.handleBrowserEvent_); 
  goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_); 
}; 
goog.events.handleBrowserEvent_ = function(key, opt_evt) { 
  if(! goog.events.listeners_[key]) { 
    return true; 
  } 
  var listener = goog.events.listeners_[key]; 
  var type = listener.type; 
  var map = goog.events.listenerTree_; 
  if(!(type in map)) { 
    return true; 
  } 
  map = map[type]; 
  var retval, targetsMap; 
  if(goog.events.synthesizeEventPropagation_()) { 
    var ieEvent = opt_evt ||(goog.getObjectByName('window.event')); 
    var hasCapture = true in map; 
    var hasBubble = false in map; 
    if(hasCapture) { 
      if(goog.events.isMarkedIeEvent_(ieEvent)) { 
        return true; 
      } 
      goog.events.markIeEvent_(ieEvent); 
    } 
    var evt = goog.events.pools.getEvent(); 
    evt.init(ieEvent, this); 
    retval = true; 
    try { 
      if(hasCapture) { 
        var ancestors = goog.events.pools.getArray(); 
        for(var parent = evt.currentTarget; parent; parent = parent.parentNode) { 
          ancestors.push(parent); 
        } 
        targetsMap = map[true]; 
        targetsMap.remaining_ = targetsMap.count_; 
        for(var i = ancestors.length - 1; ! evt.propagationStopped_ && i >= 0 && targetsMap.remaining_; i --) { 
          evt.currentTarget = ancestors[i]; 
          retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type, true, evt); 
        } 
        if(hasBubble) { 
          targetsMap = map[false]; 
          targetsMap.remaining_ = targetsMap.count_; 
          for(var i = 0; ! evt.propagationStopped_ && i < ancestors.length && targetsMap.remaining_; i ++) { 
            evt.currentTarget = ancestors[i]; 
            retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type, false, evt); 
          } 
        } 
      } else { 
        retval = goog.events.fireListener(listener, evt); 
      } 
    } finally { 
      if(ancestors) { 
        ancestors.length = 0; 
        goog.events.pools.releaseArray(ancestors); 
      } 
      evt.dispose(); 
      goog.events.pools.releaseEvent(evt); 
    } 
    return retval; 
  } 
  var be = new goog.events.BrowserEvent(opt_evt, this); 
  try { 
    retval = goog.events.fireListener(listener, be); 
  } finally { 
    be.dispose(); 
  } 
  return retval; 
}; 
goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_); 
goog.events.markIeEvent_ = function(e) { 
  var useReturnValue = false; 
  if(e.keyCode == 0) { 
    try { 
      e.keyCode = - 1; 
      return; 
    } catch(ex) { 
      useReturnValue = true; 
    } 
  } 
  if(useReturnValue ||(e.returnValue) == undefined) { 
    e.returnValue = true; 
  } 
}; 
goog.events.isMarkedIeEvent_ = function(e) { 
  return e.keyCode < 0 || e.returnValue != undefined; 
}; 
goog.events.uniqueIdCounter_ = 0; 
goog.events.getUniqueId = function(identifier) { 
  return identifier + '_' + goog.events.uniqueIdCounter_ ++; 
}; 
goog.events.synthesizeEventPropagation_ = function() { 
  if(goog.events.requiresSyntheticEventPropagation_ === undefined) { 
    goog.events.requiresSyntheticEventPropagation_ = goog.userAgent.IE && ! goog.global['addEventListener']; 
  } 
  return goog.events.requiresSyntheticEventPropagation_; 
}; 
goog.debug.entryPointRegistry.register(function(transformer) { 
  goog.events.handleBrowserEvent_ = transformer(goog.events.handleBrowserEvent_); 
  goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_); 
}); 
