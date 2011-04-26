
goog.provide('goog.ui.FormPost'); 
goog.require('goog.array'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.string'); 
goog.require('goog.string.StringBuffer'); 
goog.require('goog.ui.Component'); 
goog.ui.FormPost = function(opt_dom) { 
  goog.ui.Component.call(this, opt_dom); 
}; 
goog.inherits(goog.ui.FormPost, goog.ui.Component); 
goog.ui.FormPost.prototype.createDom = function() { 
  this.setElementInternal(this.getDomHelper().createDom(goog.dom.TagName.FORM, { 
    'method': 'POST', 
    'style': 'display:none' 
  })); 
}; 
goog.ui.FormPost.prototype.post = function(parameters, opt_url, opt_target) { 
  var form = this.getElement(); 
  if(! form) { 
    this.render(); 
    form = this.getElement(); 
  } 
  form.action = opt_url || ''; 
  form.target = opt_target || ''; 
  this.setParameters_(form, parameters); 
  form.submit(); 
}; 
goog.ui.FormPost.prototype.setParameters_ = function(form, parameters) { 
  var name, value, sb = new goog.string.StringBuffer(); 
  for(name in parameters) { 
    value = parameters[name]; 
    if(goog.isArrayLike(value)) { 
      goog.array.forEach(value, goog.bind(this.appendInput_, this, sb, name)); 
    } else { 
      this.appendInput_(sb, name, value); 
    } 
  } 
  form.innerHTML = sb.toString(); 
}; 
goog.ui.FormPost.prototype.appendInput_ = function(out, name, value) { 
  out.append('<input type="hidden" name="', goog.string.htmlEscape(name), '" value="', goog.string.htmlEscape(value), '">'); 
}; 
