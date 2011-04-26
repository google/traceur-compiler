
goog.provide('goog.testing.fs.Blob'); 
goog.testing.fs.Blob = function(opt_data, opt_type) { 
  this.type = opt_type || ''; 
  this.setDataInternal(opt_data || ''); 
}; 
goog.testing.fs.Blob.prototype.data_; 
goog.testing.fs.Blob.prototype.size; 
goog.testing.fs.Blob.prototype.slice = function(start, length, opt_contentType) { 
  start = Math.max(0, start); 
  return new goog.testing.fs.Blob(this.data_.substring(start, start + Math.max(length, 0)), opt_contentType); 
}; 
goog.testing.fs.Blob.prototype.toString = function() { 
  return this.data_; 
}; 
goog.testing.fs.Blob.prototype.setDataInternal = function(data) { 
  this.data_ = data; 
  this.size = data.length; 
}; 
