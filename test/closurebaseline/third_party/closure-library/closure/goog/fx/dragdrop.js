
goog.provide('goog.fx.DragDrop'); 
goog.require('goog.fx.AbstractDragDrop'); 
goog.require('goog.fx.DragDropItem'); 
goog.fx.DragDrop = function(element, opt_data) { 
  goog.fx.AbstractDragDrop.call(this); 
  var item = new goog.fx.DragDropItem(element, opt_data); 
  item.setParent(this); 
  this.items_.push(item); 
}; 
goog.inherits(goog.fx.DragDrop, goog.fx.AbstractDragDrop); 
