
goog.provide('goog.editor.plugins.SpacesTabHandler'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.editor.plugins.AbstractTabHandler'); 
goog.require('goog.editor.range'); 
goog.editor.plugins.SpacesTabHandler = function() { 
  goog.editor.plugins.AbstractTabHandler.call(this); 
}; 
goog.inherits(goog.editor.plugins.SpacesTabHandler, goog.editor.plugins.AbstractTabHandler); 
goog.editor.plugins.SpacesTabHandler.prototype.getTrogClassId = function() { 
  return 'SpacesTabHandler'; 
}; 
goog.editor.plugins.SpacesTabHandler.prototype.handleTabKey = function(e) { 
  var dh = this.getFieldDomHelper(); 
  var range = this.fieldObject.getRange(); 
  if(! goog.editor.range.intersectsTag(range, goog.dom.TagName.LI)) { 
    if(! e.shiftKey) { 
      this.fieldObject.stopChangeEvents(true, true); 
      if(! range.isCollapsed()) { 
        dh.getDocument().execCommand('delete', false, null); 
        range = this.fieldObject.getRange(); 
      } 
      var elem = dh.createDom('span', null, '\u00a0\u00a0 \u00a0'); 
      elem = range.insertNode(elem, false); 
      this.fieldObject.dispatchChange(); 
      goog.editor.range.placeCursorNextTo(elem, false); 
      this.fieldObject.dispatchSelectionChangeEvent(); 
    } 
    e.preventDefault(); 
    return true; 
  } 
  return false; 
}; 
