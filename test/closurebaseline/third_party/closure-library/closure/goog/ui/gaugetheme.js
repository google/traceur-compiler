
goog.provide('goog.ui.GaugeTheme'); 
goog.require('goog.graphics.LinearGradient'); 
goog.require('goog.graphics.SolidFill'); 
goog.require('goog.graphics.Stroke'); 
goog.ui.GaugeTheme = function() { }; 
goog.ui.GaugeTheme.prototype.getExternalBorderStroke = function() { 
  return new goog.graphics.Stroke(1, '#333333'); 
}; 
goog.ui.GaugeTheme.prototype.getExternalBorderFill = function(cx, cy, r) { 
  return new goog.graphics.LinearGradient(cx + r, cy - r, cx - r, cy + r, '#f7f7f7', '#cccccc'); 
}; 
goog.ui.GaugeTheme.prototype.getInternalBorderStroke = function() { 
  return new goog.graphics.Stroke(2, '#e0e0e0'); 
}; 
goog.ui.GaugeTheme.prototype.getInternalBorderFill = function(cx, cy, r) { 
  return new goog.graphics.SolidFill('#f7f7f7'); 
}; 
goog.ui.GaugeTheme.prototype.getMajorTickStroke = function() { 
  return new goog.graphics.Stroke(2, '#333333'); 
}; 
goog.ui.GaugeTheme.prototype.getMinorTickStroke = function() { 
  return new goog.graphics.Stroke(1, '#666666'); 
}; 
goog.ui.GaugeTheme.prototype.getHingeStroke = function() { 
  return new goog.graphics.Stroke(1, '#666666'); 
}; 
goog.ui.GaugeTheme.prototype.getHingeFill = function(cx, cy, r) { 
  return new goog.graphics.LinearGradient(cx + r, cy - r, cx - r, cy + r, '#4684ee', '#3776d6'); 
}; 
goog.ui.GaugeTheme.prototype.getNeedleStroke = function() { 
  return new goog.graphics.Stroke(1, '#c63310'); 
}; 
goog.ui.GaugeTheme.prototype.getNeedleFill = function(cx, cy, r) { 
  return new goog.graphics.SolidFill('#dc3912', 0.7); 
}; 
goog.ui.GaugeTheme.prototype.getTitleColor = function() { 
  return '#333333'; 
}; 
goog.ui.GaugeTheme.prototype.getValueColor = function() { 
  return 'black'; 
}; 
goog.ui.GaugeTheme.prototype.getTickLabelColor = function() { 
  return '#333333'; 
}; 
