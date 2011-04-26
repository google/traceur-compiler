
goog.provide('goog.structs.QuadTree'); 
goog.provide('goog.structs.QuadTree.Node'); 
goog.provide('goog.structs.QuadTree.Point'); 
goog.require('goog.math.Coordinate'); 
goog.structs.QuadTree = function(minX, minY, maxX, maxY) { 
  this.root_ = new goog.structs.QuadTree.Node(minX, minY, maxX - minX, maxY - minY); 
}; 
goog.structs.QuadTree.prototype.count_ = 0; 
goog.structs.QuadTree.prototype.getRootNode = function() { 
  return this.root_; 
}; 
goog.structs.QuadTree.prototype.set = function(x, y, value) { 
  var root = this.root_; 
  if(x < root.x || y < root.y || x > root.x + root.w || y > root.y + root.h) { 
    throw Error('Out of bounds : (' + x + ', ' + y + ')'); 
  } 
  if(this.insert_(root, new goog.structs.QuadTree.Point(x, y, value))) { 
    this.count_ ++; 
  } 
}; 
goog.structs.QuadTree.prototype.get = function(x, y, opt_default) { 
  var node = this.find_(this.root_, x, y); 
  return node ? node.point.value: opt_default; 
}; 
goog.structs.QuadTree.prototype.remove = function(x, y) { 
  var node = this.find_(this.root_, x, y); 
  if(node) { 
    var value = node.point.value; 
    node.point = null; 
    node.nodeType = goog.structs.QuadTree.NodeType.EMPTY; 
    this.balance_(node); 
    this.count_ --; 
    return value; 
  } else { 
    return null; 
  } 
}; 
goog.structs.QuadTree.prototype.contains = function(x, y) { 
  return this.get(x, y) != null; 
}; 
goog.structs.QuadTree.prototype.isEmpty = function() { 
  return this.root_.nodeType == goog.structs.QuadTree.NodeType.EMPTY; 
}; 
goog.structs.QuadTree.prototype.getCount = function() { 
  return this.count_; 
}; 
goog.structs.QuadTree.prototype.clear = function() { 
  this.root_.nw = this.root_.ne = this.root_.sw = this.root_.se = null; 
  this.root_.nodeType = goog.structs.QuadTree.NodeType.EMPTY; 
  this.root_.point = null; 
  this.count_ = 0; 
}; 
goog.structs.QuadTree.prototype.getKeys = function() { 
  var arr =[]; 
  this.traverse_(this.root_, function(node) { 
    arr.push(new goog.math.Coordinate(node.point.x, node.point.y)); 
  }); 
  return arr; 
}; 
goog.structs.QuadTree.prototype.getValues = function() { 
  var arr =[]; 
  this.traverse_(this.root_, function(node) { 
    arr.push(node.point.value); 
  }); 
  return arr; 
}; 
goog.structs.QuadTree.prototype.clone = function() { 
  var x1 = this.root_.x; 
  var y1 = this.root_.y; 
  var x2 = x1 + this.root_.w; 
  var y2 = y1 + this.root_.h; 
  var clone = new goog.structs.QuadTree(x1, y1, x2, y2); 
  this.traverse_(this.root_, function(node) { 
    clone.set(node.point.x, node.point.y, node.point.value); 
  }); 
  return clone; 
}; 
goog.structs.QuadTree.prototype.forEach = function(fn, opt_obj) { 
  this.traverse_(this.root_, function(node) { 
    var coord = new goog.math.Coordinate(node.point.x, node.point.y); 
    fn.call(opt_obj, node.point.value, coord, this); 
  }); 
}; 
goog.structs.QuadTree.prototype.traverse_ = function(node, fn) { 
  switch(node.nodeType) { 
    case goog.structs.QuadTree.NodeType.LEAF: 
      fn.call(this, node); 
      break; 

    case goog.structs.QuadTree.NodeType.POINTER: 
      this.traverse_(node.ne, fn); 
      this.traverse_(node.se, fn); 
      this.traverse_(node.sw, fn); 
      this.traverse_(node.nw, fn); 
      break; 

  } 
}; 
goog.structs.QuadTree.prototype.find_ = function(node, x, y) { 
  switch(node.nodeType) { 
    case goog.structs.QuadTree.NodeType.EMPTY: 
      return null; 

    case goog.structs.QuadTree.NodeType.LEAF: 
      return node.point.x == x && node.point.y == y ? node: null; 

    case goog.structs.QuadTree.NodeType.POINTER: 
      return this.find_(this.getQuadrantForPoint_(node, x, y), x, y); 

    default: 
      throw Error('Invalid nodeType'); 

  } 
}; 
goog.structs.QuadTree.prototype.insert_ = function(parent, point) { 
  switch(parent.nodeType) { 
    case goog.structs.QuadTree.NodeType.EMPTY: 
      this.setPointForNode_(parent, point); 
      return true; 

    case goog.structs.QuadTree.NodeType.LEAF: 
      if(parent.point.x == point.x && parent.point.y == point.y) { 
        this.setPointForNode_(parent, point); 
        return false; 
      } else { 
        this.split_(parent); 
        return this.insert_(parent, point); 
      } 

    case goog.structs.QuadTree.NodeType.POINTER: 
      return this.insert_(this.getQuadrantForPoint_(parent, point.x, point.y), point); 

    default: 
      throw Error('Invalid nodeType in parent'); 

  } 
}; 
goog.structs.QuadTree.prototype.split_ = function(node) { 
  var oldPoint = node.point; 
  node.point = null; 
  node.nodeType = goog.structs.QuadTree.NodeType.POINTER; 
  var x = node.x; 
  var y = node.y; 
  var hw = node.w / 2; 
  var hh = node.h / 2; 
  node.nw = new goog.structs.QuadTree.Node(x, y, hw, hh, node); 
  node.ne = new goog.structs.QuadTree.Node(x + hw, y, hw, hh, node); 
  node.sw = new goog.structs.QuadTree.Node(x, y + hh, hw, hh, node); 
  node.se = new goog.structs.QuadTree.Node(x + hw, y + hh, hw, hh, node); 
  this.insert_(node, oldPoint); 
}; 
goog.structs.QuadTree.prototype.balance_ = function(node) { 
  switch(node.nodeType) { 
    case goog.structs.QuadTree.NodeType.EMPTY: 
    case goog.structs.QuadTree.NodeType.LEAF: 
      if(node.parent) { 
        this.balance_(node.parent); 
      } 
      break; 

    case goog.structs.QuadTree.NodeType.POINTER: 
      var nw = node.nw, ne = node.ne, sw = node.sw, se = node.se; 
      var firstLeaf = null; 
      if(nw.nodeType != goog.structs.QuadTree.NodeType.EMPTY) { 
        firstLeaf = nw; 
      } 
      if(ne.nodeType != goog.structs.QuadTree.NodeType.EMPTY) { 
        if(firstLeaf) { 
          break; 
        } 
        firstLeaf = ne; 
      } 
      if(sw.nodeType != goog.structs.QuadTree.NodeType.EMPTY) { 
        if(firstLeaf) { 
          break; 
        } 
        firstLeaf = sw; 
      } 
      if(se.nodeType != goog.structs.QuadTree.NodeType.EMPTY) { 
        if(firstLeaf) { 
          break; 
        } 
        firstLeaf = se; 
      } 
      if(! firstLeaf) { 
        node.nodeType = goog.structs.QuadTree.NodeType.EMPTY; 
        node.nw = node.ne = node.sw = node.se = null; 
      } else if(firstLeaf.nodeType == goog.structs.QuadTree.NodeType.POINTER) { 
        break; 
      } else { 
        node.nodeType = goog.structs.QuadTree.NodeType.LEAF; 
        node.nw = node.ne = node.sw = node.se = null; 
        node.point = firstLeaf.point; 
      } 
      if(node.parent) { 
        this.balance_(node.parent); 
      } 
      break; 

  } 
}; 
goog.structs.QuadTree.prototype.getQuadrantForPoint_ = function(parent, x, y) { 
  var mx = parent.x + parent.w / 2; 
  var my = parent.y + parent.h / 2; 
  if(x < mx) { 
    return y < my ? parent.nw: parent.sw; 
  } else { 
    return y < my ? parent.ne: parent.se; 
  } 
}; 
goog.structs.QuadTree.prototype.setPointForNode_ = function(node, point) { 
  if(node.nodeType == goog.structs.QuadTree.NodeType.POINTER) { 
    throw Error('Can not set point for node of type POINTER'); 
  } 
  node.nodeType = goog.structs.QuadTree.NodeType.LEAF; 
  node.point = point; 
}; 
goog.structs.QuadTree.NodeType = { 
  EMPTY: 0, 
  LEAF: 1, 
  POINTER: 2 
}; 
goog.structs.QuadTree.Node = function(x, y, w, h, opt_parent) { 
  this.x = x; 
  this.y = y; 
  this.w = w; 
  this.h = h; 
  this.parent = opt_parent || null; 
}; 
goog.structs.QuadTree.Node.prototype.nodeType = goog.structs.QuadTree.NodeType.EMPTY; 
goog.structs.QuadTree.Node.prototype.nw = null; 
goog.structs.QuadTree.Node.prototype.ne = null; 
goog.structs.QuadTree.Node.prototype.sw = null; 
goog.structs.QuadTree.Node.prototype.se = null; 
goog.structs.QuadTree.Node.prototype.point = null; 
goog.structs.QuadTree.Point = function(x, y, opt_value) { 
  this.x = x; 
  this.y = y; 
  this.value = goog.isDef(opt_value) ? opt_value: null; 
}; 
