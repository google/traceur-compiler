
goog.provide('goog.gears.Database'); 
goog.provide('goog.gears.Database.EventType'); 
goog.provide('goog.gears.Database.TransactionEvent'); 
goog.require('goog.array'); 
goog.require('goog.debug'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.gears'); 
goog.require('goog.json'); 
goog.gears.Database = function(userId, appName) { 
  goog.events.EventTarget.call(this); 
  var factory = goog.gears.getFactory(); 
  try { 
    this.database_ = factory.create('beta.database', '1.0'); 
  } catch(ex) { 
    throw Error('Could not create the database. ' + ex.message); 
  } 
  if(this.database_ != null) { 
    var dbId = userId + '-' + appName; 
    var safeDbId = goog.gears.makeSafeFileName(dbId); 
    if(dbId != safeDbId) { 
      this.logger_.info('database name ' + dbId + '->' + safeDbId); 
    } 
    this.safeDbId_ = safeDbId; 
    this.database_.open(safeDbId); 
  } else { 
    throw Error('Could not create the database'); 
  } 
}; 
goog.inherits(goog.gears.Database, goog.events.EventTarget); 
goog.gears.Database.EventType = { 
  BEFOREBEGIN: 'beforebegin', 
  BEGIN: 'begin', 
  BEFORECOMMIT: 'beforecommit', 
  COMMIT: 'commit', 
  BEFOREROLLBACK: 'beforerollback', 
  ROLLBACK: 'rollback' 
}; 
goog.gears.Database.TransactionEvent = function(eventType) { 
  goog.events.Event.call(this, eventType); 
}; 
goog.inherits(goog.gears.Database.TransactionEvent, goog.events.Event); 
goog.gears.Database.prototype.logger_ = goog.debug.Logger.getLogger('goog.gears.Database'); 
goog.gears.Database.prototype.safeDbId_; 
goog.gears.Database.prototype.useTransactions_ = true; 
goog.gears.Database.prototype.openTransactions_ = 0; 
goog.gears.Database.prototype.needsRollback_ = false; 
goog.gears.Database.prototype.defaultBeginType_ = 'IMMEDIATE'; 
goog.gears.Database.BeginLevels_ = { 
  'DEFERRED': 0, 
  'IMMEDIATE': 1, 
  'EXCLUSIVE': 2 
}; 
goog.gears.Database.prototype.currentBeginLevel_ = goog.gears.Database.BeginLevels_['DEFERRED']; 
goog.gears.Database.resultSetToArrays = function(rs) { 
  var rv =[]; 
  if(rs) { 
    var cols = rs['fieldCount'](); 
    while(rs['isValidRow']()) { 
      var row = new Array(cols); 
      for(var i = 0; i < cols; i ++) { 
        row[i]= rs['field'](i); 
      } 
      rv.push(row); 
      rs['next'](); 
    } 
  } 
  return rv; 
}; 
goog.gears.Database.resultSetToObjectArray = function(rs) { 
  var rv =[]; 
  if(rs) { 
    var cols = rs['fieldCount'](); 
    var colNames =[]; 
    for(var i = 0; i < cols; i ++) { 
      colNames.push(rs['fieldName'](i)); 
    } 
    while(rs['isValidRow']()) { 
      var h = { }; 
      for(var i = 0; i < cols; i ++) { 
        h[colNames[i]]= rs['field'](i); 
      } 
      rv.push(h); 
      rs['next'](); 
    } 
  } 
  return rv; 
}; 
goog.gears.Database.resultSetToValueArray = function(rs) { 
  var rv =[]; 
  if(rs) { 
    while(rs['isValidRow']()) { 
      rv.push(rs['field'](0)); 
      rs['next'](); 
    } 
  } 
  return rv; 
}; 
goog.gears.Database.resultSetToValue = function(rs) { 
  if(rs && rs['isValidRow']()) { 
    return rs['field'](0); 
  } else { 
    return null; 
  } 
}; 
goog.gears.Database.resultSetToObject = function(rs) { 
  if(rs && rs['isValidRow']()) { 
    var rv = { }; 
    var cols = rs['fieldCount'](); 
    for(var i = 0; i < cols; i ++) { 
      rv[rs['fieldName'](i)]= rs['field'](i); 
    } 
    return rv; 
  } else { 
    return null; 
  } 
}; 
goog.gears.Database.resultSetToArray = function(rs) { 
  var rv =[]; 
  if(rs && rs['isValidRow']()) { 
    var cols = rs['fieldCount'](); 
    for(var i = 0; i < cols; i ++) { 
      rv[i]= rs['field'](i); 
    } 
  } 
  return rv; 
}; 
goog.gears.Database.prototype.execute = function(sql, var_args) { 
  this.logger_.finer('Executing SQL: ' + sql); 
  sql = String(sql); 
  var args; 
  try { 
    if(arguments.length == 1) { 
      return this.database_.execute(sql); 
    } 
    if(arguments.length == 2 && goog.isArray(arguments[1])) { 
      args = arguments[1]; 
    } else { 
      args = goog.array.slice(arguments, 1); 
    } 
    this.logger_.finest('SQL arguments: ' + args); 
    return this.database_.execute(sql, args); 
  } catch(e) { 
    if(args) { 
      sql += ': ' + goog.json.serialize(args); 
    } 
    throw goog.debug.enhanceError(e, sql); 
  } 
}; 
goog.gears.Database.prototype.executeVarArgs_ = function(sql, params, startIndex) { 
  if(params.length == 0 || startIndex >= params.length) { 
    return this.execute(sql); 
  } else { 
    if(goog.isArray(params[startIndex])) { 
      return this.execute(sql, params[startIndex]); 
    } 
    var args = Array.prototype.slice.call(params, startIndex); 
    return this.execute(sql, args); 
  } 
}; 
goog.gears.Database.prototype.queryObject_ = function(sql, f, params, startIndex) { 
  var rs = this.executeVarArgs_(sql, params, startIndex); 
  try { 
    return f(rs); 
  } finally { 
    if(rs) { 
      rs.close(); 
    } 
  } 
}; 
goog.gears.Database.prototype.queryArrays = function(sql, var_args) { 
  return(this.queryObject_(sql, goog.gears.Database.resultSetToArrays, arguments, 1)); 
}; 
goog.gears.Database.prototype.queryObjectArray = function(sql, var_args) { 
  return(this.queryObject_(sql, goog.gears.Database.resultSetToObjectArray, arguments, 1)); 
}; 
goog.gears.Database.prototype.queryValueArray = function(sql, var_args) { 
  return(this.queryObject_(sql, goog.gears.Database.resultSetToValueArray, arguments, 1)); 
}; 
goog.gears.Database.prototype.queryValue = function(sql, var_args) { 
  return(this.queryObject_(sql, goog.gears.Database.resultSetToValue, arguments, 1)); 
}; 
goog.gears.Database.prototype.queryObject = function(sql, var_args) { 
  return(this.queryObject_(sql, goog.gears.Database.resultSetToObject, arguments, 1)); 
}; 
goog.gears.Database.prototype.queryArray = function(sql, var_args) { 
  return(this.queryObject_(sql, goog.gears.Database.resultSetToArray, arguments, 1)); 
}; 
goog.gears.Database.prototype.forEachValue = function(sql, f, opt_this, var_args) { 
  var rs = this.executeVarArgs_(sql, arguments, 3); 
  try { 
    var rowIndex = 0; 
    var cols = rs['fieldCount'](); 
    var colNames =[]; 
    for(var i = 0; i < cols; i ++) { 
      colNames.push(rs['fieldName'](i)); 
    } 
    mainLoop: while(rs['isValidRow']()) { 
      for(var i = 0; i < cols; i ++) { 
        if(! f.call(opt_this, rs['field'](i), rowIndex, i, colNames[i])) { 
          break mainLoop; 
        } 
      } 
      rs['next'](); 
      rowIndex ++; 
    } 
  } finally { 
    rs.close(); 
  } 
}; 
goog.gears.Database.prototype.forEachRow = function(sql, f, opt_this, var_args) { 
  var rs = this.executeVarArgs_(sql, arguments, 3); 
  try { 
    var rowIndex = 0; 
    var cols = rs['fieldCount'](); 
    var colNames =[]; 
    for(var i = 0; i < cols; i ++) { 
      colNames.push(rs['fieldName'](i)); 
    } 
    var row; 
    while(rs['isValidRow']()) { 
      row =[]; 
      for(var i = 0; i < cols; i ++) { 
        row.push(rs['field'](i)); 
      } 
      if(! f.call(opt_this, row, rowIndex, colNames)) { 
        break; 
      } 
      rs['next'](); 
      rowIndex ++; 
    } 
  } finally { 
    rs.close(); 
  } 
}; 
goog.gears.Database.prototype.transact = function(func) { 
  this.begin(); 
  try { 
    var result = func(); 
    this.commit(); 
  } catch(e) { 
    this.rollback(e); 
    throw e; 
  } 
  return result; 
}; 
goog.gears.Database.prototype.closeTransaction_ = function(rollback) { 
  var cmd; 
  var eventType; 
  cmd = rollback ? 'ROLLBACK': 'COMMIT'; 
  eventType = rollback ? goog.gears.Database.EventType.BEFOREROLLBACK: goog.gears.Database.EventType.BEFORECOMMIT; 
  var event = new goog.gears.Database.TransactionEvent(eventType); 
  var returnValue = this.dispatchEvent(event); 
  if(returnValue) { 
    this.database_.execute(cmd); 
    this.openTransactions_ = 0; 
    eventType = rollback ? goog.gears.Database.EventType.ROLLBACK: goog.gears.Database.EventType.COMMIT; 
    this.dispatchEvent(new goog.gears.Database.TransactionEvent(eventType)); 
  } 
  return returnValue; 
}; 
goog.gears.Database.prototype.setUseTransactions = function(b) { 
  this.useTransactions_ = b; 
}; 
goog.gears.Database.prototype.getUseTransactions = function() { 
  return this.useTransactions_; 
}; 
goog.gears.Database.prototype.setDefaultBeginType = function(beginType) { 
  if(beginType in goog.gears.Database.BeginLevels_) { 
    this.defaultBeginType_ = beginType; 
  } 
}; 
goog.gears.Database.prototype.beginTransaction_ = function(beginType) { 
  if(this.useTransactions_) { 
    if(this.openTransactions_ == 0) { 
      this.needsRollback_ = false; 
      this.dispatchEvent(new goog.gears.Database.TransactionEvent(goog.gears.Database.EventType.BEFOREBEGIN)); 
      this.database_.execute('BEGIN ' + beginType); 
      this.currentBeginLevel_ = goog.gears.Database.BeginLevels_[beginType]; 
      this.openTransactions_ = 1; 
      try { 
        this.dispatchEvent(new goog.gears.Database.TransactionEvent(goog.gears.Database.EventType.BEGIN)); 
      } catch(e) { 
        this.database_.execute('ROLLBACK'); 
        this.openTransactions_ = 0; 
        throw e; 
      } 
      return true; 
    } else if(this.needsRollback_) { 
      throw Error('Cannot begin a transaction with a rollback pending'); 
    } else if(goog.gears.Database.BeginLevels_[beginType]> this.currentBeginLevel_) { 
      throw Error('Cannot elevate the level within a nested begin'); 
    } else { 
      this.openTransactions_ ++; 
    } 
  } 
  return false; 
}; 
goog.gears.Database.prototype.begin = function() { 
  return this.beginTransaction_(this.defaultBeginType_); 
}; 
goog.gears.Database.prototype.beginDeferred = function() { 
  return this.beginTransaction_('DEFERRED'); 
}; 
goog.gears.Database.prototype.beginImmediate = function() { 
  return this.beginTransaction_('IMMEDIATE'); 
}; 
goog.gears.Database.prototype.beginExclusive = function() { 
  return this.beginTransaction_('EXCLUSIVE'); 
}; 
goog.gears.Database.prototype.commit = function() { 
  if(this.useTransactions_) { 
    if(this.openTransactions_ <= 0) { 
      throw Error('Unbalanced transaction'); 
    } 
    if(this.openTransactions_ == 1) { 
      var closed = this.closeTransaction_(this.needsRollback_); 
      return ! this.needsRollback_ && closed; 
    } else { 
      this.openTransactions_ --; 
    } 
  } 
  return false; 
}; 
goog.gears.Database.prototype.rollback = function(opt_e) { 
  var closed = true; 
  if(this.useTransactions_) { 
    if(this.openTransactions_ <= 0) { 
      throw Error('Unbalanced transaction'); 
    } 
    if(this.openTransactions_ == 1) { 
      closed = this.closeTransaction_(true); 
    } else { 
      this.openTransactions_ --; 
      this.needsRollback_ = true; 
      if(opt_e) { 
        throw opt_e; 
      } 
      return false; 
    } 
  } 
  return closed; 
}; 
goog.gears.Database.prototype.isInTransaction = function() { 
  return this.useTransactions_ && this.openTransactions_ > 0; 
}; 
goog.gears.Database.prototype.ensureNoTransaction = function(opt_logMsgPrefix) { 
  if(this.isInTransaction()) { 
    this.logger_.warning((opt_logMsgPrefix || 'ensureNoTransaction') + ' - rolling back unexpected transaction'); 
    do { 
      this.rollback(); 
    } while(this.isInTransaction()); 
  } 
}; 
goog.gears.Database.prototype.needsRollback = function() { 
  return this.useTransactions_ && this.openTransactions_ > 0 && this.needsRollback_; 
}; 
goog.gears.Database.prototype.getExecutionTime = function() { 
  return this.database_['executeMsec']|| 0; 
}; 
goog.gears.Database.prototype.getLastInsertRowId = function() { 
  return this.database_['lastInsertRowId']; 
}; 
goog.gears.Database.prototype.open = function() { 
  if(this.database_ && this.safeDbId_) { 
    this.database_.open(this.safeDbId_); 
  } else { 
    throw Error('Could not open the database'); 
  } 
}; 
goog.gears.Database.prototype.close = function() { 
  if(this.database_) { 
    this.database_.close(); 
  } 
}; 
goog.gears.Database.prototype.disposeInternal = function() { 
  goog.gears.Database.superClass_.disposeInternal.call(this); 
  this.database_ = null; 
}; 
goog.gears.Database.isLockedException = function(ex) { 
  var message = goog.isString(ex) ? ex: ex.message; 
  return ! ! message && message.indexOf('database is locked') >= 0; 
}; 
goog.gears.Database.prototype.remove = function() { 
  this.database_.remove(); 
}; 
