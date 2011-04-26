
goog.provide('goog.string.html.HtmlSanitizer'); 
goog.provide('goog.string.html.HtmlSanitizer.AttributeType'); 
goog.provide('goog.string.html.HtmlSanitizer.Attributes'); 
goog.provide('goog.string.html.htmlSanitize'); 
goog.require('goog.string.StringBuffer'); 
goog.require('goog.string.html.HtmlParser'); 
goog.require('goog.string.html.HtmlParser.EFlags'); 
goog.require('goog.string.html.HtmlParser.Elements'); 
goog.require('goog.string.html.HtmlSaxHandler'); 
goog.string.html.htmlSanitize = function(htmlText, opt_urlPolicy, opt_nmTokenPolicy) { 
  var stringBuffer = new goog.string.StringBuffer(); 
  var handler = new goog.string.html.HtmlSanitizer(stringBuffer, opt_urlPolicy, opt_nmTokenPolicy); 
  var parser = new goog.string.html.HtmlParser(); 
  parser.parse(handler, htmlText); 
  return stringBuffer.toString(); 
}; 
goog.string.html.HtmlSanitizer = function(stringBuffer, opt_urlPolicy, opt_nmTokenPolicy) { 
  goog.string.html.HtmlSaxHandler.call(this); 
  this.stringBuffer_ = stringBuffer; 
  this.stack_ =[]; 
  this.ignoring_ = false; 
  this.urlPolicy_ = opt_urlPolicy; 
  this.nmTokenPolicy_ = opt_nmTokenPolicy; 
}; 
goog.inherits(goog.string.html.HtmlSanitizer, goog.string.html.HtmlSaxHandler); 
goog.string.html.HtmlSanitizer.AttributeType = { 
  NONE: 0, 
  URI: 1, 
  URI_FRAGMENT: 11, 
  SCRIPT: 2, 
  STYLE: 3, 
  ID: 4, 
  IDREF: 5, 
  IDREFS: 6, 
  GLOBAL_NAME: 7, 
  LOCAL_NAME: 8, 
  CLASSES: 9, 
  FRAME_TARGET: 10 
}; 
goog.string.html.HtmlSanitizer.Attributes = { 
  '*::class': goog.string.html.HtmlSanitizer.AttributeType.CLASSES, 
  '*::dir': 0, 
  '*::id': goog.string.html.HtmlSanitizer.AttributeType.ID, 
  '*::lang': 0, 
  '*::onclick': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  '*::ondblclick': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  '*::onkeydown': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  '*::onkeypress': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  '*::onkeyup': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  '*::onload': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  '*::onmousedown': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  '*::onmousemove': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  '*::onmouseout': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  '*::onmouseover': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  '*::onmouseup': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  '*::style': goog.string.html.HtmlSanitizer.AttributeType.STYLE, 
  '*::title': 0, 
  '*::accesskey': 0, 
  '*::tabindex': 0, 
  '*::onfocus': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  '*::onblur': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'a::coords': 0, 
  'a::href': goog.string.html.HtmlSanitizer.AttributeType.URI, 
  'a::hreflang': 0, 
  'a::name': goog.string.html.HtmlSanitizer.AttributeType.GLOBAL_NAME, 
  'a::onblur': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'a::rel': 0, 
  'a::rev': 0, 
  'a::shape': 0, 
  'a::target': goog.string.html.HtmlSanitizer.AttributeType.FRAME_TARGET, 
  'a::type': 0, 
  'area::accesskey': 0, 
  'area::alt': 0, 
  'area::coords': 0, 
  'area::href': goog.string.html.HtmlSanitizer.AttributeType.URI, 
  'area::nohref': 0, 
  'area::onfocus': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'area::shape': 0, 
  'area::tabindex': 0, 
  'area::target': goog.string.html.HtmlSanitizer.AttributeType.FRAME_TARGET, 
  'bdo::dir': 0, 
  'blockquote::cite': goog.string.html.HtmlSanitizer.AttributeType.URI, 
  'br::clear': 0, 
  'button::accesskey': 0, 
  'button::disabled': 0, 
  'button::name': goog.string.html.HtmlSanitizer.AttributeType.LOCAL_NAME, 
  'button::onblur': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'button::onfocus': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'button::tabindex': 0, 
  'button::type': 0, 
  'button::value': 0, 
  'caption::align': 0, 
  'col::align': 0, 
  'col::char': 0, 
  'col::charoff': 0, 
  'col::span': 0, 
  'col::valign': 0, 
  'col::width': 0, 
  'colgroup::align': 0, 
  'colgroup::char': 0, 
  'colgroup::charoff': 0, 
  'colgroup::span': 0, 
  'colgroup::valign': 0, 
  'colgroup::width': 0, 
  'del::cite': goog.string.html.HtmlSanitizer.AttributeType.URI, 
  'del::datetime': 0, 
  'dir::compact': 0, 
  'div::align': 0, 
  'dl::compact': 0, 
  'font::color': 0, 
  'font::face': 0, 
  'font::size': 0, 
  'form::accept': 0, 
  'form::action': goog.string.html.HtmlSanitizer.AttributeType.URI, 
  'form::autocomplete': 0, 
  'form::enctype': 0, 
  'form::method': 0, 
  'form::name': goog.string.html.HtmlSanitizer.AttributeType.GLOBAL_NAME, 
  'form::onreset': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'form::onsubmit': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'form::target': goog.string.html.HtmlSanitizer.AttributeType.FRAME_TARGET, 
  'h1::align': 0, 
  'h2::align': 0, 
  'h3::align': 0, 
  'h4::align': 0, 
  'h5::align': 0, 
  'h6::align': 0, 
  'hr::align': 0, 
  'hr::noshade': 0, 
  'hr::size': 0, 
  'hr::width': 0, 
  'img::align': 0, 
  'img::alt': 0, 
  'img::border': 0, 
  'img::height': 0, 
  'img::hspace': 0, 
  'img::ismap': 0, 
  'img::longdesc': goog.string.html.HtmlSanitizer.AttributeType.URI, 
  'img::name': goog.string.html.HtmlSanitizer.AttributeType.GLOBAL_NAME, 
  'img::src': goog.string.html.HtmlSanitizer.AttributeType.URI, 
  'img::usemap': goog.string.html.HtmlSanitizer.AttributeType.URI_FRAGMENT, 
  'img::vspace': 0, 
  'img::width': 0, 
  'input::accept': 0, 
  'input::accesskey': 0, 
  'input::autocomplete': 0, 
  'input::align': 0, 
  'input::alt': 0, 
  'input::checked': 0, 
  'input::disabled': 0, 
  'input::ismap': 0, 
  'input::maxlength': 0, 
  'input::name': goog.string.html.HtmlSanitizer.AttributeType.LOCAL_NAME, 
  'input::onblur': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'input::onchange': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'input::onfocus': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'input::onselect': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'input::readonly': 0, 
  'input::size': 0, 
  'input::src': goog.string.html.HtmlSanitizer.AttributeType.URI, 
  'input::tabindex': 0, 
  'input::type': 0, 
  'input::usemap': goog.string.html.HtmlSanitizer.AttributeType.URI_FRAGMENT, 
  'input::value': 0, 
  'ins::cite': goog.string.html.HtmlSanitizer.AttributeType.URI, 
  'ins::datetime': 0, 
  'label::accesskey': 0, 
  'label::for': goog.string.html.HtmlSanitizer.AttributeType.IDREF, 
  'label::onblur': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'label::onfocus': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'legend::accesskey': 0, 
  'legend::align': 0, 
  'li::type': 0, 
  'li::value': 0, 
  'map::name': goog.string.html.HtmlSanitizer.AttributeType.GLOBAL_NAME, 
  'menu::compact': 0, 
  'ol::compact': 0, 
  'ol::start': 0, 
  'ol::type': 0, 
  'optgroup::disabled': 0, 
  'optgroup::label': 0, 
  'option::disabled': 0, 
  'option::label': 0, 
  'option::selected': 0, 
  'option::value': 0, 
  'p::align': 0, 
  'pre::width': 0, 
  'q::cite': goog.string.html.HtmlSanitizer.AttributeType.URI, 
  'select::disabled': 0, 
  'select::multiple': 0, 
  'select::name': goog.string.html.HtmlSanitizer.AttributeType.LOCAL_NAME, 
  'select::onblur': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'select::onchange': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'select::onfocus': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'select::size': 0, 
  'select::tabindex': 0, 
  'table::align': 0, 
  'table::bgcolor': 0, 
  'table::border': 0, 
  'table::cellpadding': 0, 
  'table::cellspacing': 0, 
  'table::frame': 0, 
  'table::rules': 0, 
  'table::summary': 0, 
  'table::width': 0, 
  'tbody::align': 0, 
  'tbody::char': 0, 
  'tbody::charoff': 0, 
  'tbody::valign': 0, 
  'td::abbr': 0, 
  'td::align': 0, 
  'td::axis': 0, 
  'td::bgcolor': 0, 
  'td::char': 0, 
  'td::charoff': 0, 
  'td::colspan': 0, 
  'td::headers': goog.string.html.HtmlSanitizer.AttributeType.IDREFS, 
  'td::height': 0, 
  'td::nowrap': 0, 
  'td::rowspan': 0, 
  'td::scope': 0, 
  'td::valign': 0, 
  'td::width': 0, 
  'textarea::accesskey': 0, 
  'textarea::cols': 0, 
  'textarea::disabled': 0, 
  'textarea::name': goog.string.html.HtmlSanitizer.AttributeType.LOCAL_NAME, 
  'textarea::onblur': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'textarea::onchange': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'textarea::onfocus': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'textarea::onselect': goog.string.html.HtmlSanitizer.AttributeType.SCRIPT, 
  'textarea::readonly': 0, 
  'textarea::rows': 0, 
  'textarea::tabindex': 0, 
  'tfoot::align': 0, 
  'tfoot::char': 0, 
  'tfoot::charoff': 0, 
  'tfoot::valign': 0, 
  'th::abbr': 0, 
  'th::align': 0, 
  'th::axis': 0, 
  'th::bgcolor': 0, 
  'th::char': 0, 
  'th::charoff': 0, 
  'th::colspan': 0, 
  'th::headers': goog.string.html.HtmlSanitizer.AttributeType.IDREFS, 
  'th::height': 0, 
  'th::nowrap': 0, 
  'th::rowspan': 0, 
  'th::scope': 0, 
  'th::valign': 0, 
  'th::width': 0, 
  'thead::align': 0, 
  'thead::char': 0, 
  'thead::charoff': 0, 
  'thead::valign': 0, 
  'tr::align': 0, 
  'tr::bgcolor': 0, 
  'tr::char': 0, 
  'tr::charoff': 0, 
  'tr::valign': 0, 
  'ul::compact': 0, 
  'ul::type': 0 
}; 
goog.string.html.HtmlSanitizer.prototype.startTag = function(tagName, attribs) { 
  if(this.ignoring_) { 
    return; 
  } 
  if(! goog.string.html.HtmlParser.Elements.hasOwnProperty(tagName)) { 
    return; 
  } 
  var eflags = goog.string.html.HtmlParser.Elements[tagName]; 
  if(eflags & goog.string.html.HtmlParser.EFlags.FOLDABLE) { 
    return; 
  } else if(eflags & goog.string.html.HtmlParser.EFlags.UNSAFE) { 
    this.ignoring_ = !(eflags & goog.string.html.HtmlParser.EFlags.EMPTY); 
    return; 
  } 
  attribs = this.sanitizeAttributes_(tagName, attribs); 
  if(attribs) { 
    if(!(eflags & goog.string.html.HtmlParser.EFlags.EMPTY)) { 
      this.stack_.push(tagName); 
    } 
    this.stringBuffer_.append('<', tagName); 
    for(var i = 0, n = attribs.length; i < n; i += 2) { 
      var attribName = attribs[i], value = attribs[i + 1]; 
      if(value !== null && value !== void 0) { 
        this.stringBuffer_.append(' ', attribName, '="', this.escapeAttrib_(value), '"'); 
      } 
    } 
    this.stringBuffer_.append('>'); 
  } 
}; 
goog.string.html.HtmlSanitizer.prototype.endTag = function(tagName) { 
  if(this.ignoring_) { 
    this.ignoring_ = false; 
    return; 
  } 
  if(! goog.string.html.HtmlParser.Elements.hasOwnProperty(tagName)) { 
    return; 
  } 
  var eflags = goog.string.html.HtmlParser.Elements[tagName]; 
  if(!(eflags &(goog.string.html.HtmlParser.EFlags.UNSAFE | goog.string.html.HtmlParser.EFlags.EMPTY | goog.string.html.HtmlParser.EFlags.FOLDABLE))) { 
    var index; 
    if(eflags & goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG) { 
      for(index = this.stack_.length; -- index >= 0;) { 
        var stackEl = this.stack_[index]; 
        if(stackEl === tagName) { 
          break; 
        } 
        if(!(goog.string.html.HtmlParser.Elements[stackEl]& goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG)) { 
          return; 
        } 
      } 
    } else { 
      for(index = this.stack_.length; -- index >= 0;) { 
        if(this.stack_[index]=== tagName) { 
          break; 
        } 
      } 
    } 
    if(index < 0) { 
      return; 
    } 
    for(var i = this.stack_.length; -- i > index;) { 
      var stackEl = this.stack_[i]; 
      if(!(goog.string.html.HtmlParser.Elements[stackEl]& goog.string.html.HtmlParser.EFlags.OPTIONAL_ENDTAG)) { 
        this.stringBuffer_.append('</', stackEl, '>'); 
      } 
    } 
    this.stack_.length = index; 
    this.stringBuffer_.append('</', tagName, '>'); 
  } 
}; 
goog.string.html.HtmlSanitizer.prototype.pcdata = function(text) { 
  if(! this.ignoring_) { 
    this.stringBuffer_.append(text); 
  } 
}; 
goog.string.html.HtmlSanitizer.prototype.rcdata = function(text) { 
  if(! this.ignoring_) { 
    this.stringBuffer_.append(text); 
  } 
}; 
goog.string.html.HtmlSanitizer.prototype.cdata = function(text) { 
  if(! this.ignoring_) { 
    this.stringBuffer_.append(text); 
  } 
}; 
goog.string.html.HtmlSanitizer.prototype.startDoc = function() { 
  this.stack_ =[]; 
  this.ignoring_ = false; 
}; 
goog.string.html.HtmlSanitizer.prototype.endDoc = function() { 
  for(var i = this.stack_.length; -- i >= 0;) { 
    this.stringBuffer_.append('</', this.stack_[i], '>'); 
  } 
  this.stack_.length = 0; 
}; 
goog.string.html.HtmlSanitizer.prototype.escapeAttrib_ = function(s) { 
  return s.replace(goog.string.html.HtmlParser.AMP_RE_, '&amp;').replace(goog.string.html.HtmlParser.LT_RE_, '&lt;').replace(goog.string.html.HtmlParser.GT_RE_, '&gt;').replace(goog.string.html.HtmlParser.QUOTE_RE_, '&#34;').replace(goog.string.html.HtmlParser.EQUALS_RE_, '&#61;'); 
}; 
goog.string.html.HtmlSanitizer.prototype.sanitizeAttributes_ = function(tagName, attribs) { 
  for(var i = 0; i < attribs.length; i += 2) { 
    var attribName = attribs[i]; 
    var value = attribs[i + 1]; 
    var atype = null, attribKey; 
    if((attribKey = tagName + '::' + attribName, goog.string.html.HtmlSanitizer.Attributes.hasOwnProperty(attribKey)) ||(attribKey = '*::' + attribName, goog.string.html.HtmlSanitizer.Attributes.hasOwnProperty(attribKey))) { 
      atype = goog.string.html.HtmlSanitizer.Attributes[attribKey]; 
    } 
    if(atype !== null) { 
      switch(atype) { 
        case 0: 
          break; 

        case goog.string.html.HtmlSanitizer.AttributeType.SCRIPT: 
        case goog.string.html.HtmlSanitizer.AttributeType.STYLE: 
          value = null; 
          break; 

        case goog.string.html.HtmlSanitizer.AttributeType.ID: 
        case goog.string.html.HtmlSanitizer.AttributeType.IDREF: 
        case goog.string.html.HtmlSanitizer.AttributeType.IDREFS: 
        case goog.string.html.HtmlSanitizer.AttributeType.GLOBAL_NAME: 
        case goog.string.html.HtmlSanitizer.AttributeType.LOCAL_NAME: 
        case goog.string.html.HtmlSanitizer.AttributeType.CLASSES: 
          value = this.nmTokenPolicy_ ? this.nmTokenPolicy_((value)): value; 
          break; 

        case goog.string.html.HtmlSanitizer.AttributeType.URI: 
          value = this.urlPolicy_ && this.urlPolicy_((value)); 
          break; 

        case goog.string.html.HtmlSanitizer.AttributeType.URI_FRAGMENT: 
          if(value && '#' === value.charAt(0)) { 
            value = this.nmTokenPolicy_ ? this.nmTokenPolicy_(value): value; 
            if(value) { 
              value = '#' + value; 
            } 
          } else { 
            value = null; 
          } 
          break; 

        default: 
          value = null; 
          break; 

      } 
    } else { 
      value = null; 
    } 
    attribs[i + 1]= value; 
  } 
  return attribs; 
}; 
