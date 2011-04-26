
goog.provide('goog.debug.DevCss'); 
goog.provide('goog.debug.DevCss.UserAgent'); 
goog.require('goog.cssom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.events.EventType'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
goog.debug.DevCss = function(opt_userAgent, opt_userAgentVersion) { 
  if(! opt_userAgent) { 
    if(goog.userAgent.IE) { 
      opt_userAgent = goog.debug.DevCss.UserAgent.IE; 
    } else if(goog.userAgent.GECKO) { 
      opt_userAgent = goog.debug.DevCss.UserAgent.GECKO; 
    } else if(goog.userAgent.WEBKIT) { 
      opt_userAgent = goog.debug.DevCss.UserAgent.WEBKIT; 
    } else if(goog.userAgent.MOBILE) { 
      opt_userAgent = goog.debug.DevCss.UserAgent.MOBILE; 
    } else if(goog.userAgent.OPERA) { 
      opt_userAgent = goog.debug.DevCss.UserAgent.OPERA; 
    } 
  } 
  switch(opt_userAgent) { 
    case goog.debug.DevCss.UserAgent.OPERA: 
    case goog.debug.DevCss.UserAgent.IE: 
    case goog.debug.DevCss.UserAgent.GECKO: 
    case goog.debug.DevCss.UserAgent.FIREFOX: 
    case goog.debug.DevCss.UserAgent.WEBKIT: 
    case goog.debug.DevCss.UserAgent.SAFARI: 
    case goog.debug.DevCss.UserAgent.MOBILE: 
      break; 

    default: 
      throw Error('Could not determine the user agent from known UserAgents'); 

  } 
  this.userAgent_ = opt_userAgent; 
  this.userAgentVersion_ = opt_userAgentVersion || goog.userAgent.VERSION; 
  this.generateUserAgentTokens_(); 
  this.isIe6OrLess_ = this.userAgent_ == goog.debug.DevCss.UserAgent.IE && goog.string.compareVersions('7', this.userAgentVersion_) > 0; 
  if(this.isIe6OrLess_) { 
    this.ie6CombinedMatches_ =[]; 
  } 
}; 
goog.debug.DevCss.prototype.activateBrowserSpecificCssRules = function(opt_enableIe6ReadyHandler) { 
  var enableIe6EventHandler = goog.isDef(opt_enableIe6ReadyHandler) ? opt_enableIe6ReadyHandler: true; 
  var cssRules = goog.cssom.getAllCssStyleRules(); 
  for(var i = 0, cssRule; cssRule = cssRules[i]; i ++) { 
    this.replaceBrowserSpecificClassNames_(cssRule); 
  } 
  if(this.isIe6OrLess_) { 
    cssRules = goog.cssom.getAllCssStyleRules(); 
    for(var i = 0, cssRule; cssRule = cssRules[i]; i ++) { 
      this.replaceIe6CombinedSelectors_(cssRule); 
    } 
  } 
  if(this.isIe6OrLess_ && enableIe6EventHandler) { 
    goog.events.listen(document, goog.events.EventType.LOAD, goog.bind(this.addIe6CombinedClassNames_, this)); 
  } 
}; 
goog.debug.DevCss.prototype.userAgentTokens_ = { }; 
goog.debug.DevCss.UserAgent = { 
  OPERA: 'OPERA', 
  IE: 'IE', 
  GECKO: 'GECKO', 
  FIREFOX: 'GECKO', 
  WEBKIT: 'WEBKIT', 
  SAFARI: 'WEBKIT', 
  MOBILE: 'MOBILE' 
}; 
goog.debug.DevCss.CssToken_ = { 
  USERAGENT: 'USERAGENT', 
  SEPARATOR: '-', 
  LESS_THAN: 'LT', 
  GREATER_THAN: 'GT', 
  LESS_THAN_OR_EQUAL: 'LTE', 
  GREATER_THAN_OR_EQUAL: 'GTE', 
  IE6_SELECTOR_TEXT: 'goog-ie6-selector', 
  IE6_COMBINED_GLUE: '_' 
}; 
goog.debug.DevCss.prototype.generateUserAgentTokens_ = function() { 
  this.userAgentTokens_.ANY = goog.debug.DevCss.CssToken_.USERAGENT + goog.debug.DevCss.CssToken_.SEPARATOR + this.userAgent_; 
  this.userAgentTokens_.EQUALS = this.userAgentTokens_.ANY + goog.debug.DevCss.CssToken_.SEPARATOR; 
  this.userAgentTokens_.LESS_THAN = this.userAgentTokens_.ANY + goog.debug.DevCss.CssToken_.SEPARATOR + goog.debug.DevCss.CssToken_.LESS_THAN; 
  this.userAgentTokens_.LESS_THAN_OR_EQUAL = this.userAgentTokens_.ANY + goog.debug.DevCss.CssToken_.SEPARATOR + goog.debug.DevCss.CssToken_.LESS_THAN_OR_EQUAL; 
  this.userAgentTokens_.GREATER_THAN = this.userAgentTokens_.ANY + goog.debug.DevCss.CssToken_.SEPARATOR + goog.debug.DevCss.CssToken_.GREATER_THAN; 
  this.userAgentTokens_.GREATER_THAN_OR_EQUAL = this.userAgentTokens_.ANY + goog.debug.DevCss.CssToken_.SEPARATOR + goog.debug.DevCss.CssToken_.GREATER_THAN_OR_EQUAL; 
}; 
goog.debug.DevCss.prototype.getVersionNumberFromSelectorText_ = function(selectorText, userAgentToken) { 
  var regex = new RegExp(userAgentToken + '([\\d\\.]+)'); 
  var matches = regex.exec(selectorText); 
  if(matches && matches.length == 2) { 
    return matches[1]; 
  } 
}; 
goog.debug.DevCss.prototype.getRuleVersionAndCompare_ = function(cssRule, token) { 
  if(! cssRule.selectorText.match(token)) { 
    return; 
  } 
  var ruleVersion = this.getVersionNumberFromSelectorText_(cssRule.selectorText, token); 
  if(! ruleVersion) { 
    return; 
  } 
  var comparison = goog.string.compareVersions(this.userAgentVersion_, ruleVersion); 
  return[comparison, ruleVersion]; 
}; 
goog.debug.DevCss.prototype.replaceBrowserSpecificClassNames_ = function(cssRule) { 
  if(! cssRule.selectorText.match(this.userAgentTokens_.ANY)) { 
    return; 
  } 
  var additionalRegexString; 
  var compared = this.getRuleVersionAndCompare_(cssRule, this.userAgentTokens_.LESS_THAN_OR_EQUAL); 
  if(compared && compared.length) { 
    if(compared[0]> 0) { 
      return; 
    } 
    additionalRegexString = this.userAgentTokens_.LESS_THAN_OR_EQUAL + compared[1]; 
  } 
  compared = this.getRuleVersionAndCompare_(cssRule, this.userAgentTokens_.LESS_THAN); 
  if(compared && compared.length) { 
    if(compared[0]> - 1) { 
      return; 
    } 
    additionalRegexString = this.userAgentTokens_.LESS_THAN + compared[1]; 
  } 
  compared = this.getRuleVersionAndCompare_(cssRule, this.userAgentTokens_.GREATER_THAN_OR_EQUAL); 
  if(compared && compared.length) { 
    if(compared[0]< 0) { 
      return; 
    } 
    additionalRegexString = this.userAgentTokens_.GREATER_THAN_OR_EQUAL + compared[1]; 
  } 
  compared = this.getRuleVersionAndCompare_(cssRule, this.userAgentTokens_.GREATER_THAN); 
  if(compared && compared.length) { 
    if(compared[0]< 1) { 
      return; 
    } 
    additionalRegexString = this.userAgentTokens_.GREATER_THAN + compared[1]; 
  } 
  compared = this.getRuleVersionAndCompare_(cssRule, this.userAgentTokens_.EQUALS); 
  if(compared && compared.length) { 
    if(compared[0]!= 0) { 
      return; 
    } 
    additionalRegexString = this.userAgentTokens_.EQUALS + compared[1]; 
  } 
  if(! additionalRegexString) { 
    additionalRegexString = this.userAgentTokens_.ANY; 
  } 
  var regexString = '\\.' + additionalRegexString + '\\s+'; 
  var re = new RegExp(regexString, 'g'); 
  var currentCssText = goog.cssom.getCssTextFromCssRule(cssRule); 
  var newCssText = currentCssText.replace(re, ''); 
  if(newCssText != currentCssText) { 
    goog.cssom.replaceCssRule(cssRule, newCssText); 
  } 
}; 
goog.debug.DevCss.prototype.replaceIe6CombinedSelectors_ = function(cssRule) { 
  if(cssRule.style.cssText && cssRule.style.cssText.match(goog.debug.DevCss.CssToken_.IE6_SELECTOR_TEXT)) { 
    var cssText = goog.cssom.getCssTextFromCssRule(cssRule); 
    var combinedSelectorText = this.getIe6CombinedSelectorText_(cssText); 
    if(combinedSelectorText) { 
      var newCssText = combinedSelectorText + '{' + cssRule.style.cssText + '}'; 
      goog.cssom.replaceCssRule(cssRule, newCssText); 
    } 
  } 
}; 
goog.debug.DevCss.prototype.getIe6CombinedSelectorText_ = function(cssText) { 
  var regex = new RegExp(goog.debug.DevCss.CssToken_.IE6_SELECTOR_TEXT + '\\s*:\\s*\\"([^\\"]+)\\"', 'gi'); 
  var matches = regex.exec(cssText); 
  if(matches) { 
    var combinedSelectorText = matches[1]; 
    var groupedSelectors = combinedSelectorText.split(/\s*\,\s*/); 
    for(var i = 0, selector; selector = groupedSelectors[i]; i ++) { 
      var combinedClassName = selector.substr(1); 
      var classNames = combinedClassName.split(goog.debug.DevCss.CssToken_.IE6_COMBINED_GLUE); 
      var entry = { 
        classNames: classNames, 
        combinedClassName: combinedClassName, 
        els:[]
      }; 
      this.ie6CombinedMatches_.push(entry); 
    } 
    return combinedSelectorText; 
  } 
  return null; 
}; 
goog.debug.DevCss.prototype.addIe6CombinedClassNames_ = function() { 
  if(! this.ie6CombinedMatches_.length) { 
    return; 
  } 
  var allEls = document.getElementsByTagName('*'); 
  var matches =[]; 
  for(var i = 0, classNameEntry; classNameEntry = this.ie6CombinedMatches_[i]; i ++) { 
    for(var j = 0, el; el = allEls[j]; j ++) { 
      var classNamesLength = classNameEntry.classNames.length; 
      for(var k = 0, className; className = classNameEntry.classNames[k]; k ++) { 
        if(! goog.dom.classes.has(el, className)) { 
          break; 
        } 
        if(k == classNamesLength - 1) { 
          classNameEntry.els.push(el); 
        } 
      } 
    } 
    if(classNameEntry.els.length) { 
      for(var j = 0, el; el = classNameEntry.els[j]; j ++) { 
        if(! goog.dom.classes.has(el, classNameEntry.combinedClassName)) { 
          goog.dom.classes.add(el, classNameEntry.combinedClassName); 
        } 
      } 
    } 
  } 
}; 
