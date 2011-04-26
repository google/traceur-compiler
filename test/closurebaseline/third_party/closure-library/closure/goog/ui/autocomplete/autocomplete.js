
goog.provide('goog.ui.AutoComplete'); 
goog.provide('goog.ui.AutoComplete.EventType'); 
goog.require('goog.events'); 
goog.require('goog.events.EventTarget'); 
goog.ui.AutoComplete = function(matcher, renderer, selectionHandler) { 
  goog.events.EventTarget.call(this); 
  this.matcher_ = matcher; 
  this.selectionHandler_ = selectionHandler; 
  this.renderer_ = renderer; 
  goog.events.listen(renderer,[goog.ui.AutoComplete.EventType.HILITE, goog.ui.AutoComplete.EventType.SELECT, goog.ui.AutoComplete.EventType.CANCEL_DISMISS, goog.ui.AutoComplete.EventType.DISMISS], this); 
  this.token_ = null; 
  this.rows_ =[]; 
  this.hiliteId_ = - 1; 
  this.firstRowId_ = 0; 
  this.target_ = null; 
  this.dismissTimer_ = null; 
}; 
goog.inherits(goog.ui.AutoComplete, goog.events.EventTarget); 
goog.ui.AutoComplete.prototype.maxMatches_ = 10; 
goog.ui.AutoComplete.prototype.autoHilite_ = true; 
goog.ui.AutoComplete.prototype.allowFreeSelect_ = false; 
goog.ui.AutoComplete.prototype.wrap_ = false; 
goog.ui.AutoComplete.prototype.triggerSuggestionsOnUpdate_ = false; 
goog.ui.AutoComplete.EventType = { 
  HILITE: 'hilite', 
  SELECT: 'select', 
  DISMISS: 'dismiss', 
  CANCEL_DISMISS: 'canceldismiss', 
  UPDATE: 'update', 
  SUGGESTIONS_UPDATE: 'suggestionsupdate' 
}; 
goog.ui.AutoComplete.prototype.getRenderer = function() { 
  return this.renderer_; 
}; 
goog.ui.AutoComplete.prototype.handleEvent = function(e) { 
  if(e.target == this.renderer_) { 
    switch(e.type) { 
      case goog.ui.AutoComplete.EventType.HILITE: 
        this.hiliteId((e.row)); 
        break; 

      case goog.ui.AutoComplete.EventType.SELECT: 
        this.selectHilited(); 
        break; 

      case goog.ui.AutoComplete.EventType.CANCEL_DISMISS: 
        this.cancelDelayedDismiss(); 
        break; 

      case goog.ui.AutoComplete.EventType.DISMISS: 
        this.dismissOnDelay(); 
        break; 

    } 
  } 
}; 
goog.ui.AutoComplete.prototype.setMaxMatches = function(max) { 
  this.maxMatches_ = max; 
}; 
goog.ui.AutoComplete.prototype.setAutoHilite = function(autoHilite) { 
  this.autoHilite_ = autoHilite; 
}; 
goog.ui.AutoComplete.prototype.setAllowFreeSelect = function(allowFreeSelect) { 
  this.allowFreeSelect_ = allowFreeSelect; 
}; 
goog.ui.AutoComplete.prototype.setWrap = function(wrap) { 
  this.wrap_ = wrap; 
}; 
goog.ui.AutoComplete.prototype.setTriggerSuggestionsOnUpdate = function(triggerSuggestionsOnUpdate) { 
  this.triggerSuggestionsOnUpdate_ = triggerSuggestionsOnUpdate; 
}; 
goog.ui.AutoComplete.prototype.setToken = function(token, opt_fullString) { 
  if(this.token_ == token) { 
    return; 
  } 
  this.token_ = token; 
  this.matcher_.requestMatchingRows(this.token_, this.maxMatches_, goog.bind(this.matchListener_, this), opt_fullString); 
  this.cancelDelayedDismiss(); 
}; 
goog.ui.AutoComplete.prototype.getTarget = function() { 
  return this.target_; 
}; 
goog.ui.AutoComplete.prototype.setTarget = function(target) { 
  this.target_ = target; 
}; 
goog.ui.AutoComplete.prototype.isOpen = function() { 
  return this.renderer_.isVisible(); 
}; 
goog.ui.AutoComplete.prototype.getRowCount = function() { 
  return this.rows_.length; 
}; 
goog.ui.AutoComplete.prototype.hiliteNext = function() { 
  var lastId = this.firstRowId_ + this.rows_.length - 1; 
  if(this.hiliteId_ >= this.firstRowId_ && this.hiliteId_ < lastId) { 
    this.hiliteId(this.hiliteId_ + 1); 
    return true; 
  } else if(this.hiliteId_ == - 1) { 
    this.hiliteId(this.firstRowId_); 
    return true; 
  } else if(this.hiliteId_ == lastId) { 
    if(this.allowFreeSelect_) { 
      this.hiliteId(- 1); 
      return false; 
    } else if(this.wrap_) { 
      this.hiliteId(this.firstRowId_); 
      return true; 
    } 
  } 
  return false; 
}; 
goog.ui.AutoComplete.prototype.hilitePrev = function() { 
  if(this.hiliteId_ > this.firstRowId_) { 
    this.hiliteId(this.hiliteId_ - 1); 
    return true; 
  } else if(this.allowFreeSelect_ && this.hiliteId_ == this.firstRowId_) { 
    this.hiliteId(- 1); 
    return false; 
  } else if(this.wrap_ &&(this.hiliteId_ == - 1 || this.hiliteId_ == this.firstRowId_)) { 
    var lastId = this.firstRowId_ + this.rows_.length - 1; 
    this.hiliteId(lastId); 
    return true; 
  } 
  return false; 
}; 
goog.ui.AutoComplete.prototype.hiliteId = function(id) { 
  this.hiliteId_ = id; 
  this.renderer_.hiliteId(id); 
  return this.getIndexOfId(id) != - 1; 
}; 
goog.ui.AutoComplete.prototype.selectHilited = function() { 
  var index = this.getIndexOfId(this.hiliteId_); 
  if(index != - 1) { 
    var selectedRow = this.rows_[index]; 
    var suppressUpdate = this.selectionHandler_.selectRow(selectedRow); 
    if(this.triggerSuggestionsOnUpdate_) { 
      this.token_ = null; 
      this.dismissOnDelay(); 
    } else { 
      this.dismiss(); 
    } 
    if(! suppressUpdate) { 
      this.dispatchEvent({ 
        type: goog.ui.AutoComplete.EventType.UPDATE, 
        row: selectedRow 
      }); 
      if(this.triggerSuggestionsOnUpdate_) { 
        this.selectionHandler_.update(true); 
      } 
    } 
    return true; 
  } else { 
    this.dismiss(); 
    this.dispatchEvent({ 
      type: goog.ui.AutoComplete.EventType.UPDATE, 
      row: null 
    }); 
    return false; 
  } 
}; 
goog.ui.AutoComplete.prototype.hasHighlight = function() { 
  return this.isOpen() && this.getIndexOfId(this.hiliteId_) != - 1; 
}; 
goog.ui.AutoComplete.prototype.dismiss = function() { 
  this.hiliteId_ = - 1; 
  this.token_ = null; 
  this.firstRowId_ += this.rows_.length; 
  this.rows_ =[]; 
  window.clearTimeout(this.dismissTimer_); 
  this.dismissTimer_ = null; 
  this.renderer_.dismiss(); 
}; 
goog.ui.AutoComplete.prototype.dismissOnDelay = function() { 
  if(! this.dismissTimer_) { 
    this.dismissTimer_ = window.setTimeout(goog.bind(this.dismiss, this), 100); 
  } 
}; 
goog.ui.AutoComplete.prototype.cancelDelayedDismiss = function() { 
  window.setTimeout(goog.bind(function() { 
    if(this.dismissTimer_) { 
      window.clearTimeout(this.dismissTimer_); 
      this.dismissTimer_ = null; 
    } 
  }, this), 10); 
}; 
goog.ui.AutoComplete.prototype.disposeInternal = function() { 
  goog.ui.AutoComplete.superClass_.disposeInternal.call(this); 
  this.renderer_.dispose(); 
  this.selectionHandler_.dispose(); 
  this.matcher_ = null; 
}; 
goog.ui.AutoComplete.prototype.matchListener_ = function(matchedToken, rows, opt_preserveHilited) { 
  if(this.token_ != matchedToken) { 
    return; 
  } 
  this.renderRows(rows, opt_preserveHilited); 
}; 
goog.ui.AutoComplete.prototype.renderRows = function(rows, opt_preserveHilited) { 
  var indexToHilite = opt_preserveHilited ? this.getIndexOfId(this.hiliteId_): null; 
  this.firstRowId_ += this.rows_.length; 
  this.rows_ = rows; 
  var rendRows =[]; 
  for(var i = 0; i < rows.length; ++ i) { 
    rendRows.push({ 
      id: this.getIdOfIndex_(i), 
      data: rows[i]
    }); 
  } 
  this.renderer_.renderRows(rendRows, this.token_, this.target_); 
  if(this.autoHilite_ && rendRows.length != 0 && this.token_) { 
    var idToHilite = indexToHilite != null ? this.getIdOfIndex_(indexToHilite): this.firstRowId_; 
    this.hiliteId(idToHilite); 
  } else { 
    this.hiliteId_ = - 1; 
  } 
  this.dispatchEvent(goog.ui.AutoComplete.EventType.SUGGESTIONS_UPDATE); 
}; 
goog.ui.AutoComplete.prototype.getIndexOfId = function(id) { 
  var index = id - this.firstRowId_; 
  if(index < 0 || index >= this.rows_.length) { 
    return - 1; 
  } 
  return index; 
}; 
goog.ui.AutoComplete.prototype.getIdOfIndex_ = function(index) { 
  return this.firstRowId_ + index; 
}; 
goog.ui.AutoComplete.prototype.attachInputs = function(var_args) { 
  var inputHandler =(this.selectionHandler_); 
  inputHandler.attachInputs.apply(inputHandler, arguments); 
}; 
goog.ui.AutoComplete.prototype.detachInputs = function(var_args) { 
  var inputHandler =(this.selectionHandler_); 
  inputHandler.detachInputs.apply(inputHandler, arguments); 
}; 
