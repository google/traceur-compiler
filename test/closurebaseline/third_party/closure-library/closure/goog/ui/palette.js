
goog.provide('goog.ui.Palette'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.math.Size'); 
goog.require('goog.ui.Component.Error'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.Control'); 
goog.require('goog.ui.PaletteRenderer'); 
goog.require('goog.ui.SelectionModel'); 
goog.ui.Palette = function(items, opt_renderer, opt_domHelper) { 
  goog.ui.Control.call(this, items, opt_renderer || goog.ui.PaletteRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.Palette, goog.ui.Control); 
goog.ui.Palette.prototype.size_ = null; 
goog.ui.Palette.prototype.highlightedIndex_ = - 1; 
goog.ui.Palette.prototype.selectionModel_ = null; 
goog.ui.Palette.prototype.disposeInternal = function() { 
  goog.ui.Palette.superClass_.disposeInternal.call(this); 
  if(this.selectionModel_) { 
    this.selectionModel_.dispose(); 
    this.selectionModel_ = null; 
  } 
  this.size_ = null; 
}; 
goog.ui.Palette.prototype.setContentInternal = function(items) { 
  goog.ui.Palette.superClass_.setContentInternal.call(this, items); 
  this.adjustSize_(); 
  if(this.selectionModel_) { 
    this.selectionModel_.clear(); 
    this.selectionModel_.addItems(items); 
  } else { 
    this.selectionModel_ = new goog.ui.SelectionModel(items); 
    this.selectionModel_.setSelectionHandler(goog.bind(this.selectItem_, this)); 
    this.getHandler().listen(this.selectionModel_, goog.events.EventType.SELECT, this.handleSelectionChange); 
  } 
  this.highlightedIndex_ = - 1; 
}; 
goog.ui.Palette.prototype.getCaption = function() { 
  return null; 
}; 
goog.ui.Palette.prototype.setCaption = function(caption) { }; 
goog.ui.Palette.prototype.handleMouseOver = function(e) { 
  goog.ui.Palette.superClass_.handleMouseOver.call(this, e); 
  var item = this.getRenderer().getContainingItem(this, e.target); 
  if(item && e.relatedTarget && goog.dom.contains(item, e.relatedTarget)) { 
    return; 
  } 
  if(item != this.getHighlightedItem()) { 
    this.setHighlightedItem(item); 
  } 
}; 
goog.ui.Palette.prototype.handleMouseOut = function(e) { 
  goog.ui.Palette.superClass_.handleMouseOut.call(this, e); 
  var item = this.getRenderer().getContainingItem(this, e.target); 
  if(item && e.relatedTarget && goog.dom.contains(item, e.relatedTarget)) { 
    return; 
  } 
  if(item == this.getHighlightedItem()) { 
    this.getRenderer().highlightCell(this, item, false); 
  } 
}; 
goog.ui.Palette.prototype.handleMouseDown = function(e) { 
  goog.ui.Palette.superClass_.handleMouseDown.call(this, e); 
  if(this.isActive()) { 
    var item = this.getRenderer().getContainingItem(this, e.target); 
    if(item != this.getHighlightedItem()) { 
      this.setHighlightedItem(item); 
    } 
  } 
}; 
goog.ui.Palette.prototype.performActionInternal = function(e) { 
  var item = this.getHighlightedItem(); 
  if(item) { 
    this.setSelectedItem(item); 
    return this.dispatchEvent(goog.ui.Component.EventType.ACTION); 
  } 
  return false; 
}; 
goog.ui.Palette.prototype.handleKeyEvent = function(e) { 
  var items = this.getContent(); 
  var numItems = items ? items.length: 0; 
  var numColumns = this.size_.width; 
  if(numItems == 0 || ! this.isEnabled()) { 
    return false; 
  } 
  if(e.keyCode == goog.events.KeyCodes.ENTER || e.keyCode == goog.events.KeyCodes.SPACE) { 
    return this.performActionInternal(e); 
  } 
  if(e.keyCode == goog.events.KeyCodes.HOME) { 
    this.setHighlightedIndex(0); 
    return true; 
  } else if(e.keyCode == goog.events.KeyCodes.END) { 
    this.setHighlightedIndex(numItems - 1); 
    return true; 
  } 
  var highlightedIndex = this.highlightedIndex_ < 0 ? this.getSelectedIndex(): this.highlightedIndex_; 
  switch(e.keyCode) { 
    case goog.events.KeyCodes.LEFT: 
      if(highlightedIndex == - 1) { 
        highlightedIndex = numItems; 
      } 
      if(highlightedIndex > 0) { 
        this.setHighlightedIndex(highlightedIndex - 1); 
        e.preventDefault(); 
        return true; 
      } 
      break; 

    case goog.events.KeyCodes.RIGHT: 
      if(highlightedIndex < numItems - 1) { 
        this.setHighlightedIndex(highlightedIndex + 1); 
        e.preventDefault(); 
        return true; 
      } 
      break; 

    case goog.events.KeyCodes.UP: 
      if(highlightedIndex == - 1) { 
        highlightedIndex = numItems + numColumns - 1; 
      } 
      if(highlightedIndex >= numColumns) { 
        this.setHighlightedIndex(highlightedIndex - numColumns); 
        e.preventDefault(); 
        return true; 
      } 
      break; 

    case goog.events.KeyCodes.DOWN: 
      if(highlightedIndex == - 1) { 
        highlightedIndex = - numColumns; 
      } 
      if(highlightedIndex < numItems - numColumns) { 
        this.setHighlightedIndex(highlightedIndex + numColumns); 
        e.preventDefault(); 
        return true; 
      } 
      break; 

  } 
  return false; 
}; 
goog.ui.Palette.prototype.handleSelectionChange = function(e) { }; 
goog.ui.Palette.prototype.getSize = function() { 
  return this.size_; 
}; 
goog.ui.Palette.prototype.setSize = function(size, opt_rows) { 
  if(this.getElement()) { 
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED); 
  } 
  this.size_ = goog.isNumber(size) ? new goog.math.Size(size,(opt_rows)): size; 
  this.adjustSize_(); 
}; 
goog.ui.Palette.prototype.getHighlightedIndex = function() { 
  return this.highlightedIndex_; 
}; 
goog.ui.Palette.prototype.getHighlightedItem = function() { 
  var items = this.getContent(); 
  return items && items[this.highlightedIndex_]; 
}; 
goog.ui.Palette.prototype.setHighlightedIndex = function(index) { 
  if(index != this.highlightedIndex_) { 
    this.highlightIndex_(this.highlightedIndex_, false); 
    this.highlightedIndex_ = index; 
    this.highlightIndex_(index, true); 
  } 
}; 
goog.ui.Palette.prototype.setHighlightedItem = function(item) { 
  var items =(this.getContent()); 
  this.setHighlightedIndex(items ? goog.array.indexOf(items, item): - 1); 
}; 
goog.ui.Palette.prototype.getSelectedIndex = function() { 
  return this.selectionModel_ ? this.selectionModel_.getSelectedIndex(): - 1; 
}; 
goog.ui.Palette.prototype.getSelectedItem = function() { 
  return this.selectionModel_ ?(this.selectionModel_.getSelectedItem()): null; 
}; 
goog.ui.Palette.prototype.setSelectedIndex = function(index) { 
  if(this.selectionModel_) { 
    this.selectionModel_.setSelectedIndex(index); 
  } 
}; 
goog.ui.Palette.prototype.setSelectedItem = function(item) { 
  if(this.selectionModel_) { 
    this.selectionModel_.setSelectedItem(item); 
  } 
}; 
goog.ui.Palette.prototype.highlightIndex_ = function(index, highlight) { 
  if(this.getElement()) { 
    var items = this.getContent(); 
    if(items && index >= 0 && index < items.length) { 
      this.getRenderer().highlightCell(this, items[index], highlight); 
    } 
  } 
}; 
goog.ui.Palette.prototype.selectItem_ = function(item, select) { 
  if(this.getElement()) { 
    this.getRenderer().selectCell(this, item, select); 
  } 
}; 
goog.ui.Palette.prototype.adjustSize_ = function() { 
  var items = this.getContent(); 
  if(items) { 
    if(this.size_ && this.size_.width) { 
      var minRows = Math.ceil(items.length / this.size_.width); 
      if(! goog.isNumber(this.size_.height) || this.size_.height < minRows) { 
        this.size_.height = minRows; 
      } 
    } else { 
      var length = Math.ceil(Math.sqrt(items.length)); 
      this.size_ = new goog.math.Size(length, length); 
    } 
  } else { 
    this.size_ = new goog.math.Size(0, 0); 
  } 
}; 
