
goog.provide('goog.editor.Plugin'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.editor.Command'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.functions'); 
goog.require('goog.object'); 
goog.require('goog.reflect'); 
goog.editor.Plugin = function() { 
  goog.events.EventTarget.call(this); 
  this.enabled_ = this.activeOnUneditableFields(); 
}; 
goog.inherits(goog.editor.Plugin, goog.events.EventTarget); 
goog.editor.Plugin.prototype.fieldObject = null; 
goog.editor.Plugin.prototype.getFieldDomHelper = function() { 
  return this.fieldObject && this.fieldObject.getEditableDomHelper(); 
}; 
goog.editor.Plugin.prototype.autoDispose_ = true; 
goog.editor.Plugin.prototype.logger = goog.debug.Logger.getLogger('goog.editor.Plugin'); 
goog.editor.Plugin.prototype.registerFieldObject = function(fieldObject) { 
  this.fieldObject = fieldObject; 
}; 
goog.editor.Plugin.prototype.unregisterFieldObject = function(fieldObj) { 
  if(this.fieldObject) { 
    this.disable(this.fieldObject); 
    this.fieldObject = null; 
  } 
}; 
goog.editor.Plugin.prototype.enable = function(fieldObject) { 
  if(this.fieldObject == fieldObject) { 
    this.enabled_ = true; 
  } else { 
    this.logger.severe('Trying to enable an unregistered field with ' + 'this plugin.'); 
  } 
}; 
goog.editor.Plugin.prototype.disable = function(fieldObject) { 
  if(this.fieldObject == fieldObject) { 
    this.enabled_ = false; 
  } else { 
    this.logger.severe('Trying to disable an unregistered field ' + 'with this plugin.'); 
  } 
}; 
goog.editor.Plugin.prototype.isEnabled = function(fieldObject) { 
  return this.fieldObject == fieldObject ? this.enabled_: false; 
}; 
goog.editor.Plugin.prototype.setAutoDispose = function(autoDispose) { 
  this.autoDispose_ = autoDispose; 
}; 
goog.editor.Plugin.prototype.isAutoDispose = function() { 
  return this.autoDispose_; 
}; 
goog.editor.Plugin.prototype.activeOnUneditableFields = goog.functions.FALSE; 
goog.editor.Plugin.prototype.isSilentCommand = goog.functions.FALSE; 
goog.editor.Plugin.prototype.disposeInternal = function() { 
  if(this.fieldObject) { 
    this.unregisterFieldObject(this.fieldObject); 
  } 
  goog.editor.Plugin.superClass_.disposeInternal.call(this); 
}; 
goog.editor.Plugin.prototype.getTrogClassId; 
goog.editor.Plugin.Op = { 
  KEYDOWN: 1, 
  KEYPRESS: 2, 
  KEYUP: 3, 
  SELECTION: 4, 
  SHORTCUT: 5, 
  EXEC_COMMAND: 6, 
  QUERY_COMMAND: 7, 
  PREPARE_CONTENTS_HTML: 8, 
  CLEAN_CONTENTS_HTML: 10, 
  CLEAN_CONTENTS_DOM: 11 
}; 
goog.editor.Plugin.OPCODE = goog.object.transpose(goog.reflect.object(goog.editor.Plugin, { 
  handleKeyDown: goog.editor.Plugin.Op.KEYDOWN, 
  handleKeyPress: goog.editor.Plugin.Op.KEYPRESS, 
  handleKeyUp: goog.editor.Plugin.Op.KEYUP, 
  handleSelectionChange: goog.editor.Plugin.Op.SELECTION, 
  handleKeyboardShortcut: goog.editor.Plugin.Op.SHORTCUT, 
  execCommand: goog.editor.Plugin.Op.EXEC_COMMAND, 
  queryCommandValue: goog.editor.Plugin.Op.QUERY_COMMAND, 
  prepareContentsHtml: goog.editor.Plugin.Op.PREPARE_CONTENTS_HTML, 
  cleanContentsHtml: goog.editor.Plugin.Op.CLEAN_CONTENTS_HTML, 
  cleanContentsDom: goog.editor.Plugin.Op.CLEAN_CONTENTS_DOM 
})); 
goog.editor.Plugin.IRREPRESSIBLE_OPS = goog.object.createSet(goog.editor.Plugin.Op.PREPARE_CONTENTS_HTML, goog.editor.Plugin.Op.CLEAN_CONTENTS_HTML, goog.editor.Plugin.Op.CLEAN_CONTENTS_DOM); 
goog.editor.Plugin.prototype.handleKeyDown; 
goog.editor.Plugin.prototype.handleKeyPress; 
goog.editor.Plugin.prototype.handleKeyUp; 
goog.editor.Plugin.prototype.handleSelectionChange; 
goog.editor.Plugin.prototype.handleKeyboardShortcut; 
goog.editor.Plugin.prototype.execCommand = function(command, var_args) { 
  var silent = this.isSilentCommand(command); 
  if(! silent) { 
    if(goog.userAgent.GECKO) { 
      this.fieldObject.stopChangeEvents(true, true); 
    } 
    this.fieldObject.dispatchBeforeChange(); 
  } 
  try { 
    var result = this.execCommandInternal.apply(this, arguments); 
  } finally { 
    if(! silent) { 
      this.fieldObject.dispatchChange(); 
      if(command != goog.editor.Command.LINK) { 
        this.fieldObject.dispatchSelectionChangeEvent(); 
      } 
    } 
  } 
  return result; 
}; 
goog.editor.Plugin.prototype.execCommandInternal; 
goog.editor.Plugin.prototype.queryCommandValue; 
goog.editor.Plugin.prototype.prepareContentsHtml; 
goog.editor.Plugin.prototype.cleanContentsDom; 
goog.editor.Plugin.prototype.cleanContentsHtml; 
goog.editor.Plugin.prototype.isSupportedCommand = function(command) { 
  return false; 
}; 
