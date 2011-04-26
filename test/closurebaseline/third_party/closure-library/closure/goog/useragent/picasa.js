
goog.provide('goog.userAgent.picasa'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
goog.userAgent.picasa.IE_HAS_PICASA_ = 'hasPicasa'; 
(function() { 
  var hasPicasa = false; 
  if(goog.userAgent.IE) { 
    goog.global[goog.userAgent.picasa.IE_HAS_PICASA_]= hasPicasa; 
    document.write(goog.string.subs('<!--[if gte Picasa 2]>' + '<%s>' + 'this.%s=true;' + '</%s>' + '<![endif]-->', 'script', goog.userAgent.picasa.IE_HAS_PICASA_, 'script')); 
    hasPicasa = goog.global[goog.userAgent.picasa.IE_HAS_PICASA_]; 
    goog.global[goog.userAgent.picasa.IE_HAS_PICASA_]= undefined; 
  } else if(navigator.mimeTypes && navigator.mimeTypes['application/x-picasa-detect']) { 
    hasPicasa = true; 
  } 
  goog.userAgent.picasa.HAS_PICASA = hasPicasa; 
  goog.userAgent.picasa.VERSION = hasPicasa ? '2': ''; 
})(); 
goog.userAgent.picasa.isVersion = function(version) { 
  return goog.string.compareVersions(goog.userAgent.picasa.VERSION, version) >= 0; 
}; 
