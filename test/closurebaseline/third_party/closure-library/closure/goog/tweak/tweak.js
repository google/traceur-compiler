
goog.provide('goog.tweak'); 
goog.provide('goog.tweak.ConfigParams'); 
goog.require('goog.asserts'); 
goog.require('goog.tweak.BooleanGroup'); 
goog.require('goog.tweak.BooleanInGroupSetting'); 
goog.require('goog.tweak.BooleanSetting'); 
goog.require('goog.tweak.ButtonAction'); 
goog.require('goog.tweak.NumericSetting'); 
goog.require('goog.tweak.Registry'); 
goog.require('goog.tweak.StringSetting'); 
goog.tweak.getCompilerOverrides_ = function() { 
  return { }; 
}; 
goog.tweak.registry_ = null; 
goog.tweak.activeBooleanGroup_ = null; 
goog.tweak.getRegistry = function() { 
  if(! goog.tweak.registry_) { 
    var queryString = window.location.search; 
    var overrides = goog.tweak.getCompilerOverrides_(); 
    goog.tweak.registry_ = new goog.tweak.Registry(queryString, overrides); 
  } 
  return goog.tweak.registry_; 
}; 
goog.tweak.ConfigParams; 
goog.tweak.configParamsNeverCompilerWarningWorkAround_ = function() { 
  return { 
    label: '', 
    validValues:[], 
    paramName: '', 
    restartRequired: true, 
    callback: goog.nullFunction, 
    token: '' 
  }; 
}; 
goog.tweak.applyConfigParams_ = function(entry, configParams) { 
  if(configParams.label) { 
    entry.label = configParams.label; 
    delete configParams.label; 
  } 
  if(configParams.validValues) { 
    goog.asserts.assert(entry instanceof goog.tweak.StringSetting || entry instanceof goog.tweak.NumericSetting, 'Cannot set validValues on tweak: %s', entry.getId()); 
    entry.setValidValues(configParams.validValues); 
    delete configParams.validValues; 
  } 
  if(goog.isDef(configParams.paramName)) { 
    goog.asserts.assertInstanceof(entry, goog.tweak.BaseSetting, 'Cannot set paramName on tweak: %s', entry.getId()); 
    entry.setParamName(configParams.paramName); 
    delete configParams.paramName; 
  } 
  if(goog.isDef(configParams.restartRequired)) { 
    entry.setRestartRequired(configParams.restartRequired); 
    delete configParams.restartRequired; 
  } 
  if(configParams.callback) { 
    entry.addCallback(configParams.callback); 
    delete configParams.callback; 
    goog.asserts.assert(! entry.isRestartRequired() ||(configParams.restartRequired == false), 'Tweak %s should set restartRequired: false, when adding a callback.', entry.getId()); 
  } 
  if(configParams.token) { 
    goog.asserts.assertInstanceof(entry, goog.tweak.BooleanInGroupSetting, 'Cannot set token on tweak: %s', entry.getId()); 
    entry.setToken(configParams.token); 
    delete configParams.token; 
  } 
  for(var key in configParams) { 
    goog.asserts.fail('Unknown config options (' + key + '=' + configParams[key]+ ') for tweak ' + entry.getId()); 
  } 
}; 
goog.tweak.doRegister_ = function(entry, opt_defaultValue, opt_configParams) { 
  if(opt_configParams) { 
    goog.tweak.applyConfigParams_(entry, opt_configParams); 
  } 
  if(opt_defaultValue != undefined) { 
    entry.setDefaultValue(opt_defaultValue); 
  } 
  if(goog.tweak.activeBooleanGroup_) { 
    goog.asserts.assertInstanceof(entry, goog.tweak.BooleanInGroupSetting, 'Forgot to end Boolean Group: %s', goog.tweak.activeBooleanGroup_.getId()); 
    goog.tweak.activeBooleanGroup_.addChild((entry)); 
  } 
  goog.tweak.getRegistry().register(entry); 
}; 
goog.tweak.beginBooleanGroup = function(id, description, opt_configParams) { 
  var entry = new goog.tweak.BooleanGroup(id, description); 
  goog.tweak.doRegister_(entry, undefined, opt_configParams); 
  goog.tweak.activeBooleanGroup_ = entry; 
}; 
goog.tweak.endBooleanGroup = function() { 
  goog.tweak.activeBooleanGroup_ = null; 
}; 
goog.tweak.registerBoolean = function(id, description, opt_defaultValue, opt_configParams) { 
  if(goog.tweak.activeBooleanGroup_) { 
    var entry = new goog.tweak.BooleanInGroupSetting(id, description, goog.tweak.activeBooleanGroup_); 
  } else { 
    entry = new goog.tweak.BooleanSetting(id, description); 
  } 
  goog.tweak.doRegister_(entry, opt_defaultValue, opt_configParams); 
}; 
goog.tweak.registerString = function(id, description, opt_defaultValue, opt_configParams) { 
  goog.tweak.doRegister_(new goog.tweak.StringSetting(id, description), opt_defaultValue, opt_configParams); 
}; 
goog.tweak.registerNumber = function(id, description, opt_defaultValue, opt_configParams) { 
  goog.tweak.doRegister_(new goog.tweak.NumericSetting(id, description), opt_defaultValue, opt_configParams); 
}; 
goog.tweak.registerButton = function(id, description, callback, opt_label) { 
  var tweak = new goog.tweak.ButtonAction(id, description, callback); 
  tweak.label = opt_label || tweak.label; 
  goog.tweak.doRegister_(tweak); 
}; 
goog.tweak.overrideDefaultValue = function(id, value) { 
  goog.tweak.getRegistry().overrideDefaultValue(id, value); 
}; 
goog.tweak.getBoolean = function(id) { 
  return goog.tweak.getRegistry().getBooleanSetting(id).getValue(); 
}; 
goog.tweak.getString = function(id) { 
  return goog.tweak.getRegistry().getStringSetting(id).getValue(); 
}; 
goog.tweak.getNumber = function(id) { 
  return goog.tweak.getRegistry().getNumericSetting(id).getValue(); 
}; 
