
goog.provide('goog.userAgent.product'); 
goog.require('goog.userAgent'); 
goog.userAgent.product.ASSUME_FIREFOX = false; 
goog.userAgent.product.ASSUME_CAMINO = false; 
goog.userAgent.product.ASSUME_IPHONE = false; 
goog.userAgent.product.ASSUME_IPAD = false; 
goog.userAgent.product.ASSUME_ANDROID = false; 
goog.userAgent.product.ASSUME_CHROME = false; 
goog.userAgent.product.ASSUME_SAFARI = false; 
goog.userAgent.product.PRODUCT_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_OPERA || goog.userAgent.product.ASSUME_FIREFOX || goog.userAgent.product.ASSUME_CAMINO || goog.userAgent.product.ASSUME_IPHONE || goog.userAgent.product.ASSUME_IPAD || goog.userAgent.product.ASSUME_ANDROID || goog.userAgent.product.ASSUME_CHROME || goog.userAgent.product.ASSUME_SAFARI; 
goog.userAgent.product.init_ = function() { 
  goog.userAgent.product.detectedFirefox_ = false; 
  goog.userAgent.product.detectedCamino_ = false; 
  goog.userAgent.product.detectedIphone_ = false; 
  goog.userAgent.product.detectedIpad_ = false; 
  goog.userAgent.product.detectedAndroid_ = false; 
  goog.userAgent.product.detectedChrome_ = false; 
  goog.userAgent.product.detectedSafari_ = false; 
  var ua = goog.userAgent.getUserAgentString(); 
  if(! ua) { 
    return; 
  } 
  if(ua.indexOf('Firefox') != - 1) { 
    goog.userAgent.product.detectedFirefox_ = true; 
  } else if(ua.indexOf('Camino') != - 1) { 
    goog.userAgent.product.detectedCamino_ = true; 
  } else if(ua.indexOf('iPhone') != - 1 || ua.indexOf('iPod') != - 1) { 
    goog.userAgent.product.detectedIphone_ = true; 
  } else if(ua.indexOf('iPad') != - 1) { 
    goog.userAgent.product.detectedIpad_ = true; 
  } else if(ua.indexOf('Android') != - 1) { 
    goog.userAgent.product.detectedAndroid_ = true; 
  } else if(ua.indexOf('Chrome') != - 1) { 
    goog.userAgent.product.detectedChrome_ = true; 
  } else if(ua.indexOf('Safari') != - 1) { 
    goog.userAgent.product.detectedSafari_ = true; 
  } 
}; 
if(! goog.userAgent.product.PRODUCT_KNOWN_) { 
  goog.userAgent.product.init_(); 
} 
goog.userAgent.product.OPERA = goog.userAgent.OPERA; 
goog.userAgent.product.IE = goog.userAgent.IE; 
goog.userAgent.product.FIREFOX = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_FIREFOX: goog.userAgent.product.detectedFirefox_; 
goog.userAgent.product.CAMINO = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CAMINO: goog.userAgent.product.detectedCamino_; 
goog.userAgent.product.IPHONE = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPHONE: goog.userAgent.product.detectedIphone_; 
goog.userAgent.product.IPAD = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPAD: goog.userAgent.product.detectedIpad_; 
goog.userAgent.product.ANDROID = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_ANDROID: goog.userAgent.product.detectedAndroid_; 
goog.userAgent.product.CHROME = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CHROME: goog.userAgent.product.detectedChrome_; 
goog.userAgent.product.SAFARI = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_SAFARI: goog.userAgent.product.detectedSafari_; 
