
goog.provide('goog.ui.Gauge'); 
goog.provide('goog.ui.GaugeColoredRange'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.fx.Animation'); 
goog.require('goog.fx.easing'); 
goog.require('goog.graphics'); 
goog.require('goog.graphics.Font'); 
goog.require('goog.graphics.SolidFill'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.GaugeTheme'); 
goog.ui.GaugeColoredRange = function(fromValue, toValue, backgroundColor) { 
  this.fromValue = fromValue; 
  this.toValue = toValue; 
  this.backgroundColor = backgroundColor; 
}; 
goog.ui.Gauge = function(width, height, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.width_ = width; 
  this.height_ = height; 
  this.graphics_ = goog.graphics.createGraphics(width, height, null, null, opt_domHelper); 
  this.rangeColors_ =[]; 
}; 
goog.inherits(goog.ui.Gauge, goog.ui.Component); 
goog.ui.Gauge.RED = '#ffc0c0'; 
goog.ui.Gauge.GREEN = '#c0ffc0'; 
goog.ui.Gauge.YELLOW = '#ffffa0'; 
goog.ui.Gauge.FACTOR_RADIUS_FROM_SIZE = 0.45; 
goog.ui.Gauge.FACTOR_MAIN_AREA = 0.9; 
goog.ui.Gauge.FACTOR_COLOR_RADIUS = 0.75; 
goog.ui.Gauge.FACTOR_MAJOR_TICKS = 0.8; 
goog.ui.Gauge.FACTOR_MINOR_TICKS = 0.9; 
goog.ui.Gauge.FACTOR_NEEDLE_FRONT = 0.95; 
goog.ui.Gauge.FACTOR_NEEDLE_BACK = 0.3; 
goog.ui.Gauge.FACTOR_NEEDLE_WIDTH = 0.07; 
goog.ui.Gauge.FACTOR_NEEDLE_HINGE = 0.15; 
goog.ui.Gauge.FACTOR_TITLE_FONT_SIZE = 0.16; 
goog.ui.Gauge.FACTOR_TITLE_OFFSET = 0.35; 
goog.ui.Gauge.FACTOR_VALUE_FONT_SIZE = 0.18; 
goog.ui.Gauge.FACTOR_TICK_LABEL_FONT_SIZE = 0.14; 
goog.ui.Gauge.FACTOR_VALUE_OFFSET = 0.75; 
goog.ui.Gauge.TITLE_FONT_NAME = 'arial'; 
goog.ui.Gauge.NEEDLE_MOVE_MAX_STEP = 0.02; 
goog.ui.Gauge.NEEDLE_MOVE_TIME = 400; 
goog.ui.Gauge.MAX_EXCEED_POSITION_POSITION = 0.02; 
goog.ui.Gauge.prototype.minValue_ = 0; 
goog.ui.Gauge.prototype.maxValue_ = 100; 
goog.ui.Gauge.prototype.majorTicks_ = 5; 
goog.ui.Gauge.prototype.minorTicks_ = 2; 
goog.ui.Gauge.prototype.value_ = 0; 
goog.ui.Gauge.prototype.formattedValue_ = null; 
goog.ui.Gauge.prototype.theme_ = null; 
goog.ui.Gauge.prototype.titleTop_ = null; 
goog.ui.Gauge.prototype.titleBottom_ = null; 
goog.ui.Gauge.prototype.titleFont_ = null; 
goog.ui.Gauge.prototype.valueFont_ = null; 
goog.ui.Gauge.prototype.tickLabelFont_ = null; 
goog.ui.Gauge.prototype.angleSpan_ = 270; 
goog.ui.Gauge.prototype.needleRadius_ = 0; 
goog.ui.Gauge.prototype.needleGroup_ = null; 
goog.ui.Gauge.prototype.needleValuePosition_ = null; 
goog.ui.Gauge.prototype.majorTickLabels_ = null; 
goog.ui.Gauge.prototype.animation_ = null; 
goog.ui.Gauge.prototype.getMinimum = function() { 
  return this.minValue_; 
}; 
goog.ui.Gauge.prototype.setMinimum = function(min) { 
  this.minValue_ = min; 
  if(this.getElement()) { 
    goog.dom.a11y.setState(this.getElement(), 'valuemin', min); 
  } 
}; 
goog.ui.Gauge.prototype.getMaximum = function() { 
  return this.maxValue_; 
}; 
goog.ui.Gauge.prototype.setMaximum = function(max) { 
  this.maxValue_ = max; 
  if(this.getElement()) { 
    goog.dom.a11y.setState(this.getElement(), 'valuemax', max); 
  } 
}; 
goog.ui.Gauge.prototype.setValue = function(value, opt_formattedValue) { 
  this.value_ = value; 
  this.formattedValue_ = opt_formattedValue || null; 
  this.stopAnimation_(); 
  var valuePosition = this.valueToRangePosition_(value); 
  if(this.needleValuePosition_ == null) { 
    this.needleValuePosition_ = valuePosition; 
    this.drawValue_(); 
  } else { 
    this.animation_ = new goog.fx.Animation([this.needleValuePosition_],[valuePosition], goog.ui.Gauge.NEEDLE_MOVE_TIME, goog.fx.easing.inAndOut); 
    var events =[goog.fx.Animation.EventType.BEGIN, goog.fx.Animation.EventType.ANIMATE, goog.fx.Animation.EventType.END]; 
    goog.events.listen(this.animation_, events, this.onAnimate_, false, this); 
    goog.events.listen(this.animation_, goog.fx.Animation.EventType.END, this.onAnimateEnd_, false, this); 
    this.animation_.play(false); 
  } 
  if(this.getElement()) { 
    goog.dom.a11y.setState(this.getElement(), 'valuenow', this.value_); 
  } 
}; 
goog.ui.Gauge.prototype.setTicks = function(majorUnits, minorUnits) { 
  this.majorTicks_ = Math.max(1, majorUnits); 
  this.minorTicks_ = Math.max(1, minorUnits); 
  this.draw_(); 
}; 
goog.ui.Gauge.prototype.setMajorTickLabels = function(tickLabels) { 
  this.majorTickLabels_ = tickLabels; 
  this.draw_(); 
}; 
goog.ui.Gauge.prototype.setTitleTop = function(text) { 
  this.titleTop_ = text; 
  this.draw_(); 
}; 
goog.ui.Gauge.prototype.setTitleBottom = function(text) { 
  this.titleBottom_ = text; 
  this.draw_(); 
}; 
goog.ui.Gauge.prototype.setTitleFont = function(font) { 
  this.titleFont_ = font; 
  this.draw_(); 
}; 
goog.ui.Gauge.prototype.setValueFont = function(font) { 
  this.valueFont_ = font; 
  this.drawValue_(); 
}; 
goog.ui.Gauge.prototype.setTheme = function(theme) { 
  this.theme_ = theme; 
  this.draw_(); 
}; 
goog.ui.Gauge.prototype.addBackgroundColor = function(fromValue, toValue, color) { 
  this.rangeColors_.push(new goog.ui.GaugeColoredRange(fromValue, toValue, color)); 
  this.draw_(); 
}; 
goog.ui.Gauge.prototype.createDom = function() { 
  this.setElementInternal(this.getDomHelper().createDom('div', goog.getCssName('goog-gauge'), this.graphics_.getElement())); 
}; 
goog.ui.Gauge.prototype.clear_ = function() { 
  this.graphics_.clear(); 
  this.needleGroup_ = null; 
}; 
goog.ui.Gauge.prototype.draw_ = function() { 
  if(! this.isInDocument()) { 
    return; 
  } 
  this.clear_(); 
  var x, y; 
  var size = Math.min(this.width_, this.height_); 
  var r = Math.round(goog.ui.Gauge.FACTOR_RADIUS_FROM_SIZE * size); 
  var cx = this.width_ / 2; 
  var cy = this.height_ / 2; 
  var theme = this.theme_; 
  if(! theme) { 
    theme = goog.ui.Gauge.prototype.theme_ = new goog.ui.GaugeTheme(); 
  } 
  var graphics = this.graphics_; 
  var stroke = this.theme_.getExternalBorderStroke(); 
  var fill = theme.getExternalBorderFill(cx, cy, r); 
  graphics.drawCircle(cx, cy, r, stroke, fill); 
  r -= stroke.getWidth(); 
  r = Math.round(r * goog.ui.Gauge.FACTOR_MAIN_AREA); 
  stroke = theme.getInternalBorderStroke(); 
  fill = theme.getInternalBorderFill(cx, cy, r); 
  graphics.drawCircle(cx, cy, r, stroke, fill); 
  r -= stroke.getWidth() * 2; 
  var rBackgroundInternal = r * goog.ui.Gauge.FACTOR_COLOR_RADIUS; 
  for(var i = 0; i < this.rangeColors_.length; i ++) { 
    var rangeColor = this.rangeColors_[i]; 
    var fromValue = rangeColor.fromValue; 
    var toValue = rangeColor.toValue; 
    var path = graphics.createPath(); 
    var fromAngle = this.valueToAngle_(fromValue); 
    var toAngle = this.valueToAngle_(toValue); 
    path.arc(cx, cy, r, r, fromAngle, toAngle - fromAngle, false); 
    path.arc(cx, cy, rBackgroundInternal, rBackgroundInternal, toAngle, fromAngle - toAngle, true); 
    path.close(); 
    fill = new goog.graphics.SolidFill(rangeColor.backgroundColor); 
    graphics.drawPath(path, null, fill); 
  } 
  if(this.titleTop_ || this.titleBottom_) { 
    var font = this.titleFont_; 
    if(! font) { 
      var fontSize = Math.round(r * goog.ui.Gauge.FACTOR_TITLE_FONT_SIZE); 
      font = new goog.graphics.Font(fontSize, goog.ui.Gauge.TITLE_FONT_NAME); 
      this.titleFont_ = font; 
    } 
    fill = new goog.graphics.SolidFill(theme.getTitleColor()); 
    if(this.titleTop_) { 
      y = cy - Math.round(r * goog.ui.Gauge.FACTOR_TITLE_OFFSET); 
      graphics.drawTextOnLine(this.titleTop_, 0, y, this.width_, y, 'center', font, null, fill); 
    } 
    if(this.titleBottom_) { 
      y = cy + Math.round(r * goog.ui.Gauge.FACTOR_TITLE_OFFSET); 
      graphics.drawTextOnLine(this.titleBottom_, 0, y, this.width_, y, 'center', font, null, fill); 
    } 
  } 
  var majorTicks = this.majorTicks_; 
  var minorTicks = this.minorTicks_; 
  var rMajorTickInternal = r * goog.ui.Gauge.FACTOR_MAJOR_TICKS; 
  var rMinorTickInternal = r * goog.ui.Gauge.FACTOR_MINOR_TICKS; 
  var ticks = majorTicks * minorTicks; 
  var valueRange = this.maxValue_ - this.minValue_; 
  var tickValueSpan = valueRange / ticks; 
  var majorTicksPath = graphics.createPath(); 
  var minorTicksPath = graphics.createPath(); 
  var tickLabelFill = new goog.graphics.SolidFill(theme.getTickLabelColor()); 
  var tickLabelFont = this.tickLabelFont_; 
  if(! tickLabelFont) { 
    tickLabelFont = new goog.graphics.Font(Math.round(r * goog.ui.Gauge.FACTOR_TICK_LABEL_FONT_SIZE), goog.ui.Gauge.TITLE_FONT_NAME); 
  } 
  var tickLabelFontSize = tickLabelFont.size; 
  for(var i = 0; i <= ticks; i ++) { 
    var angle = this.valueToAngle_(i * tickValueSpan + this.minValue_); 
    var isMajorTick = i % minorTicks == 0; 
    var rInternal = isMajorTick ? rMajorTickInternal: rMinorTickInternal; 
    var path = isMajorTick ? majorTicksPath: minorTicksPath; 
    x = cx + goog.math.angleDx(angle, rInternal); 
    y = cy + goog.math.angleDy(angle, rInternal); 
    path.moveTo(x, y); 
    x = cx + goog.math.angleDx(angle, r); 
    y = cy + goog.math.angleDy(angle, r); 
    path.lineTo(x, y); 
    if(isMajorTick && this.majorTickLabels_) { 
      var tickIndex = Math.floor(i / minorTicks); 
      var label = this.majorTickLabels_[tickIndex]; 
      if(label) { 
        x = cx + goog.math.angleDx(angle, rInternal - tickLabelFontSize / 2); 
        y = cy + goog.math.angleDy(angle, rInternal - tickLabelFontSize / 2); 
        var x1, x2; 
        var align = 'center'; 
        if(angle > 280 || angle < 90) { 
          align = 'right'; 
          x1 = 0; 
          x2 = x; 
        } else if(angle >= 90 && angle < 260) { 
          align = 'left'; 
          x1 = x; 
          x2 = this.width_; 
        } else { 
          var dw = Math.min(x, this.width_ - x); 
          x1 = x - dw; 
          x2 = x + dw; 
          y += Math.round(tickLabelFontSize / 4); 
        } 
        graphics.drawTextOnLine(label, x1, y, x2, y, align, tickLabelFont, null, tickLabelFill); 
      } 
    } 
  } 
  stroke = theme.getMinorTickStroke(); 
  graphics.drawPath(minorTicksPath, stroke, null); 
  stroke = theme.getMajorTickStroke(); 
  graphics.drawPath(majorTicksPath, stroke, null); 
  this.stopAnimation_(); 
  this.valuePosition_ = this.valueToRangePosition_(this.value); 
  this.needleRadius_ = r; 
  this.drawValue_(); 
}; 
goog.ui.Gauge.prototype.onAnimate_ = function(e) { 
  this.needleValuePosition_ = e.x; 
  this.drawValue_(); 
}; 
goog.ui.Gauge.prototype.onAnimateEnd_ = function() { 
  this.stopAnimation_(); 
}; 
goog.ui.Gauge.prototype.stopAnimation_ = function() { 
  if(this.animation_) { 
    goog.events.removeAll(this.animation_); 
    this.animation_.stop(false); 
    this.animation_ = null; 
  } 
}; 
goog.ui.Gauge.prototype.valueToRangePosition_ = function(value) { 
  var valueRange = this.maxValue_ - this.minValue_; 
  var valuePct =(value - this.minValue_) / valueRange; 
  valuePct = Math.max(valuePct, - goog.ui.Gauge.MAX_EXCEED_POSITION_POSITION); 
  valuePct = Math.min(valuePct, 1 + goog.ui.Gauge.MAX_EXCEED_POSITION_POSITION); 
  return valuePct; 
}; 
goog.ui.Gauge.prototype.valueToAngle_ = function(value) { 
  var valuePct = this.valueToRangePosition_(value); 
  return this.valuePositionToAngle_(valuePct); 
}; 
goog.ui.Gauge.prototype.valuePositionToAngle_ = function(valuePct) { 
  var startAngle = goog.math.standardAngle((360 - this.angleSpan_) / 2 + 90); 
  return this.angleSpan_ * valuePct + startAngle; 
}; 
goog.ui.Gauge.prototype.drawValue_ = function() { 
  if(! this.isInDocument()) { 
    return; 
  } 
  var r = this.needleRadius_; 
  var graphics = this.graphics_; 
  var theme = this.theme_; 
  var cx = this.width_ / 2; 
  var cy = this.height_ / 2; 
  var angle = this.valuePositionToAngle_((this.needleValuePosition_)); 
  var frontRadius = Math.round(r * goog.ui.Gauge.FACTOR_NEEDLE_FRONT); 
  var backRadius = Math.round(r * goog.ui.Gauge.FACTOR_NEEDLE_BACK); 
  var frontDx = goog.math.angleDx(angle, frontRadius); 
  var frontDy = goog.math.angleDy(angle, frontRadius); 
  var backDx = goog.math.angleDx(angle, backRadius); 
  var backDy = goog.math.angleDy(angle, backRadius); 
  var angleRight = goog.math.standardAngle(angle + 90); 
  var distanceControlPointBase = r * goog.ui.Gauge.FACTOR_NEEDLE_WIDTH; 
  var controlPointMidDx = goog.math.angleDx(angleRight, distanceControlPointBase); 
  var controlPointMidDy = goog.math.angleDy(angleRight, distanceControlPointBase); 
  var path = graphics.createPath(); 
  path.moveTo(cx + frontDx, cy + frontDy); 
  path.curveTo(cx + controlPointMidDx, cy + controlPointMidDy, cx - backDx +(controlPointMidDx / 2), cy - backDy +(controlPointMidDy / 2), cx - backDx, cy - backDy); 
  path.curveTo(cx - backDx -(controlPointMidDx / 2), cy - backDy -(controlPointMidDy / 2), cx - controlPointMidDx, cy - controlPointMidDy, cx + frontDx, cy + frontDy); 
  var rh = Math.round(r * goog.ui.Gauge.FACTOR_NEEDLE_HINGE); 
  var needleGroup = this.needleGroup_; 
  if(needleGroup) { 
    needleGroup.clear(); 
  } else { 
    needleGroup = this.needleGroup_ = graphics.createGroup(); 
  } 
  if(this.formattedValue_) { 
    var font = this.valueFont_; 
    if(! font) { 
      var fontSize = Math.round(r * goog.ui.Gauge.FACTOR_VALUE_FONT_SIZE); 
      font = new goog.graphics.Font(fontSize, goog.ui.Gauge.TITLE_FONT_NAME); 
      font.bold = true; 
      this.valueFont_ = font; 
    } 
    var fill = new goog.graphics.SolidFill(theme.getValueColor()); 
    var y = cy + Math.round(r * goog.ui.Gauge.FACTOR_VALUE_OFFSET); 
    graphics.drawTextOnLine(this.formattedValue_, 0, y, this.width_, y, 'center', font, null, fill, needleGroup); 
  } 
  var stroke = theme.getNeedleStroke(); 
  var fill = theme.getNeedleFill(cx, cy, rh); 
  graphics.drawPath(path, stroke, fill, needleGroup); 
  stroke = theme.getHingeStroke(); 
  fill = theme.getHingeFill(cx, cy, rh); 
  graphics.drawCircle(cx, cy, rh, stroke, fill, needleGroup); 
}; 
goog.ui.Gauge.prototype.redraw = function() { 
  this.draw_(); 
}; 
goog.ui.Gauge.prototype.enterDocument = function() { 
  goog.ui.Gauge.superClass_.enterDocument.call(this); 
  var el = this.getElement(); 
  goog.dom.a11y.setRole(el, 'progressbar'); 
  goog.dom.a11y.setState(el, 'live', 'polite'); 
  goog.dom.a11y.setState(el, 'valuemin', this.minValue_); 
  goog.dom.a11y.setState(el, 'valuemax', this.maxValue_); 
  goog.dom.a11y.setState(el, 'valuenow', this.value_); 
  this.draw_(); 
}; 
goog.ui.Gauge.prototype.exitDocument = function() { 
  goog.ui.Gauge.superClass_.exitDocument.call(this); 
  this.stopAnimation_(); 
}; 
goog.ui.Gauge.prototype.disposeInternal = function() { 
  this.stopAnimation_(); 
  this.graphics_.dispose(); 
  delete this.graphics_; 
  delete this.needleGroup_; 
  delete this.theme_; 
  delete this.rangeColors_; 
  goog.ui.Gauge.superClass_.disposeInternal.call(this); 
}; 
