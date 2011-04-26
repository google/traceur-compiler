
goog.provide('goog.net.tmpnetwork'); 
goog.require('goog.Uri'); 
goog.require('goog.net.ChannelDebug'); 
goog.net.tmpnetwork.GOOGLECOM_TIMEOUT = 10000; 
goog.net.tmpnetwork.testGoogleCom = function(callback, opt_imageUri) { 
  var uri = opt_imageUri; 
  if(! uri) { 
    uri = new goog.Uri('//www.google.com/images/cleardot.gif'); 
    uri.makeUnique(); 
  } 
  goog.net.tmpnetwork.testLoadImage(uri.toString(), goog.net.tmpnetwork.GOOGLECOM_TIMEOUT, callback); 
}; 
goog.net.tmpnetwork.testLoadImageWithRetries = function(url, timeout, callback, retries, opt_pauseBetweenRetriesMS) { 
  var channelDebug = new goog.net.ChannelDebug(); 
  channelDebug.debug('TestLoadImageWithRetries: ' + opt_pauseBetweenRetriesMS); 
  if(retries == 0) { 
    callback(false); 
    return; 
  } 
  var pauseBetweenRetries = opt_pauseBetweenRetriesMS || 0; 
  retries --; 
  goog.net.tmpnetwork.testLoadImage(url, timeout, function(succeeded) { 
    if(succeeded) { 
      callback(true); 
    } else { 
      goog.global.setTimeout(function() { 
        goog.net.tmpnetwork.testLoadImageWithRetries(url, timeout, callback, retries, pauseBetweenRetries); 
      }, pauseBetweenRetries); 
    } 
  }); 
}; 
goog.net.tmpnetwork.testLoadImage = function(url, timeout, callback) { 
  var channelDebug = new goog.net.ChannelDebug(); 
  channelDebug.debug('TestLoadImage: loading ' + url); 
  var img = new Image(); 
  img.onload = function() { 
    try { 
      channelDebug.debug('TestLoadImage: loaded'); 
      goog.net.tmpnetwork.clearImageCallbacks_(img); 
      callback(true); 
    } catch(e) { 
      channelDebug.dumpException(e); 
    } 
  }; 
  img.onerror = function() { 
    try { 
      channelDebug.debug('TestLoadImage: error'); 
      goog.net.tmpnetwork.clearImageCallbacks_(img); 
      callback(false); 
    } catch(e) { 
      channelDebug.dumpException(e); 
    } 
  }; 
  img.onabort = function() { 
    try { 
      channelDebug.debug('TestLoadImage: abort'); 
      goog.net.tmpnetwork.clearImageCallbacks_(img); 
      callback(false); 
    } catch(e) { 
      channelDebug.dumpException(e); 
    } 
  }; 
  img.ontimeout = function() { 
    try { 
      channelDebug.debug('TestLoadImage: timeout'); 
      goog.net.tmpnetwork.clearImageCallbacks_(img); 
      callback(false); 
    } catch(e) { 
      channelDebug.dumpException(e); 
    } 
  }; 
  goog.global.setTimeout(function() { 
    if(img.ontimeout) { 
      img.ontimeout(); 
    } 
  }, timeout); 
  img.src = url; 
}; 
goog.net.tmpnetwork.clearImageCallbacks_ = function(img) { 
  img.onload = null; 
  img.onerror = null; 
  img.onabort = null; 
  img.ontimeout = null; 
}; 
