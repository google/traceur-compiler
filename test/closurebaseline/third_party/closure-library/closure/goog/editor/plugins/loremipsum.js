
goog.provide('goog.editor.plugins.LoremIpsum'); 
goog.require('goog.asserts'); 
goog.require('goog.dom'); 
goog.require('goog.editor.Command'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.editor.node'); 
goog.require('goog.functions'); 
goog.editor.plugins.LoremIpsum = function(message) { 
  goog.editor.Plugin.call(this); 
  this.message_ = message; 
}; 
goog.inherits(goog.editor.plugins.LoremIpsum, goog.editor.Plugin); 
goog.editor.plugins.LoremIpsum.prototype.getTrogClassId = goog.functions.constant('LoremIpsum'); 
goog.editor.plugins.LoremIpsum.prototype.activeOnUneditableFields = goog.functions.TRUE; 
goog.editor.plugins.LoremIpsum.prototype.usingLorem_ = false; 
goog.editor.plugins.LoremIpsum.prototype.queryCommandValue = function(command) { 
  return command == goog.editor.Command.USING_LOREM && this.usingLorem_; 
}; 
goog.editor.plugins.LoremIpsum.prototype.execCommand = function(command, placeCursor) { 
  if(command == goog.editor.Command.CLEAR_LOREM) { 
    this.clearLorem_(placeCursor); 
  } else if(command == goog.editor.Command.UPDATE_LOREM) { 
    this.updateLorem_(); 
  } 
}; 
goog.editor.plugins.LoremIpsum.prototype.isSupportedCommand = function(command) { 
  return command == goog.editor.Command.CLEAR_LOREM || command == goog.editor.Command.UPDATE_LOREM || command == goog.editor.Command.USING_LOREM; 
}; 
goog.editor.plugins.LoremIpsum.prototype.updateLorem_ = function() { 
  var fieldObj = this.fieldObject; 
  if(! this.usingLorem_ && ! fieldObj.inModalMode() && goog.editor.Field.getActiveFieldId() != fieldObj.id) { 
    var field = fieldObj.getElement(); 
    if(! field) { 
      field = fieldObj.getOriginalElement(); 
    } 
    goog.asserts.assert(field); 
    if(goog.editor.node.isEmpty(field)) { 
      this.usingLorem_ = true; 
      this.oldFontStyle_ = field.style.fontStyle; 
      field.style.fontStyle = 'italic'; 
      fieldObj.setHtml(true, this.message_, true); 
    } 
  } 
}; 
goog.editor.plugins.LoremIpsum.prototype.clearLorem_ = function(opt_placeCursor) { 
  var fieldObj = this.fieldObject; 
  if(this.usingLorem_ && ! fieldObj.inModalMode()) { 
    var field = fieldObj.getElement(); 
    if(! field) { 
      field = fieldObj.getOriginalElement(); 
    } 
    goog.asserts.assert(field); 
    this.usingLorem_ = false; 
    field.style.fontStyle = this.oldFontStyle_; 
    fieldObj.setHtml(true, null, true); 
    if(opt_placeCursor && fieldObj.isLoaded()) { 
      if(goog.userAgent.WEBKIT) { 
        goog.dom.getOwnerDocument(fieldObj.getElement()).body.focus(); 
        fieldObj.focusAndPlaceCursorAtStart(); 
      } else if(goog.userAgent.OPERA) { 
        fieldObj.placeCursorAtStart(); 
      } 
    } 
  } 
}; 
