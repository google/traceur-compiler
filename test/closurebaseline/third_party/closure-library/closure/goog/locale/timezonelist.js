
goog.provide('goog.locale.TimeZoneList'); 
goog.require('goog.locale'); 
goog.locale.getTimeZoneSelectedShortNames = function(opt_regionOrLang) { 
  return goog.locale.getTimeZoneNameList_('TimeZoneSelectedShortNames', opt_regionOrLang); 
}; 
goog.locale.getTimeZoneSelectedLongNames = function(opt_regionOrLang) { 
  return goog.locale.getTimeZoneNameList_('TimeZoneSelectedLongNames', opt_regionOrLang); 
}; 
goog.locale.getTimeZoneAllLongNames = function() { 
  var locale = goog.locale.getLocale(); 
  return(goog.locale.getResource('TimeZoneAllLongNames', locale)); 
}; 
goog.locale.getTimeZoneNameList_ = function(nameType, opt_resource) { 
  var locale = goog.locale.getLocale(); 
  if(! opt_resource) { 
    opt_resource = goog.locale.getRegionSubTag(locale); 
  } 
  if(! opt_resource) { 
    opt_resource = locale; 
  } 
  var names = goog.locale.getResource(nameType, locale); 
  var ids = goog.locale.getResource('TimeZoneSelectedIds', opt_resource); 
  var len = ids.length; 
  var result =[]; 
  for(var i = 0; i < len; i ++) { 
    var id = ids[i]; 
    result.push({ 
      'id': id, 
      'name': names[id]
    }); 
  } 
  return result; 
}; 
