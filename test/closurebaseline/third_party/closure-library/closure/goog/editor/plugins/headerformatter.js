
goog.provide('goog.editor.plugins.HeaderFormatter'); 
goog.require('goog.editor.Command'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.userAgent'); 
goog.editor.plugins.HeaderFormatter = function() { 
  goog.editor.Plugin.call(this); 
}; 
goog.inherits(goog.editor.plugins.HeaderFormatter, goog.editor.Plugin); 
goog.editor.plugins.HeaderFormatter.prototype.getTrogClassId = function() { 
  return 'HeaderFormatter'; 
}; 
goog.editor.plugins.HeaderFormatter.HEADER_COMMAND = { 
  H1: 'H1', 
  H2: 'H2', 
  H3: 'H3', 
  H4: 'H4' 
}; 
goog.editor.plugins.HeaderFormatter.prototype.handleKeyboardShortcut = function(e, key, isModifierPressed) { 
  if(! isModifierPressed) { 
    return false; 
  } 
  var command = null; 
  switch(key) { 
    case '1': 
      command = goog.editor.plugins.HeaderFormatter.HEADER_COMMAND.H1; 
      break; 

    case '2': 
      command = goog.editor.plugins.HeaderFormatter.HEADER_COMMAND.H2; 
      break; 

    case '3': 
      command = goog.editor.plugins.HeaderFormatter.HEADER_COMMAND.H3; 
      break; 

    case '4': 
      command = goog.editor.plugins.HeaderFormatter.HEADER_COMMAND.H4; 
      break; 

  } 
  if(command) { 
    this.fieldObject.execCommand(goog.editor.Command.FORMAT_BLOCK, command); 
    if(goog.userAgent.GECKO) { 
      e.stopPropagation(); 
    } 
    return true; 
  } 
  return false; 
}; 
