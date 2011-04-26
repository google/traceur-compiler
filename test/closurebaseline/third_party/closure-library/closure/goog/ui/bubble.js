
goog.provide('goog.ui.Bubble'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventType'); 
goog.require('goog.math.Box'); 
goog.require('goog.positioning'); 
goog.require('goog.positioning.AbsolutePosition'); 
goog.require('goog.positioning.AbstractPosition'); 
goog.require('goog.positioning.AnchoredPosition'); 
goog.require('goog.positioning.Corner'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Popup'); 
goog.require('goog.ui.Popup.AnchoredPosition'); 
goog.ui.Bubble = function(message, opt_config, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.message_ = message; 
  this.popup_ = new goog.ui.Popup(); 
  this.config_ = opt_config || goog.ui.Bubble.defaultConfig; 
  this.closeButtonId_ = this.makeId('cb'); 
  this.messageId_ = this.makeId('mi'); 
}; 
goog.inherits(goog.ui.Bubble, goog.ui.Component); 
goog.ui.Bubble.prototype.timeout_ = null; 
goog.ui.Bubble.prototype.timerId_ = 0; 
goog.ui.Bubble.prototype.listener_ = null; 
goog.ui.Bubble.prototype.anchor_ = null; 
goog.ui.Bubble.prototype.createDom = function() { 
  goog.ui.Bubble.superClass_.createDom.call(this); 
  var element = this.getElement(); 
  element.style.position = 'absolute'; 
  element.style.visibility = 'hidden'; 
  this.popup_.setElement(element); 
}; 
goog.ui.Bubble.prototype.attach = function(anchorElement) { 
  this.setAnchoredPosition_(anchorElement, this.computePinnedCorner_(anchorElement)); 
}; 
goog.ui.Bubble.prototype.setPinnedCorner = function(corner) { 
  this.popup_.setPinnedCorner(corner); 
}; 
goog.ui.Bubble.prototype.setPosition = function(position) { 
  if(position instanceof goog.positioning.AbsolutePosition) { 
    this.popup_.setPosition(position); 
  } else if(position instanceof goog.positioning.AnchoredPosition) { 
    this.setAnchoredPosition_(position.element, position.corner); 
  } else { 
    throw Error('Bubble only supports absolute and anchored positions!'); 
  } 
}; 
goog.ui.Bubble.prototype.setTimeout = function(timeout) { 
  this.timeout_ = timeout; 
}; 
goog.ui.Bubble.prototype.setAutoHide = function(autoHide) { 
  this.popup_.setAutoHide(autoHide); 
}; 
goog.ui.Bubble.prototype.setVisible = function(visible) { 
  if(visible && ! this.popup_.isVisible()) { 
    this.configureElement_(); 
  } 
  this.popup_.setVisible(visible); 
  if(! this.popup_.isVisible()) { 
    this.unconfigureElement_(); 
  } 
}; 
goog.ui.Bubble.prototype.isVisible = function() { 
  return this.popup_.isVisible(); 
}; 
goog.ui.Bubble.prototype.disposeInternal = function() { 
  this.unconfigureElement_(); 
  this.popup_.dispose(); 
  this.popup_ = null; 
  goog.ui.Bubble.superClass_.disposeInternal.call(this); 
}; 
goog.ui.Bubble.prototype.configureElement_ = function() { 
  if(! this.isInDocument()) { 
    throw Error('You must render the bubble before showing it!'); 
  } 
  var element = this.getElement(); 
  var corner = this.popup_.getPinnedCorner(); 
  element.innerHTML = this.computeHtmlForCorner_(corner); 
  if(typeof this.message_ == 'object') { 
    var messageDiv = this.getDomHelper().getElement(this.messageId_); 
    this.getDomHelper().appendChild(messageDiv, this.message_); 
  } 
  var closeButton = this.getDomHelper().getElement(this.closeButtonId_); 
  this.listener_ = goog.events.listen(closeButton, goog.events.EventType.CLICK, this.hideBubble_, false, this); 
  if(this.timeout_) { 
    this.timerId_ = goog.Timer.callOnce(this.hideBubble_, this.timeout_, this); 
  } 
}; 
goog.ui.Bubble.prototype.unconfigureElement_ = function() { 
  if(this.listener_) { 
    goog.events.unlistenByKey(this.listener_); 
    this.listener_ = null; 
  } 
  if(this.timerId_) { 
    goog.Timer.clear(this.timerId_); 
    this.timerId = null; 
  } 
  var element = this.getElement(); 
  if(element) { 
    this.getDomHelper().removeChildren(element); 
    element.innerHTML = ''; 
  } 
}; 
goog.ui.Bubble.prototype.setAnchoredPosition_ = function(anchorElement, corner) { 
  this.popup_.setPinnedCorner(corner); 
  var margin = this.createMarginForCorner_(corner); 
  this.popup_.setMargin(margin); 
  var anchorCorner = goog.positioning.flipCorner(corner); 
  this.popup_.setPosition(new goog.positioning.AnchoredPosition(anchorElement, anchorCorner)); 
}; 
goog.ui.Bubble.prototype.hideBubble_ = function() { 
  this.setVisible(false); 
}; 
goog.ui.Bubble.prototype.getComputedAnchoredPosition = function(anchorElement) { 
  return new goog.ui.Popup.AnchoredPosition(anchorElement, this.computePinnedCorner_(anchorElement)); 
}; 
goog.ui.Bubble.prototype.computePinnedCorner_ = function(anchorElement) { 
  var doc = this.getDomHelper().getOwnerDocument(anchorElement); 
  var viewportElement = goog.style.getClientViewportElement(doc); 
  var viewportWidth = viewportElement.offsetWidth; 
  var viewportHeight = viewportElement.offsetHeight; 
  var anchorElementOffset = goog.style.getPageOffset(anchorElement); 
  var anchorElementSize = goog.style.getSize(anchorElement); 
  var anchorType = 0; 
  if(viewportWidth - anchorElementOffset.x - anchorElementSize.width > anchorElementOffset.x) { 
    anchorType += 1; 
  } 
  if(viewportHeight - anchorElementOffset.y - anchorElementSize.height > anchorElementOffset.y) { 
    anchorType += 2; 
  } 
  return goog.ui.Bubble.corners_[anchorType]; 
}; 
goog.ui.Bubble.prototype.createMarginForCorner_ = function(corner) { 
  var margin = new goog.math.Box(0, 0, 0, 0); 
  if(corner & goog.positioning.CornerBit.RIGHT) { 
    margin.right -= this.config_.marginShift; 
  } else { 
    margin.left -= this.config_.marginShift; 
  } 
  return margin; 
}; 
goog.ui.Bubble.prototype.computeHtmlForCorner_ = function(corner) { 
  var bubbleTopClass; 
  var bubbleBottomClass; 
  switch(corner) { 
    case goog.positioning.Corner.TOP_LEFT: 
      bubbleTopClass = this.config_.cssBubbleTopLeftAnchor; 
      bubbleBottomClass = this.config_.cssBubbleBottomNoAnchor; 
      break; 

    case goog.positioning.Corner.TOP_RIGHT: 
      bubbleTopClass = this.config_.cssBubbleTopRightAnchor; 
      bubbleBottomClass = this.config_.cssBubbleBottomNoAnchor; 
      break; 

    case goog.positioning.Corner.BOTTOM_LEFT: 
      bubbleTopClass = this.config_.cssBubbleTopNoAnchor; 
      bubbleBottomClass = this.config_.cssBubbleBottomLeftAnchor; 
      break; 

    case goog.positioning.Corner.BOTTOM_RIGHT: 
      bubbleTopClass = this.config_.cssBubbleTopNoAnchor; 
      bubbleBottomClass = this.config_.cssBubbleBottomRightAnchor; 
      break; 

    default: 
      throw Error('This corner type is not supported by bubble!'); 

  } 
  var message = null; 
  if(typeof this.message_ == 'object') { 
    message = '<div id="' + this.messageId_ + '">'; 
  } else { 
    message = this.message_; 
  } 
  var html = '<table border=0 cellspacing=0 cellpadding=0 style="z-index:1"' + ' width=' + this.config_.bubbleWidth + '>' + '<tr><td colspan=4 class="' + bubbleTopClass + '">' + '<tr>' + '<td class="' + this.config_.cssBubbleLeft + '">' + '<td class="' + this.config_.cssBubbleFont + '"' + ' style="padding:0 4;background:white">' + message + '<td id="' + this.closeButtonId_ + '"' + ' class="' + this.config_.cssCloseButton + '"/>' + '<td class="' + this.config_.cssBubbleRight + '">' + '<tr>' + '<td colspan=4 class="' + bubbleBottomClass + '">' + '</table>'; 
  return html; 
}; 
goog.ui.Bubble.defaultConfig = { 
  bubbleWidth: 147, 
  marginShift: 60, 
  cssBubbleFont: goog.getCssName('goog-bubble-font'), 
  cssCloseButton: goog.getCssName('goog-bubble-close-button'), 
  cssBubbleTopRightAnchor: goog.getCssName('goog-bubble-top-right-anchor'), 
  cssBubbleTopLeftAnchor: goog.getCssName('goog-bubble-top-left-anchor'), 
  cssBubbleTopNoAnchor: goog.getCssName('goog-bubble-top-no-anchor'), 
  cssBubbleBottomRightAnchor: goog.getCssName('goog-bubble-bottom-right-anchor'), 
  cssBubbleBottomLeftAnchor: goog.getCssName('goog-bubble-bottom-left-anchor'), 
  cssBubbleBottomNoAnchor: goog.getCssName('goog-bubble-bottom-no-anchor'), 
  cssBubbleLeft: goog.getCssName('goog-bubble-left'), 
  cssBubbleRight: goog.getCssName('goog-bubble-right') 
}; 
goog.ui.Bubble.corners_ =[goog.positioning.Corner.BOTTOM_RIGHT, goog.positioning.Corner.BOTTOM_LEFT, goog.positioning.Corner.TOP_RIGHT, goog.positioning.Corner.TOP_LEFT]; 
