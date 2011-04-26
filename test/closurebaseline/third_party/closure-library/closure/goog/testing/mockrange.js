
goog.provide('goog.testing.MockRange'); 
goog.require('goog.dom.AbstractRange'); 
goog.require('goog.testing.LooseMock'); 
goog.testing.MockRange = function() { 
  goog.testing.LooseMock.call(this, goog.testing.MockRange.ConcreteRange_); 
}; 
goog.inherits(goog.testing.MockRange, goog.testing.LooseMock); 
goog.testing.MockRange.ConcreteRange_ = function() { 
  goog.dom.AbstractRange.call(this); 
}; 
goog.inherits(goog.testing.MockRange.ConcreteRange_, goog.dom.AbstractRange); 
goog.testing.MockRange.ConcreteRange_.prototype.__iterator__ = undefined; 
