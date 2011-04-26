
goog.provide('goog.events.BrowserFeature'); 
goog.require('goog.userAgent'); 
goog.events.BrowserFeature = { 
  HAS_W3C_BUTTON: ! goog.userAgent.IE || goog.userAgent.isVersion('9'), 
  SET_KEY_CODE_TO_PREVENT_DEFAULT: goog.userAgent.IE && ! goog.userAgent.isVersion('8') 
}; 
