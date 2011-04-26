
goog.provide('goog.fx.DragDropGroup'); 
goog.require('goog.dom'); 
goog.require('goog.fx.AbstractDragDrop'); 
goog.require('goog.fx.DragDropItem'); 
goog.fx.DragDropGroup = function() { 
  goog.fx.AbstractDragDrop.call(this); 
}; 
goog.inherits(goog.fx.DragDropGroup, goog.fx.AbstractDragDrop); 
goog.fx.DragDropGroup.prototype.addItem = function(element, opt_data) { 
  var item = new goog.fx.DragDropItem(element, opt_data); 
  this.addDragDropItem(item); 
}; 
goog.fx.DragDropGroup.prototype.addDragDropItem = function(item) { 
  item.setParent(this); 
  this.items_.push(item); 
  if(this.isInitialized()) { 
    this.initItem(item); 
  } 
}; 
goog.fx.DragDropGroup.prototype.removeItem = function(element) { 
  element = goog.dom.getElement(element); 
  for(var item, i = 0; item = this.items_[i]; i ++) { 
    if(item.element == element) { 
      this.items_.splice(i, 1); 
      this.disposeItem(item); 
      break; 
    } 
  } 
}; 
goog.fx.DragDropGroup.prototype.setSelection = function(list) { }; 
