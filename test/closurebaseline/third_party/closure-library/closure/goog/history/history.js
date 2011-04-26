
goog.provide('goog.History'); 
goog.provide('goog.History.Event'); 
goog.provide('goog.History.EventType'); 
goog.require('goog.Timer'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.history.Event'); 
goog.require('goog.history.EventType'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
goog.History = function(opt_invisible, opt_blankPageUrl, opt_input, opt_iframe) { 
  goog.events.EventTarget.call(this); 
  if(opt_invisible && ! opt_blankPageUrl) { 
    throw Error('Can\'t use invisible history without providing a blank page.'); 
  } 
  var input; 
  if(opt_input) { 
    input = opt_input; 
  } else { 
    var inputId = 'history_state' + goog.History.historyCount_; 
    document.write(goog.string.subs(goog.History.INPUT_TEMPLATE_, inputId, inputId)); 
    input = goog.dom.getElement(inputId); 
  } 
  this.hiddenInput_ =(input); 
  this.window_ = opt_input ? goog.dom.getWindow(goog.dom.getOwnerDocument(opt_input)): window; 
  this.baseUrl_ = this.window_.location.href.split('#')[0]+ '#'; 
  this.iframeSrc_ = opt_blankPageUrl; 
  if(goog.userAgent.IE && ! opt_blankPageUrl) { 
    this.iframeSrc_ = window.location.protocol == 'https' ? 'https:///': 'javascript:""'; 
  } 
  this.timer_ = new goog.Timer(goog.History.PollingType.NORMAL); 
  this.userVisible_ = ! opt_invisible; 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  if(opt_invisible || goog.userAgent.IE && ! goog.History.HAS_ONHASHCHANGE) { 
    var iframe; 
    if(opt_iframe) { 
      iframe = opt_iframe; 
    } else { 
      var iframeId = 'history_iframe' + goog.History.historyCount_; 
      var srcAttribute = this.iframeSrc_ ? 'src="' + goog.string.htmlEscape(this.iframeSrc_) + '"': ''; 
      document.write(goog.string.subs(goog.History.IFRAME_TEMPLATE_, iframeId, srcAttribute)); 
      iframe = goog.dom.getElement(iframeId); 
    } 
    this.iframe_ =(iframe); 
    this.unsetIframe_ = true; 
  } 
  if(goog.userAgent.IE && ! goog.History.HAS_ONHASHCHANGE) { 
    this.eventHandler_.listen(this.window_, goog.events.EventType.LOAD, this.onDocumentLoaded); 
    this.documentLoaded = false; 
    this.shouldEnable_ = false; 
  } 
  if(this.userVisible_) { 
    this.setHash_(this.getToken(), true); 
  } else { 
    this.setIframeToken_(this.hiddenInput_.value); 
  } 
  goog.History.historyCount_ ++; 
}; 
goog.inherits(goog.History, goog.events.EventTarget); 
goog.History.prototype.enabled_ = false; 
goog.History.prototype.longerPolling_ = false; 
goog.History.prototype.lastToken_ = null; 
goog.History.HAS_ONHASHCHANGE = goog.userAgent.IE && document.documentMode >= 8 || goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.2') || goog.userAgent.WEBKIT && goog.userAgent.isVersion('532.1'); 
goog.History.prototype.lockedToken_ = null; 
goog.History.prototype.disposeInternal = function() { 
  goog.History.superClass_.disposeInternal.call(this); 
  this.eventHandler_.dispose(); 
  this.setEnabled(false); 
}; 
goog.History.prototype.setEnabled = function(enable) { 
  if(enable == this.enabled_) { 
    return; 
  } 
  if(goog.userAgent.IE && ! goog.History.HAS_ONHASHCHANGE && ! this.documentLoaded) { 
    this.shouldEnable_ = enable; 
    return; 
  } 
  if(enable) { 
    if(goog.userAgent.OPERA) { 
      this.eventHandler_.listen(this.window_.document, goog.History.INPUT_EVENTS_, this.operaDefibrillator_); 
    } else if(goog.userAgent.GECKO) { 
      this.eventHandler_.listen(this.window_, 'pageshow', this.onShow_); 
    } 
    if(goog.History.HAS_ONHASHCHANGE && this.userVisible_) { 
      this.eventHandler_.listen(this.window_, goog.events.EventType.HASHCHANGE, this.onHashChange_); 
      this.enabled_ = true; 
      this.dispatchEvent(new goog.history.Event(this.getToken(), false)); 
    } else if(! goog.userAgent.IE || this.documentLoaded) { 
      this.eventHandler_.listen(this.timer_, goog.Timer.TICK, goog.bind(this.check_, this, true)); 
      this.enabled_ = true; 
      if(! goog.userAgent.IE) { 
        this.lastToken_ = this.getToken(); 
      } 
      this.timer_.start(); 
      this.dispatchEvent(new goog.history.Event(this.getToken(), false)); 
    } 
  } else { 
    this.enabled_ = false; 
    this.eventHandler_.removeAll(); 
    this.timer_.stop(); 
  } 
}; 
goog.History.prototype.onDocumentLoaded = function() { 
  this.documentLoaded = true; 
  if(this.hiddenInput_.value) { 
    this.setIframeToken_(this.hiddenInput_.value, true); 
  } 
  this.setEnabled(this.shouldEnable_); 
}; 
goog.History.prototype.onShow_ = function(e) { 
  if(e.getBrowserEvent()['persisted']) { 
    this.setEnabled(false); 
    this.setEnabled(true); 
  } 
}; 
goog.History.prototype.onHashChange_ = function(e) { 
  var hash = this.getLocationFragment_(this.window_); 
  if(hash != this.lastToken_) { 
    this.update_(hash, true); 
  } 
}; 
goog.History.prototype.getToken = function() { 
  if(this.lockedToken_ != null) { 
    return this.lockedToken_; 
  } else if(this.userVisible_) { 
    return this.getLocationFragment_(this.window_); 
  } else { 
    return this.getIframeToken_() || ''; 
  } 
}; 
goog.History.prototype.setToken = function(token, opt_title) { 
  this.setHistoryState_(token, false, opt_title); 
}; 
goog.History.prototype.replaceToken = function(token, opt_title) { 
  this.setHistoryState_(token, true, opt_title); 
}; 
goog.History.prototype.getLocationFragment_ = function(win) { 
  var loc = win.location.href; 
  var index = loc.indexOf('#'); 
  return index < 0 ? '': loc.substring(index + 1); 
}; 
goog.History.prototype.setHistoryState_ = function(token, replace, opt_title) { 
  if(this.getToken() != token) { 
    if(this.userVisible_) { 
      this.setHash_(token, replace); 
      if(! goog.History.HAS_ONHASHCHANGE) { 
        if(goog.userAgent.IE) { 
          this.setIframeToken_(token, replace, opt_title); 
        } 
      } 
      if(this.enabled_) { 
        this.check_(false); 
      } 
    } else { 
      this.setIframeToken_(token, replace); 
      this.lockedToken_ = this.lastToken_ = this.hiddenInput_.value = token; 
      this.dispatchEvent(new goog.history.Event(token, false)); 
    } 
  } 
}; 
goog.History.prototype.setHash_ = function(hash, opt_replace) { 
  var url = this.baseUrl_ +(hash || ''); 
  var loc = this.window_.location; 
  if(url != loc.href) { 
    if(opt_replace) { 
      loc.replace(url); 
    } else { 
      loc.href = url; 
    } 
  } 
}; 
goog.History.prototype.setIframeToken_ = function(token, opt_replace, opt_title) { 
  if(this.unsetIframe_ || token != this.getIframeToken_()) { 
    this.unsetIframe_ = false; 
    token = goog.string.urlEncode(token); 
    if(goog.userAgent.IE) { 
      var doc = goog.dom.getFrameContentDocument(this.iframe_); 
      doc.open('text/html', opt_replace ? 'replace': undefined); 
      doc.write(goog.string.subs(goog.History.IFRAME_SOURCE_TEMPLATE_, goog.string.htmlEscape((opt_title || this.window_.document.title)), token)); 
      doc.close(); 
    } else { 
      var url = this.iframeSrc_ + '#' + token; 
      var contentWindow = this.iframe_.contentWindow; 
      if(contentWindow) { 
        if(opt_replace) { 
          contentWindow.location.replace(url); 
        } else { 
          contentWindow.location.href = url; 
        } 
      } 
    } 
  } 
}; 
goog.History.prototype.getIframeToken_ = function() { 
  if(goog.userAgent.IE) { 
    var doc = goog.dom.getFrameContentDocument(this.iframe_); 
    return doc.body ? goog.string.urlDecode(doc.body.innerHTML): null; 
  } else { 
    var contentWindow = this.iframe_.contentWindow; 
    if(contentWindow) { 
      var hash; 
      try { 
        hash = goog.string.urlDecode(this.getLocationFragment_(contentWindow)); 
      } catch(e) { 
        if(! this.longerPolling_) { 
          this.setLongerPolling_(true); 
        } 
        return null; 
      } 
      if(this.longerPolling_) { 
        this.setLongerPolling_(false); 
      } 
      return hash || null; 
    } else { 
      return null; 
    } 
  } 
}; 
goog.History.prototype.check_ = function(isNavigation) { 
  if(this.userVisible_) { 
    var hash = this.getLocationFragment_(this.window_); 
    if(hash != this.lastToken_) { 
      this.update_(hash, isNavigation); 
    } 
  } 
  if(! this.userVisible_ || goog.userAgent.IE && ! goog.History.HAS_ONHASHCHANGE) { 
    var token = this.getIframeToken_() || ''; 
    if(this.lockedToken_ == null || token == this.lockedToken_) { 
      this.lockedToken_ = null; 
      if(token != this.lastToken_) { 
        this.update_(token, isNavigation); 
      } 
    } 
  } 
}; 
goog.History.prototype.update_ = function(token, isNavigation) { 
  this.lastToken_ = this.hiddenInput_.value = token; 
  if(this.userVisible_) { 
    if(goog.userAgent.IE && ! goog.History.HAS_ONHASHCHANGE) { 
      this.setIframeToken_(token); 
    } 
    this.setHash_(token); 
  } else { 
    this.setIframeToken_(token); 
  } 
  this.dispatchEvent(new goog.history.Event(this.getToken(), isNavigation)); 
}; 
goog.History.prototype.setLongerPolling_ = function(longerPolling) { 
  if(this.longerPolling_ != longerPolling) { 
    this.timer_.setInterval(longerPolling ? goog.History.PollingType.LONG: goog.History.PollingType.NORMAL); 
  } 
  this.longerPolling_ = longerPolling; 
}; 
goog.History.prototype.operaDefibrillator_ = function() { 
  this.timer_.stop(); 
  this.timer_.start(); 
}; 
goog.History.INPUT_EVENTS_ =[goog.events.EventType.MOUSEDOWN, goog.events.EventType.KEYDOWN, goog.events.EventType.MOUSEMOVE]; 
goog.History.IFRAME_SOURCE_TEMPLATE_ = '<title>%s</title><body>%s</body>'; 
goog.History.IFRAME_TEMPLATE_ = '<iframe id="%s" style="display:none" %s></iframe>'; 
goog.History.INPUT_TEMPLATE_ = '<input type="text" name="%s" id="%s" style="display:none" />'; 
goog.History.historyCount_ = 0; 
goog.History.PollingType = { 
  NORMAL: 150, 
  LONG: 10000 
}; 
goog.History.EventType = goog.history.EventType; 
goog.History.Event = goog.history.Event; 
