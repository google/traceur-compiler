
goog.provide('goog.net.DefaultXmlHttpFactory'); 
goog.provide('goog.net.XmlHttp'); 
goog.provide('goog.net.XmlHttp.OptionType'); 
goog.provide('goog.net.XmlHttp.ReadyState'); 
goog.require('goog.net.WrapperXmlHttpFactory'); 
goog.require('goog.net.XmlHttpFactory'); 
goog.net.XmlHttp = function() { 
  return goog.net.XmlHttp.factory_.createInstance(); 
}; 
goog.net.XmlHttp.getOptions = function() { 
  return goog.net.XmlHttp.factory_.getOptions(); 
}; 
goog.net.XmlHttp.OptionType = { 
  USE_NULL_FUNCTION: 0, 
  LOCAL_REQUEST_ERROR: 1 
}; 
goog.net.XmlHttp.ReadyState = { 
  UNINITIALIZED: 0, 
  LOADING: 1, 
  LOADED: 2, 
  INTERACTIVE: 3, 
  COMPLETE: 4 
}; 
goog.net.XmlHttp.factory_; 
goog.net.XmlHttp.setFactory = function(factory, optionsFactory) { 
  goog.net.XmlHttp.setGlobalFactory(new goog.net.WrapperXmlHttpFactory((factory),(optionsFactory))); 
}; 
goog.net.XmlHttp.setGlobalFactory = function(factory) { 
  goog.net.XmlHttp.factory_ = factory; 
}; 
goog.net.DefaultXmlHttpFactory = function() { 
  goog.net.XmlHttpFactory.call(this); 
}; 
goog.inherits(goog.net.DefaultXmlHttpFactory, goog.net.XmlHttpFactory); 
goog.net.DefaultXmlHttpFactory.prototype.createInstance = function() { 
  var progId = this.getProgId_(); 
  if(progId) { 
    return new ActiveXObject(progId); 
  } else { 
    return new XMLHttpRequest(); 
  } 
}; 
goog.net.DefaultXmlHttpFactory.prototype.internalGetOptions = function() { 
  var progId = this.getProgId_(); 
  var options = { }; 
  if(progId) { 
    options[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION]= true; 
    options[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR]= true; 
  } 
  return options; 
}; 
goog.net.DefaultXmlHttpFactory.prototype.ieProgId_ = null; 
goog.net.DefaultXmlHttpFactory.prototype.getProgId_ = function() { 
  if(! this.ieProgId_ && typeof XMLHttpRequest == 'undefined' && typeof ActiveXObject != 'undefined') { 
    var ACTIVE_X_IDENTS =['MSXML2.XMLHTTP.6.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP']; 
    for(var i = 0; i < ACTIVE_X_IDENTS.length; i ++) { 
      var candidate = ACTIVE_X_IDENTS[i]; 
      try { 
        new ActiveXObject(candidate); 
        this.ieProgId_ = candidate; 
        return candidate; 
      } catch(e) { } 
    } 
    throw Error('Could not create ActiveXObject. ActiveX might be disabled,' + ' or MSXML might not be installed'); 
  } 
  return(this.ieProgId_); 
}; 
goog.net.XmlHttp.setGlobalFactory(new goog.net.DefaultXmlHttpFactory()); 
