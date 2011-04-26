
goog.provide('goog.userAgent.platform'); 
goog.require('goog.userAgent'); 
goog.userAgent.platform.determineVersion_ = function() { 
  var version = '', re; 
  if(goog.userAgent.WINDOWS) { 
    re = /Windows NT ([0-9.]+)/; 
    var match = re.exec(goog.userAgent.getUserAgentString()); 
    if(match) { 
      return match[1]; 
    } else { 
      return '0'; 
    } 
  } else if(goog.userAgent.MAC) { 
    re = /10[_.][0-9_.]+/; 
    return re.exec(goog.userAgent.getUserAgentString())[0].replace(/_/g, '.'); 
  } 
  return ''; 
}; 
goog.userAgent.platform.VERSION = goog.userAgent.platform.determineVersion_(); 
goog.userAgent.platform.isVersion = function(version) { 
  return goog.string.compareVersions(goog.userAgent.platform.VERSION, version) >= 0; 
}; 
