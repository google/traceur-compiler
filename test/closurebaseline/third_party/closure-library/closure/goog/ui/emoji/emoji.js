
goog.provide('goog.ui.emoji.Emoji'); 
goog.ui.emoji.Emoji = function(url, id) { 
  this.url_ = url; 
  this.id_ = id; 
}; 
goog.ui.emoji.Emoji.ATTRIBUTE = 'goomoji'; 
goog.ui.emoji.Emoji.prototype.getUrl = function() { 
  return this.url_; 
}; 
goog.ui.emoji.Emoji.prototype.getId = function() { 
  return this.id_; 
}; 
