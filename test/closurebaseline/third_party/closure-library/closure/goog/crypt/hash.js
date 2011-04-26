
goog.provide('goog.crypt.Hash'); 
goog.crypt.Hash = function() { }; 
goog.crypt.Hash.prototype.reset = goog.abstractMethod; 
goog.crypt.Hash.prototype.update = goog.abstractMethod; 
goog.crypt.Hash.prototype.digest = goog.abstractMethod; 
