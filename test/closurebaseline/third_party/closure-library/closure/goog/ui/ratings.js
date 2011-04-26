
goog.provide('goog.ui.Ratings'); 
goog.provide('goog.ui.Ratings.EventType'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.EventType'); 
goog.require('goog.ui.Component'); 
goog.ui.Ratings = function(opt_ratings, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.ratings_ = opt_ratings ||['1', '2', '3', '4', '5']; 
  this.stars_ =[]; 
}; 
goog.inherits(goog.ui.Ratings, goog.ui.Component); 
goog.ui.Ratings.CSS_CLASS = goog.getCssName('goog-ratings'); 
goog.ui.Ratings.prototype.highlightedIndex_ = - 1; 
goog.ui.Ratings.prototype.selectedIndex_ = - 1; 
goog.ui.Ratings.prototype.attachedFormField_ = null; 
goog.ui.Ratings.EventType = { 
  CHANGE: 'change', 
  HIGHLIGHT_CHANGE: 'highlightchange', 
  HIGHLIGHT: 'highlight', 
  UNHIGHLIGHT: 'unhighlight' 
}; 
goog.ui.Ratings.prototype.decorateInternal = function(el) { 
  var select = el.getElementsByTagName('select')[0]; 
  if(! select) { 
    throw Error('Can not decorate ' + el + ', with Ratings. Must ' + 'contain select box'); 
  } 
  this.ratings_.length = 0; 
  for(var i = 0, n = select.options.length; i < n; i ++) { 
    var option = select.options[i]; 
    this.ratings_.push(option.text); 
  } 
  this.setSelectedIndex(select.selectedIndex); 
  select.style.display = 'none'; 
  this.attachedFormField_ = select; 
  this.createDom(); 
  el.insertBefore(this.getElement(), select); 
}; 
goog.ui.Ratings.prototype.enterDocument = function() { 
  var el = this.getElement(); 
  el.tabIndex = 0; 
  goog.dom.classes.add(el, this.getCssClass()); 
  goog.dom.a11y.setRole(el, 'slider'); 
  goog.dom.a11y.setState(el, 'valuemin', 0); 
  var max = this.ratings_.length - 1; 
  goog.dom.a11y.setState(el, 'valuemax', max); 
  var handler = this.getHandler(); 
  handler.listen(el, 'keydown', this.onKeyDown_); 
  for(var i = 0; i < this.ratings_.length; i ++) { 
    var star = this.getDomHelper().createDom('span', { 
      'title': this.ratings_[i], 
      'class': this.getClassName_(i, false), 
      'index': i 
    }); 
    this.stars_.push(star); 
    el.appendChild(star); 
  } 
  handler.listen(el, goog.events.EventType.CLICK, this.onClick_); 
  handler.listen(el, goog.events.EventType.MOUSEOUT, this.onMouseOut_); 
  handler.listen(el, goog.events.EventType.MOUSEOVER, this.onMouseOver_); 
  this.highlightIndex_(this.selectedIndex_); 
}; 
goog.ui.Ratings.prototype.exitDocument = function() { 
  goog.ui.Ratings.superClass_.exitDocument.call(this); 
  for(var i = 0; i < this.stars_.length; i ++) { 
    this.getDomHelper().removeNode(this.stars_[i]); 
  } 
  this.stars_.length = 0; 
}; 
goog.ui.Ratings.prototype.disposeInternal = function() { 
  goog.ui.Ratings.superClass_.disposeInternal.call(this); 
  this.ratings_.length = 0; 
  this.rendered_ = false; 
}; 
goog.ui.Ratings.prototype.getCssClass = function() { 
  return goog.ui.Ratings.CSS_CLASS; 
}; 
goog.ui.Ratings.prototype.setSelectedIndex = function(index) { 
  index = Math.max(- 1, Math.min(index, this.ratings_.length - 1)); 
  if(index != this.selectedIndex_) { 
    this.selectedIndex_ = index; 
    this.highlightIndex_(this.selectedIndex_); 
    if(this.attachedFormField_) { 
      if(this.attachedFormField_.tagName == 'SELECT') { 
        this.attachedFormField_.selectedIndex = index; 
      } else { 
        this.attachedFormField_.value =(this.getValue()); 
      } 
      goog.dom.a11y.setState(this.getElement(), 'valuenow', this.ratings_[index]); 
    } 
    this.dispatchEvent(goog.ui.Ratings.EventType.CHANGE); 
  } 
}; 
goog.ui.Ratings.prototype.getSelectedIndex = function() { 
  return this.selectedIndex_; 
}; 
goog.ui.Ratings.prototype.getValue = function() { 
  return this.selectedIndex_ == - 1 ? null: this.ratings_[this.selectedIndex_]; 
}; 
goog.ui.Ratings.prototype.getHighlightedIndex = function() { 
  return this.highlightedIndex_; 
}; 
goog.ui.Ratings.prototype.getHighlightedValue = function() { 
  return this.highlightedIndex_ == - 1 ? null: this.ratings_[this.highlightedIndex_]; 
}; 
goog.ui.Ratings.prototype.setRatings = function(ratings) { 
  this.ratings_ = ratings; 
}; 
goog.ui.Ratings.prototype.getRatings = function() { 
  return this.ratings_; 
}; 
goog.ui.Ratings.prototype.setAttachedFormField = function(field) { 
  this.attachedFormField_ = field; 
}; 
goog.ui.Ratings.prototype.getAttachedFormField = function() { 
  return this.attachedFormField_; 
}; 
goog.ui.Ratings.prototype.onMouseOver_ = function(e) { 
  if(goog.isDef(e.target.index)) { 
    var n = e.target.index; 
    if(this.highlightedIndex_ != n) { 
      this.highlightIndex_(n); 
      this.highlightedIndex_ = n; 
      this.dispatchEvent(goog.ui.Ratings.EventType.HIGHLIGHT_CHANGE); 
      this.dispatchEvent(goog.ui.Ratings.EventType.HIGHLIGHT); 
    } 
  } 
}; 
goog.ui.Ratings.prototype.onMouseOut_ = function(e) { 
  if(e.relatedTarget && ! goog.isDef(e.relatedTarget.index)) { 
    this.highlightIndex_(this.selectedIndex_); 
    this.highlightedIndex_ = - 1; 
    this.dispatchEvent(goog.ui.Ratings.EventType.HIGHLIGHT_CHANGE); 
    this.dispatchEvent(goog.ui.Ratings.EventType.UNHIGHLIGHT); 
  } 
}; 
goog.ui.Ratings.prototype.onClick_ = function(e) { 
  if(goog.isDef(e.target.index)) { 
    this.setSelectedIndex(e.target.index); 
  } 
}; 
goog.ui.Ratings.prototype.onKeyDown_ = function(e) { 
  switch(e.keyCode) { 
    case 27: 
      this.setSelectedIndex(- 1); 
      break; 

    case 36: 
      this.setSelectedIndex(0); 
      break; 

    case 35: 
      this.setSelectedIndex(this.ratings_.length); 
      break; 

    case 37: 
      this.setSelectedIndex(this.getSelectedIndex() - 1); 
      break; 

    case 39: 
      this.setSelectedIndex(this.getSelectedIndex() + 1); 
      break; 

    default: 
      var num = parseInt(String.fromCharCode(e.keyCode), 10); 
      if(! isNaN(num)) { 
        this.setSelectedIndex(num - 1); 
      } 

  } 
}; 
goog.ui.Ratings.prototype.highlightIndex_ = function(n) { 
  for(var i = 0, star; star = this.stars_[i]; i ++) { 
    goog.dom.classes.set(star, this.getClassName_(i, i <= n)); 
  } 
}; 
goog.ui.Ratings.prototype.getClassName_ = function(i, on) { 
  var className; 
  var baseClass = this.getCssClass(); 
  if(i === 0) { 
    className = goog.getCssName(baseClass, 'firststar'); 
  } else if(i == this.ratings_.length - 1) { 
    className = goog.getCssName(baseClass, 'laststar'); 
  } else { 
    className = goog.getCssName(baseClass, 'midstar'); 
  } 
  if(on) { 
    className = goog.getCssName(className, 'on'); 
  } else { 
    className = goog.getCssName(className, 'off'); 
  } 
  return goog.getCssName(baseClass, 'star') + ' ' + className; 
}; 
