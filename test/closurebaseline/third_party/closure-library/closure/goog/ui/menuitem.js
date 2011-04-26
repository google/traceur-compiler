
goog.provide('goog.ui.MenuItem'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.string'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.Control'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.MenuItemRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.MenuItem = function(content, opt_model, opt_domHelper, opt_renderer) { 
  goog.ui.Control.call(this, content, opt_renderer || goog.ui.MenuItemRenderer.getInstance(), opt_domHelper); 
  this.setValue(opt_model); 
}; 
goog.inherits(goog.ui.MenuItem, goog.ui.Control); 
goog.ui.MenuItem.prototype.getValue = function() { 
  var model = this.getModel(); 
  return model != null ? model: this.getCaption(); 
}; 
goog.ui.MenuItem.prototype.setValue = function(value) { 
  this.setModel(value); 
}; 
goog.ui.MenuItem.prototype.setSelectable = function(selectable) { 
  this.setSupportedState(goog.ui.Component.State.SELECTED, selectable); 
  if(this.isChecked() && ! selectable) { 
    this.setChecked(false); 
  } 
  var element = this.getElement(); 
  if(element) { 
    this.getRenderer().setSelectable(this, element, selectable); 
  } 
}; 
goog.ui.MenuItem.prototype.setCheckable = function(checkable) { 
  this.setSupportedState(goog.ui.Component.State.CHECKED, checkable); 
  var element = this.getElement(); 
  if(element) { 
    this.getRenderer().setCheckable(this, element, checkable); 
  } 
}; 
goog.ui.MenuItem.prototype.getCaption = function() { 
  var content = this.getContent(); 
  if(goog.isArray(content)) { 
    var acceleratorClass = goog.getCssName('goog-menuitem-accel'); 
    var caption = goog.array.map(content, function(node) { 
      return goog.dom.classes.has(node, acceleratorClass) ? '': goog.dom.getRawTextContent(node); 
    }).join(''); 
    return goog.string.collapseBreakingSpaces(caption); 
  } 
  return goog.ui.MenuItem.superClass_.getCaption.call(this); 
}; 
goog.ui.MenuItem.prototype.handleMouseUp = function(e) { 
  var parentMenu =(this.getParent()); 
  if(parentMenu) { 
    var oldCoords = parentMenu.openingCoords; 
    parentMenu.openingCoords = null; 
    if(oldCoords && goog.isNumber(e.clientX)) { 
      var newCoords = new goog.math.Coordinate(e.clientX, e.clientY); 
      if(goog.math.Coordinate.equals(oldCoords, newCoords)) { 
        return; 
      } 
    } 
  } 
  goog.base(this, 'handleMouseUp', e); 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.MenuItemRenderer.CSS_CLASS, function() { 
  return new goog.ui.MenuItem(null); 
}); 
