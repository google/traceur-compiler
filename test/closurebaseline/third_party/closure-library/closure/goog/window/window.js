
goog.provide('goog.window'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
goog.window.DEFAULT_POPUP_HEIGHT = 500; 
goog.window.DEFAULT_POPUP_WIDTH = 690; 
goog.window.DEFAULT_POPUP_TARGET = 'google_popup'; 
goog.window.open = function(linkRef, opt_options, opt_parentWin) { 
  if(! opt_options) { 
    opt_options = { }; 
  } 
  var parentWin = opt_parentWin || window; 
  var href = typeof linkRef.href != 'undefined' ? linkRef.href: String(linkRef); 
  var target = opt_options.target || linkRef.target; 
  var sb =[]; 
  for(var option in opt_options) { 
    switch(option) { 
      case 'width': 
      case 'height': 
      case 'top': 
      case 'left': 
        sb.push(option + '=' + opt_options[option]); 
        break; 

      case 'target': 
      case 'noreferrer': 
        break; 

      default: 
        sb.push(option + '=' +(opt_options[option]? 1: 0)); 

    } 
  } 
  var optionString = sb.join(','); 
  var newWin; 
  if(opt_options['noreferrer']) { 
    newWin = parentWin.open('', target, optionString); 
    if(newWin) { 
      if(goog.userAgent.IE) { 
        if(href.indexOf(';') != - 1) { 
          href = "'" + href.replace(/'/g, '%27') + "'"; 
        } 
      } 
      href = goog.string.htmlEscape(href); 
      newWin.document.write('<META HTTP-EQUIV="refresh" content="0; url=' + href + '">'); 
      newWin.document.close(); 
    } 
  } else { 
    newWin = parentWin.open(href, target, optionString); 
  } 
  return newWin; 
}; 
goog.window.openBlank = function(opt_message, opt_options, opt_parentWin) { 
  var loadingMessage = opt_message ? goog.string.htmlEscape(opt_message): ''; 
  return(goog.window.open('javascript:"' + encodeURI(loadingMessage) + '"', opt_options, opt_parentWin)); 
}; 
goog.window.popup = function(linkRef, opt_options) { 
  if(! opt_options) { 
    opt_options = { }; 
  } 
  opt_options['target']= opt_options['target']|| linkRef['target']|| goog.window.DEFAULT_POPUP_TARGET; 
  opt_options['width']= opt_options['width']|| goog.window.DEFAULT_POPUP_WIDTH; 
  opt_options['height']= opt_options['height']|| goog.window.DEFAULT_POPUP_HEIGHT; 
  var newWin = goog.window.open(linkRef, opt_options); 
  if(! newWin) { 
    return true; 
  } 
  newWin.focus(); 
  return false; 
}; 
