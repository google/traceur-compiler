
goog.provide('goog.structs.TreeNode'); 
goog.require('goog.array'); 
goog.require('goog.asserts'); 
goog.require('goog.structs.Node'); 
goog.structs.TreeNode = function(key, value) { 
  goog.structs.Node.call(this, key, value); 
}; 
goog.inherits(goog.structs.TreeNode, goog.structs.Node); 
goog.structs.TreeNode.EMPTY_ARRAY_ =[]; 
goog.structs.TreeNode.prototype.parent_ = null; 
goog.structs.TreeNode.prototype.children_ = null; 
goog.structs.TreeNode.prototype.clone = function() { 
  return new goog.structs.TreeNode(this.getKey(), this.getValue()); 
}; 
goog.structs.TreeNode.prototype.deepClone = function() { 
  var clone = this.clone(); 
  this.forEachChild(function(child) { 
    clone.addChild(child.deepClone()); 
  }); 
  return clone; 
}; 
goog.structs.TreeNode.prototype.getParent = function() { 
  return this.parent_; 
}; 
goog.structs.TreeNode.prototype.isLeaf = function() { 
  return ! this.getChildCount(); 
}; 
goog.structs.TreeNode.prototype.isLastChild = function() { 
  var parent = this.getParent(); 
  return Boolean(parent && this == goog.array.peek(parent.getChildren())); 
}; 
goog.structs.TreeNode.prototype.getChildren = function() { 
  return this.children_ || goog.structs.TreeNode.EMPTY_ARRAY_; 
}; 
goog.structs.TreeNode.prototype.getChildAt = function(index) { 
  return this.getChildren()[index]|| null; 
}; 
goog.structs.TreeNode.prototype.getChildCount = function() { 
  return this.getChildren().length; 
}; 
goog.structs.TreeNode.prototype.getDepth = function() { 
  var depth = 0; 
  var node = this; 
  while(node.getParent()) { 
    depth ++; 
    node = node.getParent(); 
  } 
  return depth; 
}; 
goog.structs.TreeNode.prototype.getAncestors = function() { 
  var ancestors =[]; 
  var node = this.getParent(); 
  while(node) { 
    ancestors.push(node); 
    node = node.getParent(); 
  } 
  return ancestors; 
}; 
goog.structs.TreeNode.prototype.getRoot = function() { 
  var root = this; 
  while(root.getParent()) { 
    root = root.getParent(); 
  } 
  return root; 
}; 
goog.structs.TreeNode.prototype.contains = function(node) { 
  do { 
    node = node.getParent(); 
  } while(node && node != this); 
  return Boolean(node); 
}; 
goog.structs.TreeNode.findCommonAncestor = function(var_args) { 
  var ret = arguments[0]; 
  if(! ret) { 
    return null; 
  } 
  var retDepth = ret.getDepth(); 
  for(var i = 1; i < arguments.length; i ++) { 
    var node = arguments[i]; 
    var depth = node.getDepth(); 
    while(node != ret) { 
      if(depth <= retDepth) { 
        ret = ret.getParent(); 
        retDepth --; 
      } 
      if(depth > retDepth) { 
        node = node.getParent(); 
        depth --; 
      } 
    } 
  } 
  return ret; 
}; 
goog.structs.TreeNode.prototype.forEachChild = function(f, opt_this) { 
  goog.array.forEach(this.getChildren(), f, opt_this); 
}; 
goog.structs.TreeNode.prototype.forEachDescendant = function(f, opt_this) { 
  goog.array.forEach(this.getChildren(), function(child) { 
    f.call(opt_this, child); 
    child.forEachDescendant(f, opt_this); 
  }); 
}; 
goog.structs.TreeNode.prototype.setParent = function(parent) { 
  this.parent_ = parent; 
}; 
goog.structs.TreeNode.prototype.addChild = function(child) { 
  this.addChildAt(child, this.children_ ? this.children_.length: 0); 
}; 
goog.structs.TreeNode.prototype.addChildAt = function(child, index) { 
  goog.asserts.assert(! child.getParent()); 
  child.setParent(this); 
  this.children_ = this.children_ ||[]; 
  goog.asserts.assert(index >= 0 && index <= this.children_.length); 
  goog.array.insertAt(this.children_, child, index); 
}; 
goog.structs.TreeNode.prototype.removeChildAt = function(index) { 
  var child = this.children_ && this.children_[index]; 
  if(child) { 
    child.setParent(null); 
    goog.array.removeAt(this.children_, index); 
    if(this.children_.length == 0) { 
      delete this.children_; 
    } 
    return child; 
  } 
  return null; 
}; 
goog.structs.TreeNode.prototype.removeChild = function(child) { 
  return this.removeChildAt(goog.array.indexOf(this.getChildren(), child)); 
}; 
goog.structs.TreeNode.prototype.removeChildren = function() { 
  if(this.children_) { 
    goog.array.forEach(this.children_, function(child) { 
      child.setParent(null); 
    }); 
  } 
  delete this.children_; 
}; 
