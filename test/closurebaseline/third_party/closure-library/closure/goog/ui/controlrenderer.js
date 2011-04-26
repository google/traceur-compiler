
goog.provide('goog.ui.ControlRenderer'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.a11y.State'); 
goog.require('goog.dom.classes'); 
goog.require('goog.object'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.userAgent'); 
goog.ui.ControlRenderer = function() { }; 
goog.addSingletonGetter(goog.ui.ControlRenderer); 
goog.ui.ControlRenderer.getCustomRenderer = function(ctor, cssClassName) { 
  var renderer = new ctor(); 
  renderer.getCssClass = function() { 
    return cssClassName; 
  }; 
  return renderer; 
}; 
goog.ui.ControlRenderer.CSS_CLASS = goog.getCssName('goog-control'); 
goog.ui.ControlRenderer.IE6_CLASS_COMBINATIONS =[]; 
goog.ui.ControlRenderer.ARIA_STATE_MAP_; 
goog.ui.ControlRenderer.prototype.getAriaRole = function() { 
  return undefined; 
}; 
goog.ui.ControlRenderer.prototype.createDom = function(control) { 
  return control.getDomHelper().createDom('div', this.getClassNames(control).join(' '), control.getContent()); 
}; 
goog.ui.ControlRenderer.prototype.getContentElement = function(element) { 
  return element; 
}; 
goog.ui.ControlRenderer.prototype.enableClassName = function(control, className, enable) { 
  var element =(control.getElement ? control.getElement(): control); 
  if(element) { 
    if(goog.userAgent.IE && ! goog.userAgent.isVersion('7')) { 
      var combinedClasses = this.getAppliedCombinedClassNames_(goog.dom.classes.get(element), className); 
      combinedClasses.push(className); 
      var f = enable ? goog.dom.classes.add: goog.dom.classes.remove; 
      goog.partial(f, element).apply(null, combinedClasses); 
    } else { 
      goog.dom.classes.enable(element, className, enable); 
    } 
  } 
}; 
goog.ui.ControlRenderer.prototype.enableExtraClassName = function(control, className, enable) { 
  this.enableClassName(control, className, enable); 
}; 
goog.ui.ControlRenderer.prototype.canDecorate = function(element) { 
  return true; 
}; 
goog.ui.ControlRenderer.prototype.decorate = function(control, element) { 
  if(element.id) { 
    control.setId(element.id); 
  } 
  var contentElem = this.getContentElement(element); 
  if(contentElem && contentElem.firstChild) { 
    control.setContentInternal(contentElem.firstChild.nextSibling ? goog.array.clone(contentElem.childNodes): contentElem.firstChild); 
  } else { 
    control.setContentInternal(null); 
  } 
  var state = 0x00; 
  var rendererClassName = this.getCssClass(); 
  var structuralClassName = this.getStructuralCssClass(); 
  var hasRendererClassName = false; 
  var hasStructuralClassName = false; 
  var hasCombinedClassName = false; 
  var classNames = goog.dom.classes.get(element); 
  goog.array.forEach(classNames, function(className) { 
    if(! hasRendererClassName && className == rendererClassName) { 
      hasRendererClassName = true; 
      if(structuralClassName == rendererClassName) { 
        hasStructuralClassName = true; 
      } 
    } else if(! hasStructuralClassName && className == structuralClassName) { 
      hasStructuralClassName = true; 
    } else { 
      state |= this.getStateFromClass(className); 
    } 
  }, this); 
  control.setStateInternal(state); 
  if(! hasRendererClassName) { 
    classNames.push(rendererClassName); 
    if(structuralClassName == rendererClassName) { 
      hasStructuralClassName = true; 
    } 
  } 
  if(! hasStructuralClassName) { 
    classNames.push(structuralClassName); 
  } 
  var extraClassNames = control.getExtraClassNames(); 
  if(extraClassNames) { 
    classNames.push.apply(classNames, extraClassNames); 
  } 
  if(goog.userAgent.IE && ! goog.userAgent.isVersion('7')) { 
    var combinedClasses = this.getAppliedCombinedClassNames_(classNames); 
    if(combinedClasses.length > 0) { 
      classNames.push.apply(classNames, combinedClasses); 
      hasCombinedClassName = true; 
    } 
  } 
  if(! hasRendererClassName || ! hasStructuralClassName || extraClassNames || hasCombinedClassName) { 
    goog.dom.classes.set(element, classNames.join(' ')); 
  } 
  return element; 
}; 
goog.ui.ControlRenderer.prototype.initializeDom = function(control) { 
  if(control.isRightToLeft()) { 
    this.setRightToLeft(control.getElement(), true); 
  } 
  if(control.isEnabled()) { 
    this.setFocusable(control, control.isVisible()); 
  } 
}; 
goog.ui.ControlRenderer.prototype.setAriaRole = function(element) { 
  var ariaRole = this.getAriaRole(); 
  if(ariaRole) { 
    goog.dom.a11y.setRole(element, ariaRole); 
  } 
}; 
goog.ui.ControlRenderer.prototype.setAllowTextSelection = function(element, allow) { 
  goog.style.setUnselectable(element, ! allow, ! goog.userAgent.IE && ! goog.userAgent.OPERA); 
}; 
goog.ui.ControlRenderer.prototype.setRightToLeft = function(element, rightToLeft) { 
  this.enableClassName(element, goog.getCssName(this.getStructuralCssClass(), 'rtl'), rightToLeft); 
}; 
goog.ui.ControlRenderer.prototype.isFocusable = function(control) { 
  var keyTarget; 
  if(control.isSupportedState(goog.ui.Component.State.FOCUSED) &&(keyTarget = control.getKeyEventTarget())) { 
    return goog.dom.isFocusableTabIndex(keyTarget); 
  } 
  return false; 
}; 
goog.ui.ControlRenderer.prototype.setFocusable = function(control, focusable) { 
  var keyTarget; 
  if(control.isSupportedState(goog.ui.Component.State.FOCUSED) &&(keyTarget = control.getKeyEventTarget())) { 
    if(! focusable && control.isFocused()) { 
      try { 
        keyTarget.blur(); 
      } catch(e) { } 
      if(control.isFocused()) { 
        control.handleBlur(null); 
      } 
    } 
    if(goog.dom.isFocusableTabIndex(keyTarget) != focusable) { 
      goog.dom.setFocusableTabIndex(keyTarget, focusable); 
    } 
  } 
}; 
goog.ui.ControlRenderer.prototype.setVisible = function(element, visible) { 
  goog.style.showElement(element, visible); 
}; 
goog.ui.ControlRenderer.prototype.setState = function(control, state, enable) { 
  var element = control.getElement(); 
  if(element) { 
    var className = this.getClassForState(state); 
    if(className) { 
      this.enableClassName(control, className, enable); 
    } 
    this.updateAriaState(element, state, enable); 
  } 
}; 
goog.ui.ControlRenderer.prototype.updateAriaState = function(element, state, enable) { 
  if(! goog.ui.ControlRenderer.ARIA_STATE_MAP_) { 
    goog.ui.ControlRenderer.ARIA_STATE_MAP_ = goog.object.create(goog.ui.Component.State.DISABLED, goog.dom.a11y.State.DISABLED, goog.ui.Component.State.ACTIVE, goog.dom.a11y.State.PRESSED, goog.ui.Component.State.SELECTED, goog.dom.a11y.State.SELECTED, goog.ui.Component.State.CHECKED, goog.dom.a11y.State.CHECKED, goog.ui.Component.State.OPENED, goog.dom.a11y.State.EXPANDED); 
  } 
  var ariaState = goog.ui.ControlRenderer.ARIA_STATE_MAP_[state]; 
  if(ariaState) { 
    goog.dom.a11y.setState(element, ariaState, enable); 
  } 
}; 
goog.ui.ControlRenderer.prototype.setContent = function(element, content) { 
  var contentElem = this.getContentElement(element); 
  if(contentElem) { 
    goog.dom.removeChildren(contentElem); 
    if(content) { 
      if(goog.isString(content)) { 
        goog.dom.setTextContent(contentElem, content); 
      } else { 
        var childHandler = function(child) { 
          if(child) { 
            var doc = goog.dom.getOwnerDocument(contentElem); 
            contentElem.appendChild(goog.isString(child) ? doc.createTextNode(child): child); 
          } 
        }; 
        if(goog.isArray(content)) { 
          goog.array.forEach(content, childHandler); 
        } else if(goog.isArrayLike(content) && !('nodeType' in content)) { 
          goog.array.forEach(goog.array.clone((content)), childHandler); 
        } else { 
          childHandler(content); 
        } 
      } 
    } 
  } 
}; 
goog.ui.ControlRenderer.prototype.getKeyEventTarget = function(control) { 
  return control.getElement(); 
}; 
goog.ui.ControlRenderer.prototype.getCssClass = function() { 
  return goog.ui.ControlRenderer.CSS_CLASS; 
}; 
goog.ui.ControlRenderer.prototype.getIe6ClassCombinations = function() { 
  return[]; 
}; 
goog.ui.ControlRenderer.prototype.getStructuralCssClass = function() { 
  return this.getCssClass(); 
}; 
goog.ui.ControlRenderer.prototype.getClassNames = function(control) { 
  var cssClass = this.getCssClass(); 
  var classNames =[cssClass]; 
  var structuralCssClass = this.getStructuralCssClass(); 
  if(structuralCssClass != cssClass) { 
    classNames.push(structuralCssClass); 
  } 
  var classNamesForState = this.getClassNamesForState(control.getState()); 
  classNames.push.apply(classNames, classNamesForState); 
  var extraClassNames = control.getExtraClassNames(); 
  if(extraClassNames) { 
    classNames.push.apply(classNames, extraClassNames); 
  } 
  if(goog.userAgent.IE && ! goog.userAgent.isVersion('7')) { 
    classNames.push.apply(classNames, this.getAppliedCombinedClassNames_(classNames)); 
  } 
  return classNames; 
}; 
goog.ui.ControlRenderer.prototype.getAppliedCombinedClassNames_ = function(classes, opt_includedClass) { 
  var toAdd =[]; 
  if(opt_includedClass) { 
    classes = classes.concat([opt_includedClass]); 
  } 
  goog.array.forEach(this.getIe6ClassCombinations(), function(combo) { 
    if(goog.array.every(combo, goog.partial(goog.array.contains, classes)) &&(! opt_includedClass || goog.array.contains(combo, opt_includedClass))) { 
      toAdd.push(combo.join('_')); 
    } 
  }); 
  return toAdd; 
}; 
goog.ui.ControlRenderer.prototype.getClassNamesForState = function(state) { 
  var classNames =[]; 
  while(state) { 
    var mask = state & - state; 
    classNames.push(this.getClassForState((mask))); 
    state &= ~ mask; 
  } 
  return classNames; 
}; 
goog.ui.ControlRenderer.prototype.getClassForState = function(state) { 
  if(! this.classByState_) { 
    this.createClassByStateMap_(); 
  } 
  return this.classByState_[state]; 
}; 
goog.ui.ControlRenderer.prototype.getStateFromClass = function(className) { 
  if(! this.stateByClass_) { 
    this.createStateByClassMap_(); 
  } 
  var state = parseInt(this.stateByClass_[className], 10); 
  return(isNaN(state) ? 0x00: state); 
}; 
goog.ui.ControlRenderer.prototype.createClassByStateMap_ = function() { 
  var baseClass = this.getStructuralCssClass(); 
  this.classByState_ = goog.object.create(goog.ui.Component.State.DISABLED, goog.getCssName(baseClass, 'disabled'), goog.ui.Component.State.HOVER, goog.getCssName(baseClass, 'hover'), goog.ui.Component.State.ACTIVE, goog.getCssName(baseClass, 'active'), goog.ui.Component.State.SELECTED, goog.getCssName(baseClass, 'selected'), goog.ui.Component.State.CHECKED, goog.getCssName(baseClass, 'checked'), goog.ui.Component.State.FOCUSED, goog.getCssName(baseClass, 'focused'), goog.ui.Component.State.OPENED, goog.getCssName(baseClass, 'open')); 
}; 
goog.ui.ControlRenderer.prototype.createStateByClassMap_ = function() { 
  if(! this.classByState_) { 
    this.createClassByStateMap_(); 
  } 
  this.stateByClass_ = goog.object.transpose(this.classByState_); 
}; 
