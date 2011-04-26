
goog.provide('goog.editor.ClickToEditWrapper'); 
goog.require('goog.Disposable'); 
goog.require('goog.asserts'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.dom.Range'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.Command'); 
goog.require('goog.editor.Field.EventType'); 
goog.require('goog.editor.node'); 
goog.require('goog.editor.range'); 
goog.require('goog.events.BrowserEvent.MouseButton'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.editor.ClickToEditWrapper = function(fieldObj) { 
  goog.Disposable.call(this); 
  this.fieldObj_ = fieldObj; 
  this.originalDomHelper_ = goog.dom.getDomHelper(fieldObj.getOriginalElement()); 
  this.savedCaretRange_ = null; 
  this.fieldEventHandler_ = new goog.events.EventHandler(this); 
  this.finishMouseUpBound_ = goog.bind(this.finishMouseUp_, this); 
  this.mouseEventHandler_ = new goog.events.EventHandler(this); 
  if(! this.fieldObj_.isLoaded()) { 
    this.enterDocument(); 
  } 
  this.fieldEventHandler_.listen(this.fieldObj_, goog.editor.Field.EventType.LOAD, this.renderSelection_).listen(this.fieldObj_, goog.editor.Field.EventType.UNLOAD, this.enterDocument); 
}; 
goog.inherits(goog.editor.ClickToEditWrapper, goog.Disposable); 
goog.editor.ClickToEditWrapper.prototype.logger_ = goog.debug.Logger.getLogger('goog.editor.ClickToEditWrapper'); 
goog.editor.ClickToEditWrapper.prototype.getFieldObject = function() { 
  return this.fieldObj_; 
}; 
goog.editor.ClickToEditWrapper.prototype.getOriginalDomHelper = function() { 
  return this.originalDomHelper_; 
}; 
goog.editor.ClickToEditWrapper.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  this.exitDocument(); 
  if(this.savedCaretRange_) { 
    this.savedCaretRange_.dispose(); 
  } 
  this.fieldEventHandler_.dispose(); 
  this.mouseEventHandler_.dispose(); 
  this.savedCaretRange_ = null; 
  delete this.fieldEventHandler_; 
  delete this.mouseEventHandler_; 
}; 
goog.editor.ClickToEditWrapper.prototype.enterDocument = function() { 
  if(this.isInDocument_) { 
    return; 
  } 
  this.isInDocument_ = true; 
  this.mouseEventTriggeredLoad_ = false; 
  var field = this.fieldObj_.getOriginalElement(); 
  this.savedAnchorClicked_ = null; 
  this.mouseEventHandler_.listen(field, goog.events.EventType.MOUSEUP, this.handleMouseUp_).listen(field, goog.events.EventType.CLICK, this.handleClick_); 
  this.fieldObj_.execCommand(goog.editor.Command.UPDATE_LOREM); 
}; 
goog.editor.ClickToEditWrapper.prototype.exitDocument = function() { 
  this.mouseEventHandler_.removeAll(); 
  this.isInDocument_ = false; 
}; 
goog.editor.ClickToEditWrapper.prototype.getElement = function() { 
  return this.fieldObj_.isLoaded() ? this.fieldObj_.getElement(): this.fieldObj_.getOriginalElement(); 
}; 
goog.editor.ClickToEditWrapper.prototype.shouldHandleMouseEvent_ = function(e) { 
  return e.isButton(goog.events.BrowserEvent.MouseButton.LEFT) && !(e.shiftKey || e.ctrlKey || e.altKey || e.metaKey); 
}; 
goog.editor.ClickToEditWrapper.prototype.handleClick_ = function(e) { 
  var anchorAncestor = goog.dom.getAncestorByTagNameAndClass((e.target), goog.dom.TagName.A); 
  if(anchorAncestor) { 
    e.preventDefault(); 
    if(! goog.editor.BrowserFeature.HAS_ACTIVE_ELEMENT) { 
      this.savedAnchorClicked_ = anchorAncestor; 
    } 
  } 
}; 
goog.editor.ClickToEditWrapper.prototype.handleMouseUp_ = function(e) { 
  if(this.shouldHandleMouseEvent_(e)) { 
    this.originalDomHelper_.getWindow().setTimeout(this.finishMouseUpBound_, 0); 
  } 
}; 
goog.editor.ClickToEditWrapper.prototype.finishMouseUp_ = function() { 
  if(! this.fieldObj_.isLoaded()) { 
    if(this.savedCaretRange_) { 
      this.savedCaretRange_.dispose(); 
      this.savedCaretRange_ = null; 
    } 
    if(! this.fieldObj_.queryCommandValue(goog.editor.Command.USING_LOREM)) { 
      this.insertCarets_(); 
    } 
    this.ensureFieldEditable_(); 
  } 
  this.exitDocument(); 
  this.savedAnchorClicked_ = null; 
}; 
goog.editor.ClickToEditWrapper.prototype.ensureFieldEditable_ = function() { 
  if(! this.fieldObj_.isLoaded()) { 
    this.mouseEventTriggeredLoad_ = true; 
    this.makeFieldEditable(this.fieldObj_); 
  } 
}; 
goog.editor.ClickToEditWrapper.prototype.renderSelection_ = function() { 
  if(this.savedCaretRange_) { 
    this.savedCaretRange_.setRestorationDocument(this.fieldObj_.getEditableDomHelper().getDocument()); 
    var startCaret = this.savedCaretRange_.getCaret(true); 
    var endCaret = this.savedCaretRange_.getCaret(false); 
    var hasCarets = startCaret && endCaret; 
  } 
  if(this.mouseEventTriggeredLoad_ || hasCarets) { 
    this.focusOnFieldObj(this.fieldObj_); 
  } 
  if(hasCarets) { 
    var startCaretParent = startCaret.parentNode; 
    var endCaretParent = endCaret.parentNode; 
    this.savedCaretRange_.restore(); 
    this.fieldObj_.dispatchSelectionChangeEvent(); 
  } 
  if(this.savedCaretRange_) { 
    this.savedCaretRange_.dispose(); 
    this.savedCaretRange_ = null; 
  } 
  this.mouseEventTriggeredLoad_ = false; 
}; 
goog.editor.ClickToEditWrapper.prototype.focusOnFieldObj = function(field) { 
  field.focusAndPlaceCursorAtStart(); 
}; 
goog.editor.ClickToEditWrapper.prototype.makeFieldEditable = function(field) { 
  field.makeEditable(); 
}; 
goog.editor.ClickToEditWrapper.createCaretRange_ = function(range) { 
  return range && goog.editor.range.saveUsingNormalizedCarets(range); 
}; 
goog.editor.ClickToEditWrapper.prototype.insertCarets_ = function() { 
  var fieldElement = this.fieldObj_.getOriginalElement(); 
  this.savedCaretRange_ = null; 
  var originalWindow = this.originalDomHelper_.getWindow(); 
  if(goog.dom.Range.hasSelection(originalWindow)) { 
    var range = goog.dom.Range.createFromWindow(originalWindow); 
    range = range && goog.editor.range.narrow(range, fieldElement); 
    this.savedCaretRange_ = goog.editor.ClickToEditWrapper.createCaretRange_(range); 
  } 
  if(! this.savedCaretRange_) { 
    var specialNodeClicked; 
    if(goog.editor.BrowserFeature.HAS_ACTIVE_ELEMENT) { 
      specialNodeClicked = goog.editor.node.getActiveElementIE(this.originalDomHelper_.getDocument()); 
    } else { 
      specialNodeClicked = this.savedAnchorClicked_; 
    } 
    var isFieldElement = function(node) { 
      return node == fieldElement; 
    }; 
    if(specialNodeClicked && goog.dom.getAncestor(specialNodeClicked, isFieldElement, true)) { 
      this.savedCaretRange_ = goog.editor.ClickToEditWrapper.createCaretRange_(goog.dom.Range.createFromNodes(specialNodeClicked, 0, specialNodeClicked, 0)); 
    } 
  } 
}; 
