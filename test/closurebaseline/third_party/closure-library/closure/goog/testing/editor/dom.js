
goog.provide('goog.testing.editor.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.TagIterator'); 
goog.require('goog.dom.TagWalkType'); 
goog.require('goog.iter'); 
goog.require('goog.string'); 
goog.require('goog.testing.asserts'); 
goog.testing.editor.dom.getPreviousNonEmptyTextNode = function(node, opt_stopAt, opt_skipDescendants) { 
  return goog.testing.editor.dom.getPreviousNextNonEmptyTextNodeHelper_(node, opt_stopAt, opt_skipDescendants, true); 
}; 
goog.testing.editor.dom.getNextNonEmptyTextNode = function(node, opt_stopAt, opt_skipDescendants) { 
  return goog.testing.editor.dom.getPreviousNextNonEmptyTextNodeHelper_(node, opt_stopAt, opt_skipDescendants, false); 
}; 
goog.testing.editor.dom.getPreviousNextNonEmptyTextNodeHelper_ = function(node, opt_stopAt, opt_skipDescendants, opt_isPrevious) { 
  opt_stopAt = opt_stopAt || node.ownerDocument.body; 
  var iter = new goog.dom.TagIterator(opt_stopAt, opt_isPrevious); 
  var walkType; 
  var depth = goog.testing.editor.dom.getRelativeDepth_(node, opt_stopAt); 
  if(depth == - 1) { 
    return null; 
  } 
  if(node.nodeType == goog.dom.NodeType.ELEMENT) { 
    if(opt_skipDescendants) { 
      walkType = opt_isPrevious ? goog.dom.TagWalkType.START_TAG: goog.dom.TagWalkType.END_TAG; 
    } else { 
      depth ++; 
    } 
  } 
  iter.setPosition(node, walkType, depth); 
  try { 
    iter.next(); 
  } catch(e) { 
    return null; 
  } 
  var filter = goog.iter.filter(iter, goog.testing.editor.dom.isNonEmptyTextNode_); 
  try { 
    return(filter.next()); 
  } catch(e) { 
    return null; 
  } 
}; 
goog.testing.editor.dom.isNonEmptyTextNode_ = function(node) { 
  return ! ! node && node.nodeType == goog.dom.NodeType.TEXT && node.length > 0; 
}; 
goog.testing.editor.dom.getRelativeDepth_ = function(node, parentNode) { 
  var depth = 0; 
  while(node) { 
    if(node == parentNode) { 
      return depth; 
    } 
    node = node.parentNode; 
    depth ++; 
  } 
  return - 1; 
}; 
goog.testing.editor.dom.assertRangeBetweenText = function(before, after, range, opt_stopAt) { 
  var previousText = goog.testing.editor.dom.getTextFollowingRange_(range, true, opt_stopAt); 
  if(before == '') { 
    assertNull('Expected nothing before range but found <' + previousText + '>', previousText); 
  } else { 
    assertNotNull('Expected <' + before + '> before range but found nothing', previousText); 
    assertTrue('Expected <' + before + '> before range but found <' + previousText + '>', goog.string.endsWith((previousText), before)); 
  } 
  var nextText = goog.testing.editor.dom.getTextFollowingRange_(range, false, opt_stopAt); 
  if(after == '') { 
    assertNull('Expected nothing after range but found <' + nextText + '>', nextText); 
  } else { 
    assertNotNull('Expected <' + after + '> after range but found nothing', nextText); 
    assertTrue('Expected <' + after + '> after range but found <' + nextText + '>', goog.string.startsWith((nextText), after)); 
  } 
}; 
goog.testing.editor.dom.getTextFollowingRange_ = function(range, isBefore, opt_stopAt) { 
  var followingTextNode; 
  var endpointNode = isBefore ? range.getStartNode(): range.getEndNode(); 
  var endpointOffset = isBefore ? range.getStartOffset(): range.getEndOffset(); 
  var getFollowingTextNode = isBefore ? goog.testing.editor.dom.getPreviousNonEmptyTextNode: goog.testing.editor.dom.getNextNonEmptyTextNode; 
  if(endpointNode.nodeType == goog.dom.NodeType.TEXT) { 
    var endText = endpointNode.nodeValue; 
    if(isBefore ? endpointOffset > 0: endpointOffset < endText.length) { 
      return isBefore ? endText.substr(0, endpointOffset): endText.substr(endpointOffset); 
    } else { 
      followingTextNode = getFollowingTextNode(endpointNode, opt_stopAt); 
      return followingTextNode && followingTextNode.nodeValue; 
    } 
  } else { 
    var numChildren = endpointNode.childNodes.length; 
    if(isBefore ? endpointOffset > 0: endpointOffset < numChildren) { 
      var followingChild = endpointNode.childNodes[isBefore ? endpointOffset - 1: endpointOffset]; 
      if(goog.testing.editor.dom.isNonEmptyTextNode_(followingChild)) { 
        return followingChild.nodeValue; 
      } else { 
        followingTextNode = getFollowingTextNode(followingChild, opt_stopAt); 
        return followingTextNode && followingTextNode.nodeValue; 
      } 
    } else { 
      followingTextNode = getFollowingTextNode(endpointNode, opt_stopAt, true); 
      return followingTextNode && followingTextNode.nodeValue; 
    } 
  } 
}; 
