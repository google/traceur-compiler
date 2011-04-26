
goog.provide('goog.editor.plugins.Emoticons'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.functions'); 
goog.require('goog.ui.emoji.Emoji'); 
goog.editor.plugins.Emoticons = function() { 
  goog.base(this); 
}; 
goog.inherits(goog.editor.plugins.Emoticons, goog.editor.Plugin); 
goog.editor.plugins.Emoticons.COMMAND = '+emoticon'; 
goog.editor.plugins.Emoticons.prototype.getTrogClassId = goog.functions.constant(goog.editor.plugins.Emoticons.COMMAND); 
goog.editor.plugins.Emoticons.prototype.isSupportedCommand = function(command) { 
  return command == goog.editor.plugins.Emoticons.COMMAND; 
}; 
goog.editor.plugins.Emoticons.prototype.execCommandInternal = function(command, emoji) { 
  var dom = this.getFieldDomHelper(); 
  var img = dom.createDom(goog.dom.TagName.IMG, { 
    'src': emoji.getUrl(), 
    'style': 'margin:0 0.2ex;vertical-align:middle' 
  }); 
  img.setAttribute(goog.ui.emoji.Emoji.ATTRIBUTE, emoji.getId()); 
  this.fieldObject.getRange().replaceContentsWithNode(img); 
  if(! goog.userAgent.IE) { 
    goog.editor.range.placeCursorNextTo(img, false); 
    dom.getWindow().focus(); 
  } 
}; 
