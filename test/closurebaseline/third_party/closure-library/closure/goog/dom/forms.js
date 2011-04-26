
goog.provide('goog.dom.forms'); 
goog.require('goog.structs.Map'); 
goog.dom.forms.getFormDataMap = function(form) { 
  var map = new goog.structs.Map(); 
  goog.dom.forms.getFormDataHelper_(form, map, goog.dom.forms.addFormDataToMap_); 
  return map; 
}; 
goog.dom.forms.getFormDataString = function(form) { 
  var sb =[]; 
  goog.dom.forms.getFormDataHelper_(form, sb, goog.dom.forms.addFormDataToStringBuffer_); 
  return sb.join('&'); 
}; 
goog.dom.forms.getFormDataHelper_ = function(form, result, fnAppend) { 
  var els = form.elements; 
  for(var el, i = 0; el = els[i]; i ++) { 
    if(el.disabled || el.tagName.toLowerCase() == 'fieldset') { 
      continue; 
    } 
    var name = el.name; 
    var type = el.type.toLowerCase(); 
    switch(type) { 
      case 'file': 
      case 'submit': 
      case 'reset': 
      case 'button': 
        break; 

      case 'select-multiple': 
        var values = goog.dom.forms.getValue(el); 
        if(values != null) { 
          for(var value, j = 0; value = values[j]; j ++) { 
            fnAppend(result, name, value); 
          } 
        } 
        break; 

      default: 
        var value = goog.dom.forms.getValue(el); 
        if(value != null) { 
          fnAppend(result, name, value); 
        } 

    } 
  } 
  var inputs = form.getElementsByTagName('input'); 
  for(var input, i = 0; input = inputs[i]; i ++) { 
    if(input.form == form && input.type.toLowerCase() == 'image') { 
      name = input.name; 
      fnAppend(result, name, input.value); 
      fnAppend(result, name + '.x', '0'); 
      fnAppend(result, name + '.y', '0'); 
    } 
  } 
}; 
goog.dom.forms.addFormDataToMap_ = function(map, name, value) { 
  var array = map.get(name); 
  if(! array) { 
    array =[]; 
    map.set(name, array); 
  } 
  array.push(value); 
}; 
goog.dom.forms.addFormDataToStringBuffer_ = function(sb, name, value) { 
  sb.push(encodeURIComponent(name) + '=' + encodeURIComponent(value)); 
}; 
goog.dom.forms.hasFileInput = function(form) { 
  var els = form.elements; 
  for(var el, i = 0; el = els[i]; i ++) { 
    if(! el.disabled && el.type && el.type.toLowerCase() == 'file') { 
      return true; 
    } 
  } 
  return false; 
}; 
goog.dom.forms.setDisabled = function(el, disabled) { 
  if(el.tagName == 'FORM') { 
    var els = el.elements; 
    for(var i = 0; el = els[i]; i ++) { 
      goog.dom.forms.setDisabled(el, disabled); 
    } 
  } else { 
    if(disabled == true) { 
      el.blur(); 
    } 
    el.disabled = disabled; 
  } 
}; 
goog.dom.forms.focusAndSelect = function(el) { 
  el.focus(); 
  if(el.select) { 
    el.select(); 
  } 
}; 
goog.dom.forms.hasValue = function(el) { 
  var value = goog.dom.forms.getValue(el); 
  return ! ! value; 
}; 
goog.dom.forms.hasValueByName = function(form, name) { 
  var value = goog.dom.forms.getValueByName(form, name); 
  return ! ! value; 
}; 
goog.dom.forms.getValue = function(el) { 
  var type = el.type; 
  if(! goog.isDef(type)) { 
    return null; 
  } 
  switch(type.toLowerCase()) { 
    case 'checkbox': 
    case 'radio': 
      return goog.dom.forms.getInputChecked_(el); 

    case 'select-one': 
      return goog.dom.forms.getSelectSingle_(el); 

    case 'select-multiple': 
      return goog.dom.forms.getSelectMultiple_(el); 

    default: 
      return goog.isDef(el.value) ? el.value: null; 

  } 
}; 
goog.dom.$F = goog.dom.forms.getValue; 
goog.dom.forms.getValueByName = function(form, name) { 
  var els = form.elements[name]; 
  if(els.type) { 
    return goog.dom.forms.getValue(els); 
  } else { 
    for(var i = 0; i < els.length; i ++) { 
      var val = goog.dom.forms.getValue(els[i]); 
      if(val) { 
        return val; 
      } 
    } 
    return null; 
  } 
}; 
goog.dom.forms.getInputChecked_ = function(el) { 
  return el.checked ? el.value: null; 
}; 
goog.dom.forms.getSelectSingle_ = function(el) { 
  var selectedIndex = el.selectedIndex; 
  return selectedIndex >= 0 ? el.options[selectedIndex].value: null; 
}; 
goog.dom.forms.getSelectMultiple_ = function(el) { 
  var values =[]; 
  for(var option, i = 0; option = el.options[i]; i ++) { 
    if(option.selected) { 
      values.push(option.value); 
    } 
  } 
  return values.length ? values: null; 
}; 
goog.dom.forms.setValue = function(el, opt_value) { 
  var type = el.type; 
  if(goog.isDef(type)) { 
    switch(type.toLowerCase()) { 
      case 'checkbox': 
      case 'radio': 
        goog.dom.forms.setInputChecked_(el,(opt_value)); 
        break; 

      case 'select-one': 
        goog.dom.forms.setSelectSingle_(el,(opt_value)); 
        break; 

      case 'select-multiple': 
        goog.dom.forms.setSelectMultiple_(el,(opt_value)); 
        break; 

      default: 
        el.value = goog.isDefAndNotNull(opt_value) ? opt_value: ''; 

    } 
  } 
}; 
goog.dom.forms.setInputChecked_ = function(el, opt_value) { 
  el.checked = opt_value ? 'checked': null; 
}; 
goog.dom.forms.setSelectSingle_ = function(el, opt_value) { 
  el.selectedIndex = - 1; 
  if(goog.isString(opt_value)) { 
    for(var option, i = 0; option = el.options[i]; i ++) { 
      if(option.value == opt_value) { 
        option.selected = true; 
        break; 
      } 
    } 
  } 
}; 
goog.dom.forms.setSelectMultiple_ = function(el, opt_value) { 
  if(goog.isString(opt_value)) { 
    opt_value =[opt_value]; 
  } 
  for(var option, i = 0; option = el.options[i]; i ++) { 
    option.selected = false; 
    if(opt_value) { 
      for(var value, j = 0; value = opt_value[j]; j ++) { 
        if(option.value == value) { 
          option.selected = true; 
        } 
      } 
    } 
  } 
}; 
