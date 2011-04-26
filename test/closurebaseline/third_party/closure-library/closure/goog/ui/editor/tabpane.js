
goog.provide('goog.ui.editor.TabPane'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Control'); 
goog.require('goog.ui.Tab'); 
goog.require('goog.ui.TabBar'); 
goog.ui.editor.TabPane = function(dom, opt_caption) { 
  goog.base(this, dom); 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  this.tabBar_ = new goog.ui.TabBar(goog.ui.TabBar.Location.START, undefined, this.dom_); 
  this.tabBar_.setFocusable(false); 
  this.tabContent_ = this.dom_.createDom(goog.dom.TagName.DIV, { className: goog.getCssName('goog-tab-content') }); 
  this.selectedRadio_ = null; 
  this.visibleContent_ = null; 
  if(opt_caption) { 
    var captionControl = new goog.ui.Control(opt_caption, undefined, this.dom_); 
    captionControl.addClassName(goog.getCssName('tr-tabpane-caption')); 
    captionControl.setEnabled(false); 
    this.tabBar_.addChild(captionControl, true); 
  } 
}; 
goog.inherits(goog.ui.editor.TabPane, goog.ui.Component); 
goog.ui.editor.TabPane.prototype.getCurrentTabId = function() { 
  return this.tabBar_.getSelectedTab().getId(); 
}; 
goog.ui.editor.TabPane.prototype.setSelectedTabId = function(id) { 
  this.tabBar_.setSelectedTab(this.tabBar_.getChild(id)); 
}; 
goog.ui.editor.TabPane.prototype.addTab = function(id, caption, tooltip, content) { 
  var radio = this.dom_.createDom(goog.dom.TagName.INPUT, { type: 'radio' }); 
  var tab = new goog.ui.Tab([radio, this.dom_.createTextNode(caption)], undefined, this.dom_); 
  tab.setId(id); 
  tab.setTooltip(tooltip); 
  this.tabBar_.addChild(tab, true); 
  this.eventHandler_.listen(radio, goog.events.EventType.SELECT, goog.bind(this.tabBar_.setSelectedTab, this.tabBar_, tab)); 
  content.id = id + '-tab'; 
  this.tabContent_.appendChild(content); 
  goog.style.showElement(content, false); 
}; 
goog.ui.editor.TabPane.prototype.enterDocument = function() { 
  goog.base(this, 'enterDocument'); 
  var root = this.getElement(); 
  goog.dom.classes.add(root, goog.getCssName('tr-tabpane')); 
  this.addChild(this.tabBar_, true); 
  this.eventHandler_.listen(this.tabBar_, goog.ui.Component.EventType.SELECT, this.handleTabSelect_); 
  root.appendChild(this.tabContent_); 
  root.appendChild(this.dom_.createDom(goog.dom.TagName.DIV, { className: goog.getCssName('goog-tab-bar-clear') })); 
}; 
goog.ui.editor.TabPane.prototype.handleTabSelect_ = function(e) { 
  var tab =(e.target); 
  if(this.visibleContent_) { 
    goog.style.showElement(this.visibleContent_, false); 
  } 
  this.visibleContent_ = this.dom_.getElement(tab.getId() + '-tab'); 
  goog.style.showElement(this.visibleContent_, true); 
  if(this.selectedRadio_) { 
    this.selectedRadio_.checked = false; 
  } 
  this.selectedRadio_ = tab.getElement().getElementsByTagName(goog.dom.TagName.INPUT)[0]; 
  this.selectedRadio_.checked = true; 
}; 
