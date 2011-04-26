
goog.provide('goog.ui.TabPane'); 
goog.provide('goog.ui.TabPane.Events'); 
goog.provide('goog.ui.TabPane.TabLocation'); 
goog.provide('goog.ui.TabPane.TabPage'); 
goog.provide('goog.ui.TabPaneEvent'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.style'); 
goog.ui.TabPane = function(el, opt_tabLocation, opt_domHelper, opt_useMouseDown) { 
  goog.events.EventTarget.call(this); 
  this.dom_ = opt_domHelper || goog.dom.getDomHelper(); 
  this.el_ = el; 
  this.pages_ =[]; 
  this.tabLocation_ = opt_tabLocation ? opt_tabLocation: goog.ui.TabPane.TabLocation.TOP; 
  this.useMouseDown_ = ! ! opt_useMouseDown; 
  this.create_(); 
}; 
goog.inherits(goog.ui.TabPane, goog.events.EventTarget); 
goog.ui.TabPane.prototype.elButtonBar_; 
goog.ui.TabPane.prototype.elContent_; 
goog.ui.TabPane.prototype.selected_; 
goog.ui.TabPane.Events = { CHANGE: 'change' }; 
goog.ui.TabPane.TabLocation = { 
  TOP: 0, 
  BOTTOM: 1, 
  LEFT: 2, 
  RIGHT: 3 
}; 
goog.ui.TabPane.prototype.create_ = function() { 
  this.el_.className = goog.getCssName('goog-tabpane'); 
  var nodes = this.getChildNodes_(); 
  this.elButtonBar_ = this.dom_.createDom('ul', { 
    'className': goog.getCssName('goog-tabpane-tabs'), 
    'tabIndex': '0' 
  }); 
  this.elContent_ = this.dom_.createDom('div', goog.getCssName('goog-tabpane-cont')); 
  this.el_.appendChild(this.elContent_); 
  switch(this.tabLocation_) { 
    case goog.ui.TabPane.TabLocation.TOP: 
      this.el_.insertBefore(this.elButtonBar_, this.elContent_); 
      this.el_.insertBefore(this.createClear_(), this.elContent_); 
      goog.dom.classes.add(this.el_, goog.getCssName('goog-tabpane-top')); 
      break; 

    case goog.ui.TabPane.TabLocation.BOTTOM: 
      this.el_.appendChild(this.elButtonBar_); 
      this.el_.appendChild(this.createClear_()); 
      goog.dom.classes.add(this.el_, goog.getCssName('goog-tabpane-bottom')); 
      break; 

    case goog.ui.TabPane.TabLocation.LEFT: 
      this.el_.insertBefore(this.elButtonBar_, this.elContent_); 
      goog.dom.classes.add(this.el_, goog.getCssName('goog-tabpane-left')); 
      break; 

    case goog.ui.TabPane.TabLocation.RIGHT: 
      this.el_.insertBefore(this.elButtonBar_, this.elContent_); 
      goog.dom.classes.add(this.el_, goog.getCssName('goog-tabpane-right')); 
      break; 

    default: 
      throw Error('Invalid tab location'); 

  } 
  this.elButtonBar_.tabIndex = 0; 
  goog.events.listen(this.elButtonBar_, this.useMouseDown_ ? goog.events.EventType.MOUSEDOWN: goog.events.EventType.CLICK, this.onHeaderClick_, false, this); 
  goog.events.listen(this.elButtonBar_, goog.events.EventType.KEYDOWN, this.onHeaderKeyDown_, false, this); 
  this.createPages_(nodes); 
}; 
goog.ui.TabPane.prototype.createClear_ = function() { 
  var clearFloatStyle = '.' + goog.getCssName('goog-tabpane-clear') + ' { clear: both; height: 0px; overflow: hidden }'; 
  goog.style.installStyles(clearFloatStyle); 
  return this.dom_.createDom('div', goog.getCssName('goog-tabpane-clear')); 
}; 
goog.ui.TabPane.prototype.disposeInternal = function() { 
  goog.ui.TabPane.superClass_.disposeInternal.call(this); 
  goog.events.unlisten(this.elButtonBar_, this.useMouseDown_ ? goog.events.EventType.MOUSEDOWN: goog.events.EventType.CLICK, this.onHeaderClick_, false, this); 
  goog.events.unlisten(this.elButtonBar_, goog.events.EventType.KEYDOWN, this.onHeaderKeyDown_, false, this); 
  delete this.el_; 
  this.elButtonBar_ = null; 
  this.elContent_ = null; 
}; 
goog.ui.TabPane.prototype.getChildNodes_ = function() { 
  var nodes =[]; 
  var child = goog.dom.getFirstElementChild(this.el_); 
  while(child) { 
    nodes.push(child); 
    child = goog.dom.getNextElementSibling(child); 
  } 
  return nodes; 
}; 
goog.ui.TabPane.prototype.createPages_ = function(nodes) { 
  for(var node, i = 0; node = nodes[i]; i ++) { 
    this.addPage(new goog.ui.TabPane.TabPage(node)); 
  } 
}; 
goog.ui.TabPane.prototype.addPage = function(page, opt_index) { 
  if(page.parent_ && page.parent_ != this && page.parent_ instanceof goog.ui.TabPane) { 
    page.parent_.removePage(page); 
  } 
  var index = this.pages_.length; 
  if(goog.isDef(opt_index) && opt_index != index) { 
    index = opt_index; 
    this.pages_.splice(index, 0, page); 
    this.elButtonBar_.insertBefore(page.elTitle_, this.elButtonBar_.childNodes[index]); 
  } else { 
    this.pages_.push(page); 
    this.elButtonBar_.appendChild(page.elTitle_); 
  } 
  page.setParent_(this, index); 
  if(! this.selected_) { 
    this.selected_ = page; 
    this.dispatchEvent(new goog.ui.TabPaneEvent(goog.ui.TabPane.Events.CHANGE, this, this.selected_)); 
  } 
  this.elContent_.appendChild(page.elContent_); 
  page.setVisible_(page == this.selected_); 
  for(var pg, i = index + 1; pg = this.pages_[i]; i ++) { 
    pg.index_ = i; 
  } 
}; 
goog.ui.TabPane.prototype.removePage = function(page) { 
  if(goog.isNumber(page)) { 
    page = this.pages_[page]; 
  } 
  this.pages_.splice(page.index_, 1); 
  page.setParent_(null); 
  goog.dom.removeNode(page.elTitle_); 
  goog.dom.removeNode(page.elContent_); 
  for(var pg, i = 0; pg = this.pages_[i]; i ++) { 
    pg.setParent_(this, i); 
  } 
}; 
goog.ui.TabPane.prototype.getPage = function(index) { 
  return this.pages_[index]; 
}; 
goog.ui.TabPane.prototype.setSelectedPage = function(page) { 
  if(page.isEnabled() &&(! this.selected_ || page != this.selected_)) { 
    this.selected_.setVisible_(false); 
    page.setVisible_(true); 
    this.selected_ = page; 
    this.dispatchEvent(new goog.ui.TabPaneEvent(goog.ui.TabPane.Events.CHANGE, this, this.selected_)); 
  } 
}; 
goog.ui.TabPane.prototype.setSelectedIndex = function(index) { 
  if(index >= 0 && index < this.pages_.length) { 
    this.setSelectedPage(this.pages_[index]); 
  } 
}; 
goog.ui.TabPane.prototype.getSelectedIndex = function() { 
  return this.selected_ ?(this.selected_.index_): - 1; 
}; 
goog.ui.TabPane.prototype.getSelectedPage = function() { 
  return this.selected_ || null; 
}; 
goog.ui.TabPane.prototype.getContentElement = function() { 
  return this.elContent_ || null; 
}; 
goog.ui.TabPane.prototype.getElement = function() { 
  return this.el_ || null; 
}; 
goog.ui.TabPane.prototype.onHeaderClick_ = function(event) { 
  var el = event.target; 
  while(el != this.elButtonBar_) { 
    if(el.tagName == 'LI') { 
      var i; 
      for(i = 0; el = el.previousSibling; i ++) { } 
      this.setSelectedIndex(i); 
      break; 
    } 
    el = el.parentNode; 
  } 
  event.preventDefault(); 
}; 
goog.ui.TabPane.prototype.onHeaderKeyDown_ = function(event) { 
  if(event.altKey || event.metaKey || event.ctrlKey) { 
    return; 
  } 
  switch(event.keyCode) { 
    case goog.events.KeyCodes.LEFT: 
      var index = this.selected_.getIndex() - 1; 
      this.setSelectedIndex(index < 0 ? this.pages_.length - 1: index); 
      break; 

    case goog.events.KeyCodes.RIGHT: 
      var index = this.selected_.getIndex() + 1; 
      this.setSelectedIndex(index >= this.pages_.length ? 0: index); 
      break; 

    case goog.events.KeyCodes.HOME: 
      this.setSelectedIndex(0); 
      break; 

    case goog.events.KeyCodes.END: 
      this.setSelectedIndex(this.pages_.length - 1); 
      break; 

  } 
}; 
goog.ui.TabPane.TabPage = function(opt_el, opt_title, opt_domHelper) { 
  var title, el; 
  if(goog.isString(opt_el) && ! goog.isDef(opt_title)) { 
    title = opt_el; 
  } else if(opt_title) { 
    title = opt_title; 
    el = opt_el; 
  } else if(opt_el) { 
    var child = goog.dom.getFirstElementChild(opt_el); 
    if(child) { 
      title = goog.dom.getTextContent(child); 
      child.parentNode.removeChild(child); 
    } 
    el = opt_el; 
  } 
  this.dom_ = opt_domHelper || goog.dom.getDomHelper(); 
  this.elContent_ = el || this.dom_.createDom('div'); 
  this.elTitle_ = this.dom_.createDom('li', null, title); 
  this.parent_ = null; 
  this.index_ = null; 
  this.enabled_ = true; 
}; 
goog.ui.TabPane.TabPage.prototype.getTitle = function() { 
  return goog.dom.getTextContent(this.elTitle_); 
}; 
goog.ui.TabPane.TabPage.prototype.setTitle = function(title) { 
  goog.dom.setTextContent(this.elTitle_, title); 
}; 
goog.ui.TabPane.TabPage.prototype.getTitleElement = function() { 
  return this.elTitle_; 
}; 
goog.ui.TabPane.TabPage.prototype.getContentElement = function() { 
  return this.elContent_; 
}; 
goog.ui.TabPane.TabPage.prototype.getIndex = function() { 
  return this.index_; 
}; 
goog.ui.TabPane.TabPage.prototype.getParent = function() { 
  return this.parent_; 
}; 
goog.ui.TabPane.TabPage.prototype.select = function() { 
  if(this.parent_) { 
    this.parent_.setSelectedPage(this); 
  } 
}; 
goog.ui.TabPane.TabPage.prototype.setEnabled = function(enabled) { 
  this.enabled_ = enabled; 
  this.elTitle_.className = enabled ? goog.getCssName('goog-tabpane-tab'): goog.getCssName('goog-tabpane-tab-disabled'); 
}; 
goog.ui.TabPane.TabPage.prototype.isEnabled = function() { 
  return this.enabled_; 
}; 
goog.ui.TabPane.TabPage.prototype.setVisible_ = function(visible) { 
  if(this.isEnabled()) { 
    this.elContent_.style.display = visible ? '': 'none'; 
    this.elTitle_.className = visible ? goog.getCssName('goog-tabpane-tab-selected'): goog.getCssName('goog-tabpane-tab'); 
  } 
}; 
goog.ui.TabPane.TabPage.prototype.setParent_ = function(tabPane, opt_index) { 
  this.parent_ = tabPane; 
  this.index_ = goog.isDef(opt_index) ? opt_index: null; 
}; 
goog.ui.TabPaneEvent = function(type, target, page) { 
  goog.events.Event.call(this, type, target); 
  this.page = page; 
}; 
goog.inherits(goog.ui.TabPaneEvent, goog.events.Event); 
