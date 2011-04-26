
goog.provide('goog.ui.Menu'); 
goog.provide('goog.ui.Menu.EventType'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.Container'); 
goog.require('goog.ui.Container.Orientation'); 
goog.require('goog.ui.MenuHeader'); 
goog.require('goog.ui.MenuItem'); 
goog.require('goog.ui.MenuRenderer'); 
goog.require('goog.ui.MenuSeparator'); 
goog.ui.Menu = function(opt_domHelper, opt_renderer) { 
  goog.ui.Container.call(this, goog.ui.Container.Orientation.VERTICAL, opt_renderer || goog.ui.MenuRenderer.getInstance(), opt_domHelper); 
  this.setFocusable(false); 
}; 
goog.inherits(goog.ui.Menu, goog.ui.Container); 
goog.ui.Menu.EventType = { 
  BEFORE_SHOW: goog.ui.Component.EventType.BEFORE_SHOW, 
  SHOW: goog.ui.Component.EventType.SHOW, 
  BEFORE_HIDE: goog.ui.Component.EventType.HIDE, 
  HIDE: goog.ui.Component.EventType.HIDE 
}; 
goog.ui.Menu.CSS_CLASS = goog.ui.MenuRenderer.CSS_CLASS; 
goog.ui.Menu.prototype.openingCoords; 
goog.ui.Menu.prototype.allowAutoFocus_ = true; 
goog.ui.Menu.prototype.allowHighlightDisabled_ = false; 
goog.ui.Menu.prototype.getCssClass = function() { 
  return this.getRenderer().getCssClass(); 
}; 
goog.ui.Menu.prototype.containsElement = function(element) { 
  if(this.getRenderer().containsElement(this, element)) { 
    return true; 
  } 
  for(var i = 0, count = this.getChildCount(); i < count; i ++) { 
    var child = this.getChildAt(i); 
    if(typeof child.containsElement == 'function' && child.containsElement(element)) { 
      return true; 
    } 
  } 
  return false; 
}; 
goog.ui.Menu.prototype.addItem = function(item) { 
  this.addChild(item, true); 
}; 
goog.ui.Menu.prototype.addItemAt = function(item, n) { 
  this.addChildAt(item, n, true); 
}; 
goog.ui.Menu.prototype.removeItem = function(item) { 
  var removedChild = this.removeChild(item, true); 
  if(removedChild) { 
    removedChild.dispose(); 
  } 
}; 
goog.ui.Menu.prototype.removeItemAt = function(n) { 
  var removedChild = this.removeChildAt(n, true); 
  if(removedChild) { 
    removedChild.dispose(); 
  } 
}; 
goog.ui.Menu.prototype.getItemAt = function(n) { 
  return(this.getChildAt(n)); 
}; 
goog.ui.Menu.prototype.getItemCount = function() { 
  return this.getChildCount(); 
}; 
goog.ui.Menu.prototype.getItems = function() { 
  var children =[]; 
  this.forEachChild(function(child) { 
    children.push(child); 
  }); 
  return children; 
}; 
goog.ui.Menu.prototype.setPosition = function(x, opt_y) { 
  var visible = this.isVisible(); 
  if(! visible) { 
    goog.style.showElement(this.getElement(), true); 
  } 
  goog.style.setPageOffset(this.getElement(), x, opt_y); 
  if(! visible) { 
    goog.style.showElement(this.getElement(), false); 
  } 
}; 
goog.ui.Menu.prototype.getPosition = function() { 
  return this.isVisible() ? goog.style.getPageOffset(this.getElement()): null; 
}; 
goog.ui.Menu.prototype.setAllowAutoFocus = function(allow) { 
  this.allowAutoFocus_ = allow; 
  if(allow) { 
    this.setFocusable(true); 
  } 
}; 
goog.ui.Menu.prototype.getAllowAutoFocus = function() { 
  return this.allowAutoFocus_; 
}; 
goog.ui.Menu.prototype.setAllowHighlightDisabled = function(allow) { 
  this.allowHighlightDisabled_ = allow; 
}; 
goog.ui.Menu.prototype.getAllowHighlightDisabled = function() { 
  return this.allowHighlightDisabled_; 
}; 
goog.ui.Menu.prototype.setVisible = function(show, opt_force, opt_e) { 
  var visibilityChanged = goog.ui.Menu.superClass_.setVisible.call(this, show, opt_force); 
  if(visibilityChanged && show && this.isInDocument() && this.allowAutoFocus_) { 
    this.getKeyEventTarget().focus(); 
  } 
  if(show && opt_e && goog.isNumber(opt_e.clientX)) { 
    this.openingCoords = new goog.math.Coordinate(opt_e.clientX, opt_e.clientY); 
  } else { 
    this.openingCoords = null; 
  } 
  return visibilityChanged; 
}; 
goog.ui.Menu.prototype.handleEnterItem = function(e) { 
  if(this.allowAutoFocus_) { 
    this.getKeyEventTarget().focus(); 
  } 
  return goog.ui.Menu.superClass_.handleEnterItem.call(this, e); 
}; 
goog.ui.Menu.prototype.highlightNextPrefix = function(charStr) { 
  var re = new RegExp('^' + goog.string.regExpEscape(charStr), 'i'); 
  return this.highlightHelper(function(index, max) { 
    var start = index < 0 ? 0: index; 
    var wrapped = false; 
    do { 
      ++ index; 
      if(index == max) { 
        index = 0; 
        wrapped = true; 
      } 
      var name = this.getChildAt(index).getCaption(); 
      if(name && name.match(re)) { 
        return index; 
      } 
    } while(! wrapped || index != start); 
    return this.getHighlightedIndex(); 
  }, this.getHighlightedIndex()); 
}; 
goog.ui.Menu.prototype.canHighlightItem = function(item) { 
  return(this.allowHighlightDisabled_ || item.isEnabled()) && item.isVisible() && item.isSupportedState(goog.ui.Component.State.HOVER); 
}; 
goog.ui.Menu.prototype.decorateInternal = function(element) { 
  this.decorateContent(element); 
  goog.ui.Menu.superClass_.decorateInternal.call(this, element); 
}; 
goog.ui.Menu.prototype.decorateContent = function(element) { 
  var renderer = this.getRenderer(); 
  var contentElements = this.getDomHelper().getElementsByTagNameAndClass('div', goog.getCssName(renderer.getCssClass(), 'content'), element); 
  for(var el, i = 0; el = contentElements[i]; i ++) { 
    renderer.decorateChildren(this, el); 
  } 
}; 
