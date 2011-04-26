
goog.provide('goog.module.Loader'); 
goog.require('goog.Timer'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.object'); 
goog.module.Loader = function() { 
  this.pending_ = { }; 
  this.modules_ = { }; 
  this.pendingModuleUrls_ = { }; 
  this.urlBase_ = null; 
  this.pendingBeforeInit_ =[]; 
}; 
goog.addSingletonGetter(goog.module.Loader); 
goog.module.Loader.prototype.getModuleUrl_ = function(urlBase, module) { 
  return urlBase + '_' + module + '.js'; 
}; 
goog.module.Loader.LOAD_CALLBACK = '__gjsload__'; 
goog.module.Loader.loaderEval_ = function(t_) { 
  eval(t_); 
}; 
goog.module.Loader.prototype.init = function(baseUrl, opt_urlFunction) { 
  goog.exportSymbol(goog.module.Loader.LOAD_CALLBACK, goog.module.Loader.loaderEval_); 
  this.urlBase_ = baseUrl.replace('.js', ''); 
  if(opt_urlFunction) { 
    this.getModuleUrl_ = opt_urlFunction; 
  } 
  goog.array.forEach(this.pendingBeforeInit_, function(module) { 
    this.load_(module); 
  }, this); 
  goog.array.clear(this.pendingBeforeInit_); 
}; 
goog.module.Loader.prototype.require = function(module, symbol, callback) { 
  var pending = this.pending_; 
  var modules = this.modules_; 
  if(modules[module]) { 
    callback(modules[module][symbol]); 
  } else if(pending[module]) { 
    pending[module].push([symbol, callback]); 
  } else { 
    pending[module]=[[symbol, callback]]; 
    if(this.urlBase_) { 
      this.load_(module); 
    } else { 
      this.pendingBeforeInit_.push(module); 
    } 
  } 
}; 
goog.module.Loader.prototype.provide = function(module, opt_symbol, opt_object) { 
  var modules = this.modules_; 
  var pending = this.pending_; 
  if(! modules[module]) { 
    modules[module]= { }; 
  } 
  if(opt_object) { 
    modules[module][opt_symbol]= opt_object; 
  } else if(pending[module]) { 
    for(var i = 0; i < pending[module].length; ++ i) { 
      var symbol = pending[module][i][0]; 
      var callback = pending[module][i][1]; 
      callback(modules[module][symbol]); 
    } 
    delete pending[module]; 
    delete this.pendingModuleUrls_[module]; 
  } 
}; 
goog.module.Loader.prototype.load_ = function(module) { 
  goog.Timer.callOnce(function() { 
    if(this.modules_[module]) { 
      return; 
    } 
    var url = this.getModuleUrl_(this.urlBase_, module); 
    var urlInFlight = goog.object.containsValue(this.pendingModuleUrls_, url); 
    this.pendingModuleUrls_[module]= url; 
    if(urlInFlight) { 
      return; 
    } 
    var s = goog.dom.createDom('script', { 
      'type': 'text/javascript', 
      'src': url 
    }); 
    document.body.appendChild(s); 
  }, 0, this); 
}; 
