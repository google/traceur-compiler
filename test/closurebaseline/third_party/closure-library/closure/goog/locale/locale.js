
goog.provide('goog.locale'); 
goog.require('goog.locale.nativeNameConstants'); 
goog.locale.setLocale = function(localeName) { 
  localeName = localeName.replace(/-/g, '_'); 
  goog.locale.activeLocale_ = localeName; 
}; 
goog.locale.getLocale = function() { 
  if(! goog.locale.activeLocale_) { 
    goog.locale.activeLocale_ = 'en'; 
  } 
  return goog.locale.activeLocale_; 
}; 
goog.locale.Resource = { 
  DATE_TIME_CONSTANTS: 'DateTimeConstants', 
  NUMBER_FORMAT_CONSTANTS: 'NumberFormatConstants', 
  TIME_ZONE_CONSTANTS: 'TimeZoneConstants', 
  LOCAL_NAME_CONSTANTS: 'LocaleNameConstants', 
  TIME_ZONE_SELECTED_IDS: 'TimeZoneSelectedIds', 
  TIME_ZONE_SELECTED_SHORT_NAMES: 'TimeZoneSelectedShortNames', 
  TIME_ZONE_SELECTED_LONG_NAMES: 'TimeZoneSelectedLongNames', 
  TIME_ZONE_ALL_LONG_NAMES: 'TimeZoneAllLongNames' 
}; 
goog.locale.getLanguageSubTag = function(languageCode) { 
  var result = languageCode.match(/^\w{2,3}([-_]|$)/); 
  return result ? result[0].replace(/[_-]/g, ''): ''; 
}; 
goog.locale.getRegionSubTag = function(languageCode) { 
  var result = languageCode.match(/[-_]([a-zA-Z]{2}|\d{3})([-_]|$)/); 
  return result ? result[0].replace(/[_-]/g, ''): ''; 
}; 
goog.locale.getScriptSubTag = function(languageCode) { 
  var result = languageCode.split(/[-_]/g); 
  return result.length > 1 && result[1].match(/^[a-zA-Z]{4}$/) ? result[1]: ''; 
}; 
goog.locale.getVariantSubTag = function(languageCode) { 
  var result = languageCode.match(/[-_]([a-z]{2,})/); 
  return result ? result[1]: ''; 
}; 
goog.locale.getNativeCountryName = function(countryCode) { 
  var key = goog.locale.getLanguageSubTag(countryCode) + '_' + goog.locale.getRegionSubTag(countryCode); 
  return key in goog.locale.nativeNameConstants.COUNTRY ? goog.locale.nativeNameConstants.COUNTRY[key]: countryCode; 
}; 
goog.locale.getLocalizedCountryName = function(languageCode, opt_localeSymbols) { 
  if(! opt_localeSymbols) { 
    opt_localeSymbols = goog.locale.getResource('LocaleNameConstants', goog.locale.getLocale()); 
  } 
  var code = goog.locale.getRegionSubTag(languageCode); 
  return code in opt_localeSymbols.COUNTRY ? opt_localeSymbols.COUNTRY[code]: languageCode; 
}; 
goog.locale.getNativeLanguageName = function(languageCode) { 
  var code = goog.locale.getLanguageSubTag(languageCode); 
  return code in goog.locale.nativeNameConstants.LANGUAGE ? goog.locale.nativeNameConstants.LANGUAGE[code]: languageCode; 
}; 
goog.locale.getLocalizedLanguageName = function(languageCode, opt_localeSymbols) { 
  if(! opt_localeSymbols) { 
    opt_localeSymbols = goog.locale.getResource('LocaleNameConstants', goog.locale.getLocale()); 
  } 
  var code = goog.locale.getLanguageSubTag(languageCode); 
  return code in opt_localeSymbols.LANGUAGE ? opt_localeSymbols.LANGUAGE[code]: languageCode; 
}; 
goog.locale.registerResource = function(dataObj, resourceName, localeName) { 
  if(! goog.locale.resourceRegistry_[resourceName]) { 
    goog.locale.resourceRegistry_[resourceName]= { }; 
  } 
  goog.locale.resourceRegistry_[resourceName][localeName]= dataObj; 
  if(! goog.locale.activeLocale_) { 
    goog.locale.activeLocale_ = localeName; 
  } 
}; 
goog.locale.isResourceRegistered = function(resourceName, localeName) { 
  return resourceName in goog.locale.resourceRegistry_ && localeName in goog.locale.resourceRegistry_[resourceName]; 
}; 
goog.locale.resourceRegistry_ = { }; 
goog.locale.registerTimeZoneConstants = function(dataObj, localeName) { 
  goog.locale.registerResource(dataObj, goog.locale.Resource.TIME_ZONE_CONSTANTS, localeName); 
}; 
goog.locale.registerLocaleNameConstants = function(dataObj, localeName) { 
  goog.locale.registerResource(dataObj, goog.locale.Resource.LOCAL_NAME_CONSTANTS, localeName); 
}; 
goog.locale.registerTimeZoneSelectedIds = function(dataObj, localeName) { 
  goog.locale.registerResource(dataObj, goog.locale.Resource.TIME_ZONE_SELECTED_IDS, localeName); 
}; 
goog.locale.registerTimeZoneSelectedShortNames = function(dataObj, localeName) { 
  goog.locale.registerResource(dataObj, goog.locale.Resource.TIME_ZONE_SELECTED_SHORT_NAMES, localeName); 
}; 
goog.locale.registerTimeZoneSelectedLongNames = function(dataObj, localeName) { 
  goog.locale.registerResource(dataObj, goog.locale.Resource.TIME_ZONE_SELECTED_LONG_NAMES, localeName); 
}; 
goog.locale.registerTimeZoneAllLongNames = function(dataObj, localeName) { 
  goog.locale.registerResource(dataObj, goog.locale.Resource.TIME_ZONE_ALL_LONG_NAMES, localeName); 
}; 
goog.locale.getResource = function(resourceName, opt_locale) { 
  var locale = opt_locale ? opt_locale: goog.locale.getLocale(); 
  if(!(resourceName in goog.locale.resourceRegistry_)) { 
    return undefined; 
  } 
  return goog.locale.resourceRegistry_[resourceName][locale]; 
}; 
goog.locale.getResourceWithFallback = function(resourceName, opt_locale) { 
  var locale = opt_locale ? opt_locale: goog.locale.getLocale(); 
  if(!(resourceName in goog.locale.resourceRegistry_)) { 
    return undefined; 
  } 
  if(locale in goog.locale.resourceRegistry_[resourceName]) { 
    return goog.locale.resourceRegistry_[resourceName][locale]; 
  } 
  var locale_parts = locale.split('_'); 
  if(locale_parts.length > 1 && locale_parts[0]in goog.locale.resourceRegistry_[resourceName]) { 
    return goog.locale.resourceRegistry_[resourceName][locale_parts[0]]; 
  } 
  return goog.locale.resourceRegistry_[resourceName]['en']; 
}; 
var registerLocalNameConstants = goog.locale.registerLocaleNameConstants; 
var registerTimeZoneSelectedIds = goog.locale.registerTimeZoneSelectedIds; 
var registerTimeZoneSelectedShortNames = goog.locale.registerTimeZoneSelectedShortNames; 
var registerTimeZoneSelectedLongNames = goog.locale.registerTimeZoneSelectedLongNames; 
var registerTimeZoneAllLongNames = goog.locale.registerTimeZoneAllLongNames; 
