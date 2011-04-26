
goog.provide('goog.editor.icontent'); 
goog.provide('goog.editor.icontent.FieldFormatInfo'); 
goog.provide('goog.editor.icontent.FieldStyleInfo'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.style'); 
goog.require('goog.userAgent'); 
goog.editor.icontent.FieldFormatInfo = function(fieldId, standards, blended, fixedHeight, opt_extraStyles) { 
  this.fieldId_ = fieldId; 
  this.standards_ = standards; 
  this.blended_ = blended; 
  this.fixedHeight_ = fixedHeight; 
  this.extraStyles_ = opt_extraStyles || { }; 
}; 
goog.editor.icontent.FieldStyleInfo = function(wrapper, css) { 
  this.wrapper_ = wrapper; 
  this.css_ = css; 
}; 
goog.editor.icontent.useStandardsModeIframes_ = false; 
goog.editor.icontent.forceStandardsModeIframes = function() { 
  goog.editor.icontent.useStandardsModeIframes_ = true; 
}; 
goog.editor.icontent.getInitialIframeContent_ = function(info, bodyHtml, style) { 
  var html =[]; 
  if(info.blended_ && info.standards_ || goog.editor.icontent.useStandardsModeIframes_) { 
    html.push('<!DOCTYPE HTML>'); 
  } 
  html.push('<html style="background:none transparent;'); 
  if(info.blended_) { 
    html.push('height:', info.fixedHeight_ ? '100%': 'auto'); 
  } 
  html.push('">'); 
  html.push('<head><style>'); 
  if(style && style.css_) { 
    html.push(style.css_); 
  } 
  if(goog.userAgent.GECKO && info.standards_) { 
    html.push(' img {-moz-force-broken-image-icon: 1;}'); 
  } 
  html.push('</style></head>'); 
  html.push('<body g_editable="true" hidefocus="true" '); 
  if(goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    html.push('contentEditable '); 
  } 
  html.push('class="editable '); 
  html.push('" id="', info.fieldId_, '" style="'); 
  if(goog.userAgent.GECKO && info.blended_) { 
    html.push(';width:100%;border:0;margin:0;background:none transparent;', ';height:', info.standards_ ? '100%': 'auto'); 
    if(info.fixedHeight_) { 
      html.push(';overflow:auto'); 
    } else { 
      html.push(';overflow-y:hidden;overflow-x:auto'); 
    } 
  } 
  if(goog.userAgent.OPERA) { 
    html.push(';outline:hidden'); 
  } 
  for(var key in info.extraStyles_) { 
    html.push(';' + key + ':' + info.extraStyles_[key]); 
  } 
  html.push('">', bodyHtml, '</body></html>'); 
  return html.join(''); 
}; 
goog.editor.icontent.writeNormalInitialBlendedIframe = function(info, bodyHtml, style, iframe) { 
  if(info.blended_) { 
    var field = style.wrapper_; 
    var paddingBox = goog.style.getPaddingBox(field); 
    if(paddingBox.top || paddingBox.left || paddingBox.right || paddingBox.bottom) { 
      goog.style.setStyle(iframe, 'margin',(- paddingBox.top) + 'px ' +(- paddingBox.right) + 'px ' +(- paddingBox.bottom) + 'px ' +(- paddingBox.left) + 'px'); 
    } 
  } 
  goog.editor.icontent.writeNormalInitialIframe(info, bodyHtml, style, iframe); 
}; 
goog.editor.icontent.writeNormalInitialIframe = function(info, bodyHtml, style, iframe) { 
  var html = goog.editor.icontent.getInitialIframeContent_(info, bodyHtml, style); 
  var doc = goog.dom.getFrameContentDocument(iframe); 
  doc.open(); 
  doc.write(html); 
  doc.close(); 
}; 
goog.editor.icontent.writeHttpsInitialIframe = function(info, doc, bodyHtml) { 
  var body = doc.body; 
  if(goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    body.contentEditable = true; 
  } 
  body.className = 'editable'; 
  body.setAttribute('g_editable', true); 
  body.hideFocus = true; 
  body.id = info.fieldId_; 
  goog.style.setStyle(body, info.extraStyles_); 
  body.innerHTML = bodyHtml; 
}; 
