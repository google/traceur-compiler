
goog.provide('goog.ui.media.GoogleVideo'); 
goog.provide('goog.ui.media.GoogleVideoModel'); 
goog.require('goog.string'); 
goog.require('goog.ui.media.FlashObject'); 
goog.require('goog.ui.media.Media'); 
goog.require('goog.ui.media.MediaModel'); 
goog.require('goog.ui.media.MediaModel.Player'); 
goog.require('goog.ui.media.MediaRenderer'); 
goog.ui.media.GoogleVideo = function() { 
  goog.ui.media.MediaRenderer.call(this); 
}; 
goog.inherits(goog.ui.media.GoogleVideo, goog.ui.media.MediaRenderer); 
goog.addSingletonGetter(goog.ui.media.GoogleVideo); 
goog.ui.media.GoogleVideo.newControl = function(dataModel, opt_domHelper) { 
  var control = new goog.ui.media.Media(dataModel, goog.ui.media.GoogleVideo.getInstance(), opt_domHelper); 
  control.setSelected(true); 
  return control; 
}; 
goog.ui.media.GoogleVideo.CSS_CLASS = goog.getCssName('goog-ui-media-googlevideo'); 
goog.ui.media.GoogleVideo.prototype.createDom = function(control) { 
  var div = goog.base(this, 'createDom', control); 
  var dataModel =(control.getDataModel()); 
  var flash = new goog.ui.media.FlashObject(dataModel.getPlayer().getUrl() || '', control.getDomHelper()); 
  flash.render(div); 
  return div; 
}; 
goog.ui.media.GoogleVideo.prototype.getCssClass = function() { 
  return goog.ui.media.GoogleVideo.CSS_CLASS; 
}; 
goog.ui.media.GoogleVideoModel = function(videoId, opt_caption, opt_description, opt_autoplay) { 
  goog.ui.media.MediaModel.call(this, goog.ui.media.GoogleVideoModel.buildUrl(videoId), opt_caption, opt_description, goog.ui.media.MediaModel.MimeType.FLASH); 
  this.videoId_ = videoId; 
  this.setPlayer(new goog.ui.media.MediaModel.Player(goog.ui.media.GoogleVideoModel.buildFlashUrl(videoId, opt_autoplay))); 
}; 
goog.inherits(goog.ui.media.GoogleVideoModel, goog.ui.media.MediaModel); 
goog.ui.media.GoogleVideoModel.MATCHER_ = /^http:\/\/(?:www\.)?video\.google\.com\/videoplay.*[\?#]docid=(-?[0-9]+)#?$/i; 
goog.ui.media.GoogleVideoModel.newInstance = function(googleVideoUrl, opt_caption, opt_description, opt_autoplay) { 
  if(goog.ui.media.GoogleVideoModel.MATCHER_.test(googleVideoUrl)) { 
    var data = goog.ui.media.GoogleVideoModel.MATCHER_.exec(googleVideoUrl); 
    return new goog.ui.media.GoogleVideoModel(data[1], opt_caption, opt_description, opt_autoplay); 
  } 
  throw Error('failed to parse video id from GoogleVideo url: ' + googleVideoUrl); 
}; 
goog.ui.media.GoogleVideoModel.buildUrl = function(videoId) { 
  return 'http://video.google.com/videoplay?docid=' + goog.string.urlEncode(videoId); 
}; 
goog.ui.media.GoogleVideoModel.buildFlashUrl = function(videoId, opt_autoplay) { 
  var autoplay = opt_autoplay ? '&autoplay=1': ''; 
  return 'http://video.google.com/googleplayer.swf?docid=' + goog.string.urlEncode(videoId) + '&hl=en&fs=true' + autoplay; 
}; 
goog.ui.media.GoogleVideoModel.prototype.getVideoId = function() { 
  return this.videoId_; 
}; 
