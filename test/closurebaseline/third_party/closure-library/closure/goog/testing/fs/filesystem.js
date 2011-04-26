
goog.provide('goog.testing.fs.FileSystem'); 
goog.require('goog.testing.fs.DirectoryEntry'); 
goog.testing.fs.FileSystem = function(opt_name) { 
  this.name_ = opt_name || 'goog.testing.fs.FileSystem'; 
  this.root_ = new goog.testing.fs.DirectoryEntry(this, null, '', { }); 
}; 
goog.testing.fs.FileSystem.prototype.getName = function() { 
  return this.name_; 
}; 
goog.testing.fs.FileSystem.prototype.getRoot = function() { 
  return this.root_; 
}; 
