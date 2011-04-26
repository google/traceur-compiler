
goog.provide('goog.ui.CharPicker'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.InputHandler'); 
goog.require('goog.events.KeyHandler'); 
goog.require('goog.i18n.CharListDecompressor'); 
goog.require('goog.i18n.uChar'); 
goog.require('goog.structs.Set'); 
goog.require('goog.style'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.ContainerScroller'); 
goog.require('goog.ui.FlatButtonRenderer'); 
goog.require('goog.ui.HoverCard'); 
goog.require('goog.ui.LabelInput'); 
goog.require('goog.ui.Menu'); 
goog.require('goog.ui.MenuButton'); 
goog.require('goog.ui.MenuItem'); 
goog.require('goog.ui.Tooltip.ElementTooltipPosition'); 
goog.ui.CharPicker = function(charPickerData, opt_recents, opt_initCategory, opt_initSubcategory, opt_rowCount, opt_columnCount, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.data_ = charPickerData; 
  this.initCategory_ = opt_initCategory || 0; 
  this.initSubcategory_ = opt_initSubcategory || 0; 
  this.columnCount_ = opt_columnCount || 10; 
  this.gridsize_ =(opt_rowCount || 10) * this.columnCount_; 
  this.recentwidth_ = this.columnCount_ + 1; 
  this.recents_ = opt_recents ||[]; 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  this.decompressor_ = new goog.i18n.CharListDecompressor(); 
}; 
goog.inherits(goog.ui.CharPicker, goog.ui.Component); 
goog.ui.CharPicker.prototype.selectedChar_ = null; 
goog.ui.CharPicker.prototype.layoutAlteringChars_ = null; 
goog.ui.CharPicker.prototype.menu_ = null; 
goog.ui.CharPicker.prototype.menubutton_ = null; 
goog.ui.CharPicker.prototype.submenu_ = null; 
goog.ui.CharPicker.prototype.submenubutton_ = null; 
goog.ui.CharPicker.prototype.stickwrap_ = null; 
goog.ui.CharPicker.prototype.grid_ = null; 
goog.ui.CharPicker.prototype.notice_ = null; 
goog.ui.CharPicker.prototype.recentgrid_ = null; 
goog.ui.CharPicker.prototype.input_ = null; 
goog.ui.CharPicker.prototype.okbutton_ = null; 
goog.ui.CharPicker.prototype.zoomEl_ = null; 
goog.ui.CharPicker.prototype.unicodeEl_ = null; 
goog.ui.CharPicker.prototype.hc_ = null; 
goog.ui.CharPicker.prototype.getSelectedChar = function() { 
  return this.selectedChar_; 
}; 
goog.ui.CharPicker.prototype.getRecentChars = function() { 
  return this.recents_; 
}; 
goog.ui.CharPicker.prototype.createDom = function() { 
  goog.ui.CharPicker.superClass_.createDom.call(this); 
  this.decorateInternal(this.getDomHelper().createElement('div')); 
}; 
goog.ui.CharPicker.prototype.disposeInternal = function() { 
  this.hc_.dispose(); 
  this.hc_ = null; 
  this.eventHandler_.dispose(); 
  this.eventHandler_ = null; 
  goog.ui.CharPicker.superClass_.disposeInternal.call(this); 
}; 
goog.ui.CharPicker.prototype.decorateInternal = function(element) { 
  goog.ui.CharPicker.superClass_.decorateInternal.call(this, element); 
  var chrs = this.decompressor_.toCharList(':2%C^O80V1H2s2G40Q%s0'); 
  this.layoutAlteringChars_ = new goog.structs.Set(chrs); 
  this.menu_ = new goog.ui.Menu(); 
  var categories = this.data_.categories; 
  for(var i = 0; i < this.data_.categories.length; i ++) { 
    this.menu_.addChild(this.createMenuItem_(i, categories[i]), true); 
  } 
  this.menubutton_ = new goog.ui.MenuButton('Category Menu', this.menu_); 
  this.addChild(this.menubutton_, true); 
  this.submenu_ = new goog.ui.Menu(); 
  this.submenubutton_ = new goog.ui.MenuButton('Subcategory Menu', this.submenu_); 
  this.addChild(this.submenubutton_, true); 
  var gridcontainer = new goog.ui.Component(); 
  this.addChild(gridcontainer, true); 
  var stickwrap = new goog.ui.Component(); 
  gridcontainer.addChild(stickwrap, true); 
  this.stickwrap_ = stickwrap.getElement(); 
  var stick = new goog.ui.Component(); 
  stickwrap.addChild(stick, true); 
  this.stick_ = stick.getElement(); 
  this.grid_ = new goog.ui.Component(); 
  gridcontainer.addChild(this.grid_, true); 
  this.notice_ = new goog.ui.Component(); 
  this.notice_.setElementInternal(goog.dom.createDom('div')); 
  this.addChild(this.notice_, true); 
  var MSG_CHAR_PICKER_RECENT_SELECTIONS = goog.getMsg('Recent Selections:'); 
  var recenttext = new goog.ui.Component(); 
  recenttext.setElementInternal(goog.dom.createDom('span', null, MSG_CHAR_PICKER_RECENT_SELECTIONS)); 
  this.addChild(recenttext, true); 
  this.recentgrid_ = new goog.ui.Component(); 
  this.addChild(this.recentgrid_, true); 
  var uplus = new goog.ui.Component(); 
  uplus.setElementInternal(goog.dom.createDom('span', null, 'U+')); 
  this.addChild(uplus, true); 
  var MSG_CHAR_PICKER_HEX_INPUT = goog.getMsg('Hex Input'); 
  this.input_ = new goog.ui.LabelInput(MSG_CHAR_PICKER_HEX_INPUT); 
  this.addChild(this.input_, true); 
  this.okbutton_ = new goog.ui.Button('OK'); 
  this.addChild(this.okbutton_, true); 
  this.okbutton_.setEnabled(false); 
  this.zoomEl_ = goog.dom.createDom('div', { 
    id: 'zoom', 
    className: goog.getCssName('goog-char-picker-char-zoom') 
  }); 
  this.unicodeEl_ = goog.dom.createDom('div', { 
    id: 'unicode', 
    className: goog.getCssName('goog-char-picker-unicode') 
  }); 
  var card = goog.dom.createDom('div', { 'id': 'preview' }, this.zoomEl_, this.unicodeEl_); 
  goog.style.showElement(card, false); 
  this.hc_ = new goog.ui.HoverCard({ 'DIV': 'char' }); 
  this.hc_.setElement(card); 
  var self = this; 
  function onBeforeShow() { 
    var trigger = self.hc_.getAnchorElement(); 
    var ch = self.getChar_(trigger); 
    if(ch) { 
      self.zoomEl_.innerHTML = self.displayChar_(ch); 
      self.unicodeEl_.innerHTML = self.getTagFromChar_(ch); 
    } 
  } 
  goog.events.listen(this.hc_, goog.ui.HoverCard.EventType.BEFORE_SHOW, onBeforeShow); 
  goog.dom.classes.add(element, goog.getCssName('goog-char-picker')); 
  goog.dom.classes.add(this.stick_, goog.getCssName('goog-stick')); 
  goog.dom.classes.add(this.stickwrap_, goog.getCssName('goog-stickwrap')); 
  goog.dom.classes.add(gridcontainer.getElement(), goog.getCssName('goog-char-picker-grid-container')); 
  goog.dom.classes.add(this.grid_.getElement(), goog.getCssName('goog-char-picker-grid')); 
  goog.dom.classes.add(this.recentgrid_.getElement(), goog.getCssName('goog-char-picker-grid')); 
  goog.dom.classes.add(this.recentgrid_.getElement(), goog.getCssName('goog-char-picker-recents')); 
  goog.dom.classes.add(this.notice_.getElement(), goog.getCssName('goog-char-picker-notice')); 
  goog.dom.classes.add(uplus.getElement(), goog.getCssName('goog-char-picker-uplus')); 
  goog.dom.classes.add(this.input_.getElement(), goog.getCssName('goog-char-picker-input-box')); 
  goog.dom.classes.add(this.okbutton_.getElement(), goog.getCssName('goog-char-picker-okbutton')); 
  goog.dom.classes.add(card, goog.getCssName('goog-char-picker-hovercard')); 
  this.hc_.className = goog.getCssName('goog-char-picker-hovercard'); 
  this.grid_.buttoncount = this.gridsize_; 
  this.recentgrid_.buttoncount = this.recentwidth_; 
  this.populateGridWithButtons_(this.grid_); 
  this.populateGridWithButtons_(this.recentgrid_); 
  this.updateGrid_(this.recentgrid_, this.recents_); 
  this.setSelectedCategory_(this.initCategory_, this.initSubcategory_); 
  new goog.ui.ContainerScroller(this.menu_); 
  new goog.ui.ContainerScroller(this.submenu_); 
  goog.dom.classes.add(this.menu_.getElement(), goog.getCssName('goog-char-picker-menu')); 
  goog.dom.classes.add(this.submenu_.getElement(), goog.getCssName('goog-char-picker-menu')); 
}; 
goog.ui.CharPicker.prototype.enterDocument = function() { 
  goog.ui.CharPicker.superClass_.enterDocument.call(this); 
  var inputkh = new goog.events.InputHandler(this.input_.getElement()); 
  this.keyHandler_ = new goog.events.KeyHandler(this.input_.getElement()); 
  this.eventHandler_.listen(this.menubutton_, goog.ui.Component.EventType.ACTION, goog.events.Event.stopPropagation).listen(this.submenubutton_, goog.ui.Component.EventType.ACTION, goog.events.Event.stopPropagation).listen(this, goog.ui.Component.EventType.ACTION, this.handleSelectedItem_, true).listen(inputkh, goog.events.InputHandler.EventType.INPUT, this.handleInput_).listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.handleEnter_); 
  goog.events.listen(this.okbutton_.getElement(), goog.events.EventType.MOUSEDOWN, this.handleOkClick_, true, this); 
  goog.events.listen(this.stickwrap_, goog.events.EventType.SCROLL, this.handleScroll_, true, this); 
}; 
goog.ui.CharPicker.prototype.handleScroll_ = function(e) { 
  var height = e.target.scrollHeight; 
  var top = e.target.scrollTop; 
  var itempos = Math.ceil(top * this.items.length /(this.columnCount_ * height)) * this.columnCount_; 
  if(this.itempos != itempos) { 
    this.itempos = itempos; 
    this.modifyGridWithItems_(this.grid_, this.items, itempos); 
  } 
  e.stopPropagation(); 
}; 
goog.ui.CharPicker.prototype.handleSelectedItem_ = function(e) { 
  if(e.target.getParent() == this.menu_) { 
    this.menu_.setVisible(false); 
    this.setSelectedCategory_(e.target.getValue()); 
  } else if(e.target.getParent() == this.submenu_) { 
    this.submenu_.setVisible(false); 
    this.setSelectedSubcategory_(e.target.getValue()); 
  } else if(e.target.getParent() == this.grid_) { 
    var button = e.target.getElement(); 
    this.selectedChar_ = this.getChar_(button); 
    this.updateRecents_(this.selectedChar_); 
  } else if(e.target.getParent() == this.recentgrid_) { 
    this.selectedChar_ = this.getChar_(e.target.getElement()); 
  } 
}; 
goog.ui.CharPicker.prototype.handleInput_ = function(e) { 
  var ch = this.getInputChar_(); 
  if(ch) { 
    var unicode = this.getTagFromChar_(ch); 
    this.zoomEl_.innerHTML = ch; 
    this.unicodeEl_.innerHTML = unicode; 
    var coord = new goog.ui.Tooltip.ElementTooltipPosition(this.input_.getElement()); 
    this.hc_.setPosition(coord); 
    this.hc_.triggerForElement(this.input_.getElement()); 
    this.okbutton_.setEnabled(true); 
  } else { 
    this.hc_.cancelTrigger(); 
    this.hc_.setVisible(false); 
    this.okbutton_.setEnabled(false); 
  } 
}; 
goog.ui.CharPicker.prototype.handleOkClick_ = function(opt_event) { 
  var ch = this.getInputChar_(); 
  if(ch && ch.charCodeAt(0)) { 
    this.selectedChar_ = ch; 
    this.updateRecents_(ch); 
    return true; 
  } 
  return false; 
}; 
goog.ui.CharPicker.prototype.handleEnter_ = function(e) { 
  if(e.keyCode == goog.events.KeyCodes.ENTER) { 
    return this.handleOkClick_() ? this.dispatchEvent(goog.ui.Component.EventType.ACTION): false; 
  } 
  return false; 
}; 
goog.ui.CharPicker.prototype.getChar_ = function(e) { 
  return e.getAttribute('char'); 
}; 
goog.ui.CharPicker.prototype.createMenuItem_ = function(id, caption) { 
  var item = new goog.ui.MenuItem(caption); 
  item.setValue(id); 
  item.setVisible(true); 
  return item; 
}; 
goog.ui.CharPicker.prototype.setSelectedCategory_ = function(category, opt_subcategory) { 
  this.category = category; 
  this.menubutton_.setCaption(this.data_.categories[category]); 
  while(this.submenu_.hasChildren()) { 
    this.submenu_.removeChildAt(0, true).dispose(); 
  } 
  var subcategories = this.data_.subcategories[category]; 
  var charList = this.data_.charList[category]; 
  for(var i = 0; i < subcategories.length; i ++) { 
    var subtitle = charList[i].length == 0; 
    var item = this.createMenuItem_(i, subcategories[i]); 
    this.submenu_.addChild(item, true); 
  } 
  this.setSelectedSubcategory_(opt_subcategory || 0); 
}; 
goog.ui.CharPicker.prototype.setSelectedSubcategory_ = function(subcategory) { 
  var subcategories = this.data_.subcategories; 
  var name = subcategories[this.category][subcategory]; 
  this.submenubutton_.setCaption(name); 
  this.setSelectedGrid_(this.category, subcategory); 
}; 
goog.ui.CharPicker.prototype.setSelectedGrid_ = function(category, subcategory) { 
  var charLists = this.data_.charList; 
  var charListStr = charLists[category][subcategory]; 
  var content = this.decompressor_.toCharList(charListStr); 
  this.updateGrid_(this.grid_, content); 
}; 
goog.ui.CharPicker.prototype.updateGrid_ = function(grid, items) { 
  if(grid == this.grid_) { 
    var MSG_PLEASE_HOVER = goog.getMsg('Please hover over each cell for the character name.'); 
    this.notice_.getElement().innerHTML = goog.i18n.uChar.toName(items[0]) ? MSG_PLEASE_HOVER: ''; 
    this.items = items; 
    if(this.stickwrap_.offsetHeight > 0) { 
      this.stick_.style.height = this.stickwrap_.offsetHeight * items.length / this.gridsize_ + 'px'; 
    } else { 
      this.stick_.style.height = 3 * this.columnCount_ * items.length / this.gridsize_ + 'em'; 
    } 
    this.stickwrap_.scrollTop = 0; 
  } 
  this.modifyGridWithItems_(grid, items, 0); 
}; 
goog.ui.CharPicker.prototype.modifyGridWithItems_ = function(grid, items, start) { 
  for(var buttonpos = 0, itempos = start; buttonpos < grid.buttoncount && itempos < items.length; buttonpos ++, itempos ++) { 
    this.modifyCharNode_(grid.getChildAt(buttonpos), items[itempos]); 
  } 
  for(; buttonpos < grid.buttoncount; buttonpos ++) { 
    grid.getChildAt(buttonpos).setVisible(false); 
  } 
  var first = grid.getChildAt(0); 
  goog.dom.setFocusableTabIndex(first.getElement(), true); 
}; 
goog.ui.CharPicker.prototype.populateGridWithButtons_ = function(grid) { 
  for(var i = 0; i < grid.buttoncount; i ++) { 
    var button = new goog.ui.Button(' ', goog.ui.FlatButtonRenderer.getInstance()); 
    grid.addChild(button, true); 
    button.setVisible(false); 
    var buttonEl = button.getElement(); 
    goog.dom.a11y.setRole(buttonEl, 'gridcell'); 
  } 
}; 
goog.ui.CharPicker.prototype.modifyCharNode_ = function(button, ch) { 
  var text = this.displayChar_(ch); 
  var buttonEl = button.getElement(); 
  buttonEl.innerHTML = text; 
  buttonEl.setAttribute('char', ch); 
  goog.dom.setFocusableTabIndex(buttonEl, false); 
  button.setVisible(true); 
}; 
goog.ui.CharPicker.prototype.updateRecents_ = function(character) { 
  if(character && character.charCodeAt(0) && ! goog.array.contains(this.recents_, character)) { 
    this.recents_.unshift(character); 
    if(this.recents_.length > this.recentwidth_) { 
      this.recents_.pop(); 
    } 
    this.updateGrid_(this.recentgrid_, this.recents_); 
  } 
}; 
goog.ui.CharPicker.prototype.getInputChar_ = function() { 
  var text = this.input_.getValue(); 
  var code = parseInt(text, 16); 
  return(goog.i18n.uChar.fromCharCode(code)); 
}; 
goog.ui.CharPicker.prototype.getTagFromChar_ = function(ch) { 
  var unicodetext = goog.i18n.uChar.toHexString(ch); 
  var name = goog.i18n.uChar.toName(ch); 
  if(name) { 
    unicodetext += ' ' + name; 
  } 
  return unicodetext; 
}; 
goog.ui.CharPicker.prototype.displayChar_ = function(ch) { 
  return this.layoutAlteringChars_.contains(ch) ? '\u00A0': ch; 
}; 
