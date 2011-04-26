
goog.provide('goog.silverlight.supportedUserAgent'); 
goog.silverlight.supportedUserAgent = function(version, userAgent) { 
  try { 
    var ua = null; 
    if(userAgent) { 
      ua = userAgent; 
    } else { 
      ua = window.navigator.userAgent; 
    } 
    var slua = { 
      OS: 'Unsupported', 
      Browser: 'Unsupported' 
    }; 
    if(ua.indexOf('Windows NT') >= 0 || ua.indexOf('Mozilla/4.0 (compatible; MSIE 6.0)') >= 0) { 
      slua.OS = 'Windows'; 
    } else if(ua.indexOf('PPC Mac OS X') >= 0) { 
      slua.OS = 'MacPPC'; 
    } else if(ua.indexOf('Intel Mac OS X') >= 0) { 
      slua.OS = 'MacIntel'; 
    } else if(ua.indexOf('Linux') >= 0) { 
      slua.OS = 'Linux'; 
    } 
    if(slua.OS != 'Unsupported') { 
      if(ua.indexOf('MSIE') >= 0) { 
        if(navigator.userAgent.indexOf('Win64') == - 1) { 
          if(parseInt(ua.split('MSIE')[1], 10) >= 6) { 
            slua.Browser = 'MSIE'; 
          } 
        } 
      } else if(ua.indexOf('Firefox') >= 0) { 
        var versionArr = ua.split('Firefox/')[1].split('.'); 
        var major = parseInt(versionArr[0], 10); 
        if(major >= 2) { 
          slua.Browser = 'Firefox'; 
        } else { 
          var minor = parseInt(versionArr[1], 10); 
          if((major == 1) &&(minor >= 5)) { 
            slua.Browser = 'Firefox'; 
          } 
        } 
      } else if(ua.indexOf('Chrome') >= 0) { 
        slua.Browser = 'Chrome'; 
      } else if(ua.indexOf('Safari') >= 0) { 
        slua.Browser = 'Safari'; 
      } 
    } 
    var sl_version = parseInt(version, 10); 
    var supUA =(!(slua.OS == 'Unsupported' || slua.Browser == 'Unsupported' ||(slua.OS == 'Windows' && slua.Browser == 'Safari') ||(slua.OS.indexOf('Mac') >= 0 && slua.Browser == 'MSIE') ||(slua.OS.indexOf('Mac') >= 0 && slua.Browser == 'Chrome'))); 
    if((slua.OS.indexOf('Windows') >= 0 && slua.Browser == 'Chrome' && sl_version < 4)) { 
      return false; 
    } 
    if((slua.OS == 'MacPPC') &&(sl_version > 1)) { 
      return((supUA &&(slua.OS != 'MacPPC'))); 
    } 
    if((slua.OS == 'Linux') &&(sl_version > 2)) { 
      return((supUA &&(slua.OS != 'Linux'))); 
    } 
    if(version == '1.0') { 
      return(supUA &&(ua.indexOf('Windows NT 5.0') < 0)); 
    } else { 
      return(supUA); 
    } 
  } catch(e) { 
    return false; 
  } 
}; 
