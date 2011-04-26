
goog.provide('goog.ui.CheckboxRenderer'); 
goog.require('goog.array'); 
goog.require('goog.asserts'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.a11y.Role'); 
goog.require('goog.dom.a11y.State'); 
goog.require('goog.dom.classes'); 
goog.require('goog.object'); 
goog.require('goog.ui.ControlRenderer'); 
goog.ui.CheckboxRenderer = function() { 
  goog.base(this); 
}; 
goog.inherits(goog.ui.CheckboxRenderer, goog.ui.ControlRenderer); 
goog.addSingletonGetter(goog.ui.CheckboxRenderer); 
goog.ui.CheckboxRenderer.CSS_CLASS = goog.getCssName('goog-checkbox'); 
goog.ui.CheckboxRenderer.prototype.createDom = function(checkbox) { 
  var element = checkbox.getDomHelper().createDom('span', this.getClassNames(checkbox).join(' ')); 
  var state = checkbox.getChecked(); 
  this.setCheckboxState(element, state); 
  return element; 
}; 
goog.ui.CheckboxRenderer.prototype.decorate = function(checkbox, element) { 
  element = goog.base(this, 'decorate', checkbox, element); 
  var classes = goog.dom.classes.get(element); 
  var checked = goog.ui.Checkbox.State.UNCHECKED; 
  if(goog.array.contains(classes, this.getClassForCheckboxState(goog.ui.Checkbox.State.UNDETERMINED))) { 
    checked = goog.ui.Checkbox.State.UNDETERMINED; 
  } else if(goog.array.contains(classes, this.getClassForCheckboxState(goog.ui.Checkbox.State.CHECKED))) { 
    checked = goog.ui.Checkbox.State.CHECKED; 
  } else if(goog.array.contains(classes, this.getClassForCheckboxState(goog.ui.Checkbox.State.UNCHECKED))) { 
    checked = goog.ui.Checkbox.State.UNCHECKED; 
  } 
  checkbox.setCheckedInternal(checked); 
  return element; 
}; 
goog.ui.CheckboxRenderer.prototype.getAriaRole = function() { 
  return goog.dom.a11y.Role.CHECKBOX; 
}; 
goog.ui.CheckboxRenderer.prototype.setCheckboxState = function(element, state) { 
  if(element) { 
    var classToAdd = this.getClassForCheckboxState(state); 
    goog.asserts.assert(classToAdd); 
    if(goog.dom.classes.has(element, classToAdd)) { 
      return; 
    } 
    goog.object.forEach(goog.ui.Checkbox.State, function(state) { 
      var className = this.getClassForCheckboxState(state); 
      goog.dom.classes.enable(element, className, className == classToAdd); 
    }, this); 
    goog.dom.a11y.setState(element, goog.dom.a11y.State.CHECKED, this.ariaStateFromCheckState_(state)); 
  } 
}; 
goog.ui.CheckboxRenderer.prototype.ariaStateFromCheckState_ = function(state) { 
  if(state == goog.ui.Checkbox.State.UNDETERMINED) { 
    return 'mixed'; 
  } else if(state == goog.ui.Checkbox.State.CHECKED) { 
    return 'true'; 
  } else { 
    return 'false'; 
  } 
}; 
goog.ui.CheckboxRenderer.prototype.getCssClass = function() { 
  return goog.ui.CheckboxRenderer.CSS_CLASS; 
}; 
goog.ui.CheckboxRenderer.prototype.getClassForCheckboxState = function(state) { 
  var baseClass = this.getStructuralCssClass(); 
  if(state == goog.ui.Checkbox.State.CHECKED) { 
    return goog.getCssName(baseClass, 'checked'); 
  } else if(state == goog.ui.Checkbox.State.UNCHECKED) { 
    return goog.getCssName(baseClass, 'unchecked'); 
  } else if(state == goog.ui.Checkbox.State.UNDETERMINED) { 
    return goog.getCssName(baseClass, 'undetermined'); 
  } 
  throw Error('Invalid checkbox state: ' + state); 
}; 
