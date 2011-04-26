
goog.provide('goog.ui.PopupDatePicker'); 
goog.require('goog.events.EventType'); 
goog.require('goog.positioning.AnchoredPosition'); 
goog.require('goog.positioning.Corner'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.DatePicker'); 
goog.require('goog.ui.DatePicker.Events'); 
goog.require('goog.ui.Popup'); 
goog.require('goog.ui.PopupBase.EventType'); 
goog.ui.PopupDatePicker = function(opt_datePicker, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.datePicker_ = opt_datePicker || new goog.ui.DatePicker(); 
}; 
goog.inherits(goog.ui.PopupDatePicker, goog.ui.Component); 
goog.ui.PopupDatePicker.prototype.datePicker_ = null; 
goog.ui.PopupDatePicker.prototype.popup_ = null; 
goog.ui.PopupDatePicker.prototype.lastTarget_ = null; 
goog.ui.PopupDatePicker.prototype.allowAutoFocus_ = true; 
goog.ui.PopupDatePicker.prototype.createDom = function() { 
  goog.ui.PopupDatePicker.superClass_.createDom.call(this); 
  this.getElement().className = goog.getCssName('goog-popupdatepicker'); 
  this.popup_ = new goog.ui.Popup(this.getElement()); 
}; 
goog.ui.PopupDatePicker.prototype.enterDocument = function() { 
  goog.ui.PopupDatePicker.superClass_.enterDocument.call(this); 
  if(! this.datePicker_.isInDocument()) { 
    var el = this.getElement(); 
    el.style.visibility = 'hidden'; 
    goog.style.showElement(el, false); 
    this.datePicker_.decorate(el); 
  } 
  this.getHandler().listen(this.datePicker_, goog.ui.DatePicker.Events.CHANGE, this.onDateChanged_); 
}; 
goog.ui.PopupDatePicker.prototype.disposeInternal = function() { 
  goog.ui.PopupDatePicker.superClass_.disposeInternal.call(this); 
  if(this.popup_) { 
    this.popup_.dispose(); 
    this.popup_ = null; 
  } 
  this.datePicker_.dispose(); 
  this.datePicker_ = null; 
  this.lastTarget_ = null; 
}; 
goog.ui.PopupDatePicker.prototype.canDecorate = function(element) { 
  return false; 
}; 
goog.ui.PopupDatePicker.prototype.getDatePicker = function() { 
  return this.datePicker_; 
}; 
goog.ui.PopupDatePicker.prototype.getDate = function() { 
  return this.datePicker_.getDate(); 
}; 
goog.ui.PopupDatePicker.prototype.setDate = function(date) { 
  this.datePicker_.setDate(date); 
}; 
goog.ui.PopupDatePicker.prototype.getLastTarget = function() { 
  return this.lastTarget_; 
}; 
goog.ui.PopupDatePicker.prototype.attach = function(element) { 
  this.getHandler().listen(element, goog.events.EventType.MOUSEDOWN, this.showPopup_); 
}; 
goog.ui.PopupDatePicker.prototype.detach = function(element) { 
  this.getHandler().unlisten(element, goog.events.EventType.MOUSEDOWN, this.showPopup_); 
}; 
goog.ui.PopupDatePicker.prototype.setAllowAutoFocus = function(allow) { 
  this.allowAutoFocus_ = allow; 
}; 
goog.ui.PopupDatePicker.prototype.getAllowAutoFocus = function() { 
  return this.allowAutoFocus_; 
}; 
goog.ui.PopupDatePicker.prototype.showPopup = function(element) { 
  this.lastTarget_ = element; 
  this.popup_.setPosition(new goog.positioning.AnchoredPosition(element, goog.positioning.Corner.BOTTOM_START)); 
  this.getHandler().unlisten(this.datePicker_, goog.ui.DatePicker.Events.CHANGE, this.onDateChanged_); 
  this.datePicker_.setDate(null); 
  this.dispatchEvent(goog.ui.PopupBase.EventType.SHOW); 
  this.getHandler().listen(this.datePicker_, goog.ui.DatePicker.Events.CHANGE, this.onDateChanged_); 
  this.popup_.setVisible(true); 
  if(this.allowAutoFocus_) { 
    this.getElement().focus(); 
  } 
}; 
goog.ui.PopupDatePicker.prototype.showPopup_ = function(event) { 
  this.showPopup((event.currentTarget)); 
}; 
goog.ui.PopupDatePicker.prototype.hidePopup = function() { 
  this.popup_.setVisible(false); 
  if(this.allowAutoFocus_ && this.lastTarget_) { 
    this.lastTarget_.focus(); 
  } 
}; 
goog.ui.PopupDatePicker.prototype.onDateChanged_ = function(event) { 
  this.hidePopup(); 
  this.dispatchEvent(event); 
}; 
