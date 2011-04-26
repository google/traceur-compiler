
goog.provide('goog.editor.plugins.LinkBubble'); 
goog.provide('goog.editor.plugins.LinkBubble.Action'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.Command'); 
goog.require('goog.editor.Link'); 
goog.require('goog.editor.plugins.AbstractBubblePlugin'); 
goog.require('goog.editor.range'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.ui.editor.messages'); 
goog.require('goog.window'); 
goog.editor.plugins.LinkBubble = function(var_args) { 
  goog.base(this); 
  this.extraActions_ = goog.array.toArray(arguments); 
  this.actionSpans_ =[]; 
}; 
goog.inherits(goog.editor.plugins.LinkBubble, goog.editor.plugins.AbstractBubblePlugin); 
goog.editor.plugins.LinkBubble.LINK_TEXT_ID_ = 'tr_link-text'; 
goog.editor.plugins.LinkBubble.TEST_LINK_SPAN_ID_ = 'tr_test-link-span'; 
goog.editor.plugins.LinkBubble.TEST_LINK_ID_ = 'tr_test-link'; 
goog.editor.plugins.LinkBubble.CHANGE_LINK_SPAN_ID_ = 'tr_change-link-span'; 
goog.editor.plugins.LinkBubble.CHANGE_LINK_ID_ = 'tr_change-link'; 
goog.editor.plugins.LinkBubble.DELETE_LINK_SPAN_ID_ = 'tr_delete-link-span'; 
goog.editor.plugins.LinkBubble.DELETE_LINK_ID_ = 'tr_delete-link'; 
goog.editor.plugins.LinkBubble.LINK_DIV_ID_ = 'tr_link-div'; 
var MSG_LINK_BUBBLE_TEST_LINK = goog.getMsg('Go to link: '); 
var MSG_LINK_BUBBLE_CHANGE = goog.getMsg('Change'); 
var MSG_LINK_BUBBLE_REMOVE = goog.getMsg('Remove'); 
goog.editor.plugins.LinkBubble.prototype.stopReferrerLeaks_ = false; 
goog.editor.plugins.LinkBubble.prototype.stopReferrerLeaks = function() { 
  this.stopReferrerLeaks_ = true; 
}; 
goog.editor.plugins.LinkBubble.prototype.getTrogClassId = function() { 
  return 'LinkBubble'; 
}; 
goog.editor.plugins.LinkBubble.prototype.getBubbleTargetFromSelection = function(selectedElement) { 
  var bubbleTarget = goog.dom.getAncestorByTagNameAndClass(selectedElement, goog.dom.TagName.A); 
  if(! bubbleTarget) { 
    var range = this.fieldObject.getRange(); 
    if(range && range.isCollapsed() && range.getStartOffset() == 0) { 
      var startNode = range.getStartNode(); 
      var previous = startNode.previousSibling; 
      if(previous && previous.tagName == goog.dom.TagName.A) { 
        bubbleTarget = previous; 
      } 
    } 
  } 
  return(bubbleTarget); 
}; 
goog.editor.plugins.LinkBubble.prototype.setTestLinkUrlFn = function(func) { 
  this.testLinkUrlFn_ = func; 
}; 
goog.editor.plugins.LinkBubble.prototype.getTargetUrl = function() { 
  return this.getTargetElement().getAttribute('href') || ''; 
}; 
goog.editor.plugins.LinkBubble.prototype.getBubbleType = function() { 
  return goog.dom.TagName.A; 
}; 
goog.editor.plugins.LinkBubble.prototype.getBubbleTitle = function() { 
  return goog.ui.editor.messages.MSG_LINK_CAPTION; 
}; 
goog.editor.plugins.LinkBubble.prototype.createBubbleContents = function(bubbleContainer) { 
  var linkObj = this.getLinkToTextObj_(); 
  var color = linkObj.valid ? 'black': 'red'; 
  var linkTextSpan; 
  if(goog.editor.Link.isLikelyEmailAddress(linkObj.linkText) || ! linkObj.valid) { 
    linkTextSpan = this.dom_.createDom(goog.dom.TagName.SPAN, { 
      id: goog.editor.plugins.LinkBubble.LINK_TEXT_ID_, 
      style: 'color:' + color 
    }, this.dom_.createTextNode(linkObj.linkText)); 
  } else { 
    var testMsgSpan = this.dom_.createDom(goog.dom.TagName.SPAN, { id: goog.editor.plugins.LinkBubble.TEST_LINK_SPAN_ID_ }, MSG_LINK_BUBBLE_TEST_LINK); 
    linkTextSpan = this.dom_.createDom(goog.dom.TagName.SPAN, { 
      id: goog.editor.plugins.LinkBubble.LINK_TEXT_ID_, 
      style: 'color:' + color 
    }, ''); 
    var linkText = goog.string.truncateMiddle(linkObj.linkText, 48); 
    this.createLink(goog.editor.plugins.LinkBubble.TEST_LINK_ID_, this.dom_.createTextNode(linkText).data, this.testLink, linkTextSpan); 
  } 
  var changeLinkSpan = this.createLinkOption(goog.editor.plugins.LinkBubble.CHANGE_LINK_SPAN_ID_); 
  this.createLink(goog.editor.plugins.LinkBubble.CHANGE_LINK_ID_, MSG_LINK_BUBBLE_CHANGE, this.showLinkDialog_, changeLinkSpan); 
  this.actionSpans_ =[]; 
  for(var i = 0; i < this.extraActions_.length; i ++) { 
    var action = this.extraActions_[i]; 
    var actionSpan = this.createLinkOption(action.spanId_); 
    this.actionSpans_.push(actionSpan); 
    this.createLink(action.linkId_, action.message_, function() { 
      action.actionFn_(this.getTargetUrl()); 
    }, actionSpan); 
  } 
  var removeLinkSpan = this.createLinkOption(goog.editor.plugins.LinkBubble.DELETE_LINK_SPAN_ID_); 
  this.createLink(goog.editor.plugins.LinkBubble.DELETE_LINK_ID_, MSG_LINK_BUBBLE_REMOVE, this.deleteLink_, removeLinkSpan); 
  this.onShow(); 
  var bubbleContents = this.dom_.createDom(goog.dom.TagName.DIV, { id: goog.editor.plugins.LinkBubble.LINK_DIV_ID_ }, testMsgSpan || '', linkTextSpan, changeLinkSpan); 
  for(i = 0; i < this.actionSpans_.length; i ++) { 
    bubbleContents.appendChild(this.actionSpans_[i]); 
  } 
  bubbleContents.appendChild(removeLinkSpan); 
  goog.dom.appendChild(bubbleContainer, bubbleContents); 
}; 
goog.editor.plugins.LinkBubble.prototype.testLink = function() { 
  goog.window.open(this.getTestLinkAction_(), { 
    'target': '_blank', 
    'noreferrer': this.stopReferrerLeaks_ 
  }, this.fieldObject.getAppWindow()); 
}; 
goog.editor.plugins.LinkBubble.prototype.isInvalidUrl = goog.functions.FALSE; 
goog.editor.plugins.LinkBubble.prototype.getLinkToTextObj_ = function() { 
  var isError; 
  var targetUrl = this.getTargetUrl(); 
  if(this.isInvalidUrl(targetUrl)) { 
    var MSG_INVALID_URL_LINK_BUBBLE = goog.getMsg('invalid url'); 
    targetUrl = MSG_INVALID_URL_LINK_BUBBLE; 
    isError = true; 
  } else if(goog.editor.Link.isMailto(targetUrl)) { 
    targetUrl = targetUrl.substring(7); 
  } 
  return { 
    linkText: targetUrl, 
    valid: ! isError 
  }; 
}; 
goog.editor.plugins.LinkBubble.prototype.showLinkDialog_ = function() { 
  this.fieldObject.execCommand(goog.editor.Command.MODAL_LINK_EDITOR, new goog.editor.Link((this.getTargetElement()), false)); 
  this.closeBubble(); 
}; 
goog.editor.plugins.LinkBubble.prototype.deleteLink_ = function() { 
  this.fieldObject.dispatchBeforeChange(); 
  var link = this.getTargetElement(); 
  var child = link.lastChild; 
  goog.dom.flattenElement(link); 
  goog.editor.range.placeCursorNextTo(child, false); 
  this.closeBubble(); 
  this.fieldObject.dispatchChange(); 
}; 
goog.editor.plugins.LinkBubble.prototype.onShow = function() { 
  var linkDiv = this.dom_.getElement(goog.editor.plugins.LinkBubble.LINK_DIV_ID_); 
  if(linkDiv) { 
    var testLinkSpan = this.dom_.getElement(goog.editor.plugins.LinkBubble.TEST_LINK_SPAN_ID_); 
    if(testLinkSpan) { 
      var url = this.getTargetUrl(); 
      goog.style.showElement(testLinkSpan, ! goog.editor.Link.isMailto(url)); 
    } 
    for(var i = 0; i < this.extraActions_.length; i ++) { 
      var action = this.extraActions_[i]; 
      var actionSpan = this.dom_.getElement(action.spanId_); 
      if(actionSpan) { 
        goog.style.showElement(actionSpan, action.toShowFn_(this.getTargetUrl())); 
      } 
    } 
  } 
}; 
goog.editor.plugins.LinkBubble.prototype.getTestLinkAction_ = function() { 
  var targetUrl = this.getTargetUrl(); 
  return this.testLinkUrlFn_ ? this.testLinkUrlFn_(targetUrl): targetUrl; 
}; 
goog.editor.plugins.LinkBubble.Action = function(spanId, linkId, message, toShowFn, actionFn) { 
  this.spanId_ = spanId; 
  this.linkId_ = linkId; 
  this.message_ = message; 
  this.toShowFn_ = toShowFn; 
  this.actionFn_ = actionFn; 
}; 
