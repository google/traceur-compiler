
goog.provide('goog.module'); 
goog.require('goog.array'); 
goog.require('goog.module.Loader'); 
goog.module.require = function(module, symbol, callback) { 
  goog.module.Loader.getInstance().require(module, symbol, callback); 
}; 
goog.module.provide = function(module, opt_symbol, opt_object) { 
  goog.module.Loader.getInstance().provide(module, opt_symbol, opt_object); 
}; 
goog.module.initLoader = function(urlBase, opt_urlFunction) { 
  goog.module.Loader.getInstance().init(urlBase, opt_urlFunction); 
}; 
goog.module.loaderCall = function(module, symbol) { 
  return function() { 
    var args = arguments; 
    goog.module.require(module, symbol, function(f) { 
      f.apply(null, args); 
    }); 
  }; 
}; 
goog.module.requireMultipleSymbols = function(symbolRequests, finalCb) { 
  var I = symbolRequests.length; 
  if(I == 0) { 
    finalCb(); 
  } else { 
    for(var i = 0; i < I; ++ i) { 
      goog.module.requireMultipleSymbolsHelper_(symbolRequests, i, finalCb); 
    } 
  } 
}; 
goog.module.requireMultipleSymbolsHelper_ = function(symbolRequests, i, finalCb) { 
  var r = symbolRequests[i]; 
  var module = r[0]; 
  var symbol = r[1]; 
  var symbolCb = r[2]; 
  goog.module.require(module, symbol, function() { 
    symbolCb.apply(this, arguments); 
    symbolRequests[i]= null; 
    if(goog.array.every(symbolRequests, goog.module.isNull_)) { 
      finalCb(); 
    } 
  }); 
}; 
goog.module.isNull_ = function(el, i, arr) { 
  return el == null; 
}; 
