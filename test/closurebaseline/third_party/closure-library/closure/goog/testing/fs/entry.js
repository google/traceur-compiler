
goog.provide('goog.testing.fs.DirectoryEntry'); 
goog.provide('goog.testing.fs.Entry'); 
goog.provide('goog.testing.fs.FileEntry'); 
goog.require('goog.Timer'); 
goog.require('goog.array'); 
goog.require('goog.async.Deferred'); 
goog.require('goog.fs.DirectoryEntry'); 
goog.require('goog.fs.DirectoryEntry.Behavior'); 
goog.require('goog.fs.Error'); 
goog.require('goog.object'); 
goog.require('goog.string'); 
goog.require('goog.testing.fs.File'); 
goog.require('goog.testing.fs.FileWriter'); 
goog.testing.fs.Entry = function(fs, parent, name) { 
  this.fs_ = fs; 
  this.name_ = name; 
  this.parent = parent; 
}; 
goog.testing.fs.Entry.prototype.deleted = false; 
goog.testing.fs.Entry.prototype.isFile = goog.abstractMethod; 
goog.testing.fs.Entry.prototype.isDirectory = goog.abstractMethod; 
goog.testing.fs.Entry.prototype.getName = function() { 
  return this.name_; 
}; 
goog.testing.fs.Entry.prototype.getFullPath = function() { 
  if(this.getName() == '' || this.parent.getName() == '') { 
    return '/' + this.name_; 
  } else { 
    return this.parent.getFullPath() + '/' + this.name_; 
  } 
}; 
goog.testing.fs.Entry.prototype.getFileSystem = function() { 
  return this.fs_; 
}; 
goog.testing.fs.Entry.prototype.getLastModified = goog.abstractMethod; 
goog.testing.fs.Entry.prototype.moveTo = function(parent, opt_newName) { 
  var msg = 'moving ' + this.getFullPath() + ' into ' + parent.getFullPath() +(opt_newName ? ', renaming to ' + opt_newName: ''); 
  var newFile; 
  return this.checkNotDeleted(msg).addCallback(function() { 
    return this.copyTo(parent, opt_newName); 
  }).addCallback(function(file) { 
    newFile = file; 
    return this.remove(); 
  }).addCallback(function() { 
    return newFile; 
  }); 
}; 
goog.testing.fs.Entry.prototype.copyTo = function(parent, opt_newName) { 
  var msg = 'copying ' + this.getFullPath() + ' into ' + parent.getFullPath() +(opt_newName ? ', renaming to ' + opt_newName: ''); 
  return this.checkNotDeleted(msg).addCallback(function() { 
    var name = opt_newName || this.getName(); 
    var entry = this.clone(); 
    parent.children[name]= entry; 
    parent.lastModifiedTimestamp_ = goog.now(); 
    entry.name_ = name; 
    entry.parent = parent; 
    return entry; 
  }); 
}; 
goog.testing.fs.Entry.prototype.clone = goog.abstractMethod; 
goog.testing.fs.Entry.prototype.remove = function() { 
  var msg = 'removing ' + this.getFullPath(); 
  return this.checkNotDeleted(msg).addCallback(function() { 
    delete this.parent.children[this.getName()]; 
    this.parent.lastModifiedTimestamp_ = goog.now(); 
    this.deleted = true; 
    return; 
  }); 
}; 
goog.testing.fs.Entry.prototype.getParent = function() { 
  var msg = 'getting parent of ' + this.getFullPath(); 
  return this.checkNotDeleted(msg).addCallback(function() { 
    return this.parent; 
  }); 
}; 
goog.testing.fs.Entry.prototype.checkNotDeleted = function(action) { 
  var d = new goog.async.Deferred(undefined, this); 
  goog.Timer.callOnce(function() { 
    if(this.deleted) { 
      d.errback(new goog.fs.Error(goog.fs.Error.ErrorCode.NOT_FOUND, action)); 
    } else { 
      d.callback(); 
    } 
  }, 0, this); 
  return d; 
}; 
goog.testing.fs.DirectoryEntry = function(fs, parent, name, children) { 
  goog.base(this, fs, parent || this, name); 
  this.children = children; 
  this.lastModifiedTimestamp_ = goog.now(); 
}; 
goog.inherits(goog.testing.fs.DirectoryEntry, goog.testing.fs.Entry); 
goog.testing.fs.DirectoryEntry.prototype.isFile = function() { 
  return false; 
}; 
goog.testing.fs.DirectoryEntry.prototype.isDirectory = function() { 
  return true; 
}; 
goog.testing.fs.DirectoryEntry.prototype.getLastModified = function() { 
  var msg = 'reading last modified date for ' + this.getFullPath(); 
  return this.checkNotDeleted(msg).addCallback(function() { 
    return new Date(this.lastModifiedTimestamp_); 
  }); 
}; 
goog.testing.fs.DirectoryEntry.prototype.clone = function() { 
  return new goog.testing.fs.DirectoryEntry(this.getFileSystem(), this.parent, this.getName(), this.children); 
}; 
goog.testing.fs.DirectoryEntry.prototype.remove = function() { 
  if(! goog.object.isEmpty(this.children)) { 
    var d = new goog.async.Deferred(); 
    goog.Timer.callOnce(function() { 
      d.errback(new goog.fs.Error(goog.fs.Error.ErrorCode.INVALID_MODIFICATION, 'removing ' + this.getFullPath())); 
    }, 0, this); 
    return d; 
  } else { 
    return goog.base(this, 'remove'); 
  } 
}; 
goog.testing.fs.DirectoryEntry.prototype.getFile = function(path, opt_behavior) { 
  var msg = 'loading file ' + path + ' from ' + this.getFullPath(); 
  opt_behavior = opt_behavior || goog.fs.DirectoryEntry.Behavior.DEFAULT; 
  return this.checkNotDeleted(msg).addCallback(function() { 
    try { 
      return goog.async.Deferred.succeed(this.getFileSync(path, opt_behavior)); 
    } catch(e) { 
      return goog.async.Deferred.fail(e); 
    } 
  }); 
}; 
goog.testing.fs.DirectoryEntry.prototype.getDirectory = function(path, opt_behavior) { 
  var msg = 'loading directory ' + path + ' from ' + this.getFullPath(); 
  opt_behavior = opt_behavior || goog.fs.DirectoryEntry.Behavior.DEFAULT; 
  return this.checkNotDeleted(msg).addCallback(function() { 
    try { 
      return goog.async.Deferred.succeed(this.getDirectorySync(path, opt_behavior)); 
    } catch(e) { 
      return goog.async.Deferred.fail(e); 
    } 
  }); 
}; 
goog.testing.fs.DirectoryEntry.prototype.getFileSync = function(path, opt_behavior) { 
  opt_behavior = opt_behavior || goog.fs.DirectoryEntry.Behavior.DEFAULT; 
  return((this.getEntry_(path, opt_behavior, true, goog.bind(function(parent, name) { 
    return new goog.testing.fs.FileEntry(this.getFileSystem(), parent, name, ''); 
  }, this)))); 
}; 
goog.testing.fs.DirectoryEntry.prototype.createFileSync = function(path) { 
  return this.getFileSync(path, goog.fs.DirectoryEntry.Behavior.CREATE); 
}; 
goog.testing.fs.DirectoryEntry.prototype.getDirectorySync = function(path, opt_behavior) { 
  opt_behavior = opt_behavior || goog.fs.DirectoryEntry.Behavior.DEFAULT; 
  return((this.getEntry_(path, opt_behavior, false, goog.bind(function(parent, name) { 
    return new goog.testing.fs.DirectoryEntry(this.getFileSystem(), parent, name, { }); 
  }, this)))); 
}; 
goog.testing.fs.DirectoryEntry.prototype.createDirectorySync = function(path) { 
  return this.getDirectorySync(path, goog.fs.DirectoryEntry.Behavior.CREATE); 
}; 
goog.testing.fs.DirectoryEntry.prototype.getEntry_ = function(path, behavior, isFile, createFn) { 
  var components = goog.array.filter(path.split('/'), goog.identityFunction); 
  var basename =(goog.array.peek(components)) || ''; 
  var dir = goog.string.startsWith(path, '/') ? this.getFileSystem().getRoot(): this; 
  goog.array.forEach(components.slice(0, - 1), function(p) { 
    var subdir = dir.children[p]; 
    if(! subdir) { 
      throw new goog.fs.Error(goog.fs.Error.ErrorCode.NOT_FOUND, 'loading ' + path + ' from ' + this.getFullPath() + ' (directory ' + dir.getFullPath() + '/' + p + ')'); 
    } 
    dir = subdir; 
  }, this); 
  var entry = basename ? dir.children[basename]: dir; 
  if(! entry) { 
    if(behavior == goog.fs.DirectoryEntry.Behavior.DEFAULT) { 
      throw new goog.fs.Error(goog.fs.Error.ErrorCode.NOT_FOUND, 'loading ' + path + ' from ' + this.getFullPath()); 
    } else { 
      goog.asserts.assert(behavior == goog.fs.DirectoryEntry.Behavior.CREATE || behavior == goog.fs.DirectoryEntry.Behavior.CREATE_EXCLUSIVE); 
      entry = createFn(dir, basename); 
      dir.children[basename]= entry; 
      this.lastModifiedTimestamp_ = goog.now(); 
      return entry; 
    } 
  } else if(behavior == goog.fs.DirectoryEntry.Behavior.CREATE_EXCLUSIVE) { 
    throw new goog.fs.Error(goog.fs.Error.ErrorCode.PATH_EXISTS, 'loading ' + path + ' from ' + this.getFullPath()); 
  } else if(entry.isFile() != isFile) { 
    throw new goog.fs.Error(goog.fs.Error.ErrorCode.TYPE_MISMATCH, 'loading ' + path + ' from ' + this.getFullPath()); 
  } else { 
    if(behavior == goog.fs.DirectoryEntry.Behavior.CREATE) { 
      this.lastModifiedTimestamp_ = goog.now(); 
    } 
    return entry; 
  } 
}; 
goog.testing.fs.DirectoryEntry.prototype.hasChild = function(name) { 
  return name in this.children; 
}; 
goog.testing.fs.DirectoryEntry.prototype.removeRecursively = function() { 
  var msg = 'removing ' + this.getFullPath() + ' recursively'; 
  return this.checkNotDeleted(msg).addCallback(function() { 
    var d = goog.async.Deferred.succeed(null); 
    goog.object.forEach(this.children, function(child) { 
      d.awaitDeferred(child.isDirectory() ? child.removeRecursively(): child.remove()); 
    }); 
    d.addCallback(function() { 
      return this.remove(); 
    }, this); 
    return d; 
  }); 
}; 
goog.testing.fs.DirectoryEntry.prototype.listDirectory = function() { 
  var msg = 'listing ' + this.getFullPath(); 
  return this.checkNotDeleted(msg).addCallback(function() { 
    return goog.object.getValues(this.children); 
  }); 
}; 
goog.testing.fs.DirectoryEntry.prototype.createPath = goog.fs.DirectoryEntry.prototype.createPath; 
goog.testing.fs.FileEntry = function(fs, parent, name, data) { 
  goog.base(this, fs, parent, name); 
  this.file_ = new goog.testing.fs.File(name, new Date(goog.now()), data); 
}; 
goog.inherits(goog.testing.fs.FileEntry, goog.testing.fs.Entry); 
goog.testing.fs.FileEntry.prototype.isFile = function() { 
  return true; 
}; 
goog.testing.fs.FileEntry.prototype.isDirectory = function() { 
  return false; 
}; 
goog.testing.fs.FileEntry.prototype.clone = function() { 
  return new goog.testing.fs.FileEntry(this.getFileSystem(), this.parent, this.getName(), this.fileSync().toString()); 
}; 
goog.testing.fs.FileEntry.prototype.getLastModified = function() { 
  return this.file().addCallback(function(file) { 
    return file.lastModifiedDate; 
  }); 
}; 
goog.testing.fs.FileEntry.prototype.createWriter = function() { 
  var d = new goog.async.Deferred(); 
  goog.Timer.callOnce(goog.bind(d.callback, d, new goog.testing.fs.FileWriter(this))); 
  return d; 
}; 
goog.testing.fs.FileEntry.prototype.file = function() { 
  var msg = 'getting file for ' + this.getFullPath(); 
  return this.checkNotDeleted(msg).addCallback(function() { 
    return this.fileSync(); 
  }); 
}; 
goog.testing.fs.FileEntry.prototype.fileSync = function() { 
  return this.file_; 
}; 
