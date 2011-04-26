
goog.provide('goog.ui.OfflineStatusComponent'); 
goog.provide('goog.ui.OfflineStatusComponent.StatusClassNames'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.EventType'); 
goog.require('goog.gears.StatusType'); 
goog.require('goog.positioning'); 
goog.require('goog.positioning.AnchoredPosition'); 
goog.require('goog.positioning.Corner'); 
goog.require('goog.positioning.Overflow'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Popup'); 
goog.ui.OfflineStatusComponent = function(opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
}; 
goog.inherits(goog.ui.OfflineStatusComponent, goog.ui.Component); 
goog.ui.OfflineStatusComponent.StatusClassNames = { 
  NOT_INSTALLED: goog.getCssName('goog-offlinestatus-notinstalled'), 
  INSTALLED: goog.getCssName('goog-offlinestatus-installed'), 
  PAUSED: goog.getCssName('goog-offlinestatus-paused'), 
  OFFLINE: goog.getCssName('goog-offlinestatus-offline'), 
  ONLINE: goog.getCssName('goog-offlinestatus-online'), 
  SYNCING: goog.getCssName('goog-offlinestatus-syncing'), 
  ERROR: goog.getCssName('goog-offlinestatus-error') 
}; 
goog.ui.OfflineStatusComponent.prototype.dirty_ = false; 
goog.ui.OfflineStatusComponent.prototype.status_ = goog.gears.StatusType.NOT_INSTALLED; 
goog.ui.OfflineStatusComponent.prototype.displayedStatus_ = null; 
goog.ui.OfflineStatusComponent.prototype.dialog_ = null; 
goog.ui.OfflineStatusComponent.prototype.card_ = null; 
goog.ui.OfflineStatusComponent.prototype.popup_ = null; 
goog.ui.OfflineStatusComponent.prototype.className_ = goog.getCssName('goog-offlinestatus'); 
goog.ui.OfflineStatusComponent.prototype.MSG_OFFLINE_NEW_FEATURE_ = goog.getMsg('New! Offline Access'); 
goog.ui.OfflineStatusComponent.prototype.MSG_OFFLINE_STATUS_PAUSED_TITLE_ = goog.getMsg('Paused (offline). Click to connect.'); 
goog.ui.OfflineStatusComponent.prototype.MSG_OFFLINE_STATUS_OFFLINE_TITLE_ = goog.getMsg('Offline. No connection available.'); 
goog.ui.OfflineStatusComponent.prototype.MSG_OFFLINE_STATUS_ONLINE_TITLE_ = goog.getMsg('Online. Click for details.'); 
goog.ui.OfflineStatusComponent.prototype.MSG_OFFLINE_STATUS_SYNCING_TITLE_ = goog.getMsg('Synchronizing. Click for details.'); 
goog.ui.OfflineStatusComponent.prototype.MSG_OFFLINE_STATUS_ERROR_TITLE_ = goog.getMsg('Errors found. Click for details.'); 
goog.ui.OfflineStatusComponent.prototype.getStatus = function() { 
  return this.status_; 
}; 
goog.ui.OfflineStatusComponent.prototype.setStatus = function(status) { 
  if(this.isStatusDifferent(status)) { 
    this.dirty_ = true; 
  } 
  this.status_ = status; 
  if(this.isInDocument()) { 
    this.update(); 
  } 
  if(this.card_) { 
    this.card_.setStatus(status); 
  } 
}; 
goog.ui.OfflineStatusComponent.prototype.isStatusDifferent = function(status) { 
  return this.status_ != status; 
}; 
goog.ui.OfflineStatusComponent.prototype.setInstallDialog = function(dialog) { 
  if(this.dialog_ && this.indexOfChild(this.dialog_) >= 0) { 
    this.removeChild(this.dialog_); 
  } 
  this.dialog_ = dialog; 
}; 
goog.ui.OfflineStatusComponent.prototype.getInstallDialog = function() { 
  return this.dialog_; 
}; 
goog.ui.OfflineStatusComponent.prototype.setStatusCard = function(card) { 
  if(this.card_) { 
    this.getHandler().unlisten(this.card_, goog.ui.OfflineStatusCard.EventType.DISMISS, this.performStatusAction, false, this); 
    this.popup_.dispose(); 
    if(this.indexOfChild(this.card_) >= 0) { 
      this.removeChild(this.card_); 
    } 
    this.popup_ = null; 
    this.card_ = null; 
  } 
  this.card_ = card; 
  this.getHandler().listen(this.card_, goog.ui.OfflineStatusCard.EventType.DISMISS, this.performStatusAction, false, this); 
  card.setStatus(this.status_); 
}; 
goog.ui.OfflineStatusComponent.prototype.getStatusCard = function() { 
  return this.card_; 
}; 
goog.ui.OfflineStatusComponent.prototype.createDom = function() { 
  var anchorProps = { 
    'class': this.className_, 
    'href': '#' 
  }; 
  this.setElementInternal(this.getDomHelper().createDom('a', anchorProps)); 
  this.update(); 
}; 
goog.ui.OfflineStatusComponent.prototype.enterDocument = function() { 
  goog.ui.OfflineStatusComponent.superClass_.enterDocument.call(this); 
  this.getHandler().listen(this.getElement(), goog.events.EventType.CLICK, this.handleClick_); 
  if(this.dirty_) { 
    this.update(); 
  } 
}; 
goog.ui.OfflineStatusComponent.prototype.update = function() { 
  if(this.getElement()) { 
    var status = this.getStatus(); 
    var messageInfo = this.getMessageInfo(status); 
    var element = this.getElement(); 
    element.title = messageInfo.title; 
    var previousStatus = this.displayStatus_; 
    var previousStatusClassName = this.getStatusClassName_(previousStatus); 
    var currentStatusClassName = this.getStatusClassName_(status); 
    if(previousStatus && goog.dom.classes.has(element, previousStatusClassName)) { 
      goog.dom.classes.swap(element, previousStatusClassName, currentStatusClassName); 
    } else { 
      goog.dom.classes.add(element, currentStatusClassName); 
    } 
    this.displayStatus_ = status; 
    if(messageInfo.textIsHtml) { 
      element.innerHTML = messageInfo.text; 
    } else { 
      this.getDomHelper().setTextContent(element, messageInfo.text); 
    } 
    this.dirty_ = false; 
  } 
}; 
goog.ui.OfflineStatusComponent.prototype.getMessageInfo = function(status) { 
  var title = ''; 
  var text = '&nbsp;&nbsp;&nbsp;'; 
  var textIsHtml = true; 
  switch(status) { 
    case goog.gears.StatusType.NOT_INSTALLED: 
    case goog.gears.StatusType.INSTALLED: 
      text = this.MSG_OFFLINE_NEW_FEATURE_; 
      textIsHtml = false; 
      break; 

    case goog.gears.StatusType.PAUSED: 
      title = this.MSG_OFFLINE_STATUS_PAUSED_TITLE_; 
      break; 

    case goog.gears.StatusType.OFFLINE: 
      title = this.MSG_OFFLINE_STATUS_OFFLINE_TITLE_; 
      break; 

    case goog.gears.StatusType.ONLINE: 
      title = this.MSG_OFFLINE_STATUS_ONLINE_TITLE_; 
      break; 

    case goog.gears.StatusType.SYNCING: 
      title = this.MSG_OFFLINE_STATUS_SYNCING_TITLE_; 
      break; 

    case goog.gears.StatusType.ERROR: 
      title = this.MSG_OFFLINE_STATUS_ERROR_TITLE_; 
      break; 

    default: 
      break; 

  } 
  return { 
    text: text, 
    textIsHtml: textIsHtml, 
    title: title 
  }; 
}; 
goog.ui.OfflineStatusComponent.prototype.getStatusClassName_ = function(status) { 
  var className = ''; 
  switch(status) { 
    case goog.gears.StatusType.NOT_INSTALLED: 
      className = goog.ui.OfflineStatusComponent.StatusClassNames.NOT_INSTALLED; 
      break; 

    case goog.gears.StatusType.INSTALLED: 
      className = goog.ui.OfflineStatusComponent.StatusClassNames.INSTALLED; 
      break; 

    case goog.gears.StatusType.PAUSED: 
      className = goog.ui.OfflineStatusComponent.StatusClassNames.PAUSED; 
      break; 

    case goog.gears.StatusType.OFFLINE: 
      className = goog.ui.OfflineStatusComponent.StatusClassNames.OFFLINE; 
      break; 

    case goog.gears.StatusType.ONLINE: 
      className = goog.ui.OfflineStatusComponent.StatusClassNames.ONLINE; 
      break; 

    case goog.gears.StatusType.SYNCING: 
    case goog.gears.StatusType.CAPTURING: 
      className = goog.ui.OfflineStatusComponent.StatusClassNames.SYNCING; 
      break; 

    case goog.gears.StatusType.ERROR: 
      className = goog.ui.OfflineStatusComponent.StatusClassNames.ERROR; 
      break; 

    default: 
      break; 

  } 
  return className; 
}; 
goog.ui.OfflineStatusComponent.prototype.handleClick_ = function(e) { 
  this.performAction(); 
  return false; 
}; 
goog.ui.OfflineStatusComponent.prototype.performAction = function() { 
  var status = this.getStatus(); 
  if(status == goog.gears.StatusType.NOT_INSTALLED || status == goog.gears.StatusType.INSTALLED) { 
    this.performEnableAction(); 
  } else { 
    this.performStatusAction(); 
  } 
}; 
goog.ui.OfflineStatusComponent.prototype.performEnableAction = function() { 
  var dialog = this.dialog_; 
  if(dialog) { 
    if(! dialog.isInDocument()) { 
      this.addChild(dialog); 
      dialog.render(this.getDomHelper().getDocument().body); 
    } 
    dialog.setVisible(true); 
  } 
}; 
goog.ui.OfflineStatusComponent.prototype.performStatusAction = function(opt_evt, opt_element) { 
  var card = this.card_; 
  if(card) { 
    if(! this.popup_) { 
      if(! card.getElement()) { 
        card.createDom(); 
      } 
      this.insertCardElement(card); 
      this.addChild(card); 
      var popup = this.getPopupInternal(); 
      var anchorEl = opt_element || this.getElement(); 
      var pos = new goog.positioning.AnchoredPosition(anchorEl, goog.positioning.Corner.BOTTOM_START); 
      pos.reposition = function(element, popupCorner, opt_margin) { 
        goog.positioning.positionAtAnchor(this.element, this.corner, element, popupCorner, null, opt_margin, goog.positioning.Overflow.ADJUST_X); 
      }; 
      popup.setPosition(pos); 
      popup.setElement(card.getElement()); 
    } 
    this.popup_.setVisible(! this.popup_.isOrWasRecentlyVisible()); 
  } 
}; 
goog.ui.OfflineStatusComponent.prototype.insertCardElement = function(card) { 
  this.getDomHelper().getDocument().body.appendChild(card.getElement()); 
}; 
goog.ui.OfflineStatusComponent.prototype.getPopupInternal = function() { 
  if(! this.popup_) { 
    this.popup_ = new goog.ui.Popup(); 
    this.popup_.setMargin(3, 0, 0, 0); 
  } 
  return this.popup_; 
}; 
goog.ui.OfflineStatusComponent.prototype.disposeInternal = function() { 
  goog.ui.OfflineStatusComponent.superClass_.disposeInternal.call(this); 
  if(this.dialog_) { 
    this.dialog_.dispose(); 
    this.dialog_ = null; 
  } 
  if(this.card_) { 
    this.card_.dispose(); 
    this.card_ = null; 
  } 
  if(this.popup_) { 
    this.popup_.dispose(); 
    this.popup_ = null; 
  } 
}; 
