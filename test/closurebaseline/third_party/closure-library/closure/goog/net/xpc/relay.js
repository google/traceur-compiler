
goog.provide('goog.net.xpc.relay'); 
(function() { 
  var raw = window.location.hash; 
  if(! raw) { 
    return; 
  } 
  if(raw.charAt(0) == '#') { 
    raw = raw.substring(1); 
  } 
  var pos = raw.indexOf('|'); 
  var head = raw.substring(0, pos).split(','); 
  var channelName = head[0]; 
  var iframeId = head.length == 2 ? head[1]: null; 
  var frame = raw.substring(pos + 1); 
  var win; 
  if(iframeId) { 
    win = window.parent.frames[iframeId]; 
  } else { 
    win = window.parent.parent; 
  } 
  try { 
    win['xpcRelay'](channelName, frame); 
  } catch(e) { } 
})(); 
