
goog.provide('goog.ui.media.FlashObject'); 
goog.provide('goog.ui.media.FlashObject.ScriptAccessLevel'); 
goog.provide('goog.ui.media.FlashObject.Wmodes'); 
goog.require('goog.asserts'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.string'); 
goog.require('goog.structs.Map'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Component.Error'); 
goog.require('goog.userAgent'); 
goog.require('goog.userAgent.flash'); 
goog.ui.media.FlashObject = function(flashUrl, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.flashUrl_ = flashUrl; 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  this.flashVars_ = new goog.structs.Map(); 
}; 
goog.inherits(goog.ui.media.FlashObject, goog.ui.Component); 
goog.ui.media.FlashObject.SwfReadyStates_ = { 
  LOADING: 0, 
  UNINITIALIZED: 1, 
  LOADED: 2, 
  INTERACTIVE: 3, 
  COMPLETE: 4 
}; 
goog.ui.media.FlashObject.Wmodes = { 
  OPAQUE: 'opaque', 
  TRANSPARENT: 'transparent', 
  WINDOW: 'window' 
}; 
goog.ui.media.FlashObject.ScriptAccessLevel = { 
  ALWAYS: 'always', 
  SAME_DOMAIN: 'sameDomain', 
  NEVER: 'never' 
}; 
goog.ui.media.FlashObject.CSS_CLASS = goog.getCssName('goog-ui-media-flash'); 
goog.ui.media.FlashObject.FLASH_CSS_CLASS = goog.getCssName('goog-ui-media-flash-object'); 
goog.ui.media.FlashObject.IE_HTML_ = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"' + ' id="%s"' + ' name="%s"' + ' class="%s"' + '>' + '<param name="movie" value="%s"/>' + '<param name="quality" value="high"/>' + '<param name="FlashVars" value="%s"/>' + '<param name="bgcolor" value="%s"/>' + '<param name="AllowScriptAccess" value="%s"/>' + '<param name="allowFullScreen" value="true"/>' + '<param name="SeamlessTabbing" value="false"/>' + '%s' + '</object>'; 
goog.ui.media.FlashObject.IE_WMODE_PARAMS_ = '<param name="wmode" value="%s"/>'; 
goog.ui.media.FlashObject.FF_HTML_ = '<embed quality="high"' + ' id="%s"' + ' name="%s"' + ' class="%s"' + ' src="%s"' + ' FlashVars="%s"' + ' bgcolor="%s"' + ' AllowScriptAccess="%s"' + ' allowFullScreen="true"' + ' SeamlessTabbing="false"' + ' type="application/x-shockwave-flash"' + ' pluginspage="http://www.macromedia.com/go/getflashplayer"' + ' %s>' + '</embed>'; 
goog.ui.media.FlashObject.FF_WMODE_PARAMS_ = 'wmode=%s'; 
goog.ui.media.FlashObject.prototype.logger_ = goog.debug.Logger.getLogger('goog.ui.media.FlashObject'); 
goog.ui.media.FlashObject.prototype.wmode_ = goog.ui.media.FlashObject.Wmodes.WINDOW; 
goog.ui.media.FlashObject.prototype.requiredVersion_; 
goog.ui.media.FlashObject.prototype.width_; 
goog.ui.media.FlashObject.prototype.height_; 
goog.ui.media.FlashObject.prototype.backgroundColor_ = '#000000'; 
goog.ui.media.FlashObject.prototype.allowScriptAccess_ = goog.ui.media.FlashObject.ScriptAccessLevel.SAME_DOMAIN; 
goog.ui.media.FlashObject.prototype.setWmode = function(wmode) { 
  this.wmode_ = wmode; 
  return this; 
}; 
goog.ui.media.FlashObject.prototype.getWmode = function() { 
  return this.wmode_; 
}; 
goog.ui.media.FlashObject.prototype.addFlashVars = function(map) { 
  this.flashVars_.addAll(map); 
  return this; 
}; 
goog.ui.media.FlashObject.prototype.setFlashVar = function(key, value) { 
  this.flashVars_.set(key, value); 
  return this; 
}; 
goog.ui.media.FlashObject.prototype.setFlashVars = function(flashVar, opt_value) { 
  if(flashVar instanceof goog.structs.Map || goog.typeOf(flashVar) == 'object') { 
    this.addFlashVars((flashVar)); 
  } else { 
    goog.asserts.assert(goog.isString(flashVar) && goog.isDef(opt_value), 'Invalid argument(s)'); 
    this.setFlashVar((flashVar),(opt_value)); 
  } 
  return this; 
}; 
goog.ui.media.FlashObject.prototype.getFlashVars = function() { 
  return this.flashVars_; 
}; 
goog.ui.media.FlashObject.prototype.setBackgroundColor = function(color) { 
  this.backgroundColor_ = color; 
  return this; 
}; 
goog.ui.media.FlashObject.prototype.getBackgroundColor = function() { 
  return this.backgroundColor_; 
}; 
goog.ui.media.FlashObject.prototype.setAllowScriptAccess = function(value) { 
  this.allowScriptAccess_ = value; 
  return this; 
}; 
goog.ui.media.FlashObject.prototype.getAllowScriptAccess = function() { 
  return this.allowScriptAccess_; 
}; 
goog.ui.media.FlashObject.prototype.setSize = function(width, height) { 
  this.width_ = goog.isString(width) ? width: Math.round(width) + 'px'; 
  this.height_ = goog.isString(height) ? height: Math.round(height) + 'px'; 
  if(this.getElement()) { 
    goog.style.setSize(this.getFlashElement(), this.width_, this.height_); 
  } 
  return this; 
}; 
goog.ui.media.FlashObject.prototype.getRequiredVersion = function() { 
  return this.requiredVersion_; 
}; 
goog.ui.media.FlashObject.prototype.setRequiredVersion = function(version) { 
  this.requiredVersion_ = version; 
  return this; 
}; 
goog.ui.media.FlashObject.prototype.hasRequiredVersion = function() { 
  return this.requiredVersion_ != null; 
}; 
goog.ui.media.FlashObject.prototype.enterDocument = function() { 
  goog.ui.media.FlashObject.superClass_.enterDocument.call(this); 
  this.getElement().innerHTML = this.generateSwfTag_(); 
  if(this.width_ && this.height_) { 
    this.setSize(this.width_, this.height_); 
  } 
  this.eventHandler_.listen(this.getElement(), goog.object.getValues(goog.events.EventType), goog.events.Event.stopPropagation); 
}; 
goog.ui.media.FlashObject.prototype.createDom = function() { 
  if(this.hasRequiredVersion() && ! goog.userAgent.flash.isVersion((this.getRequiredVersion()))) { 
    this.logger_.warning('Required flash version not found:' + this.getRequiredVersion()); 
    throw Error(goog.ui.Component.Error.NOT_SUPPORTED); 
  } 
  var element = this.getDomHelper().createElement('div'); 
  element.className = goog.ui.media.FlashObject.CSS_CLASS; 
  this.setElementInternal(element); 
}; 
goog.ui.media.FlashObject.prototype.generateSwfTag_ = function() { 
  var template = goog.userAgent.IE ? goog.ui.media.FlashObject.IE_HTML_: goog.ui.media.FlashObject.FF_HTML_; 
  var params = goog.userAgent.IE ? goog.ui.media.FlashObject.IE_WMODE_PARAMS_: goog.ui.media.FlashObject.FF_WMODE_PARAMS_; 
  params = goog.string.subs(params, this.wmode_); 
  var keys = this.flashVars_.getKeys(); 
  var values = this.flashVars_.getValues(); 
  var flashVars =[]; 
  for(var i = 0; i < keys.length; i ++) { 
    var key = goog.string.urlEncode(keys[i]); 
    var value = goog.string.urlEncode(values[i]); 
    flashVars.push(key + '=' + value); 
  } 
  return goog.string.subs(template, this.getId(), this.getId(), goog.ui.media.FlashObject.FLASH_CSS_CLASS, goog.string.htmlEscape(this.flashUrl_), goog.string.htmlEscape(flashVars.join('&')), this.backgroundColor_, this.allowScriptAccess_, params); 
}; 
goog.ui.media.FlashObject.prototype.getFlashElement = function() { 
  return(this.getElement() ? this.getElement().firstChild: null); 
}; 
goog.ui.media.FlashObject.prototype.disposeInternal = function() { 
  goog.ui.media.FlashObject.superClass_.disposeInternal.call(this); 
  this.flashVars_ = null; 
  this.eventHandler_.dispose(); 
  this.eventHandler_ = null; 
}; 
goog.ui.media.FlashObject.prototype.isLoaded = function() { 
  if(! this.isInDocument() || ! this.getElement()) { 
    return false; 
  } 
  if(this.getFlashElement().readyState && this.getFlashElement().readyState == goog.ui.media.FlashObject.SwfReadyStates_.COMPLETE) { 
    return true; 
  } 
  if(this.getFlashElement().PercentLoaded && this.getFlashElement().PercentLoaded() == 100) { 
    return true; 
  } 
  return false; 
}; 
