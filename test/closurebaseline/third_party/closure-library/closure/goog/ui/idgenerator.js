
goog.provide('goog.ui.IdGenerator'); 
goog.ui.IdGenerator = function() { }; 
goog.addSingletonGetter(goog.ui.IdGenerator); 
goog.ui.IdGenerator.prototype.nextId_ = 0; 
goog.ui.IdGenerator.prototype.getNextUniqueId = function() { 
  return ':' +(this.nextId_ ++).toString(36); 
}; 
goog.ui.IdGenerator.instance = goog.ui.IdGenerator.getInstance(); 
