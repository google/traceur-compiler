
goog.provide('goog.locale.genericFontNames'); 
goog.locale.genericFontNames.data_ = { }; 
goog.locale.genericFontNames.normalize_ = function(locale) { 
  locale = locale.replace(/-/g, '_'); 
  locale = locale.replace(/_[a-z]{2}$/, function(str) { 
    return str.toUpperCase(); 
  }); 
  locale = locale.replace(/[a-z]{4}/, function(str) { 
    return str.substring(0, 1).toUpperCase() + str.substring(1); 
  }); 
  return locale; 
}; 
goog.locale.genericFontNames.getList = function(locale) { 
  locale = goog.locale.genericFontNames.normalize_(locale); 
  if(locale in goog.locale.genericFontNames.data_) { 
    return goog.locale.genericFontNames.data_[locale]; 
  } 
  return[]; 
}; 
