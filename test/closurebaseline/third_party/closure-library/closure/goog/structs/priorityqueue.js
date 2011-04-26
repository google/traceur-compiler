
goog.provide('goog.structs.PriorityQueue'); 
goog.require('goog.structs'); 
goog.require('goog.structs.Heap'); 
goog.structs.PriorityQueue = function() { 
  goog.structs.Heap.call(this); 
}; 
goog.inherits(goog.structs.PriorityQueue, goog.structs.Heap); 
goog.structs.PriorityQueue.prototype.enqueue = function(priority, value) { 
  this.insert(priority, value); 
}; 
goog.structs.PriorityQueue.prototype.dequeue = function() { 
  return this.remove(); 
}; 
