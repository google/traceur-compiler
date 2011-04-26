
goog.provide('goog.ui.media.FlickrSet'); 
goog.provide('goog.ui.media.FlickrSetModel'); 
goog.require('goog.object'); 
goog.require('goog.ui.media.FlashObject'); 
goog.require('goog.ui.media.Media'); 
goog.require('goog.ui.media.MediaModel'); 
goog.require('goog.ui.media.MediaModel.Player'); 
goog.require('goog.ui.media.MediaRenderer'); 
goog.ui.media.FlickrSet = function() { 
  goog.ui.media.MediaRenderer.call(this); 
}; 
goog.inherits(goog.ui.media.FlickrSet, goog.ui.media.MediaRenderer); 
goog.addSingletonGetter(goog.ui.media.FlickrSet); 
goog.ui.media.FlickrSet.CSS_CLASS = goog.getCssName('goog-ui-media-flickrset'); 
goog.ui.media.FlickrSet.flashUrl_ = 'http://www.flickr.com/apps/slideshow/show.swf?v=63961'; 
goog.ui.media.FlickrSet.newControl = function(dataModel, opt_domHelper) { 
  var control = new goog.ui.media.Media(dataModel, goog.ui.media.FlickrSet.getInstance(), opt_domHelper); 
  control.setSelected(true); 
  return control; 
}; 
goog.ui.media.FlickrSet.setFlashUrl = function(flashUrl) { 
  goog.ui.media.FlickrSet.flashUrl_ = flashUrl; 
}; 
goog.ui.media.FlickrSet.prototype.createDom = function(control) { 
  var div = goog.ui.media.FlickrSet.superClass_.createDom.call(this, control); 
  var model =(control.getDataModel()); 
  var flash = new goog.ui.media.FlashObject(model.getPlayer().getUrl() || '', control.getDomHelper()); 
  goog.object.forEach(model.getPlayer().getVars(), function(value, key) { 
    flash.setFlashVars(key, value); 
  }); 
  flash.render(div); 
  return div; 
}; 
goog.ui.media.FlickrSet.prototype.getCssClass = function() { 
  return goog.ui.media.FlickrSet.CSS_CLASS; 
}; 
goog.ui.media.FlickrSetModel = function(userId, setId, opt_caption, opt_description) { 
  goog.ui.media.MediaModel.call(this, goog.ui.media.FlickrSetModel.buildUrl(userId, setId), opt_caption, opt_description, goog.ui.media.MediaModel.MimeType.FLASH); 
  this.userId_ = userId; 
  this.setId_ = setId; 
  var flashVars = { 
    'offsite': 'true', 
    'lang': 'en', 
    'page_show_url': '/photos/' + userId + '/sets/' + setId + '/show/', 
    'page_show_back_url': '/photos/' + userId + '/sets/' + setId, 
    'set_id': setId 
  }; 
  var player = new goog.ui.media.MediaModel.Player(goog.ui.media.FlickrSet.flashUrl_, flashVars); 
  this.setPlayer(player); 
}; 
goog.inherits(goog.ui.media.FlickrSetModel, goog.ui.media.MediaModel); 
goog.ui.media.FlickrSetModel.MATCHER_ = /(?:http:\/\/)?(?:www\.)?flickr\.com\/(?:photos\/([\d\w@\-]+)\/sets\/(\d+))\/?/i; 
goog.ui.media.FlickrSetModel.newInstance = function(flickrSetUrl, opt_caption, opt_description) { 
  if(goog.ui.media.FlickrSetModel.MATCHER_.test(flickrSetUrl)) { 
    var data = goog.ui.media.FlickrSetModel.MATCHER_.exec(flickrSetUrl); 
    return new goog.ui.media.FlickrSetModel(data[1], data[2], opt_caption, opt_description); 
  } 
  throw Error('failed to parse flickr url: ' + flickrSetUrl); 
}; 
goog.ui.media.FlickrSetModel.buildUrl = function(userId, setId) { 
  return 'http://flickr.com/photos/' + userId + '/sets/' + setId; 
}; 
goog.ui.media.FlickrSetModel.prototype.getUserId = function() { 
  return this.userId_; 
}; 
goog.ui.media.FlickrSetModel.prototype.getSetId = function() { 
  return this.setId_; 
}; 
