
goog.provide('goog.testing.TestQueue'); 
goog.testing.TestQueue = function() { 
  this.events_ =[]; 
}; 
goog.testing.TestQueue.prototype.enqueue = function(event) { 
  this.events_.push(event); 
}; 
goog.testing.TestQueue.prototype.isEmpty = function() { 
  return this.events_.length == 0; 
}; 
goog.testing.TestQueue.prototype.dequeue = function(opt_comment) { 
  if(this.isEmpty()) { 
    throw Error('Handler is empty: ' + opt_comment); 
  } 
  return this.events_.shift(); 
}; 
