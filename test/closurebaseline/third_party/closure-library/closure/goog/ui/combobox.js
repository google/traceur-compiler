
goog.provide('goog.ui.ComboBox'); 
goog.provide('goog.ui.ComboBoxItem'); 
goog.require('goog.Timer'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.events.InputHandler'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.events.KeyHandler'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.ItemEvent'); 
goog.require('goog.ui.LabelInput'); 
goog.require('goog.ui.Menu'); 
goog.require('goog.ui.MenuItem'); 
goog.require('goog.ui.registry'); 
goog.require('goog.userAgent'); 
goog.ui.ComboBox = function(opt_domHelper, opt_menu) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.labelInput_ = new goog.ui.LabelInput(); 
  this.enabled_ = true; 
  this.menu_ = opt_menu || new goog.ui.Menu(this.getDomHelper()); 
  this.setupMenu_(); 
}; 
goog.inherits(goog.ui.ComboBox, goog.ui.Component); 
goog.ui.ComboBox.BLUR_DISMISS_TIMER_MS = 250; 
goog.ui.ComboBox.prototype.logger_ = goog.debug.Logger.getLogger('goog.ui.ComboBox'); 
goog.ui.ComboBox.prototype.enabled_; 
goog.ui.ComboBox.prototype.keyHandler_; 
goog.ui.ComboBox.prototype.inputHandler_ = null; 
goog.ui.ComboBox.prototype.lastToken_ = null; 
goog.ui.ComboBox.prototype.labelInput_ = null; 
goog.ui.ComboBox.prototype.menu_ = null; 
goog.ui.ComboBox.prototype.visibleCount_ = - 1; 
goog.ui.ComboBox.prototype.input_ = null; 
goog.ui.ComboBox.prototype.matchFunction_ = goog.string.startsWith; 
goog.ui.ComboBox.prototype.button_ = null; 
goog.ui.ComboBox.prototype.defaultText_ = ''; 
goog.ui.ComboBox.prototype.fieldName_ = ''; 
goog.ui.ComboBox.prototype.dismissTimer_ = null; 
goog.ui.ComboBox.prototype.useDropdownArrow_ = false; 
goog.ui.ComboBox.prototype.createDom = function() { 
  this.input_ = this.getDomHelper().createDom('input', { 
    'name': this.fieldName_, 
    'autocomplete': 'off' 
  }); 
  this.button_ = this.getDomHelper().createDom('span', goog.getCssName('goog-combobox-button')); 
  this.setElementInternal(this.getDomHelper().createDom('span', goog.getCssName('goog-combobox'), this.input_, this.button_)); 
  if(this.useDropdownArrow_) { 
    this.button_.innerHTML = '&#x25BC;'; 
    goog.style.setUnselectable(this.button_, true); 
  } 
  this.input_.setAttribute('label', this.defaultText_); 
  this.labelInput_.decorate(this.input_); 
  this.menu_.setFocusable(false); 
  if(! this.menu_.isInDocument()) { 
    this.addChild(this.menu_, true); 
  } 
}; 
goog.ui.ComboBox.prototype.setEnabled = function(enabled) { 
  this.enabled_ = enabled; 
  this.labelInput_.setEnabled(enabled); 
  goog.dom.classes.enable(this.getElement(), goog.getCssName('goog-combobox-disabled'), ! enabled); 
}; 
goog.ui.ComboBox.prototype.enterDocument = function() { 
  goog.ui.ComboBox.superClass_.enterDocument.call(this); 
  var handler = this.getHandler(); 
  handler.listen(this.getElement(), goog.events.EventType.MOUSEDOWN, this.onComboMouseDown_); 
  handler.listen(this.getDomHelper().getDocument(), goog.events.EventType.MOUSEDOWN, this.onDocClicked_); 
  handler.listen(this.input_, goog.events.EventType.BLUR, this.onInputBlur_); 
  this.keyHandler_ = new goog.events.KeyHandler(this.input_); 
  handler.listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent); 
  this.inputHandler_ = new goog.events.InputHandler(this.input_); 
  handler.listen(this.inputHandler_, goog.events.InputHandler.EventType.INPUT, this.onInputEvent_); 
  handler.listen(this.menu_, goog.ui.Component.EventType.ACTION, this.onMenuSelected_); 
}; 
goog.ui.ComboBox.prototype.exitDocument = function() { 
  this.keyHandler_.dispose(); 
  delete this.keyHandler_; 
  this.inputHandler_.dispose(); 
  this.inputHandler_ = null; 
  goog.ui.ComboBox.superClass_.exitDocument.call(this); 
}; 
goog.ui.ComboBox.prototype.canDecorate = function() { 
  return false; 
}; 
goog.ui.ComboBox.prototype.disposeInternal = function() { 
  goog.ui.ComboBox.superClass_.disposeInternal.call(this); 
  this.clearDismissTimer_(); 
  this.labelInput_.dispose(); 
  this.menu_.dispose(); 
  this.labelInput_ = null; 
  this.menu_ = null; 
  this.input_ = null; 
  this.button_ = null; 
}; 
goog.ui.ComboBox.prototype.dismiss = function() { 
  this.clearDismissTimer_(); 
  this.hideMenu_(); 
  this.menu_.setHighlightedIndex(- 1); 
}; 
goog.ui.ComboBox.prototype.addItem = function(item) { 
  this.menu_.addChild(item, true); 
  this.visibleCount_ = - 1; 
}; 
goog.ui.ComboBox.prototype.addItemAt = function(item, n) { 
  this.menu_.addChildAt(item, n, true); 
  this.visibleCount_ = - 1; 
}; 
goog.ui.ComboBox.prototype.removeItem = function(item) { 
  var child = this.menu_.removeChild(item, true); 
  if(child) { 
    child.dispose(); 
    this.visibleCount_ = - 1; 
  } 
}; 
goog.ui.ComboBox.prototype.removeAllItems = function() { 
  for(var i = this.getItemCount() - 1; i >= 0; -- i) { 
    this.removeItem(this.getItemAt(i)); 
  } 
}; 
goog.ui.ComboBox.prototype.removeItemAt = function(n) { 
  var child = this.menu_.removeChildAt(n, true); 
  if(child) { 
    child.dispose(); 
    this.visibleCount_ = - 1; 
  } 
}; 
goog.ui.ComboBox.prototype.getItemAt = function(n) { 
  return(this.menu_.getChildAt(n)); 
}; 
goog.ui.ComboBox.prototype.getItemCount = function() { 
  return this.menu_.getChildCount(); 
}; 
goog.ui.ComboBox.prototype.getMenu = function() { 
  return this.menu_; 
}; 
goog.ui.ComboBox.prototype.getNumberOfVisibleItems_ = function() { 
  if(this.visibleCount_ == - 1) { 
    var count = 0; 
    for(var i = 0, n = this.menu_.getChildCount(); i < n; i ++) { 
      var item = this.menu_.getChildAt(i); 
      if(!(item instanceof goog.ui.MenuSeparator) && item.isVisible()) { 
        count ++; 
      } 
    } 
    this.visibleCount_ = count; 
  } 
  this.logger_.info('getNumberOfVisibleItems() - ' + this.visibleCount_); 
  return this.visibleCount_; 
}; 
goog.ui.ComboBox.prototype.setMatchFunction = function(matchFunction) { 
  this.matchFunction_ = matchFunction; 
}; 
goog.ui.ComboBox.prototype.getMatchFunction = function() { 
  return this.matchFunction_; 
}; 
goog.ui.ComboBox.prototype.setDefaultText = function(text) { 
  this.defaultText_ = text; 
}; 
goog.ui.ComboBox.prototype.getDefaultText = function() { 
  return this.defaultText_; 
}; 
goog.ui.ComboBox.prototype.setFieldName = function(fieldName) { 
  this.fieldName_ = fieldName; 
}; 
goog.ui.ComboBox.prototype.getFieldName = function() { 
  return this.fieldName_; 
}; 
goog.ui.ComboBox.prototype.setUseDropdownArrow = function(useDropdownArrow) { 
  this.useDropdownArrow_ = ! ! useDropdownArrow; 
}; 
goog.ui.ComboBox.prototype.setValue = function(value) { 
  this.logger_.info('setValue() - ' + value); 
  if(this.labelInput_.getValue() != value) { 
    this.labelInput_.setValue(value); 
    this.handleInputChange_(); 
  } 
}; 
goog.ui.ComboBox.prototype.getValue = function() { 
  return this.labelInput_.getValue(); 
}; 
goog.ui.ComboBox.prototype.getToken = function() { 
  return goog.string.htmlEscape(this.getTokenText_()); 
}; 
goog.ui.ComboBox.prototype.getTokenText_ = function() { 
  return goog.string.trim(this.labelInput_.getValue().toLowerCase()); 
}; 
goog.ui.ComboBox.prototype.setupMenu_ = function() { 
  var sm = this.menu_; 
  sm.setVisible(false); 
  sm.setAllowAutoFocus(false); 
  sm.setAllowHighlightDisabled(true); 
}; 
goog.ui.ComboBox.prototype.maybeShowMenu_ = function(showAll) { 
  var isVisible = this.menu_.isVisible(); 
  var numVisibleItems = this.getNumberOfVisibleItems_(); 
  if(isVisible && numVisibleItems == 0) { 
    this.logger_.fine('no matching items, hiding'); 
    this.hideMenu_(); 
  } else if(! isVisible && numVisibleItems > 0) { 
    if(showAll) { 
      this.logger_.fine('showing menu'); 
      this.setItemVisibilityFromToken_(''); 
      this.setItemHighlightFromToken_(this.getTokenText_()); 
    } 
    goog.Timer.callOnce(this.clearDismissTimer_, 1, this); 
    var pos = goog.style.getPageOffset(this.getElement()); 
    this.menu_.setPosition(pos.x, pos.y + this.getElement().offsetHeight); 
    this.showMenu_(); 
  } 
}; 
goog.ui.ComboBox.prototype.showMenu_ = function() { 
  this.menu_.setVisible(true); 
  goog.dom.classes.add(this.getElement(), goog.getCssName('goog-combobox-active')); 
}; 
goog.ui.ComboBox.prototype.hideMenu_ = function() { 
  this.menu_.setVisible(false); 
  goog.dom.classes.remove(this.getElement(), goog.getCssName('goog-combobox-active')); 
}; 
goog.ui.ComboBox.prototype.clearDismissTimer_ = function() { 
  if(this.dismissTimer_) { 
    goog.Timer.clear(this.dismissTimer_); 
    this.dismissTimer_ = null; 
  } 
}; 
goog.ui.ComboBox.prototype.onComboMouseDown_ = function(e) { 
  if(this.enabled_ &&(e.target == this.getElement() || e.target == this.input_ || goog.dom.contains(this.button_,(e.target)))) { 
    if(this.menu_.isVisible()) { 
      this.logger_.fine('Menu is visible, dismissing'); 
      this.dismiss(); 
    } else { 
      this.logger_.fine('Opening dropdown'); 
      this.maybeShowMenu_(true); 
      if(goog.userAgent.OPERA) { 
        this.input_.focus(); 
      } 
      this.input_.select(); 
      this.menu_.setMouseButtonPressed(true); 
      e.preventDefault(); 
    } 
  } 
  e.stopPropagation(); 
}; 
goog.ui.ComboBox.prototype.onDocClicked_ = function(e) { 
  if(! goog.dom.contains(this.menu_.getElement(),(e.target))) { 
    this.logger_.info('onDocClicked_() - dismissing immediately'); 
    this.dismiss(); 
  } 
}; 
goog.ui.ComboBox.prototype.onMenuSelected_ = function(e) { 
  this.logger_.info('onMenuSelected_()'); 
  var item =(e.target); 
  if(this.dispatchEvent(new goog.ui.ItemEvent(goog.ui.Component.EventType.ACTION, this, item))) { 
    var caption = item.getCaption(); 
    this.logger_.fine('Menu selection: ' + caption + '. Dismissing menu'); 
    if(this.labelInput_.getValue() != caption) { 
      this.labelInput_.setValue(caption); 
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
    } 
    this.dismiss(); 
  } 
  e.stopPropagation(); 
}; 
goog.ui.ComboBox.prototype.onInputBlur_ = function(e) { 
  this.logger_.info('onInputBlur_() - delayed dismiss'); 
  this.clearDismissTimer_(); 
  this.dismissTimer_ = goog.Timer.callOnce(this.dismiss, goog.ui.ComboBox.BLUR_DISMISS_TIMER_MS, this); 
}; 
goog.ui.ComboBox.prototype.handleKeyEvent = function(e) { 
  var isMenuVisible = this.menu_.isVisible(); 
  if(isMenuVisible && this.menu_.handleKeyEvent(e)) { 
    return true; 
  } 
  var handled = false; 
  switch(e.keyCode) { 
    case goog.events.KeyCodes.ESC: 
      if(isMenuVisible) { 
        this.logger_.fine('Dismiss on Esc: ' + this.labelInput_.getValue()); 
        this.dismiss(); 
        handled = true; 
      } 
      break; 

    case goog.events.KeyCodes.TAB: 
      if(isMenuVisible) { 
        var highlighted = this.menu_.getHighlighted(); 
        if(highlighted) { 
          this.logger_.fine('Select on Tab: ' + this.labelInput_.getValue()); 
          highlighted.performActionInternal(e); 
          handled = true; 
        } 
      } 
      break; 

    case goog.events.KeyCodes.UP: 
    case goog.events.KeyCodes.DOWN: 
      if(! isMenuVisible) { 
        this.logger_.fine('Up/Down - maybe show menu'); 
        this.maybeShowMenu_(true); 
        handled = true; 
      } 
      break; 

  } 
  if(handled) { 
    e.preventDefault(); 
  } 
  return handled; 
}; 
goog.ui.ComboBox.prototype.onInputEvent_ = function(e) { 
  this.logger_.fine('Key is modifying: ' + this.labelInput_.getValue()); 
  this.handleInputChange_(); 
}; 
goog.ui.ComboBox.prototype.handleInputChange_ = function() { 
  var token = this.getTokenText_(); 
  this.setItemVisibilityFromToken_(token); 
  if(this.getDomHelper().getDocument().activeElement == this.input_) { 
    this.maybeShowMenu_(false); 
  } 
  var highlighted = this.menu_.getHighlighted(); 
  if(token == '' || ! highlighted || ! highlighted.isVisible()) { 
    this.setItemHighlightFromToken_(token); 
  } 
  this.lastToken_ = token; 
  this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
}; 
goog.ui.ComboBox.prototype.setItemVisibilityFromToken_ = function(token) { 
  this.logger_.info('setItemVisibilityFromToken_() - ' + token); 
  var isVisibleItem = false; 
  var count = 0; 
  var recheckHidden = ! this.matchFunction_(token, this.lastToken_); 
  for(var i = 0, n = this.menu_.getChildCount(); i < n; i ++) { 
    var item = this.menu_.getChildAt(i); 
    if(item instanceof goog.ui.MenuSeparator) { 
      item.setVisible(isVisibleItem); 
      isVisibleItem = false; 
    } else if(item instanceof goog.ui.MenuItem) { 
      if(! item.isVisible() && ! recheckHidden) continue; 
      var caption = item.getCaption(); 
      var visible = this.isItemSticky_(item) || caption && this.matchFunction_(caption.toLowerCase(), token); 
      if(typeof item.setFormatFromToken == 'function') { 
        item.setFormatFromToken(token); 
      } 
      item.setVisible(! ! visible); 
      isVisibleItem = visible || isVisibleItem; 
    } else { 
      isVisibleItem = item.isVisible() || isVisibleItem; 
    } 
    if(!(item instanceof goog.ui.MenuSeparator) && item.isVisible()) { 
      count ++; 
    } 
  } 
  this.visibleCount_ = count; 
}; 
goog.ui.ComboBox.prototype.setItemHighlightFromToken_ = function(token) { 
  this.logger_.info('setItemHighlightFromToken_() - ' + token); 
  if(token == '') { 
    this.menu_.setHighlightedIndex(- 1); 
    return; 
  } 
  for(var i = 0, n = this.menu_.getChildCount(); i < n; i ++) { 
    var item = this.menu_.getChildAt(i); 
    var caption = item.getCaption(); 
    if(caption && this.matchFunction_(caption.toLowerCase(), token)) { 
      this.menu_.setHighlightedIndex(i); 
      if(item.setFormatFromToken) { 
        item.setFormatFromToken(token); 
      } 
      return; 
    } 
  } 
  this.menu_.setHighlightedIndex(- 1); 
}; 
goog.ui.ComboBox.prototype.isItemSticky_ = function(item) { 
  return typeof item.isSticky == 'function' && item.isSticky(); 
}; 
goog.ui.ComboBoxItem = function(content, opt_data, opt_domHelper) { 
  goog.ui.MenuItem.call(this, content, opt_data, opt_domHelper); 
}; 
goog.inherits(goog.ui.ComboBoxItem, goog.ui.MenuItem); 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-combobox-item'), function() { 
  return new goog.ui.ComboBoxItem(null); 
}); 
goog.ui.ComboBoxItem.prototype.isSticky_ = false; 
goog.ui.ComboBoxItem.prototype.setSticky = function(sticky) { 
  this.isSticky_ = sticky; 
}; 
goog.ui.ComboBoxItem.prototype.isSticky = function() { 
  return this.isSticky_; 
}; 
goog.ui.ComboBoxItem.prototype.setFormatFromToken = function(token) { 
  if(this.isEnabled()) { 
    var caption = this.getCaption(); 
    var index = caption.toLowerCase().indexOf(token); 
    if(index >= 0) { 
      var domHelper = this.getDomHelper(); 
      this.setContent([domHelper.createTextNode(caption.substr(0, index)), domHelper.createDom('b', null, caption.substr(index, token.length)), domHelper.createTextNode(caption.substr(index + token.length))]); 
    } 
  } 
}; 
