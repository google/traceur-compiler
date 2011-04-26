
goog.provide('goog.ui.ColorPalette'); 
goog.require('goog.array'); 
goog.require('goog.color'); 
goog.require('goog.dom'); 
goog.require('goog.style'); 
goog.require('goog.ui.Palette'); 
goog.require('goog.ui.PaletteRenderer'); 
goog.ui.ColorPalette = function(opt_colors, opt_renderer, opt_domHelper) { 
  this.colors_ = opt_colors ||[]; 
  goog.ui.Palette.call(this, null, opt_renderer || goog.ui.PaletteRenderer.getInstance(), opt_domHelper); 
  this.setColors(this.colors_); 
}; 
goog.inherits(goog.ui.ColorPalette, goog.ui.Palette); 
goog.ui.ColorPalette.prototype.normalizedColors_ = null; 
goog.ui.ColorPalette.prototype.getColors = function() { 
  return this.colors_; 
}; 
goog.ui.ColorPalette.prototype.setColors = function(colors) { 
  this.colors_ = colors; 
  this.normalizedColors_ = null; 
  this.setContent(this.createColorNodes_()); 
}; 
goog.ui.ColorPalette.prototype.getSelectedColor = function() { 
  var selectedItem =(this.getSelectedItem()); 
  if(selectedItem) { 
    var color = goog.style.getStyle(selectedItem, 'background-color'); 
    return goog.ui.ColorPalette.parseColor_(color); 
  } else { 
    return null; 
  } 
}; 
goog.ui.ColorPalette.prototype.setSelectedColor = function(color) { 
  var hexColor = goog.ui.ColorPalette.parseColor_(color); 
  if(! this.normalizedColors_) { 
    this.normalizedColors_ = goog.array.map(this.colors_, function(color) { 
      return goog.ui.ColorPalette.parseColor_(color); 
    }); 
  } 
  this.setSelectedIndex(hexColor ? goog.array.indexOf(this.normalizedColors_, hexColor): - 1); 
}; 
goog.ui.ColorPalette.prototype.createColorNodes_ = function() { 
  return goog.array.map(this.colors_, function(color) { 
    var swatch = this.getDomHelper().createDom('div', { 
      'class': goog.getCssName(this.getRenderer().getCssClass(), 'colorswatch'), 
      'style': 'background-color:' + color 
    }); 
    swatch.title = color.charAt(0) == '#' ? 'RGB (' + goog.color.hexToRgb(color).join(', ') + ')': color; 
    return swatch; 
  }, this); 
}; 
goog.ui.ColorPalette.parseColor_ = function(color) { 
  if(color) { 
    try { 
      return goog.color.parse(color).hex; 
    } catch(ex) { } 
  } 
  return null; 
}; 
