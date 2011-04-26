
goog.provide('goog.ui.AttachableMenu'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.a11y.State'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.ui.ItemEvent'); 
goog.require('goog.ui.MenuBase'); 
goog.ui.AttachableMenu = function(opt_element) { 
  goog.ui.MenuBase.call(this, opt_element); 
}; 
goog.inherits(goog.ui.AttachableMenu, goog.ui.MenuBase); 
goog.ui.AttachableMenu.prototype.selectedElement_ = null; 
goog.ui.AttachableMenu.prototype.itemClassName_ = 'menu-item'; 
goog.ui.AttachableMenu.prototype.selectedItemClassName_ = 'menu-item-selected'; 
goog.ui.AttachableMenu.prototype.lastKeyDown_ = goog.now(); 
goog.ui.AttachableMenu.prototype.disposeInternal = function() { 
  goog.ui.AttachableMenu.superClass_.disposeInternal.call(this); 
  this.selectedElement_ = null; 
}; 
goog.ui.AttachableMenu.prototype.getItemClassName = function() { 
  return this.itemClassName_; 
}; 
goog.ui.AttachableMenu.prototype.setItemClassName = function(name) { 
  this.itemClassName_ = name; 
}; 
goog.ui.AttachableMenu.prototype.getSelectedItemClassName = function() { 
  return this.selectedItemClassName_; 
}; 
goog.ui.AttachableMenu.prototype.setSelectedItemClassName = function(name) { 
  this.selectedItemClassName_ = name; 
}; 
goog.ui.AttachableMenu.prototype.getSelectedItem = function() { 
  return this.selectedElement_; 
}; 
goog.ui.AttachableMenu.prototype.setSelectedItem = function(elt) { 
  if(this.selectedElement_) { 
    goog.dom.classes.remove(this.selectedElement_, this.selectedItemClassName_); 
  } 
  this.selectedElement_ = elt; 
  var el = this.getElement(); 
  if(this.selectedElement_) { 
    goog.dom.classes.add(this.selectedElement_, this.selectedItemClassName_); 
    if(elt.id) { 
      goog.dom.a11y.setState(el, goog.dom.a11y.State.ACTIVEDESCENDANT, elt.id); 
    } 
    var top = this.selectedElement_.offsetTop; 
    var height = this.selectedElement_.offsetHeight; 
    var scrollTop = el.scrollTop; 
    var scrollHeight = el.offsetHeight; 
    if(top < scrollTop) { 
      el.scrollTop = top; 
    } else if(top + height > scrollTop + scrollHeight) { 
      el.scrollTop = top + height - scrollHeight; 
    } 
  } else { 
    goog.dom.a11y.setState(el, goog.dom.a11y.State.ACTIVEDESCENDANT, ''); 
  } 
}; 
goog.ui.AttachableMenu.prototype.showPopupElement = function() { 
  var el =(this.getElement()); 
  goog.style.showElement(el, true); 
  el.scrollTop = 0; 
  el.style.visibility = 'visible'; 
}; 
goog.ui.AttachableMenu.prototype.onShow_ = function() { 
  goog.ui.AttachableMenu.superClass_.onShow_.call(this); 
  var el = this.getElement(); 
  goog.userAgent.IE ? el.firstChild.focus(): el.focus(); 
}; 
goog.ui.AttachableMenu.prototype.getNextPrevItem = function(prev) { 
  var elements = this.getElement().getElementsByTagName('*'); 
  var elementCount = elements.length; 
  var index; 
  if(this.selectedElement_) { 
    for(var i = 0; i < elementCount; i ++) { 
      if(elements[i]== this.selectedElement_) { 
        index = prev ? i - 1: i + 1; 
        break; 
      } 
    } 
  } 
  if(! goog.isDef(index)) { 
    index = prev ? elementCount - 1: 0; 
  } 
  for(var i = 0; i < elementCount; i ++) { 
    var multiplier = prev ? - 1: 1; 
    var nextIndex = index +(multiplier * i) % elementCount; 
    if(nextIndex < 0) { 
      nextIndex += elementCount; 
    } else if(nextIndex >= elementCount) { 
      nextIndex -= elementCount; 
    } 
    if(this.isMenuItem_(elements[nextIndex])) { 
      return elements[nextIndex]; 
    } 
  } 
  return null; 
}; 
goog.ui.AttachableMenu.prototype.onMouseOver = function(e) { 
  var eltItem = this.getAncestorMenuItem_((e.target)); 
  if(eltItem == null) { 
    return; 
  } 
  if(goog.now() - this.lastKeyDown_ > goog.ui.PopupBase.DEBOUNCE_DELAY_MS) { 
    this.setSelectedItem(eltItem); 
  } 
}; 
goog.ui.AttachableMenu.prototype.onMouseOut = function(e) { 
  var eltItem = this.getAncestorMenuItem_((e.target)); 
  if(eltItem == null) { 
    return; 
  } 
  if(goog.now() - this.lastKeyDown_ > goog.ui.PopupBase.DEBOUNCE_DELAY_MS) { 
    this.setSelectedItem(null); 
  } 
}; 
goog.ui.AttachableMenu.prototype.onMouseDown = goog.events.Event.preventDefault; 
goog.ui.AttachableMenu.prototype.onMouseUp = function(e) { 
  var eltItem = this.getAncestorMenuItem_((e.target)); 
  if(eltItem == null) { 
    return; 
  } 
  this.setVisible(false); 
  this.onItemSelected_(eltItem); 
}; 
goog.ui.AttachableMenu.prototype.onKeyDown = function(e) { 
  switch(e.keyCode) { 
    case goog.events.KeyCodes.DOWN: 
      this.setSelectedItem(this.getNextPrevItem(false)); 
      this.lastKeyDown_ = goog.now(); 
      break; 

    case goog.events.KeyCodes.UP: 
      this.setSelectedItem(this.getNextPrevItem(true)); 
      this.lastKeyDown_ = goog.now(); 
      break; 

    case goog.events.KeyCodes.ENTER: 
      if(this.selectedElement_) { 
        this.onItemSelected_(); 
        this.setVisible(false); 
      } 
      break; 

    case goog.events.KeyCodes.ESC: 
      this.setVisible(false); 
      break; 

    default: 
      if(e.charCode) { 
        var charStr = String.fromCharCode(e.charCode); 
        this.selectByName_(charStr, 1, true); 
      } 
      break; 

  } 
  e.preventDefault(); 
  e.stopPropagation(); 
  this.dispatchEvent(e); 
}; 
goog.ui.AttachableMenu.prototype.selectByName_ = function(prefix, opt_direction, opt_skip) { 
  var elements = this.getElement().getElementsByTagName('*'); 
  var elementCount = elements.length; 
  var index; 
  if(elementCount == 0) { 
    return; 
  } 
  if(! this.selectedElement_ ||(index = goog.array.indexOf(elements, this.selectedElement_)) == - 1) { 
    index = 0; 
  } 
  var start = index; 
  var re = new RegExp('^' + goog.string.regExpEscape(prefix), 'i'); 
  var skip = opt_skip && this.selectedElement_; 
  var dir = opt_direction || 1; 
  do { 
    if(elements[index]!= skip && this.isMenuItem_(elements[index])) { 
      var name = goog.dom.getTextContent(elements[index]); 
      if(name.match(re)) { 
        break; 
      } 
    } 
    index += dir; 
    if(index == elementCount) { 
      index = 0; 
    } else if(index < 0) { 
      index = elementCount - 1; 
    } 
  } while(index != start); 
  if(this.selectedElement_ != elements[index]) { 
    this.setSelectedItem(elements[index]); 
  } 
}; 
goog.ui.AttachableMenu.prototype.onItemSelected_ = function(opt_item) { 
  this.dispatchEvent(new goog.ui.ItemEvent(goog.ui.MenuBase.Events.ITEM_ACTION, this, opt_item || this.selectedElement_)); 
}; 
goog.ui.AttachableMenu.prototype.isMenuItem_ = function(elt) { 
  return ! ! elt && goog.dom.classes.has(elt, this.itemClassName_); 
}; 
goog.ui.AttachableMenu.prototype.getAncestorMenuItem_ = function(elt) { 
  if(elt) { 
    var ownerDocumentBody = goog.dom.getOwnerDocument(elt).body; 
    while(elt != null && elt != ownerDocumentBody) { 
      if(this.isMenuItem_(elt)) { 
        return elt; 
      } 
      elt =(elt.parentNode); 
    } 
  } 
  return null; 
}; 
