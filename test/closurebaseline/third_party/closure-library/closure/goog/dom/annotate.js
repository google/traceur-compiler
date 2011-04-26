
goog.provide('goog.dom.annotate'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.string'); 
goog.dom.annotate.annotateTerms = function(node, terms, annotateFn, opt_ignoreCase, opt_classesToSkip, opt_maxMs) { 
  var stopTime = opt_maxMs > 0 ? goog.now() + opt_maxMs: 0; 
  return goog.dom.annotate.annotateTermsInNode_(node, terms, annotateFn, opt_ignoreCase, opt_classesToSkip ||[], stopTime, 0); 
}; 
goog.dom.annotate.MAX_RECURSION_ = 200; 
goog.dom.annotate.NODES_TO_SKIP_ =['SCRIPT', 'STYLE', 'TEXTAREA']; 
goog.dom.annotate.annotateTermsInNode_ = function(node, terms, annotateFn, ignoreCase, classesToSkip, stopTime, recursionLevel) { 
  if((stopTime > 0 && goog.now() >= stopTime) || recursionLevel > goog.dom.annotate.MAX_RECURSION_) { 
    return false; 
  } 
  var annotated = false; 
  if(node.nodeType == goog.dom.NodeType.TEXT) { 
    var html = goog.dom.annotate.helpAnnotateText_(node.nodeValue, terms, annotateFn, ignoreCase); 
    if(html != null) { 
      var tempNode = goog.dom.getOwnerDocument(node).createElement('SPAN'); 
      tempNode.innerHTML = html; 
      var parentNode = node.parentNode; 
      var nodeToInsert; 
      while((nodeToInsert = tempNode.firstChild) != null) { 
        parentNode.insertBefore(nodeToInsert, node); 
      } 
      parentNode.removeChild(node); 
      annotated = true; 
    } 
  } else if(node.hasChildNodes() && ! goog.array.contains(goog.dom.annotate.NODES_TO_SKIP_, node.tagName)) { 
    var classes = node.className.split(/\s+/); 
    var skip = goog.array.some(classes, function(className) { 
      return goog.array.contains(classesToSkip, className); 
    }); 
    if(! skip) { 
      ++ recursionLevel; 
      var curNode = node.firstChild; 
      var numTermsAnnotated = 0; 
      while(curNode) { 
        var nextNode = curNode.nextSibling; 
        var curNodeAnnotated = goog.dom.annotate.annotateTermsInNode_(curNode, terms, annotateFn, ignoreCase, classesToSkip, stopTime, recursionLevel); 
        annotated = annotated || curNodeAnnotated; 
        curNode = nextNode; 
      } 
    } 
  } 
  return annotated; 
}; 
goog.dom.annotate.NONWORD_RE_ = /\W/; 
goog.dom.annotate.annotateText = function(text, terms, annotateFn, opt_ignoreCase) { 
  if(opt_ignoreCase) { 
    terms = goog.dom.annotate.lowercaseTerms_(terms); 
  } 
  return goog.dom.annotate.helpAnnotateText_(text, terms, annotateFn, opt_ignoreCase); 
}; 
goog.dom.annotate.helpAnnotateText_ = function(text, terms, annotateFn, ignoreCase) { 
  var hit = false; 
  var resultHtml = null; 
  var textToSearch = ignoreCase ? text.toLowerCase(): text; 
  var textLen = textToSearch.length; 
  var numTerms = terms.length; 
  var termHits = new Array(numTerms); 
  for(var i = 0; i < numTerms; i ++) { 
    var term = terms[i]; 
    var hits =[]; 
    var termText = term[0]; 
    if(termText != '') { 
      var matchWholeWordOnly = term[1]; 
      var termLen = termText.length; 
      var pos = 0; 
      while(pos < textLen) { 
        var hitPos = textToSearch.indexOf(termText, pos); 
        if(hitPos == - 1) { 
          break; 
        } else { 
          var prevCharPos = hitPos - 1; 
          var nextCharPos = hitPos + termLen; 
          if(! matchWholeWordOnly ||((prevCharPos < 0 || goog.dom.annotate.NONWORD_RE_.test(textToSearch.charAt(prevCharPos))) &&(nextCharPos >= textLen || goog.dom.annotate.NONWORD_RE_.test(textToSearch.charAt(nextCharPos))))) { 
            hits.push(hitPos); 
            hit = true; 
          } 
          pos = hitPos + termLen; 
        } 
      } 
    } 
    termHits[i]= hits; 
  } 
  if(hit) { 
    var html =[]; 
    var pos = 0; 
    while(true) { 
      var termIndexOfNextHit; 
      var posOfNextHit = - 1; 
      for(var i = 0; i < numTerms; i ++) { 
        var hits = termHits[i]; 
        if(! goog.array.isEmpty(hits)) { 
          var hitPos = hits[0]; 
          while(hitPos >= 0 && hitPos < pos) { 
            hits.shift(); 
            hitPos = goog.array.isEmpty(hits) ? - 1: hits[0]; 
          } 
          if(hitPos >= 0 &&(posOfNextHit < 0 || hitPos < posOfNextHit)) { 
            termIndexOfNextHit = i; 
            posOfNextHit = hitPos; 
          } 
        } 
      } 
      if(posOfNextHit < 0) break; 
      termHits[termIndexOfNextHit].shift(); 
      html.push(goog.string.htmlEscape(text.substr(pos, posOfNextHit - pos))); 
      var termLen = terms[termIndexOfNextHit][0].length; 
      var termHtml = goog.string.htmlEscape(text.substr(posOfNextHit, termLen)); 
      html.push(annotateFn(termIndexOfNextHit, termHtml)); 
      pos = posOfNextHit + termLen; 
    } 
    html.push(goog.string.htmlEscape(text.substr(pos))); 
    return html.join(''); 
  } else { 
    return null; 
  } 
}; 
goog.dom.annotate.lowercaseTerms_ = function(terms) { 
  var lowercaseTerms =[]; 
  for(var i = 0; i < terms.length; ++ i) { 
    var term = terms[i]; 
    lowercaseTerms[i]=[term[0].toLowerCase(), term[1]]; 
  } 
  return lowercaseTerms; 
}; 
