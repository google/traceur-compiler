
goog.provide('goog.ui.SplitPane'); 
goog.provide('goog.ui.SplitPane.Orientation'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.EventType'); 
goog.require('goog.fx.Dragger'); 
goog.require('goog.fx.Dragger.EventType'); 
goog.require('goog.math.Rect'); 
goog.require('goog.math.Size'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.userAgent'); 
goog.ui.SplitPane = function(firstComponent, secondComponent, orientation, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.orientation_ = orientation; 
  this.firstComponent_ = firstComponent; 
  this.addChild(firstComponent); 
  this.secondComponent_ = secondComponent; 
  this.addChild(secondComponent); 
}; 
goog.inherits(goog.ui.SplitPane, goog.ui.Component); 
goog.ui.SplitPane.EventType = { HANDLE_DRAG_END: 'handle_drag_end' }; 
goog.ui.SplitPane.CLASS_NAME_ = goog.getCssName('goog-splitpane'); 
goog.ui.SplitPane.FIRST_CONTAINER_CLASS_NAME_ = goog.getCssName('goog-splitpane-first-container'); 
goog.ui.SplitPane.SECOND_CONTAINER_CLASS_NAME_ = goog.getCssName('goog-splitpane-second-container'); 
goog.ui.SplitPane.HANDLE_CLASS_NAME_ = goog.getCssName('goog-splitpane-handle'); 
goog.ui.SplitPane.HANDLE_CLASS_NAME_HORIZONTAL_ = goog.getCssName('goog-splitpane-handle-horizontal'); 
goog.ui.SplitPane.HANDLE_CLASS_NAME_VERTICAL_ = goog.getCssName('goog-splitpane-handle-vertical'); 
goog.ui.SplitPane.prototype.splitDragger_ = null; 
goog.ui.SplitPane.prototype.firstComponentContainer_ = null; 
goog.ui.SplitPane.prototype.secondComponentContainer_ = null; 
goog.ui.SplitPane.prototype.handleSize_ = 5; 
goog.ui.SplitPane.prototype.initialSize_ = null; 
goog.ui.SplitPane.prototype.savedSnapSize_ = null; 
goog.ui.SplitPane.prototype.firstComponentSize_ = null; 
goog.ui.SplitPane.prototype.continuousResize_ = true; 
goog.ui.SplitPane.prototype.iframeOverlay_ = null; 
goog.ui.SplitPane.IframeOverlayIndex_ = { 
  HIDDEN: - 1, 
  OVERLAY: 1, 
  SPLITTER_HANDLE: 2 
}; 
goog.ui.SplitPane.Orientation = { 
  HORIZONTAL: 'horizontal', 
  VERTICAL: 'vertical' 
}; 
goog.ui.SplitPane.prototype.createDom = function() { 
  var dom = this.getDomHelper(); 
  var firstContainer = dom.createDom('div', goog.ui.SplitPane.FIRST_CONTAINER_CLASS_NAME_); 
  var secondContainer = dom.createDom('div', goog.ui.SplitPane.SECOND_CONTAINER_CLASS_NAME_); 
  var splitterHandle = dom.createDom('div', goog.ui.SplitPane.HANDLE_CLASS_NAME_); 
  this.setElementInternal(dom.createDom('div', goog.ui.SplitPane.CLASS_NAME_, firstContainer, secondContainer, splitterHandle)); 
  this.firstComponentContainer_ = firstContainer; 
  this.secondComponentContainer_ = secondContainer; 
  this.splitpaneHandle_ = splitterHandle; 
  this.setUpHandle_(); 
  this.finishSetup_(); 
}; 
goog.ui.SplitPane.prototype.canDecorate = function(element) { 
  var className = goog.ui.SplitPane.FIRST_CONTAINER_CLASS_NAME_; 
  var firstContainer = goog.dom.getElementsByTagNameAndClass(null, className, element)[0]; 
  if(! firstContainer) { 
    return false; 
  } 
  this.firstComponentContainer_ = firstContainer; 
  className = goog.ui.SplitPane.SECOND_CONTAINER_CLASS_NAME_; 
  var secondContainer = goog.dom.getElementsByTagNameAndClass(null, className, element)[0]; 
  if(! secondContainer) { 
    return false; 
  } 
  this.secondComponentContainer_ = secondContainer; 
  className = goog.ui.SplitPane.HANDLE_CLASS_NAME_; 
  var splitpaneHandle = goog.dom.getElementsByTagNameAndClass(null, className, element)[0]; 
  if(! splitpaneHandle) { 
    return false; 
  } 
  this.splitpaneHandle_ = splitpaneHandle; 
  return true; 
}; 
goog.ui.SplitPane.prototype.decorateInternal = function(element) { 
  goog.ui.SplitPane.superClass_.decorateInternal.call(this, element); 
  this.setUpHandle_(); 
  var elSize = goog.style.getBorderBoxSize(element); 
  this.setSize(new goog.math.Size(elSize.width, elSize.height)); 
  this.finishSetup_(); 
}; 
goog.ui.SplitPane.prototype.finishSetup_ = function() { 
  var dom = this.getDomHelper(); 
  if(! this.firstComponent_.getElement()) { 
    this.firstComponent_.createDom(); 
  } 
  dom.appendChild(this.firstComponentContainer_, this.firstComponent_.getElement()); 
  if(! this.secondComponent_.getElement()) { 
    this.secondComponent_.createDom(); 
  } 
  dom.appendChild(this.secondComponentContainer_, this.secondComponent_.getElement()); 
  this.splitDragger_ = new goog.fx.Dragger(this.splitpaneHandle_, this.splitpaneHandle_); 
  this.firstComponentContainer_.style.position = 'absolute'; 
  this.secondComponentContainer_.style.position = 'absolute'; 
  var handleStyle = this.splitpaneHandle_.style; 
  handleStyle.position = 'absolute'; 
  handleStyle.overflow = 'hidden'; 
  handleStyle.zIndex = goog.ui.SplitPane.IframeOverlayIndex_.SPLITTER_HANDLE; 
}; 
goog.ui.SplitPane.prototype.enterDocument = function() { 
  goog.ui.SplitPane.superClass_.enterDocument.call(this); 
  var element = this.getElement(); 
  if(goog.style.getComputedPosition(element) == 'static') { 
    element.style.position = 'relative'; 
  } 
  this.getHandler().listen(this.splitpaneHandle_, goog.events.EventType.DBLCLICK, this.handleDoubleClick_).listen(this.splitDragger_, goog.fx.Dragger.EventType.START, this.handleDragStart_).listen(this.splitDragger_, goog.fx.Dragger.EventType.DRAG, this.handleDrag_).listen(this.splitDragger_, goog.fx.Dragger.EventType.END, this.handleDragEnd_); 
  this.setFirstComponentSize(this.initialSize_); 
}; 
goog.ui.SplitPane.prototype.setInitialSize = function(size) { 
  this.initialSize_ = size; 
}; 
goog.ui.SplitPane.prototype.setHandleSize = function(size) { 
  this.handleSize_ = size; 
}; 
goog.ui.SplitPane.prototype.setContinuousResize = function(continuous) { 
  this.continuousResize_ = continuous; 
}; 
goog.ui.SplitPane.prototype.isVertical = function() { 
  return this.orientation_ == goog.ui.SplitPane.Orientation.VERTICAL; 
}; 
goog.ui.SplitPane.prototype.setUpHandle_ = function() { 
  if(this.isVertical()) { 
    this.splitpaneHandle_.style.height = this.handleSize_ + 'px'; 
    goog.dom.classes.add(this.splitpaneHandle_, goog.ui.SplitPane.HANDLE_CLASS_NAME_VERTICAL_); 
  } else { 
    this.splitpaneHandle_.style.width = this.handleSize_ + 'px'; 
    goog.dom.classes.add(this.splitpaneHandle_, goog.ui.SplitPane.HANDLE_CLASS_NAME_HORIZONTAL_); 
  } 
}; 
goog.ui.SplitPane.prototype.setOrientationClassForHandle = function() { 
  if(this.isVertical()) { 
    goog.dom.classes.swap(this.splitpaneHandle_, goog.ui.SplitPane.HANDLE_CLASS_NAME_HORIZONTAL_, goog.ui.SplitPane.HANDLE_CLASS_NAME_VERTICAL_); 
  } else { 
    goog.dom.classes.swap(this.splitpaneHandle_, goog.ui.SplitPane.HANDLE_CLASS_NAME_VERTICAL_, goog.ui.SplitPane.HANDLE_CLASS_NAME_HORIZONTAL_); 
  } 
}; 
goog.ui.SplitPane.prototype.setOrientation = function(orientation) { 
  if(this.orientation_ != orientation) { 
    this.orientation_ = orientation; 
    var isVertical = this.isVertical(); 
    if(this.isInDocument()) { 
      this.setOrientationClassForHandle(); 
      if(goog.isNumber(this.firstComponentSize_)) { 
        var splitpaneSize = goog.style.getBorderBoxSize(this.getElement()); 
        var ratio = isVertical ? splitpaneSize.height / splitpaneSize.width: splitpaneSize.width / splitpaneSize.height; 
        this.setFirstComponentSize(this.firstComponentSize_ * ratio); 
      } else { 
        this.setFirstComponentSize(); 
      } 
    } 
  } 
}; 
goog.ui.SplitPane.prototype.getOrientation = function() { 
  return this.orientation_; 
}; 
goog.ui.SplitPane.prototype.moveAndSize_ = function(element, rect) { 
  goog.style.setPosition(element, rect.left, rect.top); 
  goog.style.setBorderBoxSize(element, new goog.math.Size(Math.max(rect.width, 0), Math.max(rect.height, 0))); 
}; 
goog.ui.SplitPane.prototype.getFirstComponentSize = function() { 
  return this.firstComponentSize_; 
}; 
goog.ui.SplitPane.prototype.setFirstComponentSize = function(opt_size) { 
  var top = 0, left = 0; 
  var splitpaneSize = goog.style.getBorderBoxSize(this.getElement()); 
  var isVertical = this.isVertical(); 
  var firstComponentSize = goog.isNumber(opt_size) ? opt_size: goog.isNumber(this.firstComponentSize_) ? this.firstComponentSize_: Math.floor((isVertical ? splitpaneSize.height: splitpaneSize.width) / 2); 
  this.firstComponentSize_ = firstComponentSize; 
  var firstComponentWidth; 
  var firstComponentHeight; 
  var secondComponentWidth; 
  var secondComponentHeight; 
  var handleWidth; 
  var handleHeight; 
  var secondComponentLeft; 
  var secondComponentTop; 
  var handleLeft; 
  var handleTop; 
  if(isVertical) { 
    firstComponentHeight = firstComponentSize; 
    firstComponentWidth = splitpaneSize.width; 
    handleWidth = splitpaneSize.width; 
    handleHeight = this.handleSize_; 
    secondComponentHeight = splitpaneSize.height - firstComponentHeight - handleHeight; 
    secondComponentWidth = splitpaneSize.width; 
    handleTop = top + firstComponentHeight; 
    handleLeft = left; 
    secondComponentTop = handleTop + handleHeight; 
    secondComponentLeft = left; 
  } else { 
    firstComponentWidth = firstComponentSize; 
    firstComponentHeight = splitpaneSize.height; 
    handleWidth = this.handleSize_; 
    handleHeight = splitpaneSize.height; 
    secondComponentWidth = splitpaneSize.width - firstComponentWidth - handleWidth; 
    secondComponentHeight = splitpaneSize.height; 
    handleLeft = left + firstComponentWidth; 
    handleTop = top; 
    secondComponentLeft = handleLeft + handleWidth; 
    secondComponentTop = top; 
  } 
  this.moveAndSize_(this.firstComponentContainer_, new goog.math.Rect(left, top, firstComponentWidth, firstComponentHeight)); 
  if(typeof this.firstComponent_.resize == 'function') { 
    this.firstComponent_.resize(new goog.math.Size(firstComponentWidth, firstComponentHeight)); 
  } 
  this.moveAndSize_(this.splitpaneHandle_, new goog.math.Rect(handleLeft, handleTop, handleWidth, handleHeight)); 
  this.moveAndSize_(this.secondComponentContainer_, new goog.math.Rect(secondComponentLeft, secondComponentTop, secondComponentWidth, secondComponentHeight)); 
  if(typeof this.secondComponent_.resize == 'function') { 
    this.secondComponent_.resize(new goog.math.Size(secondComponentWidth, secondComponentHeight)); 
  } 
  this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
}; 
goog.ui.SplitPane.resizeWarningWorkaround_ = { resize: function(size) { } }; 
goog.ui.SplitPane.prototype.setSize = function(size) { 
  goog.style.setBorderBoxSize(this.getElement(), size); 
  if(this.iframeOverlay_) { 
    goog.style.setBorderBoxSize(this.iframeOverlay_, size); 
  } 
  this.setFirstComponentSize(); 
}; 
goog.ui.SplitPane.prototype.snapIt_ = function() { 
  var handlePos = goog.style.getRelativePosition(this.splitpaneHandle_, this.firstComponentContainer_); 
  var firstBorderBoxSize = goog.style.getBorderBoxSize(this.firstComponentContainer_); 
  var firstContentBoxSize = goog.style.getContentBoxSize(this.firstComponentContainer_); 
  var isVertical = this.isVertical(); 
  var snapSize; 
  var handlePosition; 
  if(isVertical) { 
    snapSize = firstBorderBoxSize.height - firstContentBoxSize.height; 
    handlePosition = handlePos.y; 
  } else { 
    snapSize = firstBorderBoxSize.width - firstContentBoxSize.width; 
    handlePosition = handlePos.x; 
  } 
  if(snapSize == handlePosition) { 
    this.setFirstComponentSize(this.savedSnapSize_); 
  } else { 
    if(isVertical) { 
      this.savedSnapSize_ = goog.style.getBorderBoxSize(this.firstComponentContainer_).height; 
    } else { 
      this.savedSnapSize_ = goog.style.getBorderBoxSize(this.firstComponentContainer_).width; 
    } 
    this.setFirstComponentSize(snapSize); 
  } 
}; 
goog.ui.SplitPane.prototype.handleDragStart_ = function(e) { 
  if(! this.iframeOverlay_) { 
    var cssStyles = 'position: relative'; 
    if(goog.userAgent.IE) { 
      cssStyles += ';background-color: #000;filter: Alpha(Opacity=0)'; 
    } 
    this.iframeOverlay_ = this.getDomHelper().createDom('div', { 'style': cssStyles }); 
    this.getDomHelper().appendChild(this.getElement(), this.iframeOverlay_); 
  } 
  this.iframeOverlay_.style.zIndex = goog.ui.SplitPane.IframeOverlayIndex_.OVERLAY; 
  goog.style.setBorderBoxSize(this.iframeOverlay_, goog.style.getBorderBoxSize(this.getElement())); 
  var pos = goog.style.getPosition(this.firstComponentContainer_); 
  var limitWidth = 0; 
  var limitHeight = 0; 
  var limitx = pos.x; 
  var limity = pos.y; 
  var firstBorderBoxSize = goog.style.getBorderBoxSize(this.firstComponentContainer_); 
  var firstContentBoxSize = goog.style.getContentBoxSize(this.firstComponentContainer_); 
  var secondContentBoxSize = goog.style.getContentBoxSize(this.secondComponentContainer_); 
  if(this.isVertical()) { 
    limitHeight = firstContentBoxSize.height + secondContentBoxSize.height; 
    limity += firstBorderBoxSize.height - firstContentBoxSize.height; 
  } else { 
    limitWidth = firstContentBoxSize.width + secondContentBoxSize.width; 
    limitx += firstBorderBoxSize.width - firstContentBoxSize.width; 
  } 
  var limits = new goog.math.Rect(limitx, limity, limitWidth, limitHeight); 
  this.splitDragger_.setLimits(limits); 
}; 
goog.ui.SplitPane.prototype.getRelativeLeft_ = function(left) { 
  return left - goog.style.getPosition(this.firstComponentContainer_).x; 
}; 
goog.ui.SplitPane.prototype.getRelativeTop_ = function(top) { 
  return top - goog.style.getPosition(this.firstComponentContainer_).y; 
}; 
goog.ui.SplitPane.prototype.handleDrag_ = function(e) { 
  if(this.continuousResize_) { 
    if(this.isVertical()) { 
      var top = this.getRelativeTop_(e.top); 
      this.setFirstComponentSize(top); 
    } else { 
      var left = this.getRelativeLeft_(e.left); 
      this.setFirstComponentSize(left); 
    } 
  } 
}; 
goog.ui.SplitPane.prototype.handleDragEnd_ = function(e) { 
  this.iframeOverlay_.style.zIndex = goog.ui.SplitPane.IframeOverlayIndex_.HIDDEN; 
  if(! this.continuousResize_) { 
    if(this.isVertical()) { 
      var top = this.getRelativeTop_(e.top); 
      this.setFirstComponentSize(top); 
    } else { 
      var left = this.getRelativeLeft_(e.left); 
      this.setFirstComponentSize(left); 
    } 
  } 
  this.dispatchEvent(goog.ui.SplitPane.EventType.HANDLE_DRAG_END); 
}; 
goog.ui.SplitPane.prototype.handleDoubleClick_ = function(e) { 
  this.snapIt_(); 
}; 
goog.ui.SplitPane.prototype.disposeInternal = function() { 
  goog.ui.SplitPane.superClass_.disposeInternal.call(this); 
  this.splitDragger_.dispose(); 
  this.splitDragger_ = null; 
  goog.dom.removeNode(this.iframeOverlay_); 
  this.iframeOverlay_ = null; 
}; 
