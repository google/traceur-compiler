
goog.provide('goog.ui.AbstractSpellChecker'); 
goog.provide('goog.ui.AbstractSpellChecker.AsyncResult'); 
goog.require('goog.asserts'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.dom.selection'); 
goog.require('goog.events.EventType'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.spell.SpellCheck'); 
goog.require('goog.structs.Set'); 
goog.require('goog.style'); 
goog.require('goog.ui.MenuItem'); 
goog.require('goog.ui.MenuSeparator'); 
goog.require('goog.ui.PopupMenu'); 
goog.ui.AbstractSpellChecker = function(handler, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.handler_ = handler; 
  this.wordElements_ = { }; 
  this.inputElements_ =[]; 
  this.splitRegex_ = new RegExp('([^' + goog.spell.SpellCheck.WORD_BOUNDARY_CHARS + ']*)' + '([' + goog.spell.SpellCheck.WORD_BOUNDARY_CHARS + ']*)', 'g'); 
  goog.events.listen(this.handler_, goog.spell.SpellCheck.EventType.WORD_CHANGED, this.onWordChanged_, false, this); 
}; 
goog.inherits(goog.ui.AbstractSpellChecker, goog.ui.Component); 
goog.ui.AbstractSpellChecker.KEY_PREFIX_ = ':'; 
goog.ui.AbstractSpellChecker.ID_SUFFIX_ = 'sc'; 
goog.ui.AbstractSpellChecker.ORIGINAL_ = 'goog-spell-original'; 
goog.ui.AbstractSpellChecker.prototype.menu_; 
goog.ui.AbstractSpellChecker.prototype.menuSeparator_; 
goog.ui.AbstractSpellChecker.prototype.menuIgnore_; 
goog.ui.AbstractSpellChecker.prototype.menuEdit_; 
goog.ui.AbstractSpellChecker.prototype.isVisible_ = false; 
goog.ui.AbstractSpellChecker.prototype.correctedWords_; 
goog.ui.AbstractSpellChecker.prototype.suggestionsMenuClassName = goog.getCssName('goog-menu'); 
goog.ui.AbstractSpellChecker.prototype.markCorrected = false; 
goog.ui.AbstractSpellChecker.prototype.activeWord_; 
goog.ui.AbstractSpellChecker.prototype.activeElement_; 
goog.ui.AbstractSpellChecker.prototype.asyncMode_ = false; 
goog.ui.AbstractSpellChecker.prototype.asyncWordsPerBatch_ = 1000; 
goog.ui.AbstractSpellChecker.prototype.asyncText_; 
goog.ui.AbstractSpellChecker.prototype.asyncRangeStart_; 
goog.ui.AbstractSpellChecker.prototype.asyncNode_; 
goog.ui.AbstractSpellChecker.prototype.processedElementsCount_ = 0; 
goog.ui.AbstractSpellChecker.prototype.excludeMarker; 
goog.ui.AbstractSpellChecker.nextId_ = 1; 
goog.ui.AbstractSpellChecker.prototype.getHandler = function() { 
  return this.handler_; 
}; 
goog.ui.AbstractSpellChecker.prototype.setHandler = function(handler) { 
  this.handler_ = handler; 
}; 
goog.ui.AbstractSpellChecker.prototype.setExcludeMarker = function(marker) { 
  this.excludeMarker = marker || undefined; 
}; 
goog.ui.AbstractSpellChecker.prototype.check = function() { 
  this.isVisible_ = true; 
  if(this.markCorrected) { 
    this.correctedWords_ = new goog.structs.Set(); 
  } 
}; 
goog.ui.AbstractSpellChecker.prototype.resume = function() { 
  this.isVisible_ = false; 
  this.wordElements_ = { }; 
  var input; 
  while(input = this.inputElements_.pop()) { 
    input.parentNode.replaceChild(this.getDomHelper().createTextNode(input.value), input); 
  } 
  if(this.correctedWords_) { 
    this.correctedWords_.clear(); 
  } 
}; 
goog.ui.AbstractSpellChecker.prototype.isVisible = function() { 
  return this.isVisible_; 
}; 
goog.ui.AbstractSpellChecker.prototype.ignoreWord = function(word) { 
  this.handler_.setWordStatus(word, goog.spell.SpellCheck.WordStatus.IGNORED); 
}; 
goog.ui.AbstractSpellChecker.prototype.editWord_ = function(el, old) { 
  var input = this.getDomHelper().createDom('input', { 
    'type': 'text', 
    'value': old 
  }); 
  var w = goog.style.getSize(el).width; 
  if(w < 50) { 
    w = 50; 
  } 
  input.style.width = w + 'px'; 
  el.parentNode.replaceChild(input, el); 
  try { 
    input.focus(); 
    goog.dom.selection.setCursorPosition(input, old.length); 
  } catch(o) { } 
  this.inputElements_.push(input); 
}; 
goog.ui.AbstractSpellChecker.prototype.replaceWord = function(el, old, word) { 
  if(old != word) { 
    if(! el.getAttribute(goog.ui.AbstractSpellChecker.ORIGINAL_)) { 
      el.setAttribute(goog.ui.AbstractSpellChecker.ORIGINAL_, old); 
    } 
    goog.dom.setTextContent(el, word); 
    var status = this.handler_.checkWord(word); 
    if(this.markCorrected && this.correctedWords_ && status != goog.spell.SpellCheck.WordStatus.INVALID) { 
      this.correctedWords_.add(word); 
      status = goog.spell.SpellCheck.WordStatus.CORRECTED; 
    } 
    var oldIndex = goog.ui.AbstractSpellChecker.toInternalKey_(old); 
    var newIndex = goog.ui.AbstractSpellChecker.toInternalKey_(word); 
    var elements = this.wordElements_[oldIndex]; 
    goog.array.remove(elements, el); 
    if(status != goog.spell.SpellCheck.WordStatus.VALID) { 
      if(this.wordElements_[newIndex]) { 
        this.wordElements_[newIndex].push(el); 
      } else { 
        this.wordElements_[newIndex]=[el]; 
      } 
    } 
    this.updateElement(el, word, status); 
    this.dispatchEvent(goog.events.EventType.CHANGE); 
  } 
}; 
goog.ui.AbstractSpellChecker.prototype.getSuggestions_ = function() { 
  var suggestions = this.handler_.getSuggestions((this.activeWord_)); 
  if(! suggestions[0]) { 
    var originalWord = this.activeElement_.getAttribute(goog.ui.AbstractSpellChecker.ORIGINAL_); 
    if(originalWord && originalWord != this.activeWord_) { 
      suggestions = this.handler_.getSuggestions(originalWord); 
    } 
  } 
  return suggestions; 
}; 
goog.ui.AbstractSpellChecker.prototype.showSuggestionsMenu = function(el, opt_pos) { 
  this.activeWord_ = goog.dom.getTextContent(el); 
  this.activeElement_ = el; 
  while(this.menu_.getChildAt(0) != this.menuSeparator_) { 
    this.menu_.removeChildAt(0, true).dispose(); 
  } 
  var suggestions = this.getSuggestions_(); 
  for(var suggestion, i = 0; suggestion = suggestions[i]; i ++) { 
    this.menu_.addChildAt(new goog.ui.MenuItem(suggestion, suggestion, this.getDomHelper()), i, true); 
  } 
  if(! suggestions[0]) { 
    var MSG_SPELL_NO_SUGGESTIONS = goog.getMsg('No Suggestions'); 
    var item = new goog.ui.MenuItem(MSG_SPELL_NO_SUGGESTIONS, '', this.getDomHelper()); 
    item.setEnabled(false); 
    this.menu_.addChildAt(item, 0, true); 
  } 
  if(this.markCorrected) { 
    var corrected = this.correctedWords_ && this.correctedWords_.contains(this.activeWord_); 
    this.menuIgnore_.setVisible(! corrected); 
    this.menuEdit_.setVisible(true); 
  } else { 
    this.menuIgnore_.setVisible(true); 
    this.menuEdit_.setVisible(false); 
  } 
  if(opt_pos) { 
    if(!(opt_pos instanceof goog.math.Coordinate)) { 
      var posX = opt_pos.clientX; 
      var posY = opt_pos.clientY; 
      if(this.getElement().contentDocument || this.getElement().contentWindow) { 
        var offset = goog.style.getClientPosition(this.getElement()); 
        posX += offset.x; 
        posY += offset.y; 
      } 
      opt_pos = new goog.math.Coordinate(posX, posY); 
    } 
    this.menu_.showAt(opt_pos.x, opt_pos.y); 
  } else { 
    this.menu_.setVisible(true); 
  } 
}; 
goog.ui.AbstractSpellChecker.prototype.initSuggestionsMenu = function() { 
  this.menu_ = new goog.ui.PopupMenu(this.getDomHelper()); 
  this.menuSeparator_ = new goog.ui.MenuSeparator(this.getDomHelper()); 
  var MSG_SPELL_IGNORE = goog.getMsg('Ignore'); 
  var MSG_SPELL_EDIT_WORD = goog.getMsg('Edit Word'); 
  this.menu_.addChild(this.menuSeparator_, true); 
  this.menuIgnore_ = new goog.ui.MenuItem(MSG_SPELL_IGNORE, '', this.getDomHelper()); 
  this.menu_.addChild(this.menuIgnore_, true); 
  this.menuEdit_ = new goog.ui.MenuItem(MSG_SPELL_EDIT_WORD, '', this.getDomHelper()); 
  this.menuEdit_.setVisible(false); 
  this.menu_.addChild(this.menuEdit_, true); 
  this.menu_.render(); 
  goog.dom.classes.add(this.menu_.getElement(), this.suggestionsMenuClassName); 
  goog.events.listen(this.menu_, goog.ui.Component.EventType.ACTION, this.onCorrectionAction, false, this); 
}; 
goog.ui.AbstractSpellChecker.prototype.onCorrectionAction = function(event) { 
  var word =(this.activeWord_); 
  var el =(this.activeElement_); 
  if(event.target == this.menuIgnore_) { 
    this.ignoreWord(word); 
  } else if(event.target == this.menuEdit_) { 
    this.editWord_(el, word); 
  } else { 
    this.replaceWord(el, word, event.target.getModel()); 
    this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
  } 
  delete this.activeWord_; 
  delete this.activeElement_; 
}; 
goog.ui.AbstractSpellChecker.prototype.removeMarkup = function(el) { 
  var firstChild = el.firstChild; 
  var text = firstChild.nodeValue; 
  if(el.nextSibling && el.nextSibling.nodeType == goog.dom.NodeType.TEXT) { 
    if(el.previousSibling && el.previousSibling.nodeType == goog.dom.NodeType.TEXT) { 
      el.previousSibling.nodeValue = el.previousSibling.nodeValue + text + el.nextSibling.nodeValue; 
      this.getDomHelper().removeNode(el.nextSibling); 
    } else { 
      el.nextSibling.nodeValue = text + el.nextSibling.nodeValue; 
    } 
  } else if(el.previousSibling && el.previousSibling.nodeType == goog.dom.NodeType.TEXT) { 
    el.previousSibling.nodeValue += text; 
  } else { 
    el.parentNode.insertBefore(firstChild, el); 
  } 
  this.getDomHelper().removeNode(el); 
}; 
goog.ui.AbstractSpellChecker.prototype.updateElement = function(el, word, status) { 
  if(this.markCorrected && this.correctedWords_ && this.correctedWords_.contains(word)) { 
    status = goog.spell.SpellCheck.WordStatus.CORRECTED; 
  } 
  if(status == goog.spell.SpellCheck.WordStatus.VALID) { 
    this.removeMarkup(el); 
  } else { 
    goog.dom.setProperties(el, this.getElementProperties(status)); 
  } 
}; 
goog.ui.AbstractSpellChecker.prototype.makeElementId = function(opt_id) { 
  return(opt_id ? opt_id: goog.ui.AbstractSpellChecker.nextId_ ++) + '.' + goog.ui.AbstractSpellChecker.ID_SUFFIX_; 
}; 
goog.ui.AbstractSpellChecker.prototype.getElementById = function(id) { 
  return this.getDomHelper().getElement(this.makeElementId(id)); 
}; 
goog.ui.AbstractSpellChecker.prototype.createWordElement_ = function(word, status) { 
  var parameters = this.getElementProperties(status); 
  if(! parameters['id']) { 
    parameters['id']= this.makeElementId(); 
  } 
  if(! parameters['tabIndex']) { 
    parameters['tabIndex']= - 1; 
  } 
  var el =(this.getDomHelper().createDom('span', parameters, word)); 
  goog.dom.a11y.setRole(el, 'menuitem'); 
  goog.dom.a11y.setState(el, 'haspopup', true); 
  this.registerWordElement_(word, el); 
  return el; 
}; 
goog.ui.AbstractSpellChecker.prototype.registerWordElement_ = function(word, el) { 
  var index = goog.ui.AbstractSpellChecker.toInternalKey_(word); 
  if(this.wordElements_[index]) { 
    this.wordElements_[index].push(el); 
  } else { 
    this.wordElements_[index]=[el]; 
  } 
}; 
goog.ui.AbstractSpellChecker.prototype.getElementProperties = goog.abstractMethod; 
goog.ui.AbstractSpellChecker.prototype.onWordChanged_ = function(event) { 
  var index = goog.ui.AbstractSpellChecker.toInternalKey_(event.word); 
  var elements = this.wordElements_[index]; 
  if(elements) { 
    for(var el, i = 0; el = elements[i]; i ++) { 
      this.updateElement(el, event.word, event.status); 
    } 
  } 
}; 
goog.ui.AbstractSpellChecker.prototype.disposeInternal = function() { 
  if(this.isVisible_) { 
    this.resume(); 
  } 
  goog.events.unlisten(this.handler_, goog.spell.SpellCheck.EventType.WORD_CHANGED, this.onWordChanged_, false, this); 
  if(this.menu_) { 
    this.menu_.dispose(); 
    delete this.menu_; 
    delete this.menuIgnore_; 
    delete this.menuSeparator_; 
  } 
  delete this.handler_; 
  delete this.wordElements_; 
  goog.ui.AbstractSpellChecker.superClass_.disposeInternal.call(this); 
}; 
goog.ui.AbstractSpellChecker.prototype.populateDictionary = function(text, words) { 
  this.splitRegex_.lastIndex = 0; 
  var result; 
  var numScanned = 0; 
  while(result = this.splitRegex_.exec(text)) { 
    if(result[0].length == 0) { 
      break; 
    } 
    var word = result[1]; 
    if(word) { 
      this.handler_.checkWord(word); 
      ++ numScanned; 
      if(numScanned >= words) { 
        break; 
      } 
    } 
  } 
  this.handler_.processPending(); 
  return numScanned; 
}; 
goog.ui.AbstractSpellChecker.prototype.processWord = function(node, text, status) { 
  throw Error('Need to override processWord_ in derivative class'); 
}; 
goog.ui.AbstractSpellChecker.prototype.processRange = function(node, text) { 
  throw Error('Need to override processRange_ in derivative class'); 
}; 
goog.ui.AbstractSpellChecker.prototype.initializeAsyncMode = function() { 
  if(this.asyncMode_ || this.processedElementsCount_ || this.asyncText_ != null || this.asyncNode_) { 
    throw Error('Async mode already in progress.'); 
  } 
  this.asyncMode_ = true; 
  this.processedElementsCount_ = 0; 
  delete this.asyncText_; 
  this.asyncRangeStart_ = 0; 
  delete this.asyncNode_; 
  this.blockReadyEvents(); 
}; 
goog.ui.AbstractSpellChecker.prototype.finishAsyncProcessing = function() { 
  if(! this.asyncMode_ || this.asyncText_ != null || this.asyncNode_) { 
    throw Error('Async mode not started or there is still text to process.'); 
  } 
  this.asyncMode_ = false; 
  this.processedElementsCount_ = 0; 
  this.unblockReadyEvents(); 
  this.handler_.processPending(); 
}; 
goog.ui.AbstractSpellChecker.prototype.blockReadyEvents = function() { 
  goog.events.listen(this.handler_, goog.spell.SpellCheck.EventType.READY, goog.events.Event.stopPropagation, true); 
}; 
goog.ui.AbstractSpellChecker.prototype.unblockReadyEvents = function() { 
  goog.events.unlisten(this.handler_, goog.spell.SpellCheck.EventType.READY, goog.events.Event.stopPropagation, true); 
}; 
goog.ui.AbstractSpellChecker.prototype.processTextAsync = function(node, text) { 
  if(! this.asyncMode_ || this.asyncText_ != null || this.asyncNode_) { 
    throw Error('Not in async mode or previous text has not been processed.'); 
  } 
  this.splitRegex_.lastIndex = 0; 
  var stringSegmentStart = 0; 
  var result; 
  while(result = this.splitRegex_.exec(text)) { 
    if(result[0].length == 0) { 
      break; 
    } 
    var word = result[1]; 
    if(word) { 
      var status = this.handler_.checkWord(word); 
      if(status != goog.spell.SpellCheck.WordStatus.VALID) { 
        var preceedingText = text.substr(stringSegmentStart, result.index - stringSegmentStart); 
        if(preceedingText) { 
          this.processRange(node, preceedingText); 
        } 
        stringSegmentStart = result.index + word.length; 
        this.processWord(node, word, status); 
      } 
    } 
    this.processedElementsCount_ ++; 
    if(this.processedElementsCount_ > this.asyncWordsPerBatch_) { 
      this.asyncText_ = text; 
      this.asyncRangeStart_ = stringSegmentStart; 
      this.asyncNode_ = node; 
      this.processedElementsCount_ = 0; 
      return goog.ui.AbstractSpellChecker.AsyncResult.PENDING; 
    } 
  } 
  var leftoverText = text.substr(stringSegmentStart); 
  if(leftoverText) { 
    this.processRange(node, leftoverText); 
  } 
  return goog.ui.AbstractSpellChecker.AsyncResult.DONE; 
}; 
goog.ui.AbstractSpellChecker.prototype.continueAsyncProcessing = function() { 
  if(! this.asyncMode_ || this.asyncText_ == null || ! this.asyncNode_) { 
    throw Error('Not in async mode or processing not started.'); 
  } 
  var node =(this.asyncNode_); 
  var stringSegmentStart = this.asyncRangeStart_; 
  goog.asserts.assertNumber(stringSegmentStart); 
  var text = this.asyncText_; 
  var result; 
  while(result = this.splitRegex_.exec(text)) { 
    if(result[0].length == 0) { 
      break; 
    } 
    var word = result[1]; 
    if(word) { 
      var status = this.handler_.checkWord(word); 
      if(status != goog.spell.SpellCheck.WordStatus.VALID) { 
        var preceedingText = text.substr(stringSegmentStart, result.index - stringSegmentStart); 
        if(preceedingText) { 
          this.processRange(node, preceedingText); 
        } 
        stringSegmentStart = result.index + word.length; 
        this.processWord(node, word, status); 
      } 
    } 
    this.processedElementsCount_ ++; 
    if(this.processedElementsCount_ > this.asyncWordsPerBatch_) { 
      this.processedElementsCount_ = 0; 
      this.asyncRangeStart_ = stringSegmentStart; 
      return goog.ui.AbstractSpellChecker.AsyncResult.PENDING; 
    } 
  } 
  delete this.asyncText_; 
  this.asyncRangeStart_ = 0; 
  delete this.asyncNode_; 
  var leftoverText = text.substr(stringSegmentStart); 
  if(leftoverText) { 
    this.processRange(node, leftoverText); 
  } 
  return goog.ui.AbstractSpellChecker.AsyncResult.DONE; 
}; 
goog.ui.AbstractSpellChecker.toInternalKey_ = function(word) { 
  if(word in Object.prototype) { 
    return goog.ui.AbstractSpellChecker.KEY_PREFIX_ + word; 
  } 
  return word; 
}; 
goog.ui.AbstractSpellChecker.Direction = { 
  PREVIOUS: 0, 
  NEXT: 1 
}; 
goog.ui.AbstractSpellChecker.AsyncResult = { 
  PENDING: 1, 
  DONE: 2 
}; 
