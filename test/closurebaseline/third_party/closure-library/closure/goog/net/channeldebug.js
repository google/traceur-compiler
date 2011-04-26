
goog.provide('goog.net.ChannelDebug'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.json'); 
goog.net.ChannelDebug = function() { 
  this.logger_ = goog.debug.Logger.getLogger('goog.net.BrowserChannel'); 
}; 
goog.net.ChannelDebug.prototype.getLogger = function() { 
  return this.logger_; 
}; 
goog.net.ChannelDebug.prototype.xmlHttpChannelRequest = function(verb, uri, id, attempt, postData) { 
  this.info('XMLHTTP REQ (' + id + ') [attempt ' + attempt + ']: ' + verb + '\n' + uri + '\n' + this.maybeRedactPostData_(postData)); 
}; 
goog.net.ChannelDebug.prototype.xmlHttpChannelResponseMetaData = function(verb, uri, id, attempt, readyState, statusCode) { 
  this.info('XMLHTTP RESP (' + id + ') [ attempt ' + attempt + ']: ' + verb + '\n' + uri + '\n' + readyState + ' ' + statusCode); 
}; 
goog.net.ChannelDebug.prototype.xmlHttpChannelResponseText = function(id, responseText, opt_desc) { 
  this.info('XMLHTTP TEXT (' + id + '): ' + this.redactResponse_(responseText) +(opt_desc ? ' ' + opt_desc: '')); 
}; 
goog.net.ChannelDebug.prototype.tridentChannelRequest = function(verb, uri, id, attempt) { 
  this.info('TRIDENT REQ (' + id + ') [ attempt ' + attempt + ']: ' + verb + '\n' + uri); 
}; 
goog.net.ChannelDebug.prototype.tridentChannelResponseText = function(id, responseText) { 
  this.info('TRIDENT TEXT (' + id + '): ' + this.redactResponse_(responseText)); 
}; 
goog.net.ChannelDebug.prototype.tridentChannelResponseDone = function(id, successful) { 
  this.info('TRIDENT TEXT (' + id + '): ' + successful ? 'success': 'failure'); 
}; 
goog.net.ChannelDebug.prototype.timeoutResponse = function(uri) { 
  this.info('TIMEOUT: ' + uri); 
}; 
goog.net.ChannelDebug.prototype.debug = function(text) { 
  this.info(text); 
}; 
goog.net.ChannelDebug.prototype.dumpException = function(e, opt_msg) { 
  this.severe((opt_msg || 'Exception') + e); 
}; 
goog.net.ChannelDebug.prototype.info = function(text) { 
  this.logger_.info(text); 
}; 
goog.net.ChannelDebug.prototype.warning = function(text) { 
  this.logger_.warning(text); 
}; 
goog.net.ChannelDebug.prototype.severe = function(text) { 
  this.logger_.severe(text); 
}; 
goog.net.ChannelDebug.prototype.redactResponse_ = function(responseText) { 
  if(! responseText || responseText == goog.net.BrowserChannel.MAGIC_RESPONSE_COOKIE) { 
    return responseText; 
  } 
  try { 
    var responseArray = goog.json.unsafeParse(responseText); 
    for(var i = 0; i < responseArray.length; i ++) { 
      if(goog.isArray(responseArray[i])) { 
        this.maybeRedactArray_(responseArray[i]); 
      } 
    } 
    return goog.json.serialize(responseArray); 
  } catch(e) { 
    this.debug('Exception parsing expected JS array - ' + 'probably was not JS'); 
    return responseText; 
  } 
}; 
goog.net.ChannelDebug.prototype.maybeRedactArray_ = function(array) { 
  if(array.length < 2) { 
    return; 
  } 
  var dataPart = array[1]; 
  if(! goog.isArray(dataPart)) { 
    return; 
  } 
  if(dataPart.length < 1) { 
    return; 
  } 
  var type = dataPart[0]; 
  if(type != 'c' && type != 'noop' && type != 'stop') { 
    for(var i = 1; i < dataPart.length; i ++) { 
      dataPart[i]= ''; 
    } 
  } 
}; 
goog.net.ChannelDebug.prototype.maybeRedactPostData_ = function(data) { 
  if(! data) { 
    return null; 
  } 
  var out = ''; 
  var params = data.split('&'); 
  for(var i = 0; i < params.length; i ++) { 
    var param = params[i]; 
    var keyValue = param.split('='); 
    if(keyValue.length > 1) { 
      var key = keyValue[0]; 
      var value = keyValue[1]; 
      var keyParts = key.split('_'); 
      if(keyParts.length >= 2 && keyParts[1]== 'type') { 
        out += key + '=' + value + '&'; 
      } else { 
        out += key + '=' + 'redacted' + '&'; 
      } 
    } 
  } 
  return out; 
}; 
