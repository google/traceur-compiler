
goog.provide('goog.gears.MultipartFormData'); 
goog.require('goog.asserts'); 
goog.require('goog.gears'); 
goog.require('goog.string'); 
goog.gears.MultipartFormData = function() { 
  this.blobBuilder_ = goog.gears.getFactory().create('beta.blobbuilder'); 
  this.boundary_ = '----' + goog.string.getRandomString(); 
}; 
goog.gears.MultipartFormData.CRLF_ = '\r\n'; 
goog.gears.MultipartFormData.DASHES_ = '--'; 
goog.gears.MultipartFormData.prototype.closed_; 
goog.gears.MultipartFormData.prototype.hasContent_; 
goog.gears.MultipartFormData.prototype.addFile = function(name, gearsFile) { 
  return this.addBlob(name, gearsFile.name, gearsFile.blob); 
}; 
goog.gears.MultipartFormData.prototype.addText = function(name, value) { 
  this.assertNotClosed_(); 
  this.assertNoBoundary_(value); 
  this.hasContent_ = true; 
  this.blobBuilder_.append(goog.gears.MultipartFormData.DASHES_ + this.boundary_ + goog.gears.MultipartFormData.CRLF_ + 'Content-Disposition: form-data; name="' + name + '"' + goog.gears.MultipartFormData.CRLF_ + 'Content-Type: text/plain; charset=UTF-8' + goog.gears.MultipartFormData.CRLF_ + goog.gears.MultipartFormData.CRLF_ + value + goog.gears.MultipartFormData.CRLF_); 
  return this; 
}; 
goog.gears.MultipartFormData.prototype.addBlob = function(name, fileName, blob) { 
  this.assertNotClosed_(); 
  this.hasContent_ = true; 
  this.blobBuilder_.append(goog.gears.MultipartFormData.DASHES_ + this.boundary_ + goog.gears.MultipartFormData.CRLF_ + 'Content-Disposition: form-data; name="' + name + '"' + '; filename="' + fileName + '"' + goog.gears.MultipartFormData.CRLF_ + 'Content-Type: application/octet-stream' + goog.gears.MultipartFormData.CRLF_ + goog.gears.MultipartFormData.CRLF_); 
  this.blobBuilder_.append(blob); 
  this.blobBuilder_.append(goog.gears.MultipartFormData.CRLF_); 
  return this; 
}; 
goog.gears.MultipartFormData.prototype.getContentType = function() { 
  return 'multipart/form-data; boundary=' + this.boundary_; 
}; 
goog.gears.MultipartFormData.prototype.getAsBlob = function() { 
  if(! this.closed_ && this.hasContent_) { 
    this.blobBuilder_.append(goog.gears.MultipartFormData.DASHES_ + this.boundary_ + goog.gears.MultipartFormData.DASHES_ + goog.gears.MultipartFormData.CRLF_); 
    this.closed_ = true; 
  } 
  return this.blobBuilder_.getAsBlob(); 
}; 
goog.gears.MultipartFormData.prototype.assertNotClosed_ = function() { 
  goog.asserts.assert(! this.closed_, 'The multipart form builder has been ' + 'closed and no more data can be added to it'); 
}; 
goog.gears.MultipartFormData.prototype.assertNoBoundary_ = function(v) { 
  goog.asserts.assert(String(v).indexOf(this.boundary_) == - 1, 'The value cannot contain the boundary'); 
}; 
