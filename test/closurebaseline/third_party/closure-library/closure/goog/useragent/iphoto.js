
goog.provide('goog.userAgent.iphoto'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
(function() { 
  var hasIphoto = false; 
  var version = ''; 
  function getIphotoVersion(desc) { 
    var matches = desc.match(/\d/g); 
    return matches.join('.'); 
  } 
  if(goog.userAgent.WEBKIT && navigator.mimeTypes && navigator.mimeTypes.length > 0) { 
    var iphoto = navigator.mimeTypes['application/photo']; 
    if(iphoto) { 
      hasIphoto = true; 
      var description = iphoto['description']; 
      if(description) { 
        version = getIphotoVersion(description); 
      } 
    } 
  } 
  goog.userAgent.iphoto.HAS_IPHOTO = hasIphoto; 
  goog.userAgent.iphoto.VERSION = version; 
})(); 
goog.userAgent.iphoto.isVersion = function(version) { 
  return goog.string.compareVersions(goog.userAgent.iphoto.VERSION, version) >= 0; 
}; 
