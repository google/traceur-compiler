
goog.provide('goog.net.XhrLite'); 
goog.require('goog.net.XhrIo'); 
goog.net.XhrLite = goog.net.XhrIo; 
goog.net.XhrLite.send = goog.net.XhrIo.send; 
goog.net.XhrLite.cleanup = goog.net.XhrIo.cleanup; 
goog.net.XhrLite.protectEntryPoints = goog.net.XhrIo.protectEntryPoints; 
goog.net.XhrLite.cleanupSend_ = goog.net.XhrIo.cleanupSend_; 
goog.net.XhrLite.CONTENT_TYPE_HEADER = goog.net.XhrIo.CONTENT_TYPE_HEADER; 
goog.net.XhrLite.FORM_CONTENT_TYPE = goog.net.XhrIo.FORM_CONTENT_TYPE; 
goog.net.XhrLite.sendInstances_ = goog.net.XhrIo.sendInstances_; 
