
goog.provide('goog.ui.media.Media'); 
goog.provide('goog.ui.media.MediaRenderer'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.Control'); 
goog.require('goog.ui.ControlRenderer'); 
goog.ui.media.Media = function(dataModel, opt_renderer, opt_domHelper) { 
  goog.ui.Control.call(this, null, opt_renderer, opt_domHelper); 
  this.setDataModel(dataModel); 
  this.setSupportedState(goog.ui.Component.State.OPENED, true); 
  this.setSupportedState(goog.ui.Component.State.SELECTED, true); 
  this.setAllowTextSelection(true); 
  this.setRightToLeft(false); 
}; 
goog.inherits(goog.ui.media.Media, goog.ui.Control); 
goog.ui.media.Media.prototype.dataModel_; 
goog.ui.media.Media.prototype.setDataModel = function(dataModel) { 
  this.dataModel_ = dataModel; 
}; 
goog.ui.media.Media.prototype.getDataModel = function() { 
  return this.dataModel_; 
}; 
goog.ui.media.MediaRenderer = function() { 
  goog.ui.ControlRenderer.call(this); 
}; 
goog.inherits(goog.ui.media.MediaRenderer, goog.ui.ControlRenderer); 
goog.ui.media.MediaRenderer.prototype.createDom = function(control) { 
  var domHelper = control.getDomHelper(); 
  var div = domHelper.createElement('div'); 
  div.className = this.getClassNames(control).join(' '); 
  var dataModel = control.getDataModel(); 
  if(dataModel.getCaption()) { 
    var caption = domHelper.createElement('div'); 
    caption.className = goog.getCssName(this.getCssClass(), 'caption'); 
    caption.appendChild(domHelper.createDom('p', goog.getCssName(this.getCssClass(), 'caption-text'), dataModel.getCaption())); 
    domHelper.appendChild(div, caption); 
  } 
  if(dataModel.getDescription()) { 
    var description = domHelper.createElement('div'); 
    description.className = goog.getCssName(this.getCssClass(), 'description'); 
    description.appendChild(domHelper.createDom('p', goog.getCssName(this.getCssClass(), 'description-text'), dataModel.getDescription())); 
    domHelper.appendChild(div, description); 
  } 
  var thumbnails = dataModel.getThumbnails() ||[]; 
  for(var index = 0; index < thumbnails.length; index ++) { 
    var thumbnail = thumbnails[index]; 
    var thumbnailElement = domHelper.createElement('img'); 
    thumbnailElement.src = thumbnail.getUrl(); 
    thumbnailElement.className = this.getThumbnailCssName(index); 
    var size = thumbnail.getSize(); 
    if(size && goog.isDefAndNotNull(size.height) && goog.isDefAndNotNull(size.width)) { 
      goog.style.setSize(thumbnailElement, size); 
    } 
    domHelper.appendChild(div, thumbnailElement); 
  } 
  if(dataModel.getPlayer()) { 
    var playButton = domHelper.createElement('div'); 
    playButton.className = goog.getCssName(this.getCssClass(), 'playbutton'); 
    domHelper.appendChild(div, playButton); 
  } 
  control.setElementInternal(div); 
  this.setState(control,(control.getState()), true); 
  return div; 
}; 
goog.ui.media.MediaRenderer.prototype.getThumbnailCssName = function(index) { 
  switch(index) { 
    case 0: 
      return goog.getCssName(this.getCssClass(), 'thumbnail0'); 

    case 1: 
      return goog.getCssName(this.getCssClass(), 'thumbnail1'); 

    case 2: 
      return goog.getCssName(this.getCssClass(), 'thumbnail2'); 

    case 3: 
      return goog.getCssName(this.getCssClass(), 'thumbnail3'); 

    case 4: 
      return goog.getCssName(this.getCssClass(), 'thumbnail4'); 

    default: 
      return goog.getCssName(this.getCssClass(), 'thumbnailn'); 

  } 
}; 
