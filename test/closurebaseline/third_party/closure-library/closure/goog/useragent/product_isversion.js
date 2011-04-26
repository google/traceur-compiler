
goog.provide('goog.userAgent.product.isVersion'); 
goog.require('goog.userAgent.product'); 
goog.userAgent.product.determineVersion_ = function() { 
  var version = '', re, combine; 
  if(goog.userAgent.product.FIREFOX) { 
    re = /Firefox\/([0-9.]+)/; 
  } else if(goog.userAgent.product.IE || goog.userAgent.product.OPERA) { 
    return goog.userAgent.VERSION; 
  } else if(goog.userAgent.product.CHROME) { 
    re = /Chrome\/([0-9.]+)/; 
  } else if(goog.userAgent.product.SAFARI) { 
    re = /Version\/([0-9.]+)/; 
  } else if(goog.userAgent.product.IPHONE || goog.userAgent.product.IPAD) { 
    re = /Version\/(\S+).*Mobile\/(\S+)/; 
    combine = true; 
  } else if(goog.userAgent.product.ANDROID) { 
    re = /Android\s+([0-9.]+)(?:.*Version\/([0-9.]+))?/; 
  } else if(goog.userAgent.product.CAMINO) { 
    re = /Camino\/([0-9.]+)/; 
  } 
  if(re) { 
    var arr = re.exec(goog.userAgent.getUserAgentString()); 
    if(arr) { 
      version = combine ? arr[1]+ '.' + arr[2]:(arr[2]|| arr[1]); 
    } else { 
      version = ''; 
    } 
  } 
  return version; 
}; 
goog.userAgent.product.VERSION = goog.userAgent.product.determineVersion_(); 
goog.userAgent.product.isVersion = function(version) { 
  return goog.string.compareVersions(goog.userAgent.product.VERSION, version) >= 0; 
}; 
