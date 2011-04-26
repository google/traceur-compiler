
goog.provide('goog.locale.timeZoneDetection'); 
goog.require('goog.locale'); 
goog.require('goog.locale.TimeZoneFingerprint'); 
goog.locale.timeZoneDetection.TZ_POKE_POINTS_ =[1109635200, 1128902400, 1130657000, 1143333000, 1143806400, 1145000000, 1146380000, 1152489600, 1159800000, 1159500000, 1162095000, 1162075000, 1162105500]; 
goog.locale.timeZoneDetection.getFingerprint = function(date) { 
  var hash = 0; 
  var stdOffset; 
  var isComplex = false; 
  for(var i = 0; i < goog.locale.timeZoneDetection.TZ_POKE_POINTS_.length; i ++) { 
    date.setTime(goog.locale.timeZoneDetection.TZ_POKE_POINTS_[i]* 1000); 
    var offset = date.getTimezoneOffset() / 30 + 48; 
    if(i == 0) { 
      stdOffset = offset; 
    } else if(stdOffset != offset) { 
      isComplex = true; 
    } 
    hash =(hash << 2) ^ offset; 
  } 
  return isComplex ? hash:(stdOffset); 
}; 
goog.locale.timeZoneDetection.detectTimeZone = function(opt_country, opt_date) { 
  var date = opt_date || new Date(); 
  var fingerprint = goog.locale.timeZoneDetection.getFingerprint(date); 
  var timeZoneList = goog.locale.TimeZoneFingerprint[fingerprint]; 
  if(timeZoneList) { 
    if(opt_country) { 
      for(var i = 0; i < timeZoneList.length; ++ i) { 
        if(timeZoneList[i].indexOf(opt_country) == 0) { 
          return timeZoneList[i].substring(3); 
        } 
      } 
    } 
    return timeZoneList[0].substring(3); 
  } 
  return ''; 
}; 
goog.locale.timeZoneDetection.getTimeZoneList = function(opt_country, opt_date) { 
  var date = opt_date || new Date(); 
  var fingerprint = goog.locale.timeZoneDetection.getFingerprint(date); 
  var timeZoneList = goog.locale.TimeZoneFingerprint[fingerprint]; 
  if(! timeZoneList) { 
    return[]; 
  } 
  var chosenList =[]; 
  for(var i = 0; i < timeZoneList.length; i ++) { 
    if(! opt_country || timeZoneList[i].indexOf(opt_country) == 0) { 
      chosenList.push(timeZoneList[i].substring(3)); 
    } 
  } 
  return chosenList; 
}; 
