
goog.provide('goog.ui.CustomColorPalette'); 
goog.require('goog.color'); 
goog.require('goog.dom'); 
goog.require('goog.ui.ColorPalette'); 
goog.ui.CustomColorPalette = function(initColors, opt_renderer, opt_domHelper) { 
  goog.ui.ColorPalette.call(this, initColors, opt_renderer, opt_domHelper); 
  this.setSupportedState(goog.ui.Component.State.OPENED, true); 
}; 
goog.inherits(goog.ui.CustomColorPalette, goog.ui.ColorPalette); 
goog.ui.CustomColorPalette.prototype.createColorNodes_ = function() { 
  var MSG_CLOSURE_CUSTOM_COLOR_BUTTON = goog.getMsg('Add a color'); 
  var nl = goog.ui.CustomColorPalette.superClass_.createColorNodes_.call(this); 
  nl.push(goog.dom.createDom('div', { 
    'class': goog.getCssName('goog-palette-customcolor'), 
    'title': MSG_CLOSURE_CUSTOM_COLOR_BUTTON 
  }, '+')); 
  return nl; 
}; 
goog.ui.CustomColorPalette.prototype.performActionInternal = function(e) { 
  var item =(this.getHighlightedItem()); 
  if(item) { 
    if(goog.dom.classes.has(item, goog.getCssName('goog-palette-customcolor'))) { 
      this.promptForCustomColor(); 
    } else { 
      this.setSelectedItem(item); 
      return this.dispatchEvent(goog.ui.Component.EventType.ACTION); 
    } 
  } 
  return false; 
}; 
goog.ui.CustomColorPalette.prototype.promptForCustomColor = function() { 
  var MSG_CLOSURE_CUSTOM_COLOR_PROMPT = goog.getMsg('Input custom color, i.e. pink, #F00, #D015FF or rgb(100, 50, 25)'); 
  var response = null; 
  this.setOpen(true); 
  if(this.isOpen()) { 
    response = window.prompt(MSG_CLOSURE_CUSTOM_COLOR_PROMPT, '#FFFFFF'); 
    this.setOpen(false); 
  } 
  if(! response) { 
    return; 
  } 
  var color; 
  try { 
    color = goog.color.parse(response).hex; 
  } catch(er) { 
    var MSG_CLOSURE_CUSTOM_COLOR_INVALID_INPUT = goog.getMsg('ERROR: "{$color}" is not a valid color.', { 'color': response }); 
    alert(MSG_CLOSURE_CUSTOM_COLOR_INVALID_INPUT); 
    return; 
  } 
  var colors = this.getColors(); 
  colors.push(color); 
  this.setColors(colors); 
  this.setSelectedColor(color); 
  this.dispatchEvent(goog.ui.Component.EventType.ACTION); 
}; 
