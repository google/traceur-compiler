
goog.provide('goog.format.EmailAddress'); 
goog.require('goog.string'); 
goog.format.EmailAddress = function(opt_address, opt_name) { 
  this.name_ = opt_name || ''; 
  this.address_ = opt_address || ''; 
}; 
goog.format.EmailAddress.OPENERS_ = '"<(['; 
goog.format.EmailAddress.CLOSERS_ = '">)]'; 
goog.format.EmailAddress.SPECIAL_CHARS_RE_ = /[()<>@,;:\\\".\[\]]/; 
goog.format.EmailAddress.ALL_DOUBLE_QUOTES_ = /\"/g; 
goog.format.EmailAddress.ESCAPED_DOUBLE_QUOTES_ = /\\\"/g; 
goog.format.EmailAddress.ALL_BACKSLASHES_ = /\\/g; 
goog.format.EmailAddress.ESCAPED_BACKSLASHES_ = /\\\\/g; 
goog.format.EmailAddress.prototype.getName = function() { 
  return this.name_; 
}; 
goog.format.EmailAddress.prototype.getAddress = function() { 
  return this.address_; 
}; 
goog.format.EmailAddress.prototype.setName = function(name) { 
  this.name_ = name; 
}; 
goog.format.EmailAddress.prototype.setAddress = function(address) { 
  this.address_ = address; 
}; 
goog.format.EmailAddress.prototype.toString = function() { 
  var name = this.getName(); 
  name = name.replace(goog.format.EmailAddress.ALL_DOUBLE_QUOTES_, ''); 
  var quoteNeeded = goog.format.EmailAddress.SPECIAL_CHARS_RE_.test(name); 
  if(quoteNeeded) { 
    name = '"' + name.replace(goog.format.EmailAddress.ALL_BACKSLASHES_, '\\\\') + '"'; 
  } 
  if(name == '') { 
    return this.address_; 
  } 
  if(this.address_ == '') { 
    return name; 
  } 
  return name + ' <' + this.address_ + '>'; 
}; 
goog.format.EmailAddress.prototype.isValid = function() { 
  return goog.format.EmailAddress.isValidAddrSpec(this.address_); 
}; 
goog.format.EmailAddress.isValidAddress = function(str) { 
  return goog.format.EmailAddress.parse(str).isValid(); 
}; 
goog.format.EmailAddress.isValidAddrSpec = function(str) { 
  var filter = /^[+a-zA-Z0-9_.-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,6}$/; 
  return filter.test(str); 
}; 
goog.format.EmailAddress.parse = function(addr) { 
  var name = ''; 
  var address = ''; 
  for(var i = 0; i < addr.length;) { 
    var token = goog.format.EmailAddress.getToken_(addr, i); 
    if(token.charAt(0) == '<' && token.indexOf('>') != - 1) { 
      var end = token.indexOf('>'); 
      address = token.substring(1, end); 
    } else if(address == '') { 
      name += token; 
    } 
    i += token.length; 
  } 
  if(address == '' && name.indexOf('@') != - 1) { 
    address = name; 
    name = ''; 
  } 
  name = goog.string.collapseWhitespace(name); 
  name = goog.string.stripQuotes(name, '\''); 
  name = goog.string.stripQuotes(name, '"'); 
  name = name.replace(goog.format.EmailAddress.ESCAPED_DOUBLE_QUOTES_, '"'); 
  name = name.replace(goog.format.EmailAddress.ESCAPED_BACKSLASHES_, '\\'); 
  address = goog.string.collapseWhitespace(address); 
  return new goog.format.EmailAddress(address, name); 
}; 
goog.format.EmailAddress.parseList = function(str) { 
  var result =[]; 
  var email = ''; 
  var token; 
  for(var i = 0; i < str.length;) { 
    token = goog.format.EmailAddress.getToken_(str, i); 
    if(token == ',' || token == ';') { 
      if(! goog.string.isEmpty(email)) { 
        result.push(goog.format.EmailAddress.parse(email)); 
      } 
      email = ''; 
      i ++; 
      continue; 
    } 
    email += token; 
    i += token.length; 
  } 
  if(! goog.string.isEmpty(email)) { 
    result.push(goog.format.EmailAddress.parse(email)); 
  } 
  return result; 
}; 
goog.format.EmailAddress.getToken_ = function(str, pos) { 
  var ch = str.charAt(pos); 
  var p = goog.format.EmailAddress.OPENERS_.indexOf(ch); 
  if(p == - 1) { 
    return ch; 
  } 
  if(goog.format.EmailAddress.isEscapedDlQuote_(str, pos)) { 
    return ch; 
  } 
  var closerChar = goog.format.EmailAddress.CLOSERS_.charAt(p); 
  var endPos = str.indexOf(closerChar, pos + 1); 
  while(endPos >= 0 && goog.format.EmailAddress.isEscapedDlQuote_(str, endPos)) { 
    endPos = str.indexOf(closerChar, endPos + 1); 
  } 
  var token =(endPos >= 0) ? str.substring(pos, endPos + 1): ch; 
  return token; 
}; 
goog.format.EmailAddress.isEscapedDlQuote_ = function(str, pos) { 
  if(str.charAt(pos) != '"') { 
    return false; 
  } 
  var slashCount = 0; 
  for(var idx = pos - 1; idx >= 0 && str.charAt(idx) == '\\'; idx --) { 
    slashCount ++; 
  } 
  return((slashCount % 2) != 0); 
}; 
