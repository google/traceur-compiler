
goog.provide('goog.ui.DrilldownRow'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.ui.Component'); 
goog.ui.DrilldownRow = function(opt_properties) { 
  goog.ui.Component.call(this); 
  var properties = opt_properties || { }; 
  this.html_ = properties.html; 
  this.expanded_ = typeof properties.expanded != 'undefined' ? properties.expanded: true; 
  this.loaded_ = typeof properties.loaded != 'undefined' ? properties.loaded: true; 
  this.decoratorFn_ = properties.decorator || goog.ui.DrilldownRow.decorate; 
  this.displayed_ = true; 
}; 
goog.inherits(goog.ui.DrilldownRow, goog.ui.Component); 
goog.ui.DrilldownRow.sampleProperties = { 
  'html': '<tr><td>Sample</td><td>Sample</tr>', 
  'loaded': true, 
  'decorator': function(selfObj, handler) { 
    goog.ui.DrilldownRow.decorate(selfObj); 
    var row = selfObj.getElement(); 
    handler.listen(row, 'mouseover', function() { 
      goog.dom.classes.add(row, goog.getCssName('goog-drilldown-hover')); 
    }); 
    handler.listen(row, 'mouseout', function() { 
      goog.dom.classes.remove(row, goog.getCssName('goog-drilldown-hover')); 
    }); 
  } 
}; 
goog.ui.DrilldownRow.prototype.enterDocument = function() { 
  goog.ui.DrilldownRow.superClass_.enterDocument.call(this); 
  this.decoratorFn_(this, this.getHandler()); 
}; 
goog.ui.DrilldownRow.prototype.createDom = function() { 
  this.setElementInternal(goog.ui.DrilldownRow.createRowNode_(this.html_, this.getDomHelper().getDocument())); 
}; 
goog.ui.DrilldownRow.prototype.canDecorate = function(node) { 
  return node.tagName == 'TR'; 
}; 
goog.ui.DrilldownRow.prototype.addChildAt = function(child, index, opt_render) { 
  goog.ui.DrilldownRow.superClass_.addChildAt.call(this, child, index, false); 
  child.setDisplayable_(this.isVisible_() && this.isExpanded()); 
  if(opt_render && ! child.isInDocument()) { 
    child.render(); 
  } 
}; 
goog.ui.DrilldownRow.prototype.removeChild = function(child) { 
  goog.dom.removeNode(child.getElement()); 
  return goog.ui.DrilldownRow.superClass_.removeChild.call(this, child); 
}; 
goog.ui.DrilldownRow.prototype.disposeInternal = function() { 
  delete this.html_; 
  this.children_ = null; 
  goog.ui.DrilldownRow.superClass_.disposeInternal.call(this); 
}; 
goog.ui.DrilldownRow.prototype.render = function() { 
  if(arguments.length) { 
    throw Error('A DrilldownRow cannot be placed under a specific parent.'); 
  } else { 
    var parent = this.getParent(); 
    if(! parent.isInDocument()) { 
      throw Error('Cannot render child of un-rendered parent'); 
    } 
    var previous = parent.previousRenderedChild_(this); 
    var row; 
    if(previous) { 
      row = previous.lastRenderedLeaf_().getElement(); 
    } else { 
      row = parent.getElement(); 
    } 
    row =(row.nextSibling); 
    if(row) { 
      this.renderBefore(row); 
    } else { 
      var tbody =(parent.getElement().parentNode); 
      goog.ui.DrilldownRow.superClass_.render.call(this, tbody); 
    } 
  } 
}; 
goog.ui.DrilldownRow.prototype.findIndex = function() { 
  var parent = this.getParent(); 
  if(! parent) { 
    throw Error('Component has no parent'); 
  } 
  return parent.indexOfChild(this); 
}; 
goog.ui.DrilldownRow.prototype.isExpanded = function() { 
  return this.expanded_; 
}; 
goog.ui.DrilldownRow.prototype.setExpanded = function(expanded) { 
  if(expanded != this.expanded_) { 
    this.expanded_ = expanded; 
    goog.dom.classes.toggle(this.getElement(), goog.getCssName('goog-drilldown-expanded')); 
    goog.dom.classes.toggle(this.getElement(), goog.getCssName('goog-drilldown-collapsed')); 
    if(this.isVisible_()) { 
      this.forEachChild(function(child) { 
        child.setDisplayable_(expanded); 
      }); 
    } 
  } 
}; 
goog.ui.DrilldownRow.prototype.getDepth = function() { 
  for(var component = this, depth = 0; component instanceof goog.ui.DrilldownRow; component = component.getParent(), depth ++) { } 
  return depth; 
}; 
goog.ui.DrilldownRow.decorate = function(selfObj) { 
  var depth = selfObj.getDepth(); 
  var row = selfObj.getElement(); 
  if(! row.cells) { 
    throw Error('No cells'); 
  } 
  var cell = row.cells[0]; 
  var html = '<div style="float: left; width: ' + depth + 'em;"><div class=toggle style="width: 1em; float: right;">' + '&nbsp;</div></div>'; 
  var fragment = selfObj.getDomHelper().htmlToDocumentFragment(html); 
  cell.insertBefore(fragment, cell.firstChild); 
  goog.dom.classes.add(row, selfObj.isExpanded() ? goog.getCssName('goog-drilldown-expanded'): goog.getCssName('goog-drilldown-collapsed')); 
  var toggler = fragment.getElementsByTagName('div')[0]; 
  var key = selfObj.getHandler().listen(toggler, 'click', function(event) { 
    selfObj.setExpanded(! selfObj.isExpanded()); 
  }); 
}; 
goog.ui.DrilldownRow.prototype.setDisplayable_ = function(display) { 
  if(display && ! this.isInDocument()) { 
    this.render(); 
  } 
  if(this.displayed_ == display) { 
    return; 
  } 
  this.displayed_ = display; 
  if(this.isInDocument()) { 
    this.getElement().style.display = display ? '': 'none'; 
  } 
  var selfObj = this; 
  this.forEachChild(function(child) { 
    child.setDisplayable_(display && selfObj.expanded_); 
  }); 
}; 
goog.ui.DrilldownRow.prototype.isVisible_ = function() { 
  for(var component = this; component instanceof goog.ui.DrilldownRow; component = component.getParent()) { 
    if(! component.displayed_) return false; 
  } 
  return true; 
}; 
goog.ui.DrilldownRow.createRowNode_ = function(html, doc) { 
  var tableHtml = '<table>' + html + '</table>'; 
  var div = doc.createElement('div'); 
  div.innerHTML = tableHtml; 
  return div.firstChild.rows[0]; 
}; 
goog.ui.DrilldownRow.prototype.lastRenderedLeaf_ = function() { 
  var leaf = null; 
  for(var node = this; node && node.isInDocument(); node = node.getChildAt(node.getChildCount() - 1)) { 
    leaf = node; 
  } 
  return(leaf); 
}; 
goog.ui.DrilldownRow.prototype.previousRenderedChild_ = function(child) { 
  for(var i = this.getChildCount() - 1; i >= 0; i --) { 
    if(this.getChildAt(i) == child) { 
      for(var j = i - 1; j >= 0; j --) { 
        var prev = this.getChildAt(j); 
        if(prev.isInDocument()) { 
          return prev; 
        } 
      } 
    } 
  } 
  return null; 
}; 
