
goog.provide('goog.ui.TabBar'); 
goog.provide('goog.ui.TabBar.Location'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.Container'); 
goog.require('goog.ui.Container.Orientation'); 
goog.require('goog.ui.Tab'); 
goog.require('goog.ui.TabBarRenderer'); 
goog.require('goog.ui.registry'); 
goog.ui.TabBar = function(opt_location, opt_renderer, opt_domHelper) { 
  this.setLocation(opt_location || goog.ui.TabBar.Location.TOP); 
  goog.ui.Container.call(this, this.getOrientation(), opt_renderer || goog.ui.TabBarRenderer.getInstance(), opt_domHelper); 
  this.listenToTabEvents_(); 
}; 
goog.inherits(goog.ui.TabBar, goog.ui.Container); 
goog.ui.TabBar.Location = { 
  TOP: 'top', 
  BOTTOM: 'bottom', 
  START: 'start', 
  END: 'end' 
}; 
goog.ui.TabBar.prototype.location_; 
goog.ui.TabBar.prototype.autoSelectTabs_ = true; 
goog.ui.TabBar.prototype.selectedTab_ = null; 
goog.ui.TabBar.prototype.enterDocument = function() { 
  goog.ui.TabBar.superClass_.enterDocument.call(this); 
  this.listenToTabEvents_(); 
}; 
goog.ui.TabBar.prototype.disposeInternal = function() { 
  goog.ui.TabBar.superClass_.disposeInternal.call(this); 
  this.selectedTab_ = null; 
}; 
goog.ui.TabBar.prototype.removeChild = function(tab, opt_unrender) { 
  this.deselectIfSelected((tab)); 
  return goog.ui.TabBar.superClass_.removeChild.call(this, tab, opt_unrender); 
}; 
goog.ui.TabBar.prototype.getLocation = function() { 
  return this.location_; 
}; 
goog.ui.TabBar.prototype.setLocation = function(location) { 
  this.setOrientation(goog.ui.TabBar.getOrientationFromLocation(location)); 
  this.location_ = location; 
}; 
goog.ui.TabBar.prototype.isAutoSelectTabs = function() { 
  return this.autoSelectTabs_; 
}; 
goog.ui.TabBar.prototype.setAutoSelectTabs = function(enable) { 
  this.autoSelectTabs_ = enable; 
}; 
goog.ui.TabBar.prototype.setHighlightedIndexFromKeyEvent = function(index) { 
  goog.ui.TabBar.superClass_.setHighlightedIndexFromKeyEvent.call(this, index); 
  if(this.autoSelectTabs_) { 
    this.setSelectedTabIndex(index); 
  } 
}; 
goog.ui.TabBar.prototype.getSelectedTab = function() { 
  return this.selectedTab_; 
}; 
goog.ui.TabBar.prototype.setSelectedTab = function(tab) { 
  if(tab) { 
    tab.setSelected(true); 
  } else if(this.getSelectedTab()) { 
    this.getSelectedTab().setSelected(false); 
  } 
}; 
goog.ui.TabBar.prototype.getSelectedTabIndex = function() { 
  return this.indexOfChild(this.getSelectedTab()); 
}; 
goog.ui.TabBar.prototype.setSelectedTabIndex = function(index) { 
  this.setSelectedTab((this.getChildAt(index))); 
}; 
goog.ui.TabBar.prototype.deselectIfSelected = function(tab) { 
  if(tab && tab == this.getSelectedTab()) { 
    var index = this.indexOfChild(tab); 
    for(var i = index - 1; tab =(this.getChildAt(i)); i --) { 
      if(this.isSelectableTab(tab)) { 
        this.setSelectedTab(tab); 
        return; 
      } 
    } 
    for(var j = index + 1; tab =(this.getChildAt(j)); j ++) { 
      if(this.isSelectableTab(tab)) { 
        this.setSelectedTab(tab); 
        return; 
      } 
    } 
    this.setSelectedTab(null); 
  } 
}; 
goog.ui.TabBar.prototype.isSelectableTab = function(tab) { 
  return tab.isVisible() && tab.isEnabled(); 
}; 
goog.ui.TabBar.prototype.handleTabSelect = function(e) { 
  if(this.selectedTab_ && this.selectedTab_ != e.target) { 
    this.selectedTab_.setSelected(false); 
  } 
  this.selectedTab_ =(e.target); 
}; 
goog.ui.TabBar.prototype.handleTabUnselect = function(e) { 
  if(e.target == this.selectedTab_) { 
    this.selectedTab_ = null; 
  } 
}; 
goog.ui.TabBar.prototype.handleTabDisable = function(e) { 
  this.deselectIfSelected((e.target)); 
}; 
goog.ui.TabBar.prototype.handleTabHide = function(e) { 
  this.deselectIfSelected((e.target)); 
}; 
goog.ui.TabBar.prototype.handleFocus = function(e) { 
  if(! this.getHighlighted()) { 
    this.setHighlighted(this.getSelectedTab() ||(this.getChildAt(0))); 
  } 
}; 
goog.ui.TabBar.prototype.listenToTabEvents_ = function() { 
  this.getHandler().listen(this, goog.ui.Component.EventType.SELECT, this.handleTabSelect).listen(this, goog.ui.Component.EventType.UNSELECT, this.handleTabUnselect).listen(this, goog.ui.Component.EventType.DISABLE, this.handleTabDisable).listen(this, goog.ui.Component.EventType.HIDE, this.handleTabHide); 
}; 
goog.ui.TabBar.getOrientationFromLocation = function(location) { 
  return location == goog.ui.TabBar.Location.START || location == goog.ui.TabBar.Location.END ? goog.ui.Container.Orientation.VERTICAL: goog.ui.Container.Orientation.HORIZONTAL; 
}; 
goog.ui.registry.setDecoratorByClassName(goog.ui.TabBarRenderer.CSS_CLASS, function() { 
  return new goog.ui.TabBar(); 
}); 
