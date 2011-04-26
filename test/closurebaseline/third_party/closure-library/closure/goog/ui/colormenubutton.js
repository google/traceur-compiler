
goog.provide('goog.ui.ColorMenuButton'); 
goog.require('goog.array'); 
goog.require('goog.object'); 
goog.require('goog.ui.ColorMenuButtonRenderer'); 
goog.require('goog.ui.ColorPalette'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.Menu'); 
goog.require('goog.ui.MenuButton'); 
goog.require('goog.ui.registry'); 
goog.ui.ColorMenuButton = function(content, opt_menu, opt_renderer, opt_domHelper) { 
  goog.ui.MenuButton.call(this, content, opt_menu, opt_renderer || goog.ui.ColorMenuButtonRenderer.getInstance(), opt_domHelper); 
}; 
goog.inherits(goog.ui.ColorMenuButton, goog.ui.MenuButton); 
goog.ui.ColorMenuButton.PALETTES = { 
  GRAYSCALE:['#000', '#444', '#666', '#999', '#ccc', '#eee', '#f3f3f3', '#fff'], 
  SOLID:['#f00', '#f90', '#ff0', '#0f0', '#0ff', '#00f', '#90f', '#f0f'], 
  PASTEL:['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130']
}; 
goog.ui.ColorMenuButton.NO_COLOR = 'none'; 
goog.ui.ColorMenuButton.newColorMenu = function(opt_extraItems, opt_domHelper) { 
  var menu = new goog.ui.Menu(opt_domHelper); 
  if(opt_extraItems) { 
    goog.array.forEach(opt_extraItems, function(item) { 
      menu.addChild(item, true); 
    }); 
  } 
  goog.object.forEach(goog.ui.ColorMenuButton.PALETTES, function(colors) { 
    var palette = new goog.ui.ColorPalette(colors, null, opt_domHelper); 
    palette.setSize(8); 
    menu.addChild(palette, true); 
  }); 
  return menu; 
}; 
goog.ui.ColorMenuButton.prototype.getSelectedColor = function() { 
  return(this.getValue()); 
}; 
goog.ui.ColorMenuButton.prototype.setSelectedColor = function(color) { 
  this.setValue(color); 
}; 
goog.ui.ColorMenuButton.prototype.setValue = function(color) { 
  for(var i = 0, item; item = this.getItemAt(i); i ++) { 
    if(typeof item.setSelectedColor == 'function') { 
      item.setSelectedColor(color); 
    } 
  } 
  goog.ui.ColorMenuButton.superClass_.setValue.call(this, color); 
}; 
goog.ui.ColorMenuButton.prototype.handleMenuAction = function(e) { 
  if(typeof e.target.getSelectedColor == 'function') { 
    this.setValue(e.target.getSelectedColor()); 
  } else if(e.target.getValue() == goog.ui.ColorMenuButton.NO_COLOR) { 
    this.setValue(null); 
  } 
  goog.ui.ColorMenuButton.superClass_.handleMenuAction.call(this, e); 
  e.stopPropagation(); 
  this.dispatchEvent(goog.ui.Component.EventType.ACTION); 
}; 
goog.ui.ColorMenuButton.prototype.setOpen = function(open, opt_e) { 
  if(open && this.getItemCount() == 0) { 
    this.setMenu(goog.ui.ColorMenuButton.newColorMenu(null, this.getDomHelper())); 
    this.setValue((this.getValue())); 
  } 
  goog.ui.ColorMenuButton.superClass_.setOpen.call(this, open, opt_e); 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.ColorMenuButtonRenderer.CSS_CLASS, function() { 
  return new goog.ui.ColorMenuButton(null); 
}); 
