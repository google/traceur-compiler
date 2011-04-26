
goog.provide('goog.ui.media.PicasaAlbum'); 
goog.provide('goog.ui.media.PicasaAlbumModel'); 
goog.require('goog.object'); 
goog.require('goog.ui.media.FlashObject'); 
goog.require('goog.ui.media.Media'); 
goog.require('goog.ui.media.MediaModel'); 
goog.require('goog.ui.media.MediaModel.Player'); 
goog.require('goog.ui.media.MediaRenderer'); 
goog.ui.media.PicasaAlbum = function() { 
  goog.ui.media.MediaRenderer.call(this); 
}; 
goog.inherits(goog.ui.media.PicasaAlbum, goog.ui.media.MediaRenderer); 
goog.addSingletonGetter(goog.ui.media.PicasaAlbum); 
goog.ui.media.PicasaAlbum.CSS_CLASS = goog.getCssName('goog-ui-media-picasa'); 
goog.ui.media.PicasaAlbum.newControl = function(dataModel, opt_domHelper) { 
  var control = new goog.ui.media.Media(dataModel, goog.ui.media.PicasaAlbum.getInstance(), opt_domHelper); 
  control.setSelected(true); 
  return control; 
}; 
goog.ui.media.PicasaAlbum.prototype.createDom = function(control) { 
  var div = goog.ui.media.PicasaAlbum.superClass_.createDom.call(this, control); 
  var picasaAlbum =(control.getDataModel()); 
  var authParam = picasaAlbum.getAuthKey() ?('&authkey=' + picasaAlbum.getAuthKey()): ''; 
  var flash = new goog.ui.media.FlashObject(picasaAlbum.getPlayer().getUrl() || '', control.getDomHelper()); 
  goog.object.forEach(picasaAlbum.getPlayer().getVars(), function(value, key) { 
    flash.setFlashVars(key, value); 
  }); 
  flash.render(div); 
  return div; 
}; 
goog.ui.media.PicasaAlbum.prototype.getCssClass = function() { 
  return goog.ui.media.PicasaAlbum.CSS_CLASS; 
}; 
goog.ui.media.PicasaAlbumModel = function(userId, albumId, opt_authKey, opt_caption, opt_description, opt_autoplay) { 
  goog.ui.media.MediaModel.call(this, goog.ui.media.PicasaAlbumModel.buildUrl(userId, albumId), opt_caption, opt_description, goog.ui.media.MediaModel.MimeType.FLASH); 
  this.userId_ = userId; 
  this.albumId_ = albumId; 
  this.authKey_ = opt_authKey || null; 
  var authParam = opt_authKey ?('&authkey=' + opt_authKey): ''; 
  var flashVars = { 
    'host': 'picasaweb.google.com', 
    'RGB': '0x000000', 
    'feed': 'http://picasaweb.google.com/data/feed/api/user/' + userId + '/album/' + albumId + '?kind=photo&alt=rss' + authParam 
  }; 
  flashVars[opt_autoplay ? 'autoplay': 'noautoplay']= '1'; 
  var player = new goog.ui.media.MediaModel.Player('http://picasaweb.google.com/s/c/bin/slideshow.swf', flashVars); 
  this.setPlayer(player); 
}; 
goog.inherits(goog.ui.media.PicasaAlbumModel, goog.ui.media.MediaModel); 
goog.ui.media.PicasaAlbumModel.MATCHER_ = /https?:\/\/(?:www\.)?picasaweb\.(?:google\.)?com\/([\d\w\.]+)\/([\d\w_\-\.]+)(?:\?[\w\d\-_=&amp;;\.]*&?authKey=([\w\d\-_=;\.]+))?(?:#([\d]+)?)?/im; 
goog.ui.media.PicasaAlbumModel.newInstance = function(picasaUrl, opt_caption, opt_description, opt_autoplay) { 
  if(goog.ui.media.PicasaAlbumModel.MATCHER_.test(picasaUrl)) { 
    var data = goog.ui.media.PicasaAlbumModel.MATCHER_.exec(picasaUrl); 
    return new goog.ui.media.PicasaAlbumModel(data[1], data[2], data[3], opt_caption, opt_description, opt_autoplay); 
  } 
  throw Error('failed to parse user and album from picasa url: ' + picasaUrl); 
}; 
goog.ui.media.PicasaAlbumModel.buildUrl = function(userId, albumId) { 
  return 'http://picasaweb.google.com/' + userId + '/' + albumId; 
}; 
goog.ui.media.PicasaAlbumModel.prototype.getUserId = function() { 
  return this.userId_; 
}; 
goog.ui.media.PicasaAlbumModel.prototype.getAlbumId = function() { 
  return this.albumId_; 
}; 
goog.ui.media.PicasaAlbumModel.prototype.getAuthKey = function() { 
  return this.authKey_; 
}; 
