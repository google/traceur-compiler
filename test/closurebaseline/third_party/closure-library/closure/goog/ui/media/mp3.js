
goog.provide('goog.ui.media.Mp3'); 
goog.require('goog.string'); 
goog.require('goog.ui.media.FlashObject'); 
goog.require('goog.ui.media.Media'); 
goog.require('goog.ui.media.MediaRenderer'); 
goog.ui.media.Mp3 = function() { 
  goog.ui.media.MediaRenderer.call(this); 
}; 
goog.inherits(goog.ui.media.Mp3, goog.ui.media.MediaRenderer); 
goog.addSingletonGetter(goog.ui.media.Mp3); 
goog.ui.media.Mp3.PLAYER_ARGUMENTS_ = 'audioUrl=%s'; 
goog.ui.media.Mp3.CSS_CLASS = goog.getCssName('goog-ui-media-mp3'); 
goog.ui.media.Mp3.flashUrl_ = 'http://www.google.com/reader/ui/3523697345-audio-player.swf'; 
goog.ui.media.Mp3.MATCHER = /(https?:\/\/[\w-%&\/.=:#\+~\(\)]+\.(mp3)+(\?[\w-%&\/.=:#\+~\(\)]+)?)/i; 
goog.ui.media.Mp3.newControl = function(dataModel, opt_domHelper) { 
  var control = new goog.ui.media.Media(dataModel, goog.ui.media.Mp3.getInstance(), opt_domHelper); 
  control.setSelected(true); 
  return control; 
}; 
goog.ui.media.Mp3.setFlashUrl = function(flashUrl) { 
  goog.ui.media.Mp3.flashUrl_ = flashUrl; 
}; 
goog.ui.media.Mp3.buildFlashUrl = function(mp3Url) { 
  var flashUrl = goog.ui.media.Mp3.flashUrl_ + '?' + goog.string.subs(goog.ui.media.Mp3.PLAYER_ARGUMENTS_, goog.string.urlEncode(mp3Url)); 
  return flashUrl; 
}; 
goog.ui.media.Mp3.prototype.createDom = function(control) { 
  var div = goog.ui.media.Mp3.superClass_.createDom.call(this, control); 
  var dataModel =(control.getDataModel()); 
  var flashUrl = goog.ui.media.Mp3.flashUrl_ + '?' + goog.string.subs(goog.ui.media.Mp3.PLAYER_ARGUMENTS_, goog.string.urlEncode(dataModel.getUrl())); 
  var flash = new goog.ui.media.FlashObject(dataModel.getPlayer().getUrl(), control.getDomHelper()); 
  flash.setFlashVars('playerMode', 'embedded'); 
  flash.render(div); 
  return div; 
}; 
goog.ui.media.Mp3.prototype.getCssClass = function() { 
  return goog.ui.media.Mp3.CSS_CLASS; 
}; 
