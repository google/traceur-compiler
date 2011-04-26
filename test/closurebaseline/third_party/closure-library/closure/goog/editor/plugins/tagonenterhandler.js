
goog.provide('goog.editor.plugins.TagOnEnterHandler'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.Range'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.editor.Command'); 
goog.require('goog.editor.node'); 
goog.require('goog.editor.plugins.EnterHandler'); 
goog.require('goog.editor.range'); 
goog.require('goog.editor.style'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.userAgent'); 
goog.editor.plugins.TagOnEnterHandler = function(tag) { 
  this.tag_ = tag; 
  goog.editor.plugins.EnterHandler.call(this); 
}; 
goog.inherits(goog.editor.plugins.TagOnEnterHandler, goog.editor.plugins.EnterHandler); 
goog.editor.plugins.TagOnEnterHandler.prototype.getTrogClassId = function() { 
  return 'TagOnEnterHandler'; 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.getNonCollapsingBlankHtml = function() { 
  if(this.tag_ == goog.dom.TagName.P) { 
    return '<p>&nbsp;</p>'; 
  } else if(this.tag_ == goog.dom.TagName.DIV) { 
    return '<div><br></div>'; 
  } 
  return '<br>'; 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.activeOnUneditableFields = goog.functions.TRUE; 
goog.editor.plugins.TagOnEnterHandler.prototype.isSupportedCommand = function(command) { 
  return command == goog.editor.Command.DEFAULT_TAG; 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.queryCommandValue = function(command) { 
  return command == goog.editor.Command.DEFAULT_TAG ? this.tag_: null; 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.handleBackspaceInternal = function(e, range) { 
  goog.editor.plugins.TagOnEnterHandler.superClass_.handleBackspaceInternal.call(this, e, range); 
  if(goog.userAgent.GECKO) { 
    this.markBrToNotBeRemoved_(range, true); 
  } 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.processParagraphTagsInternal = function(e, split) { 
  if((goog.userAgent.OPERA || goog.userAgent.IE) && this.tag_ != goog.dom.TagName.P) { 
    this.ensureBlockIeOpera(this.tag_); 
  } 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.handleDeleteGecko = function(e) { 
  var range = this.fieldObject.getRange(); 
  var container = goog.editor.style.getContainer(range && range.getContainerElement()); 
  if(this.fieldObject.getElement().lastChild == container && goog.editor.plugins.EnterHandler.isBrElem(container)) { 
    e.preventDefault(); 
    e.stopPropagation(); 
  } else { 
    this.markBrToNotBeRemoved_(range, false); 
    this.deleteBrGecko(e); 
  } 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.handleKeyUpInternal = function(e) { 
  if(goog.userAgent.GECKO) { 
    if(e.keyCode == goog.events.KeyCodes.DELETE) { 
      this.removeBrIfNecessary_(false); 
    } else if(e.keyCode == goog.events.KeyCodes.BACKSPACE) { 
      this.removeBrIfNecessary_(true); 
    } 
  } else if((goog.userAgent.IE || goog.userAgent.OPERA) && e.keyCode == goog.events.KeyCodes.ENTER) { 
    this.ensureBlockIeOpera(this.tag_, true); 
  } 
}; 
goog.editor.plugins.TagOnEnterHandler.BrOrNbspSurroundedWithWhiteSpace_ = '[\t\n\r ]*(<br[^>]*\/?>|&nbsp;)[\t\n\r ]*'; 
goog.editor.plugins.TagOnEnterHandler.emptyLiRegExp_ = new RegExp('^' + goog.editor.plugins.TagOnEnterHandler.BrOrNbspSurroundedWithWhiteSpace_ + '$'); 
goog.editor.plugins.TagOnEnterHandler.prototype.ensureNodeIsWrappedW3c_ = function(node, container) { 
  if(container == this.fieldObject.getElement()) { 
    var isChildOfFn = function(child) { 
      return container == child.parentNode; 
    }; 
    var nodeToWrap = goog.dom.getAncestor(node, isChildOfFn, true); 
    container = goog.editor.plugins.TagOnEnterHandler.wrapInContainerW3c_(this.tag_, { 
      node: nodeToWrap, 
      offset: 0 
    }, container); 
  } 
  return container; 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.handleEnterWebkitInternal = function(e) { 
  if(this.tag_ == goog.dom.TagName.DIV) { 
    var range = this.fieldObject.getRange(); 
    var container = goog.editor.style.getContainer(range.getContainerElement()); 
    var position = goog.editor.range.getDeepEndPoint(range, true); 
    container = this.ensureNodeIsWrappedW3c_(position.node, container); 
    goog.dom.Range.createCaret(position.node, position.offset).select(); 
  } 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.handleEnterAtCursorGeckoInternal = function(e, wasCollapsed, range) { 
  var li = null; 
  if(wasCollapsed) { 
    li = goog.dom.getAncestorByTagNameAndClass(range && range.getContainerElement(), goog.dom.TagName.LI); 
  } 
  var isEmptyLi =(li && li.innerHTML.match(goog.editor.plugins.TagOnEnterHandler.emptyLiRegExp_)); 
  var elementAfterCursor = isEmptyLi ? this.breakOutOfEmptyListItemGecko_(li): this.handleRegularEnterGecko_(); 
  this.scrollCursorIntoViewGecko_(elementAfterCursor); 
  if(goog.editor.plugins.EnterHandler.isBrElem(elementAfterCursor)) { 
    var br = elementAfterCursor.getElementsByTagName(goog.dom.TagName.BR)[0]; 
    if(br.previousSibling && br.previousSibling.nodeType == goog.dom.NodeType.TEXT) { 
      elementAfterCursor = br.previousSibling; 
    } 
  } 
  goog.editor.range.selectNodeStart(elementAfterCursor); 
  e.preventDefault(); 
  e.stopPropagation(); 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.breakOutOfEmptyListItemGecko_ = function(li) { 
  var listNode = li.parentNode; 
  var grandparent = listNode.parentNode; 
  var inSubList = grandparent.tagName == goog.dom.TagName.OL || grandparent.tagName == goog.dom.TagName.UL; 
  var newNode = goog.dom.getDomHelper(li).createElement(inSubList ? goog.dom.TagName.LI: this.tag_); 
  if(! li.previousSibling) { 
    goog.dom.insertSiblingBefore(newNode, listNode); 
  } else { 
    if(li.nextSibling) { 
      var listClone = listNode.cloneNode(false); 
      while(li.nextSibling) { 
        listClone.appendChild(li.nextSibling); 
      } 
      goog.dom.insertSiblingAfter(listClone, listNode); 
    } 
    goog.dom.insertSiblingAfter(newNode, listNode); 
  } 
  if(goog.editor.node.isEmpty(listNode)) { 
    goog.dom.removeNode(listNode); 
  } 
  goog.dom.removeNode(li); 
  newNode.innerHTML = '&nbsp;'; 
  return newNode; 
}; 
goog.editor.plugins.TagOnEnterHandler.wrapInContainerW3c_ = function(nodeName, position, container) { 
  var start = position.node; 
  while(start.previousSibling && ! goog.editor.style.isContainer(start.previousSibling)) { 
    start = start.previousSibling; 
  } 
  var end = position.node; 
  while(end.nextSibling && ! goog.editor.style.isContainer(end.nextSibling)) { 
    end = end.nextSibling; 
  } 
  var para = container.ownerDocument.createElement(nodeName); 
  while(start != end) { 
    var newStart = start.nextSibling; 
    goog.dom.appendChild(para, start); 
    start = newStart; 
  } 
  var nextSibling = end.nextSibling; 
  goog.dom.appendChild(para, end); 
  container.insertBefore(para, nextSibling); 
  return para; 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.markBrToNotBeRemoved_ = function(range, isBackspace) { 
  var focusNode = range.getFocusNode(); 
  var focusOffset = range.getFocusOffset(); 
  var newEndOffset = isBackspace ? focusOffset: focusOffset + 1; 
  if(goog.editor.node.getLength(focusNode) == newEndOffset) { 
    var sibling = focusNode.nextSibling; 
    if(sibling && sibling.tagName == goog.dom.TagName.BR) { 
      this.brToKeep_ = sibling; 
    } 
  } 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.removeBrIfNecessary_ = function(isBackSpace) { 
  var range = this.fieldObject.getRange(); 
  var focusNode = range.getFocusNode(); 
  var focusOffset = range.getFocusOffset(); 
  var sibling; 
  if(isBackSpace && focusNode.data == '') { 
    sibling = focusNode.nextSibling; 
  } else if(isBackSpace && focusOffset == 0) { 
    var node = focusNode; 
    while(node && ! node.previousSibling && node.parentNode != this.fieldObject.getElement()) { 
      node = node.parentNode; 
    } 
    sibling = node.previousSibling; 
  } else if(focusNode.length == focusOffset) { 
    sibling = focusNode.nextSibling; 
  } 
  if(! sibling || sibling.tagName != goog.dom.TagName.BR || this.brToKeep_ == sibling) { 
    return; 
  } 
  goog.dom.removeNode(sibling); 
  if(focusNode.nodeType == goog.dom.NodeType.TEXT) { 
    focusNode.data = goog.editor.plugins.TagOnEnterHandler.trimTabsAndLineBreaks_(focusNode.data); 
    goog.dom.Range.createCaret(focusNode, Math.min(focusOffset, focusNode.length)).select(); 
  } 
}; 
goog.editor.plugins.TagOnEnterHandler.trimTabsAndLineBreaks_ = function(string) { 
  return string.replace(/^[\t\n\r]|[\t\n\r]$/g, ''); 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.handleRegularEnterGecko_ = function() { 
  var range = this.fieldObject.getRange(); 
  var container = goog.editor.style.getContainer(range.getContainerElement()); 
  var newNode; 
  if(goog.editor.plugins.EnterHandler.isBrElem(container)) { 
    if(container.tagName == goog.dom.TagName.BODY) { 
      container = this.ensureNodeIsWrappedW3c_(container.getElementsByTagName(goog.dom.TagName.BR)[0], container); 
    } 
    newNode = container.cloneNode(true); 
    goog.dom.insertSiblingAfter(newNode, container); 
  } else { 
    if(! container.firstChild) { 
      container.innerHTML = '&nbsp;'; 
    } 
    var position = goog.editor.range.getDeepEndPoint(range, true); 
    container = this.ensureNodeIsWrappedW3c_(position.node, container); 
    newNode = goog.editor.plugins.TagOnEnterHandler.splitDomAndAppend_(position.node, position.offset, container); 
    var leftAnchor = goog.editor.plugins.TagOnEnterHandler.findAnchorInTraversal_(container); 
    var rightAnchor = goog.editor.plugins.TagOnEnterHandler.findAnchorInTraversal_(newNode, true); 
    if(leftAnchor && rightAnchor && leftAnchor.tagName == goog.dom.TagName.A && rightAnchor.tagName == goog.dom.TagName.A) { 
      var anchorToRemove = goog.editor.node.isEmpty(leftAnchor, false) ? leftAnchor: rightAnchor; 
      goog.dom.flattenElement((anchorToRemove)); 
    } 
  } 
  return(newNode); 
}; 
goog.editor.plugins.TagOnEnterHandler.prototype.scrollCursorIntoViewGecko_ = function(element) { 
  if(! this.fieldObject.isFixedHeight()) { 
    return; 
  } 
  var field = this.fieldObject.getElement(); 
  var elementY = goog.style.getPageOffsetTop(element); 
  var bottomOfNode = elementY + element.offsetHeight; 
  var win = this.getFieldDomHelper().getWindow(); 
  var scrollY = goog.dom.getPageScroll(win).y; 
  var viewportHeight = goog.dom.getViewportSize(win).height; 
  if(bottomOfNode > viewportHeight + scrollY) { 
    if(field.tagName == goog.dom.TagName.BODY && goog.editor.node.isStandardsMode(field)) { 
      field = field.parentNode; 
    } 
    field.scrollTop = bottomOfNode - viewportHeight; 
  } 
}; 
goog.editor.plugins.TagOnEnterHandler.splitDom_ = function(positionNode, positionOffset, opt_root) { 
  if(! opt_root) opt_root = positionNode.ownerDocument.body; 
  var textSplit = positionNode.nodeType == goog.dom.NodeType.TEXT; 
  var secondHalfOfSplitNode; 
  if(textSplit) { 
    if(goog.userAgent.IE && positionOffset == positionNode.nodeValue.length) { 
      secondHalfOfSplitNode = goog.dom.getDomHelper(positionNode).createTextNode(''); 
      goog.dom.insertSiblingAfter(secondHalfOfSplitNode, positionNode); 
    } else { 
      secondHalfOfSplitNode = positionNode.splitText(positionOffset); 
    } 
  } else { 
    if(positionOffset) { 
      positionNode = positionNode.childNodes[positionOffset - 1]; 
    } else { 
      positionNode = secondHalfOfSplitNode = positionNode.firstChild || positionNode; 
    } 
  } 
  var secondHalf = goog.editor.node.splitDomTreeAt(positionNode, secondHalfOfSplitNode, opt_root); 
  if(textSplit) { 
    secondHalfOfSplitNode = goog.editor.plugins.TagOnEnterHandler.joinTextNodes_(secondHalfOfSplitNode, true); 
    goog.editor.plugins.TagOnEnterHandler.replaceWhiteSpaceWithNbsp_(secondHalfOfSplitNode, true, ! ! secondHalfOfSplitNode.nextSibling); 
    var firstHalf = goog.editor.plugins.TagOnEnterHandler.joinTextNodes_(positionNode, false); 
    goog.editor.plugins.TagOnEnterHandler.replaceWhiteSpaceWithNbsp_(firstHalf, false, false); 
  } 
  return secondHalf; 
}; 
goog.editor.plugins.TagOnEnterHandler.splitDomAndAppend_ = function(positionNode, positionOffset, node) { 
  var newNode = goog.editor.plugins.TagOnEnterHandler.splitDom_(positionNode, positionOffset, node); 
  goog.dom.insertSiblingAfter(newNode, node); 
  return newNode; 
}; 
goog.editor.plugins.TagOnEnterHandler.joinTextNodes_ = function(node, moveForward) { 
  if(node && node.nodeName == '#text') { 
    var nextNodeFn = moveForward ? 'nextSibling': 'previousSibling'; 
    var prevNodeFn = moveForward ? 'previousSibling': 'nextSibling'; 
    var nodeValues =[node.nodeValue]; 
    while(node[nextNodeFn]&& node[nextNodeFn].nodeType == goog.dom.NodeType.TEXT) { 
      node = node[nextNodeFn]; 
      nodeValues.push(node.nodeValue); 
      goog.dom.removeNode(node[prevNodeFn]); 
    } 
    if(! moveForward) { 
      nodeValues.reverse(); 
    } 
    node.nodeValue = nodeValues.join(''); 
  } 
  return node; 
}; 
goog.editor.plugins.TagOnEnterHandler.replaceWhiteSpaceWithNbsp_ = function(textNode, fromStart, isLeaveEmpty) { 
  var regExp = fromStart ? / ^[\t\r\n]+/: /[ \t\r\n]+$/; 
  textNode.nodeValue = textNode.nodeValue.replace(regExp, goog.string.Unicode.NBSP); 
  if(! isLeaveEmpty && textNode.nodeValue == '') { 
    textNode.nodeValue = goog.string.Unicode.NBSP; 
  } 
}; 
goog.editor.plugins.TagOnEnterHandler.findAnchorInTraversal_ = function(node, opt_useFirstChild) { 
  while((node = opt_useFirstChild ? node.firstChild: node.lastChild) && node.tagName != goog.dom.TagName.A) { } 
  return node; 
}; 
