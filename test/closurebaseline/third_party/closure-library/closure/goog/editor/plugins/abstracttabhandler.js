
goog.provide('goog.editor.plugins.AbstractTabHandler'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.events.KeyCodes'); 
goog.editor.plugins.AbstractTabHandler = function() { 
  goog.editor.Plugin.call(this); 
}; 
goog.inherits(goog.editor.plugins.AbstractTabHandler, goog.editor.Plugin); 
goog.editor.plugins.AbstractTabHandler.prototype.getTrogClassId = goog.abstractMethod; 
goog.editor.plugins.AbstractTabHandler.prototype.handleKeyboardShortcut = function(e, key, isModifierPressed) { 
  if(goog.userAgent.GECKO && this.fieldObject.inModalMode()) { 
    return false; 
  } 
  if(e.keyCode == goog.events.KeyCodes.TAB && ! e.metaKey && ! e.ctrlKey) { 
    return this.handleTabKey(e); 
  } 
  return false; 
}; 
goog.editor.plugins.AbstractTabHandler.prototype.handleTabKey = goog.abstractMethod; 
