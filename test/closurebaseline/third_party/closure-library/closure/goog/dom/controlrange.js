
goog.provide('goog.dom.ControlRange'); 
goog.provide('goog.dom.ControlRangeIterator'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.AbstractMultiRange'); 
goog.require('goog.dom.AbstractRange'); 
goog.require('goog.dom.RangeIterator'); 
goog.require('goog.dom.RangeType'); 
goog.require('goog.dom.SavedRange'); 
goog.require('goog.dom.TagWalkType'); 
goog.require('goog.dom.TextRange'); 
goog.require('goog.iter.StopIteration'); 
goog.require('goog.userAgent'); 
goog.dom.ControlRange = function() { }; 
goog.inherits(goog.dom.ControlRange, goog.dom.AbstractMultiRange); 
goog.dom.ControlRange.createFromBrowserRange = function(controlRange) { 
  var range = new goog.dom.ControlRange(); 
  range.range_ = controlRange; 
  return range; 
}; 
goog.dom.ControlRange.createFromElements = function(var_args) { 
  var range = goog.dom.getOwnerDocument(arguments[0]).body.createControlRange(); 
  for(var i = 0, len = arguments.length; i < len; i ++) { 
    range.addElement(arguments[i]); 
  } 
  return goog.dom.ControlRange.createFromBrowserRange(range); 
}; 
goog.dom.ControlRange.prototype.range_ = null; 
goog.dom.ControlRange.prototype.elements_ = null; 
goog.dom.ControlRange.prototype.sortedElements_ = null; 
goog.dom.ControlRange.prototype.clearCachedValues_ = function() { 
  this.elements_ = null; 
  this.sortedElements_ = null; 
}; 
goog.dom.ControlRange.prototype.clone = function() { 
  return goog.dom.ControlRange.createFromElements.apply(this, this.getElements()); 
}; 
goog.dom.ControlRange.prototype.getType = function() { 
  return goog.dom.RangeType.CONTROL; 
}; 
goog.dom.ControlRange.prototype.getBrowserRangeObject = function() { 
  return this.range_ || document.body.createControlRange(); 
}; 
goog.dom.ControlRange.prototype.setBrowserRangeObject = function(nativeRange) { 
  if(! goog.dom.AbstractRange.isNativeControlRange(nativeRange)) { 
    return false; 
  } 
  this.range_ = nativeRange; 
  return true; 
}; 
goog.dom.ControlRange.prototype.getTextRangeCount = function() { 
  return this.range_ ? this.range_.length: 0; 
}; 
goog.dom.ControlRange.prototype.getTextRange = function(i) { 
  return goog.dom.TextRange.createFromNodeContents(this.range_.item(i)); 
}; 
goog.dom.ControlRange.prototype.getContainer = function() { 
  return goog.dom.findCommonAncestor.apply(null, this.getElements()); 
}; 
goog.dom.ControlRange.prototype.getStartNode = function() { 
  return this.getSortedElements()[0]; 
}; 
goog.dom.ControlRange.prototype.getStartOffset = function() { 
  return 0; 
}; 
goog.dom.ControlRange.prototype.getEndNode = function() { 
  var sorted = this.getSortedElements(); 
  var startsLast =(goog.array.peek(sorted)); 
  return(goog.array.find(sorted, function(el) { 
    return goog.dom.contains(el, startsLast); 
  })); 
}; 
goog.dom.ControlRange.prototype.getEndOffset = function() { 
  return this.getEndNode().childNodes.length; 
}; 
goog.dom.ControlRange.prototype.getElements = function() { 
  if(! this.elements_) { 
    this.elements_ =[]; 
    if(this.range_) { 
      for(var i = 0; i < this.range_.length; i ++) { 
        this.elements_.push(this.range_.item(i)); 
      } 
    } 
  } 
  return this.elements_; 
}; 
goog.dom.ControlRange.prototype.getSortedElements = function() { 
  if(! this.sortedElements_) { 
    this.sortedElements_ = this.getElements().concat(); 
    this.sortedElements_.sort(function(a, b) { 
      return a.sourceIndex - b.sourceIndex; 
    }); 
  } 
  return this.sortedElements_; 
}; 
goog.dom.ControlRange.prototype.isRangeInDocument = function() { 
  var returnValue = false; 
  try { 
    returnValue = goog.array.every(this.getElements(), function(element) { 
      return goog.userAgent.IE ? element.parentNode: goog.dom.contains(element.ownerDocument.body, element); 
    }); 
  } catch(e) { } 
  return returnValue; 
}; 
goog.dom.ControlRange.prototype.isCollapsed = function() { 
  return ! this.range_ || ! this.range_.length; 
}; 
goog.dom.ControlRange.prototype.getText = function() { 
  return ''; 
}; 
goog.dom.ControlRange.prototype.getHtmlFragment = function() { 
  return goog.array.map(this.getSortedElements(), goog.dom.getOuterHtml).join(''); 
}; 
goog.dom.ControlRange.prototype.getValidHtml = function() { 
  return this.getHtmlFragment(); 
}; 
goog.dom.ControlRange.prototype.getPastableHtml = goog.dom.ControlRange.prototype.getValidHtml; 
goog.dom.ControlRange.prototype.__iterator__ = function(opt_keys) { 
  return new goog.dom.ControlRangeIterator(this); 
}; 
goog.dom.ControlRange.prototype.select = function() { 
  if(this.range_) { 
    this.range_.select(); 
  } 
}; 
goog.dom.ControlRange.prototype.removeContents = function() { 
  if(this.range_) { 
    var nodes =[]; 
    for(var i = 0, len = this.range_.length; i < len; i ++) { 
      nodes.push(this.range_.item(i)); 
    } 
    goog.array.forEach(nodes, goog.dom.removeNode); 
    this.collapse(false); 
  } 
}; 
goog.dom.ControlRange.prototype.replaceContentsWithNode = function(node) { 
  var result = this.insertNode(node, true); 
  if(! this.isCollapsed()) { 
    this.removeContents(); 
  } 
  return result; 
}; 
goog.dom.ControlRange.prototype.saveUsingDom = function() { 
  return new goog.dom.DomSavedControlRange_(this); 
}; 
goog.dom.ControlRange.prototype.collapse = function(toAnchor) { 
  this.range_ = null; 
  this.clearCachedValues_(); 
}; 
goog.dom.DomSavedControlRange_ = function(range) { 
  this.elements_ = range.getElements(); 
}; 
goog.inherits(goog.dom.DomSavedControlRange_, goog.dom.SavedRange); 
goog.dom.DomSavedControlRange_.prototype.restoreInternal = function() { 
  var doc = this.elements_.length ? goog.dom.getOwnerDocument(this.elements_[0]): document; 
  var controlRange = doc.body.createControlRange(); 
  for(var i = 0, len = this.elements_.length; i < len; i ++) { 
    controlRange.addElement(this.elements_[i]); 
  } 
  return goog.dom.ControlRange.createFromBrowserRange(controlRange); 
}; 
goog.dom.DomSavedControlRange_.prototype.disposeInternal = function() { 
  goog.dom.DomSavedControlRange_.superClass_.disposeInternal.call(this); 
  delete this.elements_; 
}; 
goog.dom.ControlRangeIterator = function(range) { 
  if(range) { 
    this.elements_ = range.getSortedElements(); 
    this.startNode_ = this.elements_.shift(); 
    this.endNode_ =(goog.array.peek(this.elements_)) || this.startNode_; 
  } 
  goog.dom.RangeIterator.call(this, this.startNode_, false); 
}; 
goog.inherits(goog.dom.ControlRangeIterator, goog.dom.RangeIterator); 
goog.dom.ControlRangeIterator.prototype.startNode_ = null; 
goog.dom.ControlRangeIterator.prototype.endNode_ = null; 
goog.dom.ControlRangeIterator.prototype.elements_ = null; 
goog.dom.ControlRangeIterator.prototype.getStartTextOffset = function() { 
  return 0; 
}; 
goog.dom.ControlRangeIterator.prototype.getEndTextOffset = function() { 
  return 0; 
}; 
goog.dom.ControlRangeIterator.prototype.getStartNode = function() { 
  return this.startNode_; 
}; 
goog.dom.ControlRangeIterator.prototype.getEndNode = function() { 
  return this.endNode_; 
}; 
goog.dom.ControlRangeIterator.prototype.isLast = function() { 
  return ! this.depth && ! this.elements_.length; 
}; 
goog.dom.ControlRangeIterator.prototype.next = function() { 
  if(this.isLast()) { 
    throw goog.iter.StopIteration; 
  } else if(! this.depth) { 
    var el = this.elements_.shift(); 
    this.setPosition(el, goog.dom.TagWalkType.START_TAG, goog.dom.TagWalkType.START_TAG); 
    return el; 
  } 
  return goog.dom.ControlRangeIterator.superClass_.next.call(this); 
}; 
goog.dom.ControlRangeIterator.prototype.copyFrom = function(other) { 
  this.elements_ = other.elements_; 
  this.startNode_ = other.startNode_; 
  this.endNode_ = other.endNode_; 
  goog.dom.ControlRangeIterator.superClass_.copyFrom.call(this, other); 
}; 
goog.dom.ControlRangeIterator.prototype.clone = function() { 
  var copy = new goog.dom.ControlRangeIterator(null); 
  copy.copyFrom(this); 
  return copy; 
}; 
