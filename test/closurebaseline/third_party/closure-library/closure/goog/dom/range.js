
goog.provide('goog.dom.Range'); 
goog.require('goog.dom'); 
goog.require('goog.dom.AbstractRange'); 
goog.require('goog.dom.ControlRange'); 
goog.require('goog.dom.MultiRange'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.TextRange'); 
goog.require('goog.userAgent'); 
goog.dom.Range.createFromWindow = function(opt_win) { 
  var sel = goog.dom.AbstractRange.getBrowserSelectionForWindow(opt_win || window); 
  return sel && goog.dom.Range.createFromBrowserSelection(sel); 
}; 
goog.dom.Range.createFromBrowserSelection = function(selection) { 
  var range; 
  var isReversed = false; 
  if(selection.createRange) { 
    try { 
      range = selection.createRange(); 
    } catch(e) { 
      return null; 
    } 
  } else if(selection.rangeCount) { 
    if(selection.rangeCount > 1) { 
      return goog.dom.MultiRange.createFromBrowserSelection((selection)); 
    } else { 
      range = selection.getRangeAt(0); 
      isReversed = goog.dom.Range.isReversed(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset); 
    } 
  } else { 
    return null; 
  } 
  return goog.dom.Range.createFromBrowserRange(range, isReversed); 
}; 
goog.dom.Range.createFromBrowserRange = function(range, opt_isReversed) { 
  return goog.dom.AbstractRange.isNativeControlRange(range) ? goog.dom.ControlRange.createFromBrowserRange(range): goog.dom.TextRange.createFromBrowserRange(range, opt_isReversed); 
}; 
goog.dom.Range.createFromNodeContents = function(node, opt_isReversed) { 
  return goog.dom.TextRange.createFromNodeContents(node, opt_isReversed); 
}; 
goog.dom.Range.createCaret = function(node, offset) { 
  return goog.dom.TextRange.createFromNodes(node, offset, node, offset); 
}; 
goog.dom.Range.createFromNodes = function(startNode, startOffset, endNode, endOffset) { 
  return goog.dom.TextRange.createFromNodes(startNode, startOffset, endNode, endOffset); 
}; 
goog.dom.Range.clearSelection = function(opt_win) { 
  var sel = goog.dom.AbstractRange.getBrowserSelectionForWindow(opt_win || window); 
  if(! sel) { 
    return; 
  } 
  if(sel.empty) { 
    try { 
      sel.empty(); 
    } catch(e) { } 
  } else { 
    sel.removeAllRanges(); 
  } 
}; 
goog.dom.Range.hasSelection = function(opt_win) { 
  var sel = goog.dom.AbstractRange.getBrowserSelectionForWindow(opt_win || window); 
  return ! ! sel &&(goog.userAgent.IE ? sel.type != 'None': ! ! sel.rangeCount); 
}; 
goog.dom.Range.isReversed = function(anchorNode, anchorOffset, focusNode, focusOffset) { 
  if(anchorNode == focusNode) { 
    return focusOffset < anchorOffset; 
  } 
  var child; 
  if(anchorNode.nodeType == goog.dom.NodeType.ELEMENT && anchorOffset) { 
    child = anchorNode.childNodes[anchorOffset]; 
    if(child) { 
      anchorNode = child; 
      anchorOffset = 0; 
    } else if(goog.dom.contains(anchorNode, focusNode)) { 
      return true; 
    } 
  } 
  if(focusNode.nodeType == goog.dom.NodeType.ELEMENT && focusOffset) { 
    child = focusNode.childNodes[focusOffset]; 
    if(child) { 
      focusNode = child; 
      focusOffset = 0; 
    } else if(goog.dom.contains(focusNode, anchorNode)) { 
      return false; 
    } 
  } 
  return(goog.dom.compareNodeOrder(anchorNode, focusNode) || anchorOffset - focusOffset) > 0; 
}; 
