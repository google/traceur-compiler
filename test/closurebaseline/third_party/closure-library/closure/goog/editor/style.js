
goog.provide('goog.editor.style'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.events.EventType'); 
goog.require('goog.object'); 
goog.require('goog.style'); 
goog.require('goog.userAgent'); 
goog.editor.style.getComputedOrCascadedStyle_ = function(node, stylePropertyName) { 
  if(node.nodeType != goog.dom.NodeType.ELEMENT) { 
    return null; 
  } 
  return goog.userAgent.IE ? goog.style.getCascadedStyle((node), stylePropertyName): goog.style.getComputedStyle((node), stylePropertyName); 
}; 
goog.editor.style.isDisplayBlock = function(node) { 
  return goog.editor.style.getComputedOrCascadedStyle_(node, 'display') == 'block'; 
}; 
goog.editor.style.isContainer = function(element) { 
  var nodeName = element && element.nodeName.toLowerCase(); 
  return ! !(element &&(goog.editor.style.isDisplayBlock(element) || nodeName == 'td' || nodeName == 'table' || nodeName == 'li')); 
}; 
goog.editor.style.getContainer = function(node) { 
  return(goog.dom.getAncestor(node, goog.editor.style.isContainer, true)); 
}; 
goog.editor.style.SELECTABLE_INPUT_TYPES_ = goog.object.createSet('text', 'file', 'url'); 
goog.editor.style.cancelMouseDownHelper_ = function(e) { 
  var targetTagName = e.target.tagName; 
  if(targetTagName != goog.dom.TagName.TEXTAREA && targetTagName != goog.dom.TagName.INPUT) { 
    e.preventDefault(); 
  } 
}; 
goog.editor.style.makeUnselectable = function(element, eventHandler) { 
  if(goog.editor.BrowserFeature.HAS_UNSELECTABLE_STYLE) { 
    eventHandler.listen(element, goog.events.EventType.MOUSEDOWN, goog.editor.style.cancelMouseDownHelper_, true); 
  } 
  goog.style.setUnselectable(element, true); 
  var inputs = element.getElementsByTagName(goog.dom.TagName.INPUT); 
  for(var i = 0, len = inputs.length; i < len; i ++) { 
    var input = inputs[i]; 
    if(input.type in goog.editor.style.SELECTABLE_INPUT_TYPES_) { 
      goog.editor.style.makeSelectable(input); 
    } 
  } 
  goog.array.forEach(element.getElementsByTagName(goog.dom.TagName.TEXTAREA), goog.editor.style.makeSelectable); 
}; 
goog.editor.style.makeSelectable = function(element) { 
  goog.style.setUnselectable(element, false); 
  if(goog.editor.BrowserFeature.HAS_UNSELECTABLE_STYLE) { 
    var child = element; 
    var current =(element.parentNode); 
    while(current && current.tagName != goog.dom.TagName.HTML) { 
      if(goog.style.isUnselectable(current)) { 
        goog.style.setUnselectable(current, false, true); 
        for(var i = 0, len = current.childNodes.length; i < len; i ++) { 
          var node = current.childNodes[i]; 
          if(node != child && node.nodeType == goog.dom.NodeType.ELEMENT) { 
            goog.style.setUnselectable(current.childNodes[i], true); 
          } 
        } 
      } 
      child = current; 
      current =(current.parentNode); 
    } 
  } 
}; 
