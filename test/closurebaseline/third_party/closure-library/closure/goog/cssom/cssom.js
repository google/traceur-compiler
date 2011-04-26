
goog.provide('goog.cssom'); 
goog.provide('goog.cssom.CssRuleType'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.cssom.CssRuleType = { 
  STYLE: 1, 
  IMPORT: 3, 
  MEDIA: 4, 
  FONT_FACE: 5, 
  PAGE: 6, 
  NAMESPACE: 7 
}; 
goog.cssom.getAllCssText = function(opt_styleSheet) { 
  var styleSheet = opt_styleSheet || document.styleSheets; 
  return(goog.cssom.getAllCss_(styleSheet, true)); 
}; 
goog.cssom.getAllCssStyleRules = function(opt_styleSheet) { 
  var styleSheet = opt_styleSheet || document.styleSheets; 
  return(goog.cssom.getAllCss_(styleSheet, false)); 
}; 
goog.cssom.getCssRulesFromStyleSheet = function(styleSheet) { 
  var cssRuleList = null; 
  try { 
    cssRuleList = styleSheet.rules || styleSheet.cssRules; 
  } catch(e) { 
    if(e.code == 15) { 
      e.styleSheet = styleSheet; 
      throw e; 
    } 
  } 
  return cssRuleList; 
}; 
goog.cssom.getAllCssStyleSheets = function(opt_styleSheet, opt_includeDisabled) { 
  var styleSheetsOutput =[]; 
  var styleSheet = opt_styleSheet || document.styleSheets; 
  var includeDisabled = goog.isDef(opt_includeDisabled) ? opt_includeDisabled: false; 
  if(styleSheet.imports && styleSheet.imports.length) { 
    for(var i = 0, n = styleSheet.imports.length; i < n; i ++) { 
      goog.array.extend(styleSheetsOutput, goog.cssom.getAllCssStyleSheets(styleSheet.imports[i])); 
    } 
  } else if(styleSheet.length) { 
    for(var i = 0, n = styleSheet.length; i < n; i ++) { 
      goog.array.extend(styleSheetsOutput, goog.cssom.getAllCssStyleSheets(styleSheet[i])); 
    } 
  } else { 
    var cssRuleList = goog.cssom.getCssRulesFromStyleSheet(styleSheet); 
    if(cssRuleList && cssRuleList.length) { 
      for(var i = 0, n = cssRuleList.length, cssRule; i < n; i ++) { 
        cssRule = cssRuleList[i]; 
        if(cssRule.styleSheet) { 
          goog.array.extend(styleSheetsOutput, goog.cssom.getAllCssStyleSheets(cssRule.styleSheet)); 
        } 
      } 
    } 
  } 
  if((styleSheet.type || styleSheet.rules || styleSheet.cssRules) &&(! styleSheet.disabled || includeDisabled)) { 
    styleSheetsOutput.push(styleSheet); 
  } 
  return styleSheetsOutput; 
}; 
goog.cssom.getCssTextFromCssRule = function(cssRule) { 
  var cssText = ''; 
  if(cssRule.cssText) { 
    cssText = cssRule.cssText; 
  } else if(cssRule.style && cssRule.style.cssText && cssRule.selectorText) { 
    var styleCssText = cssRule.style.cssText.replace(/\s*-closure-parent-stylesheet:\s*\[object\];?\s*/gi, '').replace(/\s*-closure-rule-index:\s*[\d]+;?\s*/gi, ''); 
    var thisCssText = cssRule.selectorText + ' { ' + styleCssText + ' }'; 
    cssText = thisCssText; 
  } 
  return cssText; 
}; 
goog.cssom.getCssRuleIndexInParentStyleSheet = function(cssRule, opt_parentStyleSheet) { 
  if(cssRule.style && cssRule.style['-closure-rule-index']) { 
    return cssRule.style['-closure-rule-index']; 
  } 
  var parentStyleSheet = opt_parentStyleSheet || goog.cssom.getParentStyleSheet(cssRule); 
  if(! parentStyleSheet) { 
    throw Error('Cannot find a parentStyleSheet.'); 
  } 
  var cssRuleList = goog.cssom.getCssRulesFromStyleSheet(parentStyleSheet); 
  if(cssRuleList && cssRuleList.length) { 
    for(var i = 0, n = cssRuleList.length, thisCssRule; i < n; i ++) { 
      thisCssRule = cssRuleList[i]; 
      if(thisCssRule == cssRule) { 
        return i; 
      } 
    } 
  } 
  return - 1; 
}; 
goog.cssom.getParentStyleSheet = function(cssRule) { 
  return cssRule.parentStyleSheet || cssRule.style['-closure-parent-stylesheet']; 
}; 
goog.cssom.replaceCssRule = function(cssRule, cssText, opt_parentStyleSheet, opt_index) { 
  var parentStyleSheet = opt_parentStyleSheet || goog.cssom.getParentStyleSheet(cssRule); 
  if(parentStyleSheet) { 
    var index = opt_index >= 0 ? opt_index: goog.cssom.getCssRuleIndexInParentStyleSheet(cssRule, parentStyleSheet); 
    if(index) { 
      goog.cssom.removeCssRule(parentStyleSheet, index); 
      goog.cssom.addCssRule(parentStyleSheet, cssText, index); 
    } else { 
      throw Error('Cannot proceed without the index of the cssRule.'); 
    } 
  } else { 
    throw Error('Cannot proceed without the parentStyleSheet.'); 
  } 
}; 
goog.cssom.addCssRule = function(cssStyleSheet, cssText, opt_index) { 
  var index = opt_index; 
  if(index < 0 || index == undefined) { 
    var rules = cssStyleSheet.rules || cssStyleSheet.cssRules; 
    index = rules.length; 
  } 
  if(cssStyleSheet.insertRule) { 
    cssStyleSheet.insertRule(cssText, index); 
  } else { 
    var matches = /^([^\{]+)\{([^\{]+)\}/.exec(cssText); 
    if(matches.length == 3) { 
      var selector = matches[1]; 
      var style = matches[2]; 
      cssStyleSheet.addRule(selector, style, index); 
    } else { 
      throw Error('Your CSSRule appears to be ill-formatted.'); 
    } 
  } 
}; 
goog.cssom.removeCssRule = function(cssStyleSheet, index) { 
  if(cssStyleSheet.deleteRule) { 
    cssStyleSheet.deleteRule(index); 
  } else { 
    cssStyleSheet.removeRule(index); 
  } 
}; 
goog.cssom.addCssText = function(cssText, opt_domHelper) { 
  var document = opt_domHelper ? opt_domHelper.getDocument(): goog.dom.getDocument(); 
  var cssNode = document.createElement('style'); 
  cssNode.type = 'text/css'; 
  var head = document.getElementsByTagName('head')[0]; 
  head.appendChild(cssNode); 
  if(cssNode.styleSheet) { 
    cssNode.styleSheet.cssText = cssText; 
  } else { 
    cssText = document.createTextNode(cssText); 
    cssNode.appendChild(cssText); 
  } 
  return cssNode; 
}; 
goog.cssom.getFileNameFromStyleSheet = function(styleSheet) { 
  var href = styleSheet.href; 
  if(! href) { 
    return null; 
  } 
  var matches = /([^\/\?]+)[^\/]*$/.exec(href); 
  var filename = matches[1]; 
  return filename; 
}; 
goog.cssom.getAllCss_ = function(styleSheet, isTextOutput) { 
  var cssOut =[]; 
  var styleSheets = goog.cssom.getAllCssStyleSheets(styleSheet); 
  for(var i = 0; styleSheet = styleSheets[i]; i ++) { 
    var cssRuleList = goog.cssom.getCssRulesFromStyleSheet(styleSheet); 
    if(cssRuleList && cssRuleList.length) { 
      if(! isTextOutput) { 
        var ruleIndex = 0; 
      } 
      for(var j = 0, n = cssRuleList.length, cssRule; j < n; j ++) { 
        cssRule = cssRuleList[j]; 
        if(isTextOutput && ! cssRule.href) { 
          var res = goog.cssom.getCssTextFromCssRule(cssRule); 
          cssOut.push(res); 
        } else if(! cssRule.href) { 
          if(cssRule.style) { 
            if(! cssRule.parentStyleSheet) { 
              cssRule.style['-closure-parent-stylesheet']= styleSheet; 
            } 
            cssRule.style['-closure-rule-index']= ruleIndex; 
          } 
          cssOut.push(cssRule); 
        } 
        if(! isTextOutput) { 
          ruleIndex ++; 
        } 
      } 
    } 
  } 
  return isTextOutput ? cssOut.join(' '): cssOut; 
}; 
