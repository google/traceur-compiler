
goog.provide('goog.editor.plugins.UndoRedoState'); 
goog.require('goog.events.EventTarget'); 
goog.editor.plugins.UndoRedoState = function(asynchronous) { 
  this.asynchronous_ = asynchronous; 
}; 
goog.inherits(goog.editor.plugins.UndoRedoState, goog.events.EventTarget); 
goog.editor.plugins.UndoRedoState.ACTION_COMPLETED = 'action_completed'; 
goog.editor.plugins.UndoRedoState.prototype.isAsynchronous = function() { 
  return this.asynchronous_; 
}; 
goog.editor.plugins.UndoRedoState.prototype.undo = goog.abstractMethod; 
goog.editor.plugins.UndoRedoState.prototype.redo = goog.abstractMethod; 
goog.editor.plugins.UndoRedoState.prototype.equals = goog.abstractMethod; 
