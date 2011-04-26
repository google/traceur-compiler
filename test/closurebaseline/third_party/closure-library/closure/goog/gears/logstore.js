
goog.provide('goog.gears.LogStore'); 
goog.provide('goog.gears.LogStore.Query'); 
goog.require('goog.async.Delay'); 
goog.require('goog.debug.LogManager'); 
goog.require('goog.debug.LogRecord'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.debug.Logger.Level'); 
goog.require('goog.gears.BaseStore'); 
goog.require('goog.gears.BaseStore.SchemaType'); 
goog.require('goog.json'); 
goog.gears.LogStore = function(database, opt_tableName) { 
  goog.gears.BaseStore.call(this, database); 
  var tableName = opt_tableName || goog.gears.LogStore.DEFAULT_TABLE_NAME_; 
  this.tableName_ = tableName; 
  this.schema =[{ 
    type: goog.gears.BaseStore.SchemaType.TABLE, 
    name: tableName, 
    columns:['id INTEGER PRIMARY KEY AUTOINCREMENT', 'millis BIGINT', 'level INTEGER', 'msg TEXT', 'logger TEXT', 'exception TEXT', 'exceptionText TEXT']
  }, { 
    type: goog.gears.BaseStore.SchemaType.INDEX, 
    name: tableName + 'MillisIndex', 
    isUnique: false, 
    tableName: tableName, 
    columns:['millis']
  }, { 
    type: goog.gears.BaseStore.SchemaType.INDEX, 
    name: tableName + 'LevelIndex', 
    isUnique: false, 
    tableName: tableName, 
    columns:['level']
  }]; 
  this.records_ =[]; 
  this.publishHandler_ = goog.bind(this.addLogRecord, this); 
}; 
goog.inherits(goog.gears.LogStore, goog.gears.BaseStore); 
goog.gears.LogStore.prototype.version = 1; 
goog.gears.LogStore.prototype.isCapturing_ = false; 
goog.gears.LogStore.prototype.bufferSize_ = 0; 
goog.gears.LogStore.prototype.delay_ = null; 
goog.gears.LogStore.prototype.isFlushing_ = false; 
goog.gears.LogStore.prototype.logger_ = goog.debug.Logger.getLogger('goog.gears.LogStore'); 
goog.gears.LogStore.DEFAULT_PRUNE_KEEPER_COUNT_ = 1000; 
goog.gears.LogStore.DEFAULT_AUTOPRUNE_INTERVAL_MILLIS_ = 10 * 60 * 1000; 
goog.gears.LogStore.DEFAULT_TABLE_NAME_ = 'GoogGearsDebugLogStore'; 
goog.gears.LogStore.MAX_BUFFER_BYTES_ = 200000; 
goog.gears.LogStore.prototype.flush = function() { 
  if(this.isFlushing_ || ! this.getDatabaseInternal()) { 
    return; 
  } 
  this.isFlushing_ = true; 
  this.logger_.info('flushing ' + this.records_.length + ' records'); 
  var records = this.records_; 
  this.records_ =[]; 
  for(var i = 0; i < records.length; i ++) { 
    var record = records[i]; 
    var exception = record.getException(); 
    var serializedException = exception ? goog.json.serialize(exception): ''; 
    var statement = 'INSERT INTO ' + this.tableName_ + ' (millis, level, msg, logger, exception, exceptionText)' + ' VALUES (?, ?, ?, ?, ?, ?)'; 
    this.getDatabaseInternal().execute(statement, record.getMillis(), record.getLevel().value, record.getMessage(), record.getLoggerName(), serializedException, record.getExceptionText() || ''); 
  } 
  this.isFlushing_ = false; 
}; 
goog.gears.LogStore.prototype.createAutoPruneDelay = function(opt_count, opt_interval) { 
  if(this.delay_) { 
    this.delay_.dispose(); 
    this.delay_ = null; 
  } 
  var interval = typeof opt_interval == 'number' ? opt_interval: goog.gears.LogStore.DEFAULT_AUTOPRUNE_INTERVAL_MILLIS_; 
  var listener = goog.bind(this.autoPrune_, this, opt_count); 
  this.delay_ = new goog.async.Delay(listener, interval); 
}; 
goog.gears.LogStore.prototype.startAutoPrune = function() { 
  if(! this.delay_) { 
    this.createAutoPruneDelay(goog.gears.LogStore.DEFAULT_PRUNE_KEEPER_COUNT_, goog.gears.LogStore.DEFAULT_AUTOPRUNE_INTERVAL_MILLIS_); 
  } 
  this.delay_.fire(); 
}; 
goog.gears.LogStore.prototype.stopAutoPrune = function() { 
  if(this.delay_) { 
    this.delay_.stop(); 
  } 
}; 
goog.gears.LogStore.prototype.isAutoPruneActive = function() { 
  return ! ! this.delay_ && this.delay_.isActive(); 
}; 
goog.gears.LogStore.prototype.autoPrune_ = function(opt_count) { 
  this.pruneBeforeCount(opt_count); 
  this.delay_.start(); 
}; 
goog.gears.LogStore.prototype.pruneBeforeCount = function(opt_count) { 
  if(! this.getDatabaseInternal()) { 
    return; 
  } 
  var count = typeof opt_count == 'number' ? opt_count: goog.gears.LogStore.DEFAULT_PRUNE_KEEPER_COUNT_; 
  this.logger_.info('pruning before ' + count + ' records ago'); 
  this.flush(); 
  this.getDatabaseInternal().execute('DELETE FROM ' + this.tableName_ + ' WHERE id <= ((SELECT MAX(id) FROM ' + this.tableName_ + ') - ?)', count); 
}; 
goog.gears.LogStore.prototype.pruneBeforeSequenceNumber = function(sequenceNumber) { 
  if(! this.getDatabaseInternal()) { 
    return; 
  } 
  this.logger_.info('pruning before sequence number ' + sequenceNumber); 
  this.flush(); 
  this.getDatabaseInternal().execute('DELETE FROM ' + this.tableName_ + ' WHERE id <= ?', sequenceNumber); 
}; 
goog.gears.LogStore.prototype.isCapturing = function() { 
  return this.isCapturing_; 
}; 
goog.gears.LogStore.prototype.setCapturing = function(capturing) { 
  if(capturing != this.isCapturing_) { 
    this.isCapturing_ = capturing; 
    var rootLogger = goog.debug.LogManager.getRoot(); 
    if(capturing) { 
      rootLogger.addHandler(this.publishHandler_); 
      this.logger_.info('enabled'); 
    } else { 
      this.logger_.info('disabling'); 
      rootLogger.removeHandler(this.publishHandler_); 
    } 
  } 
}; 
goog.gears.LogStore.prototype.addLogRecord = function(logRecord) { 
  this.records_.push(logRecord); 
  this.bufferSize_ += logRecord.getMessage().length; 
  var exceptionText = logRecord.getExceptionText(); 
  if(exceptionText) { 
    this.bufferSize_ += exceptionText.length; 
  } 
  if(this.bufferSize_ >= goog.gears.LogStore.MAX_BUFFER_BYTES_) { 
    this.flush(); 
  } 
}; 
goog.gears.LogStore.prototype.select = function(query) { 
  if(! this.getDatabaseInternal()) { 
    return[]; 
  } 
  this.flush(); 
  var statement = 'SELECT id, millis, level, msg, logger, exception, exceptionText' + ' FROM ' + this.tableName_ + ' WHERE level >= ? AND millis >= ? AND millis <= ?' + ' AND msg like ? and logger like ?' + ' ORDER BY id DESC LIMIT ?'; 
  var rows = this.getDatabaseInternal().queryObjectArray(statement, query.level.value, query.minMillis, query.maxMillis, query.msgLike, query.loggerLike, query.limit); 
  var result = Array(rows.length); 
  for(var i = rows.length - 1; i >= 0; i --) { 
    var row = rows[i]; 
    var sequenceNumber = Number(row['id']) || 0; 
    var level = goog.debug.Logger.Level.getPredefinedLevelByValue(Number(row['level']) || 0); 
    var msg = row['msg']|| ''; 
    var loggerName = row['logger']|| ''; 
    var millis = Number(row['millis']) || 0; 
    var serializedException = row['exception']; 
    var exception = serializedException ? goog.json.parse(serializedException): null; 
    var exceptionText = row['exceptionText']|| ''; 
    var record = new goog.debug.LogRecord(level, msg, loggerName, millis, sequenceNumber); 
    if(exception) { 
      record.setException(exception); 
      record.setExceptionText(exceptionText); 
    } 
    result[i]= record; 
  } 
  return result; 
}; 
goog.gears.LogStore.prototype.disposeInternal = function() { 
  this.flush(); 
  goog.gears.LogStore.superClass_.disposeInternal.call(this); 
  if(this.delay_) { 
    this.delay_.dispose(); 
    this.delay_ = null; 
  } 
}; 
goog.gears.LogStore.Query = function() { }; 
goog.gears.LogStore.Query.prototype.level = goog.debug.Logger.Level.ALL; 
goog.gears.LogStore.Query.prototype.minMillis = - 1; 
goog.gears.LogStore.Query.prototype.maxMillis = Infinity; 
goog.gears.LogStore.Query.prototype.msgLike = '%'; 
goog.gears.LogStore.Query.prototype.loggerLike = '%'; 
goog.gears.LogStore.Query.prototype.limit = - 1; 
