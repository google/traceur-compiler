
goog.provide('goog.style.cursor'); 
goog.require('goog.userAgent'); 
goog.style.cursor.OPENHAND_FILE = 'openhand.cur'; 
goog.style.cursor.CLOSEDHAND_FILE = 'closedhand.cur'; 
goog.style.cursor.getDraggableCursorStyle = function(absoluteDotCurFilePath, opt_obsolete) { 
  return goog.style.cursor.getCursorStyle_('-moz-grab', absoluteDotCurFilePath + goog.style.cursor.OPENHAND_FILE, 'default'); 
}; 
goog.style.cursor.getDraggingCursorStyle = function(absoluteDotCurFilePath, opt_obsolete) { 
  return goog.style.cursor.getCursorStyle_('-moz-grabbing', absoluteDotCurFilePath + goog.style.cursor.CLOSEDHAND_FILE, 'move'); 
}; 
goog.style.cursor.getCursorStyle_ = function(geckoNonWinBuiltInStyleValue, absoluteDotCurFilePath, defaultStyle) { 
  if(goog.userAgent.GECKO && ! goog.userAgent.WINDOWS) { 
    return geckoNonWinBuiltInStyleValue; 
  } 
  var cursorStyleValue = 'url("' + absoluteDotCurFilePath + '")'; 
  if(goog.userAgent.WEBKIT) { 
    cursorStyleValue += ' 7 5'; 
  } 
  cursorStyleValue += ', ' + defaultStyle; 
  return cursorStyleValue; 
}; 
