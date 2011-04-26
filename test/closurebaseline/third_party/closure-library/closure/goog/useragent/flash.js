
goog.provide('goog.userAgent.flash'); 
goog.require('goog.string'); 
(function() { 
  function getFlashVersion(desc) { 
    var matches = desc.match(/[\d]+/g); 
    matches.length = 3; 
    return matches.join('.'); 
  } 
  var hasFlash = false; 
  var flashVersion = ''; 
  if(navigator.plugins && navigator.plugins.length) { 
    var plugin = navigator.plugins['Shockwave Flash']; 
    if(plugin) { 
      hasFlash = true; 
      if(plugin.description) { 
        flashVersion = getFlashVersion(plugin.description); 
      } 
    } 
    if(navigator.plugins['Shockwave Flash 2.0']) { 
      hasFlash = true; 
      flashVersion = '2.0.0.11'; 
    } 
  } else if(navigator.mimeTypes && navigator.mimeTypes.length) { 
    var mimeType = navigator.mimeTypes['application/x-shockwave-flash']; 
    hasFlash = mimeType && mimeType.enabledPlugin; 
    if(hasFlash) { 
      flashVersion = getFlashVersion(mimeType.enabledPlugin.description); 
    } 
  } else { 
    try { 
      var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.7'); 
      hasFlash = true; 
      flashVersion = getFlashVersion(ax.GetVariable('$version')); 
    } catch(e) { 
      try { 
        var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6'); 
        hasFlash = true; 
        flashVersion = '6.0.21'; 
      } catch(e2) { 
        try { 
          var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash'); 
          hasFlash = true; 
          flashVersion = getFlashVersion(ax.GetVariable('$version')); 
        } catch(e3) { } 
      } 
    } 
  } 
  goog.userAgent.flash.HAS_FLASH = hasFlash; 
  goog.userAgent.flash.VERSION = flashVersion; 
})(); 
goog.userAgent.flash.isVersion = function(version) { 
  return goog.string.compareVersions(goog.userAgent.flash.VERSION, version) >= 0; 
}; 
