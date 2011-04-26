
goog.provide('goog.ui.MenuItemRenderer'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.a11y.Role'); 
goog.require('goog.dom.classes'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.ControlRenderer'); 
goog.ui.MenuItemRenderer = function() { 
  goog.ui.ControlRenderer.call(this); 
  this.classNameCache_ =[]; 
}; 
goog.inherits(goog.ui.MenuItemRenderer, goog.ui.ControlRenderer); 
goog.addSingletonGetter(goog.ui.MenuItemRenderer); 
goog.ui.MenuItemRenderer.CSS_CLASS = goog.getCssName('goog-menuitem'); 
goog.ui.MenuItemRenderer.CompositeCssClassIndex_ = { 
  HOVER: 0, 
  CHECKBOX: 1, 
  CONTENT: 2 
}; 
goog.ui.MenuItemRenderer.prototype.getCompositeCssClass_ = function(index) { 
  var result = this.classNameCache_[index]; 
  if(! result) { 
    switch(index) { 
      case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER: 
        result = goog.getCssName(this.getStructuralCssClass(), 'highlight'); 
        break; 

      case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX: 
        result = goog.getCssName(this.getStructuralCssClass(), 'checkbox'); 
        break; 

      case goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT: 
        result = goog.getCssName(this.getStructuralCssClass(), 'content'); 
        break; 

    } 
    this.classNameCache_[index]= result; 
  } 
  return result; 
}; 
goog.ui.MenuItemRenderer.prototype.getAriaRole = function() { 
  return goog.dom.a11y.Role.MENU_ITEM; 
}; 
goog.ui.MenuItemRenderer.prototype.createDom = function(item) { 
  var element = item.getDomHelper().createDom('div', this.getClassNames(item).join(' '), this.createContent(item.getContent(), item.getDomHelper())); 
  this.setEnableCheckBoxStructure(item, element, item.isSupportedState(goog.ui.Component.State.SELECTED) || item.isSupportedState(goog.ui.Component.State.CHECKED)); 
  return element; 
}; 
goog.ui.MenuItemRenderer.prototype.getContentElement = function(element) { 
  return(element && element.firstChild); 
}; 
goog.ui.MenuItemRenderer.prototype.decorate = function(item, element) { 
  if(! this.hasContentStructure(element)) { 
    element.appendChild(this.createContent(element.childNodes, item.getDomHelper())); 
  } 
  if(goog.dom.classes.has(element, goog.getCssName('goog-option'))) { 
    item.setCheckable(true); 
    this.setCheckable(item, element, true); 
  } 
  return goog.ui.MenuItemRenderer.superClass_.decorate.call(this, item, element); 
}; 
goog.ui.MenuItemRenderer.prototype.setContent = function(element, content) { 
  var contentElement = this.getContentElement(element); 
  var checkBoxElement = this.hasCheckBoxStructure(element) ? contentElement.firstChild: null; 
  goog.ui.MenuItemRenderer.superClass_.setContent.call(this, element, content); 
  if(checkBoxElement && ! this.hasCheckBoxStructure(element)) { 
    contentElement.insertBefore(checkBoxElement, contentElement.firstChild || null); 
  } 
}; 
goog.ui.MenuItemRenderer.prototype.hasContentStructure = function(element) { 
  var child = goog.dom.getFirstElementChild(element); 
  var contentClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT); 
  return ! ! child && child.className.indexOf(contentClassName) != - 1; 
}; 
goog.ui.MenuItemRenderer.prototype.createContent = function(content, dom) { 
  var contentClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CONTENT); 
  return dom.createDom('div', contentClassName, content); 
}; 
goog.ui.MenuItemRenderer.prototype.setSelectable = function(item, element, selectable) { 
  if(element) { 
    goog.dom.a11y.setRole(element, selectable ? goog.dom.a11y.Role.MENU_ITEM_RADIO: this.getAriaRole()); 
    this.setEnableCheckBoxStructure(item, element, selectable); 
  } 
}; 
goog.ui.MenuItemRenderer.prototype.setCheckable = function(item, element, checkable) { 
  if(element) { 
    goog.dom.a11y.setRole(element, checkable ? goog.dom.a11y.Role.MENU_ITEM_CHECKBOX: this.getAriaRole()); 
    this.setEnableCheckBoxStructure(item, element, checkable); 
  } 
}; 
goog.ui.MenuItemRenderer.prototype.hasCheckBoxStructure = function(element) { 
  var contentElement = this.getContentElement(element); 
  if(contentElement) { 
    var child = contentElement.firstChild; 
    var checkboxClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX); 
    return ! ! child && ! ! child.className && child.className.indexOf(checkboxClassName) != - 1; 
  } 
  return false; 
}; 
goog.ui.MenuItemRenderer.prototype.setEnableCheckBoxStructure = function(item, element, enable) { 
  if(enable != this.hasCheckBoxStructure(element)) { 
    goog.dom.classes.enable(element, goog.getCssName('goog-option'), enable); 
    var contentElement = this.getContentElement(element); 
    if(enable) { 
      var checkboxClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.CHECKBOX); 
      contentElement.insertBefore(item.getDomHelper().createDom('div', checkboxClassName), contentElement.firstChild || null); 
    } else { 
      contentElement.removeChild(contentElement.firstChild); 
    } 
  } 
}; 
goog.ui.MenuItemRenderer.prototype.getClassForState = function(state) { 
  switch(state) { 
    case goog.ui.Component.State.HOVER: 
      return this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER); 

    case goog.ui.Component.State.CHECKED: 
    case goog.ui.Component.State.SELECTED: 
      return goog.getCssName('goog-option-selected'); 

    default: 
      return goog.ui.MenuItemRenderer.superClass_.getClassForState.call(this, state); 

  } 
}; 
goog.ui.MenuItemRenderer.prototype.getStateFromClass = function(className) { 
  var hoverClassName = this.getCompositeCssClass_(goog.ui.MenuItemRenderer.CompositeCssClassIndex_.HOVER); 
  switch(className) { 
    case goog.getCssName('goog-option-selected'): 
      return goog.ui.Component.State.CHECKED; 

    case hoverClassName: 
      return goog.ui.Component.State.HOVER; 

    default: 
      return goog.ui.MenuItemRenderer.superClass_.getStateFromClass.call(this, className); 

  } 
}; 
goog.ui.MenuItemRenderer.prototype.getCssClass = function() { 
  return goog.ui.MenuItemRenderer.CSS_CLASS; 
}; 
