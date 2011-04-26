
goog.provide('goog.module.BaseModuleLoader'); 
goog.require('goog.Disposable'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.module.AbstractModuleLoader'); 
goog.module.BaseModuleLoader = function() { 
  goog.Disposable.call(this); 
}; 
goog.inherits(goog.module.BaseModuleLoader, goog.Disposable); 
goog.module.BaseModuleLoader.prototype.logger = goog.debug.Logger.getLogger('goog.module.BaseModuleLoader'); 
goog.module.BaseModuleLoader.prototype.debugMode_ = false; 
goog.module.BaseModuleLoader.prototype.codePostfix_ = null; 
goog.module.BaseModuleLoader.prototype.getDebugMode = function() { 
  return this.debugMode_; 
}; 
goog.module.BaseModuleLoader.prototype.setDebugMode = function(debugMode) { 
  this.debugMode_ = debugMode; 
}; 
goog.module.BaseModuleLoader.prototype.setCodePostfix = function(codePostfix) { 
  this.codePostfix_ = codePostfix; 
}; 
goog.module.BaseModuleLoader.prototype.loadModules = function(ids, moduleInfoMap, opt_successFn, opt_errorFn, opt_timeoutFn, opt_forceReload) { 
  this.loadModulesInternal(ids, moduleInfoMap, opt_successFn, opt_errorFn, opt_timeoutFn, opt_forceReload); 
}; 
goog.module.BaseModuleLoader.prototype.loadModulesInternal = function(ids, moduleInfoMap, opt_successFn, opt_errorFn, opt_timeoutFn, opt_forceReload) { }; 
goog.module.BaseModuleLoader.prototype.evaluateCode = function(moduleIds, jsCode) { 
  var success = true; 
  try { 
    if(this.validateCodePostfix_(jsCode)) { 
      goog.globalEval(jsCode); 
    } else { 
      success = false; 
    } 
  } catch(e) { 
    success = false; 
    this.logger.warning('Loaded incomplete code for module(s): ' + moduleIds, e); 
  } 
  return success; 
}; 
goog.module.BaseModuleLoader.prototype.handleRequestSuccess = function(jsCode, moduleIds, successFn, errorFn) { 
  this.logger.info('Code loaded for module(s): ' + moduleIds); 
  var success = this.evaluateCode(moduleIds, jsCode); 
  if(! success) { 
    this.handleRequestError(moduleIds, errorFn, null); 
  } else if(success && successFn) { 
    successFn(); 
  } 
}; 
goog.module.BaseModuleLoader.prototype.handleRequestError = function(moduleIds, errorFn, status) { 
  this.logger.warning('Request failed for module(s): ' + moduleIds); 
  if(errorFn) { 
    errorFn(status); 
  } 
}; 
goog.module.BaseModuleLoader.prototype.handleRequestTimeout = function(moduleIds, timeoutFn) { 
  this.logger.warning('Request timed out for module(s): ' + moduleIds); 
  if(timeoutFn) { 
    timeoutFn(); 
  } 
}; 
goog.module.BaseModuleLoader.prototype.validateCodePostfix_ = function(jsCode) { 
  return this.codePostfix_ ? goog.string.endsWith(jsCode, this.codePostfix_): true; 
}; 
