
goog.provide('goog.ui.TriStateMenuItem'); 
goog.provide('goog.ui.TriStateMenuItem.State'); 
goog.require('goog.dom.classes'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.MenuItem'); 
goog.require('goog.ui.TriStateMenuItemRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.TriStateMenuItem = function(content, opt_model, opt_domHelper, opt_renderer) { 
  goog.ui.MenuItem.call(this, content, opt_model, opt_domHelper, opt_renderer || new goog.ui.TriStateMenuItemRenderer()); 
  this.setCheckable(true); 
}; 
goog.inherits(goog.ui.TriStateMenuItem, goog.ui.MenuItem); 
goog.ui.TriStateMenuItem.State = { 
  NOT_CHECKED: 0, 
  PARTIALLY_CHECKED: 1, 
  FULLY_CHECKED: 2 
}; 
goog.ui.TriStateMenuItem.prototype.checkState_ = goog.ui.TriStateMenuItem.State.NOT_CHECKED; 
goog.ui.TriStateMenuItem.prototype.allowPartial_ = false; 
goog.ui.TriStateMenuItem.prototype.getCheckedState = function() { 
  return this.checkState_; 
}; 
goog.ui.TriStateMenuItem.prototype.setCheckedState = function(state) { 
  this.setCheckedState_(state); 
  this.allowPartial_ = state == goog.ui.TriStateMenuItem.State.PARTIALLY_CHECKED; 
}; 
goog.ui.TriStateMenuItem.prototype.setCheckedState_ = function(state) { 
  if(this.dispatchEvent(state != goog.ui.TriStateMenuItem.State.NOT_CHECKED ? goog.ui.Component.EventType.CHECK: goog.ui.Component.EventType.UNCHECK)) { 
    this.setState(goog.ui.Component.State.CHECKED, state != goog.ui.TriStateMenuItem.State.NOT_CHECKED); 
    this.checkState_ = state; 
    this.updatedCheckedStateClassNames_(); 
  } 
}; 
goog.ui.TriStateMenuItem.prototype.performActionInternal = function(e) { 
  switch(this.getCheckedState()) { 
    case goog.ui.TriStateMenuItem.State.NOT_CHECKED: 
      this.setCheckedState_(this.allowPartial_ ? goog.ui.TriStateMenuItem.State.PARTIALLY_CHECKED: goog.ui.TriStateMenuItem.State.FULLY_CHECKED); 
      break; 

    case goog.ui.TriStateMenuItem.State.PARTIALLY_CHECKED: 
      this.setCheckedState_(goog.ui.TriStateMenuItem.State.FULLY_CHECKED); 
      break; 

    case goog.ui.TriStateMenuItem.State.FULLY_CHECKED: 
      this.setCheckedState_(goog.ui.TriStateMenuItem.State.NOT_CHECKED); 
      break; 

  } 
  var checkboxClass = goog.getCssName(this.getRenderer().getCssClass(), 'checkbox'); 
  var clickOnCheckbox = e.target && goog.dom.classes.has((e.target), checkboxClass); 
  return this.dispatchEvent(clickOnCheckbox || this.allowPartial_ ? goog.ui.Component.EventType.CHANGE: goog.ui.Component.EventType.ACTION); 
}; 
goog.ui.TriStateMenuItem.prototype.updatedCheckedStateClassNames_ = function() { 
  var renderer = this.getRenderer(); 
  renderer.enableExtraClassName(this, goog.getCssName(renderer.getCssClass(), 'partially-checked'), this.getCheckedState() == goog.ui.TriStateMenuItem.State.PARTIALLY_CHECKED); 
  renderer.enableExtraClassName(this, goog.getCssName(renderer.getCssClass(), 'fully-checked'), this.getCheckedState() == goog.ui.TriStateMenuItem.State.FULLY_CHECKED); 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.TriStateMenuItemRenderer.CSS_CLASS, function() { 
  return new goog.ui.TriStateMenuItem(null); 
}); 
