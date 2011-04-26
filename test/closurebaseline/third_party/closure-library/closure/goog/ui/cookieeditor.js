
goog.provide('goog.ui.CookieEditor'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.events.EventType'); 
goog.require('goog.net.cookies'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.ui.CookieEditor = function(opt_domHelper) { 
  goog.base(this, opt_domHelper); 
}; 
goog.inherits(goog.ui.CookieEditor, goog.ui.Component); 
goog.ui.CookieEditor.prototype.cookieKey_; 
goog.ui.CookieEditor.prototype.textAreaElem_; 
goog.ui.CookieEditor.prototype.clearButtonElem_; 
goog.ui.CookieEditor.prototype.valueWarningElem_; 
goog.ui.CookieEditor.prototype.updateButtonElem_; 
goog.ui.CookieEditor.prototype.selectCookie = function(cookieKey) { 
  goog.asserts.assert(goog.net.cookies.isValidName(cookieKey)); 
  this.cookieKey_ = cookieKey; 
  if(this.textAreaElem_) { 
    this.textAreaElem_.value = goog.net.cookies.get(cookieKey) || ''; 
  } 
}; 
goog.ui.CookieEditor.prototype.canDecorate = function() { 
  return false; 
}; 
goog.ui.CookieEditor.prototype.createDom = function() { 
  this.clearButtonElem_ =(goog.dom.createDom(goog.dom.TagName.BUTTON, null, 'Clear')); 
  this.updateButtonElem_ =(goog.dom.createDom(goog.dom.TagName.BUTTON, null, 'Update')); 
  var value = this.cookieKey_ && goog.net.cookies.get(this.cookieKey_); 
  this.textAreaElem_ =(goog.dom.createDom(goog.dom.TagName.TEXTAREA, null, value || '')); 
  this.valueWarningElem_ =(goog.dom.createDom(goog.dom.TagName.SPAN, { 'style': 'display:none;color:red' }, 'Invalid cookie value.')); 
  this.setElementInternal(goog.dom.createDom(goog.dom.TagName.DIV, null, this.valueWarningElem_, goog.dom.createDom(goog.dom.TagName.BR), this.textAreaElem_, goog.dom.createDom(goog.dom.TagName.BR), this.clearButtonElem_, this.updateButtonElem_)); 
}; 
goog.ui.CookieEditor.prototype.enterDocument = function() { 
  goog.base(this, 'enterDocument'); 
  this.getHandler().listen(this.clearButtonElem_, goog.events.EventType.CLICK, this.handleClear_); 
  this.getHandler().listen(this.updateButtonElem_, goog.events.EventType.CLICK, this.handleUpdate_); 
}; 
goog.ui.CookieEditor.prototype.handleClear_ = function(e) { 
  if(this.cookieKey_) { 
    goog.net.cookies.remove(this.cookieKey_); 
  } 
  this.textAreaElem_.value = ''; 
}; 
goog.ui.CookieEditor.prototype.handleUpdate_ = function(e) { 
  if(this.cookieKey_) { 
    var value = this.textAreaElem_.value; 
    if(value) { 
      value = goog.string.stripNewlines(value); 
    } 
    if(goog.net.cookies.isValidValue(value)) { 
      goog.net.cookies.set(this.cookieKey_, value); 
      goog.style.showElement(this.valueWarningElem_, false); 
    } else { 
      goog.style.showElement(this.valueWarningElem_, true); 
    } 
  } 
}; 
goog.ui.CookieEditor.prototype.disposeInternal = function() { 
  this.clearButtonElem_ = null; 
  this.cookieKey_ = null; 
  this.textAreaElem_ = null; 
  this.updateButtonElem_ = null; 
  this.valueWarningElem_ = null; 
}; 
