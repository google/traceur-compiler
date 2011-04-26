
goog.provide('goog.ui.DragDropDetector'); 
goog.provide('goog.ui.DragDropDetector.EventType'); 
goog.provide('goog.ui.DragDropDetector.ImageDropEvent'); 
goog.provide('goog.ui.DragDropDetector.LinkDropEvent'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.math.Coordinate'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.userAgent'); 
goog.ui.DragDropDetector = function(opt_filePath) { 
  goog.base(this); 
  var iframe = goog.dom.createDom(goog.dom.TagName.IFRAME, { 'frameborder': 0 }); 
  iframe.className = goog.userAgent.IE ? goog.getCssName(goog.ui.DragDropDetector.BASE_CSS_NAME_, 'ie-editable-iframe'): goog.getCssName(goog.ui.DragDropDetector.BASE_CSS_NAME_, 'w3c-editable-iframe'); 
  iframe.src = opt_filePath || goog.ui.DragDropDetector.DEFAULT_FILE_PATH_; 
  this.element_ =(iframe); 
  this.handler_ = new goog.events.EventHandler(this); 
  this.handler_.listen(iframe, goog.events.EventType.LOAD, this.initIframe_); 
  if(goog.userAgent.IE) { 
    this.textInput_ = goog.dom.createDom(goog.dom.TagName.INPUT, { 
      'type': 'text', 
      'className': goog.getCssName(goog.ui.DragDropDetector.BASE_CSS_NAME_, 'ie-input') 
    }); 
    this.root_ = goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName(goog.ui.DragDropDetector.BASE_CSS_NAME_, 'ie-div'), this.textInput_, iframe); 
  } else { 
    this.root_ = iframe; 
  } 
  document.body.appendChild(this.root_); 
}; 
goog.inherits(goog.ui.DragDropDetector, goog.events.EventTarget); 
goog.ui.DragDropDetector.EventType = { 
  IMAGE_DROPPED: 'onimagedrop', 
  LINK_DROPPED: 'onlinkdrop' 
}; 
goog.ui.DragDropDetector.DROP_EVENT_TYPE_ = goog.userAgent.IE ? goog.events.EventType.DROP: 'dragdrop'; 
goog.ui.DragDropDetector.INIT_POSITION = - 10000; 
goog.ui.DragDropDetector.BASE_CSS_NAME_ = goog.getCssName('goog-dragdrop'); 
var MSG_DRAG_DROP_LOCAL_FILE_ERROR = goog.getMsg('It is not possible to drag ' + 'and drop image files at this time.\nPlease drag an image from your web ' + 'browser.'); 
var MSG_DRAG_DROP_PROTECTED_FILE_ERROR = goog.getMsg('The image you are ' + 'trying to drag has been blocked by the hosting site.'); 
goog.ui.DragDropDetector.SPECIAL_CASE_URLS_ =[{ 
  regex: /^file:\/\/\//, 
  message: MSG_DRAG_DROP_LOCAL_FILE_ERROR 
}, { 
  regex: /flickr(.*)spaceball.gif$/, 
  message: MSG_DRAG_DROP_PROTECTED_FILE_ERROR 
}]; 
goog.ui.DragDropDetector.URL_LIKE_REGEX_ = /^\S+:\/\/\S*$/; 
goog.ui.DragDropDetector.DEFAULT_FILE_PATH_ = 'dragdropdetector_target.html'; 
goog.ui.DragDropDetector.prototype.handler_; 
goog.ui.DragDropDetector.prototype.root_; 
goog.ui.DragDropDetector.prototype.textInput_; 
goog.ui.DragDropDetector.prototype.element_; 
goog.ui.DragDropDetector.prototype.window_ = null; 
goog.ui.DragDropDetector.prototype.document_ = null; 
goog.ui.DragDropDetector.prototype.body_ = null; 
goog.ui.DragDropDetector.prototype.isCoveringScreen_ = false; 
goog.ui.DragDropDetector.prototype.mousePosition_ = null; 
goog.ui.DragDropDetector.prototype.initIframe_ = function() { 
  this.mousePosition_ = new goog.math.Coordinate(goog.ui.DragDropDetector.INIT_POSITION, goog.ui.DragDropDetector.INIT_POSITION); 
  this.window_ = this.element_.contentWindow; 
  this.document_ = this.window_.document; 
  this.body_ = this.document_.body; 
  if(goog.userAgent.GECKO) { 
    this.document_.designMode = 'on'; 
  } else if(! goog.userAgent.IE) { 
    this.body_.contentEditable = true; 
  } 
  this.handler_.listen(document.body, goog.events.EventType.DRAGENTER, this.coverScreen_); 
  if(goog.userAgent.IE) { 
    this.handler_.listen(this.body_,[goog.events.EventType.DRAGENTER, goog.events.EventType.DRAGOVER], goog.ui.DragDropDetector.enforceCopyEffect_).listen(this.body_, goog.events.EventType.MOUSEOUT, this.switchToInput_).listen(this.body_, goog.events.EventType.DRAGLEAVE, this.uncoverScreen_).listen(this.body_, goog.ui.DragDropDetector.DROP_EVENT_TYPE_, function(e) { 
      this.trackMouse_(e); 
      goog.global.setTimeout(goog.bind(this.handleNodeInserted_, this, e), 0); 
      return true; 
    }).listen(this.root_,[goog.events.EventType.DRAGENTER, goog.events.EventType.DRAGOVER], this.handleNewDrag_).listen(this.root_,[goog.events.EventType.MOUSEMOVE, goog.events.EventType.KEYPRESS], this.uncoverScreen_).listen(this.textInput_, goog.events.EventType.DRAGOVER, goog.events.Event.preventDefault).listen(this.textInput_, goog.ui.DragDropDetector.DROP_EVENT_TYPE_, this.handleInputDrop_); 
  } else { 
    this.handler_.listen(this.body_, goog.ui.DragDropDetector.DROP_EVENT_TYPE_, function(e) { 
      this.trackMouse_(e); 
      this.uncoverScreen_(); 
    }).listen(this.body_,[goog.events.EventType.MOUSEMOVE, goog.events.EventType.KEYPRESS], this.uncoverScreen_).listen(this.document_, 'DOMNodeInserted', this.handleNodeInserted_); 
  } 
}; 
goog.ui.DragDropDetector.enforceCopyEffect_ = function(e) { 
  var event = e.getBrowserEvent(); 
  if(event.dataTransfer.dropEffect.toLowerCase() != 'copy') { 
    event.dataTransfer.dropEffect = 'copy'; 
  } 
}; 
goog.ui.DragDropDetector.prototype.coverScreen_ = function(e) { 
  if(goog.userAgent.IE && e.getBrowserEvent().dataTransfer.dropEffect == 'none') { 
    return; 
  } 
  if(! this.isCoveringScreen_) { 
    this.isCoveringScreen_ = true; 
    if(goog.userAgent.IE) { 
      goog.style.setStyle(this.root_, 'top', '0'); 
      this.body_.contentEditable = true; 
      this.switchToInput_(e); 
    } else { 
      goog.style.setStyle(this.root_, 'height', '5000px'); 
    } 
  } 
}; 
goog.ui.DragDropDetector.prototype.uncoverScreen_ = function() { 
  if(this.isCoveringScreen_) { 
    this.isCoveringScreen_ = false; 
    if(goog.userAgent.IE) { 
      this.body_.contentEditable = false; 
      goog.style.setStyle(this.root_, 'top', '-5000px'); 
    } else { 
      goog.style.setStyle(this.root_, 'height', '10px'); 
    } 
  } 
}; 
goog.ui.DragDropDetector.prototype.switchToInput_ = function(e) { 
  if(this.isCoveringScreen_) { 
    goog.style.showElement(this.textInput_, true); 
  } 
}; 
goog.ui.DragDropDetector.prototype.switchToIframe_ = function(e) { 
  if(this.isCoveringScreen_) { 
    goog.style.showElement(this.textInput_, false); 
    this.isShowingInput_ = false; 
  } 
}; 
goog.ui.DragDropDetector.prototype.handleNewDrag_ = function(e) { 
  var event = e.getBrowserEvent(); 
  if(event.dataTransfer.dropEffect == 'link') { 
    this.switchToInput_(e); 
    e.preventDefault(); 
    return false; 
  } 
  this.switchToIframe_(e); 
}; 
goog.ui.DragDropDetector.prototype.trackMouse_ = function(e) { 
  this.mousePosition_.x = e.clientX; 
  this.mousePosition_.y = e.clientY; 
  if(goog.dom.getOwnerDocument((e.target)) != document) { 
    var iframePosition = goog.style.getClientPosition(this.element_); 
    this.mousePosition_.x += iframePosition.x; 
    this.mousePosition_.y += iframePosition.y; 
  } 
}; 
goog.ui.DragDropDetector.prototype.handleInputDrop_ = function(e) { 
  this.dispatchEvent(new goog.ui.DragDropDetector.LinkDropEvent(e.getBrowserEvent().dataTransfer.getData('Text'))); 
  this.uncoverScreen_(); 
  e.preventDefault(); 
}; 
goog.ui.DragDropDetector.prototype.clearContents_ = function() { 
  if(goog.userAgent.WEBKIT) { 
    goog.global.setTimeout(goog.bind(function() { 
      this.innerHTML = ''; 
    }, this.body_), 0); 
  } else { 
    this.document_.execCommand('selectAll', false, null); 
    this.document_.execCommand('delete', false, null); 
    this.document_.execCommand('selectAll', false, null); 
  } 
}; 
goog.ui.DragDropDetector.prototype.handleNodeInserted_ = function(e) { 
  var uri; 
  if(this.body_.innerHTML.indexOf('<') == - 1) { 
    uri = goog.string.trim(goog.dom.getTextContent(this.body_)); 
    if(! uri.match(goog.ui.DragDropDetector.URL_LIKE_REGEX_)) { 
      uri = null; 
    } 
  } 
  if(! uri) { 
    var imgs = this.body_.getElementsByTagName(goog.dom.TagName.IMG); 
    if(imgs && imgs.length) { 
      var img = imgs[0]; 
      uri = img.src; 
    } 
  } 
  if(uri) { 
    var specialCases = goog.ui.DragDropDetector.SPECIAL_CASE_URLS_; 
    var len = specialCases.length; 
    for(var i = 0; i < len; i ++) { 
      var specialCase = specialCases[i]; 
      if(uri.match(specialCase.regex)) { 
        alert(specialCase.message); 
        break; 
      } 
    } 
    if(i == len) { 
      this.dispatchEvent(new goog.ui.DragDropDetector.ImageDropEvent(uri, this.mousePosition_)); 
      return; 
    } 
  } 
  var links = this.body_.getElementsByTagName(goog.dom.TagName.A); 
  if(links) { 
    for(i = 0, len = links.length; i < len; i ++) { 
      this.dispatchEvent(new goog.ui.DragDropDetector.LinkDropEvent(links[i].href)); 
    } 
  } 
  this.clearContents_(); 
  this.uncoverScreen_(); 
}; 
goog.ui.DragDropDetector.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  this.handler_.dispose(); 
  this.handler_ = null; 
}; 
goog.ui.DragDropDetector.ImageDropEvent = function(url, position) { 
  goog.base(this, goog.ui.DragDropDetector.EventType.IMAGE_DROPPED); 
  this.url_ = url; 
  this.position_ = position; 
}; 
goog.inherits(goog.ui.DragDropDetector.ImageDropEvent, goog.events.Event); 
goog.ui.DragDropDetector.ImageDropEvent.prototype.getUrl = function() { 
  return this.url_; 
}; 
goog.ui.DragDropDetector.ImageDropEvent.prototype.getPosition = function() { 
  return this.position_; 
}; 
goog.ui.DragDropDetector.LinkDropEvent = function(url) { 
  goog.base(this, goog.ui.DragDropDetector.EventType.LINK_DROPPED); 
  this.url_ = url; 
}; 
goog.inherits(goog.ui.DragDropDetector.LinkDropEvent, goog.events.Event); 
goog.ui.DragDropDetector.LinkDropEvent.prototype.getUrl = function() { 
  return this.url_; 
}; 
