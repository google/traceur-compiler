
goog.provide('goog.color'); 
goog.require('goog.color.names'); 
goog.require('goog.math'); 
goog.color.parse = function(str) { 
  var result = { }; 
  str = String(str); 
  var maybeHex = goog.color.prependPoundIfNecessary_(str); 
  if(goog.color.isValidHexColor_(maybeHex)) { 
    result.hex = goog.color.normalizeHex(maybeHex); 
    result.type = 'hex'; 
    return result; 
  } else { 
    var rgb = goog.color.isValidRgbColor_(str); 
    if(rgb.length) { 
      result.hex = goog.color.rgbArrayToHex(rgb); 
      result.type = 'rgb'; 
      return result; 
    } else if(goog.color.names) { 
      var hex = goog.color.names[str.toLowerCase()]; 
      if(hex) { 
        result.hex = hex; 
        result.type = 'named'; 
        return result; 
      } 
    } 
  } 
  throw Error(str + ' is not a valid color string'); 
}; 
goog.color.parseRgb = function(str) { 
  var rgb = goog.color.isValidRgbColor_(str); 
  if(! rgb.length) { 
    throw Error(str + ' is not a valid RGB color'); 
  } 
  return rgb; 
}; 
goog.color.hexToRgbStyle = function(hexColor) { 
  return goog.color.rgbStyle_(goog.color.hexToRgb(hexColor)); 
}; 
goog.color.hexTripletRe_ = /#(.)(.)(.)/; 
goog.color.normalizeHex = function(hexColor) { 
  if(! goog.color.isValidHexColor_(hexColor)) { 
    throw Error("'" + hexColor + "' is not a valid hex color"); 
  } 
  if(hexColor.length == 4) { 
    hexColor = hexColor.replace(goog.color.hexTripletRe_, '#$1$1$2$2$3$3'); 
  } 
  return hexColor.toLowerCase(); 
}; 
goog.color.hexToRgb = function(hexColor) { 
  hexColor = goog.color.normalizeHex(hexColor); 
  var r = parseInt(hexColor.substr(1, 2), 16); 
  var g = parseInt(hexColor.substr(3, 2), 16); 
  var b = parseInt(hexColor.substr(5, 2), 16); 
  return[r, g, b]; 
}; 
goog.color.rgbToHex = function(r, g, b) { 
  r = Number(r); 
  g = Number(g); 
  b = Number(b); 
  if(isNaN(r) || r < 0 || r > 255 || isNaN(g) || g < 0 || g > 255 || isNaN(b) || b < 0 || b > 255) { 
    throw Error('"(' + r + ',' + g + ',' + b + '") is not a valid RGB color'); 
  } 
  var hexR = goog.color.prependZeroIfNecessary_(r.toString(16)); 
  var hexG = goog.color.prependZeroIfNecessary_(g.toString(16)); 
  var hexB = goog.color.prependZeroIfNecessary_(b.toString(16)); 
  return '#' + hexR + hexG + hexB; 
}; 
goog.color.rgbArrayToHex = function(rgb) { 
  return goog.color.rgbToHex(rgb[0], rgb[1], rgb[2]); 
}; 
goog.color.rgbToHsl = function(r, g, b) { 
  var normR = r / 255; 
  var normG = g / 255; 
  var normB = b / 255; 
  var max = Math.max(normR, normG, normB); 
  var min = Math.min(normR, normG, normB); 
  var h = 0; 
  var s = 0; 
  var l = 0.5 *(max + min); 
  if(max != min) { 
    if(max == normR) { 
      h = 60 *(normG - normB) /(max - min); 
    } else if(max == normG) { 
      h = 60 *(normB - normR) /(max - min) + 120; 
    } else if(max == normB) { 
      h = 60 *(normR - normG) /(max - min) + 240; 
    } 
    if(0 < l && l <= 0.5) { 
      s =(max - min) /(2 * l); 
    } else { 
      s =(max - min) /(2 - 2 * l); 
    } 
  } 
  return[Math.round(h + 360) % 360, s, l]; 
}; 
goog.color.rgbArrayToHsl = function(rgb) { 
  return goog.color.rgbToHsl(rgb[0], rgb[1], rgb[2]); 
}; 
goog.color.hueToRgb_ = function(v1, v2, vH) { 
  if(vH < 0) { 
    vH += 1; 
  } else if(vH > 1) { 
    vH -= 1; 
  } 
  if((6 * vH) < 1) { 
    return(v1 +(v2 - v1) * 6 * vH); 
  } else if(2 * vH < 1) { 
    return v2; 
  } else if(3 * vH < 2) { 
    return(v1 +(v2 - v1) *((2 / 3) - vH) * 6); 
  } 
  return v1; 
}; 
goog.color.hslToRgb = function(h, s, l) { 
  var r = 0; 
  var g = 0; 
  var b = 0; 
  var normH = h / 360; 
  if(s == 0) { 
    r = g = b = l * 255; 
  } else { 
    var temp1 = 0; 
    var temp2 = 0; 
    if(l < 0.5) { 
      temp2 = l *(1 + s); 
    } else { 
      temp2 = l + s -(s * l); 
    } 
    temp1 = 2 * l - temp2; 
    r = 255 * goog.color.hueToRgb_(temp1, temp2, normH +(1 / 3)); 
    g = 255 * goog.color.hueToRgb_(temp1, temp2, normH); 
    b = 255 * goog.color.hueToRgb_(temp1, temp2, normH -(1 / 3)); 
  } 
  return[Math.round(r), Math.round(g), Math.round(b)]; 
}; 
goog.color.hslArrayToRgb = function(hsl) { 
  return goog.color.hslToRgb(hsl[0], hsl[1], hsl[2]); 
}; 
goog.color.validHexColorRe_ = /^#(?:[0-9a-f]{3}){1,2}$/i; 
goog.color.isValidHexColor_ = function(str) { 
  return goog.color.validHexColorRe_.test(str); 
}; 
goog.color.normalizedHexColorRe_ = /^#[0-9a-f]{6}$/; 
goog.color.isNormalizedHexColor_ = function(str) { 
  return goog.color.normalizedHexColorRe_.test(str); 
}; 
goog.color.rgbColorRe_ = /^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i; 
goog.color.isValidRgbColor_ = function(str) { 
  var regExpResultArray = str.match(goog.color.rgbColorRe_); 
  if(regExpResultArray) { 
    var r = Number(regExpResultArray[1]); 
    var g = Number(regExpResultArray[2]); 
    var b = Number(regExpResultArray[3]); 
    if(r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) { 
      return[r, g, b]; 
    } 
  } 
  return[]; 
}; 
goog.color.prependZeroIfNecessary_ = function(hex) { 
  return hex.length == 1 ? '0' + hex: hex; 
}; 
goog.color.prependPoundIfNecessary_ = function(str) { 
  return str.charAt(0) == '#' ? str: '#' + str; 
}; 
goog.color.rgbStyle_ = function(rgb) { 
  return 'rgb(' + rgb.join(',') + ')'; 
}; 
goog.color.hsvToRgb = function(h, s, brightness) { 
  var red = 0; 
  var green = 0; 
  var blue = 0; 
  if(s == 0) { 
    red = brightness; 
    green = brightness; 
    blue = brightness; 
  } else { 
    var sextant = Math.floor(h / 60); 
    var remainder =(h / 60) - sextant; 
    var val1 = brightness *(1 - s); 
    var val2 = brightness *(1 -(s * remainder)); 
    var val3 = brightness *(1 -(s *(1 - remainder))); 
    switch(sextant) { 
      case 1: 
        red = val2; 
        green = brightness; 
        blue = val1; 
        break; 

      case 2: 
        red = val1; 
        green = brightness; 
        blue = val3; 
        break; 

      case 3: 
        red = val1; 
        green = val2; 
        blue = brightness; 
        break; 

      case 4: 
        red = val3; 
        green = val1; 
        blue = brightness; 
        break; 

      case 5: 
        red = brightness; 
        green = val1; 
        blue = val2; 
        break; 

      case 6: 
      case 0: 
        red = brightness; 
        green = val3; 
        blue = val1; 
        break; 

    } 
  } 
  return[Math.floor(red), Math.floor(green), Math.floor(blue)]; 
}; 
goog.color.rgbToHsv = function(red, green, blue) { 
  var max = Math.max(Math.max(red, green), blue); 
  var min = Math.min(Math.min(red, green), blue); 
  var hue; 
  var saturation; 
  var value = max; 
  if(min == max) { 
    hue = 0; 
    saturation = 0; 
  } else { 
    var delta =(max - min); 
    saturation = delta / max; 
    if(red == max) { 
      hue =(green - blue) / delta; 
    } else if(green == max) { 
      hue = 2 +((blue - red) / delta); 
    } else { 
      hue = 4 +((red - green) / delta); 
    } 
    hue *= 60; 
    if(hue < 0) { 
      hue += 360; 
    } 
    if(hue > 360) { 
      hue -= 360; 
    } 
  } 
  return[hue, saturation, value]; 
}; 
goog.color.rgbArrayToHsv = function(rgb) { 
  return goog.color.rgbToHsv(rgb[0], rgb[1], rgb[2]); 
}; 
goog.color.hsvArrayToRgb = function(hsv) { 
  return goog.color.hsvToRgb(hsv[0], hsv[1], hsv[2]); 
}; 
goog.color.hexToHsl = function(hex) { 
  var rgb = goog.color.hexToRgb(hex); 
  return goog.color.rgbToHsl(rgb[0], rgb[1], rgb[2]); 
}; 
goog.color.hslToHex = function(h, s, l) { 
  return goog.color.rgbArrayToHex(goog.color.hslToRgb(h, s, l)); 
}; 
goog.color.hslArrayToHex = function(hsl) { 
  return goog.color.rgbArrayToHex(goog.color.hslToRgb(hsl[0], hsl[1], hsl[2])); 
}; 
goog.color.hexToHsv = function(hex) { 
  return goog.color.rgbArrayToHsv(goog.color.hexToRgb(hex)); 
}; 
goog.color.hsvToHex = function(h, s, v) { 
  return goog.color.rgbArrayToHex(goog.color.hsvToRgb(h, s, v)); 
}; 
goog.color.hsvArrayToHex = function(hsv) { 
  return goog.color.hsvToHex(hsv[0], hsv[1], hsv[2]); 
}; 
goog.color.hslDistance = function(hsl1, hsl2) { 
  var sl1, sl2; 
  if(hsl1[2]<= 0.5) { 
    sl1 = hsl1[1]* hsl1[2]; 
  } else { 
    sl1 = hsl1[1]*(1.0 - hsl1[2]); 
  } 
  if(hsl2[2]<= 0.5) { 
    sl2 = hsl2[1]* hsl2[2]; 
  } else { 
    sl2 = hsl2[1]*(1.0 - hsl2[2]); 
  } 
  var h1 = hsl1[0]/ 360.0; 
  var h2 = hsl2[0]/ 360.0; 
  var dh =(h1 - h2) * 2.0 * Math.PI; 
  return(hsl1[2]- hsl2[2]) *(hsl1[2]- hsl2[2]) + sl1 * sl1 + sl2 * sl2 - 2 * sl1 * sl2 * Math.cos(dh); 
}; 
goog.color.blend = function(rgb1, rgb2, factor) { 
  factor = goog.math.clamp(factor, 0, 1); 
  return[Math.round(factor * rgb1[0]+(1.0 - factor) * rgb2[0]), Math.round(factor * rgb1[1]+(1.0 - factor) * rgb2[1]), Math.round(factor * rgb1[2]+(1.0 - factor) * rgb2[2])]; 
}; 
goog.color.darken = function(rgb, factor) { 
  var black =[0, 0, 0]; 
  return goog.color.blend(black, rgb, factor); 
}; 
goog.color.lighten = function(rgb, factor) { 
  var white =[255, 255, 255]; 
  return goog.color.blend(white, rgb, factor); 
}; 
goog.color.highContrast = function(prime, suggestions) { 
  var suggestionsWithDiff =[]; 
  for(var i = 0; i < suggestions.length; i ++) { 
    suggestionsWithDiff.push({ 
      color: suggestions[i], 
      diff: goog.color.yiqBrightnessDiff_(suggestions[i], prime) + goog.color.colorDiff_(suggestions[i], prime) 
    }); 
  } 
  suggestionsWithDiff.sort(function(a, b) { 
    return b.diff - a.diff; 
  }); 
  return suggestionsWithDiff[0].color; 
}; 
goog.color.yiqBrightness_ = function(rgb) { 
  return Math.round((rgb[0]* 299 + rgb[1]* 587 + rgb[2]* 114) / 1000); 
}; 
goog.color.yiqBrightnessDiff_ = function(rgb1, rgb2) { 
  return Math.abs(goog.color.yiqBrightness_(rgb1) - goog.color.yiqBrightness_(rgb2)); 
}; 
goog.color.colorDiff_ = function(rgb1, rgb2) { 
  return Math.abs(rgb1[0]- rgb2[0]) + Math.abs(rgb1[1]- rgb2[1]) + Math.abs(rgb1[2]- rgb2[2]); 
}; 
