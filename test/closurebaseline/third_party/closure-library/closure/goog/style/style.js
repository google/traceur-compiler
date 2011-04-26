
goog.provide('goog.style'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.math.Box'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.math.Rect'); 
goog.require('goog.math.Size'); 
goog.require('goog.object'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
goog.style.setStyle = function(element, style, opt_value) { 
  if(goog.isString(style)) { 
    goog.style.setStyle_(element, opt_value, style); 
  } else { 
    goog.object.forEach(style, goog.partial(goog.style.setStyle_, element)); 
  } 
}; 
goog.style.setStyle_ = function(element, value, style) { 
  element.style[goog.string.toCamelCase(style)]= value; 
}; 
goog.style.getStyle = function(element, property) { 
  return element.style[goog.string.toCamelCase(property)]|| ''; 
}; 
goog.style.getComputedStyle = function(element, property) { 
  var doc = goog.dom.getOwnerDocument(element); 
  if(doc.defaultView && doc.defaultView.getComputedStyle) { 
    var styles = doc.defaultView.getComputedStyle(element, null); 
    if(styles) { 
      return styles[property]|| styles.getPropertyValue(property); 
    } 
  } 
  return ''; 
}; 
goog.style.getCascadedStyle = function(element, style) { 
  return element.currentStyle ? element.currentStyle[style]: null; 
}; 
goog.style.getStyle_ = function(element, style) { 
  return goog.style.getComputedStyle(element, style) || goog.style.getCascadedStyle(element, style) || element.style[style]; 
}; 
goog.style.getComputedPosition = function(element) { 
  return goog.style.getStyle_(element, 'position'); 
}; 
goog.style.getBackgroundColor = function(element) { 
  return goog.style.getStyle_(element, 'backgroundColor'); 
}; 
goog.style.getComputedOverflowX = function(element) { 
  return goog.style.getStyle_(element, 'overflowX'); 
}; 
goog.style.getComputedOverflowY = function(element) { 
  return goog.style.getStyle_(element, 'overflowY'); 
}; 
goog.style.getComputedZIndex = function(element) { 
  return goog.style.getStyle_(element, 'zIndex'); 
}; 
goog.style.getComputedTextAlign = function(element) { 
  return goog.style.getStyle_(element, 'textAlign'); 
}; 
goog.style.getComputedCursor = function(element) { 
  return goog.style.getStyle_(element, 'cursor'); 
}; 
goog.style.setPosition = function(el, arg1, opt_arg2) { 
  var x, y; 
  var buggyGeckoSubPixelPos = goog.userAgent.GECKO &&(goog.userAgent.MAC || goog.userAgent.X11) && goog.userAgent.isVersion('1.9'); 
  if(arg1 instanceof goog.math.Coordinate) { 
    x = arg1.x; 
    y = arg1.y; 
  } else { 
    x = arg1; 
    y = opt_arg2; 
  } 
  el.style.left = goog.style.getPixelStyleValue_((x), buggyGeckoSubPixelPos); 
  el.style.top = goog.style.getPixelStyleValue_((y), buggyGeckoSubPixelPos); 
}; 
goog.style.getPosition = function(element) { 
  return new goog.math.Coordinate(element.offsetLeft, element.offsetTop); 
}; 
goog.style.getClientViewportElement = function(opt_node) { 
  var doc; 
  if(opt_node) { 
    if(opt_node.nodeType == goog.dom.NodeType.DOCUMENT) { 
      doc = opt_node; 
    } else { 
      doc = goog.dom.getOwnerDocument(opt_node); 
    } 
  } else { 
    doc = goog.dom.getDocument(); 
  } 
  if(goog.userAgent.IE && ! goog.userAgent.isVersion(9) && ! goog.dom.getDomHelper(doc).isCss1CompatMode()) { 
    return doc.body; 
  } 
  return doc.documentElement; 
}; 
goog.style.getBoundingClientRect_ = function(el) { 
  var rect = el.getBoundingClientRect(); 
  if(goog.userAgent.IE) { 
    var doc = el.ownerDocument; 
    rect.left -= doc.documentElement.clientLeft + doc.body.clientLeft; 
    rect.top -= doc.documentElement.clientTop + doc.body.clientTop; 
  } 
  return(rect); 
}; 
goog.style.getOffsetParent = function(element) { 
  if(goog.userAgent.IE) { 
    return element.offsetParent; 
  } 
  var doc = goog.dom.getOwnerDocument(element); 
  var positionStyle = goog.style.getStyle_(element, 'position'); 
  var skipStatic = positionStyle == 'fixed' || positionStyle == 'absolute'; 
  for(var parent = element.parentNode; parent && parent != doc; parent = parent.parentNode) { 
    positionStyle = goog.style.getStyle_((parent), 'position'); 
    skipStatic = skipStatic && positionStyle == 'static' && parent != doc.documentElement && parent != doc.body; 
    if(! skipStatic &&(parent.scrollWidth > parent.clientWidth || parent.scrollHeight > parent.clientHeight || positionStyle == 'fixed' || positionStyle == 'absolute' || positionStyle == 'relative')) { 
      return(parent); 
    } 
  } 
  return null; 
}; 
goog.style.getVisibleRectForElement = function(element) { 
  var visibleRect = new goog.math.Box(0, Infinity, Infinity, 0); 
  var dom = goog.dom.getDomHelper(element); 
  var body = dom.getDocument().body; 
  var scrollEl = dom.getDocumentScrollElement(); 
  var inContainer; 
  for(var el = element; el = goog.style.getOffsetParent(el);) { 
    if((! goog.userAgent.IE || el.clientWidth != 0) &&(! goog.userAgent.WEBKIT || el.clientHeight != 0 || el != body) &&(el.scrollWidth != el.clientWidth || el.scrollHeight != el.clientHeight) && goog.style.getStyle_(el, 'overflow') != 'visible') { 
      var pos = goog.style.getPageOffset(el); 
      var client = goog.style.getClientLeftTop(el); 
      pos.x += client.x; 
      pos.y += client.y; 
      visibleRect.top = Math.max(visibleRect.top, pos.y); 
      visibleRect.right = Math.min(visibleRect.right, pos.x + el.clientWidth); 
      visibleRect.bottom = Math.min(visibleRect.bottom, pos.y + el.clientHeight); 
      visibleRect.left = Math.max(visibleRect.left, pos.x); 
      inContainer = inContainer || el != scrollEl; 
    } 
  } 
  var scrollX = scrollEl.scrollLeft, scrollY = scrollEl.scrollTop; 
  if(goog.userAgent.WEBKIT) { 
    visibleRect.left += scrollX; 
    visibleRect.top += scrollY; 
  } else { 
    visibleRect.left = Math.max(visibleRect.left, scrollX); 
    visibleRect.top = Math.max(visibleRect.top, scrollY); 
  } 
  if(! inContainer || goog.userAgent.WEBKIT) { 
    visibleRect.right += scrollX; 
    visibleRect.bottom += scrollY; 
  } 
  var winSize = dom.getViewportSize(); 
  visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width); 
  visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height); 
  return visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left ? visibleRect: null; 
}; 
goog.style.scrollIntoContainerView = function(element, container, opt_center) { 
  var elementPos = goog.style.getPageOffset(element); 
  var containerPos = goog.style.getPageOffset(container); 
  var containerBorder = goog.style.getBorderBox(container); 
  var relX = elementPos.x - containerPos.x - containerBorder.left; 
  var relY = elementPos.y - containerPos.y - containerBorder.top; 
  var spaceX = container.clientWidth - element.offsetWidth; 
  var spaceY = container.clientHeight - element.offsetHeight; 
  if(opt_center) { 
    container.scrollLeft += relX - spaceX / 2; 
    container.scrollTop += relY - spaceY / 2; 
  } else { 
    container.scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0)); 
    container.scrollTop += Math.min(relY, Math.max(relY - spaceY, 0)); 
  } 
}; 
goog.style.getClientLeftTop = function(el) { 
  if(goog.userAgent.GECKO && ! goog.userAgent.isVersion('1.9')) { 
    var left = parseFloat(goog.style.getComputedStyle(el, 'borderLeftWidth')); 
    if(goog.style.isRightToLeft(el)) { 
      var scrollbarWidth = el.offsetWidth - el.clientWidth - left - parseFloat(goog.style.getComputedStyle(el, 'borderRightWidth')); 
      left += scrollbarWidth; 
    } 
    return new goog.math.Coordinate(left, parseFloat(goog.style.getComputedStyle(el, 'borderTopWidth'))); 
  } 
  return new goog.math.Coordinate(el.clientLeft, el.clientTop); 
}; 
goog.style.getPageOffset = function(el) { 
  var box, doc = goog.dom.getOwnerDocument(el); 
  var positionStyle = goog.style.getStyle_(el, 'position'); 
  var BUGGY_GECKO_BOX_OBJECT = goog.userAgent.GECKO && doc.getBoxObjectFor && ! el.getBoundingClientRect && positionStyle == 'absolute' &&(box = doc.getBoxObjectFor(el)) &&(box.screenX < 0 || box.screenY < 0); 
  var pos = new goog.math.Coordinate(0, 0); 
  var viewportElement = goog.style.getClientViewportElement(doc); 
  if(el == viewportElement) { 
    return pos; 
  } 
  if(el.getBoundingClientRect) { 
    box = goog.style.getBoundingClientRect_(el); 
    var scrollCoord = goog.dom.getDomHelper(doc).getDocumentScroll(); 
    pos.x = box.left + scrollCoord.x; 
    pos.y = box.top + scrollCoord.y; 
  } else if(doc.getBoxObjectFor && ! BUGGY_GECKO_BOX_OBJECT) { 
    box = doc.getBoxObjectFor(el); 
    var vpBox = doc.getBoxObjectFor(viewportElement); 
    pos.x = box.screenX - vpBox.screenX; 
    pos.y = box.screenY - vpBox.screenY; 
  } else { 
    var parent = el; 
    do { 
      pos.x += parent.offsetLeft; 
      pos.y += parent.offsetTop; 
      if(parent != el) { 
        pos.x += parent.clientLeft || 0; 
        pos.y += parent.clientTop || 0; 
      } 
      if(goog.userAgent.WEBKIT && goog.style.getComputedPosition(parent) == 'fixed') { 
        pos.x += doc.body.scrollLeft; 
        pos.y += doc.body.scrollTop; 
        break; 
      } 
      parent = parent.offsetParent; 
    } while(parent && parent != el); 
    if(goog.userAgent.OPERA ||(goog.userAgent.WEBKIT && positionStyle == 'absolute')) { 
      pos.y -= doc.body.offsetTop; 
    } 
    for(parent = el;(parent = goog.style.getOffsetParent(parent)) && parent != doc.body && parent != viewportElement;) { 
      pos.x -= parent.scrollLeft; 
      if(! goog.userAgent.OPERA || parent.tagName != 'TR') { 
        pos.y -= parent.scrollTop; 
      } 
    } 
  } 
  return pos; 
}; 
goog.style.getPageOffsetLeft = function(el) { 
  return goog.style.getPageOffset(el).x; 
}; 
goog.style.getPageOffsetTop = function(el) { 
  return goog.style.getPageOffset(el).y; 
}; 
goog.style.getFramedPageOffset = function(el, relativeWin) { 
  var position = new goog.math.Coordinate(0, 0); 
  var currentWin = goog.dom.getWindow(goog.dom.getOwnerDocument(el)); 
  var currentEl = el; 
  do { 
    var offset = currentWin == relativeWin ? goog.style.getPageOffset(currentEl): goog.style.getClientPosition(currentEl); 
    position.x += offset.x; 
    position.y += offset.y; 
  } while(currentWin && currentWin != relativeWin &&(currentEl = currentWin.frameElement) &&(currentWin = currentWin.parent)); 
  return position; 
}; 
goog.style.translateRectForAnotherFrame = function(rect, origBase, newBase) { 
  if(origBase.getDocument() != newBase.getDocument()) { 
    var body = origBase.getDocument().body; 
    var pos = goog.style.getFramedPageOffset(body, newBase.getWindow()); 
    pos = goog.math.Coordinate.difference(pos, goog.style.getPageOffset(body)); 
    if(goog.userAgent.IE && ! origBase.isCss1CompatMode()) { 
      pos = goog.math.Coordinate.difference(pos, origBase.getDocumentScroll()); 
    } 
    rect.left += pos.x; 
    rect.top += pos.y; 
  } 
}; 
goog.style.getRelativePosition = function(a, b) { 
  var ap = goog.style.getClientPosition(a); 
  var bp = goog.style.getClientPosition(b); 
  return new goog.math.Coordinate(ap.x - bp.x, ap.y - bp.y); 
}; 
goog.style.getClientPosition = function(el) { 
  var pos = new goog.math.Coordinate; 
  if(el.nodeType == goog.dom.NodeType.ELEMENT) { 
    if(el.getBoundingClientRect) { 
      var box = goog.style.getBoundingClientRect_((el)); 
      pos.x = box.left; 
      pos.y = box.top; 
    } else { 
      var scrollCoord = goog.dom.getDomHelper((el)).getDocumentScroll(); 
      var pageCoord = goog.style.getPageOffset((el)); 
      pos.x = pageCoord.x - scrollCoord.x; 
      pos.y = pageCoord.y - scrollCoord.y; 
    } 
  } else { 
    var isAbstractedEvent = goog.isFunction(el.getBrowserEvent); 
    var targetEvent = el; 
    if(el.targetTouches) { 
      targetEvent = el.targetTouches[0]; 
    } else if(isAbstractedEvent && el.getBrowserEvent().targetTouches) { 
      targetEvent = el.getBrowserEvent().targetTouches[0]; 
    } 
    pos.x = targetEvent.clientX; 
    pos.y = targetEvent.clientY; 
  } 
  return pos; 
}; 
goog.style.setPageOffset = function(el, x, opt_y) { 
  var cur = goog.style.getPageOffset(el); 
  if(x instanceof goog.math.Coordinate) { 
    opt_y = x.y; 
    x = x.x; 
  } 
  var dx = x - cur.x; 
  var dy = opt_y - cur.y; 
  goog.style.setPosition(el, el.offsetLeft + dx, el.offsetTop + dy); 
}; 
goog.style.setSize = function(element, w, opt_h) { 
  var h; 
  if(w instanceof goog.math.Size) { 
    h = w.height; 
    w = w.width; 
  } else { 
    if(opt_h == undefined) { 
      throw Error('missing height argument'); 
    } 
    h = opt_h; 
  } 
  goog.style.setWidth(element,(w)); 
  goog.style.setHeight(element,(h)); 
}; 
goog.style.getPixelStyleValue_ = function(value, round) { 
  if(typeof value == 'number') { 
    value =(round ? Math.round(value): value) + 'px'; 
  } 
  return value; 
}; 
goog.style.setHeight = function(element, height) { 
  element.style.height = goog.style.getPixelStyleValue_(height, true); 
}; 
goog.style.setWidth = function(element, width) { 
  element.style.width = goog.style.getPixelStyleValue_(width, true); 
}; 
goog.style.getSize = function(element) { 
  if(goog.style.getStyle_(element, 'display') != 'none') { 
    return new goog.math.Size(element.offsetWidth, element.offsetHeight); 
  } 
  var style = element.style; 
  var originalDisplay = style.display; 
  var originalVisibility = style.visibility; 
  var originalPosition = style.position; 
  style.visibility = 'hidden'; 
  style.position = 'absolute'; 
  style.display = 'inline'; 
  var originalWidth = element.offsetWidth; 
  var originalHeight = element.offsetHeight; 
  style.display = originalDisplay; 
  style.position = originalPosition; 
  style.visibility = originalVisibility; 
  return new goog.math.Size(originalWidth, originalHeight); 
}; 
goog.style.getBounds = function(element) { 
  var o = goog.style.getPageOffset(element); 
  var s = goog.style.getSize(element); 
  return new goog.math.Rect(o.x, o.y, s.width, s.height); 
}; 
goog.style.toCamelCase = function(selector) { 
  return goog.string.toCamelCase(String(selector)); 
}; 
goog.style.toSelectorCase = function(selector) { 
  return goog.string.toSelectorCase(selector); 
}; 
goog.style.getOpacity = function(el) { 
  var style = el.style; 
  var result = ''; 
  if('opacity' in style) { 
    result = style.opacity; 
  } else if('MozOpacity' in style) { 
    result = style.MozOpacity; 
  } else if('filter' in style) { 
    var match = style.filter.match(/alpha\(opacity=([\d.]+)\)/); 
    if(match) { 
      result = String(match[1]/ 100); 
    } 
  } 
  return result == '' ? result: Number(result); 
}; 
goog.style.setOpacity = function(el, alpha) { 
  var style = el.style; 
  if('opacity' in style) { 
    style.opacity = alpha; 
  } else if('MozOpacity' in style) { 
    style.MozOpacity = alpha; 
  } else if('filter' in style) { 
    if(alpha === '') { 
      style.filter = ''; 
    } else { 
      style.filter = 'alpha(opacity=' + alpha * 100 + ')'; 
    } 
  } 
}; 
goog.style.setTransparentBackgroundImage = function(el, src) { 
  var style = el.style; 
  if(goog.userAgent.IE && ! goog.userAgent.isVersion('8')) { 
    style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(' + 'src="' + src + '", sizingMethod="crop")'; 
  } else { 
    style.backgroundImage = 'url(' + src + ')'; 
    style.backgroundPosition = 'top left'; 
    style.backgroundRepeat = 'no-repeat'; 
  } 
}; 
goog.style.clearTransparentBackgroundImage = function(el) { 
  var style = el.style; 
  if('filter' in style) { 
    style.filter = ''; 
  } else { 
    style.backgroundImage = 'none'; 
  } 
}; 
goog.style.showElement = function(el, display) { 
  el.style.display = display ? '': 'none'; 
}; 
goog.style.isElementShown = function(el) { 
  return el.style.display != 'none'; 
}; 
goog.style.installStyles = function(stylesString, opt_node) { 
  var dh = goog.dom.getDomHelper(opt_node); 
  var styleSheet = null; 
  if(goog.userAgent.IE) { 
    styleSheet = dh.getDocument().createStyleSheet(); 
    goog.style.setStyles(styleSheet, stylesString); 
  } else { 
    var head = dh.getElementsByTagNameAndClass('head')[0]; 
    if(! head) { 
      var body = dh.getElementsByTagNameAndClass('body')[0]; 
      head = dh.createDom('head'); 
      body.parentNode.insertBefore(head, body); 
    } 
    styleSheet = dh.createDom('style'); 
    goog.style.setStyles(styleSheet, stylesString); 
    dh.appendChild(head, styleSheet); 
  } 
  return styleSheet; 
}; 
goog.style.uninstallStyles = function(styleSheet) { 
  var node = styleSheet.ownerNode || styleSheet.owningElement ||(styleSheet); 
  goog.dom.removeNode(node); 
}; 
goog.style.setStyles = function(element, stylesString) { 
  if(goog.userAgent.IE) { 
    element.cssText = stylesString; 
  } else { 
    var propToSet = goog.userAgent.WEBKIT ? 'innerText': 'innerHTML'; 
    element[propToSet]= stylesString; 
  } 
}; 
goog.style.setPreWrap = function(el) { 
  var style = el.style; 
  if(goog.userAgent.IE && ! goog.userAgent.isVersion('8')) { 
    style.whiteSpace = 'pre'; 
    style.wordWrap = 'break-word'; 
  } else if(goog.userAgent.GECKO) { 
    style.whiteSpace = '-moz-pre-wrap'; 
  } else { 
    style.whiteSpace = 'pre-wrap'; 
  } 
}; 
goog.style.setInlineBlock = function(el) { 
  var style = el.style; 
  style.position = 'relative'; 
  if(goog.userAgent.IE && ! goog.userAgent.isVersion('8')) { 
    style.zoom = '1'; 
    style.display = 'inline'; 
  } else if(goog.userAgent.GECKO) { 
    style.display = goog.userAgent.isVersion('1.9a') ? 'inline-block': '-moz-inline-box'; 
  } else { 
    style.display = 'inline-block'; 
  } 
}; 
goog.style.isRightToLeft = function(el) { 
  return 'rtl' == goog.style.getStyle_(el, 'direction'); 
}; 
goog.style.unselectableStyle_ = goog.userAgent.GECKO ? 'MozUserSelect': goog.userAgent.WEBKIT ? 'WebkitUserSelect': null; 
goog.style.isUnselectable = function(el) { 
  if(goog.style.unselectableStyle_) { 
    return el.style[goog.style.unselectableStyle_].toLowerCase() == 'none'; 
  } else if(goog.userAgent.IE || goog.userAgent.OPERA) { 
    return el.getAttribute('unselectable') == 'on'; 
  } 
  return false; 
}; 
goog.style.setUnselectable = function(el, unselectable, opt_noRecurse) { 
  var descendants = ! opt_noRecurse ? el.getElementsByTagName('*'): null; 
  var name = goog.style.unselectableStyle_; 
  if(name) { 
    var value = unselectable ? 'none': ''; 
    el.style[name]= value; 
    if(descendants) { 
      for(var i = 0, descendant; descendant = descendants[i]; i ++) { 
        descendant.style[name]= value; 
      } 
    } 
  } else if(goog.userAgent.IE || goog.userAgent.OPERA) { 
    var value = unselectable ? 'on': ''; 
    el.setAttribute('unselectable', value); 
    if(descendants) { 
      for(var i = 0, descendant; descendant = descendants[i]; i ++) { 
        descendant.setAttribute('unselectable', value); 
      } 
    } 
  } 
}; 
goog.style.getBorderBoxSize = function(element) { 
  return new goog.math.Size(element.offsetWidth, element.offsetHeight); 
}; 
goog.style.setBorderBoxSize = function(element, size) { 
  var doc = goog.dom.getOwnerDocument(element); 
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode(); 
  if(goog.userAgent.IE &&(! isCss1CompatMode || ! goog.userAgent.isVersion('8'))) { 
    var style = element.style; 
    if(isCss1CompatMode) { 
      var paddingBox = goog.style.getPaddingBox(element); 
      var borderBox = goog.style.getBorderBox(element); 
      style.pixelWidth = size.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right; 
      style.pixelHeight = size.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom; 
    } else { 
      style.pixelWidth = size.width; 
      style.pixelHeight = size.height; 
    } 
  } else { 
    goog.style.setBoxSizingSize_(element, size, 'border-box'); 
  } 
}; 
goog.style.getContentBoxSize = function(element) { 
  var doc = goog.dom.getOwnerDocument(element); 
  var ieCurrentStyle = goog.userAgent.IE && element.currentStyle; 
  if(ieCurrentStyle && goog.dom.getDomHelper(doc).isCss1CompatMode() && ieCurrentStyle.width != 'auto' && ieCurrentStyle.height != 'auto' && ! ieCurrentStyle.boxSizing) { 
    var width = goog.style.getIePixelValue_(element, ieCurrentStyle.width, 'width', 'pixelWidth'); 
    var height = goog.style.getIePixelValue_(element, ieCurrentStyle.height, 'height', 'pixelHeight'); 
    return new goog.math.Size(width, height); 
  } else { 
    var borderBoxSize = goog.style.getBorderBoxSize(element); 
    var paddingBox = goog.style.getPaddingBox(element); 
    var borderBox = goog.style.getBorderBox(element); 
    return new goog.math.Size(borderBoxSize.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right, borderBoxSize.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom); 
  } 
}; 
goog.style.setContentBoxSize = function(element, size) { 
  var doc = goog.dom.getOwnerDocument(element); 
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode(); 
  if(goog.userAgent.IE &&(! isCss1CompatMode || ! goog.userAgent.isVersion('8'))) { 
    var style = element.style; 
    if(isCss1CompatMode) { 
      style.pixelWidth = size.width; 
      style.pixelHeight = size.height; 
    } else { 
      var paddingBox = goog.style.getPaddingBox(element); 
      var borderBox = goog.style.getBorderBox(element); 
      style.pixelWidth = size.width + borderBox.left + paddingBox.left + paddingBox.right + borderBox.right; 
      style.pixelHeight = size.height + borderBox.top + paddingBox.top + paddingBox.bottom + borderBox.bottom; 
    } 
  } else { 
    goog.style.setBoxSizingSize_(element, size, 'content-box'); 
  } 
}; 
goog.style.setBoxSizingSize_ = function(element, size, boxSizing) { 
  var style = element.style; 
  if(goog.userAgent.GECKO) { 
    style.MozBoxSizing = boxSizing; 
  } else if(goog.userAgent.WEBKIT) { 
    style.WebkitBoxSizing = boxSizing; 
  } else { 
    style.boxSizing = boxSizing; 
  } 
  style.width = size.width + 'px'; 
  style.height = size.height + 'px'; 
}; 
goog.style.getIePixelValue_ = function(element, value, name, pixelName) { 
  if(/^\d+px?$/.test(value)) { 
    return parseInt(value, 10); 
  } else { 
    var oldStyleValue = element.style[name]; 
    var oldRuntimeValue = element.runtimeStyle[name]; 
    element.runtimeStyle[name]= element.currentStyle[name]; 
    element.style[name]= value; 
    var pixelValue = element.style[pixelName]; 
    element.style[name]= oldStyleValue; 
    element.runtimeStyle[name]= oldRuntimeValue; 
    return pixelValue; 
  } 
}; 
goog.style.getIePixelDistance_ = function(element, propName) { 
  return goog.style.getIePixelValue_(element, goog.style.getCascadedStyle(element, propName), 'left', 'pixelLeft'); 
}; 
goog.style.getBox_ = function(element, stylePrefix) { 
  if(goog.userAgent.IE) { 
    var left = goog.style.getIePixelDistance_(element, stylePrefix + 'Left'); 
    var right = goog.style.getIePixelDistance_(element, stylePrefix + 'Right'); 
    var top = goog.style.getIePixelDistance_(element, stylePrefix + 'Top'); 
    var bottom = goog.style.getIePixelDistance_(element, stylePrefix + 'Bottom'); 
    return new goog.math.Box(top, right, bottom, left); 
  } else { 
    var left =(goog.style.getComputedStyle(element, stylePrefix + 'Left')); 
    var right =(goog.style.getComputedStyle(element, stylePrefix + 'Right')); 
    var top =(goog.style.getComputedStyle(element, stylePrefix + 'Top')); 
    var bottom =(goog.style.getComputedStyle(element, stylePrefix + 'Bottom')); 
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left)); 
  } 
}; 
goog.style.getPaddingBox = function(element) { 
  return goog.style.getBox_(element, 'padding'); 
}; 
goog.style.getMarginBox = function(element) { 
  return goog.style.getBox_(element, 'margin'); 
}; 
goog.style.ieBorderWidthKeywords_ = { 
  'thin': 2, 
  'medium': 4, 
  'thick': 6 
}; 
goog.style.getIePixelBorder_ = function(element, prop) { 
  if(goog.style.getCascadedStyle(element, prop + 'Style') == 'none') { 
    return 0; 
  } 
  var width = goog.style.getCascadedStyle(element, prop + 'Width'); 
  if(width in goog.style.ieBorderWidthKeywords_) { 
    return goog.style.ieBorderWidthKeywords_[width]; 
  } 
  return goog.style.getIePixelValue_(element, width, 'left', 'pixelLeft'); 
}; 
goog.style.getBorderBox = function(element) { 
  if(goog.userAgent.IE) { 
    var left = goog.style.getIePixelBorder_(element, 'borderLeft'); 
    var right = goog.style.getIePixelBorder_(element, 'borderRight'); 
    var top = goog.style.getIePixelBorder_(element, 'borderTop'); 
    var bottom = goog.style.getIePixelBorder_(element, 'borderBottom'); 
    return new goog.math.Box(top, right, bottom, left); 
  } else { 
    var left =(goog.style.getComputedStyle(element, 'borderLeftWidth')); 
    var right =(goog.style.getComputedStyle(element, 'borderRightWidth')); 
    var top =(goog.style.getComputedStyle(element, 'borderTopWidth')); 
    var bottom =(goog.style.getComputedStyle(element, 'borderBottomWidth')); 
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left)); 
  } 
}; 
goog.style.getFontFamily = function(el) { 
  var doc = goog.dom.getOwnerDocument(el); 
  var font = ''; 
  if(doc.body.createTextRange) { 
    var range = doc.body.createTextRange(); 
    range.moveToElementText(el); 
    try { 
      font = range.queryCommandValue('FontName'); 
    } catch(e) { 
      font = ''; 
    } 
  } 
  if(! font) { 
    font = goog.style.getStyle_(el, 'fontFamily'); 
  } 
  var fontsArray = font.split(','); 
  if(fontsArray.length > 1) font = fontsArray[0]; 
  return goog.string.stripQuotes(font, '"\''); 
}; 
goog.style.lengthUnitRegex_ = /[^\d]+$/; 
goog.style.getLengthUnits = function(value) { 
  var units = value.match(goog.style.lengthUnitRegex_); 
  return units && units[0]|| null; 
}; 
goog.style.ABSOLUTE_CSS_LENGTH_UNITS_ = { 
  'cm': 1, 
  'in': 1, 
  'mm': 1, 
  'pc': 1, 
  'pt': 1 
}; 
goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_ = { 
  'em': 1, 
  'ex': 1 
}; 
goog.style.getFontSize = function(el) { 
  var fontSize = goog.style.getStyle_(el, 'fontSize'); 
  var sizeUnits = goog.style.getLengthUnits(fontSize); 
  if(fontSize && 'px' == sizeUnits) { 
    return parseInt(fontSize, 10); 
  } 
  if(goog.userAgent.IE) { 
    if(sizeUnits in goog.style.ABSOLUTE_CSS_LENGTH_UNITS_) { 
      return goog.style.getIePixelValue_(el, fontSize, 'left', 'pixelLeft'); 
    } else if(el.parentNode && el.parentNode.nodeType == goog.dom.NodeType.ELEMENT && sizeUnits in goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_) { 
      var parentElement =(el.parentNode); 
      var parentSize = goog.style.getStyle_(parentElement, 'fontSize'); 
      return goog.style.getIePixelValue_(parentElement, fontSize == parentSize ? '1em': fontSize, 'left', 'pixelLeft'); 
    } 
  } 
  var sizeElement = goog.dom.createDom('span', { 'style': 'visibility:hidden;position:absolute;' + 'line-height:0;padding:0;margin:0;border:0;height:1em;' }); 
  goog.dom.appendChild(el, sizeElement); 
  fontSize = sizeElement.offsetHeight; 
  goog.dom.removeNode(sizeElement); 
  return fontSize; 
}; 
goog.style.parseStyleAttribute = function(value) { 
  var result = { }; 
  goog.array.forEach(value.split(/\s*;\s*/), function(pair) { 
    var keyValue = pair.split(/\s*:\s*/); 
    if(keyValue.length == 2) { 
      result[goog.string.toCamelCase(keyValue[0].toLowerCase())]= keyValue[1]; 
    } 
  }); 
  return result; 
}; 
goog.style.toStyleAttribute = function(obj) { 
  var buffer =[]; 
  goog.object.forEach(obj, function(value, key) { 
    buffer.push(goog.string.toSelectorCase(key), ':', value, ';'); 
  }); 
  return buffer.join(''); 
}; 
goog.style.setFloat = function(el, value) { 
  el.style[goog.userAgent.IE ? 'styleFloat': 'cssFloat']= value; 
}; 
goog.style.getFloat = function(el) { 
  return el.style[goog.userAgent.IE ? 'styleFloat': 'cssFloat']|| ''; 
}; 
goog.style.getScrollbarWidth = function() { 
  var mockElement = goog.dom.createElement('div'); 
  mockElement.style.cssText = 'visibility:hidden;overflow:scroll;' + 'position:absolute;top:0;width:100px;height:100px'; 
  goog.dom.appendChild(goog.dom.getDocument().body, mockElement); 
  var width = mockElement.offsetWidth - mockElement.clientWidth; 
  goog.dom.removeNode(mockElement); 
  return width; 
}; 
