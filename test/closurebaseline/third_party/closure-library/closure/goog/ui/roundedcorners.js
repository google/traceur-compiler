
goog.provide('goog.ui.RoundedCorners'); 
goog.provide('goog.ui.RoundedCorners.Corners'); 
goog.require('goog.Uri'); 
goog.require('goog.color'); 
goog.require('goog.dom'); 
goog.require('goog.math.Size'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.userAgent'); 
goog.ui.RoundedCorners = function(servletUri) { 
  this.servletUri_ = servletUri; 
  this.size_ = new goog.math.Size(8, 8); 
  this.cornersToShow_ = goog.ui.RoundedCorners.Corners.ALL; 
}; 
goog.ui.RoundedCorners.roundElement = function(element, servletUri, opt_borderThickness, opt_corners) { 
  var roundedCorners = new goog.ui.RoundedCorners(servletUri); 
  roundedCorners.setColor(goog.style.getBackgroundColor(element)); 
  var backgroundColor; 
  var parent =(element.parentNode); 
  backgroundColor = goog.style.getBackgroundColor(parent); 
  try { 
    goog.color.parse(backgroundColor); 
  } catch(ex) { 
    backgroundColor = 'white'; 
  } 
  roundedCorners.setBackgroundColor(backgroundColor); 
  if(! goog.isDef(opt_corners)) { 
    opt_corners = goog.ui.RoundedCorners.Corners.ALL; 
  } 
  roundedCorners.setCornersToShow(opt_corners); 
  if(! goog.isDef(opt_borderThickness)) { 
    opt_borderThickness = new goog.math.Size(5, 5); 
  } 
  roundedCorners.setBorderThickness(opt_borderThickness); 
  var roundedContainer = goog.dom.htmlToDocumentFragment(roundedCorners.getBackgroundHtml()); 
  parent.replaceChild(roundedContainer, element); 
  goog.dom.removeNode(goog.dom.getLastElementChild(roundedContainer)); 
  goog.dom.appendChild(roundedContainer, element); 
}; 
goog.ui.RoundedCorners.prototype.color_ = '#ff0000'; 
goog.ui.RoundedCorners.prototype.bgColor_ = ''; 
goog.ui.RoundedCorners.prototype.inColor_ = ''; 
goog.ui.RoundedCorners.prototype.content_ = ''; 
goog.ui.RoundedCorners.prototype.padding_ = ''; 
goog.ui.RoundedCorners.prototype.height_ = null; 
goog.ui.RoundedCorners.prototype.imageFormat_ = 'png'; 
goog.ui.RoundedCorners.prototype.lineWidth_ = 0; 
goog.ui.RoundedCorners.Corners = { 
  TOP_LEFT: 1, 
  TOP_RIGHT: 2, 
  BOTTOM_LEFT: 4, 
  BOTTOM_RIGHT: 8, 
  LEFT: 5, 
  RIGHT: 10, 
  TOP: 3, 
  BOTTOM: 12, 
  ALL: 15 
}; 
goog.ui.RoundedCorners.prototype.getColor = function() { 
  return this.color_; 
}; 
goog.ui.RoundedCorners.prototype.setColor = function(color) { 
  this.color_ = goog.color.parse(color).hex; 
}; 
goog.ui.RoundedCorners.prototype.getBackgroundColor = function() { 
  return this.bgColor_; 
}; 
goog.ui.RoundedCorners.prototype.setBackgroundColor = function(bgColor) { 
  if(goog.string.isEmpty(bgColor)) { 
    this.bgColor_ = ''; 
  } else { 
    this.bgColor_ = goog.color.parse(bgColor).hex; 
  } 
}; 
goog.ui.RoundedCorners.prototype.getInnerColor = function() { 
  return this.inColor_; 
}; 
goog.ui.RoundedCorners.prototype.setInnerColor = function(inColor) { 
  if(goog.string.isEmpty(inColor)) { 
    this.inColor_ = ''; 
  } else { 
    this.inColor_ = goog.color.parse(inColor).hex; 
  } 
}; 
goog.ui.RoundedCorners.prototype.getBorderThickness = function() { 
  return this.size_; 
}; 
goog.ui.RoundedCorners.prototype.setBorderThickness = function(size) { 
  this.size_ = size; 
}; 
goog.ui.RoundedCorners.prototype.getExplicitHeight = function() { 
  return this.height_; 
}; 
goog.ui.RoundedCorners.prototype.setExplicitHeight = function(height) { 
  this.height_ = height; 
}; 
goog.ui.RoundedCorners.prototype.getPadding = function() { 
  return this.padding_; 
}; 
goog.ui.RoundedCorners.prototype.setPadding = function(padding) { 
  this.padding_ = padding; 
}; 
goog.ui.RoundedCorners.prototype.getLineWidth = function() { 
  return this.lineWidth_; 
}; 
goog.ui.RoundedCorners.prototype.setLineWidth = function(lineWidth) { 
  this.lineWidth_ = lineWidth; 
}; 
goog.ui.RoundedCorners.prototype.getCornersToShow = function() { 
  return this.cornersToShow_; 
}; 
goog.ui.RoundedCorners.prototype.setCornersToShow = function(cornersToShow) { 
  this.cornersToShow_ = cornersToShow; 
}; 
goog.ui.RoundedCorners.prototype.getImageFormat = function() { 
  return this.imageFormat_; 
}; 
goog.ui.RoundedCorners.prototype.setImageFormat = function(imageFormat) { 
  if(imageFormat != 'png' && imageFormat != 'gif') { 
    throw Error('Image format must be \'png\' or \'gif\''); 
  } 
  this.imageFormat_ = imageFormat; 
}; 
goog.ui.RoundedCorners.prototype.getContent = function() { 
  return this.content_; 
}; 
goog.ui.RoundedCorners.prototype.setContent = function(html) { 
  this.content_ = html; 
}; 
goog.ui.RoundedCorners.prototype.getBorderHtml = function() { 
  var sb =[]; 
  sb.push('<table border=0 style="empty-cells:show;' + 'border-collapse:{{%collapse}};' + 'table-layout:fixed;width:100%;margin:0;padding:0;' + 'height:{{%heightStyle}}" cellspacing=0 cellpadding=0>'); 
  if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_LEFT || this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_LEFT) { 
    sb.push('<col width="{{%w}}">'); 
  } 
  sb.push('<col>'); 
  if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_RIGHT || this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_LEFT) { 
    sb.push('<col width="{{%w}}">'); 
  } 
  if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_LEFT || this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_RIGHT) { 
    sb.push('<tr>'); 
    if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_LEFT) { 
      sb.push('<td style="{{%tlStyle}}; width:{{%w}}px; height:{{%h}}px">' + '</td>'); 
    } 
    sb.push('<td style="{{%tmColor}}"></td>'); 
    if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_RIGHT) { 
      sb.push('<td style="{{%trStyle}}; width:{{%w}}px; height:{{%h}}px">' + '</td>'); 
    } 
    sb.push('</tr>'); 
  } 
  sb.push('<tr>'); 
  if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_LEFT || this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_LEFT) { 
    sb.push('<td style="{{%mlStyle}};{{%mlColor}};width:{{%w}}px;"></td>'); 
  } 
  sb.push('<td style="padding: {{%p}}">{{%content}}</td>'); 
  if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_RIGHT || this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_RIGHT) { 
    sb.push('<td style="{{%mrStyle}}; {{%mrColor}};width:{{%w}}px;"></td>'); 
  } 
  sb.push('</tr>'); 
  if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_LEFT || this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_RIGHT) { 
    sb.push('<tr>'); 
    if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_LEFT) { 
      sb.push('<td style="{{%blStyle}} width:{{%w}}px; height:{{%h}}px;">' + '</td>'); 
    } 
    sb.push('<td style="{{%bmColor}}"></td>'); 
    if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_RIGHT) { 
      sb.push('<td style="{{%brStyle}};width:{{%w}}px; height:{{%h}}px">' + '</td>'); 
    } 
    sb.push('</tr>'); 
  } 
  sb.push('</table>'); 
  return this.performTemplateSubstitutions_(sb.join('')); 
}; 
goog.ui.RoundedCorners.prototype.getBackgroundHtml = function() { 
  var sb =[]; 
  sb.push('<div style="position:relative;padding:{{%p}};' + 'background-color:{{%color}};height:{{%heightStyle}}">'); 
  if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_LEFT) { 
    sb.push('<div style="{{%tlStyle}};width:{{%w}}px; height:{{%h}}px;' + 'position:absolute;top:0;left:0;font-size:0"></div>'); 
  } 
  if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_LEFT) { 
    sb.push('<div style="{{%blStyle}};width:{{%w}}px; height:{{%h}}px;' + 'position:absolute;bottom:0px;left:0;font-size:0"></div>'); 
  } 
  if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.BOTTOM_RIGHT) { 
    sb.push('<div style="{{%brStyle}};width:{{%w}}px; height:{{%h}}px;' + 'position:absolute;bottom:0px;right:0;font-size:0"></div>'); 
  } 
  if(this.cornersToShow_ & goog.ui.RoundedCorners.Corners.TOP_RIGHT) { 
    sb.push('<div style="{{%trStyle}};width:{{%w}}px; height:{{%h}}px;' + 'position:absolute;top:0;right:0;font-size:0"></div>'); 
  } 
  sb.push('<div>{{%content}}</div>'); 
  sb.push('</div>'); 
  return this.performTemplateSubstitutions_(sb.join('')); 
}; 
goog.ui.RoundedCorners.prototype.performTemplateSubstitutions_ = function(htmlTemplate) { 
  var html = htmlTemplate; 
  var ctx = this.getCtx_(); 
  for(var key in ctx) { 
    var regex = new RegExp('{{%' + key + '}}', 'g'); 
    html = html.replace(regex, ctx[key]); 
  } 
  return html; 
}; 
goog.ui.RoundedCorners.prototype.getCtx_ = function() { 
  var colorHex = this.color_.substring(1); 
  var ctx = { }; 
  ctx['tlStyle']= this.getCornerStyle_('tl'); 
  ctx['trStyle']= this.getCornerStyle_('tr'); 
  ctx['mlStyle']= ''; 
  ctx['mrStyle']= ''; 
  ctx['blStyle']= this.getCornerStyle_('bl'); 
  ctx['brStyle']= this.getCornerStyle_('br'); 
  if(this.cornersToShow_ == goog.ui.RoundedCorners.Corners.RIGHT) { 
    ctx['tlStyle']= ctx['mlStyle']= ctx['blStyle']= 'display:none'; 
  } else if(this.cornersToShow_ == goog.ui.RoundedCorners.Corners.LEFT) { 
    ctx['trStyle']= ctx['mrStyle']= ctx['brStyle']= 'display:none'; 
  } 
  if(this.height_ != null) { 
    ctx['heightStyle']= this.height_; 
  } else { 
    ctx['heightStyle']= goog.userAgent.IE && goog.userAgent.VERSION < 7 ? '0px;': 'auto;'; 
  } 
  ctx['color']= this.color_; 
  ctx['mlColor']= this.colorStyleFor_('left'); 
  ctx['mrColor']= this.colorStyleFor_('right'); 
  ctx['tmColor']= this.colorStyleFor_('top'); 
  ctx['bmColor']= this.colorStyleFor_('bottom'); 
  ctx['collapse']= this.lineWidth_ ?(goog.userAgent.IE ? 'collapse': ''): 'collapse'; 
  ctx['w']= this.size_.width; 
  ctx['h']= this.size_.height; 
  ctx['p']= this.padding_; 
  ctx['content']= this.content_; 
  return ctx; 
}; 
goog.ui.RoundedCorners.prototype.colorStyleFor_ = function(side) { 
  return this.lineWidth_ ? 'border-' + side + ': ' + this.lineWidth_ + 'px solid ' + this.color_: 'background-color:' + this.color_; 
}; 
goog.ui.RoundedCorners.prototype.getCornerStyle_ = function(corner) { 
  var uri = this.createUri_(corner); 
  if((goog.string.isEmpty(this.color_) || goog.string.isEmpty(this.bgColor_) || goog.string.isEmpty(this.inColor_)) && goog.userAgent.IE && goog.userAgent.VERSION > 5.5 && goog.userAgent.VERSION < 7) { 
    return 'filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + uri + '\', sizingMethod=\'crop\')'; 
  } else { 
    return 'background: url(' + uri + ') no-repeat top left;'; 
  } 
}; 
goog.ui.RoundedCorners.prototype.createUri_ = function(corner) { 
  var uri = new goog.Uri(this.servletUri_); 
  uri.setParameterValue('a', corner); 
  uri.setParameterValue('c', this.removeHash_(this.color_)); 
  uri.setParameterValue('bc', this.removeHash_(this.bgColor_)); 
  uri.setParameterValue('ic', this.removeHash_(this.inColor_)); 
  uri.setParameterValue('w', String(this.size_.width)); 
  uri.setParameterValue('h', String(this.size_.height)); 
  uri.setParameterValue('lw', String(this.lineWidth_)); 
  uri.setParameterValue('m', this.imageFormat_); 
  return uri; 
}; 
goog.ui.RoundedCorners.prototype.removeHash_ = function(s) { 
  if(goog.string.startsWith(s, '#')) { 
    return s.substring(1); 
  } 
  return s; 
}; 
