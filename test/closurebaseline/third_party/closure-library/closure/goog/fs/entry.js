
goog.provide('goog.fs.DirectoryEntry'); 
goog.provide('goog.fs.DirectoryEntry.Behavior'); 
goog.provide('goog.fs.Entry'); 
goog.provide('goog.fs.FileEntry'); 
goog.require('goog.array'); 
goog.require('goog.async.Deferred'); 
goog.require('goog.fs.Error'); 
goog.require('goog.fs.FileWriter'); 
goog.require('goog.string'); 
goog.fs.Entry = function(fs, entry) { 
  this.fs_ = fs; 
  this.entry_ = entry; 
}; 
goog.fs.Entry.prototype.isFile = function() { 
  return this.entry_.isFile; 
}; 
goog.fs.Entry.prototype.isDirectory = function() { 
  return this.entry_.isDirectory; 
}; 
goog.fs.Entry.prototype.getName = function() { 
  return this.entry_.name; 
}; 
goog.fs.Entry.prototype.getFullPath = function() { 
  return this.entry_.fullPath; 
}; 
goog.fs.Entry.prototype.getFileSystem = function() { 
  return this.fs_; 
}; 
goog.fs.Entry.prototype.getLastModified = function() { 
  var d = new goog.async.Deferred(); 
  this.entry_.getMetadata(function(metadata) { 
    d.callback(metadata.modificationTime); 
  }, goog.bind(function(err) { 
    var msg = 'retrieving last modified date for ' + this.getFullPath(); 
    d.errback(new goog.fs.Error(err.code, msg)); 
  }, this)); 
  return d; 
}; 
goog.fs.Entry.prototype.moveTo = function(parent, opt_newName) { 
  var d = new goog.async.Deferred(); 
  this.entry_.moveTo(parent.dir_, opt_newName, goog.bind(function(entry) { 
    d.callback(this.wrapEntry(entry)); 
  }, this), goog.bind(function(err) { 
    var msg = 'moving ' + this.getFullPath() + ' into ' + parent.getFullPath() +(opt_newName ? ', renaming to ' + opt_newName: ''); 
    d.errback(new goog.fs.Error(err.code, msg)); 
  }, this)); 
  return d; 
}; 
goog.fs.Entry.prototype.copyTo = function(parent, opt_newName) { 
  var d = new goog.async.Deferred(); 
  this.entry_.copyTo(parent.dir_, opt_newName, goog.bind(function(entry) { 
    d.callback(this.wrapEntry(entry)); 
  }, this), goog.bind(function(err) { 
    var msg = 'copying ' + this.getFullPath() + ' into ' + parent.getFullPath() +(opt_newName ? ', renaming to ' + opt_newName: ''); 
    d.errback(new goog.fs.Error(err.code, msg)); 
  }, this)); 
  return d; 
}; 
goog.fs.Entry.prototype.wrapEntry = function(entry) { 
  return entry.isFile ? new goog.fs.FileEntry(this.fs_,(entry)): new goog.fs.DirectoryEntry(this.fs_,(entry)); 
}; 
goog.fs.Entry.prototype.toUri = function(opt_mimeType) { 
  return this.entry_.toURI(opt_mimeType); 
}; 
goog.fs.Entry.prototype.remove = function() { 
  var d = new goog.async.Deferred(); 
  this.entry_.remove(goog.bind(d.callback, d), goog.bind(function(err) { 
    var msg = 'removing ' + this.getFullPath(); 
    d.errback(new goog.fs.Error(err.code, msg)); 
  }, this)); 
  return d; 
}; 
goog.fs.Entry.prototype.getParent = function() { 
  var d = new goog.async.Deferred(); 
  this.entry_.getParent(goog.bind(function(parent) { 
    d.callback(new goog.fs.DirectoryEntry(this.fs_, parent)); 
  }, this), goog.bind(function(err) { 
    var msg = 'getting parent of ' + this.getFullPath(); 
    d.errback(new goog.fs.Error(err.code, msg)); 
  }, this)); 
  return d; 
}; 
goog.fs.DirectoryEntry = function(fs, dir) { 
  goog.base(this, fs, dir); 
  this.dir_ = dir; 
}; 
goog.inherits(goog.fs.DirectoryEntry, goog.fs.Entry); 
goog.fs.DirectoryEntry.Behavior = { 
  DEFAULT: 1, 
  CREATE: 2, 
  CREATE_EXCLUSIVE: 3 
}; 
goog.fs.DirectoryEntry.prototype.getFile = function(path, opt_behavior) { 
  var d = new goog.async.Deferred(); 
  this.dir_.getFile(path, this.getOptions_(opt_behavior), goog.bind(function(entry) { 
    d.callback(new goog.fs.FileEntry(this.fs_, entry)); 
  }, this), goog.bind(function(err) { 
    var msg = 'loading file ' + path + ' from ' + this.getFullPath(); 
    d.errback(new goog.fs.Error(err.code, msg)); 
  }, this)); 
  return d; 
}; 
goog.fs.DirectoryEntry.prototype.getDirectory = function(path, opt_behavior) { 
  var d = new goog.async.Deferred(); 
  this.dir_.getDirectory(path, this.getOptions_(opt_behavior), goog.bind(function(entry) { 
    d.callback(new goog.fs.DirectoryEntry(this.fs_, entry)); 
  }, this), goog.bind(function(err) { 
    var msg = 'loading directory ' + path + ' from ' + this.getFullPath(); 
    d.errback(new goog.fs.Error(err.code, msg)); 
  }, this)); 
  return d; 
}; 
goog.fs.DirectoryEntry.prototype.createPath = function(path) { 
  if(goog.string.startsWith(path, '/')) { 
    var root = this.getFileSystem().getRoot(); 
    if(this.getFullPath() != root.getFullPath()) { 
      return root.createPath(path); 
    } 
  } 
  var parts = goog.array.filter(path.split('/'), goog.identityFunction); 
  var existed =[]; 
  function getNextDirectory(dir) { 
    if(! parts.length) { 
      return goog.async.Deferred.succeed(dir); 
    } 
    var def; 
    var nextDir = parts.shift(); 
    if(nextDir == '..') { 
      def = dir.getParent(); 
    } else if(nextDir == '.') { 
      def = goog.async.Deferred.succeed(dir); 
    } else { 
      def = dir.getDirectory(nextDir, goog.fs.DirectoryEntry.Behavior.CREATE); 
    } 
    return def.addCallback(getNextDirectory); 
  } 
  return getNextDirectory(this); 
}; 
goog.fs.DirectoryEntry.prototype.listDirectory = function() { 
  var d = new goog.async.Deferred(); 
  var reader = this.dir_.createReader(); 
  var results =[]; 
  var errorCallback = goog.bind(function(err) { 
    var msg = 'listing directory ' + this.getFullPath(); 
    d.errback(new goog.fs.Error(err.code, msg)); 
  }, this); 
  var successCallback = goog.bind(function(entries) { 
    if(entries.length) { 
      for(var i = 0, entry; entry = entries[i]; i ++) { 
        results.push(this.wrapEntry(entry)); 
      } 
      reader.readEntries(successCallback, errorCallback); 
    } else { 
      d.callback(results); 
    } 
  }, this); 
  reader.readEntries(successCallback, errorCallback); 
  return d; 
}; 
goog.fs.DirectoryEntry.prototype.removeRecursively = function() { 
  var d = new goog.async.Deferred(); 
  this.dir_.removeRecursively(goog.bind(d.callback, d), goog.bind(function(err) { 
    var msg = 'removing ' + this.getFullPath() + ' recursively'; 
    d.errback(new goog.fs.Error(err.code, msg)); 
  }, this)); 
  return d; 
}; 
goog.fs.DirectoryEntry.prototype.getOptions_ = function(opt_behavior) { 
  if(opt_behavior == goog.fs.DirectoryEntry.Behavior.CREATE) { 
    return { 'create': true }; 
  } else if(opt_behavior == goog.fs.DirectoryEntry.Behavior.CREATE_EXCLUSIVE) { 
    return { 
      'create': true, 
      'exclusive': true 
    }; 
  } else { 
    return { }; 
  } 
}; 
goog.fs.FileEntry = function(fs, file) { 
  goog.base(this, fs, file); 
  this.file_ = file; 
}; 
goog.inherits(goog.fs.FileEntry, goog.fs.Entry); 
goog.fs.FileEntry.prototype.createWriter = function() { 
  var d = new goog.async.Deferred(); 
  this.file_.createWriter(function(w) { 
    d.callback(new goog.fs.FileWriter(w)); 
  }, goog.bind(function(err) { 
    var msg = 'creating writer for ' + this.getFullPath(); 
    d.errback(new goog.fs.Error(err.code, msg)); 
  }, this)); 
  return d; 
}; 
goog.fs.FileEntry.prototype.file = function() { 
  var d = new goog.async.Deferred(); 
  this.file_.file(function(f) { 
    d.callback(f); 
  }, goog.bind(function(err) { 
    var msg = 'getting file for ' + this.getFullPath(); 
    d.errback(new goog.fs.Error(err.code, msg)); 
  }, this)); 
  return d; 
}; 
