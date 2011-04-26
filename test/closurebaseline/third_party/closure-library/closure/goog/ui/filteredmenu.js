
goog.provide('goog.ui.FilteredMenu'); 
goog.require('goog.dom'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.InputHandler'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.string'); 
goog.require('goog.ui.FilterObservingMenuItem'); 
goog.require('goog.ui.Menu'); 
goog.ui.FilteredMenu = function(opt_renderer, opt_domHelper) { 
  goog.ui.Menu.call(this, opt_domHelper, opt_renderer); 
}; 
goog.inherits(goog.ui.FilteredMenu, goog.ui.Menu); 
goog.ui.FilteredMenu.EventType = { FILTER_CHANGED: 'filterchange' }; 
goog.ui.FilteredMenu.prototype.filterInput_; 
goog.ui.FilteredMenu.prototype.inputHandler_; 
goog.ui.FilteredMenu.prototype.maxLength_ = 0; 
goog.ui.FilteredMenu.prototype.label_ = ''; 
goog.ui.FilteredMenu.prototype.labelEl_; 
goog.ui.FilteredMenu.prototype.allowMultiple_ = false; 
goog.ui.FilteredMenu.prototype.enteredItems_; 
goog.ui.FilteredMenu.prototype.filterFromIndex_ = 0; 
goog.ui.FilteredMenu.prototype.filterStr_; 
goog.ui.FilteredMenu.prototype.persistentChildren_; 
goog.ui.FilteredMenu.prototype.createDom = function() { 
  goog.ui.FilteredMenu.superClass_.createDom.call(this); 
  var dom = this.getDomHelper(); 
  var el = dom.createDom('div', goog.getCssName(this.getRenderer().getCssClass(), 'filter'), this.labelEl_ = dom.createDom('div', null, this.label_), this.filterInput_ = dom.createDom('input', { 'type': 'text' })); 
  var element = this.getElement(); 
  dom.appendChild(element, el); 
  this.contentElement_ = dom.createDom('div', goog.getCssName(this.getRenderer().getCssClass(), 'content')); 
  dom.appendChild(element, this.contentElement_); 
  this.initFilterInput_(); 
}; 
goog.ui.FilteredMenu.prototype.initFilterInput_ = function() { 
  this.setFocusable(true); 
  this.setKeyEventTarget(this.filterInput_); 
  if(goog.userAgent.GECKO) { 
    this.filterInput_.setAttribute('autocomplete', 'off'); 
  } 
  if(this.maxLength_) { 
    this.filterInput_.maxLength = this.maxLength_; 
  } 
}; 
goog.ui.FilteredMenu.prototype.setUpFilterListeners_ = function() { 
  if(! this.inputHandler_ && this.filterInput_) { 
    this.inputHandler_ = new goog.events.InputHandler((this.filterInput_)); 
    goog.style.setUnselectable(this.filterInput_, false); 
    goog.events.listen(this.inputHandler_, goog.events.InputHandler.EventType.INPUT, this.handleFilterEvent, false, this); 
    goog.events.listen(this.filterInput_.parentNode, goog.events.EventType.CLICK, this.onFilterLabelClick_, false, this); 
    if(this.allowMultiple_) { 
      this.enteredItems_ =[]; 
    } 
  } 
}; 
goog.ui.FilteredMenu.prototype.tearDownFilterListeners_ = function() { 
  if(this.inputHandler_) { 
    goog.events.unlisten(this.inputHandler_, goog.events.InputHandler.EventType.INPUT, this.handleFilterEvent, false, this); 
    goog.events.unlisten(this.filterInput_.parentNode, goog.events.EventType.CLICK, this.onFilterLabelClick_, false, this); 
    this.inputHandler_.dispose(); 
    this.inputHandler_ = undefined; 
    this.enteredItems_ = undefined; 
  } 
}; 
goog.ui.FilteredMenu.prototype.setVisible = function(show, opt_force, opt_e) { 
  var visibilityChanged = goog.ui.FilteredMenu.superClass_.setVisible.call(this, show, opt_force, opt_e); 
  if(visibilityChanged && show && this.isInDocument()) { 
    this.setFilter(''); 
    this.setUpFilterListeners_(); 
  } else if(visibilityChanged && ! show) { 
    this.tearDownFilterListeners_(); 
  } 
  return visibilityChanged; 
}; 
goog.ui.FilteredMenu.prototype.disposeInternal = function() { 
  this.tearDownFilterListeners_(); 
  this.filterInput_ = undefined; 
  this.labelEl_ = undefined; 
  goog.ui.FilteredMenu.superClass_.disposeInternal.call(this); 
}; 
goog.ui.FilteredMenu.prototype.setFilterLabel = function(label) { 
  this.label_ = label || ''; 
  if(this.labelEl_) { 
    goog.dom.setTextContent(this.labelEl_, this.label_); 
  } 
}; 
goog.ui.FilteredMenu.prototype.getFilterLabel = function() { 
  return this.label_; 
}; 
goog.ui.FilteredMenu.prototype.setFilter = function(str) { 
  if(this.filterInput_) { 
    this.filterInput_.value = str; 
    this.filterItems_(str); 
  } 
}; 
goog.ui.FilteredMenu.prototype.getFilter = function() { 
  return this.filterInput_ && goog.isString(this.filterInput_.value) ? this.filterInput_.value: ''; 
}; 
goog.ui.FilteredMenu.prototype.setFilterFromIndex = function(index) { 
  this.filterFromIndex_ = index; 
}; 
goog.ui.FilteredMenu.prototype.getFilterFromIndex = function() { 
  return this.filterFromIndex_; 
}; 
goog.ui.FilteredMenu.prototype.getEnteredItems = function() { 
  return this.enteredItems_ ||[]; 
}; 
goog.ui.FilteredMenu.prototype.setAllowMultiple = function(b) { 
  this.allowMultiple_ = b; 
}; 
goog.ui.FilteredMenu.prototype.getAllowMultiple = function() { 
  return this.allowMultiple_; 
}; 
goog.ui.FilteredMenu.prototype.setPersistentVisibility = function(child, persistent) { 
  if(! this.persistentChildren_) { 
    this.persistentChildren_ = { }; 
  } 
  this.persistentChildren_[child.getId()]= persistent; 
}; 
goog.ui.FilteredMenu.prototype.hasPersistentVisibility = function(child) { 
  return ! !(this.persistentChildren_ && this.persistentChildren_[child.getId()]); 
}; 
goog.ui.FilteredMenu.prototype.handleFilterEvent = function(e) { 
  this.filterItems_(this.filterInput_.value); 
  var highlighted = this.getHighlighted(); 
  if(! highlighted || ! highlighted.isVisible()) { 
    this.highlightFirst(); 
  } 
  this.dispatchEvent(goog.ui.FilteredMenu.EventType.FILTER_CHANGED); 
}; 
goog.ui.FilteredMenu.prototype.filterItems_ = function(str) { 
  if(this.filterStr_ == str) { 
    return; 
  } 
  if(this.labelEl_) { 
    this.labelEl_.style.visibility = str == '' ? 'visible': 'hidden'; 
  } 
  if(this.allowMultiple_ && this.enteredItems_) { 
    var lastWordRegExp = /^(.+),[ ]*([^,]*)$/; 
    var matches = str.match(lastWordRegExp); 
    var items = matches && matches[1]? matches[1].split(','):[]; 
    if(str.substr(str.length - 1, 1) == ',' || items.length != this.enteredItems_.length) { 
      var lastItem = items[items.length - 1]|| ''; 
      if(this.getHighlighted() && lastItem != '') { 
        var caption = this.getHighlighted().getCaption(); 
        if(caption.toLowerCase().indexOf(lastItem.toLowerCase()) == 0) { 
          items[items.length - 1]= caption; 
          this.filterInput_.value = items.join(',') + ','; 
        } 
      } 
      this.enteredItems_ = items; 
      this.dispatchEvent(goog.ui.Component.EventType.CHANGE); 
      this.setHighlightedIndex(- 1); 
    } 
    if(matches) { 
      str = matches.length > 2 ? goog.string.trim(matches[2]): ''; 
    } 
  } 
  var matcher = new RegExp('(^|[- ,_/.:])' + goog.string.regExpEscape(str), 'i'); 
  for(var child, i = this.filterFromIndex_; child = this.getChildAt(i); i ++) { 
    if(child instanceof goog.ui.FilterObservingMenuItem) { 
      child.callObserver(str); 
    } else if(! this.hasPersistentVisibility(child)) { 
      var caption = child.getCaption(); 
      if(caption) { 
        var matchArray = caption.match(matcher); 
        if(str == '' || matchArray) { 
          child.setVisible(true); 
          var pos = caption.indexOf(matchArray[0]); 
          if(pos) { 
            pos ++; 
          } 
          if(str == '') { 
            child.setContent(caption); 
          } else { 
            child.setContent(this.getDomHelper().createDom('span', null, caption.substr(0, pos), this.getDomHelper().createDom('b', null, caption.substr(pos, str.length)), caption.substr(pos + str.length, caption.length - str.length - pos))); 
          } 
        } else { 
          child.setVisible(false); 
        } 
      } else { 
        child.setVisible(str == ''); 
      } 
    } 
  } 
  this.filterStr_ = str; 
}; 
goog.ui.FilteredMenu.prototype.handleKeyEvent = function(e) { 
  if(e.shiftKey || e.ctrlKey || e.altKey || e.keyCode == goog.events.KeyCodes.HOME || e.keyCode == goog.events.KeyCodes.END) { 
    return false; 
  } 
  if(e.keyCode == goog.events.KeyCodes.ESC) { 
    this.dispatchEvent(goog.ui.Component.EventType.BLUR); 
    return true; 
  } 
  return goog.ui.FilteredMenu.superClass_.handleKeyEvent.call(this, e); 
}; 
goog.ui.FilteredMenu.prototype.setHighlightedIndex = function(index) { 
  goog.ui.FilteredMenu.superClass_.setHighlightedIndex.call(this, index); 
  var contentEl = this.getContentElement(); 
  var el = this.getHighlighted() ? this.getHighlighted().getElement(): null; 
  if(el && goog.dom.contains(contentEl, el)) { 
    var contTop = goog.userAgent.IE ? 0: contentEl.offsetTop; 
    var diff =(el.offsetTop + el.offsetHeight - contTop) -(contentEl.clientHeight + contentEl.scrollTop); 
    contentEl.scrollTop += Math.max(diff, 0); 
    diff = contentEl.scrollTop -(el.offsetTop - contTop); 
    contentEl.scrollTop -= Math.max(diff, 0); 
  } 
}; 
goog.ui.FilteredMenu.prototype.onFilterLabelClick_ = function(e) { 
  this.filterInput_.focus(); 
}; 
goog.ui.FilteredMenu.prototype.getContentElement = function() { 
  return this.contentElement_ || this.getElement(); 
}; 
goog.ui.FilteredMenu.prototype.getFilterInputElement = function() { 
  return this.filterInput_ || null; 
}; 
goog.ui.FilteredMenu.prototype.decorateInternal = function(element) { 
  this.setElementInternal(element); 
  this.decorateContent(element); 
  var el = this.getDomHelper().getElementsByTagNameAndClass('div', goog.getCssName(this.getRenderer().getCssClass(), 'filter'), element)[0]; 
  this.labelEl_ = goog.dom.getFirstElementChild(el); 
  this.filterInput_ = goog.dom.getNextElementSibling(this.labelEl_); 
  this.contentElement_ = goog.dom.getNextElementSibling(el); 
  this.getRenderer().decorateChildren(this, el.parentNode, this.contentElement_); 
  this.initFilterInput_(); 
}; 
