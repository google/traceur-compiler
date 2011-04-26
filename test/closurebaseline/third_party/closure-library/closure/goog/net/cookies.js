
goog.provide('goog.net.Cookies'); 
goog.provide('goog.net.cookies'); 
goog.require('goog.userAgent'); 
goog.net.Cookies = function(context) { 
  this.document_ = context; 
}; 
goog.net.Cookies.MAX_COOKIE_LENGTH = 3950; 
goog.net.Cookies.SPLIT_RE_ = /\s*;\s*/; 
goog.net.Cookies.TEST_COOKIE_NAME_ = 'COOKIES_TEST_'; 
goog.net.Cookies.prototype.isEnabled = function() { 
  var isEnabled = this.isNavigatorCookieEnabled_(); 
  if(isEnabled && goog.userAgent.WEBKIT) { 
    var cookieName = goog.net.Cookies.TEST_COOKIE_NAME_ + goog.now(); 
    goog.net.cookies.set(cookieName, '1'); 
    if(! this.get(cookieName)) { 
      return false; 
    } 
    this.remove(cookieName); 
  } 
  return isEnabled; 
}; 
goog.net.Cookies.prototype.isValidName = function(name) { 
  return !(/[;=\s]/.test(name)); 
}; 
goog.net.Cookies.prototype.isValidValue = function(value) { 
  return !(/[;\r\n]/.test(value)); 
}; 
goog.net.Cookies.prototype.set = function(name, value, opt_maxAge, opt_path, opt_domain, opt_secure) { 
  if(! this.isValidName(name)) { 
    throw Error('Invalid cookie name "' + name + '"'); 
  } 
  if(! this.isValidValue(value)) { 
    throw Error('Invalid cookie value "' + value + '"'); 
  } 
  if(! goog.isDef(opt_maxAge)) { 
    opt_maxAge = - 1; 
  } 
  var domainStr = opt_domain ? ';domain=' + opt_domain: ''; 
  var pathStr = opt_path ? ';path=' + opt_path: ''; 
  var secureStr = opt_secure ? ';secure': ''; 
  var expiresStr; 
  if(opt_maxAge < 0) { 
    expiresStr = ''; 
  } else if(opt_maxAge == 0) { 
    var pastDate = new Date(1970, 1, 1); 
    expiresStr = ';expires=' + pastDate.toUTCString(); 
  } else { 
    var futureDate = new Date(goog.now() + opt_maxAge * 1000); 
    expiresStr = ';expires=' + futureDate.toUTCString(); 
  } 
  this.setCookie_(name + '=' + value + domainStr + pathStr + expiresStr + secureStr); 
}; 
goog.net.Cookies.prototype.get = function(name, opt_default) { 
  var nameEq = name + '='; 
  var parts = this.getParts_(); 
  for(var i = 0, part; part = parts[i]; i ++) { 
    if(part.indexOf(nameEq) == 0) { 
      return part.substr(nameEq.length); 
    } 
  } 
  return opt_default; 
}; 
goog.net.Cookies.prototype.remove = function(name, opt_path, opt_domain) { 
  var rv = this.containsKey(name); 
  this.set(name, '', 0, opt_path, opt_domain); 
  return rv; 
}; 
goog.net.Cookies.prototype.getKeys = function() { 
  return this.getKeyValues_().keys; 
}; 
goog.net.Cookies.prototype.getValues = function() { 
  return this.getKeyValues_().values; 
}; 
goog.net.Cookies.prototype.isEmpty = function() { 
  return ! this.getCookie_(); 
}; 
goog.net.Cookies.prototype.getCount = function() { 
  var cookie = this.getCookie_(); 
  if(! cookie) { 
    return 0; 
  } 
  return this.getParts_().length; 
}; 
goog.net.Cookies.prototype.containsKey = function(key) { 
  return goog.isDef(this.get(key)); 
}; 
goog.net.Cookies.prototype.containsValue = function(value) { 
  var values = this.getKeyValues_().values; 
  for(var i = 0; i < values.length; i ++) { 
    if(values[i]== value) { 
      return true; 
    } 
  } 
  return false; 
}; 
goog.net.Cookies.prototype.clear = function() { 
  var keys = this.getKeyValues_().keys; 
  for(var i = keys.length - 1; i >= 0; i --) { 
    this.remove(keys[i]); 
  } 
}; 
goog.net.Cookies.prototype.setCookie_ = function(s) { 
  this.document_.cookie = s; 
}; 
goog.net.Cookies.prototype.getCookie_ = function() { 
  return this.document_.cookie; 
}; 
goog.net.Cookies.prototype.getParts_ = function() { 
  return(this.getCookie_() || '').split(goog.net.Cookies.SPLIT_RE_); 
}; 
goog.net.Cookies.prototype.isNavigatorCookieEnabled_ = function() { 
  return navigator.cookieEnabled; 
}; 
goog.net.Cookies.prototype.getKeyValues_ = function() { 
  var parts = this.getParts_(); 
  var keys =[], values =[], index, part; 
  for(var i = 0; part = parts[i]; i ++) { 
    index = part.indexOf('='); 
    if(index == - 1) { 
      keys.push(''); 
      values.push(part); 
    } else { 
      keys.push(part.substring(0, index)); 
      values.push(part.substring(index + 1)); 
    } 
  } 
  return { 
    keys: keys, 
    values: values 
  }; 
}; 
goog.net.cookies = new goog.net.Cookies(document); 
goog.net.cookies.MAX_COOKIE_LENGTH = goog.net.Cookies.MAX_COOKIE_LENGTH; 
