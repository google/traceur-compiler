
goog.provide('goog.testing.fs.File'); 
goog.require('goog.testing.fs.Blob'); 
goog.testing.fs.File = function(name, opt_lastModified, opt_data, opt_type) { 
  goog.base(this, opt_data, opt_type); 
  this.name = name; 
  this.lastModifiedDate = opt_lastModified || null; 
}; 
goog.inherits(goog.testing.fs.File, goog.testing.fs.Blob); 
