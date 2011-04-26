
goog.provide('goog.format.JsonPrettyPrinter'); 
goog.provide('goog.format.JsonPrettyPrinter.HtmlDelimiters'); 
goog.provide('goog.format.JsonPrettyPrinter.TextDelimiters'); 
goog.require('goog.json'); 
goog.require('goog.json.Serializer'); 
goog.require('goog.string'); 
goog.require('goog.string.StringBuffer'); 
goog.require('goog.string.format'); 
goog.format.JsonPrettyPrinter = function(delimiters) { 
  this.delimiters_ = delimiters || new goog.format.JsonPrettyPrinter.TextDelimiters(); 
  this.jsonSerializer_ = new goog.json.Serializer(); 
}; 
goog.format.JsonPrettyPrinter.prototype.format = function(json) { 
  if(! goog.isDefAndNotNull(json)) { 
    return ''; 
  } 
  if(goog.isString(json)) { 
    if(goog.string.isEmpty(json)) { 
      return ''; 
    } 
    json = goog.json.parse(json); 
  } 
  var outputBuffer = new goog.string.StringBuffer(); 
  this.printObject_(json, outputBuffer, 0); 
  return outputBuffer.toString(); 
}; 
goog.format.JsonPrettyPrinter.prototype.printObject_ = function(val, outputBuffer, indent) { 
  var typeOf = goog.typeOf(val); 
  switch(typeOf) { 
    case 'null': 
    case 'boolean': 
    case 'number': 
    case 'string': 
      this.printValue_((val), typeOf, outputBuffer); 
      break; 

    case 'array': 
      outputBuffer.append(this.delimiters_.arrayStart); 
      var i = 0; 
      for(i = 0; i < val.length; i ++) { 
        if(i > 0) { 
          outputBuffer.append(this.delimiters_.propertySeparator); 
        } 
        outputBuffer.append(this.delimiters_.lineBreak); 
        this.printSpaces_(indent + this.delimiters_.indent, outputBuffer); 
        this.printObject_(val[i], outputBuffer, indent + this.delimiters_.indent); 
      } 
      if(i > 0) { 
        outputBuffer.append(this.delimiters_.lineBreak); 
        this.printSpaces_(indent, outputBuffer); 
      } 
      outputBuffer.append(this.delimiters_.arrayEnd); 
      break; 

    case 'object': 
      outputBuffer.append(this.delimiters_.objectStart); 
      var propertyCount = 0; 
      for(var name in val) { 
        if(! val.hasOwnProperty(name)) { 
          continue; 
        } 
        if(propertyCount > 0) { 
          outputBuffer.append(this.delimiters_.propertySeparator); 
        } 
        outputBuffer.append(this.delimiters_.lineBreak); 
        this.printSpaces_(indent + this.delimiters_.indent, outputBuffer); 
        this.printName_(name, outputBuffer); 
        outputBuffer.append(this.delimiters_.nameValueSeparator, this.delimiters_.space); 
        this.printObject_(val[name], outputBuffer, indent + this.delimiters_.indent); 
        propertyCount ++; 
      } 
      if(propertyCount > 0) { 
        outputBuffer.append(this.delimiters_.lineBreak); 
        this.printSpaces_(indent, outputBuffer); 
      } 
      outputBuffer.append(this.delimiters_.objectEnd); 
      break; 

    default: 
      this.printValue_('', 'unknown', outputBuffer); 

  } 
}; 
goog.format.JsonPrettyPrinter.prototype.printName_ = function(name, outputBuffer) { 
  outputBuffer.append(this.delimiters_.preName, this.jsonSerializer_.serialize(name), this.delimiters_.postName); 
}; 
goog.format.JsonPrettyPrinter.prototype.printValue_ = function(val, typeOf, outputBuffer) { 
  outputBuffer.append(goog.string.format(this.delimiters_.preValue, typeOf), this.jsonSerializer_.serialize(val), goog.string.format(this.delimiters_.postValue, typeOf)); 
}; 
goog.format.JsonPrettyPrinter.prototype.printSpaces_ = function(indent, outputBuffer) { 
  outputBuffer.append(goog.string.repeat(this.delimiters_.space, indent)); 
}; 
goog.format.JsonPrettyPrinter.TextDelimiters = function() { }; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.space = ' '; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.lineBreak = '\n'; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.objectStart = '{'; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.objectEnd = '}'; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.arrayStart = '['; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.arrayEnd = ']'; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.propertySeparator = ','; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.nameValueSeparator = ':'; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.preName = ''; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.postName = ''; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.preValue = ''; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.postValue = ''; 
goog.format.JsonPrettyPrinter.TextDelimiters.prototype.indent = 2; 
goog.format.JsonPrettyPrinter.HtmlDelimiters = function() { 
  goog.format.JsonPrettyPrinter.TextDelimiters.call(this); 
}; 
goog.inherits(goog.format.JsonPrettyPrinter.HtmlDelimiters, goog.format.JsonPrettyPrinter.TextDelimiters); 
goog.format.JsonPrettyPrinter.HtmlDelimiters.prototype.preName = '<span class="goog-jsonprettyprinter-propertyname">'; 
goog.format.JsonPrettyPrinter.HtmlDelimiters.prototype.postName = '</span>'; 
goog.format.JsonPrettyPrinter.HtmlDelimiters.prototype.preValue = '<span class="goog-jsonprettyprinter-propertyvalue-%s">'; 
goog.format.JsonPrettyPrinter.HtmlDelimiters.prototype.postValue = '</span>'; 
