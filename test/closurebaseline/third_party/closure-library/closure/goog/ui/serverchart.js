
goog.provide('goog.ui.ServerChart'); 
goog.provide('goog.ui.ServerChart.AxisDisplayType'); 
goog.provide('goog.ui.ServerChart.ChartType'); 
goog.provide('goog.ui.ServerChart.EncodingType'); 
goog.provide('goog.ui.ServerChart.Event'); 
goog.provide('goog.ui.ServerChart.LegendPosition'); 
goog.provide('goog.ui.ServerChart.MaximumValue'); 
goog.provide('goog.ui.ServerChart.MultiAxisAlignment'); 
goog.provide('goog.ui.ServerChart.MultiAxisType'); 
goog.provide('goog.ui.ServerChart.UriParam'); 
goog.provide('goog.ui.ServerChart.UriTooLongEvent'); 
goog.require('goog.Uri'); 
goog.require('goog.array'); 
goog.require('goog.asserts'); 
goog.require('goog.events.Event'); 
goog.require('goog.string'); 
goog.require('goog.ui.Component'); 
goog.ui.ServerChart = function(type, opt_width, opt_height, opt_domHelper, opt_uri) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.uri_ = new goog.Uri(opt_uri || goog.ui.ServerChart.CHART_SERVER_URI); 
  this.encodingType_ = goog.ui.ServerChart.EncodingType.AUTOMATIC; 
  this.dataSets_ =[]; 
  this.setColors_ =[]; 
  this.setLegendTexts_ =[]; 
  this.xLabels_ =[]; 
  this.leftLabels_ =[]; 
  this.rightLabels_ =[]; 
  this.multiAxisType_ =[]; 
  this.multiAxisLabelText_ = { }; 
  this.multiAxisLabelPosition_ = { }; 
  this.multiAxisRange_ = { }; 
  this.multiAxisLabelStyle_ = { }; 
  this.setType(type); 
  this.setSize(opt_width, opt_height); 
  this.minValue_ = this.isPieChart() ? 0: Infinity; 
}; 
goog.inherits(goog.ui.ServerChart, goog.ui.Component); 
goog.ui.ServerChart.CHART_SERVER_URI = 'http://chart.apis.google.com/chart'; 
goog.ui.ServerChart.CHART_SERVER_HTTPS_URI = 'https://www.google.com/chart'; 
goog.ui.ServerChart.DEFAULT_NORMALIZATION = 0.5; 
goog.ui.ServerChart.prototype.uriLengthLimit_ = 2048; 
goog.ui.ServerChart.prototype.gridX_ = 0; 
goog.ui.ServerChart.prototype.gridY_ = 0; 
goog.ui.ServerChart.prototype.maxValue_ = - Infinity; 
goog.ui.ServerChart.prototype.title_ = null; 
goog.ui.ServerChart.prototype.titleSize_ = 13.5; 
goog.ui.ServerChart.prototype.titleColor_ = '333333'; 
goog.ui.ServerChart.prototype.legend_ = null; 
goog.ui.ServerChart.prototype.numVisibleDataSets_ = null; 
goog.ui.ServerChart.prototype.createDom = function() { 
  var size = this.getSize(); 
  this.setElementInternal(this.getDomHelper().createDom('img', { 
    'src': this.getUri(), 
    'class': goog.getCssName('goog-serverchart-image'), 
    'width': size[0], 
    'height': size[1]
  })); 
}; 
goog.ui.ServerChart.prototype.decorateInternal = function(img) { 
  img.src = this.getUri(); 
  this.setElementInternal(img); 
}; 
goog.ui.ServerChart.prototype.updateChart = function() { 
  if(this.getElement()) { 
    this.getElement().src = this.getUri(); 
  } 
}; 
goog.ui.ServerChart.prototype.setUri = function(uri) { 
  this.uri_ = uri; 
}; 
goog.ui.ServerChart.prototype.getUri = function() { 
  this.computeDataString_(); 
  return this.uri_; 
}; 
goog.ui.ServerChart.prototype.getUriLengthLimit = function() { 
  return this.uriLengthLimit_; 
}; 
goog.ui.ServerChart.prototype.setUriLengthLimit = function(uriLengthLimit) { 
  this.uriLengthLimit_ = uriLengthLimit; 
}; 
goog.ui.ServerChart.prototype.setGridParameter = function(value) { 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.GRID, value); 
}; 
goog.ui.ServerChart.prototype.getGridParameter = function() { 
  return(this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.GRID)); 
}; 
goog.ui.ServerChart.prototype.setMarkerParameter = function(value) { 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.MARKERS, value); 
}; 
goog.ui.ServerChart.prototype.getMarkerParameter = function() { 
  return(this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.MARKERS)); 
}; 
goog.ui.ServerChart.prototype.setMiscParameter = function(value) { 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.MISC_PARAMS, String(value)); 
}; 
goog.ui.ServerChart.prototype.getMiscParameter = function() { 
  return(this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.MISC_PARAMS)); 
}; 
goog.ui.ServerChart.EncodingType = { 
  AUTOMATIC: '', 
  EXTENDED: 'e', 
  SIMPLE: 's', 
  TEXT: 't' 
}; 
goog.ui.ServerChart.ChartType = { 
  BAR: 'br', 
  CLOCK: 'cf', 
  CONCENTRIC_PIE: 'pc', 
  FILLEDLINE: 'lr', 
  FINANCE: 'lfi', 
  GOOGLEOMETER: 'gom', 
  HORIZONTAL_GROUPED_BAR: 'bhg', 
  HORIZONTAL_STACKED_BAR: 'bhs', 
  LINE: 'lc', 
  MAP: 't', 
  MAPUSA: 'tuss', 
  MAPWORLD: 'twoc', 
  PIE: 'p', 
  PIE3D: 'p3', 
  RADAR: 'rs', 
  SCATTER: 's', 
  SPARKLINE: 'ls', 
  VENN: 'v', 
  VERTICAL_GROUPED_BAR: 'bvg', 
  VERTICAL_STACKED_BAR: 'bvs', 
  XYLINE: 'lxy' 
}; 
goog.ui.ServerChart.MultiAxisType = { 
  X_AXIS: 'x', 
  LEFT_Y_AXIS: 'y', 
  RIGHT_Y_AXIS: 'r', 
  TOP_AXIS: 't' 
}; 
goog.ui.ServerChart.MultiAxisAlignment = { 
  ALIGN_LEFT: - 1, 
  ALIGN_CENTER: 0, 
  ALIGN_RIGHT: 1 
}; 
goog.ui.ServerChart.LegendPosition = { 
  TOP: 't', 
  BOTTOM: 'b', 
  LEFT: 'l', 
  RIGHT: 'r' 
}; 
goog.ui.ServerChart.AxisDisplayType = { 
  LINE_AND_TICKS: 'lt', 
  LINE: 'l', 
  TICKS: 't' 
}; 
goog.ui.ServerChart.MaximumValue = { 
  WIDTH: 1000, 
  HEIGHT: 1000, 
  MAP_WIDTH: 440, 
  MAP_HEIGHT: 220, 
  TOTAL_AREA: 300000 
}; 
goog.ui.ServerChart.UriParam = { 
  BACKGROUND_FILL: 'chf', 
  BAR_HEIGHT: 'chbh', 
  DATA: 'chd', 
  DATA_COLORS: 'chco', 
  DATA_LABELS: 'chld', 
  DATA_SCALING: 'chds', 
  DIGITAL_SIGNATURE: 'sig', 
  GEOGRAPHICAL_REGION: 'chtm', 
  GRID: 'chg', 
  LABEL_COLORS: 'chlc', 
  LEFT_Y_LABELS: 'chly', 
  LEGEND: 'chdl', 
  LEGEND_POSITION: 'chdlp', 
  LEGEND_TEXTS: 'chdl', 
  LINE_STYLES: 'chls', 
  MARGINS: 'chma', 
  MARKERS: 'chm', 
  MISC_PARAMS: 'chp', 
  MULTI_AXIS_LABEL_POSITION: 'chxp', 
  MULTI_AXIS_LABEL_TEXT: 'chxl', 
  MULTI_AXIS_RANGE: 'chxr', 
  MULTI_AXIS_STYLE: 'chxs', 
  MULTI_AXIS_TYPES: 'chxt', 
  RIGHT_LABELS: 'chlr', 
  RIGHT_LABEL_POSITIONS: 'chlrp', 
  SIZE: 'chs', 
  TITLE: 'chtt', 
  TITLE_FORMAT: 'chts', 
  TYPE: 'cht', 
  X_AXIS_STYLE: 'chx', 
  X_LABELS: 'chl' 
}; 
goog.ui.ServerChart.prototype.setBackgroundFill = function(fill) { 
  var value =[]; 
  goog.array.forEach(fill, function(spec) { 
    spec.area = spec.area || 'bg'; 
    spec.effect = spec.effect || 's'; 
    value.push([spec.area, spec.effect, spec.color].join(',')); 
  }); 
  value = value.join('|'); 
  this.setParameterValue(goog.ui.ServerChart.UriParam.BACKGROUND_FILL, value); 
}; 
goog.ui.ServerChart.prototype.getBackgroundFill = function() { 
  var value = this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.BACKGROUND_FILL); 
  var result =[]; 
  if(goog.isDefAndNotNull(value)) { 
    var fillSpecifications = value.split('|'); 
    var valid = true; 
    goog.array.forEach(fillSpecifications, function(spec) { 
      spec = spec.split(','); 
      if(valid && spec[1]== 's') { 
        result.push({ 
          area: spec[0], 
          effect: spec[1], 
          color: spec[2]
        }); 
      } else { 
        result =[]; 
        valid = false; 
      } 
    }); 
  } 
  return result; 
}; 
goog.ui.ServerChart.prototype.setEncodingType = function(type) { 
  this.encodingType_ = type; 
}; 
goog.ui.ServerChart.prototype.getEncodingType = function() { 
  return this.encodingType_; 
}; 
goog.ui.ServerChart.prototype.setType = function(type) { 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.TYPE, type); 
}; 
goog.ui.ServerChart.prototype.getType = function() { 
  return(this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.TYPE)); 
}; 
goog.ui.ServerChart.prototype.setSize = function(opt_width, opt_height) { 
  var sizeString =[opt_width || 300, opt_height || 150].join('x'); 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.SIZE, sizeString); 
}; 
goog.ui.ServerChart.prototype.getSize = function() { 
  var sizeStr = this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.SIZE); 
  return sizeStr.split('x'); 
}; 
goog.ui.ServerChart.prototype.setMinValue = function(minValue) { 
  this.minValue_ = minValue; 
}; 
goog.ui.ServerChart.prototype.getMinValue = function() { 
  return this.minValue_; 
}; 
goog.ui.ServerChart.prototype.setMaxValue = function(maxValue) { 
  this.maxValue_ = maxValue; 
}; 
goog.ui.ServerChart.prototype.getMaxValue = function() { 
  return this.maxValue_; 
}; 
goog.ui.ServerChart.prototype.setMargins = function(leftMargin, rightMargin, topMargin, bottomMargin) { 
  var margins =[leftMargin, rightMargin, topMargin, bottomMargin].join(','); 
  var UriParam = goog.ui.ServerChart.UriParam; 
  this.uri_.setParameterValue(UriParam.MARGINS, margins); 
}; 
goog.ui.ServerChart.prototype.setGridX = function(gridlines) { 
  this.gridX_ = gridlines; 
  this.setGrids_(this.gridX_, this.gridY_); 
}; 
goog.ui.ServerChart.prototype.getGridX = function() { 
  return this.gridX_; 
}; 
goog.ui.ServerChart.prototype.setGridY = function(gridlines) { 
  this.gridY_ = gridlines; 
  this.setGrids_(this.gridX_, this.gridY_); 
}; 
goog.ui.ServerChart.prototype.getGridY = function() { 
  return this.gridY_; 
}; 
goog.ui.ServerChart.prototype.setGrids_ = function(x, y) { 
  var gridArray =[x == 0 ? 0: 100 / x, y == 0 ? 0: 100 / y]; 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.GRID, gridArray.join(',')); 
}; 
goog.ui.ServerChart.prototype.setXLabels = function(labels) { 
  this.xLabels_ = labels; 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.X_LABELS, this.xLabels_.join('|')); 
}; 
goog.ui.ServerChart.prototype.getXLabels = function() { 
  return this.xLabels_; 
}; 
goog.ui.ServerChart.prototype.isBarChart = function() { 
  var type = this.getType(); 
  return type == goog.ui.ServerChart.ChartType.BAR || type == goog.ui.ServerChart.ChartType.HORIZONTAL_GROUPED_BAR || type == goog.ui.ServerChart.ChartType.HORIZONTAL_STACKED_BAR || type == goog.ui.ServerChart.ChartType.VERTICAL_GROUPED_BAR || type == goog.ui.ServerChart.ChartType.VERTICAL_STACKED_BAR; 
}; 
goog.ui.ServerChart.prototype.isPieChart = function() { 
  var type = this.getType(); 
  return type == goog.ui.ServerChart.ChartType.PIE || type == goog.ui.ServerChart.ChartType.PIE3D || type == goog.ui.ServerChart.ChartType.CONCENTRIC_PIE; 
}; 
goog.ui.ServerChart.prototype.isGroupedBarChart = function() { 
  var type = this.getType(); 
  return type == goog.ui.ServerChart.ChartType.HORIZONTAL_GROUPED_BAR || type == goog.ui.ServerChart.ChartType.VERTICAL_GROUPED_BAR; 
}; 
goog.ui.ServerChart.prototype.isHorizontalBarChart = function() { 
  var type = this.getType(); 
  return type == goog.ui.ServerChart.ChartType.BAR || type == goog.ui.ServerChart.ChartType.HORIZONTAL_GROUPED_BAR || type == goog.ui.ServerChart.ChartType.HORIZONTAL_STACKED_BAR; 
}; 
goog.ui.ServerChart.prototype.isLineChart = function() { 
  var type = this.getType(); 
  return type == goog.ui.ServerChart.ChartType.FILLEDLINE || type == goog.ui.ServerChart.ChartType.LINE || type == goog.ui.ServerChart.ChartType.SPARKLINE || type == goog.ui.ServerChart.ChartType.XYLINE; 
}; 
goog.ui.ServerChart.prototype.isMap = function() { 
  var type = this.getType(); 
  return type == goog.ui.ServerChart.ChartType.MAP || type == goog.ui.ServerChart.ChartType.MAPUSA || type == goog.ui.ServerChart.ChartType.MAPWORLD; 
}; 
goog.ui.ServerChart.prototype.isStackedBarChart = function() { 
  var type = this.getType(); 
  return type == goog.ui.ServerChart.ChartType.BAR || type == goog.ui.ServerChart.ChartType.HORIZONTAL_STACKED_BAR || type == goog.ui.ServerChart.ChartType.VERTICAL_STACKED_BAR; 
}; 
goog.ui.ServerChart.prototype.isVerticalBarChart = function() { 
  var type = this.getType(); 
  return type == goog.ui.ServerChart.ChartType.VERTICAL_GROUPED_BAR || type == goog.ui.ServerChart.ChartType.VERTICAL_STACKED_BAR; 
}; 
goog.ui.ServerChart.prototype.setLeftLabels = function(labels) { 
  this.leftLabels_ = labels; 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.LEFT_Y_LABELS, this.leftLabels_.reverse().join('|')); 
}; 
goog.ui.ServerChart.prototype.getLeftLabels = function() { 
  return this.leftLabels_; 
}; 
goog.ui.ServerChart.prototype.setParameterValue = function(key, value) { 
  this.uri_.setParameterValue(key, value); 
}; 
goog.ui.ServerChart.prototype.removeParameter = function(key) { 
  this.uri_.removeParameter(key); 
}; 
goog.ui.ServerChart.prototype.setRightLabels = function(labels) { 
  this.rightLabels_ = labels; 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.RIGHT_LABELS, this.rightLabels_.reverse().join('|')); 
}; 
goog.ui.ServerChart.prototype.getRightLabels = function() { 
  return this.rightLabels_; 
}; 
goog.ui.ServerChart.prototype.setLegendPosition = function(value) { 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.LEGEND_POSITION, value); 
}; 
goog.ui.ServerChart.prototype.getLegendPosition = function() { 
  return(this.uri_.getParameterValue(goog.ui.ServerChart.UriParam.LEGEND_POSITION)); 
}; 
goog.ui.ServerChart.prototype.setNumVisibleDataSets = function(n) { 
  this.numVisibleDataSets_ = n; 
}; 
goog.ui.ServerChart.prototype.getNumVisibleDataSets = function() { 
  return this.numVisibleDataSets_; 
}; 
goog.ui.ServerChart.prototype.setVennSeries = function(weights, opt_legendText, opt_colors) { 
  if(this.getType() != goog.ui.ServerChart.ChartType.VENN) { 
    throw Error('Can only set a weight function for a Venn diagram.'); 
  } 
  var dataMin = this.arrayMin_(weights); 
  if(dataMin < this.minValue_) { 
    this.minValue_ = dataMin; 
  } 
  var dataMax = this.arrayMax_(weights); 
  if(dataMax > this.maxValue_) { 
    this.maxValue_ = dataMax; 
  } 
  if(goog.isDef(opt_legendText)) { 
    goog.array.forEach(opt_legendText, goog.bind(function(legend) { 
      this.setLegendTexts_.push(legend); 
    }, this)); 
    this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.LEGEND_TEXTS, this.setLegendTexts_.join('|')); 
  } 
  if(weights.length == 3) { 
    weights[3]= weights[2]; 
    weights[2]= 0.0; 
  } 
  this.dataSets_.push(weights); 
  if(goog.isDef(opt_colors)) { 
    goog.array.forEach(opt_colors, goog.bind(function(color) { 
      this.setColors_.push(color); 
    }, this)); 
    this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.DATA_COLORS, this.setColors_.join(',')); 
  } 
}; 
goog.ui.ServerChart.prototype.setTitle = function(title) { 
  this.title_ = title; 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.TITLE, this.title_.replace(/\n/g, '|')); 
}; 
goog.ui.ServerChart.prototype.setTitleSize = function(size) { 
  this.titleSize_ = size; 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.TITLE_FORMAT, this.titleColor_ + ',' + this.titleSize_); 
}; 
goog.ui.ServerChart.prototype.getTitleSize = function() { 
  return this.titleSize_; 
}; 
goog.ui.ServerChart.prototype.setTitleColor = function(color) { 
  this.titleColor_ = color; 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.TITLE_FORMAT, this.titleColor_ + ',' + this.titleSize_); 
}; 
goog.ui.ServerChart.prototype.getTitleColor = function() { 
  return this.titleColor_; 
}; 
goog.ui.ServerChart.prototype.setLegend = function(legend) { 
  this.legend_ = legend; 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.LEGEND, this.legend_.join('|')); 
}; 
goog.ui.ServerChart.prototype.setDataScaling = function(minimum, maximum) { 
  this.encodingType_ = goog.ui.ServerChart.EncodingType.TEXT; 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.DATA_SCALING, minimum + ',' + maximum); 
}; 
goog.ui.ServerChart.prototype.setBarSpaceWidths = function(barWidth, opt_spaceBars, opt_spaceGroups) { 
  var widths =[barWidth]; 
  if(goog.isDef(opt_spaceBars)) { 
    widths.push(opt_spaceBars); 
  } 
  if(goog.isDef(opt_spaceGroups)) { 
    widths.push(opt_spaceGroups); 
  } 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.BAR_HEIGHT, widths.join(',')); 
}; 
goog.ui.ServerChart.prototype.setAutomaticBarWidth = function(opt_spaceBars, opt_spaceGroups) { 
  var widths =['a']; 
  if(goog.isDef(opt_spaceBars)) { 
    widths.push(opt_spaceBars); 
  } 
  if(goog.isDef(opt_spaceGroups)) { 
    widths.push(opt_spaceGroups); 
  } 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.BAR_HEIGHT, widths.join(',')); 
}; 
goog.ui.ServerChart.prototype.addMultiAxis = function(axisType) { 
  this.multiAxisType_.push(axisType); 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.MULTI_AXIS_TYPES, this.multiAxisType_.join(',')); 
  return this.multiAxisType_.length - 1; 
}; 
goog.ui.ServerChart.prototype.getMultiAxisType = function(opt_axisNumber) { 
  if(goog.isDef(opt_axisNumber)) { 
    return this.multiAxisType_[opt_axisNumber]; 
  } 
  return this.multiAxisType_; 
}; 
goog.ui.ServerChart.prototype.setMultiAxisLabelText = function(axisNumber, labelText) { 
  this.multiAxisLabelText_[axisNumber]= labelText; 
  var axisString = this.computeMultiAxisDataString_(this.multiAxisLabelText_, ':|', '|', '|'); 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.MULTI_AXIS_LABEL_TEXT, axisString); 
}; 
goog.ui.ServerChart.prototype.getMultiAxisLabelText = function(opt_axisNumber) { 
  if(goog.isDef(opt_axisNumber)) { 
    return this.multiAxisLabelText_[opt_axisNumber]; 
  } 
  return this.multiAxisLabelText_; 
}; 
goog.ui.ServerChart.prototype.setMultiAxisLabelPosition = function(axisNumber, labelPosition) { 
  this.multiAxisLabelPosition_[axisNumber]= labelPosition; 
  var positionString = this.computeMultiAxisDataString_(this.multiAxisLabelPosition_, ',', ',', '|'); 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.MULTI_AXIS_LABEL_POSITION, positionString); 
}; 
goog.ui.ServerChart.prototype.getMultiAxisLabelPosition = function(opt_axisNumber) { 
  if(goog.isDef(opt_axisNumber)) { 
    return this.multiAxisLabelPosition_[opt_axisNumber]; 
  } 
  return this.multiAxisLabelPosition_; 
}; 
goog.ui.ServerChart.prototype.setMultiAxisRange = function(axisNumber, rangeStart, rangeEnd, opt_interval) { 
  goog.asserts.assert(rangeStart != rangeEnd, 'Range start and end cannot be the same value.'); 
  goog.asserts.assert(isFinite(rangeStart) && isFinite(rangeEnd), 'Range start and end must be finite numbers.'); 
  this.multiAxisRange_[axisNumber]=[rangeStart, rangeEnd]; 
  if(goog.isDef(opt_interval)) { 
    this.multiAxisRange_[axisNumber].push(opt_interval); 
  } 
  var rangeString = this.computeMultiAxisDataString_(this.multiAxisRange_, ',', ',', '|'); 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.MULTI_AXIS_RANGE, rangeString); 
}; 
goog.ui.ServerChart.prototype.getMultiAxisRange = function(opt_axisNumber) { 
  if(goog.isDef(opt_axisNumber)) { 
    return this.multiAxisRange_[opt_axisNumber]; 
  } 
  return this.multiAxisRange_; 
}; 
goog.ui.ServerChart.prototype.setMultiAxisLabelStyle = function(axisNumber, color, opt_fontSize, opt_alignment, opt_axisDisplay) { 
  var style =[color]; 
  if(goog.isDef(opt_fontSize) || goog.isDef(opt_alignment)) { 
    style.push(opt_fontSize || ''); 
  } 
  if(goog.isDef(opt_alignment)) { 
    style.push(opt_alignment); 
  } 
  if(opt_axisDisplay) { 
    style.push(opt_axisDisplay); 
  } 
  this.multiAxisLabelStyle_[axisNumber]= style; 
  var styleString = this.computeMultiAxisDataString_(this.multiAxisLabelStyle_, ',', ',', '|'); 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.MULTI_AXIS_STYLE, styleString); 
}; 
goog.ui.ServerChart.prototype.getMultiAxisLabelStyle = function(opt_axisNumber) { 
  if(goog.isDef(opt_axisNumber)) { 
    return this.multiAxisLabelStyle_[opt_axisNumber]; 
  } 
  return this.multiAxisLabelStyle_; 
}; 
goog.ui.ServerChart.prototype.addDataSet = function(data, color, opt_legendText) { 
  var dataMin = this.arrayMin_(data); 
  if(dataMin < this.minValue_) { 
    this.minValue_ = dataMin; 
  } 
  var dataMax = this.arrayMax_(data); 
  if(dataMax > this.maxValue_) { 
    this.maxValue_ = dataMax; 
  } 
  if(goog.isDef(opt_legendText)) { 
    if(this.setLegendTexts_.length < this.dataSets_.length) { 
      throw Error('Cannot start adding legends text after first element.'); 
    } 
    this.setLegendTexts_.push(opt_legendText); 
    this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.LEGEND_TEXTS, this.setLegendTexts_.join('|')); 
  } 
  this.dataSets_.push(data); 
  this.setColors_.push(color); 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.DATA_COLORS, this.setColors_.join(',')); 
}; 
goog.ui.ServerChart.prototype.clearDataSets = function() { 
  var queryData = this.uri_.getQueryData(); 
  queryData.remove(goog.ui.ServerChart.UriParam.LEGEND_TEXTS); 
  queryData.remove(goog.ui.ServerChart.UriParam.DATA_COLORS); 
  queryData.remove(goog.ui.ServerChart.UriParam.DATA); 
  this.setLegendTexts_.length = 0; 
  this.setColors_.length = 0; 
  this.dataSets_.length = 0; 
}; 
goog.ui.ServerChart.prototype.getData = function(opt_setNumber) { 
  if(goog.isDef(opt_setNumber)) { 
    return this.dataSets_[opt_setNumber]; 
  } 
  return this.dataSets_; 
}; 
goog.ui.ServerChart.prototype.computeDataString_ = function() { 
  var ok; 
  if(this.encodingType_ != goog.ui.ServerChart.EncodingType.AUTOMATIC) { 
    ok = this.computeDataStringForEncoding_(this.encodingType_); 
  } else { 
    ok = this.computeDataStringForEncoding_(goog.ui.ServerChart.EncodingType.EXTENDED); 
    if(! ok) { 
      ok = this.computeDataStringForEncoding_(goog.ui.ServerChart.EncodingType.SIMPLE); 
    } 
  } 
  if(! ok) { 
    this.dispatchEvent(new goog.ui.ServerChart.UriTooLongEvent(this.uri_.toString())); 
  } 
}; 
goog.ui.ServerChart.prototype.computeDataStringForEncoding_ = function(encoding) { 
  var dataStrings =[]; 
  for(var i = 0, setLen = this.dataSets_.length; i < setLen; ++ i) { 
    dataStrings[i]= this.getChartServerValues_(this.dataSets_[i], this.minValue_, this.maxValue_, encoding); 
  } 
  var delimiter = encoding == goog.ui.ServerChart.EncodingType.TEXT ? '|': ','; 
  dataStrings = dataStrings.join(delimiter); 
  var data; 
  if(this.numVisibleDataSets_ == null) { 
    data = goog.string.buildString(encoding, ':', dataStrings); 
  } else { 
    data = goog.string.buildString(encoding, this.numVisibleDataSets_, ':', dataStrings); 
  } 
  this.uri_.setParameterValue(goog.ui.ServerChart.UriParam.DATA, data); 
  return this.uri_.toString().length < this.uriLengthLimit_; 
}; 
goog.ui.ServerChart.prototype.computeMultiAxisDataString_ = function(data, indexSeparator, elementSeparator, axisSeparator) { 
  var elementStrings =[]; 
  for(var i = 0, setLen = this.multiAxisType_.length; i < setLen; ++ i) { 
    if(data[i]) { 
      elementStrings.push(i + indexSeparator + data[i].join(elementSeparator)); 
    } 
  } 
  return elementStrings.join(axisSeparator); 
}; 
goog.ui.ServerChart.CHART_VALUES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789'; 
goog.ui.ServerChart.CHART_VALUES_EXTENDED = goog.ui.ServerChart.CHART_VALUES + '-.'; 
goog.ui.ServerChart.EXTENDED_UPPER_BOUND = Math.pow(goog.ui.ServerChart.CHART_VALUES_EXTENDED.length, 2) - 1; 
goog.ui.ServerChart.prototype.getConvertedValue_ = function(value, minValue, maxValue, encoding) { 
  goog.asserts.assert(minValue <= maxValue, 'minValue should be less than or equal to maxValue'); 
  var isExtended =(encoding == goog.ui.ServerChart.EncodingType.EXTENDED); 
  if(goog.isNull(value) || ! goog.isDef(value) || isNaN(value) || value < minValue || value > maxValue) { 
    return isExtended ? '__': '_'; 
  } 
  if(encoding == goog.ui.ServerChart.EncodingType.TEXT) { 
    return String(value); 
  } 
  var frac = goog.ui.ServerChart.DEFAULT_NORMALIZATION; 
  if(maxValue > minValue) { 
    frac =(value - minValue) /(maxValue - minValue); 
  } 
  if(isExtended) { 
    var maxIndex = goog.ui.ServerChart.CHART_VALUES_EXTENDED.length; 
    var upperBound = goog.ui.ServerChart.EXTENDED_UPPER_BOUND; 
    var index1 = Math.floor(frac * upperBound / maxIndex); 
    var index2 = Math.floor((frac * upperBound) % maxIndex); 
    var extendedVals = goog.ui.ServerChart.CHART_VALUES_EXTENDED; 
    return extendedVals.charAt(index1) + extendedVals.charAt(index2); 
  } 
  var index = Math.round(frac *(goog.ui.ServerChart.CHART_VALUES.length - 1)); 
  return goog.ui.ServerChart.CHART_VALUES.charAt(index); 
}; 
goog.ui.ServerChart.prototype.getChartServerValues_ = function(values, minValue, maxValue, encoding) { 
  var s =[]; 
  for(var i = 0, valuesLen = values.length; i < valuesLen; ++ i) { 
    s.push(this.getConvertedValue_(values[i], minValue, maxValue, encoding)); 
  } 
  return s.join(this.encodingType_ == goog.ui.ServerChart.EncodingType.TEXT ? ',': ''); 
}; 
goog.ui.ServerChart.prototype.arrayMin_ = function(ary) { 
  var min = Infinity; 
  for(var i = 0, aryLen = ary.length; i < aryLen; ++ i) { 
    var value = ary[i]; 
    if(value != null && value < min) { 
      min = value; 
    } 
  } 
  return min; 
}; 
goog.ui.ServerChart.prototype.arrayMax_ = function(ary) { 
  var max = - Infinity; 
  for(var i = 0, aryLen = ary.length; i < aryLen; ++ i) { 
    var value = ary[i]; 
    if(value != null && value > max) { 
      max = value; 
    } 
  } 
  return max; 
}; 
goog.ui.ServerChart.prototype.disposeInternal = function() { 
  goog.ui.ServerChart.superClass_.disposeInternal.call(this); 
  delete this.xLabels_; 
  delete this.leftLabels_; 
  delete this.rightLabels_; 
  delete this.gridX_; 
  delete this.gridY_; 
  delete this.setColors_; 
  delete this.setLegendTexts_; 
  delete this.dataSets_; 
  this.uri_ = null; 
  delete this.minValue_; 
  delete this.maxValue_; 
  this.title_ = null; 
  delete this.multiAxisType_; 
  delete this.multiAxisLabelText_; 
  delete this.multiAxisLabelPosition_; 
  delete this.multiAxisRange_; 
  delete this.multiAxisLabelStyle_; 
  this.legend_ = null; 
}; 
goog.ui.ServerChart.Event = { URI_TOO_LONG: 'uritoolong' }; 
goog.ui.ServerChart.UriTooLongEvent = function(uri) { 
  goog.events.Event.call(this, goog.ui.ServerChart.Event.URI_TOO_LONG); 
  this.uri = uri; 
}; 
goog.inherits(goog.ui.ServerChart.UriTooLongEvent, goog.events.Event); 
