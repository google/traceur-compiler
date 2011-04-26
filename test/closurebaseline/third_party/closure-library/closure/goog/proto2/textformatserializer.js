
goog.provide('goog.proto2.TextFormatSerializer'); 
goog.provide('goog.proto2.TextFormatSerializer.Parser'); 
goog.require('goog.json'); 
goog.require('goog.proto2.Serializer'); 
goog.require('goog.proto2.Util'); 
goog.require('goog.string'); 
goog.proto2.TextFormatSerializer = function(opt_ignoreMissingFields) { 
  this.ignoreMissingFields_ = ! ! opt_ignoreMissingFields; 
}; 
goog.inherits(goog.proto2.TextFormatSerializer, goog.proto2.Serializer); 
goog.proto2.TextFormatSerializer.prototype.deserializeTo = function(message, data) { 
  var descriptor = message.getDescriptor(); 
  var textData = data.toString(); 
  var parser = new goog.proto2.TextFormatSerializer.Parser(); 
  if(! parser.parse(message, textData, this.ignoreMissingFields_)) { 
    return parser.getError(); 
  } 
  return null; 
}; 
goog.proto2.TextFormatSerializer.prototype.serialize = function(message) { 
  var printer = new goog.proto2.TextFormatSerializer.Printer_(); 
  this.serializeMessage_(message, printer); 
  return printer.toString(); 
}; 
goog.proto2.TextFormatSerializer.prototype.serializeMessage_ = function(message, printer) { 
  var descriptor = message.getDescriptor(); 
  var fields = descriptor.getFields(); 
  goog.array.forEach(fields, function(field) { 
    this.printField_(message, field, printer); 
  }, this); 
  message.forEachUnknown(function(tag, value) { 
    if(! value) { 
      return; 
    } 
    printer.append(tag); 
    if(goog.typeOf(value) == 'object') { 
      printer.append(' {'); 
      printer.appendLine(); 
      printer.indent(); 
    } else { 
      printer.append(': '); 
    } 
    switch(goog.typeOf(value)) { 
      case 'string': 
        value = goog.string.quote(value); 
        printer.append(value); 
        break; 

      case 'object': 
        this.serializeMessage_(value, printer); 
        break; 

      default: 
        printer.append(value.toString()); 
        break; 

    } 
    if(goog.typeOf(value) == 'object') { 
      printer.dedent(); 
      printer.append('}'); 
    } else { 
      printer.appendLine(); 
    } 
  }, this); 
}; 
goog.proto2.TextFormatSerializer.prototype.printFieldValue_ = function(value, field, printer) { 
  switch(field.getFieldType()) { 
    case goog.proto2.FieldDescriptor.FieldType.DOUBLE: 
    case goog.proto2.FieldDescriptor.FieldType.FLOAT: 
    case goog.proto2.FieldDescriptor.FieldType.INT64: 
    case goog.proto2.FieldDescriptor.FieldType.UINT64: 
    case goog.proto2.FieldDescriptor.FieldType.INT32: 
    case goog.proto2.FieldDescriptor.FieldType.UINT32: 
    case goog.proto2.FieldDescriptor.FieldType.FIXED64: 
    case goog.proto2.FieldDescriptor.FieldType.FIXED32: 
    case goog.proto2.FieldDescriptor.FieldType.BOOL: 
    case goog.proto2.FieldDescriptor.FieldType.SFIXED32: 
    case goog.proto2.FieldDescriptor.FieldType.SFIXED64: 
    case goog.proto2.FieldDescriptor.FieldType.SINT32: 
    case goog.proto2.FieldDescriptor.FieldType.SINT64: 
      printer.append(value); 
      break; 

    case goog.proto2.FieldDescriptor.FieldType.BYTES: 
    case goog.proto2.FieldDescriptor.FieldType.STRING: 
      value = goog.string.quote(value.toString()); 
      printer.append(value); 
      break; 

    case goog.proto2.FieldDescriptor.FieldType.ENUM: 
      var found = false; 
      goog.object.forEach(field.getNativeType(), function(eValue, key) { 
        if(eValue == value) { 
          printer.append(key); 
          found = true; 
        } 
      }); 
      if(! found) { 
        printer.append(value.toString()); 
      } 
      break; 

    case goog.proto2.FieldDescriptor.FieldType.GROUP: 
    case goog.proto2.FieldDescriptor.FieldType.MESSAGE: 
      this.serializeMessage_((value), printer); 
      break; 

  } 
}; 
goog.proto2.TextFormatSerializer.prototype.printField_ = function(message, field, printer) { 
  if(! message.has(field)) { 
    return; 
  } 
  var count = message.countOf(field); 
  for(var i = 0; i < count; ++ i) { 
    printer.append(field.getName()); 
    if(field.getFieldType() == goog.proto2.FieldDescriptor.FieldType.MESSAGE || field.getFieldType() == goog.proto2.FieldDescriptor.FieldType.GROUP) { 
      printer.append(' {'); 
      printer.appendLine(); 
      printer.indent(); 
    } else { 
      printer.append(': '); 
    } 
    this.printFieldValue_(message.get(field, i), field, printer); 
    if(field.getFieldType() == goog.proto2.FieldDescriptor.FieldType.MESSAGE || field.getFieldType() == goog.proto2.FieldDescriptor.FieldType.GROUP) { 
      printer.dedent(); 
      printer.append('}'); 
      printer.appendLine(); 
    } else { 
      printer.appendLine(); 
    } 
  } 
}; 
goog.proto2.TextFormatSerializer.Printer_ = function() { 
  this.indentation_ = 0; 
  this.buffer_ =[]; 
  this.requiresIndentation_ = true; 
}; 
goog.proto2.TextFormatSerializer.Printer_.prototype.toString = function() { 
  return this.buffer_.join(''); 
}; 
goog.proto2.TextFormatSerializer.Printer_.prototype.indent = function() { 
  this.indentation_ += 2; 
}; 
goog.proto2.TextFormatSerializer.Printer_.prototype.dedent = function() { 
  this.indentation_ -= 2; 
  goog.asserts.assert(this.indentation_ >= 0); 
}; 
goog.proto2.TextFormatSerializer.Printer_.prototype.append = function(value) { 
  if(this.requiresIndentation_) { 
    for(var i = 0; i < this.indentation_; ++ i) { 
      this.buffer_.push(' '); 
    } 
    this.requiresIndentation_ = false; 
  } 
  this.buffer_.push(value.toString()); 
}; 
goog.proto2.TextFormatSerializer.Printer_.prototype.appendLine = function() { 
  this.buffer_.push('\n'); 
  this.requiresIndentation_ = true; 
}; 
goog.proto2.TextFormatSerializer.Tokenizer_ = function(data, opt_ignoreWhitespace) { 
  this.ignoreWhitespace_ = ! ! opt_ignoreWhitespace; 
  this.data_ = data; 
  this.index_ = 0; 
  this.currentData_ = data; 
  this.current_ = { 
    type: goog.proto2.TextFormatSerializer.Tokenizer_.TokenTypes.END, 
    value: null 
  }; 
}; 
goog.proto2.TextFormatSerializer.Tokenizer_.Token; 
goog.proto2.TextFormatSerializer.Tokenizer_.prototype.getCurrent = function() { 
  return this.current_; 
}; 
goog.proto2.TextFormatSerializer.Tokenizer_.TokenTypes = { 
  END: /---end---/, 
  IDENTIFIER: /^[a-zA-Z][a-zA-Z0-9_]*/, 
  NUMBER: /^(0x[0-9a-f]+)|(([-])?[0-9][0-9]*(\.?[0-9]+)?([f])?)/, 
  COMMENT: /^#.*/, 
  OPEN_BRACE: /^{/, 
  CLOSE_BRACE: /^}/, 
  OPEN_TAG: /^</, 
  CLOSE_TAG: /^>/, 
  OPEN_LIST: /^\[/, 
  CLOSE_LIST: /^\]/, 
  STRING: new RegExp('^"([^"\\\\]|\\\\.)*"'), 
  COLON: /^:/, 
  COMMA: /^,/, 
  SEMI: /^;/, 
  WHITESPACE: /^\s/ 
}; 
goog.proto2.TextFormatSerializer.Tokenizer_.prototype.next = function() { 
  var types = goog.proto2.TextFormatSerializer.Tokenizer_.TokenTypes; 
  while(this.nextInternal_()) { 
    if(this.getCurrent().type != types.WHITESPACE || ! this.ignoreWhitespace_) { 
      return true; 
    } 
  } 
  this.current_ = { 
    type: goog.proto2.TextFormatSerializer.Tokenizer_.TokenTypes.END, 
    value: null 
  }; 
  return false; 
}; 
goog.proto2.TextFormatSerializer.Tokenizer_.prototype.nextInternal_ = function() { 
  if(this.index_ >= this.data_.length) { 
    return false; 
  } 
  var data = this.currentData_; 
  var types = goog.proto2.TextFormatSerializer.Tokenizer_.TokenTypes; 
  var next = null; 
  goog.object.forEach(types, function(type, id) { 
    if(next || type == types.END) { 
      return; 
    } 
    var info = type.exec(data); 
    if(info && info.index == 0) { 
      next = { 
        type: type, 
        value: info[0]
      }; 
    } 
  }); 
  if(next) { 
    this.current_ =(next); 
    this.index_ += next.value.length; 
    this.currentData_ = this.currentData_.substring(next.value.length); 
  } 
  return ! ! next; 
}; 
goog.proto2.TextFormatSerializer.Parser = function() { 
  this.error_ = null; 
  this.tokenizer_ = null; 
  this.ignoreMissingFields_ = false; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.parse = function(message, data, opt_ignoreMissingFields) { 
  this.error_ = null; 
  this.ignoreMissingFields_ = ! ! opt_ignoreMissingFields; 
  this.tokenizer_ = new goog.proto2.TextFormatSerializer.Tokenizer_(data, true); 
  this.tokenizer_.next(); 
  return this.consumeMessage_(message, ''); 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.getError = function() { 
  return this.error_; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.reportError_ = function(msg) { 
  this.error_ = msg; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.consumeMessage_ = function(message, delimiter) { 
  var types = goog.proto2.TextFormatSerializer.Tokenizer_.TokenTypes; 
  while(! this.lookingAt_('>') && ! this.lookingAt_('}') && ! this.lookingAtType_(types.END)) { 
    if(! this.consumeField_(message)) { 
      return false; 
    } 
  } 
  if(delimiter) { 
    if(! this.consume_(delimiter)) { 
      return false; 
    } 
  } else { 
    if(! this.lookingAtType_(types.END)) { 
      this.reportError_('Expected END token'); 
    } 
  } 
  return true; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.consumeFieldValue_ = function(message, field) { 
  var value = this.getFieldValue_(field); 
  if(goog.isNull(value)) { 
    return false; 
  } 
  if(field.isRepeated()) { 
    message.add(field, value); 
  } else { 
    message.set(field, value); 
  } 
  return true; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.getNumberFromString_ = function(num) { 
  var numberString = num; 
  var numberBase = 10; 
  if(num.substr(0, 2) == '0x') { 
    numberString = num.substr(2); 
    numberBase = 16; 
  } else if(goog.string.endsWith(num, 'f')) { 
    numberString = num.substring(0, num.length - 1); 
  } 
  var actualNumber = numberBase == 10 ? parseFloat(numberString): parseInt(numberString, numberBase); 
  if(actualNumber.toString(numberBase) != numberString) { 
    this.reportError_('Unknown number: ' + num); 
    return null; 
  } 
  return actualNumber; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.getFieldValue_ = function(field) { 
  var types = goog.proto2.TextFormatSerializer.Tokenizer_.TokenTypes; 
  switch(field.getFieldType()) { 
    case goog.proto2.FieldDescriptor.FieldType.DOUBLE: 
    case goog.proto2.FieldDescriptor.FieldType.FLOAT: 
    case goog.proto2.FieldDescriptor.FieldType.INT32: 
    case goog.proto2.FieldDescriptor.FieldType.UINT32: 
    case goog.proto2.FieldDescriptor.FieldType.FIXED32: 
    case goog.proto2.FieldDescriptor.FieldType.SFIXED32: 
    case goog.proto2.FieldDescriptor.FieldType.SINT32: 
      var num = this.consumeNumber_(); 
      if(! num) { 
        return null; 
      } 
      return this.getNumberFromString_(num); 

    case goog.proto2.FieldDescriptor.FieldType.INT64: 
    case goog.proto2.FieldDescriptor.FieldType.UINT64: 
    case goog.proto2.FieldDescriptor.FieldType.FIXED64: 
    case goog.proto2.FieldDescriptor.FieldType.SFIXED64: 
    case goog.proto2.FieldDescriptor.FieldType.SINT64: 
      var num = this.consumeNumber_(); 
      if(! num) { 
        return null; 
      } 
      if(field.getNativeType() == Number) { 
        return this.getNumberFromString_(num); 
      } 
      return num; 

    case goog.proto2.FieldDescriptor.FieldType.BOOL: 
      var ident = this.consumeIdentifier_(); 
      if(! ident) { 
        return null; 
      } 
      switch(ident) { 
        case 'true': 
          return true; 

        case 'false': 
          return false; 

        default: 
          this.reportError_('Unknown type for bool: ' + ident); 
          return null; 

      } 

    case goog.proto2.FieldDescriptor.FieldType.ENUM: 
      if(this.lookingAtType_(types.NUMBER)) { 
        return this.consumeNumber_(); 
      } else { 
        var name = this.consumeIdentifier_(); 
        if(! name) { 
          return null; 
        } 
        var enumValue = field.getNativeType()[name]; 
        if(! enumValue) { 
          this.reportError_('Unknown enum value: ' + name); 
          return null; 
        } 
        return enumValue; 
      } 

    case goog.proto2.FieldDescriptor.FieldType.BYTES: 
    case goog.proto2.FieldDescriptor.FieldType.STRING: 
      return this.consumeString_(); 

  } 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.consumeNestedMessage_ = function(message, field) { 
  var delimiter = ''; 
  if(this.tryConsume_('<')) { 
    delimiter = '>'; 
  } else { 
    if(! this.consume_('{')) { 
      return false; 
    } 
    delimiter = '}'; 
  } 
  var msg = field.getFieldMessageType().createMessageInstance(); 
  var result = this.consumeMessage_(msg, delimiter); 
  if(! result) { 
    return false; 
  } 
  if(field.isRepeated()) { 
    message.add(field, msg); 
  } else { 
    message.set(field, msg); 
  } 
  return true; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.consumeUnknownFieldValue_ = function() { 
  this.tryConsume_(':'); 
  if(this.tryConsume_('[')) { 
    while(true) { 
      this.tokenizer_.next(); 
      if(this.tryConsume_(']')) { 
        break; 
      } 
      if(! this.consume_(',')) { 
        return false; 
      } 
    } 
    return true; 
  } 
  if(this.tryConsume_('<')) { 
    return this.consumeMessage_(null, '>'); 
  } else if(this.tryConsume_('{')) { 
    return this.consumeMessage_(null, '}'); 
  } else { 
    this.tokenizer_.next(); 
  } 
  return true; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.consumeField_ = function(message) { 
  var fieldName = this.consumeIdentifier_(); 
  if(! fieldName) { 
    this.reportError_('Missing field name'); 
    return false; 
  } 
  var field = null; 
  if(message) { 
    field = message.getDescriptor().findFieldByName(fieldName.toString()); 
  } 
  if(field == null) { 
    if(this.ignoreMissingFields_) { 
      return this.consumeUnknownFieldValue_(); 
    } else { 
      this.reportError_('Unknown field: ' + fieldName); 
      return false; 
    } 
  } 
  if(field.getFieldType() == goog.proto2.FieldDescriptor.FieldType.MESSAGE || field.getFieldType() == goog.proto2.FieldDescriptor.FieldType.GROUP) { 
    this.tryConsume_(':'); 
    if(! this.consumeNestedMessage_(message, field)) { 
      return false; 
    } 
  } else { 
    if(! this.consume_(':')) { 
      return false; 
    } 
    if(field.isRepeated() && this.tryConsume_('[')) { 
      while(true) { 
        if(! this.consumeFieldValue_(message, field)) { 
          return false; 
        } 
        if(this.tryConsume_(']')) { 
          break; 
        } 
        if(! this.consume_(',')) { 
          return false; 
        } 
      } 
    } else { 
      if(! this.consumeFieldValue_(message, field)) { 
        return false; 
      } 
    } 
  } 
  this.tryConsume_(',') || this.tryConsume_(';'); 
  return true; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.tryConsume_ = function(value) { 
  if(this.lookingAt_(value)) { 
    this.tokenizer_.next(); 
    return true; 
  } 
  return false; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.consumeToken_ = function(type) { 
  var types = goog.proto2.TextFormatSerializer.Tokenizer_.TokenTypes; 
  if(! this.lookingAtType_(type)) { 
    this.reportError_('Expected token type: ' + type); 
    return null; 
  } 
  var value = this.tokenizer_.getCurrent().value; 
  this.tokenizer_.next(); 
  return value; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.consumeIdentifier_ = function() { 
  var types = goog.proto2.TextFormatSerializer.Tokenizer_.TokenTypes; 
  return this.consumeToken_(types.IDENTIFIER); 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.consumeNumber_ = function() { 
  var types = goog.proto2.TextFormatSerializer.Tokenizer_.TokenTypes; 
  return this.consumeToken_(types.NUMBER); 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.consumeString_ = function() { 
  var types = goog.proto2.TextFormatSerializer.Tokenizer_.TokenTypes; 
  var value = this.consumeToken_(types.STRING); 
  if(! value) { 
    return null; 
  } 
  return goog.json.parse(value).toString(); 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.consume_ = function(value) { 
  if(! this.tryConsume_(value)) { 
    this.reportError_('Expected token "' + value + '"'); 
    return false; 
  } 
  return true; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.lookingAt_ = function(value) { 
  return this.tokenizer_.getCurrent().value == value; 
}; 
goog.proto2.TextFormatSerializer.Parser.prototype.lookingAtType_ = function(type) { 
  return this.tokenizer_.getCurrent().type == type; 
}; 
