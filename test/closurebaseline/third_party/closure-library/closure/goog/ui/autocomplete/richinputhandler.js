
goog.provide('goog.ui.AutoComplete.RichInputHandler'); 
goog.require('goog.ui.AutoComplete'); 
goog.require('goog.ui.AutoComplete.InputHandler'); 
goog.ui.AutoComplete.RichInputHandler = function(opt_separators, opt_literals, opt_multi, opt_throttleTime) { 
  goog.ui.AutoComplete.InputHandler.call(this, opt_separators, opt_literals, opt_multi, opt_throttleTime); 
}; 
goog.inherits(goog.ui.AutoComplete.RichInputHandler, goog.ui.AutoComplete.InputHandler); 
goog.ui.AutoComplete.RichInputHandler.prototype.selectRow = function(row) { 
  var suppressUpdate = goog.ui.AutoComplete.RichInputHandler.superClass_.selectRow.call(this, row); 
  row.select(this.ac_.getTarget()); 
  return suppressUpdate; 
}; 
