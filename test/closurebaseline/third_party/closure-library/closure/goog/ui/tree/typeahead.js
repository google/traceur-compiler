
goog.provide('goog.ui.tree.TypeAhead'); 
goog.provide('goog.ui.tree.TypeAhead.Offset'); 
goog.require('goog.array'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.string'); 
goog.require('goog.structs.Trie'); 
goog.ui.tree.TypeAhead = function() { 
  this.nodeMap_ = new goog.structs.Trie(); 
}; 
goog.ui.tree.TypeAhead.prototype.nodeMap_; 
goog.ui.tree.TypeAhead.prototype.buffer_ = ''; 
goog.ui.tree.TypeAhead.prototype.matchingLabels_ = null; 
goog.ui.tree.TypeAhead.prototype.matchingNodes_ = null; 
goog.ui.tree.TypeAhead.prototype.matchingLabelIndex_ = 0; 
goog.ui.tree.TypeAhead.prototype.matchingNodeIndex_ = 0; 
goog.ui.tree.TypeAhead.Offset = { 
  DOWN: 1, 
  UP: - 1 
}; 
goog.ui.tree.TypeAhead.prototype.handleNavigation = function(e) { 
  var handled = false; 
  switch(e.keyCode) { 
    case goog.events.KeyCodes.DOWN: 
    case goog.events.KeyCodes.UP: 
      if(e.ctrlKey) { 
        this.jumpTo_(e.keyCode == goog.events.KeyCodes.DOWN ? goog.ui.tree.TypeAhead.Offset.DOWN: goog.ui.tree.TypeAhead.Offset.UP); 
        handled = true; 
      } 
      break; 

    case goog.events.KeyCodes.BACKSPACE: 
      var length = this.buffer_.length - 1; 
      handled = true; 
      if(length > 0) { 
        this.buffer_ = this.buffer_.substring(0, length); 
        this.jumpToLabel_(this.buffer_); 
      } else if(length == 0) { 
        this.buffer_ = ''; 
      } else { 
        handled = false; 
      } 
      break; 

    case goog.events.KeyCodes.ESC: 
      this.buffer_ = ''; 
      handled = true; 
      break; 

  } 
  return handled; 
}; 
goog.ui.tree.TypeAhead.prototype.handleTypeAheadChar = function(e) { 
  var handled = false; 
  if(! e.ctrlKey && ! e.altKey) { 
    var ch = String.fromCharCode(e.charCode || e.keyCode).toLowerCase(); 
    if(goog.string.isUnicodeChar(ch) &&(ch != ' ' || this.buffer_)) { 
      this.buffer_ += ch; 
      handled = this.jumpToLabel_(this.buffer_); 
    } 
  } 
  return handled; 
}; 
goog.ui.tree.TypeAhead.prototype.setNodeInMap = function(node) { 
  var labelText = node.getText(); 
  if(labelText && ! goog.string.isEmptySafe(labelText)) { 
    labelText = labelText.toLowerCase(); 
    var previousValue = this.nodeMap_.get(labelText); 
    if(previousValue) { 
      previousValue.push(node); 
    } else { 
      var nodeList =[node]; 
      this.nodeMap_.set(labelText, nodeList); 
    } 
  } 
}; 
goog.ui.tree.TypeAhead.prototype.removeNodeFromMap = function(node) { 
  var labelText = node.getText(); 
  if(labelText && ! goog.string.isEmptySafe(labelText)) { 
    labelText = labelText.toLowerCase(); 
    var nodeList =(this.nodeMap_.get(labelText)); 
    if(nodeList) { 
      goog.array.remove(nodeList, node); 
      if(! ! nodeList.length) { 
        this.nodeMap_.remove(labelText); 
      } 
    } 
  } 
}; 
goog.ui.tree.TypeAhead.prototype.jumpToLabel_ = function(typeAhead) { 
  var handled = false; 
  var labels = this.nodeMap_.getKeys(typeAhead); 
  if(labels && labels.length) { 
    this.matchingNodeIndex_ = 0; 
    this.matchingLabelIndex_ = 0; 
    var nodes =(this.nodeMap_.get(labels[0])); 
    if((handled = this.selectMatchingNode_(nodes))) { 
      this.matchingLabels_ = labels; 
    } 
  } 
  return handled; 
}; 
goog.ui.tree.TypeAhead.prototype.jumpTo_ = function(offset) { 
  var handled = false; 
  var labels = this.matchingLabels_; 
  if(labels) { 
    var nodes = null; 
    var nodeIndexOutOfRange = false; 
    if(this.matchingNodes_) { 
      var newNodeIndex = this.matchingNodeIndex_ + offset; 
      if(newNodeIndex >= 0 && newNodeIndex < this.matchingNodes_.length) { 
        this.matchingNodeIndex_ = newNodeIndex; 
        nodes = this.matchingNodes_; 
      } else { 
        nodeIndexOutOfRange = true; 
      } 
    } 
    if(! nodes) { 
      var newLabelIndex = this.matchingLabelIndex_ + offset; 
      if(newLabelIndex >= 0 && newLabelIndex < labels.length) { 
        this.matchingLabelIndex_ = newLabelIndex; 
      } 
      if(labels.length > this.matchingLabelIndex_) { 
        nodes =(this.nodeMap_.get(labels[this.matchingLabelIndex_])); 
      } 
      if(nodes && nodes.length && nodeIndexOutOfRange) { 
        this.matchingNodeIndex_ =(offset == goog.ui.tree.TypeAhead.Offset.UP) ? nodes.length - 1: 0; 
      } 
    } 
    if((handled = this.selectMatchingNode_(nodes))) { 
      this.matchingLabels_ = labels; 
    } 
  } 
  return handled; 
}; 
goog.ui.tree.TypeAhead.prototype.selectMatchingNode_ = function(nodes) { 
  var node; 
  if(nodes) { 
    if(this.matchingNodeIndex_ < nodes.length) { 
      node = nodes[this.matchingNodeIndex_]; 
      this.matchingNodes_ = nodes; 
    } 
    if(node) { 
      node.reveal(); 
      node.select(); 
    } 
  } 
  return ! ! node; 
}; 
goog.ui.tree.TypeAhead.prototype.clear = function() { 
  this.buffer_ = ''; 
}; 
