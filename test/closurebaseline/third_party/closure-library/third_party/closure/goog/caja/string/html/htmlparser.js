
goog.provide('goog.string.html.HtmlParser'); 
goog.provide('goog.string.html.HtmlParser.EFlags'); 
goog.provide('goog.string.html.HtmlParser.Elements'); 
goog.provide('goog.string.html.HtmlParser.Entities'); 
goog.provide('goog.string.html.HtmlSaxHandler'); 
goog.string.html.HtmlParser = function() { }; 
goog.string.html.HtmlParser.Entities = { 
  lt: '<', 
  gt: '>', 
  amp: '&', 
  nbsp: '\240', 
  quot: '"', 
  apos: '\'' 
}; 
goog.string.html.HtmlParser.EFlags = { 
  OPTIONAL_ENDTAG: 1, 
  EMPTY: 2, 
  CDATA: 4, 
  RCDATA: 8, 
  UNSAFE: 16, 
  FOLDABLE: 32 
}; 
goog.string.html.HtmlParser.Elements = { 
  'a': 0, 
  'abbr': 0, 
  'acronym': 0, 
  'address': 0, 
  'applet': goog.string.html.HtmlParser.EFlags.UNSAFE, 
  'area': goog.string.html.HtmlParser.EFlags.EMPTY, 
  'b': 0, 
  'base': goog.string.html.HtmlParser.EFlags.EMPTY | goog.string.html.HtmlParser.EFlags.UNSAFE, 
  'basefont': goog.string.html.HtmlParser.EFlags.EMPTY | goog.string.html.HtmlParser.EFlags.UNSAFE, 
  'bdo': 0, 
  'big': 0, 
  'blockquote': 0, 
  'body': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG | goog.string.html.HtmlParser.EFlags.UNSAFE | goog.string.html.HtmlParser.EFlags.FOLDABLE, 
  'br': goog.string.html.HtmlParser.EFlags.EMPTY, 
  'button': 0, 
  'caption': 0, 
  'center': 0, 
  'cite': 0, 
  'code': 0, 
  'col': goog.string.html.HtmlParser.EFlags.EMPTY, 
  'colgroup': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG, 
  'dd': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG, 
  'del': 0, 
  'dfn': 0, 
  'dir': 0, 
  'div': 0, 
  'dl': 0, 
  'dt': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG, 
  'em': 0, 
  'fieldset': 0, 
  'font': 0, 
  'form': 0, 
  'frame': goog.string.html.HtmlParser.EFlags.EMPTY | goog.string.html.HtmlParser.EFlags.UNSAFE, 
  'frameset': goog.string.html.HtmlParser.EFlags.UNSAFE, 
  'h1': 0, 
  'h2': 0, 
  'h3': 0, 
  'h4': 0, 
  'h5': 0, 
  'h6': 0, 
  'head': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG | goog.string.html.HtmlParser.EFlags.UNSAFE | goog.string.html.HtmlParser.EFlags.FOLDABLE, 
  'hr': goog.string.html.HtmlParser.EFlags.EMPTY, 
  'html': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG | goog.string.html.HtmlParser.EFlags.UNSAFE | goog.string.html.HtmlParser.EFlags.FOLDABLE, 
  'i': 0, 
  'iframe': goog.string.html.HtmlParser.EFlags.UNSAFE | goog.string.html.HtmlParser.EFlags.CDATA, 
  'img': goog.string.html.HtmlParser.EFlags.EMPTY, 
  'input': goog.string.html.HtmlParser.EFlags.EMPTY, 
  'ins': 0, 
  'isindex': goog.string.html.HtmlParser.EFlags.EMPTY | goog.string.html.HtmlParser.EFlags.UNSAFE, 
  'kbd': 0, 
  'label': 0, 
  'legend': 0, 
  'li': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG, 
  'link': goog.string.html.HtmlParser.EFlags.EMPTY | goog.string.html.HtmlParser.EFlags.UNSAFE, 
  'map': 0, 
  'menu': 0, 
  'meta': goog.string.html.HtmlParser.EFlags.EMPTY | goog.string.html.HtmlParser.EFlags.UNSAFE, 
  'noframes': goog.string.html.HtmlParser.EFlags.UNSAFE | goog.string.html.HtmlParser.EFlags.CDATA, 
  'noscript': goog.string.html.HtmlParser.EFlags.UNSAFE | goog.string.html.HtmlParser.EFlags.CDATA, 
  'object': goog.string.html.HtmlParser.EFlags.UNSAFE, 
  'ol': 0, 
  'optgroup': 0, 
  'option': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG, 
  'p': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG, 
  'param': goog.string.html.HtmlParser.EFlags.EMPTY | goog.string.html.HtmlParser.EFlags.UNSAFE, 
  'pre': 0, 
  'q': 0, 
  's': 0, 
  'samp': 0, 
  'script': goog.string.html.HtmlParser.EFlags.UNSAFE | goog.string.html.HtmlParser.EFlags.CDATA, 
  'select': 0, 
  'small': 0, 
  'span': 0, 
  'strike': 0, 
  'strong': 0, 
  'style': goog.string.html.HtmlParser.EFlags.UNSAFE | goog.string.html.HtmlParser.EFlags.CDATA, 
  'sub': 0, 
  'sup': 0, 
  'table': 0, 
  'tbody': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG, 
  'td': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG, 
  'textarea': goog.string.html.HtmlParser.EFlags.RCDATA, 
  'tfoot': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG, 
  'th': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG, 
  'thead': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG, 
  'title': goog.string.html.HtmlParser.EFlags.RCDATA | goog.string.html.HtmlParser.EFlags.UNSAFE, 
  'tr': goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG, 
  'tt': 0, 
  'u': 0, 
  'ul': 0, 
  'var': 0 
}; 
goog.string.html.HtmlParser.AMP_RE_ = /&/g; 
goog.string.html.HtmlParser.LOOSE_AMP_RE_ = /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi; 
goog.string.html.HtmlParser.LT_RE_ = /</g; 
goog.string.html.HtmlParser.GT_RE_ = />/g; 
goog.string.html.HtmlParser.QUOTE_RE_ = /\"/g; 
goog.string.html.HtmlParser.EQUALS_RE_ = /=/g; 
goog.string.html.HtmlParser.NULL_RE_ = /\0/g; 
goog.string.html.HtmlParser.ENTITY_RE_ = /&(#\d+|#x[0-9A-Fa-f]+|\w+);/g; 
goog.string.html.HtmlParser.DECIMAL_ESCAPE_RE_ = /^#(\d+)$/; 
goog.string.html.HtmlParser.HEX_ESCAPE_RE_ = /^#x([0-9A-Fa-f]+)$/; 
goog.string.html.HtmlParser.INSIDE_TAG_TOKEN_ = new RegExp('^\\s*(?:' +('(?:' + '([a-z][a-z-]*)' +('(' + '\\s*=\\s*' +('(' + '\"[^\"]*\"' + '|\'[^\']*\'' + '|(?=[a-z][a-z-]*\\s*=)' + '|[^>\"\'\\s]*' + ')') + ')') + '?' + ')') + '|(/?>)' + '|[^a-z\\s>]+)', 'i'); 
goog.string.html.HtmlParser.OUTSIDE_TAG_TOKEN_ = new RegExp('^(?:' + '&(\\#[0-9]+|\\#[x][0-9a-f]+|\\w+);' + '|<[!]--[\\s\\S]*?-->|<!\\w[^>]*>|<\\?[^>*]*>' + '|<(/)?([a-z][a-z0-9]*)' + '|([^<&>]+)' + '|([<&>]))', 'i'); 
goog.string.html.HtmlParser.prototype.parse = function(handler, htmlText) { 
  var htmlLower = null; 
  var inTag = false; 
  var attribs =[]; 
  var tagName; 
  var eflags; 
  var openTag; 
  handler.startDoc(); 
  while(htmlText) { 
    var regex = inTag ? goog.string.html.HtmlParser.INSIDE_TAG_TOKEN_: goog.string.html.HtmlParser.OUTSIDE_TAG_TOKEN_; 
    var m = htmlText.match(regex); 
    htmlText = htmlText.substring(m[0].length); 
    if(inTag) { 
      if(m[1]) { 
        var attribName = goog.string.html.toLowerCase(m[1]); 
        var decodedValue; 
        if(m[2]) { 
          var encodedValue = m[3]; 
          switch(encodedValue.charCodeAt(0)) { 
            case 34: 
            case 39: 
              encodedValue = encodedValue.substring(1, encodedValue.length - 1); 
              break; 

          } 
          decodedValue = this.unescapeEntities_(this.stripNULs_(encodedValue)); 
        } else { 
          decodedValue = attribName; 
        } 
        attribs.push(attribName, decodedValue); 
      } else if(m[4]) { 
        if(eflags !== void 0) { 
          if(openTag) { 
            if(handler.startTag) { 
              handler.startTag((tagName), attribs); 
            } 
          } else { 
            if(handler.endTag) { 
              handler.endTag((tagName)); 
            } 
          } 
        } 
        if(openTag &&(eflags &(goog.string.html.HtmlParser.EFlags.CDATA | goog.string.html.HtmlParser.EFlags.RCDATA))) { 
          if(htmlLower === null) { 
            htmlLower = goog.string.html.toLowerCase(htmlText); 
          } else { 
            htmlLower = htmlLower.substring(htmlLower.length - htmlText.length); 
          } 
          var dataEnd = htmlLower.indexOf('</' + tagName); 
          if(dataEnd < 0) { 
            dataEnd = htmlText.length; 
          } 
          if(eflags & goog.string.html.HtmlParser.EFlags.CDATA) { 
            if(handler.cdata) { 
              handler.cdata(htmlText.substring(0, dataEnd)); 
            } 
          } else if(handler.rcdata) { 
            handler.rcdata(this.normalizeRCData_(htmlText.substring(0, dataEnd))); 
          } 
          htmlText = htmlText.substring(dataEnd); 
        } 
        tagName = eflags = openTag = void 0; 
        attribs.length = 0; 
        inTag = false; 
      } 
    } else { 
      if(m[1]) { 
        handler.pcdata(m[0]); 
      } else if(m[3]) { 
        openTag = ! m[2]; 
        inTag = true; 
        tagName = goog.string.html.toLowerCase(m[3]); 
        eflags = goog.string.html.HtmlParser.Elements.hasOwnProperty(tagName) ? goog.string.html.HtmlParser.Elements[tagName]: void 0; 
      } else if(m[4]) { 
        handler.pcdata(m[4]); 
      } else if(m[5]) { 
        switch(m[5]) { 
          case '<': 
            handler.pcdata('&lt;'); 
            break; 

          case '>': 
            handler.pcdata('&gt;'); 
            break; 

          default: 
            handler.pcdata('&amp;'); 
            break; 

        } 
      } 
    } 
  } 
  handler.endDoc(); 
}; 
goog.string.html.HtmlParser.prototype.lookupEntity_ = function(name) { 
  name = goog.string.html.toLowerCase(name); 
  if(goog.string.html.HtmlParser.Entities.hasOwnProperty(name)) { 
    return goog.string.html.HtmlParser.Entities[name]; 
  } 
  var m = name.match(goog.string.html.HtmlParser.DECIMAL_ESCAPE_RE_); 
  if(m) { 
    return String.fromCharCode(parseInt(m[1], 10)); 
  } else if(! !(m = name.match(goog.string.html.HtmlParser.HEX_ESCAPE_RE_))) { 
    return String.fromCharCode(parseInt(m[1], 16)); 
  } 
  return ''; 
}; 
goog.string.html.HtmlParser.prototype.stripNULs_ = function(s) { 
  return s.replace(goog.string.html.HtmlParser.NULL_RE_, ''); 
}; 
goog.string.html.HtmlParser.prototype.unescapeEntities_ = function(s) { 
  return s.replace(goog.string.html.HtmlParser.ENTITY_RE_, goog.bind(this.lookupEntity_, this)); 
}; 
goog.string.html.HtmlParser.prototype.normalizeRCData_ = function(rcdata) { 
  return rcdata.replace(goog.string.html.HtmlParser.LOOSE_AMP_RE_, '&amp;$1').replace(goog.string.html.HtmlParser.LT_RE_, '&lt;').replace(goog.string.html.HtmlParser.GT_RE_, '&gt;'); 
}; 
goog.string.html.toLowerCase = function(str) { 
  if('script' === 'SCRIPT'.toLowerCase()) { 
    return str.toLowerCase(); 
  } else { 
    return str.replace(/[A-Z]/g, function(ch) { 
      return String.fromCharCode(ch.charCodeAt(0) | 32); 
    }); 
  } 
}; 
goog.string.html.HtmlSaxHandler = function() { }; 
goog.string.html.HtmlSaxHandler.prototype.startTag = goog.abstractMethod; 
goog.string.html.HtmlSaxHandler.prototype.endTag = goog.abstractMethod; 
goog.string.html.HtmlSaxHandler.prototype.pcdata = goog.abstractMethod; 
goog.string.html.HtmlSaxHandler.prototype.rcdata = goog.abstractMethod; 
goog.string.html.HtmlSaxHandler.prototype.cdata = goog.abstractMethod; 
goog.string.html.HtmlSaxHandler.prototype.startDoc = goog.abstractMethod; 
goog.string.html.HtmlSaxHandler.prototype.endDoc = goog.abstractMethod; 
