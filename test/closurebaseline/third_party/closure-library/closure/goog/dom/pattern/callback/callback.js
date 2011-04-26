
goog.provide('goog.dom.pattern.callback'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagWalkType'); 
goog.require('goog.iter'); 
goog.dom.pattern.callback.removeNode = function(node, position) { 
  position.setPosition(node, goog.dom.TagWalkType.END_TAG); 
  goog.iter.nextOrValue(position, null); 
  goog.dom.removeNode(node); 
  position.depth -= 1; 
  return true; 
}; 
goog.dom.pattern.callback.flattenElement = function(node, position) { 
  position.setPosition(node, node.firstChild ? goog.dom.TagWalkType.START_TAG: goog.dom.TagWalkType.END_TAG); 
  goog.iter.nextOrValue(position, null); 
  goog.dom.flattenElement(node); 
  position.depth -= 1; 
  return true; 
}; 
