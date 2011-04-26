
goog.provide('goog.ui.Dialog'); 
goog.provide('goog.ui.Dialog.ButtonSet'); 
goog.provide('goog.ui.Dialog.ButtonSet.DefaultButtons'); 
goog.provide('goog.ui.Dialog.DefaultButtonCaptions'); 
goog.provide('goog.ui.Dialog.DefaultButtonKeys'); 
goog.provide('goog.ui.Dialog.Event'); 
goog.provide('goog.ui.Dialog.EventType'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.classes'); 
goog.require('goog.dom.iframe'); 
goog.require('goog.events'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.FocusHandler'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.fx.Dragger'); 
goog.require('goog.math.Rect'); 
goog.require('goog.structs'); 
goog.require('goog.structs.Map'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.userAgent'); 
goog.ui.Dialog = function(opt_class, opt_useIframeMask, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.class_ = opt_class || goog.getCssName('modal-dialog'); 
  this.useIframeMask_ = ! ! opt_useIframeMask; 
  this.buttons_ = goog.ui.Dialog.ButtonSet.createOkCancel(); 
}; 
goog.inherits(goog.ui.Dialog, goog.ui.Component); 
goog.ui.Dialog.prototype.focusHandler_ = null; 
goog.ui.Dialog.prototype.escapeToCancel_ = true; 
goog.ui.Dialog.prototype.hasTitleCloseButton_ = true; 
goog.ui.Dialog.prototype.useIframeMask_ = false; 
goog.ui.Dialog.prototype.modal_ = true; 
goog.ui.Dialog.prototype.draggable_ = true; 
goog.ui.Dialog.prototype.backgroundElementOpacity_ = 0.50; 
goog.ui.Dialog.prototype.title_ = ''; 
goog.ui.Dialog.prototype.content_ = ''; 
goog.ui.Dialog.prototype.buttons_ = null; 
goog.ui.Dialog.prototype.dragger_ = null; 
goog.ui.Dialog.prototype.visible_ = false; 
goog.ui.Dialog.prototype.disposeOnHide_ = false; 
goog.ui.Dialog.prototype.bgEl_ = null; 
goog.ui.Dialog.prototype.bgIframeEl_ = null; 
goog.ui.Dialog.prototype.titleEl_ = null; 
goog.ui.Dialog.prototype.titleTextEl_ = null; 
goog.ui.Dialog.prototype.titleId_ = null; 
goog.ui.Dialog.prototype.titleCloseEl_ = null; 
goog.ui.Dialog.prototype.contentEl_ = null; 
goog.ui.Dialog.prototype.buttonEl_ = null; 
goog.ui.Dialog.prototype.setTitle = function(title) { 
  this.title_ = title; 
  if(this.titleTextEl_) { 
    goog.dom.setTextContent(this.titleTextEl_, title); 
  } 
}; 
goog.ui.Dialog.prototype.getTitle = function() { 
  return this.title_; 
}; 
goog.ui.Dialog.prototype.setContent = function(html) { 
  this.content_ = html; 
  if(this.contentEl_) { 
    this.contentEl_.innerHTML = html; 
  } 
}; 
goog.ui.Dialog.prototype.getContent = function() { 
  return this.content_; 
}; 
goog.ui.Dialog.prototype.renderIfNoDom_ = function() { 
  if(! this.getElement()) { 
    this.render(); 
  } 
}; 
goog.ui.Dialog.prototype.getContentElement = function() { 
  this.renderIfNoDom_(); 
  return this.contentEl_; 
}; 
goog.ui.Dialog.prototype.getTitleElement = function() { 
  this.renderIfNoDom_(); 
  return this.titleEl_; 
}; 
goog.ui.Dialog.prototype.getTitleTextElement = function() { 
  this.renderIfNoDom_(); 
  return this.titleTextEl_; 
}; 
goog.ui.Dialog.prototype.getTitleCloseElement = function() { 
  this.renderIfNoDom_(); 
  return this.titleCloseEl_; 
}; 
goog.ui.Dialog.prototype.getButtonElement = function() { 
  this.renderIfNoDom_(); 
  return this.buttonEl_; 
}; 
goog.ui.Dialog.prototype.getDialogElement = function() { 
  this.renderIfNoDom_(); 
  return this.getElement(); 
}; 
goog.ui.Dialog.prototype.getBackgroundElement = function() { 
  this.renderIfNoDom_(); 
  return this.bgEl_; 
}; 
goog.ui.Dialog.prototype.getBackgroundElementOpacity = function() { 
  return this.backgroundElementOpacity_; 
}; 
goog.ui.Dialog.prototype.setBackgroundElementOpacity = function(opacity) { 
  this.backgroundElementOpacity_ = opacity; 
  if(this.bgEl_) { 
    goog.style.setOpacity(this.bgEl_, this.backgroundElementOpacity_); 
  } 
}; 
goog.ui.Dialog.prototype.setModal = function(modal) { 
  this.modal_ = modal; 
  this.manageBackgroundDom_(); 
  var dom = this.getDomHelper(); 
  if(this.isInDocument() && modal && this.isVisible()) { 
    if(this.bgIframeEl_) { 
      dom.insertSiblingBefore(this.bgIframeEl_, this.getElement()); 
    } 
    if(this.bgEl_) { 
      dom.insertSiblingBefore(this.bgEl_, this.getElement()); 
    } 
    this.resizeBackground_(); 
  } 
}; 
goog.ui.Dialog.prototype.getModal = function() { 
  return this.modal_; 
}; 
goog.ui.Dialog.prototype.getClass = function() { 
  return this.class_; 
}; 
goog.ui.Dialog.prototype.setDraggable = function(draggable) { 
  this.draggable_ = draggable; 
  if(this.draggable_ && ! this.dragger_ && this.getElement()) { 
    this.dragger_ = this.createDraggableTitleDom_(); 
  } else if(! this.draggable_ && this.dragger_) { 
    if(this.getElement()) { 
      goog.dom.classes.remove(this.titleEl_, goog.getCssName(this.class_, 'title-draggable')); 
    } 
    this.dragger_.dispose(); 
    this.dragger_ = null; 
  } 
}; 
goog.ui.Dialog.prototype.createDraggableTitleDom_ = function() { 
  var dragger = new goog.fx.Dragger(this.getElement(), this.titleEl_); 
  goog.dom.classes.add(this.titleEl_, goog.getCssName(this.class_, 'title-draggable')); 
  return dragger; 
}; 
goog.ui.Dialog.prototype.getDraggable = function() { 
  return this.draggable_; 
}; 
goog.ui.Dialog.prototype.createDom = function() { 
  this.manageBackgroundDom_(); 
  var dom = this.getDomHelper(); 
  this.setElementInternal(dom.createDom('div', { 
    'className': this.class_, 
    'tabIndex': 0 
  }, this.titleEl_ = dom.createDom('div', { 
    'className': goog.getCssName(this.class_, 'title'), 
    'id': this.getId() 
  }, this.titleTextEl_ = dom.createDom('span', goog.getCssName(this.class_, 'title-text'), this.title_), this.titleCloseEl_ = dom.createDom('span', goog.getCssName(this.class_, 'title-close'))), this.contentEl_ = dom.createDom('div', goog.getCssName(this.class_, 'content')), this.buttonEl_ = dom.createDom('div', goog.getCssName(this.class_, 'buttons')), this.tabCatcherEl_ = dom.createDom('span', { 'tabIndex': 0 }))); 
  this.titleId_ = this.titleEl_.id; 
  goog.dom.a11y.setRole(this.getElement(), 'dialog'); 
  goog.dom.a11y.setState(this.getElement(), 'labelledby', this.titleId_ || ''); 
  if(this.content_) { 
    this.contentEl_.innerHTML = this.content_; 
  } 
  goog.style.showElement(this.titleCloseEl_, this.hasTitleCloseButton_); 
  goog.style.showElement(this.getElement(), false); 
  if(this.buttons_) { 
    this.buttons_.attachToElement(this.buttonEl_); 
  } 
}; 
goog.ui.Dialog.prototype.manageBackgroundDom_ = function() { 
  if(this.useIframeMask_ && this.modal_ && ! this.bgIframeEl_) { 
    this.bgIframeEl_ = goog.dom.iframe.createBlank(this.getDomHelper()); 
    this.bgIframeEl_.className = goog.getCssName(this.class_, 'bg'); 
    goog.style.showElement(this.bgIframeEl_, false); 
    goog.style.setOpacity(this.bgIframeEl_, 0); 
  } else if((! this.useIframeMask_ || ! this.modal_) && this.bgIframeEl_) { 
    goog.dom.removeNode(this.bgIframeEl_); 
    this.bgIframeEl_ = null; 
  } 
  if(this.modal_ && ! this.bgEl_) { 
    this.bgEl_ = this.getDomHelper().createDom('div', goog.getCssName(this.class_, 'bg')); 
    goog.style.setOpacity(this.bgEl_, this.backgroundElementOpacity_); 
    goog.style.showElement(this.bgEl_, false); 
  } else if(! this.modal_ && this.bgEl_) { 
    goog.dom.removeNode(this.bgEl_); 
    this.bgEl_ = null; 
  } 
}; 
goog.ui.Dialog.prototype.render = function(opt_parent) { 
  if(this.isInDocument()) { 
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED); 
  } 
  if(! this.getElement()) { 
    this.createDom(); 
  } 
  var parent = opt_parent || this.getDomHelper().getDocument().body; 
  this.renderBackground_(parent); 
  goog.ui.Dialog.superClass_.render.call(this, parent); 
}; 
goog.ui.Dialog.prototype.renderBackground_ = function(parent) { 
  if(this.bgIframeEl_) { 
    parent.appendChild(this.bgIframeEl_); 
  } 
  if(this.bgEl_) { 
    parent.appendChild(this.bgEl_); 
  } 
}; 
goog.ui.Dialog.prototype.renderBefore = function(sibling) { 
  throw Error(goog.ui.Component.Error.NOT_SUPPORTED); 
}; 
goog.ui.Dialog.prototype.canDecorate = function(element) { 
  return element && element.tagName && element.tagName == 'DIV' && goog.ui.Dialog.superClass_.canDecorate.call(this, element); 
}; 
goog.ui.Dialog.prototype.decorateInternal = function(element) { 
  goog.ui.Dialog.superClass_.decorateInternal.call(this, element); 
  goog.dom.classes.add(this.getElement(), this.class_); 
  var contentClass = goog.getCssName(this.class_, 'content'); 
  this.contentEl_ = goog.dom.getElementsByTagNameAndClass(null, contentClass, this.getElement())[0]; 
  if(this.contentEl_) { 
    this.content_ = this.contentEl_.innerHTML; 
  } else { 
    this.contentEl_ = this.getDomHelper().createDom('div', contentClass); 
    if(this.content_) { 
      this.contentEl_.innerHTML = this.content_; 
    } 
    this.getElement().appendChild(this.contentEl_); 
  } 
  var titleClass = goog.getCssName(this.class_, 'title'); 
  var titleTextClass = goog.getCssName(this.class_, 'title-text'); 
  var titleCloseClass = goog.getCssName(this.class_, 'title-close'); 
  this.titleEl_ = goog.dom.getElementsByTagNameAndClass(null, titleClass, this.getElement())[0]; 
  if(this.titleEl_) { 
    this.titleTextEl_ = goog.dom.getElementsByTagNameAndClass(null, titleTextClass, this.titleEl_)[0]; 
    this.titleCloseEl_ = goog.dom.getElementsByTagNameAndClass(null, titleCloseClass, this.titleEl_)[0]; 
  } else { 
    this.titleEl_ = this.getDomHelper().createDom('div', titleClass); 
    this.getElement().insertBefore(this.titleEl_, this.contentEl_); 
  } 
  if(this.titleTextEl_) { 
    this.title_ = goog.dom.getTextContent(this.titleTextEl_); 
  } else { 
    this.titleTextEl_ = this.getDomHelper().createDom('span', titleTextClass, this.title_); 
    this.titleEl_.appendChild(this.titleTextEl_); 
  } 
  goog.dom.a11y.setState(this.getElement(), 'labelledby', this.titleId_ || ''); 
  if(! this.titleCloseEl_) { 
    this.titleCloseEl_ = this.getDomHelper().createDom('span', titleCloseClass); 
    this.titleEl_.appendChild(this.titleCloseEl_); 
  } 
  goog.style.showElement(this.titleCloseEl_, this.hasTitleCloseButton_); 
  var buttonsClass = goog.getCssName(this.class_, 'buttons'); 
  this.buttonEl_ = goog.dom.getElementsByTagNameAndClass(null, buttonsClass, this.getElement())[0]; 
  if(this.buttonEl_) { 
    this.buttons_ = new goog.ui.Dialog.ButtonSet(this.getDomHelper()); 
    this.buttons_.decorate(this.buttonEl_); 
  } else { 
    this.buttonEl_ = this.getDomHelper().createDom('div', buttonsClass); 
    this.getElement().appendChild(this.buttonEl_); 
    if(this.buttons_) { 
      this.buttons_.attachToElement(this.buttonEl_); 
    } 
  } 
  this.manageBackgroundDom_(); 
  this.renderBackground_(goog.dom.getOwnerDocument(this.getElement()).body); 
  goog.style.showElement(this.getElement(), false); 
}; 
goog.ui.Dialog.prototype.enterDocument = function() { 
  goog.ui.Dialog.superClass_.enterDocument.call(this); 
  this.focusHandler_ = new goog.events.FocusHandler(this.getDomHelper().getDocument()); 
  if(this.draggable_ && ! this.dragger_) { 
    this.dragger_ = this.createDraggableTitleDom_(); 
  } 
  this.getHandler().listen(this.titleCloseEl_, goog.events.EventType.CLICK, this.onTitleCloseClick_).listen(this.focusHandler_, goog.events.FocusHandler.EventType.FOCUSIN, this.onFocus_); 
  goog.dom.a11y.setRole(this.getElement(), 'dialog'); 
  if(this.titleTextEl_.id !== '') { 
    goog.dom.a11y.setState(this.getElement(), 'labelledby', this.titleTextEl_.id); 
  } 
}; 
goog.ui.Dialog.prototype.exitDocument = function() { 
  if(this.isVisible()) { 
    this.setVisible(false); 
  } 
  this.focusHandler_.dispose(); 
  this.focusHandler_ = null; 
  if(this.dragger_) { 
    this.dragger_.dispose(); 
    this.dragger_ = null; 
  } 
  goog.ui.Dialog.superClass_.exitDocument.call(this); 
}; 
goog.ui.Dialog.prototype.setVisible = function(visible) { 
  if(visible == this.visible_) { 
    return; 
  } 
  var doc = this.getDomHelper().getDocument(); 
  var win = goog.dom.getWindow(doc) || window; 
  if(! this.isInDocument()) { 
    this.render(doc.body); 
  } 
  if(visible) { 
    this.resizeBackground_(); 
    this.reposition(); 
    this.getHandler().listen(this.getElement(), goog.events.EventType.KEYDOWN, this.onKey_).listen(this.getElement(), goog.events.EventType.KEYPRESS, this.onKey_).listen(win, goog.events.EventType.RESIZE, this.onResize_); 
  } else { 
    this.getHandler().unlisten(this.getElement(), goog.events.EventType.KEYDOWN, this.onKey_).unlisten(this.getElement(), goog.events.EventType.KEYPRESS, this.onKey_).unlisten(win, goog.events.EventType.RESIZE, this.onResize_); 
  } 
  if(this.bgIframeEl_) { 
    goog.style.showElement(this.bgIframeEl_, visible); 
  } 
  if(this.bgEl_) { 
    goog.style.showElement(this.bgEl_, visible); 
  } 
  goog.style.showElement(this.getElement(), visible); 
  if(visible) { 
    this.focus(); 
  } 
  this.visible_ = visible; 
  if(! visible) { 
    this.getHandler().unlisten(this.buttonEl_, goog.events.EventType.CLICK, this.onButtonClick_); 
    this.dispatchEvent(goog.ui.Dialog.EventType.AFTER_HIDE); 
    if(this.disposeOnHide_) { 
      this.dispose(); 
    } 
  } else { 
    this.getHandler().listen(this.buttonEl_, goog.events.EventType.CLICK, this.onButtonClick_); 
  } 
}; 
goog.ui.Dialog.prototype.isVisible = function() { 
  return this.visible_; 
}; 
goog.ui.Dialog.prototype.focus = function() { 
  try { 
    this.getElement().focus(); 
  } catch(e) { } 
  if(this.getButtonSet()) { 
    var defaultButton = this.getButtonSet().getDefault(); 
    if(defaultButton) { 
      var doc = this.getDomHelper().getDocument(); 
      var buttons = this.buttonEl_.getElementsByTagName('button'); 
      for(var i = 0, button; button = buttons[i]; i ++) { 
        if(button.name == defaultButton) { 
          try { 
            if(goog.userAgent.WEBKIT || goog.userAgent.OPERA) { 
              var temp = doc.createElement('input'); 
              temp.style.cssText = 'position:fixed;width:0;height:0;left:0;top:0;'; 
              this.getElement().appendChild(temp); 
              temp.focus(); 
              this.getElement().removeChild(temp); 
            } 
            button.focus(); 
          } catch(e) { } 
          break; 
        } 
      } 
    } 
  } 
}; 
goog.ui.Dialog.prototype.resizeBackground_ = function() { 
  if(this.bgIframeEl_) { 
    goog.style.showElement(this.bgIframeEl_, false); 
  } 
  if(this.bgEl_) { 
    goog.style.showElement(this.bgEl_, false); 
  } 
  var doc = this.getDomHelper().getDocument(); 
  var win = goog.dom.getWindow(doc) || window; 
  var viewSize = goog.dom.getViewportSize(win); 
  var w = Math.max(doc.body.scrollWidth, viewSize.width); 
  var h = Math.max(doc.body.scrollHeight, viewSize.height); 
  if(this.bgIframeEl_) { 
    goog.style.showElement(this.bgIframeEl_, true); 
    goog.style.setSize(this.bgIframeEl_, w, h); 
  } 
  if(this.bgEl_) { 
    goog.style.showElement(this.bgEl_, true); 
    goog.style.setSize(this.bgEl_, w, h); 
  } 
  if(this.draggable_) { 
    var dialogSize = goog.style.getSize(this.getElement()); 
    this.dragger_.limits = new goog.math.Rect(0, 0, w - dialogSize.width, h - dialogSize.height); 
  } 
}; 
goog.ui.Dialog.prototype.reposition = function() { 
  var doc = this.getDomHelper().getDocument(); 
  var win = goog.dom.getWindow(doc) || window; 
  if(goog.style.getComputedPosition(this.getElement()) == 'fixed') { 
    var x = 0; 
    var y = 0; 
  } else { 
    var scroll = this.getDomHelper().getDocumentScroll(); 
    var x = scroll.x; 
    var y = scroll.y; 
  } 
  var dialogSize = goog.style.getSize(this.getElement()); 
  var viewSize = goog.dom.getViewportSize(win); 
  var left = Math.max(x + viewSize.width / 2 - dialogSize.width / 2, 0); 
  var top = Math.max(y + viewSize.height / 2 - dialogSize.height / 2, 0); 
  goog.style.setPosition(this.getElement(), left, top); 
}; 
goog.ui.Dialog.prototype.onTitleCloseClick_ = function(e) { 
  if(! this.hasTitleCloseButton_) { 
    return; 
  } 
  var bs = this.getButtonSet(); 
  var key = bs && bs.getCancel(); 
  if(key) { 
    var caption =(bs.get(key)); 
    if(this.dispatchEvent(new goog.ui.Dialog.Event(key, caption))) { 
      this.setVisible(false); 
    } 
  } else { 
    this.setVisible(false); 
  } 
}; 
goog.ui.Dialog.prototype.getHasTitleCloseButton = function() { 
  return this.hasTitleCloseButton_; 
}; 
goog.ui.Dialog.prototype.setHasTitleCloseButton = function(b) { 
  this.hasTitleCloseButton_ = b; 
  if(this.titleCloseEl_) { 
    goog.style.showElement(this.titleCloseEl_, this.hasTitleCloseButton_); 
  } 
}; 
goog.ui.Dialog.prototype.isEscapeToCancel = function() { 
  return this.escapeToCancel_; 
}; 
goog.ui.Dialog.prototype.setEscapeToCancel = function(b) { 
  this.escapeToCancel_ = b; 
}; 
goog.ui.Dialog.prototype.setDisposeOnHide = function(b) { 
  this.disposeOnHide_ = b; 
}; 
goog.ui.Dialog.prototype.getDisposeOnHide = function() { 
  return this.disposeOnHide_; 
}; 
goog.ui.Dialog.prototype.disposeInternal = function() { 
  goog.ui.Dialog.superClass_.disposeInternal.call(this); 
  if(this.bgEl_) { 
    goog.dom.removeNode(this.bgEl_); 
    this.bgEl_ = null; 
  } 
  if(this.bgIframeEl_) { 
    goog.dom.removeNode(this.bgIframeEl_); 
    this.bgIframeEl_ = null; 
  } 
  this.titleCloseEl_ = null; 
  this.buttonEl_ = null; 
  this.tabCatcherEl_ = null; 
}; 
goog.ui.Dialog.prototype.setButtonSet = function(buttons) { 
  this.buttons_ = buttons; 
  if(this.buttonEl_) { 
    if(this.buttons_) { 
      this.buttons_.attachToElement(this.buttonEl_); 
    } else { 
      this.buttonEl_.innerHTML = ''; 
    } 
  } 
}; 
goog.ui.Dialog.prototype.getButtonSet = function() { 
  return this.buttons_; 
}; 
goog.ui.Dialog.prototype.onButtonClick_ = function(e) { 
  var button = this.findParentButton_((e.target)); 
  if(button && ! button.disabled) { 
    var key = button.name; 
    var caption =(this.getButtonSet().get(key)); 
    if(this.dispatchEvent(new goog.ui.Dialog.Event(key, caption))) { 
      this.setVisible(false); 
    } 
  } 
}; 
goog.ui.Dialog.prototype.findParentButton_ = function(element) { 
  var el = element; 
  while(el != null && el != this.buttonEl_) { 
    if(el.tagName == 'BUTTON') { 
      return(el); 
    } 
    el = el.parentNode; 
  } 
  return null; 
}; 
goog.ui.Dialog.prototype.onKey_ = function(e) { 
  var close = false; 
  var hasHandler = false; 
  var buttonSet = this.getButtonSet(); 
  var target = e.target; 
  if(e.type == goog.events.EventType.KEYDOWN) { 
    if(this.escapeToCancel_ && e.keyCode == goog.events.KeyCodes.ESC) { 
      var cancel = buttonSet && buttonSet.getCancel(); 
      var isSpecialFormElement = target.tagName == 'SELECT' && ! target.disabled; 
      if(cancel && ! isSpecialFormElement) { 
        hasHandler = true; 
        var caption = buttonSet.get(cancel); 
        close = this.dispatchEvent(new goog.ui.Dialog.Event(cancel,(caption))); 
      } else if(! isSpecialFormElement) { 
        close = true; 
      } 
    } else if(e.keyCode == goog.events.KeyCodes.TAB && e.shiftKey && target == this.getElement()) { 
      hasHandler = true; 
    } 
  } else if(e.keyCode == goog.events.KeyCodes.ENTER) { 
    var key; 
    if(target.tagName == 'BUTTON') { 
      key = target.name; 
    } else if(buttonSet) { 
      var defaultKey = buttonSet.getDefault(); 
      var defaultButton = defaultKey && buttonSet.getButton(defaultKey); 
      var isSpecialFormElement =(target.tagName == 'TEXTAREA' || target.tagName == 'SELECT') && ! target.disabled; 
      if(defaultButton && ! defaultButton.disabled && ! isSpecialFormElement) { 
        key = defaultKey; 
      } 
    } 
    if(key) { 
      hasHandler = true; 
      close = this.dispatchEvent(new goog.ui.Dialog.Event(key, String(buttonSet.get(key)))); 
    } 
  } 
  if(close || hasHandler) { 
    e.stopPropagation(); 
    e.preventDefault(); 
  } 
  if(close) { 
    this.setVisible(false); 
  } 
}; 
goog.ui.Dialog.prototype.onResize_ = function(e) { 
  this.resizeBackground_(); 
}; 
goog.ui.Dialog.prototype.onFocus_ = function(e) { 
  if(this.tabCatcherEl_ == e.target) { 
    goog.Timer.callOnce(this.focusElement_, 0, this); 
  } 
}; 
goog.ui.Dialog.prototype.focusElement_ = function() { 
  if(goog.userAgent.IE) { 
    this.getDomHelper().getDocument().body.focus(); 
  } 
  this.getElement().focus(); 
}; 
goog.ui.Dialog.Event = function(key, caption) { 
  this.type = goog.ui.Dialog.EventType.SELECT; 
  this.key = key; 
  this.caption = caption; 
}; 
goog.inherits(goog.ui.Dialog.Event, goog.events.Event); 
goog.ui.Dialog.SELECT_EVENT = 'dialogselect'; 
goog.ui.Dialog.EventType = { 
  SELECT: 'dialogselect', 
  AFTER_HIDE: 'afterhide' 
}; 
goog.ui.Dialog.ButtonSet = function(opt_domHelper) { 
  this.dom_ = opt_domHelper || goog.dom.getDomHelper(); 
  goog.structs.Map.call(this); 
}; 
goog.inherits(goog.ui.Dialog.ButtonSet, goog.structs.Map); 
goog.ui.Dialog.ButtonSet.prototype.class_ = goog.getCssName('goog-buttonset'); 
goog.ui.Dialog.ButtonSet.prototype.defaultButton_ = null; 
goog.ui.Dialog.ButtonSet.prototype.element_ = null; 
goog.ui.Dialog.ButtonSet.prototype.cancelButton_ = null; 
goog.ui.Dialog.ButtonSet.prototype.set = function(key, caption, opt_isDefault, opt_isCancel) { 
  goog.structs.Map.prototype.set.call(this, key, caption); 
  if(opt_isDefault) { 
    this.defaultButton_ = key; 
  } 
  if(opt_isCancel) { 
    this.cancelButton_ = key; 
  } 
  return this; 
}; 
goog.ui.Dialog.ButtonSet.prototype.addButton = function(button, opt_isDefault, opt_isCancel) { 
  return this.set(button.key, button.caption, opt_isDefault, opt_isCancel); 
}; 
goog.ui.Dialog.ButtonSet.prototype.attachToElement = function(el) { 
  this.element_ = el; 
  this.render(); 
}; 
goog.ui.Dialog.ButtonSet.prototype.render = function() { 
  if(this.element_) { 
    this.element_.innerHTML = ''; 
    var domHelper = goog.dom.getDomHelper(this.element_); 
    goog.structs.forEach(this, function(caption, key) { 
      var button = domHelper.createDom('button', { 'name': key }, caption); 
      if(key == this.defaultButton_) { 
        button.className = goog.getCssName(this.class_, 'default'); 
      } 
      this.element_.appendChild(button); 
    }, this); 
  } 
}; 
goog.ui.Dialog.ButtonSet.prototype.decorate = function(element) { 
  if(! element || element.nodeType != goog.dom.NodeType.ELEMENT) { 
    return; 
  } 
  this.element_ = element; 
  var buttons = this.element_.getElementsByTagName('button'); 
  for(var i = 0, button, key, caption; button = buttons[i]; i ++) { 
    key = button.name || button.id; 
    caption = goog.dom.getTextContent(button) || button.value; 
    if(key) { 
      var isDefault = i == 0; 
      var isCancel = button.name == goog.ui.Dialog.DefaultButtonKeys.CANCEL; 
      this.set(key, caption, isDefault, isCancel); 
      if(isDefault) { 
        goog.dom.classes.add(button, goog.getCssName(this.class_, 'default')); 
      } 
    } 
  } 
}; 
goog.ui.Dialog.ButtonSet.prototype.getElement = function() { 
  return this.element_; 
}; 
goog.ui.Dialog.ButtonSet.prototype.getDomHelper = function() { 
  return this.dom_; 
}; 
goog.ui.Dialog.ButtonSet.prototype.setDefault = function(key) { 
  this.defaultButton_ = key; 
}; 
goog.ui.Dialog.ButtonSet.prototype.getDefault = function() { 
  return this.defaultButton_; 
}; 
goog.ui.Dialog.ButtonSet.prototype.setCancel = function(key) { 
  this.cancelButton_ = key; 
}; 
goog.ui.Dialog.ButtonSet.prototype.getCancel = function() { 
  return this.cancelButton_; 
}; 
goog.ui.Dialog.ButtonSet.prototype.getButton = function(key) { 
  var buttons = this.getAllButtons(); 
  for(var i = 0, nextButton; nextButton = buttons[i]; i ++) { 
    if(nextButton.name == key || nextButton.id == key) { 
      return nextButton; 
    } 
  } 
  return null; 
}; 
goog.ui.Dialog.ButtonSet.prototype.getAllButtons = function() { 
  return this.element_.getElementsByTagName(goog.dom.TagName.BUTTON); 
}; 
goog.ui.Dialog.ButtonSet.prototype.setButtonEnabled = function(key, enabled) { 
  var button = this.getButton(key); 
  if(button) { 
    button.disabled = ! enabled; 
  } 
}; 
goog.ui.Dialog.ButtonSet.prototype.setAllButtonsEnabled = function(enabled) { 
  var allButtons = this.getAllButtons(); 
  for(var i = 0, button; button = allButtons[i]; i ++) { 
    button.disabled = ! enabled; 
  } 
}; 
goog.ui.Dialog.DefaultButtonKeys = { 
  OK: 'ok', 
  CANCEL: 'cancel', 
  YES: 'yes', 
  NO: 'no', 
  SAVE: 'save', 
  CONTINUE: 'continue' 
}; 
goog.ui.Dialog.MSG_DIALOG_OK_ = goog.getMsg('OK'); 
goog.ui.Dialog.MSG_DIALOG_CANCEL_ = goog.getMsg('Cancel'); 
goog.ui.Dialog.MSG_DIALOG_YES_ = goog.getMsg('Yes'); 
goog.ui.Dialog.MSG_DIALOG_NO_ = goog.getMsg('No'); 
goog.ui.Dialog.MSG_DIALOG_SAVE_ = goog.getMsg('Save'); 
goog.ui.Dialog.MSG_DIALOG_CONTINUE_ = goog.getMsg('Continue'); 
goog.ui.Dialog.DefaultButtonCaptions = { 
  OK: goog.ui.Dialog.MSG_DIALOG_OK_, 
  CANCEL: goog.ui.Dialog.MSG_DIALOG_CANCEL_, 
  YES: goog.ui.Dialog.MSG_DIALOG_YES_, 
  NO: goog.ui.Dialog.MSG_DIALOG_NO_, 
  SAVE: goog.ui.Dialog.MSG_DIALOG_SAVE_, 
  CONTINUE: goog.ui.Dialog.MSG_DIALOG_CONTINUE_ 
}; 
goog.ui.Dialog.ButtonSet.DefaultButtons = { 
  OK: { 
    key: goog.ui.Dialog.DefaultButtonKeys.OK, 
    caption: goog.ui.Dialog.DefaultButtonCaptions.OK 
  }, 
  CANCEL: { 
    key: goog.ui.Dialog.DefaultButtonKeys.CANCEL, 
    caption: goog.ui.Dialog.DefaultButtonCaptions.CANCEL 
  }, 
  YES: { 
    key: goog.ui.Dialog.DefaultButtonKeys.YES, 
    caption: goog.ui.Dialog.DefaultButtonCaptions.YES 
  }, 
  NO: { 
    key: goog.ui.Dialog.DefaultButtonKeys.NO, 
    caption: goog.ui.Dialog.DefaultButtonCaptions.NO 
  }, 
  SAVE: { 
    key: goog.ui.Dialog.DefaultButtonKeys.SAVE, 
    caption: goog.ui.Dialog.DefaultButtonCaptions.SAVE 
  }, 
  CONTINUE: { 
    key: goog.ui.Dialog.DefaultButtonKeys.CONTINUE, 
    caption: goog.ui.Dialog.DefaultButtonCaptions.CONTINUE 
  } 
}; 
goog.ui.Dialog.ButtonSet.createOk = function() { 
  return new goog.ui.Dialog.ButtonSet().addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.OK, true, true); 
}; 
goog.ui.Dialog.ButtonSet.createOkCancel = function() { 
  return new goog.ui.Dialog.ButtonSet().addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.OK, true).addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.CANCEL, false, true); 
}; 
goog.ui.Dialog.ButtonSet.createYesNo = function() { 
  return new goog.ui.Dialog.ButtonSet().addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.YES, true).addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.NO, false, true); 
}; 
goog.ui.Dialog.ButtonSet.createYesNoCancel = function() { 
  return new goog.ui.Dialog.ButtonSet().addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.YES).addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.NO, true).addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.CANCEL, false, true); 
}; 
goog.ui.Dialog.ButtonSet.createContinueSaveCancel = function() { 
  return new goog.ui.Dialog.ButtonSet().addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.CONTINUE).addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.SAVE).addButton(goog.ui.Dialog.ButtonSet.DefaultButtons.CANCEL, true, true); 
}; 
(function() { 
  goog.ui.Dialog.ButtonSet.OK = goog.ui.Dialog.ButtonSet.createOk(); 
  goog.ui.Dialog.ButtonSet.OK_CANCEL = goog.ui.Dialog.ButtonSet.createOkCancel(); 
  goog.ui.Dialog.ButtonSet.YES_NO = goog.ui.Dialog.ButtonSet.createYesNo(); 
  goog.ui.Dialog.ButtonSet.YES_NO_CANCEL = goog.ui.Dialog.ButtonSet.createYesNoCancel(); 
  goog.ui.Dialog.ButtonSet.CONTINUE_SAVE_CANCEL = goog.ui.Dialog.ButtonSet.createContinueSaveCancel(); 
})(); 
