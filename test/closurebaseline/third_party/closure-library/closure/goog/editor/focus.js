
goog.provide('goog.editor.focus'); 
goog.require('goog.dom.selection'); 
goog.editor.focus.focusInputField = function(inputElem) { 
  inputElem.focus(); 
  goog.dom.selection.setCursorPosition(inputElem, inputElem.value.length); 
}; 
