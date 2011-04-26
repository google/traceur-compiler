
goog.provide('goog.module.ModuleManager'); 
goog.provide('goog.module.ModuleManager.FailureType'); 
goog.require('goog.Disposable'); 
goog.require('goog.array'); 
goog.require('goog.asserts'); 
goog.require('goog.async.Deferred'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.debug.Trace'); 
goog.require('goog.module.AbstractModuleLoader'); 
goog.require('goog.module.ModuleInfo'); 
goog.require('goog.module.ModuleLoadCallback'); 
goog.module.ModuleManager = function() { 
  goog.Disposable.call(this); 
  this.moduleInfoMap_ = { }; 
  this.loadingModuleIds_ =[]; 
  this.requestedModuleIdsQueue_ =[]; 
  this.userInitiatedLoadingModuleIds_ =[]; 
  this.callbackMap_ = { }; 
  this.baseModuleInfo_ = new goog.module.ModuleInfo([], ''); 
  this.currentlyLoadingModule_ = this.baseModuleInfo_; 
}; 
goog.inherits(goog.module.ModuleManager, goog.Disposable); 
goog.addSingletonGetter(goog.module.ModuleManager); 
goog.module.ModuleManager.CallbackType = { 
  ERROR: 'error', 
  IDLE: 'idle', 
  ACTIVE: 'active', 
  USER_IDLE: 'userIdle', 
  USER_ACTIVE: 'userActive' 
}; 
goog.module.ModuleManager.CORRUPT_RESPONSE_STATUS_CODE = 8001; 
goog.module.ModuleManager.prototype.logger_ = goog.debug.Logger.getLogger('goog.module.ModuleManager'); 
goog.module.ModuleManager.prototype.batchModeEnabled_ = false; 
goog.module.ModuleManager.prototype.loader_ = null; 
goog.module.ModuleManager.prototype.loadTracer_ = null; 
goog.module.ModuleManager.prototype.consecutiveFailures_ = 0; 
goog.module.ModuleManager.prototype.lastActive_ = false; 
goog.module.ModuleManager.prototype.userLastActive_ = false; 
goog.module.ModuleManager.prototype.moduleContext_ = null; 
goog.module.ModuleManager.prototype.setBatchModeEnabled = function(enabled) { 
  this.batchModeEnabled_ = enabled; 
}; 
goog.module.ModuleManager.prototype.setAllModuleInfo = function(infoMap) { 
  for(var id in infoMap) { 
    this.moduleInfoMap_[id]= new goog.module.ModuleInfo(infoMap[id], id); 
  } 
  this.maybeFinishBaseLoad_(); 
}; 
goog.module.ModuleManager.prototype.setAllModuleInfoString = function(opt_info) { 
  if(! goog.isString(opt_info)) { 
    return; 
  } 
  var modules = opt_info.split('/'); 
  var moduleIds =[]; 
  for(var i = 0; i < modules.length; i ++) { 
    var parts = modules[i].split(':'); 
    var id = parts[0]; 
    var deps; 
    if(parts[1]) { 
      deps = parts[1].split(','); 
      for(var j = 0; j < deps.length; j ++) { 
        var index = parseInt(deps[j], 36); 
        goog.asserts.assert(moduleIds[index], 'No module @ %s, dep of %s @ %s', index, id, i); 
        deps[j]= moduleIds[index]; 
      } 
    } else { 
      deps =[]; 
    } 
    moduleIds.push(id); 
    this.moduleInfoMap_[id]= new goog.module.ModuleInfo(deps, id); 
  } 
  this.maybeFinishBaseLoad_(); 
}; 
goog.module.ModuleManager.prototype.getModuleInfo = function(id) { 
  return this.moduleInfoMap_[id]; 
}; 
goog.module.ModuleManager.prototype.setModuleUris = function(moduleUriMap) { 
  for(var id in moduleUriMap) { 
    this.moduleInfoMap_[id].setUris(moduleUriMap[id]); 
  } 
}; 
goog.module.ModuleManager.prototype.getLoader = function() { 
  return this.loader_; 
}; 
goog.module.ModuleManager.prototype.setLoader = function(loader) { 
  this.loader_ = loader; 
}; 
goog.module.ModuleManager.prototype.getModuleContext = function() { 
  return this.moduleContext_; 
}; 
goog.module.ModuleManager.prototype.setModuleContext = function(context) { 
  this.moduleContext_ = context; 
  this.maybeFinishBaseLoad_(); 
}; 
goog.module.ModuleManager.prototype.isActive = function() { 
  return this.loadingModuleIds_.length > 0; 
}; 
goog.module.ModuleManager.prototype.isUserActive = function() { 
  return this.userInitiatedLoadingModuleIds_.length > 0; 
}; 
goog.module.ModuleManager.prototype.dispatchActiveIdleChangeIfNeeded_ = function() { 
  var lastActive = this.lastActive_; 
  var active = this.isActive(); 
  if(active != lastActive) { 
    this.executeCallbacks_(active ? goog.module.ModuleManager.CallbackType.ACTIVE: goog.module.ModuleManager.CallbackType.IDLE); 
    this.lastActive_ = active; 
  } 
  var userLastActive = this.userLastActive_; 
  var userActive = this.isUserActive(); 
  if(userActive != userLastActive) { 
    this.executeCallbacks_(userActive ? goog.module.ModuleManager.CallbackType.USER_ACTIVE: goog.module.ModuleManager.CallbackType.USER_IDLE); 
    this.userLastActive_ = userActive; 
  } 
}; 
goog.module.ModuleManager.prototype.preloadModule = function(id, opt_timeout) { 
  var d = new goog.async.Deferred(); 
  window.setTimeout(goog.bind(this.loadModuleOrEnqueueIfNotLoadedOrLoading_, this, id, d), opt_timeout || 0); 
  return d; 
}; 
goog.module.ModuleManager.prototype.loadModuleOrEnqueueIfNotLoadedOrLoading_ = function(id, d) { 
  var moduleInfo = this.getModuleInfo(id); 
  if(moduleInfo.isLoaded()) { 
    d.callback(this.moduleContext_); 
  } else { 
    moduleInfo.registerCallback(d.callback, d); 
    moduleInfo.registerErrback(function(err) { 
      d.errback(Error(err)); 
    }); 
    if(! this.isModuleLoading(id)) { 
      this.loadModuleOrEnqueue_(id); 
    } 
  } 
}; 
goog.module.ModuleManager.prototype.loadModuleOrEnqueue_ = function(id) { 
  if(goog.array.isEmpty(this.loadingModuleIds_)) { 
    this.loadModule_(id); 
  } else { 
    this.requestedModuleIdsQueue_.push(id); 
    this.dispatchActiveIdleChangeIfNeeded_(); 
  } 
}; 
goog.module.ModuleManager.prototype.getBackOff_ = function() { 
  return Math.pow(this.consecutiveFailures_, 2) * 5000; 
}; 
goog.module.ModuleManager.prototype.loadModule_ = function(id, opt_isRetry, opt_forceReload) { 
  var moduleInfo = this.moduleInfoMap_[id]; 
  if(moduleInfo.isLoaded()) { 
    throw Error('Module already loaded: ' + id); 
  } 
  var ids = this.getNotYetLoadedTransitiveDepIds_(id); 
  if(! this.batchModeEnabled_ && ids.length > 1) { 
    var idToLoad = ids.shift(); 
    this.logger_.info('Must load ' + idToLoad + ' module before ' + id); 
    this.requestedModuleIdsQueue_ = ids.concat(this.requestedModuleIdsQueue_); 
    ids =[idToLoad]; 
  } 
  if(! opt_isRetry) { 
    this.consecutiveFailures_ = 0; 
  } 
  this.logger_.info('Loading module(s): ' + ids); 
  this.loadingModuleIds_ = ids; 
  this.dispatchActiveIdleChangeIfNeeded_(); 
  function load() { 
    this.loader_.loadModules(goog.array.clone(ids), this.moduleInfoMap_, null, goog.bind(this.handleLoadError_, this), goog.bind(this.handleLoadTimeout_, this), ! ! opt_forceReload); 
  } 
  var delay = this.getBackOff_(); 
  if(delay) { 
    window.setTimeout(goog.bind(load, this), delay); 
  } else { 
    load.call(this); 
  } 
}; 
goog.module.ModuleManager.prototype.getNotYetLoadedTransitiveDepIds_ = function(id) { 
  var ids =[id]; 
  var depIds = goog.array.clone(this.getModuleInfo(id).getDependencies()); 
  while(depIds.length) { 
    var depId = depIds.pop(); 
    if(! this.getModuleInfo(depId).isLoaded()) { 
      ids.unshift(depId); 
      Array.prototype.unshift.apply(depIds, this.getModuleInfo(depId).getDependencies()); 
    } 
  } 
  goog.array.removeDuplicates(ids); 
  return ids; 
}; 
goog.module.ModuleManager.prototype.maybeFinishBaseLoad_ = function() { 
  if(this.currentlyLoadingModule_ == this.baseModuleInfo_) { 
    this.currentlyLoadingModule_ = null; 
    this.baseModuleInfo_.onLoad(goog.bind(this.getModuleContext, this)); 
  } 
}; 
goog.module.ModuleManager.prototype.setLoaded = function(id) { 
  if(this.isDisposed()) { 
    this.logger_.warning('Module loaded after module manager was disposed: ' + id); 
    return; 
  } 
  this.logger_.info('Module loaded: ' + id); 
  this.moduleInfoMap_[id].onLoad(goog.bind(this.getModuleContext, this)); 
  goog.array.remove(this.userInitiatedLoadingModuleIds_, id); 
  goog.array.remove(this.loadingModuleIds_, id); 
  if(goog.array.isEmpty(this.loadingModuleIds_)) { 
    this.loadNextModule_(); 
  } 
  this.dispatchActiveIdleChangeIfNeeded_(); 
}; 
goog.module.ModuleManager.prototype.isModuleLoading = function(id) { 
  return goog.array.contains(this.loadingModuleIds_, id) || goog.array.contains(this.requestedModuleIdsQueue_, id); 
}; 
goog.module.ModuleManager.prototype.execOnLoad = function(moduleId, fn, opt_handler, opt_noLoad, opt_userInitiated, opt_preferSynchronous) { 
  var moduleInfo = this.moduleInfoMap_[moduleId]; 
  var callbackWrapper; 
  if(moduleInfo.isLoaded()) { 
    this.logger_.info(moduleId + ' module already loaded'); 
    callbackWrapper = new goog.module.ModuleLoadCallback(fn, opt_handler); 
    if(opt_preferSynchronous) { 
      callbackWrapper.execute(this.moduleContext_); 
    } else { 
      window.setTimeout(goog.bind(callbackWrapper.execute, callbackWrapper), 0); 
    } 
  } else if(this.isModuleLoading(moduleId)) { 
    this.logger_.info(moduleId + ' module already loading'); 
    callbackWrapper = moduleInfo.registerCallback(fn, opt_handler); 
    if(opt_userInitiated) { 
      this.logger_.info('User initiated module already loading: ' + moduleId); 
      this.addUserIntiatedLoadingModule_(moduleId); 
      this.dispatchActiveIdleChangeIfNeeded_(); 
    } 
  } else { 
    this.logger_.info('Registering callback for module: ' + moduleId); 
    callbackWrapper = moduleInfo.registerCallback(fn, opt_handler); 
    if(! opt_noLoad) { 
      if(opt_userInitiated) { 
        this.logger_.info('User initiated module load: ' + moduleId); 
        this.addUserIntiatedLoadingModule_(moduleId); 
      } 
      this.logger_.info('Initiating module load: ' + moduleId); 
      this.loadModuleOrEnqueue_(moduleId); 
    } 
  } 
  return callbackWrapper; 
}; 
goog.module.ModuleManager.prototype.load = function(moduleId, opt_userInitiated) { 
  var moduleInfo = this.moduleInfoMap_[moduleId]; 
  var d = new goog.async.Deferred(); 
  if(moduleInfo.isLoaded()) { 
    d.callback(this.moduleContext_); 
  } else if(this.isModuleLoading(moduleId)) { 
    this.logger_.info(moduleId + ' module already loading'); 
    moduleInfo.registerCallback(d.callback, d); 
    moduleInfo.registerErrback(function(err) { 
      d.errback(Error(err)); 
    }); 
    if(opt_userInitiated) { 
      this.logger_.info('User initiated module already loading: ' + moduleId); 
      this.addUserIntiatedLoadingModule_(moduleId); 
      this.dispatchActiveIdleChangeIfNeeded_(); 
    } 
  } else { 
    this.logger_.info('Registering callback for module: ' + moduleId); 
    moduleInfo.registerCallback(d.callback, d); 
    moduleInfo.registerErrback(function(err) { 
      d.errback(Error(err)); 
    }); 
    if(opt_userInitiated) { 
      this.logger_.info('User initiated module load: ' + moduleId); 
      this.addUserIntiatedLoadingModule_(moduleId); 
    } else { 
      this.logger_.info('Initiating module load: ' + moduleId); 
    } 
    this.loadModuleOrEnqueue_(moduleId); 
  } 
  return d; 
}; 
goog.module.ModuleManager.prototype.addUserIntiatedLoadingModule_ = function(id) { 
  if(! goog.array.contains(this.userInitiatedLoadingModuleIds_, id)) { 
    this.userInitiatedLoadingModuleIds_.push(id); 
  } 
}; 
goog.module.ModuleManager.prototype.beforeLoadModuleCode = function(id) { 
  this.loadTracer_ = goog.debug.Trace.startTracer('Module Load: ' + id, 'Module Load'); 
  if(this.currentlyLoadingModule_) { 
    this.logger_.severe('beforeLoadModuleCode called with module "' + id + '" while module "' + this.currentlyLoadingModule_.getId() + '" is loading'); 
  } 
  this.currentlyLoadingModule_ = this.getModuleInfo(id); 
}; 
goog.module.ModuleManager.prototype.afterLoadModuleCode = function(id) { 
  if(! this.currentlyLoadingModule_ || id != this.currentlyLoadingModule_.getId()) { 
    this.logger_.severe('afterLoadModuleCode called with module "' + id + '" while loading module "' +(this.currentlyLoadingModule_ && this.currentlyLoadingModule_.getId()) + '"'); 
  } 
  this.currentlyLoadingModule_ = null; 
  goog.debug.Trace.stopTracer(this.loadTracer_); 
}; 
goog.module.ModuleManager.prototype.registerInitializationCallback = function(fn, opt_handler) { 
  if(! this.currentlyLoadingModule_) { 
    this.logger_.severe('No module is currently loading'); 
  } else { 
    this.currentlyLoadingModule_.registerEarlyCallback(fn, opt_handler); 
  } 
}; 
goog.module.ModuleManager.prototype.setModuleConstructor = function(fn) { 
  if(! this.currentlyLoadingModule_) { 
    this.logger_.severe('No module is currently loading'); 
    return; 
  } 
  this.currentlyLoadingModule_.setModuleConstructor(fn); 
}; 
goog.module.ModuleManager.FailureType = { 
  UNAUTHORIZED: 0, 
  CONSECUTIVE_FAILURES: 1, 
  TIMEOUT: 2, 
  OLD_CODE_GONE: 3, 
  INIT_ERROR: 4 
}; 
goog.module.ModuleManager.prototype.handleLoadError_ = function(status) { 
  this.consecutiveFailures_ ++; 
  if(status == 401) { 
    this.logger_.info('Module loading unauthorized'); 
    this.dispatchModuleLoadFailed_(goog.module.ModuleManager.FailureType.UNAUTHORIZED); 
    this.requestedModuleIdsQueue_.length = 0; 
  } else if(status == 410) { 
    this.dispatchModuleLoadFailed_(goog.module.ModuleManager.FailureType.OLD_CODE_GONE); 
    this.loadNextModule_(); 
  } else if(this.consecutiveFailures_ >= 3) { 
    this.logger_.info('Aborting after failure to load: ' + this.loadingModuleIds_); 
    this.dispatchModuleLoadFailed_(goog.module.ModuleManager.FailureType.CONSECUTIVE_FAILURES); 
    this.loadNextModule_(); 
  } else { 
    this.logger_.info('Retrying after failure to load: ' + this.loadingModuleIds_); 
    var id = this.loadingModuleIds_.pop(); 
    this.loadingModuleIds_.length = 0; 
    var forceReload = status == goog.module.ModuleManager.CORRUPT_RESPONSE_STATUS_CODE; 
    this.loadModule_(id, true, forceReload); 
  } 
}; 
goog.module.ModuleManager.prototype.handleLoadTimeout_ = function() { 
  this.logger_.info('Aborting after timeout: ' + this.loadingModuleIds_); 
  this.dispatchModuleLoadFailed_(goog.module.ModuleManager.FailureType.TIMEOUT); 
  this.loadNextModule_(); 
}; 
goog.module.ModuleManager.prototype.dispatchModuleLoadFailed_ = function(cause) { 
  var id = this.loadingModuleIds_.pop(); 
  this.loadingModuleIds_.length = 0; 
  var self = this; 
  var idsToCancel = goog.array.filter(this.requestedModuleIdsQueue_, function(requestedId) { 
    return goog.array.contains(self.getNotYetLoadedTransitiveDepIds_(requestedId), id); 
  }); 
  if(id) { 
    goog.array.insert(idsToCancel, id); 
  } 
  for(var i = 0; i < idsToCancel.length; i ++) { 
    goog.array.remove(this.requestedModuleIdsQueue_, idsToCancel[i]); 
    goog.array.remove(this.userInitiatedLoadingModuleIds_, idsToCancel[i]); 
  } 
  var errorCallbacks = this.callbackMap_[goog.module.ModuleManager.CallbackType.ERROR]; 
  if(errorCallbacks) { 
    for(var i = 0; i < errorCallbacks.length; i ++) { 
      var callback = errorCallbacks[i]; 
      for(var j = 0; j < idsToCancel.length; j ++) { 
        callback(goog.module.ModuleManager.CallbackType.ERROR, idsToCancel[j], cause); 
      } 
    } 
  } 
  if(this.moduleInfoMap_[id]) { 
    this.moduleInfoMap_[id].onError(cause); 
  } 
  this.dispatchActiveIdleChangeIfNeeded_(); 
}; 
goog.module.ModuleManager.prototype.loadNextModule_ = function() { 
  while(this.requestedModuleIdsQueue_.length) { 
    var nextId = this.requestedModuleIdsQueue_.shift(); 
    if(! this.getModuleInfo(nextId).isLoaded()) { 
      this.loadModule_(nextId); 
      return; 
    } 
  } 
  this.dispatchActiveIdleChangeIfNeeded_(); 
}; 
goog.module.ModuleManager.prototype.registerCallback = function(types, fn) { 
  if(! goog.isArray(types)) { 
    types =[types]; 
  } 
  for(var i = 0; i < types.length; i ++) { 
    this.registerCallback_(types[i], fn); 
  } 
}; 
goog.module.ModuleManager.prototype.registerCallback_ = function(type, fn) { 
  var callbackMap = this.callbackMap_; 
  if(! callbackMap[type]) { 
    callbackMap[type]=[]; 
  } 
  callbackMap[type].push(fn); 
}; 
goog.module.ModuleManager.prototype.executeCallbacks_ = function(type) { 
  var callbacks = this.callbackMap_[type]; 
  for(var i = 0; callbacks && i < callbacks.length; i ++) { 
    callbacks[i](type); 
  } 
}; 
goog.module.ModuleManager.prototype.disposeInternal = function() { 
  goog.module.ModuleManager.superClass_.disposeInternal.call(this); 
  goog.array.forEach(goog.object.getValues(this.moduleInfoMap_), goog.dispose); 
  this.moduleInfoMap_ = null; 
  this.loadingModuleIds_ = null; 
  this.userInitiatedLoadingModuleIds_ = null; 
  this.requestedModuleIdsQueue_ = null; 
  this.callbackMap_ = null; 
}; 
