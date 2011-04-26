
goog.provide('goog.ui.tree.TreeControl'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.FocusHandler'); 
goog.require('goog.events.KeyHandler'); 
goog.require('goog.events.KeyHandler.EventType'); 
goog.require('goog.ui.tree.BaseNode'); 
goog.require('goog.ui.tree.TreeNode'); 
goog.require('goog.ui.tree.TypeAhead'); 
goog.require('goog.userAgent'); 
goog.ui.tree.TreeControl = function(html, opt_config, opt_domHelper) { 
  goog.ui.tree.BaseNode.call(this, html, opt_config, opt_domHelper); 
  this.setExpandedInternal(true); 
  this.setSelectedInternal(true); 
  this.selectedItem_ = this; 
  this.typeAhead_ = new goog.ui.tree.TypeAhead(); 
  if(goog.userAgent.IE) { 
    try { 
      document.execCommand('BackgroundImageCache', false, true); 
    } catch(e) { 
      this.logger_.warning('Failed to enable background image cache'); 
    } 
  } 
}; 
goog.inherits(goog.ui.tree.TreeControl, goog.ui.tree.BaseNode); 
goog.ui.tree.TreeControl.prototype.keyHandler_ = null; 
goog.ui.tree.TreeControl.prototype.focusHandler_ = null; 
goog.ui.tree.TreeControl.prototype.logger_ = goog.debug.Logger.getLogger('goog.ui.tree.TreeControl'); 
goog.ui.tree.TreeControl.prototype.focused_ = false; 
goog.ui.tree.TreeControl.prototype.focusedNode_ = null; 
goog.ui.tree.TreeControl.prototype.showLines_ = true; 
goog.ui.tree.TreeControl.prototype.showExpandIcons_ = true; 
goog.ui.tree.TreeControl.prototype.showRootNode_ = true; 
goog.ui.tree.TreeControl.prototype.showRootLines_ = true; 
goog.ui.tree.TreeControl.prototype.getTree = function() { 
  return this; 
}; 
goog.ui.tree.TreeControl.prototype.getDepth = function() { 
  return 0; 
}; 
goog.ui.tree.TreeControl.prototype.reveal = function() { }; 
goog.ui.tree.TreeControl.prototype.handleFocus_ = function(e) { 
  this.focused_ = true; 
  goog.dom.classes.add(this.getElement(), 'focused'); 
  if(this.selectedItem_) { 
    this.selectedItem_.select(); 
  } 
}; 
goog.ui.tree.TreeControl.prototype.handleBlur_ = function(e) { 
  this.focused_ = false; 
  goog.dom.classes.remove(this.getElement(), 'focused'); 
}; 
goog.ui.tree.TreeControl.prototype.hasFocus = function() { 
  return this.focused_; 
}; 
goog.ui.tree.TreeControl.prototype.getExpanded = function() { 
  return ! this.showRootNode_ || goog.ui.tree.TreeControl.superClass_.getExpanded.call(this); 
}; 
goog.ui.tree.TreeControl.prototype.setExpanded = function(expanded) { 
  if(! this.showRootNode_) { 
    this.setExpandedInternal(expanded); 
  } else { 
    goog.ui.tree.TreeControl.superClass_.setExpanded.call(this, expanded); 
  } 
}; 
goog.ui.tree.TreeControl.prototype.getExpandIconHtml = function() { 
  return ''; 
}; 
goog.ui.tree.TreeControl.prototype.getIconElement = function() { 
  var el = this.getRowElement(); 
  return el ?(el.firstChild): null; 
}; 
goog.ui.tree.TreeControl.prototype.getExpandIconElement = function() { 
  return null; 
}; 
goog.ui.tree.TreeControl.prototype.updateExpandIcon = function() { }; 
goog.ui.tree.TreeControl.prototype.getRowClassName = function() { 
  return goog.ui.tree.TreeControl.superClass_.getRowClassName.call(this) +(this.showRootNode_ ? '': ' ' + this.getConfig().cssHideRoot); 
}; 
goog.ui.tree.TreeControl.prototype.getCalculatedIconClass = function() { 
  var expanded = this.getExpanded(); 
  if(expanded && this.expandedIconClass_) { 
    return this.expandedIconClass_; 
  } 
  if(! expanded && this.iconClass_) { 
    return this.iconClass_; 
  } 
  var config = this.getConfig(); 
  if(expanded && config.cssExpandedRootIcon) { 
    return config.cssTreeIcon + ' ' + config.cssExpandedRootIcon; 
  } else if(! expanded && config.cssCollapsedRootIcon) { 
    return config.cssTreeIcon + ' ' + config.cssCollapsedRootIcon; 
  } 
  return ''; 
}; 
goog.ui.tree.TreeControl.prototype.setSelectedItem = function(node) { 
  if(this.selectedItem_ == node) { 
    return; 
  } 
  var hadFocus = false; 
  if(this.selectedItem_) { 
    hadFocus = this.selectedItem_ == this.focusedNode_; 
    this.selectedItem_.setSelectedInternal(false); 
  } 
  this.selectedItem_ = node; 
  if(node) { 
    node.setSelectedInternal(true); 
    if(hadFocus) { 
      node.select(); 
    } 
  } 
  this.dispatchEvent(goog.events.EventType.CHANGE); 
}; 
goog.ui.tree.TreeControl.prototype.getSelectedItem = function() { 
  return this.selectedItem_; 
}; 
goog.ui.tree.TreeControl.prototype.setShowLines = function(b) { 
  if(this.showLines_ != b) { 
    this.showLines_ = b; 
    if(this.isInDocument()) { 
      this.updateLinesAndExpandIcons_(); 
    } 
  } 
}; 
goog.ui.tree.TreeControl.prototype.getShowLines = function() { 
  return this.showLines_; 
}; 
goog.ui.tree.TreeControl.prototype.updateLinesAndExpandIcons_ = function() { 
  var tree = this; 
  var showLines = tree.getShowLines(); 
  var showRootLines = tree.getShowRootLines(); 
  function updateShowLines(node) { 
    var childrenEl = node.getChildrenElement(); 
    if(childrenEl) { 
      var hideLines = ! showLines || tree == node.getParent() && ! showRootLines; 
      var childClass = hideLines ? node.getConfig().cssChildrenNoLines: node.getConfig().cssChildren; 
      childrenEl.className = childClass; 
      var expandIconEl = node.getExpandIconElement(); 
      if(expandIconEl) { 
        expandIconEl.className = node.getExpandIconClass(); 
      } 
    } 
    node.forEachChild(updateShowLines); 
  } 
  updateShowLines(this); 
}; 
goog.ui.tree.TreeControl.prototype.setShowRootLines = function(b) { 
  if(this.showRootLines_ != b) { 
    this.showRootLines_ = b; 
    if(this.isInDocument()) { 
      this.updateLinesAndExpandIcons_(); 
    } 
  } 
}; 
goog.ui.tree.TreeControl.prototype.getShowRootLines = function() { 
  return this.showRootLines_; 
}; 
goog.ui.tree.TreeControl.prototype.setShowExpandIcons = function(b) { 
  if(this.showExpandIcons_ != b) { 
    this.showExpandIcons_ = b; 
    if(this.isInDocument()) { 
      this.updateLinesAndExpandIcons_(); 
    } 
  } 
}; 
goog.ui.tree.TreeControl.prototype.getShowExpandIcons = function() { 
  return this.showExpandIcons_; 
}; 
goog.ui.tree.TreeControl.prototype.setShowRootNode = function(b) { 
  if(this.showRootNode_ != b) { 
    this.showRootNode_ = b; 
    if(this.isInDocument()) { 
      var el = this.getRowElement(); 
      if(el) { 
        el.className = this.getRowClassName(); 
      } 
    } 
    if(! b && this.getSelectedItem() == this && this.getFirstChild()) { 
      this.setSelectedItem(this.getFirstChild()); 
    } 
  } 
}; 
goog.ui.tree.TreeControl.prototype.getShowRootNode = function() { 
  return this.showRootNode_; 
}; 
goog.ui.tree.TreeControl.prototype.initAccessibility = function() { 
  goog.ui.tree.TreeControl.superClass_.initAccessibility.call(this); 
  var elt = this.getElement(); 
  goog.dom.a11y.setRole(elt, 'tree'); 
  goog.dom.a11y.setState(elt, 'labelledby', this.getLabelElement().id); 
}; 
goog.ui.tree.TreeControl.prototype.enterDocument = function() { 
  goog.ui.tree.TreeControl.superClass_.enterDocument.call(this); 
  var el = this.getElement(); 
  el.className = this.getConfig().cssRoot; 
  el.setAttribute('hideFocus', 'true'); 
  this.attachEvents_(); 
  this.initAccessibility(); 
}; 
goog.ui.tree.TreeControl.prototype.exitDocument = function() { 
  goog.ui.tree.TreeControl.superClass_.exitDocument.call(this); 
  this.detachEvents_(); 
}; 
goog.ui.tree.TreeControl.prototype.attachEvents_ = function() { 
  var el = this.getElement(); 
  el.tabIndex = 0; 
  var kh = this.keyHandler_ = new goog.events.KeyHandler(el); 
  var fh = this.focusHandler_ = new goog.events.FocusHandler(el); 
  this.getHandler().listen(fh, goog.events.FocusHandler.EventType.FOCUSOUT, this.handleBlur_).listen(fh, goog.events.FocusHandler.EventType.FOCUSIN, this.handleFocus_).listen(kh, goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent).listen(el, goog.events.EventType.MOUSEDOWN, this.handleMouseEvent_).listen(el, goog.events.EventType.CLICK, this.handleMouseEvent_).listen(el, goog.events.EventType.DBLCLICK, this.handleMouseEvent_); 
}; 
goog.ui.tree.TreeControl.prototype.detachEvents_ = function() { 
  this.keyHandler_.dispose(); 
  this.keyHandler_ = null; 
  this.focusHandler_.dispose(); 
  this.focusHandler_ = null; 
}; 
goog.ui.tree.TreeControl.prototype.handleMouseEvent_ = function(e) { 
  this.logger_.fine('Received event ' + e.type); 
  var node = this.getNodeFromEvent_(e); 
  if(node) { 
    switch(e.type) { 
      case goog.events.EventType.MOUSEDOWN: 
        node.onMouseDown(e); 
        break; 

      case goog.events.EventType.CLICK: 
        node.onClick_(e); 
        break; 

      case goog.events.EventType.DBLCLICK: 
        node.onDoubleClick_(e); 
        break; 

    } 
  } 
}; 
goog.ui.tree.TreeControl.prototype.handleKeyEvent = function(e) { 
  var handled = false; 
  handled = this.typeAhead_.handleNavigation(e) ||(this.selectedItem_ && this.selectedItem_.onKeyDown(e)) || this.typeAhead_.handleTypeAheadChar(e); 
  if(handled) { 
    e.preventDefault(); 
  } 
  return handled; 
}; 
goog.ui.tree.TreeControl.prototype.getNodeFromEvent_ = function(e) { 
  var node = null; 
  var target = e.target; 
  while(target != null) { 
    var id = target.id; 
    node = goog.ui.tree.BaseNode.allNodes[id]; 
    if(node) { 
      return node; 
    } 
    if(target == this.getElement()) { 
      break; 
    } 
    target = target.parentNode; 
  } 
  return null; 
}; 
goog.ui.tree.TreeControl.prototype.createNode = function(html) { 
  return new goog.ui.tree.TreeNode(html || '', this.getConfig(), this.getDomHelper()); 
}; 
goog.ui.tree.TreeControl.prototype.setNode = function(node) { 
  this.typeAhead_.setNodeInMap(node); 
}; 
goog.ui.tree.TreeControl.prototype.removeNode = function(node) { 
  this.typeAhead_.removeNodeFromMap(node); 
}; 
goog.ui.tree.TreeControl.prototype.clearTypeAhead = function() { 
  this.typeAhead_.clear(); 
}; 
goog.ui.tree.TreeControl.defaultConfig = { 
  cleardotPath: 'images/cleardot.gif', 
  indentWidth: 19, 
  cssRoot: goog.getCssName('goog-tree-root') + ' ' + goog.getCssName('goog-tree-item'), 
  cssHideRoot: goog.getCssName('goog-tree-hide-root'), 
  cssItem: goog.getCssName('goog-tree-item'), 
  cssChildren: goog.getCssName('goog-tree-children'), 
  cssChildrenNoLines: goog.getCssName('goog-tree-children-nolines'), 
  cssTreeRow: goog.getCssName('goog-tree-row'), 
  cssItemLabel: goog.getCssName('goog-tree-item-label'), 
  cssTreeIcon: goog.getCssName('goog-tree-icon'), 
  cssExpandTreeIcon: goog.getCssName('goog-tree-expand-icon'), 
  cssExpandTreeIconPlus: goog.getCssName('goog-tree-expand-icon-plus'), 
  cssExpandTreeIconMinus: goog.getCssName('goog-tree-expand-icon-minus'), 
  cssExpandTreeIconTPlus: goog.getCssName('goog-tree-expand-icon-tplus'), 
  cssExpandTreeIconTMinus: goog.getCssName('goog-tree-expand-icon-tminus'), 
  cssExpandTreeIconLPlus: goog.getCssName('goog-tree-expand-icon-lplus'), 
  cssExpandTreeIconLMinus: goog.getCssName('goog-tree-expand-icon-lminus'), 
  cssExpandTreeIconT: goog.getCssName('goog-tree-expand-icon-t'), 
  cssExpandTreeIconL: goog.getCssName('goog-tree-expand-icon-l'), 
  cssExpandTreeIconBlank: goog.getCssName('goog-tree-expand-icon-blank'), 
  cssExpandedFolderIcon: goog.getCssName('goog-tree-expanded-folder-icon'), 
  cssCollapsedFolderIcon: goog.getCssName('goog-tree-collapsed-folder-icon'), 
  cssFileIcon: goog.getCssName('goog-tree-file-icon'), 
  cssExpandedRootIcon: goog.getCssName('goog-tree-expanded-folder-icon'), 
  cssCollapsedRootIcon: goog.getCssName('goog-tree-collapsed-folder-icon'), 
  cssSelectedRow: goog.getCssName('selected') 
}; 
