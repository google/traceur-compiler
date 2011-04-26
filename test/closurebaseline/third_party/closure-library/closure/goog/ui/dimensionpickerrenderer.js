
goog.provide('goog.ui.DimensionPickerRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.i18n.bidi'); 
goog.require('goog.style'); 
goog.require('goog.ui.ControlRenderer'); 
goog.require('goog.userAgent'); 
goog.ui.DimensionPickerRenderer = function() { 
  goog.ui.ControlRenderer.call(this); 
}; 
goog.inherits(goog.ui.DimensionPickerRenderer, goog.ui.ControlRenderer); 
goog.addSingletonGetter(goog.ui.DimensionPickerRenderer); 
goog.ui.DimensionPickerRenderer.CSS_CLASS = goog.getCssName('goog-dimension-picker'); 
goog.ui.DimensionPickerRenderer.prototype.getUnderlyingDiv_ = function(element) { 
  return element.firstChild.childNodes[1]; 
}; 
goog.ui.DimensionPickerRenderer.prototype.getHighlightDiv_ = function(element) { 
  return element.firstChild.lastChild; 
}; 
goog.ui.DimensionPickerRenderer.prototype.getStatusDiv_ = function(element) { 
  return(element.lastChild); 
}; 
goog.ui.DimensionPickerRenderer.prototype.getMouseCatcher_ = function(element) { 
  return element.firstChild.firstChild; 
}; 
goog.ui.DimensionPickerRenderer.prototype.canDecorate = function(element) { 
  return element.tagName == goog.dom.TagName.DIV && ! element.firstChild; 
}; 
goog.ui.DimensionPickerRenderer.prototype.decorate = function(palette, element) { 
  goog.ui.DimensionPickerRenderer.superClass_.decorate.call(this, palette, element); 
  this.addElementContents_(palette, element); 
  this.updateSize(palette, element); 
  return element; 
}; 
goog.ui.DimensionPickerRenderer.prototype.updateSize = function(palette, element) { 
  var size = palette.getSize(); 
  element.style.width = size.width + 'em'; 
  var underlyingDiv = this.getUnderlyingDiv_(element); 
  underlyingDiv.style.width = size.width + 'em'; 
  underlyingDiv.style.height = size.height + 'em'; 
  if(palette.isRightToLeft()) { 
    this.adjustParentDirection_(palette, element); 
  } 
}; 
goog.ui.DimensionPickerRenderer.prototype.addElementContents_ = function(palette, element) { 
  var mouseCatcherDiv = palette.getDomHelper().createDom(goog.dom.TagName.DIV, goog.getCssName(this.getCssClass(), 'mousecatcher')); 
  var unhighlightedDiv = palette.getDomHelper().createDom(goog.dom.TagName.DIV, { 
    'class': goog.getCssName(this.getCssClass(), 'unhighlighted'), 
    'style': 'width:100%;height:100%' 
  }); 
  var highlightedDiv = palette.getDomHelper().createDom(goog.dom.TagName.DIV, goog.getCssName(this.getCssClass(), 'highlighted')); 
  element.appendChild(palette.getDomHelper().createDom(goog.dom.TagName.DIV, { 'style': 'width:100%;height:100%' }, mouseCatcherDiv, unhighlightedDiv, highlightedDiv)); 
  element.appendChild(palette.getDomHelper().createDom(goog.dom.TagName.DIV, goog.getCssName(this.getCssClass(), 'status'), goog.i18n.bidi.enforceLtrInText('0 x 0'))); 
}; 
goog.ui.DimensionPickerRenderer.prototype.createDom = function(palette) { 
  var classNames = this.getClassNames(palette); 
  var element = palette.getDomHelper().createDom(goog.dom.TagName.DIV, { 'class': classNames ? classNames.join(' '): '' }); 
  this.addElementContents_(palette, element); 
  this.updateSize(palette, element); 
  return element; 
}; 
goog.ui.DimensionPickerRenderer.prototype.initializeDom = function(palette) { 
  goog.ui.DimensionPickerRenderer.superClass_.initializeDom.call(this, palette); 
  this.positionMouseCatcher(palette); 
}; 
goog.ui.DimensionPickerRenderer.prototype.getMouseMoveElement = function(palette) { 
  return(palette.getElement().firstChild); 
}; 
goog.ui.DimensionPickerRenderer.prototype.getGridOffsetX = function(palette, x) { 
  return Math.min(palette.maxColumns, Math.ceil(x / 18)); 
}; 
goog.ui.DimensionPickerRenderer.prototype.getGridOffsetY = function(palette, y) { 
  return Math.min(palette.maxRows, Math.ceil(y / 18)); 
}; 
goog.ui.DimensionPickerRenderer.prototype.setHighlightedSize = function(palette, columns, rows) { 
  var element = palette.getElement(); 
  var style = this.getHighlightDiv_(element).style; 
  style.width = columns + 'em'; 
  style.height = rows + 'em'; 
  if(palette.isRightToLeft()) { 
    style.right = '0'; 
  } 
  goog.dom.setTextContent(this.getStatusDiv_(element), goog.i18n.bidi.enforceLtrInText(columns + ' x ' + rows)); 
}; 
goog.ui.DimensionPickerRenderer.prototype.positionMouseCatcher = function(palette) { 
  var mouseCatcher = this.getMouseCatcher_(palette.getElement()); 
  var doc = goog.dom.getOwnerDocument(mouseCatcher); 
  var body = doc.body; 
  var position = goog.style.getRelativePosition(mouseCatcher, body); 
  mouseCatcher.style.display = 'none'; 
  var xAvailableEm =(palette.isRightToLeft() && position.x > 0) ? Math.floor(position.x / 18): Math.floor((body.scrollWidth - position.x) / 18); 
  var height; 
  if(goog.userAgent.IE) { 
    height = goog.style.getClientViewportElement(body).scrollHeight - 20; 
  } else { 
    var win = goog.dom.getWindow(doc); 
    height = Math.max(win.innerHeight, body.scrollHeight) - 20; 
  } 
  var yAvailableEm = Math.floor((height - position.y) / 18); 
  mouseCatcher.style.width = Math.min(palette.maxColumns, xAvailableEm) + 'em'; 
  mouseCatcher.style.height = Math.min(palette.maxRows, yAvailableEm) + 'em'; 
  mouseCatcher.style.display = ''; 
  if(palette.isRightToLeft()) { 
    mouseCatcher.style.right = '0'; 
  } 
}; 
goog.ui.DimensionPickerRenderer.prototype.getCssClass = function() { 
  return goog.ui.DimensionPickerRenderer.CSS_CLASS; 
}; 
goog.ui.DimensionPickerRenderer.prototype.adjustParentDirection_ = function(palette, element) { 
  var parent = palette.getParent(); 
  if(parent) { 
    var parentElement = parent.getElement(); 
    var right = goog.style.getStyle(parentElement, 'right'); 
    if(right == '') { 
      var parentPos = goog.style.getPosition(parentElement); 
      var parentSize = goog.style.getSize(parentElement); 
      if(parentSize.width != 0 && parentPos.x != 0) { 
        var visibleRect = goog.style.getBounds(goog.style.getClientViewportElement()); 
        var visibleWidth = visibleRect.width; 
        right = visibleWidth - parentPos.x - parentSize.width; 
        goog.style.setStyle(parentElement, 'right', right + 'px'); 
      } 
    } 
    var left = goog.style.getStyle(parentElement, 'left'); 
    if(left != '') { 
      goog.style.setStyle(parentElement, 'left', ''); 
    } 
  } else { 
    goog.style.setStyle(element, 'right', '0px'); 
  } 
}; 
