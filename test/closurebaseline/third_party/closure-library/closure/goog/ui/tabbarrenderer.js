
goog.provide('goog.ui.TabBarRenderer'); 
goog.require('goog.dom.a11y.Role'); 
goog.require('goog.object'); 
goog.require('goog.ui.ContainerRenderer'); 
goog.ui.TabBarRenderer = function() { 
  goog.ui.ContainerRenderer.call(this); 
}; 
goog.inherits(goog.ui.TabBarRenderer, goog.ui.ContainerRenderer); 
goog.addSingletonGetter(goog.ui.TabBarRenderer); 
goog.ui.TabBarRenderer.CSS_CLASS = goog.getCssName('goog-tab-bar'); 
goog.ui.TabBarRenderer.prototype.getCssClass = function() { 
  return goog.ui.TabBarRenderer.CSS_CLASS; 
}; 
goog.ui.TabBarRenderer.prototype.getAriaRole = function() { 
  return goog.dom.a11y.Role.TAB_LIST; 
}; 
goog.ui.TabBarRenderer.prototype.setStateFromClassName = function(tabBar, className, baseClass) { 
  if(! this.locationByClass_) { 
    this.createLocationByClassMap_(); 
  } 
  var location = this.locationByClass_[className]; 
  if(location) { 
    tabBar.setLocation(location); 
  } else { 
    goog.ui.TabBarRenderer.superClass_.setStateFromClassName.call(this, tabBar, className, baseClass); 
  } 
}; 
goog.ui.TabBarRenderer.prototype.getClassNames = function(tabBar) { 
  var classNames = goog.ui.TabBarRenderer.superClass_.getClassNames.call(this, tabBar); 
  if(! this.classByLocation_) { 
    this.createClassByLocationMap_(); 
  } 
  classNames.push(this.classByLocation_[tabBar.getLocation()]); 
  return classNames; 
}; 
goog.ui.TabBarRenderer.prototype.createClassByLocationMap_ = function() { 
  var baseClass = this.getCssClass(); 
  this.classByLocation_ = goog.object.create(goog.ui.TabBar.Location.TOP, goog.getCssName(baseClass, 'top'), goog.ui.TabBar.Location.BOTTOM, goog.getCssName(baseClass, 'bottom'), goog.ui.TabBar.Location.START, goog.getCssName(baseClass, 'start'), goog.ui.TabBar.Location.END, goog.getCssName(baseClass, 'end')); 
}; 
goog.ui.TabBarRenderer.prototype.createLocationByClassMap_ = function() { 
  if(! this.classByLocation_) { 
    this.createClassByLocationMap_(); 
  } 
  this.locationByClass_ = goog.object.transpose(this.classByLocation_); 
}; 
