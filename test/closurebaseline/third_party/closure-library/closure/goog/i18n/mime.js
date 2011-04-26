
goog.provide('goog.i18n.mime'); 
goog.provide('goog.i18n.mime.encode'); 
goog.i18n.mime.NONASCII_ = /[^!-<>@-^`-~]/g; 
goog.i18n.mime.NONASCII_NOQUOTE_ = /[^!#-<>@-^`-~]/g; 
goog.i18n.mime.encode = function(str, opt_noquote) { 
  var nonascii = opt_noquote ? goog.i18n.mime.NONASCII_NOQUOTE_: goog.i18n.mime.NONASCII_; 
  if(str.search(nonascii) >= 0) { 
    str = '=?UTF-8?Q?' + str.replace(nonascii, function(c) { 
      var i = c.charCodeAt(0); 
      if(i == 32) { 
        return '_'; 
      } 
      var a =['']; 
      if(i < 128) { 
        a.push(i); 
      } else if(i <= 0x7ff) { 
        a.push(0xc0 +((i >> 6) & 0x3f), 0x80 +(i & 0x3f)); 
      } else if(i <= 0xffff) { 
        a.push(0xe0 +((i >> 12) & 0x3f), 0x80 +((i >> 6) & 0x3f), 0x80 +(i & 0x3f)); 
      } else { 
        a.push(0xf0 +((i >> 18) & 0x3f), 0x80 +((i >> 12) & 0x3f), 0x80 +((i >> 6) & 0x3f), 0x80 +(i & 0x3f)); 
      } 
      for(i = a.length - 1; i > 0; -- i) { 
        a[i]= a[i].toString(16); 
      } 
      return a.join('='); 
    }) + '?='; 
  } 
  return str; 
}; 
