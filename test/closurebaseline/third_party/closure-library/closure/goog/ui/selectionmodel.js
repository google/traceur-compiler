
goog.provide('goog.ui.SelectionModel'); 
goog.require('goog.array'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.ui.SelectionModel = function(opt_items) { 
  goog.events.EventTarget.call(this); 
  this.items_ =[]; 
  this.addItems(opt_items); 
}; 
goog.inherits(goog.ui.SelectionModel, goog.events.EventTarget); 
goog.ui.SelectionModel.prototype.selectedItem_ = null; 
goog.ui.SelectionModel.prototype.selectionHandler_ = null; 
goog.ui.SelectionModel.prototype.getSelectionHandler = function() { 
  return this.selectionHandler_; 
}; 
goog.ui.SelectionModel.prototype.setSelectionHandler = function(handler) { 
  this.selectionHandler_ = handler; 
}; 
goog.ui.SelectionModel.prototype.getItemCount = function() { 
  return this.items_.length; 
}; 
goog.ui.SelectionModel.prototype.indexOfItem = function(item) { 
  return item ? goog.array.indexOf(this.items_, item): - 1; 
}; 
goog.ui.SelectionModel.prototype.getFirst = function() { 
  return this.items_[0]; 
}; 
goog.ui.SelectionModel.prototype.getLast = function() { 
  return this.items_[this.items_.length - 1]; 
}; 
goog.ui.SelectionModel.prototype.getItemAt = function(index) { 
  return this.items_[index]|| null; 
}; 
goog.ui.SelectionModel.prototype.addItems = function(items) { 
  if(items) { 
    goog.array.forEach(items, function(item) { 
      this.selectItem_(item, false); 
    }, this); 
    goog.array.extend(this.items_, items); 
  } 
}; 
goog.ui.SelectionModel.prototype.addItem = function(item) { 
  this.addItemAt(item, this.getItemCount()); 
}; 
goog.ui.SelectionModel.prototype.addItemAt = function(item, index) { 
  if(item) { 
    this.selectItem_(item, false); 
    goog.array.insertAt(this.items_, item, index); 
  } 
}; 
goog.ui.SelectionModel.prototype.removeItem = function(item) { 
  if(item && goog.array.remove(this.items_, item)) { 
    if(item == this.selectedItem_) { 
      this.selectedItem_ = null; 
      this.dispatchEvent(goog.events.EventType.SELECT); 
    } 
  } 
}; 
goog.ui.SelectionModel.prototype.removeItemAt = function(index) { 
  this.removeItem(this.getItemAt(index)); 
}; 
goog.ui.SelectionModel.prototype.getSelectedItem = function() { 
  return this.selectedItem_; 
}; 
goog.ui.SelectionModel.prototype.setSelectedItem = function(item) { 
  if(item != this.selectedItem_) { 
    this.selectItem_(this.selectedItem_, false); 
    this.selectedItem_ = item; 
    this.selectItem_(item, true); 
  } 
  this.dispatchEvent(goog.events.EventType.SELECT); 
}; 
goog.ui.SelectionModel.prototype.getSelectedIndex = function() { 
  return this.indexOfItem(this.selectedItem_); 
}; 
goog.ui.SelectionModel.prototype.setSelectedIndex = function(index) { 
  this.setSelectedItem(this.getItemAt(index)); 
}; 
goog.ui.SelectionModel.prototype.clear = function() { 
  goog.array.clear(this.items_); 
  this.selectedItem_ = null; 
}; 
goog.ui.SelectionModel.prototype.disposeInternal = function() { 
  goog.ui.SelectionModel.superClass_.disposeInternal.call(this); 
  delete this.items_; 
  this.selectedItem_ = null; 
}; 
goog.ui.SelectionModel.prototype.selectItem_ = function(item, select) { 
  if(item) { 
    if(typeof this.selectionHandler_ == 'function') { 
      this.selectionHandler_(item, select); 
    } else if(typeof item.setSelected == 'function') { 
      item.setSelected(select); 
    } 
  } 
}; 
