
goog.provide('goog.editor.Link'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.Range'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.node'); 
goog.require('goog.editor.range'); 
goog.require('goog.string.Unicode'); 
goog.require('goog.uri.utils'); 
goog.editor.Link = function(anchor, isNew) { 
  this.anchor_ = anchor; 
  this.isNew_ = isNew; 
}; 
goog.editor.Link.prototype.getAnchor = function() { 
  return this.anchor_; 
}; 
goog.editor.Link.prototype.getCurrentText = function() { 
  if(! this.currentText_) { 
    this.currentText_ = goog.dom.getRawTextContent(this.getAnchor()); 
  } 
  return this.currentText_; 
}; 
goog.editor.Link.prototype.isNew = function() { 
  return this.isNew_; 
}; 
goog.editor.Link.prototype.initializeUrl = function(url) { 
  this.getAnchor().href = url; 
}; 
goog.editor.Link.prototype.removeLink = function() { 
  goog.dom.flattenElement(this.anchor_); 
  this.anchor_ = null; 
}; 
goog.editor.Link.prototype.setTextAndUrl = function(newText, newUrl) { 
  var anchor = this.getAnchor(); 
  anchor.href = newUrl; 
  var currentText = this.getCurrentText(); 
  if(newText != currentText) { 
    var leaf = goog.editor.node.getLeftMostLeaf(anchor); 
    if(leaf.nodeType == goog.dom.NodeType.TEXT) { 
      leaf = leaf.parentNode; 
    } 
    if(goog.dom.getRawTextContent(leaf) != currentText) { 
      leaf = anchor; 
    } 
    goog.dom.removeChildren(leaf); 
    var domHelper = goog.dom.getDomHelper(leaf); 
    goog.dom.appendChild(leaf, domHelper.createTextNode(newText)); 
    this.currentText_ = null; 
  } 
  this.isNew_ = false; 
}; 
goog.editor.Link.prototype.placeCursorRightOf = function() { 
  var anchor = this.getAnchor(); 
  if(goog.editor.BrowserFeature.GETS_STUCK_IN_LINKS) { 
    var spaceNode; 
    var nextSibling = anchor.nextSibling; 
    if(nextSibling && nextSibling.nodeType == goog.dom.NodeType.TEXT &&(goog.string.startsWith(nextSibling.data, goog.string.Unicode.NBSP) || goog.string.startsWith(nextSibling.data, ' '))) { 
      spaceNode = nextSibling; 
    } else { 
      var dh = goog.dom.getDomHelper(anchor); 
      spaceNode = dh.createTextNode(goog.string.Unicode.NBSP); 
      goog.dom.insertSiblingAfter(spaceNode, anchor); 
    } 
    var range = goog.dom.Range.createCaret(spaceNode, 1); 
    range.select(); 
  } else { 
    goog.editor.range.placeCursorNextTo(anchor, false); 
  } 
}; 
goog.editor.Link.createNewLink = function(anchor, url, opt_target) { 
  var link = new goog.editor.Link(anchor, true); 
  link.initializeUrl(url); 
  if(opt_target) { 
    anchor.target = opt_target; 
  } 
  return link; 
}; 
goog.editor.Link.isLikelyUrl = function(str) { 
  if(/\s/.test(str)) { 
    return false; 
  } 
  if(goog.editor.Link.isLikelyEmailAddress(str)) { 
    return false; 
  } 
  var addedScheme = false; 
  if(! /^[^:\/?#.]+:/.test(str)) { 
    str = 'http://' + str; 
    addedScheme = true; 
  } 
  var parts = goog.uri.utils.split(str); 
  var scheme = parts[goog.uri.utils.ComponentIndex.SCHEME]; 
  if(goog.array.indexOf(['mailto', 'aim'], scheme) != - 1) { 
    return true; 
  } 
  var domain = parts[goog.uri.utils.ComponentIndex.DOMAIN]; 
  if(! domain ||(addedScheme && domain.indexOf('.') == - 1)) { 
    return false; 
  } 
  var path = parts[goog.uri.utils.ComponentIndex.PATH]; 
  return ! path || path.indexOf('/') == 0; 
}; 
goog.editor.Link.LIKELY_EMAIL_ADDRESS_ = new RegExp('^' + '[\\w-]+(\\.[\\w-]+)*' + '\\@' + '([\\w-]+\\.)+' + '(\\d+|\\w\\w+)$', 'i'); 
goog.editor.Link.isLikelyEmailAddress = function(str) { 
  return goog.editor.Link.LIKELY_EMAIL_ADDRESS_.test(str); 
}; 
goog.editor.Link.isMailto = function(url) { 
  return ! ! url && goog.string.startsWith(url, 'mailto:'); 
}; 
