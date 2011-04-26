
goog.provide('goog.editor.plugins.AbstractBubblePlugin'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.Range'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.editor.style'); 
goog.require('goog.events'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.functions'); 
goog.require('goog.string.Unicode'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.editor.Bubble'); 
goog.require('goog.userAgent'); 
goog.editor.plugins.AbstractBubblePlugin = function() { 
  goog.base(this); 
  this.eventRegister = new goog.events.EventHandler(this); 
}; 
goog.inherits(goog.editor.plugins.AbstractBubblePlugin, goog.editor.Plugin); 
goog.editor.plugins.AbstractBubblePlugin.OPTION_LINK_CLASSNAME_ = goog.getCssName('tr_option-link'); 
goog.editor.plugins.AbstractBubblePlugin.LINK_CLASSNAME_ = goog.getCssName('tr_bubble_link'); 
goog.editor.plugins.AbstractBubblePlugin.DASH_NBSP_STRING = goog.string.Unicode.NBSP + '-' + goog.string.Unicode.NBSP; 
goog.editor.plugins.AbstractBubblePlugin.defaultBubbleFactory_ = function(parent, zIndex) { 
  return new goog.ui.editor.Bubble(parent, zIndex); 
}; 
goog.editor.plugins.AbstractBubblePlugin.bubbleFactory_ = goog.editor.plugins.AbstractBubblePlugin.defaultBubbleFactory_; 
goog.editor.plugins.AbstractBubblePlugin.setBubbleFactory = function(bubbleFactory) { 
  goog.editor.plugins.AbstractBubblePlugin.bubbleFactory_ = bubbleFactory; 
}; 
goog.editor.plugins.AbstractBubblePlugin.bubbleMap_ = { }; 
goog.editor.plugins.AbstractBubblePlugin.prototype.bubbleParent_; 
goog.editor.plugins.AbstractBubblePlugin.prototype.panelId_ = null; 
goog.editor.plugins.AbstractBubblePlugin.prototype.setBubbleParent = function(bubbleParent) { 
  this.bubbleParent_ = bubbleParent; 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.getBubbleDom = function() { 
  return this.dom_; 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.getTrogClassId = goog.functions.constant('AbstractBubblePlugin'); 
goog.editor.plugins.AbstractBubblePlugin.prototype.getTargetElement = function() { 
  return this.targetElement_; 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.handleKeyUp = function(e) { 
  if(this.isVisible()) { 
    this.handleSelectionChange(); 
  } 
  return false; 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.handleSelectionChange = function(opt_e, opt_target) { 
  var selectedElement; 
  if(opt_e) { 
    selectedElement =(opt_e.target); 
  } else if(opt_target) { 
    selectedElement =(opt_target); 
  } else { 
    var range = this.fieldObject.getRange(); 
    if(range) { 
      var startNode = range.getStartNode(); 
      var endNode = range.getEndNode(); 
      var startOffset = range.getStartOffset(); 
      var endOffset = range.getEndOffset(); 
      if(goog.userAgent.IE && range.isCollapsed() && startNode != endNode) { 
        range = goog.dom.Range.createCaret(startNode, startOffset); 
      } 
      if(startNode.nodeType == goog.dom.NodeType.ELEMENT && startNode == endNode && startOffset == endOffset - 1) { 
        var element = startNode.childNodes[startOffset]; 
        if(element.nodeType == goog.dom.NodeType.ELEMENT) { 
          selectedElement = element; 
        } 
      } 
    } 
    selectedElement = selectedElement || range && range.getContainerElement(); 
  } 
  return this.handleSelectionChangeInternal_(selectedElement); 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.handleSelectionChangeInternal_ = function(selectedElement) { 
  if(selectedElement) { 
    var bubbleTarget = this.getBubbleTargetFromSelection(selectedElement); 
    if(bubbleTarget) { 
      if(bubbleTarget != this.targetElement_ || ! this.panelId_) { 
        if(this.panelId_) { 
          this.closeBubble(); 
        } 
        this.createBubble(bubbleTarget); 
      } 
      return false; 
    } 
  } 
  if(this.panelId_) { 
    this.closeBubble(); 
  } 
  return false; 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.getBubbleTargetFromSelection = goog.abstractMethod; 
goog.editor.plugins.AbstractBubblePlugin.prototype.disable = function(field) { 
  if(field.isUneditable()) { 
    var bubble = goog.editor.plugins.AbstractBubblePlugin.bubbleMap_[field.id]; 
    if(bubble) { 
      bubble.dispose(); 
      delete goog.editor.plugins.AbstractBubblePlugin.bubbleMap_[field.id]; 
    } 
  } 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.getSharedBubble_ = function() { 
  var bubbleParent =(this.bubbleParent_ || this.fieldObject.getAppWindow().document.body); 
  this.dom_ = new goog.dom.getDomHelper(bubbleParent); 
  var bubble = goog.editor.plugins.AbstractBubblePlugin.bubbleMap_[this.fieldObject.id]; 
  if(! bubble) { 
    bubble = goog.editor.plugins.AbstractBubblePlugin.bubbleFactory_.call(null, bubbleParent, this.fieldObject.getBaseZindex()); 
    goog.editor.plugins.AbstractBubblePlugin.bubbleMap_[this.fieldObject.id]= bubble; 
  } 
  return bubble; 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.createBubble = function(targetElement) { 
  var bubble = this.getSharedBubble_(); 
  if(! bubble.hasPanelOfType(this.getBubbleType())) { 
    this.targetElement_ = targetElement; 
    this.panelId_ = bubble.addPanel(this.getBubbleType(), this.getBubbleTitle(), targetElement, goog.bind(this.createBubbleContents, this), this.shouldPreferBubbleAboveElement()); 
    this.eventRegister.listen(bubble, goog.ui.Component.EventType.HIDE, this.handlePanelClosed_); 
    this.onShow(); 
  } 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.getBubbleType = function() { 
  return ''; 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.getBubbleTitle = function() { 
  return ''; 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.shouldPreferBubbleAboveElement = goog.functions.FALSE; 
goog.editor.plugins.AbstractBubblePlugin.prototype.createBubbleContents = goog.abstractMethod; 
goog.editor.plugins.AbstractBubblePlugin.prototype.registerClickHandler = function(target, handler) { 
  this.eventRegister.listen(target, goog.events.EventType.CLICK, handler); 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.closeBubble = function() { 
  if(this.panelId_) { 
    this.getSharedBubble_().removePanel(this.panelId_); 
    this.handlePanelClosed_(); 
  } 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.onShow = goog.nullFunction; 
goog.editor.plugins.AbstractBubblePlugin.prototype.handlePanelClosed_ = function() { 
  this.targetElement_ = null; 
  this.panelId_ = null; 
  this.eventRegister.removeAll(); 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.isVisible = function() { 
  return ! ! this.panelId_; 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.reposition = function() { 
  var bubble = this.getSharedBubble_(); 
  if(bubble) { 
    bubble.reposition(); 
  } 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.createLinkOption = function(id) { 
  return this.dom_.createDom(goog.dom.TagName.SPAN, { 
    id: id, 
    className: goog.editor.plugins.AbstractBubblePlugin.OPTION_LINK_CLASSNAME_ 
  }, this.dom_.createTextNode(goog.editor.plugins.AbstractBubblePlugin.DASH_NBSP_STRING)); 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.createLink = function(linkId, linkText, opt_onClick, opt_container) { 
  var link = this.createLinkHelper(linkId, linkText, false, opt_container); 
  if(opt_onClick) { 
    this.registerClickHandler(link, opt_onClick); 
  } 
  return link; 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.createLinkHelper = function(linkId, linkText, isAnchor, opt_container) { 
  var link = this.dom_.createDom(isAnchor ? goog.dom.TagName.A: goog.dom.TagName.SPAN, { className: goog.editor.plugins.AbstractBubblePlugin.LINK_CLASSNAME_ }, linkText); 
  this.setupLink(link, linkId, opt_container); 
  goog.editor.style.makeUnselectable(link, this.eventRegister); 
  return link; 
}; 
goog.editor.plugins.AbstractBubblePlugin.prototype.setupLink = function(link, linkId, opt_container) { 
  if(opt_container) { 
    opt_container.appendChild(link); 
  } else { 
    var oldLink = this.dom_.getElement(linkId); 
    if(oldLink) { 
      goog.dom.replaceNode(link, oldLink); 
    } 
  } 
  link.id = linkId; 
}; 
