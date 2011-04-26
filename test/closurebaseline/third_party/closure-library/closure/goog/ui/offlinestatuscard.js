
goog.provide('goog.ui.OfflineStatusCard'); 
goog.provide('goog.ui.OfflineStatusCard.EventType'); 
goog.require('goog.dom'); 
goog.require('goog.events.EventType'); 
goog.require('goog.gears.StatusType'); 
goog.require('goog.structs.Map'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.ProgressBar'); 
goog.ui.OfflineStatusCard = function(opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.progressBar_ = new goog.ui.ProgressBar(opt_domHelper); 
  this.addChild(this.progressBar_); 
  this.actionMap_ = new goog.structs.Map(); 
}; 
goog.inherits(goog.ui.OfflineStatusCard, goog.ui.Component); 
goog.ui.OfflineStatusCard.EventType = { DISMISS: 'dismiss' }; 
goog.ui.OfflineStatusCard.prototype.dirty = false; 
goog.ui.OfflineStatusCard.prototype.status_ = goog.gears.StatusType.NOT_INSTALLED; 
goog.ui.OfflineStatusCard.prototype.statusEl_ = null; 
goog.ui.OfflineStatusCard.prototype.actionEl_ = null; 
goog.ui.OfflineStatusCard.prototype.messageEl_ = null; 
goog.ui.OfflineStatusCard.prototype.progressEl_ = null; 
goog.ui.OfflineStatusCard.prototype.progressStatusEl_ = null; 
goog.ui.OfflineStatusCard.prototype.closeEl_ = null; 
goog.ui.OfflineStatusCard.prototype.className_ = goog.getCssName('goog-offlinestatuscard'); 
goog.ui.OfflineStatusCard.prototype.shadowClassName_ = goog.getCssName('goog-offlinestatuscard-shadow'); 
goog.ui.OfflineStatusCard.prototype.contentClassName_ = goog.getCssName('goog-offlinestatuscard-content'); 
goog.ui.OfflineStatusCard.prototype.statusClassName_ = goog.getCssName('goog-offlinestatuscard-status'); 
goog.ui.OfflineStatusCard.prototype.actionClassName_ = goog.getCssName('goog-offlinestatuscard-action'); 
goog.ui.OfflineStatusCard.prototype.actionItemClassName_ = goog.getCssName('goog-offlinestatuscard-action-item'); 
goog.ui.OfflineStatusCard.prototype.lastActionItemClassName_ = goog.getCssName('goog-offlinestatuscard-action-item-last'); 
goog.ui.OfflineStatusCard.prototype.messageClassName_ = goog.getCssName('goog-offlinestatuscard-message'); 
goog.ui.OfflineStatusCard.prototype.progressBarStatusClassName_ = goog.getCssName('goog-offlinestatuscard-progressbarstatus'); 
goog.ui.OfflineStatusCard.prototype.closeCardClassName_ = goog.getCssName('goog-offlinestatuscard-closecard'); 
goog.ui.OfflineStatusCard.prototype.getProgressBar = function() { 
  return this.progressBar_; 
}; 
goog.ui.OfflineStatusCard.prototype.getStatus = function() { 
  return this.status_; 
}; 
goog.ui.OfflineStatusCard.prototype.setStatus = function(status) { 
  if(this.status_ != status) { 
    this.dirty = true; 
  } 
  this.status_ = status; 
  if(this.isInDocument()) { 
    this.update(); 
  } 
}; 
goog.ui.OfflineStatusCard.prototype.createDom = function() { 
  var dom = this.getDomHelper(); 
  this.setElementInternal(dom.createDom('div', this.className_, dom.createDom('div', this.shadowClassName_, dom.createDom('div', this.contentClassName_, this.closeEl_ = dom.createDom('div', this.closeCardClassName_), this.statusEl_ = dom.createDom('div', this.statusClassName_), this.progressEl_ = dom.createDom('div', null, this.progressBarStatusEl_ = dom.createDom('div', this.progressBarStatusClassName_)), this.actionEl_ = dom.createDom('div', this.actionClassName_), this.messageEl_ = dom.createDom('div', this.messageClassName_))))); 
  this.progressBar_.createDom(); 
  dom.insertSiblingBefore(this.progressBar_.getElement(), this.progressBarStatusEl_); 
  this.createAdditionalDom(); 
  this.update(); 
}; 
goog.ui.OfflineStatusCard.prototype.enterDocument = function() { 
  goog.ui.OfflineStatusCard.superClass_.enterDocument.call(this); 
  var handler = this.getHandler(); 
  handler.listen(this.progressBar_, goog.ui.Component.EventType.CHANGE, this.handleProgressChange_); 
  handler.listen(this.actionEl_, goog.events.EventType.CLICK, this.handleActionClick_); 
  handler.listen(this.closeEl_, goog.events.EventType.CLICK, this.closePopup_); 
  if(this.dirty) { 
    this.update(); 
  } 
}; 
goog.ui.OfflineStatusCard.prototype.createAdditionalDom = function() { }; 
goog.ui.OfflineStatusCard.prototype.closePopup_ = function() { 
  this.dispatchEvent(goog.ui.OfflineStatusCard.EventType.DISMISS); 
}; 
goog.ui.OfflineStatusCard.prototype.update = function() { 
  if(this.getElement()) { 
    var status = this.getStatus(); 
    var dom = this.getDomHelper(); 
    this.configureStatusElement(status); 
    this.configureActionLinks(status); 
    this.configureProgressElement(status); 
    var message = this.getAdditionalMessage(status); 
    var messageEl = this.messageEl_; 
    goog.style.showElement(messageEl, message); 
    if(message) { 
      dom.setTextContent(messageEl, message); 
    } 
    this.dirty = false; 
  } 
}; 
goog.ui.OfflineStatusCard.prototype.configureStatusElement = function(status) { 
  var MSG_OFFLINE_STATUS = goog.getMsg('Status: {$msg}', { 'msg': this.getStatusMessage(status) }); 
  this.getDomHelper().setTextContent(this.statusEl_, MSG_OFFLINE_STATUS); 
}; 
goog.ui.OfflineStatusCard.prototype.configureActionLinks = function(status) { 
  var actions = this.getActions(status); 
  goog.dom.removeChildren(this.actionEl_); 
  this.actionMap_.clear(); 
  if(actions) { 
    var lastIdx = actions.length - 1; 
    for(var i = 0; i <= lastIdx; i ++) { 
      this.createLinkNode_(actions[i], i == lastIdx ? this.lastActionItemClassName_: this.actionItemClassName_); 
    } 
  } 
}; 
goog.ui.OfflineStatusCard.prototype.createLinkNode_ = function(action, className) { 
  var actionEl = this.actionEl_; 
  var dom = this.getDomHelper(); 
  var a = dom.createDom('span', className); 
  dom.appendChild(actionEl, a); 
  dom.appendChild(actionEl, dom.createTextNode(' ')); 
  this.actionMap_.set(goog.getUid(a), action.eventType); 
  goog.style.showElement(a, true); 
  dom.setTextContent(a, action.message); 
}; 
goog.ui.OfflineStatusCard.prototype.configureProgressElement = function(status) { 
  var showProgress = this.shouldShowProgressBar(status); 
  goog.style.showElement(this.progressEl_, showProgress); 
  if(showProgress) { 
    this.updateProgressStatus(); 
  } 
}; 
goog.ui.OfflineStatusCard.prototype.shouldShowProgressBar = function(status) { 
  return status == goog.gears.StatusType.SYNCING || status == goog.gears.StatusType.CAPTURING; 
}; 
goog.ui.OfflineStatusCard.prototype.handleProgressChange_ = function(e) { 
  this.updateProgressStatus(); 
}; 
goog.ui.OfflineStatusCard.prototype.handleActionClick_ = function(e) { 
  var actionEventType =(this.actionMap_.get(goog.getUid(e.target))); 
  if(actionEventType) { 
    this.dispatchEvent(actionEventType); 
  } 
}; 
goog.ui.OfflineStatusCard.prototype.updateProgressStatus = function() { 
  this.getDomHelper().setTextContent(this.progressBarStatusEl_, this.getProgressStatusMessage()); 
}; 
goog.ui.OfflineStatusCard.prototype.getProgressStatusMessage = function() { 
  var pb = this.progressBar_; 
  var percentValue = Math.round((pb.getValue() - pb.getMinimum()) /(pb.getMaximum() - pb.getMinimum()) * 100); 
  var MSG_OFFLINE_PERCENT_COMPLETE = goog.getMsg('{$num}% complete.', { 'num': percentValue }); 
  return MSG_OFFLINE_PERCENT_COMPLETE; 
}; 
goog.ui.OfflineStatusCard.prototype.getStatusMessage = function(status) { 
  var message = ''; 
  switch(status) { 
    case goog.gears.StatusType.OFFLINE: 
      var MSG_OFFLINE_STATUS_OFFLINE_MESSAGE = goog.getMsg('Offline. No connection available.'); 
      message = MSG_OFFLINE_STATUS_OFFLINE_MESSAGE; 
      break; 

    case goog.gears.StatusType.ONLINE: 
      var MSG_OFFLINE_STATUS_ONLINE_MESSAGE = goog.getMsg('Online'); 
      message = MSG_OFFLINE_STATUS_ONLINE_MESSAGE; 
      break; 

    case goog.gears.StatusType.SYNCING: 
      var MSG_OFFLINE_STATUS_SYNCING_MESSAGE = goog.getMsg('Synchronizing...'); 
      message = MSG_OFFLINE_STATUS_SYNCING_MESSAGE; 
      break; 

    case goog.gears.StatusType.CAPTURING: 
      var MSG_OFFLINE_STATUS_CAPTURING_MESSAGE = goog.getMsg('Updating software...'); 
      message = MSG_OFFLINE_STATUS_CAPTURING_MESSAGE; 
      break; 

    case goog.gears.StatusType.ERROR: 
      var MSG_OFFLINE_STATUS_ERROR_MESSAGE = goog.getMsg('Errors have been found.'); 
      message = MSG_OFFLINE_STATUS_ERROR_MESSAGE; 
      break; 

    default: 
      break; 

  } 
  return message; 
}; 
goog.ui.OfflineStatusCard.prototype.getActions = function(status) { 
  return null; 
}; 
goog.ui.OfflineStatusCard.prototype.createActionObject = function(actionMessage, actionEventType) { 
  return { 
    message: actionMessage, 
    eventType: actionEventType 
  }; 
}; 
goog.ui.OfflineStatusCard.prototype.getAdditionalMessage = function(status) { 
  return ''; 
}; 
goog.ui.OfflineStatusCard.prototype.disposeInternal = function() { 
  goog.ui.OfflineStatusCard.superClass_.disposeInternal.call(this); 
  this.progressBar_.dispose(); 
  this.progressBar_ = null; 
  this.actionMap_.clear(); 
  this.actionMap_ = null; 
  this.statusEl_ = null; 
  this.actionEl_ = null; 
  this.messageEl_ = null; 
  this.progressEl_ = null; 
  this.progressStatusEl_ = null; 
}; 
