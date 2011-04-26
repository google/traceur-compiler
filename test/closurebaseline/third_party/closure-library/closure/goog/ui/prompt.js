
goog.provide('goog.ui.Prompt'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.ui.Component.Error'); 
goog.require('goog.ui.Dialog'); 
goog.require('goog.ui.Dialog.ButtonSet'); 
goog.require('goog.ui.Dialog.DefaultButtonKeys'); 
goog.require('goog.ui.Dialog.EventType'); 
goog.require('goog.userAgent'); 
goog.ui.Prompt = function(promptTitle, promptText, callback, opt_defaultValue, opt_class, opt_useIframeForIE, opt_domHelper) { 
  goog.ui.Dialog.call(this, opt_class, opt_useIframeForIE, opt_domHelper); 
  this.setTitle(promptTitle); 
  this.setContent(promptText + '<br><br>'); 
  this.callback_ = callback; 
  this.defaultValue_ = goog.isDef(opt_defaultValue) ? opt_defaultValue: ''; 
  goog.events.listen(this, goog.ui.Dialog.EventType.SELECT, this.onPromptExit_); 
  var MSG_PROMPT_OK = goog.getMsg('OK'); 
  var MSG_PROMPT_CANCEL = goog.getMsg('Cancel'); 
  var buttonSet = new goog.ui.Dialog.ButtonSet(opt_domHelper); 
  buttonSet.set(goog.ui.Dialog.DefaultButtonKeys.OK, MSG_PROMPT_OK, true); 
  buttonSet.set(goog.ui.Dialog.DefaultButtonKeys.CANCEL, MSG_PROMPT_CANCEL, false, true); 
  this.setButtonSet(buttonSet); 
}; 
goog.inherits(goog.ui.Prompt, goog.ui.Dialog); 
goog.ui.Prompt.prototype.callback_ = goog.nullFunction; 
goog.ui.Prompt.prototype.defaultValue_ = ''; 
goog.ui.Prompt.prototype.userInputEl_ = null; 
goog.ui.Prompt.prototype.isClosing_ = false; 
goog.ui.Prompt.prototype.rows_ = 1; 
goog.ui.Prompt.prototype.cols_ = 0; 
goog.ui.Prompt.prototype.setRows = function(rows) { 
  if(this.isInDocument()) { 
    if(this.userInputEl_.tagName.toLowerCase() == 'input') { 
      if(rows > 1) { 
        throw Error(goog.ui.Component.Error.ALREADY_RENDERED); 
      } 
    } else { 
      if(rows <= 1) { 
        throw Error(goog.ui.Component.Error.ALREADY_RENDERED); 
      } 
      this.userInputEl_.rows = rows; 
    } 
  } 
  this.rows_ = rows; 
}; 
goog.ui.Prompt.prototype.getRows = function() { 
  return this.rows_; 
}; 
goog.ui.Prompt.prototype.setCols = function(cols) { 
  this.cols_ = cols; 
  if(this.userInputEl_) { 
    if(this.userInputEl_.tagName.toLowerCase() == 'input') { 
      this.userInputEl_.size = cols; 
    } else { 
      this.userInputEl_.cols = cols; 
    } 
  } 
}; 
goog.ui.Prompt.prototype.getCols = function() { 
  return this.cols_; 
}; 
goog.ui.Prompt.prototype.createDom = function() { 
  goog.ui.Prompt.superClass_.createDom.call(this); 
  var cls = this.getClass(); 
  var attrs = { 
    'className': goog.getCssName(cls, 'userInput'), 
    'value': this.defaultValue_ 
  }; 
  if(this.rows_ == 1) { 
    this.userInputEl_ =(this.getDomHelper().createDom('input', attrs)); 
    this.userInputEl_.type = 'text'; 
    if(this.cols_) { 
      this.userInputEl_.size = this.cols_; 
    } 
  } else { 
    this.userInputEl_ =(this.getDomHelper().createDom('textarea', attrs)); 
    this.userInputEl_.rows = this.rows_; 
    if(this.cols_) { 
      this.userInputEl_.cols = this.cols_; 
    } 
  } 
  var contentEl = this.getContentElement(); 
  contentEl.appendChild(this.getDomHelper().createDom('div', { 'style': 'overflow: auto' }, this.userInputEl_)); 
  if(this.rows_ > 1) { 
    this.getButtonSet().setDefault(null); 
  } 
}; 
goog.ui.Prompt.prototype.setVisible = function(visible) { 
  goog.ui.Dialog.prototype.setVisible.call(this, visible); 
  if(visible) { 
    this.isClosing_ = false; 
    this.userInputEl_.value = this.defaultValue_; 
    this.focus(); 
  } 
}; 
goog.ui.Prompt.prototype.focus = function() { 
  if(goog.userAgent.OPERA) { 
    this.userInputEl_.focus(); 
  } 
  this.userInputEl_.select(); 
}; 
goog.ui.Prompt.prototype.setDefaultValue = function(defaultValue) { 
  this.defaultValue_ = defaultValue; 
}; 
goog.ui.Prompt.prototype.onPromptExit_ = function(e) { 
  if(! this.isClosing_) { 
    this.isClosing_ = true; 
    if(e.key == 'ok') { 
      goog.Timer.callOnce(goog.bind(this.callback_, this, this.userInputEl_.value), 1); 
    } else { 
      goog.Timer.callOnce(goog.bind(this.callback_, this, null), 1); 
    } 
  } 
}; 
goog.ui.Prompt.prototype.disposeInternal = function() { 
  goog.dom.removeNode(this.userInputEl_); 
  goog.events.unlisten(this, goog.ui.Dialog.EventType.SELECT, this.onPromptExit_, true, this); 
  goog.ui.Prompt.superClass_.disposeInternal.call(this); 
  this.defaulValue_ = null; 
  this.userInputEl_ = null; 
}; 
