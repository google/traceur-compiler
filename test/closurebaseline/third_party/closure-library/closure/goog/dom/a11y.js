
goog.provide('goog.dom.a11y'); 
goog.provide('goog.dom.a11y.Role'); 
goog.provide('goog.dom.a11y.State'); 
goog.require('goog.dom'); 
goog.dom.a11y.State = { 
  ACTIVEDESCENDANT: 'activedescendant', 
  ATOMIC: 'atomic', 
  AUTOCOMPLETE: 'autocomplete', 
  BUSY: 'busy', 
  CHECKED: 'checked', 
  CONTROLS: 'controls', 
  DESCRIBEDBY: 'describedby', 
  DISABLED: 'disabled', 
  DROPEFFECT: 'dropeffect', 
  EXPANDED: 'expanded', 
  FLOWTO: 'flowto', 
  GRABBED: 'grabbed', 
  HASPOPUP: 'haspopup', 
  HIDDEN: 'hidden', 
  INVALID: 'invalid', 
  LABEL: 'label', 
  LABELLEDBY: 'labelledby', 
  LEVEL: 'level', 
  LIVE: 'live', 
  MULTILINE: 'multiline', 
  MULTISELECTABLE: 'multiselectable', 
  ORIENTATION: 'orientation', 
  OWNS: 'owns', 
  POSINSET: 'posinset', 
  PRESSED: 'pressed', 
  READONLY: 'readonly', 
  RELEVANT: 'relevant', 
  REQUIRED: 'required', 
  SELECTED: 'selected', 
  SETSIZE: 'setsize', 
  SORT: 'sort', 
  VALUEMAX: 'valuemax', 
  VALUEMIN: 'valuemin', 
  VALUENOW: 'valuenow', 
  VALUETEXT: 'valuetext' 
}; 
goog.dom.a11y.Role = { 
  ALERT: 'alert', 
  ALERTDIALOG: 'alertdialog', 
  APPLICATION: 'application', 
  ARTICLE: 'article', 
  BANNER: 'banner', 
  BUTTON: 'button', 
  CHECKBOX: 'checkbox', 
  COLUMNHEADER: 'columnheader', 
  COMBOBOX: 'combobox', 
  COMPLEMENTARY: 'complementary', 
  DIALOG: 'dialog', 
  DIRECTORY: 'directory', 
  DOCUMENT: 'document', 
  FORM: 'form', 
  GRID: 'grid', 
  GRIDCELL: 'gridcell', 
  GROUP: 'group', 
  HEADING: 'heading', 
  IMG: 'img', 
  LINK: 'link', 
  LIST: 'list', 
  LISTBOX: 'listbox', 
  LISTITEM: 'listitem', 
  LOG: 'log', 
  MAIN: 'main', 
  MARQUEE: 'marquee', 
  MATH: 'math', 
  MENU: 'menu', 
  MENUBAR: 'menubar', 
  MENU_ITEM: 'menuitem', 
  MENU_ITEM_CHECKBOX: 'menuitemcheckbox', 
  MENU_ITEM_RADIO: 'menuitemradio', 
  NAVIGATION: 'navigation', 
  NOTE: 'note', 
  OPTION: 'option', 
  PRESENTATION: 'presentation', 
  PROGRESSBAR: 'progressbar', 
  RADIO: 'radio', 
  RADIOGROUP: 'radiogroup', 
  REGION: 'region', 
  ROW: 'row', 
  ROWGROUP: 'rowgroup', 
  ROWHEADER: 'rowheader', 
  SCROLLBAR: 'scrollbar', 
  SEARCH: 'search', 
  SEPARATOR: 'separator', 
  SLIDER: 'slider', 
  SPINBUTTON: 'spinbutton', 
  STATUS: 'status', 
  TAB: 'tab', 
  TAB_LIST: 'tablist', 
  TAB_PANEL: 'tabpanel', 
  TEXTBOX: 'textbox', 
  TIMER: 'timer', 
  TOOLBAR: 'toolbar', 
  TOOLTIP: 'tooltip', 
  TREE: 'tree', 
  TREEGRID: 'treegrid', 
  TREEITEM: 'treeitem' 
}; 
goog.dom.a11y.setRole = function(element, roleName) { 
  element.setAttribute('role', roleName); 
  element.roleName = roleName; 
}; 
goog.dom.a11y.getRole = function(element) { 
  return element.roleName || ''; 
}; 
goog.dom.a11y.setState = function(element, state, value) { 
  element.setAttribute('aria-' + state, value); 
}; 
goog.dom.a11y.getState = function(element, stateName) { 
  var attrb =(element.getAttribute('aria-' + stateName)); 
  if((attrb === true) ||(attrb === false)) { 
    return attrb ? 'true': 'false'; 
  } else if(! attrb) { 
    return ''; 
  } else { 
    return String(attrb); 
  } 
}; 
goog.dom.a11y.getActiveDescendant = function(element) { 
  var id = goog.dom.a11y.getState(element, goog.dom.a11y.State.ACTIVEDESCENDANT); 
  return goog.dom.getOwnerDocument(element).getElementById(id); 
}; 
goog.dom.a11y.setActiveDescendant = function(element, activeElement) { 
  goog.dom.a11y.setState(element, goog.dom.a11y.State.ACTIVEDESCENDANT, activeElement ? activeElement.id: ''); 
}; 
