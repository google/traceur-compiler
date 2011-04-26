
goog.provide('goog.net.FileDownloader'); 
goog.provide('goog.net.FileDownloader.Error'); 
goog.provide('goog.net.FileDownloader.Event'); 
goog.require('goog.Disposable'); 
goog.require('goog.async.Deferred'); 
goog.require('goog.crypt.hash32'); 
goog.require('goog.debug.Error'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.fs'); 
goog.require('goog.fs.DirectoryEntry.Behavior'); 
goog.require('goog.fs.Error.ErrorCode'); 
goog.require('goog.fs.FileSaver.EventType'); 
goog.require('goog.net.EventType'); 
goog.require('goog.net.XhrIo.ResponseType'); 
goog.require('goog.net.XhrIoPool'); 
goog.net.FileDownloader = function(dir, opt_pool) { 
  goog.base(this); 
  this.dir_ = dir; 
  this.pool_ = opt_pool || new goog.net.XhrIoPool(); 
  this.downloads_ = { }; 
  this.eventHandler_ = new goog.events.EventHandler(this); 
}; 
goog.inherits(goog.net.FileDownloader, goog.Disposable); 
goog.net.FileDownloader.prototype.download = function(url) { 
  if(url in this.downloads_) { 
    return this.downloads_[url].deferred.branch(); 
  } 
  var download = new goog.net.FileDownloader.Download_(url, this); 
  this.downloads_[url]= download; 
  this.pool_.getObject(goog.bind(this.gotXhr_, this, download)); 
  return download.deferred; 
}; 
goog.net.FileDownloader.prototype.waitForDownload = function(url) { 
  var deferred = new goog.async.Deferred(); 
  if(url in this.downloads_) { 
    this.downloads_[url].deferred.addBoth(function() { 
      deferred.callback(null); 
    }, this); 
  } else { 
    deferred.callback(null); 
  } 
  return deferred; 
}; 
goog.net.FileDownloader.prototype.getDownloadedBlob = function(url) { 
  return this.getFile_(url, goog.fs.DirectoryEntry.Behavior.DEFAULT).addCallback(function(fileEntry) { 
    return fileEntry.file(); 
  }); 
}; 
goog.net.FileDownloader.prototype.isDownloaded = function(url) { 
  var deferred = new goog.async.Deferred(); 
  var blobDeferred = this.getDownloadedBlob(url); 
  blobDeferred.addCallback(function() { 
    deferred.callback(true); 
  }); 
  blobDeferred.addErrback(function(err) { 
    if(err.code == goog.fs.Error.ErrorCode.NOT_FOUND) { 
      deferred.callback(false); 
    } else { 
      deferred.errback(err); 
    } 
  }); 
  return deferred; 
}; 
goog.net.FileDownloader.prototype.remove = function(url) { 
  return this.getFile_(url, goog.fs.DirectoryEntry.Behavior.DEFAULT).addCallback(function(fileEntry) { 
    return fileEntry.remove(); 
  }); 
}; 
goog.net.FileDownloader.prototype.setBlob = function(url, blob) { 
  var download = new goog.net.FileDownloader.Download_(url, this); 
  this.downloads_[url]= download; 
  download.blob = blob; 
  this.getFile_(download.url, goog.fs.DirectoryEntry.Behavior.CREATE_EXCLUSIVE).addCallback(goog.bind(this.fileSuccess_, this, download)).addErrback(goog.bind(this.error_, this, download)); 
  return download.deferred; 
}; 
goog.net.FileDownloader.prototype.gotXhr_ = function(download, xhr) { 
  if(download.cancelled) { 
    this.freeXhr_(xhr); 
    return; 
  } 
  this.eventHandler_.listen(xhr, goog.net.EventType.SUCCESS, goog.bind(this.xhrSuccess_, this, download)); 
  this.eventHandler_.listen(xhr,[goog.net.EventType.ERROR, goog.net.EventType.ABORT], goog.bind(this.error_, this, download)); 
  this.eventHandler_.listen(xhr, goog.net.EventType.READY, goog.bind(this.freeXhr_, this, xhr)); 
  download.xhr = xhr; 
  xhr.setResponseType(goog.net.XhrIo.ResponseType.ARRAY_BUFFER); 
  xhr.send(download.url); 
}; 
goog.net.FileDownloader.prototype.xhrSuccess_ = function(download) { 
  if(download.cancelled) { 
    return; 
  } 
  download.blob = goog.fs.getBlob((download.xhr.getResponse())); 
  delete download.xhr; 
  this.getFile_(download.url, goog.fs.DirectoryEntry.Behavior.CREATE_EXCLUSIVE).addCallback(goog.bind(this.fileSuccess_, this, download)).addErrback(goog.bind(this.error_, this, download)); 
}; 
goog.net.FileDownloader.prototype.fileSuccess_ = function(download, file) { 
  if(download.cancelled) { 
    file.remove(); 
    return; 
  } 
  download.file = file; 
  file.createWriter().addCallback(goog.bind(this.fileWriterSuccess_, this, download)).addErrback(goog.bind(this.error_, this, download)); 
}; 
goog.net.FileDownloader.prototype.fileWriterSuccess_ = function(download, writer) { 
  if(download.cancelled) { 
    download.file.remove(); 
    return; 
  } 
  download.writer = writer; 
  writer.write((download.blob)); 
  this.eventHandler_.listenOnce(writer, goog.fs.FileSaver.EventType.WRITE_END, goog.bind(this.writeEnd_, this, download)); 
}; 
goog.net.FileDownloader.prototype.writeEnd_ = function(download) { 
  if(download.cancelled || download.writer.getError()) { 
    this.error_(download, download.writer.getError()); 
    return; 
  } 
  delete this.downloads_[download.url]; 
  download.deferred.callback(download.blob); 
}; 
goog.net.FileDownloader.prototype.error_ = function(download, err) { 
  if(download.file) { 
    download.file.remove(); 
  } 
  if(download.cancelled) { 
    return; 
  } 
  delete this.downloads_[download.url]; 
  download.deferred.errback(new goog.net.FileDownloader.Error(download, err)); 
}; 
goog.net.FileDownloader.prototype.cancel_ = function(download) { 
  goog.dispose(download); 
  delete this.downloads_[download.url]; 
}; 
goog.net.FileDownloader.prototype.getFile_ = function(url, behavior) { 
  var dirname = '`' + Math.abs(goog.crypt.hash32.encodeString(url)).toString(16).substring(0, 3); 
  return this.dir_.getDirectory(dirname, goog.fs.DirectoryEntry.Behavior.CREATE).addCallback(function(dir) { 
    return dir.getFile(this.sanitize_(url), behavior); 
  }, this); 
}; 
goog.net.FileDownloader.prototype.sanitize_ = function(str) { 
  return '`' + str.replace(/[\/\\<>:?*"|%`]/g, encodeURIComponent).replace(/%/g, '`'); 
}; 
goog.net.FileDownloader.prototype.freeXhr_ = function(xhr) { 
  goog.events.removeAll(xhr); 
  this.pool_.addFreeObject(xhr); 
}; 
goog.net.FileDownloader.prototype.disposeInternal = function() { 
  delete this.dir_; 
  goog.dispose(this.eventHandler_); 
  delete this.eventHandler_; 
  goog.object.forEach(this.downloads_, function(download) { 
    download.deferred.cancel(); 
  }, this); 
  delete this.downloads_; 
  goog.dispose(this.pool_); 
  delete this.pool_; 
  goog.base(this, 'disposeInternal'); 
}; 
goog.net.FileDownloader.Error = function(download, fsErr) { 
  goog.base(this, 'Error capturing URL ' + download.url); 
  this.url = download.url; 
  if(download.xhr) { 
    this.xhrStatus = download.xhr.getStatus(); 
    this.xhrErrorCode = download.xhr.getLastErrorCode(); 
    this.message += ': XHR failed with status ' + this.xhrStatus + ' (error code ' + this.xhrErrorCode + ')'; 
  } else if(fsErr) { 
    this.fileError = fsErr; 
    this.message += ': file API failed (' + fsErr.message + ')'; 
  } 
}; 
goog.inherits(goog.net.FileDownloader.Error, goog.debug.Error); 
goog.net.FileDownloader.Error.prototype.xhrStatus; 
goog.net.FileDownloader.Error.prototype.xhrErrorCode; 
goog.net.FileDownloader.Error.prototype.fileError; 
goog.net.FileDownloader.Download_ = function(url, downloader) { 
  goog.base(this); 
  this.url = url; 
  this.deferred = new goog.async.Deferred(goog.bind(downloader.cancel_, downloader, this)); 
  this.cancelled = false; 
  this.xhr = null; 
  this.blob = null; 
  this.file = null; 
  this.writer = null; 
}; 
goog.inherits(goog.net.FileDownloader.Download_, goog.Disposable); 
goog.net.FileDownloader.Download_.prototype.disposeInternal = function() { 
  this.cancelled = true; 
  if(this.xhr) { 
    this.xhr.abort(); 
  } else if(this.writer && this.writer.getReadyState() == goog.fs.FileSaver.ReadyState.WRITING) { 
    this.writer.abort(); 
  } 
  goog.base(this, 'disposeInternal'); 
}; 
