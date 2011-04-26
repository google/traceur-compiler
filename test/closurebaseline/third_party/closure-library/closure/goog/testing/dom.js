
goog.provide('goog.testing.dom'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeIterator'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.TagIterator'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.classes'); 
goog.require('goog.iter'); 
goog.require('goog.object'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.testing.asserts'); 
goog.require('goog.userAgent'); 
goog.testing.dom.END_TAG_MARKER_ = { }; 
goog.testing.dom.assertNodesMatch = function(it, array) { 
  var i = 0; 
  goog.iter.forEach(it, function(node) { 
    if(array.length <= i) { 
      fail('Got more nodes than expected: ' + goog.testing.dom.describeNode_(node)); 
    } 
    var expected = array[i]; 
    if(goog.dom.isNodeLike(expected)) { 
      assertEquals('Nodes should match at position ' + i, expected, node); 
    } else if(goog.isNumber(expected)) { 
      assertEquals('Node types should match at position ' + i, expected, node.nodeType); 
    } else if(expected.charAt(0) == '#') { 
      assertEquals('Expected element at position ' + i, goog.dom.NodeType.ELEMENT, node.nodeType); 
      var expectedId = expected.substr(1); 
      assertEquals('IDs should match at position ' + i, expectedId, node.id); 
    } else { 
      assertEquals('Expected text node at position ' + i, goog.dom.NodeType.TEXT, node.nodeType); 
      assertEquals('Node contents should match at position ' + i, expected, node.nodeValue); 
    } 
    i ++; 
  }); 
  assertEquals('Used entire match array', array.length, i); 
}; 
goog.testing.dom.exposeNode = function(node) { 
  return(node.tagName || node.nodeValue) +(node.id ? '#' + node.id: '') + ':"' +(node.innerHTML || '') + '"'; 
}; 
goog.testing.dom.exposeRange = function(range) { 
  if(! range) { 
    return 'null'; 
  } 
  return goog.testing.dom.exposeNode(range.getStartNode()) + ':' + range.getStartOffset() + ' to ' + goog.testing.dom.exposeNode(range.getEndNode()) + ':' + range.getEndOffset(); 
}; 
goog.testing.dom.checkUserAgents_ = function(userAgents) { 
  if(goog.string.startsWith(userAgents, '!')) { 
    if(goog.string.contains(userAgents, ' ')) { 
      throw new Error('Only a single negative user agent may be specified'); 
    } 
    return ! goog.userAgent[userAgents.substr(1)]; 
  } 
  var agents = userAgents.split(' '); 
  var hasUserAgent = false; 
  for(var i = 0, len = agents.length; i < len; i ++) { 
    var cls = agents[i]; 
    if(cls in goog.userAgent) { 
      hasUserAgent = true; 
      if(goog.userAgent[cls]) { 
        return true; 
      } 
    } 
  } 
  return ! hasUserAgent; 
}; 
goog.testing.dom.endTagMap_ = function(node, ignore, iterator) { 
  return iterator.isEndTag() ? goog.testing.dom.END_TAG_MARKER_: node; 
}; 
goog.testing.dom.nodeFilter_ = function(node) { 
  if(node.nodeType == goog.dom.NodeType.TEXT) { 
    if(goog.string.isBreakingWhitespace(node.nodeValue) &&(! node.previousSibling || node.previousSibling.nodeType != goog.dom.NodeType.TEXT) &&(! node.nextSibling || node.nextSibling.nodeType != goog.dom.NodeType.TEXT)) { 
      return false; 
    } 
    var match = node.nodeValue.match(/^\[\[(.+)\]\]/); 
    if(match) { 
      return goog.testing.dom.checkUserAgents_(match[1]); 
    } 
  } else if(node.className) { 
    return goog.testing.dom.checkUserAgents_(node.className); 
  } 
  return true; 
}; 
goog.testing.dom.getExpectedText_ = function(node) { 
  return node.nodeValue.match(/^(\[\[.+\]\])?(.*)/)[2]; 
}; 
goog.testing.dom.describeNode_ = function(node) { 
  if(node.nodeType == goog.dom.NodeType.TEXT) { 
    return '[Text: ' + node.nodeValue + ']'; 
  } else { 
    return '<' + node.tagName +(node.id ? ' #' + node.id: '') + ' .../>'; 
  } 
}; 
goog.testing.dom.assertHtmlContentsMatch = function(htmlPattern, actual, opt_strictAttributes) { 
  var div = goog.dom.createDom(goog.dom.TagName.DIV); 
  div.innerHTML = htmlPattern; 
  var errorSuffix = '\nExpected\n' + htmlPattern + '\nActual\n' + actual.innerHTML; 
  var actualIt = goog.iter.filter(goog.iter.map(new goog.dom.TagIterator(actual), goog.testing.dom.endTagMap_), goog.testing.dom.nodeFilter_); 
  var expectedIt = goog.iter.filter(new goog.dom.NodeIterator(div), goog.testing.dom.nodeFilter_); 
  var actualNode; 
  var preIterated = false; 
  var advanceActualNode = function() { 
    if(! preIterated) { 
      actualNode =(goog.iter.nextOrValue(actualIt, null)); 
    } 
    preIterated = false; 
    while(actualNode == goog.testing.dom.END_TAG_MARKER_) { 
      actualNode =(goog.iter.nextOrValue(actualIt, null)); 
    } 
  }; 
  var collapsible = true; 
  var number = 0; 
  goog.iter.forEach(expectedIt, function(expectedNode) { 
    expectedNode =(expectedNode); 
    advanceActualNode(); 
    assertNotNull('Finished actual HTML before finishing expected HTML at ' + 'node number ' + number + ': ' + goog.testing.dom.describeNode_(expectedNode) + errorSuffix, actualNode); 
    if(expectedNode == div) { 
      return; 
    } 
    assertEquals('Should have the same node type, got ' + goog.testing.dom.describeNode_(actualNode) + ' but expected ' + goog.testing.dom.describeNode_(expectedNode) + '.' + errorSuffix, expectedNode.nodeType, actualNode.nodeType); 
    if(expectedNode.nodeType == goog.dom.NodeType.ELEMENT) { 
      assertEquals('Tag names should match' + errorSuffix, expectedNode.tagName, actualNode.tagName); 
      assertObjectEquals('Should have same styles' + errorSuffix, goog.style.parseStyleAttribute(expectedNode.style.cssText), goog.style.parseStyleAttribute(actualNode.style.cssText)); 
      goog.testing.dom.assertAttributesEqual_(errorSuffix, expectedNode, actualNode, ! ! opt_strictAttributes); 
      if(goog.userAgent.IE && goog.style.getCascadedStyle((actualNode), 'display') != 'inline') { 
        collapsible = true; 
      } 
    } else { 
      var actualText = actualNode.nodeValue; 
      preIterated = true; 
      while((actualNode =(goog.iter.nextOrValue(actualIt, null))) && actualNode.nodeType == goog.dom.NodeType.TEXT) { 
        actualText += actualNode.nodeValue; 
      } 
      if(goog.userAgent.IE) { 
        if(collapsible && ! goog.string.isEmpty(actualText)) { 
          actualText = goog.string.trimLeft(actualText); 
        } 
        collapsible = /\s$/.test(actualText); 
      } 
      var expectedText = goog.testing.dom.getExpectedText_(expectedNode); 
      if((actualText && ! goog.string.isBreakingWhitespace(actualText)) ||(expectedText && ! goog.string.isBreakingWhitespace(expectedText))) { 
        var normalizedActual = actualText.replace(/\s+/g, ' '); 
        var normalizedExpected = expectedText.replace(/\s+/g, ' '); 
        assertEquals('Text should match' + errorSuffix, normalizedExpected, normalizedActual); 
      } 
    } 
    number ++; 
  }); 
  advanceActualNode(); 
  assertNull('Finished expected HTML before finishing actual HTML' + errorSuffix, goog.iter.nextOrValue(actualIt, null)); 
}; 
goog.testing.dom.assertHtmlMatches = function(htmlPattern, actual) { 
  var div = goog.dom.createDom(goog.dom.TagName.DIV); 
  div.innerHTML = actual; 
  goog.testing.dom.assertHtmlContentsMatch(htmlPattern, div); 
}; 
goog.testing.dom.findTextNode = function(textOrRegexp, root) { 
  var it = new goog.dom.NodeIterator(root); 
  var ret = goog.iter.nextOrValue(goog.iter.filter(it, function(node) { 
    if(node.nodeType == goog.dom.NodeType.TEXT) { 
      if(goog.isString(textOrRegexp)) { 
        return node.nodeValue == textOrRegexp; 
      } else { 
        return ! ! node.nodeValue.match(textOrRegexp); 
      } 
    } else { 
      return false; 
    } 
  }), null); 
  return(ret); 
}; 
goog.testing.dom.assertRangeEquals = function(start, startOffset, end, endOffset, range) { 
  assertEquals('Unexpected start node', start, range.getStartNode()); 
  assertEquals('Unexpected end node', end, range.getEndNode()); 
  assertEquals('Unexpected start offset', startOffset, range.getStartOffset()); 
  assertEquals('Unexpected end offset', endOffset, range.getEndOffset()); 
}; 
goog.testing.dom.getAttributeValue_ = function(node, name) { 
  if(goog.userAgent.WEBKIT && node.tagName == 'INPUT' && node['type']== 'radio' && name == 'checked') { 
    return false; 
  } 
  return goog.isDef(node[name]) && typeof node.getAttribute(name) != typeof node[name]? node[name]: node.getAttribute(name); 
}; 
goog.testing.dom.assertAttributesEqual_ = function(errorSuffix, expectedNode, actualNode, strictAttributes) { 
  if(strictAttributes) { 
    goog.testing.dom.compareClassAttribute_(expectedNode, actualNode); 
  } 
  var expectedAttributes = expectedNode.attributes; 
  var actualAttributes = actualNode.attributes; 
  for(var i = 0, len = expectedAttributes.length; i < len; i ++) { 
    var expectedName = expectedAttributes[i].name; 
    var expectedValue = goog.testing.dom.getAttributeValue_(expectedNode, expectedName); 
    var actualAttribute = actualAttributes[expectedName]; 
    if(expectedName == 'id' && goog.userAgent.IE) { 
      goog.testing.dom.compareIdAttributeForIe_((expectedValue), actualAttribute, strictAttributes, errorSuffix); 
      continue; 
    } 
    if(goog.testing.dom.ignoreAttribute_(expectedName)) { 
      continue; 
    } 
    assertNotUndefined('Expected to find attribute with name ' + expectedName + ', in element ' + goog.testing.dom.describeNode_(actualNode) + errorSuffix, actualAttribute); 
    assertEquals('Expected attribute ' + expectedName + ' has a different value ' + errorSuffix, expectedValue, goog.testing.dom.getAttributeValue_(actualNode, actualAttribute.name)); 
  } 
  if(strictAttributes) { 
    for(i = 0; i < actualAttributes.length; i ++) { 
      var actualName = actualAttributes[i].name; 
      if(goog.testing.dom.ignoreAttribute_(actualName)) { 
        continue; 
      } 
      assertNotUndefined('Unexpected attribute with name ' + actualName + ' in element ' + goog.testing.dom.describeNode_(actualNode) + errorSuffix, expectedAttributes[actualName]); 
    } 
  } 
}; 
goog.testing.dom.compareClassAttribute_ = function(expectedNode, actualNode) { 
  var classes = goog.dom.classes.get(expectedNode); 
  var expectedClasses =[]; 
  for(var i = 0, len = classes.length; i < len; i ++) { 
    if(!(classes[i]in goog.userAgent)) { 
      expectedClasses.push(classes[i]); 
    } 
  } 
  expectedClasses.sort(); 
  var actualClasses = goog.dom.classes.get(actualNode); 
  actualClasses.sort(); 
  assertArrayEquals('Expected class was: ' + expectedClasses.join(' ') + ', but actual class was: ' + actualNode.className, expectedClasses, actualClasses); 
}; 
goog.testing.dom.BAD_IE_ATTRIBUTES_ = goog.object.createSet('methods', 'CHECKED', 'dataFld', 'dataFormatAs', 'dataSrc'); 
goog.testing.dom.ignoreAttribute_ = function(name) { 
  if(name == 'style' || name == 'class') { 
    return true; 
  } 
  return goog.userAgent.IE && goog.testing.dom.BAD_IE_ATTRIBUTES_[name]; 
}; 
goog.testing.dom.compareIdAttributeForIe_ = function(expectedValue, actualAttribute, strictAttributes, errorSuffix) { 
  if(expectedValue === '') { 
    if(strictAttributes) { 
      assertTrue('Unexpected attribute with name id in element ' + errorSuffix, actualAttribute.value == ''); 
    } 
  } else { 
    assertNotUndefined('Expected to find attribute with name id, in element ' + errorSuffix, actualAttribute); 
    assertNotEquals('Expected to find attribute with name id, in element ' + errorSuffix, '', actualAttribute.value); 
    assertEquals('Expected attribute has a different value ' + errorSuffix, expectedValue, actualAttribute.value); 
  } 
}; 
