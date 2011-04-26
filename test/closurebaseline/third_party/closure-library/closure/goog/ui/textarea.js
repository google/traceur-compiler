
goog.provide('goog.ui.Textarea'); 
goog.require('goog.Timer'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.style'); 
goog.require('goog.ui.Control'); 
goog.require('goog.ui.TextareaRenderer'); 
goog.require('goog.userAgent'); 
goog.require('goog.userAgent.product'); 
goog.ui.Textarea = function(content, opt_renderer, opt_domHelper) { 
  goog.ui.Control.call(this, content, opt_renderer || goog.ui.TextareaRenderer.getInstance(), opt_domHelper); 
  this.setHandleMouseEvents(false); 
  this.setAllowTextSelection(true); 
  if(! content) { 
    this.setContentInternal(''); 
  } 
}; 
goog.inherits(goog.ui.Textarea, goog.ui.Control); 
goog.ui.Textarea.NEEDS_HELP_SHRINKING_ = goog.userAgent.GECKO || goog.userAgent.WEBKIT; 
goog.ui.Textarea.prototype.isResizing_ = false; 
goog.ui.Textarea.prototype.height_ = 0; 
goog.ui.Textarea.prototype.maxHeight_ = 0; 
goog.ui.Textarea.prototype.minHeight_ = 0; 
goog.ui.Textarea.prototype.hasDiscoveredTextareaCharacteristics_ = false; 
goog.ui.Textarea.prototype.needsPaddingBorderFix_ = false; 
goog.ui.Textarea.prototype.scrollHeightIncludesPadding_ = false; 
goog.ui.Textarea.prototype.scrollHeightIncludesBorder_ = false; 
goog.ui.Textarea.prototype.paddingBox_; 
goog.ui.Textarea.prototype.borderBox_; 
goog.ui.Textarea.prototype.getPaddingBorderBoxHeight_ = function() { 
  var paddingBorderBoxHeight = this.paddingBox_.top + this.paddingBox_.bottom + this.borderBox_.top + this.borderBox_.bottom; 
  return paddingBorderBoxHeight; 
}; 
goog.ui.Textarea.prototype.getMinHeight = function() { 
  return this.minHeight_; 
}; 
goog.ui.Textarea.prototype.getMinHeight_ = function() { 
  var minHeight = this.minHeight_; 
  var textarea = this.getElement(); 
  if(minHeight && textarea && this.needsPaddingBorderFix_) { 
    minHeight -= this.getPaddingBorderBoxHeight_(); 
  } 
  return minHeight; 
}; 
goog.ui.Textarea.prototype.setMinHeight = function(height) { 
  this.minHeight_ = height; 
  this.resize(); 
}; 
goog.ui.Textarea.prototype.getMaxHeight = function() { 
  return this.maxHeight_; 
}; 
goog.ui.Textarea.prototype.getMaxHeight_ = function() { 
  var maxHeight = this.maxHeight_; 
  var textarea = this.getElement(); 
  if(maxHeight && textarea && this.needsPaddingBorderFix_) { 
    maxHeight -= this.getPaddingBorderBoxHeight_(); 
  } 
  return maxHeight; 
}; 
goog.ui.Textarea.prototype.setMaxHeight = function(height) { 
  this.maxHeight_ = height; 
  this.resize(); 
}; 
goog.ui.Textarea.prototype.setValue = function(value) { 
  this.setContent(String(value)); 
}; 
goog.ui.Textarea.prototype.getValue = function() { 
  return this.getElement().value; 
}; 
goog.ui.Textarea.prototype.setContent = function(content) { 
  goog.ui.Textarea.superClass_.setContent.call(this, content); 
  this.resize(); 
}; 
goog.ui.Textarea.prototype.setEnabled = function(enable) { 
  goog.ui.Textarea.superClass_.setEnabled.call(this, enable); 
  this.getElement().disabled = ! enable; 
}; 
goog.ui.Textarea.prototype.resize = function() { 
  if(this.getElement()) { 
    this.grow_(); 
  } 
}; 
goog.ui.Textarea.prototype.enterDocument = function() { 
  var textarea = this.getElement(); 
  goog.style.setStyle(textarea, { 
    'overflowY': 'hidden', 
    'overflowX': 'auto', 
    'boxSizing': 'border-box', 
    'MsBoxSizing': 'border-box', 
    'WebkitBoxSizing': 'border-box', 
    'MozBoxSizing': 'border-box' 
  }); 
  this.paddingBox_ = goog.style.getPaddingBox(textarea); 
  this.borderBox_ = goog.style.getBorderBox(textarea); 
  this.getHandler().listen(textarea, goog.events.EventType.SCROLL, this.grow_).listen(textarea, goog.events.EventType.FOCUS, this.grow_).listen(textarea, goog.events.EventType.KEYUP, this.grow_).listen(textarea, goog.events.EventType.MOUSEUP, this.mouseUpListener_); 
  this.resize(); 
}; 
goog.ui.Textarea.prototype.getHeight_ = function() { 
  this.discoverTextareaCharacteristics_(); 
  var textarea = this.getElement(); 
  var height = this.getElement().scrollHeight + this.getHorizontalScrollBarHeight_(); 
  if(this.needsPaddingBorderFix_) { 
    height -= this.getPaddingBorderBoxHeight_(); 
  } else { 
    if(! this.scrollHeightIncludesPadding_) { 
      var paddingBox = this.paddingBox_; 
      var paddingBoxHeight = paddingBox.top + paddingBox.bottom; 
      height += paddingBoxHeight; 
    } 
    if(! this.scrollHeightIncludesBorder_) { 
      var borderBox = goog.style.getBorderBox(textarea); 
      var borderBoxHeight = borderBox.top + borderBox.bottom; 
      height += borderBoxHeight; 
    } 
  } 
  return height; 
}; 
goog.ui.Textarea.prototype.setHeight_ = function(height) { 
  if(this.height_ != height) { 
    this.height_ = height; 
    this.getElement().style.height = height + 'px'; 
  } 
}; 
goog.ui.Textarea.prototype.setHeightToEstimate_ = function() { 
  var textarea = this.getElement(); 
  textarea.style.height = 'auto'; 
  var newlines = textarea.value.match(/\n/g) ||[]; 
  textarea.rows = newlines.length + 1; 
}; 
goog.ui.Textarea.prototype.getHorizontalScrollBarHeight_ = function() { 
  var textarea = this.getElement(); 
  var height = textarea.offsetHeight - textarea.clientHeight; 
  if(! this.scrollHeightIncludesPadding_) { 
    var paddingBox = this.paddingBox_; 
    var paddingBoxHeight = paddingBox.top + paddingBox.bottom; 
    height -= paddingBoxHeight; 
  } 
  if(! this.scrollHeightIncludesBorder_) { 
    var borderBox = goog.style.getBorderBox(textarea); 
    var borderBoxHeight = borderBox.top + borderBox.bottom; 
    height -= borderBoxHeight; 
  } 
  return height > 0 ? height: 0; 
}; 
goog.ui.Textarea.prototype.discoverTextareaCharacteristics_ = function() { 
  if(! this.hasDiscoveredTextareaCharacteristics_) { 
    var textarea =(this.getElement().cloneNode(false)); 
    goog.style.setStyle(textarea, { 
      'position': 'absolute', 
      'height': 'auto', 
      'top': '-9999px', 
      'margin': '0', 
      'padding': '1px', 
      'border': '1px solid #000', 
      'overflow': 'hidden' 
    }); 
    goog.dom.appendChild(this.getDomHelper().getDocument().body, textarea); 
    var initialScrollHeight = textarea.scrollHeight; 
    textarea.style.padding = '10px'; 
    var paddingScrollHeight = textarea.scrollHeight; 
    this.scrollHeightIncludesPadding_ = paddingScrollHeight > initialScrollHeight; 
    initialScrollHeight = paddingScrollHeight; 
    textarea.style.borderWidth = '10px'; 
    var borderScrollHeight = textarea.scrollHeight; 
    this.scrollHeightIncludesBorder_ = borderScrollHeight > initialScrollHeight; 
    textarea.style.height = '100px'; 
    var offsetHeightAtHeight100 = textarea.offsetHeight; 
    if(offsetHeightAtHeight100 != 100) { 
      this.needsPaddingBorderFix_ = true; 
    } 
    goog.dom.removeNode(textarea); 
    this.hasDiscoveredTextareaCharacteristics_ = true; 
  } 
}; 
goog.ui.Textarea.prototype.grow_ = function(opt_e) { 
  if(this.isResizing_) { 
    return; 
  } 
  var shouldCallShrink = false; 
  this.isResizing_ = true; 
  var textarea = this.getElement(); 
  if(textarea.scrollHeight) { 
    var setMinHeight = false; 
    var setMaxHeight = false; 
    var newHeight = this.getHeight_(); 
    var currentHeight = textarea.offsetHeight; 
    var minHeight = this.getMinHeight_(); 
    var maxHeight = this.getMaxHeight_(); 
    if(minHeight && newHeight < minHeight) { 
      this.setHeight_(minHeight); 
      setMinHeight = true; 
    } else if(maxHeight && newHeight > maxHeight) { 
      this.setHeight_(maxHeight); 
      textarea.style.overflowY = ''; 
      setMaxHeight = true; 
    } else if(currentHeight != newHeight) { 
      this.setHeight_(newHeight); 
    } else if(! this.height_) { 
      this.height_ = newHeight; 
    } 
    if(! setMinHeight && ! setMaxHeight && goog.ui.Textarea.NEEDS_HELP_SHRINKING_) { 
      shouldCallShrink = true; 
    } 
  } else { 
    this.setHeightToEstimate_(); 
  } 
  this.isResizing_ = false; 
  if(shouldCallShrink) { 
    this.shrink_(); 
  } 
}; 
goog.ui.Textarea.prototype.shrink_ = function() { 
  var textarea = this.getElement(); 
  if(! this.isResizing_) { 
    this.isResizing_ = true; 
    var isEmpty = false; 
    if(! textarea.value) { 
      textarea.value = ' '; 
      isEmpty = true; 
    } 
    var scrollHeight = textarea.scrollHeight; 
    if(! scrollHeight) { 
      this.setHeightToEstimate_(); 
    } else { 
      var currentHeight = this.getHeight_(); 
      var minHeight = this.getMinHeight_(); 
      var maxHeight = this.getMaxHeight_(); 
      if(!(minHeight && currentHeight <= minHeight) && !(maxHeight && currentHeight >= maxHeight)) { 
        var paddingBox = this.paddingBox_; 
        textarea.style.paddingBottom = paddingBox.bottom + 1 + 'px'; 
        var heightAfterNudge = this.getHeight_(); 
        if(heightAfterNudge == currentHeight) { 
          textarea.style.paddingBottom = paddingBox.bottom + scrollHeight + 'px'; 
          textarea.scrollTop = 0; 
          var shrinkToHeight = this.getHeight_() - scrollHeight; 
          if(shrinkToHeight >= minHeight) { 
            this.setHeight_(shrinkToHeight); 
          } else { 
            this.setHeight_(minHeight); 
          } 
        } 
        textarea.style.paddingBottom = paddingBox.bottom + 'px'; 
      } 
    } 
    if(isEmpty) { 
      textarea.value = ''; 
    } 
    this.isResizing_ = false; 
  } 
}; 
goog.ui.Textarea.prototype.mouseUpListener_ = function(e) { 
  var textarea = this.getElement(); 
  var height = textarea.offsetHeight; 
  if(textarea['filters']&& textarea['filters'].length) { 
    var dropShadow = textarea['filters']['item']('DXImageTransform.Microsoft.DropShadow'); 
    if(dropShadow) { 
      height -= dropShadow['offX']; 
    } 
  } 
  if(height != this.height_) { 
    this.minHeight_ = height; 
    this.height_ = height; 
  } 
}; 
