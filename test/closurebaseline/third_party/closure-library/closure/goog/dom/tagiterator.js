
goog.provide('goog.dom.TagIterator'); 
goog.provide('goog.dom.TagWalkType'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.iter.Iterator'); 
goog.require('goog.iter.StopIteration'); 
goog.dom.TagWalkType = { 
  START_TAG: 1, 
  OTHER: 0, 
  END_TAG: - 1 
}; 
goog.dom.TagIterator = function(opt_node, opt_reversed, opt_unconstrained, opt_tagType, opt_depth) { 
  this.reversed = ! ! opt_reversed; 
  if(opt_node) { 
    this.setPosition(opt_node, opt_tagType); 
  } 
  this.depth = opt_depth != undefined ? opt_depth: this.tagType || 0; 
  if(this.reversed) { 
    this.depth *= - 1; 
  } 
  this.constrained = ! opt_unconstrained; 
}; 
goog.inherits(goog.dom.TagIterator, goog.iter.Iterator); 
goog.dom.TagIterator.prototype.node = null; 
goog.dom.TagIterator.prototype.tagType = goog.dom.TagWalkType.OTHER; 
goog.dom.TagIterator.prototype.depth; 
goog.dom.TagIterator.prototype.reversed; 
goog.dom.TagIterator.prototype.constrained; 
goog.dom.TagIterator.prototype.started_ = false; 
goog.dom.TagIterator.prototype.setPosition = function(node, opt_tagType, opt_depth) { 
  this.node = node; 
  if(node) { 
    if(goog.isNumber(opt_tagType)) { 
      this.tagType = opt_tagType; 
    } else { 
      this.tagType = this.node.nodeType != goog.dom.NodeType.ELEMENT ? goog.dom.TagWalkType.OTHER: this.reversed ? goog.dom.TagWalkType.END_TAG: goog.dom.TagWalkType.START_TAG; 
    } 
  } 
  if(goog.isNumber(opt_depth)) { 
    this.depth = opt_depth; 
  } 
}; 
goog.dom.TagIterator.prototype.copyFrom = function(other) { 
  this.node = other.node; 
  this.tagType = other.tagType; 
  this.depth = other.depth; 
  this.reversed = other.reversed; 
  this.constrained = other.constrained; 
}; 
goog.dom.TagIterator.prototype.clone = function() { 
  return new goog.dom.TagIterator(this.node, this.reversed, ! this.constrained, this.tagType, this.depth); 
}; 
goog.dom.TagIterator.prototype.skipTag = function() { 
  var check = this.reversed ? goog.dom.TagWalkType.END_TAG: goog.dom.TagWalkType.START_TAG; 
  if(this.tagType == check) { 
    this.tagType =(check * - 1); 
    this.depth += this.tagType *(this.reversed ? - 1: 1); 
  } 
}; 
goog.dom.TagIterator.prototype.restartTag = function() { 
  var check = this.reversed ? goog.dom.TagWalkType.START_TAG: goog.dom.TagWalkType.END_TAG; 
  if(this.tagType == check) { 
    this.tagType =(check * - 1); 
    this.depth += this.tagType *(this.reversed ? - 1: 1); 
  } 
}; 
goog.dom.TagIterator.prototype.next = function() { 
  var node; 
  if(this.started_) { 
    if(! this.node || this.constrained && this.depth == 0) { 
      throw goog.iter.StopIteration; 
    } 
    node = this.node; 
    var startType = this.reversed ? goog.dom.TagWalkType.END_TAG: goog.dom.TagWalkType.START_TAG; 
    if(this.tagType == startType) { 
      var child = this.reversed ? node.lastChild: node.firstChild; 
      if(child) { 
        this.setPosition(child); 
      } else { 
        this.setPosition(node,(startType * - 1)); 
      } 
    } else { 
      var sibling = this.reversed ? node.previousSibling: node.nextSibling; 
      if(sibling) { 
        this.setPosition(sibling); 
      } else { 
        this.setPosition(node.parentNode,(startType * - 1)); 
      } 
    } 
    this.depth += this.tagType *(this.reversed ? - 1: 1); 
  } else { 
    this.started_ = true; 
  } 
  node = this.node; 
  if(! this.node) { 
    throw goog.iter.StopIteration; 
  } 
  return node; 
}; 
goog.dom.TagIterator.prototype.isStarted = function() { 
  return this.started_; 
}; 
goog.dom.TagIterator.prototype.isStartTag = function() { 
  return this.tagType == goog.dom.TagWalkType.START_TAG; 
}; 
goog.dom.TagIterator.prototype.isEndTag = function() { 
  return this.tagType == goog.dom.TagWalkType.END_TAG; 
}; 
goog.dom.TagIterator.prototype.isNonElement = function() { 
  return this.tagType == goog.dom.TagWalkType.OTHER; 
}; 
goog.dom.TagIterator.prototype.equals = function(other) { 
  return other.node == this.node &&(! this.node || other.tagType == this.tagType); 
}; 
goog.dom.TagIterator.prototype.splice = function(var_args) { 
  var node = this.node; 
  this.restartTag(); 
  this.reversed = ! this.reversed; 
  goog.dom.TagIterator.prototype.next.call(this); 
  this.reversed = ! this.reversed; 
  var arr = goog.isArrayLike(arguments[0]) ? arguments[0]: arguments; 
  for(var i = arr.length - 1; i >= 0; i --) { 
    goog.dom.insertSiblingAfter(arr[i], node); 
  } 
  goog.dom.removeNode(node); 
}; 
