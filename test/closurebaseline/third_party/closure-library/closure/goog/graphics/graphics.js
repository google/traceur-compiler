
goog.provide('goog.graphics'); 
goog.require('goog.graphics.CanvasGraphics'); 
goog.require('goog.graphics.SvgGraphics'); 
goog.require('goog.graphics.VmlGraphics'); 
goog.require('goog.userAgent'); 
goog.graphics.createGraphics = function(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper) { 
  var graphics; 
  if(goog.userAgent.IE && ! goog.userAgent.isVersion('9')) { 
    graphics = new goog.graphics.VmlGraphics(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper); 
  } else if(goog.userAgent.WEBKIT &&(! goog.userAgent.isVersion('420') || goog.userAgent.MOBILE)) { 
    graphics = new goog.graphics.CanvasGraphics(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper); 
  } else { 
    graphics = new goog.graphics.SvgGraphics(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper); 
  } 
  graphics.createDom(); 
  return graphics; 
}; 
goog.graphics.createSimpleGraphics = function(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper) { 
  if(goog.userAgent.MAC && goog.userAgent.GECKO && ! goog.userAgent.isVersion('1.9a')) { 
    var graphics = new goog.graphics.CanvasGraphics(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper); 
    graphics.createDom(); 
    return graphics; 
  } 
  return goog.graphics.createGraphics(width, height, opt_coordWidth, opt_coordHeight, opt_domHelper); 
}; 
goog.graphics.isBrowserSupported = function() { 
  if(goog.userAgent.IE) { 
    return goog.userAgent.isVersion('5.5'); 
  } 
  if(goog.userAgent.GECKO) { 
    return goog.userAgent.isVersion('1.8'); 
  } 
  if(goog.userAgent.OPERA) { 
    return goog.userAgent.isVersion('9.0'); 
  } 
  if(goog.userAgent.WEBKIT) { 
    return goog.userAgent.isVersion('412'); 
  } 
  return false; 
}; 
