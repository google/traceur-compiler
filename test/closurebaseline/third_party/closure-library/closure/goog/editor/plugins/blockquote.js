
goog.provide('goog.editor.plugins.Blockquote'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.classes'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.Command'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.editor.node'); 
goog.require('goog.functions'); 
goog.editor.plugins.Blockquote = function(requiresClassNameToSplit, opt_className) { 
  goog.editor.Plugin.call(this); 
  this.requiresClassNameToSplit_ = requiresClassNameToSplit; 
  this.className_ = opt_className || goog.getCssName('tr_bq'); 
}; 
goog.inherits(goog.editor.plugins.Blockquote, goog.editor.Plugin); 
goog.editor.plugins.Blockquote.SPLIT_COMMAND = '+splitBlockquote'; 
goog.editor.plugins.Blockquote.CLASS_ID = 'Blockquote'; 
goog.editor.plugins.Blockquote.prototype.logger = goog.debug.Logger.getLogger('goog.editor.plugins.Blockquote'); 
goog.editor.plugins.Blockquote.prototype.getTrogClassId = function() { 
  return goog.editor.plugins.Blockquote.CLASS_ID; 
}; 
goog.editor.plugins.Blockquote.prototype.isSilentCommand = goog.functions.TRUE; 
goog.editor.plugins.Blockquote.isBlockquote = function(node, isAlreadySetup, requiresClassNameToSplit, className) { 
  if(node.tagName != goog.dom.TagName.BLOCKQUOTE) { 
    return false; 
  } 
  if(! requiresClassNameToSplit) { 
    return isAlreadySetup; 
  } 
  var hasClassName = goog.dom.classes.has((node), className); 
  return isAlreadySetup ? hasClassName: ! hasClassName; 
}; 
goog.editor.plugins.Blockquote.findAndRemoveSingleChildAncestor_ = function(node, root) { 
  var predicateFunc = function(parentNode) { 
    return parentNode != root && parentNode.childNodes.length == 1; 
  }; 
  var ancestor = goog.editor.node.findHighestMatchingAncestor(node, predicateFunc); 
  if(! ancestor) { 
    ancestor = node; 
  } 
  goog.dom.removeNode(ancestor); 
}; 
goog.editor.plugins.Blockquote.removeAllWhiteSpaceNodes_ = function(nodes) { 
  for(var i = 0; i < nodes.length; ++ i) { 
    if(goog.editor.node.isEmpty(nodes[i], true)) { 
      goog.dom.removeNode(nodes[i]); 
    } 
  } 
}; 
goog.editor.plugins.Blockquote.prototype.isSetupBlockquote = function(node) { 
  return goog.editor.plugins.Blockquote.isBlockquote(node, true, this.requiresClassNameToSplit_, this.className_); 
}; 
goog.editor.plugins.Blockquote.prototype.isSupportedCommand = function(command) { 
  return command == goog.editor.plugins.Blockquote.SPLIT_COMMAND; 
}; 
goog.editor.plugins.Blockquote.prototype.execCommandInternal = function(command, var_args) { 
  var pos = arguments[1]; 
  if(command == goog.editor.plugins.Blockquote.SPLIT_COMMAND && pos &&(this.className_ || ! this.requiresClassNameToSplit_)) { 
    return goog.editor.BrowserFeature.HAS_W3C_RANGES ? this.splitQuotedBlockW3C_(pos): this.splitQuotedBlockIE_((pos)); 
  } 
}; 
goog.editor.plugins.Blockquote.prototype.splitQuotedBlockW3C_ = function(anchorPos) { 
  var cursorNode = anchorPos.node; 
  var quoteNode = goog.editor.node.findTopMostEditableAncestor(cursorNode.parentNode, goog.bind(this.isSetupBlockquote, this)); 
  var secondHalf, textNodeToRemove; 
  var insertTextNode = false; 
  if(quoteNode) { 
    if(cursorNode.nodeType == goog.dom.NodeType.TEXT) { 
      if(anchorPos.offset == cursorNode.length) { 
        var siblingNode = cursorNode.nextSibling; 
        if(siblingNode && siblingNode.tagName == goog.dom.TagName.BR) { 
          cursorNode = siblingNode; 
          secondHalf = siblingNode.nextSibling; 
        } else { 
          textNodeToRemove = cursorNode.splitText(anchorPos.offset); 
          secondHalf = textNodeToRemove; 
        } 
      } else { 
        secondHalf = cursorNode.splitText(anchorPos.offset); 
      } 
    } else if(cursorNode.tagName == goog.dom.TagName.BR) { 
      secondHalf = cursorNode.nextSibling; 
    } else { 
      insertTextNode = true; 
    } 
  } else { 
    if(this.isSetupBlockquote(cursorNode)) { 
      quoteNode = cursorNode; 
      insertTextNode = true; 
    } 
  } 
  if(insertTextNode) { 
    cursorNode = this.insertEmptyTextNodeBeforeRange_(); 
    secondHalf = this.insertEmptyTextNodeBeforeRange_(); 
  } 
  if(! quoteNode) { 
    return false; 
  } 
  secondHalf = goog.editor.node.splitDomTreeAt(cursorNode, secondHalf, quoteNode); 
  goog.dom.insertSiblingAfter(secondHalf, quoteNode); 
  var dh = this.getFieldDomHelper(); 
  var tagToInsert = this.fieldObject.queryCommandValue(goog.editor.Command.DEFAULT_TAG) || goog.dom.TagName.DIV; 
  var container = dh.createElement((tagToInsert)); 
  container.innerHTML = '&nbsp;'; 
  quoteNode.parentNode.insertBefore(container, secondHalf); 
  dh.getWindow().getSelection().collapse(container, 0); 
  if(textNodeToRemove) { 
    goog.editor.plugins.Blockquote.findAndRemoveSingleChildAncestor_(textNodeToRemove, secondHalf); 
  } 
  goog.editor.plugins.Blockquote.removeAllWhiteSpaceNodes_([quoteNode, secondHalf]); 
  return true; 
}; 
goog.editor.plugins.Blockquote.prototype.insertEmptyTextNodeBeforeRange_ = function() { 
  var range = this.fieldObject.getRange(); 
  var node = this.getFieldDomHelper().createTextNode(''); 
  range.insertNode(node, true); 
  return node; 
}; 
goog.editor.plugins.Blockquote.prototype.splitQuotedBlockIE_ = function(splitNode) { 
  var dh = this.getFieldDomHelper(); 
  var quoteNode = goog.editor.node.findTopMostEditableAncestor(splitNode.parentNode, goog.bind(this.isSetupBlockquote, this)); 
  if(! quoteNode) { 
    return false; 
  } 
  var clone = splitNode.cloneNode(false); 
  if(splitNode.nextSibling && splitNode.nextSibling.tagName == goog.dom.TagName.BR) { 
    splitNode = splitNode.nextSibling; 
  } 
  var secondHalf = goog.editor.node.splitDomTreeAt(splitNode, clone, quoteNode); 
  goog.dom.insertSiblingAfter(secondHalf, quoteNode); 
  var tagToInsert = this.fieldObject.queryCommandValue(goog.editor.Command.DEFAULT_TAG) || goog.dom.TagName.DIV; 
  var div = dh.createElement((tagToInsert)); 
  quoteNode.parentNode.insertBefore(div, secondHalf); 
  div.innerHTML = '&nbsp;'; 
  var range = dh.getDocument().selection.createRange(); 
  range.moveToElementText(splitNode); 
  range.move('character', 2); 
  range.select(); 
  div.innerHTML = ''; 
  range.pasteHTML(''); 
  goog.editor.plugins.Blockquote.findAndRemoveSingleChildAncestor_(clone, secondHalf); 
  goog.editor.plugins.Blockquote.removeAllWhiteSpaceNodes_([quoteNode, secondHalf]); 
  return true; 
}; 
