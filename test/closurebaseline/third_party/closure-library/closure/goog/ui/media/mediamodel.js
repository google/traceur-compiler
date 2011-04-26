
goog.provide('goog.ui.media.MediaModel'); 
goog.provide('goog.ui.media.MediaModel.Category'); 
goog.provide('goog.ui.media.MediaModel.Credit'); 
goog.provide('goog.ui.media.MediaModel.Credit.Role'); 
goog.provide('goog.ui.media.MediaModel.Credit.Scheme'); 
goog.provide('goog.ui.media.MediaModel.Medium'); 
goog.provide('goog.ui.media.MediaModel.MimeType'); 
goog.provide('goog.ui.media.MediaModel.Player'); 
goog.provide('goog.ui.media.MediaModel.Thumbnail'); 
goog.require('goog.array'); 
goog.ui.media.MediaModel = function(opt_url, opt_caption, opt_description, opt_type, opt_medium, opt_duration, opt_width, opt_height) { 
  this.url_ = opt_url; 
  this.caption_ = opt_caption; 
  this.description_ = opt_description; 
  this.type_ = opt_type; 
  this.medium_ = opt_medium; 
  this.duration_ = opt_duration; 
  this.width_ = opt_width; 
  this.height_ = opt_height; 
  this.thumbnails_ =[]; 
  this.categories_ =[]; 
  this.credits_ =[]; 
}; 
goog.ui.media.MediaModel.MimeType = { 
  HTML: 'text/html', 
  PLAIN: 'text/plain', 
  FLASH: 'application/x-shockwave-flash', 
  JPEG: 'image/jpeg', 
  GIF: 'image/gif', 
  PNG: 'image/png' 
}; 
goog.ui.media.MediaModel.Medium = { 
  IMAGE: 'image', 
  AUDIO: 'audio', 
  VIDEO: 'video', 
  DOCUMENT: 'document', 
  EXECUTABLE: 'executable' 
}; 
goog.ui.media.MediaModel.prototype.player_; 
goog.ui.media.MediaModel.prototype.getUrl = function() { 
  return this.url_; 
}; 
goog.ui.media.MediaModel.prototype.setUrl = function(url) { 
  this.url_ = url; 
  return this; 
}; 
goog.ui.media.MediaModel.prototype.getCaption = function() { 
  return this.caption_; 
}; 
goog.ui.media.MediaModel.prototype.setCaption = function(caption) { 
  this.caption_ = caption; 
  return this; 
}; 
goog.ui.media.MediaModel.prototype.getType = function() { 
  return this.type_; 
}; 
goog.ui.media.MediaModel.prototype.setType = function(type) { 
  this.type_ = type; 
  return this; 
}; 
goog.ui.media.MediaModel.prototype.getMedium = function() { 
  return this.medium_; 
}; 
goog.ui.media.MediaModel.prototype.setMedium = function(medium) { 
  this.medium_ = medium; 
  return this; 
}; 
goog.ui.media.MediaModel.prototype.getDescription = function() { 
  return this.description_; 
}; 
goog.ui.media.MediaModel.prototype.setDescription = function(description) { 
  this.description_ = description; 
  return this; 
}; 
goog.ui.media.MediaModel.prototype.getThumbnails = function() { 
  return this.thumbnails_; 
}; 
goog.ui.media.MediaModel.prototype.setThumbnails = function(thumbnails) { 
  this.thumbnails_ = thumbnails; 
  return this; 
}; 
goog.ui.media.MediaModel.prototype.getDuration = function() { 
  return this.duration_; 
}; 
goog.ui.media.MediaModel.prototype.setDuration = function(duration) { 
  this.duration_ = duration; 
  return this; 
}; 
goog.ui.media.MediaModel.prototype.getWidth = function() { 
  return this.width_; 
}; 
goog.ui.media.MediaModel.prototype.setWidth = function(width) { 
  this.width_ = width; 
  return this; 
}; 
goog.ui.media.MediaModel.prototype.getHeight = function() { 
  return this.height_; 
}; 
goog.ui.media.MediaModel.prototype.setHeight = function(height) { 
  this.height_ = height; 
  return this; 
}; 
goog.ui.media.MediaModel.prototype.getPlayer = function() { 
  return this.player_; 
}; 
goog.ui.media.MediaModel.prototype.setPlayer = function(player) { 
  this.player_ = player; 
  return this; 
}; 
goog.ui.media.MediaModel.prototype.getCategories = function() { 
  return this.categories_; 
}; 
goog.ui.media.MediaModel.prototype.setCategories = function(categories) { 
  this.categories_ = categories; 
  return this; 
}; 
goog.ui.media.MediaModel.prototype.findCategoryWithScheme = function(scheme) { 
  if(! this.categories_) { 
    return null; 
  } 
  var category = goog.array.find(this.categories_, function(category) { 
    return category ?(scheme == category.getScheme()): false; 
  }); 
  return(category); 
}; 
goog.ui.media.MediaModel.prototype.getCredits = function() { 
  return this.credits_; 
}; 
goog.ui.media.MediaModel.prototype.setCredits = function(credits) { 
  this.credits_ = credits; 
  return this; 
}; 
goog.ui.media.MediaModel.prototype.findCreditWithRole = function(role) { 
  if(! this.credits_) { 
    return null; 
  } 
  var credit = goog.array.find(this.credits_, function(credit) { 
    return role == credit.getRole(); 
  }); 
  return(credit); 
}; 
goog.ui.media.MediaModel.Thumbnail = function(url, opt_size) { 
  this.url_ = url; 
  this.size_ = opt_size || null; 
}; 
goog.ui.media.MediaModel.Thumbnail.prototype.getUrl = function() { 
  return this.url_; 
}; 
goog.ui.media.MediaModel.Thumbnail.prototype.setUrl = function(url) { 
  this.url_ = url; 
  return this; 
}; 
goog.ui.media.MediaModel.Thumbnail.prototype.getSize = function() { 
  return this.size_; 
}; 
goog.ui.media.MediaModel.Thumbnail.prototype.setSize = function(size) { 
  this.size_ = size; 
  return this; 
}; 
goog.ui.media.MediaModel.Player = function(url, opt_vars, opt_size) { 
  this.url_ = url; 
  this.vars_ = opt_vars || null; 
  this.size_ = opt_size || null; 
}; 
goog.ui.media.MediaModel.Player.prototype.getUrl = function() { 
  return this.url_; 
}; 
goog.ui.media.MediaModel.Player.prototype.setUrl = function(url) { 
  this.url_ = url; 
  return this; 
}; 
goog.ui.media.MediaModel.Player.prototype.getVars = function() { 
  return this.vars_; 
}; 
goog.ui.media.MediaModel.Player.prototype.setVars = function(vars) { 
  this.vars_ = vars; 
  return this; 
}; 
goog.ui.media.MediaModel.Player.prototype.getSize = function() { 
  return this.size_; 
}; 
goog.ui.media.MediaModel.Player.prototype.setSize = function(size) { 
  this.size_ = size; 
  return this; 
}; 
goog.ui.media.MediaModel.Category = function(scheme, value, opt_label) { 
  this.scheme_ = scheme; 
  this.value_ = value; 
  this.label_ = opt_label || ''; 
}; 
goog.ui.media.MediaModel.Category.prototype.getScheme = function() { 
  return this.scheme_; 
}; 
goog.ui.media.MediaModel.Category.prototype.setScheme = function(scheme) { 
  this.scheme_ = scheme; 
  return this; 
}; 
goog.ui.media.MediaModel.Category.prototype.getValue = function() { 
  return this.value_; 
}; 
goog.ui.media.MediaModel.Category.prototype.setValue = function(value) { 
  this.value_ = value; 
  return this; 
}; 
goog.ui.media.MediaModel.Category.prototype.getLabel = function() { 
  return this.label_; 
}; 
goog.ui.media.MediaModel.Category.prototype.setLabel = function(label) { 
  this.label_ = label; 
  return this; 
}; 
goog.ui.media.MediaModel.Credit = function(value, opt_role, opt_scheme) { 
  this.value_ = value; 
  this.role_ = opt_role; 
  this.scheme_ = opt_scheme; 
}; 
goog.ui.media.MediaModel.Credit.Role = { 
  UPLOADER: 'uploader', 
  OWNER: 'owner' 
}; 
goog.ui.media.MediaModel.Credit.Scheme = { 
  EUROPEAN_BROADCASTING: 'urn:ebu', 
  YAHOO: 'urn:yvs', 
  YOUTUBE: 'urn:youtube' 
}; 
goog.ui.media.MediaModel.Credit.prototype.getValue = function() { 
  return this.value_; 
}; 
goog.ui.media.MediaModel.Credit.prototype.setValue = function(value) { 
  this.value_ = value; 
  return this; 
}; 
goog.ui.media.MediaModel.Credit.prototype.getRole = function() { 
  return this.role_; 
}; 
goog.ui.media.MediaModel.Credit.prototype.setRole = function(role) { 
  this.role_ = role; 
  return this; 
}; 
goog.ui.media.MediaModel.Credit.prototype.getScheme = function() { 
  return this.scheme_; 
}; 
goog.ui.media.MediaModel.Credit.prototype.setScheme = function(scheme) { 
  this.scheme_ = scheme; 
  return this; 
}; 
