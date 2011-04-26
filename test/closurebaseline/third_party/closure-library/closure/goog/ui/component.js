
goog.provide('goog.ui.Component'); 
goog.provide('goog.ui.Component.Error'); 
goog.provide('goog.ui.Component.EventType'); 
goog.provide('goog.ui.Component.State'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.object'); 
goog.require('goog.style'); 
goog.require('goog.ui.IdGenerator'); 
goog.ui.Component = function(opt_domHelper) { 
  goog.events.EventTarget.call(this); 
  this.dom_ = opt_domHelper || goog.dom.getDomHelper(); 
  this.rightToLeft_ = goog.ui.Component.defaultRightToLeft_; 
}; 
goog.inherits(goog.ui.Component, goog.events.EventTarget); 
goog.ui.Component.prototype.idGenerator_ = goog.ui.IdGenerator.getInstance(); 
goog.ui.Component.defaultRightToLeft_ = null; 
goog.ui.Component.EventType = { 
  BEFORE_SHOW: 'beforeshow', 
  SHOW: 'show', 
  HIDE: 'hide', 
  DISABLE: 'disable', 
  ENABLE: 'enable', 
  HIGHLIGHT: 'highlight', 
  UNHIGHLIGHT: 'unhighlight', 
  ACTIVATE: 'activate', 
  DEACTIVATE: 'deactivate', 
  SELECT: 'select', 
  UNSELECT: 'unselect', 
  CHECK: 'check', 
  UNCHECK: 'uncheck', 
  FOCUS: 'focus', 
  BLUR: 'blur', 
  OPEN: 'open', 
  CLOSE: 'close', 
  ENTER: 'enter', 
  LEAVE: 'leave', 
  ACTION: 'action', 
  CHANGE: 'change' 
}; 
goog.ui.Component.Error = { 
  NOT_SUPPORTED: 'Method not supported', 
  DECORATE_INVALID: 'Invalid element to decorate', 
  ALREADY_RENDERED: 'Component already rendered', 
  PARENT_UNABLE_TO_BE_SET: 'Unable to set parent component', 
  CHILD_INDEX_OUT_OF_BOUNDS: 'Child component index out of bounds', 
  NOT_OUR_CHILD: 'Child is not in parent component', 
  NOT_IN_DOCUMENT: 'Operation not supported while component is not in document', 
  STATE_INVALID: 'Invalid component state' 
}; 
goog.ui.Component.State = { 
  ALL: 0xFF, 
  DISABLED: 0x01, 
  HOVER: 0x02, 
  ACTIVE: 0x04, 
  SELECTED: 0x08, 
  CHECKED: 0x10, 
  FOCUSED: 0x20, 
  OPENED: 0x40 
}; 
goog.ui.Component.getStateTransitionEvent = function(state, isEntering) { 
  switch(state) { 
    case goog.ui.Component.State.DISABLED: 
      return isEntering ? goog.ui.Component.EventType.DISABLE: goog.ui.Component.EventType.ENABLE; 

    case goog.ui.Component.State.HOVER: 
      return isEntering ? goog.ui.Component.EventType.HIGHLIGHT: goog.ui.Component.EventType.UNHIGHLIGHT; 

    case goog.ui.Component.State.ACTIVE: 
      return isEntering ? goog.ui.Component.EventType.ACTIVATE: goog.ui.Component.EventType.DEACTIVATE; 

    case goog.ui.Component.State.SELECTED: 
      return isEntering ? goog.ui.Component.EventType.SELECT: goog.ui.Component.EventType.UNSELECT; 

    case goog.ui.Component.State.CHECKED: 
      return isEntering ? goog.ui.Component.EventType.CHECK: goog.ui.Component.EventType.UNCHECK; 

    case goog.ui.Component.State.FOCUSED: 
      return isEntering ? goog.ui.Component.EventType.FOCUS: goog.ui.Component.EventType.BLUR; 

    case goog.ui.Component.State.OPENED: 
      return isEntering ? goog.ui.Component.EventType.OPEN: goog.ui.Component.EventType.CLOSE; 

    default: 
  } 
  throw Error(goog.ui.Component.Error.STATE_INVALID); 
}; 
goog.ui.Component.setDefaultRightToLeft = function(rightToLeft) { 
  goog.ui.Component.defaultRightToLeft_ = rightToLeft; 
}; 
goog.ui.Component.prototype.id_ = null; 
goog.ui.Component.prototype.dom_; 
goog.ui.Component.prototype.inDocument_ = false; 
goog.ui.Component.prototype.element_ = null; 
goog.ui.Component.prototype.googUiComponentHandler_; 
goog.ui.Component.prototype.rightToLeft_ = null; 
goog.ui.Component.prototype.model_ = null; 
goog.ui.Component.prototype.parent_ = null; 
goog.ui.Component.prototype.children_ = null; 
goog.ui.Component.prototype.childIndex_ = null; 
goog.ui.Component.prototype.wasDecorated_ = false; 
goog.ui.Component.prototype.getId = function() { 
  return this.id_ ||(this.id_ = this.idGenerator_.getNextUniqueId()); 
}; 
goog.ui.Component.prototype.setId = function(id) { 
  if(this.parent_ && this.parent_.childIndex_) { 
    goog.object.remove(this.parent_.childIndex_, this.id_); 
    goog.object.add(this.parent_.childIndex_, id, this); 
  } 
  this.id_ = id; 
}; 
goog.ui.Component.prototype.getElement = function() { 
  return this.element_; 
}; 
goog.ui.Component.prototype.setElementInternal = function(element) { 
  this.element_ = element; 
}; 
goog.ui.Component.prototype.getHandler = function() { 
  return this.googUiComponentHandler_ ||(this.googUiComponentHandler_ = new goog.events.EventHandler(this)); 
}; 
goog.ui.Component.prototype.setParent = function(parent) { 
  if(this == parent) { 
    throw Error(goog.ui.Component.Error.PARENT_UNABLE_TO_BE_SET); 
  } 
  if(parent && this.parent_ && this.id_ && this.parent_.getChild(this.id_) && this.parent_ != parent) { 
    throw Error(goog.ui.Component.Error.PARENT_UNABLE_TO_BE_SET); 
  } 
  this.parent_ = parent; 
  goog.ui.Component.superClass_.setParentEventTarget.call(this, parent); 
}; 
goog.ui.Component.prototype.getParent = function() { 
  return this.parent_; 
}; 
goog.ui.Component.prototype.setParentEventTarget = function(parent) { 
  if(this.parent_ && this.parent_ != parent) { 
    throw Error(goog.ui.Component.Error.NOT_SUPPORTED); 
  } 
  goog.ui.Component.superClass_.setParentEventTarget.call(this, parent); 
}; 
goog.ui.Component.prototype.getDomHelper = function() { 
  return this.dom_; 
}; 
goog.ui.Component.prototype.isInDocument = function() { 
  return this.inDocument_; 
}; 
goog.ui.Component.prototype.createDom = function() { 
  this.element_ = this.dom_.createElement('div'); 
}; 
goog.ui.Component.prototype.render = function(opt_parentElement) { 
  this.render_(opt_parentElement); 
}; 
goog.ui.Component.prototype.renderBefore = function(siblingElement) { 
  this.render_((siblingElement.parentNode), siblingElement); 
}; 
goog.ui.Component.prototype.render_ = function(opt_parentElement, opt_beforeElement) { 
  if(this.inDocument_) { 
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED); 
  } 
  if(! this.element_) { 
    this.createDom(); 
  } 
  if(opt_parentElement) { 
    opt_parentElement.insertBefore(this.element_, opt_beforeElement || null); 
  } else { 
    this.dom_.getDocument().body.appendChild(this.element_); 
  } 
  if(! this.parent_ || this.parent_.isInDocument()) { 
    this.enterDocument(); 
  } 
}; 
goog.ui.Component.prototype.decorate = function(element) { 
  if(this.inDocument_) { 
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED); 
  } else if(element && this.canDecorate(element)) { 
    this.wasDecorated_ = true; 
    if(! this.dom_ || this.dom_.getDocument() != goog.dom.getOwnerDocument(element)) { 
      this.dom_ = goog.dom.getDomHelper(element); 
    } 
    this.decorateInternal(element); 
    this.enterDocument(); 
  } else { 
    throw Error(goog.ui.Component.Error.DECORATE_INVALID); 
  } 
}; 
goog.ui.Component.prototype.canDecorate = function(element) { 
  return true; 
}; 
goog.ui.Component.prototype.wasDecorated = function() { 
  return this.wasDecorated_; 
}; 
goog.ui.Component.prototype.decorateInternal = function(element) { 
  this.element_ = element; 
}; 
goog.ui.Component.prototype.enterDocument = function() { 
  this.inDocument_ = true; 
  this.forEachChild(function(child) { 
    if(! child.isInDocument() && child.getElement()) { 
      child.enterDocument(); 
    } 
  }); 
}; 
goog.ui.Component.prototype.exitDocument = function() { 
  this.forEachChild(function(child) { 
    if(child.isInDocument()) { 
      child.exitDocument(); 
    } 
  }); 
  if(this.googUiComponentHandler_) { 
    this.googUiComponentHandler_.removeAll(); 
  } 
  this.inDocument_ = false; 
}; 
goog.ui.Component.prototype.disposeInternal = function() { 
  goog.ui.Component.superClass_.disposeInternal.call(this); 
  if(this.inDocument_) { 
    this.exitDocument(); 
  } 
  if(this.googUiComponentHandler_) { 
    this.googUiComponentHandler_.dispose(); 
    delete this.googUiComponentHandler_; 
  } 
  this.forEachChild(function(child) { 
    child.dispose(); 
  }); 
  if(! this.wasDecorated_ && this.element_) { 
    goog.dom.removeNode(this.element_); 
  } 
  this.children_ = null; 
  this.childIndex_ = null; 
  this.element_ = null; 
  this.model_ = null; 
  this.parent_ = null; 
}; 
goog.ui.Component.prototype.makeId = function(idFragment) { 
  return this.getId() + '.' + idFragment; 
}; 
goog.ui.Component.prototype.makeIds = function(object) { 
  var ids = { }; 
  for(var key in object) { 
    ids[key]= this.makeId(object[key]); 
  } 
  return ids; 
}; 
goog.ui.Component.prototype.getModel = function() { 
  return this.model_; 
}; 
goog.ui.Component.prototype.setModel = function(obj) { 
  this.model_ = obj; 
}; 
goog.ui.Component.prototype.getFragmentFromId = function(id) { 
  return id.substring(this.getId().length + 1); 
}; 
goog.ui.Component.prototype.getElementByFragment = function(idFragment) { 
  if(! this.inDocument_) { 
    throw Error(goog.ui.Component.Error.NOT_IN_DOCUMENT); 
  } 
  return this.dom_.getElement(this.makeId(idFragment)); 
}; 
goog.ui.Component.prototype.addChild = function(child, opt_render) { 
  this.addChildAt(child, this.getChildCount(), opt_render); 
}; 
goog.ui.Component.prototype.addChildAt = function(child, index, opt_render) { 
  if(child.inDocument_ &&(opt_render || ! this.inDocument_)) { 
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED); 
  } 
  if(index < 0 || index > this.getChildCount()) { 
    throw Error(goog.ui.Component.Error.CHILD_INDEX_OUT_OF_BOUNDS); 
  } 
  if(! this.childIndex_ || ! this.children_) { 
    this.childIndex_ = { }; 
    this.children_ =[]; 
  } 
  if(child.getParent() == this) { 
    goog.object.set(this.childIndex_, child.getId(), child); 
    goog.array.remove(this.children_, child); 
  } else { 
    goog.object.add(this.childIndex_, child.getId(), child); 
  } 
  child.setParent(this); 
  goog.array.insertAt(this.children_, child, index); 
  if(child.inDocument_ && this.inDocument_ && child.getParent() == this) { 
    var contentElement = this.getContentElement(); 
    contentElement.insertBefore(child.getElement(),(contentElement.childNodes[index]|| null)); 
  } else if(opt_render) { 
    if(! this.element_) { 
      this.createDom(); 
    } 
    var sibling = this.getChildAt(index + 1); 
    child.render_(this.getContentElement(), sibling ? sibling.element_: null); 
  } else { 
    if(this.inDocument_ && ! child.inDocument_ && child.element_) { 
      child.enterDocument(); 
    } 
  } 
}; 
goog.ui.Component.prototype.getContentElement = function() { 
  return this.element_; 
}; 
goog.ui.Component.prototype.isRightToLeft = function() { 
  if(this.rightToLeft_ == null) { 
    this.rightToLeft_ = goog.style.isRightToLeft(this.inDocument_ ? this.element_: this.dom_.getDocument().body); 
  } 
  return(this.rightToLeft_); 
}; 
goog.ui.Component.prototype.setRightToLeft = function(rightToLeft) { 
  if(this.inDocument_) { 
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED); 
  } 
  this.rightToLeft_ = rightToLeft; 
}; 
goog.ui.Component.prototype.hasChildren = function() { 
  return ! ! this.children_ && this.children_.length != 0; 
}; 
goog.ui.Component.prototype.getChildCount = function() { 
  return this.children_ ? this.children_.length: 0; 
}; 
goog.ui.Component.prototype.getChildIds = function() { 
  var ids =[]; 
  this.forEachChild(function(child) { 
    ids.push(child.getId()); 
  }); 
  return ids; 
}; 
goog.ui.Component.prototype.getChild = function(id) { 
  return(this.childIndex_ && id) ?(goog.object.get(this.childIndex_, id)) || null: null; 
}; 
goog.ui.Component.prototype.getChildAt = function(index) { 
  return this.children_ ? this.children_[index]|| null: null; 
}; 
goog.ui.Component.prototype.forEachChild = function(f, opt_obj) { 
  if(this.children_) { 
    goog.array.forEach(this.children_, f, opt_obj); 
  } 
}; 
goog.ui.Component.prototype.indexOfChild = function(child) { 
  return(this.children_ && child) ? goog.array.indexOf(this.children_, child): - 1; 
}; 
goog.ui.Component.prototype.removeChild = function(child, opt_unrender) { 
  if(child) { 
    var id = goog.isString(child) ? child: child.getId(); 
    child = this.getChild(id); 
    if(id && child) { 
      goog.object.remove(this.childIndex_, id); 
      goog.array.remove(this.children_, child); 
      if(opt_unrender) { 
        child.exitDocument(); 
        if(child.element_) { 
          goog.dom.removeNode(child.element_); 
        } 
      } 
      child.setParent(null); 
    } 
  } 
  if(! child) { 
    throw Error(goog.ui.Component.Error.NOT_OUR_CHILD); 
  } 
  return(child); 
}; 
goog.ui.Component.prototype.removeChildAt = function(index, opt_unrender) { 
  return this.removeChild(this.getChildAt(index), opt_unrender); 
}; 
goog.ui.Component.prototype.removeChildren = function(opt_unrender) { 
  while(this.hasChildren()) { 
    this.removeChildAt(0, opt_unrender); 
  } 
}; 
