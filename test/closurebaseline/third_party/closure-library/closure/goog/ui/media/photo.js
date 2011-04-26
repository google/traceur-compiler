
goog.provide('goog.ui.media.Photo'); 
goog.require('goog.ui.media.Media'); 
goog.require('goog.ui.media.MediaRenderer'); 
goog.ui.media.Photo = function() { 
  goog.ui.media.MediaRenderer.call(this); 
}; 
goog.inherits(goog.ui.media.Photo, goog.ui.media.MediaRenderer); 
goog.addSingletonGetter(goog.ui.media.Photo); 
goog.ui.media.Photo.CSS_CLASS = goog.getCssName('goog-ui-media-photo'); 
goog.ui.media.Photo.newControl = function(dataModel) { 
  var control = new goog.ui.media.Media(dataModel, goog.ui.media.Photo.getInstance()); 
  return control; 
}; 
goog.ui.media.Photo.prototype.createDom = function(control) { 
  var div = goog.ui.media.Photo.superClass_.createDom.call(this, control); 
  var img = control.getDomHelper().createDom('img', { 
    src: control.getDataModel().getPlayer().getUrl(), 
    className: goog.getCssName(this.getCssClass(), 'image') 
  }); 
  div.appendChild(img); 
  return div; 
}; 
goog.ui.media.Photo.prototype.getCssClass = function() { 
  return goog.ui.media.Photo.CSS_CLASS; 
}; 
