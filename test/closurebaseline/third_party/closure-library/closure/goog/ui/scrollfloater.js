
goog.provide('goog.ui.ScrollFloater'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.EventType'); 
goog.require('goog.object'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.userAgent'); 
goog.ui.ScrollFloater = function(opt_parentElement, opt_domHelper) { 
  var domHelper = opt_parentElement ? goog.dom.getDomHelper(opt_parentElement): opt_domHelper; 
  goog.ui.Component.call(this, domHelper); 
  this.parentElement_ = opt_parentElement || this.getDomHelper().getDocument().body; 
  this.originalStyles_ = { }; 
}; 
goog.inherits(goog.ui.ScrollFloater, goog.ui.Component); 
goog.ui.ScrollFloater.prototype.placeholder_; 
goog.ui.ScrollFloater.prototype.scrollingEnabled_ = true; 
goog.ui.ScrollFloater.prototype.floating_ = false; 
goog.ui.ScrollFloater.prototype.originalOffset_; 
goog.ui.ScrollFloater.STORED_STYLE_PROPS_ =['position', 'top', 'left', 'width', 'cssFloat']; 
goog.ui.ScrollFloater.PLACEHOLDER_STYLE_PROPS_ =['position', 'top', 'left', 'display', 'cssFloat', 'marginTop', 'marginLeft', 'marginRight', 'marginBottom']; 
goog.ui.ScrollFloater.CSS_CLASS_ = goog.getCssName('goog-scrollfloater'); 
goog.ui.ScrollFloater.prototype.createDom = function() { 
  goog.ui.ScrollFloater.superClass_.createDom.call(this); 
  this.decorateInternal(this.getElement()); 
}; 
goog.ui.ScrollFloater.prototype.decorateInternal = function(element) { 
  goog.ui.ScrollFloater.superClass_.decorateInternal.call(this, element); 
  goog.dom.classes.add(element, goog.ui.ScrollFloater.CSS_CLASS_); 
}; 
goog.ui.ScrollFloater.prototype.enterDocument = function() { 
  goog.ui.ScrollFloater.superClass_.enterDocument.call(this); 
  if(! this.placeholder_) { 
    this.placeholder_ = this.getDomHelper().createDom('div', { 'style': 'visibility:hidden' }); 
  } 
  this.originalOffset_ = goog.style.getPageOffsetTop(this.getElement()); 
  this.setScrollingEnabled(this.scrollingEnabled_); 
  this.getHandler().listen(window, goog.events.EventType.SCROLL, this.update_); 
  this.getHandler().listen(window, goog.events.EventType.RESIZE, this.handleResize_); 
}; 
goog.ui.ScrollFloater.prototype.disposeInternal = function() { 
  goog.ui.ScrollFloater.superClass_.disposeInternal.call(this); 
  delete this.placeholder_; 
}; 
goog.ui.ScrollFloater.prototype.setScrollingEnabled = function(enable) { 
  this.scrollingEnabled_ = enable; 
  if(enable) { 
    this.applyIeBgHack_(); 
    this.update_(); 
  } else { 
    this.stopFloating_(); 
  } 
}; 
goog.ui.ScrollFloater.prototype.isScrollingEnabled = function() { 
  return this.scrollingEnabled_; 
}; 
goog.ui.ScrollFloater.prototype.isFloating = function() { 
  return this.floating_; 
}; 
goog.ui.ScrollFloater.prototype.update_ = function(opt_e) { 
  if(this.scrollingEnabled_) { 
    var doc = this.getDomHelper().getDocument(); 
    var currentScrollTop = this.getDomHelper().getDocumentScroll().y; 
    if(currentScrollTop > this.originalOffset_) { 
      this.startFloating_(); 
    } else { 
      this.stopFloating_(); 
    } 
  } 
}; 
goog.ui.ScrollFloater.prototype.startFloating_ = function() { 
  if(this.floating_) { 
    return; 
  } 
  var elem = this.getElement(); 
  var doc = this.getDomHelper().getDocument(); 
  var originalLeft_ = goog.style.getPageOffsetLeft(elem); 
  var originalWidth_ = goog.style.getContentBoxSize(elem).width; 
  this.originalStyles_ = { }; 
  goog.object.forEach(goog.ui.ScrollFloater.STORED_STYLE_PROPS_, function(property) { 
    this.originalStyles_[property]= elem.style[property]; 
  }, this); 
  goog.object.forEach(goog.ui.ScrollFloater.PLACEHOLDER_STYLE_PROPS_, function(property) { 
    this.placeholder_.style[property]= elem.style[property]|| goog.style.getCascadedStyle(elem, property) || goog.style.getComputedStyle(elem, property); 
  }, this); 
  goog.style.setSize(this.placeholder_, elem.offsetWidth, elem.offsetHeight); 
  goog.style.setStyle(elem, { 
    'left': originalLeft_ + 'px', 
    'width': originalWidth_ + 'px', 
    'cssFloat': 'none' 
  }); 
  elem.parentNode.replaceChild(this.placeholder_, elem); 
  this.parentElement_.appendChild(elem); 
  if(this.needsIePositionHack_()) { 
    elem.style.position = 'absolute'; 
    elem.style.setExpression('top', 'document.compatMode=="CSS1Compat"?' + 'documentElement.scrollTop:document.body.scrollTop'); 
  } else { 
    elem.style.position = 'fixed'; 
    elem.style.top = '0'; 
  } 
  this.floating_ = true; 
}; 
goog.ui.ScrollFloater.prototype.stopFloating_ = function() { 
  if(this.floating_) { 
    var elem = this.getElement(); 
    for(var prop in this.originalStyles_) { 
      elem.style[prop]= this.originalStyles_[prop]; 
    } 
    if(this.needsIePositionHack_()) { 
      elem.style.removeExpression('top'); 
    } 
    this.placeholder_.parentNode.replaceChild(elem, this.placeholder_); 
    this.floating_ = false; 
  } 
}; 
goog.ui.ScrollFloater.prototype.handleResize_ = function() { 
  this.stopFloating_(); 
  this.originalOffset_ = goog.style.getPageOffsetTop(this.getElement()); 
  this.update_(); 
}; 
goog.ui.ScrollFloater.prototype.needsIePositionHack_ = function() { 
  return goog.userAgent.IE && !(goog.userAgent.isVersion('7') && this.getDomHelper().isCss1CompatMode()); 
}; 
goog.ui.ScrollFloater.prototype.applyIeBgHack_ = function() { 
  if(this.needsIePositionHack_()) { 
    var doc = this.getDomHelper().getDocument(); 
    var topLevelElement = goog.style.getClientViewportElement(doc); 
    if(topLevelElement.currentStyle.backgroundImage == 'none') { 
      topLevelElement.style.backgroundImage = this.getDomHelper().getWindow().location.protocol == 'https:' ? 'url(https:///)': 'url(about:blank)'; 
      topLevelElement.style.backgroundAttachment = 'fixed'; 
    } 
  } 
}; 
