
goog.provide('goog.editor.plugins.UndoRedoManager'); 
goog.provide('goog.editor.plugins.UndoRedoManager.EventType'); 
goog.require('goog.editor.plugins.UndoRedoState'); 
goog.require('goog.events.EventTarget'); 
goog.editor.plugins.UndoRedoManager = function() { 
  goog.events.EventTarget.call(this); 
  this.maxUndoDepth_ = 100; 
  this.undoStack_ =[]; 
  this.redoStack_ =[]; 
  this.pendingActions_ =[]; 
}; 
goog.inherits(goog.editor.plugins.UndoRedoManager, goog.events.EventTarget); 
goog.editor.plugins.UndoRedoManager.EventType = { 
  STATE_CHANGE: 'state_change', 
  STATE_ADDED: 'state_added', 
  BEFORE_UNDO: 'before_undo', 
  BEFORE_REDO: 'before_redo' 
}; 
goog.editor.plugins.UndoRedoManager.prototype.inProgressActionKey_ = null; 
goog.editor.plugins.UndoRedoManager.prototype.setMaxUndoDepth = function(depth) { 
  this.maxUndoDepth_ = depth; 
}; 
goog.editor.plugins.UndoRedoManager.prototype.addState = function(state) { 
  if(this.undoStack_.length == 0 || ! state.equals(this.undoStack_[this.undoStack_.length - 1])) { 
    this.undoStack_.push(state); 
    if(this.undoStack_.length > this.maxUndoDepth_) { 
      this.undoStack_.shift(); 
    } 
    var redoLength = this.redoStack_.length; 
    this.redoStack_.length = 0; 
    this.dispatchEvent({ 
      type: goog.editor.plugins.UndoRedoManager.EventType.STATE_ADDED, 
      state: state 
    }); 
    if(this.undoStack_.length == 1 || redoLength) { 
      this.dispatchStateChange_(); 
    } 
  } 
}; 
goog.editor.plugins.UndoRedoManager.prototype.dispatchStateChange_ = function() { 
  this.dispatchEvent(goog.editor.plugins.UndoRedoManager.EventType.STATE_CHANGE); 
}; 
goog.editor.plugins.UndoRedoManager.prototype.undo = function() { 
  this.shiftState_(this.undoStack_, this.redoStack_); 
}; 
goog.editor.plugins.UndoRedoManager.prototype.redo = function() { 
  this.shiftState_(this.redoStack_, this.undoStack_); 
}; 
goog.editor.plugins.UndoRedoManager.prototype.hasUndoState = function() { 
  return this.undoStack_.length > 0; 
}; 
goog.editor.plugins.UndoRedoManager.prototype.hasRedoState = function() { 
  return this.redoStack_.length > 0; 
}; 
goog.editor.plugins.UndoRedoManager.prototype.shiftState_ = function(fromStack, toStack) { 
  if(fromStack.length) { 
    var state = fromStack.pop(); 
    toStack.push(state); 
    this.addAction_({ 
      type: fromStack == this.undoStack_ ? goog.editor.plugins.UndoRedoManager.EventType.BEFORE_UNDO: goog.editor.plugins.UndoRedoManager.EventType.BEFORE_REDO, 
      func: fromStack == this.undoStack_ ? state.undo: state.redo, 
      state: state 
    }); 
    if(fromStack.length == 0 || toStack.length == 1) { 
      this.dispatchStateChange_(); 
    } 
  } 
}; 
goog.editor.plugins.UndoRedoManager.prototype.addAction_ = function(action) { 
  this.pendingActions_.push(action); 
  if(this.pendingActions_.length == 1) { 
    this.doAction_(); 
  } 
}; 
goog.editor.plugins.UndoRedoManager.prototype.doAction_ = function() { 
  if(this.inProgressActionKey_ || this.pendingActions_.length == 0) { 
    return; 
  } 
  var action = this.pendingActions_.shift(); 
  var e = { 
    type: action.type, 
    state: action.state 
  }; 
  if(this.dispatchEvent(e)) { 
    if(action.state.isAsynchronous()) { 
      this.inProgressActionKey_ = goog.events.listen(action.state, goog.editor.plugins.UndoRedoState.ACTION_COMPLETED, this.finishAction_, false, this); 
      action.func.call(action.state); 
    } else { 
      action.func.call(action.state); 
      this.doAction_(); 
    } 
  } 
}; 
goog.editor.plugins.UndoRedoManager.prototype.finishAction_ = function() { 
  goog.events.unlistenByKey((this.inProgressActionKey_)); 
  this.inProgressActionKey_ = null; 
  this.doAction_(); 
}; 
goog.editor.plugins.UndoRedoManager.prototype.clearHistory = function() { 
  if(this.undoStack_.length > 0 || this.redoStack_.length > 0) { 
    this.undoStack_.length = 0; 
    this.redoStack_.length = 0; 
    this.dispatchStateChange_(); 
  } 
}; 
goog.editor.plugins.UndoRedoManager.prototype.undoPeek = function() { 
  return this.undoStack_[this.undoStack_.length - 1]; 
}; 
goog.editor.plugins.UndoRedoManager.prototype.redoPeek = function() { 
  return this.redoStack_[this.redoStack_.length - 1]; 
}; 
