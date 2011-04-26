
goog.provide('goog.ui.tree.BaseNode'); 
goog.provide('goog.ui.tree.BaseNode.EventType'); 
goog.require('goog.Timer'); 
goog.require('goog.asserts'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.string'); 
goog.require('goog.string.StringBuffer'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.userAgent'); 
goog.ui.tree.BaseNode = function(html, opt_config, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.config_ = opt_config || goog.ui.tree.TreeControl.defaultConfig; 
  this.html_ = html; 
}; 
goog.inherits(goog.ui.tree.BaseNode, goog.ui.Component); 
goog.ui.tree.BaseNode.EventType = { 
  BEFORE_EXPAND: 'beforeexpand', 
  EXPAND: 'expand', 
  BEFORE_COLLAPSE: 'beforecollapse', 
  COLLAPSE: 'collapse' 
}; 
goog.ui.tree.BaseNode.allNodes = { }; 
goog.ui.tree.BaseNode.prototype.selected_ = false; 
goog.ui.tree.BaseNode.prototype.expanded_ = false; 
goog.ui.tree.BaseNode.prototype.toolTip_ = null; 
goog.ui.tree.BaseNode.prototype.afterLabelHtml_ = ''; 
goog.ui.tree.BaseNode.prototype.isUserCollapsible_ = true; 
goog.ui.tree.BaseNode.prototype.depth_ = - 1; 
goog.ui.tree.BaseNode.prototype.disposeInternal = function() { 
  goog.ui.tree.BaseNode.superClass_.disposeInternal.call(this); 
  if(this.tree_) { 
    this.tree_.removeNode(this); 
    this.tree_ = null; 
  } 
  this.setElementInternal(null); 
}; 
goog.ui.tree.BaseNode.prototype.initAccessibility = function() { 
  var el = this.getElement(); 
  if(el) { 
    var label = this.getLabelElement(); 
    if(label && ! label.id) { 
      label.id = this.getId() + '.label'; 
    } 
    goog.dom.a11y.setRole(el, 'treeitem'); 
    goog.dom.a11y.setState(el, 'selected', false); 
    goog.dom.a11y.setState(el, 'expanded', false); 
    goog.dom.a11y.setState(el, 'level', this.getDepth()); 
    if(label) { 
      goog.dom.a11y.setState(el, 'labelledby', label.id); 
    } 
    var img = this.getIconElement(); 
    if(img) { 
      goog.dom.a11y.setRole(img, 'presentation'); 
    } 
    var ei = this.getExpandIconElement(); 
    if(ei) { 
      goog.dom.a11y.setRole(ei, 'presentation'); 
    } 
    var ce = this.getChildrenElement(); 
    goog.dom.a11y.setRole(ce, 'group'); 
    if(ce.hasChildNodes()) { 
      var count = this.getChildCount(); 
      for(var i = 1; i <= count; i ++) { 
        var child = this.getChildAt(i - 1).getElement(); 
        goog.dom.a11y.setState(child, 'setsize', count); 
        goog.dom.a11y.setState(child, 'posinset', i); 
      } 
    } 
  } 
}; 
goog.ui.tree.BaseNode.prototype.createDom = function() { 
  var sb = new goog.string.StringBuffer(); 
  this.toHtml(sb); 
  var element = this.getDomHelper().htmlToDocumentFragment(sb.toString()); 
  this.setElementInternal((element)); 
}; 
goog.ui.tree.BaseNode.prototype.enterDocument = function() { 
  goog.ui.tree.BaseNode.superClass_.enterDocument.call(this); 
  goog.ui.tree.BaseNode.allNodes[this.getId()]= this; 
  this.initAccessibility(); 
}; 
goog.ui.tree.BaseNode.prototype.exitDocument = function() { 
  goog.ui.tree.BaseNode.superClass_.exitDocument.call(this); 
  delete goog.ui.tree.BaseNode.allNodes[this.getId()]; 
}; 
goog.ui.tree.BaseNode.prototype.addChildAt = function(child, index, opt_render) { 
  goog.asserts.assert(! child.getParent()); 
  var prevNode = this.getChildAt(index - 1); 
  var nextNode = this.getChildAt(index); 
  goog.ui.tree.BaseNode.superClass_.addChildAt.call(this, child, index); 
  child.previousSibling_ = prevNode; 
  child.nextSibling_ = nextNode; 
  if(prevNode) { 
    prevNode.nextSibling_ = child; 
  } else { 
    this.firstChild_ = child; 
  } 
  if(nextNode) { 
    nextNode.previousSibling_ = child; 
  } else { 
    this.lastChild_ = child; 
  } 
  var tree = this.getTree(); 
  if(tree) { 
    child.setTreeInternal(tree); 
  } 
  child.setDepth_(this.getDepth() + 1); 
  if(this.getElement()) { 
    this.updateExpandIcon(); 
    if(this.getExpanded()) { 
      var el = this.getChildrenElement(); 
      if(! child.getElement()) { 
        child.createDom(); 
      } 
      var childElement = child.getElement(); 
      var nextElement = nextNode && nextNode.getElement(); 
      el.insertBefore(childElement, nextElement); 
      if(this.isInDocument()) { 
        child.enterDocument(); 
      } 
      if(! nextNode) { 
        if(prevNode) { 
          prevNode.updateExpandIcon(); 
        } else { 
          goog.style.showElement(el, true); 
          this.setExpanded(this.getExpanded()); 
        } 
      } 
    } 
  } 
}; 
goog.ui.tree.BaseNode.prototype.add = function(child, opt_before) { 
  goog.asserts.assert(! opt_before || opt_before.getParent() == this, 'Can only add nodes before siblings'); 
  if(child.getParent()) { 
    child.getParent().removeChild(child); 
  } 
  this.addChildAt(child, opt_before ? this.indexOfChild(opt_before): this.getChildCount()); 
  return child; 
}; 
goog.ui.tree.BaseNode.prototype.removeChild = function(childNode, opt_unrender) { 
  var child =(childNode); 
  var tree = this.getTree(); 
  var selectedNode = tree ? tree.getSelectedItem(): null; 
  if(selectedNode == child || child.contains(selectedNode)) { 
    if(tree.hasFocus()) { 
      this.select(); 
      goog.Timer.callOnce(this.onTimeoutSelect_, 10, this); 
    } else { 
      this.select(); 
    } 
  } 
  goog.ui.tree.BaseNode.superClass_.removeChild.call(this, child); 
  if(this.lastChild_ == child) { 
    this.lastChild_ = child.previousSibling_; 
  } 
  if(this.firstChild_ == child) { 
    this.firstChild_ = child.nextSibling_; 
  } 
  if(child.previousSibling_) { 
    child.previousSibling_.nextSibling_ = child.nextSibling_; 
  } 
  if(child.nextSibling_) { 
    child.nextSibling_.previousSibling_ = child.previousSibling_; 
  } 
  var wasLast = child.isLastSibling(); 
  child.tree_ = null; 
  child.depth_ = - 1; 
  if(tree) { 
    tree.removeNode(this); 
    if(this.isInDocument()) { 
      var el = this.getChildrenElement(); 
      if(child.isInDocument()) { 
        var childEl = child.getElement(); 
        el.removeChild(childEl); 
        child.exitDocument(); 
      } 
      if(wasLast) { 
        var newLast = this.getLastChild(); 
        if(newLast) { 
          newLast.updateExpandIcon(); 
        } 
      } 
      if(! this.hasChildren()) { 
        el.style.display = 'none'; 
        this.updateExpandIcon(); 
        this.updateIcon_(); 
      } 
    } 
  } 
  return child; 
}; 
goog.ui.tree.BaseNode.prototype.remove = goog.ui.tree.BaseNode.prototype.removeChild; 
goog.ui.tree.BaseNode.prototype.onTimeoutSelect_ = function() { 
  this.select(); 
}; 
goog.ui.tree.BaseNode.prototype.getTree = goog.abstractMethod; 
goog.ui.tree.BaseNode.prototype.getDepth = function() { 
  var depth = this.depth_; 
  if(depth < 0) { 
    depth = this.computeDepth_(); 
    this.setDepth_(depth); 
  } 
  return depth; 
}; 
goog.ui.tree.BaseNode.prototype.computeDepth_ = function() { 
  var parent = this.getParent(); 
  if(parent) { 
    return parent.getDepth() + 1; 
  } else { 
    return 0; 
  } 
}; 
goog.ui.tree.BaseNode.prototype.setDepth_ = function(depth) { 
  if(depth != this.depth_) { 
    this.depth_ = depth; 
    var row = this.getRowElement(); 
    if(row) { 
      var indent = this.getPixelIndent_() + 'px'; 
      if(this.isRightToLeft()) { 
        row.style.paddingRight = indent; 
      } else { 
        row.style.paddingLeft = indent; 
      } 
    } 
    this.forEachChild(function(child) { 
      child.setDepth_(depth + 1); 
    }); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.contains = function(node) { 
  while(node) { 
    if(node == this) { 
      return true; 
    } 
    node = node.getParent(); 
  } 
  return false; 
}; 
goog.ui.tree.BaseNode.EMPTY_CHILDREN_ =[]; 
goog.ui.tree.BaseNode.prototype.getChildAt; 
goog.ui.tree.BaseNode.prototype.getChildren = function() { 
  var children =[]; 
  this.forEachChild(function(child) { 
    children.push(child); 
  }); 
  return children; 
}; 
goog.ui.tree.BaseNode.prototype.getFirstChild = function() { 
  return this.getChildAt(0); 
}; 
goog.ui.tree.BaseNode.prototype.getLastChild = function() { 
  return this.getChildAt(this.getChildCount() - 1); 
}; 
goog.ui.tree.BaseNode.prototype.getPreviousSibling = function() { 
  return this.previousSibling_; 
}; 
goog.ui.tree.BaseNode.prototype.getNextSibling = function() { 
  return this.nextSibling_; 
}; 
goog.ui.tree.BaseNode.prototype.isLastSibling = function() { 
  return ! this.nextSibling_; 
}; 
goog.ui.tree.BaseNode.prototype.isSelected = function() { 
  return this.selected_; 
}; 
goog.ui.tree.BaseNode.prototype.select = function() { 
  var tree = this.getTree(); 
  if(tree) { 
    tree.setSelectedItem(this); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.deselect = goog.nullFunction; 
goog.ui.tree.BaseNode.prototype.setSelectedInternal = function(selected) { 
  if(this.selected_ == selected) { 
    return; 
  } 
  this.selected_ = selected; 
  this.updateRow(); 
  var el = this.getElement(); 
  if(el) { 
    goog.dom.a11y.setState(el, 'selected', selected); 
    if(selected) { 
      goog.dom.a11y.setState(this.getTree().getElement(), 'activedescendant', this.getId()); 
    } 
  } 
}; 
goog.ui.tree.BaseNode.prototype.getExpanded = function() { 
  return this.expanded_; 
}; 
goog.ui.tree.BaseNode.prototype.setExpandedInternal = function(expanded) { 
  this.expanded_ = expanded; 
}; 
goog.ui.tree.BaseNode.prototype.setExpanded = function(expanded) { 
  var isStateChange = expanded != this.expanded_; 
  if(isStateChange) { 
    var prevented = ! this.dispatchEvent(expanded ? goog.ui.tree.BaseNode.EventType.BEFORE_EXPAND: goog.ui.tree.BaseNode.EventType.BEFORE_COLLAPSE); 
    if(prevented) return; 
  } 
  var ce; 
  this.expanded_ = expanded; 
  var tree = this.getTree(); 
  var el = this.getElement(); 
  if(this.hasChildren()) { 
    if(! expanded && tree && this.contains(tree.getSelectedItem())) { 
      this.select(); 
    } 
    if(el) { 
      ce = this.getChildrenElement(); 
      if(ce) { 
        goog.style.showElement(ce, expanded); 
        if(expanded && this.isInDocument() && ! ce.hasChildNodes()) { 
          var sb = new goog.string.StringBuffer(); 
          this.forEachChild(function(child) { 
            child.toHtml(sb); 
          }); 
          ce.innerHTML = sb.toString(); 
          this.forEachChild(function(child) { 
            child.enterDocument(); 
          }); 
        } 
      } 
      this.updateExpandIcon(); 
    } 
  } else { 
    ce = this.getChildrenElement(); 
    if(ce) { 
      goog.style.showElement(ce, false); 
    } 
  } 
  if(el) { 
    this.updateIcon_(); 
    goog.dom.a11y.setState(el, 'expanded', expanded); 
  } 
  if(isStateChange) { 
    this.dispatchEvent(expanded ? goog.ui.tree.BaseNode.EventType.EXPAND: goog.ui.tree.BaseNode.EventType.COLLAPSE); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.toggle = function() { 
  this.setExpanded(! this.getExpanded()); 
}; 
goog.ui.tree.BaseNode.prototype.expand = function() { 
  this.setExpanded(true); 
}; 
goog.ui.tree.BaseNode.prototype.collapse = function() { 
  this.setExpanded(false); 
}; 
goog.ui.tree.BaseNode.prototype.collapseChildren = function() { 
  this.forEachChild(function(child) { 
    child.collapseAll(); 
  }); 
}; 
goog.ui.tree.BaseNode.prototype.collapseAll = function() { 
  this.collapseChildren(); 
  this.collapse(); 
}; 
goog.ui.tree.BaseNode.prototype.expandChildren = function() { 
  this.forEachChild(function(child) { 
    child.expandAll(); 
  }); 
}; 
goog.ui.tree.BaseNode.prototype.expandAll = function() { 
  this.expandChildren(); 
  this.expand(); 
}; 
goog.ui.tree.BaseNode.prototype.reveal = function() { 
  var parent = this.getParent(); 
  if(parent) { 
    parent.setExpanded(true); 
    parent.reveal(); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.setIsUserCollapsible = function(isCollapsible) { 
  this.isUserCollapsible_ = isCollapsible; 
  if(! this.isUserCollapsible_) { 
    this.expand(); 
  } 
  if(this.getElement()) { 
    this.updateExpandIcon(); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.isUserCollapsible = function() { 
  return this.isUserCollapsible_; 
}; 
goog.ui.tree.BaseNode.prototype.toHtml = function(sb) { 
  var tree = this.getTree(); 
  var hideLines = ! tree.getShowLines() || tree == this.getParent() && ! tree.getShowRootLines(); 
  var childClass = hideLines ? this.config_.cssChildrenNoLines: this.config_.cssChildren; 
  var nonEmptyAndExpanded = this.getExpanded() && this.hasChildren(); 
  sb.append('<div class="', this.config_.cssItem, '" id="', this.getId(), '">', this.getRowHtml(), '<div class="', childClass, '" style="', this.getLineStyle(),(nonEmptyAndExpanded ? '': 'display:none;'), '">'); 
  if(nonEmptyAndExpanded) { 
    this.forEachChild(function(child) { 
      child.toHtml(sb); 
    }); 
  } 
  sb.append('</div></div>'); 
}; 
goog.ui.tree.BaseNode.prototype.getPixelIndent_ = function() { 
  return Math.max(0,(this.getDepth() - 1) * this.config_.indentWidth); 
}; 
goog.ui.tree.BaseNode.prototype.getRowHtml = function() { 
  var sb = new goog.string.StringBuffer(); 
  sb.append('<div class="', this.getRowClassName(), '" style="padding-', this.isRightToLeft() ? 'right:': 'left:', this.getPixelIndent_(), 'px">', this.getExpandIconHtml(), this.getIconHtml(), this.getLabelHtml(), '</div>'); 
  return sb.toString(); 
}; 
goog.ui.tree.BaseNode.prototype.getRowClassName = function() { 
  var selectedClass; 
  if(this.isSelected()) { 
    selectedClass = ' ' + this.config_.cssSelectedRow; 
  } else { 
    selectedClass = ''; 
  } 
  return this.config_.cssTreeRow + selectedClass; 
}; 
goog.ui.tree.BaseNode.prototype.getLabelHtml = function() { 
  var toolTip = this.getToolTip(); 
  var sb = new goog.string.StringBuffer(); 
  sb.append('<span class="', this.config_.cssItemLabel, '"',(toolTip ? ' title="' + goog.string.htmlEscape(toolTip) + '"': ''), '>', this.getHtml(), '</span>', '<span>', this.getAfterLabelHtml(), '</span>'); 
  return sb.toString(); 
}; 
goog.ui.tree.BaseNode.prototype.getAfterLabelHtml = function() { 
  return this.afterLabelHtml_; 
}; 
goog.ui.tree.BaseNode.prototype.setAfterLabelHtml = function(html) { 
  this.afterLabelHtml_ = html; 
  var el = this.getAfterLabelElement(); 
  if(el) { 
    el.innerHTML = html; 
  } 
}; 
goog.ui.tree.BaseNode.prototype.getIconHtml = function() { 
  var iconClass = this.getCalculatedIconClass(); 
  if(iconClass) { 
    return goog.string.buildString('<img class="', iconClass, '" src="', this.config_.cleardotPath, '">'); 
  } else { 
    return goog.string.buildString('<img style="display:none"', '" src="', this.config_.cleardotPath, '">'); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.getCalculatedIconClass = goog.abstractMethod; 
goog.ui.tree.BaseNode.prototype.getExpandIconHtml = function() { 
  return goog.string.buildString('<img type="expand" class="', this.getExpandIconClass(), '" src="', this.config_.cleardotPath + '">'); 
}; 
goog.ui.tree.BaseNode.prototype.getExpandIconClass = function() { 
  var tree = this.getTree(); 
  var hideLines = ! tree.getShowLines() || tree == this.getParent() && ! tree.getShowRootLines(); 
  var config = this.config_; 
  var sb = new goog.string.StringBuffer(); 
  sb.append(config.cssTreeIcon, ' ', config.cssExpandTreeIcon, ' '); 
  if(this.hasChildren()) { 
    var bits = 0; 
    if(tree.getShowExpandIcons() && this.isUserCollapsible_) { 
      if(this.getExpanded()) { 
        bits = 2; 
      } else { 
        bits = 1; 
      } 
    } 
    if(! hideLines) { 
      if(this.isLastSibling()) { 
        bits += 4; 
      } else { 
        bits += 8; 
      } 
    } 
    switch(bits) { 
      case 1: 
        sb.append(config.cssExpandTreeIconPlus); 
        break; 

      case 2: 
        sb.append(config.cssExpandTreeIconMinus); 
        break; 

      case 4: 
        sb.append(config.cssExpandTreeIconL); 
        break; 

      case 5: 
        sb.append(config.cssExpandTreeIconLPlus); 
        break; 

      case 6: 
        sb.append(config.cssExpandTreeIconLMinus); 
        break; 

      case 8: 
        sb.append(config.cssExpandTreeIconT); 
        break; 

      case 9: 
        sb.append(config.cssExpandTreeIconTPlus); 
        break; 

      case 10: 
        sb.append(config.cssExpandTreeIconTMinus); 
        break; 

      default: 
        sb.append(config.cssExpandTreeIconBlank); 

    } 
  } else { 
    if(hideLines) { 
      sb.append(config.cssExpandTreeIconBlank); 
    } else if(this.isLastSibling()) { 
      sb.append(config.cssExpandTreeIconL); 
    } else { 
      sb.append(config.cssExpandTreeIconT); 
    } 
  } 
  return sb.toString(); 
}; 
goog.ui.tree.BaseNode.prototype.getLineStyle = function() { 
  return goog.string.buildString('background-position:', this.getLineStyle2(), ';'); 
}; 
goog.ui.tree.BaseNode.prototype.getLineStyle2 = function() { 
  return(this.isLastSibling() ? '-100':(this.getDepth() - 1) * this.config_.indentWidth) + 'px 0'; 
}; 
goog.ui.tree.BaseNode.prototype.getElement = function() { 
  var el = goog.ui.tree.BaseNode.superClass_.getElement.call(this); 
  if(! el) { 
    el = this.getDomHelper().getElement(this.getId()); 
    this.setElementInternal(el); 
  } 
  return el; 
}; 
goog.ui.tree.BaseNode.prototype.getRowElement = function() { 
  var el = this.getElement(); 
  return el ?(el.firstChild): null; 
}; 
goog.ui.tree.BaseNode.prototype.getExpandIconElement = function() { 
  var el = this.getRowElement(); 
  return el ?(el.firstChild): null; 
}; 
goog.ui.tree.BaseNode.prototype.getIconElement = function() { 
  var el = this.getRowElement(); 
  return el ?(el.childNodes[1]): null; 
}; 
goog.ui.tree.BaseNode.prototype.getLabelElement = function() { 
  var el = this.getRowElement(); 
  return el && el.lastChild ?(el.lastChild.previousSibling): null; 
}; 
goog.ui.tree.BaseNode.prototype.getAfterLabelElement = function() { 
  var el = this.getRowElement(); 
  return el ?(el.lastChild): null; 
}; 
goog.ui.tree.BaseNode.prototype.getChildrenElement = function() { 
  var el = this.getElement(); 
  return el ?(el.lastChild): null; 
}; 
goog.ui.tree.BaseNode.prototype.setIconClass = function(s) { 
  this.iconClass_ = s; 
  if(this.isInDocument()) { 
    this.updateIcon_(); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.getIconClass = function() { 
  return this.iconClass_; 
}; 
goog.ui.tree.BaseNode.prototype.setExpandedIconClass = function(s) { 
  this.expandedIconClass_ = s; 
  if(this.isInDocument()) { 
    this.updateIcon_(); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.getExpandedIconClass = function() { 
  return this.expandedIconClass_; 
}; 
goog.ui.tree.BaseNode.prototype.setText = function(s) { 
  this.setHtml(goog.string.htmlEscape(s)); 
}; 
goog.ui.tree.BaseNode.prototype.getText = function() { 
  return goog.string.unescapeEntities(this.getHtml()); 
}; 
goog.ui.tree.BaseNode.prototype.setHtml = function(s) { 
  this.html_ = s; 
  var el = this.getLabelElement(); 
  if(el) { 
    el.innerHTML = s; 
  } 
  var tree = this.getTree(); 
  if(tree) { 
    tree.setNode(this); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.getHtml = function() { 
  return this.html_; 
}; 
goog.ui.tree.BaseNode.prototype.setToolTip = function(s) { 
  this.toolTip_ = s; 
  var el = this.getLabelElement(); 
  if(el) { 
    el.title = s; 
  } 
}; 
goog.ui.tree.BaseNode.prototype.getToolTip = function() { 
  return this.toolTip_; 
}; 
goog.ui.tree.BaseNode.prototype.updateRow = function() { 
  var rowEl = this.getRowElement(); 
  if(rowEl) { 
    rowEl.className = this.getRowClassName(); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.updateExpandIcon = function() { 
  var img = this.getExpandIconElement(); 
  if(img) { 
    img.className = this.getExpandIconClass(); 
  } 
  var cel = this.getChildrenElement(); 
  if(cel) { 
    cel.style.backgroundPosition = this.getLineStyle2(); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.updateIcon_ = function() { 
  this.getIconElement().className = this.getCalculatedIconClass(); 
}; 
goog.ui.tree.BaseNode.prototype.onMouseDown = function(e) { 
  var el = e.target; 
  var type = el.getAttribute('type'); 
  if(type == 'expand' && this.hasChildren()) { 
    if(this.isUserCollapsible_) { 
      this.toggle(); 
    } 
    return; 
  } 
  this.select(); 
  this.updateRow(); 
}; 
goog.ui.tree.BaseNode.prototype.onClick_ = goog.events.Event.preventDefault; 
goog.ui.tree.BaseNode.prototype.onDoubleClick_ = function(e) { 
  var el = e.target; 
  var type = el.getAttribute('type'); 
  if(type == 'expand' && this.hasChildren()) { 
    return; 
  } 
  if(this.isUserCollapsible_) { 
    this.toggle(); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.onKeyDown = function(e) { 
  var handled = true; 
  switch(e.keyCode) { 
    case goog.events.KeyCodes.RIGHT: 
      if(e.altKey) { 
        break; 
      } 
      if(this.hasChildren()) { 
        if(! this.getExpanded()) { 
          this.setExpanded(true); 
        } else { 
          this.getFirstChild().select(); 
        } 
      } 
      break; 

    case goog.events.KeyCodes.LEFT: 
      if(e.altKey) { 
        break; 
      } 
      if(this.hasChildren() && this.getExpanded() && this.isUserCollapsible_) { 
        this.setExpanded(false); 
      } else { 
        var parent = this.getParent(); 
        var tree = this.getTree(); 
        if(parent &&(tree.getShowRootNode() || parent != tree)) { 
          parent.select(); 
        } 
      } 
      break; 

    case goog.events.KeyCodes.DOWN: 
      var nextNode = this.getNextShownNode(); 
      if(nextNode) { 
        nextNode.select(); 
      } 
      break; 

    case goog.events.KeyCodes.UP: 
      var previousNode = this.getPreviousShownNode(); 
      if(previousNode) { 
        previousNode.select(); 
      } 
      break; 

    default: 
      handled = false; 

  } 
  if(handled) { 
    e.preventDefault(); 
    var tree = this.getTree(); 
    if(tree) { 
      tree.clearTypeAhead(); 
    } 
  } 
  return handled; 
}; 
goog.ui.tree.BaseNode.prototype.onKeyPress_ = function(e) { 
  if(! e.altKey && e.keyCode >= goog.events.KeyCodes.LEFT && e.keyCode <= goog.events.KeyCodes.DOWN) { 
    e.preventDefault(); 
  } 
}; 
goog.ui.tree.BaseNode.prototype.getLastShownDescendant = function() { 
  if(! this.getExpanded() || ! this.hasChildren()) { 
    return this; 
  } 
  return this.getLastChild().getLastShownDescendant(); 
}; 
goog.ui.tree.BaseNode.prototype.getNextShownNode = function() { 
  if(this.hasChildren() && this.getExpanded()) { 
    return this.getFirstChild(); 
  } else { 
    var parent = this; 
    var next; 
    while(parent != this.getTree()) { 
      next = parent.getNextSibling(); 
      if(next != null) { 
        return next; 
      } 
      parent = parent.getParent(); 
    } 
    return null; 
  } 
}; 
goog.ui.tree.BaseNode.prototype.getPreviousShownNode = function() { 
  var ps = this.getPreviousSibling(); 
  if(ps != null) { 
    return ps.getLastShownDescendant(); 
  } 
  var parent = this.getParent(); 
  var tree = this.getTree(); 
  if(! tree.getShowRootNode() && parent == tree) { 
    return null; 
  } 
  return(parent); 
}; 
goog.ui.tree.BaseNode.prototype.getClientData = goog.ui.tree.BaseNode.prototype.getModel; 
goog.ui.tree.BaseNode.prototype.setClientData = goog.ui.tree.BaseNode.prototype.setModel; 
goog.ui.tree.BaseNode.prototype.getConfig = function() { 
  return this.config_; 
}; 
goog.ui.tree.BaseNode.prototype.setTreeInternal = function(tree) { 
  if(this.tree_ != tree) { 
    this.tree_ = tree; 
    tree.setNode(this); 
    this.forEachChild(function(child) { 
      child.setTreeInternal(tree); 
    }); 
  } 
}; 
