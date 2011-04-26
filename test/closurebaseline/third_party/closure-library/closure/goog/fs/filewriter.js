
goog.provide('goog.fs.FileWriter'); 
goog.require('goog.fs.FileSaver'); 
goog.fs.FileWriter = function(writer) { 
  goog.base(this, writer); 
  this.writer_ = writer; 
}; 
goog.inherits(goog.fs.FileWriter, goog.fs.FileSaver); 
goog.fs.FileWriter.prototype.getPosition = function() { 
  return this.writer_.position; 
}; 
goog.fs.FileWriter.prototype.getLength = function() { 
  return this.writer_.length; 
}; 
goog.fs.FileWriter.prototype.write = function(blob) { 
  try { 
    this.writer_.write(blob); 
  } catch(e) { 
    throw new goog.fs.Error(e.code, 'writing file'); 
  } 
}; 
goog.fs.FileWriter.prototype.seek = function(offset) { 
  try { 
    this.writer_.seek(offset); 
  } catch(e) { 
    throw new goog.fs.Error(e.code, 'seeking in file'); 
  } 
}; 
goog.fs.FileWriter.prototype.truncate = function(size) { 
  try { 
    this.writer_.truncate(size); 
  } catch(e) { 
    throw new goog.fs.Error(e.code, 'truncating file'); 
  } 
}; 
