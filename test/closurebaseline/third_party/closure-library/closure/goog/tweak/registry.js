
goog.provide('goog.tweak.Registry'); 
goog.require('goog.asserts'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.object'); 
goog.require('goog.string'); 
goog.require('goog.tweak.BaseEntry'); 
goog.require('goog.uri.utils'); 
goog.tweak.Registry = function(queryParams, compilerOverrides) { 
  this.entryMap_ = { }; 
  this.parsedQueryParams_ = goog.tweak.Registry.parseQueryParams(queryParams); 
  this.onRegisterListeners_ =[]; 
  this.compilerDefaultValueOverrides_ = compilerOverrides; 
  this.defaultValueOverrides_ = { }; 
}; 
goog.tweak.Registry.prototype.logger_ = goog.debug.Logger.getLogger('goog.tweak.Registry'); 
goog.tweak.Registry.parseQueryParams = function(queryParams) { 
  var parts = queryParams.substr(1).split('&'); 
  var ret = { }; 
  for(var i = 0, il = parts.length; i < il; ++ i) { 
    var entry = parts[i].split('='); 
    if(entry[0]) { 
      ret[goog.string.urlDecode(entry[0]).toLowerCase()]= goog.string.urlDecode(entry[1]|| ''); 
    } 
  } 
  return ret; 
}; 
goog.tweak.Registry.prototype.register = function(entry) { 
  var id = entry.getId(); 
  var oldBaseEntry = this.entryMap_[id]; 
  if(oldBaseEntry) { 
    if(oldBaseEntry == entry) { 
      this.logger_.warning('Tweak entry registered twice: ' + id); 
      return; 
    } 
    goog.asserts.fail('Tweak entry registered twice and with different types: ' + id); 
  } 
  var defaultValueOverride =(id in this.compilerDefaultValueOverrides_) ? this.compilerDefaultValueOverrides_[id]: this.defaultValueOverrides_[id]; 
  if(goog.isDef(defaultValueOverride)) { 
    goog.asserts.assertInstanceof(entry, goog.tweak.BasePrimitiveSetting, 'Cannot set the default value of non-primitive setting %s', entry.label); 
    entry.setDefaultValue(defaultValueOverride); 
  } 
  if(entry instanceof goog.tweak.BaseSetting) { 
    if(entry.getParamName()) { 
      entry.setInitialQueryParamValue(this.parsedQueryParams_[entry.getParamName()]); 
    } 
  } 
  this.entryMap_[id]= entry; 
  for(var i = 0, callback; callback = this.onRegisterListeners_[i]; ++ i) { 
    callback(entry); 
  } 
}; 
goog.tweak.Registry.prototype.addOnRegisterListener = function(func) { 
  this.onRegisterListeners_.push(func); 
}; 
goog.tweak.Registry.prototype.hasEntry = function(id) { 
  return id in this.entryMap_; 
}; 
goog.tweak.Registry.prototype.getEntry = function(id) { 
  var ret = this.entryMap_[id]; 
  goog.asserts.assert(ret, 'Tweak not registered: %s', id); 
  return ret; 
}; 
goog.tweak.Registry.prototype.getBooleanSetting = function(id) { 
  var entry = this.getEntry(id); 
  goog.asserts.assertInstanceof(entry, goog.tweak.BooleanSetting, 'getBooleanSetting called on wrong type of BaseSetting'); 
  return(entry); 
}; 
goog.tweak.Registry.prototype.getStringSetting = function(id) { 
  var entry = this.getEntry(id); 
  goog.asserts.assertInstanceof(entry, goog.tweak.StringSetting, 'getStringSetting called on wrong type of BaseSetting'); 
  return(entry); 
}; 
goog.tweak.Registry.prototype.getNumericSetting = function(id) { 
  var entry = this.getEntry(id); 
  goog.asserts.assertInstanceof(entry, goog.tweak.NumericSetting, 'getNumericSetting called on wrong type of BaseSetting'); 
  return(entry); 
}; 
goog.tweak.Registry.prototype.extractEntries = function(excludeChildEntries, excludeNonSettings) { 
  var entries =[]; 
  for(var id in this.entryMap_) { 
    var entry = this.entryMap_[id]; 
    if(entry instanceof goog.tweak.BaseSetting) { 
      if(excludeChildEntries && ! entry.getParamName()) { 
        continue; 
      } 
    } else if(excludeNonSettings) { 
      continue; 
    } 
    entries.push(entry); 
  } 
  return entries; 
}; 
goog.tweak.Registry.prototype.makeUrlQuery = function(opt_existingSearchStr) { 
  var existingParams = opt_existingSearchStr == undefined ? window.location.search: opt_existingSearchStr; 
  var sortedEntries = this.extractEntries(true, true); 
  sortedEntries.sort(function(a, b) { 
    return goog.array.defaultCompare(a.getParamName(), b.getParamName()); 
  }); 
  var keysAndValues =[]; 
  for(var i = 0, entry; entry = sortedEntries[i]; ++ i) { 
    var encodedValue = entry.getNewValueEncoded(); 
    if(encodedValue != null) { 
      keysAndValues.push(entry.getParamName(), encodedValue); 
    } 
    existingParams = goog.uri.utils.removeParam(existingParams, encodeURIComponent((entry.getParamName()))); 
  } 
  var tweakParams = goog.uri.utils.buildQueryData(keysAndValues); 
  tweakParams = tweakParams.replace(/%2C/g, ',').replace(/%20/g, '+'); 
  return ! tweakParams ? existingParams: existingParams ? existingParams + '&' + tweakParams: '?' + tweakParams; 
}; 
goog.tweak.Registry.prototype.overrideDefaultValue = function(id, value) { 
  goog.asserts.assert(! this.hasEntry(id), 'goog.tweak.overrideDefaultValue must be called before the tweak is ' + 'registered. Tweak: %s', id); 
  this.defaultValueOverrides_[id]= value; 
}; 
