
goog.provide('goog.ui.editor.Bubble'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.dom.ViewportSizeMonitor'); 
goog.require('goog.editor.style'); 
goog.require('goog.events'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.positioning'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.PopupBase'); 
goog.require('goog.ui.PopupBase.EventType'); 
goog.require('goog.userAgent'); 
goog.ui.editor.Bubble = function(parent, zIndex) { 
  goog.base(this); 
  this.dom_ = new goog.dom.getDomHelper(parent); 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  this.viewPortSizeMonitor_ = new goog.dom.ViewportSizeMonitor(this.dom_.getWindow()); 
  this.panels_ = { }; 
  this.bubbleContainer_ = this.dom_.createDom(goog.dom.TagName.DIV, { 'className': goog.ui.editor.Bubble.BUBBLE_CLASSNAME }); 
  goog.style.showElement(this.bubbleContainer_, false); 
  goog.dom.appendChild(parent, this.bubbleContainer_); 
  goog.style.setStyle(this.bubbleContainer_, 'zIndex', zIndex); 
  this.bubbleContents_ = this.createBubbleDom(this.dom_, this.bubbleContainer_); 
  this.closeBox_ = this.dom_.createDom(goog.dom.TagName.DIV, { 
    'className': goog.getCssName('tr_bubble_closebox'), 
    'innerHTML': '&nbsp;' 
  }); 
  this.bubbleContents_.appendChild(this.closeBox_); 
  goog.editor.style.makeUnselectable(this.bubbleContainer_, this.eventHandler_); 
  this.popup_ = new goog.ui.PopupBase(this.bubbleContainer_); 
}; 
goog.inherits(goog.ui.editor.Bubble, goog.events.EventTarget); 
goog.ui.editor.Bubble.BUBBLE_CLASSNAME = goog.getCssName('tr_bubble'); 
goog.ui.editor.Bubble.prototype.createBubbleDom = function(dom, container) { 
  return container; 
}; 
goog.ui.editor.Bubble.prototype.logger = goog.debug.Logger.getLogger('goog.ui.editor.Bubble'); 
goog.ui.editor.Bubble.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  goog.dom.removeNode(this.bubbleContainer_); 
  this.bubbleContainer_ = null; 
  this.eventHandler_.dispose(); 
  this.eventHandler_ = null; 
  this.viewPortSizeMonitor_.dispose(); 
  this.viewPortSizeMonitor_ = null; 
}; 
goog.ui.editor.Bubble.prototype.getContentElement = function() { 
  return this.bubbleContents_; 
}; 
goog.ui.editor.Bubble.prototype.getContainerElement = function() { 
  return this.bubbleContainer_; 
}; 
goog.ui.editor.Bubble.prototype.getEventHandler = function() { 
  return this.eventHandler_; 
}; 
goog.ui.editor.Bubble.prototype.handleWindowResize_ = function() { 
  if(this.isVisible()) { 
    this.reposition(); 
  } 
}; 
goog.ui.editor.Bubble.prototype.hasPanelOfType = function(type) { 
  return goog.object.some(this.panels_, function(panel) { 
    return panel.type == type; 
  }); 
}; 
goog.ui.editor.Bubble.prototype.addPanel = function(type, title, targetElement, contentFn, opt_preferTopPosition) { 
  var id = goog.string.createUniqueString(); 
  var panel = new goog.ui.editor.Bubble.Panel_(this.dom_, id, type, title, targetElement, ! opt_preferTopPosition); 
  this.panels_[id]= panel; 
  var nextElement; 
  for(var i = 0, len = this.bubbleContents_.childNodes.length - 1; i < len; i ++) { 
    var otherChild = this.bubbleContents_.childNodes[i]; 
    var otherPanel = this.panels_[otherChild.id]; 
    if(otherPanel.type > type) { 
      nextElement = otherChild; 
      break; 
    } 
  } 
  goog.dom.insertSiblingBefore(panel.element, nextElement || this.bubbleContents_.lastChild); 
  contentFn(panel.getContentElement()); 
  goog.editor.style.makeUnselectable(panel.element, this.eventHandler_); 
  var numPanels = goog.object.getCount(this.panels_); 
  if(numPanels == 1) { 
    this.openBubble_(); 
  } else if(numPanels == 2) { 
    goog.dom.classes.add(this.bubbleContainer_, goog.getCssName('tr_multi_bubble')); 
  } 
  this.reposition(); 
  return id; 
}; 
goog.ui.editor.Bubble.prototype.removePanel = function(id) { 
  var panel = this.panels_[id]; 
  goog.dom.removeNode(panel.element); 
  delete this.panels_[id]; 
  var numPanels = goog.object.getCount(this.panels_); 
  if(numPanels <= 1) { 
    goog.dom.classes.remove(this.bubbleContainer_, goog.getCssName('tr_multi_bubble')); 
  } 
  if(numPanels == 0) { 
    this.closeBubble_(); 
  } else { 
    this.reposition(); 
  } 
}; 
goog.ui.editor.Bubble.prototype.openBubble_ = function() { 
  this.eventHandler_.listen(this.closeBox_, goog.events.EventType.CLICK, this.closeBubble_).listen(this.viewPortSizeMonitor_, goog.events.EventType.RESIZE, this.handleWindowResize_).listen(this.popup_, goog.ui.PopupBase.EventType.HIDE, this.handlePopupHide); 
  this.popup_.setVisible(true); 
  this.reposition(); 
}; 
goog.ui.editor.Bubble.prototype.closeBubble_ = function() { 
  this.popup_.setVisible(false); 
}; 
goog.ui.editor.Bubble.prototype.handlePopupHide = function() { 
  for(var panelId in this.panels_) { 
    goog.dom.removeNode(this.panels_[panelId].element); 
  } 
  this.panels_ = { }; 
  goog.dom.classes.remove(this.bubbleContainer_, goog.getCssName('tr_multi_bubble')); 
  this.eventHandler_.removeAll(); 
  this.dispatchEvent(goog.ui.Component.EventType.HIDE); 
}; 
goog.ui.editor.Bubble.prototype.isVisible = function() { 
  return this.popup_.isVisible(); 
}; 
goog.ui.editor.Bubble.VERTICAL_CLEARANCE_ = goog.userAgent.IE ? 4: 2; 
goog.ui.editor.Bubble.MARGIN_BOX_ = new goog.math.Box(goog.ui.editor.Bubble.VERTICAL_CLEARANCE_, 0, goog.ui.editor.Bubble.VERTICAL_CLEARANCE_, 0); 
goog.ui.editor.Bubble.prototype.reposition = function() { 
  var targetElement = null; 
  var preferBottomPosition = true; 
  for(var panelId in this.panels_) { 
    var panel = this.panels_[panelId]; 
    targetElement = panel.targetElement; 
    preferBottomPosition = preferBottomPosition && panel.preferBottomPosition; 
  } 
  var status = goog.positioning.OverflowStatus.FAILED; 
  var reverseLayout =(goog.style.isRightToLeft(this.bubbleContainer_) != goog.style.isRightToLeft(targetElement)); 
  if(preferBottomPosition) { 
    status = this.positionAtAnchor_(reverseLayout ? goog.positioning.Corner.BOTTOM_END: goog.positioning.Corner.BOTTOM_START, goog.positioning.Corner.TOP_START, goog.positioning.Overflow.ADJUST_X | goog.positioning.Overflow.FAIL_Y); 
  } 
  if(status & goog.positioning.OverflowStatus.FAILED) { 
    status = this.positionAtAnchor_(reverseLayout ? goog.positioning.Corner.TOP_END: goog.positioning.Corner.TOP_START, goog.positioning.Corner.BOTTOM_START, goog.positioning.Overflow.ADJUST_X | goog.positioning.Overflow.FAIL_Y); 
  } 
  if(status & goog.positioning.OverflowStatus.FAILED) { 
    status = this.positionAtAnchor_(reverseLayout ? goog.positioning.Corner.BOTTOM_END: goog.positioning.Corner.BOTTOM_START, goog.positioning.Corner.TOP_START, goog.positioning.Overflow.ADJUST_X | goog.positioning.Overflow.ADJUST_Y); 
    if(status & goog.positioning.OverflowStatus.FAILED) { 
      this.logger.warning('reposition(): positionAtAnchor() failed with ' + status); 
    } 
  } 
}; 
goog.ui.editor.Bubble.prototype.positionAtAnchor_ = function(targetCorner, bubbleCorner, overflow) { 
  var targetElement = null; 
  for(var panelId in this.panels_) { 
    var candidate = this.panels_[panelId].targetElement; 
    if(! targetElement || goog.dom.contains(candidate, targetElement)) { 
      targetElement = this.panels_[panelId].targetElement; 
    } 
  } 
  return goog.positioning.positionAtAnchor(targetElement, targetCorner, this.bubbleContainer_, bubbleCorner, null, goog.ui.editor.Bubble.MARGIN_BOX_, overflow); 
}; 
goog.ui.editor.Bubble.Panel_ = function(dom, id, type, title, targetElement, preferBottomPosition) { 
  this.type = type; 
  this.targetElement = targetElement; 
  this.preferBottomPosition = preferBottomPosition; 
  this.element = dom.createDom(goog.dom.TagName.DIV, { 
    className: goog.getCssName('tr_bubble_panel'), 
    id: id 
  }, dom.createDom(goog.dom.TagName.DIV, { className: goog.getCssName('tr_bubble_panel_title') }, title + ':'), dom.createDom(goog.dom.TagName.DIV, { className: goog.getCssName('tr_bubble_panel_content') })); 
}; 
goog.ui.editor.Bubble.Panel_.prototype.getContentElement = function() { 
  return(this.element.lastChild); 
}; 
