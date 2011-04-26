
goog.provide('goog.ui.editor.ToolbarController'); 
goog.require('goog.editor.Field.EventType'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.ui.Component.EventType'); 
goog.ui.editor.ToolbarController = function(field, toolbar) { 
  goog.events.EventTarget.call(this); 
  this.handler_ = new goog.events.EventHandler(this); 
  this.field_ = field; 
  this.toolbar_ = toolbar; 
  this.queryCommands_ =[]; 
  this.toolbar_.forEachChild(function(button) { 
    if(button.queryable) { 
      this.queryCommands_.push(this.getComponentId(button.getId())); 
    } 
  }, this); 
  this.toolbar_.setFocusable(false); 
  this.handler_.listen(this.field_, goog.editor.Field.EventType.COMMAND_VALUE_CHANGE, this.updateToolbar).listen(this.toolbar_, goog.ui.Component.EventType.ACTION, this.handleAction); 
}; 
goog.inherits(goog.ui.editor.ToolbarController, goog.events.EventTarget); 
goog.ui.editor.ToolbarController.prototype.getComponentId = function(command) { 
  return command; 
}; 
goog.ui.editor.ToolbarController.prototype.getCommand = function(id) { 
  return id; 
}; 
goog.ui.editor.ToolbarController.prototype.getHandler = function() { 
  return this.handler_; 
}; 
goog.ui.editor.ToolbarController.prototype.getField = function() { 
  return this.field_; 
}; 
goog.ui.editor.ToolbarController.prototype.getToolbar = function() { 
  return this.toolbar_; 
}; 
goog.ui.editor.ToolbarController.prototype.isVisible = function() { 
  return this.toolbar_.isVisible(); 
}; 
goog.ui.editor.ToolbarController.prototype.setVisible = function(visible) { 
  this.toolbar_.setVisible(visible); 
}; 
goog.ui.editor.ToolbarController.prototype.isEnabled = function() { 
  return this.toolbar_.isEnabled(); 
}; 
goog.ui.editor.ToolbarController.prototype.setEnabled = function(enabled) { 
  this.toolbar_.setEnabled(enabled); 
}; 
goog.ui.editor.ToolbarController.prototype.blur = function() { 
  this.toolbar_.handleBlur(null); 
}; 
goog.ui.editor.ToolbarController.prototype.disposeInternal = function() { 
  goog.ui.editor.ToolbarController.superClass_.disposeInternal.call(this); 
  if(this.handler_) { 
    this.handler_.dispose(); 
    delete this.handler_; 
  } 
  if(this.toolbar_) { 
    this.toolbar_.dispose(); 
    delete this.toolbar_; 
  } 
  delete this.field_; 
  delete this.queryCommands_; 
}; 
goog.ui.editor.ToolbarController.prototype.updateToolbar = function(e) { 
  if(! this.toolbar_.isEnabled() || ! this.dispatchEvent(goog.ui.Component.EventType.CHANGE)) { 
    return; 
  } 
  var state; 
  try { 
    e.commands; 
    state =(this.field_.queryCommandValue(e.commands || this.queryCommands_)); 
  } catch(ex) { 
    state = { }; 
  } 
  this.updateToolbarFromState(state); 
}; 
goog.ui.editor.ToolbarController.prototype.updateToolbarFromState = function(state) { 
  for(var command in state) { 
    var button = this.toolbar_.getChild(this.getComponentId(command)); 
    if(button) { 
      var value = state[command]; 
      if(button.updateFromValue) { 
        button.updateFromValue(value); 
      } else { 
        button.setChecked(! ! value); 
      } 
    } 
  } 
}; 
goog.ui.editor.ToolbarController.prototype.handleAction = function(e) { 
  var command = this.getCommand(e.target.getId()); 
  this.field_.execCommand(command, e.target.getValue()); 
}; 
