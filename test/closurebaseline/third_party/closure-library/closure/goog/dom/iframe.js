
goog.provide('goog.dom.iframe'); 
goog.require('goog.dom'); 
goog.dom.iframe.BLANK_SOURCE = 'javascript:""'; 
goog.dom.iframe.STYLES_ = 'border:0;vertical-align:bottom;'; 
goog.dom.iframe.createBlank = function(domHelper, opt_styles) { 
  return(domHelper.createDom('iframe', { 
    'frameborder': 0, 
    'style': goog.dom.iframe.STYLES_ +(opt_styles || ''), 
    'src': goog.dom.iframe.BLANK_SOURCE 
  })); 
}; 
goog.dom.iframe.writeContent = function(iframe, content) { 
  var doc = goog.dom.getFrameContentDocument(iframe); 
  doc.open(); 
  doc.write(content); 
  doc.close(); 
}; 
goog.dom.iframe.createWithContent = function(parentElement, opt_headContents, opt_bodyContents, opt_styles, opt_quirks) { 
  var domHelper = goog.dom.getDomHelper(parentElement); 
  var contentBuf =[]; 
  if(! opt_quirks) { 
    contentBuf.push('<!DOCTYPE html>'); 
  } 
  contentBuf.push('<html><head>', opt_headContents, '</head><body>', opt_bodyContents, '</body></html>'); 
  var iframe = goog.dom.iframe.createBlank(domHelper, opt_styles); 
  parentElement.appendChild(iframe); 
  goog.dom.iframe.writeContent(iframe, contentBuf.join('')); 
  return iframe; 
}; 
