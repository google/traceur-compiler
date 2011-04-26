
goog.provide('goog.editor.plugins.EnterHandler'); 
goog.require('goog.dom'); 
goog.require('goog.dom.AbstractRange'); 
goog.require('goog.dom.NodeOffset'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.editor.node'); 
goog.require('goog.editor.plugins.Blockquote'); 
goog.require('goog.editor.range'); 
goog.require('goog.editor.style'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
goog.editor.plugins.EnterHandler = function() { 
  goog.editor.Plugin.call(this); 
}; 
goog.inherits(goog.editor.plugins.EnterHandler, goog.editor.Plugin); 
goog.editor.plugins.EnterHandler.prototype.getTrogClassId = function() { 
  return 'EnterHandler'; 
}; 
goog.editor.plugins.EnterHandler.prototype.prepareContentsHtml = function(html) { 
  if(! html || goog.string.isBreakingWhitespace(html)) { 
    return goog.editor.BrowserFeature.COLLAPSES_EMPTY_NODES ? this.getNonCollapsingBlankHtml(): ''; 
  } 
  return html; 
}; 
goog.editor.plugins.EnterHandler.prototype.getNonCollapsingBlankHtml = goog.functions.constant('<br>'); 
goog.editor.plugins.EnterHandler.prototype.handleBackspaceInternal = function(e, range) { 
  var field = this.fieldObject.getElement(); 
  var container = range && range.getStartNode(); 
  if(field.firstChild == container && goog.editor.node.isEmpty(container)) { 
    e.preventDefault(); 
    e.stopPropagation(); 
  } 
}; 
goog.editor.plugins.EnterHandler.prototype.processParagraphTagsInternal = function(e, split) { 
  if(goog.userAgent.IE || goog.userAgent.OPERA) { 
    this.ensureBlockIeOpera(goog.dom.TagName.DIV); 
  } else if(! split && goog.userAgent.WEBKIT) { 
    var range = this.fieldObject.getRange(); 
    if(! range || ! goog.editor.plugins.EnterHandler.isDirectlyInBlockquote(range.getContainerElement())) { 
      return; 
    } 
    var dh = this.getFieldDomHelper(); 
    var br = dh.createElement(goog.dom.TagName.BR); 
    range.insertNode(br, true); 
    if(goog.editor.node.isBlockTag(br.parentNode) && ! goog.editor.node.skipEmptyTextNodes(br.nextSibling)) { 
      goog.dom.insertSiblingBefore(dh.createElement(goog.dom.TagName.BR), br); 
    } 
    goog.editor.range.placeCursorNextTo(br, false); 
    e.preventDefault(); 
  } 
}; 
goog.editor.plugins.EnterHandler.isDirectlyInBlockquote = function(n) { 
  for(var current = n; current; current = current.parentNode) { 
    if(goog.editor.node.isBlockTag(current)) { 
      return current.tagName == goog.dom.TagName.BLOCKQUOTE; 
    } 
  } 
  return false; 
}; 
goog.editor.plugins.EnterHandler.prototype.handleDeleteGecko = function(e) { 
  this.deleteBrGecko(e); 
}; 
goog.editor.plugins.EnterHandler.prototype.deleteBrGecko = function(e) { 
  var range = this.fieldObject.getRange(); 
  if(range.isCollapsed()) { 
    var container = range.getEndNode(); 
    if(container.nodeType == goog.dom.NodeType.ELEMENT) { 
      var nextNode = container.childNodes[range.getEndOffset()]; 
      if(nextNode && nextNode.tagName == goog.dom.TagName.BR) { 
        var previousSibling = goog.editor.node.getPreviousSibling(nextNode); 
        var nextSibling = nextNode.nextSibling; 
        container.removeChild(nextNode); 
        e.preventDefault(); 
        if(nextSibling && goog.editor.node.isBlockTag(nextSibling)) { 
          if(previousSibling && !(previousSibling.tagName == goog.dom.TagName.BR || goog.editor.node.isBlockTag(previousSibling))) { 
            goog.dom.Range.createCaret(previousSibling, goog.editor.node.getLength(previousSibling)).select(); 
          } else { 
            var leftMostLeaf = goog.editor.node.getLeftMostLeaf(nextSibling); 
            goog.dom.Range.createCaret(leftMostLeaf, 0).select(); 
          } 
        } 
      } 
    } 
  } 
}; 
goog.editor.plugins.EnterHandler.prototype.handleKeyPress = function(e) { 
  if(goog.userAgent.GECKO && this.fieldObject.inModalMode()) { 
    return false; 
  } 
  if(e.keyCode == goog.events.KeyCodes.BACKSPACE) { 
    this.handleBackspaceInternal(e, this.fieldObject.getRange()); 
  } else if(e.keyCode == goog.events.KeyCodes.ENTER) { 
    if(goog.userAgent.GECKO) { 
      if(! e.shiftKey) { 
        this.handleEnterGecko_(e); 
      } 
    } else { 
      this.fieldObject.dispatchBeforeChange(); 
      var cursorPosition = this.deleteCursorSelection_(); 
      var split = ! ! this.fieldObject.execCommand(goog.editor.plugins.Blockquote.SPLIT_COMMAND, cursorPosition); 
      if(split) { 
        e.preventDefault(); 
        e.stopPropagation(); 
      } 
      this.releasePositionObject_(cursorPosition); 
      if(goog.userAgent.WEBKIT) { 
        this.handleEnterWebkitInternal(e); 
      } 
      this.processParagraphTagsInternal(e, split); 
      this.fieldObject.dispatchChange(); 
    } 
  } else if(goog.userAgent.GECKO && e.keyCode == goog.events.KeyCodes.DELETE) { 
    this.handleDeleteGecko(e); 
  } 
  return false; 
}; 
goog.editor.plugins.EnterHandler.prototype.handleKeyUp = function(e) { 
  if(goog.userAgent.GECKO && this.fieldObject.inModalMode()) { 
    return false; 
  } 
  this.handleKeyUpInternal(e); 
  return false; 
}; 
goog.editor.plugins.EnterHandler.prototype.handleKeyUpInternal = function(e) { 
  if((goog.userAgent.IE || goog.userAgent.OPERA) && e.keyCode == goog.events.KeyCodes.ENTER) { 
    this.ensureBlockIeOpera(goog.dom.TagName.DIV, true); 
  } 
}; 
goog.editor.plugins.EnterHandler.prototype.handleEnterGecko_ = function(e) { 
  var range = this.fieldObject.getRange(); 
  var wasCollapsed = ! range || range.isCollapsed(); 
  var cursorPosition = this.deleteCursorSelection_(); 
  var handled = this.fieldObject.execCommand(goog.editor.plugins.Blockquote.SPLIT_COMMAND, cursorPosition); 
  if(handled) { 
    e.preventDefault(); 
    e.stopPropagation(); 
  } 
  this.releasePositionObject_(cursorPosition); 
  if(! handled) { 
    this.handleEnterAtCursorGeckoInternal(e, wasCollapsed, range); 
  } 
}; 
goog.editor.plugins.EnterHandler.prototype.handleEnterWebkitInternal = goog.nullFunction; 
goog.editor.plugins.EnterHandler.prototype.handleEnterAtCursorGeckoInternal = goog.nullFunction; 
goog.editor.plugins.EnterHandler.DO_NOT_ENSURE_BLOCK_NODES_ = goog.object.createSet(goog.dom.TagName.LI, goog.dom.TagName.DIV, goog.dom.TagName.H1, goog.dom.TagName.H2, goog.dom.TagName.H3, goog.dom.TagName.H4, goog.dom.TagName.H5, goog.dom.TagName.H6); 
goog.editor.plugins.EnterHandler.isBrElem = function(node) { 
  return goog.editor.node.isEmpty(node) && node.getElementsByTagName(goog.dom.TagName.BR).length == 1; 
}; 
goog.editor.plugins.EnterHandler.prototype.ensureBlockIeOpera = function(tag, opt_keyUp) { 
  var range = this.fieldObject.getRange(); 
  var container = range.getContainer(); 
  var field = this.fieldObject.getElement(); 
  var paragraph; 
  while(container && container != field) { 
    var nodeName = container.nodeName; 
    if(nodeName == tag ||(goog.editor.plugins.EnterHandler.DO_NOT_ENSURE_BLOCK_NODES_[nodeName]&& !(opt_keyUp && goog.editor.plugins.EnterHandler.isBrElem(container)))) { 
      if(goog.userAgent.OPERA && paragraph) { 
        if(nodeName == tag && paragraph == container.lastChild && goog.editor.node.isEmpty(paragraph)) { 
          goog.dom.insertSiblingAfter(paragraph, container); 
          goog.dom.Range.createFromNodeContents(paragraph).select(); 
        } 
        break; 
      } 
      return; 
    } 
    if(goog.userAgent.OPERA && opt_keyUp && nodeName == goog.dom.TagName.P && nodeName != tag) { 
      paragraph = container; 
    } 
    container = container.parentNode; 
  } 
  if(goog.userAgent.IE && ! goog.userAgent.isVersion(9)) { 
    var needsHelp = false; 
    range = range.getBrowserRangeObject(); 
    var range2 = range.duplicate(); 
    range2.moveEnd('character', 1); 
    if(range2.text.length) { 
      var parent2 = range2.parentElement(); 
      var range3 = range2.duplicate(); 
      range3.collapse(false); 
      var parent3 = range3.parentElement(); 
      if((needsHelp = parent2 != parent3 && parent3 != range.parentElement())) { 
        range.move('character', - 1); 
        range.select(); 
      } 
    } 
  } 
  this.fieldObject.getEditableDomHelper().getDocument().execCommand('FormatBlock', false, '<' + tag + '>'); 
  if(needsHelp) { 
    range.move('character', 1); 
    range.select(); 
  } 
}; 
goog.editor.plugins.EnterHandler.prototype.deleteCursorSelection_ = function() { 
  return goog.editor.BrowserFeature.HAS_W3C_RANGES ? this.deleteCursorSelectionW3C_(): this.deleteCursorSelectionIE_(); 
}; 
goog.editor.plugins.EnterHandler.prototype.releasePositionObject_ = function(position) { 
  if(! goog.editor.BrowserFeature.HAS_W3C_RANGES) { 
    ((position)).removeNode(true); 
  } 
}; 
goog.editor.plugins.EnterHandler.prototype.deleteCursorSelectionIE_ = function() { 
  var doc = this.getFieldDomHelper().getDocument(); 
  var range = doc.selection.createRange(); 
  var id = goog.string.createUniqueString(); 
  range.pasteHTML('<span id="' + id + '"></span>'); 
  var splitNode = doc.getElementById(id); 
  splitNode.id = ''; 
  return splitNode; 
}; 
goog.editor.plugins.EnterHandler.prototype.deleteCursorSelectionW3C_ = function() { 
  var range = this.fieldObject.getRange(); 
  if(! range.isCollapsed()) { 
    var shouldDelete = true; 
    if(goog.userAgent.OPERA) { 
      var startNode = range.getStartNode(); 
      var startOffset = range.getStartOffset(); 
      if(startNode == range.getEndNode() && startNode.lastChild && startNode.lastChild.tagName == goog.dom.TagName.BR && startOffset == startNode.childNodes.length - 1) { 
        shouldDelete = false; 
      } 
    } 
    if(shouldDelete) { 
      goog.editor.plugins.EnterHandler.deleteW3cRange_(range); 
    } 
  } 
  return goog.editor.range.getDeepEndPoint(range, true); 
}; 
goog.editor.plugins.EnterHandler.deleteW3cRange_ = function(range) { 
  if(range && ! range.isCollapsed()) { 
    var reselect = true; 
    var baseNode = range.getContainerElement(); 
    var nodeOffset = new goog.dom.NodeOffset(range.getStartNode(), baseNode); 
    var rangeOffset = range.getStartOffset(); 
    var isInOneContainer = goog.editor.plugins.EnterHandler.isInOneContainerW3c_(range); 
    var isPartialEnd = ! isInOneContainer && goog.editor.plugins.EnterHandler.isPartialEndW3c_(range); 
    range.removeContents(); 
    range = goog.dom.Range.createCaret(nodeOffset.findTargetNode(baseNode), rangeOffset); 
    range.select(); 
    if(isInOneContainer) { 
      var container = goog.editor.style.getContainer(range.getStartNode()); 
      if(goog.editor.node.isEmpty(container, true)) { 
        var html = '&nbsp;'; 
        if(goog.userAgent.OPERA && container.tagName == goog.dom.TagName.LI) { 
          html = '<br>'; 
        } 
        container.innerHTML = html; 
        goog.editor.range.selectNodeStart(container.firstChild); 
        reselect = false; 
      } 
    } 
    if(isPartialEnd) { 
      var rangeStart = goog.editor.style.getContainer(range.getStartNode()); 
      var redundantContainer = goog.editor.node.getNextSibling(rangeStart); 
      if(rangeStart && redundantContainer) { 
        goog.dom.append(rangeStart, redundantContainer.childNodes); 
        goog.dom.removeNode(redundantContainer); 
      } 
    } 
    if(reselect) { 
      range = goog.dom.Range.createCaret(nodeOffset.findTargetNode(baseNode), rangeOffset); 
      range.select(); 
    } 
  } 
}; 
goog.editor.plugins.EnterHandler.isInOneContainerW3c_ = function(range) { 
  var startContainer = range.getStartNode(); 
  if(goog.editor.style.isContainer(startContainer)) { 
    startContainer = startContainer.childNodes[range.getStartOffset()]|| startContainer; 
  } 
  startContainer = goog.editor.style.getContainer(startContainer); 
  var endContainer = range.getEndNode(); 
  if(goog.editor.style.isContainer(endContainer)) { 
    endContainer = endContainer.childNodes[range.getEndOffset()]|| endContainer; 
  } 
  endContainer = goog.editor.style.getContainer(endContainer); 
  return startContainer == endContainer; 
}; 
goog.editor.plugins.EnterHandler.isPartialEndW3c_ = function(range) { 
  var endContainer = range.getEndNode(); 
  var endOffset = range.getEndOffset(); 
  var node = endContainer; 
  if(goog.editor.style.isContainer(node)) { 
    var child = node.childNodes[endOffset]; 
    if(! child || child.nodeType == goog.dom.NodeType.ELEMENT && goog.editor.style.isContainer(child)) { 
      return false; 
    } 
  } 
  var container = goog.editor.style.getContainer(node); 
  while(container != node) { 
    if(goog.editor.node.getNextSibling(node)) { 
      return true; 
    } 
    node = node.parentNode; 
  } 
  return endOffset != goog.editor.node.getLength(endContainer); 
}; 
