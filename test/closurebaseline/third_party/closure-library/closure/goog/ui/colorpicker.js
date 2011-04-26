
goog.provide('goog.ui.ColorPicker'); 
goog.provide('goog.ui.ColorPicker.EventType'); 
goog.require('goog.ui.ColorPalette'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Component.State'); 
goog.ui.ColorPicker = function(opt_domHelper, opt_colorPalette) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.colorPalette_ = opt_colorPalette || null; 
  this.getHandler().listen(this, goog.ui.Component.EventType.ACTION, this.onColorPaletteAction_); 
}; 
goog.inherits(goog.ui.ColorPicker, goog.ui.Component); 
goog.ui.ColorPicker.DEFAULT_NUM_COLS = 5; 
goog.ui.ColorPicker.EventType = { CHANGE: 'change' }; 
goog.ui.ColorPicker.prototype.focusable_ = true; 
goog.ui.ColorPicker.prototype.getColors = function() { 
  return this.colorPalette_ ? this.colorPalette_.getColors(): null; 
}; 
goog.ui.ColorPicker.prototype.setColors = function(colors) { 
  if(! this.colorPalette_) { 
    this.createColorPalette_(colors); 
  } else { 
    this.colorPalette_.setColors(colors); 
  } 
}; 
goog.ui.ColorPicker.prototype.addColors = function(colors) { 
  this.setColors(colors); 
}; 
goog.ui.ColorPicker.prototype.setSize = function(size) { 
  if(! this.colorPalette_) { 
    this.createColorPalette_([]); 
  } 
  this.colorPalette_.setSize(size); 
}; 
goog.ui.ColorPicker.prototype.getSize = function() { 
  return this.colorPalette_ ? this.colorPalette_.getSize(): null; 
}; 
goog.ui.ColorPicker.prototype.setColumnCount = function(n) { 
  this.setSize(n); 
}; 
goog.ui.ColorPicker.prototype.getSelectedIndex = function() { 
  return this.colorPalette_ ? this.colorPalette_.getSelectedIndex(): - 1; 
}; 
goog.ui.ColorPicker.prototype.setSelectedIndex = function(ind) { 
  if(this.colorPalette_) { 
    this.colorPalette_.setSelectedIndex(ind); 
  } 
}; 
goog.ui.ColorPicker.prototype.getSelectedColor = function() { 
  return this.colorPalette_ ? this.colorPalette_.getSelectedColor(): null; 
}; 
goog.ui.ColorPicker.prototype.setSelectedColor = function(color) { 
  if(this.colorPalette_) { 
    this.colorPalette_.setSelectedColor(color); 
  } 
}; 
goog.ui.ColorPicker.prototype.isFocusable = function() { 
  return this.focusable_; 
}; 
goog.ui.ColorPicker.prototype.setFocusable = function(focusable) { 
  this.focusable_ = focusable; 
  if(this.colorPalette_) { 
    this.colorPalette_.setSupportedState(goog.ui.Component.State.FOCUSED, focusable); 
  } 
}; 
goog.ui.ColorPicker.prototype.canDecorate = function(element) { 
  return false; 
}; 
goog.ui.ColorPicker.prototype.enterDocument = function() { 
  goog.ui.ColorPicker.superClass_.enterDocument.call(this); 
  if(this.colorPalette_) { 
    this.colorPalette_.render(this.getElement()); 
  } 
  this.getElement().unselectable = 'on'; 
}; 
goog.ui.ColorPicker.prototype.disposeInternal = function() { 
  goog.ui.ColorPicker.superClass_.disposeInternal.call(this); 
  if(this.colorPalette_) { 
    this.colorPalette_.dispose(); 
    this.colorPalette_ = null; 
  } 
}; 
goog.ui.ColorPicker.prototype.focus = function() { 
  if(this.colorPalette_) { 
    this.colorPalette_.getElement().focus(); 
  } 
}; 
goog.ui.ColorPicker.prototype.onColorPaletteAction_ = function(e) { 
  e.stopPropagation(); 
  this.dispatchEvent(goog.ui.ColorPicker.EventType.CHANGE); 
}; 
goog.ui.ColorPicker.prototype.createColorPalette_ = function(colors) { 
  var cp = new goog.ui.ColorPalette(colors, null, this.getDomHelper()); 
  cp.setSize(goog.ui.ColorPicker.DEFAULT_NUM_COLS); 
  cp.setSupportedState(goog.ui.Component.State.FOCUSED, this.focusable_); 
  this.addChild(cp); 
  this.colorPalette_ = cp; 
  if(this.isInDocument()) { 
    this.colorPalette_.render(this.getElement()); 
  } 
}; 
goog.ui.ColorPicker.createSimpleColorGrid = function(opt_domHelper) { 
  var cp = new goog.ui.ColorPicker(opt_domHelper); 
  cp.setSize(7); 
  cp.setColors(goog.ui.ColorPicker.SIMPLE_GRID_COLORS); 
  return cp; 
}; 
goog.ui.ColorPicker.SIMPLE_GRID_COLORS =['#ffffff', '#cccccc', '#c0c0c0', '#999999', '#666666', '#333333', '#000000', '#ffcccc', '#ff6666', '#ff0000', '#cc0000', '#990000', '#660000', '#330000', '#ffcc99', '#ff9966', '#ff9900', '#ff6600', '#cc6600', '#993300', '#663300', '#ffff99', '#ffff66', '#ffcc66', '#ffcc33', '#cc9933', '#996633', '#663333', '#ffffcc', '#ffff33', '#ffff00', '#ffcc00', '#999900', '#666600', '#333300', '#99ff99', '#66ff99', '#33ff33', '#33cc00', '#009900', '#006600', '#003300', '#99ffff', '#33ffff', '#66cccc', '#00cccc', '#339999', '#336666', '#003333', '#ccffff', '#66ffff', '#33ccff', '#3366ff', '#3333ff', '#000099', '#000066', '#ccccff', '#9999ff', '#6666cc', '#6633ff', '#6600cc', '#333399', '#330099', '#ffccff', '#ff99ff', '#cc66cc', '#cc33cc', '#993399', '#663366', '#330033']; 
