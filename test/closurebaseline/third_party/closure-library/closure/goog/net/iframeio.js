
goog.provide('goog.net.IframeIo'); 
goog.provide('goog.net.IframeIo.IncrementalDataEvent'); 
goog.require('goog.Timer'); 
goog.require('goog.Uri'); 
goog.require('goog.debug'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.json'); 
goog.require('goog.net.ErrorCode'); 
goog.require('goog.net.EventType'); 
goog.require('goog.net.xhrMonitor'); 
goog.require('goog.reflect'); 
goog.require('goog.string'); 
goog.require('goog.structs'); 
goog.require('goog.userAgent'); 
goog.net.IframeIo = function() { 
  this.name_ = goog.net.IframeIo.getNextName_(); 
  this.iframesForDisposal_ =[]; 
  goog.net.IframeIo.instances_[this.name_]= this; 
}; 
goog.inherits(goog.net.IframeIo, goog.events.EventTarget); 
goog.net.IframeIo.instances_ = { }; 
goog.net.IframeIo.FRAME_NAME_PREFIX = 'closure_frame'; 
goog.net.IframeIo.INNER_FRAME_SUFFIX = '_inner'; 
goog.net.IframeIo.IFRAME_DISPOSE_DELAY_MS = 2000; 
goog.net.IframeIo.counter_ = 0; 
goog.net.IframeIo.form_; 
goog.net.IframeIo.send = function(uri, opt_callback, opt_method, opt_noCache, opt_data) { 
  var io = new goog.net.IframeIo(); 
  goog.events.listen(io, goog.net.EventType.READY, io.dispose, false, io); 
  if(opt_callback) { 
    goog.events.listen(io, goog.net.EventType.COMPLETE, opt_callback); 
  } 
  io.send(uri, opt_method, opt_noCache, opt_data); 
}; 
goog.net.IframeIo.getIframeByName = function(fname) { 
  return window.frames[fname]; 
}; 
goog.net.IframeIo.getInstanceByName = function(fname) { 
  return goog.net.IframeIo.instances_[fname]; 
}; 
goog.net.IframeIo.handleIncrementalData = function(win, data) { 
  var iframeName = goog.string.endsWith(win.name, goog.net.IframeIo.INNER_FRAME_SUFFIX) ? win.parent.name: win.name; 
  var iframeIoName = iframeName.substring(0, iframeName.lastIndexOf('_')); 
  var iframeIo = goog.net.IframeIo.getInstanceByName(iframeIoName); 
  if(iframeIo && iframeName == iframeIo.iframeName_) { 
    iframeIo.handleIncrementalData_(data); 
  } else { 
    goog.debug.Logger.getLogger('goog.net.IframeIo').info('Incremental iframe data routed for unknown iframe'); 
  } 
}; 
goog.net.IframeIo.getNextName_ = function() { 
  return goog.net.IframeIo.FRAME_NAME_PREFIX + goog.net.IframeIo.counter_ ++; 
}; 
goog.net.IframeIo.getForm_ = function() { 
  if(! goog.net.IframeIo.form_) { 
    goog.net.IframeIo.form_ =(goog.dom.createDom('form')); 
    goog.net.IframeIo.form_.acceptCharset = 'utf-8'; 
    var s = goog.net.IframeIo.form_.style; 
    s.position = 'absolute'; 
    s.visibility = 'hidden'; 
    s.top = s.left = '-10px'; 
    s.width = s.height = '10px'; 
    s.overflow = 'hidden'; 
    goog.dom.getDocument().body.appendChild(goog.net.IframeIo.form_); 
  } 
  return goog.net.IframeIo.form_; 
}; 
goog.net.IframeIo.addFormInputs_ = function(form, data) { 
  goog.structs.forEach(data, function(value, key) { 
    var inp = goog.dom.createDom('input', { 
      'type': 'hidden', 
      'name': key, 
      'value': value 
    }); 
    form.appendChild(inp); 
  }); 
}; 
goog.net.IframeIo.prototype.logger_ = goog.debug.Logger.getLogger('goog.net.IframeIo'); 
goog.net.IframeIo.prototype.form_ = null; 
goog.net.IframeIo.prototype.iframe_ = null; 
goog.net.IframeIo.prototype.iframeName_ = null; 
goog.net.IframeIo.prototype.nextIframeId_ = 0; 
goog.net.IframeIo.prototype.active_ = false; 
goog.net.IframeIo.prototype.complete_ = false; 
goog.net.IframeIo.prototype.success_ = false; 
goog.net.IframeIo.prototype.lastUri_ = null; 
goog.net.IframeIo.prototype.lastContent_ = null; 
goog.net.IframeIo.prototype.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR; 
goog.net.IframeIo.prototype.timeoutInterval_ = 0; 
goog.net.IframeIo.prototype.timeoutId_ = null; 
goog.net.IframeIo.prototype.firefoxSilentErrorTimeout_ = null; 
goog.net.IframeIo.prototype.iframeDisposalTimer_ = null; 
goog.net.IframeIo.prototype.errorHandled_; 
goog.net.IframeIo.prototype.send = function(uri, opt_method, opt_noCache, opt_data) { 
  if(this.active_) { 
    throw Error('[goog.net.IframeIo] Unable to send, already active.'); 
  } 
  var uriObj = new goog.Uri(uri); 
  this.lastUri_ = uriObj; 
  var method = opt_method ? opt_method.toUpperCase(): 'GET'; 
  if(opt_noCache) { 
    uriObj.makeUnique(); 
  } 
  this.logger_.info('Sending iframe request: ' + uriObj + ' [' + method + ']'); 
  this.form_ = goog.net.IframeIo.getForm_(); 
  if(method == 'GET') { 
    goog.net.IframeIo.addFormInputs_(this.form_, uriObj.getQueryData()); 
  } 
  if(opt_data) { 
    goog.net.IframeIo.addFormInputs_(this.form_, opt_data); 
  } 
  this.form_.action = uriObj.toString(); 
  this.form_.method = method; 
  this.sendFormInternal_(); 
}; 
goog.net.IframeIo.prototype.sendFromForm = function(form, opt_uri, opt_noCache) { 
  if(this.active_) { 
    throw Error('[goog.net.IframeIo] Unable to send, already active.'); 
  } 
  var uri = new goog.Uri(opt_uri || form.action); 
  if(opt_noCache) { 
    uri.makeUnique(); 
  } 
  this.logger_.info('Sending iframe request from form: ' + uri); 
  this.lastUri_ = uri; 
  this.form_ = form; 
  this.form_.action = uri.toString(); 
  this.sendFormInternal_(); 
}; 
goog.net.IframeIo.prototype.abort = function(opt_failureCode) { 
  if(this.active_) { 
    this.logger_.info('Request aborted'); 
    goog.events.removeAll(this.getRequestIframe_()); 
    this.complete_ = false; 
    this.active_ = false; 
    this.success_ = false; 
    this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT; 
    this.dispatchEvent(goog.net.EventType.ABORT); 
    this.makeReady_(); 
  } 
}; 
goog.net.IframeIo.prototype.disposeInternal = function() { 
  this.logger_.fine('Disposing iframeIo instance'); 
  if(this.active_) { 
    this.logger_.fine('Aborting active request'); 
    this.abort(); 
  } 
  goog.net.IframeIo.superClass_.disposeInternal.call(this); 
  if(this.iframe_) { 
    this.scheduleIframeDisposal_(); 
  } 
  this.disposeForm_(); 
  delete this.errorChecker_; 
  this.form_ = null; 
  this.lastCustomError_ = this.lastContent_ = this.lastContentHtml_ = null; 
  this.lastUri_ = null; 
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR; 
  delete goog.net.IframeIo.instances_[this.name_]; 
}; 
goog.net.IframeIo.prototype.isComplete = function() { 
  return this.complete_; 
}; 
goog.net.IframeIo.prototype.isSuccess = function() { 
  return this.success_; 
}; 
goog.net.IframeIo.prototype.isActive = function() { 
  return this.active_; 
}; 
goog.net.IframeIo.prototype.getResponseText = function() { 
  return this.lastContent_; 
}; 
goog.net.IframeIo.prototype.getResponseHtml = function() { 
  return this.lastContentHtml_; 
}; 
goog.net.IframeIo.prototype.getResponseJson = function() { 
  return goog.json.parse(this.lastContent_); 
}; 
goog.net.IframeIo.prototype.getResponseXml = function() { 
  if(! this.iframe_) return null; 
  return this.getContentDocument_(); 
}; 
goog.net.IframeIo.prototype.getLastUri = function() { 
  return this.lastUri_; 
}; 
goog.net.IframeIo.prototype.getLastErrorCode = function() { 
  return this.lastErrorCode_; 
}; 
goog.net.IframeIo.prototype.getLastError = function() { 
  return goog.net.ErrorCode.getDebugMessage(this.lastErrorCode_); 
}; 
goog.net.IframeIo.prototype.getLastCustomError = function() { 
  return this.lastCustomError_; 
}; 
goog.net.IframeIo.prototype.setErrorChecker = function(fn) { 
  this.errorChecker_ = fn; 
}; 
goog.net.IframeIo.prototype.getErrorChecker = function() { 
  return this.errorChecker_; 
}; 
goog.net.IframeIo.prototype.getTimeoutInterval = function() { 
  return this.timeoutInterval_; 
}; 
goog.net.IframeIo.prototype.setTimeoutInterval = function(ms) { 
  this.timeoutInterval_ = Math.max(0, ms); 
}; 
goog.net.IframeIo.prototype.dispatchEvent = function(e) { 
  if(this.iframe_) { 
    goog.net.xhrMonitor.pushContext(this.iframe_); 
  } 
  try { 
    return goog.net.IframeIo.superClass_.dispatchEvent.call(this, e); 
  } finally { 
    if(this.iframe_) { 
      goog.net.xhrMonitor.popContext(); 
    } 
    return true; 
  } 
}; 
goog.net.IframeIo.prototype.sendFormInternal_ = function() { 
  this.active_ = true; 
  this.complete_ = false; 
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR; 
  this.createIframe_(); 
  if(goog.userAgent.IE) { 
    this.form_.target = this.iframeName_ || ''; 
    this.appendIframe_(); 
    goog.events.listen(this.iframe_, goog.events.EventType.READYSTATECHANGE, this.onIeReadyStateChange_, false, this); 
    try { 
      this.errorHandled_ = false; 
      this.form_.submit(); 
    } catch(e) { 
      goog.events.unlisten(this.iframe_, goog.events.EventType.READYSTATECHANGE, this.onIeReadyStateChange_, false, this); 
      this.handleError_(goog.net.ErrorCode.ACCESS_DENIED); 
    } 
  } else { 
    this.logger_.fine('Setting up iframes and cloning form'); 
    this.appendIframe_(); 
    var innerFrameName = this.iframeName_ + goog.net.IframeIo.INNER_FRAME_SUFFIX; 
    var doc = goog.dom.getFrameContentDocument(this.iframe_); 
    var html = '<body><iframe id=' + innerFrameName + ' name=' + innerFrameName + '></iframe>'; 
    if(document.baseURI) { 
      html = '<head><base href="' + goog.string.htmlEscape(document.baseURI) + '"></head>' + html; 
    } 
    if(goog.userAgent.OPERA) { 
      doc.documentElement.innerHTML = html; 
    } else { 
      doc.write(html); 
    } 
    goog.events.listen(doc.getElementById(innerFrameName), goog.events.EventType.LOAD, this.onIframeLoaded_, false, this); 
    var textareas = this.form_.getElementsByTagName('textarea'); 
    for(var i = 0, n = textareas.length; i < n; i ++) { 
      var value = textareas[i].value; 
      if(goog.dom.getRawTextContent(textareas[i]) != value) { 
        goog.dom.setTextContent(textareas[i], value); 
        textareas[i].value = value; 
      } 
    } 
    var clone = doc.importNode(this.form_, true); 
    clone.target = innerFrameName; 
    clone.action = this.form_.action; 
    doc.body.appendChild(clone); 
    var selects = this.form_.getElementsByTagName('select'); 
    var clones = clone.getElementsByTagName('select'); 
    for(var i = 0, n = selects.length; i < n; i ++) { 
      clones[i].selectedIndex = selects[i].selectedIndex; 
    } 
    var inputs = this.form_.getElementsByTagName('input'); 
    var inputClones = clone.getElementsByTagName('input'); 
    for(var i = 0, n = inputs.length; i < n; i ++) { 
      if(inputs[i].type == 'file') { 
        if(inputs[i].value != inputClones[i].value) { 
          this.logger_.fine('File input value not cloned properly.  Will ' + 'submit using original form.'); 
          this.form_.target = innerFrameName; 
          clone = this.form_; 
          break; 
        } 
      } 
    } 
    this.logger_.fine('Submitting form'); 
    try { 
      this.errorHandled_ = false; 
      clone.submit(); 
      doc.close(); 
      if(goog.userAgent.GECKO) { 
        this.firefoxSilentErrorTimeout_ = goog.Timer.callOnce(this.testForFirefoxSilentError_, 250, this); 
      } 
    } catch(e) { 
      this.logger_.severe('Error when submitting form: ' + goog.debug.exposeException(e)); 
      goog.events.unlisten(doc.getElementById(innerFrameName), goog.events.EventType.LOAD, this.onIframeLoaded_, false, this); 
      doc.close(); 
      this.handleError_(goog.net.ErrorCode.FILE_NOT_FOUND); 
    } 
  } 
}; 
goog.net.IframeIo.prototype.onIeReadyStateChange_ = function(e) { 
  if(this.iframe_.readyState == 'complete') { 
    goog.events.unlisten(this.iframe_, goog.events.EventType.READYSTATECHANGE, this.onIeReadyStateChange_, false, this); 
    var doc; 
    try { 
      doc = goog.dom.getFrameContentDocument(this.iframe_); 
      if(goog.userAgent.IE && doc.location == 'about:blank' && ! navigator.onLine) { 
        this.handleError_(goog.net.ErrorCode.OFFLINE); 
        return; 
      } 
    } catch(ex) { 
      this.handleError_(goog.net.ErrorCode.ACCESS_DENIED); 
      return; 
    } 
    this.handleLoad_((doc)); 
  } 
}; 
goog.net.IframeIo.prototype.onIframeLoaded_ = function(e) { 
  if(goog.userAgent.OPERA && this.getContentDocument_().location == 'about:blank') { 
    return; 
  } 
  goog.events.unlisten(this.getRequestIframe_(), goog.events.EventType.LOAD, this.onIframeLoaded_, false, this); 
  this.handleLoad_(this.getContentDocument_()); 
}; 
goog.net.IframeIo.prototype.handleLoad_ = function(contentDocument) { 
  this.logger_.fine('Iframe loaded'); 
  this.complete_ = true; 
  this.active_ = false; 
  var errorCode; 
  try { 
    var body = contentDocument.body; 
    this.lastContent_ = body.textContent || body.innerText; 
    this.lastContentHtml_ = body.innerHTML; 
  } catch(ex) { 
    errorCode = goog.net.ErrorCode.ACCESS_DENIED; 
  } 
  var customError; 
  if(! errorCode && typeof this.errorChecker_ == 'function') { 
    customError = this.errorChecker_(contentDocument); 
    if(customError) { 
      errorCode = goog.net.ErrorCode.CUSTOM_ERROR; 
    } 
  } 
  this.logger_.finer('Last content: ' + this.lastContent_); 
  this.logger_.finer('Last uri: ' + this.lastUri_); 
  if(errorCode) { 
    this.logger_.fine('Load event occurred but failed'); 
    this.handleError_(errorCode, customError); 
  } else { 
    this.logger_.fine('Load succeeded'); 
    this.success_ = true; 
    this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR; 
    this.dispatchEvent(goog.net.EventType.COMPLETE); 
    this.dispatchEvent(goog.net.EventType.SUCCESS); 
    this.makeReady_(); 
  } 
}; 
goog.net.IframeIo.prototype.handleError_ = function(errorCode, opt_customError) { 
  if(! this.errorHandled_) { 
    this.success_ = false; 
    this.active_ = false; 
    this.complete_ = true; 
    this.lastErrorCode_ = errorCode; 
    if(errorCode == goog.net.ErrorCode.CUSTOM_ERROR) { 
      this.lastCustomError_ = opt_customError; 
    } 
    this.dispatchEvent(goog.net.EventType.COMPLETE); 
    this.dispatchEvent(goog.net.EventType.ERROR); 
    this.makeReady_(); 
    this.errorHandled_ = true; 
  } 
}; 
goog.net.IframeIo.prototype.handleIncrementalData_ = function(data) { 
  this.dispatchEvent(new goog.net.IframeIo.IncrementalDataEvent(data)); 
}; 
goog.net.IframeIo.prototype.makeReady_ = function() { 
  this.logger_.info('Ready for new requests'); 
  var iframe = this.iframe_; 
  this.scheduleIframeDisposal_(); 
  this.disposeForm_(); 
  goog.net.xhrMonitor.pushContext(iframe); 
  try { 
    this.dispatchEvent(goog.net.EventType.READY); 
  } finally { 
    goog.net.xhrMonitor.popContext(); 
  } 
}; 
goog.net.IframeIo.prototype.createIframe_ = function() { 
  this.logger_.fine('Creating iframe'); 
  this.iframeName_ = this.name_ + '_' +(this.nextIframeId_ ++).toString(36); 
  var iframeAttributes = { 
    'name': this.iframeName_, 
    'id': this.iframeName_ 
  }; 
  if(goog.userAgent.IE && goog.userAgent.VERSION < 7) { 
    iframeAttributes.src = 'javascript:""'; 
  } 
  this.iframe_ =(goog.dom.createDom('iframe', iframeAttributes)); 
  var s = this.iframe_.style; 
  s.visibility = 'hidden'; 
  s.width = s.height = '10px'; 
  if(! goog.userAgent.WEBKIT) { 
    s.position = 'absolute'; 
    s.top = s.left = '-10px'; 
  } else { 
    s.marginTop = s.marginLeft = '-10px'; 
  } 
}; 
goog.net.IframeIo.prototype.appendIframe_ = function() { 
  goog.dom.getDocument().body.appendChild(this.iframe_); 
}; 
goog.net.IframeIo.prototype.scheduleIframeDisposal_ = function() { 
  var iframe = this.iframe_; 
  if(iframe) { 
    iframe.onreadystatechange = null; 
    iframe.onload = null; 
    iframe.onerror = null; 
    this.iframesForDisposal_.push(iframe); 
  } 
  if(this.iframeDisposalTimer_) { 
    goog.Timer.clear(this.iframeDisposalTimer_); 
    this.iframeDisposalTimer_ = null; 
  } 
  if(goog.userAgent.GECKO || goog.userAgent.OPERA) { 
    this.iframeDisposalTimer_ = goog.Timer.callOnce(this.disposeIframes_, goog.net.IframeIo.IFRAME_DISPOSE_DELAY_MS, this); 
  } else { 
    this.disposeIframes_(); 
  } 
  this.iframe_ = null; 
  this.iframeName_ = null; 
}; 
goog.net.IframeIo.prototype.disposeIframes_ = function() { 
  if(this.iframeDisposalTimer_) { 
    goog.Timer.clear(this.iframeDisposalTimer_); 
    this.iframeDisposalTimer_ = null; 
  } 
  var i = 0; 
  while(i < this.iframesForDisposal_.length) { 
    var iframe = this.iframesForDisposal_[i]; 
    if(goog.net.xhrMonitor.isContextSafe(iframe)) { 
      this.logger_.info('Disposing iframe'); 
      goog.array.removeAt(this.iframesForDisposal_, i); 
      goog.dom.removeNode(iframe); 
    } else { 
      i ++; 
    } 
  } 
  if(this.iframesForDisposal_.length != 0) { 
    this.logger_.info('Requests outstanding, waiting to dispose'); 
    this.iframeDisposalTimer_ = goog.Timer.callOnce(this.disposeIframes_, goog.net.IframeIo.IFRAME_DISPOSE_DELAY_MS, this); 
  } 
}; 
goog.net.IframeIo.prototype.disposeForm_ = function() { 
  if(this.form_ && this.form_ == goog.net.IframeIo.form_) { 
    goog.dom.removeChildren(this.form_); 
  } 
  this.form_ = null; 
}; 
goog.net.IframeIo.prototype.getContentDocument_ = function() { 
  if(this.iframe_) { 
    return(goog.dom.getFrameContentDocument(this.getRequestIframe_())); 
  } 
  return null; 
}; 
goog.net.IframeIo.prototype.getRequestIframe_ = function() { 
  if(this.iframe_) { 
    return(goog.userAgent.IE ? this.iframe_: goog.dom.getFrameContentDocument(this.iframe_).getElementById(this.iframeName_ + goog.net.IframeIo.INNER_FRAME_SUFFIX)); 
  } 
  return null; 
}; 
goog.net.IframeIo.prototype.testForFirefoxSilentError_ = function() { 
  if(this.active_) { 
    var doc = this.getContentDocument_(); 
    if(doc && ! goog.reflect.canAccessProperty(doc, 'documentUri')) { 
      goog.events.unlisten(this.getRequestIframe_(), goog.events.EventType.LOAD, this.onIframeLoaded_, false, this); 
      if(navigator.onLine) { 
        this.logger_.warning('Silent Firefox error detected'); 
        this.handleError_(goog.net.ErrorCode.FF_SILENT_ERROR); 
      } else { 
        this.logger_.warning('Firefox is offline so report offline error ' + 'instead of silent error'); 
        this.handleError_(goog.net.ErrorCode.OFFLINE); 
      } 
      return; 
    } 
    this.firefoxSilentErrorTimeout_ = goog.Timer.callOnce(this.testForFirefoxSilentError_, 250, this); 
  } 
}; 
goog.net.IframeIo.IncrementalDataEvent = function(data) { 
  goog.events.Event.call(this, goog.net.EventType.INCREMENTAL_DATA); 
  this.data = data; 
}; 
goog.inherits(goog.net.IframeIo.IncrementalDataEvent, goog.events.Event); 
