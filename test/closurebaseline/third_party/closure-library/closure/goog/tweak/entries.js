
goog.provide('goog.tweak.BaseEntry'); 
goog.provide('goog.tweak.BasePrimitiveSetting'); 
goog.provide('goog.tweak.BaseSetting'); 
goog.provide('goog.tweak.BooleanGroup'); 
goog.provide('goog.tweak.BooleanInGroupSetting'); 
goog.provide('goog.tweak.BooleanSetting'); 
goog.provide('goog.tweak.ButtonAction'); 
goog.provide('goog.tweak.NumericSetting'); 
goog.provide('goog.tweak.StringSetting'); 
goog.require('goog.array'); 
goog.require('goog.asserts'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.object'); 
goog.tweak.BaseEntry = function(id, description) { 
  this.id_ = id; 
  this.label = id; 
  this.description = description; 
  this.callbacks_ =[]; 
}; 
goog.tweak.BaseEntry.prototype.logger = goog.debug.Logger.getLogger('goog.tweak.BaseEntry'); 
goog.tweak.BaseEntry.prototype.restartRequired_ = true; 
goog.tweak.BaseEntry.prototype.getId = function() { 
  return this.id_; 
}; 
goog.tweak.BaseEntry.prototype.isRestartRequired = function() { 
  return this.restartRequired_; 
}; 
goog.tweak.BaseEntry.prototype.setRestartRequired = function(value) { 
  this.restartRequired_ = value; 
}; 
goog.tweak.BaseEntry.prototype.addCallback = function(callback) { 
  this.callbacks_.push(callback); 
}; 
goog.tweak.BaseEntry.prototype.removeCallback = function(callback) { 
  goog.array.remove(this.callbacks_, callback); 
}; 
goog.tweak.BaseEntry.prototype.fireCallbacks = function() { 
  for(var i = 0, callback; callback = this.callbacks_[i]; ++ i) { 
    callback(this); 
  } 
}; 
goog.tweak.BaseSetting = function(id, description) { 
  goog.tweak.BaseEntry.call(this, id, description); 
  goog.asserts.assert(! /[^A-Za-z0-9._]/.test(id), 'Tweak id contains illegal characters: ', id); 
  this.initialQueryParamValue; 
  this.paramName_ = this.getId().toLowerCase(); 
}; 
goog.inherits(goog.tweak.BaseSetting, goog.tweak.BaseEntry); 
goog.tweak.BaseSetting.InitializeState_ = { 
  NOT_INITIALIZED: 0, 
  INITIALIZING: 1, 
  INITIALIZED: 2 
}; 
goog.tweak.BaseSetting.prototype.logger = goog.debug.Logger.getLogger('goog.tweak.BaseSetting'); 
goog.tweak.BaseSetting.prototype.initializeState_ = goog.tweak.BaseSetting.InitializeState_.NOT_INITIALIZED; 
goog.tweak.BaseSetting.prototype.initialize = goog.abstractMethod; 
goog.tweak.BaseSetting.prototype.getNewValueEncoded = goog.abstractMethod; 
goog.tweak.BaseSetting.prototype.assertNotInitialized = function(funcName) { 
  goog.asserts.assert(this.initializeState_ != goog.tweak.BaseSetting.InitializeState_.INITIALIZED, 'Cannot call ' + funcName + ' after the tweak as been initialized.'); 
}; 
goog.tweak.BaseSetting.prototype.isInitializing = function() { 
  return this.initializeState_ == goog.tweak.BaseSetting.InitializeState_.INITIALIZING; 
}; 
goog.tweak.BaseSetting.prototype.setInitialQueryParamValue = function(value) { 
  this.assertNotInitialized('setInitialQueryParamValue'); 
  this.initialQueryParamValue = value; 
}; 
goog.tweak.BaseSetting.prototype.getParamName = function() { 
  return this.paramName_; 
}; 
goog.tweak.BaseSetting.prototype.setParamName = function(value) { 
  this.assertNotInitialized('setParamName'); 
  this.paramName_ = value; 
}; 
goog.tweak.BaseSetting.prototype.ensureInitialized = function() { 
  if(this.initializeState_ == goog.tweak.BaseSetting.InitializeState_.NOT_INITIALIZED) { 
    this.initializeState_ = goog.tweak.BaseSetting.InitializeState_.INITIALIZING; 
    var value = this.initialQueryParamValue == undefined ? null: this.initialQueryParamValue; 
    this.initialize(value); 
    this.initializeState_ = goog.tweak.BaseSetting.InitializeState_.INITIALIZED; 
  } 
}; 
goog.tweak.BasePrimitiveSetting = function(id, description, defaultValue) { 
  goog.tweak.BaseSetting.call(this, id, description); 
  this.defaultValue_ = defaultValue; 
  this.value_; 
  this.newValue_; 
}; 
goog.inherits(goog.tweak.BasePrimitiveSetting, goog.tweak.BaseSetting); 
goog.tweak.BasePrimitiveSetting.prototype.logger = goog.debug.Logger.getLogger('goog.tweak.BasePrimitiveSetting'); 
goog.tweak.BasePrimitiveSetting.prototype.encodeNewValue = goog.abstractMethod; 
goog.tweak.BasePrimitiveSetting.prototype.getValue = function() { 
  this.ensureInitialized(); 
  return this.value_; 
}; 
goog.tweak.BasePrimitiveSetting.prototype.getNewValue = function() { 
  this.ensureInitialized(); 
  return this.newValue_; 
}; 
goog.tweak.BasePrimitiveSetting.prototype.setValue = function(value) { 
  this.ensureInitialized(); 
  var changed = this.newValue_ != value; 
  this.newValue_ = value; 
  if(this.isInitializing()) { 
    this.value_ = value; 
  } else { 
    if(! this.isRestartRequired()) { 
      this.value_ = value; 
    } 
    if(changed) { 
      this.fireCallbacks(); 
    } 
  } 
}; 
goog.tweak.BasePrimitiveSetting.prototype.getDefaultValue = function() { 
  return this.defaultValue_; 
}; 
goog.tweak.BasePrimitiveSetting.prototype.setDefaultValue = function(value) { 
  this.assertNotInitialized('setDefaultValue'); 
  this.defaultValue_ = value; 
}; 
goog.tweak.BasePrimitiveSetting.prototype.getNewValueEncoded = function() { 
  this.ensureInitialized(); 
  return this.newValue_ == this.defaultValue_ ? null: this.encodeNewValue(); 
}; 
goog.tweak.StringSetting = function(id, description) { 
  goog.tweak.BasePrimitiveSetting.call(this, id, description, ''); 
  this.validValues_; 
}; 
goog.inherits(goog.tweak.StringSetting, goog.tweak.BasePrimitiveSetting); 
goog.tweak.StringSetting.prototype.logger = goog.debug.Logger.getLogger('goog.tweak.StringSetting'); 
goog.tweak.StringSetting.prototype.getValue; 
goog.tweak.StringSetting.prototype.getNewValue; 
goog.tweak.StringSetting.prototype.setValue; 
goog.tweak.StringSetting.prototype.setDefaultValue; 
goog.tweak.StringSetting.prototype.getDefaultValue; 
goog.tweak.StringSetting.prototype.encodeNewValue = function(value) { 
  return this.getNewValue(); 
}; 
goog.tweak.StringSetting.prototype.setValidValues = function(values) { 
  this.assertNotInitialized('setValidValues'); 
  this.validValues_ = values; 
  if(values && ! goog.array.contains(values, this.getDefaultValue())) { 
    this.setDefaultValue(values[0]); 
  } 
}; 
goog.tweak.StringSetting.prototype.getValidValues = function() { 
  return this.validValues_; 
}; 
goog.tweak.StringSetting.prototype.initialize = function(value) { 
  if(value == null) { 
    this.setValue(this.getDefaultValue()); 
  } else { 
    var validValues = this.validValues_; 
    if(validValues) { 
      value = value.toLowerCase(); 
      for(var i = 0, il = validValues.length; i < il; ++ i) { 
        if(value == validValues[i].toLowerCase()) { 
          this.setValue(validValues[i]); 
          return; 
        } 
      } 
      this.logger.warning('Tweak ' + this.getId() + ' has value outside of expected range:' + value); 
    } 
    this.setValue(value); 
  } 
}; 
goog.tweak.NumericSetting = function(id, description) { 
  goog.tweak.BasePrimitiveSetting.call(this, id, description, 0); 
  this.validValues_; 
}; 
goog.inherits(goog.tweak.NumericSetting, goog.tweak.BasePrimitiveSetting); 
goog.tweak.NumericSetting.prototype.logger = goog.debug.Logger.getLogger('goog.tweak.NumericSetting'); 
goog.tweak.NumericSetting.prototype.getValue; 
goog.tweak.NumericSetting.prototype.getNewValue; 
goog.tweak.NumericSetting.prototype.setValue; 
goog.tweak.NumericSetting.prototype.setDefaultValue; 
goog.tweak.NumericSetting.prototype.getDefaultValue; 
goog.tweak.NumericSetting.prototype.encodeNewValue = function() { 
  return '' + this.getNewValue(); 
}; 
goog.tweak.NumericSetting.prototype.setValidValues = function(values) { 
  this.assertNotInitialized('setValidValues'); 
  this.validValues_ = values; 
  if(values && ! goog.array.contains(values, this.getDefaultValue())) { 
    this.setDefaultValue(values[0]); 
  } 
}; 
goog.tweak.NumericSetting.prototype.getValidValues = function() { 
  return this.validValues_; 
}; 
goog.tweak.NumericSetting.prototype.initialize = function(value) { 
  if(value == null) { 
    this.setValue(this.getDefaultValue()); 
  } else { 
    var coercedValue = + value; 
    if(this.validValues_ && ! goog.array.contains(this.validValues_, coercedValue)) { 
      this.logger.warning('Tweak ' + this.getId() + ' has value outside of expected range: ' + value); 
    } 
    if(isNaN(coercedValue)) { 
      this.logger.warning('Tweak ' + this.getId() + ' has value of NaN, resetting to ' + this.getDefaultValue()); 
      this.setValue(this.getDefaultValue()); 
    } else { 
      this.setValue(coercedValue); 
    } 
  } 
}; 
goog.tweak.BooleanSetting = function(id, description) { 
  goog.tweak.BasePrimitiveSetting.call(this, id, description, false); 
}; 
goog.inherits(goog.tweak.BooleanSetting, goog.tweak.BasePrimitiveSetting); 
goog.tweak.BooleanSetting.prototype.logger = goog.debug.Logger.getLogger('goog.tweak.BooleanSetting'); 
goog.tweak.BooleanSetting.prototype.getValue; 
goog.tweak.BooleanSetting.prototype.getNewValue; 
goog.tweak.BooleanSetting.prototype.setValue; 
goog.tweak.BooleanSetting.prototype.setDefaultValue; 
goog.tweak.BooleanSetting.prototype.getDefaultValue; 
goog.tweak.BooleanSetting.prototype.encodeNewValue = function() { 
  return this.getNewValue() ? '1': '0'; 
}; 
goog.tweak.BooleanSetting.prototype.initialize = function(value) { 
  if(value == null) { 
    this.setValue(this.getDefaultValue()); 
  } else { 
    value = value.toLowerCase(); 
    this.setValue(value == 'true' || value == '1'); 
  } 
}; 
goog.tweak.BooleanInGroupSetting = function(id, description, group) { 
  goog.tweak.BooleanSetting.call(this, id, description); 
  this.token_ = this.getId().toLowerCase(); 
  this.group_ = group; 
  goog.tweak.BooleanInGroupSetting.superClass_.setParamName.call(this, null); 
}; 
goog.inherits(goog.tweak.BooleanInGroupSetting, goog.tweak.BooleanSetting); 
goog.tweak.BooleanInGroupSetting.prototype.logger = goog.debug.Logger.getLogger('goog.tweak.BooleanInGroupSetting'); 
goog.tweak.BooleanInGroupSetting.prototype.setParamName = function(value) { 
  goog.asserts.fail('Use setToken() for BooleanInGroupSetting.'); 
}; 
goog.tweak.BooleanInGroupSetting.prototype.setToken = function(value) { 
  this.token_ = value; 
}; 
goog.tweak.BooleanInGroupSetting.prototype.getToken = function() { 
  return this.token_; 
}; 
goog.tweak.BooleanInGroupSetting.prototype.getGroup = function() { 
  return this.group_; 
}; 
goog.tweak.BooleanGroup = function(id, description) { 
  goog.tweak.BaseSetting.call(this, id, description); 
  this.entriesByToken_ = { }; 
  this.queryParamValues_ = { }; 
}; 
goog.inherits(goog.tweak.BooleanGroup, goog.tweak.BaseSetting); 
goog.tweak.BooleanGroup.prototype.logger = goog.debug.Logger.getLogger('goog.tweak.BooleanGroup'); 
goog.tweak.BooleanGroup.prototype.getChildEntries = function() { 
  return this.entriesByToken_; 
}; 
goog.tweak.BooleanGroup.prototype.addChild = function(boolEntry) { 
  this.ensureInitialized(); 
  var token = boolEntry.getToken(); 
  var lcToken = token.toLowerCase(); 
  goog.asserts.assert(! this.entriesByToken_[lcToken], 'Multiple bools registered with token "%s" in group: %s', token, this.getId()); 
  this.entriesByToken_[lcToken]= boolEntry; 
  var value = this.queryParamValues_[lcToken]; 
  if(value != undefined) { 
    boolEntry.initialQueryParamValue = value ? '1': '0'; 
  } 
}; 
goog.tweak.BooleanGroup.prototype.initialize = function(value) { 
  var queryParamValues = { }; 
  if(value) { 
    var tokens = value.split(/\s*,\s*/); 
    for(var i = 0; i < tokens.length; ++ i) { 
      var token = tokens[i].toLowerCase(); 
      var negative = token.charAt(0) == '-'; 
      if(negative) { 
        token = token.substr(1); 
      } 
      queryParamValues[token]= ! negative; 
    } 
  } 
  this.queryParamValues_ = queryParamValues; 
}; 
goog.tweak.BooleanGroup.prototype.getNewValueEncoded = function() { 
  this.ensureInitialized(); 
  var nonDefaultValues =[]; 
  var keys = goog.object.getKeys(this.entriesByToken_); 
  keys.sort(); 
  for(var i = 0, entry; entry = this.entriesByToken_[keys[i]]; ++ i) { 
    var encodedValue = entry.getNewValueEncoded(); 
    if(encodedValue != null) { 
      nonDefaultValues.push((entry.getNewValue() ? '': '-') + entry.getToken()); 
    } 
  } 
  return nonDefaultValues.length ? nonDefaultValues.join(','): null; 
}; 
goog.tweak.ButtonAction = function(id, description, callback) { 
  goog.tweak.BaseEntry.call(this, id, description); 
  this.addCallback(callback); 
  this.setRestartRequired(false); 
}; 
goog.inherits(goog.tweak.ButtonAction, goog.tweak.BaseEntry); 
