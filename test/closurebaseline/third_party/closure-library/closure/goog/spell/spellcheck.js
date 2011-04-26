
goog.provide('goog.spell.SpellCheck'); 
goog.provide('goog.spell.SpellCheck.WordChangedEvent'); 
goog.require('goog.Timer'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.structs.Set'); 
goog.spell.SpellCheck = function(opt_lookupFunction, opt_language) { 
  goog.events.EventTarget.call(this); 
  this.lookupFunction_ = opt_lookupFunction || null; 
  this.unknownWords_ = new goog.structs.Set(); 
  this.setLanguage(opt_language); 
}; 
goog.inherits(goog.spell.SpellCheck, goog.events.EventTarget); 
goog.spell.SpellCheck.LOOKUP_DELAY_ = 100; 
goog.spell.SpellCheck.EventType = { 
  READY: 'ready', 
  ERROR: 'error', 
  WORD_CHANGED: 'wordchanged' 
}; 
goog.spell.SpellCheck.cache_ = { }; 
goog.spell.SpellCheck.prototype.language_ = ''; 
goog.spell.SpellCheck.prototype.cache_; 
goog.spell.SpellCheck.prototype.queueTimer_ = 0; 
goog.spell.SpellCheck.prototype.lookupInProgress_ = false; 
goog.spell.SpellCheck.WordStatus = { 
  UNKNOWN: 0, 
  VALID: 1, 
  INVALID: 2, 
  IGNORED: 3, 
  CORRECTED: 4 
}; 
goog.spell.SpellCheck.CacheIndex = { 
  STATUS: 0, 
  SUGGESTIONS: 1 
}; 
goog.spell.SpellCheck.WORD_BOUNDARY_CHARS = '\t\r\n\u00A0 !\"#$%&()*+,\-.\/:;<=>?@\[\\\]^_`{|}~'; 
goog.spell.SpellCheck.WORD_BOUNDARY_REGEX = new RegExp('[' + goog.spell.SpellCheck.WORD_BOUNDARY_CHARS + ']'); 
goog.spell.SpellCheck.SPLIT_REGEX = new RegExp('([^' + goog.spell.SpellCheck.WORD_BOUNDARY_CHARS + ']*)' + '([' + goog.spell.SpellCheck.WORD_BOUNDARY_CHARS + ']*)'); 
goog.spell.SpellCheck.prototype.setLookupFunction = function(f) { 
  this.lookupFunction_ = f; 
}; 
goog.spell.SpellCheck.prototype.setLanguage = function(opt_language) { 
  this.language_ = opt_language || ''; 
  if(! goog.spell.SpellCheck.cache_[this.language_]) { 
    goog.spell.SpellCheck.cache_[this.language_]= { }; 
  } 
  this.cache_ = goog.spell.SpellCheck.cache_[this.language_]; 
}; 
goog.spell.SpellCheck.prototype.getLanguage = function() { 
  return this.language_; 
}; 
goog.spell.SpellCheck.prototype.checkBlock = function(text) { 
  var words = text.split(goog.spell.SpellCheck.WORD_BOUNDARY_REGEX); 
  var len = words.length; 
  for(var word, i = 0; i < len; i ++) { 
    word = words[i]; 
    this.checkWord_(word); 
  } 
  if(! this.queueTimer_ && ! this.lookupInProgress_ && this.unknownWords_.getCount()) { 
    this.processPending_(); 
  } else if(this.unknownWords_.getCount() == 0) { 
    this.dispatchEvent(goog.spell.SpellCheck.EventType.READY); 
  } 
}; 
goog.spell.SpellCheck.prototype.checkWord = function(word) { 
  var status = this.checkWord_(word); 
  if(status == goog.spell.SpellCheck.WordStatus.UNKNOWN && ! this.queueTimer_ && ! this.lookupInProgress_) { 
    this.queueTimer_ = goog.Timer.callOnce(this.processPending_, goog.spell.SpellCheck.LOOKUP_DELAY_, this); 
  } 
  return status; 
}; 
goog.spell.SpellCheck.prototype.checkWord_ = function(word) { 
  if(! word) { 
    return goog.spell.SpellCheck.WordStatus.INVALID; 
  } 
  var cacheEntry = this.cache_[word]; 
  if(! cacheEntry) { 
    this.unknownWords_.add(word); 
    return goog.spell.SpellCheck.WordStatus.UNKNOWN; 
  } 
  return cacheEntry[goog.spell.SpellCheck.CacheIndex.STATUS]; 
}; 
goog.spell.SpellCheck.prototype.processPending = function() { 
  if(this.unknownWords_.getCount()) { 
    if(! this.queueTimer_ && ! this.lookupInProgress_) { 
      this.processPending_(); 
    } 
  } else { 
    this.dispatchEvent(goog.spell.SpellCheck.EventType.READY); 
  } 
}; 
goog.spell.SpellCheck.prototype.processPending_ = function() { 
  if(! this.lookupFunction_) { 
    throw Error('No lookup function provided for spell checker.'); 
  } 
  if(this.unknownWords_.getCount()) { 
    this.lookupInProgress_ = true; 
    var func = this.lookupFunction_; 
    func(this.unknownWords_.getValues(), this, this.lookupCallback_); 
  } else { 
    this.dispatchEvent(goog.spell.SpellCheck.EventType.READY); 
  } 
  this.queueTimer_ = 0; 
}; 
goog.spell.SpellCheck.prototype.lookupCallback_ = function(data) { 
  if(data == null) { 
    if(this.queueTimer_) { 
      goog.Timer.clear(this.queueTimer_); 
      this.queueTimer_ = 0; 
    } 
    this.lookupInProgress_ = false; 
    this.dispatchEvent(goog.spell.SpellCheck.EventType.ERROR); 
    return; 
  } 
  for(var a, i = 0; a = data[i]; i ++) { 
    this.setWordStatus_(a[0], a[1], a[2]); 
  } 
  this.lookupInProgress_ = false; 
  if(this.unknownWords_.getCount() == 0) { 
    this.dispatchEvent(goog.spell.SpellCheck.EventType.READY); 
  } else if(! this.queueTimer_) { 
    this.queueTimer_ = goog.Timer.callOnce(this.processPending_, goog.spell.SpellCheck.LOOKUP_DELAY_, this); 
  } 
}; 
goog.spell.SpellCheck.prototype.setWordStatus = function(word, status, opt_suggestions) { 
  this.setWordStatus_(word, status, opt_suggestions); 
}; 
goog.spell.SpellCheck.prototype.setWordStatus_ = function(word, status, opt_suggestions) { 
  var suggestions = opt_suggestions ||[]; 
  this.cache_[word]=[status, suggestions]; 
  this.unknownWords_.remove(word); 
  this.dispatchEvent(new goog.spell.SpellCheck.WordChangedEvent(this, word, status)); 
}; 
goog.spell.SpellCheck.prototype.getSuggestions = function(word) { 
  var cacheEntry = this.cache_[word]; 
  if(! cacheEntry) { 
    this.checkWord(word); 
    return[]; 
  } 
  return cacheEntry[goog.spell.SpellCheck.CacheIndex.STATUS]== goog.spell.SpellCheck.WordStatus.INVALID ? cacheEntry[goog.spell.SpellCheck.CacheIndex.SUGGESTIONS]:[]; 
}; 
goog.spell.SpellCheck.WordChangedEvent = function(target, word, status) { 
  goog.events.Event.call(this, goog.spell.SpellCheck.EventType.WORD_CHANGED, target); 
  this.word = word; 
  this.status = status; 
}; 
goog.inherits(goog.spell.SpellCheck.WordChangedEvent, goog.events.Event); 
