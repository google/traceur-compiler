
goog.provide('goog.editor.plugins.UndoRedo'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeOffset'); 
goog.require('goog.dom.Range'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.Command'); 
goog.require('goog.editor.Field.EventType'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.editor.plugins.UndoRedoManager'); 
goog.require('goog.editor.plugins.UndoRedoState'); 
goog.require('goog.events'); 
goog.require('goog.events.EventHandler'); 
goog.editor.plugins.UndoRedo = function(opt_manager) { 
  goog.editor.Plugin.call(this); 
  this.setUndoRedoManager(opt_manager || new goog.editor.plugins.UndoRedoManager()); 
  this.eventHandlers_ = { }; 
  this.currentStates_ = { }; 
  this.initialFieldChange_ = null; 
  this.boundRestoreState_ = goog.bind(this.restoreState, this); 
}; 
goog.inherits(goog.editor.plugins.UndoRedo, goog.editor.Plugin); 
goog.editor.plugins.UndoRedo.prototype.logger = goog.debug.Logger.getLogger('goog.editor.plugins.UndoRedo'); 
goog.editor.plugins.UndoRedo.prototype.inProgressUndo_ = null; 
goog.editor.plugins.UndoRedo.prototype.undoManager_; 
goog.editor.plugins.UndoRedo.prototype.managerStateChangeKey_; 
goog.editor.plugins.UndoRedo.COMMAND = { 
  UNDO: '+undo', 
  REDO: '+redo' 
}; 
goog.editor.plugins.UndoRedo.SUPPORTED_COMMANDS_ = goog.object.transpose(goog.editor.plugins.UndoRedo.COMMAND); 
goog.editor.plugins.UndoRedo.prototype.setMaxUndoDepth = function(depth) { 
  this.undoManager_.setMaxUndoDepth(depth); 
}; 
goog.editor.plugins.UndoRedo.prototype.setUndoRedoManager = function(manager) { 
  if(this.managerStateChangeKey_) { 
    goog.events.unlistenByKey(this.managerStateChangeKey_); 
  } 
  this.undoManager_ = manager; 
  this.managerStateChangeKey_ =(goog.events.listen(this.undoManager_, goog.editor.plugins.UndoRedoManager.EventType.STATE_CHANGE, this.dispatchCommandValueChange_, false, this)); 
}; 
goog.editor.plugins.UndoRedo.prototype.isSupportedCommand = function(command) { 
  return command in goog.editor.plugins.UndoRedo.SUPPORTED_COMMANDS_; 
}; 
goog.editor.plugins.UndoRedo.prototype.registerFieldObject = function(fieldObject) { 
  this.fieldObject = fieldObject; 
}; 
goog.editor.plugins.UndoRedo.prototype.unregisterFieldObject = function(fieldObject) { 
  this.disable(fieldObject); 
  this.fieldObject = null; 
}; 
goog.editor.plugins.UndoRedo.prototype.getCurrentFieldObject = function() { 
  return this.fieldObject; 
}; 
goog.editor.plugins.UndoRedo.prototype.getFieldObject = function(fieldHashCode) { 
  return this.fieldObject; 
}; 
goog.editor.plugins.UndoRedo.prototype.getCurrentEventTarget = function() { 
  return this.fieldObject; 
}; 
goog.editor.plugins.UndoRedo.prototype.enable = function(fieldObject) { 
  if(this.isEnabled(fieldObject)) { 
    return; 
  } 
  fieldObject.clearDelayedChange(); 
  var eventHandler = new goog.events.EventHandler(this); 
  if(! goog.editor.BrowserFeature.USE_MUTATION_EVENTS) { 
    eventHandler.listen(fieldObject, goog.editor.Field.EventType.BEFORECHANGE, this.handleBeforeChange_); 
  } 
  eventHandler.listen(fieldObject, goog.editor.Field.EventType.DELAYEDCHANGE, this.handleDelayedChange_); 
  eventHandler.listen(fieldObject, goog.editor.Field.EventType.BLUR, this.handleBlur_); 
  this.eventHandlers_[fieldObject.getHashCode()]= eventHandler; 
  this.updateCurrentState_(fieldObject); 
}; 
goog.editor.plugins.UndoRedo.prototype.disable = function(fieldObject) { 
  fieldObject.clearDelayedChange(); 
  var eventHandler = this.eventHandlers_[fieldObject.getHashCode()]; 
  if(eventHandler) { 
    eventHandler.dispose(); 
    delete this.eventHandlers_[fieldObject.getHashCode()]; 
  } 
  if(this.currentStates_[fieldObject.getHashCode()]) { 
    delete this.currentStates_[fieldObject.getHashCode()]; 
  } 
}; 
goog.editor.plugins.UndoRedo.prototype.isEnabled = function(fieldObject) { 
  return ! ! this.eventHandlers_[fieldObject.getHashCode()]; 
}; 
goog.editor.plugins.UndoRedo.prototype.disposeInternal = function() { 
  goog.editor.plugins.UndoRedo.superClass_.disposeInternal.call(this); 
  for(var hashcode in this.eventHandlers_) { 
    this.eventHandlers_[hashcode].dispose(); 
    delete this.eventHandlers_[hashcode]; 
  } 
  this.fieldObject = null; 
  if(this.undoManager_) { 
    this.undoManager_.dispose(); 
    delete this.undoManager_; 
  } 
}; 
goog.editor.plugins.UndoRedo.prototype.getTrogClassId = function() { 
  return 'UndoRedo'; 
}; 
goog.editor.plugins.UndoRedo.prototype.execCommand = function(command, var_args) { 
  if(command == goog.editor.plugins.UndoRedo.COMMAND.UNDO) { 
    this.undoManager_.undo(); 
  } else if(command == goog.editor.plugins.UndoRedo.COMMAND.REDO) { 
    this.undoManager_.redo(); 
  } 
}; 
goog.editor.plugins.UndoRedo.prototype.queryCommandValue = function(command) { 
  var state = null; 
  if(command == goog.editor.plugins.UndoRedo.COMMAND.UNDO) { 
    state = this.undoManager_.hasUndoState(); 
  } else if(command == goog.editor.plugins.UndoRedo.COMMAND.REDO) { 
    state = this.undoManager_.hasRedoState(); 
  } 
  return state; 
}; 
goog.editor.plugins.UndoRedo.prototype.dispatchCommandValueChange_ = function() { 
  var eventTarget = this.getCurrentEventTarget(); 
  eventTarget.dispatchEvent({ 
    type: goog.editor.Field.EventType.COMMAND_VALUE_CHANGE, 
    commands:[goog.editor.plugins.UndoRedo.COMMAND.REDO, goog.editor.plugins.UndoRedo.COMMAND.UNDO]
  }); 
}; 
goog.editor.plugins.UndoRedo.prototype.restoreState = function(state, content, cursorPosition) { 
  var fieldObj = this.getFieldObject(state.fieldHashCode); 
  if(! fieldObj) { 
    return; 
  } 
  fieldObj.stopChangeEvents(true, true); 
  try { 
    fieldObj.dispatchBeforeChange(); 
    fieldObj.execCommand(goog.editor.Command.CLEAR_LOREM, true); 
    fieldObj.getElement().innerHTML = content; 
    if(cursorPosition) { 
      cursorPosition.select(); 
    } 
    var previousFieldObject = this.getCurrentFieldObject(); 
    fieldObj.focus(); 
    if(previousFieldObject && previousFieldObject.getHashCode() != state.fieldHashCode) { 
      previousFieldObject.execCommand(goog.editor.Command.UPDATE_LOREM); 
    } 
    this.currentStates_[state.fieldHashCode].setUndoState(content, cursorPosition); 
  } catch(e) { 
    this.logger.severe('Error while restoring undo state', e); 
  } finally { 
    this.inProgressUndo_ = state; 
    fieldObj.dispatchChange(); 
    fieldObj.dispatchSelectionChangeEvent(); 
  } 
}; 
goog.editor.plugins.UndoRedo.prototype.handleKeyboardShortcut = function(e, key, isModifierPressed) { 
  if(isModifierPressed) { 
    var command; 
    if(key == 'z') { 
      command = e.shiftKey ? goog.editor.plugins.UndoRedo.COMMAND.REDO: goog.editor.plugins.UndoRedo.COMMAND.UNDO; 
    } else if(key == 'y') { 
      command = goog.editor.plugins.UndoRedo.COMMAND.REDO; 
    } 
    if(command) { 
      var state = command == goog.editor.plugins.UndoRedo.COMMAND.UNDO ? this.undoManager_.undoPeek(): this.undoManager_.redoPeek(); 
      if(state && state.fieldHashCode) { 
        this.getCurrentFieldObject().execCommand(command); 
      } else { 
        this.execCommand(command); 
      } 
      return true; 
    } 
  } 
  return false; 
}; 
goog.editor.plugins.UndoRedo.prototype.clearHistory = function() { 
  this.fieldObject.stopChangeEvents(true, true); 
  this.undoManager_.clearHistory(); 
  this.fieldObject.startChangeEvents(); 
}; 
goog.editor.plugins.UndoRedo.prototype.refreshCurrentState = function(fieldObject) { 
  if(this.isEnabled(fieldObject)) { 
    if(this.currentStates_[fieldObject.getHashCode()]) { 
      delete this.currentStates_[fieldObject.getHashCode()]; 
    } 
    this.updateCurrentState_(fieldObject); 
  } 
}; 
goog.editor.plugins.UndoRedo.prototype.handleBeforeChange_ = function(e) { 
  if(this.inProgressUndo_) { 
    return; 
  } 
  var fieldObj =(e.target); 
  var fieldHashCode = fieldObj.getHashCode(); 
  if(this.initialFieldChange_ != fieldHashCode) { 
    this.initialFieldChange_ = fieldHashCode; 
    this.updateCurrentState_(fieldObj); 
  } 
}; 
goog.editor.plugins.UndoRedo.prototype.handleDelayedChange_ = function(e) { 
  if(this.inProgressUndo_) { 
    var state = this.inProgressUndo_; 
    this.inProgressUndo_ = null; 
    state.dispatchEvent(goog.editor.plugins.UndoRedoState.ACTION_COMPLETED); 
    return; 
  } 
  this.updateCurrentState_((e.target)); 
}; 
goog.editor.plugins.UndoRedo.prototype.handleBlur_ = function(e) { 
  var fieldObj =(e.target); 
  if(fieldObj) { 
    fieldObj.clearDelayedChange(); 
  } 
}; 
goog.editor.plugins.UndoRedo.prototype.getCursorPosition_ = function(fieldObj) { 
  var cursorPos = new goog.editor.plugins.UndoRedo.CursorPosition_(fieldObj); 
  if(! cursorPos.isValid()) { 
    return null; 
  } 
  return cursorPos; 
}; 
goog.editor.plugins.UndoRedo.prototype.updateCurrentState_ = function(fieldObj) { 
  var fieldHashCode = fieldObj.getHashCode(); 
  var content, cursorPos; 
  if(fieldObj.queryCommandValue(goog.editor.Command.USING_LOREM)) { 
    content = ''; 
    cursorPos = null; 
  } else { 
    content = fieldObj.getElement().innerHTML; 
    cursorPos = this.getCursorPosition_(fieldObj); 
  } 
  var currentState = this.currentStates_[fieldHashCode]; 
  if(currentState) { 
    if(currentState.undoContent_ == content) { 
      return; 
    } else if(content == '' || currentState.undoContent_ == '') { 
      var emptyContents = fieldObj.getInjectableContents('', { }); 
      if(content == emptyContents && currentState.undoContent_ == '' || currentState.undoContent_ == emptyContents && content == '') { 
        return; 
      } 
    } 
    currentState.setRedoState(content, cursorPos); 
    this.undoManager_.addState(currentState); 
  } 
  this.currentStates_[fieldHashCode]= new goog.editor.plugins.UndoRedo.UndoState_(fieldHashCode, content, cursorPos, this.boundRestoreState_); 
}; 
goog.editor.plugins.UndoRedo.UndoState_ = function(fieldHashCode, content, cursorPosition, restore) { 
  goog.editor.plugins.UndoRedoState.call(this, true); 
  this.fieldHashCode = fieldHashCode; 
  this.restore_ = restore; 
  this.setUndoState(content, cursorPosition); 
}; 
goog.inherits(goog.editor.plugins.UndoRedo.UndoState_, goog.editor.plugins.UndoRedoState); 
goog.editor.plugins.UndoRedo.UndoState_.prototype.undoContent_; 
goog.editor.plugins.UndoRedo.UndoState_.prototype.undoCursorPosition_; 
goog.editor.plugins.UndoRedo.UndoState_.prototype.redoContent_; 
goog.editor.plugins.UndoRedo.UndoState_.prototype.redoCursorPosition_; 
goog.editor.plugins.UndoRedo.UndoState_.prototype.undo = function() { 
  this.restore_(this, this.undoContent_, this.undoCursorPosition_); 
}; 
goog.editor.plugins.UndoRedo.UndoState_.prototype.redo = function() { 
  this.restore_(this, this.redoContent_, this.redoCursorPosition_); 
}; 
goog.editor.plugins.UndoRedo.UndoState_.prototype.setUndoState = function(content, cursorPosition) { 
  this.undoContent_ = content; 
  this.undoCursorPosition_ = cursorPosition; 
}; 
goog.editor.plugins.UndoRedo.UndoState_.prototype.setRedoState = function(content, cursorPosition) { 
  this.redoContent_ = content; 
  this.redoCursorPosition_ = cursorPosition; 
}; 
goog.editor.plugins.UndoRedo.UndoState_.prototype.equals = function(rhs) { 
  return this.fieldHashCode == rhs.fieldHashCode && this.undoContent_ == rhs.undoContent_ && this.redoContent_ == rhs.redoContent_; 
}; 
goog.editor.plugins.UndoRedo.CursorPosition_ = function(field) { 
  this.field_ = field; 
  var win = field.getEditableDomHelper().getWindow(); 
  var range = field.getRange(); 
  var isValidRange = ! ! range && range.isRangeInDocument() && range.getWindow() == win; 
  range = isValidRange ? range: null; 
  if(goog.editor.BrowserFeature.HAS_W3C_RANGES) { 
    this.initW3C_(range); 
  } else if(goog.editor.BrowserFeature.HAS_IE_RANGES) { 
    this.initIE_(range); 
  } 
}; 
goog.editor.plugins.UndoRedo.CursorPosition_.prototype.initW3C_ = function(range) { 
  this.isValid_ = false; 
  if(! range) { 
    return; 
  } 
  var anchorNode = range.getAnchorNode(); 
  var focusNode = range.getFocusNode(); 
  if(! anchorNode || ! focusNode) { 
    return; 
  } 
  var anchorOffset = range.getAnchorOffset(); 
  var anchor = new goog.dom.NodeOffset(anchorNode, this.field_.getElement()); 
  var focusOffset = range.getFocusOffset(); 
  var focus = new goog.dom.NodeOffset(focusNode, this.field_.getElement()); 
  if(range.isReversed()) { 
    this.startOffset_ = focus; 
    this.startChildOffset_ = focusOffset; 
    this.endOffset_ = anchor; 
    this.endChildOffset_ = anchorOffset; 
  } else { 
    this.startOffset_ = anchor; 
    this.startChildOffset_ = anchorOffset; 
    this.endOffset_ = focus; 
    this.endChildOffset_ = focusOffset; 
  } 
  this.isValid_ = true; 
}; 
goog.editor.plugins.UndoRedo.CursorPosition_.prototype.initIE_ = function(range) { 
  this.isValid_ = false; 
  if(! range) { 
    return; 
  } 
  var ieRange = range.getTextRange(0).getBrowserRangeObject(); 
  if(! goog.dom.contains(this.field_.getElement(), ieRange.parentElement())) { 
    return; 
  } 
  var contentEditableRange = this.field_.getEditableDomHelper().getDocument().body.createTextRange(); 
  contentEditableRange.moveToElementText(this.field_.getElement()); 
  var startMarker = ieRange.duplicate(); 
  startMarker.collapse(true); 
  startMarker.setEndPoint('StartToStart', contentEditableRange); 
  this.startOffset_ = goog.editor.plugins.UndoRedo.CursorPosition_.computeEndOffsetIE_(startMarker); 
  var endMarker = ieRange.duplicate(); 
  endMarker.setEndPoint('StartToStart', contentEditableRange); 
  this.endOffset_ = goog.editor.plugins.UndoRedo.CursorPosition_.computeEndOffsetIE_(endMarker); 
  this.isValid_ = true; 
}; 
goog.editor.plugins.UndoRedo.CursorPosition_.prototype.isValid = function() { 
  return this.isValid_; 
}; 
goog.editor.plugins.UndoRedo.CursorPosition_.prototype.toString = function() { 
  if(goog.editor.BrowserFeature.HAS_W3C_RANGES) { 
    return 'W3C:' + this.startOffset_.toString() + '\n' + this.startChildOffset_ + ':' + this.endOffset_.toString() + '\n' + this.endChildOffset_; 
  } 
  return 'IE:' + this.startOffset_ + ',' + this.endOffset_; 
}; 
goog.editor.plugins.UndoRedo.CursorPosition_.prototype.select = function() { 
  var range = this.getRange_(this.field_.getElement()); 
  if(range) { 
    if(goog.editor.BrowserFeature.HAS_IE_RANGES) { 
      this.field_.getElement().focus(); 
    } 
    goog.dom.Range.createFromBrowserRange(range).select(); 
  } 
}; 
goog.editor.plugins.UndoRedo.CursorPosition_.prototype.getRange_ = function(baseNode) { 
  if(goog.editor.BrowserFeature.HAS_W3C_RANGES) { 
    var startNode = this.startOffset_.findTargetNode(baseNode); 
    var endNode = this.endOffset_.findTargetNode(baseNode); 
    if(! startNode || ! endNode) { 
      return null; 
    } 
    return(goog.dom.Range.createFromNodes(startNode, this.startChildOffset_, endNode, this.endChildOffset_).getBrowserRangeObject()); 
  } 
  var sel = baseNode.ownerDocument.body.createTextRange(); 
  sel.moveToElementText(baseNode); 
  sel.collapse(true); 
  sel.moveEnd('character', this.endOffset_); 
  sel.moveStart('character', this.startOffset_); 
  return sel; 
}; 
goog.editor.plugins.UndoRedo.CursorPosition_.computeEndOffsetIE_ = function(range) { 
  var testRange = range.duplicate(); 
  var text = range.text; 
  var guess = text.length; 
  testRange.collapse(true); 
  testRange.moveEnd('character', guess); 
  var diff; 
  var numTries = 10; 
  while(diff = testRange.compareEndPoints('EndToEnd', range)) { 
    guess -= diff; 
    testRange.moveEnd('character', - diff); 
    -- numTries; 
    if(0 == numTries) { 
      break; 
    } 
  } 
  var offset = 0; 
  var pos = text.indexOf('\n\r'); 
  while(pos != - 1) { 
    ++ offset; 
    pos = text.indexOf('\n\r', pos + 1); 
  } 
  return guess + offset; 
}; 
