
goog.provide('goog.dom.MultiRange'); 
goog.provide('goog.dom.MultiRangeIterator'); 
goog.require('goog.array'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom.AbstractMultiRange'); 
goog.require('goog.dom.AbstractRange'); 
goog.require('goog.dom.RangeIterator'); 
goog.require('goog.dom.RangeType'); 
goog.require('goog.dom.SavedRange'); 
goog.require('goog.dom.TextRange'); 
goog.require('goog.iter.StopIteration'); 
goog.dom.MultiRange = function() { 
  this.browserRanges_ =[]; 
  this.ranges_ =[]; 
  this.sortedRanges_ = null; 
  this.container_ = null; 
}; 
goog.inherits(goog.dom.MultiRange, goog.dom.AbstractMultiRange); 
goog.dom.MultiRange.createFromBrowserSelection = function(selection) { 
  var range = new goog.dom.MultiRange(); 
  for(var i = 0, len = selection.rangeCount; i < len; i ++) { 
    range.browserRanges_.push(selection.getRangeAt(i)); 
  } 
  return range; 
}; 
goog.dom.MultiRange.createFromBrowserRanges = function(browserRanges) { 
  var range = new goog.dom.MultiRange(); 
  range.browserRanges_ = goog.array.clone(browserRanges); 
  return range; 
}; 
goog.dom.MultiRange.createFromTextRanges = function(textRanges) { 
  var range = new goog.dom.MultiRange(); 
  range.ranges_ = textRanges; 
  range.browserRanges_ = goog.array.map(textRanges, function(range) { 
    return range.getBrowserRangeObject(); 
  }); 
  return range; 
}; 
goog.dom.MultiRange.prototype.logger_ = goog.debug.Logger.getLogger('goog.dom.MultiRange'); 
goog.dom.MultiRange.prototype.clearCachedValues_ = function() { 
  this.ranges_ =[]; 
  this.sortedRanges_ = null; 
  this.container_ = null; 
}; 
goog.dom.MultiRange.prototype.clone = function() { 
  return goog.dom.MultiRange.createFromBrowserRanges(this.browserRanges_); 
}; 
goog.dom.MultiRange.prototype.getType = function() { 
  return goog.dom.RangeType.MULTI; 
}; 
goog.dom.MultiRange.prototype.getBrowserRangeObject = function() { 
  if(this.browserRanges_.length > 1) { 
    this.logger_.warning('getBrowserRangeObject called on MultiRange with more than 1 range'); 
  } 
  return this.browserRanges_[0]; 
}; 
goog.dom.MultiRange.prototype.setBrowserRangeObject = function(nativeRange) { 
  return false; 
}; 
goog.dom.MultiRange.prototype.getTextRangeCount = function() { 
  return this.browserRanges_.length; 
}; 
goog.dom.MultiRange.prototype.getTextRange = function(i) { 
  if(! this.ranges_[i]) { 
    this.ranges_[i]= goog.dom.TextRange.createFromBrowserRange(this.browserRanges_[i]); 
  } 
  return this.ranges_[i]; 
}; 
goog.dom.MultiRange.prototype.getContainer = function() { 
  if(! this.container_) { 
    var nodes =[]; 
    for(var i = 0, len = this.getTextRangeCount(); i < len; i ++) { 
      nodes.push(this.getTextRange(i).getContainer()); 
    } 
    this.container_ = goog.dom.findCommonAncestor.apply(null, nodes); 
  } 
  return this.container_; 
}; 
goog.dom.MultiRange.prototype.getSortedRanges = function() { 
  if(! this.sortedRanges_) { 
    this.sortedRanges_ = this.getTextRanges(); 
    this.sortedRanges_.sort(function(a, b) { 
      var aStartNode = a.getStartNode(); 
      var aStartOffset = a.getStartOffset(); 
      var bStartNode = b.getStartNode(); 
      var bStartOffset = b.getStartOffset(); 
      if(aStartNode == bStartNode && aStartOffset == bStartOffset) { 
        return 0; 
      } 
      return goog.dom.Range.isReversed(aStartNode, aStartOffset, bStartNode, bStartOffset) ? 1: - 1; 
    }); 
  } 
  return this.sortedRanges_; 
}; 
goog.dom.MultiRange.prototype.getStartNode = function() { 
  return this.getSortedRanges()[0].getStartNode(); 
}; 
goog.dom.MultiRange.prototype.getStartOffset = function() { 
  return this.getSortedRanges()[0].getStartOffset(); 
}; 
goog.dom.MultiRange.prototype.getEndNode = function() { 
  return goog.array.peek(this.getSortedRanges()).getEndNode(); 
}; 
goog.dom.MultiRange.prototype.getEndOffset = function() { 
  return goog.array.peek(this.getSortedRanges()).getEndOffset(); 
}; 
goog.dom.MultiRange.prototype.isRangeInDocument = function() { 
  return goog.array.every(this.getTextRanges(), function(range) { 
    return range.isRangeInDocument(); 
  }); 
}; 
goog.dom.MultiRange.prototype.isCollapsed = function() { 
  return this.browserRanges_.length == 0 || this.browserRanges_.length == 1 && this.getTextRange(0).isCollapsed(); 
}; 
goog.dom.MultiRange.prototype.getText = function() { 
  return goog.array.map(this.getTextRanges(), function(range) { 
    return range.getText(); 
  }).join(''); 
}; 
goog.dom.MultiRange.prototype.getHtmlFragment = function() { 
  return this.getValidHtml(); 
}; 
goog.dom.MultiRange.prototype.getValidHtml = function() { 
  return goog.array.map(this.getTextRanges(), function(range) { 
    return range.getValidHtml(); 
  }).join(''); 
}; 
goog.dom.MultiRange.prototype.getPastableHtml = function() { 
  return this.getValidHtml(); 
}; 
goog.dom.MultiRange.prototype.__iterator__ = function(opt_keys) { 
  return new goog.dom.MultiRangeIterator(this); 
}; 
goog.dom.MultiRange.prototype.select = function() { 
  var selection = goog.dom.AbstractRange.getBrowserSelectionForWindow(this.getWindow()); 
  selection.removeAllRanges(); 
  for(var i = 0, len = this.getTextRangeCount(); i < len; i ++) { 
    selection.addRange(this.getTextRange(i).getBrowserRangeObject()); 
  } 
}; 
goog.dom.MultiRange.prototype.removeContents = function() { 
  goog.array.forEach(this.getTextRanges(), function(range) { 
    range.removeContents(); 
  }); 
}; 
goog.dom.MultiRange.prototype.saveUsingDom = function() { 
  return new goog.dom.DomSavedMultiRange_(this); 
}; 
goog.dom.MultiRange.prototype.collapse = function(toAnchor) { 
  if(! this.isCollapsed()) { 
    var range = toAnchor ? this.getTextRange(0): this.getTextRange(this.getTextRangeCount() - 1); 
    this.clearCachedValues_(); 
    range.collapse(toAnchor); 
    this.ranges_ =[range]; 
    this.sortedRanges_ =[range]; 
    this.browserRanges_ =[range.getBrowserRangeObject()]; 
  } 
}; 
goog.dom.DomSavedMultiRange_ = function(range) { 
  this.savedRanges_ = goog.array.map(range.getTextRanges(), function(range) { 
    return range.saveUsingDom(); 
  }); 
}; 
goog.inherits(goog.dom.DomSavedMultiRange_, goog.dom.SavedRange); 
goog.dom.DomSavedMultiRange_.prototype.restoreInternal = function() { 
  var ranges = goog.array.map(this.savedRanges_, function(savedRange) { 
    return savedRange.restore(); 
  }); 
  return goog.dom.MultiRange.createFromTextRanges(ranges); 
}; 
goog.dom.DomSavedMultiRange_.prototype.disposeInternal = function() { 
  goog.dom.DomSavedMultiRange_.superClass_.disposeInternal.call(this); 
  goog.array.forEach(this.savedRanges_, function(savedRange) { 
    savedRange.dispose(); 
  }); 
  delete this.savedRanges_; 
}; 
goog.dom.MultiRangeIterator = function(range) { 
  if(range) { 
    this.iterators_ = goog.array.map(range.getSortedRanges(), function(r) { 
      return goog.iter.toIterator(r); 
    }); 
  } 
  goog.dom.RangeIterator.call(this, range ? this.getStartNode(): null, false); 
}; 
goog.inherits(goog.dom.MultiRangeIterator, goog.dom.RangeIterator); 
goog.dom.MultiRangeIterator.prototype.iterators_ = null; 
goog.dom.MultiRangeIterator.prototype.currentIdx_ = 0; 
goog.dom.MultiRangeIterator.prototype.getStartTextOffset = function() { 
  return this.iterators_[this.currentIdx_].getStartTextOffset(); 
}; 
goog.dom.MultiRangeIterator.prototype.getEndTextOffset = function() { 
  return this.iterators_[this.currentIdx_].getEndTextOffset(); 
}; 
goog.dom.MultiRangeIterator.prototype.getStartNode = function() { 
  return this.iterators_[0].getStartNode(); 
}; 
goog.dom.MultiRangeIterator.prototype.getEndNode = function() { 
  return goog.array.peek(this.iterators_).getEndNode(); 
}; 
goog.dom.MultiRangeIterator.prototype.isLast = function() { 
  return this.iterators_[this.currentIdx_].isLast(); 
}; 
goog.dom.MultiRangeIterator.prototype.next = function() { 
  try { 
    var it = this.iterators_[this.currentIdx_]; 
    var next = it.next(); 
    this.setPosition(it.node, it.tagType, it.depth); 
    return next; 
  } catch(ex) { 
    if(ex !== goog.iter.StopIteration || this.iterators_.length - 1 == this.currentIdx_) { 
      throw ex; 
    } else { 
      this.currentIdx_ ++; 
      return this.next(); 
    } 
  } 
}; 
goog.dom.MultiRangeIterator.prototype.copyFrom = function(other) { 
  this.iterators_ = goog.array.clone(other.iterators_); 
  goog.dom.MultiRangeIterator.superClass_.copyFrom.call(this, other); 
}; 
goog.dom.MultiRangeIterator.prototype.clone = function() { 
  var copy = new goog.dom.MultiRangeIterator(null); 
  copy.copyFrom(this); 
  return copy; 
}; 
