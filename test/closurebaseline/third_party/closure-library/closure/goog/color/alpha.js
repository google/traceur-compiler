
goog.provide('goog.color.alpha'); 
goog.require('goog.color'); 
goog.color.alpha.parse = function(str) { 
  var result = { }; 
  str = String(str); 
  var maybeHex = goog.color.prependPoundIfNecessary_(str); 
  if(goog.color.alpha.isValidAlphaHexColor_(maybeHex)) { 
    result.hex = goog.color.alpha.normalizeAlphaHex_(maybeHex); 
    result.type = 'hex'; 
    return result; 
  } else { 
    var rgba = goog.color.alpha.isValidRgbaColor_(str); 
    if(rgba.length) { 
      result.hex = goog.color.alpha.rgbaArrayToHex(rgba); 
      result.type = 'rgba'; 
      return result; 
    } else { 
      var hsla = goog.color.alpha.isValidHslaColor_(str); 
      if(hsla.length) { 
        result.hex = goog.color.alpha.hslaArrayToHex(hsla); 
        result.type = 'hsla'; 
        return result; 
      } 
    } 
  } 
  throw Error(str + ' is not a valid color string'); 
}; 
goog.color.alpha.hexToRgbaStyle = function(hexColor) { 
  return goog.color.alpha.rgbaStyle_(goog.color.alpha.hexToRgba(hexColor)); 
}; 
goog.color.alpha.extractHexColor = function(colorWithAlpha) { 
  if(goog.color.alpha.isValidAlphaHexColor_(colorWithAlpha)) { 
    var fullColor = goog.color.prependPoundIfNecessary_(colorWithAlpha); 
    var normalizedColor = goog.color.alpha.normalizeAlphaHex_(fullColor); 
    return normalizedColor.substring(0, 7); 
  } else { 
    throw Error(colorWithAlpha + ' is not a valid 8-hex color string'); 
  } 
}; 
goog.color.alpha.extractAlpha = function(colorWithAlpha) { 
  if(goog.color.alpha.isValidAlphaHexColor_(colorWithAlpha)) { 
    var fullColor = goog.color.prependPoundIfNecessary_(colorWithAlpha); 
    var normalizedColor = goog.color.alpha.normalizeAlphaHex_(fullColor); 
    return normalizedColor.substring(7, 9); 
  } else { 
    throw Error(colorWithAlpha + ' is not a valid 8-hex color string'); 
  } 
}; 
goog.color.alpha.hexQuadrupletRe_ = /#(.)(.)(.)(.)/; 
goog.color.alpha.normalizeAlphaHex_ = function(hexColor) { 
  if(! goog.color.alpha.isValidAlphaHexColor_(hexColor)) { 
    throw Error("'" + hexColor + "' is not a valid alpha hex color"); 
  } 
  if(hexColor.length == 5) { 
    hexColor = hexColor.replace(goog.color.alpha.hexQuadrupletRe_, '#$1$1$2$2$3$3$4$4'); 
  } 
  return hexColor.toLowerCase(); 
}; 
goog.color.alpha.hexToRgba = function(hexColor) { 
  hexColor = goog.color.alpha.normalizeAlphaHex_(hexColor); 
  var r = parseInt(hexColor.substr(1, 2), 16); 
  var g = parseInt(hexColor.substr(3, 2), 16); 
  var b = parseInt(hexColor.substr(5, 2), 16); 
  var a = parseInt(hexColor.substr(7, 2), 16); 
  return[r, g, b, a / 255]; 
}; 
goog.color.alpha.rgbaToHex = function(r, g, b, a) { 
  var intAlpha = Math.floor(a * 255); 
  if(isNaN(intAlpha) || intAlpha < 0 || intAlpha > 255) { 
    throw Error('"(' + r + ',' + g + ',' + b + ',' + a + '") is not a valid RGBA color'); 
  } 
  var hexA = goog.color.prependZeroIfNecessary_(intAlpha.toString(16)); 
  return goog.color.rgbToHex(r, g, b) + hexA; 
}; 
goog.color.alpha.hslaToHex = function(h, s, l, a) { 
  var intAlpha = Math.floor(a * 255); 
  if(isNaN(intAlpha) || intAlpha < 0 || intAlpha > 255) { 
    throw Error('"(' + h + ',' + s + ',' + l + ',' + a + '") is not a valid HSLA color'); 
  } 
  var hexA = goog.color.prependZeroIfNecessary_(intAlpha.toString(16)); 
  return goog.color.hslToHex(h, s / 100, l / 100) + hexA; 
}; 
goog.color.alpha.rgbaArrayToHex = function(rgba) { 
  return goog.color.alpha.rgbaToHex(rgba[0], rgba[1], rgba[2], rgba[3]); 
}; 
goog.color.alpha.hslaArrayToHex = function(hsla) { 
  return goog.color.alpha.hslaToHex(hsla[0], hsla[1], hsla[2], hsla[3]); 
}; 
goog.color.alpha.hslaArrayToRgbaStyle = function(hsla) { 
  return goog.color.alpha.hslaToRgbaStyle(hsla[0], hsla[1], hsla[2], hsla[3]); 
}; 
goog.color.alpha.hslaToRgbaStyle = function(h, s, l, a) { 
  return goog.color.alpha.rgbaStyle_(goog.color.alpha.hslaToRgba(h, s, l, a)); 
}; 
goog.color.alpha.hslaToRgba = function(h, s, l, a) { 
  return goog.color.hslToRgb(h, s / 100, l / 100).concat(a); 
}; 
goog.color.alpha.rgbaToHsla = function(r, g, b, a) { 
  return goog.color.rgbToHsl(r, g, b).concat(a); 
}; 
goog.color.alpha.rgbaArrayToHsla = function(rgba) { 
  return goog.color.alpha.rgbaToHsla(rgba[0], rgba[1], rgba[2], rgba[3]); 
}; 
goog.color.alpha.validAlphaHexColorRe_ = /^#(?:[0-9a-f]{4}){1,2}$/i; 
goog.color.alpha.isValidAlphaHexColor_ = function(str) { 
  return goog.color.alpha.validAlphaHexColorRe_.test(str); 
}; 
goog.color.alpha.normalizedAlphaHexColorRe_ = /^#[0-9a-f]{8}$/; 
goog.color.alpha.isNormalizedAlphaHexColor_ = function(str) { 
  return goog.color.alpha.normalizedAlphaHexColorRe_.test(str); 
}; 
goog.color.alpha.rgbaColorRe_ = /^(?:rgba)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|1|0\.\d{0,10})\)$/i; 
goog.color.alpha.hslaColorRe_ = /^(?:hsla)\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\%,\s?(0|[1-9]\d{0,2})\%,\s?(0|1|0\.\d{0,10})\)$/i; 
goog.color.alpha.isValidRgbaColor_ = function(str) { 
  var regExpResultArray = str.match(goog.color.alpha.rgbaColorRe_); 
  if(regExpResultArray) { 
    var r = Number(regExpResultArray[1]); 
    var g = Number(regExpResultArray[2]); 
    var b = Number(regExpResultArray[3]); 
    var a = Number(regExpResultArray[4]); 
    if(r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 1) { 
      return[r, g, b, a]; 
    } 
  } 
  return[]; 
}; 
goog.color.alpha.isValidHslaColor_ = function(str) { 
  var regExpResultArray = str.match(goog.color.alpha.hslaColorRe_); 
  if(regExpResultArray) { 
    var h = Number(regExpResultArray[1]); 
    var s = Number(regExpResultArray[2]); 
    var l = Number(regExpResultArray[3]); 
    var a = Number(regExpResultArray[4]); 
    if(h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100 && a >= 0 && a <= 1) { 
      return[h, s, l, a]; 
    } 
  } 
  return[]; 
}; 
goog.color.alpha.rgbaStyle_ = function(rgba) { 
  return 'rgba(' + rgba.join(',') + ')'; 
}; 
goog.color.alpha.hsvaToHex = function(h, s, v, a) { 
  var alpha = Math.floor(a * 255); 
  return goog.color.hsvArrayToHex([h, s, v]) + goog.color.prependZeroIfNecessary_(alpha.toString(16)); 
}; 
goog.color.alpha.hsvaArrayToHex = function(hsva) { 
  return goog.color.alpha.hsvaToHex(hsva[0], hsva[1], hsva[2], hsva[3]); 
}; 
