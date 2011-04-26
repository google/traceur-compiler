
goog.provide('goog.ui.AutoComplete.Renderer'); 
goog.provide('goog.ui.AutoComplete.Renderer.CustomRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.fx.dom.FadeInAndShow'); 
goog.require('goog.fx.dom.FadeOutAndHide'); 
goog.require('goog.iter'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.ui.AutoComplete'); 
goog.require('goog.ui.IdGenerator'); 
goog.require('goog.userAgent'); 
goog.ui.AutoComplete.Renderer = function(opt_parentNode, opt_customRenderer, opt_rightAlign, opt_useStandardHighlighting) { 
  goog.events.EventTarget.call(this); 
  this.parent_ = opt_parentNode || goog.dom.getDocument().body; 
  this.dom_ = goog.dom.getDomHelper(this.parent_); 
  this.reposition_ = ! opt_parentNode; 
  this.element_ = null; 
  this.token_ = ''; 
  this.rows_ =[]; 
  this.hilitedRow_ = - 1; 
  this.startRenderingRows_ = - 1; 
  this.visible_ = false; 
  this.className = goog.getCssName('ac-renderer'); 
  this.rowClassName = goog.getCssName('ac-row'); 
  this.legacyActiveClassName_ = goog.getCssName('active'); 
  this.activeClassName = goog.getCssName('ac-active'); 
  this.highlightedClassName = goog.getCssName('ac-highlighted'); 
  this.customRenderer_ = opt_customRenderer || null; 
  this.useStandardHighlighting_ = opt_useStandardHighlighting != null ? opt_useStandardHighlighting: true; 
  this.highlightAllTokens_ = false; 
  this.rightAlign_ = opt_rightAlign != null ? opt_rightAlign: false; 
  this.keepAligned_ = null; 
  this.topAlign_ = false; 
  this.menuFadeDuration_ = 0; 
}; 
goog.inherits(goog.ui.AutoComplete.Renderer, goog.events.EventTarget); 
goog.ui.AutoComplete.Renderer.DELAY_BEFORE_MOUSEOVER = 300; 
goog.ui.AutoComplete.Renderer.prototype.getElement = function() { 
  return this.element_; 
}; 
goog.ui.AutoComplete.Renderer.prototype.setTopAlign = function(align) { 
  this.topAlign_ = align; 
}; 
goog.ui.AutoComplete.Renderer.prototype.setUseStandardHighlighting = function(useStandardHighlighting) { 
  this.useStandardHighlighting_ = useStandardHighlighting; 
}; 
goog.ui.AutoComplete.Renderer.prototype.setHighlightAllTokens = function(highlightAllTokens) { 
  this.highlightAllTokens_ = highlightAllTokens; 
}; 
goog.ui.AutoComplete.Renderer.prototype.setMenuFadeDuration = function(duration) { 
  this.menuFadeDuration_ = duration; 
}; 
goog.ui.AutoComplete.Renderer.prototype.renderRows = function(rows, token, opt_target) { 
  this.token_ = token; 
  this.rows_ = rows; 
  this.hilitedRow_ = - 1; 
  this.startRenderingRows_ = goog.now(); 
  this.target_ = opt_target; 
  this.rowDivs_ =[]; 
  this.redraw(); 
}; 
goog.ui.AutoComplete.Renderer.prototype.dismiss = function() { 
  if(this.target_) { 
    goog.dom.a11y.setActiveDescendant(this.target_, null); 
  } 
  if(this.visible_) { 
    this.visible_ = false; 
    if(this.menuFadeDuration_ > 0) { 
      new goog.fx.dom.FadeOutAndHide(this.element_, this.menuFadeDuration_).play(); 
    } else { 
      goog.style.showElement(this.element_, false); 
    } 
  } 
}; 
goog.ui.AutoComplete.Renderer.prototype.show = function() { 
  if(! this.visible_) { 
    this.visible_ = true; 
    if(this.menuFadeDuration_ > 0) { 
      new goog.fx.dom.FadeInAndShow(this.element_, this.menuFadeDuration_).play(); 
    } else { 
      goog.style.showElement(this.element_, true); 
    } 
  } 
}; 
goog.ui.AutoComplete.Renderer.prototype.isVisible = function() { 
  return this.visible_; 
}; 
goog.ui.AutoComplete.Renderer.prototype.hiliteRow = function(index) { 
  this.hiliteNone(); 
  this.hilitedRow_ = index; 
  if(index >= 0 && index < this.element_.childNodes.length) { 
    var rowDiv = this.rowDivs_[index]; 
    goog.dom.classes.add(rowDiv, this.activeClassName, this.legacyActiveClassName_); 
    if(this.target_) { 
      goog.dom.a11y.setActiveDescendant(this.target_, rowDiv); 
    } 
    goog.style.scrollIntoContainerView(rowDiv, this.element_); 
  } 
}; 
goog.ui.AutoComplete.Renderer.prototype.hiliteNone = function() { 
  if(this.hilitedRow_ >= 0) { 
    goog.dom.classes.remove(this.rowDivs_[this.hilitedRow_], this.activeClassName, this.legacyActiveClassName_); 
  } 
}; 
goog.ui.AutoComplete.Renderer.prototype.hiliteId = function(id) { 
  if(id == - 1) { 
    this.hiliteRow(- 1); 
  } else { 
    for(var i = 0; i < this.rows_.length; i ++) { 
      if(this.rows_[i].id == id) { 
        this.hiliteRow(i); 
        return; 
      } 
    } 
  } 
}; 
goog.ui.AutoComplete.Renderer.prototype.setMenuClasses_ = function(elt) { 
  goog.dom.classes.add(elt, this.className); 
}; 
goog.ui.AutoComplete.Renderer.prototype.maybeCreateElement_ = function() { 
  if(! this.element_) { 
    var el = this.dom_.createDom('div', { style: 'display:none' }); 
    this.element_ = el; 
    this.setMenuClasses_(el); 
    goog.dom.a11y.setRole(el, goog.dom.a11y.Role.LISTBOX); 
    el.id = goog.ui.IdGenerator.getInstance().getNextUniqueId(); 
    if(this.target_) { 
      goog.dom.a11y.setRole(this.target_, goog.dom.a11y.Role.COMBOBOX); 
      goog.dom.a11y.setState(this.target_, goog.dom.a11y.State.AUTOCOMPLETE, 'list'); 
      goog.dom.a11y.setState(this.target_, goog.dom.a11y.State.HASPOPUP, true); 
    } 
    this.dom_.appendChild(this.parent_, el); 
    goog.events.listen(el, goog.events.EventType.CLICK, this.handleClick_, false, this); 
    goog.events.listen(el, goog.events.EventType.MOUSEDOWN, this.handleMouseDown_, false, this); 
    goog.events.listen(this.dom_.getDocument(), goog.events.EventType.MOUSEDOWN, this.handleDocumentMousedown_, false, this); 
    goog.events.listen(el, goog.events.EventType.MOUSEOVER, this.handleMouseOver_, false, this); 
  } 
}; 
goog.ui.AutoComplete.Renderer.prototype.redraw = function() { 
  this.maybeCreateElement_(); 
  if(this.topAlign_) { 
    this.element_.style.visibility = 'hidden'; 
  } 
  this.rowDivs_.length = 0; 
  this.dom_.removeChildren(this.element_); 
  if(this.customRenderer_ && this.customRenderer_.render) { 
    this.customRenderer_.render(this, this.element_, this.rows_, this.token_); 
  } else { 
    var curRow = null; 
    goog.iter.forEach(this.rows_, function(row) { 
      row = this.renderRowHtml(row, this.token_); 
      if(this.topAlign_) { 
        this.element_.insertBefore(row, curRow); 
      } else { 
        this.dom_.appendChild(this.element_, row); 
      } 
      curRow = row; 
    }, this); 
  } 
  if(this.rows_.length == 0) { 
    this.dismiss(); 
    return; 
  } else { 
    this.show(); 
  } 
  this.preventMacScrollbarResurface_(this.element_); 
  this.reposition(); 
  goog.style.setUnselectable(this.element_, true); 
}; 
goog.ui.AutoComplete.Renderer.prototype.reposition = function() { 
  if(this.target_ && this.reposition_) { 
    var topLeft = goog.style.getPageOffset(this.target_); 
    var locationNodeSize = goog.style.getSize(this.target_); 
    var viewSize = goog.style.getSize(goog.style.getClientViewportElement(this.target_)); 
    var elSize = goog.style.getSize(this.element_); 
    topLeft.y = this.topAlign_ ? topLeft.y - elSize.height: topLeft.y + locationNodeSize.height; 
    if((this.rightAlign_ || topLeft.x + elSize.width > viewSize.width) && this.keepAligned_ != 'LEFT') { 
      topLeft.x = topLeft.x + locationNodeSize.width - elSize.width; 
      this.keepAligned_ = 'RIGHT'; 
    } else { 
      this.keepAligned_ = 'LEFT'; 
    } 
    goog.style.setPageOffset(this.element_, topLeft); 
    if(this.topAlign_) { 
      this.element_.style.visibility = 'visible'; 
    } 
  } 
}; 
goog.ui.AutoComplete.Renderer.prototype.setAutoPosition = function(auto) { 
  this.reposition_ = auto; 
}; 
goog.ui.AutoComplete.Renderer.prototype.disposeInternal = function() { 
  goog.ui.AutoComplete.Renderer.superClass_.disposeInternal.call(this); 
  if(this.element_) { 
    goog.events.unlisten(this.element_, goog.events.EventType.CLICK, this.handleClick_, false, this); 
    goog.events.unlisten(this.element_, goog.events.EventType.MOUSEDOWN, this.handleMouseDown_, false, this); 
    goog.events.unlisten(this.dom_.getDocument(), goog.events.EventType.MOUSEDOWN, this.handleDocumentMousedown_, false, this); 
    goog.events.unlisten(this.element_, goog.events.EventType.MOUSEOVER, this.handleMouseOver_, false, this); 
    this.dom_.removeNode(this.element_); 
    this.element_ = null; 
    this.visible_ = false; 
  } 
  delete this.parent_; 
}; 
goog.ui.AutoComplete.Renderer.prototype.preventMacScrollbarResurface_ = function(node) { 
  if(goog.userAgent.GECKO && goog.userAgent.MAC) { 
    node.style.width = ''; 
    node.style.overflow = 'visible'; 
    node.style.width = node.offsetWidth; 
    node.style.overflow = 'auto'; 
  } 
}; 
goog.ui.AutoComplete.Renderer.prototype.renderRowContents_ = function(row, token, node) { 
  node.innerHTML = goog.string.htmlEscape(row.data.toString()); 
}; 
goog.ui.AutoComplete.Renderer.prototype.hiliteMatchingText_ = function(node, tokenOrArray) { 
  if(node.nodeType == goog.dom.NodeType.TEXT) { 
    var rest = null; 
    if(goog.isArray(tokenOrArray) && tokenOrArray.length > 1 && ! this.highlightAllTokens_) { 
      rest = goog.array.slice(tokenOrArray, 1); 
    } 
    var token = this.getTokenRegExp_(tokenOrArray); 
    if(token.length == 0) return; 
    var text = node.nodeValue; 
    var re = new RegExp('(.*?)(^|\\W+)(' + token + ')', 'gi'); 
    var textNodes =[]; 
    var lastIndex = 0; 
    var match = re.exec(text); 
    var numMatches = 0; 
    while(match) { 
      numMatches ++; 
      textNodes.push(match[1]); 
      textNodes.push(match[2]); 
      textNodes.push(match[3]); 
      lastIndex = re.lastIndex; 
      match = re.exec(text); 
    } 
    textNodes.push(text.substring(lastIndex)); 
    if(textNodes.length > 1) { 
      var maxNumToBold = ! this.highlightAllTokens_ ? 1: numMatches; 
      for(var i = 0; i < maxNumToBold; i ++) { 
        var idx = 3 * i; 
        node.nodeValue = textNodes[idx]+ textNodes[idx + 1]; 
        var boldTag = this.dom_.createElement('b'); 
        boldTag.className = this.highlightedClassName; 
        this.dom_.appendChild(boldTag, this.dom_.createTextNode(textNodes[idx + 2])); 
        boldTag = node.parentNode.insertBefore(boldTag, node.nextSibling); 
        node.parentNode.insertBefore(this.dom_.createTextNode(''), boldTag.nextSibling); 
        node = boldTag.nextSibling; 
      } 
      var remainingTextNodes = goog.array.slice(textNodes, maxNumToBold * 3); 
      node.nodeValue = remainingTextNodes.join(''); 
    } else if(rest) { 
      this.hiliteMatchingText_(node, rest); 
    } 
  } else { 
    var child = node.firstChild; 
    while(child) { 
      var nextChild = child.nextSibling; 
      this.hiliteMatchingText_(child, tokenOrArray); 
      child = nextChild; 
    } 
  } 
}; 
goog.ui.AutoComplete.Renderer.prototype.getTokenRegExp_ = function(tokenOrArray) { 
  var token = ''; 
  if(! tokenOrArray) { 
    return token; 
  } 
  if(this.highlightAllTokens_) { 
    if(goog.isArray(tokenOrArray)) { 
      var tokenArray = goog.array.filter(tokenOrArray, function(str) { 
        return ! goog.string.isEmptySafe(str); 
      }); 
      tokenArray = goog.array.map(tokenArray, goog.string.regExpEscape); 
      token = tokenArray.join('|'); 
    } else { 
      token = goog.string.collapseWhitespace(tokenOrArray); 
      token = goog.string.regExpEscape(token); 
      token = token.replace(/ /g, '|'); 
    } 
  } else { 
    if(goog.isArray(tokenOrArray)) { 
      token = tokenOrArray.length > 0 ? goog.string.regExpEscape(tokenOrArray[0]): ''; 
    } else { 
      token = goog.string.regExpEscape(tokenOrArray); 
    } 
  } 
  return token; 
}; 
goog.ui.AutoComplete.Renderer.prototype.renderRowHtml = function(row, token) { 
  var node = this.dom_.createDom('div', { 
    className: this.rowClassName, 
    id: goog.ui.IdGenerator.getInstance().getNextUniqueId() 
  }); 
  goog.dom.a11y.setRole(node, goog.dom.a11y.Role.OPTION); 
  if(this.customRenderer_ && this.customRenderer_.renderRow) { 
    this.customRenderer_.renderRow(row, token, node); 
  } else { 
    this.renderRowContents_(row, token, node); 
  } 
  if(token && this.useStandardHighlighting_) { 
    this.hiliteMatchingText_(node, token); 
  } 
  goog.dom.classes.add(node, this.rowClassName); 
  this.rowDivs_.push(node); 
  return node; 
}; 
goog.ui.AutoComplete.Renderer.prototype.getRowFromEventTarget_ = function(et) { 
  while(et && et != this.element_ && ! goog.dom.classes.has(et, this.rowClassName)) { 
    et =(et.parentNode); 
  } 
  return et ? goog.array.indexOf(this.rowDivs_, et): - 1; 
}; 
goog.ui.AutoComplete.Renderer.prototype.handleClick_ = function(e) { 
  var index = this.getRowFromEventTarget_((e.target)); 
  if(index >= 0) { 
    this.dispatchEvent({ 
      type: goog.ui.AutoComplete.EventType.SELECT, 
      row: this.rows_[index].id 
    }); 
  } 
  e.stopPropagation(); 
}; 
goog.ui.AutoComplete.Renderer.prototype.handleMouseDown_ = function(e) { 
  this.dispatchEvent(goog.ui.AutoComplete.EventType.CANCEL_DISMISS); 
  e.stopPropagation(); 
  e.preventDefault(); 
}; 
goog.ui.AutoComplete.Renderer.prototype.handleDocumentMousedown_ = function(e) { 
  this.dispatchEvent(goog.ui.AutoComplete.EventType.DISMISS); 
}; 
goog.ui.AutoComplete.Renderer.prototype.handleMouseOver_ = function(e) { 
  var index = this.getRowFromEventTarget_((e.target)); 
  if(index >= 0) { 
    if((goog.now() - this.startRenderingRows_) < goog.ui.AutoComplete.Renderer.DELAY_BEFORE_MOUSEOVER) { 
      return; 
    } 
    this.dispatchEvent({ 
      type: goog.ui.AutoComplete.EventType.HILITE, 
      row: this.rows_[index].id 
    }); 
  } 
}; 
goog.ui.AutoComplete.Renderer.CustomRenderer = function() { }; 
goog.ui.AutoComplete.Renderer.CustomRenderer.prototype.render = function(renderer, element, rows, token) { }; 
goog.ui.AutoComplete.Renderer.CustomRenderer.prototype.renderRow = function(row, token, node) { }; 
