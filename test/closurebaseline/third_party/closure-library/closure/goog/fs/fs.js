
goog.provide('goog.fs'); 
goog.require('goog.async.Deferred'); 
goog.require('goog.events'); 
goog.require('goog.fs.Error'); 
goog.require('goog.fs.FileSystem'); 
goog.fs.get_ = function(type, size) { 
  var requestFileSystem = goog.global.requestFileSystem || goog.global.webkitRequestFileSystem; 
  if(! goog.isFunction(requestFileSystem)) { 
    return goog.async.Deferred.fail(new Error('File API unsupported')); 
  } 
  var d = new goog.async.Deferred(); 
  requestFileSystem(type, size, function(fs) { 
    d.callback(new goog.fs.FileSystem(fs)); 
  }, function(err) { 
    d.errback(new goog.fs.Error(err.code, 'requesting filesystem')); 
  }); 
  return d; 
}; 
goog.fs.FileSystemType_ = { 
  TEMPORARY: 0, 
  PERSISTENT: 1 
}; 
goog.fs.getTemporary = function(size) { 
  return goog.fs.get_(goog.fs.FileSystemType_.TEMPORARY, size); 
}; 
goog.fs.getPersistent = function(size) { 
  return goog.fs.get_(goog.fs.FileSystemType_.PERSISTENT, size); 
}; 
goog.fs.createObjectUrl = function(blob) { 
  return goog.fs.getUrlObject_().createObjectURL(blob); 
}; 
goog.fs.revokeObjectUrl = function(url) { 
  goog.fs.getUrlObject_().revokeObjectURL(url); 
}; 
goog.fs.UrlObject_; 
goog.fs.getUrlObject_ = function() { 
  if(goog.isDef(goog.global.URL) && goog.isDef(goog.global.URL.createObjectURL)) { 
    return(goog.global.URL); 
  } else if(goog.isDef(goog.global.webkitURL) && goog.isDef(goog.global.webkitURL.createObjectURL)) { 
    return(goog.global.webkitURL); 
  } else if(goog.isDef(goog.global.createObjectURL)) { 
    return(goog.global); 
  } else { 
    throw Error('This browser doesn\'t seem to support blob URLs'); 
  } 
}; 
goog.fs.getBlob = function(var_args) { 
  var BlobBuilder = goog.global.BlobBuilder || goog.global.WebKitBlobBuilder; 
  var bb = new BlobBuilder(); 
  for(var i = 0; i < arguments.length; i ++) { 
    bb.append(arguments[i]); 
  } 
  return bb.getBlob(); 
}; 
goog.fs.blobToString = function(blob, opt_encoding) { 
  var reader = new FileReader(); 
  var d = new goog.async.Deferred(); 
  reader.onload = function() { 
    d.callback(reader.result); 
  }; 
  reader.onerror = function() { 
    d.errback(new goog.fs.Error(reader.error.code, 'converting blob to string')); 
  }; 
  reader.readAsText(blob, opt_encoding); 
  return d; 
}; 
