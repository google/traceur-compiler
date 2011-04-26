
goog.provide('goog.editor.SeamlessField'); 
goog.require('goog.cssom.iframe.style'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.dom.Range'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.Field'); 
goog.require('goog.editor.Field.EventType'); 
goog.require('goog.editor.icontent'); 
goog.require('goog.editor.icontent.FieldFormatInfo'); 
goog.require('goog.editor.icontent.FieldStyleInfo'); 
goog.require('goog.editor.node'); 
goog.require('goog.events'); 
goog.require('goog.events.EventType'); 
goog.require('goog.style'); 
goog.editor.SeamlessField = function(id, opt_doc) { 
  goog.editor.Field.call(this, id, opt_doc); 
}; 
goog.inherits(goog.editor.SeamlessField, goog.editor.Field); 
goog.editor.SeamlessField.prototype.logger = goog.debug.Logger.getLogger('goog.editor.SeamlessField'); 
goog.editor.SeamlessField.prototype.listenForDragOverEventKey_; 
goog.editor.SeamlessField.prototype.setMinHeight = function(height) { 
  if(height == this.minHeight_) { 
    return; 
  } 
  this.minHeight_ = height; 
  if(this.usesIframe()) { 
    this.doFieldSizingGecko(); 
  } 
}; 
goog.editor.SeamlessField.prototype.isFixedHeight_ = false; 
goog.editor.SeamlessField.prototype.isFixedHeightOverridden_ = false; 
goog.editor.SeamlessField.prototype.isFixedHeight = function() { 
  return this.isFixedHeight_; 
}; 
goog.editor.SeamlessField.prototype.overrideFixedHeight = function(newVal) { 
  this.isFixedHeight_ = newVal; 
  this.isFixedHeightOverridden_ = true; 
}; 
goog.editor.SeamlessField.prototype.autoDetectFixedHeight_ = function() { 
  if(! this.isFixedHeightOverridden_) { 
    var originalElement = this.getOriginalElement(); 
    if(originalElement) { 
      this.isFixedHeight_ = goog.style.getComputedOverflowY(originalElement) == 'auto'; 
    } 
  } 
}; 
goog.editor.SeamlessField.prototype.handleOuterDocChange_ = function() { 
  if(this.isEventStopped(goog.editor.Field.EventType.CHANGE)) { 
    return; 
  } 
  this.sizeIframeToWrapperGecko_(); 
}; 
goog.editor.SeamlessField.prototype.sizeIframeToBodyHeightGecko_ = function() { 
  if(this.acquireSizeIframeLockGecko_()) { 
    var ifr = this.getEditableIframe(); 
    var fieldHeight = this.getIframeBodyHeightGecko_(); 
    if(this.minHeight_) { 
      fieldHeight = Math.max(fieldHeight, this.minHeight_); 
    } 
    if(parseInt(goog.style.getStyle(ifr, 'height'), 10) != fieldHeight) { 
      ifr.style.height = fieldHeight + 'px'; 
    } 
    this.releaseSizeIframeLockGecko_(); 
  } 
}; 
goog.editor.SeamlessField.prototype.getIframeBodyHeightGecko_ = function() { 
  var ifr = this.getEditableIframe(); 
  var body = ifr.contentDocument.body; 
  var htmlElement = body.parentNode; 
  if(parseInt(goog.style.getStyle(ifr, 'height'), 10) === 0) { 
    goog.style.setStyle(ifr, 'height', 1 + 'px'); 
  } 
  var fieldHeight; 
  if(goog.editor.node.isStandardsMode(body)) { 
    fieldHeight = htmlElement.offsetHeight; 
  } else { 
    fieldHeight = htmlElement.scrollHeight; 
    if(htmlElement.clientHeight != htmlElement.offsetHeight) { 
      fieldHeight += goog.editor.SeamlessField.getScrollbarWidth_(); 
    } 
  } 
  return fieldHeight; 
}; 
goog.editor.SeamlessField.getScrollbarWidth_ = function() { 
  return goog.editor.SeamlessField.scrollbarWidth_ ||(goog.editor.SeamlessField.scrollbarWidth_ = goog.style.getScrollbarWidth()); 
}; 
goog.editor.SeamlessField.prototype.sizeIframeToWrapperGecko_ = function() { 
  if(this.acquireSizeIframeLockGecko_()) { 
    var ifr = this.getEditableIframe(); 
    var field = this.getElement(); 
    if(field) { 
      var fieldPaddingBox = goog.style.getPaddingBox(field); 
      var widthDiv = ifr.parentNode; 
      var width = widthDiv.offsetWidth; 
      if(parseInt(goog.style.getStyle(ifr, 'width'), 10) != width) { 
        ifr.style.width = width + 'px'; 
        field.style.width = width - fieldPaddingBox.left - fieldPaddingBox.right + 'px'; 
      } 
      var height = widthDiv.offsetHeight; 
      if(this.isFixedHeight() && parseInt(goog.style.getStyle(ifr, 'height'), 10) != height) { 
        ifr.style.height = height + 'px'; 
        field.style.height = height - fieldPaddingBox.top - fieldPaddingBox.bottom + 'px'; 
      } 
      this.releaseSizeIframeLockGecko_(); 
    } 
  } 
}; 
goog.editor.SeamlessField.prototype.doFieldSizingGecko = function() { 
  if(this.getElement()) { 
    this.sizeIframeToWrapperGecko_(); 
    if(! this.isFixedHeight()) { 
      this.sizeIframeToBodyHeightGecko_(); 
    } 
  } 
}; 
goog.editor.SeamlessField.prototype.acquireSizeIframeLockGecko_ = function() { 
  if(this.sizeIframeLock_) { 
    return false; 
  } 
  return this.sizeIframeLock_ = true; 
}; 
goog.editor.SeamlessField.prototype.releaseSizeIframeLockGecko_ = function() { 
  this.sizeIframeLock_ = false; 
}; 
goog.editor.SeamlessField.prototype.iframeableCss_ = ''; 
goog.editor.SeamlessField.prototype.getIframeableCss = function(opt_forceRegeneration) { 
  if(! this.iframeableCss_ || opt_forceRegeneration) { 
    var originalElement = this.getOriginalElement(); 
    if(originalElement) { 
      this.iframeableCss_ = goog.cssom.iframe.style.getElementContext(originalElement, opt_forceRegeneration); 
    } 
  } 
  return this.iframeableCss_; 
}; 
goog.editor.SeamlessField.prototype.setIframeableCss = function(iframeableCss) { 
  this.iframeableCss_ = iframeableCss; 
}; 
goog.editor.SeamlessField.haveInstalledCss_ = false; 
goog.editor.SeamlessField.prototype.inheritBlendedCSS = function() { 
  if(! this.usesIframe()) { 
    return; 
  } 
  var field = this.getElement(); 
  var head = goog.dom.getDomHelper(field).getElementsByTagNameAndClass('head')[0]; 
  if(head) { 
    goog.dom.removeChildren(head); 
  } 
  var newCSS = this.getIframeableCss(true); 
  goog.style.installStyles(newCSS, field); 
}; 
goog.editor.SeamlessField.prototype.usesIframe = function() { 
  return ! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE; 
}; 
goog.editor.SeamlessField.prototype.setupMutationEventHandlersGecko = function() { 
  goog.editor.SeamlessField.superClass_.setupMutationEventHandlersGecko.call(this); 
  if(this.usesIframe()) { 
    var iframe = this.getEditableIframe(); 
    var outerDoc = iframe.ownerDocument; 
    this.eventRegister.listen(outerDoc, goog.editor.Field.MUTATION_EVENTS_GECKO, this.handleOuterDocChange_, true); 
    this.eventRegister.listen(this.getEditableDomHelper().getWindow(), goog.events.EventType.LOAD, this.sizeIframeToBodyHeightGecko_, true); 
    this.eventRegister.listen(outerDoc, 'DOMAttrModified', goog.bind(this.handleDomAttrChange, this, this.handleOuterDocChange_), true); 
  } 
}; 
goog.editor.SeamlessField.prototype.handleChange = function() { 
  if(this.isEventStopped(goog.editor.Field.EventType.CHANGE)) { 
    return; 
  } 
  goog.editor.SeamlessField.superClass_.handleChange.call(this); 
  if(this.usesIframe()) { 
    this.sizeIframeToBodyHeightGecko_(); 
  } 
}; 
goog.editor.SeamlessField.prototype.dispatchBlur = function() { 
  if(this.isEventStopped(goog.editor.Field.EventType.BLUR)) { 
    return; 
  } 
  goog.editor.SeamlessField.superClass_.dispatchBlur.call(this); 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE && ! goog.editor.BrowserFeature.CLEARS_SELECTION_WHEN_FOCUS_LEAVES) { 
    var win = this.getEditableDomHelper().getWindow(); 
    var dragging = false; 
    goog.events.unlistenByKey(this.listenForDragOverEventKey_); 
    this.listenForDragOverEventKey_ = goog.events.listenOnce(win.document.body, 'dragover', function() { 
      dragging = true; 
    }); 
    goog.global.setTimeout(goog.bind(function() { 
      if(! dragging) { 
        if(this.editableDomHelper) { 
          var rng = this.getRange(); 
          var iframeWindow = this.editableDomHelper.getWindow(); 
          goog.dom.Range.clearSelection(iframeWindow); 
          if(rng) { 
            rng.collapse(true); 
            rng.select(); 
          } 
        } 
      } 
    }, this), 0); 
  } 
}; 
goog.editor.SeamlessField.prototype.turnOnDesignModeGecko = function() { 
  goog.editor.SeamlessField.superClass_.turnOnDesignModeGecko.call(this); 
  var doc = this.getEditableDomHelper().getDocument(); 
  doc.execCommand('enableInlineTableEditing', false, 'false'); 
  doc.execCommand('enableObjectResizing', false, 'false'); 
}; 
goog.editor.SeamlessField.prototype.installStyles = function() { 
  if(! this.usesIframe()) { 
    if(! goog.editor.SeamlessField.haveInstalledCss_) { 
      if(this.cssStyles) { 
        goog.style.installStyles(this.cssStyles, this.getElement()); 
      } 
      goog.editor.SeamlessField.haveInstalledCss_ = true; 
    } 
  } 
}; 
goog.editor.SeamlessField.prototype.makeEditableInternal = function(opt_iframeSrc) { 
  if(this.usesIframe()) { 
    goog.editor.SeamlessField.superClass_.makeEditableInternal.call(this, opt_iframeSrc); 
  } else { 
    var field = this.getOriginalElement(); 
    if(field) { 
      this.setupFieldObject(field); 
      field.contentEditable = true; 
      this.injectContents(field.innerHTML, field); 
      this.handleFieldLoad(); 
    } 
  } 
}; 
goog.editor.SeamlessField.prototype.handleFieldLoad = function() { 
  if(this.usesIframe()) { 
    var self = this; 
    goog.global.setTimeout(function() { 
      self.doFieldSizingGecko(); 
    }, 0); 
  } 
  goog.editor.SeamlessField.superClass_.handleFieldLoad.call(this); 
}; 
goog.editor.SeamlessField.prototype.getIframeAttributes = function() { 
  return { 
    'frameBorder': 0, 
    'style': 'padding:0;' 
  }; 
}; 
goog.editor.SeamlessField.prototype.attachIframe = function(iframe) { 
  this.autoDetectFixedHeight_(); 
  var field = this.getOriginalElement(); 
  var dh = goog.dom.getDomHelper(field); 
  var oldWidth = field.style.width; 
  var oldHeight = field.style.height; 
  goog.style.setStyle(field, 'visibility', 'hidden'); 
  var startDiv = dh.createDom(goog.dom.TagName.DIV, { 
    'style': 'height:0;clear:both', 
    'innerHTML': '&nbsp;' 
  }); 
  var endDiv = startDiv.cloneNode(true); 
  field.insertBefore(startDiv, field.firstChild); 
  goog.dom.appendChild(field, endDiv); 
  var contentBox = goog.style.getContentBoxSize(field); 
  var width = contentBox.width; 
  var height = contentBox.height; 
  var html = ''; 
  if(this.isFixedHeight()) { 
    html = '&nbsp;'; 
    goog.style.setStyle(field, 'position', 'relative'); 
    goog.style.setStyle(field, 'overflow', 'visible'); 
    goog.style.setStyle(iframe, 'position', 'absolute'); 
    goog.style.setStyle(iframe, 'top', '0'); 
    goog.style.setStyle(iframe, 'left', '0'); 
  } 
  goog.style.setSize(field, width, height); 
  if(goog.editor.node.isStandardsMode(field)) { 
    this.originalFieldLineHeight_ = field.style.lineHeight; 
    goog.style.setStyle(field, 'lineHeight', '0'); 
  } 
  field.innerHTML = html; 
  goog.style.setSize(iframe, width, height); 
  goog.style.setSize(field, oldWidth, oldHeight); 
  goog.style.setStyle(field, 'visibility', ''); 
  goog.dom.appendChild(field, iframe); 
  if(! this.shouldLoadAsynchronously()) { 
    var doc = iframe.contentWindow.document; 
    if(goog.editor.node.isStandardsMode(iframe.ownerDocument)) { 
      doc.open(); 
      doc.write('<!DOCTYPE HTML><html></html>'); 
      doc.close(); 
    } 
  } 
}; 
goog.editor.SeamlessField.prototype.getFieldFormatInfo = function(extraStyles) { 
  var originalElement = this.getOriginalElement(); 
  if(originalElement) { 
    return new goog.editor.icontent.FieldFormatInfo(this.id, goog.editor.node.isStandardsMode(originalElement), true, this.isFixedHeight(), extraStyles); 
  } 
  throw Error('no field'); 
}; 
goog.editor.SeamlessField.prototype.writeIframeContent = function(iframe, innerHtml, extraStyles) { 
  goog.style.setStyle(iframe, 'visibility', 'hidden'); 
  var formatInfo = this.getFieldFormatInfo(extraStyles); 
  var styleInfo = new goog.editor.icontent.FieldStyleInfo(this.getOriginalElement(), this.cssStyles + this.getIframeableCss()); 
  goog.editor.icontent.writeNormalInitialBlendedIframe(formatInfo, innerHtml, styleInfo, iframe); 
  this.doFieldSizingGecko(); 
  goog.style.setStyle(iframe, 'visibility', 'visible'); 
}; 
goog.editor.SeamlessField.prototype.restoreDom = function() { 
  if(this.usesIframe()) { 
    goog.dom.removeNode(this.getEditableIframe()); 
  } 
}; 
goog.editor.SeamlessField.prototype.disposeInternal = function() { 
  goog.events.unlistenByKey(this.listenForDragOverEventKey_); 
  goog.base(this, 'disposeInternal'); 
}; 
