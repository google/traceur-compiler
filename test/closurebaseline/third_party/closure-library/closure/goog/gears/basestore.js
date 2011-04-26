
goog.provide('goog.gears.BaseStore'); 
goog.provide('goog.gears.BaseStore.SchemaType'); 
goog.require('goog.Disposable'); 
goog.gears.BaseStore = function(database) { 
  goog.Disposable.call(this); 
  this.database_ = database; 
}; 
goog.inherits(goog.gears.BaseStore, goog.Disposable); 
goog.gears.BaseStore.SchemaType = { 
  TABLE: 1, 
  VIRTUAL_TABLE: 2, 
  INDEX: 3, 
  BEFORE_INSERT_TRIGGER: 4, 
  AFTER_INSERT_TRIGGER: 5, 
  BEFORE_UPDATE_TRIGGER: 6, 
  AFTER_UPDATE_TRIGGER: 7, 
  BEFORE_DELETE_TRIGGER: 8, 
  AFTER_DELETE_TRIGGER: 9 
}; 
goog.gears.BaseStore.prototype.name = 'Base'; 
goog.gears.BaseStore.prototype.version = 1; 
goog.gears.BaseStore.prototype.schema =[]; 
goog.gears.BaseStore.prototype.getDatabaseInternal = function() { 
  return this.database_; 
}; 
goog.gears.BaseStore.prototype.updateStore = function(persistedVersion) { }; 
goog.gears.BaseStore.prototype.loadData = function() { }; 
goog.gears.BaseStore.prototype.getCachedData = function() { }; 
goog.gears.BaseStore.prototype.informOtherStores = function() { }; 
goog.gears.BaseStore.prototype.ensureStoreExists = function() { 
  var persistedVersion = this.getStoreVersion(); 
  if(persistedVersion) { 
    if(persistedVersion != this.version) { 
      this.database_.begin(); 
      try { 
        this.updateStore(persistedVersion); 
        this.setStoreVersion_(this.version); 
        this.database_.commit(); 
      } catch(ex) { 
        this.database_.rollback(ex); 
        throw Error('Could not update the ' + this.name + ' schema ' + ' from version ' + persistedVersion + ' to ' + this.version + ': ' +(ex.message || 'unknown exception')); 
      } 
    } 
  } else { 
    this.database_.begin(); 
    try { 
      this.dropSchema(this.schema); 
      this.createSchema(this.schema); 
      this.createSchema([{ 
        type: goog.gears.BaseStore.SchemaType.TABLE, 
        name: 'StoreVersionInfo', 
        columns:['StoreName TEXT NOT NULL PRIMARY KEY', 'Version INTEGER NOT NULL']
      }], true); 
      this.loadData(); 
      this.setStoreVersion_(this.version); 
      this.database_.commit(); 
    } catch(ex) { 
      this.database_.rollback(ex); 
      throw Error('Could not create the ' + this.name + ' schema' + ': ' +(ex.message || 'unknown exception')); 
    } 
  } 
  this.getCachedData(); 
  this.informOtherStores(); 
}; 
goog.gears.BaseStore.prototype.removeStore = function() { 
  this.database_.begin(); 
  try { 
    this.removeStoreVersion(); 
    this.dropSchema(this.schema); 
    this.database_.commit(); 
  } catch(ex) { 
    this.database_.rollback(ex); 
    throw Error('Could not remove the ' + this.name + ' schema' + ': ' +(ex.message || 'unknown exception')); 
  } 
}; 
goog.gears.BaseStore.prototype.getName = function() { 
  return this.name; 
}; 
goog.gears.BaseStore.prototype.getStoreVersion = function() { 
  try { 
    return(this.database_.queryValue('SELECT Version FROM StoreVersionInfo WHERE StoreName=?', this.name)) || 0; 
  } catch(ex) { 
    return 0; 
  } 
}; 
goog.gears.BaseStore.prototype.setStoreVersion_ = function(version) { 
  this.database_.execute('INSERT OR REPLACE INTO StoreVersionInfo ' + '(StoreName, Version) VALUES(?,?)', this.name, version); 
}; 
goog.gears.BaseStore.prototype.removeStoreVersion = function() { 
  try { 
    this.database_.execute('DELETE FROM StoreVersionInfo WHERE StoreName=?', this.name); 
  } catch(ex) { } 
}; 
goog.gears.BaseStore.prototype.getCreateTriggerStatement_ = function(onStr, def, notExistsStr) { 
  return 'CREATE TRIGGER ' + notExistsStr + def.name + ' ' + onStr + ' ON ' + def.tableName +(def.when ?(' WHEN ' + def.when): '') + ' BEGIN ' + def.actions.join('; ') + '; END'; 
}; 
goog.gears.BaseStore.prototype.getCreateStatement_ = function(def, opt_ifNotExists) { 
  var notExists = opt_ifNotExists ? 'IF NOT EXISTS ': ''; 
  switch(def.type) { 
    case goog.gears.BaseStore.SchemaType.TABLE: 
      return 'CREATE TABLE ' + notExists + def.name + ' (\n' + def.columns.join(',\n  ') + ')'; 

    case goog.gears.BaseStore.SchemaType.VIRTUAL_TABLE: 
      return 'CREATE VIRTUAL TABLE ' + notExists + def.name + ' USING FTS2 (\n' + def.columns.join(',\n  ') + ')'; 

    case goog.gears.BaseStore.SchemaType.INDEX: 
      return 'CREATE' +(def.isUnique ? ' UNIQUE': '') + ' INDEX ' + notExists + def.name + ' ON ' + def.tableName + ' (\n' + def.columns.join(',\n  ') + ')'; 

    case goog.gears.BaseStore.SchemaType.BEFORE_INSERT_TRIGGER: 
      return this.getCreateTriggerStatement_('BEFORE INSERT', def, notExists); 

    case goog.gears.BaseStore.SchemaType.AFTER_INSERT_TRIGGER: 
      return this.getCreateTriggerStatement_('AFTER INSERT', def, notExists); 

    case goog.gears.BaseStore.SchemaType.BEFORE_UPDATE_TRIGGER: 
      return this.getCreateTriggerStatement_('BEFORE UPDATE', def, notExists); 

    case goog.gears.BaseStore.SchemaType.AFTER_UPDATE_TRIGGER: 
      return this.getCreateTriggerStatement_('AFTER UPDATE', def, notExists); 

    case goog.gears.BaseStore.SchemaType.BEFORE_DELETE_TRIGGER: 
      return this.getCreateTriggerStatement_('BEFORE DELETE', def, notExists); 

    case goog.gears.BaseStore.SchemaType.AFTER_DELETE_TRIGGER: 
      return this.getCreateTriggerStatement_('AFTER DELETE', def, notExists); 

  } 
  return ''; 
}; 
goog.gears.BaseStore.prototype.getDropStatement_ = function(def) { 
  switch(def.type) { 
    case goog.gears.BaseStore.SchemaType.TABLE: 
    case goog.gears.BaseStore.SchemaType.VIRTUAL_TABLE: 
      return 'DROP TABLE IF EXISTS ' + def.name; 

    case goog.gears.BaseStore.SchemaType.INDEX: 
      return 'DROP INDEX IF EXISTS ' + def.name; 

    case goog.gears.BaseStore.SchemaType.BEFORE_INSERT_TRIGGER: 
    case goog.gears.BaseStore.SchemaType.AFTER_INSERT_TRIGGER: 
    case goog.gears.BaseStore.SchemaType.BEFORE_UPDATE_TRIGGER: 
    case goog.gears.BaseStore.SchemaType.AFTER_UPDATE_TRIGGER: 
    case goog.gears.BaseStore.SchemaType.BEFORE_DELETE_TRIGGER: 
    case goog.gears.BaseStore.SchemaType.AFTER_DELETE_TRIGGER: 
      return 'DROP TRIGGER IF EXISTS ' + def.name; 

  } 
  return ''; 
}; 
goog.gears.BaseStore.prototype.createSchema = function(defs, opt_ifNotExists) { 
  this.database_.begin(); 
  try { 
    for(var i = 0; i < defs.length; ++ i) { 
      var sql = this.getCreateStatement_(defs[i], opt_ifNotExists); 
      this.database_.execute(sql); 
    } 
    this.database_.commit(); 
  } catch(ex) { 
    this.database_.rollback(ex); 
  } 
}; 
goog.gears.BaseStore.prototype.dropSchema = function(defs) { 
  this.database_.begin(); 
  try { 
    for(var i = defs.length - 1; i >= 0; -- i) { 
      this.database_.execute(this.getDropStatement_(defs[i])); 
    } 
    this.database_.commit(); 
  } catch(ex) { 
    this.database_.rollback(ex); 
  } 
}; 
goog.gears.BaseStore.prototype.createTriggers = function(defs) { 
  this.database_.begin(); 
  try { 
    for(var i = 0; i < defs.length; i ++) { 
      var def = defs[i]; 
      switch(def.type) { 
        case goog.gears.BaseStore.SchemaType.BEFORE_INSERT_TRIGGER: 
        case goog.gears.BaseStore.SchemaType.AFTER_INSERT_TRIGGER: 
        case goog.gears.BaseStore.SchemaType.BEFORE_UPDATE_TRIGGER: 
        case goog.gears.BaseStore.SchemaType.AFTER_UPDATE_TRIGGER: 
        case goog.gears.BaseStore.SchemaType.BEFORE_DELETE_TRIGGER: 
        case goog.gears.BaseStore.SchemaType.AFTER_DELETE_TRIGGER: 
          this.database_.execute('DROP TRIGGER IF EXISTS ' + def.name); 
          this.database_.execute(this.getCreateStatement_(def)); 
          break; 

      } 
    } 
    this.database_.commit(); 
  } catch(ex) { 
    this.database_.rollback(ex); 
  } 
}; 
goog.gears.BaseStore.prototype.hasTable = function(name) { 
  return this.hasInSchema_('table', name); 
}; 
goog.gears.BaseStore.prototype.hasIndex = function(name) { 
  return this.hasInSchema_('index', name); 
}; 
goog.gears.BaseStore.prototype.hasTrigger = function(name) { 
  return this.hasInSchema_('trigger', name); 
}; 
goog.gears.BaseStore.prototype.hasInSchema_ = function(type, name) { 
  return this.database_.queryValue('SELECT 1 FROM SQLITE_MASTER ' + 'WHERE TYPE=? AND NAME=?', type, name) != null; 
}; 
goog.gears.BaseStore.prototype.disposeInternal = function() { 
  goog.gears.BaseStore.superClass_.disposeInternal.call(this); 
  this.database_ = null; 
}; 
goog.gears.schemaDefDummy_ =[{ 
  type: '', 
  name: '', 
  when: '', 
  tableName: '', 
  actions:[], 
  isUnique: false 
}]; 
