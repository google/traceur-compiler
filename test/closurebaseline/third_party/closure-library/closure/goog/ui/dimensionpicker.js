
goog.provide('goog.ui.DimensionPicker'); 
goog.require('goog.events.EventType'); 
goog.require('goog.math.Size'); 
goog.require('goog.ui.Control'); 
goog.require('goog.ui.DimensionPickerRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.DimensionPicker = function(opt_renderer, opt_domHelper) { 
  goog.ui.Control.call(this, null, opt_renderer || goog.ui.DimensionPickerRenderer.getInstance(), opt_domHelper); 
  this.size_ = new goog.math.Size(this.minColumns, this.minRows); 
}; 
goog.inherits(goog.ui.DimensionPicker, goog.ui.Control); 
goog.ui.DimensionPicker.prototype.minColumns = 5; 
goog.ui.DimensionPicker.prototype.minRows = 5; 
goog.ui.DimensionPicker.prototype.maxColumns = 20; 
goog.ui.DimensionPicker.prototype.maxRows = 20; 
goog.ui.DimensionPicker.prototype.size_; 
goog.ui.DimensionPicker.prototype.highlightedRows_ = 0; 
goog.ui.DimensionPicker.prototype.highlightedColumns_ = 0; 
goog.ui.DimensionPicker.prototype.enterDocument = function() { 
  goog.ui.DimensionPicker.superClass_.enterDocument.call(this); 
  var handler = this.getHandler(); 
  handler.listen(this.getRenderer().getMouseMoveElement(this), goog.events.EventType.MOUSEMOVE, this.handleMouseMove).listen(this.getDomHelper().getWindow(), goog.events.EventType.RESIZE, this.handleWindowResize); 
  var parent = this.getParent(); 
  if(parent) { 
    handler.listen(parent, goog.ui.Component.EventType.SHOW, this.handleShow_); 
  } 
}; 
goog.ui.DimensionPicker.prototype.exitDocument = function() { 
  goog.ui.DimensionPicker.superClass_.exitDocument.call(this); 
  var handler = this.getHandler(); 
  handler.unlisten(this.getRenderer().getMouseMoveElement(this), goog.events.EventType.MOUSEMOVE, this.handleMouseMove).unlisten(this.getDomHelper().getWindow(), goog.events.EventType.RESIZE, this.handleWindowResize); 
  var parent = this.getParent(); 
  if(parent) { 
    handler.unlisten(parent, goog.ui.Component.EventType.SHOW, this.handleShow_); 
  } 
}; 
goog.ui.DimensionPicker.prototype.handleShow_ = function() { 
  if(this.isVisible()) { 
    this.setValue(0, 0); 
  } 
}; 
goog.ui.DimensionPicker.prototype.disposeInternal = function() { 
  goog.ui.DimensionPicker.superClass_.disposeInternal.call(this); 
  delete this.size_; 
}; 
goog.ui.DimensionPicker.prototype.handleMouseMove = function(e) { 
  var highlightedSizeX = this.getRenderer().getGridOffsetX(this, this.isRightToLeft() ? e.target.offsetWidth - e.offsetX: e.offsetX); 
  var highlightedSizeY = this.getRenderer().getGridOffsetY(this, e.offsetY); 
  if(this.highlightedColumns_ != highlightedSizeX || this.highlightedRows_ != highlightedSizeY) { 
    this.setValue(highlightedSizeX, highlightedSizeY); 
  } 
}; 
goog.ui.DimensionPicker.prototype.handleWindowResize = function(e) { 
  this.getRenderer().positionMouseCatcher(this); 
}; 
goog.ui.DimensionPicker.prototype.handleKeyEvent = function(e) { 
  var rows = this.highlightedRows_; 
  var columns = this.highlightedColumns_; 
  switch(e.keyCode) { 
    case goog.events.KeyCodes.DOWN: 
      rows = Math.min(this.maxRows, rows + 1); 
      break; 

    case goog.events.KeyCodes.UP: 
      rows = Math.max(1, rows - 1); 
      break; 

    case goog.events.KeyCodes.LEFT: 
      if(columns == 1) { 
        return false; 
      } else { 
        columns = Math.max(1, columns - 1); 
      } 
      break; 

    case goog.events.KeyCodes.RIGHT: 
      columns = Math.min(this.maxColumns, columns + 1); 
      break; 

    default: 
      return goog.ui.DimensionPicker.superClass_.handleKeyEvent.call(this, e); 

  } 
  this.setValue(columns, rows); 
  return true; 
}; 
goog.ui.DimensionPicker.prototype.getSize = function() { 
  return this.size_; 
}; 
goog.ui.DimensionPicker.prototype.getValue = function() { 
  return new goog.math.Size(this.highlightedColumns_, this.highlightedRows_); 
}; 
goog.ui.DimensionPicker.prototype.setValue = function(columns, opt_rows) { 
  if(! goog.isDef(opt_rows)) { 
    opt_rows = columns.height; 
    columns = columns.width; 
  } 
  if(this.highlightedColumns_ != columns || this.highlightedRows_ != opt_rows) { 
    var renderer = this.getRenderer(); 
    this.size_.width = Math.max(columns, this.minColumns); 
    this.size_.height = Math.max(opt_rows, this.minRows); 
    renderer.updateSize(this, this.getElement()); 
    this.highlightedColumns_ = columns; 
    this.highlightedRows_ = opt_rows; 
    renderer.setHighlightedSize(this, columns, opt_rows); 
  } 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.DimensionPickerRenderer.CSS_CLASS, function() { 
  return new goog.ui.DimensionPicker(); 
}); 
