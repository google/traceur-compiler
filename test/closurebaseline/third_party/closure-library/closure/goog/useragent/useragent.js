
goog.provide('goog.userAgent'); 
goog.require('goog.string'); 
goog.userAgent.ASSUME_IE = false; 
goog.userAgent.ASSUME_GECKO = false; 
goog.userAgent.ASSUME_WEBKIT = false; 
goog.userAgent.ASSUME_MOBILE_WEBKIT = false; 
goog.userAgent.ASSUME_OPERA = false; 
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA; 
goog.userAgent.getUserAgentString = function() { 
  return goog.global['navigator']? goog.global['navigator'].userAgent: null; 
}; 
goog.userAgent.getNavigator = function() { 
  return goog.global['navigator']; 
}; 
goog.userAgent.init_ = function() { 
  goog.userAgent.detectedOpera_ = false; 
  goog.userAgent.detectedIe_ = false; 
  goog.userAgent.detectedWebkit_ = false; 
  goog.userAgent.detectedMobile_ = false; 
  goog.userAgent.detectedGecko_ = false; 
  var ua; 
  if(! goog.userAgent.BROWSER_KNOWN_ &&(ua = goog.userAgent.getUserAgentString())) { 
    var navigator = goog.userAgent.getNavigator(); 
    goog.userAgent.detectedOpera_ = ua.indexOf('Opera') == 0; 
    goog.userAgent.detectedIe_ = ! goog.userAgent.detectedOpera_ && ua.indexOf('MSIE') != - 1; 
    goog.userAgent.detectedWebkit_ = ! goog.userAgent.detectedOpera_ && ua.indexOf('WebKit') != - 1; 
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ && ua.indexOf('Mobile') != - 1; 
    goog.userAgent.detectedGecko_ = ! goog.userAgent.detectedOpera_ && ! goog.userAgent.detectedWebkit_ && navigator.product == 'Gecko'; 
  } 
}; 
if(! goog.userAgent.BROWSER_KNOWN_) { 
  goog.userAgent.init_(); 
} 
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA: goog.userAgent.detectedOpera_; 
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE: goog.userAgent.detectedIe_; 
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO: goog.userAgent.detectedGecko_; 
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT: goog.userAgent.detectedWebkit_; 
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.detectedMobile_; 
goog.userAgent.SAFARI = goog.userAgent.WEBKIT; 
goog.userAgent.determinePlatform_ = function() { 
  var navigator = goog.userAgent.getNavigator(); 
  return navigator && navigator.platform || ''; 
}; 
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_(); 
goog.userAgent.ASSUME_MAC = false; 
goog.userAgent.ASSUME_WINDOWS = false; 
goog.userAgent.ASSUME_LINUX = false; 
goog.userAgent.ASSUME_X11 = false; 
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11; 
goog.userAgent.initPlatform_ = function() { 
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM, 'Mac'); 
  goog.userAgent.detectedWindows_ = goog.string.contains(goog.userAgent.PLATFORM, 'Win'); 
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM, 'Linux'); 
  goog.userAgent.detectedX11_ = ! ! goog.userAgent.getNavigator() && goog.string.contains(goog.userAgent.getNavigator()['appVersion']|| '', 'X11'); 
}; 
if(! goog.userAgent.PLATFORM_KNOWN_) { 
  goog.userAgent.initPlatform_(); 
} 
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC: goog.userAgent.detectedMac_; 
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS: goog.userAgent.detectedWindows_; 
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX: goog.userAgent.detectedLinux_; 
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11: goog.userAgent.detectedX11_; 
goog.userAgent.determineVersion_ = function() { 
  var version = '', re; 
  if(goog.userAgent.OPERA && goog.global['opera']) { 
    var operaVersion = goog.global['opera'].version; 
    version = typeof operaVersion == 'function' ? operaVersion(): operaVersion; 
  } else { 
    if(goog.userAgent.GECKO) { 
      re = /rv\:([^\);]+)(\)|;)/; 
    } else if(goog.userAgent.IE) { 
      re = /MSIE\s+([^\);]+)(\)|;)/; 
    } else if(goog.userAgent.WEBKIT) { 
      re = /WebKit\/(\S+)/; 
    } 
    if(re) { 
      var arr = re.exec(goog.userAgent.getUserAgentString()); 
      version = arr ? arr[1]: ''; 
    } 
  } 
  if(goog.userAgent.IE) { 
    var docMode = goog.userAgent.getDocumentMode_(); 
    if(docMode > parseFloat(version)) { 
      return String(docMode); 
    } 
  } 
  return version; 
}; 
goog.userAgent.getDocumentMode_ = function() { 
  var doc = goog.global['document']; 
  return doc ? doc['documentMode']: undefined; 
}; 
goog.userAgent.VERSION = goog.userAgent.determineVersion_(); 
goog.userAgent.compare = function(v1, v2) { 
  return goog.string.compareVersions(v1, v2); 
}; 
goog.userAgent.isVersionCache_ = { }; 
goog.userAgent.isVersion = function(version) { 
  return goog.userAgent.isVersionCache_[version]||(goog.userAgent.isVersionCache_[version]= goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0); 
}; 
goog.userAgent.isDocumentModeCache_ = { }; 
goog.userAgent.isDocumentMode = function(documentMode) { 
  return goog.userAgent.isDocumentModeCache_[documentMode]||(goog.userAgent.isDocumentModeCache_[documentMode]= goog.userAgent.IE && document.documentMode && document.documentMode >= documentMode); 
}; 
