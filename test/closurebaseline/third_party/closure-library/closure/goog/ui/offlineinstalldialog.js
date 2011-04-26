
goog.provide('goog.ui.OfflineInstallDialog'); 
goog.provide('goog.ui.OfflineInstallDialog.ButtonKeyType'); 
goog.provide('goog.ui.OfflineInstallDialog.EnableScreen'); 
goog.provide('goog.ui.OfflineInstallDialog.InstallScreen'); 
goog.provide('goog.ui.OfflineInstallDialog.InstallingGearsScreen'); 
goog.provide('goog.ui.OfflineInstallDialog.ScreenType'); 
goog.provide('goog.ui.OfflineInstallDialog.UpgradeScreen'); 
goog.provide('goog.ui.OfflineInstallDialogScreen'); 
goog.require('goog.Disposable'); 
goog.require('goog.dom.classes'); 
goog.require('goog.gears'); 
goog.require('goog.string'); 
goog.require('goog.string.StringBuffer'); 
goog.require('goog.ui.Dialog'); 
goog.require('goog.ui.Dialog.ButtonSet'); 
goog.require('goog.ui.Dialog.EventType'); 
goog.require('goog.window'); 
goog.ui.OfflineInstallDialog = function(opt_class, opt_useIframeMask, opt_domHelper) { 
  goog.ui.Dialog.call(this, opt_class, opt_useIframeMask, opt_domHelper); 
  this.screenConstructors_ = { }; 
  this.screens_ = { }; 
  this.currentScreenType_ = goog.gears.hasFactory() ? goog.ui.OfflineInstallDialog.ScreenType.ENABLE: goog.ui.OfflineInstallDialog.ScreenType.INSTALL; 
  this.registerScreenType(goog.ui.OfflineInstallDialog.EnableScreen.TYPE, goog.ui.OfflineInstallDialog.EnableScreen); 
  this.registerScreenType(goog.ui.OfflineInstallDialog.InstallScreen.TYPE, goog.ui.OfflineInstallDialog.InstallScreen); 
  this.registerScreenType(goog.ui.OfflineInstallDialog.UpgradeScreen.TYPE, goog.ui.OfflineInstallDialog.UpgradeScreen); 
  this.registerScreenType(goog.ui.OfflineInstallDialog.InstallingGearsScreen.TYPE, goog.ui.OfflineInstallDialog.InstallingGearsScreen); 
}; 
goog.inherits(goog.ui.OfflineInstallDialog, goog.ui.Dialog); 
goog.ui.OfflineInstallDialog.ButtonKeyType = { 
  INSTALL: 'io', 
  UPGRADE: 'u', 
  ENABLE: 'eo', 
  CANCEL: 'ca', 
  CLOSE: 'cl', 
  OK: 'ok' 
}; 
goog.ui.OfflineInstallDialog.ScreenType = { 
  INSTALL: 'i', 
  INSTALLING_GEARS: 'ig', 
  ENABLE: 'e', 
  UPGRADE: 'u' 
}; 
goog.ui.OfflineInstallDialog.prototype.dirty_ = false; 
goog.ui.OfflineInstallDialog.prototype.currentScreenType_; 
goog.ui.OfflineInstallDialog.prototype.appUrl_ = ''; 
goog.ui.OfflineInstallDialog.prototype.gearsDownloadPageUrl_ = ''; 
goog.ui.OfflineInstallDialog.prototype.invalidateAndUpdate_ = function() { 
  this.dirty_ = true; 
  if(this.getElement() && this.isVisible()) { 
    this.update(); 
  } 
}; 
goog.ui.OfflineInstallDialog.prototype.setAppUrl = function(url) { 
  this.appUrl_ = url; 
  this.invalidateAndUpdate_(); 
}; 
goog.ui.OfflineInstallDialog.prototype.getAppUrl = function() { 
  return this.appUrl_; 
}; 
goog.ui.OfflineInstallDialog.prototype.setGearsDownloadPageUrl = function(url) { 
  this.gearsDownloadPageUrl_ = url; 
  this.invalidateAndUpdate_(); 
}; 
goog.ui.OfflineInstallDialog.prototype.getGearsDownloadPageUrl = function() { 
  return this.gearsDownloadPageUrl_; 
}; 
goog.ui.OfflineInstallDialog.prototype.getGearsDownloadPageFriendlyUrl = function() { 
  return this.gearsDownloadPageFriendlyUrl_ || this.gearsDownloadPageUrl_; 
}; 
goog.ui.OfflineInstallDialog.prototype.setGearsDownloadPageFriendlyUrl = function(url) { 
  this.gearsDownloadPageFriendlyUrl_ = url; 
  this.invalidateAndUpdate_(); 
}; 
goog.ui.OfflineInstallDialog.prototype.setCurrentScreenType = function(screenType) { 
  if(screenType != this.currentScreenType_) { 
    var currentScreen = this.getCurrentScreen(); 
    if(currentScreen && this.isInDocument()) { 
      currentScreen.deactivate(); 
    } 
    this.currentScreenType_ = screenType; 
    this.invalidateAndUpdate_(); 
  } 
}; 
goog.ui.OfflineInstallDialog.prototype.getCurrentScreenType = function() { 
  return this.currentScreenType_; 
}; 
goog.ui.OfflineInstallDialog.prototype.getCurrentScreen = function() { 
  return this.getScreen(this.currentScreenType_); 
}; 
goog.ui.OfflineInstallDialog.prototype.getScreen = function(type) { 
  if(this.screens_[type]) { 
    return this.screens_[type]; 
  } 
  if(this.screenConstructors_[type]) { 
    return this.screens_[type]= new this.screenConstructors_[type](this); 
  } 
  return null; 
}; 
goog.ui.OfflineInstallDialog.prototype.registerScreenType = function(type, constr) { 
  this.screenConstructors_[type]= constr; 
  if(this.screens_[type]) { 
    var isCurrenScreenType = this.currentScreenType_ == type; 
    this.screens_[type].dispose(); 
    delete this.screens_[type]; 
    if(isCurrenScreenType) { 
      this.invalidateAndUpdate_(); 
    } 
  } 
}; 
goog.ui.OfflineInstallDialog.prototype.registerScreen = function(screen) { 
  this.screens_[screen.getType()]= screen; 
}; 
goog.ui.OfflineInstallDialog.prototype.setVisible = function(visible) { 
  if(this.isInDocument() && visible) { 
    if(this.dirty_) { 
      this.update(); 
    } 
  } 
  goog.ui.OfflineInstallDialog.superClass_.setVisible.call(this, visible); 
}; 
goog.ui.OfflineInstallDialog.prototype.createDom = function() { 
  goog.ui.OfflineInstallDialog.superClass_.createDom.call(this); 
  this.update(); 
}; 
goog.ui.OfflineInstallDialog.prototype.enterDocument = function() { 
  goog.ui.OfflineInstallDialog.superClass_.enterDocument.call(this); 
  this.getHandler().listen(this, goog.ui.Dialog.EventType.SELECT, this.handleSelect_); 
  if(this.dirty_) { 
    this.update(); 
  } 
}; 
goog.ui.OfflineInstallDialog.prototype.update = function() { 
  if(this.getElement()) { 
    var screen = this.getCurrentScreen(); 
    if(screen) { 
      screen.activate(); 
    } 
    this.dirty_ = false; 
  } 
}; 
goog.ui.OfflineInstallDialog.prototype.handleSelect_ = function(e) { 
  var screen = this.getCurrentScreen(); 
  if(screen) { 
    screen.handleSelect(e); 
  } 
}; 
goog.ui.OfflineInstallDialog.prototype.goToGearsDownloadPage = function() { 
  goog.window.open(this.gearsDownloadPageUrl_); 
}; 
goog.ui.OfflineInstallDialog.prototype.disposeInternal = function() { 
  goog.ui.OfflineInstallDialog.superClass_.disposeInternal.call(this); 
  delete this.screenConstructors_; 
  for(var type in this.screens_) { 
    this.screens_[type].dispose(); 
  } 
  delete this.screens_; 
}; 
goog.ui.OfflineInstallDialogScreen = function(dialog, type) { 
  goog.Disposable.call(this); 
  this.dialog_ = dialog; 
  this.type_ = type; 
  this.dom_ = dialog.getDomHelper(); 
}; 
goog.inherits(goog.ui.OfflineInstallDialogScreen, goog.Disposable); 
goog.ui.OfflineInstallDialogScreen.prototype.content_ = ''; 
goog.ui.OfflineInstallDialogScreen.prototype.title_ = ''; 
goog.ui.OfflineInstallDialogScreen.prototype.buttonSet_; 
goog.ui.OfflineInstallDialogScreen.prototype.getDialog = function() { 
  return this.dialog_; 
}; 
goog.ui.OfflineInstallDialogScreen.prototype.getType = function() { 
  return this.type_; 
}; 
goog.ui.OfflineInstallDialogScreen.prototype.getButtonSet = function() { 
  return this.buttonSet_; 
}; 
goog.ui.OfflineInstallDialogScreen.prototype.setButtonSet = function(bs) { 
  this.buttonSet_ = bs; 
}; 
goog.ui.OfflineInstallDialogScreen.prototype.getContent = function() { 
  return this.content_; 
}; 
goog.ui.OfflineInstallDialogScreen.prototype.setContent = function(html) { 
  this.content_ = html; 
}; 
goog.ui.OfflineInstallDialogScreen.prototype.getTitle = function() { 
  return this.title_ || this.dialog_.getTitle(); 
}; 
goog.ui.OfflineInstallDialogScreen.prototype.setTitle = function(title) { 
  this.title_ = title; 
}; 
goog.ui.OfflineInstallDialogScreen.prototype.getCustomClassName = function() { 
  return this.customClassName_; 
}; 
goog.ui.OfflineInstallDialogScreen.prototype.setCustomClassName = function(customClassName) { 
  this.customClassName_ = customClassName; 
}; 
goog.ui.OfflineInstallDialogScreen.prototype.activate = function() { 
  var d = this.dialog_; 
  var customClassName = this.getCustomClassName(); 
  if(customClassName) { 
    goog.dom.classes.add(d.getElement(), customClassName); 
  } 
  d.setTitle(this.getTitle()); 
  d.setContent(this.getContent()); 
  d.setButtonSet(this.getButtonSet()); 
}; 
goog.ui.OfflineInstallDialogScreen.prototype.deactivate = function() { 
  var customClassName = this.getCustomClassName(); 
  if(customClassName) { 
    goog.dom.classes.remove(this.dialog_.getElement(), customClassName); 
  } 
}; 
goog.ui.OfflineInstallDialogScreen.prototype.handleSelect = function(e) { }; 
goog.ui.OfflineInstallDialog.EnableScreen = function(dialog) { 
  goog.ui.OfflineInstallDialogScreen.call(this, dialog, goog.ui.OfflineInstallDialog.EnableScreen.TYPE); 
  var MSG_OFFLINE_DIALOG_ENABLE_GEARS = goog.getMsg('Enable offline access'); 
  this.enableMsg_ = MSG_OFFLINE_DIALOG_ENABLE_GEARS; 
}; 
goog.inherits(goog.ui.OfflineInstallDialog.EnableScreen, goog.ui.OfflineInstallDialogScreen); 
goog.ui.OfflineInstallDialog.EnableScreen.TYPE = goog.ui.OfflineInstallDialog.ScreenType.ENABLE; 
goog.ui.OfflineInstallDialog.EnableScreen.prototype.enableOnEnter = true; 
goog.ui.OfflineInstallDialog.EnableScreen.prototype.getButtonSet = function() { 
  if(! this.buttonSet_) { 
    var MSG_OFFLINE_DIALOG_CANCEL = goog.getMsg('Cancel'); 
    var buttonSet = this.buttonSet_ = new goog.ui.Dialog.ButtonSet(this.dom_); 
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.ENABLE, this.enableMsg_, this.enableOnEnter, false); 
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.CANCEL, MSG_OFFLINE_DIALOG_CANCEL, false, true); 
  } 
  return this.buttonSet_; 
}; 
goog.ui.OfflineInstallDialog.InstallScreen = function(dialog, opt_type) { 
  goog.ui.OfflineInstallDialogScreen.call(this, dialog, opt_type || goog.ui.OfflineInstallDialog.InstallScreen.TYPE); 
  var MSG_OFFLINE_DIALOG_INSTALL_GEARS = goog.getMsg('Install Gears'); 
  this.installMsg_ = MSG_OFFLINE_DIALOG_INSTALL_GEARS; 
  var MSG_INSTALL_GEARS = goog.getMsg('Get Gears now'); 
  this.enableMsg_ = MSG_INSTALL_GEARS; 
  var MSG_OFFLINE_DIALOG_CANCEL_2 = goog.getMsg('Cancel'); 
  this.cancelMsg_ = MSG_OFFLINE_DIALOG_CANCEL_2; 
}; 
goog.inherits(goog.ui.OfflineInstallDialog.InstallScreen, goog.ui.OfflineInstallDialogScreen); 
goog.ui.OfflineInstallDialog.InstallScreen.TYPE = goog.ui.OfflineInstallDialog.ScreenType.INSTALL; 
goog.ui.OfflineInstallDialog.InstallScreen.prototype.installDescription_ = ''; 
goog.ui.OfflineInstallDialog.InstallScreen.prototype.appUrlClassName_ = goog.getCssName('goog-offlinedialog-url'); 
goog.ui.OfflineInstallDialog.InstallScreen.prototype.stepsClassName_ = goog.getCssName('goog-offlinedialog-steps'); 
goog.ui.OfflineInstallDialog.InstallScreen.prototype.stepClassName_ = goog.getCssName('goog-offlinedialog-step'); 
goog.ui.OfflineInstallDialog.InstallScreen.prototype.stepNumberClassName_ = goog.getCssName('goog-offlinedialog-step-number'); 
goog.ui.OfflineInstallDialog.InstallScreen.prototype.stepDescriptionClassName_ = goog.getCssName('goog-offlinedialog-step-description'); 
goog.ui.OfflineInstallDialog.InstallScreen.prototype.isInstallButtonDefault = true; 
goog.ui.OfflineInstallDialog.InstallScreen.prototype.getButtonSet = function() { 
  if(! this.buttonSet_) { 
    var buttonSet = this.buttonSet_ = new goog.ui.Dialog.ButtonSet(this.dom_); 
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.INSTALL, this.enableMsg_, this.isInstallButtonDefault, false); 
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.CANCEL, this.cancelMsg_, false, true); 
  } 
  return this.buttonSet_; 
}; 
goog.ui.OfflineInstallDialog.InstallScreen.prototype.setInstallDescription = function(description) { 
  this.installDescription_ = description; 
}; 
goog.ui.OfflineInstallDialog.InstallScreen.prototype.getContent = function() { 
  if(! this.content_) { 
    var sb = new goog.string.StringBuffer(this.installDescription_); 
    var MSG_OFFLINE_DIALOG_NEED_TO = goog.getMsg('You\'ll need to:'); 
    sb.append('<div class="', this.stepsClassName_, '">', MSG_OFFLINE_DIALOG_NEED_TO); 
    sb.append(this.getStepHtml_(1, this.installMsg_)); 
    var MSG_OFFLINE_DIALOG_RESTART_BROWSER = goog.getMsg('Restart your browser'); 
    sb.append(this.getStepHtml_(2, MSG_OFFLINE_DIALOG_RESTART_BROWSER)); 
    var MSG_OFFLINE_DIALOG_COME_BACK = goog.getMsg('Come back to {$appUrl}!', { 'appUrl': '<span class="' + this.appUrlClassName_ + '">' + this.dialog_.getAppUrl() + '</span>' }); 
    sb.append(this.getStepHtml_(3, MSG_OFFLINE_DIALOG_COME_BACK)); 
    sb.append('</div>'); 
    this.content_ = String(sb); 
  } 
  return this.content_; 
}; 
goog.ui.OfflineInstallDialog.InstallScreen.prototype.getStepHtml_ = function(stepNumber, description) { 
  return goog.string.buildString('<div class="', this.stepClassName_, '"><span class="', this.stepNumberClassName_, '">', stepNumber, '</span><span class="', this.stepDescriptionClassName_, '">', description, '</span></div>'); 
}; 
goog.ui.OfflineInstallDialog.InstallScreen.prototype.handleSelect = function(e) { 
  switch(e.key) { 
    case goog.ui.OfflineInstallDialog.ButtonKeyType.INSTALL: 
    case goog.ui.OfflineInstallDialog.ButtonKeyType.UPGRADE: 
      e.preventDefault(); 
      this.dialog_.goToGearsDownloadPage(); 
      this.dialog_.setCurrentScreenType(goog.ui.OfflineInstallDialog.ScreenType.INSTALLING_GEARS); 
      break; 

  } 
}; 
goog.ui.OfflineInstallDialog.UpgradeScreen = function(dialog) { 
  goog.ui.OfflineInstallDialog.InstallScreen.call(this, dialog, goog.ui.OfflineInstallDialog.UpgradeScreen.TYPE); 
  var MSG_OFFLINE_DIALOG_INSTALL_NEW_GEARS = goog.getMsg('Install a new version of Gears'); 
  this.installMsg_ = MSG_OFFLINE_DIALOG_INSTALL_NEW_GEARS; 
  var MSG_OFFLINE_DIALOG_UPGRADE_GEARS = goog.getMsg('Upgrade Gears now'); 
  this.enableMsg_ = MSG_OFFLINE_DIALOG_UPGRADE_GEARS; 
}; 
goog.inherits(goog.ui.OfflineInstallDialog.UpgradeScreen, goog.ui.OfflineInstallDialog.InstallScreen); 
goog.ui.OfflineInstallDialog.UpgradeScreen.TYPE = goog.ui.OfflineInstallDialog.ScreenType.UPGRADE; 
goog.ui.OfflineInstallDialog.UpgradeScreen.prototype.isUpgradeButtonDefault = true; 
goog.ui.OfflineInstallDialog.UpgradeScreen.prototype.getButtonSet = function() { 
  if(! this.buttonSet_) { 
    var MSG_OFFLINE_DIALOG_CANCEL_3 = goog.getMsg('Cancel'); 
    var buttonSet = this.buttonSet_ = new goog.ui.Dialog.ButtonSet(this.dom_); 
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.UPGRADE, this.enableMsg_, this.isUpgradeButtonDefault, false); 
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.CANCEL, MSG_OFFLINE_DIALOG_CANCEL_3, false, true); 
  } 
  return this.buttonSet_; 
}; 
goog.ui.OfflineInstallDialog.UpgradeScreen.prototype.setUpgradeDescription = function(description) { 
  this.setInstallDescription(description); 
}; 
goog.ui.OfflineInstallDialog.InstallingGearsScreen = function(dialog) { 
  goog.ui.OfflineInstallDialogScreen.call(this, dialog, goog.ui.OfflineInstallDialog.InstallingGearsScreen.TYPE); 
}; 
goog.inherits(goog.ui.OfflineInstallDialog.InstallingGearsScreen, goog.ui.OfflineInstallDialogScreen); 
goog.ui.OfflineInstallDialog.InstallingGearsScreen.TYPE = goog.ui.OfflineInstallDialog.ScreenType.INSTALLING_GEARS; 
goog.ui.OfflineInstallDialog.InstallingGearsScreen.prototype.boldClassName_ = goog.getCssName('goog-offlinedialog-bold'); 
goog.ui.OfflineInstallDialog.InstallingGearsScreen.prototype.getButtonSet = function() { 
  if(! this.buttonSet_) { 
    var MSG_OFFLINE_DIALOG_CLOSE = goog.getMsg('Close'); 
    var buttonSet = this.buttonSet_ = new goog.ui.Dialog.ButtonSet(this.dom_); 
    buttonSet.set(goog.ui.OfflineInstallDialog.ButtonKeyType.CLOSE, MSG_OFFLINE_DIALOG_CLOSE, false, true); 
  } 
  return this.buttonSet_; 
}; 
goog.ui.OfflineInstallDialog.InstallingGearsScreen.prototype.getContent = function() { 
  if(! this.content_) { 
    var MSG_OFFLINE_DIALOG_GEARS_DOWNLOAD_OPEN = goog.getMsg('Great! The Gears download page has been opened in a new ' + 'window. If you accidentally closed it, you can {$aBegin}open the ' + 'Gears download page again{$aEnd}.', { 
      'aBegin': '<a ' + 'target="_blank" href="' + this.getDialog().getGearsDownloadPageUrl() + '">', 
      'aEnd': '</a>' 
    }); 
    var MSG_OFFLINE_DIALOG_GEARS_AFTER_INSTALL = goog.getMsg('After you\'ve ' + 'downloaded and installed Gears, {$beginTag}restart your ' + 'browser, and then come back to {$appUrl}!{$endTag}', { 
      'beginTag': '<div class="' + this.boldClassName_ + '">', 
      'endTag': '</div>', 
      'appUrl': this.getDialog().getAppUrl() 
    }); 
    this.content_ = goog.string.buildString('<div>', MSG_OFFLINE_DIALOG_GEARS_DOWNLOAD_OPEN, '</div><br/><div>', MSG_OFFLINE_DIALOG_GEARS_AFTER_INSTALL, '</div>'); 
  } 
  return this.content_; 
}; 
