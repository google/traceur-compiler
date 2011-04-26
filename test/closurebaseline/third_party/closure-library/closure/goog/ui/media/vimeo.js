
goog.provide('goog.ui.media.Vimeo'); 
goog.provide('goog.ui.media.VimeoModel'); 
goog.require('goog.string'); 
goog.require('goog.ui.media.FlashObject'); 
goog.require('goog.ui.media.Media'); 
goog.require('goog.ui.media.MediaModel'); 
goog.require('goog.ui.media.MediaModel.Player'); 
goog.require('goog.ui.media.MediaRenderer'); 
goog.ui.media.Vimeo = function() { 
  goog.ui.media.MediaRenderer.call(this); 
}; 
goog.inherits(goog.ui.media.Vimeo, goog.ui.media.MediaRenderer); 
goog.addSingletonGetter(goog.ui.media.Vimeo); 
goog.ui.media.Vimeo.CSS_CLASS = goog.getCssName('goog-ui-media-vimeo'); 
goog.ui.media.Vimeo.newControl = function(dataModel, opt_domHelper) { 
  var control = new goog.ui.media.Media(dataModel, goog.ui.media.Vimeo.getInstance(), opt_domHelper); 
  control.setSelected(true); 
  return control; 
}; 
goog.ui.media.Vimeo.prototype.createDom = function(control) { 
  var div = goog.ui.media.Vimeo.superClass_.createDom.call(this, control); 
  var dataModel =(control.getDataModel()); 
  var flash = new goog.ui.media.FlashObject(dataModel.getPlayer().getUrl() || '', control.getDomHelper()); 
  flash.render(div); 
  return div; 
}; 
goog.ui.media.Vimeo.prototype.getCssClass = function() { 
  return goog.ui.media.Vimeo.CSS_CLASS; 
}; 
goog.ui.media.VimeoModel = function(videoId, opt_caption, opt_description, opt_autoplay) { 
  goog.ui.media.MediaModel.call(this, goog.ui.media.VimeoModel.buildUrl(videoId), opt_caption, opt_description, goog.ui.media.MediaModel.MimeType.FLASH); 
  this.videoId_ = videoId; 
  this.setPlayer(new goog.ui.media.MediaModel.Player(goog.ui.media.VimeoModel.buildFlashUrl(videoId, opt_autoplay))); 
}; 
goog.inherits(goog.ui.media.VimeoModel, goog.ui.media.MediaModel); 
goog.ui.media.VimeoModel.MATCHER_ = /https?:\/\/(?:www\.)?vimeo\.com\/(?:hd#)?([0-9]+)/i; 
goog.ui.media.VimeoModel.newInstance = function(vimeoUrl, opt_caption, opt_description, opt_autoplay) { 
  if(goog.ui.media.VimeoModel.MATCHER_.test(vimeoUrl)) { 
    var data = goog.ui.media.VimeoModel.MATCHER_.exec(vimeoUrl); 
    return new goog.ui.media.VimeoModel(data[1], opt_caption, opt_description, opt_autoplay); 
  } 
  throw Error('failed to parse vimeo url: ' + vimeoUrl); 
}; 
goog.ui.media.VimeoModel.buildUrl = function(videoId) { 
  return 'http://vimeo.com/' + goog.string.urlEncode(videoId); 
}; 
goog.ui.media.VimeoModel.buildFlashUrl = function(videoId, opt_autoplay) { 
  var autoplay = opt_autoplay ? '&autoplay=1': ''; 
  return 'http://vimeo.com/moogaloop.swf?clip_id=' + goog.string.urlEncode(videoId) + '&server=vimeo.com&show_title=1&show_byline=1&show_portrait=0color=&' + 'fullscreen=1' + autoplay; 
}; 
goog.ui.media.VimeoModel.prototype.getVideoId = function() { 
  return this.videoId_; 
}; 
