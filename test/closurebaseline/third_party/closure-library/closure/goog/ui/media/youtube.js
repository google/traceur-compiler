
goog.provide('goog.ui.media.Youtube'); 
goog.provide('goog.ui.media.YoutubeModel'); 
goog.require('goog.string'); 
goog.require('goog.ui.Component.Error'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.media.FlashObject'); 
goog.require('goog.ui.media.Media'); 
goog.require('goog.ui.media.MediaModel'); 
goog.require('goog.ui.media.MediaModel.Player'); 
goog.require('goog.ui.media.MediaModel.Thumbnail'); 
goog.require('goog.ui.media.MediaRenderer'); 
goog.ui.media.Youtube = function() { 
  goog.ui.media.MediaRenderer.call(this); 
}; 
goog.inherits(goog.ui.media.Youtube, goog.ui.media.MediaRenderer); 
goog.addSingletonGetter(goog.ui.media.Youtube); 
goog.ui.media.Youtube.newControl = function(youtubeModel, opt_domHelper) { 
  var control = new goog.ui.media.Media(youtubeModel, goog.ui.media.Youtube.getInstance(), opt_domHelper); 
  control.setStateInternal(goog.ui.Component.State.ACTIVE); 
  return control; 
}; 
goog.ui.media.Youtube.CSS_CLASS = goog.getCssName('goog-ui-media-youtube'); 
goog.ui.media.Youtube.prototype.setState = function(control, state, enable) { 
  goog.ui.media.Youtube.superClass_.setState.call(this, control, state, enable); 
  if(! control.getElement()) { 
    throw Error(goog.ui.Component.Error.STATE_INVALID); 
  } 
  var domHelper = control.getDomHelper(); 
  var dataModel =(control.getDataModel()); 
  if(! !(state & goog.ui.Component.State.SELECTED) && enable) { 
    var flashEls = domHelper.getElementsByTagNameAndClass('div', goog.ui.media.FlashObject.CSS_CLASS, control.getElement()); 
    if(flashEls.length > 0) { 
      return; 
    } 
    var youtubeFlash = new goog.ui.media.FlashObject(dataModel.getPlayer().getUrl() || '', domHelper); 
    control.addChild(youtubeFlash, true); 
  } 
}; 
goog.ui.media.Youtube.prototype.getCssClass = function() { 
  return goog.ui.media.Youtube.CSS_CLASS; 
}; 
goog.ui.media.YoutubeModel = function(videoId, opt_caption, opt_description) { 
  goog.ui.media.MediaModel.call(this, goog.ui.media.YoutubeModel.buildUrl(videoId), opt_caption, opt_description, goog.ui.media.MediaModel.MimeType.FLASH); 
  this.videoId_ = videoId; 
  this.setThumbnails([new goog.ui.media.MediaModel.Thumbnail(goog.ui.media.YoutubeModel.getThumbnailUrl(videoId))]); 
  this.setPlayer(new goog.ui.media.MediaModel.Player(this.getFlashUrl(videoId, true))); 
}; 
goog.inherits(goog.ui.media.YoutubeModel, goog.ui.media.MediaModel); 
goog.ui.media.YoutubeModel.MATCHER_ = new RegExp('http://(?:[a-zA_Z]{2,3}.)?' + '(?:youtube\.com/watch)' + '(?:\\?(?:[\\w\-\=]+&(?:amp;)?)*v=([\\w\-]+)' + '(?:&(?:amp;)?[\\w\-\=]+)*)?' + '(?:#[!]?(?:' + '(?:(?:[\\w\-\=]+&(?:amp;)?)*(?:v=([\\w\-]+))' + '(?:&(?:amp;)?[\\w\-\=]+)*)' + '|' + '(?:[\\w\-\=&]+)' + '))?' + '(?:/|\\b)', 'i'); 
goog.ui.media.YoutubeModel.newInstance = function(youtubeUrl, opt_caption, opt_description) { 
  var extract = goog.ui.media.YoutubeModel.MATCHER_.exec(youtubeUrl); 
  if(extract) { 
    var videoId = extract[1]|| extract[2]; 
    return new goog.ui.media.YoutubeModel(videoId, opt_caption, opt_description); 
  } 
  throw Error('failed to parse video id from youtube url: ' + youtubeUrl); 
}; 
goog.ui.media.YoutubeModel.buildUrl = function(videoId) { 
  return 'http://www.youtube.com/watch?v=' + goog.string.urlEncode(videoId); 
}; 
goog.ui.media.YoutubeModel.getThumbnailUrl = function(youtubeId) { 
  return 'http://i.ytimg.com/vi/' + youtubeId + '/default.jpg'; 
}; 
goog.ui.media.YoutubeModel.prototype.getFlashUrl = function(videoId, opt_autoplay) { 
  var autoplay = opt_autoplay ? '&autoplay=1': ''; 
  return 'http://www.youtube.com/v/' + goog.string.urlEncode(videoId) + '&hl=en&fs=1' + autoplay; 
}; 
goog.ui.media.YoutubeModel.prototype.getVideoId = function() { 
  return this.videoId_; 
}; 
