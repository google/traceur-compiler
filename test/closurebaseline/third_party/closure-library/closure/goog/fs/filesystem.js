
goog.provide('goog.fs.FileSystem'); 
goog.require('goog.fs.DirectoryEntry'); 
goog.fs.FileSystem = function(fs) { 
  this.fs_ = fs; 
}; 
goog.fs.FileSystem.prototype.getName = function() { 
  return this.fs_.name; 
}; 
goog.fs.FileSystem.prototype.getRoot = function() { 
  return new goog.fs.DirectoryEntry(this, this.fs_.root); 
}; 
