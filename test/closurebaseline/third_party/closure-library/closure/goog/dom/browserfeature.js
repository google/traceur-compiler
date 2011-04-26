
goog.provide('goog.dom.BrowserFeature'); 
goog.require('goog.userAgent'); 
goog.dom.BrowserFeature = { 
  CAN_ADD_NAME_OR_TYPE_ATTRIBUTES: ! goog.userAgent.IE || goog.userAgent.isVersion('9'), 
  CAN_USE_CHILDREN_ATTRIBUTE: ! goog.userAgent.GECKO && ! goog.userAgent.IE || goog.userAgent.IE && goog.userAgent.isVersion('9') || goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.1'), 
  CAN_USE_INNER_TEXT: goog.userAgent.IE && ! goog.userAgent.isVersion('9'), 
  INNER_HTML_NEEDS_SCOPED_ELEMENT: goog.userAgent.IE 
}; 
