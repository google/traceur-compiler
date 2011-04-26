
goog.provide('goog.dom.NodeOffset'); 
goog.require('goog.Disposable'); 
goog.require('goog.dom.TagName'); 
goog.dom.NodeOffset = function(node, baseNode) { 
  goog.Disposable.call(this); 
  this.offsetStack_ =[]; 
  this.nameStack_ =[]; 
  while(node && node.nodeName != goog.dom.TagName.BODY && node != baseNode) { 
    var siblingOffset = 0; 
    var sib = node.previousSibling; 
    while(sib) { 
      sib = sib.previousSibling; 
      ++ siblingOffset; 
    } 
    this.offsetStack_.unshift(siblingOffset); 
    this.nameStack_.unshift(node.nodeName); 
    node = node.parentNode; 
  } 
}; 
goog.inherits(goog.dom.NodeOffset, goog.Disposable); 
goog.dom.NodeOffset.prototype.toString = function() { 
  var strs =[]; 
  var name; 
  for(var i = 0; name = this.nameStack_[i]; i ++) { 
    strs.push(this.offsetStack_[i]+ ',' + name); 
  } 
  return strs.join('\n'); 
}; 
goog.dom.NodeOffset.prototype.findTargetNode = function(baseNode) { 
  var name; 
  var curNode = baseNode; 
  for(var i = 0; name = this.nameStack_[i]; ++ i) { 
    curNode = curNode.childNodes[this.offsetStack_[i]]; 
    if(! curNode || curNode.nodeName != name) { 
      return null; 
    } 
  } 
  return curNode; 
}; 
goog.dom.NodeOffset.prototype.disposeInternal = function() { 
  delete this.offsetStack_; 
  delete this.nameStack_; 
}; 
