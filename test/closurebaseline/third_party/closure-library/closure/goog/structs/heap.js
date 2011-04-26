
goog.provide('goog.structs.Heap'); 
goog.require('goog.array'); 
goog.require('goog.structs.Node'); 
goog.structs.Heap = function(opt_heap) { 
  this.nodes_ =[]; 
  if(opt_heap) { 
    this.insertAll(opt_heap); 
  } 
}; 
goog.structs.Heap.prototype.insert = function(key, value) { 
  var node = new goog.structs.Node(key, value); 
  var nodes = this.nodes_; 
  nodes.push(node); 
  this.moveUp_(nodes.length - 1); 
}; 
goog.structs.Heap.prototype.insertAll = function(heap) { 
  var keys, values; 
  if(heap instanceof goog.structs.Heap) { 
    keys = heap.getKeys(); 
    values = heap.getValues(); 
    if(heap.getCount() <= 0) { 
      var nodes = this.nodes_; 
      for(var i = 0; i < keys.length; i ++) { 
        nodes.push(new goog.structs.Node(keys[i], values[i])); 
      } 
      return; 
    } 
  } else { 
    keys = goog.object.getKeys(heap); 
    values = goog.object.getValues(heap); 
  } 
  for(var i = 0; i < keys.length; i ++) { 
    this.insert(keys[i], values[i]); 
  } 
}; 
goog.structs.Heap.prototype.remove = function() { 
  var nodes = this.nodes_; 
  var count = nodes.length; 
  var rootNode = nodes[0]; 
  if(count <= 0) { 
    return undefined; 
  } else if(count == 1) { 
    goog.array.clear(nodes); 
  } else { 
    nodes[0]= nodes.pop(); 
    this.moveDown_(0); 
  } 
  return rootNode.getValue(); 
}; 
goog.structs.Heap.prototype.peek = function() { 
  var nodes = this.nodes_; 
  if(nodes.length == 0) { 
    return undefined; 
  } 
  return nodes[0].getValue(); 
}; 
goog.structs.Heap.prototype.peekKey = function() { 
  return this.nodes_[0]&& this.nodes_[0].getKey(); 
}; 
goog.structs.Heap.prototype.moveDown_ = function(index) { 
  var nodes = this.nodes_; 
  var count = nodes.length; 
  var node = nodes[index]; 
  while(index < Math.floor(count / 2)) { 
    var leftChildIndex = this.getLeftChildIndex_(index); 
    var rightChildIndex = this.getRightChildIndex_(index); 
    var smallerChildIndex = rightChildIndex < count && nodes[rightChildIndex].getKey() < nodes[leftChildIndex].getKey() ? rightChildIndex: leftChildIndex; 
    if(nodes[smallerChildIndex].getKey() > node.getKey()) { 
      break; 
    } 
    nodes[index]= nodes[smallerChildIndex]; 
    index = smallerChildIndex; 
  } 
  nodes[index]= node; 
}; 
goog.structs.Heap.prototype.moveUp_ = function(index) { 
  var nodes = this.nodes_; 
  var node = nodes[index]; 
  while(index > 0) { 
    var parentIndex = this.getParentIndex_(index); 
    if(nodes[parentIndex].getKey() > node.getKey()) { 
      nodes[index]= nodes[parentIndex]; 
      index = parentIndex; 
    } else { 
      break; 
    } 
  } 
  nodes[index]= node; 
}; 
goog.structs.Heap.prototype.getLeftChildIndex_ = function(index) { 
  return index * 2 + 1; 
}; 
goog.structs.Heap.prototype.getRightChildIndex_ = function(index) { 
  return index * 2 + 2; 
}; 
goog.structs.Heap.prototype.getParentIndex_ = function(index) { 
  return Math.floor((index - 1) / 2); 
}; 
goog.structs.Heap.prototype.getValues = function() { 
  var nodes = this.nodes_; 
  var rv =[]; 
  var l = nodes.length; 
  for(var i = 0; i < l; i ++) { 
    rv.push(nodes[i].getValue()); 
  } 
  return rv; 
}; 
goog.structs.Heap.prototype.getKeys = function() { 
  var nodes = this.nodes_; 
  var rv =[]; 
  var l = nodes.length; 
  for(var i = 0; i < l; i ++) { 
    rv.push(nodes[i].getKey()); 
  } 
  return rv; 
}; 
goog.structs.Heap.prototype.containsValue = function(val) { 
  return goog.array.some(this.nodes_, function(node) { 
    return node.getValue() == val; 
  }); 
}; 
goog.structs.Heap.prototype.containsKey = function(key) { 
  return goog.array.some(this.nodes_, function(node) { 
    return node.getKey() == key; 
  }); 
}; 
goog.structs.Heap.prototype.clone = function() { 
  return new goog.structs.Heap(this); 
}; 
goog.structs.Heap.prototype.getCount = function() { 
  return this.nodes_.length; 
}; 
goog.structs.Heap.prototype.isEmpty = function() { 
  return goog.array.isEmpty(this.nodes_); 
}; 
goog.structs.Heap.prototype.clear = function() { 
  goog.array.clear(this.nodes_); 
}; 
