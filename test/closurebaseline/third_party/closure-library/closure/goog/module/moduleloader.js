
goog.provide('goog.module.ModuleLoader'); 
goog.require('goog.array'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.module.BaseModuleLoader'); 
goog.require('goog.net.BulkLoader'); 
goog.require('goog.net.EventType'); 
goog.require('goog.userAgent'); 
goog.module.ModuleLoader = function() { 
  goog.module.BaseModuleLoader.call(this); 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  this.scriptsToLoadDebugMode_ =[]; 
}; 
goog.inherits(goog.module.ModuleLoader, goog.module.BaseModuleLoader); 
goog.module.ModuleLoader.prototype.logger = goog.debug.Logger.getLogger('goog.module.ModuleLoader'); 
goog.module.ModuleLoader.prototype.loadModulesInternal = function(ids, moduleInfoMap, opt_successFn, opt_errorFn, opt_timeoutFn, opt_forceReload) { 
  var uris =[]; 
  for(var i = 0; i < ids.length; i ++) { 
    goog.array.extend(uris, moduleInfoMap[ids[i]].getUris()); 
  } 
  this.logger.info('loadModules ids:' + ids + ' uris:' + uris); 
  if(this.getDebugMode()) { 
    this.loadModulesInDebugMode_(uris); 
  } else { 
    var bulkLoader = new goog.net.BulkLoader(uris); 
    var eventHandler = this.eventHandler_; 
    eventHandler.listen(bulkLoader, goog.net.EventType.SUCCESS, goog.bind(this.handleSuccess, this, bulkLoader, ids, opt_successFn, opt_errorFn), false, null); 
    eventHandler.listen(bulkLoader, goog.net.EventType.ERROR, goog.bind(this.handleError, this, bulkLoader, ids, opt_errorFn), false, null); 
    bulkLoader.load(); 
  } 
}; 
goog.module.ModuleLoader.prototype.createScriptElement_ = function(uri) { 
  var scriptEl = goog.dom.createElement('script'); 
  scriptEl.src = uri; 
  scriptEl.type = 'text/javascript'; 
  return scriptEl; 
}; 
goog.module.ModuleLoader.prototype.loadModulesInDebugMode_ = function(uris) { 
  if(! uris.length) { 
    return; 
  } 
  var scriptParent = document.getElementsByTagName('head')[0]|| document.documentElement; 
  if(goog.userAgent.GECKO && ! goog.userAgent.isVersion(2)) { 
    for(var i = 0; i < uris.length; i ++) { 
      var scriptEl = this.createScriptElement_(uris[i]); 
      scriptParent.appendChild(scriptEl); 
    } 
  } else { 
    var isAnotherModuleLoading = this.scriptsToLoadDebugMode_.length; 
    goog.array.extend(this.scriptsToLoadDebugMode_, uris); 
    if(isAnotherModuleLoading) { 
      return; 
    } 
    var moduleLoader = this; 
    uris = this.scriptsToLoadDebugMode_; 
    var popAndLoadNextScript = function() { 
      var uri = uris.shift(); 
      var scriptEl = moduleLoader.createScriptElement_(uri); 
      if(uris.length) { 
        if(goog.userAgent.IE) { 
          scriptEl.onreadystatechange = function() { 
            if(! this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') { 
              scriptEl.onreadystatechange = goog.nullFunction; 
              popAndLoadNextScript(); 
            } 
          }; 
        } else { 
          scriptEl.onload = popAndLoadNextScript; 
        } 
      } 
      scriptParent.appendChild(scriptEl); 
    }; 
    popAndLoadNextScript(); 
  } 
}; 
goog.module.ModuleLoader.prototype.handleSuccess = function(bulkLoader, moduleIds, successFn, errorFn) { 
  var jsCode = bulkLoader.getResponseTexts().join('\n'); 
  this.handleRequestSuccess(jsCode, moduleIds, successFn, errorFn); 
  goog.Timer.callOnce(bulkLoader.dispose, 5, bulkLoader); 
}; 
goog.module.ModuleLoader.prototype.handleError = function(bulkLoader, moduleIds, errorFn, status) { 
  this.handleRequestError(moduleIds, errorFn, status); 
  goog.Timer.callOnce(bulkLoader.dispose, 5, bulkLoader); 
}; 
goog.module.ModuleLoader.prototype.disposeInternal = function() { 
  goog.module.ModuleLoader.superClass_.disposeInternal.call(this); 
  this.eventHandler_.dispose(); 
  this.eventHandler_ = null; 
}; 
