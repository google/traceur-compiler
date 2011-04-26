
goog.provide('goog.ui.InputDatePicker'); 
goog.require('goog.date.DateTime'); 
goog.require('goog.dom'); 
goog.require('goog.i18n.DateTimeParse'); 
goog.require('goog.string'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.PopupDatePicker'); 
goog.ui.InputDatePicker = function(dateTimeFormatter, dateTimeParser, opt_datePicker, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.dateTimeFormatter_ = dateTimeFormatter; 
  this.dateTimeParser_ = dateTimeParser; 
  this.popupDatePicker_ = new goog.ui.PopupDatePicker(opt_datePicker, opt_domHelper); 
  this.addChild(this.popupDatePicker_); 
  this.popupDatePicker_.setAllowAutoFocus(false); 
}; 
goog.inherits(goog.ui.InputDatePicker, goog.ui.Component); 
goog.ui.InputDatePicker.prototype.dateTimeFormatter_ = null; 
goog.ui.InputDatePicker.prototype.dateTimeParser_ = null; 
goog.ui.InputDatePicker.prototype.popupDatePicker_ = null; 
goog.ui.InputDatePicker.prototype.popupParentElement_ = null; 
goog.ui.InputDatePicker.prototype.getDatePicker = function() { 
  return this.popupDatePicker_.getDatePicker(); 
}; 
goog.ui.InputDatePicker.prototype.getDate = function() { 
  var inputDate = this.getInputValueAsDate_(); 
  var pickerDate = this.popupDatePicker_.getDate(); 
  if(inputDate && pickerDate) { 
    if(! inputDate.equals(pickerDate)) { 
      this.popupDatePicker_.setDate(inputDate); 
    } 
  } else { 
    this.popupDatePicker_.setDate(null); 
  } 
  return inputDate; 
}; 
goog.ui.InputDatePicker.prototype.setDate = function(date) { 
  this.popupDatePicker_.setDate(date); 
}; 
goog.ui.InputDatePicker.prototype.setInputValue = function(value) { 
  var el = this.getElement(); 
  if(el.labelInput_) { 
    el.labelInput_.setValue(value); 
  } else { 
    el.value = value; 
  } 
}; 
goog.ui.InputDatePicker.prototype.getInputValue = function() { 
  var el = this.getElement(); 
  if(el.labelInput_) { 
    return el.labelInput_.getValue(); 
  } else { 
    return el.value; 
  } 
}; 
goog.ui.InputDatePicker.prototype.getInputValueAsDate_ = function() { 
  var value = goog.string.trim(this.getInputValue()); 
  if(value) { 
    var date = new goog.date.DateTime(); 
    if(this.dateTimeParser_.strictParse(value, date) > 0) { 
      return date; 
    } 
  } 
  return null; 
}; 
goog.ui.InputDatePicker.prototype.createDom = function() { 
  this.setElementInternal(this.getDomHelper().createDom('input', { 'type': 'text' })); 
  this.popupDatePicker_.createDom(); 
}; 
goog.ui.InputDatePicker.prototype.setPopupParentElement = function(el) { 
  this.popupParentElement_ = el; 
}; 
goog.ui.InputDatePicker.prototype.enterDocument = function() { 
  goog.ui.InputDatePicker.superClass_.enterDocument.call(this); 
  var el = this.getElement(); 
  (this.popupParentElement_ || this.getDomHelper().getDocument().body).appendChild(this.popupDatePicker_.getElement()); 
  this.popupDatePicker_.enterDocument(); 
  this.popupDatePicker_.attach(el); 
  this.popupDatePicker_.setDate(this.getInputValueAsDate_()); 
  var handler = this.getHandler(); 
  handler.listen(this.popupDatePicker_, goog.ui.DatePicker.Events.CHANGE, this.onDateChanged_); 
  handler.listen(this.popupDatePicker_, goog.ui.PopupBase.EventType.SHOW, this.onPopup_); 
}; 
goog.ui.InputDatePicker.prototype.exitDocument = function() { 
  goog.ui.InputDatePicker.superClass_.exitDocument.call(this); 
  var el = this.getElement(); 
  this.popupDatePicker_.detach(el); 
  this.popupDatePicker_.exitDocument(); 
  goog.dom.removeNode(this.popupDatePicker_.getElement()); 
}; 
goog.ui.InputDatePicker.prototype.decorateInternal = function(element) { 
  goog.ui.InputDatePicker.superClass_.decorateInternal.call(this, element); 
  this.popupDatePicker_.createDom(); 
}; 
goog.ui.InputDatePicker.prototype.disposeInternal = function() { 
  goog.ui.InputDatePicker.superClass_.disposeInternal.call(this); 
  this.popupDatePicker_.dispose(); 
  this.popupDatePicker_ = null; 
  this.popupParentElement_ = null; 
}; 
goog.ui.InputDatePicker.prototype.showForElement = function(element) { 
  this.popupDatePicker_.showPopup(element); 
}; 
goog.ui.InputDatePicker.prototype.hidePopup = function() { 
  this.popupDatePicker_.hidePopup(); 
}; 
goog.ui.InputDatePicker.prototype.onPopup_ = function(e) { 
  this.setDate(this.getInputValueAsDate_()); 
}; 
goog.ui.InputDatePicker.prototype.onDateChanged_ = function(e) { 
  this.setInputValue(e.date ? this.dateTimeFormatter_.format(e.date): ''); 
}; 
