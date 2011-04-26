
goog.provide('goog.ui.decorate'); 
goog.require('goog.ui.registry'); 
goog.ui.decorate = function(element) { 
  var decorator = goog.ui.registry.getDecorator(element); 
  if(decorator) { 
    decorator.decorate(element); 
  } 
  return decorator; 
}; 
