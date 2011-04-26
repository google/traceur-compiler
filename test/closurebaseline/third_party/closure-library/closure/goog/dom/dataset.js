
goog.provide('goog.dom.dataset'); 
goog.require('goog.string'); 
goog.dom.dataset.set = function(element, key, value) { 
  if(element.dataset) { 
    element.dataset[key]= value; 
  } else { 
    element.setAttribute('data-' + goog.string.toSelectorCase(key), value); 
  } 
}; 
goog.dom.dataset.get = function(element, key) { 
  if(element.dataset) { 
    return element.dataset[key]; 
  } else { 
    return element.getAttribute('data-' + goog.string.toSelectorCase(key)); 
  } 
}; 
goog.dom.dataset.remove = function(element, key) { 
  if(element.dataset) { 
    delete element.dataset[key]; 
  } else { 
    element.removeAttribute('data-' + goog.string.toSelectorCase(key)); 
  } 
}; 
goog.dom.dataset.has = function(element, key) { 
  if(element.dataset) { 
    return key in element.dataset; 
  } else if(element.hasAttribute) { 
    return element.hasAttribute('data-' + goog.string.toSelectorCase(key)); 
  } else { 
    return ! !(element.getAttribute('data-' + goog.string.toSelectorCase(key))); 
  } 
}; 
