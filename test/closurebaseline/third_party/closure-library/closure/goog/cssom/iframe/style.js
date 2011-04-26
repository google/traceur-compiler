
goog.provide('goog.cssom.iframe.style'); 
goog.require('goog.cssom'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.classes'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.userAgent'); 
goog.cssom.iframe.style.selectorPartAnchorRegex_ = /a(:(link|visited|active|hover))?/; 
goog.cssom.iframe.style.SELECTOR_DELIMITER_ = ','; 
goog.cssom.iframe.style.SELECTOR_PART_DELIMITER_ = ' '; 
goog.cssom.iframe.style.DECLARATION_START_DELIMITER_ = '{'; 
goog.cssom.iframe.style.DECLARATION_END_DELIMITER_ = '}\n'; 
goog.cssom.iframe.style.CssRuleSet_ = function() { 
  this.declarationText = ''; 
  this.selectors =[]; 
}; 
goog.cssom.iframe.style.CssRuleSet_.prototype.initializeFromCssRule = function(cssRule) { 
  var ruleStyle = cssRule.style; 
  if(! ruleStyle) { 
    return false; 
  } 
  var selector; 
  var declarations; 
  if(ruleStyle &&(selector = cssRule.selectorText) &&(declarations = ruleStyle.cssText)) { 
    if(goog.userAgent.IE) { 
      declarations += '/* */'; 
    } 
  } else if(cssRule.cssText) { 
    var cssSelectorMatch = /([^\{]+)\{/; 
    var endTagMatch = /\}[^\}]*$/g; 
    selector = cssSelectorMatch.exec(cssRule.cssText)[1]; 
    declarations = cssRule.cssText.replace(cssSelectorMatch, '').replace(endTagMatch, ''); 
  } 
  if(selector) { 
    this.setSelectorsFromString(selector); 
    this.declarationText = declarations; 
    return true; 
  } 
  return false; 
}; 
goog.cssom.iframe.style.CssRuleSet_.prototype.setSelectorsFromString = function(selectorsString) { 
  this.selectors =[]; 
  var selectors = selectorsString.split(/,\s*/gm); 
  for(var i = 0; i < selectors.length; i ++) { 
    var selector = selectors[i]; 
    if(selector.length > 0) { 
      this.selectors.push(new goog.cssom.iframe.style.CssSelector_(selector)); 
    } 
  } 
}; 
goog.cssom.iframe.style.CssRuleSet_.prototype.clone = function() { 
  var newRuleSet = new goog.cssom.iframe.style.CssRuleSet_(); 
  newRuleSet.selectors = this.selectors.concat(); 
  newRuleSet.declarationText = this.declarationText; 
  return newRuleSet; 
}; 
goog.cssom.iframe.style.CssRuleSet_.prototype.setDeclarationTextFromObject = function(sourceObject, opt_important) { 
  var stringParts =[]; 
  for(var prop in sourceObject) { 
    var value = sourceObject[prop]; 
    if(value) { 
      stringParts.push(prop, ':', value,(opt_important ? ' !important': ''), ';'); 
    } 
  } 
  this.declarationText = stringParts.join(''); 
}; 
goog.cssom.iframe.style.CssRuleSet_.prototype.writeToArray = function(array) { 
  var selectorCount = this.selectors.length; 
  var matchesAnchorTag = false; 
  for(var i = 0; i < selectorCount; i ++) { 
    var selectorParts = this.selectors[i].parts; 
    var partCount = selectorParts.length; 
    for(var j = 0; j < partCount; j ++) { 
      array.push(selectorParts[j].inputString_, goog.cssom.iframe.style.SELECTOR_PART_DELIMITER_); 
    } 
    if(i <(selectorCount - 1)) { 
      array.push(goog.cssom.iframe.style.SELECTOR_DELIMITER_); 
    } 
    if(goog.userAgent.GECKO && ! goog.userAgent.isVersion('1.9a')) { 
      matchesAnchorTag = matchesAnchorTag || goog.cssom.iframe.style.selectorPartAnchorRegex_.test(selectorParts[partCount - 1].inputString_); 
    } 
  } 
  var declarationText = this.declarationText; 
  if(matchesAnchorTag) { 
    declarationText = goog.cssom.iframe.style.makeColorRuleImportant_(declarationText); 
  } 
  array.push(goog.cssom.iframe.style.DECLARATION_START_DELIMITER_, declarationText, goog.cssom.iframe.style.DECLARATION_END_DELIMITER_); 
}; 
goog.cssom.iframe.style.colorImportantReplaceRegex_ = /(^|;|{)\s*color:([^;]+);/g; 
goog.cssom.iframe.style.makeColorRuleImportant_ = function(cssText) { 
  return cssText.replace(goog.cssom.iframe.style.colorImportantReplaceRegex_, '$1 color: $2 ! important; '); 
}; 
goog.cssom.iframe.style.CssSelector_ = function(opt_selectorString) { 
  this.parts_ =[]; 
  this.ancestryMatchCache_ = { }; 
  if(opt_selectorString) { 
    this.setPartsFromString_(opt_selectorString); 
  } 
}; 
goog.cssom.iframe.style.CssSelector_.prototype.setPartsFromString_ = function(selectorString) { 
  var parts =[]; 
  var selectorPartStrings = selectorString.split(/\s+/gm); 
  for(var i = 0; i < selectorPartStrings.length; i ++) { 
    if(! selectorPartStrings[i]) { 
      continue; 
    } 
    var part = new goog.cssom.iframe.style.CssSelectorPart_(selectorPartStrings[i]); 
    parts.push(part); 
  } 
  this.parts = parts; 
}; 
goog.cssom.iframe.style.CssSelector_.prototype.matchElementAncestry = function(elementAncestry) { 
  var ancestryUid = elementAncestry.uid; 
  if(this.ancestryMatchCache_[ancestryUid]) { 
    return this.ancestryMatchCache_[ancestryUid]; 
  } 
  var elementIndex = 0; 
  var match = null; 
  var selectorPart = null; 
  var lastSelectorPart = null; 
  var ancestorNodes = elementAncestry.nodes; 
  var ancestorNodeCount = ancestorNodes.length; 
  for(var i = 0; i <= this.parts.length; i ++) { 
    selectorPart = this.parts[i]; 
    while(elementIndex < ancestorNodeCount) { 
      var currentElementInfo = ancestorNodes[elementIndex]; 
      if(selectorPart && selectorPart.testElement(currentElementInfo)) { 
        match = { 
          elementIndex: elementIndex, 
          selectorPartIndex: i 
        }; 
        elementIndex ++; 
        break; 
      } else if(lastSelectorPart && lastSelectorPart.testElement(currentElementInfo)) { 
        match = { 
          elementIndex: elementIndex, 
          selectorPartIndex: i - 1 
        }; 
      } 
      elementIndex ++; 
    } 
    lastSelectorPart = selectorPart; 
  } 
  this.ancestryMatchCache_[ancestryUid]= match; 
  return match; 
}; 
goog.cssom.iframe.style.CssSelectorPart_ = function(selectorPartString) { 
  var cacheEntry = goog.cssom.iframe.style.CssSelectorPart_.instances_[selectorPartString]; 
  if(cacheEntry) { 
    return cacheEntry; 
  } 
  var identifiers; 
  if(selectorPartString.match(/[#\.]/)) { 
    identifiers = selectorPartString.split(/(?=[#\.])/); 
  } else { 
    identifiers =[selectorPartString]; 
  } 
  var properties = { }; 
  for(var i = 0; i < identifiers.length; i ++) { 
    var identifier = identifiers[i]; 
    if(identifier.charAt(0) == '.') { 
      properties.className = identifier.substring(1, identifier.length); 
    } else if(identifier.charAt(0) == '#') { 
      properties.id = identifier.substring(1, identifier.length); 
    } else { 
      properties.tagName = identifier.toUpperCase(); 
    } 
  } 
  this.inputString_ = selectorPartString; 
  this.matchProperties_ = properties; 
  this.testedElements_ = { }; 
  goog.cssom.iframe.style.CssSelectorPart_.instances_[selectorPartString]= this; 
}; 
goog.cssom.iframe.style.CssSelectorPart_.instances_ = { }; 
goog.cssom.iframe.style.CssSelectorPart_.prototype.testElement = function(elementInfo) { 
  var elementUid = elementInfo.uid; 
  var cachedMatch = this.testedElements_[elementUid]; 
  if(typeof cachedMatch != 'undefined') { 
    return cachedMatch; 
  } 
  var matchProperties = this.matchProperties_; 
  var testTag = matchProperties.tagName; 
  var testClass = matchProperties.className; 
  var testId = matchProperties.id; 
  var matched = true; 
  if(testTag && testTag != '*' && testTag != elementInfo.nodeName) { 
    matched = false; 
  } else if(testId && testId != elementInfo.id) { 
    matched = false; 
  } else if(testClass && ! elementInfo.classNames[testClass]) { 
    matched = false; 
  } 
  this.testedElements_[elementUid]= matched; 
  return matched; 
}; 
goog.cssom.iframe.style.NodeAncestry_ = function(node) { 
  var nodeUid = goog.getUid(node); 
  var ancestry = goog.cssom.iframe.style.NodeAncestry_.instances_[nodeUid]; 
  if(ancestry) { 
    return ancestry; 
  } 
  var nodes =[]; 
  do { 
    var nodeInfo = { 
      id: node.id, 
      nodeName: node.nodeName 
    }; 
    nodeInfo.uid = goog.getUid(nodeInfo); 
    var className = node.className; 
    var classNamesLookup = { }; 
    if(className) { 
      var classNames = goog.dom.classes.get(node); 
      for(var i = 0; i < classNames.length; i ++) { 
        classNamesLookup[classNames[i]]= 1; 
      } 
    } 
    nodeInfo.classNames = classNamesLookup; 
    nodes.unshift(nodeInfo); 
  } while(node = node.parentNode); 
  this.nodes = nodes; 
  this.uid = goog.getUid(this); 
  goog.cssom.iframe.style.NodeAncestry_.instances_[nodeUid]= this; 
}; 
goog.cssom.iframe.style.NodeAncestry_.instances_ = { }; 
goog.cssom.iframe.style.resetDomCache = function() { 
  goog.cssom.iframe.style.NodeAncestry_.instances_ = { }; 
}; 
goog.cssom.iframe.style.getRuleSetsFromDocument_ = function(doc) { 
  var ruleSets =[]; 
  var styleSheets = goog.cssom.getAllCssStyleSheets(doc.styleSheets); 
  for(var i = 0, styleSheet; styleSheet = styleSheets[i]; i ++) { 
    var domRuleSets = goog.cssom.getCssRulesFromStyleSheet(styleSheet); 
    if(domRuleSets && domRuleSets.length) { 
      for(var j = 0, n = domRuleSets.length; j < n; j ++) { 
        var ruleSet = new goog.cssom.iframe.style.CssRuleSet_(); 
        if(ruleSet.initializeFromCssRule(domRuleSets[j])) { 
          ruleSets.push(ruleSet); 
        } 
      } 
    } 
  } 
  return ruleSets; 
}; 
goog.cssom.iframe.style.ruleSetCache_ = { }; 
goog.cssom.iframe.style.ruleSetCache_.ruleSetCache_ = { }; 
goog.cssom.iframe.style.ruleSetCache_.loadRuleSetsForDocument = function(doc) { 
  var docUid = goog.getUid(doc); 
  goog.cssom.iframe.style.ruleSetCache_.ruleSetCache_[docUid]= goog.cssom.iframe.style.getRuleSetsFromDocument_(doc); 
}; 
goog.cssom.iframe.style.ruleSetCache_.getRuleSetsForDocument = function(doc) { 
  var docUid = goog.getUid(doc); 
  var cache = goog.cssom.iframe.style.ruleSetCache_.ruleSetCache_; 
  if(! cache[docUid]) { 
    goog.cssom.iframe.style.ruleSetCache_.loadRuleSetsForDocument(doc); 
  } 
  var ruleSets = cache[docUid]; 
  var ruleSetsCopy =[]; 
  for(var i = 0; i < ruleSets.length; i ++) { 
    ruleSetsCopy.push(ruleSets[i].clone()); 
  } 
  return ruleSetsCopy; 
}; 
goog.cssom.iframe.style.inheritedProperties_ =['color', 'visibility', 'quotes', 'list-style-type', 'list-style-image', 'list-style-position', 'list-style', 'page-break-inside', 'orphans', 'widows', 'font-family', 'font-style', 'font-variant', 'font-weight', 'text-indent', 'text-align', 'text-transform', 'white-space', 'caption-side', 'border-collapse', 'border-spacing', 'empty-cells', 'cursor']; 
goog.cssom.iframe.style.textProperties_ =['font-family', 'font-size', 'font-weight', 'font-variant', 'font-style', 'color', 'text-align', 'text-decoration', 'text-indent', 'text-transform', 'letter-spacing', 'white-space', 'word-spacing']; 
goog.cssom.iframe.style.getElementContext = function(element, opt_forceRuleSetCacheUpdate, opt_copyBackgroundContext) { 
  var sourceDocument = element.ownerDocument; 
  if(opt_forceRuleSetCacheUpdate) { 
    goog.cssom.iframe.style.ruleSetCache_.loadRuleSetsForDocument(sourceDocument); 
  } 
  var ruleSets = goog.cssom.iframe.style.ruleSetCache_.getRuleSetsForDocument(sourceDocument); 
  var elementAncestry = new goog.cssom.iframe.style.NodeAncestry_(element); 
  var bodySelectorPart = new goog.cssom.iframe.style.CssSelectorPart_('body'); 
  for(var i = 0; i < ruleSets.length; i ++) { 
    var ruleSet = ruleSets[i]; 
    var selectors = ruleSet.selectors; 
    var ruleCount = selectors.length; 
    for(var j = 0; j < ruleCount; j ++) { 
      var selector = selectors[j]; 
      var match = selector.matchElementAncestry(elementAncestry); 
      if(match) { 
        var ruleIndex = match.selectorPartIndex; 
        var selectorParts = selector.parts; 
        var lastSelectorPartIndex = selectorParts.length - 1; 
        var selectorCopy; 
        if(match.elementIndex == elementAncestry.nodes.length - 1 || ruleIndex < lastSelectorPartIndex) { 
          var selectorPartsCopy = selectorParts.concat(); 
          selectorPartsCopy.splice(0, ruleIndex + 1, bodySelectorPart); 
          selectorCopy = new goog.cssom.iframe.style.CssSelector_(); 
          selectorCopy.parts = selectorPartsCopy; 
          selectors.push(selectorCopy); 
        } else if(ruleIndex > 0 && ruleIndex == lastSelectorPartIndex) { 
          selectorCopy = new goog.cssom.iframe.style.CssSelector_(); 
          selectorCopy.parts =[bodySelectorPart, selectorParts[lastSelectorPartIndex]]; 
          selectors.push(selectorCopy); 
        } 
      } 
    } 
  } 
  var defaultPropertiesRuleSet = new goog.cssom.iframe.style.CssRuleSet_(); 
  var declarationParts =[]; 
  var computedStyle = goog.cssom.iframe.style.getComputedStyleObject_(element); 
  var htmlSelector = new goog.cssom.iframe.style.CssSelector_(); 
  htmlSelector.parts =[new goog.cssom.iframe.style.CssSelectorPart_('html')]; 
  defaultPropertiesRuleSet.selectors =[htmlSelector]; 
  var defaultProperties = { }; 
  for(var i = 0, prop; prop = goog.cssom.iframe.style.inheritedProperties_[i]; i ++) { 
    defaultProperties[prop]= computedStyle[goog.string.toCamelCase(prop)]; 
  } 
  defaultPropertiesRuleSet.setDeclarationTextFromObject(defaultProperties); 
  ruleSets.push(defaultPropertiesRuleSet); 
  var bodyRuleSet = new goog.cssom.iframe.style.CssRuleSet_(); 
  var bodySelector = new goog.cssom.iframe.style.CssSelector_(); 
  bodySelector.parts =[new goog.cssom.iframe.style.CssSelectorPart_('body')]; 
  var bodyProperties = { 
    position: 'relative', 
    top: '0', 
    left: '0', 
    right: 'auto', 
    display: 'block', 
    visibility: 'visible' 
  }; 
  for(i = 0, prop; prop = goog.cssom.iframe.style.textProperties_[i]; i ++) { 
    bodyProperties[prop]= computedStyle[goog.string.toCamelCase(prop)]; 
  } 
  if(opt_copyBackgroundContext && goog.cssom.iframe.style.isTransparentValue_(computedStyle['backgroundColor'])) { 
    var bgProperties = goog.cssom.iframe.style.getBackgroundContext(element); 
    bodyProperties['background-color']= bgProperties['backgroundColor']; 
    var elementBgImage = computedStyle['backgroundImage']; 
    if(! elementBgImage || elementBgImage == 'none') { 
      bodyProperties['background-image']= bgProperties['backgroundImage']; 
      bodyProperties['background-repeat']= bgProperties['backgroundRepeat']; 
      bodyProperties['background-position']= bgProperties['backgroundPosition']; 
    } 
  } 
  bodyRuleSet.setDeclarationTextFromObject(bodyProperties, true); 
  bodyRuleSet.selectors =[bodySelector]; 
  ruleSets.push(bodyRuleSet); 
  var ruleSetStrings =[]; 
  ruleCount = ruleSets.length; 
  for(i = 0; i < ruleCount; i ++) { 
    ruleSets[i].writeToArray(ruleSetStrings); 
  } 
  return ruleSetStrings.join(''); 
}; 
goog.cssom.iframe.style.isTransparentValue_ = function(colorValue) { 
  return colorValue == 'transparent' || colorValue == 'rgba(0, 0, 0, 0)'; 
}; 
goog.cssom.iframe.style.getComputedStyleObject_ = function(element) { 
  return element.currentStyle || goog.dom.getOwnerDocument(element).defaultView.getComputedStyle(element, '') || { }; 
}; 
goog.cssom.iframe.style.valueWithUnitsRegEx_ = /^(-?)([0-9]+)([a-z]*|%)/; 
goog.cssom.iframe.style.getBackgroundXYValues_ = function(styleObject) { 
  if(styleObject['backgroundPositionY']) { 
    return[styleObject['backgroundPositionX'], styleObject['backgroundPositionY']]; 
  } else { 
    return(styleObject['backgroundPosition']|| '0 0').split(' '); 
  } 
}; 
goog.cssom.iframe.style.getBackgroundContext = function(element) { 
  var propertyValues = { 'backgroundImage': 'none' }; 
  var ancestor = element; 
  var currentIframeWindow; 
  while((ancestor = ancestor.parentNode) && ancestor.nodeType == goog.dom.NodeType.ELEMENT) { 
    var computedStyle = goog.cssom.iframe.style.getComputedStyleObject_((ancestor)); 
    var backgroundColorValue = computedStyle['backgroundColor']; 
    if(! goog.cssom.iframe.style.isTransparentValue_(backgroundColorValue)) { 
      propertyValues['backgroundColor']= backgroundColorValue; 
    } 
    if(computedStyle['backgroundImage']&& computedStyle['backgroundImage']!= 'none') { 
      propertyValues['backgroundImage']= computedStyle['backgroundImage']; 
      propertyValues['backgroundRepeat']= computedStyle['backgroundRepeat']; 
      var relativePosition; 
      if(currentIframeWindow) { 
        relativePosition = goog.style.getFramedPageOffset(element, currentIframeWindow); 
        var frameElement = currentIframeWindow.frameElement; 
        var iframeRelativePosition = goog.style.getRelativePosition((frameElement),(ancestor)); 
        var iframeBorders = goog.style.getBorderBox(frameElement); 
        relativePosition.x += iframeRelativePosition.x + iframeBorders.left; 
        relativePosition.y += iframeRelativePosition.y + iframeBorders.top; 
      } else { 
        relativePosition = goog.style.getRelativePosition(element,(ancestor)); 
      } 
      var backgroundXYValues = goog.cssom.iframe.style.getBackgroundXYValues_(computedStyle); 
      for(var i = 0; i < 2; i ++) { 
        var positionValue = backgroundXYValues[i]; 
        var coordinate = i == 0 ? 'X': 'Y'; 
        var positionProperty = 'backgroundPosition' + coordinate; 
        var positionValueParts = goog.cssom.iframe.style.valueWithUnitsRegEx_.exec(positionValue); 
        if(positionValueParts) { 
          var value = parseInt(positionValueParts[1]+ positionValueParts[2], 10); 
          var units = positionValueParts[3]; 
          if(value == 0 || units == 'px') { 
            value -=(coordinate == 'X' ? relativePosition.x: relativePosition.y); 
          } 
          positionValue = value + units; 
        } 
        propertyValues[positionProperty]= positionValue; 
      } 
      propertyValues['backgroundPosition']= propertyValues['backgroundPositionX']+ ' ' + propertyValues['backgroundPositionY']; 
    } 
    if(propertyValues['backgroundColor']) { 
      break; 
    } 
    if(ancestor.tagName == goog.dom.TagName.HTML) { 
      try { 
        currentIframeWindow = goog.dom.getWindow((ancestor.parentNode)); 
        ancestor = currentIframeWindow.frameElement; 
        if(! ancestor) { 
          break; 
        } 
      } catch(e) { 
        break; 
      } 
    } 
  } 
  return propertyValues; 
}; 
