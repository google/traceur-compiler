
goog.provide('goog.uri.utils'); 
goog.provide('goog.uri.utils.ComponentIndex'); 
goog.require('goog.asserts'); 
goog.require('goog.string'); 
goog.uri.utils.CharCode_ = { 
  AMPERSAND: 38, 
  EQUAL: 61, 
  HASH: 35, 
  QUESTION: 63 
}; 
goog.uri.utils.buildFromEncodedParts = function(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) { 
  var out =[]; 
  if(opt_scheme) { 
    out.push(opt_scheme, ':'); 
  } 
  if(opt_domain) { 
    out.push('//'); 
    if(opt_userInfo) { 
      out.push(opt_userInfo, '@'); 
    } 
    out.push(opt_domain); 
    if(opt_port) { 
      out.push(':', opt_port); 
    } 
  } 
  if(opt_path) { 
    out.push(opt_path); 
  } 
  if(opt_queryData) { 
    out.push('?', opt_queryData); 
  } 
  if(opt_fragment) { 
    out.push('#', opt_fragment); 
  } 
  return out.join(''); 
}; 
goog.uri.utils.splitRe_ = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$'); 
goog.uri.utils.ComponentIndex = { 
  SCHEME: 1, 
  USER_INFO: 2, 
  DOMAIN: 3, 
  PORT: 4, 
  PATH: 5, 
  QUERY_DATA: 6, 
  FRAGMENT: 7 
}; 
goog.uri.utils.split = function(uri) { 
  return(uri.match(goog.uri.utils.splitRe_)); 
}; 
goog.uri.utils.decodeIfPossible_ = function(uri) { 
  return uri && decodeURIComponent(uri); 
}; 
goog.uri.utils.getComponentByIndex_ = function(componentIndex, uri) { 
  return goog.uri.utils.split(uri)[componentIndex]|| null; 
}; 
goog.uri.utils.getScheme = function(uri) { 
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.SCHEME, uri); 
}; 
goog.uri.utils.getUserInfoEncoded = function(uri) { 
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.USER_INFO, uri); 
}; 
goog.uri.utils.getUserInfo = function(uri) { 
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getUserInfoEncoded(uri)); 
}; 
goog.uri.utils.getDomainEncoded = function(uri) { 
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.DOMAIN, uri); 
}; 
goog.uri.utils.getDomain = function(uri) { 
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getDomainEncoded(uri)); 
}; 
goog.uri.utils.getPort = function(uri) { 
  return Number(goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.PORT, uri)) || null; 
}; 
goog.uri.utils.getPathEncoded = function(uri) { 
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.PATH, uri); 
}; 
goog.uri.utils.getPath = function(uri) { 
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getPathEncoded(uri)); 
}; 
goog.uri.utils.getQueryData = function(uri) { 
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.QUERY_DATA, uri); 
}; 
goog.uri.utils.getFragmentEncoded = function(uri) { 
  var hashIndex = uri.indexOf('#'); 
  return hashIndex < 0 ? null: uri.substr(hashIndex + 1); 
}; 
goog.uri.utils.setFragmentEncoded = function(uri, fragment) { 
  return goog.uri.utils.removeFragment(uri) +(fragment ? '#' + fragment: ''); 
}; 
goog.uri.utils.getFragment = function(uri) { 
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getFragmentEncoded(uri)); 
}; 
goog.uri.utils.getHost = function(uri) { 
  var pieces = goog.uri.utils.split(uri); 
  return goog.uri.utils.buildFromEncodedParts(pieces[goog.uri.utils.ComponentIndex.SCHEME], pieces[goog.uri.utils.ComponentIndex.USER_INFO], pieces[goog.uri.utils.ComponentIndex.DOMAIN], pieces[goog.uri.utils.ComponentIndex.PORT]); 
}; 
goog.uri.utils.getPathAndAfter = function(uri) { 
  var pieces = goog.uri.utils.split(uri); 
  return goog.uri.utils.buildFromEncodedParts(null, null, null, null, pieces[goog.uri.utils.ComponentIndex.PATH], pieces[goog.uri.utils.ComponentIndex.QUERY_DATA], pieces[goog.uri.utils.ComponentIndex.FRAGMENT]); 
}; 
goog.uri.utils.removeFragment = function(uri) { 
  var hashIndex = uri.indexOf('#'); 
  return hashIndex < 0 ? uri: uri.substr(0, hashIndex); 
}; 
goog.uri.utils.haveSameDomain = function(uri1, uri2) { 
  var pieces1 = goog.uri.utils.split(uri1); 
  var pieces2 = goog.uri.utils.split(uri2); 
  return pieces1[goog.uri.utils.ComponentIndex.DOMAIN]== pieces2[goog.uri.utils.ComponentIndex.DOMAIN]&& pieces1[goog.uri.utils.ComponentIndex.SCHEME]== pieces2[goog.uri.utils.ComponentIndex.SCHEME]&& pieces1[goog.uri.utils.ComponentIndex.PORT]== pieces2[goog.uri.utils.ComponentIndex.PORT]; 
}; 
goog.uri.utils.assertNoFragmentsOrQueries_ = function(uri) { 
  if(goog.DEBUG &&(uri.indexOf('#') >= 0 || uri.indexOf('?') >= 0)) { 
    throw Error('goog.uri.utils: Fragment or query identifiers are not ' + 'supported: [' + uri + ']'); 
  } 
}; 
goog.uri.utils.QueryValue; 
goog.uri.utils.QueryArray; 
goog.uri.utils.appendQueryData_ = function(buffer) { 
  if(buffer[1]) { 
    var baseUri =(buffer[0]); 
    var hashIndex = baseUri.indexOf('#'); 
    if(hashIndex >= 0) { 
      buffer.push(baseUri.substr(hashIndex)); 
      buffer[0]= baseUri = baseUri.substr(0, hashIndex); 
    } 
    var questionIndex = baseUri.indexOf('?'); 
    if(questionIndex < 0) { 
      buffer[1]= '?'; 
    } else if(questionIndex == baseUri.length - 1) { 
      buffer[1]= undefined; 
    } 
  } 
  return buffer.join(''); 
}; 
goog.uri.utils.appendKeyValuePairs_ = function(key, value, pairs) { 
  if(goog.isArray(value)) { 
    value =(value); 
    for(var j = 0; j < value.length; j ++) { 
      pairs.push('&', key); 
      if(value[j]!== '') { 
        pairs.push('=', goog.string.urlEncode(value[j])); 
      } 
    } 
  } else if(value != null) { 
    pairs.push('&', key); 
    if(value !== '') { 
      pairs.push('=', goog.string.urlEncode(value)); 
    } 
  } 
}; 
goog.uri.utils.buildQueryDataBuffer_ = function(buffer, keysAndValues, opt_startIndex) { 
  goog.asserts.assert(Math.max(keysAndValues.length -(opt_startIndex || 0), 0) % 2 == 0, 'goog.uri.utils: Key/value lists must be even in length.'); 
  for(var i = opt_startIndex || 0; i < keysAndValues.length; i += 2) { 
    goog.uri.utils.appendKeyValuePairs_(keysAndValues[i], keysAndValues[i + 1], buffer); 
  } 
  return buffer; 
}; 
goog.uri.utils.buildQueryData = function(keysAndValues, opt_startIndex) { 
  var buffer = goog.uri.utils.buildQueryDataBuffer_([], keysAndValues, opt_startIndex); 
  buffer[0]= ''; 
  return buffer.join(''); 
}; 
goog.uri.utils.buildQueryDataBufferFromMap_ = function(buffer, map) { 
  for(var key in map) { 
    goog.uri.utils.appendKeyValuePairs_(key, map[key], buffer); 
  } 
  return buffer; 
}; 
goog.uri.utils.buildQueryDataFromMap = function(map) { 
  var buffer = goog.uri.utils.buildQueryDataBufferFromMap_([], map); 
  buffer[0]= ''; 
  return buffer.join(''); 
}; 
goog.uri.utils.appendParams = function(uri, var_args) { 
  return goog.uri.utils.appendQueryData_(arguments.length == 2 ? goog.uri.utils.buildQueryDataBuffer_([uri], arguments[1], 0): goog.uri.utils.buildQueryDataBuffer_([uri], arguments, 1)); 
}; 
goog.uri.utils.appendParamsFromMap = function(uri, map) { 
  return goog.uri.utils.appendQueryData_(goog.uri.utils.buildQueryDataBufferFromMap_([uri], map)); 
}; 
goog.uri.utils.appendParam = function(uri, key, value) { 
  return goog.uri.utils.appendQueryData_([uri, '&', key, '=', goog.string.urlEncode(value)]); 
}; 
goog.uri.utils.findParam_ = function(uri, startIndex, keyEncoded, hashOrEndIndex) { 
  var index = startIndex; 
  var keyLength = keyEncoded.length; 
  while((index = uri.indexOf(keyEncoded, index)) >= 0 && index < hashOrEndIndex) { 
    var precedingChar = uri.charCodeAt(index - 1); 
    if(precedingChar == goog.uri.utils.CharCode_.AMPERSAND || precedingChar == goog.uri.utils.CharCode_.QUESTION) { 
      var followingChar = uri.charCodeAt(index + keyLength); 
      if(! followingChar || followingChar == goog.uri.utils.CharCode_.EQUAL || followingChar == goog.uri.utils.CharCode_.AMPERSAND || followingChar == goog.uri.utils.CharCode_.HASH) { 
        return index; 
      } 
    } 
    index += keyLength + 1; 
  } 
  return - 1; 
}; 
goog.uri.utils.hashOrEndRe_ = /#|$/; 
goog.uri.utils.hasParam = function(uri, keyEncoded) { 
  return goog.uri.utils.findParam_(uri, 0, keyEncoded, uri.search(goog.uri.utils.hashOrEndRe_)) >= 0; 
}; 
goog.uri.utils.getParamValue = function(uri, keyEncoded) { 
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_); 
  var foundIndex = goog.uri.utils.findParam_(uri, 0, keyEncoded, hashOrEndIndex); 
  if(foundIndex < 0) { 
    return null; 
  } else { 
    var endPosition = uri.indexOf('&', foundIndex); 
    if(endPosition < 0 || endPosition > hashOrEndIndex) { 
      endPosition = hashOrEndIndex; 
    } 
    foundIndex += keyEncoded.length + 1; 
    return goog.string.urlDecode(uri.substr(foundIndex, endPosition - foundIndex)); 
  } 
}; 
goog.uri.utils.getParamValues = function(uri, keyEncoded) { 
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_); 
  var position = 0; 
  var foundIndex; 
  var result =[]; 
  while((foundIndex = goog.uri.utils.findParam_(uri, position, keyEncoded, hashOrEndIndex)) >= 0) { 
    position = uri.indexOf('&', foundIndex); 
    if(position < 0 || position > hashOrEndIndex) { 
      position = hashOrEndIndex; 
    } 
    foundIndex += keyEncoded.length + 1; 
    result.push(goog.string.urlDecode(uri.substr(foundIndex, position - foundIndex))); 
  } 
  return result; 
}; 
goog.uri.utils.trailingQueryPunctuationRe_ = /[?&]($|#)/; 
goog.uri.utils.removeParam = function(uri, keyEncoded) { 
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_); 
  var position = 0; 
  var foundIndex; 
  var buffer =[]; 
  while((foundIndex = goog.uri.utils.findParam_(uri, position, keyEncoded, hashOrEndIndex)) >= 0) { 
    buffer.push(uri.substring(position, foundIndex)); 
    position = Math.min((uri.indexOf('&', foundIndex) + 1) || hashOrEndIndex, hashOrEndIndex); 
  } 
  buffer.push(uri.substr(position)); 
  return buffer.join('').replace(goog.uri.utils.trailingQueryPunctuationRe_, '$1'); 
}; 
goog.uri.utils.setParam = function(uri, keyEncoded, value) { 
  return goog.uri.utils.appendParam(goog.uri.utils.removeParam(uri, keyEncoded), keyEncoded, value); 
}; 
goog.uri.utils.appendPath = function(baseUri, path) { 
  goog.uri.utils.assertNoFragmentsOrQueries_(baseUri); 
  if(goog.string.endsWith(baseUri, '/')) { 
    baseUri = baseUri.substr(0, baseUri.length - 1); 
  } 
  if(goog.string.startsWith(path, '/')) { 
    path = path.substr(1); 
  } 
  return goog.string.buildString(baseUri, '/', path); 
}; 
goog.uri.utils.StandardQueryParam = { RANDOM: 'zx' }; 
goog.uri.utils.makeUnique = function(uri) { 
  return goog.uri.utils.setParam(uri, goog.uri.utils.StandardQueryParam.RANDOM, goog.string.getRandomString()); 
}; 
