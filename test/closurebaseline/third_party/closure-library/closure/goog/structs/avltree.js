
goog.provide('goog.structs.AvlTree'); 
goog.provide('goog.structs.AvlTree.Node'); 
goog.require('goog.structs'); 
goog.structs.AvlTree = function(opt_comparator) { 
  this.comparator_ = opt_comparator || goog.structs.AvlTree.DEFAULT_COMPARATOR_; 
}; 
goog.structs.AvlTree.DEFAULT_COMPARATOR_ = function(a, b) { 
  if(String(a) < String(b)) { 
    return - 1; 
  } else if(String(a) > String(b)) { 
    return 1; 
  } 
  return 0; 
}; 
goog.structs.AvlTree.prototype.root_ = null; 
goog.structs.AvlTree.prototype.comparator_ = null; 
goog.structs.AvlTree.prototype.minNode_ = null; 
goog.structs.AvlTree.prototype.maxNode_ = null; 
goog.structs.AvlTree.prototype.count_ = 0; 
goog.structs.AvlTree.prototype.add = function(value) { 
  if(this.root_ == null) { 
    this.root_ = new goog.structs.AvlTree.Node(value); 
    this.minNode_ = this.root_; 
    this.maxNode_ = this.root_; 
    this.count_ = 1; 
    return true; 
  } 
  var retStatus = false; 
  this.traverse_(function(node) { 
    var retNode = null; 
    if(this.comparator_(node.value, value) > 0) { 
      retNode = node.left; 
      if(node.left == null) { 
        var newNode = new goog.structs.AvlTree.Node(value, node); 
        node.left = newNode; 
        if(node == this.minNode_) { 
          this.minNode_ = newNode; 
        } 
        retStatus = true; 
        this.balance_(node); 
      } 
    } else if(this.comparator_(node.value, value) < 0) { 
      retNode = node.right; 
      if(node.right == null) { 
        var newNode = new goog.structs.AvlTree.Node(value, node); 
        node.right = newNode; 
        if(node == this.maxNode_) { 
          this.maxNode_ = newNode; 
        } 
        retStatus = true; 
        this.balance_(node); 
      } 
    } 
    return retNode; 
  }); 
  if(retStatus) { 
    this.count_ += 1; 
  } 
  return retStatus; 
}; 
goog.structs.AvlTree.prototype.remove = function(value) { 
  var retValue = null; 
  this.traverse_(function(node) { 
    var retNode = null; 
    if(this.comparator_(node.value, value) > 0) { 
      retNode = node.left; 
    } else if(this.comparator_(node.value, value) < 0) { 
      retNode = node.right; 
    } else { 
      retValue = node.value; 
      this.removeNode_(node); 
    } 
    return retNode; 
  }); 
  if(retValue) { 
    this.count_ -= 1; 
  } 
  return retValue; 
}; 
goog.structs.AvlTree.prototype.clear = function() { 
  this.root_ = null; 
  this.minNode_ = null; 
  this.maxNode_ = null; 
  this.count_ = 0; 
}; 
goog.structs.AvlTree.prototype.contains = function(value) { 
  var isContained = false; 
  this.traverse_(function(node) { 
    var retNode = null; 
    if(this.comparator_(node.value, value) > 0) { 
      retNode = node.left; 
    } else if(this.comparator_(node.value, value) < 0) { 
      retNode = node.right; 
    } else { 
      isContained = true; 
    } 
    return retNode; 
  }); 
  return isContained; 
}; 
goog.structs.AvlTree.prototype.getCount = function() { 
  return this.count_; 
}; 
goog.structs.AvlTree.prototype.getMinimum = function() { 
  return this.getMinNode_().value; 
}; 
goog.structs.AvlTree.prototype.getMaximum = function() { 
  return this.getMaxNode_().value; 
}; 
goog.structs.AvlTree.prototype.getHeight = function() { 
  return this.root_ ? this.root_.height: 0; 
}; 
goog.structs.AvlTree.prototype.getValues = function() { 
  var ret =[]; 
  this.inOrderTraverse(function(value) { 
    ret.push(value); 
  }); 
  return ret; 
}; 
goog.structs.AvlTree.prototype.inOrderTraverse = function(func, opt_startValue) { 
  if(! this.root_) { 
    return; 
  } 
  var startNode; 
  if(opt_startValue) { 
    this.traverse_(function(node) { 
      var retNode = null; 
      if(this.comparator_(node.value, opt_startValue) > 0) { 
        retNode = node.left; 
        startNode = node; 
      } else if(this.comparator_(node.value, opt_startValue) < 0) { 
        retNode = node.right; 
      } else { 
        startNode = node; 
      } 
      return retNode; 
    }); 
  } else { 
    startNode = this.getMinNode_(); 
  } 
  var node = startNode, prev = startNode.left ? startNode.left: startNode; 
  while(node != null) { 
    if(node.left != null && node.left != prev && node.right != prev) { 
      node = node.left; 
    } else { 
      if(node.right != prev) { 
        if(func(node.value)) { 
          return; 
        } 
      } 
      var temp = node; 
      node = node.right != null && node.right != prev ? node.right: node.parent; 
      prev = temp; 
    } 
  } 
}; 
goog.structs.AvlTree.prototype.reverseOrderTraverse = function(func, opt_startValue) { 
  if(! this.root_) { 
    return; 
  } 
  var startNode; 
  if(opt_startValue) { 
    this.traverse_(goog.bind(function(node) { 
      var retNode = null; 
      if(this.comparator_(node.value, opt_startValue) > 0) { 
        retNode = node.left; 
      } else if(this.comparator_(node.value, opt_startValue) < 0) { 
        retNode = node.right; 
        startNode = node; 
      } else { 
        startNode = node; 
      } 
      return retNode; 
    }, this)); 
  } else { 
    startNode = this.getMaxNode_(); 
  } 
  var node = startNode, prev = startNode.right ? startNode.right: startNode; 
  while(node != null) { 
    if(node.right != null && node.right != prev && node.left != prev) { 
      node = node.right; 
    } else { 
      if(node.left != prev) { 
        if(func(node.value)) { 
          return; 
        } 
      } 
      var temp = node; 
      node = node.left != null && node.left != prev ? node.left: node.parent; 
      prev = temp; 
    } 
  } 
}; 
goog.structs.AvlTree.prototype.traverse_ = function(traversalFunc, opt_startNode, opt_endNode) { 
  var node = opt_startNode ? opt_startNode: this.root_; 
  var endNode = opt_endNode ? opt_endNode: null; 
  while(node && node != endNode) { 
    node = traversalFunc.call(this, node); 
  } 
}; 
goog.structs.AvlTree.prototype.balance_ = function(node) { 
  this.traverse_(function(node) { 
    var lh = node.left ? node.left.height: 0; 
    var rh = node.right ? node.right.height: 0; 
    if(lh - rh > 1) { 
      if(node.left.right &&(! node.left.left || node.left.left.height < node.left.right.height)) { 
        this.leftRotate_(node.left); 
      } 
      this.rightRotate_(node); 
    } else if(rh - lh > 1) { 
      if(node.right.left &&(! node.right.right || node.right.right.height < node.right.left.height)) { 
        this.rightRotate_(node.right); 
      } 
      this.leftRotate_(node); 
    } 
    lh = node.left ? node.left.height: 0; 
    rh = node.right ? node.right.height: 0; 
    node.height = Math.max(lh, rh) + 1; 
    return node.parent; 
  }, node); 
}; 
goog.structs.AvlTree.prototype.leftRotate_ = function(node) { 
  if(node.isLeftChild()) { 
    node.parent.left = node.right; 
    node.right.parent = node.parent; 
  } else if(node.isRightChild()) { 
    node.parent.right = node.right; 
    node.right.parent = node.parent; 
  } else { 
    this.root_ = node.right; 
    this.root_.parent = null; 
  } 
  var temp = node.right; 
  node.right = node.right.left; 
  if(node.right != null) node.right.parent = node; 
  temp.left = node; 
  node.parent = temp; 
}; 
goog.structs.AvlTree.prototype.rightRotate_ = function(node) { 
  if(node.isLeftChild()) { 
    node.parent.left = node.left; 
    node.left.parent = node.parent; 
  } else if(node.isRightChild()) { 
    node.parent.right = node.left; 
    node.left.parent = node.parent; 
  } else { 
    this.root_ = node.left; 
    this.root_.parent = null; 
  } 
  var temp = node.left; 
  node.left = node.left.right; 
  if(node.left != null) node.left.parent = node; 
  temp.right = node; 
  node.parent = temp; 
}; 
goog.structs.AvlTree.prototype.removeNode_ = function(node) { 
  if(node.left != null || node.right != null) { 
    var b = null; 
    var r; 
    if(node.left != null) { 
      r = this.getMaxNode_(node.left); 
      if(r != node.left) { 
        r.parent.right = r.left; 
        if(r.left) r.left.parent = r.parent; 
        r.left = node.left; 
        r.left.parent = r; 
        b = r.parent; 
      } 
      r.parent = node.parent; 
      r.right = node.right; 
      if(r.right) r.right.parent = r; 
      if(node == this.maxNode_) this.maxNode_ = r; 
    } else { 
      r = this.getMinNode_(node.right); 
      if(r != node.right) { 
        r.parent.left = r.right; 
        if(r.right) r.right.parent = r.parent; 
        r.right = node.right; 
        r.right.parent = r; 
        b = r.parent; 
      } 
      r.parent = node.parent; 
      r.left = node.left; 
      if(r.left) r.left.parent = r; 
      if(node == this.minNode_) this.minNode_ = r; 
    } 
    if(node.isLeftChild()) { 
      node.parent.left = r; 
    } else if(node.isRightChild()) { 
      node.parent.right = r; 
    } else { 
      this.root_ = r; 
    } 
    this.balance_(b ? b: r); 
  } else { 
    if(node.isLeftChild()) { 
      this.special = 1; 
      node.parent.left = null; 
      if(node == this.minNode_) this.minNode_ = node.parent; 
      this.balance_(node.parent); 
    } else if(node.isRightChild()) { 
      node.parent.right = null; 
      if(node == this.maxNode_) this.maxNode_ = node.parent; 
      this.balance_(node.parent); 
    } else { 
      this.clear(); 
    } 
  } 
}; 
goog.structs.AvlTree.prototype.getMinNode_ = function(opt_rootNode) { 
  if(! opt_rootNode) { 
    return this.minNode_; 
  } 
  var minNode = opt_rootNode; 
  this.traverse_(function(node) { 
    var retNode = null; 
    if(node.left) { 
      minNode = node.left; 
      retNode = node.left; 
    } 
    return retNode; 
  }, opt_rootNode); 
  return minNode; 
}; 
goog.structs.AvlTree.prototype.getMaxNode_ = function(opt_rootNode) { 
  if(! opt_rootNode) { 
    return this.maxNode_; 
  } 
  var maxNode = opt_rootNode; 
  this.traverse_(function(node) { 
    var retNode = null; 
    if(node.right) { 
      maxNode = node.right; 
      retNode = node.right; 
    } 
    return retNode; 
  }, opt_rootNode); 
  return maxNode; 
}; 
goog.structs.AvlTree.Node = function(value, opt_parent) { 
  this.value = value; 
  this.parent = opt_parent ? opt_parent: null; 
}; 
goog.structs.AvlTree.Node.prototype.left = null; 
goog.structs.AvlTree.Node.prototype.right = null; 
goog.structs.AvlTree.Node.prototype.height = 1; 
goog.structs.AvlTree.Node.prototype.isRightChild = function() { 
  return ! ! this.parent && this.parent.right == this; 
}; 
goog.structs.AvlTree.Node.prototype.isLeftChild = function() { 
  return ! ! this.parent && this.parent.left == this; 
}; 
