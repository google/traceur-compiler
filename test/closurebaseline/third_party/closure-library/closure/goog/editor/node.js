
goog.provide('goog.editor.node'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.iter.ChildIterator'); 
goog.require('goog.dom.iter.SiblingIterator'); 
goog.require('goog.iter'); 
goog.require('goog.object'); 
goog.require('goog.string'); 
goog.require('goog.string.Unicode'); 
goog.editor.node.BLOCK_TAG_NAMES_ = goog.object.createSet('ADDRESS', 'BLOCKQUOTE', 'BODY', 'CAPTION', 'CENTER', 'COL', 'COLGROUP', 'DIR', 'DIV', 'DL', 'DD', 'DT', 'FIELDSET', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'ISINDEX', 'OL', 'LI', 'MAP', 'MENU', 'OPTGROUP', 'OPTION', 'P', 'PRE', 'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'TL', 'UL'); 
goog.editor.node.NON_EMPTY_TAGS_ = goog.object.createSet(goog.dom.TagName.IMG, goog.dom.TagName.IFRAME, 'EMBED'); 
goog.editor.node.isStandardsMode = function(node) { 
  return goog.dom.getDomHelper(node).isCss1CompatMode(); 
}; 
goog.editor.node.getRightMostLeaf = function(parent) { 
  var temp; 
  while(temp = goog.editor.node.getLastChild(parent)) { 
    parent = temp; 
  } 
  return parent; 
}; 
goog.editor.node.getLeftMostLeaf = function(parent) { 
  var temp; 
  while(temp = goog.editor.node.getFirstChild(parent)) { 
    parent = temp; 
  } 
  return parent; 
}; 
goog.editor.node.getFirstChild = function(parent) { 
  return goog.editor.node.getChildHelper_(parent, false); 
}; 
goog.editor.node.getLastChild = function(parent) { 
  return goog.editor.node.getChildHelper_(parent, true); 
}; 
goog.editor.node.getPreviousSibling = function(sibling) { 
  return(goog.editor.node.getFirstValue_(goog.iter.filter(new goog.dom.iter.SiblingIterator(sibling, false, true), goog.editor.node.isImportant))); 
}; 
goog.editor.node.getNextSibling = function(sibling) { 
  return(goog.editor.node.getFirstValue_(goog.iter.filter(new goog.dom.iter.SiblingIterator(sibling), goog.editor.node.isImportant))); 
}; 
goog.editor.node.getChildHelper_ = function(parent, isReversed) { 
  return(! parent || parent.nodeType != goog.dom.NodeType.ELEMENT) ? null:(goog.editor.node.getFirstValue_(goog.iter.filter(new goog.dom.iter.ChildIterator((parent), isReversed), goog.editor.node.isImportant))); 
}; 
goog.editor.node.getFirstValue_ = function(iterator) { 
  try { 
    return iterator.next(); 
  } catch(e) { 
    return null; 
  } 
}; 
goog.editor.node.isImportant = function(node) { 
  return node.nodeType == goog.dom.NodeType.ELEMENT || node.nodeType == goog.dom.NodeType.TEXT && ! goog.editor.node.isAllNonNbspWhiteSpace(node); 
}; 
goog.editor.node.isAllNonNbspWhiteSpace = function(textNode) { 
  return goog.string.isBreakingWhitespace(textNode.nodeValue); 
}; 
goog.editor.node.isEmpty = function(node, opt_prohibitSingleNbsp) { 
  var nodeData = goog.dom.getRawTextContent(node); 
  if(node.getElementsByTagName) { 
    for(var tag in goog.editor.node.NON_EMPTY_TAGS_) { 
      if(node.tagName == tag || node.getElementsByTagName(tag).length > 0) { 
        return false; 
      } 
    } 
  } 
  return(! opt_prohibitSingleNbsp && nodeData == goog.string.Unicode.NBSP) || goog.string.isBreakingWhitespace(nodeData); 
}; 
goog.editor.node.getActiveElementIE = function(doc) { 
  try { 
    return doc.activeElement; 
  } catch(e) { } 
  return null; 
}; 
goog.editor.node.getLength = function(node) { 
  return node.length || node.childNodes.length; 
}; 
goog.editor.node.findInChildren = function(parent, hasProperty) { 
  for(var i = 0, len = parent.childNodes.length; i < len; i ++) { 
    if(hasProperty(parent.childNodes[i])) { 
      return i; 
    } 
  } 
  return null; 
}; 
goog.editor.node.findHighestMatchingAncestor = function(node, hasProperty) { 
  var parent = node.parentNode; 
  var ancestor = null; 
  while(parent && hasProperty(parent)) { 
    ancestor = parent; 
    parent = parent.parentNode; 
  } 
  return ancestor; 
}; 
goog.editor.node.isBlockTag = function(node) { 
  return ! ! goog.editor.node.BLOCK_TAG_NAMES_[node.tagName]; 
}; 
goog.editor.node.skipEmptyTextNodes = function(node) { 
  while(node && node.nodeType == goog.dom.NodeType.TEXT && ! node.nodeValue) { 
    node = node.nextSibling; 
  } 
  return node; 
}; 
goog.editor.node.isEditableContainer = function(element) { 
  return element.getAttribute && element.getAttribute('g_editable') == 'true'; 
}; 
goog.editor.node.isEditable = function(node) { 
  return ! ! goog.dom.getAncestor(node, goog.editor.node.isEditableContainer); 
}; 
goog.editor.node.findTopMostEditableAncestor = function(node, criteria) { 
  var targetNode = null; 
  while(node && ! goog.editor.node.isEditableContainer(node)) { 
    if(criteria(node)) { 
      targetNode = node; 
    } 
    node = node.parentNode; 
  } 
  return targetNode; 
}; 
goog.editor.node.splitDomTreeAt = function(currentNode, opt_secondHalf, opt_root) { 
  var parent; 
  while(currentNode != opt_root &&(parent = currentNode.parentNode)) { 
    opt_secondHalf = goog.editor.node.getSecondHalfOfNode_(parent, currentNode, opt_secondHalf); 
    currentNode = parent; 
  } 
  return(opt_secondHalf); 
}; 
goog.editor.node.getSecondHalfOfNode_ = function(node, startNode, firstChild) { 
  var secondHalf =(node.cloneNode(false)); 
  while(startNode.nextSibling) { 
    goog.dom.appendChild(secondHalf, startNode.nextSibling); 
  } 
  if(firstChild) { 
    secondHalf.insertBefore(firstChild, secondHalf.firstChild); 
  } 
  return secondHalf; 
}; 
goog.editor.node.transferChildren = function(newNode, oldNode) { 
  goog.dom.append(newNode, oldNode.childNodes); 
}; 
