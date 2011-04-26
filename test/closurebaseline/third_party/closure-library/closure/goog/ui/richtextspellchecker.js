
goog.provide('goog.ui.RichTextSpellChecker'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.events'); 
goog.require('goog.events.EventType'); 
goog.require('goog.string.StringBuffer'); 
goog.require('goog.ui.AbstractSpellChecker'); 
goog.require('goog.ui.AbstractSpellChecker.AsyncResult'); 
goog.ui.RichTextSpellChecker = function(handler, opt_domHelper) { 
  goog.ui.AbstractSpellChecker.call(this, handler, opt_domHelper); 
  this.workBuffer_ = new goog.string.StringBuffer(); 
  this.boundContinueAsyncFn_ = goog.bind(this.continueAsync_, this); 
}; 
goog.inherits(goog.ui.RichTextSpellChecker, goog.ui.AbstractSpellChecker); 
goog.ui.RichTextSpellChecker.prototype.rootNode_; 
goog.ui.RichTextSpellChecker.prototype.currentNode_; 
goog.ui.RichTextSpellChecker.prototype.elementsInserted_ = 0; 
goog.ui.RichTextSpellChecker.prototype.dictionaryPreScanSize_ = 1000; 
goog.ui.RichTextSpellChecker.prototype.wordClassName = goog.getCssName('goog-spellcheck-word'); 
goog.ui.RichTextSpellChecker.prototype.editorDom_; 
goog.ui.RichTextSpellChecker.prototype.excludeTag; 
goog.ui.RichTextSpellChecker.prototype.invalidWordCssText = 'background: yellow;'; 
goog.ui.RichTextSpellChecker.prototype.createDom = function() { 
  throw Error('Render not supported for goog.ui.RichTextSpellChecker.'); 
}; 
goog.ui.RichTextSpellChecker.prototype.decorateInternal = function(element) { 
  this.setElementInternal(element); 
  if(element.contentDocument || element.contentWindow) { 
    var doc = element.contentDocument || element.contentWindow.document; 
    this.rootNode_ = doc.body; 
    this.editorDom_ = goog.dom.getDomHelper(doc); 
  } else { 
    this.rootNode_ = element; 
    this.editorDom_ = goog.dom.getDomHelper(element); 
  } 
}; 
goog.ui.RichTextSpellChecker.prototype.enterDocument = function() { 
  goog.ui.RichTextSpellChecker.superClass_.enterDocument.call(this); 
  this.initSuggestionsMenu(); 
}; 
goog.ui.RichTextSpellChecker.prototype.check = function() { 
  this.blockReadyEvents(); 
  this.preChargeDictionary_(this.rootNode_, this.dictionaryPreScanSize_); 
  this.unblockReadyEvents(); 
  goog.events.listen(this.handler_, goog.spell.SpellCheck.EventType.READY, this.onDictionaryCharged_, true, this); 
  this.handler_.processPending(); 
}; 
goog.ui.RichTextSpellChecker.prototype.preChargeDictionary_ = function(node, words) { 
  while(node) { 
    var next = this.nextNode_(node); 
    if(this.isExcluded_(node)) { 
      node = next; 
      continue; 
    } 
    if(node.nodeType == goog.dom.NodeType.TEXT) { 
      if(node.nodeValue) { 
        words -= this.populateDictionary(node.nodeValue, words); 
        if(words <= 0) { 
          return; 
        } 
      } 
    } else if(node.nodeType == goog.dom.NodeType.ELEMENT) { 
      if(node.firstChild) { 
        next = node.firstChild; 
      } 
    } 
    node = next; 
  } 
}; 
goog.ui.RichTextSpellChecker.prototype.onDictionaryCharged_ = function(e) { 
  e.stopPropagation(); 
  goog.events.unlisten(this.handler_, goog.spell.SpellCheck.EventType.READY, this.onDictionaryCharged_, true, this); 
  this.wordElements_ = { }; 
  this.initializeAsyncMode(); 
  this.elementsInserted_ = 0; 
  var result = this.processNode_(this.rootNode_); 
  if(result == goog.ui.AbstractSpellChecker.AsyncResult.PENDING) { 
    goog.Timer.callOnce(this.boundContinueAsyncFn_); 
    return; 
  } 
  this.finishAsyncProcessing(); 
  this.finishCheck_(); 
}; 
goog.ui.RichTextSpellChecker.prototype.continueAsync_ = function() { 
  var result = this.continueAsyncProcessing(); 
  if(result == goog.ui.AbstractSpellChecker.AsyncResult.PENDING) { 
    goog.Timer.callOnce(this.boundContinueAsyncFn_); 
    return; 
  } 
  result = this.processNode_(this.currentNode_); 
  if(result == goog.ui.AbstractSpellChecker.AsyncResult.PENDING) { 
    goog.Timer.callOnce(this.boundContinueAsyncFn_); 
    return; 
  } 
  this.finishAsyncProcessing(); 
  this.finishCheck_(); 
}; 
goog.ui.RichTextSpellChecker.prototype.finishCheck_ = function() { 
  delete this.currentNode_; 
  this.handler_.processPending(); 
  if(! this.isVisible_) { 
    goog.events.listen(this.rootNode_, goog.events.EventType.CLICK, this.onWordClick_, false, this); 
  } 
  goog.ui.RichTextSpellChecker.superClass_.check.call(this); 
}; 
goog.ui.RichTextSpellChecker.prototype.nextNode_ = function(node) { 
  while(node != this.rootNode_) { 
    if(node.nextSibling) { 
      return node.nextSibling; 
    } 
    node = node.parentNode; 
  } 
  return null; 
}; 
goog.ui.RichTextSpellChecker.prototype.isTextLeaf_ = function(node) { 
  return node != null && node.nodeType == goog.dom.NodeType.TEXT && ! node.firstChild; 
}; 
goog.ui.RichTextSpellChecker.prototype.setExcludeMarker = function(marker) { 
  var parts = marker.split('.'); 
  this.excludeTag = parts[0]|| undefined; 
  this.excludeMarker = parts[1]|| undefined; 
}; 
goog.ui.RichTextSpellChecker.prototype.isExcluded_ = function(node) { 
  return ! !(this.excludeMarker && node.className && node.className.indexOf(this.excludeMarker) != - 1 &&(! this.excludeTag || node.tagName == this.excludeTag)); 
}; 
goog.ui.RichTextSpellChecker.prototype.processNode_ = function(node) { 
  delete this.currentNode_; 
  while(node) { 
    var next = this.nextNode_(node); 
    if(this.isExcluded_(node)) { 
      node = next; 
      continue; 
    } 
    if(node.nodeType == goog.dom.NodeType.TEXT) { 
      var deleteNode = true; 
      if(node.nodeValue) { 
        var currentElements = this.elementsInserted_; 
        var result = this.processTextAsync(node, node.nodeValue); 
        if(result == goog.ui.AbstractSpellChecker.AsyncResult.PENDING) { 
          node.nodeValue = ''; 
          this.currentNode_ = node; 
          return result; 
        } 
        if(currentElements == this.elementsInserted_) { 
          deleteNode = false; 
        } 
      } 
      if(deleteNode) { 
        goog.dom.removeNode(node); 
      } 
    } else if(node.nodeType == goog.dom.NodeType.ELEMENT) { 
      if(node.className == this.wordClassName) { 
        var runner = node.firstChild; 
        while(runner) { 
          if(this.isTextLeaf_(runner)) { 
            while(this.isTextLeaf_(runner.nextSibling)) { 
              runner.nodeValue += runner.nextSibling.nodeValue; 
              goog.dom.removeNode(runner.nextSibling); 
            } 
          } 
          runner = runner.nextSibling; 
        } 
        if(node.firstChild) { 
          next = node.firstChild; 
          while(node.firstChild) { 
            node.parentNode.insertBefore(node.firstChild, node); 
          } 
        } 
        goog.dom.removeNode(node); 
      } else { 
        if(node.firstChild) { 
          next = node.firstChild; 
        } 
      } 
    } 
    node = next; 
  } 
}; 
goog.ui.RichTextSpellChecker.prototype.processWord = function(node, word, status) { 
  node.parentNode.insertBefore(this.createWordElement_(word, status), node); 
  this.elementsInserted_ ++; 
}; 
goog.ui.RichTextSpellChecker.prototype.processRange = function(node, text) { 
  if(node.nodeType == goog.dom.NodeType.TEXT && node.nodeValue.length == text.length) { 
    return; 
  } 
  node.parentNode.insertBefore(this.editorDom_.createTextNode(text), node); 
  this.elementsInserted_ ++; 
}; 
goog.ui.RichTextSpellChecker.prototype.createWordElement_ = function(word, status) { 
  var parameters = this.getElementProperties(status); 
  var el =(this.editorDom_.createDom('span', parameters, word)); 
  this.registerWordElement_(word, el); 
  return el; 
}; 
goog.ui.RichTextSpellChecker.prototype.updateElement = function(el, word, status) { 
  if(status == goog.spell.SpellCheck.WordStatus.VALID && el != this.currentNode_ && el.nextSibling != this.currentNode_) { 
    this.removeMarkup(el); 
  } else { 
    goog.dom.setProperties(el, this.getElementProperties(status)); 
  } 
}; 
goog.ui.RichTextSpellChecker.prototype.resume = function() { 
  goog.ui.RichTextSpellChecker.superClass_.resume.call(this); 
  this.restoreNode_(this.rootNode_); 
  goog.events.unlisten(this.rootNode_, goog.events.EventType.CLICK, this.onWordClick_, false, this); 
}; 
goog.ui.RichTextSpellChecker.prototype.restoreNode_ = function(node) { 
  while(node) { 
    if(this.isExcluded_(node)) { 
      node = node.nextSibling; 
      continue; 
    } 
    if(node.nodeType == goog.dom.NodeType.ELEMENT && node.className == this.wordClassName) { 
      var firstElement = node.firstChild; 
      var next; 
      for(var child = firstElement; child; child = next) { 
        next = child.nextSibling; 
        node.parentNode.insertBefore(child, node); 
      } 
      next = firstElement || node.nextSibling; 
      goog.dom.removeNode(node); 
      node = next; 
      continue; 
    } 
    var textLeaf = this.isTextLeaf_(node); 
    if(textLeaf) { 
      var textNodes = 1; 
      var next = node.nextSibling; 
      while(this.isTextLeaf_(node.previousSibling)) { 
        node = node.previousSibling; 
        ++ textNodes; 
      } 
      while(this.isTextLeaf_(next)) { 
        next = next.nextSibling; 
        ++ textNodes; 
      } 
      if(textNodes > 1) { 
        this.workBuffer_.append(node.nodeValue); 
        while(this.isTextLeaf_(node.nextSibling)) { 
          this.workBuffer_.append(node.nextSibling.nodeValue); 
          goog.dom.removeNode(node.nextSibling); 
        } 
        node.nodeValue = this.workBuffer_.toString(); 
        this.workBuffer_.clear(); 
      } 
    } 
    if(node.firstChild) { 
      this.restoreNode_(node.firstChild); 
    } 
    node = node.nextSibling; 
  } 
}; 
goog.ui.RichTextSpellChecker.prototype.getElementProperties = function(status) { 
  return { 
    'class': this.wordClassName, 
    'style':(status == goog.spell.SpellCheck.WordStatus.INVALID) ? this.invalidWordCssText: '' 
  }; 
}; 
goog.ui.RichTextSpellChecker.prototype.onWordClick_ = function(event) { 
  var target =(event.target); 
  if(event.target.className == this.wordClassName && this.handler_.checkWord(goog.dom.getTextContent(target)) == goog.spell.SpellCheck.WordStatus.INVALID) { 
    this.showSuggestionsMenu(target, event); 
    event.stopPropagation(); 
  } 
}; 
goog.ui.RichTextSpellChecker.prototype.disposeInternal = function() { 
  goog.ui.RichTextSpellChecker.superClass_.disposeInternal.call(this); 
  this.rootNode_ = null; 
  this.editorDom_ = null; 
}; 
