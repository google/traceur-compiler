
goog.provide('goog.testing.fs'); 
goog.require('goog.Timer'); 
goog.require('goog.array'); 
goog.require('goog.fs'); 
goog.require('goog.testing.fs.Blob'); 
goog.require('goog.testing.fs.FileSystem'); 
goog.testing.fs.getTemporary = function(size) { 
  var d = new goog.async.Deferred(); 
  goog.Timer.callOnce(goog.bind(d.callback, d, new goog.testing.fs.FileSystem())); 
  return d; 
}; 
goog.testing.fs.getPersistent = function(size) { 
  return goog.testing.fs.getTemporary(size); 
}; 
goog.testing.fs.objectUrls_ = { }; 
goog.testing.fs.createObjectUrl = function(blob) { 
  var url = 'fakeblob:' + blob.toString(); 
  goog.testing.fs.objectUrls_[url]= true; 
  return url; 
}; 
goog.testing.fs.revokeObjectUrl = function(url) { 
  delete goog.testing.fs.objectUrls_[url]; 
}; 
goog.testing.fs.isObjectUrlGranted = function(blob) { 
  return('fakeblob:' + blob.toString()) in goog.testing.fs.objectUrls_; 
}; 
goog.testing.fs.getBlob = function(var_args) { 
  return new goog.testing.fs.Blob(goog.array.map(arguments, String).join('')); 
}; 
goog.testing.fs.blobToString = function(blob, opt_encoding) { 
  var d = new goog.async.Deferred(); 
  goog.Timer.callOnce(goog.bind(d.callback, d, blob.toString())); 
  return d; 
}; 
goog.testing.fs.install = function(stubs) { 
  var fs = goog.getObjectByName('goog.fs'); 
  stubs.replace(fs, 'getTemporary', goog.testing.fs.getTemporary); 
  stubs.replace(fs, 'getPersistent', goog.testing.fs.getPersistent); 
  stubs.replace(fs, 'createObjectUrl', goog.testing.fs.createObjectUrl); 
  stubs.replace(fs, 'revokeObjectUrl', goog.testing.fs.revokeObjectUrl); 
  stubs.replace(fs, 'getBlob', goog.testing.fs.getBlob); 
  stubs.replace(fs, 'blobToString', goog.testing.fs.blobToString); 
}; 
