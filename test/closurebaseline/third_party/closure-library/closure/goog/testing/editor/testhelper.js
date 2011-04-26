
goog.provide('goog.testing.editor.TestHelper'); 
goog.require('goog.Disposable'); 
goog.require('goog.dom.Range'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.testing.dom'); 
goog.testing.editor.TestHelper = function(root) { 
  if(! root) { 
    throw Error('Null root'); 
  } 
  goog.Disposable.call(this); 
  this.root_ = root; 
  this.savedHtml_ = ''; 
}; 
goog.inherits(goog.testing.editor.TestHelper, goog.Disposable); 
goog.testing.editor.TestHelper.prototype.setRoot = function(root) { 
  if(! root) { 
    throw Error('Null root'); 
  } 
  this.root_ = root; 
}; 
goog.testing.editor.TestHelper.prototype.setUpEditableElement = function() { 
  this.savedHtml_ = this.root_.innerHTML; 
  if(goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    this.root_.contentEditable = true; 
  } else { 
    this.root_.ownerDocument.designMode = 'on'; 
  } 
  this.root_.setAttribute('g_editable', 'true'); 
}; 
goog.testing.editor.TestHelper.prototype.tearDownEditableElement = function() { 
  if(goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    this.root_.contentEditable = false; 
  } else { 
    this.root_.ownerDocument.designMode = 'off'; 
  } 
  this.root_.innerHTML = this.savedHtml_; 
  this.root_.removeAttribute('g_editable'); 
  if(goog.editor.plugins && goog.editor.plugins.AbstractBubblePlugin) { 
    for(var key in goog.editor.plugins.AbstractBubblePlugin.bubbleMap_) { 
      goog.editor.plugins.AbstractBubblePlugin.bubbleMap_[key].dispose(); 
    } 
    goog.editor.plugins.AbstractBubblePlugin.bubbleMap_ = { }; 
  } 
}; 
goog.testing.editor.TestHelper.prototype.assertHtmlMatches = function(htmlPattern) { 
  goog.testing.dom.assertHtmlContentsMatch(htmlPattern, this.root_); 
}; 
goog.testing.editor.TestHelper.prototype.findTextNode = function(textOrRegexp) { 
  return goog.testing.dom.findTextNode(textOrRegexp, this.root_); 
}; 
goog.testing.editor.TestHelper.prototype.select = function(from, fromOffset, opt_to, opt_toOffset) { 
  var end; 
  var start = end = goog.isString(from) ? this.findTextNode(from): from; 
  var endOffset; 
  var startOffset = endOffset = fromOffset; 
  if(opt_to && goog.isNumber(opt_toOffset)) { 
    end = goog.isString(opt_to) ? this.findTextNode(opt_to): opt_to; 
    endOffset = opt_toOffset; 
  } 
  goog.dom.Range.createFromNodes(start, startOffset, end, endOffset).select(); 
}; 
goog.testing.editor.TestHelper.prototype.disposeInternal = function() { 
  delete this.root_; 
}; 
