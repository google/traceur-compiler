
goog.provide('goog.testing.ui.style'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.testing.asserts'); 
goog.testing.ui.style.writeReferenceFrame = function(referencePath) { 
  document.write('<iframe id="reference" name="reference" ' + 'src="' + referencePath + '"></iframe>'); 
}; 
goog.testing.ui.style.getReferenceNode = function(referenceId) { 
  return goog.dom.getFirstElementChild(window.frames['reference'].document.getElementById(referenceId)); 
}; 
goog.testing.ui.style.getElementChildren = function(element) { 
  var first = goog.dom.getFirstElementChild(element); 
  if(! first) { 
    return[]; 
  } 
  var children =[first], next; 
  while(next = goog.dom.getNextElementSibling(children[children.length - 1])) { 
    children.push(next); 
  } 
  return children; 
}; 
goog.testing.ui.style.isContentNode = function(element) { 
  return element.className.indexOf('content') != - 1; 
}; 
goog.testing.ui.style.assertStructureMatchesReference = function(element, referenceId) { 
  goog.testing.ui.style.assertStructureMatchesReferenceInner_(element, goog.testing.ui.style.getReferenceNode(referenceId)); 
}; 
goog.testing.ui.style.assertStructureMatchesReferenceInner_ = function(element, reference) { 
  if(! element && ! reference) { 
    return; 
  } 
  assertTrue('Expected two elements.', ! ! element && ! ! reference); 
  assertEquals('Expected nodes to have the same nodeName.', element.nodeName, reference.nodeName); 
  var elementClasses = goog.dom.classes.get(element); 
  goog.array.forEach(goog.dom.classes.get(reference), function(referenceClass) { 
    assertContains('Expected test node to have all reference classes.', referenceClass, elementClasses); 
  }); 
  var elChildren = goog.testing.ui.style.getElementChildren(element), refChildren = goog.testing.ui.style.getElementChildren(reference); 
  if(! goog.testing.ui.style.isContentNode(reference)) { 
    if(elChildren.length != refChildren.length) { 
      assertEquals('Expected same number of children for a non-content node.', elChildren.length, refChildren.length); 
    } 
    for(var i = 0; i < elChildren.length; i ++) { 
      goog.testing.ui.style.assertStructureMatchesReferenceInner_(elChildren[i], refChildren[i]); 
    } 
  } 
}; 
