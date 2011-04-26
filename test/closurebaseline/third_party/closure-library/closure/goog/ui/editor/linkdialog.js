
goog.provide('goog.ui.editor.LinkDialog'); 
goog.provide('goog.ui.editor.LinkDialog.BeforeTestLinkEvent'); 
goog.provide('goog.ui.editor.LinkDialog.EventType'); 
goog.provide('goog.ui.editor.LinkDialog.OkEvent'); 
goog.require('goog.dom'); 
goog.require('goog.dom.DomHelper'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.classes'); 
goog.require('goog.dom.selection'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.Link'); 
goog.require('goog.editor.focus'); 
goog.require('goog.events'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.InputHandler'); 
goog.require('goog.events.InputHandler.EventType'); 
goog.require('goog.string'); 
goog.require('goog.style'); 
goog.require('goog.ui.Button'); 
goog.require('goog.ui.LinkButtonRenderer'); 
goog.require('goog.ui.editor.AbstractDialog'); 
goog.require('goog.ui.editor.AbstractDialog.Builder'); 
goog.require('goog.ui.editor.AbstractDialog.EventType'); 
goog.require('goog.ui.editor.TabPane'); 
goog.require('goog.ui.editor.messages'); 
goog.require('goog.userAgent'); 
goog.require('goog.window'); 
goog.ui.editor.LinkDialog = function(domHelper, link) { 
  goog.base(this, domHelper); 
  this.targetLink_ = link; 
  this.eventHandler_ = new goog.events.EventHandler(this); 
}; 
goog.inherits(goog.ui.editor.LinkDialog, goog.ui.editor.AbstractDialog); 
goog.ui.editor.LinkDialog.EventType = { BEFORE_TEST_LINK: 'beforetestlink' }; 
goog.ui.editor.LinkDialog.OkEvent = function(linkText, linkUrl) { 
  goog.base(this, goog.ui.editor.AbstractDialog.EventType.OK); 
  this.linkText = linkText; 
  this.linkUrl = linkUrl; 
}; 
goog.inherits(goog.ui.editor.LinkDialog.OkEvent, goog.events.Event); 
goog.ui.editor.LinkDialog.BeforeTestLinkEvent = function(url) { 
  goog.base(this, goog.ui.editor.LinkDialog.EventType.BEFORE_TEST_LINK); 
  this.url = url; 
}; 
goog.inherits(goog.ui.editor.LinkDialog.BeforeTestLinkEvent, goog.events.Event); 
goog.ui.editor.LinkDialog.prototype.emailWarning_; 
goog.ui.editor.LinkDialog.prototype.setEmailWarning = function(emailWarning) { 
  this.emailWarning_ = emailWarning; 
}; 
goog.ui.editor.LinkDialog.prototype.show = function() { 
  goog.base(this, 'show'); 
  this.selectAppropriateTab_(this.textToDisplayInput_.value, this.getTargetUrl_()); 
  this.syncOkButton_(); 
}; 
goog.ui.editor.LinkDialog.prototype.hide = function() { 
  this.disableAutogenFlag_(false); 
  goog.base(this, 'hide'); 
}; 
goog.ui.editor.LinkDialog.prototype.setTextToDisplayVisible = function(visible) { 
  if(this.textToDisplayDiv_) { 
    goog.style.setStyle(this.textToDisplayDiv_, 'display', visible ? 'block': 'none'); 
  } 
}; 
goog.ui.editor.LinkDialog.prototype.setStopReferrerLeaks = function(stop) { 
  this.stopReferrerLeaks_ = stop; 
}; 
goog.ui.editor.LinkDialog.prototype.setAutogenFeatureEnabled = function(enable) { 
  this.autogenFeatureEnabled_ = enable; 
}; 
goog.ui.editor.LinkDialog.prototype.createDialogControl = function() { 
  this.textToDisplayDiv_ =(this.buildTextToDisplayDiv_()); 
  var content = this.dom.createDom(goog.dom.TagName.DIV, null, this.textToDisplayDiv_); 
  var builder = new goog.ui.editor.AbstractDialog.Builder(this); 
  builder.setTitle(goog.ui.editor.messages.MSG_EDIT_LINK).setContent(content); 
  this.tabPane_ = new goog.ui.editor.TabPane(this.dom, goog.ui.editor.messages.MSG_LINK_TO); 
  this.tabPane_.addTab(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB, goog.ui.editor.messages.MSG_ON_THE_WEB, goog.ui.editor.messages.MSG_ON_THE_WEB_TIP, this.buildTabOnTheWeb_()); 
  this.tabPane_.addTab(goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_TAB, goog.ui.editor.messages.MSG_EMAIL_ADDRESS, goog.ui.editor.messages.MSG_EMAIL_ADDRESS_TIP, this.buildTabEmailAddress_()); 
  this.tabPane_.render(content); 
  this.eventHandler_.listen(this.tabPane_, goog.ui.Component.EventType.SELECT, this.onChangeTab_); 
  return builder.build(); 
}; 
goog.ui.editor.LinkDialog.prototype.createOkEvent = function() { 
  if(this.tabPane_.getCurrentTabId() == goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_TAB) { 
    return this.createOkEventFromEmailTab_(); 
  } else { 
    return this.createOkEventFromWebTab_(); 
  } 
}; 
goog.ui.editor.LinkDialog.prototype.disposeInternal = function() { 
  this.eventHandler_.dispose(); 
  this.eventHandler_ = null; 
  this.urlInputHandler_.dispose(); 
  this.urlInputHandler_ = null; 
  this.emailInputHandler_.dispose(); 
  this.emailInputHandler_ = null; 
  goog.base(this, 'disposeInternal'); 
}; 
goog.ui.editor.LinkDialog.prototype.targetLink_; 
goog.ui.editor.LinkDialog.prototype.eventHandler_; 
goog.ui.editor.LinkDialog.prototype.urlInputHandler_; 
goog.ui.editor.LinkDialog.prototype.emailInputHandler_; 
goog.ui.editor.LinkDialog.prototype.tabPane_; 
goog.ui.editor.LinkDialog.prototype.textToDisplayDiv_; 
goog.ui.editor.LinkDialog.prototype.textToDisplayInput_; 
goog.ui.editor.LinkDialog.prototype.autogenFeatureEnabled_ = true; 
goog.ui.editor.LinkDialog.prototype.autogenerateTextToDisplay_; 
goog.ui.editor.LinkDialog.prototype.disableAutogen_; 
goog.ui.editor.LinkDialog.prototype.stopReferrerLeaks_ = false; 
goog.ui.editor.LinkDialog.prototype.buildTextToDisplayDiv_ = function() { 
  var table = this.dom.createTable(1, 2); 
  table.cellSpacing = '0'; 
  table.cellPadding = '0'; 
  table.style.fontSize = '10pt'; 
  var textToDisplayDiv = this.dom.createDom(goog.dom.TagName.DIV); 
  table.rows[0].cells[0].innerHTML = '<span style="position: relative;' + ' bottom: 2px; padding-right: 1px; white-space: nowrap;">' + goog.ui.editor.messages.MSG_TEXT_TO_DISPLAY + '&nbsp;</span>'; 
  this.textToDisplayInput_ =(this.dom.createDom(goog.dom.TagName.INPUT, { id: goog.ui.editor.LinkDialog.Id_.TEXT_TO_DISPLAY })); 
  var textInput = this.textToDisplayInput_; 
  goog.style.setStyle(textInput, 'width', '98%'); 
  goog.style.setStyle(table.rows[0].cells[1], 'width', '100%'); 
  goog.dom.appendChild(table.rows[0].cells[1], textInput); 
  textInput.value = this.targetLink_.getCurrentText(); 
  this.eventHandler_.listen(textInput, goog.events.EventType.KEYUP, goog.bind(this.onTextToDisplayEdit_, this)); 
  goog.dom.appendChild(textToDisplayDiv, table); 
  return textToDisplayDiv; 
}; 
goog.ui.editor.LinkDialog.prototype.buildTabOnTheWeb_ = function() { 
  var onTheWebDiv = this.dom.createElement(goog.dom.TagName.DIV); 
  var headingDiv = this.dom.createDom(goog.dom.TagName.DIV, { innerHTML: '<b>' + goog.ui.editor.messages.MSG_WHAT_URL + '</b>' }); 
  var urlInput = this.dom.createDom(goog.dom.TagName.INPUT, { 
    id: goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT, 
    className: goog.ui.editor.LinkDialog.TARGET_INPUT_CLASSNAME_ 
  }); 
  if(! goog.userAgent.IE) { 
    urlInput.type = 'url'; 
  } 
  if(goog.editor.BrowserFeature.NEEDS_99_WIDTH_IN_STANDARDS_MODE && goog.editor.node.isStandardsMode(urlInput)) { 
    urlInput.style.width = '99%'; 
  } 
  var inputDiv = this.dom.createDom(goog.dom.TagName.DIV, null, urlInput); 
  this.urlInputHandler_ = new goog.events.InputHandler(urlInput); 
  this.eventHandler_.listen(this.urlInputHandler_, goog.events.InputHandler.EventType.INPUT, this.onUrlOrEmailInputChange_); 
  var testLink = new goog.ui.Button(goog.ui.editor.messages.MSG_TEST_THIS_LINK, goog.ui.LinkButtonRenderer.getInstance(), this.dom); 
  testLink.render(inputDiv); 
  testLink.getElement().style.marginTop = '1em'; 
  this.eventHandler_.listen(testLink, goog.ui.Component.EventType.ACTION, this.onWebTestLink_); 
  var explanationDiv = this.dom.createDom(goog.dom.TagName.DIV, { 
    className: goog.ui.editor.LinkDialog.EXPLANATION_TEXT_CLASSNAME_, 
    innerHTML: goog.ui.editor.messages.MSG_TR_LINK_EXPLANATION 
  }); 
  onTheWebDiv.appendChild(headingDiv); 
  onTheWebDiv.appendChild(inputDiv); 
  onTheWebDiv.appendChild(explanationDiv); 
  return onTheWebDiv; 
}; 
goog.ui.editor.LinkDialog.prototype.buildTabEmailAddress_ = function() { 
  var emailTab = this.dom.createDom(goog.dom.TagName.DIV); 
  var headingDiv = this.dom.createDom(goog.dom.TagName.DIV, { innerHTML: '<b>' + goog.ui.editor.messages.MSG_WHAT_EMAIL + '</b>' }); 
  goog.dom.appendChild(emailTab, headingDiv); 
  var emailInput = this.dom.createDom(goog.dom.TagName.INPUT, { 
    id: goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_INPUT, 
    className: goog.ui.editor.LinkDialog.TARGET_INPUT_CLASSNAME_ 
  }); 
  if(goog.editor.BrowserFeature.NEEDS_99_WIDTH_IN_STANDARDS_MODE && goog.editor.node.isStandardsMode(emailInput)) { 
    emailInput.style.width = '99%'; 
  } 
  goog.dom.appendChild(emailTab, emailInput); 
  this.emailInputHandler_ = new goog.events.InputHandler(emailInput); 
  this.eventHandler_.listen(this.emailInputHandler_, goog.events.InputHandler.EventType.INPUT, this.onUrlOrEmailInputChange_); 
  goog.dom.appendChild(emailTab, this.dom.createDom(goog.dom.TagName.DIV, { 
    id: goog.ui.editor.LinkDialog.Id_.EMAIL_WARNING, 
    className: goog.ui.editor.LinkDialog.EMAIL_WARNING_CLASSNAME_, 
    style: 'visibility:hidden' 
  }, goog.ui.editor.messages.MSG_INVALID_EMAIL)); 
  if(this.emailWarning_) { 
    var explanationDiv = this.dom.createDom(goog.dom.TagName.DIV, { 
      className: goog.ui.editor.LinkDialog.EXPLANATION_TEXT_CLASSNAME_, 
      innerHTML: this.emailWarning_ 
    }); 
    goog.dom.appendChild(emailTab, explanationDiv); 
  } 
  return emailTab; 
}; 
goog.ui.editor.LinkDialog.prototype.getTargetUrl_ = function() { 
  return this.targetLink_.getAnchor().getAttribute('href') || ''; 
}; 
goog.ui.editor.LinkDialog.prototype.selectAppropriateTab_ = function(text, url) { 
  if(this.isNewLink_()) { 
    this.guessUrlAndSelectTab_(text); 
  } else if(goog.editor.Link.isMailto(url)) { 
    this.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_TAB); 
    this.dom.getElement(goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_INPUT).value = url.substring(url.indexOf(':') + 1); 
    this.setAutogenFlagFromCurInput_(); 
  } else { 
    this.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB); 
    this.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT).value = this.isNewLink_() ? 'http://': url; 
    this.setAutogenFlagFromCurInput_(); 
  } 
}; 
goog.ui.editor.LinkDialog.prototype.guessUrlAndSelectTab_ = function(text) { 
  if(goog.editor.Link.isLikelyEmailAddress(text)) { 
    this.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_TAB); 
    this.dom.getElement(goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_INPUT).value = text; 
    this.setAutogenFlag_(true); 
    this.disableAutogenFlag_(true); 
  } else if(goog.editor.Link.isLikelyUrl(text)) { 
    this.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB); 
    this.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT).value = text; 
    this.setAutogenFlag_(true); 
    this.disableAutogenFlag_(true); 
  } else { 
    if(! this.targetLink_.getCurrentText()) { 
      this.setAutogenFlag_(true); 
    } 
    this.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB); 
  } 
}; 
goog.ui.editor.LinkDialog.prototype.syncOkButton_ = function() { 
  var inputValue; 
  if(this.tabPane_.getCurrentTabId() == goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_TAB) { 
    inputValue = this.dom.getElement(goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_INPUT).value; 
    this.toggleInvalidEmailWarning_(inputValue != '' && ! goog.editor.Link.isLikelyEmailAddress(inputValue)); 
  } else if(this.tabPane_.getCurrentTabId() == goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB) { 
    inputValue = this.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT).value; 
  } else { 
    return; 
  } 
  this.getOkButtonElement().disabled = goog.string.isEmpty(inputValue); 
}; 
goog.ui.editor.LinkDialog.prototype.toggleInvalidEmailWarning_ = function(on) { 
  this.dom.getElement(goog.ui.editor.LinkDialog.Id_.EMAIL_WARNING).style.visibility =(on ? 'visible': 'hidden'); 
}; 
goog.ui.editor.LinkDialog.prototype.onTextToDisplayEdit_ = function() { 
  var inputEmpty = this.textToDisplayInput_.value == ''; 
  if(inputEmpty) { 
    this.setAutogenFlag_(true); 
  } else { 
    this.setAutogenFlagFromCurInput_(); 
  } 
}; 
goog.ui.editor.LinkDialog.prototype.createOkEventFromWebTab_ = function() { 
  var input =(this.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT)); 
  var linkURL = input.value; 
  if(goog.editor.Link.isLikelyEmailAddress(linkURL)) { 
    return this.createOkEventFromEmailTab_(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT); 
  } else { 
    if(linkURL.search(/:/) < 0) { 
      linkURL = 'http://' + goog.string.trimLeft(linkURL); 
    } 
    return this.createOkEventFromUrl_(linkURL); 
  } 
}; 
goog.ui.editor.LinkDialog.prototype.createOkEventFromEmailTab_ = function(opt_inputId) { 
  var linkURL = this.dom.getElement(opt_inputId || goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_INPUT).value; 
  linkURL = 'mailto:' + linkURL; 
  return this.createOkEventFromUrl_(linkURL); 
}; 
goog.ui.editor.LinkDialog.prototype.onWebTestLink_ = function() { 
  var input =(this.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT)); 
  var url = input.value; 
  if(url.search(/:/) < 0) { 
    url = 'http://' + goog.string.trimLeft(url); 
  } 
  if(this.dispatchEvent(new goog.ui.editor.LinkDialog.BeforeTestLinkEvent(url))) { 
    var win = this.dom.getWindow(); 
    var size = goog.dom.getViewportSize(win); 
    var openOptions = { 
      target: '_blank', 
      width: Math.max(size.width - 50, 50), 
      height: Math.max(size.height - 50, 50), 
      toolbar: true, 
      scrollbars: true, 
      location: true, 
      statusbar: false, 
      menubar: true, 
      'resizable': true, 
      'noreferrer': this.stopReferrerLeaks_ 
    }; 
    goog.window.open(url, openOptions, win); 
  } 
}; 
goog.ui.editor.LinkDialog.prototype.onUrlOrEmailInputChange_ = function() { 
  if(this.autogenerateTextToDisplay_) { 
    this.setTextToDisplayFromAuto_(); 
  } else if(this.textToDisplayInput_.value == '') { 
    this.setAutogenFlagFromCurInput_(); 
  } 
  this.syncOkButton_(); 
}; 
goog.ui.editor.LinkDialog.prototype.onChangeTab_ = function(e) { 
  var tab =(e.target); 
  var input = this.dom.getElement(tab.getId() + goog.ui.editor.LinkDialog.Id_.TAB_INPUT_SUFFIX); 
  goog.editor.focus.focusInputField(input); 
  input.style.width = ''; 
  input.style.width = input.offsetWidth + 'px'; 
  this.syncOkButton_(); 
  this.setTextToDisplayFromAuto_(); 
}; 
goog.ui.editor.LinkDialog.prototype.setTextToDisplayFromAuto_ = function() { 
  if(this.autogenFeatureEnabled_ && this.autogenerateTextToDisplay_) { 
    var inputId = this.tabPane_.getCurrentTabId() + goog.ui.editor.LinkDialog.Id_.TAB_INPUT_SUFFIX; 
    this.textToDisplayInput_.value =(this.dom.getElement(inputId)).value; 
  } 
}; 
goog.ui.editor.LinkDialog.prototype.setAutogenFlag_ = function(val) { 
  this.autogenerateTextToDisplay_ = val; 
}; 
goog.ui.editor.LinkDialog.prototype.disableAutogenFlag_ = function(autogen) { 
  this.setAutogenFlag_(! autogen); 
  this.disableAutogen_ = autogen; 
}; 
goog.ui.editor.LinkDialog.prototype.createOkEventFromUrl_ = function(url) { 
  this.setTextToDisplayFromAuto_(); 
  return new goog.ui.editor.LinkDialog.OkEvent(this.textToDisplayInput_.value, url); 
}; 
goog.ui.editor.LinkDialog.prototype.setAutogenFlagFromCurInput_ = function() { 
  var autogen = false; 
  if(! this.disableAutogen_) { 
    var tabInput = this.dom.getElement(this.tabPane_.getCurrentTabId() + goog.ui.editor.LinkDialog.Id_.TAB_INPUT_SUFFIX); 
    autogen =(tabInput.value == this.textToDisplayInput_.value); 
  } 
  this.setAutogenFlag_(autogen); 
}; 
goog.ui.editor.LinkDialog.prototype.isNewLink_ = function() { 
  return this.targetLink_.isNew(); 
}; 
goog.ui.editor.LinkDialog.Id_ = { 
  TEXT_TO_DISPLAY: 'linkdialog-text', 
  ON_WEB_TAB: 'linkdialog-onweb', 
  ON_WEB_INPUT: 'linkdialog-onweb-tab-input', 
  EMAIL_ADDRESS_TAB: 'linkdialog-email', 
  EMAIL_ADDRESS_INPUT: 'linkdialog-email-tab-input', 
  EMAIL_WARNING: 'linkdialog-email-warning', 
  TAB_INPUT_SUFFIX: '-tab-input' 
}; 
goog.ui.editor.LinkDialog.TARGET_INPUT_CLASSNAME_ = goog.getCssName('tr-link-dialog-target-input'); 
goog.ui.editor.LinkDialog.EMAIL_WARNING_CLASSNAME_ = goog.getCssName('tr-link-dialog-email-warning'); 
goog.ui.editor.LinkDialog.EXPLANATION_TEXT_CLASSNAME_ = goog.getCssName('tr-link-dialog-explanation-text'); 
