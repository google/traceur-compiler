
var $__465 = function(value) { 
  if(value == null) throw TypeError(); 
  return Object(value); 
}, $__466 = function(items) { 
  var retval =[]; 
  var k = 0; 
  for(var i = 0; i < items.length; i += 2) { 
    var value = items[i + 1]; 
    if(items[i]) { 
      value = $__465(value); 
      for(var j = 0; j < value.length; j ++) { 
        retval[k ++]= value[j]; 
      } 
    } else { 
      retval[k ++]= value; 
    } 
  } 
  return retval; 
}; 
(function(global, factory) { 
  if(typeof exports === 'object') { 
    module.exports = factory(); 
  } else if(typeof define === 'function' && define.amd) { 
    define([], factory); 
  } else { 
    var sourceMapModule = global.sourceMapModule = global.sourceMapModule || { }; 
    sourceMapModule['array-set']= factory(); 
  } 
}(this, function() { 
  function ArraySet() { 
    this._array =[]; 
    this._set = { }; 
  } 
  ArraySet.fromArray = function ArraySet_fromArray(aArray) { 
    var set = new ArraySet(); 
    for(var i = 0, len = aArray.length; i < len; i ++) { 
      set.add(aArray[i]); 
    } 
    return set; 
  }; 
  ArraySet.prototype.add = function ArraySet_add(aStr) { 
    if(this.has(aStr)) { 
      return; 
    } 
    var idx = this._array.length; 
    this._array.push(aStr); 
    this._set[aStr]= idx; 
  }; 
  ArraySet.prototype.has = function ArraySet_has(aStr) { 
    return Object.prototype.hasOwnProperty.call(this._set, aStr); 
  }; 
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) { 
    if(this.has(aStr)) { 
      return this._set[aStr]; 
    } 
    throw new Error('"' + aStr + '" is not in the set.'); 
  }; 
  ArraySet.prototype.at = function ArraySet_at(aIdx) { 
    if(aIdx >= 0 && aIdx < this._array.length) { 
      return this._array[aIdx]; 
    } 
    throw new Error('No element indexed by ' + aIdx); 
  }; 
  ArraySet.prototype.toArray = function ArraySet_toArray() { 
    return this._array.slice(); 
  }; 
  return ArraySet; 
})); 
(function(global, factory) { 
  if(typeof exports === 'object') { 
    module.exports = factory(); 
  } else if(typeof define === 'function' && define.amd) { 
    define([], factory); 
  } else { 
    var sourceMapModule = global.sourceMapModule = global.sourceMapModule || { }; 
    sourceMapModule.base64 = factory(); 
  } 
}(this, function() { 
  var exports = { }; 
  var charToIntMap = { }; 
  var intToCharMap = { }; 
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('').forEach(function(ch, index) { 
    charToIntMap[ch]= index; 
    intToCharMap[index]= ch; 
  }); 
  exports.encode = function base64_encode(aNumber) { 
    if(aNumber in intToCharMap) { 
      return intToCharMap[aNumber]; 
    } 
    throw new TypeError("Must be between 0 and 63: " + aNumber); 
  }; 
  exports.decode = function base64_decode(aChar) { 
    if(aChar in charToIntMap) { 
      return charToIntMap[aChar]; 
    } 
    throw new TypeError("Not a valid base 64 digit: " + aChar); 
  }; 
  return exports; 
})); 
(function(global, factory) { 
  if(typeof exports === 'object') { 
    var base64 = require('./base64'); 
    module.exports = factory(base64); 
  } else if(typeof define === 'function' && define.amd) { 
    define(['source-map/base64'], factory); 
  } else { 
    var sourceMapModule = global.sourceMapModule = global.sourceMapModule || { }; 
    sourceMapModule['base64-vlq']= factory(sourceMapModule.base64); 
  } 
}(this, function(base64) { 
  var exports = { }; 
  var VLQ_BASE_SHIFT = 5; 
  var VLQ_BASE = 1 << VLQ_BASE_SHIFT; 
  var VLQ_BASE_MASK = VLQ_BASE - 1; 
  var VLQ_CONTINUATION_BIT = VLQ_BASE; 
  function toVLQSigned(aValue) { 
    return aValue < 0 ?((- aValue) << 1) + 1:(aValue << 1) + 0; 
  } 
  function fromVLQSigned(aValue) { 
    var isNegative =(aValue & 1) === 1; 
    var shifted = aValue >> 1; 
    return isNegative ? - shifted: shifted; 
  } 
  exports.encode = function base64VLQ_encode(aValue) { 
    var encoded = ""; 
    var digit; 
    var vlq = toVLQSigned(aValue); 
    do { 
      digit = vlq & VLQ_BASE_MASK; 
      vlq >>>= VLQ_BASE_SHIFT; 
      if(vlq > 0) { 
        digit |= VLQ_CONTINUATION_BIT; 
      } 
      encoded += base64.encode(digit); 
    } while(vlq > 0); 
    return encoded; 
  }; 
  exports.decode = function base64VLQ_decode(aStr) { 
    var i = 0; 
    var strLen = aStr.length; 
    var result = 0; 
    var shift = 0; 
    var continuation, digit; 
    do { 
      if(i >= strLen) { 
        throw new Error("Expected more digits in base 64 VLQ value."); 
      } 
      digit = base64.decode(aStr.charAt(i ++)); 
      continuation = ! !(digit & VLQ_CONTINUATION_BIT); 
      digit &= VLQ_BASE_MASK; 
      result = result +(digit << shift); 
      shift += VLQ_BASE_SHIFT; 
    } while(continuation); 
    return { 
      value: fromVLQSigned(result), 
      rest: aStr.slice(i) 
    }; 
  }; 
  return exports; 
})); 
(function(global, factory) { 
  if(typeof exports === 'object') { 
    module.exports = factory(); 
  } else if(typeof define === 'function' && define.amd) { 
    define([], factory); 
  } else { 
    var sourceMapModule = global.sourceMapModule = global.sourceMapModule || { }; 
    sourceMapModule['binary-search']= factory(); 
  } 
}(this, function() { 
  var exports = { }; 
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) { 
    var mid = Math.floor((aHigh - aLow) / 2) + aLow; 
    var cmp = aCompare(aNeedle, aHaystack[mid]); 
    if(cmp === 0) { 
      return aHaystack[mid]; 
    } else if(cmp > 0) { 
      if(aHigh - mid > 1) { 
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare); 
      } 
      return aHaystack[mid]; 
    } else { 
      if(mid - aLow > 1) { 
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare); 
      } 
      return aLow < 0 ? null: aHaystack[aLow]; 
    } 
  } 
  exports.search = function search(aNeedle, aHaystack, aCompare) { 
    return aHaystack.length > 0 ? recursiveSearch(- 1, aHaystack.length, aNeedle, aHaystack, aCompare): null; 
  }; 
  return exports; 
})); 
(function(global, factory) { 
  if(typeof exports === 'object') { 
    module.exports = factory(); 
  } else if(typeof define === 'function' && define.amd) { 
    define([], factory); 
  } else { 
    var sourceMapModule = global.sourceMapModule = global.sourceMapModule || { }; 
    sourceMapModule['util']= factory(); 
  } 
}(this, function() { 
  var exports = { }; 
  function getArg(aArgs, aName, aDefaultValue) { 
    if(aName in aArgs) { 
      return aArgs[aName]; 
    } else if(arguments.length === 3) { 
      return aDefaultValue; 
    } else { 
      throw new Error('"' + aName + '" is a required argument.'); 
    } 
  } 
  exports.getArg = getArg; 
  function join(aRoot, aPath) { 
    return aPath.charAt(0) === '/' ? aPath: aRoot.replace(/\/*$/, '') + '/' + aPath; 
  } 
  exports.join = join; 
  return exports; 
})); 
(function(global, factory) { 
  if(typeof exports === 'object') { 
    var base64VLQ = require('./base64-vlq'); 
    var util = require('./util'); 
    var ArraySet = require('./array-set').ArraySet; 
    module.exports = factory(base64VLQ, util, ArraySet); 
  } else if(typeof define === 'function' && define.amd) { 
    define(['source-map/base64-vlq', 'source-map/util', 'source-map/array-set'], factory); 
  } else { 
    var sourceMapModule = global.sourceMapModule = global.sourceMapModule || { }; 
    var base64VLQ = sourceMapModule['base64-vlq']; 
    var util = sourceMapModule['util']; 
    var ArraySet = sourceMapModule['array-set']; 
    sourceMapModule['source-map-generator']= factory(base64VLQ, util, ArraySet); 
  } 
}(this, function(base64VLQ, util, ArraySet) { 
  function SourceMapGenerator(aArgs) { 
    this._file = util.getArg(aArgs, 'file'); 
    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null); 
    this._sources = new ArraySet(); 
    this._names = new ArraySet(); 
    this._mappings =[]; 
  } 
  SourceMapGenerator.prototype._version = 3; 
  SourceMapGenerator.prototype.addMapping = function SourceMapGenerator_addMapping(aArgs) { 
    var generated = util.getArg(aArgs, 'generated'); 
    var original = util.getArg(aArgs, 'original', null); 
    var source = util.getArg(aArgs, 'source', null); 
    var name = util.getArg(aArgs, 'name', null); 
    this._validateMapping(generated, original, source, name); 
    if(source && ! this._sources.has(source)) { 
      this._sources.add(source); 
    } 
    if(name && ! this._names.has(name)) { 
      this._names.add(name); 
    } 
    this._mappings.push({ 
      generated: generated, 
      original: original, 
      source: source, 
      name: name 
    }); 
  }; 
  SourceMapGenerator.prototype._validateMapping = function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource, aName) { 
    if(aGenerated && 'line' in aGenerated && 'column' in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && ! aOriginal && ! aSource && ! aName) { 
      return; 
    } else if(aGenerated && 'line' in aGenerated && 'column' in aGenerated && aOriginal && 'line' in aOriginal && 'column' in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) { 
      return; 
    } else { 
      throw new Error('Invalid mapping.'); 
    } 
  }; 
  SourceMapGenerator.prototype._serializeMappings = function SourceMapGenerator_serializeMappings() { 
    var previousGeneratedColumn = 0; 
    var previousGeneratedLine = 1; 
    var previousOriginalColumn = 0; 
    var previousOriginalLine = 0; 
    var previousName = 0; 
    var previousSource = 0; 
    var result = ''; 
    var mapping; 
    this._mappings.sort(function(mappingA, mappingB) { 
      var cmp = mappingA.generated.line - mappingB.generated.line; 
      return cmp === 0 ? mappingA.generated.column - mappingB.generated.column: cmp; 
    }); 
    for(var i = 0, len = this._mappings.length; i < len; i ++) { 
      mapping = this._mappings[i]; 
      if(mapping.generated.line !== previousGeneratedLine) { 
        previousGeneratedColumn = 0; 
        while(mapping.generated.line !== previousGeneratedLine) { 
          result += ';'; 
          previousGeneratedLine ++; 
        } 
      } else { 
        if(i > 0) { 
          result += ','; 
        } 
      } 
      result += base64VLQ.encode(mapping.generated.column - previousGeneratedColumn); 
      previousGeneratedColumn = mapping.generated.column; 
      if(mapping.source && mapping.original) { 
        result += base64VLQ.encode(this._sources.indexOf(mapping.source) - previousSource); 
        previousSource = this._sources.indexOf(mapping.source); 
        result += base64VLQ.encode(mapping.original.line - 1 - previousOriginalLine); 
        previousOriginalLine = mapping.original.line - 1; 
        result += base64VLQ.encode(mapping.original.column - previousOriginalColumn); 
        previousOriginalColumn = mapping.original.column; 
        if(mapping.name) { 
          result += base64VLQ.encode(this._names.indexOf(mapping.name) - previousName); 
          previousName = this._names.indexOf(mapping.name); 
        } 
      } 
    } 
    return result; 
  }; 
  SourceMapGenerator.prototype.toString = function SourceMapGenerator_toString() { 
    var map = { 
      version: this._version, 
      file: this._file, 
      sources: this._sources.toArray(), 
      names: this._names.toArray(), 
      mappings: this._serializeMappings() 
    }; 
    if(this._sourceRoot) { 
      map.sourceRoot = this._sourceRoot; 
    } 
    return JSON.stringify(map); 
  }; 
  return SourceMapGenerator; 
})); 
(function(global, factory) { 
  if(typeof exports === 'object') { 
    var util = require('./util'); 
    var binarySearch = require('./binary-search'); 
    var ArraySet = require('./array-set').ArraySet; 
    var base64VLQ = require('./base64-vlq'); 
    module.exports = factory(util, binarySearch, ArraySet, base64VLQ); 
  } else if(typeof define === 'function' && define.amd) { 
    define(['source-map/util', 'source-map/binary-search', 'source-map/array-set', 'source-map/base64-vlq'], factory); 
  } else { 
    var sourceMapModule = global.sourceMapModule = global.sourceMapModule || { }; 
    var util = sourceMapModule['util']; 
    var binarySearch = sourceMapModule['binary-search']; 
    var ArraySet = sourceMapModule['array-set']; 
    var base64VLQ = sourceMapModule['base64-vlq']; 
    sourceMapModule['source-map-consumer']= factory(util, binarySearch, ArraySet, base64VLQ); 
  } 
}(this, function(util, binarySearch, ArraySet, base64VLQ) { 
  function SourceMapConsumer(aSourceMap) { 
    var sourceMap = aSourceMap; 
    if(typeof aSourceMap === 'string') { 
      sourceMap = JSON.parse(aSourceMap); 
    } 
    var version = util.getArg(sourceMap, 'version'); 
    var sources = util.getArg(sourceMap, 'sources'); 
    var names = util.getArg(sourceMap, 'names'); 
    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null); 
    var mappings = util.getArg(sourceMap, 'mappings'); 
    var file = util.getArg(sourceMap, 'file'); 
    if(version !== this._version) { 
      throw new Error('Unsupported version: ' + version); 
    } 
    this._names = ArraySet.fromArray(names); 
    this._sources = ArraySet.fromArray(sources); 
    this._generatedMappings =[]; 
    this._parseMappings(mappings, sourceRoot); 
  } 
  SourceMapConsumer.prototype._version = 3; 
  SourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) { 
    var generatedLine = 1; 
    var previousGeneratedColumn = 0; 
    var previousOriginalLine = 0; 
    var previousOriginalColumn = 0; 
    var previousSource = 0; 
    var previousName = 0; 
    var mappingSeparator = /^[,;]/; 
    var str = aStr; 
    var mapping; 
    var temp; 
    while(str.length > 0) { 
      if(str.charAt(0) === ';') { 
        generatedLine ++; 
        str = str.slice(1); 
        previousGeneratedColumn = 0; 
      } else if(str.charAt(0) === ',') { 
        str = str.slice(1); 
      } else { 
        mapping = { }; 
        mapping.generatedLine = generatedLine; 
        temp = base64VLQ.decode(str); 
        mapping.generatedColumn = previousGeneratedColumn + temp.value; 
        previousGeneratedColumn = mapping.generatedColumn; 
        str = temp.rest; 
        if(str.length > 0 && ! mappingSeparator.test(str.charAt(0))) { 
          temp = base64VLQ.decode(str); 
          if(aSourceRoot) { 
            mapping.source = util.join(aSourceRoot, this._sources.at(previousSource + temp.value)); 
          } else { 
            mapping.source = this._sources.at(previousSource + temp.value); 
          } 
          previousSource += temp.value; 
          str = temp.rest; 
          if(str.length === 0 || mappingSeparator.test(str.charAt(0))) { 
            throw new Error('Found a source, but no line and column'); 
          } 
          temp = base64VLQ.decode(str); 
          mapping.originalLine = previousOriginalLine + temp.value; 
          previousOriginalLine = mapping.originalLine; 
          mapping.originalLine += 1; 
          str = temp.rest; 
          if(str.length === 0 || mappingSeparator.test(str.charAt(0))) { 
            throw new Error('Found a source and line, but no column'); 
          } 
          temp = base64VLQ.decode(str); 
          mapping.originalColumn = previousOriginalColumn + temp.value; 
          previousOriginalColumn = mapping.originalColumn; 
          str = temp.rest; 
          if(str.length > 0 && ! mappingSeparator.test(str.charAt(0))) { 
            temp = base64VLQ.decode(str); 
            mapping.name = this._names.at(previousName + temp.value); 
            previousName += temp.value; 
            str = temp.rest; 
          } 
        } 
        this._generatedMappings.push(mapping); 
      } 
    } 
  }; 
  SourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) { 
    function compare(mappingA, mappingB) { 
      var cmp = mappingA.generatedLine - mappingB.generatedLine; 
      return cmp === 0 ? mappingA.generatedColumn - mappingB.generatedColumn: cmp; 
    } 
    var needle = { 
      generatedLine: util.getArg(aArgs, 'line'), 
      generatedColumn: util.getArg(aArgs, 'column') 
    }; 
    if(needle.generatedLine <= 0) { 
      throw new TypeError('Line must be greater than or equal to 1.'); 
    } 
    if(needle.generatedColumn < 0) { 
      throw new TypeError('Column must be greater than or equal to 0.'); 
    } 
    var mapping = binarySearch.search(needle, this._generatedMappings, compare); 
    if(mapping) { 
      return { 
        source: util.getArg(mapping, 'source', null), 
        line: util.getArg(mapping, 'originalLine', null), 
        column: util.getArg(mapping, 'originalColumn', null), 
        name: util.getArg(mapping, 'name', null) 
      }; 
    } 
    return { 
      source: null, 
      line: null, 
      column: null, 
      name: null 
    }; 
  }; 
  return SourceMapConsumer; 
})); 
(function(global, factory) { 
  if(typeof exports === 'object') { 
    var SourceMapGenerator = require('./source-map-generator'); 
    module.exports = factory(SourceMapGenerator); 
  } else if(typeof define === 'function' && define.amd) { 
    define(['source-map/source-map-generator'], factory); 
  } else { 
    var sourceMapModule = global.sourceMapModule = global.sourceMapModule || { }; 
    var SourceMapGenerator = sourceMapModule['source-map-generator']; 
    sourceMapModule['source-node']= factory(SourceMapGenerator); 
  } 
}(this, function(SourceMapGenerator) { 
  function SourceNode(aLine, aColumn, aSource, aChunks) { 
    this.children =[]; 
    this.line = aLine; 
    this.column = aColumn; 
    this.source = aSource; 
    if(aChunks) this.add(aChunks); 
  } 
  SourceNode.prototype.add = function SourceNode_add(aChunk) { 
    if(Array.isArray(aChunk)) { 
      aChunk.forEach(function(chunk) { 
        this.add(chunk); 
      }, this); 
    } else if(aChunk instanceof SourceNode || typeof aChunk === "string") { 
      this.children.push(aChunk); 
    } else { 
      throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk); 
    } 
    return this; 
  }; 
  SourceNode.prototype.walk = function SourceNode_walk(aFn) { 
    this.children.forEach(function(chunk) { 
      if(chunk instanceof SourceNode) { 
        chunk.walk(aFn); 
      } else { 
        if(chunk !== '') { 
          aFn(chunk, { 
            source: this.source, 
            line: this.line, 
            column: this.column 
          }); 
        } 
      } 
    }, this); 
  }; 
  SourceNode.prototype.join = function SourceNode_join(aSep) { 
    var newChildren; 
    var i; 
    var len = this.children.length; 
    if(len > 0) { 
      newChildren =[]; 
      for(i = 0; i < len - 1; i ++) { 
        newChildren.push(this.children[i]); 
        newChildren.push(aSep); 
      } 
      newChildren.push(this.children[i]); 
      this.children = newChildren; 
    } 
    return this; 
  }; 
  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) { 
    var lastChild = this.children[this.children.length - 1]; 
    if(lastChild instanceof SourceNode) { 
      lastChild.replaceRight(aPattern, aReplacement); 
    } else if(typeof lastChild === 'string') { 
      this.children[this.children.lenth - 1]= lastChild.replace(aPattern, aReplacement); 
    } else { 
      this.children.push(''.replace(aPattern, aReplacement)); 
    } 
    return this; 
  }; 
  SourceNode.prototype.toString = function SourceNode_toString() { 
    var str = ""; 
    this.walk(function(chunk) { 
      str += chunk; 
    }); 
    return str; 
  }; 
  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) { 
    var generated = { 
      code: "", 
      line: 1, 
      column: 0 
    }; 
    var map = new SourceMapGenerator(aArgs); 
    this.walk(function(chunk, original) { 
      generated.code += chunk; 
      if(original.source !== null && original.line !== null && original.column !== null) { 
        map.addMapping({ 
          source: original.source, 
          original: { 
            line: original.line, 
            column: original.column 
          }, 
          generated: { 
            line: generated.line, 
            column: generated.column 
          } 
        }); 
      } 
      chunk.split('').forEach(function(char) { 
        if(char === '\n') { 
          generated.line ++; 
          generated.column = 0; 
        } else { 
          generated.column ++; 
        } 
      }); 
    }); 
    return { 
      code: generated.code, 
      map: map 
    }; 
  }; 
  return SourceNode; 
})); 
if(! this.traceur) this.traceur = { }; 
traceur.runtime =(function(global) { 
  'use strict'; 
  var $call = Function.prototype.call.bind(Function.prototype.call); 
  var $create = Object.create; 
  var $defineProperty = Object.defineProperty; 
  var $freeze = Object.freeze; 
  var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; 
  var $getOwnPropertyNames = Object.getOwnPropertyNames; 
  var $getPrototypeOf = Object.getPrototypeOf; 
  var $hasOwnProperty = Object.prototype.hasOwnProperty; 
  var bind = Function.prototype.bind; 
  function nonEnum(value) { 
    return { 
      configurable: true, 
      enumerable: false, 
      value: value, 
      writable: true 
    }; 
  } 
  var method = nonEnum; 
  Object.defineProperties(String.prototype, { 
    startsWith: method(function(s) { 
      return this.lastIndexOf(s, 0) === 0; 
    }), 
    endsWith: method(function(s) { 
      var t = String(s); 
      var l = this.length - t.length; 
      return l >= 0 && this.indexOf(t, l) === l; 
    }), 
    contains: method(function(s) { 
      return this.indexOf(s) !== - 1; 
    }), 
    toArray: method(function() { 
      return this.split(''); 
    }) 
  }); 
  $defineProperty(String, 'raw', { 
    value: function(callsite) { 
      var raw = callsite.raw; 
      var len = raw.length >>> 0; 
      if(len === 0) return ''; 
      var s = ''; 
      var i = 0; 
      while(true) { 
        s += raw[i]; 
        if(i + 1 === len) return s; 
        s += arguments[++ i]; 
      } 
    }, 
    configurable: true, 
    enumerable: false, 
    writable: true 
  }); 
  function createClass(proto, extendsExpr, hasConstructor, hasExtendsExpression) { 
    if(extendsExpr !== null && typeof extendsExpr !== 'function') throw new TypeError('Can only extend functions or null'); 
    var ctor; 
    if(extendsExpr === null && ! hasConstructor) ctor = function() { }; else ctor = proto.constructor; 
    var superPrototype; 
    if(! hasExtendsExpression) { 
      superPrototype = Object.prototype; 
    } else { 
      if(extendsExpr === null) { 
        superPrototype = null; 
      } else { 
        ctor.__proto__ = extendsExpr; 
        superPrototype = extendsExpr.prototype; 
      } 
    } 
    var descriptors = { }; 
    $getOwnPropertyNames(proto).forEach((function(name) { 
      descriptors[name]= $getOwnPropertyDescriptor(proto, name); 
    })); 
    descriptors.constructor.value = ctor; 
    descriptors.constructor.enumerable = false; 
    ctor.prototype = $create(superPrototype, descriptors); 
    return ctor; 
  } 
  function getDescriptor(ctor, name) { 
    var proto = $getPrototypeOf(ctor.prototype); 
    if(! proto) throw new TypeError('super is null'); 
    return $getPropertyDescriptor(proto, name); 
  } 
  function superCall(self, ctor, name, args) { 
    var descriptor = getDescriptor(ctor, name); 
    if(descriptor) { 
      if('value' in descriptor) return descriptor.value.apply(self, args); 
      if(descriptor.get) return descriptor.get.call(self).apply(self, args); 
    } 
    throw new TypeError("Object has no method '" + name + "'."); 
  } 
  function superGet(self, ctor, name) { 
    var descriptor = getDescriptor(ctor, name); 
    if(descriptor) { 
      if(descriptor.get) return descriptor.get.call(self); else if('value' in descriptor) return descriptor.value; 
    } 
    return undefined; 
  } 
  function superSet(self, ctor, name, value) { 
    var descriptor = getDescriptor(ctor, name); 
    if(descriptor && descriptor.set) { 
      descriptor.set.call(self, value); 
      return; 
    } 
    throw new TypeError("Object has no setter '" + name + "'."); 
  } 
  function markMethods(object, names) { 
    names.forEach((function(name) { 
      $defineProperty(object, name, { enumerable: false }); 
    })); 
    return object; 
  } 
  var counter = 0; 
  function newUniqueString() { 
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++ counter + '$__'; 
  } 
  var nameRe = /^__\$(?:\d+)\$(?:\d+)\$__$/; 
  var internalStringValueName = newUniqueString(); 
  function Name(string) { 
    if(! string) string = newUniqueString(); 
    $defineProperty(this, internalStringValueName, { value: newUniqueString() }); 
    function toString() { 
      return string; 
    } 
    $freeze(toString); 
    $freeze(toString.prototype); 
    var toStringDescr = method(toString); 
    $defineProperty(this, 'toString', toStringDescr); 
    this.public = $freeze($create(null, { toString: method($freeze(function toString() { 
        return string; 
      })) })); 
    $freeze(this.public.toString.prototype); 
    $freeze(this); 
  } 
  ; 
  $freeze(Name); 
  $freeze(Name.prototype); 
  function assertName(val) { 
    if(! NameModule.isName(val)) throw new TypeError(val + ' is not a Name'); 
    return val; 
  } 
  var elementDeleteName = new Name(); 
  var elementGetName = new Name(); 
  var elementSetName = new Name(); 
  var NameModule = $freeze({ 
    Name: function(str) { 
      return new Name(str); 
    }, 
    isName: function(x) { 
      return x instanceof Name; 
    }, 
    elementGet: elementGetName, 
    elementSet: elementSetName, 
    elementDelete: elementDeleteName 
  }); 
  var filter = Array.prototype.filter.call.bind(Array.prototype.filter); 
  function getOwnPropertyNames(object) { 
    return filter($getOwnPropertyNames(object), function(str) { 
      return ! nameRe.test(str); 
    }); 
  } 
  function hasOwnProperty(name) { 
    if(NameModule.isName(name) || nameRe.test(name)) return false; 
    return $hasOwnProperty.call(this, name); 
  } 
  function elementDelete(object, name) { 
    if(traceur.options.trapMemberLookup && hasPrivateNameProperty(object, elementDeleteName)) { 
      return getProperty(object, elementDeleteName).call(object, name); 
    } 
    return deleteProperty(object, name); 
  } 
  function elementGet(object, name) { 
    if(traceur.options.trapMemberLookup && hasPrivateNameProperty(object, elementGetName)) { 
      return getProperty(object, elementGetName).call(object, name); 
    } 
    return getProperty(object, name); 
  } 
  function elementHas(object, name) { 
    return has(object, name); 
  } 
  function elementSet(object, name, value) { 
    if(traceur.options.trapMemberLookup && hasPrivateNameProperty(object, elementSetName)) { 
      getProperty(object, elementSetName).call(object, name, value); 
    } else { 
      setProperty(object, name, value); 
    } 
    return value; 
  } 
  function assertNotName(s) { 
    if(nameRe.test(s)) throw Error('Invalid access to private name'); 
  } 
  function deleteProperty(object, name) { 
    if(NameModule.isName(name)) return delete object[name[internalStringValueName]]; 
    if(nameRe.test(name)) return true; 
    return delete object[name]; 
  } 
  function getProperty(object, name) { 
    if(NameModule.isName(name)) return object[name[internalStringValueName]]; 
    if(nameRe.test(name)) return undefined; 
    return object[name]; 
  } 
  function hasPrivateNameProperty(object, name) { 
    return name[internalStringValueName]in Object(object); 
  } 
  function has(object, name) { 
    if(NameModule.isName(name) || nameRe.test(name)) return false; 
    return name in Object(object); 
  } 
  function setProperty(object, name, value) { 
    if(NameModule.isName(name)) { 
      var descriptor = $getPropertyDescriptor(object,[name[internalStringValueName]]); 
      if(descriptor) object[name[internalStringValueName]]= value; else $defineProperty(object, name[internalStringValueName], nonEnum(value)); 
    } else { 
      assertNotName(name); 
      object[name]= value; 
    } 
  } 
  function defineProperty(object, name, descriptor) { 
    if(NameModule.isName(name)) { 
      if(descriptor.enumerable) { 
        descriptor = Object.create(descriptor, { enumerable: { value: false } }); 
      } 
      $defineProperty(object, name[internalStringValueName], descriptor); 
    } else { 
      assertNotName(name); 
      $defineProperty(object, name, descriptor); 
    } 
  } 
  function $getPropertyDescriptor(obj, name) { 
    while(obj !== null) { 
      var result = Object.getOwnPropertyDescriptor(obj, name); 
      if(result) return result; 
      obj = $getPrototypeOf(obj); 
    } 
    return undefined; 
  } 
  function getPropertyDescriptor(obj, name) { 
    if(NameModule.isName(name)) return undefined; 
    assertNotName(name); 
    return $getPropertyDescriptor(obj, name); 
  } 
  $defineProperty(Object, 'defineProperty', { value: defineProperty }); 
  $defineProperty(Object, 'deleteProperty', method(deleteProperty)); 
  $defineProperty(Object, 'getOwnPropertyNames', { value: getOwnPropertyNames }); 
  $defineProperty(Object, 'getProperty', method(getProperty)); 
  $defineProperty(Object, 'getPropertyDescriptor', method(getPropertyDescriptor)); 
  $defineProperty(Object, 'has', method(has)); 
  $defineProperty(Object, 'setProperty', method(setProperty)); 
  $defineProperty(Object.prototype, 'hasOwnProperty', { value: hasOwnProperty }); 
  function is(left, right) { 
    if(left === right) return left !== 0 || 1 / left === 1 / right; 
    return left !== left && right !== right; 
  } 
  function isnt(left, right) { 
    return ! is(left, right); 
  } 
  $defineProperty(Object, 'is', method(is)); 
  var iteratorName = new Name('iterator'); 
  var generatorName = new Name('generator'); 
  var IterModule = { get iterator() { 
      return iteratorName; 
    } }; 
  function getIterator(collection) { 
    if(getProperty(collection, generatorName)) return collection; 
    return getProperty(collection, iteratorName).call(collection); 
  } 
  function markAsGenerator(object) { 
    setProperty(object, generatorName, true); 
  } 
  defineProperty(Array.prototype, IterModule.iterator, method(function() { 
    var index = 0; 
    var array = this; 
    var current; 
    return { 
      get current() { 
        return current; 
      }, 
      moveNext: function() { 
        if(index < array.length) { 
          current = array[index ++]; 
          return true; 
        } 
        return false; 
      } 
    }; 
  })); 
  function Deferred(canceller) { 
    this.canceller_ = canceller; 
    this.listeners_ =[]; 
  } 
  function notify(self) { 
    while(self.listeners_.length > 0) { 
      var current = self.listeners_.shift(); 
      var currentResult = undefined; 
      try { 
        try { 
          if(self.result_[1]) { 
            if(current.errback) currentResult = current.errback.call(undefined, self.result_[0]); 
          } else { 
            if(current.callback) currentResult = current.callback.call(undefined, self.result_[0]); 
          } 
          current.deferred.callback(currentResult); 
        } catch(err) { 
          current.deferred.errback(err); 
        } 
      } catch(unused) { } 
    } 
  } 
  function fire(self, value, isError) { 
    if(self.fired_) throw new Error('already fired'); 
    self.fired_ = true; 
    self.result_ =[value, isError]; 
    notify(self); 
  } 
  Deferred.prototype = { 
    fired_: false, 
    result_: undefined, 
    createPromise: function() { 
      return { 
        then: this.then.bind(this), 
        cancel: this.cancel.bind(this) 
      }; 
    }, 
    callback: function(value) { 
      fire(this, value, false); 
    }, 
    errback: function(err) { 
      fire(this, err, true); 
    }, 
    then: function(callback, errback) { 
      var result = new Deferred(this.cancel.bind(this)); 
      this.listeners_.push({ 
        deferred: result, 
        callback: callback, 
        errback: errback 
      }); 
      if(this.fired_) notify(this); 
      return result.createPromise(); 
    }, 
    cancel: function() { 
      if(this.fired_) throw new Error('already finished'); 
      var result; 
      if(this.canceller_) { 
        result = this.canceller_(this); 
        if(! result instanceof Error) result = new Error(result); 
      } else { 
        result = new Error('cancelled'); 
      } 
      if(! this.fired_) { 
        this.result_ =[result, true]; 
        notify(this); 
      } 
    } 
  }; 
  var modules = $freeze({ 
    get '@name'() { 
      return NameModule; 
    }, 
    get '@iter'() { 
      return IterModule; 
    } 
  }); 
  global.Deferred = Deferred; 
  return { 
    Deferred: Deferred, 
    assertName: assertName, 
    createClass: createClass, 
    createName: NameModule.Name, 
    deleteProperty: deleteProperty, 
    elementDelete: elementDelete, 
    elementGet: elementGet, 
    elementHas: elementHas, 
    elementSet: elementSet, 
    getIterator: getIterator, 
    getProperty: getProperty, 
    has: has, 
    is: is, 
    isnt: isnt, 
    markAsGenerator: markAsGenerator, 
    markMethods: markMethods, 
    modules: modules, 
    setProperty: setProperty, 
    superCall: superCall, 
    superGet: superGet, 
    superSet: superSet 
  }; 
})(this); 
var $src_options_js =(function() { 
  "use strict"; 
  var Kind = { 
    es6: 'es6', 
    es6proposal: 'es6proposal', 
    harmony: 'harmony', 
    experimental: 'experimental' 
  }; 
  var kindMapping = Object.create(null); 
  Object.keys(Kind).forEach((function(kind) { 
    kindMapping[kind]= Object.create(null); 
  })); 
  function enable(kind, b) { 
    Object.keys(kindMapping[kind]).forEach((function(name) { 
      options[name]= b; 
    })); 
  } 
  function getValue(kind) { 
    var value; 
    Object.keys(kindMapping[kind]).every((function(name) { 
      var currentValue = options[name]; 
      if(value === undefined) { 
        value = currentValue; 
        return true; 
      } 
      if(currentValue !== value) { 
        value = null; 
        return false; 
      } 
      return true; 
    })); 
    return value; 
  } 
  var parseOptions = Object.create(null); 
  var transformOptions = Object.create(null); 
  var defaultValues = Object.create(null); 
  var options = { 
    set es6(v) { 
      enable(Kind.es6, coerceOptionValue(v)); 
    }, 
    get es6() { 
      return getValue(Kind.es6); 
    }, 
    set es6proposal(v) { 
      enable(Kind.es6proposal, coerceOptionValue(v)); 
    }, 
    get es6proposal() { 
      return getValue(Kind.es6proposal); 
    }, 
    set harmony(v) { 
      enable(Kind.harmony, coerceOptionValue(v)); 
    }, 
    get harmony() { 
      return getValue(Kind.harmony); 
    }, 
    set experimental(v) { 
      enable(Kind.experimental, coerceOptionValue(v)); 
    }, 
    get experimental() { 
      return getValue(Kind.experimental); 
    } 
  }; 
  function reset(opt_allOff) { 
    var useDefault = opt_allOff === undefined; 
    Object.keys(options).forEach((function(name) { 
      options[name]= useDefault && defaultValues[name]; 
    })); 
  } 
  function fromString(s) { 
    fromArgv(s.split(/\s+/)); 
  } 
  function fromArgv(args) { 
    args.forEach(parseCommand); 
  } 
  function setFromObject(object) { 
    Object.keys(object).forEach((function(name) { 
      options[name]= object[name]; 
    })); 
  } 
  function coerceOptionValue(v) { 
    switch(v) { 
      case 'false': 
        return false; 

      case 'parse': 
        return 'parse'; 

      default: 
        return true; 

    } 
  } 
  function setOption(name, value) { 
    name = toCamelCase(name); 
    value = coerceOptionValue(value); 
    if(name in options) { 
      options[name]= value; 
    } else { 
      throw Error('Unknown option: ' + name); 
    } 
  } 
  function optionCallback(name, value) { 
    setOption(name, value); 
  } 
  function addOptions(flags) { 
    Object.keys(options).forEach(function(name) { 
      var dashedName = toDashCase(name); 
      if((name in parseOptions) &&(name in transformOptions)) flags.option('--' + dashedName + ' [true|false|parse]'); else flags.option('--' + dashedName + ' [true|false]'); 
      flags.on(dashedName, optionCallback.bind(null, dashedName)); 
    }); 
  } 
  Object.defineProperties(options, { 
    parse: { value: parseOptions }, 
    transform: { value: transformOptions }, 
    reset: { value: reset }, 
    fromString: { value: fromString }, 
    fromArgv: { value: fromArgv }, 
    setFromObject: { value: setFromObject }, 
    addOptions: { value: addOptions } 
  }); 
  function parseCommand(s) { 
    var re = /--([^=]+)(?:=(.+))?/; 
    var m = re.exec(s); 
    if(m) setOption(m[1], m[2]); 
  } 
  function toCamelCase(s) { 
    return s.replace(/-\w/g, function(ch) { 
      return ch[1].toUpperCase(); 
    }); 
  } 
  function toDashCase(s) { 
    return s.replace(/[A-W]/g, function(ch) { 
      return '-' + ch.toLowerCase(); 
    }); 
  } 
  function addFeatureOption(name, kind) { 
    kindMapping[kind][name]= true; 
    Object.defineProperty(options, name, { 
      get: function() { 
        if(parseOptions[name]=== transformOptions[name]) { 
          return parseOptions[name]; 
        } 
        return 'parse'; 
      }, 
      set: function(v) { 
        if(v === 'parse') { 
          parseOptions[name]= true; 
          transformOptions[name]= false; 
        } else { 
          parseOptions[name]= transformOptions[name]= Boolean(v); 
        } 
      }, 
      enumerable: true, 
      configurable: true 
    }); 
    var defaultValue = kind !== Kind.experimental; 
    defaultValues[name]= defaultValue; 
    parseOptions[name]= defaultValue; 
    transformOptions[name]= defaultValue; 
  } 
  function addBoolOption(name) { 
    defaultValues[name]= true; 
    options[name]= true; 
  } 
  addFeatureOption('arrayComprehension', Kind.es6); 
  addFeatureOption('arrowFunctions', Kind.es6); 
  addFeatureOption('blockBinding', Kind.es6); 
  addFeatureOption('classes', Kind.es6); 
  addFeatureOption('defaultParameters', Kind.es6); 
  addFeatureOption('destructuring', Kind.es6); 
  addFeatureOption('forOf', Kind.es6); 
  addFeatureOption('isExpression', Kind.es6); 
  addFeatureOption('propertyMethods', Kind.es6); 
  addFeatureOption('propertyNameShorthand', Kind.es6); 
  addFeatureOption('quasi', Kind.es6); 
  addFeatureOption('restParameters', Kind.es6); 
  addFeatureOption('spread', Kind.es6); 
  addFeatureOption('generatorComprehension', Kind.es6proposal); 
  addFeatureOption('generators', Kind.es6proposal); 
  addFeatureOption('modules', Kind.es6proposal); 
  addFeatureOption('privateNameSyntax', Kind.es6proposal); 
  addFeatureOption('privateNames', Kind.es6proposal); 
  addFeatureOption('cascadeExpression', Kind.experimental); 
  addFeatureOption('trapMemberLookup', Kind.experimental); 
  addFeatureOption('deferredFunctions', Kind.experimental); 
  addFeatureOption('propertyOptionalComma', Kind.experimental); 
  addBoolOption('debug'); 
  addBoolOption('sourceMaps'); 
  addBoolOption('freeVariableChecker'); 
  addBoolOption('validate'); 
  return Object.preventExtensions(Object.create(null, { 
    parseOptions: { 
      get: function() { 
        return parseOptions; 
      }, 
      enumerable: true 
    }, 
    transformOptions: { 
      get: function() { 
        return transformOptions; 
      }, 
      enumerable: true 
    }, 
    options: { 
      get: function() { 
        return options; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var $src_util_util_js =(function() { 
  "use strict"; 
  function createObject(proto, obj) { 
    var newObject = Object.create(proto); 
    Object.getOwnPropertyNames(obj).forEach((function(name) { 
      Object.defineProperty(newObject, name, Object.getOwnPropertyDescriptor(obj, name)); 
    })); 
    return newObject; 
  } 
  return Object.preventExtensions(Object.create(null, { createObject: { 
      get: function() { 
        return createObject; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_semantics_symbols_SymbolType_js =(function() { 
  "use strict"; 
  var SymbolType = { 
    EXPORT: 'EXPORT', 
    MODULE: 'MODULE' 
  }; 
  return Object.preventExtensions(Object.create(null, { SymbolType: { 
      get: function() { 
        return SymbolType; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_semantics_symbols_Symbol_js =(function() { 
  "use strict"; 
  var $__1 = $src_semantics_symbols_SymbolType_js, SymbolType = $__1.SymbolType; 
  function Symbol(type, tree, name) { 
    this.type = type; 
    this.tree = tree; 
    this.name = name; 
  } 
  Symbol.prototype = { 
    asExport: function() { 
      traceur.assert(this.type == SymbolType.EXPORT); 
      return this; 
    }, 
    asModuleSymbol: function() { 
      traceur.assert(this.type == SymbolType.MODULE); 
      return this; 
    } 
  }; 
  return Object.preventExtensions(Object.create(null, { Symbol: { 
      get: function() { 
        return Symbol; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_semantics_symbols_ExportSymbol_js =(function() { 
  "use strict"; 
  var $__2 = $src_semantics_symbols_Symbol_js, Symbol = $__2.Symbol; 
  var $__3 = $src_semantics_symbols_SymbolType_js, SymbolType = $__3.SymbolType; 
  function ExportSymbol(tree, name, relatedTree) { 
    Symbol.call(this, SymbolType.EXPORT, tree, name); 
    this.relatedTree = relatedTree; 
  } 
  ExportSymbol.prototype = Object.create(Symbol.prototype); 
  return Object.preventExtensions(Object.create(null, { ExportSymbol: { 
      get: function() { 
        return ExportSymbol; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_trees_ParseTreeType_js =(function() { 
  "use strict"; 
  var ARGUMENT_LIST = 'ARGUMENT_LIST'; 
  var ARRAY_COMPREHENSION = 'ARRAY_COMPREHENSION'; 
  var ARRAY_LITERAL_EXPRESSION = 'ARRAY_LITERAL_EXPRESSION'; 
  var ARRAY_PATTERN = 'ARRAY_PATTERN'; 
  var ARROW_FUNCTION_EXPRESSION = 'ARROW_FUNCTION_EXPRESSION'; 
  var AT_NAME_EXPRESSION = 'AT_NAME_EXPRESSION'; 
  var AT_NAME_DECLARATION = 'AT_NAME_DECLARATION'; 
  var AWAIT_STATEMENT = 'AWAIT_STATEMENT'; 
  var BINARY_OPERATOR = 'BINARY_OPERATOR'; 
  var BIND_THIS_PARAMETER = 'BIND_THIS_PARAMETER'; 
  var BINDING_ELEMENT = 'BINDING_ELEMENT'; 
  var BINDING_IDENTIFIER = 'BINDING_IDENTIFIER'; 
  var BLOCK = 'BLOCK'; 
  var BREAK_STATEMENT = 'BREAK_STATEMENT'; 
  var CALL_EXPRESSION = 'CALL_EXPRESSION'; 
  var CASCADE_EXPRESSION = 'CASCADE_EXPRESSION'; 
  var CASE_CLAUSE = 'CASE_CLAUSE'; 
  var CATCH = 'CATCH'; 
  var CLASS_DECLARATION = 'CLASS_DECLARATION'; 
  var CLASS_EXPRESSION = 'CLASS_EXPRESSION'; 
  var COMMA_EXPRESSION = 'COMMA_EXPRESSION'; 
  var COMPREHENSION_FOR = 'COMPREHENSION_FOR'; 
  var CONDITIONAL_EXPRESSION = 'CONDITIONAL_EXPRESSION'; 
  var CONTINUE_STATEMENT = 'CONTINUE_STATEMENT'; 
  var DEBUGGER_STATEMENT = 'DEBUGGER_STATEMENT'; 
  var DEFAULT_CLAUSE = 'DEFAULT_CLAUSE'; 
  var DO_WHILE_STATEMENT = 'DO_WHILE_STATEMENT'; 
  var EMPTY_STATEMENT = 'EMPTY_STATEMENT'; 
  var EXPORT_DECLARATION = 'EXPORT_DECLARATION'; 
  var EXPORT_MAPPING_LIST = 'EXPORT_MAPPING_LIST'; 
  var EXPORT_MAPPING = 'EXPORT_MAPPING'; 
  var EXPORT_SPECIFIER = 'EXPORT_SPECIFIER'; 
  var EXPORT_SPECIFIER_SET = 'EXPORT_SPECIFIER_SET'; 
  var EXPRESSION_STATEMENT = 'EXPRESSION_STATEMENT'; 
  var FINALLY = 'FINALLY'; 
  var FOR_OF_STATEMENT = 'FOR_OF_STATEMENT'; 
  var FOR_IN_STATEMENT = 'FOR_IN_STATEMENT'; 
  var FORMAL_PARAMETER_LIST = 'FORMAL_PARAMETER_LIST'; 
  var FOR_STATEMENT = 'FOR_STATEMENT'; 
  var FUNCTION_DECLARATION = 'FUNCTION_DECLARATION'; 
  var GENERATOR_COMPREHENSION = 'GENERATOR_COMPREHENSION'; 
  var GET_ACCESSOR = 'GET_ACCESSOR'; 
  var IDENTIFIER_EXPRESSION = 'IDENTIFIER_EXPRESSION'; 
  var IF_STATEMENT = 'IF_STATEMENT'; 
  var IMPORT_DECLARATION = 'IMPORT_DECLARATION'; 
  var IMPORT_BINDING = 'IMPORT_BINDING'; 
  var IMPORT_SPECIFIER = 'IMPORT_SPECIFIER'; 
  var IMPORT_SPECIFIER_SET = 'IMPORT_SPECIFIER_SET'; 
  var LABELLED_STATEMENT = 'LABELLED_STATEMENT'; 
  var LITERAL_EXPRESSION = 'LITERAL_EXPRESSION'; 
  var MEMBER_EXPRESSION = 'MEMBER_EXPRESSION'; 
  var MEMBER_LOOKUP_EXPRESSION = 'MEMBER_LOOKUP_EXPRESSION'; 
  var MISSING_PRIMARY_EXPRESSION = 'MISSING_PRIMARY_EXPRESSION'; 
  var MODULE_DECLARATION = 'MODULE_DECLARATION'; 
  var MODULE_DEFINITION = 'MODULE_DEFINITION'; 
  var MODULE_EXPRESSION = 'MODULE_EXPRESSION'; 
  var MODULE_REQUIRE = 'MODULE_REQUIRE'; 
  var MODULE_SPECIFIER = 'MODULE_SPECIFIER'; 
  var NAME_STATEMENT = 'NAME_STATEMENT'; 
  var NEW_EXPRESSION = 'NEW_EXPRESSION'; 
  var NULL_TREE = 'NULL_TREE'; 
  var OBJECT_LITERAL_EXPRESSION = 'OBJECT_LITERAL_EXPRESSION'; 
  var OBJECT_PATTERN_FIELD = 'OBJECT_PATTERN_FIELD'; 
  var OBJECT_PATTERN = 'OBJECT_PATTERN'; 
  var PAREN_EXPRESSION = 'PAREN_EXPRESSION'; 
  var POSTFIX_EXPRESSION = 'POSTFIX_EXPRESSION'; 
  var PROGRAM = 'PROGRAM'; 
  var PROPERTY_METHOD_ASSIGNMENT = 'PROPERTY_METHOD_ASSIGNMENT'; 
  var PROPERTY_NAME_ASSIGNMENT = 'PROPERTY_NAME_ASSIGNMENT'; 
  var PROPERTY_NAME_SHORTHAND = 'PROPERTY_NAME_SHORTHAND'; 
  var QUASI_LITERAL_EXPRESSION = 'QUASI_LITERAL_EXPRESSION'; 
  var QUASI_LITERAL_PORTION = 'QUASI_LITERAL_PORTION'; 
  var QUASI_SUBSTITUTION = 'QUASI_SUBSTITUTION'; 
  var REQUIRES_MEMBER = 'REQUIRES_MEMBER'; 
  var REST_PARAMETER = 'REST_PARAMETER'; 
  var RETURN_STATEMENT = 'RETURN_STATEMENT'; 
  var SET_ACCESSOR = 'SET_ACCESSOR'; 
  var STATE_MACHINE = 'STATE_MACHINE'; 
  var SPREAD_EXPRESSION = 'SPREAD_EXPRESSION'; 
  var SPREAD_PATTERN_ELEMENT = 'SPREAD_PATTERN_ELEMENT'; 
  var SUPER_EXPRESSION = 'SUPER_EXPRESSION'; 
  var SWITCH_STATEMENT = 'SWITCH_STATEMENT'; 
  var THIS_EXPRESSION = 'THIS_EXPRESSION'; 
  var THROW_STATEMENT = 'THROW_STATEMENT'; 
  var TRY_STATEMENT = 'TRY_STATEMENT'; 
  var UNARY_EXPRESSION = 'UNARY_EXPRESSION'; 
  var VARIABLE_DECLARATION_LIST = 'VARIABLE_DECLARATION_LIST'; 
  var VARIABLE_DECLARATION = 'VARIABLE_DECLARATION'; 
  var VARIABLE_STATEMENT = 'VARIABLE_STATEMENT'; 
  var WHILE_STATEMENT = 'WHILE_STATEMENT'; 
  var WITH_STATEMENT = 'WITH_STATEMENT'; 
  var YIELD_STATEMENT = 'YIELD_STATEMENT'; 
  return Object.preventExtensions(Object.create(null, { 
    ARGUMENT_LIST: { 
      get: function() { 
        return ARGUMENT_LIST; 
      }, 
      enumerable: true 
    }, 
    ARRAY_COMPREHENSION: { 
      get: function() { 
        return ARRAY_COMPREHENSION; 
      }, 
      enumerable: true 
    }, 
    ARRAY_LITERAL_EXPRESSION: { 
      get: function() { 
        return ARRAY_LITERAL_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    ARRAY_PATTERN: { 
      get: function() { 
        return ARRAY_PATTERN; 
      }, 
      enumerable: true 
    }, 
    ARROW_FUNCTION_EXPRESSION: { 
      get: function() { 
        return ARROW_FUNCTION_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    AT_NAME_EXPRESSION: { 
      get: function() { 
        return AT_NAME_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    AT_NAME_DECLARATION: { 
      get: function() { 
        return AT_NAME_DECLARATION; 
      }, 
      enumerable: true 
    }, 
    AWAIT_STATEMENT: { 
      get: function() { 
        return AWAIT_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    BINARY_OPERATOR: { 
      get: function() { 
        return BINARY_OPERATOR; 
      }, 
      enumerable: true 
    }, 
    BIND_THIS_PARAMETER: { 
      get: function() { 
        return BIND_THIS_PARAMETER; 
      }, 
      enumerable: true 
    }, 
    BINDING_ELEMENT: { 
      get: function() { 
        return BINDING_ELEMENT; 
      }, 
      enumerable: true 
    }, 
    BINDING_IDENTIFIER: { 
      get: function() { 
        return BINDING_IDENTIFIER; 
      }, 
      enumerable: true 
    }, 
    BLOCK: { 
      get: function() { 
        return BLOCK; 
      }, 
      enumerable: true 
    }, 
    BREAK_STATEMENT: { 
      get: function() { 
        return BREAK_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    CALL_EXPRESSION: { 
      get: function() { 
        return CALL_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    CASCADE_EXPRESSION: { 
      get: function() { 
        return CASCADE_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    CASE_CLAUSE: { 
      get: function() { 
        return CASE_CLAUSE; 
      }, 
      enumerable: true 
    }, 
    CATCH: { 
      get: function() { 
        return CATCH; 
      }, 
      enumerable: true 
    }, 
    CLASS_DECLARATION: { 
      get: function() { 
        return CLASS_DECLARATION; 
      }, 
      enumerable: true 
    }, 
    CLASS_EXPRESSION: { 
      get: function() { 
        return CLASS_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    COMMA_EXPRESSION: { 
      get: function() { 
        return COMMA_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    COMPREHENSION_FOR: { 
      get: function() { 
        return COMPREHENSION_FOR; 
      }, 
      enumerable: true 
    }, 
    CONDITIONAL_EXPRESSION: { 
      get: function() { 
        return CONDITIONAL_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    CONTINUE_STATEMENT: { 
      get: function() { 
        return CONTINUE_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    DEBUGGER_STATEMENT: { 
      get: function() { 
        return DEBUGGER_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    DEFAULT_CLAUSE: { 
      get: function() { 
        return DEFAULT_CLAUSE; 
      }, 
      enumerable: true 
    }, 
    DO_WHILE_STATEMENT: { 
      get: function() { 
        return DO_WHILE_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    EMPTY_STATEMENT: { 
      get: function() { 
        return EMPTY_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    EXPORT_DECLARATION: { 
      get: function() { 
        return EXPORT_DECLARATION; 
      }, 
      enumerable: true 
    }, 
    EXPORT_MAPPING_LIST: { 
      get: function() { 
        return EXPORT_MAPPING_LIST; 
      }, 
      enumerable: true 
    }, 
    EXPORT_MAPPING: { 
      get: function() { 
        return EXPORT_MAPPING; 
      }, 
      enumerable: true 
    }, 
    EXPORT_SPECIFIER: { 
      get: function() { 
        return EXPORT_SPECIFIER; 
      }, 
      enumerable: true 
    }, 
    EXPORT_SPECIFIER_SET: { 
      get: function() { 
        return EXPORT_SPECIFIER_SET; 
      }, 
      enumerable: true 
    }, 
    EXPRESSION_STATEMENT: { 
      get: function() { 
        return EXPRESSION_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    FINALLY: { 
      get: function() { 
        return FINALLY; 
      }, 
      enumerable: true 
    }, 
    FOR_OF_STATEMENT: { 
      get: function() { 
        return FOR_OF_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    FOR_IN_STATEMENT: { 
      get: function() { 
        return FOR_IN_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    FORMAL_PARAMETER_LIST: { 
      get: function() { 
        return FORMAL_PARAMETER_LIST; 
      }, 
      enumerable: true 
    }, 
    FOR_STATEMENT: { 
      get: function() { 
        return FOR_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    FUNCTION_DECLARATION: { 
      get: function() { 
        return FUNCTION_DECLARATION; 
      }, 
      enumerable: true 
    }, 
    GENERATOR_COMPREHENSION: { 
      get: function() { 
        return GENERATOR_COMPREHENSION; 
      }, 
      enumerable: true 
    }, 
    GET_ACCESSOR: { 
      get: function() { 
        return GET_ACCESSOR; 
      }, 
      enumerable: true 
    }, 
    IDENTIFIER_EXPRESSION: { 
      get: function() { 
        return IDENTIFIER_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    IF_STATEMENT: { 
      get: function() { 
        return IF_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    IMPORT_DECLARATION: { 
      get: function() { 
        return IMPORT_DECLARATION; 
      }, 
      enumerable: true 
    }, 
    IMPORT_BINDING: { 
      get: function() { 
        return IMPORT_BINDING; 
      }, 
      enumerable: true 
    }, 
    IMPORT_SPECIFIER: { 
      get: function() { 
        return IMPORT_SPECIFIER; 
      }, 
      enumerable: true 
    }, 
    IMPORT_SPECIFIER_SET: { 
      get: function() { 
        return IMPORT_SPECIFIER_SET; 
      }, 
      enumerable: true 
    }, 
    LABELLED_STATEMENT: { 
      get: function() { 
        return LABELLED_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    LITERAL_EXPRESSION: { 
      get: function() { 
        return LITERAL_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    MEMBER_EXPRESSION: { 
      get: function() { 
        return MEMBER_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    MEMBER_LOOKUP_EXPRESSION: { 
      get: function() { 
        return MEMBER_LOOKUP_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    MISSING_PRIMARY_EXPRESSION: { 
      get: function() { 
        return MISSING_PRIMARY_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    MODULE_DECLARATION: { 
      get: function() { 
        return MODULE_DECLARATION; 
      }, 
      enumerable: true 
    }, 
    MODULE_DEFINITION: { 
      get: function() { 
        return MODULE_DEFINITION; 
      }, 
      enumerable: true 
    }, 
    MODULE_EXPRESSION: { 
      get: function() { 
        return MODULE_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    MODULE_REQUIRE: { 
      get: function() { 
        return MODULE_REQUIRE; 
      }, 
      enumerable: true 
    }, 
    MODULE_SPECIFIER: { 
      get: function() { 
        return MODULE_SPECIFIER; 
      }, 
      enumerable: true 
    }, 
    NAME_STATEMENT: { 
      get: function() { 
        return NAME_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    NEW_EXPRESSION: { 
      get: function() { 
        return NEW_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    NULL_TREE: { 
      get: function() { 
        return NULL_TREE; 
      }, 
      enumerable: true 
    }, 
    OBJECT_LITERAL_EXPRESSION: { 
      get: function() { 
        return OBJECT_LITERAL_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    OBJECT_PATTERN_FIELD: { 
      get: function() { 
        return OBJECT_PATTERN_FIELD; 
      }, 
      enumerable: true 
    }, 
    OBJECT_PATTERN: { 
      get: function() { 
        return OBJECT_PATTERN; 
      }, 
      enumerable: true 
    }, 
    PAREN_EXPRESSION: { 
      get: function() { 
        return PAREN_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    POSTFIX_EXPRESSION: { 
      get: function() { 
        return POSTFIX_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    PROGRAM: { 
      get: function() { 
        return PROGRAM; 
      }, 
      enumerable: true 
    }, 
    PROPERTY_METHOD_ASSIGNMENT: { 
      get: function() { 
        return PROPERTY_METHOD_ASSIGNMENT; 
      }, 
      enumerable: true 
    }, 
    PROPERTY_NAME_ASSIGNMENT: { 
      get: function() { 
        return PROPERTY_NAME_ASSIGNMENT; 
      }, 
      enumerable: true 
    }, 
    PROPERTY_NAME_SHORTHAND: { 
      get: function() { 
        return PROPERTY_NAME_SHORTHAND; 
      }, 
      enumerable: true 
    }, 
    QUASI_LITERAL_EXPRESSION: { 
      get: function() { 
        return QUASI_LITERAL_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    QUASI_LITERAL_PORTION: { 
      get: function() { 
        return QUASI_LITERAL_PORTION; 
      }, 
      enumerable: true 
    }, 
    QUASI_SUBSTITUTION: { 
      get: function() { 
        return QUASI_SUBSTITUTION; 
      }, 
      enumerable: true 
    }, 
    REQUIRES_MEMBER: { 
      get: function() { 
        return REQUIRES_MEMBER; 
      }, 
      enumerable: true 
    }, 
    REST_PARAMETER: { 
      get: function() { 
        return REST_PARAMETER; 
      }, 
      enumerable: true 
    }, 
    RETURN_STATEMENT: { 
      get: function() { 
        return RETURN_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    SET_ACCESSOR: { 
      get: function() { 
        return SET_ACCESSOR; 
      }, 
      enumerable: true 
    }, 
    STATE_MACHINE: { 
      get: function() { 
        return STATE_MACHINE; 
      }, 
      enumerable: true 
    }, 
    SPREAD_EXPRESSION: { 
      get: function() { 
        return SPREAD_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    SPREAD_PATTERN_ELEMENT: { 
      get: function() { 
        return SPREAD_PATTERN_ELEMENT; 
      }, 
      enumerable: true 
    }, 
    SUPER_EXPRESSION: { 
      get: function() { 
        return SUPER_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    SWITCH_STATEMENT: { 
      get: function() { 
        return SWITCH_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    THIS_EXPRESSION: { 
      get: function() { 
        return THIS_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    THROW_STATEMENT: { 
      get: function() { 
        return THROW_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    TRY_STATEMENT: { 
      get: function() { 
        return TRY_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    UNARY_EXPRESSION: { 
      get: function() { 
        return UNARY_EXPRESSION; 
      }, 
      enumerable: true 
    }, 
    VARIABLE_DECLARATION_LIST: { 
      get: function() { 
        return VARIABLE_DECLARATION_LIST; 
      }, 
      enumerable: true 
    }, 
    VARIABLE_DECLARATION: { 
      get: function() { 
        return VARIABLE_DECLARATION; 
      }, 
      enumerable: true 
    }, 
    VARIABLE_STATEMENT: { 
      get: function() { 
        return VARIABLE_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    WHILE_STATEMENT: { 
      get: function() { 
        return WHILE_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    WITH_STATEMENT: { 
      get: function() { 
        return WITH_STATEMENT; 
      }, 
      enumerable: true 
    }, 
    YIELD_STATEMENT: { 
      get: function() { 
        return YIELD_STATEMENT; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var $src_util_SourceRange_js =(function() { 
  "use strict"; 
  var SourceRange = traceur.runtime.createClass({ constructor: function(start, end) { 
      this.start = start; 
      this.end = end; 
    } }, null, true, false); 
  return Object.preventExtensions(Object.create(null, { SourceRange: { 
      get: function() { 
        return SourceRange; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_trees_ParseTree_js =(function() { 
  "use strict"; 
  var ParseTreeType = $src_syntax_trees_ParseTreeType_js; 
  var $__4 = $src_util_SourceRange_js, SourceRange = $__4.SourceRange; 
  var $__5 = ParseTreeType, ARGUMENT_LIST = $__5.ARGUMENT_LIST, ARRAY_COMPREHENSION = $__5.ARRAY_COMPREHENSION, ARRAY_LITERAL_EXPRESSION = $__5.ARRAY_LITERAL_EXPRESSION, ARRAY_PATTERN = $__5.ARRAY_PATTERN, ARROW_FUNCTION_EXPRESSION = $__5.ARROW_FUNCTION_EXPRESSION, AT_NAME_EXPRESSION = $__5.AT_NAME_EXPRESSION, AT_NAME_DECLARATION = $__5.AT_NAME_DECLARATION, AWAIT_STATEMENT = $__5.AWAIT_STATEMENT, BINARY_OPERATOR = $__5.BINARY_OPERATOR, BIND_THIS_PARAMETER = $__5.BIND_THIS_PARAMETER, BINDING_ELEMENT = $__5.BINDING_ELEMENT, BINDING_IDENTIFIER = $__5.BINDING_IDENTIFIER, BLOCK = $__5.BLOCK, BREAK_STATEMENT = $__5.BREAK_STATEMENT, CALL_EXPRESSION = $__5.CALL_EXPRESSION, CASCADE_EXPRESSION = $__5.CASCADE_EXPRESSION, CASE_CLAUSE = $__5.CASE_CLAUSE, CATCH = $__5.CATCH, CLASS_DECLARATION = $__5.CLASS_DECLARATION, CLASS_EXPRESSION = $__5.CLASS_EXPRESSION, COMMA_EXPRESSION = $__5.COMMA_EXPRESSION, COMPREHENSION_FOR = $__5.COMPREHENSION_FOR, CONDITIONAL_EXPRESSION = $__5.CONDITIONAL_EXPRESSION, CONTINUE_STATEMENT = $__5.CONTINUE_STATEMENT, DEBUGGER_STATEMENT = $__5.DEBUGGER_STATEMENT, DEFAULT_CLAUSE = $__5.DEFAULT_CLAUSE, DO_WHILE_STATEMENT = $__5.DO_WHILE_STATEMENT, EMPTY_STATEMENT = $__5.EMPTY_STATEMENT, EXPORT_DECLARATION = $__5.EXPORT_DECLARATION, EXPORT_MAPPING_LIST = $__5.EXPORT_MAPPING_LIST, EXPORT_MAPPING = $__5.EXPORT_MAPPING, EXPORT_SPECIFIER = $__5.EXPORT_SPECIFIER, EXPORT_SPECIFIER_SET = $__5.EXPORT_SPECIFIER_SET, EXPRESSION_STATEMENT = $__5.EXPRESSION_STATEMENT, FINALLY = $__5.FINALLY, FOR_OF_STATEMENT = $__5.FOR_OF_STATEMENT, FOR_IN_STATEMENT = $__5.FOR_IN_STATEMENT, FORMAL_PARAMETER_LIST = $__5.FORMAL_PARAMETER_LIST, FOR_STATEMENT = $__5.FOR_STATEMENT, FUNCTION_DECLARATION = $__5.FUNCTION_DECLARATION, GENERATOR_COMPREHENSION = $__5.GENERATOR_COMPREHENSION, GET_ACCESSOR = $__5.GET_ACCESSOR, IDENTIFIER_EXPRESSION = $__5.IDENTIFIER_EXPRESSION, IF_STATEMENT = $__5.IF_STATEMENT, IMPORT_DECLARATION = $__5.IMPORT_DECLARATION, IMPORT_BINDING = $__5.IMPORT_BINDING, IMPORT_SPECIFIER = $__5.IMPORT_SPECIFIER, IMPORT_SPECIFIER_SET = $__5.IMPORT_SPECIFIER_SET, LABELLED_STATEMENT = $__5.LABELLED_STATEMENT, LITERAL_EXPRESSION = $__5.LITERAL_EXPRESSION, MEMBER_EXPRESSION = $__5.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__5.MEMBER_LOOKUP_EXPRESSION, MISSING_PRIMARY_EXPRESSION = $__5.MISSING_PRIMARY_EXPRESSION, MODULE_DECLARATION = $__5.MODULE_DECLARATION, MODULE_DEFINITION = $__5.MODULE_DEFINITION, MODULE_EXPRESSION = $__5.MODULE_EXPRESSION, MODULE_REQUIRE = $__5.MODULE_REQUIRE, MODULE_SPECIFIER = $__5.MODULE_SPECIFIER, NAME_STATEMENT = $__5.NAME_STATEMENT, NEW_EXPRESSION = $__5.NEW_EXPRESSION, NULL_TREE = $__5.NULL_TREE, OBJECT_LITERAL_EXPRESSION = $__5.OBJECT_LITERAL_EXPRESSION, OBJECT_PATTERN_FIELD = $__5.OBJECT_PATTERN_FIELD, OBJECT_PATTERN = $__5.OBJECT_PATTERN, PAREN_EXPRESSION = $__5.PAREN_EXPRESSION, POSTFIX_EXPRESSION = $__5.POSTFIX_EXPRESSION, PROGRAM = $__5.PROGRAM, PROPERTY_METHOD_ASSIGNMENT = $__5.PROPERTY_METHOD_ASSIGNMENT, PROPERTY_NAME_ASSIGNMENT = $__5.PROPERTY_NAME_ASSIGNMENT, PROPERTY_NAME_SHORTHAND = $__5.PROPERTY_NAME_SHORTHAND, QUASI_LITERAL_EXPRESSION = $__5.QUASI_LITERAL_EXPRESSION, QUASI_LITERAL_PORTION = $__5.QUASI_LITERAL_PORTION, QUASI_SUBSTITUTION = $__5.QUASI_SUBSTITUTION, REQUIRES_MEMBER = $__5.REQUIRES_MEMBER, REST_PARAMETER = $__5.REST_PARAMETER, RETURN_STATEMENT = $__5.RETURN_STATEMENT, SET_ACCESSOR = $__5.SET_ACCESSOR, STATE_MACHINE = $__5.STATE_MACHINE, SPREAD_EXPRESSION = $__5.SPREAD_EXPRESSION, SPREAD_PATTERN_ELEMENT = $__5.SPREAD_PATTERN_ELEMENT, SUPER_EXPRESSION = $__5.SUPER_EXPRESSION, SWITCH_STATEMENT = $__5.SWITCH_STATEMENT, THIS_EXPRESSION = $__5.THIS_EXPRESSION, THROW_STATEMENT = $__5.THROW_STATEMENT, TRY_STATEMENT = $__5.TRY_STATEMENT, UNARY_EXPRESSION = $__5.UNARY_EXPRESSION, VARIABLE_DECLARATION_LIST = $__5.VARIABLE_DECLARATION_LIST, VARIABLE_DECLARATION = $__5.VARIABLE_DECLARATION, VARIABLE_STATEMENT = $__5.VARIABLE_STATEMENT, WHILE_STATEMENT = $__5.WHILE_STATEMENT, WITH_STATEMENT = $__5.WITH_STATEMENT, YIELD_STATEMENT = $__5.YIELD_STATEMENT; 
  var typeToNameMap = Object.create(null); 
  function getCapitalizedName(type) { 
    var name = type.toString(); 
    return('_' + name.toLowerCase()).replace(/_(\w)/g, function(_, c) { 
      return c.toUpperCase(); 
    }); 
  } 
  function getTreeNameForType(type) { 
    if(type in typeToNameMap) return typeToNameMap[type]; 
    var name = getCapitalizedName(type); 
    return typeToNameMap[type]= name; 
  } 
  var ParseTree = traceur.runtime.createClass({ 
    constructor: function(type, location) { 
      this.type = type; 
      this.location = location; 
    }, 
    isNull: function() { 
      return this.type === NULL_TREE; 
    }, 
    isPattern: function() { 
      switch(this.type) { 
        case ARRAY_PATTERN: 
        case OBJECT_PATTERN: 
          return true; 

        case PAREN_EXPRESSION: 
          return this.expression.isPattern(); 

        default: 
          return false; 

      } 
    }, 
    isLeftHandSideExpression: function() { 
      switch(this.type) { 
        case THIS_EXPRESSION: 
        case CLASS_EXPRESSION: 
        case SUPER_EXPRESSION: 
        case IDENTIFIER_EXPRESSION: 
        case LITERAL_EXPRESSION: 
        case ARRAY_LITERAL_EXPRESSION: 
        case OBJECT_LITERAL_EXPRESSION: 
        case NEW_EXPRESSION: 
        case MEMBER_EXPRESSION: 
        case MEMBER_LOOKUP_EXPRESSION: 
        case CALL_EXPRESSION: 
        case FUNCTION_DECLARATION: 
        case QUASI_LITERAL_EXPRESSION: 
          return true; 

        case PAREN_EXPRESSION: 
          return this.expression.isLeftHandSideExpression(); 

        default: 
          return false; 

      } 
    }, 
    isArrowFunctionExpression: function() { 
      switch(this.type) { 
        case ARRAY_COMPREHENSION: 
        case ARRAY_LITERAL_EXPRESSION: 
        case ARROW_FUNCTION_EXPRESSION: 
        case BINARY_OPERATOR: 
        case CALL_EXPRESSION: 
        case CASCADE_EXPRESSION: 
        case CLASS_EXPRESSION: 
        case CONDITIONAL_EXPRESSION: 
        case FUNCTION_DECLARATION: 
        case GENERATOR_COMPREHENSION: 
        case IDENTIFIER_EXPRESSION: 
        case LITERAL_EXPRESSION: 
        case MEMBER_EXPRESSION: 
        case MEMBER_LOOKUP_EXPRESSION: 
        case MISSING_PRIMARY_EXPRESSION: 
        case NEW_EXPRESSION: 
        case OBJECT_LITERAL_EXPRESSION: 
        case PAREN_EXPRESSION: 
        case POSTFIX_EXPRESSION: 
        case QUASI_LITERAL_EXPRESSION: 
        case SUPER_EXPRESSION: 
        case THIS_EXPRESSION: 
        case UNARY_EXPRESSION: 
        case AT_NAME_EXPRESSION: 
          return true; 

        default: 
          return false; 

      } 
    }, 
    isMemberExpression: function() { 
      switch(this.type) { 
        case THIS_EXPRESSION: 
        case CLASS_EXPRESSION: 
        case SUPER_EXPRESSION: 
        case IDENTIFIER_EXPRESSION: 
        case LITERAL_EXPRESSION: 
        case ARRAY_LITERAL_EXPRESSION: 
        case OBJECT_LITERAL_EXPRESSION: 
        case PAREN_EXPRESSION: 
        case QUASI_LITERAL_EXPRESSION: 
        case FUNCTION_DECLARATION: 
        case MEMBER_LOOKUP_EXPRESSION: 
        case MEMBER_EXPRESSION: 
        case CALL_EXPRESSION: 
        case CASCADE_EXPRESSION: 
          return true; 

        case NEW_EXPRESSION: 
          return this.args != null; 

      } 
      return false; 
    }, 
    isExpression: function() { 
      return this.isArrowFunctionExpression() || this.type == COMMA_EXPRESSION; 
    }, 
    isAssignmentOrSpread: function() { 
      return this.isArrowFunctionExpression() || this.type == SPREAD_EXPRESSION; 
    }, 
    isRestParameter: function() { 
      return this.type == REST_PARAMETER; 
    }, 
    isSpreadPatternElement: function() { 
      return this.type == SPREAD_PATTERN_ELEMENT; 
    }, 
    isStatement: function() { 
      return this.isSourceElement(); 
    }, 
    isStatementStandard: function() { 
      switch(this.type) { 
        case BLOCK: 
        case AWAIT_STATEMENT: 
        case VARIABLE_STATEMENT: 
        case EMPTY_STATEMENT: 
        case EXPRESSION_STATEMENT: 
        case IF_STATEMENT: 
        case DO_WHILE_STATEMENT: 
        case WHILE_STATEMENT: 
        case FOR_OF_STATEMENT: 
        case FOR_IN_STATEMENT: 
        case FOR_STATEMENT: 
        case CONTINUE_STATEMENT: 
        case BREAK_STATEMENT: 
        case RETURN_STATEMENT: 
        case YIELD_STATEMENT: 
        case WITH_STATEMENT: 
        case SWITCH_STATEMENT: 
        case LABELLED_STATEMENT: 
        case THROW_STATEMENT: 
        case TRY_STATEMENT: 
        case DEBUGGER_STATEMENT: 
          return true; 

        default: 
          return false; 

      } 
    }, 
    isSourceElement: function() { 
      switch(this.type) { 
        case FUNCTION_DECLARATION: 
        case CLASS_DECLARATION: 
        case NAME_STATEMENT: 
          return true; 

      } 
      return this.isStatementStandard(); 
    }, 
    isProgramElement: function() { 
      switch(this.type) { 
        case CLASS_DECLARATION: 
        case EXPORT_DECLARATION: 
        case FUNCTION_DECLARATION: 
        case IMPORT_DECLARATION: 
        case MODULE_DECLARATION: 
        case MODULE_DEFINITION: 
        case NAME_STATEMENT: 
        case VARIABLE_DECLARATION: 
          return true; 

      } 
      return this.isStatementStandard(); 
    } 
  }, null, true, false); 
  ParseTree.stripLocation = function(key, value) { 
    if(key === 'location') { 
      return undefined; 
    } 
    return value; 
  }; 
  return Object.preventExtensions(Object.create(null, { 
    ParseTreeType: { 
      get: function() { 
        return ParseTreeType; 
      }, 
      enumerable: true 
    }, 
    getTreeNameForType: { 
      get: function() { 
        return getTreeNameForType; 
      }, 
      enumerable: true 
    }, 
    ParseTree: { 
      get: function() { 
        return ParseTree; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var $src_syntax_ParseTreeVisitor_js =(function() { 
  "use strict"; 
  var $__6 = $src_syntax_trees_ParseTree_js, ParseTreeType = $__6.ParseTreeType, getTreeNameForType = $__6.getTreeNameForType; 
  var ParseTreeVisitor = traceur.runtime.createClass({ 
    visitAny: function(tree) { 
      if(tree === null) { 
        return; 
      } 
      var name = getTreeNameForType(tree.type); 
      this['visit' + name](tree); 
    }, 
    visit: function(tree) { 
      this.visitAny(tree); 
    }, 
    visitList: function(list) { 
      for(var i = 0; i < list.length; i ++) { 
        this.visitAny(list[i]); 
      } 
    }, 
    visitArgumentList: function(tree) { 
      this.visitList(tree.args); 
    }, 
    visitArrayComprehension: function(tree) { 
      this.visitAny(tree.expression); 
      this.visitList(tree.comprehensionForList); 
      this.visitAny(tree.ifExpression); 
    }, 
    visitArrayLiteralExpression: function(tree) { 
      this.visitList(tree.elements); 
    }, 
    visitArrayPattern: function(tree) { 
      this.visitList(tree.elements); 
    }, 
    visitArrowFunctionExpression: function(tree) { 
      this.visitAny(tree.formalParameters); 
      this.visitAny(tree.functionBody); 
    }, 
    visitAtNameExpression: function(tree) { }, 
    visitAtNameDeclaration: function(tree) { 
      this.visitAny(tree.initializer); 
    }, 
    visitAwaitStatement: function(tree) { 
      this.visitAny(tree.expression); 
    }, 
    visitBinaryOperator: function(tree) { 
      this.visitAny(tree.left); 
      this.visitAny(tree.right); 
    }, 
    visitBindThisParameter: function(tree) { 
      this.visitAny(tree.expression); 
    }, 
    visitBindingElement: function(tree) { 
      this.visitAny(tree.binding); 
      this.visitAny(tree.initializer); 
    }, 
    visitBindingIdentifier: function(tree) { }, 
    visitBlock: function(tree) { 
      this.visitList(tree.statements); 
    }, 
    visitBreakStatement: function(tree) { }, 
    visitCallExpression: function(tree) { 
      this.visitAny(tree.operand); 
      this.visitAny(tree.args); 
    }, 
    visitCaseClause: function(tree) { 
      this.visitAny(tree.expression); 
      this.visitList(tree.statements); 
    }, 
    visitCatch: function(tree) { 
      this.visitAny(tree.binding); 
      this.visitAny(tree.catchBody); 
    }, 
    visitCascadeExpression: function(tree) { 
      this.visitAny(tree.operand); 
      this.visitList(tree.expressions); 
    }, 
    visitClassDeclaration: function(tree) { 
      this.visitAny(tree.superClass); 
      this.visitList(tree.elements); 
    }, 
    visitClassExpression: function(tree) { }, 
    visitCommaExpression: function(tree) { 
      this.visitList(tree.expressions); 
    }, 
    visitComprehensionFor: function(tree) { 
      this.visitAny(tree.left); 
      this.visitAny(tree.iterator); 
    }, 
    visitConditionalExpression: function(tree) { 
      this.visitAny(tree.condition); 
      this.visitAny(tree.left); 
      this.visitAny(tree.right); 
    }, 
    visitContinueStatement: function(tree) { }, 
    visitDebuggerStatement: function(tree) { }, 
    visitDefaultClause: function(tree) { 
      this.visitList(tree.statements); 
    }, 
    visitDoWhileStatement: function(tree) { 
      this.visitAny(tree.body); 
      this.visitAny(tree.condition); 
    }, 
    visitEmptyStatement: function(tree) { }, 
    visitExportDeclaration: function(tree) { 
      this.visitAny(tree.declaration); 
    }, 
    visitExportMapping: function(tree) { 
      this.visitAny(tree.moduleExpression); 
      this.visitAny(tree.specifierSet); 
    }, 
    visitExportMappingList: function(tree) { 
      this.visitList(tree.paths); 
    }, 
    visitExportSpecifier: function(tree) { }, 
    visitExportSpecifierSet: function(tree) { 
      this.visitList(tree.specifiers); 
    }, 
    visitExpressionStatement: function(tree) { 
      this.visitAny(tree.expression); 
    }, 
    visitFinally: function(tree) { 
      this.visitAny(tree.block); 
    }, 
    visitForOfStatement: function(tree) { 
      this.visitAny(tree.initializer); 
      this.visitAny(tree.collection); 
      this.visitAny(tree.body); 
    }, 
    visitForInStatement: function(tree) { 
      this.visitAny(tree.initializer); 
      this.visitAny(tree.collection); 
      this.visitAny(tree.body); 
    }, 
    visitForStatement: function(tree) { 
      this.visitAny(tree.initializer); 
      this.visitAny(tree.condition); 
      this.visitAny(tree.increment); 
      this.visitAny(tree.body); 
    }, 
    visitFormalParameterList: function(tree) { 
      this.visitList(tree.parameters); 
    }, 
    visitFunctionDeclaration: function(tree) { 
      this.visitAny(tree.name); 
      this.visitAny(tree.formalParameterList); 
      this.visitAny(tree.functionBody); 
    }, 
    visitGeneratorComprehension: function(tree) { 
      this.visitAny(tree.expression); 
      this.visitList(tree.comprehensionForList); 
      this.visitAny(tree.ifExpression); 
    }, 
    visitGetAccessor: function(tree) { 
      this.visitAny(tree.body); 
    }, 
    visitIdentifierExpression: function(tree) { }, 
    visitIfStatement: function(tree) { 
      this.visitAny(tree.condition); 
      this.visitAny(tree.ifClause); 
      this.visitAny(tree.elseClause); 
    }, 
    visitImportDeclaration: function(tree) { 
      this.visitList(tree.importPathList); 
    }, 
    visitImportBinding: function(tree) { 
      if(tree.importSpecifierSet !== null) { 
        this.visitList(tree.importSpecifierSet); 
      } 
      this.visitAny(tree.moduleExpression); 
    }, 
    visitImportSpecifier: function(tree) { }, 
    visitImportSpecifierSet: function(tree) { 
      this.visitList(tree.specifiers); 
    }, 
    visitLabelledStatement: function(tree) { 
      this.visitAny(tree.statement); 
    }, 
    visitLiteralExpression: function(tree) { }, 
    visitMemberExpression: function(tree) { 
      this.visitAny(tree.operand); 
    }, 
    visitMemberLookupExpression: function(tree) { 
      this.visitAny(tree.operand); 
      this.visitAny(tree.memberExpression); 
    }, 
    visitMissingPrimaryExpression: function(tree) { }, 
    visitModuleDeclaration: function(tree) { 
      this.visitList(tree.specifiers); 
    }, 
    visitModuleDefinition: function(tree) { 
      this.visitList(tree.elements); 
    }, 
    visitModuleExpression: function(tree) { 
      this.visitAny(tree.reference); 
    }, 
    visitModuleRequire: function(tree) { }, 
    visitModuleSpecifier: function(tree) { 
      this.visitAny(tree.expression); 
    }, 
    visitNewExpression: function(tree) { 
      this.visitAny(tree.operand); 
      this.visitAny(tree.args); 
    }, 
    visitNameStatement: function(tree) { 
      this.visitList(tree.declarations); 
    }, 
    visitNullTree: function(tree) { }, 
    visitObjectLiteralExpression: function(tree) { 
      this.visitList(tree.propertyNameAndValues); 
    }, 
    visitObjectPattern: function(tree) { 
      this.visitList(tree.fields); 
    }, 
    visitObjectPatternField: function(tree) { 
      this.visitAny(tree.element); 
    }, 
    visitParenExpression: function(tree) { 
      this.visitAny(tree.expression); 
    }, 
    visitPostfixExpression: function(tree) { 
      this.visitAny(tree.operand); 
    }, 
    visitProgram: function(tree) { 
      this.visitList(tree.programElements); 
    }, 
    visitPropertyMethodAssignment: function(tree) { 
      this.visitAny(tree.formalParameterList); 
      this.visitAny(tree.functionBody); 
    }, 
    visitPropertyNameAssignment: function(tree) { 
      this.visitAny(tree.value); 
    }, 
    visitPropertyNameShorthand: function(tree) { }, 
    visitQuasiLiteralExpression: function(tree) { 
      this.visitAny(tree.operand); 
      this.visitList(tree.elements); 
    }, 
    visitQuasiLiteralPortion: function(tree) { }, 
    visitQuasiSubstitution: function(tree) { 
      this.visitAny(tree.expression); 
    }, 
    visitRequiresMember: function(tree) { }, 
    visitRestParameter: function(tree) { }, 
    visitReturnStatement: function(tree) { 
      this.visitAny(tree.expression); 
    }, 
    visitSetAccessor: function(tree) { 
      this.visitAny(tree.body); 
    }, 
    visitSpreadExpression: function(tree) { 
      this.visitAny(tree.expression); 
    }, 
    visitSpreadPatternElement: function(tree) { 
      this.visitAny(tree.lvalue); 
    }, 
    visitStateMachine: function(tree) { 
      throw Error('State machines should not live outside of the' + ' GeneratorTransformer.'); 
    }, 
    visitSuperExpression: function(tree) { }, 
    visitSwitchStatement: function(tree) { 
      this.visitAny(tree.expression); 
      this.visitList(tree.caseClauses); 
    }, 
    visitThisExpression: function(tree) { }, 
    visitThrowStatement: function(tree) { 
      this.visitAny(tree.value); 
    }, 
    visitTryStatement: function(tree) { 
      this.visitAny(tree.body); 
      this.visitAny(tree.catchBlock); 
      this.visitAny(tree.finallyBlock); 
    }, 
    visitUnaryExpression: function(tree) { 
      this.visitAny(tree.operand); 
    }, 
    visitVariableDeclaration: function(tree) { 
      this.visitAny(tree.lvalue); 
      this.visitAny(tree.initializer); 
    }, 
    visitVariableDeclarationList: function(tree) { 
      this.visitList(tree.declarations); 
    }, 
    visitVariableStatement: function(tree) { 
      this.visitAny(tree.declarations); 
    }, 
    visitWhileStatement: function(tree) { 
      this.visitAny(tree.condition); 
      this.visitAny(tree.body); 
    }, 
    visitWithStatement: function(tree) { 
      this.visitAny(tree.expression); 
      this.visitAny(tree.body); 
    }, 
    visitYieldStatement: function(tree) { 
      this.visitAny(tree.expression); 
    }, 
    constructor: function() { 
      var args = Array.prototype.slice.call(arguments, 0); 
      traceur.runtime.superCall(this, ParseTreeVisitor, "constructor", $__465(args)); 
    } 
  }, null, false, false); 
  return Object.preventExtensions(Object.create(null, { ParseTreeVisitor: { 
      get: function() { 
        return ParseTreeVisitor; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_TokenType_js =(function() { 
  "use strict"; 
  var TokenType = { 
    END_OF_FILE: 'End of File', 
    ERROR: 'error', 
    IDENTIFIER: 'identifier', 
    BREAK: 'break', 
    CASE: 'case', 
    CATCH: 'catch', 
    CONTINUE: 'continue', 
    DEBUGGER: 'debugger', 
    DEFAULT: 'default', 
    DELETE: 'delete', 
    DO: 'do', 
    ELSE: 'else', 
    FINALLY: 'finally', 
    FOR: 'for', 
    FUNCTION: 'function', 
    IF: 'if', 
    IN: 'in', 
    INSTANCEOF: 'instanceof', 
    NEW: 'new', 
    RETURN: 'return', 
    SWITCH: 'switch', 
    THIS: 'this', 
    THROW: 'throw', 
    TRY: 'try', 
    TYPEOF: 'typeof', 
    VAR: 'var', 
    VOID: 'void', 
    WHILE: 'while', 
    WITH: 'with', 
    CLASS: 'class', 
    CONST: 'const', 
    ENUM: 'enum', 
    EXPORT: 'export', 
    EXTENDS: 'extends', 
    IMPORT: 'import', 
    SUPER: 'super', 
    IMPLEMENTS: 'implements', 
    INTERFACE: 'interface', 
    LET: 'let', 
    PACKAGE: 'package', 
    PRIVATE: 'private', 
    PROTECTED: 'protected', 
    PUBLIC: 'public', 
    STATIC: 'static', 
    YIELD: 'yield', 
    OPEN_CURLY: '{', 
    CLOSE_CURLY: '}', 
    OPEN_PAREN: '(', 
    CLOSE_PAREN: ')', 
    OPEN_SQUARE: '[', 
    CLOSE_SQUARE: ']', 
    PERIOD: '.', 
    PERIOD_OPEN_CURLY: '.{', 
    SEMI_COLON: ';', 
    COMMA: ',', 
    OPEN_ANGLE: '<', 
    CLOSE_ANGLE: '>', 
    LESS_EQUAL: '<=', 
    GREATER_EQUAL: '>=', 
    EQUAL_EQUAL: '==', 
    NOT_EQUAL: '!=', 
    EQUAL_EQUAL_EQUAL: '===', 
    NOT_EQUAL_EQUAL: '!==', 
    PLUS: '+', 
    MINUS: '-', 
    STAR: '*', 
    PERCENT: '%', 
    PLUS_PLUS: '++', 
    MINUS_MINUS: '--', 
    LEFT_SHIFT: '<<', 
    RIGHT_SHIFT: '>>', 
    UNSIGNED_RIGHT_SHIFT: '>>>', 
    AMPERSAND: '&', 
    BAR: '|', 
    CARET: '^', 
    BANG: '!', 
    TILDE: '~', 
    AND: '&&', 
    OR: '||', 
    QUESTION: '?', 
    COLON: ':', 
    EQUAL: '=', 
    PLUS_EQUAL: '+=', 
    MINUS_EQUAL: '-=', 
    STAR_EQUAL: '*=', 
    PERCENT_EQUAL: '%=', 
    LEFT_SHIFT_EQUAL: '<<=', 
    RIGHT_SHIFT_EQUAL: '>>=', 
    UNSIGNED_RIGHT_SHIFT_EQUAL: '>>>=', 
    AMPERSAND_EQUAL: '&=', 
    BAR_EQUAL: '|=', 
    CARET_EQUAL: '^=', 
    SLASH: '/', 
    SLASH_EQUAL: '/=', 
    NULL: 'null', 
    TRUE: 'true', 
    FALSE: 'false', 
    NUMBER: 'number literal', 
    STRING: 'string literal', 
    REGULAR_EXPRESSION: 'regular expression literal', 
    DOT_DOT_DOT: '...', 
    AWAIT: 'await', 
    ARROW: '=>', 
    BACK_QUOTE: '`', 
    DOLLAR: '$', 
    QUASI_LITERAL_PORTION: 'quasi literal portion', 
    AT_NAME: 'at name' 
  }; 
  return Object.preventExtensions(Object.create(null, { TokenType: { 
      get: function() { 
        return TokenType; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_semantics_util_js =(function() { 
  "use strict"; 
  var $__7 = $src_syntax_trees_ParseTreeType_js, EXPRESSION_STATEMENT = $__7.EXPRESSION_STATEMENT, LITERAL_EXPRESSION = $__7.LITERAL_EXPRESSION; 
  var $__8 = $src_syntax_TokenType_js, TokenType = $__8.TokenType; 
  function evaluateStringLiteral(token) { 
    return eval(token.value); 
  } 
  function hasUseStrict(list) { 
    var li; 
    if(! list || ! list.length || !(li = list[0])) return false; 
    if(li.type !== EXPRESSION_STATEMENT || !(li = li.expression)) return false; 
    if(li.type !== LITERAL_EXPRESSION || !(li = li.literalToken)) return false; 
    if(li.type !== TokenType.STRING) return false; 
    return evaluateStringLiteral(li) === 'use strict'; 
  } 
  return Object.preventExtensions(Object.create(null, { 
    evaluateStringLiteral: { 
      get: function() { 
        return evaluateStringLiteral; 
      }, 
      enumerable: true 
    }, 
    hasUseStrict: { 
      get: function() { 
        return hasUseStrict; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var $src_util_url_js =(function() { 
  "use strict"; 
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) { 
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
  } 
  ; 
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$'); 
  var ComponentIndex = { 
    SCHEME: 1, 
    USER_INFO: 2, 
    DOMAIN: 3, 
    PORT: 4, 
    PATH: 5, 
    QUERY_DATA: 6, 
    FRAGMENT: 7 
  }; 
  function split(uri) { 
    return(uri.match(splitRe)); 
  } 
  function removeDotSegments(path) { 
    if(path === '/') return '/'; 
    var leadingSlash = path[0]=== '/' ? '/': ''; 
    var trailingSlash = path.slice(- 1) === '/' ? '/': ''; 
    var segments = path.split('/'); 
    var out =[]; 
    var up = 0; 
    for(var pos = 0; pos < segments.length; pos ++) { 
      var segment = segments[pos]; 
      switch(segment) { 
        case '': 
        case '.': 
          break; 

        case '..': 
          if(out.length) out.pop(); else up ++; 
          break; 

        default: 
          out.push(segment); 

      } 
    } 
    if(! leadingSlash) { 
      while(up -- > 0) { 
        out.unshift('..'); 
      } 
      if(out.length === 0) out.push('.'); 
    } 
    return leadingSlash + out.join('/') + trailingSlash; 
  } 
  function joinAndCanonicalizePath(parts) { 
    var path = parts[ComponentIndex.PATH]; 
    path = removeDotSegments(path.replace(/\/\//.g, '/')); 
    parts[ComponentIndex.PATH]= path; 
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]); 
  } 
  function canonicalizeUrl(url) { 
    var parts = split(url); 
    return joinAndCanonicalizePath(parts); 
  } 
  function resolveUrl(base, url) { 
    if(url[0]=== '@') return url; 
    var parts = split(url); 
    var baseParts = split(base); 
    if(parts[ComponentIndex.SCHEME]) { 
      return joinAndCanonicalizePath(parts); 
    } else { 
      parts[ComponentIndex.SCHEME]= baseParts[ComponentIndex.SCHEME]; 
    } 
    for(var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i ++) { 
      if(! parts[i]) { 
        parts[i]= baseParts[i]; 
      } 
    } 
    if(parts[ComponentIndex.PATH][0]== '/') { 
      return joinAndCanonicalizePath(parts); 
    } 
    var path = baseParts[ComponentIndex.PATH]; 
    var index = path.lastIndexOf('/'); 
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH]; 
    parts[ComponentIndex.PATH]= path; 
    return joinAndCanonicalizePath(parts); 
  } 
  return Object.preventExtensions(Object.create(null, { 
    removeDotSegments: { 
      get: function() { 
        return removeDotSegments; 
      }, 
      enumerable: true 
    }, 
    canonicalizeUrl: { 
      get: function() { 
        return canonicalizeUrl; 
      }, 
      enumerable: true 
    }, 
    resolveUrl: { 
      get: function() { 
        return resolveUrl; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var $src_codegeneration_module_ModuleVisitor_js =(function() { 
  "use strict"; 
  var $__9 = $src_syntax_trees_ParseTree_js, ParseTree = $__9.ParseTree, ParseTreeType = $__9.ParseTreeType; 
  var $__10 = $src_syntax_ParseTreeVisitor_js, ParseTreeVisitor = $__10.ParseTreeVisitor; 
  var $__11 = $src_semantics_symbols_Symbol_js, Symbol = $__11.Symbol; 
  var $__12 = $src_util_util_js, createObject = $__12.createObject; 
  var $__13 = $src_semantics_util_js, evaluateStringLiteral = $__13.evaluateStringLiteral; 
  var $__14 = $src_util_url_js, resolveUrl = $__14.resolveUrl; 
  function getFriendlyName(module) { 
    return module.name || module.url; 
  } 
  var ModuleVisitor = traceur.runtime.createClass({ 
    constructor: function(reporter, project, module) { 
      traceur.runtime.superCall(this, ModuleVisitor, "constructor",[]); 
      this.reporter_ = reporter; 
      this.project = project; 
      this.currentModule_ = module; 
    }, 
    get currentModule() { 
      return this.currentModule_; 
    }, 
    getModuleByName: function(name) { 
      var module = this.currentModule; 
      while(module) { 
        if(module.hasModule(name)) { 
          return module.getModule(name); 
        } 
        module = module.parent; 
      } 
      return null; 
    }, 
    getModuleForModuleExpression: function(tree, reportErrors) { 
      if(tree.reference.type == ParseTreeType.MODULE_REQUIRE) { 
        var url = evaluateStringLiteral(tree.reference.url); 
        url = resolveUrl(this.currentModule.url, url); 
        return this.project.getModuleForUrl(url); 
      } 
      var getNext =(function(parent, identifierToken) { 
        var name = identifierToken.value; 
        if(! parent.hasModule(name)) { 
          if(reportErrors) { 
            this.reportError_(tree, '\'%s\' is not a module', name); 
          } 
          return null; 
        } 
        if(! parent.hasExport(name)) { 
          if(reportErrors) { 
            this.reportError_(tree, '\'%s\' is not exported by %s', name, getFriendlyName(parent)); 
          } 
          return null; 
        } 
        return parent.getModule(name); 
      }).bind(this); 
      var name = tree.reference.identifierToken.value; 
      var parent = this.getModuleByName(name); 
      if(! parent) { 
        if(reportErrors) { 
          this.reportError_(tree, '\'%s\' is not a module', name); 
        } 
        return null; 
      } 
      for(var i = 0; i < tree.identifiers.length; i ++) { 
        parent = getNext(parent, tree.identifiers[i]); 
        if(! parent) { 
          return null; 
        } 
      } 
      return parent; 
    }, 
    visitFunctionDeclaration: function(tree) { }, 
    visitSetAccessor: function(tree) { }, 
    visitGetAccessor: function(tree) { }, 
    visitModuleElement_: function(element) { 
      switch(element.type) { 
        case ParseTreeType.MODULE_DECLARATION: 
        case ParseTreeType.MODULE_DEFINITION: 
        case ParseTreeType.EXPORT_DECLARATION: 
        case ParseTreeType.IMPORT_DECLARATION: 
          this.visitAny(element); 

      } 
    }, 
    visitProgram: function(tree) { 
      tree.programElements.forEach(this.visitModuleElement_, this); 
    }, 
    visitModuleDefinition: function(tree) { 
      var current = this.currentModule_; 
      var name = tree.name.value; 
      var module = current.getModule(name); 
      traceur.assert(module); 
      this.currentModule_ = module; 
      tree.elements.forEach(this.visitModuleElement_, this); 
      this.currentModule_ = current; 
    }, 
    checkForDuplicateModule_: function(name, tree) { 
      var parent = this.currentModule; 
      if(parent.hasModule(name)) { 
        this.reportError_(tree, 'Duplicate module declaration \'%s\'', name); 
        this.reportRelatedError_(parent.getModule(name).tree); 
        return false; 
      } 
      return true; 
    }, 
    reportError_: function(symbolOrTree, format, var_args) { 
      var tree; 
      if(symbolOrTree instanceof Symbol) { 
        tree = symbolOrTree.tree; 
      } else { 
        tree = symbolOrTree; 
      } 
      var args = Array.prototype.slice.call(arguments); 
      args[0]= tree.location.start; 
      this.reporter_.reportError.apply(this.reporter_, args); 
    }, 
    reportRelatedError_: function(symbolOrTree) { 
      if(symbolOrTree instanceof ParseTree) { 
        this.reportError_(symbolOrTree, 'Location related to previous error'); 
      } else { 
        var tree = symbolOrTree.tree; 
        if(tree) { 
          this.reportRelatedError_(tree); 
        } else { 
          this.reporter_.reportError(null,("Module related to previous error: " + symbolOrTree.url)); 
        } 
      } 
    } 
  }, ParseTreeVisitor, true, true); 
  return Object.preventExtensions(Object.create(null, { ModuleVisitor: { 
      get: function() { 
        return ModuleVisitor; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_module_ExportVisitor_js =(function() { 
  "use strict"; 
  var $__15 = $src_semantics_symbols_ExportSymbol_js, ExportSymbol = $__15.ExportSymbol; 
  var $__16 = $src_syntax_trees_ParseTreeType_js, IDENTIFIER_EXPRESSION = $__16.IDENTIFIER_EXPRESSION; 
  var $__17 = $src_codegeneration_module_ModuleVisitor_js, ModuleVisitor = $__17.ModuleVisitor; 
  var $__18 = $src_util_util_js, createObject = $__18.createObject; 
  var ExportVisitor = traceur.runtime.createClass({ 
    constructor: function(reporter, project, module) { 
      traceur.runtime.superCall(this, ExportVisitor, "constructor",[reporter, project, module]); 
      this.inExport_ = false; 
      this.relatedTree_ = null; 
    }, 
    addExport_: function(name, tree) { 
      if(! this.inExport_) { 
        return; 
      } 
      traceur.assert(typeof name == 'string'); 
      var parent = this.currentModule; 
      if(parent.hasExport(name)) { 
        this.reportError_(tree, 'Duplicate export declaration \'%s\'', name); 
        this.reportRelatedError_(parent.getExport(name)); 
        return; 
      } 
      parent.addExport(name, new ExportSymbol(tree, name, this.relatedTree_)); 
    }, 
    visitClassDeclaration: function(tree) { 
      this.addExport_(tree.name.identifierToken.value, tree); 
    }, 
    visitExportDeclaration: function(tree) { 
      this.inExport_ = true; 
      this.visitAny(tree.declaration); 
      this.inExport_ = false; 
    }, 
    visitExportMapping: function(tree) { 
      this.relatedTree_ = tree.moduleExpression; 
      this.visitAny(tree.specifierSet); 
      this.relatedTree_ = null; 
    }, 
    visitExportMappingList: function(tree) { 
      for(var i = 0; i < tree.paths.length; i ++) { 
        var path = tree.paths[i]; 
        if(path.type == IDENTIFIER_EXPRESSION) { 
          this.addExport_(path.identifierToken.value, path); 
        } else { 
          this.visitAny(path); 
        } 
      } 
    }, 
    visitExportSpecifier: function(tree) { 
      this.addExport_((tree.rhs || tree.lhs).value, tree); 
    }, 
    visitFunctionDeclaration: function(tree) { 
      if(tree.name) { 
        this.addExport_(tree.name.identifierToken.value, tree); 
      } 
    }, 
    visitIdentifierExpression: function(tree) { 
      this.addExport_(tree.identifierToken.value, tree); 
    }, 
    visitModuleDefinition: function(tree) { 
      this.addExport_(tree.name.value, tree); 
      var inExport = this.inExport_; 
      this.inExport_ = false; 
      traceur.runtime.superCall(this, ExportVisitor, "visitModuleDefinition",[tree]); 
      this.inExport_ = inExport; 
    }, 
    visitModuleSpecifier: function(tree) { 
      this.addExport_(tree.identifier.value, tree); 
    }, 
    visitVariableDeclaration: function(tree) { 
      this.addExport_(tree.lvalue.identifierToken.value, tree); 
    } 
  }, ModuleVisitor, true, true); 
  return Object.preventExtensions(Object.create(null, { ExportVisitor: { 
      get: function() { 
        return ExportVisitor; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_module_ImportStarVisitor_js =(function() { 
  "use strict"; 
  var $__19 = $src_syntax_trees_ParseTreeType_js, IMPORT_SPECIFIER_SET = $__19.IMPORT_SPECIFIER_SET; 
  var $__20 = $src_codegeneration_module_ModuleVisitor_js, ModuleVisitor = $__20.ModuleVisitor; 
  var $__21 = $src_syntax_TokenType_js, TokenType = $__21.TokenType; 
  var $__22 = $src_util_util_js, createObject = $__22.createObject; 
  var ImportStarVisitor = traceur.runtime.createClass({ 
    constructor: function(reporter, project, module) { 
      traceur.runtime.superCall(this, ImportStarVisitor, "constructor",[reporter, project, module]); 
    }, 
    visitImportBinding: function(tree) { 
      var importSpecifierSet = tree.importSpecifierSet; 
      if(importSpecifierSet.type === IMPORT_SPECIFIER_SET && importSpecifierSet.specifiers.type === TokenType.STAR) { 
        var module = this.getModuleForModuleExpression(tree.moduleExpression); 
        this.project.setModuleForStarTree(importSpecifierSet, module); 
      } 
    } 
  }, ModuleVisitor, true, true); 
  return Object.preventExtensions(Object.create(null, { ImportStarVisitor: { 
      get: function() { 
        return ImportStarVisitor; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_module_ModuleDeclarationVisitor_js =(function() { 
  "use strict"; 
  var $__23 = $src_codegeneration_module_ModuleVisitor_js, ModuleVisitor = $__23.ModuleVisitor; 
  var $__24 = $src_util_util_js, createObject = $__24.createObject; 
  var ModuleDeclarationVisitor = traceur.runtime.createClass({ 
    constructor: function(reporter, project, module) { 
      traceur.runtime.superCall(this, ModuleDeclarationVisitor, "constructor",[reporter, project, module]); 
    }, 
    visitModuleSpecifier: function(tree) { 
      var name = tree.identifier.value; 
      var parent = this.currentModule; 
      var module = this.getModuleForModuleExpression(tree.expression); 
      if(! module) { 
        return; 
      } 
      parent.addModuleWithName(module, name); 
    } 
  }, ModuleVisitor, true, true); 
  return Object.preventExtensions(Object.create(null, { ModuleDeclarationVisitor: { 
      get: function() { 
        return ModuleDeclarationVisitor; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_semantics_symbols_ModuleSymbol_js =(function() { 
  "use strict"; 
  var $__25 = $src_semantics_symbols_Symbol_js, Symbol = $__25.Symbol; 
  var $__26 = $src_semantics_symbols_SymbolType_js, SymbolType = $__26.SymbolType; 
  var $__27 = $src_util_util_js, createObject = $__27.createObject; 
  function ModuleSymbol(name, parent, tree, url) { 
    Symbol.call(this, SymbolType.MODULE, tree, name); 
    this.children_ = Object.create(null); 
    this.exports_ = Object.create(null); 
    this.parent = parent; 
    this.tree = tree; 
    if(! url) { 
      console.error('Missing URL'); 
    } 
    this.url = url; 
  } 
  ModuleSymbol.prototype = createObject(Symbol.prototype, { 
    addModule: function(module) { 
      this.addModuleWithName(module, module.name); 
    }, 
    addModuleWithName: function(module, name) { 
      this.children_[name]= module; 
    }, 
    hasModule: function(name) { 
      return name in this.children_; 
    }, 
    getModule: function(name) { 
      return this.children_[name]; 
    }, 
    hasExport: function(name) { 
      return name in this.exports_; 
    }, 
    getExport: function(name) { 
      return this.exports_[name]; 
    }, 
    addExport: function(name, exp) { 
      this.exports_[name]= exp; 
    }, 
    getExports: function() { 
      var exports = this.exports_; 
      return Object.keys(exports).map((function(key) { 
        return exports[key]; 
      })); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { ModuleSymbol: { 
      get: function() { 
        return ModuleSymbol; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_module_ModuleDefinitionVisitor_js =(function() { 
  "use strict"; 
  var $__28 = $src_semantics_symbols_ModuleSymbol_js, ModuleSymbol = $__28.ModuleSymbol; 
  var $__29 = $src_codegeneration_module_ModuleVisitor_js, ModuleVisitor = $__29.ModuleVisitor; 
  var $__30 = $src_util_util_js, createObject = $__30.createObject; 
  var ModuleDefinitionVisitor = traceur.runtime.createClass({ 
    constructor: function(reporter, project, module) { 
      traceur.runtime.superCall(this, ModuleDefinitionVisitor, "constructor",[reporter, project, module]); 
    }, 
    visitModuleDefinition: function(tree) { 
      var name = tree.name.value; 
      if(this.checkForDuplicateModule_(name, tree)) { 
        var parent = this.currentModule; 
        var module = new ModuleSymbol(name, parent, tree, parent.url); 
        parent.addModule(module); 
      } 
      traceur.runtime.superCall(this, ModuleDefinitionVisitor, "visitModuleDefinition",[tree]); 
    } 
  }, ModuleVisitor, true, true); 
  return Object.preventExtensions(Object.create(null, { ModuleDefinitionVisitor: { 
      get: function() { 
        return ModuleDefinitionVisitor; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_module_ValidationVisitor_js =(function() { 
  "use strict"; 
  var $__31 = $src_codegeneration_module_ModuleVisitor_js, ModuleVisitor = $__31.ModuleVisitor; 
  var $__32 = $src_util_util_js, createObject = $__32.createObject; 
  function getFriendlyName(module) { 
    return module.name || "'" + module.url + "'"; 
  } 
  function ValidationVisitor(reporter, project, module) { 
    ModuleVisitor.call(this, reporter, project, module); 
  } 
  ValidationVisitor.prototype = createObject(ModuleVisitor.prototype, { 
    checkExport_: function(tree, name) { 
      if(this.validatingModule_ && ! this.validatingModule_.hasExport(name)) { 
        this.reportError_(tree, '\'%s\' is not exported by %s', name, getFriendlyName(this.validatingModule_)); 
      } 
    }, 
    visitAndValidate_: function(module, tree) { 
      var validatingModule = this.validatingModule_; 
      this.validatingModule_ = module; 
      this.visitAny(tree); 
      this.validatingModule_ = validatingModule; 
    }, 
    visitExportMapping: function(tree) { 
      if(tree.moduleExpression) { 
        this.visitAny(tree.moduleExpression); 
        var module = this.getModuleForModuleExpression(tree.moduleExpression); 
        this.visitAndValidate_(module, tree.specifierSet); 
      } 
    }, 
    visitExportSpecifier: function(tree) { 
      this.checkExport_(tree, tree.lhs.value); 
    }, 
    visitIdentifierExpression: function(tree) { 
      this.checkExport_(tree, tree.identifierToken.value); 
    }, 
    visitModuleExpression: function(tree) { 
      this.getModuleForModuleExpression(tree, true); 
    }, 
    visitImportBinding: function(tree) { 
      var module = this.getModuleForModuleExpression(tree.moduleExpression, true); 
      this.visitAndValidate_(module, tree.importSpecifierSet); 
    }, 
    visitImportSpecifier: function(tree) { 
      this.checkExport_(tree, tree.lhs.value); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { ValidationVisitor: { 
      get: function() { 
        return ValidationVisitor; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_semantics_ModuleAnalyzer_js =(function() { 
  "use strict"; 
  var $__33 = $src_codegeneration_module_ExportVisitor_js, ExportVisitor = $__33.ExportVisitor; 
  var $__34 = $src_codegeneration_module_ImportStarVisitor_js, ImportStarVisitor = $__34.ImportStarVisitor; 
  var $__35 = $src_codegeneration_module_ModuleDeclarationVisitor_js, ModuleDeclarationVisitor = $__35.ModuleDeclarationVisitor; 
  var $__36 = $src_codegeneration_module_ModuleDefinitionVisitor_js, ModuleDefinitionVisitor = $__36.ModuleDefinitionVisitor; 
  var $__37 = $src_codegeneration_module_ValidationVisitor_js, ValidationVisitor = $__37.ValidationVisitor; 
  function ModuleAnalyzer(reporter, project) { 
    this.reporter_ = reporter; 
    this.project_ = project; 
  } 
  ModuleAnalyzer.prototype = { 
    analyze: function() { 
      this.analyzeTrees(this.project_.getSourceTrees()); 
    }, 
    analyzeFile: function(sourceFile) { 
      var trees =[this.project_.getParseTree(sourceFile)]; 
      this.analyzeTrees(trees); 
    }, 
    analyzeTrees: function(trees) { 
      this.analyzeModuleTrees(trees); 
    }, 
    analyzeModuleTrees: function(trees, opt_roots) { 
      var reporter = this.reporter_; 
      var project = this.project_; 
      var root = project.getRootModule(); 
      function getRoot(i) { 
        return opt_roots ? opt_roots[i]: root; 
      } 
      function doVisit(ctor) { 
        for(var i = 0; i < trees.length; i ++) { 
          var visitor = new ctor(reporter, project, getRoot(i)); 
          visitor.visitAny(trees[i]); 
        } 
      } 
      doVisit(ModuleDefinitionVisitor); 
      doVisit(ExportVisitor); 
      doVisit(ModuleDeclarationVisitor); 
      doVisit(ValidationVisitor); 
      doVisit(ImportStarVisitor); 
    } 
  }; 
  return Object.preventExtensions(Object.create(null, { ModuleAnalyzer: { 
      get: function() { 
        return ModuleAnalyzer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_util_ArrayMap_js =(function() { 
  "use strict"; 
  var ArrayMap = traceur.runtime.createClass({ 
    constructor: function() { 
      this.values_ =[]; 
      this.keys_ =[]; 
    }, 
    has: function(key) { 
      return this.keys_.indexOf(key) != - 1; 
    }, 
    get: function(key) { 
      var index = this.keys_.indexOf(key); 
      if(index == - 1) { 
        return undefined; 
      } 
      return this.values_[index]; 
    }, 
    put: function(key, value) { 
      var index = this.keys_.indexOf(key); 
      if(index == - 1) { 
        this.keys_.push(key); 
        this.values_.push(value); 
      } else { 
        this.values_[index]= value; 
      } 
    }, 
    addAll: function(other) { 
      var keys = other.keys(); 
      var values = other.values(); 
      for(var i = 0; i < keys.length; i ++) { 
        this.put(keys[i], values[i]); 
      } 
    }, 
    remove: function(key) { 
      var index = this.keys_.indexOf(key); 
      if(index == - 1) { 
        return; 
      } 
      this.keys_.splice(index, 1); 
      this.values_.splice(index, 1); 
    }, 
    keys: function() { 
      return this.keys_.concat(); 
    }, 
    values: function() { 
      return this.values_.concat(); 
    } 
  }, null, true, false); 
  return Object.preventExtensions(Object.create(null, { ArrayMap: { 
      get: function() { 
        return ArrayMap; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_util_ObjectMap_js =(function() { 
  "use strict"; 
  var ObjectMap = traceur.runtime.createClass({ 
    constructor: function() { 
      this.keys_ = Object.create(null); 
      this.values_ = Object.create(null); 
    }, 
    put: function(key, value) { 
      var uid = key.uid; 
      this.keys_[uid]= key; 
      this.values_[uid]= value; 
    }, 
    get: function(key) { 
      return this.values_[key.uid]; 
    }, 
    has: function(key) { 
      return key.uid in this.keys_; 
    }, 
    addAll: function(other) { 
      for(var uid in other.keys_) { 
        this.keys_[uid]= other.keys_[uid]; 
        this.values_[uid]= other.values_[uid]; 
      } 
    }, 
    keys: function() { 
      return Object.keys(this.keys_).map((function(uid) { 
        return this.keys_[uid]; 
      }).bind(this)); 
    }, 
    values: function() { 
      return Object.keys(this.values_).map((function(uid) { 
        return this.values_[uid]; 
      }).bind(this)); 
    }, 
    remove: function(key) { 
      var uid = key.uid; 
      delete this.keys_[uid]; 
      delete this.values_[uid]; 
    } 
  }, null, true, false); 
  return Object.preventExtensions(Object.create(null, { ObjectMap: { 
      get: function() { 
        return ObjectMap; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_util_ErrorReporter_js =(function() { 
  "use strict"; 
  var ErrorReporter = traceur.runtime.createClass({ 
    constructor: function() { 
      this.hadError_ = false; 
    }, 
    reportError: function(location, format, var_args) { 
      this.hadError_ = true; 
      var args = Array.prototype.slice.call(arguments, 2); 
      this.reportMessageInternal(location, 'error', format, args); 
    }, 
    reportWarning: function(location, format, var_args) { 
      var args = Array.prototype.slice.call(arguments, 2); 
      this.reportMessageInternal(location, 'warn', format, args); 
    }, 
    reportMessageInternal: function(location, kind, format, args) { 
      if(location) format =("" + location + ": " + format); 
      console[kind].apply(console,[format].concat(args)); 
    }, 
    hadError: function() { 
      return this.hadError_; 
    }, 
    clearError: function() { 
      this.hadError_ = false; 
    } 
  }, null, true, false); 
  ErrorReporter.format = function(location, text, opt_args) { 
    var i = 0; 
    text = text.replace(/%./g, function(s) { 
      switch(s) { 
        case '%s': 
          return opt_args && opt_args[i ++]; 

        case '%%': 
          return '%'; 

      } 
      return s; 
    }); 
    if(location) text =("" + location + ": " + text); 
    return text; 
  }; 
  return Object.preventExtensions(Object.create(null, { ErrorReporter: { 
      get: function() { 
        return ErrorReporter; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_util_MutedErrorReporter_js =(function() { 
  "use strict"; 
  var $__38 = $src_util_ErrorReporter_js, ErrorReporter = $__38.ErrorReporter; 
  var $__39 = $src_util_util_js, createObject = $__39.createObject; 
  var MutedErrorReporter = traceur.runtime.createClass({ 
    constructor: function() { }, 
    reportMessageInternal: function(location, message) { } 
  }, ErrorReporter, true, true); 
  return Object.preventExtensions(Object.create(null, { MutedErrorReporter: { 
      get: function() { 
        return MutedErrorReporter; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_trees_NullTree_js =(function() { 
  "use strict"; 
  var $__40 = $src_syntax_trees_ParseTree_js, ParseTree = $__40.ParseTree; 
  var $__41 = $src_syntax_trees_ParseTreeType_js, NULL_TREE = $__41.NULL_TREE; 
  var NullTree = traceur.runtime.createClass({ constructor: function() { 
      traceur.runtime.superCall(this, NullTree, "constructor",[NULL_TREE, null]); 
    } }, ParseTree, true, true); 
  return Object.preventExtensions(Object.create(null, { NullTree: { 
      get: function() { 
        return NullTree; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_trees_ParseTrees_js =(function() { 
  "use strict"; 
  var $__42 = $src_syntax_trees_NullTree_js, NullTree = $__42.NullTree; 
  var $__43 = $src_syntax_trees_ParseTree_js, ParseTree = $__43.ParseTree; 
  var ParseTreeType = $src_syntax_trees_ParseTreeType_js; 
  var $__44 = ParseTreeType, ARGUMENT_LIST = $__44.ARGUMENT_LIST, ARRAY_COMPREHENSION = $__44.ARRAY_COMPREHENSION, ARRAY_LITERAL_EXPRESSION = $__44.ARRAY_LITERAL_EXPRESSION, ARRAY_PATTERN = $__44.ARRAY_PATTERN, ARROW_FUNCTION_EXPRESSION = $__44.ARROW_FUNCTION_EXPRESSION, AT_NAME_EXPRESSION = $__44.AT_NAME_EXPRESSION, AT_NAME_DECLARATION = $__44.AT_NAME_DECLARATION, AWAIT_STATEMENT = $__44.AWAIT_STATEMENT, BINARY_OPERATOR = $__44.BINARY_OPERATOR, BIND_THIS_PARAMETER = $__44.BIND_THIS_PARAMETER, BINDING_ELEMENT = $__44.BINDING_ELEMENT, BINDING_IDENTIFIER = $__44.BINDING_IDENTIFIER, BLOCK = $__44.BLOCK, BREAK_STATEMENT = $__44.BREAK_STATEMENT, CALL_EXPRESSION = $__44.CALL_EXPRESSION, CASCADE_EXPRESSION = $__44.CASCADE_EXPRESSION, CASE_CLAUSE = $__44.CASE_CLAUSE, CATCH = $__44.CATCH, CLASS_DECLARATION = $__44.CLASS_DECLARATION, CLASS_EXPRESSION = $__44.CLASS_EXPRESSION, COMMA_EXPRESSION = $__44.COMMA_EXPRESSION, COMPREHENSION_FOR = $__44.COMPREHENSION_FOR, CONDITIONAL_EXPRESSION = $__44.CONDITIONAL_EXPRESSION, CONTINUE_STATEMENT = $__44.CONTINUE_STATEMENT, DEBUGGER_STATEMENT = $__44.DEBUGGER_STATEMENT, DEFAULT_CLAUSE = $__44.DEFAULT_CLAUSE, DO_WHILE_STATEMENT = $__44.DO_WHILE_STATEMENT, EMPTY_STATEMENT = $__44.EMPTY_STATEMENT, EXPORT_DECLARATION = $__44.EXPORT_DECLARATION, EXPORT_MAPPING_LIST = $__44.EXPORT_MAPPING_LIST, EXPORT_MAPPING = $__44.EXPORT_MAPPING, EXPORT_SPECIFIER = $__44.EXPORT_SPECIFIER, EXPORT_SPECIFIER_SET = $__44.EXPORT_SPECIFIER_SET, EXPRESSION_STATEMENT = $__44.EXPRESSION_STATEMENT, FINALLY = $__44.FINALLY, FOR_OF_STATEMENT = $__44.FOR_OF_STATEMENT, FOR_IN_STATEMENT = $__44.FOR_IN_STATEMENT, FORMAL_PARAMETER_LIST = $__44.FORMAL_PARAMETER_LIST, FOR_STATEMENT = $__44.FOR_STATEMENT, FUNCTION_DECLARATION = $__44.FUNCTION_DECLARATION, GENERATOR_COMPREHENSION = $__44.GENERATOR_COMPREHENSION, GET_ACCESSOR = $__44.GET_ACCESSOR, IDENTIFIER_EXPRESSION = $__44.IDENTIFIER_EXPRESSION, IF_STATEMENT = $__44.IF_STATEMENT, IMPORT_DECLARATION = $__44.IMPORT_DECLARATION, IMPORT_BINDING = $__44.IMPORT_BINDING, IMPORT_SPECIFIER = $__44.IMPORT_SPECIFIER, IMPORT_SPECIFIER_SET = $__44.IMPORT_SPECIFIER_SET, LABELLED_STATEMENT = $__44.LABELLED_STATEMENT, LITERAL_EXPRESSION = $__44.LITERAL_EXPRESSION, MEMBER_EXPRESSION = $__44.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__44.MEMBER_LOOKUP_EXPRESSION, MISSING_PRIMARY_EXPRESSION = $__44.MISSING_PRIMARY_EXPRESSION, MODULE_DECLARATION = $__44.MODULE_DECLARATION, MODULE_DEFINITION = $__44.MODULE_DEFINITION, MODULE_EXPRESSION = $__44.MODULE_EXPRESSION, MODULE_REQUIRE = $__44.MODULE_REQUIRE, MODULE_SPECIFIER = $__44.MODULE_SPECIFIER, NAME_STATEMENT = $__44.NAME_STATEMENT, NEW_EXPRESSION = $__44.NEW_EXPRESSION, NULL_TREE = $__44.NULL_TREE, OBJECT_LITERAL_EXPRESSION = $__44.OBJECT_LITERAL_EXPRESSION, OBJECT_PATTERN_FIELD = $__44.OBJECT_PATTERN_FIELD, OBJECT_PATTERN = $__44.OBJECT_PATTERN, PAREN_EXPRESSION = $__44.PAREN_EXPRESSION, POSTFIX_EXPRESSION = $__44.POSTFIX_EXPRESSION, PROGRAM = $__44.PROGRAM, PROPERTY_METHOD_ASSIGNMENT = $__44.PROPERTY_METHOD_ASSIGNMENT, PROPERTY_NAME_ASSIGNMENT = $__44.PROPERTY_NAME_ASSIGNMENT, PROPERTY_NAME_SHORTHAND = $__44.PROPERTY_NAME_SHORTHAND, QUASI_LITERAL_EXPRESSION = $__44.QUASI_LITERAL_EXPRESSION, QUASI_LITERAL_PORTION = $__44.QUASI_LITERAL_PORTION, QUASI_SUBSTITUTION = $__44.QUASI_SUBSTITUTION, REQUIRES_MEMBER = $__44.REQUIRES_MEMBER, REST_PARAMETER = $__44.REST_PARAMETER, RETURN_STATEMENT = $__44.RETURN_STATEMENT, SET_ACCESSOR = $__44.SET_ACCESSOR, STATE_MACHINE = $__44.STATE_MACHINE, SPREAD_EXPRESSION = $__44.SPREAD_EXPRESSION, SPREAD_PATTERN_ELEMENT = $__44.SPREAD_PATTERN_ELEMENT, SUPER_EXPRESSION = $__44.SUPER_EXPRESSION, SWITCH_STATEMENT = $__44.SWITCH_STATEMENT, THIS_EXPRESSION = $__44.THIS_EXPRESSION, THROW_STATEMENT = $__44.THROW_STATEMENT, TRY_STATEMENT = $__44.TRY_STATEMENT, UNARY_EXPRESSION = $__44.UNARY_EXPRESSION, VARIABLE_DECLARATION_LIST = $__44.VARIABLE_DECLARATION_LIST, VARIABLE_DECLARATION = $__44.VARIABLE_DECLARATION, VARIABLE_STATEMENT = $__44.VARIABLE_STATEMENT, WHILE_STATEMENT = $__44.WHILE_STATEMENT, WITH_STATEMENT = $__44.WITH_STATEMENT, YIELD_STATEMENT = $__44.YIELD_STATEMENT; 
  var ArgumentList = traceur.runtime.createClass({ constructor: function(location, args) { 
      traceur.runtime.superCall(this, ArgumentList, "constructor",[ARGUMENT_LIST, location]); 
      this.args = args; 
    } }, ParseTree, true, true); 
  var ArrayComprehension = traceur.runtime.createClass({ constructor: function(location, expression, comprehensionForList, ifExpression) { 
      traceur.runtime.superCall(this, ArrayComprehension, "constructor",[ARRAY_COMPREHENSION, location]); 
      this.expression = expression; 
      this.comprehensionForList = comprehensionForList; 
      this.ifExpression = ifExpression; 
    } }, ParseTree, true, true); 
  var ArrayLiteralExpression = traceur.runtime.createClass({ constructor: function(location, elements) { 
      traceur.runtime.superCall(this, ArrayLiteralExpression, "constructor",[ARRAY_LITERAL_EXPRESSION, location]); 
      this.elements = elements; 
    } }, ParseTree, true, true); 
  var ArrayPattern = traceur.runtime.createClass({ constructor: function(location, elements) { 
      traceur.runtime.superCall(this, ArrayPattern, "constructor",[ARRAY_PATTERN, location]); 
      this.elements = elements; 
    } }, ParseTree, true, true); 
  var ArrowFunctionExpression = traceur.runtime.createClass({ constructor: function(location, formalParameters, functionBody) { 
      traceur.runtime.superCall(this, ArrowFunctionExpression, "constructor",[ARROW_FUNCTION_EXPRESSION, location]); 
      this.formalParameters = formalParameters; 
      this.functionBody = functionBody; 
    } }, ParseTree, true, true); 
  var AtNameExpression = traceur.runtime.createClass({ constructor: function(location, atNameToken) { 
      traceur.runtime.superCall(this, AtNameExpression, "constructor",[AT_NAME_EXPRESSION, location]); 
      this.atNameToken = atNameToken; 
    } }, ParseTree, true, true); 
  var AtNameDeclaration = traceur.runtime.createClass({ constructor: function(location, atNameToken, initializer) { 
      traceur.runtime.superCall(this, AtNameDeclaration, "constructor",[AT_NAME_DECLARATION, location]); 
      this.atNameToken = atNameToken; 
      this.initializer = initializer; 
    } }, ParseTree, true, true); 
  var AwaitStatement = traceur.runtime.createClass({ constructor: function(location, identifier, expression) { 
      traceur.runtime.superCall(this, AwaitStatement, "constructor",[AWAIT_STATEMENT, location]); 
      this.identifier = identifier; 
      this.expression = expression; 
    } }, ParseTree, true, true); 
  var BinaryOperator = traceur.runtime.createClass({ constructor: function(location, left, operator, right) { 
      traceur.runtime.superCall(this, BinaryOperator, "constructor",[BINARY_OPERATOR, location]); 
      this.left = left; 
      this.operator = operator; 
      this.right = right; 
    } }, ParseTree, true, true); 
  var BindThisParameter = traceur.runtime.createClass({ constructor: function(location, expression) { 
      traceur.runtime.superCall(this, BindThisParameter, "constructor",[BIND_THIS_PARAMETER, location]); 
      this.expression = expression; 
    } }, ParseTree, true, true); 
  var BindingIdentifier = traceur.runtime.createClass({ constructor: function(location, identifierToken) { 
      traceur.runtime.superCall(this, BindingIdentifier, "constructor",[BINDING_IDENTIFIER, location]); 
      this.identifierToken = identifierToken; 
    } }, ParseTree, true, true); 
  var BindingElement = traceur.runtime.createClass({ constructor: function(location, binding, initializer) { 
      traceur.runtime.superCall(this, BindingElement, "constructor",[BINDING_ELEMENT, location]); 
      this.binding = binding; 
      this.initializer = initializer; 
    } }, ParseTree, true, true); 
  var Block = traceur.runtime.createClass({ constructor: function(location, statements) { 
      traceur.runtime.superCall(this, Block, "constructor",[BLOCK, location]); 
      this.statements = statements; 
    } }, ParseTree, true, true); 
  var BreakStatement = traceur.runtime.createClass({ constructor: function(location, name) { 
      traceur.runtime.superCall(this, BreakStatement, "constructor",[BREAK_STATEMENT, location]); 
      this.name = name; 
    } }, ParseTree, true, true); 
  var CallExpression = traceur.runtime.createClass({ constructor: function(location, operand, args) { 
      traceur.runtime.superCall(this, CallExpression, "constructor",[CALL_EXPRESSION, location]); 
      this.operand = operand; 
      this.args = args; 
    } }, ParseTree, true, true); 
  var CascadeExpression = traceur.runtime.createClass({ constructor: function(location, operand, expressions) { 
      traceur.runtime.superCall(this, CascadeExpression, "constructor",[CASCADE_EXPRESSION, location]); 
      this.operand = operand; 
      this.expressions = expressions; 
    } }, ParseTree, true, true); 
  var CaseClause = traceur.runtime.createClass({ constructor: function(location, expression, statements) { 
      traceur.runtime.superCall(this, CaseClause, "constructor",[CASE_CLAUSE, location]); 
      this.expression = expression; 
      this.statements = statements; 
    } }, ParseTree, true, true); 
  var Catch = traceur.runtime.createClass({ constructor: function(location, binding, catchBody) { 
      traceur.runtime.superCall(this, Catch, "constructor",[CATCH, location]); 
      this.binding = binding; 
      this.catchBody = catchBody; 
    } }, ParseTree, true, true); 
  var ClassDeclaration = traceur.runtime.createClass({ constructor: function(location, name, superClass, elements) { 
      traceur.runtime.superCall(this, ClassDeclaration, "constructor",[CLASS_DECLARATION, location]); 
      this.name = name; 
      this.superClass = superClass; 
      this.elements = elements; 
    } }, ParseTree, true, true); 
  var ClassExpression = traceur.runtime.createClass({ constructor: function(location, name, superClass, elements) { 
      traceur.runtime.superCall(this, ClassExpression, "constructor",[CLASS_EXPRESSION, location]); 
      this.name = name; 
      this.superClass = superClass; 
      this.elements = elements; 
    } }, ParseTree, true, true); 
  var CommaExpression = traceur.runtime.createClass({ constructor: function(location, expressions) { 
      traceur.runtime.superCall(this, CommaExpression, "constructor",[COMMA_EXPRESSION, location]); 
      this.expressions = expressions; 
    } }, ParseTree, true, true); 
  var ComprehensionFor = traceur.runtime.createClass({ constructor: function(location, left, iterator) { 
      traceur.runtime.superCall(this, ComprehensionFor, "constructor",[COMPREHENSION_FOR, location]); 
      this.left = left; 
      this.iterator = iterator; 
    } }, ParseTree, true, true); 
  var ConditionalExpression = traceur.runtime.createClass({ constructor: function(location, condition, left, right) { 
      traceur.runtime.superCall(this, ConditionalExpression, "constructor",[CONDITIONAL_EXPRESSION, location]); 
      this.condition = condition; 
      this.left = left; 
      this.right = right; 
    } }, ParseTree, true, true); 
  var ContinueStatement = traceur.runtime.createClass({ constructor: function(location, name) { 
      traceur.runtime.superCall(this, ContinueStatement, "constructor",[CONTINUE_STATEMENT, location]); 
      this.name = name; 
    } }, ParseTree, true, true); 
  var DebuggerStatement = traceur.runtime.createClass({ constructor: function(location) { 
      traceur.runtime.superCall(this, DebuggerStatement, "constructor",[DEBUGGER_STATEMENT, location]); 
    } }, ParseTree, true, true); 
  var DefaultClause = traceur.runtime.createClass({ constructor: function(location, statements) { 
      traceur.runtime.superCall(this, DefaultClause, "constructor",[DEFAULT_CLAUSE, location]); 
      this.statements = statements; 
    } }, ParseTree, true, true); 
  var DoWhileStatement = traceur.runtime.createClass({ constructor: function(location, body, condition) { 
      traceur.runtime.superCall(this, DoWhileStatement, "constructor",[DO_WHILE_STATEMENT, location]); 
      this.body = body; 
      this.condition = condition; 
    } }, ParseTree, true, true); 
  var EmptyStatement = traceur.runtime.createClass({ constructor: function(location) { 
      traceur.runtime.superCall(this, EmptyStatement, "constructor",[EMPTY_STATEMENT, location]); 
    } }, ParseTree, true, true); 
  var ExportDeclaration = traceur.runtime.createClass({ constructor: function(location, declaration) { 
      traceur.runtime.superCall(this, ExportDeclaration, "constructor",[EXPORT_DECLARATION, location]); 
      this.declaration = declaration; 
    } }, ParseTree, true, true); 
  var ExportMappingList = traceur.runtime.createClass({ constructor: function(location, paths) { 
      traceur.runtime.superCall(this, ExportMappingList, "constructor",[EXPORT_MAPPING_LIST, location]); 
      this.paths = paths; 
    } }, ParseTree, true, true); 
  var ExportMapping = traceur.runtime.createClass({ constructor: function(location, moduleExpression, specifierSet) { 
      traceur.runtime.superCall(this, ExportMapping, "constructor",[EXPORT_MAPPING, location]); 
      this.moduleExpression = moduleExpression; 
      this.specifierSet = specifierSet; 
    } }, ParseTree, true, true); 
  var ExportSpecifier = traceur.runtime.createClass({ constructor: function(location, lhs, rhs) { 
      traceur.runtime.superCall(this, ExportSpecifier, "constructor",[EXPORT_SPECIFIER, location]); 
      this.lhs = lhs; 
      this.rhs = rhs; 
    } }, ParseTree, true, true); 
  var ExportSpecifierSet = traceur.runtime.createClass({ constructor: function(location, specifiers) { 
      traceur.runtime.superCall(this, ExportSpecifierSet, "constructor",[EXPORT_SPECIFIER_SET, location]); 
      this.specifiers = specifiers; 
    } }, ParseTree, true, true); 
  var ExpressionStatement = traceur.runtime.createClass({ constructor: function(location, expression) { 
      traceur.runtime.superCall(this, ExpressionStatement, "constructor",[EXPRESSION_STATEMENT, location]); 
      this.expression = expression; 
    } }, ParseTree, true, true); 
  var Finally = traceur.runtime.createClass({ constructor: function(location, block) { 
      traceur.runtime.superCall(this, Finally, "constructor",[FINALLY, location]); 
      this.block = block; 
    } }, ParseTree, true, true); 
  var ForOfStatement = traceur.runtime.createClass({ constructor: function(location, initializer, collection, body) { 
      traceur.runtime.superCall(this, ForOfStatement, "constructor",[FOR_OF_STATEMENT, location]); 
      this.initializer = initializer; 
      this.collection = collection; 
      this.body = body; 
    } }, ParseTree, true, true); 
  var ForInStatement = traceur.runtime.createClass({ constructor: function(location, initializer, collection, body) { 
      traceur.runtime.superCall(this, ForInStatement, "constructor",[FOR_IN_STATEMENT, location]); 
      this.initializer = initializer; 
      this.collection = collection; 
      this.body = body; 
    } }, ParseTree, true, true); 
  var FormalParameterList = traceur.runtime.createClass({ constructor: function(location, parameters) { 
      traceur.runtime.superCall(this, FormalParameterList, "constructor",[FORMAL_PARAMETER_LIST, location]); 
      this.parameters = parameters; 
    } }, ParseTree, true, true); 
  var ForStatement = traceur.runtime.createClass({ constructor: function(location, initializer, condition, increment, body) { 
      traceur.runtime.superCall(this, ForStatement, "constructor",[FOR_STATEMENT, location]); 
      this.initializer = initializer; 
      this.condition = condition; 
      this.increment = increment; 
      this.body = body; 
    } }, ParseTree, true, true); 
  var FunctionDeclaration = traceur.runtime.createClass({ constructor: function(location, name, isGenerator, formalParameterList, functionBody) { 
      traceur.runtime.superCall(this, FunctionDeclaration, "constructor",[FUNCTION_DECLARATION, location]); 
      this.name = name; 
      this.isGenerator = isGenerator; 
      this.formalParameterList = formalParameterList; 
      this.functionBody = functionBody; 
    } }, ParseTree, true, true); 
  var GeneratorComprehension = traceur.runtime.createClass({ constructor: function(location, expression, comprehensionForList, ifExpression) { 
      traceur.runtime.superCall(this, GeneratorComprehension, "constructor",[GENERATOR_COMPREHENSION, location]); 
      this.expression = expression; 
      this.comprehensionForList = comprehensionForList; 
      this.ifExpression = ifExpression; 
    } }, ParseTree, true, true); 
  var GetAccessor = traceur.runtime.createClass({ constructor: function(location, propertyName, body) { 
      traceur.runtime.superCall(this, GetAccessor, "constructor",[GET_ACCESSOR, location]); 
      this.propertyName = propertyName; 
      this.body = body; 
    } }, ParseTree, true, true); 
  var IdentifierExpression = traceur.runtime.createClass({ constructor: function(location, identifierToken) { 
      traceur.runtime.superCall(this, IdentifierExpression, "constructor",[IDENTIFIER_EXPRESSION, location]); 
      this.identifierToken = identifierToken; 
    } }, ParseTree, true, true); 
  var IfStatement = traceur.runtime.createClass({ constructor: function(location, condition, ifClause, elseClause) { 
      traceur.runtime.superCall(this, IfStatement, "constructor",[IF_STATEMENT, location]); 
      this.condition = condition; 
      this.ifClause = ifClause; 
      this.elseClause = elseClause; 
    } }, ParseTree, true, true); 
  var ImportDeclaration = traceur.runtime.createClass({ constructor: function(location, importPathList) { 
      traceur.runtime.superCall(this, ImportDeclaration, "constructor",[IMPORT_DECLARATION, location]); 
      this.importPathList = importPathList; 
    } }, ParseTree, true, true); 
  var ImportBinding = traceur.runtime.createClass({ constructor: function(location, moduleExpression, importSpecifierSet) { 
      traceur.runtime.superCall(this, ImportBinding, "constructor",[IMPORT_BINDING, location]); 
      this.moduleExpression = moduleExpression; 
      this.importSpecifierSet = importSpecifierSet; 
    } }, ParseTree, true, true); 
  var ImportSpecifier = traceur.runtime.createClass({ constructor: function(location, lhs, rhs) { 
      traceur.runtime.superCall(this, ImportSpecifier, "constructor",[IMPORT_SPECIFIER, location]); 
      this.lhs = lhs; 
      this.rhs = rhs; 
    } }, ParseTree, true, true); 
  var ImportSpecifierSet = traceur.runtime.createClass({ constructor: function(location, specifiers) { 
      traceur.runtime.superCall(this, ImportSpecifierSet, "constructor",[IMPORT_SPECIFIER_SET, location]); 
      this.specifiers = specifiers; 
    } }, ParseTree, true, true); 
  var LabelledStatement = traceur.runtime.createClass({ constructor: function(location, name, statement) { 
      traceur.runtime.superCall(this, LabelledStatement, "constructor",[LABELLED_STATEMENT, location]); 
      this.name = name; 
      this.statement = statement; 
    } }, ParseTree, true, true); 
  var LiteralExpression = traceur.runtime.createClass({ constructor: function(location, literalToken) { 
      traceur.runtime.superCall(this, LiteralExpression, "constructor",[LITERAL_EXPRESSION, location]); 
      this.literalToken = literalToken; 
    } }, ParseTree, true, true); 
  var MemberExpression = traceur.runtime.createClass({ constructor: function(location, operand, memberName) { 
      traceur.runtime.superCall(this, MemberExpression, "constructor",[MEMBER_EXPRESSION, location]); 
      this.operand = operand; 
      this.memberName = memberName; 
    } }, ParseTree, true, true); 
  var MemberLookupExpression = traceur.runtime.createClass({ constructor: function(location, operand, memberExpression) { 
      traceur.runtime.superCall(this, MemberLookupExpression, "constructor",[MEMBER_LOOKUP_EXPRESSION, location]); 
      this.operand = operand; 
      this.memberExpression = memberExpression; 
    } }, ParseTree, true, true); 
  var MissingPrimaryExpression = traceur.runtime.createClass({ constructor: function(location, nextToken) { 
      traceur.runtime.superCall(this, MissingPrimaryExpression, "constructor",[MISSING_PRIMARY_EXPRESSION, location]); 
      this.nextToken = nextToken; 
    } }, ParseTree, true, true); 
  var ModuleDeclaration = traceur.runtime.createClass({ constructor: function(location, specifiers) { 
      traceur.runtime.superCall(this, ModuleDeclaration, "constructor",[MODULE_DECLARATION, location]); 
      this.specifiers = specifiers; 
    } }, ParseTree, true, true); 
  var ModuleDefinition = traceur.runtime.createClass({ constructor: function(location, name, elements) { 
      traceur.runtime.superCall(this, ModuleDefinition, "constructor",[MODULE_DEFINITION, location]); 
      this.name = name; 
      this.elements = elements; 
    } }, ParseTree, true, true); 
  var ModuleExpression = traceur.runtime.createClass({ constructor: function(location, reference, identifiers) { 
      traceur.runtime.superCall(this, ModuleExpression, "constructor",[MODULE_EXPRESSION, location]); 
      this.reference = reference; 
      this.identifiers = identifiers; 
    } }, ParseTree, true, true); 
  var ModuleRequire = traceur.runtime.createClass({ constructor: function(location, url) { 
      traceur.runtime.superCall(this, ModuleRequire, "constructor",[MODULE_REQUIRE, location]); 
      this.url = url; 
    } }, ParseTree, true, true); 
  var ModuleSpecifier = traceur.runtime.createClass({ constructor: function(location, identifier, expression) { 
      traceur.runtime.superCall(this, ModuleSpecifier, "constructor",[MODULE_SPECIFIER, location]); 
      this.identifier = identifier; 
      this.expression = expression; 
    } }, ParseTree, true, true); 
  var NameStatement = traceur.runtime.createClass({ constructor: function(location, declarations) { 
      traceur.runtime.superCall(this, NameStatement, "constructor",[NAME_STATEMENT, location]); 
      this.declarations = declarations; 
    } }, ParseTree, true, true); 
  var NewExpression = traceur.runtime.createClass({ constructor: function(location, operand, args) { 
      traceur.runtime.superCall(this, NewExpression, "constructor",[NEW_EXPRESSION, location]); 
      this.operand = operand; 
      this.args = args; 
    } }, ParseTree, true, true); 
  var ObjectLiteralExpression = traceur.runtime.createClass({ constructor: function(location, propertyNameAndValues) { 
      traceur.runtime.superCall(this, ObjectLiteralExpression, "constructor",[OBJECT_LITERAL_EXPRESSION, location]); 
      this.propertyNameAndValues = propertyNameAndValues; 
    } }, ParseTree, true, true); 
  var ObjectPatternField = traceur.runtime.createClass({ constructor: function(location, identifier, element) { 
      traceur.runtime.superCall(this, ObjectPatternField, "constructor",[OBJECT_PATTERN_FIELD, location]); 
      this.identifier = identifier; 
      this.element = element; 
    } }, ParseTree, true, true); 
  var ObjectPattern = traceur.runtime.createClass({ constructor: function(location, fields) { 
      traceur.runtime.superCall(this, ObjectPattern, "constructor",[OBJECT_PATTERN, location]); 
      this.fields = fields; 
    } }, ParseTree, true, true); 
  var ParenExpression = traceur.runtime.createClass({ constructor: function(location, expression) { 
      traceur.runtime.superCall(this, ParenExpression, "constructor",[PAREN_EXPRESSION, location]); 
      this.expression = expression; 
    } }, ParseTree, true, true); 
  var PostfixExpression = traceur.runtime.createClass({ constructor: function(location, operand, operator) { 
      traceur.runtime.superCall(this, PostfixExpression, "constructor",[POSTFIX_EXPRESSION, location]); 
      this.operand = operand; 
      this.operator = operator; 
    } }, ParseTree, true, true); 
  var Program = traceur.runtime.createClass({ constructor: function(location, programElements) { 
      traceur.runtime.superCall(this, Program, "constructor",[PROGRAM, location]); 
      this.programElements = programElements; 
    } }, ParseTree, true, true); 
  var PropertyMethodAssignment = traceur.runtime.createClass({ constructor: function(location, name, isGenerator, formalParameterList, functionBody) { 
      traceur.runtime.superCall(this, PropertyMethodAssignment, "constructor",[PROPERTY_METHOD_ASSIGNMENT, location]); 
      this.name = name; 
      this.isGenerator = isGenerator; 
      this.formalParameterList = formalParameterList; 
      this.functionBody = functionBody; 
    } }, ParseTree, true, true); 
  var PropertyNameAssignment = traceur.runtime.createClass({ constructor: function(location, name, value) { 
      traceur.runtime.superCall(this, PropertyNameAssignment, "constructor",[PROPERTY_NAME_ASSIGNMENT, location]); 
      this.name = name; 
      this.value = value; 
    } }, ParseTree, true, true); 
  var PropertyNameShorthand = traceur.runtime.createClass({ constructor: function(location, name) { 
      traceur.runtime.superCall(this, PropertyNameShorthand, "constructor",[PROPERTY_NAME_SHORTHAND, location]); 
      this.name = name; 
    } }, ParseTree, true, true); 
  var QuasiLiteralExpression = traceur.runtime.createClass({ constructor: function(location, operand, elements) { 
      traceur.runtime.superCall(this, QuasiLiteralExpression, "constructor",[QUASI_LITERAL_EXPRESSION, location]); 
      this.operand = operand; 
      this.elements = elements; 
    } }, ParseTree, true, true); 
  var QuasiLiteralPortion = traceur.runtime.createClass({ constructor: function(location, value) { 
      traceur.runtime.superCall(this, QuasiLiteralPortion, "constructor",[QUASI_LITERAL_PORTION, location]); 
      this.value = value; 
    } }, ParseTree, true, true); 
  var QuasiSubstitution = traceur.runtime.createClass({ constructor: function(location, expression) { 
      traceur.runtime.superCall(this, QuasiSubstitution, "constructor",[QUASI_SUBSTITUTION, location]); 
      this.expression = expression; 
    } }, ParseTree, true, true); 
  var RequiresMember = traceur.runtime.createClass({ constructor: function(location, name) { 
      traceur.runtime.superCall(this, RequiresMember, "constructor",[REQUIRES_MEMBER, location]); 
      this.name = name; 
    } }, ParseTree, true, true); 
  var RestParameter = traceur.runtime.createClass({ constructor: function(location, identifier) { 
      traceur.runtime.superCall(this, RestParameter, "constructor",[REST_PARAMETER, location]); 
      this.identifier = identifier; 
    } }, ParseTree, true, true); 
  var ReturnStatement = traceur.runtime.createClass({ constructor: function(location, expression) { 
      traceur.runtime.superCall(this, ReturnStatement, "constructor",[RETURN_STATEMENT, location]); 
      this.expression = expression; 
    } }, ParseTree, true, true); 
  var SetAccessor = traceur.runtime.createClass({ constructor: function(location, propertyName, parameter, body) { 
      traceur.runtime.superCall(this, SetAccessor, "constructor",[SET_ACCESSOR, location]); 
      this.propertyName = propertyName; 
      this.parameter = parameter; 
      this.body = body; 
    } }, ParseTree, true, true); 
  var SpreadExpression = traceur.runtime.createClass({ constructor: function(location, expression) { 
      traceur.runtime.superCall(this, SpreadExpression, "constructor",[SPREAD_EXPRESSION, location]); 
      this.expression = expression; 
    } }, ParseTree, true, true); 
  var SpreadPatternElement = traceur.runtime.createClass({ constructor: function(location, lvalue) { 
      traceur.runtime.superCall(this, SpreadPatternElement, "constructor",[SPREAD_PATTERN_ELEMENT, location]); 
      this.lvalue = lvalue; 
    } }, ParseTree, true, true); 
  var SuperExpression = traceur.runtime.createClass({ constructor: function(location) { 
      traceur.runtime.superCall(this, SuperExpression, "constructor",[SUPER_EXPRESSION, location]); 
    } }, ParseTree, true, true); 
  var SwitchStatement = traceur.runtime.createClass({ constructor: function(location, expression, caseClauses) { 
      traceur.runtime.superCall(this, SwitchStatement, "constructor",[SWITCH_STATEMENT, location]); 
      this.expression = expression; 
      this.caseClauses = caseClauses; 
    } }, ParseTree, true, true); 
  var ThisExpression = traceur.runtime.createClass({ constructor: function(location) { 
      traceur.runtime.superCall(this, ThisExpression, "constructor",[THIS_EXPRESSION, location]); 
    } }, ParseTree, true, true); 
  var ThrowStatement = traceur.runtime.createClass({ constructor: function(location, value) { 
      traceur.runtime.superCall(this, ThrowStatement, "constructor",[THROW_STATEMENT, location]); 
      this.value = value; 
    } }, ParseTree, true, true); 
  var TryStatement = traceur.runtime.createClass({ constructor: function(location, body, catchBlock, finallyBlock) { 
      traceur.runtime.superCall(this, TryStatement, "constructor",[TRY_STATEMENT, location]); 
      this.body = body; 
      this.catchBlock = catchBlock; 
      this.finallyBlock = finallyBlock; 
    } }, ParseTree, true, true); 
  var UnaryExpression = traceur.runtime.createClass({ constructor: function(location, operator, operand) { 
      traceur.runtime.superCall(this, UnaryExpression, "constructor",[UNARY_EXPRESSION, location]); 
      this.operator = operator; 
      this.operand = operand; 
    } }, ParseTree, true, true); 
  var VariableDeclarationList = traceur.runtime.createClass({ constructor: function(location, declarationType, declarations) { 
      traceur.runtime.superCall(this, VariableDeclarationList, "constructor",[VARIABLE_DECLARATION_LIST, location]); 
      this.declarationType = declarationType; 
      this.declarations = declarations; 
    } }, ParseTree, true, true); 
  var VariableDeclaration = traceur.runtime.createClass({ constructor: function(location, lvalue, initializer) { 
      traceur.runtime.superCall(this, VariableDeclaration, "constructor",[VARIABLE_DECLARATION, location]); 
      this.lvalue = lvalue; 
      this.initializer = initializer; 
    } }, ParseTree, true, true); 
  var VariableStatement = traceur.runtime.createClass({ constructor: function(location, declarations) { 
      traceur.runtime.superCall(this, VariableStatement, "constructor",[VARIABLE_STATEMENT, location]); 
      this.declarations = declarations; 
    } }, ParseTree, true, true); 
  var WhileStatement = traceur.runtime.createClass({ constructor: function(location, condition, body) { 
      traceur.runtime.superCall(this, WhileStatement, "constructor",[WHILE_STATEMENT, location]); 
      this.condition = condition; 
      this.body = body; 
    } }, ParseTree, true, true); 
  var WithStatement = traceur.runtime.createClass({ constructor: function(location, expression, body) { 
      traceur.runtime.superCall(this, WithStatement, "constructor",[WITH_STATEMENT, location]); 
      this.expression = expression; 
      this.body = body; 
    } }, ParseTree, true, true); 
  var YieldStatement = traceur.runtime.createClass({ constructor: function(location, expression, isYieldFor) { 
      traceur.runtime.superCall(this, YieldStatement, "constructor",[YIELD_STATEMENT, location]); 
      this.expression = expression; 
      this.isYieldFor = isYieldFor; 
    } }, ParseTree, true, true); 
  return Object.preventExtensions(Object.create(null, { 
    NullTree: { 
      get: function() { 
        return NullTree; 
      }, 
      enumerable: true 
    }, 
    ParseTree: { 
      get: function() { 
        return ParseTree; 
      }, 
      enumerable: true 
    }, 
    ParseTreeType: { 
      get: function() { 
        return ParseTreeType; 
      }, 
      enumerable: true 
    }, 
    ArgumentList: { 
      get: function() { 
        return ArgumentList; 
      }, 
      enumerable: true 
    }, 
    ArrayComprehension: { 
      get: function() { 
        return ArrayComprehension; 
      }, 
      enumerable: true 
    }, 
    ArrayLiteralExpression: { 
      get: function() { 
        return ArrayLiteralExpression; 
      }, 
      enumerable: true 
    }, 
    ArrayPattern: { 
      get: function() { 
        return ArrayPattern; 
      }, 
      enumerable: true 
    }, 
    ArrowFunctionExpression: { 
      get: function() { 
        return ArrowFunctionExpression; 
      }, 
      enumerable: true 
    }, 
    AtNameExpression: { 
      get: function() { 
        return AtNameExpression; 
      }, 
      enumerable: true 
    }, 
    AtNameDeclaration: { 
      get: function() { 
        return AtNameDeclaration; 
      }, 
      enumerable: true 
    }, 
    AwaitStatement: { 
      get: function() { 
        return AwaitStatement; 
      }, 
      enumerable: true 
    }, 
    BinaryOperator: { 
      get: function() { 
        return BinaryOperator; 
      }, 
      enumerable: true 
    }, 
    BindThisParameter: { 
      get: function() { 
        return BindThisParameter; 
      }, 
      enumerable: true 
    }, 
    BindingIdentifier: { 
      get: function() { 
        return BindingIdentifier; 
      }, 
      enumerable: true 
    }, 
    BindingElement: { 
      get: function() { 
        return BindingElement; 
      }, 
      enumerable: true 
    }, 
    Block: { 
      get: function() { 
        return Block; 
      }, 
      enumerable: true 
    }, 
    BreakStatement: { 
      get: function() { 
        return BreakStatement; 
      }, 
      enumerable: true 
    }, 
    CallExpression: { 
      get: function() { 
        return CallExpression; 
      }, 
      enumerable: true 
    }, 
    CascadeExpression: { 
      get: function() { 
        return CascadeExpression; 
      }, 
      enumerable: true 
    }, 
    CaseClause: { 
      get: function() { 
        return CaseClause; 
      }, 
      enumerable: true 
    }, 
    Catch: { 
      get: function() { 
        return Catch; 
      }, 
      enumerable: true 
    }, 
    ClassDeclaration: { 
      get: function() { 
        return ClassDeclaration; 
      }, 
      enumerable: true 
    }, 
    ClassExpression: { 
      get: function() { 
        return ClassExpression; 
      }, 
      enumerable: true 
    }, 
    CommaExpression: { 
      get: function() { 
        return CommaExpression; 
      }, 
      enumerable: true 
    }, 
    ComprehensionFor: { 
      get: function() { 
        return ComprehensionFor; 
      }, 
      enumerable: true 
    }, 
    ConditionalExpression: { 
      get: function() { 
        return ConditionalExpression; 
      }, 
      enumerable: true 
    }, 
    ContinueStatement: { 
      get: function() { 
        return ContinueStatement; 
      }, 
      enumerable: true 
    }, 
    DebuggerStatement: { 
      get: function() { 
        return DebuggerStatement; 
      }, 
      enumerable: true 
    }, 
    DefaultClause: { 
      get: function() { 
        return DefaultClause; 
      }, 
      enumerable: true 
    }, 
    DoWhileStatement: { 
      get: function() { 
        return DoWhileStatement; 
      }, 
      enumerable: true 
    }, 
    EmptyStatement: { 
      get: function() { 
        return EmptyStatement; 
      }, 
      enumerable: true 
    }, 
    ExportDeclaration: { 
      get: function() { 
        return ExportDeclaration; 
      }, 
      enumerable: true 
    }, 
    ExportMappingList: { 
      get: function() { 
        return ExportMappingList; 
      }, 
      enumerable: true 
    }, 
    ExportMapping: { 
      get: function() { 
        return ExportMapping; 
      }, 
      enumerable: true 
    }, 
    ExportSpecifier: { 
      get: function() { 
        return ExportSpecifier; 
      }, 
      enumerable: true 
    }, 
    ExportSpecifierSet: { 
      get: function() { 
        return ExportSpecifierSet; 
      }, 
      enumerable: true 
    }, 
    ExpressionStatement: { 
      get: function() { 
        return ExpressionStatement; 
      }, 
      enumerable: true 
    }, 
    Finally: { 
      get: function() { 
        return Finally; 
      }, 
      enumerable: true 
    }, 
    ForOfStatement: { 
      get: function() { 
        return ForOfStatement; 
      }, 
      enumerable: true 
    }, 
    ForInStatement: { 
      get: function() { 
        return ForInStatement; 
      }, 
      enumerable: true 
    }, 
    FormalParameterList: { 
      get: function() { 
        return FormalParameterList; 
      }, 
      enumerable: true 
    }, 
    ForStatement: { 
      get: function() { 
        return ForStatement; 
      }, 
      enumerable: true 
    }, 
    FunctionDeclaration: { 
      get: function() { 
        return FunctionDeclaration; 
      }, 
      enumerable: true 
    }, 
    GeneratorComprehension: { 
      get: function() { 
        return GeneratorComprehension; 
      }, 
      enumerable: true 
    }, 
    GetAccessor: { 
      get: function() { 
        return GetAccessor; 
      }, 
      enumerable: true 
    }, 
    IdentifierExpression: { 
      get: function() { 
        return IdentifierExpression; 
      }, 
      enumerable: true 
    }, 
    IfStatement: { 
      get: function() { 
        return IfStatement; 
      }, 
      enumerable: true 
    }, 
    ImportDeclaration: { 
      get: function() { 
        return ImportDeclaration; 
      }, 
      enumerable: true 
    }, 
    ImportBinding: { 
      get: function() { 
        return ImportBinding; 
      }, 
      enumerable: true 
    }, 
    ImportSpecifier: { 
      get: function() { 
        return ImportSpecifier; 
      }, 
      enumerable: true 
    }, 
    ImportSpecifierSet: { 
      get: function() { 
        return ImportSpecifierSet; 
      }, 
      enumerable: true 
    }, 
    LabelledStatement: { 
      get: function() { 
        return LabelledStatement; 
      }, 
      enumerable: true 
    }, 
    LiteralExpression: { 
      get: function() { 
        return LiteralExpression; 
      }, 
      enumerable: true 
    }, 
    MemberExpression: { 
      get: function() { 
        return MemberExpression; 
      }, 
      enumerable: true 
    }, 
    MemberLookupExpression: { 
      get: function() { 
        return MemberLookupExpression; 
      }, 
      enumerable: true 
    }, 
    MissingPrimaryExpression: { 
      get: function() { 
        return MissingPrimaryExpression; 
      }, 
      enumerable: true 
    }, 
    ModuleDeclaration: { 
      get: function() { 
        return ModuleDeclaration; 
      }, 
      enumerable: true 
    }, 
    ModuleDefinition: { 
      get: function() { 
        return ModuleDefinition; 
      }, 
      enumerable: true 
    }, 
    ModuleExpression: { 
      get: function() { 
        return ModuleExpression; 
      }, 
      enumerable: true 
    }, 
    ModuleRequire: { 
      get: function() { 
        return ModuleRequire; 
      }, 
      enumerable: true 
    }, 
    ModuleSpecifier: { 
      get: function() { 
        return ModuleSpecifier; 
      }, 
      enumerable: true 
    }, 
    NameStatement: { 
      get: function() { 
        return NameStatement; 
      }, 
      enumerable: true 
    }, 
    NewExpression: { 
      get: function() { 
        return NewExpression; 
      }, 
      enumerable: true 
    }, 
    ObjectLiteralExpression: { 
      get: function() { 
        return ObjectLiteralExpression; 
      }, 
      enumerable: true 
    }, 
    ObjectPatternField: { 
      get: function() { 
        return ObjectPatternField; 
      }, 
      enumerable: true 
    }, 
    ObjectPattern: { 
      get: function() { 
        return ObjectPattern; 
      }, 
      enumerable: true 
    }, 
    ParenExpression: { 
      get: function() { 
        return ParenExpression; 
      }, 
      enumerable: true 
    }, 
    PostfixExpression: { 
      get: function() { 
        return PostfixExpression; 
      }, 
      enumerable: true 
    }, 
    Program: { 
      get: function() { 
        return Program; 
      }, 
      enumerable: true 
    }, 
    PropertyMethodAssignment: { 
      get: function() { 
        return PropertyMethodAssignment; 
      }, 
      enumerable: true 
    }, 
    PropertyNameAssignment: { 
      get: function() { 
        return PropertyNameAssignment; 
      }, 
      enumerable: true 
    }, 
    PropertyNameShorthand: { 
      get: function() { 
        return PropertyNameShorthand; 
      }, 
      enumerable: true 
    }, 
    QuasiLiteralExpression: { 
      get: function() { 
        return QuasiLiteralExpression; 
      }, 
      enumerable: true 
    }, 
    QuasiLiteralPortion: { 
      get: function() { 
        return QuasiLiteralPortion; 
      }, 
      enumerable: true 
    }, 
    QuasiSubstitution: { 
      get: function() { 
        return QuasiSubstitution; 
      }, 
      enumerable: true 
    }, 
    RequiresMember: { 
      get: function() { 
        return RequiresMember; 
      }, 
      enumerable: true 
    }, 
    RestParameter: { 
      get: function() { 
        return RestParameter; 
      }, 
      enumerable: true 
    }, 
    ReturnStatement: { 
      get: function() { 
        return ReturnStatement; 
      }, 
      enumerable: true 
    }, 
    SetAccessor: { 
      get: function() { 
        return SetAccessor; 
      }, 
      enumerable: true 
    }, 
    SpreadExpression: { 
      get: function() { 
        return SpreadExpression; 
      }, 
      enumerable: true 
    }, 
    SpreadPatternElement: { 
      get: function() { 
        return SpreadPatternElement; 
      }, 
      enumerable: true 
    }, 
    SuperExpression: { 
      get: function() { 
        return SuperExpression; 
      }, 
      enumerable: true 
    }, 
    SwitchStatement: { 
      get: function() { 
        return SwitchStatement; 
      }, 
      enumerable: true 
    }, 
    ThisExpression: { 
      get: function() { 
        return ThisExpression; 
      }, 
      enumerable: true 
    }, 
    ThrowStatement: { 
      get: function() { 
        return ThrowStatement; 
      }, 
      enumerable: true 
    }, 
    TryStatement: { 
      get: function() { 
        return TryStatement; 
      }, 
      enumerable: true 
    }, 
    UnaryExpression: { 
      get: function() { 
        return UnaryExpression; 
      }, 
      enumerable: true 
    }, 
    VariableDeclarationList: { 
      get: function() { 
        return VariableDeclarationList; 
      }, 
      enumerable: true 
    }, 
    VariableDeclaration: { 
      get: function() { 
        return VariableDeclaration; 
      }, 
      enumerable: true 
    }, 
    VariableStatement: { 
      get: function() { 
        return VariableStatement; 
      }, 
      enumerable: true 
    }, 
    WhileStatement: { 
      get: function() { 
        return WhileStatement; 
      }, 
      enumerable: true 
    }, 
    WithStatement: { 
      get: function() { 
        return WithStatement; 
      }, 
      enumerable: true 
    }, 
    YieldStatement: { 
      get: function() { 
        return YieldStatement; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var $src_codegeneration_ParseTreeTransformer_js =(function() { 
  "use strict"; 
  var $__45 = $src_syntax_trees_ParseTree_js, getTreeNameForType = $__45.getTreeNameForType; 
  var $__46 = $src_syntax_trees_ParseTrees_js, NullTree = $__46.NullTree, ParseTree = $__46.ParseTree, ParseTreeType = $__46.ParseTreeType, ArgumentList = $__46.ArgumentList, ArrayComprehension = $__46.ArrayComprehension, ArrayLiteralExpression = $__46.ArrayLiteralExpression, ArrayPattern = $__46.ArrayPattern, ArrowFunctionExpression = $__46.ArrowFunctionExpression, AtNameExpression = $__46.AtNameExpression, AtNameDeclaration = $__46.AtNameDeclaration, AwaitStatement = $__46.AwaitStatement, BinaryOperator = $__46.BinaryOperator, BindThisParameter = $__46.BindThisParameter, BindingIdentifier = $__46.BindingIdentifier, BindingElement = $__46.BindingElement, Block = $__46.Block, BreakStatement = $__46.BreakStatement, CallExpression = $__46.CallExpression, CascadeExpression = $__46.CascadeExpression, CaseClause = $__46.CaseClause, Catch = $__46.Catch, ClassDeclaration = $__46.ClassDeclaration, ClassExpression = $__46.ClassExpression, CommaExpression = $__46.CommaExpression, ComprehensionFor = $__46.ComprehensionFor, ConditionalExpression = $__46.ConditionalExpression, ContinueStatement = $__46.ContinueStatement, DebuggerStatement = $__46.DebuggerStatement, DefaultClause = $__46.DefaultClause, DoWhileStatement = $__46.DoWhileStatement, EmptyStatement = $__46.EmptyStatement, ExportDeclaration = $__46.ExportDeclaration, ExportMappingList = $__46.ExportMappingList, ExportMapping = $__46.ExportMapping, ExportSpecifier = $__46.ExportSpecifier, ExportSpecifierSet = $__46.ExportSpecifierSet, ExpressionStatement = $__46.ExpressionStatement, Finally = $__46.Finally, ForOfStatement = $__46.ForOfStatement, ForInStatement = $__46.ForInStatement, FormalParameterList = $__46.FormalParameterList, ForStatement = $__46.ForStatement, FunctionDeclaration = $__46.FunctionDeclaration, GeneratorComprehension = $__46.GeneratorComprehension, GetAccessor = $__46.GetAccessor, IdentifierExpression = $__46.IdentifierExpression, IfStatement = $__46.IfStatement, ImportDeclaration = $__46.ImportDeclaration, ImportBinding = $__46.ImportBinding, ImportSpecifier = $__46.ImportSpecifier, ImportSpecifierSet = $__46.ImportSpecifierSet, LabelledStatement = $__46.LabelledStatement, LiteralExpression = $__46.LiteralExpression, MemberExpression = $__46.MemberExpression, MemberLookupExpression = $__46.MemberLookupExpression, MissingPrimaryExpression = $__46.MissingPrimaryExpression, ModuleDeclaration = $__46.ModuleDeclaration, ModuleDefinition = $__46.ModuleDefinition, ModuleExpression = $__46.ModuleExpression, ModuleRequire = $__46.ModuleRequire, ModuleSpecifier = $__46.ModuleSpecifier, NameStatement = $__46.NameStatement, NewExpression = $__46.NewExpression, ObjectLiteralExpression = $__46.ObjectLiteralExpression, ObjectPatternField = $__46.ObjectPatternField, ObjectPattern = $__46.ObjectPattern, ParenExpression = $__46.ParenExpression, PostfixExpression = $__46.PostfixExpression, Program = $__46.Program, PropertyMethodAssignment = $__46.PropertyMethodAssignment, PropertyNameAssignment = $__46.PropertyNameAssignment, PropertyNameShorthand = $__46.PropertyNameShorthand, QuasiLiteralExpression = $__46.QuasiLiteralExpression, QuasiLiteralPortion = $__46.QuasiLiteralPortion, QuasiSubstitution = $__46.QuasiSubstitution, RequiresMember = $__46.RequiresMember, RestParameter = $__46.RestParameter, ReturnStatement = $__46.ReturnStatement, SetAccessor = $__46.SetAccessor, SpreadExpression = $__46.SpreadExpression, SpreadPatternElement = $__46.SpreadPatternElement, SuperExpression = $__46.SuperExpression, SwitchStatement = $__46.SwitchStatement, ThisExpression = $__46.ThisExpression, ThrowStatement = $__46.ThrowStatement, TryStatement = $__46.TryStatement, UnaryExpression = $__46.UnaryExpression, VariableDeclarationList = $__46.VariableDeclarationList, VariableDeclaration = $__46.VariableDeclaration, VariableStatement = $__46.VariableStatement, WhileStatement = $__46.WhileStatement, WithStatement = $__46.WithStatement, YieldStatement = $__46.YieldStatement; 
  var ParseTreeTransformer = traceur.runtime.createClass({ 
    transformAny: function(tree) { 
      if(tree == null) { 
        return null; 
      } 
      var name = getTreeNameForType(tree.type); 
      return this[("transform" + name)](tree); 
    }, 
    transformList: function(list) { 
      if(list == null || list.length == 0) { 
        return list; 
      } 
      var builder = null; 
      for(var index = 0; index < list.length; index ++) { 
        var element = list[index]; 
        var transformed = this.transformAny(element); 
        if(builder != null || element != transformed) { 
          if(builder == null) { 
            builder = list.slice(0, index); 
          } 
          builder.push(transformed); 
        } 
      } 
      return builder || list; 
    }, 
    toSourceElement: function(tree) { 
      return tree.isSourceElement() ? tree: new ExpressionStatement(tree.location, tree); 
    }, 
    transformSourceElements: function(list) { 
      if(list == null || list.length == 0) { 
        return list; 
      } 
      var builder = null; 
      for(var index = 0; index < list.length; index ++) { 
        var element = list[index]; 
        var transformed = this.toSourceElement(this.transformAny(element)); 
        if(builder != null || element != transformed) { 
          if(builder == null) { 
            builder = list.slice(0, index); 
          } 
          builder.push(transformed); 
        } 
      } 
      return builder || list; 
    }, 
    transformArgumentList: function(tree) { 
      var args = this.transformList(tree.args); 
      if(args == tree.args) { 
        return tree; 
      } 
      return new ArgumentList(tree.location, args); 
    }, 
    transformArrayComprehension: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      var comprehensionForList = this.transformList(tree.comprehensionForList); 
      var ifExpression = this.transformAny(tree.ifExpression); 
      if(expression === tree.expression && comprehensionForList === tree.comprehensionForList && ifExpression === tree.ifExpression) { 
        return tree; 
      } 
      return new ArrayComprehension(tree.location, expression, comprehensionForList, ifExpression); 
    }, 
    transformArrayLiteralExpression: function(tree) { 
      var elements = this.transformList(tree.elements); 
      if(elements == tree.elements) { 
        return tree; 
      } 
      return new ArrayLiteralExpression(tree.location, elements); 
    }, 
    transformArrayPattern: function(tree) { 
      var elements = this.transformList(tree.elements); 
      if(elements == tree.elements) { 
        return tree; 
      } 
      return new ArrayPattern(tree.location, elements); 
    }, 
    transformArrowFunctionExpression: function(tree) { 
      var parameters = this.transformAny(tree.formalParameters); 
      var body = this.transformAny(tree.functionBody); 
      if(parameters == tree.formalParameters && body == tree.functionBody) { 
        return tree; 
      } 
      return new ArrowFunctionExpression(null, parameters, body); 
    }, 
    transformAtNameExpression: function(tree) { 
      return tree; 
    }, 
    transformAtNameDeclaration: function(tree) { 
      var initializer = this.transformAny(tree.initializer); 
      if(initializer === tree.initializer) return tree; 
      return new AtNameDeclaration(tree.location, tree.atNameToken, initializer); 
    }, 
    transformAwaitStatement: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      if(tree.expression == expression) { 
        return tree; 
      } 
      return new AwaitStatement(tree.location, tree.identifier, expression); 
    }, 
    transformBinaryOperator: function(tree) { 
      var left = this.transformAny(tree.left); 
      var right = this.transformAny(tree.right); 
      if(left == tree.left && right == tree.right) { 
        return tree; 
      } 
      return new BinaryOperator(tree.location, left, tree.operator, right); 
    }, 
    transformBindThisParameter: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      if(tree.expression == expression) { 
        return tree; 
      } 
      return new BindThisParameter(tree.location, expression); 
    }, 
    transformBindingElement: function(tree) { 
      var binding = this.transformAny(tree.binding); 
      var initializer = this.transformAny(tree.initializer); 
      if(binding === tree.binding && initializer === tree.initializer) return tree; 
      return new BindingElement(tree.location, binding, initializer); 
    }, 
    transformBindingIdentifier: function(tree) { 
      return tree; 
    }, 
    transformBlock: function(tree) { 
      var elements = this.transformList(tree.statements); 
      if(elements == tree.statements) { 
        return tree; 
      } 
      return new Block(tree.location, elements); 
    }, 
    transformBreakStatement: function(tree) { 
      return tree; 
    }, 
    transformCallExpression: function(tree) { 
      var operand = this.transformAny(tree.operand); 
      var args = this.transformAny(tree.args); 
      if(operand == tree.operand && args == tree.args) { 
        return tree; 
      } 
      return new CallExpression(tree.location, operand, args); 
    }, 
    transformCaseClause: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      var statements = this.transformList(tree.statements); 
      if(expression == tree.expression && statements == tree.statements) { 
        return tree; 
      } 
      return new CaseClause(tree.location, expression, statements); 
    }, 
    transformCatch: function(tree) { 
      var catchBody = this.transformAny(tree.catchBody); 
      var binding = this.transformAny(tree.binding); 
      if(catchBody == tree.catchBody && binding == tree.binding) { 
        return tree; 
      } 
      return new Catch(tree.location, binding, catchBody); 
    }, 
    transformCascadeExpression: function(tree) { 
      var operand = this.transformAny(tree.operand); 
      var expressions = this.transformList(tree.expressions); 
      if(operand == tree.operand && expressions == tree.expressions) { 
        return tree; 
      } 
      return new CascadeExpression(tree.location, operand, expressions); 
    }, 
    transformClassDeclaration: function(tree) { 
      var superClass = this.transformAny(tree.superClass); 
      var elements = this.transformList(tree.elements); 
      if(superClass == tree.superClass && elements == tree.elements) return tree; 
      return new ClassDeclaration(tree.location, tree.name, superClass, elements); 
    }, 
    transformClassExpression: function(tree) { 
      var superClass = this.transformAny(tree.superClass); 
      var elements = this.transformList(tree.elements); 
      if(superClass == tree.superClass && elements == tree.elements) return tree; 
      return new ClassExpression(tree.location, tree.name, superClass, elements); 
    }, 
    transformCommaExpression: function(tree) { 
      var expressions = this.transformList(tree.expressions); 
      if(expressions == tree.expressions) { 
        return tree; 
      } 
      return new CommaExpression(tree.location, expressions); 
    }, 
    transformComprehensionFor: function(tree) { 
      var left = this.transformAny(tree.left); 
      var iterator = this.transformAny(tree.iterator); 
      if(left === tree.left && iterator === tree.iterator) return tree; 
      return new ComprehensionFor(tree.location, left, iterator); 
    }, 
    transformConditionalExpression: function(tree) { 
      var condition = this.transformAny(tree.condition); 
      var left = this.transformAny(tree.left); 
      var right = this.transformAny(tree.right); 
      if(condition == tree.condition && left == tree.left && right == tree.right) { 
        return tree; 
      } 
      return new ConditionalExpression(tree.location, condition, left, right); 
    }, 
    transformContinueStatement: function(tree) { 
      return tree; 
    }, 
    transformDebuggerStatement: function(tree) { 
      return tree; 
    }, 
    transformDefaultClause: function(tree) { 
      var statements = this.transformList(tree.statements); 
      if(statements == tree.statements) { 
        return tree; 
      } 
      return new DefaultClause(tree.location, statements); 
    }, 
    transformDoWhileStatement: function(tree) { 
      var body = this.transformAny(tree.body); 
      var condition = this.transformAny(tree.condition); 
      if(body == tree.body && condition == tree.condition) { 
        return tree; 
      } 
      return new DoWhileStatement(tree.location, body, condition); 
    }, 
    transformEmptyStatement: function(tree) { 
      return tree; 
    }, 
    transformExportDeclaration: function(tree) { 
      var declaration = this.transformAny(tree.declaration); 
      if(tree.declaration == declaration) { 
        return tree; 
      } 
      return new ExportDeclaration(tree.location, declaration); 
    }, 
    transformExportMappingList: function(tree) { 
      var paths = this.transformList(tree.paths); 
      if(paths == tree.paths) { 
        return tree; 
      } 
      return new ExportMappingList(tree.location, paths); 
    }, 
    transformExportMapping: function(tree) { 
      var moduleExpression = this.transformAny(tree.moduleExpression); 
      var specifierSet = this.transformAny(tree.specifierSet); 
      if(moduleExpression == tree.moduleExpression && specifierSet == tree.specifierSet) { 
        return tree; 
      } 
      return new ExportMapping(tree.location, moduleExpression, specifierSet); 
    }, 
    transformExportSpecifier: function(tree) { 
      return tree; 
    }, 
    transformExportSpecifierSet: function(tree) { 
      var specifiers = this.transformList(tree.specifiers); 
      if(specifiers == tree.specifiers) { 
        return tree; 
      } 
      return new ExportSpecifierSet(tree.location, specifiers); 
    }, 
    transformExpressionStatement: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      if(expression == tree.expression) { 
        return tree; 
      } 
      return new ExpressionStatement(tree.location, expression); 
    }, 
    transformFinally: function(tree) { 
      var block = this.transformAny(tree.block); 
      if(block == tree.block) { 
        return tree; 
      } 
      return new Finally(tree.location, block); 
    }, 
    transformForOfStatement: function(tree) { 
      var initializer = this.transformAny(tree.initializer); 
      var collection = this.transformAny(tree.collection); 
      var body = this.transformAny(tree.body); 
      if(initializer == tree.initializer && collection == tree.collection && body == tree.body) { 
        return tree; 
      } 
      return new ForOfStatement(tree.location, initializer, collection, body); 
    }, 
    transformForInStatement: function(tree) { 
      var initializer = this.transformAny(tree.initializer); 
      var collection = this.transformAny(tree.collection); 
      var body = this.transformAny(tree.body); 
      if(initializer == tree.initializer && collection == tree.collection && body == tree.body) { 
        return tree; 
      } 
      return new ForInStatement(tree.location, initializer, collection, body); 
    }, 
    transformForStatement: function(tree) { 
      var initializer = this.transformAny(tree.initializer); 
      var condition = this.transformAny(tree.condition); 
      var increment = this.transformAny(tree.increment); 
      var body = this.transformAny(tree.body); 
      if(initializer == tree.initializer && condition == tree.condition && increment == tree.increment && body == tree.body) { 
        return tree; 
      } 
      return new ForStatement(tree.location, initializer, condition, increment, body); 
    }, 
    transformFormalParameterList: function(tree) { 
      var parameters = this.transformList(tree.parameters); 
      if(parameters == tree.parameters) return tree; 
      return new FormalParameterList(tree.location, parameters); 
    }, 
    transformFunctionDeclaration: function(tree) { 
      var formalParameterList = this.transformAny(tree.formalParameterList); 
      var functionBody = this.transformFunctionBody(tree.functionBody); 
      if(formalParameterList == tree.formalParameterList && functionBody == tree.functionBody) { 
        return tree; 
      } 
      return new FunctionDeclaration(tree.location, tree.name, tree.isGenerator, formalParameterList, functionBody); 
    }, 
    transformFunctionBody: function(tree) { 
      return this.transformAny(tree); 
    }, 
    transformGeneratorComprehension: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      var comprehensionForList = this.transformList(tree.comprehensionForList); 
      var ifExpression = this.transformAny(tree.ifExpression); 
      if(expression === tree.expression && comprehensionForList === tree.comprehensionForList && ifExpression === tree.ifExpression) { 
        return tree; 
      } 
      return new GeneratorComprehension(tree.location, expression, comprehensionForList, ifExpression); 
    }, 
    transformGetAccessor: function(tree) { 
      var body = this.transformFunctionBody(tree.body); 
      if(body == tree.body) return tree; 
      return new GetAccessor(tree.location, tree.propertyName, body); 
    }, 
    transformIdentifierExpression: function(tree) { 
      return tree; 
    }, 
    transformIfStatement: function(tree) { 
      var condition = this.transformAny(tree.condition); 
      var ifClause = this.transformAny(tree.ifClause); 
      var elseClause = this.transformAny(tree.elseClause); 
      if(condition == tree.condition && ifClause == tree.ifClause && elseClause == tree.elseClause) { 
        return tree; 
      } 
      return new IfStatement(tree.location, condition, ifClause, elseClause); 
    }, 
    transformImportDeclaration: function(tree) { 
      var importPathList = this.transformList(tree.importPathList); 
      if(importPathList == tree.importPathList) { 
        return tree; 
      } 
      return new ImportDeclaration(tree.location, importPathList); 
    }, 
    transformImportBinding: function(tree) { 
      var moduleExpression = this.transformAny(tree.moduleExpression); 
      var importSpecifierSet = this.transformList(tree.importSpecifierSet); 
      if(moduleExpression == tree.moduleExpression && importSpecifierSet == tree.importSpecifierSet) { 
        return tree; 
      } 
      return new ImportBinding(tree.location, moduleExpression, importSpecifierSet); 
    }, 
    transformImportSpecifier: function(tree) { 
      return tree; 
    }, 
    transformLabelledStatement: function(tree) { 
      var statement = this.transformAny(tree.statement); 
      if(statement == tree.statement) { 
        return tree; 
      } 
      return new LabelledStatement(tree.location, tree.name, statement); 
    }, 
    transformLiteralExpression: function(tree) { 
      return tree; 
    }, 
    transformMemberExpression: function(tree) { 
      var operand = this.transformAny(tree.operand); 
      if(operand == tree.operand) { 
        return tree; 
      } 
      return new MemberExpression(tree.location, operand, tree.memberName); 
    }, 
    transformMemberLookupExpression: function(tree) { 
      var operand = this.transformAny(tree.operand); 
      var memberExpression = this.transformAny(tree.memberExpression); 
      if(operand == tree.operand && memberExpression == tree.memberExpression) { 
        return tree; 
      } 
      return new MemberLookupExpression(tree.location, operand, memberExpression); 
    }, 
    transformMissingPrimaryExpression: function(tree) { 
      throw new Error('Should never transform trees that had errors during parse'); 
    }, 
    transformModuleDeclaration: function(tree) { 
      var specifiers = this.transformList(tree.specifiers); 
      if(specifiers == tree.specifiers) { 
        return tree; 
      } 
      return new ModuleDeclaration(tree.location, specifiers); 
    }, 
    transformModuleDefinition: function(tree) { 
      var elements = this.transformList(tree.elements); 
      if(elements == tree.elements) { 
        return tree; 
      } 
      return new ModuleDefinition(tree.location, tree.name, elements); 
    }, 
    transformModuleExpression: function(tree) { 
      var reference = this.transformAny(tree.reference); 
      if(reference == tree.reference) { 
        return tree; 
      } 
      return new ModuleExpression(tree.location, reference, tree.identifiers); 
    }, 
    transformModuleRequire: function(tree) { 
      return tree; 
    }, 
    transformModuleSpecifier: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      if(expression == tree.expression) { 
        return tree; 
      } 
      return new ModuleSpecifier(tree.location, tree.identifier, expression); 
    }, 
    transformNameStatement: function(tree) { 
      var declarations = this.transformList(tree.declarations); 
      if(declarations === tree.declarations) return tree; 
      return new NameStatement(tree.location, declarations); 
    }, 
    transformNewExpression: function(tree) { 
      var operand = this.transformAny(tree.operand); 
      var args = this.transformAny(tree.args); 
      if(operand == tree.operand && args == tree.args) { 
        return tree; 
      } 
      return new NewExpression(tree.location, operand, args); 
    }, 
    transformNullTree: function(tree) { 
      return tree; 
    }, 
    transformObjectLiteralExpression: function(tree) { 
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues); 
      if(propertyNameAndValues == tree.propertyNameAndValues) { 
        return tree; 
      } 
      return new ObjectLiteralExpression(tree.location, propertyNameAndValues); 
    }, 
    transformObjectPattern: function(tree) { 
      var fields = this.transformList(tree.fields); 
      if(fields == tree.fields) { 
        return tree; 
      } 
      return new ObjectPattern(tree.location, fields); 
    }, 
    transformObjectPatternField: function(tree) { 
      var element = this.transformAny(tree.element); 
      if(element == tree.element) { 
        return tree; 
      } 
      return new ObjectPatternField(tree.location, tree.identifier, element); 
    }, 
    transformParenExpression: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      if(expression == tree.expression) { 
        return tree; 
      } 
      return new ParenExpression(tree.location, expression); 
    }, 
    transformPostfixExpression: function(tree) { 
      var operand = this.transformAny(tree.operand); 
      if(operand == tree.operand) { 
        return tree; 
      } 
      return new PostfixExpression(tree.location, operand, tree.operator); 
    }, 
    transformProgram: function(tree) { 
      var elements = this.transformList(tree.programElements); 
      if(elements == tree.programElements) { 
        return tree; 
      } 
      return new Program(tree.location, elements); 
    }, 
    transformPropertyMethodAssignment: function(tree) { 
      var parameters = this.transformAny(tree.formalParameterList); 
      var functionBody = this.transformFunctionBody(tree.functionBody); 
      if(parameters == tree.formalParameterList && functionBody == tree.functionBody) { 
        return tree; 
      } 
      return new PropertyMethodAssignment(tree.location, tree.name, tree.isGenerator, parameters, functionBody); 
    }, 
    transformPropertyNameAssignment: function(tree) { 
      var value = this.transformAny(tree.value); 
      if(value == tree.value) { 
        return tree; 
      } 
      return new PropertyNameAssignment(tree.location, tree.name, value); 
    }, 
    transformPropertyNameShorthand: function(tree) { 
      return tree; 
    }, 
    transformQuasiLiteralExpression: function(tree) { 
      var operand = this.transformAny(tree.operand); 
      var elements = this.transformList(tree.elements); 
      if(operand === tree.operand && elements == tree.elements) return tree; 
      return new QuasiLiteralExpression(tree.location, operand, elements); 
    }, 
    transformQuasiLiteralPortion: function(tree) { 
      return tree; 
    }, 
    transformQuasiSubstitution: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      if(expression == tree.expression) { 
        return tree; 
      } 
      return new QuasiSubstitution(tree.location, expression); 
    }, 
    transformRequiresMember: function(tree) { 
      return tree; 
    }, 
    transformRestParameter: function(tree) { 
      return tree; 
    }, 
    transformReturnStatement: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      if(expression == tree.expression) { 
        return tree; 
      } 
      return new ReturnStatement(tree.location, expression); 
    }, 
    transformSetAccessor: function(tree) { 
      var parameter = this.transformAny(tree.parameter); 
      var body = this.transformFunctionBody(tree.body); 
      if(parameter === tree.parameter && body === tree.body) return tree; 
      return new SetAccessor(tree.location, tree.propertyName, parameter, body); 
    }, 
    transformSpreadExpression: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      if(expression == tree.expression) { 
        return tree; 
      } 
      return new SpreadExpression(tree.location, expression); 
    }, 
    transformSpreadPatternElement: function(tree) { 
      var lvalue = this.transformAny(tree.lvalue); 
      if(lvalue == tree.lvalue) { 
        return tree; 
      } 
      return new SpreadPatternElement(tree.location, lvalue); 
    }, 
    transformStateMachine: function(tree) { 
      throw new Error(); 
    }, 
    transformSuperExpression: function(tree) { 
      return tree; 
    }, 
    transformSwitchStatement: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      var caseClauses = this.transformList(tree.caseClauses); 
      if(expression == tree.expression && caseClauses == tree.caseClauses) { 
        return tree; 
      } 
      return new SwitchStatement(tree.location, expression, caseClauses); 
    }, 
    transformThisExpression: function(tree) { 
      return tree; 
    }, 
    transformThrowStatement: function(tree) { 
      var value = this.transformAny(tree.value); 
      if(value == tree.value) { 
        return tree; 
      } 
      return new ThrowStatement(tree.location, value); 
    }, 
    transformTryStatement: function(tree) { 
      var body = this.transformAny(tree.body); 
      var catchBlock = this.transformAny(tree.catchBlock); 
      var finallyBlock = this.transformAny(tree.finallyBlock); 
      if(body == tree.body && catchBlock == tree.catchBlock && finallyBlock == tree.finallyBlock) { 
        return tree; 
      } 
      return new TryStatement(tree.location, body, catchBlock, finallyBlock); 
    }, 
    transformUnaryExpression: function(tree) { 
      var operand = this.transformAny(tree.operand); 
      if(operand == tree.operand) { 
        return tree; 
      } 
      return new UnaryExpression(tree.location, tree.operator, operand); 
    }, 
    transformVariableDeclaration: function(tree) { 
      var lvalue = this.transformAny(tree.lvalue); 
      var initializer = this.transformAny(tree.initializer); 
      if(lvalue == tree.lvalue && initializer == tree.initializer) { 
        return tree; 
      } 
      return new VariableDeclaration(tree.location, lvalue, initializer); 
    }, 
    transformVariableDeclarationList: function(tree) { 
      var declarations = this.transformList(tree.declarations); 
      if(declarations == tree.declarations) { 
        return tree; 
      } 
      return new VariableDeclarationList(tree.location, tree.declarationType, declarations); 
    }, 
    transformVariableStatement: function(tree) { 
      var declarations = this.transformAny(tree.declarations); 
      if(declarations == tree.declarations) { 
        return tree; 
      } 
      return new VariableStatement(tree.location, declarations); 
    }, 
    transformWhileStatement: function(tree) { 
      var condition = this.transformAny(tree.condition); 
      var body = this.transformAny(tree.body); 
      if(condition == tree.condition && body == tree.body) { 
        return tree; 
      } 
      return new WhileStatement(tree.location, condition, body); 
    }, 
    transformWithStatement: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      var body = this.transformAny(tree.body); 
      if(expression == tree.expression && body == tree.body) { 
        return tree; 
      } 
      return new WithStatement(tree.location, expression, body); 
    }, 
    transformYieldStatement: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      var isYieldFor = tree.isYieldFor; 
      if(expression == tree.expression) { 
        return tree; 
      } 
      return new YieldStatement(tree.location, expression, isYieldFor); 
    }, 
    constructor: function() { 
      var args = Array.prototype.slice.call(arguments, 0); 
      traceur.runtime.superCall(this, ParseTreeTransformer, "constructor", $__465(args)); 
    } 
  }, null, false, false); 
  return Object.preventExtensions(Object.create(null, { ParseTreeTransformer: { 
      get: function() { 
        return ParseTreeTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_Token_js =(function() { 
  "use strict"; 
  var $__47 = $src_syntax_TokenType_js, TokenType = $__47.TokenType; 
  var Token = traceur.runtime.createClass({ 
    constructor: function(type, location) { 
      this.type = type; 
      this.location = location; 
    }, 
    toString: function() { 
      return this.type.toString(); 
    }, 
    isAssignmentOperator: function() { 
      switch(this.type) { 
        case TokenType.EQUAL: 
        case TokenType.STAR_EQUAL: 
        case TokenType.SLASH_EQUAL: 
        case TokenType.PERCENT_EQUAL: 
        case TokenType.PLUS_EQUAL: 
        case TokenType.MINUS_EQUAL: 
        case TokenType.LEFT_SHIFT_EQUAL: 
        case TokenType.RIGHT_SHIFT_EQUAL: 
        case TokenType.UNSIGNED_RIGHT_SHIFT_EQUAL: 
        case TokenType.AMPERSAND_EQUAL: 
        case TokenType.CARET_EQUAL: 
        case TokenType.BAR_EQUAL: 
          return true; 

        default: 
          return false; 

      } 
    } 
  }, null, true, false); 
  return Object.preventExtensions(Object.create(null, { Token: { 
      get: function() { 
        return Token; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_IdentifierToken_js =(function() { 
  "use strict"; 
  var $__48 = $src_syntax_Token_js, Token = $__48.Token; 
  var $__49 = $src_syntax_TokenType_js, TokenType = $__49.TokenType; 
  var $__50 = $src_util_util_js, createObject = $__50.createObject; 
  var IdentifierToken = traceur.runtime.createClass({ 
    constructor: function(location, value) { 
      traceur.runtime.superCall(this, IdentifierToken, "constructor",[TokenType.IDENTIFIER, location]); 
      this.value = value; 
    }, 
    toString: function() { 
      return this.value; 
    } 
  }, Token, true, true); 
  return Object.preventExtensions(Object.create(null, { IdentifierToken: { 
      get: function() { 
        return IdentifierToken; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_Keywords_js =(function() { 
  "use strict"; 
  var $__51 = $src_syntax_TokenType_js, TokenType = $__51.TokenType; 
  var keywords =['break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'class', 'const', 'enum', 'export', 'extends', 'import', 'super', 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield', 'null', 'true', 'false', 'await']; 
  var Keywords = { }; 
  var keywordsByName = Object.create(null); 
  var keywordsByType = Object.create(null); 
  var Keyword = traceur.runtime.createClass({ 
    constructor: function(value, type) { 
      this.value = value; 
      this.type = type; 
    }, 
    toString: function() { 
      return this.value; 
    } 
  }, null, true, false); 
  keywords.forEach((function(value) { 
    var uc = value.toUpperCase(); 
    if(uc.indexOf('__') === 0) { 
      uc = uc.substring(2); 
    } 
    var kw = new Keyword(value, TokenType[uc]); 
    Keywords[uc]= kw; 
    keywordsByName[kw.value]= kw; 
    keywordsByType[kw.type]= kw; 
  })); 
  Keywords.isKeyword = function(value) { 
    return value !== '__proto__' && value in keywordsByName; 
  }; 
  Keywords.getTokenType = function(value) { 
    if(value == '__proto__') return null; 
    return keywordsByName[value].type; 
  }; 
  Keywords.get = function(value) { 
    if(value == '__proto__') return null; 
    return keywordsByName[value]; 
  }; 
  return Object.preventExtensions(Object.create(null, { Keywords: { 
      get: function() { 
        return Keywords; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_PredefinedName_js =(function() { 
  "use strict"; 
  var $ARGUMENTS = '$arguments'; 
  var $THAT = '$that'; 
  var $VALUE = '$value'; 
  var ADD_CONTINUATION = 'addContinuation'; 
  var APPLY = 'apply'; 
  var ARGUMENTS = 'arguments'; 
  var ARRAY = 'Array'; 
  var ASSERT_NAME = 'assertName'; 
  var BIND = 'bind'; 
  var CALL = 'call'; 
  var CALLBACK = 'callback'; 
  var CAPTURED_ARGUMENTS = '$arguments'; 
  var CAPTURED_THIS = '$this'; 
  var CAUGHT_EXCEPTION = '$caughtException'; 
  var CLOSE = 'close'; 
  var CONFIGURABLE = 'configurable'; 
  var CONSTRUCTOR = 'constructor'; 
  var CONTINUATION = '$continuation'; 
  var CREATE = 'create'; 
  var CREATE_CALLBACK = '$createCallback'; 
  var CREATE_CLASS = 'createClass'; 
  var CREATE_ERRBACK = '$createErrback'; 
  var CREATE_NAME = 'createName'; 
  var CREATE_PROMISE = 'createPromise'; 
  var CURRENT = 'current'; 
  var DEFERRED = 'Deferred'; 
  var DEFINE_PROPERTIES = 'defineProperties'; 
  var DEFINE_PROPERTY = 'defineProperty'; 
  var DELETE_PROPERTY = 'deleteProperty'; 
  var ELEMENT_DELETE = 'elementDelete'; 
  var ELEMENT_GET = 'elementGet'; 
  var ELEMENT_HAS = 'elementHas'; 
  var ELEMENT_SET = 'elementSet'; 
  var ENUMERABLE = 'enumerable'; 
  var ERR = '$err'; 
  var ERRBACK = 'errback'; 
  var FIELD_INITIALIZER_METHOD = '$field_initializer_'; 
  var FINALLY_FALL_THROUGH = '$finallyFallThrough'; 
  var FREEZE = 'freeze'; 
  var FROM = 'from'; 
  var GET = 'get'; 
  var GET_ITERATOR = 'getIterator'; 
  var GET_MODULE_INSTANCE_BY_URL = 'getModuleInstanceByUrl'; 
  var GET_PROPERTY = 'getProperty'; 
  var HAS = 'has'; 
  var INIT = '$init'; 
  var IS = 'is'; 
  var ISNT = 'isnt'; 
  var IS_DONE = 'isDone'; 
  var ITERATOR = 'iterator'; 
  var LENGTH = 'length'; 
  var MARK_AS_GENERATOR = 'markAsGenerator'; 
  var MARK_METHODS = 'markMethods'; 
  var MODULE = 'module'; 
  var MODULES = 'modules'; 
  var MOVE_NEXT = 'moveNext'; 
  var NEW = 'new'; 
  var NEW_STATE = '$newState'; 
  var OBJECT = 'Object'; 
  var OBJECT_NAME = 'Object'; 
  var OF = 'of'; 
  var PARAM = '$param'; 
  var PREVENT_EXTENSIONS = 'preventExtensions'; 
  var PROTO = '__proto__'; 
  var PROTOTYPE = 'prototype'; 
  var PUSH = 'push'; 
  var RAW = 'raw'; 
  var REQUIRE = 'require'; 
  var REQUIRED = 'required'; 
  var REQUIRES = 'requires'; 
  var RESOLVE = 'resolve'; 
  var RESULT = '$result'; 
  var RUNTIME = 'runtime'; 
  var SET = 'set'; 
  var SET_PROPERTY = 'setProperty'; 
  var SLICE = 'slice'; 
  var SPREAD = 'spread'; 
  var SPREAD_NEW = 'spreadNew'; 
  var STATE = '$state'; 
  var STORED_EXCEPTION = '$storedException'; 
  var SUPER_CALL = 'superCall'; 
  var SUPER_GET = 'superGet'; 
  var SUPER_SET = 'superSet'; 
  var THEN = 'then'; 
  var THIS = 'this'; 
  var TRACEUR = 'traceur'; 
  var TYPE_ERROR = 'TypeError'; 
  var UNDEFINED = 'undefined'; 
  var VALUE = 'value'; 
  var WAIT_TASK = '$waitTask'; 
  var WRITABLE = 'writable'; 
  function getParameterName(index) { 
    return '$' + index; 
  } 
  ; 
  return Object.preventExtensions(Object.create(null, { 
    $ARGUMENTS: { 
      get: function() { 
        return $ARGUMENTS; 
      }, 
      enumerable: true 
    }, 
    $THAT: { 
      get: function() { 
        return $THAT; 
      }, 
      enumerable: true 
    }, 
    $VALUE: { 
      get: function() { 
        return $VALUE; 
      }, 
      enumerable: true 
    }, 
    ADD_CONTINUATION: { 
      get: function() { 
        return ADD_CONTINUATION; 
      }, 
      enumerable: true 
    }, 
    APPLY: { 
      get: function() { 
        return APPLY; 
      }, 
      enumerable: true 
    }, 
    ARGUMENTS: { 
      get: function() { 
        return ARGUMENTS; 
      }, 
      enumerable: true 
    }, 
    ARRAY: { 
      get: function() { 
        return ARRAY; 
      }, 
      enumerable: true 
    }, 
    ASSERT_NAME: { 
      get: function() { 
        return ASSERT_NAME; 
      }, 
      enumerable: true 
    }, 
    BIND: { 
      get: function() { 
        return BIND; 
      }, 
      enumerable: true 
    }, 
    CALL: { 
      get: function() { 
        return CALL; 
      }, 
      enumerable: true 
    }, 
    CALLBACK: { 
      get: function() { 
        return CALLBACK; 
      }, 
      enumerable: true 
    }, 
    CAPTURED_ARGUMENTS: { 
      get: function() { 
        return CAPTURED_ARGUMENTS; 
      }, 
      enumerable: true 
    }, 
    CAPTURED_THIS: { 
      get: function() { 
        return CAPTURED_THIS; 
      }, 
      enumerable: true 
    }, 
    CAUGHT_EXCEPTION: { 
      get: function() { 
        return CAUGHT_EXCEPTION; 
      }, 
      enumerable: true 
    }, 
    CLOSE: { 
      get: function() { 
        return CLOSE; 
      }, 
      enumerable: true 
    }, 
    CONFIGURABLE: { 
      get: function() { 
        return CONFIGURABLE; 
      }, 
      enumerable: true 
    }, 
    CONSTRUCTOR: { 
      get: function() { 
        return CONSTRUCTOR; 
      }, 
      enumerable: true 
    }, 
    CONTINUATION: { 
      get: function() { 
        return CONTINUATION; 
      }, 
      enumerable: true 
    }, 
    CREATE: { 
      get: function() { 
        return CREATE; 
      }, 
      enumerable: true 
    }, 
    CREATE_CALLBACK: { 
      get: function() { 
        return CREATE_CALLBACK; 
      }, 
      enumerable: true 
    }, 
    CREATE_CLASS: { 
      get: function() { 
        return CREATE_CLASS; 
      }, 
      enumerable: true 
    }, 
    CREATE_ERRBACK: { 
      get: function() { 
        return CREATE_ERRBACK; 
      }, 
      enumerable: true 
    }, 
    CREATE_NAME: { 
      get: function() { 
        return CREATE_NAME; 
      }, 
      enumerable: true 
    }, 
    CREATE_PROMISE: { 
      get: function() { 
        return CREATE_PROMISE; 
      }, 
      enumerable: true 
    }, 
    CURRENT: { 
      get: function() { 
        return CURRENT; 
      }, 
      enumerable: true 
    }, 
    DEFERRED: { 
      get: function() { 
        return DEFERRED; 
      }, 
      enumerable: true 
    }, 
    DEFINE_PROPERTIES: { 
      get: function() { 
        return DEFINE_PROPERTIES; 
      }, 
      enumerable: true 
    }, 
    DEFINE_PROPERTY: { 
      get: function() { 
        return DEFINE_PROPERTY; 
      }, 
      enumerable: true 
    }, 
    DELETE_PROPERTY: { 
      get: function() { 
        return DELETE_PROPERTY; 
      }, 
      enumerable: true 
    }, 
    ELEMENT_DELETE: { 
      get: function() { 
        return ELEMENT_DELETE; 
      }, 
      enumerable: true 
    }, 
    ELEMENT_GET: { 
      get: function() { 
        return ELEMENT_GET; 
      }, 
      enumerable: true 
    }, 
    ELEMENT_HAS: { 
      get: function() { 
        return ELEMENT_HAS; 
      }, 
      enumerable: true 
    }, 
    ELEMENT_SET: { 
      get: function() { 
        return ELEMENT_SET; 
      }, 
      enumerable: true 
    }, 
    ENUMERABLE: { 
      get: function() { 
        return ENUMERABLE; 
      }, 
      enumerable: true 
    }, 
    ERR: { 
      get: function() { 
        return ERR; 
      }, 
      enumerable: true 
    }, 
    ERRBACK: { 
      get: function() { 
        return ERRBACK; 
      }, 
      enumerable: true 
    }, 
    FIELD_INITIALIZER_METHOD: { 
      get: function() { 
        return FIELD_INITIALIZER_METHOD; 
      }, 
      enumerable: true 
    }, 
    FINALLY_FALL_THROUGH: { 
      get: function() { 
        return FINALLY_FALL_THROUGH; 
      }, 
      enumerable: true 
    }, 
    FREEZE: { 
      get: function() { 
        return FREEZE; 
      }, 
      enumerable: true 
    }, 
    FROM: { 
      get: function() { 
        return FROM; 
      }, 
      enumerable: true 
    }, 
    GET: { 
      get: function() { 
        return GET; 
      }, 
      enumerable: true 
    }, 
    GET_ITERATOR: { 
      get: function() { 
        return GET_ITERATOR; 
      }, 
      enumerable: true 
    }, 
    GET_MODULE_INSTANCE_BY_URL: { 
      get: function() { 
        return GET_MODULE_INSTANCE_BY_URL; 
      }, 
      enumerable: true 
    }, 
    GET_PROPERTY: { 
      get: function() { 
        return GET_PROPERTY; 
      }, 
      enumerable: true 
    }, 
    HAS: { 
      get: function() { 
        return HAS; 
      }, 
      enumerable: true 
    }, 
    INIT: { 
      get: function() { 
        return INIT; 
      }, 
      enumerable: true 
    }, 
    IS: { 
      get: function() { 
        return IS; 
      }, 
      enumerable: true 
    }, 
    ISNT: { 
      get: function() { 
        return ISNT; 
      }, 
      enumerable: true 
    }, 
    IS_DONE: { 
      get: function() { 
        return IS_DONE; 
      }, 
      enumerable: true 
    }, 
    ITERATOR: { 
      get: function() { 
        return ITERATOR; 
      }, 
      enumerable: true 
    }, 
    LENGTH: { 
      get: function() { 
        return LENGTH; 
      }, 
      enumerable: true 
    }, 
    MARK_AS_GENERATOR: { 
      get: function() { 
        return MARK_AS_GENERATOR; 
      }, 
      enumerable: true 
    }, 
    MARK_METHODS: { 
      get: function() { 
        return MARK_METHODS; 
      }, 
      enumerable: true 
    }, 
    MODULE: { 
      get: function() { 
        return MODULE; 
      }, 
      enumerable: true 
    }, 
    MODULES: { 
      get: function() { 
        return MODULES; 
      }, 
      enumerable: true 
    }, 
    MOVE_NEXT: { 
      get: function() { 
        return MOVE_NEXT; 
      }, 
      enumerable: true 
    }, 
    NEW: { 
      get: function() { 
        return NEW; 
      }, 
      enumerable: true 
    }, 
    NEW_STATE: { 
      get: function() { 
        return NEW_STATE; 
      }, 
      enumerable: true 
    }, 
    OBJECT: { 
      get: function() { 
        return OBJECT; 
      }, 
      enumerable: true 
    }, 
    OBJECT_NAME: { 
      get: function() { 
        return OBJECT_NAME; 
      }, 
      enumerable: true 
    }, 
    OF: { 
      get: function() { 
        return OF; 
      }, 
      enumerable: true 
    }, 
    PARAM: { 
      get: function() { 
        return PARAM; 
      }, 
      enumerable: true 
    }, 
    PREVENT_EXTENSIONS: { 
      get: function() { 
        return PREVENT_EXTENSIONS; 
      }, 
      enumerable: true 
    }, 
    PROTO: { 
      get: function() { 
        return PROTO; 
      }, 
      enumerable: true 
    }, 
    PROTOTYPE: { 
      get: function() { 
        return PROTOTYPE; 
      }, 
      enumerable: true 
    }, 
    PUSH: { 
      get: function() { 
        return PUSH; 
      }, 
      enumerable: true 
    }, 
    RAW: { 
      get: function() { 
        return RAW; 
      }, 
      enumerable: true 
    }, 
    REQUIRE: { 
      get: function() { 
        return REQUIRE; 
      }, 
      enumerable: true 
    }, 
    REQUIRED: { 
      get: function() { 
        return REQUIRED; 
      }, 
      enumerable: true 
    }, 
    REQUIRES: { 
      get: function() { 
        return REQUIRES; 
      }, 
      enumerable: true 
    }, 
    RESOLVE: { 
      get: function() { 
        return RESOLVE; 
      }, 
      enumerable: true 
    }, 
    RESULT: { 
      get: function() { 
        return RESULT; 
      }, 
      enumerable: true 
    }, 
    RUNTIME: { 
      get: function() { 
        return RUNTIME; 
      }, 
      enumerable: true 
    }, 
    SET: { 
      get: function() { 
        return SET; 
      }, 
      enumerable: true 
    }, 
    SET_PROPERTY: { 
      get: function() { 
        return SET_PROPERTY; 
      }, 
      enumerable: true 
    }, 
    SLICE: { 
      get: function() { 
        return SLICE; 
      }, 
      enumerable: true 
    }, 
    SPREAD: { 
      get: function() { 
        return SPREAD; 
      }, 
      enumerable: true 
    }, 
    SPREAD_NEW: { 
      get: function() { 
        return SPREAD_NEW; 
      }, 
      enumerable: true 
    }, 
    STATE: { 
      get: function() { 
        return STATE; 
      }, 
      enumerable: true 
    }, 
    STORED_EXCEPTION: { 
      get: function() { 
        return STORED_EXCEPTION; 
      }, 
      enumerable: true 
    }, 
    SUPER_CALL: { 
      get: function() { 
        return SUPER_CALL; 
      }, 
      enumerable: true 
    }, 
    SUPER_GET: { 
      get: function() { 
        return SUPER_GET; 
      }, 
      enumerable: true 
    }, 
    SUPER_SET: { 
      get: function() { 
        return SUPER_SET; 
      }, 
      enumerable: true 
    }, 
    THEN: { 
      get: function() { 
        return THEN; 
      }, 
      enumerable: true 
    }, 
    THIS: { 
      get: function() { 
        return THIS; 
      }, 
      enumerable: true 
    }, 
    TRACEUR: { 
      get: function() { 
        return TRACEUR; 
      }, 
      enumerable: true 
    }, 
    TYPE_ERROR: { 
      get: function() { 
        return TYPE_ERROR; 
      }, 
      enumerable: true 
    }, 
    UNDEFINED: { 
      get: function() { 
        return UNDEFINED; 
      }, 
      enumerable: true 
    }, 
    VALUE: { 
      get: function() { 
        return VALUE; 
      }, 
      enumerable: true 
    }, 
    WAIT_TASK: { 
      get: function() { 
        return WAIT_TASK; 
      }, 
      enumerable: true 
    }, 
    WRITABLE: { 
      get: function() { 
        return WRITABLE; 
      }, 
      enumerable: true 
    }, 
    getParameterName: { 
      get: function() { 
        return getParameterName; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var $src_syntax_AtNameToken_js =(function() { 
  "use strict"; 
  var $__52 = $src_syntax_Token_js, Token = $__52.Token; 
  var $__53 = $src_syntax_TokenType_js, TokenType = $__53.TokenType; 
  var $__54 = $src_util_util_js, createObject = $__54.createObject; 
  var AtNameToken = traceur.runtime.createClass({ 
    constructor: function(location, value) { 
      traceur.runtime.superCall(this, AtNameToken, "constructor",[TokenType.AT_NAME, location]); 
      this.value = value; 
    }, 
    toString: function() { 
      return this.value; 
    } 
  }, Token, true, true); 
  return Object.preventExtensions(Object.create(null, { AtNameToken: { 
      get: function() { 
        return AtNameToken; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_LiteralToken_js =(function() { 
  "use strict"; 
  var $__55 = $src_syntax_Token_js, Token = $__55.Token; 
  var $__56 = $src_util_util_js, createObject = $__56.createObject; 
  var LiteralToken = traceur.runtime.createClass({ 
    constructor: function(type, value, location) { 
      traceur.runtime.superCall(this, LiteralToken, "constructor",[type, location]); 
      this.value = value; 
    }, 
    toString: function() { 
      return this.value; 
    } 
  }, Token, true, true); 
  return Object.preventExtensions(Object.create(null, { LiteralToken: { 
      get: function() { 
        return LiteralToken; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_util_SourcePosition_js =(function() { 
  "use strict"; 
  var SourcePosition = traceur.runtime.createClass({ 
    constructor: function(source, offset, line, column) { 
      this.source = source; 
      this.offset = offset; 
      this.line = line; 
      this.column = column; 
    }, 
    toString: function() { 
      var name = this.source ? this.source.name: ''; 
      return("" + name + ":" +(this.line + 1) + ":" +(this.column + 1)); 
    } 
  }, null, true, false); 
  return Object.preventExtensions(Object.create(null, { SourcePosition: { 
      get: function() { 
        return SourcePosition; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_Scanner_js =(function() { 
  "use strict"; 
  var $__57 = $src_syntax_AtNameToken_js, AtNameToken = $__57.AtNameToken; 
  var $__58 = $src_syntax_IdentifierToken_js, IdentifierToken = $__58.IdentifierToken; 
  var $__59 = $src_syntax_Keywords_js, Keywords = $__59.Keywords; 
  var $__60 = $src_syntax_LiteralToken_js, LiteralToken = $__60.LiteralToken; 
  var $__61 = $src_util_SourcePosition_js, SourcePosition = $__61.SourcePosition; 
  var $__62 = $src_syntax_Token_js, Token = $__62.Token; 
  var $__63 = $src_syntax_TokenType_js, TokenType = $__63.TokenType; 
  function isWhitespace(ch) { 
    switch(ch) { 
      case '\u0009': 
      case '\u000B': 
      case '\u000C': 
      case '\u0020': 
      case '\u00A0': 
      case '\uFEFF': 
      case '\n': 
      case '\r': 
      case '\u2028': 
      case '\u2029': 
        return true; 

      default: 
        return false; 

    } 
  } 
  function isLineTerminator(ch) { 
    switch(ch) { 
      case '\n': 
      case '\r': 
      case '\u2028': 
      case '\u2029': 
        return true; 

      default: 
        return false; 

    } 
  } 
  function isDecimalDigit(ch) { 
    var cc = ch.charCodeAt(0); 
    return cc >= 48 && cc <= 57; 
  } 
  function isHexDigit(ch) { 
    var cc = ch.charCodeAt(0); 
    return cc >= 48 && cc <= 57 || cc >= 65 && cc <= 70 || cc >= 97 && cc <= 102; 
  } 
  function isIdentifierStart(ch) { 
    switch(ch) { 
      case '$': 
      case '_': 
        return true; 

      default: 
        return isUnicodeLetter(ch); 

    } 
  } 
  var unicodeLetterTable =[[65, 90],[97, 122],[170, 170],[181, 181],[186, 186],[192, 214],[216, 246],[248, 705],[710, 721],[736, 740],[748, 748],[750, 750],[880, 884],[886, 887],[890, 893],[902, 902],[904, 906],[908, 908],[910, 929],[931, 1013],[1015, 1153],[1162, 1319],[1329, 1366],[1369, 1369],[1377, 1415],[1488, 1514],[1520, 1522],[1568, 1610],[1646, 1647],[1649, 1747],[1749, 1749],[1765, 1766],[1774, 1775],[1786, 1788],[1791, 1791],[1808, 1808],[1810, 1839],[1869, 1957],[1969, 1969],[1994, 2026],[2036, 2037],[2042, 2042],[2048, 2069],[2074, 2074],[2084, 2084],[2088, 2088],[2112, 2136],[2308, 2361],[2365, 2365],[2384, 2384],[2392, 2401],[2417, 2423],[2425, 2431],[2437, 2444],[2447, 2448],[2451, 2472],[2474, 2480],[2482, 2482],[2486, 2489],[2493, 2493],[2510, 2510],[2524, 2525],[2527, 2529],[2544, 2545],[2565, 2570],[2575, 2576],[2579, 2600],[2602, 2608],[2610, 2611],[2613, 2614],[2616, 2617],[2649, 2652],[2654, 2654],[2674, 2676],[2693, 2701],[2703, 2705],[2707, 2728],[2730, 2736],[2738, 2739],[2741, 2745],[2749, 2749],[2768, 2768],[2784, 2785],[2821, 2828],[2831, 2832],[2835, 2856],[2858, 2864],[2866, 2867],[2869, 2873],[2877, 2877],[2908, 2909],[2911, 2913],[2929, 2929],[2947, 2947],[2949, 2954],[2958, 2960],[2962, 2965],[2969, 2970],[2972, 2972],[2974, 2975],[2979, 2980],[2984, 2986],[2990, 3001],[3024, 3024],[3077, 3084],[3086, 3088],[3090, 3112],[3114, 3123],[3125, 3129],[3133, 3133],[3160, 3161],[3168, 3169],[3205, 3212],[3214, 3216],[3218, 3240],[3242, 3251],[3253, 3257],[3261, 3261],[3294, 3294],[3296, 3297],[3313, 3314],[3333, 3340],[3342, 3344],[3346, 3386],[3389, 3389],[3406, 3406],[3424, 3425],[3450, 3455],[3461, 3478],[3482, 3505],[3507, 3515],[3517, 3517],[3520, 3526],[3585, 3632],[3634, 3635],[3648, 3654],[3713, 3714],[3716, 3716],[3719, 3720],[3722, 3722],[3725, 3725],[3732, 3735],[3737, 3743],[3745, 3747],[3749, 3749],[3751, 3751],[3754, 3755],[3757, 3760],[3762, 3763],[3773, 3773],[3776, 3780],[3782, 3782],[3804, 3805],[3840, 3840],[3904, 3911],[3913, 3948],[3976, 3980],[4096, 4138],[4159, 4159],[4176, 4181],[4186, 4189],[4193, 4193],[4197, 4198],[4206, 4208],[4213, 4225],[4238, 4238],[4256, 4293],[4304, 4346],[4348, 4348],[4352, 4680],[4682, 4685],[4688, 4694],[4696, 4696],[4698, 4701],[4704, 4744],[4746, 4749],[4752, 4784],[4786, 4789],[4792, 4798],[4800, 4800],[4802, 4805],[4808, 4822],[4824, 4880],[4882, 4885],[4888, 4954],[4992, 5007],[5024, 5108],[5121, 5740],[5743, 5759],[5761, 5786],[5792, 5866],[5870, 5872],[5888, 5900],[5902, 5905],[5920, 5937],[5952, 5969],[5984, 5996],[5998, 6000],[6016, 6067],[6103, 6103],[6108, 6108],[6176, 6263],[6272, 6312],[6314, 6314],[6320, 6389],[6400, 6428],[6480, 6509],[6512, 6516],[6528, 6571],[6593, 6599],[6656, 6678],[6688, 6740],[6823, 6823],[6917, 6963],[6981, 6987],[7043, 7072],[7086, 7087],[7104, 7141],[7168, 7203],[7245, 7247],[7258, 7293],[7401, 7404],[7406, 7409],[7424, 7615],[7680, 7957],[7960, 7965],[7968, 8005],[8008, 8013],[8016, 8023],[8025, 8025],[8027, 8027],[8029, 8029],[8031, 8061],[8064, 8116],[8118, 8124],[8126, 8126],[8130, 8132],[8134, 8140],[8144, 8147],[8150, 8155],[8160, 8172],[8178, 8180],[8182, 8188],[8305, 8305],[8319, 8319],[8336, 8348],[8450, 8450],[8455, 8455],[8458, 8467],[8469, 8469],[8473, 8477],[8484, 8484],[8486, 8486],[8488, 8488],[8490, 8493],[8495, 8505],[8508, 8511],[8517, 8521],[8526, 8526],[8544, 8584],[11264, 11310],[11312, 11358],[11360, 11492],[11499, 11502],[11520, 11557],[11568, 11621],[11631, 11631],[11648, 11670],[11680, 11686],[11688, 11694],[11696, 11702],[11704, 11710],[11712, 11718],[11720, 11726],[11728, 11734],[11736, 11742],[11823, 11823],[12293, 12295],[12321, 12329],[12337, 12341],[12344, 12348],[12353, 12438],[12445, 12447],[12449, 12538],[12540, 12543],[12549, 12589],[12593, 12686],[12704, 12730],[12784, 12799],[13312, 13312],[19893, 19893],[19968, 19968],[40907, 40907],[40960, 42124],[42192, 42237],[42240, 42508],[42512, 42527],[42538, 42539],[42560, 42606],[42623, 42647],[42656, 42735],[42775, 42783],[42786, 42888],[42891, 42894],[42896, 42897],[42912, 42921],[43002, 43009],[43011, 43013],[43015, 43018],[43020, 43042],[43072, 43123],[43138, 43187],[43250, 43255],[43259, 43259],[43274, 43301],[43312, 43334],[43360, 43388],[43396, 43442],[43471, 43471],[43520, 43560],[43584, 43586],[43588, 43595],[43616, 43638],[43642, 43642],[43648, 43695],[43697, 43697],[43701, 43702],[43705, 43709],[43712, 43712],[43714, 43714],[43739, 43741],[43777, 43782],[43785, 43790],[43793, 43798],[43808, 43814],[43816, 43822],[43968, 44002],[44032, 44032],[55203, 55203],[55216, 55238],[55243, 55291],[63744, 64045],[64048, 64109],[64112, 64217],[64256, 64262],[64275, 64279],[64285, 64285],[64287, 64296],[64298, 64310],[64312, 64316],[64318, 64318],[64320, 64321],[64323, 64324],[64326, 64433],[64467, 64829],[64848, 64911],[64914, 64967],[65008, 65019],[65136, 65140],[65142, 65276],[65313, 65338],[65345, 65370],[65382, 65470],[65474, 65479],[65482, 65487],[65490, 65495],[65498, 65500],[65536, 65547],[65549, 65574],[65576, 65594],[65596, 65597],[65599, 65613],[65616, 65629],[65664, 65786],[65856, 65908],[66176, 66204],[66208, 66256],[66304, 66334],[66352, 66378],[66432, 66461],[66464, 66499],[66504, 66511],[66513, 66517],[66560, 66717],[67584, 67589],[67592, 67592],[67594, 67637],[67639, 67640],[67644, 67644],[67647, 67669],[67840, 67861],[67872, 67897],[68096, 68096],[68112, 68115],[68117, 68119],[68121, 68147],[68192, 68220],[68352, 68405],[68416, 68437],[68448, 68466],[68608, 68680],[69635, 69687],[69763, 69807],[73728, 74606],[74752, 74850],[77824, 78894],[92160, 92728],[110592, 110593],[119808, 119892],[119894, 119964],[119966, 119967],[119970, 119970],[119973, 119974],[119977, 119980],[119982, 119993],[119995, 119995],[119997, 120003],[120005, 120069],[120071, 120074],[120077, 120084],[120086, 120092],[120094, 120121],[120123, 120126],[120128, 120132],[120134, 120134],[120138, 120144],[120146, 120485],[120488, 120512],[120514, 120538],[120540, 120570],[120572, 120596],[120598, 120628],[120630, 120654],[120656, 120686],[120688, 120712],[120714, 120744],[120746, 120770],[120772, 120779],[131072, 131072],[173782, 173782],[173824, 173824],[177972, 177972],[177984, 177984],[178205, 178205],[194560, 195101]]; 
  function isUnicodeLetter(ch) { 
    var cc = ch.charCodeAt(0); 
    for(var i = 0; i < unicodeLetterTable.length; i ++) { 
      if(cc < unicodeLetterTable[i][0]) return false; 
      if(cc <= unicodeLetterTable[i][1]) return true; 
    } 
    return false; 
  } 
  var Scanner = traceur.runtime.createClass({ 
    constructor: function(errorReporter, file, opt_offset) { 
      this.errorReporter_ = errorReporter; 
      this.source_ = file; 
      this.index_ = opt_offset || 0; 
      this.currentTokens_ =[]; 
      this.lastToken_ = null; 
    }, 
    get lastToken() { 
      return this.lastToken_; 
    }, 
    getLineNumberTable_: function() { 
      return this.getFile().lineNumberTable; 
    }, 
    getFile: function() { 
      return this.source_; 
    }, 
    getOffset: function() { 
      return this.currentTokens_.length == 0 ? this.index_: this.peekToken().location.start.offset; 
    }, 
    getPosition: function() { 
      return this.getPosition_(this.getOffset()); 
    }, 
    getPosition_: function(offset) { 
      return this.getLineNumberTable_().getSourcePosition(offset); 
    }, 
    getTokenRange_: function(startOffset) { 
      return this.getLineNumberTable_().getSourceRange(startOffset, this.index_); 
    }, 
    nextToken: function() { 
      this.peekToken(); 
      var token = this.currentTokens_.shift(); 
      this.lastToken_ = token; 
      return token; 
    }, 
    clearTokenLookahead_: function() { 
      this.index_ = this.getOffset(); 
      this.currentTokens_.length = 0; 
    }, 
    clearTokenAndWhitespaceLookahead_: function() { 
      this.index_ = this.lastToken.location.end.offset; 
      this.currentTokens_.length = 0; 
    }, 
    nextRegularExpressionLiteralToken: function() { 
      return this.lastToken_ = this.nextRegularExpressionLiteralToken_(); 
    }, 
    nextRegularExpressionLiteralToken_: function() { 
      this.clearTokenLookahead_(); 
      var beginToken = this.index_; 
      this.nextChar_(); 
      if(! this.skipRegularExpressionBody_()) { 
        return new LiteralToken(TokenType.REGULAR_EXPRESSION, this.getTokenString_(beginToken), this.getTokenRange_(beginToken)); 
      } 
      if(this.peekChar_() != '/') { 
        this.reportError_('Expected \'/\' in regular expression literal'); 
        return new LiteralToken(TokenType.REGULAR_EXPRESSION, this.getTokenString_(beginToken), this.getTokenRange_(beginToken)); 
      } 
      this.nextChar_(); 
      while(this.isIdentifierPart_(this.peekChar_())) { 
        this.nextChar_(); 
      } 
      return new LiteralToken(TokenType.REGULAR_EXPRESSION, this.getTokenString_(beginToken), this.getTokenRange_(beginToken)); 
    }, 
    skipRegularExpressionBody_: function() { 
      if(! this.isRegularExpressionFirstChar_(this.peekChar_())) { 
        this.reportError_('Expected regular expression first char'); 
        return false; 
      } 
      if(! this.skipRegularExpressionChar_()) { 
        return false; 
      } 
      while(! this.isAtEnd_() && this.isRegularExpressionChar_(this.peekChar_())) { 
        if(! this.skipRegularExpressionChar_()) { 
          return false; 
        } 
      } 
      return true; 
    }, 
    skipRegularExpressionChar_: function() { 
      switch(this.peekChar_()) { 
        case '\\': 
          return this.skipRegularExpressionBackslashSequence_(); 

        case '[': 
          return this.skipRegularExpressionClass_(); 

        default: 
          this.nextChar_(); 
          return true; 

      } 
    }, 
    skipRegularExpressionBackslashSequence_: function() { 
      this.nextChar_(); 
      if(isLineTerminator(this.peekChar_())) { 
        this.reportError_('New line not allowed in regular expression literal'); 
        return false; 
      } 
      this.nextChar_(); 
      return true; 
    }, 
    skipRegularExpressionClass_: function() { 
      this.nextChar_(); 
      while(! this.isAtEnd_() && this.peekRegularExpressionClassChar_()) { 
        if(! this.skipRegularExpressionClassChar_()) { 
          return false; 
        } 
      } 
      if(this.peekChar_() != ']') { 
        this.reportError_('\']\' expected'); 
        return false; 
      } 
      this.nextChar_(); 
      return true; 
    }, 
    peekRegularExpressionClassChar_: function() { 
      return this.peekChar_() != ']' && ! isLineTerminator(this.peekChar_()); 
    }, 
    skipRegularExpressionClassChar_: function() { 
      if(this.peek_('\\')) { 
        return this.skipRegularExpressionBackslashSequence_(); 
      } 
      this.nextChar_(); 
      return true; 
    }, 
    isRegularExpressionFirstChar_: function(ch) { 
      return this.isRegularExpressionChar_(ch) && ch != '*'; 
    }, 
    isRegularExpressionChar_: function(ch) { 
      switch(ch) { 
        case '/': 
          return false; 

        case '\\': 
        case '[': 
          return true; 

        default: 
          return ! isLineTerminator(ch); 

      } 
    }, 
    nextQuasiLiteralPortionToken: function() { 
      this.clearTokenLookahead_(); 
      var beginToken = this.index_; 
      if(this.isAtEnd_()) { 
        return this.lastToken_ = this.createToken_(TokenType.END_OF_FILE, beginToken); 
      } 
      this.skipQuasiLiteralPortion_(); 
      return this.lastToken_ = new LiteralToken(TokenType.QUASI_LITERAL_PORTION, this.getTokenString_(beginToken), this.getTokenRange_(beginToken)); 
    }, 
    nextQuasiSubstitutionToken: function() { 
      this.clearTokenLookahead_(); 
      var beginToken = this.index_; 
      var ch = this.nextChar_(); 
      traceur.assert(ch == '$'); 
      return this.lastToken_ = this.createToken_(TokenType.DOLLAR, beginToken); 
    }, 
    nextQuasiIdentifier: function() { 
      this.clearTokenLookahead_(); 
      var beginToken = this.index_; 
      var ch = this.nextChar_(); 
      return this.scanIdentifierOrKeyword(beginToken, ch); 
    }, 
    peekQuasiToken: function(type) { 
      this.clearTokenLookahead_(); 
      var ch = this.peekChar_(); 
      switch(type) { 
        case TokenType.IDENTIFIER: 
          return isIdentifierStart(ch); 

        case TokenType.END_OF_FILE: 
          return ch == '\x00'; 

        default: 
          return ch == type; 

      } 
    }, 
    skipQuasiLiteralPortion_: function() { 
      while(! this.isAtEnd_()) { 
        if(this.peek_('`')) { 
          break; 
        } 
        if(this.peek_('$')) { 
          var ch = this.peekChar_(1); 
          if(ch == '{') { 
            break; 
          } 
        } 
        if(this.peek_('\\')) { 
          this.skipStringLiteralEscapeSequence_(); 
        } else { 
          this.nextChar_(); 
        } 
      } 
    }, 
    peekToken: function(opt_index) { 
      return this.peekToken_(opt_index || 0, true); 
    }, 
    peekTokenNoLineTerminator: function(opt_index) { 
      this.clearTokenAndWhitespaceLookahead_(); 
      return this.peekToken_(opt_index || 0, false); 
    }, 
    peekToken_: function(index, allowLineTerminator) { 
      while(this.currentTokens_.length <= index) { 
        var token = this.scanToken_(allowLineTerminator); 
        if(! token) return null; 
        this.currentTokens_.push(token); 
      } 
      return this.currentTokens_[index]; 
    }, 
    isAtEnd_: function() { 
      return this.index_ >= this.source_.contents.length; 
    }, 
    skipWhitespace_: function(allowLineTerminator) { 
      while(! this.isAtEnd_() && this.peekWhitespace_(allowLineTerminator)) { 
        this.nextChar_(); 
      } 
    }, 
    peekWhitespace_: function(allowLineTerminator) { 
      return isWhitespace(this.peekChar_()) &&(allowLineTerminator || ! isLineTerminator(this.peekChar_())); 
    }, 
    skipComments_: function(allowLineTerminator) { 
      while(this.skipComment_(allowLineTerminator)) { } 
    }, 
    skipComment_: function(allowLineTerminator) { 
      this.skipWhitespace_(allowLineTerminator); 
      if(! this.isAtEnd_() && this.peek_('/')) { 
        switch(this.peekChar_(1)) { 
          case '/': 
            this.skipSingleLineComment_(); 
            return true; 

          case '*': 
            this.skipMultiLineComment_(); 
            return true; 

        } 
      } 
      return false; 
    }, 
    skipSingleLineComment_: function() { 
      while(! this.isAtEnd_() && ! isLineTerminator(this.peekChar_())) { 
        this.nextChar_(); 
      } 
    }, 
    skipMultiLineComment_: function() { 
      this.nextChar_(); 
      this.nextChar_(); 
      while(! this.isAtEnd_() &&(this.peekChar_() != '*' || this.peekChar_(1) != '/')) { 
        this.nextChar_(); 
      } 
      this.nextChar_(); 
      this.nextChar_(); 
    }, 
    scanToken_: function(allowLineTerminator) { 
      this.skipComments_(allowLineTerminator); 
      var beginToken = this.index_; 
      if(this.isAtEnd_()) return this.createToken_(TokenType.END_OF_FILE, beginToken); 
      var ch = this.nextChar_(); 
      if(! allowLineTerminator && isLineTerminator(ch)) return null; 
      switch(ch) { 
        case '{': 
          return this.createToken_(TokenType.OPEN_CURLY, beginToken); 

        case '}': 
          return this.createToken_(TokenType.CLOSE_CURLY, beginToken); 

        case '(': 
          return this.createToken_(TokenType.OPEN_PAREN, beginToken); 

        case ')': 
          return this.createToken_(TokenType.CLOSE_PAREN, beginToken); 

        case '[': 
          return this.createToken_(TokenType.OPEN_SQUARE, beginToken); 

        case ']': 
          return this.createToken_(TokenType.CLOSE_SQUARE, beginToken); 

        case '.': 
          if(isDecimalDigit(this.peekChar_())) { 
            return this.scanNumberPostPeriod_(beginToken); 
          } 
          if(this.peek_('.') && this.peekChar_(1) == '.') { 
            this.nextChar_(); 
            this.nextChar_(); 
            return this.createToken_(TokenType.DOT_DOT_DOT, beginToken); 
          } 
          if(this.peek_('{')) { 
            this.nextChar_(); 
            return this.createToken_(TokenType.PERIOD_OPEN_CURLY, beginToken); 
          } 
          return this.createToken_(TokenType.PERIOD, beginToken); 

        case ';': 
          return this.createToken_(TokenType.SEMI_COLON, beginToken); 

        case ',': 
          return this.createToken_(TokenType.COMMA, beginToken); 

        case '~': 
          return this.createToken_(TokenType.TILDE, beginToken); 

        case '?': 
          return this.createToken_(TokenType.QUESTION, beginToken); 

        case ':': 
          return this.createToken_(TokenType.COLON, beginToken); 

        case '<': 
          switch(this.peekChar_()) { 
            case '<': 
              this.nextChar_(); 
              if(this.peek_('=')) { 
                this.nextChar_(); 
                return this.createToken_(TokenType.LEFT_SHIFT_EQUAL, beginToken); 
              } 
              return this.createToken_(TokenType.LEFT_SHIFT, beginToken); 

            case '=': 
              this.nextChar_(); 
              return this.createToken_(TokenType.LESS_EQUAL, beginToken); 

            default: 
              return this.createToken_(TokenType.OPEN_ANGLE, beginToken); 

          } 

        case '>': 
          switch(this.peekChar_()) { 
            case '>': 
              this.nextChar_(); 
              switch(this.peekChar_()) { 
                case '=': 
                  this.nextChar_(); 
                  return this.createToken_(TokenType.RIGHT_SHIFT_EQUAL, beginToken); 

                case '>': 
                  this.nextChar_(); 
                  if(this.peek_('=')) { 
                    this.nextChar_(); 
                    return this.createToken_(TokenType.UNSIGNED_RIGHT_SHIFT_EQUAL, beginToken); 
                  } 
                  return this.createToken_(TokenType.UNSIGNED_RIGHT_SHIFT, beginToken); 

                default: 
                  return this.createToken_(TokenType.RIGHT_SHIFT, beginToken); 

              } 

            case '=': 
              this.nextChar_(); 
              return this.createToken_(TokenType.GREATER_EQUAL, beginToken); 

            default: 
              return this.createToken_(TokenType.CLOSE_ANGLE, beginToken); 

          } 

        case '=': 
          if(this.peek_('=')) { 
            this.nextChar_(); 
            if(this.peek_('=')) { 
              this.nextChar_(); 
              return this.createToken_(TokenType.EQUAL_EQUAL_EQUAL, beginToken); 
            } 
            return this.createToken_(TokenType.EQUAL_EQUAL, beginToken); 
          } 
          if(this.peek_('>')) { 
            this.nextChar_(); 
            return this.createToken_(TokenType.ARROW, beginToken); 
          } 
          return this.createToken_(TokenType.EQUAL, beginToken); 

        case '!': 
          if(this.peek_('=')) { 
            this.nextChar_(); 
            if(this.peek_('=')) { 
              this.nextChar_(); 
              return this.createToken_(TokenType.NOT_EQUAL_EQUAL, beginToken); 
            } 
            return this.createToken_(TokenType.NOT_EQUAL, beginToken); 
          } 
          return this.createToken_(TokenType.BANG, beginToken); 

        case '*': 
          if(this.peek_('=')) { 
            this.nextChar_(); 
            return this.createToken_(TokenType.STAR_EQUAL, beginToken); 
          } 
          return this.createToken_(TokenType.STAR, beginToken); 

        case '%': 
          if(this.peek_('=')) { 
            this.nextChar_(); 
            return this.createToken_(TokenType.PERCENT_EQUAL, beginToken); 
          } 
          return this.createToken_(TokenType.PERCENT, beginToken); 

        case '^': 
          if(this.peek_('=')) { 
            this.nextChar_(); 
            return this.createToken_(TokenType.CARET_EQUAL, beginToken); 
          } 
          return this.createToken_(TokenType.CARET, beginToken); 

        case '/': 
          if(this.peek_('=')) { 
            this.nextChar_(); 
            return this.createToken_(TokenType.SLASH_EQUAL, beginToken); 
          } 
          return this.createToken_(TokenType.SLASH, beginToken); 

        case '+': 
          switch(this.peekChar_()) { 
            case '+': 
              this.nextChar_(); 
              return this.createToken_(TokenType.PLUS_PLUS, beginToken); 

            case '=': 
              this.nextChar_(); 
              return this.createToken_(TokenType.PLUS_EQUAL, beginToken); 

            default: 
              return this.createToken_(TokenType.PLUS, beginToken); 

          } 

        case '-': 
          switch(this.peekChar_()) { 
            case '-': 
              this.nextChar_(); 
              return this.createToken_(TokenType.MINUS_MINUS, beginToken); 

            case '=': 
              this.nextChar_(); 
              return this.createToken_(TokenType.MINUS_EQUAL, beginToken); 

            default: 
              return this.createToken_(TokenType.MINUS, beginToken); 

          } 

        case '&': 
          switch(this.peekChar_()) { 
            case '&': 
              this.nextChar_(); 
              return this.createToken_(TokenType.AND, beginToken); 

            case '=': 
              this.nextChar_(); 
              return this.createToken_(TokenType.AMPERSAND_EQUAL, beginToken); 

            default: 
              return this.createToken_(TokenType.AMPERSAND, beginToken); 

          } 

        case '|': 
          switch(this.peekChar_()) { 
            case '|': 
              this.nextChar_(); 
              return this.createToken_(TokenType.OR, beginToken); 

            case '=': 
              this.nextChar_(); 
              return this.createToken_(TokenType.BAR_EQUAL, beginToken); 

            default: 
              return this.createToken_(TokenType.BAR, beginToken); 

          } 

        case '`': 
          return this.createToken_(TokenType.BACK_QUOTE, beginToken); 

        case '@': 
          return this.scanAtName_(beginToken); 

        case '0': 
          return this.scanPostZero_(beginToken); 

        case '1': 
        case '2': 
        case '3': 
        case '4': 
        case '5': 
        case '6': 
        case '7': 
        case '8': 
        case '9': 
          return this.scanPostDigit_(beginToken); 

        case '"': 
        case '\'': 
          return this.scanStringLiteral_(beginToken, ch); 

        default: 
          return this.scanIdentifierOrKeyword(beginToken, ch); 

      } 
    }, 
    scanNumberPostPeriod_: function(beginToken) { 
      this.skipDecimalDigits_(); 
      return this.scanExponentOfNumericLiteral_(beginToken); 
    }, 
    scanPostDigit_: function(beginToken) { 
      this.skipDecimalDigits_(); 
      return this.scanFractionalNumericLiteral_(beginToken); 
    }, 
    scanPostZero_: function(beginToken) { 
      switch(this.peekChar_()) { 
        case 'x': 
        case 'X': 
          this.nextChar_(); 
          if(! isHexDigit(this.peekChar_())) { 
            this.reportError_('Hex Integer Literal must contain at least one digit'); 
          } 
          this.skipHexDigits_(); 
          return new LiteralToken(TokenType.NUMBER, this.getTokenString_(beginToken), this.getTokenRange_(beginToken)); 

        case '.': 
          return this.scanFractionalNumericLiteral_(beginToken); 

        case '0': 
        case '1': 
        case '2': 
        case '3': 
        case '4': 
        case '5': 
        case '6': 
        case '7': 
        case '8': 
        case '9': 
          return this.scanPostDigit_(beginToken); 

        default: 
          return new LiteralToken(TokenType.NUMBER, this.getTokenString_(beginToken), this.getTokenRange_(beginToken)); 

      } 
    }, 
    createToken_: function(type, beginToken) { 
      return new Token(type, this.getTokenRange_(beginToken)); 
    }, 
    scanUnicode: function(beginToken, ch) { 
      this.reportError_(this.getPosition_(beginToken), 'Unimplemented: Unicode escape sequence'); 
      return this.createToken_(TokenType.ERROR, beginToken); 
    }, 
    scanIdentifierOrKeyword: function(beginToken, ch) { 
      if(ch == '\\') { 
        return this.scanUnicode(beginToken, ch); 
      } 
      if(! isIdentifierStart(ch)) { 
        this.reportError_(this.getPosition_(beginToken), 'Character code \'' + ch.charCodeAt(0) + '\' is not a valid identifier start char'); 
        return this.createToken_(TokenType.ERROR, beginToken); 
      } 
      while(this.isIdentifierPart_(this.peekChar_())) { 
        this.nextChar_(); 
      } 
      if(ch == '\\') { 
        return this.scanUnicode(beginToken, ch); 
      } 
      var value = this.source_.contents.substring(beginToken, this.index_); 
      if(Keywords.isKeyword(value)) { 
        return new Token(Keywords.getTokenType(value), this.getTokenRange_(beginToken)); 
      } 
      return new IdentifierToken(this.getTokenRange_(beginToken), value); 
    }, 
    isIdentifierPart_: function(ch) { 
      return isIdentifierStart(ch) || isDecimalDigit(ch); 
    }, 
    scanAtName_: function(beginToken) { 
      var ch = this.nextChar_(); 
      var identifierToken = this.scanIdentifierOrKeyword(beginToken, ch); 
      if(identifierToken.type === TokenType.ERROR) return identifierToken; 
      var value = identifierToken.value; 
      return new AtNameToken(this.getTokenRange_(beginToken), value); 
    }, 
    scanStringLiteral_: function(beginIndex, terminator) { 
      while(this.peekStringLiteralChar_(terminator)) { 
        if(! this.skipStringLiteralChar_()) { 
          return new LiteralToken(TokenType.STRING, this.getTokenString_(beginIndex), this.getTokenRange_(beginIndex)); 
        } 
      } 
      if(this.peekChar_() != terminator) { 
        this.reportError_(this.getPosition_(beginIndex), 'Unterminated String Literal'); 
      } else { 
        this.nextChar_(); 
      } 
      return new LiteralToken(TokenType.STRING, this.getTokenString_(beginIndex), this.getTokenRange_(beginIndex)); 
    }, 
    getTokenString_: function(beginIndex) { 
      return this.source_.contents.substring(beginIndex, this.index_); 
    }, 
    peekStringLiteralChar_: function(terminator) { 
      return ! this.isAtEnd_() && this.peekChar_() != terminator && ! isLineTerminator(this.peekChar_()); 
    }, 
    skipStringLiteralChar_: function() { 
      if(this.peek_('\\')) { 
        return this.skipStringLiteralEscapeSequence_(); 
      } 
      this.nextChar_(); 
      return true; 
    }, 
    skipStringLiteralEscapeSequence_: function() { 
      this.nextChar_(); 
      if(this.isAtEnd_()) { 
        this.reportError_('Unterminated string literal escape sequence'); 
        return false; 
      } 
      if(isLineTerminator(this.peekChar_())) { 
        this.skipLineTerminator_(); 
        return true; 
      } 
      switch(this.nextChar_()) { 
        case '\'': 
        case '"': 
        case '\\': 
        case 'b': 
        case 'f': 
        case 'n': 
        case 'r': 
        case 't': 
        case 'v': 
        case '0': 
          return true; 

        case 'x': 
          return this.skipHexDigit_() && this.skipHexDigit_(); 

        case 'u': 
          return this.skipHexDigit_() && this.skipHexDigit_() && this.skipHexDigit_() && this.skipHexDigit_(); 

        default: 
          return true; 

      } 
    }, 
    skipHexDigit_: function() { 
      if(! isHexDigit(this.peekChar_())) { 
        this.reportError_('Hex digit expected'); 
        return false; 
      } 
      this.nextChar_(); 
      return true; 
    }, 
    skipLineTerminator_: function() { 
      var first = this.nextChar_(); 
      if(first == '\r' && this.peek_('\n')) { 
        this.nextChar_(); 
      } 
    }, 
    scanFractionalNumericLiteral_: function(beginToken) { 
      if(this.peek_('.')) { 
        this.nextChar_(); 
        this.skipDecimalDigits_(); 
      } 
      return this.scanExponentOfNumericLiteral_(beginToken); 
    }, 
    scanExponentOfNumericLiteral_: function(beginToken) { 
      switch(this.peekChar_()) { 
        case 'e': 
        case 'E': 
          this.nextChar_(); 
          switch(this.peekChar_()) { 
            case '+': 
            case '-': 
              this.nextChar_(); 
              break; 

          } 
          if(! isDecimalDigit(this.peekChar_())) { 
            this.reportError_('Exponent part must contain at least one digit'); 
          } 
          this.skipDecimalDigits_(); 
          break; 

        default: 
          break; 

      } 
      return new LiteralToken(TokenType.NUMBER, this.getTokenString_(beginToken), this.getTokenRange_(beginToken)); 
    }, 
    skipDecimalDigits_: function() { 
      while(isDecimalDigit(this.peekChar_())) { 
        this.nextChar_(); 
      } 
    }, 
    skipHexDigits_: function() { 
      while(isHexDigit(this.peekChar_())) { 
        this.nextChar_(); 
      } 
    }, 
    nextChar_: function() { 
      if(this.isAtEnd_()) { 
        return '\x00'; 
      } 
      return this.source_.contents.charAt(this.index_ ++); 
    }, 
    peek_: function(ch) { 
      return this.peekChar_() == ch; 
    }, 
    peekChar_: function(opt_offset) { 
      return this.source_.contents.charAt(this.index_ +(opt_offset || 0)) || '\x00'; 
    }, 
    reportError_: function(var_args) { 
      var position, message; 
      if(arguments.length == 1) { 
        position = this.getPosition(); 
        message = arguments[0]; 
      } else { 
        position = arguments[0]; 
        message = arguments[1]; 
      } 
      this.errorReporter_.reportError(position, message); 
    } 
  }, null, true, false); 
  return Object.preventExtensions(Object.create(null, { Scanner: { 
      get: function() { 
        return Scanner; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_Parser_js =(function() { 
  "use strict"; 
  var $__64 = $src_syntax_IdentifierToken_js, IdentifierToken = $__64.IdentifierToken; 
  var $__65 = $src_syntax_Keywords_js, Keywords = $__65.Keywords; 
  var $__66 = $src_util_MutedErrorReporter_js, MutedErrorReporter = $__66.MutedErrorReporter; 
  var $__67 = $src_syntax_trees_NullTree_js, NullTree = $__67.NullTree; 
  var $__68 = $src_syntax_trees_ParseTree_js, ParseTreeType = $__68.ParseTreeType; 
  var $__69 = $src_syntax_PredefinedName_js, FROM = $__69.FROM, GET = $__69.GET, IS = $__69.IS, ISNT = $__69.ISNT, MODULE = $__69.MODULE, OF = $__69.OF, SET = $__69.SET; 
  var $__70 = $src_syntax_Scanner_js, Scanner = $__70.Scanner; 
  var $__71 = $src_util_SourceRange_js, SourceRange = $__71.SourceRange; 
  var $__72 = $src_syntax_Token_js, Token = $__72.Token; 
  var $__73 = $src_syntax_TokenType_js, TokenType = $__73.TokenType; 
  var $__74 = $src_options_js, options = $__74.parseOptions; 
  var $__75 = $src_syntax_trees_ParseTrees_js, NullTree = $__75.NullTree, ParseTree = $__75.ParseTree, ParseTreeType = $__75.ParseTreeType, ArgumentList = $__75.ArgumentList, ArrayComprehension = $__75.ArrayComprehension, ArrayLiteralExpression = $__75.ArrayLiteralExpression, ArrayPattern = $__75.ArrayPattern, ArrowFunctionExpression = $__75.ArrowFunctionExpression, AtNameExpression = $__75.AtNameExpression, AtNameDeclaration = $__75.AtNameDeclaration, AwaitStatement = $__75.AwaitStatement, BinaryOperator = $__75.BinaryOperator, BindThisParameter = $__75.BindThisParameter, BindingIdentifier = $__75.BindingIdentifier, BindingElement = $__75.BindingElement, Block = $__75.Block, BreakStatement = $__75.BreakStatement, CallExpression = $__75.CallExpression, CascadeExpression = $__75.CascadeExpression, CaseClause = $__75.CaseClause, Catch = $__75.Catch, ClassDeclaration = $__75.ClassDeclaration, ClassExpression = $__75.ClassExpression, CommaExpression = $__75.CommaExpression, ComprehensionFor = $__75.ComprehensionFor, ConditionalExpression = $__75.ConditionalExpression, ContinueStatement = $__75.ContinueStatement, DebuggerStatement = $__75.DebuggerStatement, DefaultClause = $__75.DefaultClause, DoWhileStatement = $__75.DoWhileStatement, EmptyStatement = $__75.EmptyStatement, ExportDeclaration = $__75.ExportDeclaration, ExportMappingList = $__75.ExportMappingList, ExportMapping = $__75.ExportMapping, ExportSpecifier = $__75.ExportSpecifier, ExportSpecifierSet = $__75.ExportSpecifierSet, ExpressionStatement = $__75.ExpressionStatement, Finally = $__75.Finally, ForOfStatement = $__75.ForOfStatement, ForInStatement = $__75.ForInStatement, FormalParameterList = $__75.FormalParameterList, ForStatement = $__75.ForStatement, FunctionDeclaration = $__75.FunctionDeclaration, GeneratorComprehension = $__75.GeneratorComprehension, GetAccessor = $__75.GetAccessor, IdentifierExpression = $__75.IdentifierExpression, IfStatement = $__75.IfStatement, ImportDeclaration = $__75.ImportDeclaration, ImportBinding = $__75.ImportBinding, ImportSpecifier = $__75.ImportSpecifier, ImportSpecifierSet = $__75.ImportSpecifierSet, LabelledStatement = $__75.LabelledStatement, LiteralExpression = $__75.LiteralExpression, MemberExpression = $__75.MemberExpression, MemberLookupExpression = $__75.MemberLookupExpression, MissingPrimaryExpression = $__75.MissingPrimaryExpression, ModuleDeclaration = $__75.ModuleDeclaration, ModuleDefinition = $__75.ModuleDefinition, ModuleExpression = $__75.ModuleExpression, ModuleRequire = $__75.ModuleRequire, ModuleSpecifier = $__75.ModuleSpecifier, NameStatement = $__75.NameStatement, NewExpression = $__75.NewExpression, ObjectLiteralExpression = $__75.ObjectLiteralExpression, ObjectPatternField = $__75.ObjectPatternField, ObjectPattern = $__75.ObjectPattern, ParenExpression = $__75.ParenExpression, PostfixExpression = $__75.PostfixExpression, Program = $__75.Program, PropertyMethodAssignment = $__75.PropertyMethodAssignment, PropertyNameAssignment = $__75.PropertyNameAssignment, PropertyNameShorthand = $__75.PropertyNameShorthand, QuasiLiteralExpression = $__75.QuasiLiteralExpression, QuasiLiteralPortion = $__75.QuasiLiteralPortion, QuasiSubstitution = $__75.QuasiSubstitution, RequiresMember = $__75.RequiresMember, RestParameter = $__75.RestParameter, ReturnStatement = $__75.ReturnStatement, SetAccessor = $__75.SetAccessor, SpreadExpression = $__75.SpreadExpression, SpreadPatternElement = $__75.SpreadPatternElement, SuperExpression = $__75.SuperExpression, SwitchStatement = $__75.SwitchStatement, ThisExpression = $__75.ThisExpression, ThrowStatement = $__75.ThrowStatement, TryStatement = $__75.TryStatement, UnaryExpression = $__75.UnaryExpression, VariableDeclarationList = $__75.VariableDeclarationList, VariableDeclaration = $__75.VariableDeclaration, VariableStatement = $__75.VariableStatement, WhileStatement = $__75.WhileStatement, WithStatement = $__75.WithStatement, YieldStatement = $__75.YieldStatement; 
  var Expression = { 
    NO_IN: 'NO_IN', 
    NORMAL: 'NORMAL' 
  }; 
  var DestructuringInitializer = { 
    REQUIRED: 'REQUIRED', 
    OPTIONAL: 'OPTIONAL' 
  }; 
  function followedByCommaOrCloseSquare(token) { 
    return token.type === TokenType.COMMA || token.type === TokenType.CLOSE_SQUARE; 
  } 
  function followedByCommaOrCloseCurly(token) { 
    return token.type === TokenType.COMMA || token.type === TokenType.CLOSE_CURLY; 
  } 
  function followedByInOrOf(token) { 
    return token.type === TokenType.IN || token.type === TokenType.IDENTIFIER && token.value === OF; 
  } 
  var Initializer = { 
    ALLOWED: 'ALLOWED', 
    REQUIRED: 'REQUIRED' 
  }; 
  var Parser = traceur.runtime.createClass({ 
    constructor: function(errorReporter, var_args) { 
      this.errorReporter_ = errorReporter; 
      var scanner; 
      if(arguments[1]instanceof Scanner) { 
        scanner = arguments[1]; 
      } else { 
        scanner = new Scanner(errorReporter, arguments[1], arguments[2]); 
      } 
      this.scanner_ = scanner; 
      this.allowYield_ = false; 
    }, 
    parseProgram: function(opt_load) { 
      var start = this.getTreeStartLocation_(); 
      var programElements = this.parseProgramElements_(! ! opt_load); 
      this.eat_(TokenType.END_OF_FILE); 
      return new Program(this.getTreeLocation_(start), programElements); 
    }, 
    parseProgramElements_: function(load) { 
      var result =[]; 
      while(! this.peek_(TokenType.END_OF_FILE)) { 
        var programElement = this.parseProgramElement_(load); 
        if(! programElement) { 
          return null; 
        } 
        result.push(programElement); 
      } 
      return result; 
    }, 
    peekProgramElement_: function() { 
      return this.peekFunction_() || this.peekVariableDeclarationList_() || this.peekImportDeclaration_() || this.peekExportDeclaration_() || this.peekModuleDeclaration_() || this.peekClassDeclaration_() || this.peekStatement_(); 
    }, 
    parseProgramElement_: function(load) { 
      if(this.peekVariableDeclarationList_()) { 
        return this.parseVariableStatement_(); 
      } 
      if(this.peekImportDeclaration_(load)) { 
        return this.parseImportDeclaration_(load); 
      } 
      if(this.peekExportDeclaration_(load)) { 
        return this.parseExportDeclaration_(load); 
      } 
      if(this.peekModuleDeclaration_(load)) { 
        return this.parseModuleDeclaration_(load); 
      } 
      return this.parseStatement_(); 
    }, 
    peekModuleDefinition_: function() { 
      return this.peekPredefinedString_(MODULE) && this.peek_(TokenType.IDENTIFIER, 1) && this.peek_(TokenType.OPEN_CURLY, 2); 
    }, 
    parseModuleDefinition_: function(load) { 
      var start = this.getTreeStartLocation_(); 
      this.eatId_(); 
      var name = this.eatId_(); 
      this.eat_(TokenType.OPEN_CURLY); 
      var result =[]; 
      while(this.peekModuleElement_()) { 
        result.push(this.parseModuleElement_(load)); 
      } 
      this.eat_(TokenType.CLOSE_CURLY); 
      return new ModuleDefinition(this.getTreeLocation_(start), name, result); 
    }, 
    parseModuleSpecifier_: function(load) { 
      var start = this.getTreeStartLocation_(); 
      var identifier = this.eatId_(); 
      this.eatId_(FROM); 
      var expression = this.parseModuleExpression_(load); 
      return new ModuleSpecifier(this.getTreeLocation_(start), identifier, expression); 
    }, 
    parseModuleExpression_: function(load) { 
      var start = this.getTreeStartLocation_(); 
      var reference = this.parseModuleReference_(load); 
      var identifierNames =[]; 
      while(this.peek_(TokenType.PERIOD) && this.peekIdName_(1)) { 
        this.eat_(TokenType.PERIOD); 
        identifierNames.push(this.eatIdName_()); 
      } 
      return new ModuleExpression(this.getTreeLocation_(start), reference, identifierNames); 
    }, 
    parseModuleReference_: function(load) { 
      var start = this.getTreeStartLocation_(); 
      if(load && this.peek_(TokenType.STRING)) { 
        var url = this.eat_(TokenType.STRING); 
        return new ModuleRequire(this.getTreeLocation_(start), url); 
      } 
      return this.parseIdentifierExpression_(); 
    }, 
    peekModuleElement_: function() { 
      return this.peekProgramElement_(); 
    }, 
    parseModuleElement_: function(load) { 
      return this.parseProgramElement_(load); 
    }, 
    peekImportDeclaration_: function() { 
      return options.modules && this.peek_(TokenType.IMPORT); 
    }, 
    parseImportDeclaration_: function(load) { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.IMPORT); 
      var importBindings =[]; 
      importBindings.push(this.parseImportBinding_(load)); 
      while(this.peek_(TokenType.COMMA)) { 
        this.eat_(TokenType.COMMA); 
        importBindings.push(this.parseImportBinding_(load)); 
      } 
      this.eatPossibleImplicitSemiColon_(); 
      return new ImportDeclaration(this.getTreeLocation_(start), importBindings); 
    }, 
    parseImportBinding_: function(load) { 
      var start = this.getTreeStartLocation_(); 
      var importSpecifierSet = this.parseImportSpecifierSet_(); 
      this.eatId_(FROM); 
      var moduleExpression = this.parseModuleExpression_(load); 
      return new ImportBinding(this.getTreeLocation_(start), moduleExpression, importSpecifierSet); 
    }, 
    parseImportSpecifierSet_: function() { 
      if(this.peek_(TokenType.OPEN_CURLY)) { 
        var start = this.getTreeStartLocation_(); 
        this.eat_(TokenType.OPEN_CURLY); 
        var specifiers =[this.parseImportSpecifier_()]; 
        while(this.peek_(TokenType.COMMA)) { 
          this.eat_(TokenType.COMMA); 
          if(this.peek_(TokenType.CLOSE_CURLY)) break; 
          specifiers.push(this.parseImportSpecifier_()); 
        } 
        this.eat_(TokenType.CLOSE_CURLY); 
        return new ImportSpecifierSet(this.getTreeLocation_(start), specifiers); 
      } 
      if(this.peek_(TokenType.STAR)) { 
        var star = this.eat_(TokenType.STAR); 
        return new ImportSpecifierSet(this.getTreeLocation_(start), star); 
      } 
      return this.parseIdentifierNameExpression_(); 
    }, 
    parseImportSpecifier_: function() { 
      var start = this.getTreeStartLocation_(); 
      var lhs = this.eatIdName_(); 
      var rhs = null; 
      if(this.peek_(TokenType.COLON)) { 
        this.eat_(TokenType.COLON); 
        rhs = this.eatId_(); 
      } 
      return new ImportSpecifier(this.getTreeLocation_(start), lhs, rhs); 
    }, 
    peekExportDeclaration_: function(load) { 
      return options.modules && this.peek_(TokenType.EXPORT); 
    }, 
    parseExportDeclaration_: function(load) { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.EXPORT); 
      var exportTree; 
      switch(this.peekType_()) { 
        case TokenType.CONST: 
        case TokenType.LET: 
        case TokenType.VAR: 
          exportTree = this.parseVariableStatement_(); 
          break; 

        case TokenType.FUNCTION: 
          exportTree = this.parseFunctionDeclaration_(); 
          break; 

        case TokenType.CLASS: 
          exportTree = this.parseClassDeclaration_(); 
          break; 

        case TokenType.IDENTIFIER: 
          if(this.peekModuleDeclaration_(load)) { 
            exportTree = this.parseModuleDeclaration_(load); 
          } else { 
            exportTree = this.parseExportMappingList_(); 
          } 
          break; 

        case TokenType.OPEN_CURLY: 
          exportTree = this.parseExportMappingList_(); 
          break; 

        default: 
          this.reportError_("Unexpected symbol '{this.peekToken_()}'"); 
          return null; 

      } 
      return new ExportDeclaration(this.getTreeLocation_(start), exportTree); 
    }, 
    parseExportMappingList_: function() { 
      var start = this.getTreeStartLocation_(); 
      var mappings =[this.parseExportMapping_()]; 
      while(this.peek_(TokenType.COMMA)) { 
        this.eat_(TokenType.COMMA); 
        mappings.push(this.parseExportMapping_()); 
      } 
      this.eatPossibleImplicitSemiColon_(); 
      return new ExportMappingList(this.getTreeEndLocation_(start), mappings); 
    }, 
    peekExportMapping_: function() { 
      return this.peek_(TokenType.OPEN_CURLY) || this.peekId_(); 
    }, 
    parseExportMapping_: function() { 
      var start = this.getTreeStartLocation_(); 
      var specifierSet = this.parseExportSpecifierSet_(); 
      var expression = null; 
      if(this.peekPredefinedString_(FROM)) { 
        this.eatId_(FROM); 
        expression = this.parseModuleExpression_(false); 
      } 
      return new ExportMapping(this.getTreeLocation_(start), expression, specifierSet); 
    }, 
    peekExportSpecifierSet_: function() { 
      return this.peek_(TokenType.OPEN_CURLY) || this.peekIdName_(); 
    }, 
    parseExportSpecifierSet_: function() { 
      if(! this.peek_(TokenType.OPEN_CURLY)) return this.parseIdentifierExpression_(); 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.OPEN_CURLY); 
      var specifiers =[this.parseExportSpecifier_()]; 
      while(this.peek_(TokenType.COMMA)) { 
        this.eat_(TokenType.COMMA); 
        if(this.peek_(TokenType.CLOSE_CURLY)) break; 
        specifiers.push(this.parseExportSpecifier_()); 
      } 
      this.eat_(TokenType.CLOSE_CURLY); 
      return new ExportSpecifierSet(this.getTreeLocation_(start), specifiers); 
    }, 
    parseExportSpecifier_: function() { 
      var start = this.getTreeStartLocation_(); 
      var lhs, rhs = null; 
      if(this.peek_(TokenType.COLON, 1)) { 
        lhs = this.eatIdName_(); 
        this.eat_(TokenType.COLON); 
        rhs = this.eatId_(); 
      } else { 
        lhs = this.eatId_(); 
      } 
      return new ExportSpecifier(this.getTreeLocation_(start), lhs, rhs); 
    }, 
    peekId_: function(opt_index) { 
      return this.peek_(TokenType.IDENTIFIER, opt_index); 
    }, 
    peekIdName_: function(opt_index) { 
      var type = this.peekType_(opt_index); 
      return type == TokenType.IDENTIFIER || Keywords.isKeyword(type); 
    }, 
    peekModuleDeclaration_: function() { 
      return options.modules && this.peekPredefinedString_(MODULE) && this.peek_(TokenType.IDENTIFIER, 1) &&(this.peekPredefinedString_(FROM, 2) || this.peek_(TokenType.OPEN_CURLY, 2)); 
    }, 
    parseModuleDeclaration_: function(load) { 
      if(this.peekModuleDefinition_(load)) return this.parseModuleDefinition_(load); 
      var start = this.getTreeStartLocation_(); 
      this.eatId_(); 
      var specifiers =[this.parseModuleSpecifier_(load)]; 
      while(this.peek_(TokenType.COMMA)) { 
        this.eat_(TokenType.COMMA); 
        specifiers.push(this.parseModuleSpecifier_(load)); 
      } 
      this.eatPossibleImplicitSemiColon_(); 
      return new ModuleDeclaration(this.getTreeLocation_(start), specifiers); 
    }, 
    peekClassDeclaration_: function() { 
      return options.classes && this.peek_(TokenType.CLASS) && this.peekId_(1); 
    }, 
    parseClassShared_: function(constr) { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.CLASS); 
      var name = null; 
      if(constr == ClassDeclaration || ! this.peek_(TokenType.EXTENDS) && ! this.peek_(TokenType.OPEN_CURLY)) { 
        name = this.parseBindingIdentifier_(); 
      } 
      var superClass = null; 
      if(this.peek_(TokenType.EXTENDS)) { 
        this.eat_(TokenType.EXTENDS); 
        superClass = this.parseAssignmentExpression(); 
      } 
      this.eat_(TokenType.OPEN_CURLY); 
      var elements = this.parseClassElements_(); 
      this.eat_(TokenType.CLOSE_CURLY); 
      return new constr(this.getTreeLocation_(start), name, superClass, elements); 
    }, 
    parseClassDeclaration_: function() { 
      return this.parseClassShared_(ClassDeclaration); 
    }, 
    parseClassExpression_: function() { 
      return this.parseClassShared_(ClassExpression); 
    }, 
    parseClassElements_: function() { 
      var result =[]; 
      while(this.peekClassElement_()) { 
        result.push(this.parseClassElement_()); 
      } 
      return result; 
    }, 
    peekClassElement_: function() { 
      return options.classes &&(this.peekPropertyMethodAssignment_() || this.peekGetAccessor_() || this.peekSetAccessor_()); 
    }, 
    parseClassElement_: function() { 
      if(this.peekGetAccessor_()) return this.parseGetAccessor_(); 
      if(this.peekSetAccessor_()) return this.parseSetAccessor_(); 
      return this.parsePropertyMethodAssignment_(); 
    }, 
    parseSourceElement_: function() { 
      if(this.peekFunction_()) { 
        return this.parseFunctionDeclaration_(); 
      } 
      if(this.peekClassDeclaration_()) { 
        return this.parseClassDeclaration_(); 
      } 
      if(this.peekLet_()) { 
        return this.parseVariableStatement_(); 
      } 
      if(this.peekNameStatement_()) return this.parseNameStatement_(); 
      return this.parseStatementStandard_(); 
    }, 
    peekLet_: function() { 
      return options.blockBinding && this.peek_(TokenType.LET); 
    }, 
    peekConst_: function() { 
      return options.blockBinding && this.peek_(TokenType.CONST); 
    }, 
    peekNameStatement_: function() { 
      return options.privateNameSyntax && this.peek_(TokenType.PRIVATE) && this.peek_(TokenType.AT_NAME, 1); 
    }, 
    peekAtNameExpression_: function() { 
      return options.privateNameSyntax && this.peek_(TokenType.AT_NAME); 
    }, 
    peekSourceElement_: function() { 
      return this.peekFunction_() || this.peekClassDeclaration_() || this.peekStatementStandard_() || this.peekLet_() || this.peekAtNameExpression_() || this.peekNameStatement_(); 
    }, 
    peekFunction_: function(opt_index) { 
      var index = opt_index || 0; 
      return this.peek_(TokenType.FUNCTION, index) || this.peek_(TokenType.POUND, index); 
    }, 
    parseFunctionDeclaration_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.nextToken_(); 
      var isGenerator = this.eatOpt_(TokenType.STAR) != null; 
      return this.parseFunctionDeclarationTail_(start, isGenerator, this.parseBindingIdentifier_()); 
    }, 
    parseFunctionDeclarationTail_: function(start, isGenerator, name) { 
      this.eat_(TokenType.OPEN_PAREN); 
      var formalParameterList = this.parseFormalParameterList_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      var functionBody = this.parseFunctionBody_(isGenerator); 
      return new FunctionDeclaration(this.getTreeLocation_(start), name, isGenerator, formalParameterList, functionBody); 
    }, 
    parseFunctionExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.nextToken_(); 
      var isGenerator = this.eatOpt_(TokenType.STAR) != null; 
      var name = null; 
      if(this.peekBindingIdentifier_()) { 
        name = this.parseBindingIdentifier_(); 
      } 
      this.eat_(TokenType.OPEN_PAREN); 
      var formalParameterList = this.parseFormalParameterList_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      var functionBody = this.parseFunctionBody_(isGenerator); 
      return new FunctionDeclaration(this.getTreeLocation_(start), name, isGenerator, formalParameterList, functionBody); 
    }, 
    parseFormalParameterList_: function() { 
      var start = this.getTreeStartLocation_(); 
      var formals; 
      if(this.peekRest_()) { 
        formals =[this.parseRestParameter_()]; 
      } else { 
        formals = this.parseFormalsList_(); 
        if(this.peek_(TokenType.COMMA)) { 
          this.eat_(TokenType.COMMA); 
          formals.push(this.parseRestParameter_()); 
        } 
      } 
      return new FormalParameterList(this.getTreeLocation_(start), formals); 
    }, 
    parseFormalsList_: function() { 
      var formals =[]; 
      while(this.peekFormalParameter_()) { 
        var parameter = this.parseFormalParameter_(); 
        formals.push(parameter); 
        if(this.peek_(TokenType.COMMA) && this.peekFormalParameter_(1)) this.eat_(TokenType.COMMA); 
      } 
      return formals; 
    }, 
    peekFormalParameter_: function(opt_index) { 
      var index = opt_index || 0; 
      return this.peekBindingIdentifier_(index) || this.peekPattern_(index); 
    }, 
    parseFormalParameter_: function(opt_initializerAllowed) { 
      return this.parseBindingElement_(opt_initializerAllowed); 
    }, 
    parseRestParameter_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.DOT_DOT_DOT); 
      return new RestParameter(this.getTreeLocation_(start), this.parseBindingIdentifier_()); 
    }, 
    parseFunctionBody_: function(isGenerator) { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.OPEN_CURLY); 
      var allowYield = this.allowYield_; 
      this.allowYield_ = isGenerator; 
      var result = this.parseSourceElementList_(); 
      this.allowYield_ = allowYield; 
      this.eat_(TokenType.CLOSE_CURLY); 
      return new Block(this.getTreeLocation_(start), result); 
    }, 
    parseSourceElementList_: function() { 
      var result =[]; 
      while(this.peekSourceElement_()) { 
        var sourceElement = this.parseSourceElement_(); 
        if(! sourceElement) { 
          return null; 
        } 
        result.push(sourceElement); 
      } 
      return result; 
    }, 
    parseSpreadExpression_: function() { 
      if(! options.spread) { 
        return this.parseMissingPrimaryExpression_(); 
      } 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.DOT_DOT_DOT); 
      var operand = this.parseAssignmentExpression(); 
      return new SpreadExpression(this.getTreeLocation_(start), operand); 
    }, 
    parseStatement_: function() { 
      return this.parseSourceElement_(); 
    }, 
    parseStatementStandard_: function() { 
      switch(this.peekType_()) { 
        case TokenType.OPEN_CURLY: 
          return this.parseBlock_(); 

        case TokenType.AWAIT: 
          return this.parseAwaitStatement_(); 

        case TokenType.CONST: 
          if(! options.blockBinding) { 
            this.reportUnexpectedToken_(); 
            return null; 
          } 

        case TokenType.VAR: 
          return this.parseVariableStatement_(); 

        case TokenType.SEMI_COLON: 
          return this.parseEmptyStatement_(); 

        case TokenType.IF: 
          return this.parseIfStatement_(); 

        case TokenType.DO: 
          return this.parseDoWhileStatement_(); 

        case TokenType.WHILE: 
          return this.parseWhileStatement_(); 

        case TokenType.FOR: 
          return this.parseForStatement_(); 

        case TokenType.CONTINUE: 
          return this.parseContinueStatement_(); 

        case TokenType.BREAK: 
          return this.parseBreakStatement_(); 

        case TokenType.RETURN: 
          return this.parseReturnStatement_(); 

        case TokenType.YIELD: 
          return this.parseYieldStatement_(); 

        case TokenType.WITH: 
          return this.parseWithStatement_(); 

        case TokenType.SWITCH: 
          return this.parseSwitchStatement_(); 

        case TokenType.THROW: 
          return this.parseThrowStatement_(); 

        case TokenType.TRY: 
          return this.parseTryStatement_(); 

        case TokenType.DEBUGGER: 
          return this.parseDebuggerStatement_(); 

        default: 
          if(this.peekLabelledStatement_()) { 
            return this.parseLabelledStatement_(); 
          } 
          return this.parseExpressionStatement_(); 

      } 
    }, 
    peekStatement_: function() { 
      return this.peekSourceElement_(); 
    }, 
    peekStatementStandard_: function() { 
      switch(this.peekType_()) { 
        case TokenType.CONST: 
          return options.blockBinding; 

        case TokenType.YIELD: 
          return options.generators; 

        case TokenType.AWAIT: 
          return options.deferredFunctions; 

        case TokenType.OPEN_CURLY: 
        case TokenType.VAR: 
        case TokenType.SEMI_COLON: 
        case TokenType.IF: 
        case TokenType.DO: 
        case TokenType.WHILE: 
        case TokenType.FOR: 
        case TokenType.CONTINUE: 
        case TokenType.BREAK: 
        case TokenType.RETURN: 
        case TokenType.WITH: 
        case TokenType.SWITCH: 
        case TokenType.THROW: 
        case TokenType.TRY: 
        case TokenType.DEBUGGER: 
        case TokenType.IDENTIFIER: 
        case TokenType.THIS: 
        case TokenType.CLASS: 
        case TokenType.SUPER: 
        case TokenType.NUMBER: 
        case TokenType.STRING: 
        case TokenType.NULL: 
        case TokenType.TRUE: 
        case TokenType.SLASH: 
        case TokenType.SLASH_EQUAL: 
        case TokenType.FALSE: 
        case TokenType.OPEN_SQUARE: 
        case TokenType.OPEN_PAREN: 
        case TokenType.NEW: 
        case TokenType.DELETE: 
        case TokenType.VOID: 
        case TokenType.TYPEOF: 
        case TokenType.PLUS_PLUS: 
        case TokenType.MINUS_MINUS: 
        case TokenType.PLUS: 
        case TokenType.MINUS: 
        case TokenType.TILDE: 
        case TokenType.BANG: 
        case TokenType.BACK_QUOTE: 
          return true; 

        default: 
          return false; 

      } 
    }, 
    parseBlock_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.OPEN_CURLY); 
      var result = this.parseSourceElementList_(); 
      this.eat_(TokenType.CLOSE_CURLY); 
      return new Block(this.getTreeLocation_(start), result); 
    }, 
    parseStatementList_: function() { 
      var result =[]; 
      while(this.peekStatement_()) { 
        result.push(this.parseStatement_()); 
      } 
      return result; 
    }, 
    parseVariableStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      var declarations = this.parseVariableDeclarationList_(); 
      this.checkInitializers_(declarations); 
      this.eatPossibleImplicitSemiColon_(); 
      return new VariableStatement(this.getTreeLocation_(start), declarations); 
    }, 
    parseVariableDeclarationList_: function(opt_expressionIn, opt_initializer) { 
      var expressionIn = opt_expressionIn || Expression.NORMAL; 
      var initializer = opt_initializer || DestructuringInitializer.REQUIRED; 
      var token = this.peekType_(); 
      switch(token) { 
        case TokenType.CONST: 
        case TokenType.LET: 
          if(! options.blockBinding) debugger; 

        case TokenType.VAR: 
          this.eat_(token); 
          break; 

        default: 
          throw Error('unreachable'); 

      } 
      var start = this.getTreeStartLocation_(); 
      var declarations =[]; 
      declarations.push(this.parseVariableDeclaration_(token, expressionIn, initializer)); 
      while(this.peek_(TokenType.COMMA)) { 
        this.eat_(TokenType.COMMA); 
        declarations.push(this.parseVariableDeclaration_(token, expressionIn, initializer)); 
      } 
      return new VariableDeclarationList(this.getTreeLocation_(start), token, declarations); 
    }, 
    parseVariableDeclaration_: function(binding, expressionIn, opt_initializer) { 
      var initRequired = opt_initializer !== DestructuringInitializer.OPTIONAL; 
      var start = this.getTreeStartLocation_(); 
      var lvalue; 
      if(this.peekPattern_()) lvalue = this.parseBindingPattern_(); else lvalue = this.parseBindingIdentifier_(); 
      var initializer = null; 
      if(this.peek_(TokenType.EQUAL)) initializer = this.parseInitializer_(expressionIn); else if(lvalue.isPattern() && initRequired) this.reportError_('destructuring must have an initializer'); 
      return new VariableDeclaration(this.getTreeLocation_(start), lvalue, initializer); 
    }, 
    parseInitializer_: function(expressionIn) { 
      this.eat_(TokenType.EQUAL); 
      return this.parseAssignmentExpression(expressionIn); 
    }, 
    parseNameStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.PRIVATE); 
      var declarations =[]; 
      declarations.push(this.parseAtNameDeclaration_()); 
      while(this.peek_(TokenType.COMMA)) { 
        this.eat_(TokenType.COMMA); 
        declarations.push(this.parseAtNameDeclaration_()); 
      } 
      this.eatPossibleImplicitSemiColon_(); 
      return new NameStatement(this.getTreeLocation_(start), declarations); 
    }, 
    parseAtNameDeclaration_: function() { 
      var start = this.getTreeStartLocation_(); 
      var atName = this.eat_(TokenType.AT_NAME); 
      var initializer = null; 
      if(this.peek_(TokenType.EQUAL)) initializer = this.parseInitializer_(Expression.IN); 
      return new AtNameDeclaration(this.getTreeLocation_(start), atName, initializer); 
    }, 
    parseEmptyStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.SEMI_COLON); 
      return new EmptyStatement(this.getTreeLocation_(start)); 
    }, 
    parseExpressionStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      var expression = this.parseExpression_(); 
      this.eatPossibleImplicitSemiColon_(); 
      return new ExpressionStatement(this.getTreeLocation_(start), expression); 
    }, 
    parseIfStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.IF); 
      this.eat_(TokenType.OPEN_PAREN); 
      var condition = this.parseExpression_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      var ifClause = this.parseStatement_(); 
      var elseClause = null; 
      if(this.peek_(TokenType.ELSE)) { 
        this.eat_(TokenType.ELSE); 
        elseClause = this.parseStatement_(); 
      } 
      return new IfStatement(this.getTreeLocation_(start), condition, ifClause, elseClause); 
    }, 
    parseDoWhileStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.DO); 
      var body = this.parseStatement_(); 
      this.eat_(TokenType.WHILE); 
      this.eat_(TokenType.OPEN_PAREN); 
      var condition = this.parseExpression_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      this.eatPossibleImplicitSemiColon_(); 
      return new DoWhileStatement(this.getTreeLocation_(start), body, condition); 
    }, 
    parseWhileStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.WHILE); 
      this.eat_(TokenType.OPEN_PAREN); 
      var condition = this.parseExpression_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      var body = this.parseStatement_(); 
      return new WhileStatement(this.getTreeLocation_(start), condition, body); 
    }, 
    parseForStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.FOR); 
      this.eat_(TokenType.OPEN_PAREN); 
      var validate =(function(variables, kind) { 
        if(variables.declarations.length > 1) { 
          this.reportError_(kind + ' statement may not have more than one variable declaration'); 
        } 
        var declaration = variables.declarations[0]; 
        if(declaration.lvalue.isPattern() && declaration.initializer) { 
          this.reportError_(declaration.initializer.location,("initializer is not allowed in " + kind + " loop with pattern")); 
        } 
      }).bind(this); 
      if(this.peekVariableDeclarationList_()) { 
        var variables = this.parseVariableDeclarationList_(Expression.NO_IN, DestructuringInitializer.OPTIONAL); 
        if(this.peek_(TokenType.IN)) { 
          validate(variables, 'for-in'); 
          var declaration = variables.declarations[0]; 
          if(options.blockBinding &&(variables.declarationType == TokenType.LET || variables.declarationType == TokenType.CONST)) { 
            if(declaration.initializer != null) { 
              this.reportError_('let/const in for-in statement may not have initializer'); 
            } 
          } 
          return this.parseForInStatement_(start, variables); 
        } else if(this.peekOf_()) { 
          validate(variables, 'for-of'); 
          var declaration = variables.declarations[0]; 
          if(declaration.initializer != null) { 
            this.reportError_('for-of statement may not have initializer'); 
          } 
          return this.parseForOfStatement_(start, variables); 
        } else { 
          this.checkInitializers_(variables); 
          return this.parseForStatement2_(start, variables); 
        } 
      } 
      if(this.peek_(TokenType.SEMI_COLON)) { 
        return this.parseForStatement2_(start, null); 
      } 
      var initializer = this.parseExpression_(Expression.NO_IN); 
      if(initializer.isLeftHandSideExpression() &&(this.peek_(TokenType.IN) || this.peekOf_())) { 
        initializer = this.transformLeftHandSideExpression_(initializer); 
        if(this.peekOf_()) return this.parseForOfStatement_(start, initializer); 
        return this.parseForInStatement_(start, initializer); 
      } 
      return this.parseForStatement2_(start, initializer); 
    }, 
    peekOf_: function() { 
      return options.forOf && this.peekPredefinedString_(OF); 
    }, 
    parseForOfStatement_: function(start, initializer) { 
      this.eatId_(); 
      var collection = this.parseExpression_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      var body = this.parseStatement_(); 
      return new ForOfStatement(this.getTreeLocation_(start), initializer, collection, body); 
    }, 
    checkInitializers_: function(variables) { 
      if(options.blockBinding && variables.declarationType == TokenType.CONST) { 
        var type = variables.declarationType; 
        for(var i = 0; i < variables.declarations.length; i ++) { 
          if(! this.checkInitializer_(type, variables.declarations[i])) { 
            break; 
          } 
        } 
      } 
    }, 
    checkInitializer_: function(type, declaration) { 
      if(options.blockBinding && type == TokenType.CONST && declaration.initializer == null) { 
        this.reportError_('const variables must have an initializer'); 
        return false; 
      } 
      return true; 
    }, 
    peekVariableDeclarationList_: function() { 
      switch(this.peekType_()) { 
        case TokenType.VAR: 
          return true; 

        case TokenType.CONST: 
        case TokenType.LET: 
          return options.blockBinding; 

        default: 
          return false; 

      } 
    }, 
    parseForStatement2_: function(start, initializer) { 
      this.eat_(TokenType.SEMI_COLON); 
      var condition = null; 
      if(! this.peek_(TokenType.SEMI_COLON)) { 
        condition = this.parseExpression_(); 
      } 
      this.eat_(TokenType.SEMI_COLON); 
      var increment = null; 
      if(! this.peek_(TokenType.CLOSE_PAREN)) { 
        increment = this.parseExpression_(); 
      } 
      this.eat_(TokenType.CLOSE_PAREN); 
      var body = this.parseStatement_(); 
      return new ForStatement(this.getTreeLocation_(start), initializer, condition, increment, body); 
    }, 
    parseForInStatement_: function(start, initializer) { 
      this.eat_(TokenType.IN); 
      var collection = this.parseExpression_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      var body = this.parseStatement_(); 
      return new ForInStatement(this.getTreeLocation_(start), initializer, collection, body); 
    }, 
    parseContinueStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.CONTINUE); 
      var name = null; 
      if(! this.peekImplicitSemiColon_()) { 
        name = this.eatIdOpt_(); 
      } 
      this.eatPossibleImplicitSemiColon_(); 
      return new ContinueStatement(this.getTreeLocation_(start), name); 
    }, 
    parseBreakStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.BREAK); 
      var name = null; 
      if(! this.peekImplicitSemiColon_()) { 
        name = this.eatIdOpt_(); 
      } 
      this.eatPossibleImplicitSemiColon_(); 
      return new BreakStatement(this.getTreeLocation_(start), name); 
    }, 
    parseReturnStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.RETURN); 
      var expression = null; 
      if(! this.peekImplicitSemiColon_()) { 
        expression = this.parseExpression_(); 
      } 
      this.eatPossibleImplicitSemiColon_(); 
      return new ReturnStatement(this.getTreeLocation_(start), expression); 
    }, 
    parseYieldStatement_: function() { 
      if(! this.allowYield_) { 
        return this.parseMissingPrimaryExpression_("'yield' expressions are only allowed inside 'function*'"); 
      } 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.YIELD); 
      var expression = null; 
      var isYieldFor = this.eatOpt_(TokenType.STAR) != null; 
      if(isYieldFor || ! this.peekImplicitSemiColon_()) { 
        expression = this.parseExpression_(); 
      } 
      this.eatPossibleImplicitSemiColon_(); 
      return new YieldStatement(this.getTreeLocation_(start), expression, isYieldFor); 
    }, 
    parseAwaitStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.AWAIT); 
      var identifier = null; 
      if(this.peek_(TokenType.IDENTIFIER) && this.peek_(TokenType.EQUAL, 1)) { 
        identifier = this.eatId_(); 
        this.eat_(TokenType.EQUAL); 
      } 
      var expression = this.parseExpression_(); 
      this.eatPossibleImplicitSemiColon_(); 
      return new AwaitStatement(this.getTreeLocation_(start), identifier, expression); 
    }, 
    parseWithStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.WITH); 
      this.eat_(TokenType.OPEN_PAREN); 
      var expression = this.parseExpression_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      var body = this.parseStatement_(); 
      return new WithStatement(this.getTreeLocation_(start), expression, body); 
    }, 
    parseSwitchStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.SWITCH); 
      this.eat_(TokenType.OPEN_PAREN); 
      var expression = this.parseExpression_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      this.eat_(TokenType.OPEN_CURLY); 
      var caseClauses = this.parseCaseClauses_(); 
      this.eat_(TokenType.CLOSE_CURLY); 
      return new SwitchStatement(this.getTreeLocation_(start), expression, caseClauses); 
    }, 
    parseCaseClauses_: function() { 
      var foundDefaultClause = false; 
      var result =[]; 
      while(true) { 
        var start = this.getTreeStartLocation_(); 
        switch(this.peekType_()) { 
          case TokenType.CASE: 
            this.eat_(TokenType.CASE); 
            var expression = this.parseExpression_(); 
            this.eat_(TokenType.COLON); 
            var statements = this.parseCaseStatementsOpt_(); 
            result.push(new CaseClause(this.getTreeLocation_(start), expression, statements)); 
            break; 

          case TokenType.DEFAULT: 
            if(foundDefaultClause) { 
              this.reportError_('Switch statements may have at most one default clause'); 
            } else { 
              foundDefaultClause = true; 
            } 
            this.eat_(TokenType.DEFAULT); 
            this.eat_(TokenType.COLON); 
            result.push(new DefaultClause(this.getTreeLocation_(start), this.parseCaseStatementsOpt_())); 
            break; 

          default: 
            return result; 

        } 
      } 
    }, 
    parseCaseStatementsOpt_: function() { 
      return this.parseStatementList_(); 
    }, 
    parseLabelledStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      var name = this.eatId_(); 
      this.eat_(TokenType.COLON); 
      return new LabelledStatement(this.getTreeLocation_(start), name, this.parseStatement_()); 
    }, 
    peekLabelledStatement_: function() { 
      return this.peek_(TokenType.IDENTIFIER) && this.peek_(TokenType.COLON, 1); 
    }, 
    parseThrowStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.THROW); 
      var value = null; 
      if(! this.peekImplicitSemiColon_()) { 
        value = this.parseExpression_(); 
      } 
      this.eatPossibleImplicitSemiColon_(); 
      return new ThrowStatement(this.getTreeLocation_(start), value); 
    }, 
    parseTryStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.TRY); 
      var body = this.parseBlock_(); 
      var catchBlock = null; 
      if(this.peek_(TokenType.CATCH)) { 
        catchBlock = this.parseCatch_(); 
      } 
      var finallyBlock = null; 
      if(this.peek_(TokenType.FINALLY)) { 
        finallyBlock = this.parseFinallyBlock_(); 
      } 
      if(catchBlock == null && finallyBlock == null) { 
        this.reportError_("'catch' or 'finally' expected."); 
      } 
      return new TryStatement(this.getTreeLocation_(start), body, catchBlock, finallyBlock); 
    }, 
    parseCatch_: function() { 
      var start = this.getTreeStartLocation_(); 
      var catchBlock; 
      this.eat_(TokenType.CATCH); 
      this.eat_(TokenType.OPEN_PAREN); 
      var binding; 
      if(this.peekPattern_()) binding = this.parseBindingPattern_(); else binding = this.parseBindingIdentifier_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      var catchBody = this.parseBlock_(); 
      catchBlock = new Catch(this.getTreeLocation_(start), binding, catchBody); 
      return catchBlock; 
    }, 
    parseFinallyBlock_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.FINALLY); 
      var finallyBlock = this.parseBlock_(); 
      return new Finally(this.getTreeLocation_(start), finallyBlock); 
    }, 
    parseDebuggerStatement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.DEBUGGER); 
      this.eatPossibleImplicitSemiColon_(); 
      return new DebuggerStatement(this.getTreeLocation_(start)); 
    }, 
    parsePrimaryExpression_: function() { 
      switch(this.peekType_()) { 
        case TokenType.CLASS: 
          return options.classes ? this.parseClassExpression_(): this.parseMissingPrimaryExpression_(); 

        case TokenType.SUPER: 
          return this.parseSuperExpression_(); 

        case TokenType.THIS: 
          return this.parseThisExpression_(); 

        case TokenType.IDENTIFIER: 
          return this.parseIdentifierExpression_(); 

        case TokenType.NUMBER: 
        case TokenType.STRING: 
        case TokenType.TRUE: 
        case TokenType.FALSE: 
        case TokenType.NULL: 
          return this.parseLiteralExpression_(); 

        case TokenType.OPEN_SQUARE: 
          return this.parseArrayLiteral_(); 

        case TokenType.OPEN_CURLY: 
          return this.parseObjectLiteral_(); 

        case TokenType.OPEN_PAREN: 
          return this.parseParenExpression_(); 

        case TokenType.SLASH: 
        case TokenType.SLASH_EQUAL: 
          return this.parseRegularExpressionLiteral_(); 

        case TokenType.BACK_QUOTE: 
          return this.parseQuasiLiteral_(null); 

        case TokenType.AT_NAME: 
          return this.parseAtNameExpression_(); 

        default: 
          return this.parseMissingPrimaryExpression_(); 

      } 
    }, 
    parseSuperExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.SUPER); 
      return new SuperExpression(this.getTreeLocation_(start)); 
    }, 
    parseThisExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.THIS); 
      return new ThisExpression(this.getTreeLocation_(start)); 
    }, 
    peekBindingIdentifier_: function(opt_index) { 
      return this.peekId_(opt_index || 0); 
    }, 
    parseBindingIdentifier_: function() { 
      var start = this.getTreeStartLocation_(); 
      var identifier = this.eatId_(); 
      return new BindingIdentifier(this.getTreeLocation_(start), identifier); 
    }, 
    parseIdentifierExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      var identifier = this.eatId_(); 
      return new IdentifierExpression(this.getTreeLocation_(start), identifier); 
    }, 
    parseIdentifierNameExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      var identifier = this.eatIdName_(); 
      return new IdentifierExpression(this.getTreeLocation_(start), identifier); 
    }, 
    parseAtNameExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      var atName = this.eat_(TokenType.AT_NAME); 
      return new AtNameExpression(this.getTreeLocation_(start), atName); 
    }, 
    parseLiteralExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      var literal = this.nextLiteralToken_(); 
      return new LiteralExpression(this.getTreeLocation_(start), literal); 
    }, 
    nextLiteralToken_: function() { 
      return this.nextToken_(); 
    }, 
    parseRegularExpressionLiteral_: function() { 
      var start = this.getTreeStartLocation_(); 
      var literal = this.nextRegularExpressionLiteralToken_(); 
      return new LiteralExpression(this.getTreeLocation_(start), literal); 
    }, 
    peekSpread_: function() { 
      return this.peek_(TokenType.DOT_DOT_DOT); 
    }, 
    parseArrayLiteral_: function() { 
      var start = this.getTreeStartLocation_(); 
      var expression; 
      var elements =[]; 
      var allowFor = options.arrayComprehension; 
      this.eat_(TokenType.OPEN_SQUARE); 
      while(this.peek_(TokenType.COMMA) || this.peekSpread_() || this.peekAssignmentExpression_()) { 
        if(this.peek_(TokenType.COMMA)) { 
          expression = new NullTree(); 
          allowFor = false; 
        } else { 
          expression = this.parseAssignmentOrSpread_(); 
        } 
        if(allowFor && this.peek_(TokenType.FOR)) return this.parseArrayComprehension_(start, expression); 
        allowFor = false; 
        elements.push(expression); 
        if(! this.peek_(TokenType.CLOSE_SQUARE)) { 
          this.eat_(TokenType.COMMA); 
        } 
      } 
      this.eat_(TokenType.CLOSE_SQUARE); 
      return new ArrayLiteralExpression(this.getTreeLocation_(start), elements); 
    }, 
    parseArrayComprehension_: function(start, expression) { 
      var comprehensionForList = this.parseComprehensionForList_(); 
      var ifExpression = this.parseComprehensionIf_(); 
      this.eat_(TokenType.CLOSE_SQUARE); 
      return new ArrayComprehension(this.getTreeLocation_(start), expression, comprehensionForList, ifExpression); 
    }, 
    parseObjectLiteral_: function() { 
      var start = this.getTreeStartLocation_(); 
      var result =[]; 
      this.eat_(TokenType.OPEN_CURLY); 
      while(this.peekPropertyAssignment_()) { 
        if(this.peekGetAccessor_()) { 
          result.push(this.parseGetAccessor_()); 
          if(! this.eatPropertyOptionalComma_()) break; 
        } else if(this.peekSetAccessor_()) { 
          result.push(this.parseSetAccessor_()); 
          if(! this.eatPropertyOptionalComma_()) break; 
        } else if(this.peekPropertyMethodAssignment_()) { 
          result.push(this.parsePropertyMethodAssignment_()); 
          if(! this.eatPropertyOptionalComma_()) break; 
        } else { 
          result.push(this.parsePropertyNameAssignment_()); 
          if(! this.eatOpt_(TokenType.COMMA)) { 
            break; 
          } 
        } 
      } 
      this.eat_(TokenType.CLOSE_CURLY); 
      return new ObjectLiteralExpression(this.getTreeLocation_(start), result); 
    }, 
    eatPropertyOptionalComma_: function() { 
      return this.eatOpt_(TokenType.COMMA) || options.propertyOptionalComma; 
    }, 
    peekPropertyAssignment_: function() { 
      var index = + this.peek_(TokenType.STAR); 
      return this.peekPropertyName_(index); 
    }, 
    peekPropertyName_: function(tokenIndex) { 
      var type = this.peekType_(tokenIndex); 
      switch(type) { 
        case TokenType.AT_NAME: 
          return options.privateNameSyntax; 

        case TokenType.IDENTIFIER: 
        case TokenType.STRING: 
        case TokenType.NUMBER: 
          return true; 

        default: 
          return Keywords.isKeyword(type); 

      } 
    }, 
    peekGetAccessor_: function() { 
      return this.peekPredefinedString_(GET) && this.peekPropertyName_(1); 
    }, 
    peekPredefinedString_: function(string, opt_index) { 
      var index = opt_index || 0; 
      return this.peek_(TokenType.IDENTIFIER, index) && this.peekToken_(index).value === string; 
    }, 
    parseGetAccessor_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eatId_(); 
      var propertyName = this.nextToken_(); 
      this.eat_(TokenType.OPEN_PAREN); 
      this.eat_(TokenType.CLOSE_PAREN); 
      var body = this.parseFunctionBody_(false); 
      return new GetAccessor(this.getTreeLocation_(start), propertyName, body); 
    }, 
    peekSetAccessor_: function() { 
      return this.peekPredefinedString_(SET) && this.peekPropertyName_(1); 
    }, 
    parseSetAccessor_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eatId_(); 
      var propertyName = this.nextToken_(); 
      this.eat_(TokenType.OPEN_PAREN); 
      var parameter = this.parsePropertySetParameterList_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      var body = this.parseFunctionBody_(false); 
      return new SetAccessor(this.getTreeLocation_(start), propertyName, parameter, body); 
    }, 
    parsePropertySetParameterList_: function() { 
      var start = this.getTreeStartLocation_(); 
      var binding; 
      if(this.peekPattern_()) binding = this.parseBindingPattern_(); else binding = this.parseBindingIdentifier_(); 
      return new BindingElement(this.getTreeLocation_(start), binding, null); 
    }, 
    parsePropertyNameAssignment_: function() { 
      var start = this.getTreeStartLocation_(); 
      if(this.peek_(TokenType.COLON, 1)) { 
        var name = this.nextToken_(); 
        this.eat_(TokenType.COLON); 
        var value = this.parseAssignmentExpression(); 
        return new PropertyNameAssignment(this.getTreeLocation_(start), name, value); 
      } else { 
        return this.parsePropertyNameShorthand_(); 
      } 
    }, 
    peekPropertyMethodAssignment_: function() { 
      var index = + this.peek_(TokenType.STAR); 
      return options.propertyMethods && this.peekPropertyName_(index) && this.peek_(TokenType.OPEN_PAREN, index + 1); 
    }, 
    parsePropertyMethodAssignment_: function() { 
      var start = this.getTreeStartLocation_(); 
      var isGenerator = this.eatOpt_(TokenType.STAR) != null; 
      var name = this.nextToken_(); 
      this.eat_(TokenType.OPEN_PAREN); 
      var formalParameterList = this.parseFormalParameterList_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      var functionBody = this.parseFunctionBody_(isGenerator); 
      return new PropertyMethodAssignment(this.getTreeLocation_(start), name, isGenerator, formalParameterList, functionBody); 
    }, 
    parsePropertyNameShorthand_: function() { 
      var start = this.getTreeStartLocation_(); 
      var name = this.eatId_(); 
      if(! options.propertyNameShorthand) { 
        this.eat_(TokenType.COLON); 
        return null; 
      } 
      return new PropertyNameShorthand(this.getTreeLocation_(start), name); 
    }, 
    parseParenExpression_: function() { 
      return this.parseArrowFunction_(); 
    }, 
    parseMissingPrimaryExpression_: function(opt_message) { 
      var start = this.getTreeStartLocation_(); 
      this.reportError_(opt_message || 'primary expression expected'); 
      var token = this.nextToken_(); 
      return new MissingPrimaryExpression(this.getTreeLocation_(start), token); 
    }, 
    peekExpression_: function(opt_index) { 
      switch(this.peekType_(opt_index || 0)) { 
        case TokenType.BACK_QUOTE: 
          return options.quasi; 

        case TokenType.AT_NAME: 
          return options.privateNameSyntax; 

        case TokenType.BANG: 
        case TokenType.CLASS: 
        case TokenType.DELETE: 
        case TokenType.FALSE: 
        case TokenType.FUNCTION: 
        case TokenType.IDENTIFIER: 
        case TokenType.MINUS: 
        case TokenType.MINUS_MINUS: 
        case TokenType.NEW: 
        case TokenType.NULL: 
        case TokenType.NUMBER: 
        case TokenType.OPEN_CURLY: 
        case TokenType.OPEN_PAREN: 
        case TokenType.OPEN_SQUARE: 
        case TokenType.PLUS: 
        case TokenType.PLUS_PLUS: 
        case TokenType.SLASH: 
        case TokenType.SLASH_EQUAL: 
        case TokenType.STRING: 
        case TokenType.SUPER: 
        case TokenType.THIS: 
        case TokenType.TILDE: 
        case TokenType.TRUE: 
        case TokenType.TYPEOF: 
        case TokenType.VOID: 
          return true; 

        default: 
          return false; 

      } 
    }, 
    parseExpression_: function(opt_expressionIn) { 
      var expressionIn = opt_expressionIn || Expression.IN; 
      var start = this.getTreeStartLocation_(); 
      var result = this.parseAssignmentExpression(expressionIn); 
      if(this.peek_(TokenType.COMMA)) { 
        var exprs =[]; 
        exprs.push(result); 
        while(this.peek_(TokenType.COMMA) && this.peekAssignmentExpression_(1)) { 
          this.eat_(TokenType.COMMA); 
          exprs.push(this.parseAssignmentExpression(expressionIn)); 
        } 
        return new CommaExpression(this.getTreeLocation_(start), exprs); 
      } 
      return result; 
    }, 
    peekAssignmentExpression_: function(opt_index) { 
      return this.peekExpression_(opt_index || 0); 
    }, 
    parseAssignmentExpression: function(opt_expressionIn) { 
      if(this.peekBindingIdentifier_() && this.peekArrow_(1)) return this.parseArrowFunction_(); 
      var expressionIn = opt_expressionIn || Expression.NORMAL; 
      var start = this.getTreeStartLocation_(); 
      var left = this.parseConditional_(expressionIn); 
      if(this.peekAssignmentOperator_()) { 
        if(this.peek_(TokenType.EQUAL)) left = this.transformLeftHandSideExpression_(left); 
        if(! left.isLeftHandSideExpression() && ! left.isPattern()) { 
          this.reportError_('Left hand side of assignment must be new, call, member, function, primary expressions or destructuring pattern'); 
        } 
        var operator = this.nextToken_(); 
        var right = this.parseAssignmentExpression(expressionIn); 
        return new BinaryOperator(this.getTreeLocation_(start), left, operator, right); 
      } 
      return left; 
    }, 
    transformLeftHandSideExpression_: function(tree) { 
      switch(tree.type) { 
        case ParseTreeType.ARRAY_LITERAL_EXPRESSION: 
        case ParseTreeType.OBJECT_LITERAL_EXPRESSION: 
          var errorReporter = new MutedErrorReporter(); 
          var p = new Parser(errorReporter, this.scanner_.getFile(), tree.location.start.offset); 
          var transformedTree = p.parseAssignmentPattern_(); 
          if(! errorReporter.hadError()) return transformedTree; 
          break; 

        case ParseTreeType.PAREN_EXPRESSION: 
          var expression = this.transformLeftHandSideExpression_(tree.expression); 
          if(expression !== tree.expression) return new ParenExpression(tree.location, expression); 

      } 
      return tree; 
    }, 
    peekAssignmentOperator_: function() { 
      var token = this.peekToken_(); 
      return ! ! token && token.isAssignmentOperator(); 
    }, 
    parseConditional_: function(expressionIn) { 
      var start = this.getTreeStartLocation_(); 
      var condition = this.parseLogicalOR_(expressionIn); 
      if(this.peek_(TokenType.QUESTION)) { 
        this.eat_(TokenType.QUESTION); 
        var left = this.parseAssignmentExpression(); 
        this.eat_(TokenType.COLON); 
        var right = this.parseAssignmentExpression(expressionIn); 
        return new ConditionalExpression(this.getTreeLocation_(start), condition, left, right); 
      } 
      return condition; 
    }, 
    parseLogicalOR_: function(expressionIn) { 
      var start = this.getTreeStartLocation_(); 
      var left = this.parseLogicalAND_(expressionIn); 
      while(this.peek_(TokenType.OR)) { 
        var operator = this.eat_(TokenType.OR); 
        var right = this.parseLogicalAND_(expressionIn); 
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right); 
      } 
      return left; 
    }, 
    parseLogicalAND_: function(expressionIn) { 
      var start = this.getTreeStartLocation_(); 
      var left = this.parseBitwiseOR_(expressionIn); 
      while(this.peek_(TokenType.AND)) { 
        var operator = this.eat_(TokenType.AND); 
        var right = this.parseBitwiseOR_(expressionIn); 
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right); 
      } 
      return left; 
    }, 
    parseBitwiseOR_: function(expressionIn) { 
      var start = this.getTreeStartLocation_(); 
      var left = this.parseBitwiseXOR_(expressionIn); 
      while(this.peek_(TokenType.BAR)) { 
        var operator = this.eat_(TokenType.BAR); 
        var right = this.parseBitwiseXOR_(expressionIn); 
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right); 
      } 
      return left; 
    }, 
    parseBitwiseXOR_: function(expressionIn) { 
      var start = this.getTreeStartLocation_(); 
      var left = this.parseBitwiseAND_(expressionIn); 
      while(this.peek_(TokenType.CARET)) { 
        var operator = this.eat_(TokenType.CARET); 
        var right = this.parseBitwiseAND_(expressionIn); 
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right); 
      } 
      return left; 
    }, 
    parseBitwiseAND_: function(expressionIn) { 
      var start = this.getTreeStartLocation_(); 
      var left = this.parseEquality_(expressionIn); 
      while(this.peek_(TokenType.AMPERSAND)) { 
        var operator = this.eat_(TokenType.AMPERSAND); 
        var right = this.parseEquality_(expressionIn); 
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right); 
      } 
      return left; 
    }, 
    parseEquality_: function(expressionIn) { 
      var start = this.getTreeStartLocation_(); 
      var left = this.parseRelational_(expressionIn); 
      while(this.peekEqualityOperator_()) { 
        var operator = this.nextToken_(); 
        var right = this.parseRelational_(expressionIn); 
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right); 
      } 
      return left; 
    }, 
    peekEqualityOperator_: function() { 
      switch(this.peekType_()) { 
        case TokenType.EQUAL_EQUAL: 
        case TokenType.NOT_EQUAL: 
        case TokenType.EQUAL_EQUAL_EQUAL: 
        case TokenType.NOT_EQUAL_EQUAL: 
          return true; 

        default: 
          if(! options.isExpression) return false; 
          var token = this.peekTokenNoLineTerminator_(); 
          return token && token.type === TokenType.IDENTIFIER &&(token.value === IS || token.value === ISNT); 

      } 
    }, 
    parseRelational_: function(expressionIn) { 
      var start = this.getTreeStartLocation_(); 
      var left = this.parseShiftExpression_(); 
      while(this.peekRelationalOperator_(expressionIn)) { 
        var operator = this.nextToken_(); 
        var right = this.parseShiftExpression_(); 
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right); 
      } 
      return left; 
    }, 
    peekRelationalOperator_: function(expressionIn) { 
      switch(this.peekType_()) { 
        case TokenType.OPEN_ANGLE: 
        case TokenType.CLOSE_ANGLE: 
        case TokenType.GREATER_EQUAL: 
        case TokenType.LESS_EQUAL: 
        case TokenType.INSTANCEOF: 
          return true; 

        case TokenType.IN: 
          return expressionIn == Expression.NORMAL; 

        default: 
          return false; 

      } 
    }, 
    parseShiftExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      var left = this.parseAdditiveExpression_(); 
      while(this.peekShiftOperator_()) { 
        var operator = this.nextToken_(); 
        var right = this.parseAdditiveExpression_(); 
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right); 
      } 
      return left; 
    }, 
    peekShiftOperator_: function() { 
      switch(this.peekType_()) { 
        case TokenType.LEFT_SHIFT: 
        case TokenType.RIGHT_SHIFT: 
        case TokenType.UNSIGNED_RIGHT_SHIFT: 
          return true; 

        default: 
          return false; 

      } 
    }, 
    parseAdditiveExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      var left = this.parseMultiplicativeExpression_(); 
      while(this.peekAdditiveOperator_()) { 
        var operator = this.nextToken_(); 
        var right = this.parseMultiplicativeExpression_(); 
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right); 
      } 
      return left; 
    }, 
    peekAdditiveOperator_: function() { 
      switch(this.peekType_()) { 
        case TokenType.PLUS: 
        case TokenType.MINUS: 
          return true; 

        default: 
          return false; 

      } 
    }, 
    parseMultiplicativeExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      var left = this.parseUnaryExpression_(); 
      while(this.peekMultiplicativeOperator_()) { 
        var operator = this.nextToken_(); 
        var right = this.parseUnaryExpression_(); 
        left = new BinaryOperator(this.getTreeLocation_(start), left, operator, right); 
      } 
      return left; 
    }, 
    peekMultiplicativeOperator_: function() { 
      switch(this.peekType_()) { 
        case TokenType.STAR: 
        case TokenType.SLASH: 
        case TokenType.PERCENT: 
          return true; 

        default: 
          return false; 

      } 
    }, 
    parseUnaryExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      if(this.peekUnaryOperator_()) { 
        var operator = this.nextToken_(); 
        var operand = this.parseUnaryExpression_(); 
        return new UnaryExpression(this.getTreeLocation_(start), operator, operand); 
      } 
      return this.parsePostfixExpression_(); 
    }, 
    peekUnaryOperator_: function() { 
      switch(this.peekType_()) { 
        case TokenType.DELETE: 
        case TokenType.VOID: 
        case TokenType.TYPEOF: 
        case TokenType.PLUS_PLUS: 
        case TokenType.MINUS_MINUS: 
        case TokenType.PLUS: 
        case TokenType.MINUS: 
        case TokenType.TILDE: 
        case TokenType.BANG: 
          return true; 

        default: 
          return false; 

      } 
    }, 
    parsePostfixExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      var operand = this.parseLeftHandSideExpression_(); 
      while(this.peekPostfixOperator_()) { 
        var operator = this.nextToken_(); 
        operand = new PostfixExpression(this.getTreeLocation_(start), operand, operator); 
      } 
      return operand; 
    }, 
    peekPostfixOperator_: function() { 
      if(this.peekImplicitSemiColon_()) { 
        return false; 
      } 
      switch(this.peekType_()) { 
        case TokenType.PLUS_PLUS: 
        case TokenType.MINUS_MINUS: 
          return true; 

        default: 
          return false; 

      } 
    }, 
    parseLeftHandSideExpression_: function() { 
      var start = this.getTreeStartLocation_(); 
      var operand = this.parseNewExpression_(); 
      if(!(operand instanceof NewExpression) || operand.args != null) { 
        while(this.peekCallSuffix_()) { 
          switch(this.peekType_()) { 
            case TokenType.OPEN_PAREN: 
              var args = this.parseArguments_(); 
              operand = new CallExpression(this.getTreeLocation_(start), operand, args); 
              break; 

            case TokenType.OPEN_SQUARE: 
              this.eat_(TokenType.OPEN_SQUARE); 
              var member = this.parseExpression_(); 
              this.eat_(TokenType.CLOSE_SQUARE); 
              operand = new MemberLookupExpression(this.getTreeLocation_(start), operand, member); 
              break; 

            case TokenType.PERIOD: 
              this.eat_(TokenType.PERIOD); 
              operand = new MemberExpression(this.getTreeLocation_(start), operand, this.eatIdName_()); 
              break; 

            case TokenType.PERIOD_OPEN_CURLY: 
              var expressions = this.parseCascadeExpressions_(); 
              operand = new CascadeExpression(this.getTreeLocation_(start), operand, expressions); 
              break; 

            case TokenType.BACK_QUOTE: 
              operand = this.parseQuasiLiteral_(operand); 
              break; 

          } 
        } 
      } 
      return operand; 
    }, 
    peekCallSuffix_: function() { 
      return this.peek_(TokenType.OPEN_PAREN) || this.peek_(TokenType.OPEN_SQUARE) || this.peek_(TokenType.PERIOD) || options.quasi && this.peek_(TokenType.BACK_QUOTE) || options.cascadeExpression && this.peek_(TokenType.PERIOD_OPEN_CURLY); 
    }, 
    parseMemberExpressionNoNew_: function() { 
      var start = this.getTreeStartLocation_(); 
      var operand; 
      if(this.peekFunction_()) { 
        operand = this.parseFunctionExpression_(); 
      } else { 
        operand = this.parsePrimaryExpression_(); 
      } 
      while(this.peekMemberExpressionSuffix_()) { 
        switch(this.peekType_()) { 
          case TokenType.OPEN_SQUARE: 
            this.eat_(TokenType.OPEN_SQUARE); 
            var member = this.parseExpression_(); 
            this.eat_(TokenType.CLOSE_SQUARE); 
            operand = new MemberLookupExpression(this.getTreeLocation_(start), operand, member); 
            break; 

          case TokenType.PERIOD: 
            this.eat_(TokenType.PERIOD); 
            var name; 
            if(this.peek_(TokenType.AT_NAME)) name = this.eat_(TokenType.AT_NAME); else name = this.eatIdName_(); 
            operand = new MemberExpression(this.getTreeLocation_(start), operand, name); 
            break; 

          case TokenType.PERIOD_OPEN_CURLY: 
            var expressions = this.parseCascadeExpressions_(); 
            operand = new CascadeExpression(this.getTreeLocation_(start), operand, expressions); 
            break; 

          case TokenType.BACK_QUOTE: 
            operand = this.parseQuasiLiteral_(operand); 
            break; 

        } 
      } 
      return operand; 
    }, 
    parseCascadeExpressions_: function() { 
      this.eat_(TokenType.PERIOD_OPEN_CURLY); 
      var expressions =[]; 
      while(this.peekId_() && this.peekAssignmentExpression_()) { 
        expressions.push(this.parseCascadeExpression_()); 
        this.eatPossibleImplicitSemiColon_(); 
      } 
      this.eat_(TokenType.CLOSE_CURLY); 
      return expressions; 
    }, 
    parseCascadeExpression_: function() { 
      var expr = this.parseAssignmentExpression(); 
      var operand; 
      switch(expr.type) { 
        case ParseTreeType.CALL_EXPRESSION: 
        case ParseTreeType.MEMBER_EXPRESSION: 
        case ParseTreeType.MEMBER_LOOKUP_EXPRESSION: 
        case ParseTreeType.CASCADE_EXPRESSION: 
          operand = expr.operand; 
          break; 

        case ParseTreeType.BINARY_OPERATOR: 
          operand = expr.left; 
          break; 

        default: 
          this.reportError_(expr.location,("Invalid expression. Type: " + expr.type)); 

      } 
      if(operand) { 
        switch(operand.type) { 
          case ParseTreeType.MEMBER_EXPRESSION: 
          case ParseTreeType.MEMBER_LOOKUP_EXPRESSION: 
          case ParseTreeType.CALL_EXPRESSION: 
          case ParseTreeType.CASCADE_EXPRESSION: 
          case ParseTreeType.IDENTIFIER_EXPRESSION: 
            break; 

          default: 
            this.reportError_(operand.location,("Invalid expression: " + operand.type)); 

        } 
      } 
      if(expr.type == ParseTreeType.BINARY_OPERATOR && ! expr.operator.isAssignmentOperator()) { 
        this.reportError_(expr.operator,("Invalid operator: " + expr.operator)); 
      } 
      return expr; 
    }, 
    peekMemberExpressionSuffix_: function() { 
      return this.peek_(TokenType.OPEN_SQUARE) || this.peek_(TokenType.PERIOD) || options.quasi && this.peek_(TokenType.BACK_QUOTE) || options.cascadeExpression && this.peek_(TokenType.PERIOD_OPEN_CURLY); 
    }, 
    parseNewExpression_: function() { 
      if(this.peek_(TokenType.NEW)) { 
        var start = this.getTreeStartLocation_(); 
        this.eat_(TokenType.NEW); 
        var operand = this.parseNewExpression_(); 
        var args = null; 
        if(this.peek_(TokenType.OPEN_PAREN)) { 
          args = this.parseArguments_(); 
        } 
        return new NewExpression(this.getTreeLocation_(start), operand, args); 
      } else { 
        return this.parseMemberExpressionNoNew_(); 
      } 
    }, 
    parseArguments_: function() { 
      var start = this.getTreeStartLocation_(); 
      var args =[]; 
      this.eat_(TokenType.OPEN_PAREN); 
      while(this.peekAssignmentOrRest_()) { 
        args.push(this.parseAssignmentOrSpread_()); 
        if(! this.peek_(TokenType.CLOSE_PAREN)) { 
          this.eat_(TokenType.COMMA); 
        } 
      } 
      this.eat_(TokenType.CLOSE_PAREN); 
      return new ArgumentList(this.getTreeLocation_(start), args); 
    }, 
    peekRest_: function(opt_index) { 
      return options.restParameters && this.peek_(TokenType.DOT_DOT_DOT, opt_index || 0); 
    }, 
    peekAssignmentOrRest_: function() { 
      return this.peekRest_() || this.peekAssignmentExpression_(); 
    }, 
    parseAssignmentOrSpread_: function() { 
      if(this.peekSpread_()) { 
        return this.parseSpreadExpression_(); 
      } 
      return this.parseAssignmentExpression(); 
    }, 
    parseArrowFunction_: function(expressionIn) { 
      var start = this.getTreeStartLocation_(); 
      var formals, coverFormals; 
      if(this.peekBindingIdentifier_() && this.peekArrow_(1)) { 
        var id = this.parseBindingIdentifier_(); 
        formals =[new BindingElement(id.location, id, null)]; 
      } else { 
        this.eat_(TokenType.OPEN_PAREN); 
        if(this.peek_(TokenType.CLOSE_PAREN)) { 
          this.eat_(TokenType.CLOSE_PAREN); 
          formals =[]; 
        } else if(this.peekRest_()) { 
          formals =[this.parseRestParameter_()]; 
          this.eat_(TokenType.CLOSE_PAREN); 
        } else { 
          coverFormals = this.parseExpression_(); 
          if(coverFormals.type === ParseTreeType.MISSING_PRIMARY_EXPRESSION) return coverFormals; 
          if(this.peek_(TokenType.COMMA) && this.peekRest_(1)) { 
            this.eat_(TokenType.COMMA); 
            formals = this.reparseAsFormalsList_(coverFormals); 
            if(formals) formals.push(this.parseRestParameter_()); 
            this.eat_(TokenType.CLOSE_PAREN); 
          } else if(this.peek_(TokenType.FOR) && options.generatorComprehension) { 
            return this.parseGeneratorComprehension_(start, coverFormals); 
          } else { 
            this.eat_(TokenType.CLOSE_PAREN); 
            if(this.peek_(TokenType.ARROW)) formals = this.reparseAsFormalsList_(coverFormals); 
          } 
        } 
      } 
      if(! formals) return new ParenExpression(this.getTreeLocation_(start), coverFormals); 
      this.eat_(TokenType.ARROW); 
      var body = this.parseConciseBody_(); 
      var startLoc = this.getTreeLocation_(start); 
      return new ArrowFunctionExpression(startLoc, new FormalParameterList(startLoc, formals), body); 
    }, 
    reparseAsFormalsList_: function(coverFormals) { 
      var errorReporter = new MutedErrorReporter(); 
      var p = new Parser(errorReporter, this.scanner_.getFile(), coverFormals.location.start.offset); 
      var formals = p.parseFormalsList_(); 
      if(errorReporter.hadError() || ! formals.length || formals[formals.length - 1].location.end.offset !== coverFormals.location.end.offset) { 
        return null; 
      } 
      return formals; 
    }, 
    peekArrow_: function(opt_index) { 
      return options.arrowFunctions && this.peek_(TokenType.ARROW, opt_index); 
    }, 
    parseConciseBody_: function() { 
      if(this.peek_(TokenType.OPEN_CURLY)) return this.parseBlock_(); 
      return this.parseAssignmentExpression(); 
    }, 
    parseGeneratorComprehension_: function(start, expression) { 
      var comprehensionForList = this.parseComprehensionForList_(); 
      var ifExpression = this.parseComprehensionIf_(); 
      this.eat_(TokenType.CLOSE_PAREN); 
      return new GeneratorComprehension(this.getTreeLocation_(start), expression, comprehensionForList, ifExpression); 
    }, 
    parseComprehensionForList_: function() { 
      var comprehensionForList =[]; 
      while(this.peek_(TokenType.FOR)) { 
        this.eat_(TokenType.FOR); 
        var innerStart = this.getTreeStartLocation_(); 
        var left = this.parseForBinding_(); 
        this.eatId_(OF); 
        var iterator = this.parseExpression_(); 
        comprehensionForList.push(new ComprehensionFor(this.getTreeLocation_(innerStart), left, iterator)); 
      } 
      return comprehensionForList; 
    }, 
    parseComprehensionIf_: function() { 
      if(this.peek_(TokenType.IF)) { 
        this.eat_(TokenType.IF); 
        return this.parseExpression_(); 
      } 
      return null; 
    }, 
    parseForBinding_: function() { 
      if(this.peekPattern_()) return this.parseBindingPattern_(); 
      return this.parseBindingIdentifier_(); 
    }, 
    peekPattern_: function(opt_index) { 
      var index = opt_index || 0; 
      return options.destructuring &&(this.peekObjectPattern_(index) || this.peekArrayPattern_(index)); 
    }, 
    peekArrayPattern_: function(opt_index) { 
      return this.peek_(TokenType.OPEN_SQUARE, opt_index || 0); 
    }, 
    peekObjectPattern_: function(opt_index) { 
      return this.peek_(TokenType.OPEN_CURLY, opt_index || 0); 
    }, 
    parseBindingPattern_: function() { 
      if(this.peekArrayPattern_()) return this.parseArrayBindingPattern_(); 
      return this.parseObjectBindingPattern_(); 
    }, 
    parseArrayBindingPattern_: function() { 
      var start = this.getTreeStartLocation_(); 
      var elements =[]; 
      this.eat_(TokenType.OPEN_SQUARE); 
      while(this.peekBindingElement_() || this.peek_(TokenType.COMMA) || this.peekRest_()) { 
        this.parseElisionOpt_(elements); 
        if(this.peekRest_()) { 
          elements.push(this.parseBindingRestElement_()); 
          break; 
        } else { 
          elements.push(this.parseBindingElement_()); 
          if(this.peek_(TokenType.COMMA) && ! this.peek_(TokenType.CLOSE_SQUARE, 1)) { 
            this.eat_(TokenType.COMMA); 
          } 
        } 
      } 
      this.eat_(TokenType.CLOSE_SQUARE); 
      return new ArrayPattern(this.getTreeLocation_(start), elements); 
    }, 
    parseBindingElementList_: function(elements) { 
      this.parseElisionOpt_(elements); 
      elements.push(this.parseBindingElement_()); 
      while(this.peek_(TokenType.COMMA)) { 
        this.eat_(TokenType.COMMA); 
        this.parseElisionOpt_(elements); 
        elements.push(this.parseBindingElement_()); 
      } 
    }, 
    parseElisionOpt_: function(elements) { 
      while(this.peek_(TokenType.COMMA)) { 
        this.eat_(TokenType.COMMA); 
        elements.push(null); 
      } 
    }, 
    peekBindingElement_: function() { 
      return this.peekBindingIdentifier_() || this.peekPattern_(); 
    }, 
    parseBindingElement_: function(opt_initializer) { 
      var start = this.getTreeStartLocation_(); 
      var binding; 
      if(this.peekPattern_()) binding = this.parseBindingPattern_(); else binding = this.parseBindingIdentifier_(); 
      var initializer = null; 
      if(this.peek_(TokenType.EQUAL) || opt_initializer === Initializer.REQUIRED) { 
        initializer = this.parseInitializer_(); 
      } 
      return new BindingElement(this.getTreeLocation_(start), binding, initializer); 
    }, 
    parseBindingRestElement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.DOT_DOT_DOT); 
      var identifier = this.parseBindingIdentifier_(); 
      return new SpreadPatternElement(this.getTreeLocation_(start), identifier); 
    }, 
    parseObjectBindingPattern_: function() { 
      var start = this.getTreeStartLocation_(); 
      var elements =[]; 
      this.eat_(TokenType.OPEN_CURLY); 
      while(this.peekBindingProperty_()) { 
        elements.push(this.parseBindingProperty_()); 
        if(! this.peek_(TokenType.COMMA)) break; 
        this.eat_(TokenType.COMMA); 
      } 
      this.eat_(TokenType.CLOSE_CURLY); 
      return new ObjectPattern(this.getTreeLocation_(start), elements); 
    }, 
    peekBindingProperty_: function() { 
      return this.peekBindingIdentifier_() || this.peekPropertyName_(); 
    }, 
    parseBindingProperty_: function() { 
      var start = this.getTreeStartLocation_(); 
      if(this.peek_(TokenType.COLON, 1)) { 
        var propertyName = this.nextToken_(); 
        this.eat_(TokenType.COLON); 
        var binding = this.parseBindingElement_(); 
        return new ObjectPatternField(this.getTreeLocation_(start), propertyName, binding); 
      } 
      var binding = this.parseBindingIdentifier_(); 
      var initializer = null; 
      if(this.peek_(TokenType.EQUAL)) initializer = this.parseInitializer_(); 
      return new BindingElement(this.getTreeLocation_(start), binding, initializer); 
    }, 
    parseAssignmentPattern_: function() { 
      if(this.peekObjectPattern_()) return this.parseObjectAssignmentPattern_(); 
      return this.parseArrayAssignmentPattern_(); 
    }, 
    parseObjectAssignmentPattern_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.OPEN_CURLY); 
      var fields =[]; 
      var field; 
      while(this.peekId_() || this.peekPropertyName_()) { 
        if(this.peek_(TokenType.COLON, 1)) { 
          var fieldStart = this.getTreeStartLocation_(); 
          var name = this.nextToken_(); 
          this.eat_(TokenType.COLON); 
          var left = this.parseLeftHandSideExpression_(); 
          left = this.transformLeftHandSideExpression_(left); 
          field = new ObjectPatternField(this.getTreeLocation_(start), name, left); 
        } else { 
          field = this.parseIdentifierExpression_(); 
        } 
        fields.push(field); 
        if(this.peek_(TokenType.COMMA)) this.eat_(TokenType.COMMA); else break; 
      } 
      this.eat_(TokenType.CLOSE_CURLY); 
      return new ObjectPattern(this.getTreeLocation_(start), fields); 
    }, 
    parseArrayAssignmentPattern_: function() { 
      var start = this.getTreeStartLocation_(); 
      var elements =[]; 
      this.eat_(TokenType.OPEN_SQUARE); 
      while(this.peek_(TokenType.COMMA) || this.peekRest_() || this.peekAssignmentExpression_()) { 
        this.parseElisionOpt_(elements); 
        if(this.peekRest_()) { 
          elements.push(this.parseAssignmentRestElement_()); 
          break; 
        } else { 
          elements.push(this.parseAssignmentElement_()); 
          if(this.peek_(TokenType.COMMA) && ! this.peek_(TokenType.CLOSE_SQUARE, 1)) { 
            this.eat_(TokenType.COMMA); 
          } 
        } 
      } 
      this.eat_(TokenType.CLOSE_SQUARE); 
      return new ArrayPattern(this.getTreeLocation_(start), elements); 
    }, 
    parseAssignmentRestElement_: function() { 
      var start = this.getTreeStartLocation_(); 
      this.eat_(TokenType.DOT_DOT_DOT); 
      var left = this.parseLeftHandSideExpression_(); 
      left = this.transformLeftHandSideExpression_(left); 
      return new SpreadPatternElement(this.getTreeLocation_(start), left); 
    }, 
    parseAssignmentElement_: function() { 
      var tree = this.parseLeftHandSideExpression_(); 
      return this.transformLeftHandSideExpression_(tree); 
    }, 
    parseQuasiLiteral_: function(operand) { 
      if(! options.quasi) { 
        return this.parseMissingPrimaryExpression_(); 
      } 
      function pushSubst(tree) { 
        elements.push(new QuasiSubstitution(tree.location, tree)); 
      } 
      var start = operand ? operand.location.start: this.getTreeStartLocation_(); 
      this.eat_(TokenType.BACK_QUOTE); 
      var elements =[]; 
      while(! this.peekEndOfQuasiLiteral_()) { 
        var token = this.nextQuasiLiteralPortionToken_(); 
        elements.push(new QuasiLiteralPortion(this.getTreeLocation_(start), token)); 
        if(! this.peekQuasiToken_(TokenType.DOLLAR)) break; 
        token = this.nextQuasiSubstitutionToken_(); 
        traceur.assert(token.type == TokenType.DOLLAR); 
        this.eat_(TokenType.OPEN_CURLY); 
        var expression = this.parseExpression_(); 
        if(! expression) return this.parseMissingPrimaryExpression_(); 
        pushSubst(expression); 
        this.eat_(TokenType.CLOSE_CURLY); 
      } 
      this.eat_(TokenType.BACK_QUOTE); 
      return new QuasiLiteralExpression(this.getTreeLocation_(start), operand, elements); 
    }, 
    eatPossibleImplicitSemiColon_: function() { 
      if(this.peek_(TokenType.SEMI_COLON) && this.peekToken_().location.start.line == this.getLastLine_()) { 
        this.eat_(TokenType.SEMI_COLON); 
        return; 
      } 
      if(this.peekImplicitSemiColon_()) { 
        return; 
      } 
      this.reportError_('Semi-colon expected'); 
    }, 
    peekImplicitSemiColon_: function() { 
      return this.getNextLine_() > this.getLastLine_() || this.peek_(TokenType.SEMI_COLON) || this.peek_(TokenType.CLOSE_CURLY) || this.peek_(TokenType.END_OF_FILE); 
    }, 
    getLastLine_: function() { 
      return this.scanner_.lastToken.location.end.line; 
    }, 
    getNextLine_: function() { 
      return this.peekToken_().location.start.line; 
    }, 
    eatOpt_: function(expectedTokenType) { 
      if(this.peek_(expectedTokenType)) { 
        return this.eat_(expectedTokenType); 
      } 
      return null; 
    }, 
    eatIdOpt_: function() { 
      return(this.peek_(TokenType.IDENTIFIER)) ? this.eatId_(): null; 
    }, 
    eatId_: function(opt_expected) { 
      var result = this.eat_(TokenType.IDENTIFIER); 
      if(opt_expected) { 
        if(! result || result.value !== opt_expected) { 
          if(! result) result = this.peekToken_(); 
          this.reportError_(result,("expected '" + opt_expected + "'")); 
          return null; 
        } 
      } 
      return result; 
    }, 
    eatIdName_: function() { 
      var t = this.nextToken_(); 
      if(t.type != TokenType.IDENTIFIER) { 
        if(! Keywords.isKeyword(t.type)) { 
          this.reportExpectedError_(t, 'identifier'); 
          return null; 
        } 
        return new IdentifierToken(t.location, t.type); 
      } 
      return t; 
    }, 
    eat_: function(expectedTokenType) { 
      var token = this.nextToken_(); 
      if(token.type != expectedTokenType) { 
        this.reportExpectedError_(token, expectedTokenType); 
        return null; 
      } 
      return token; 
    }, 
    reportExpectedError_: function(token, expected) { 
      this.reportError_(token, "'" + expected + "' expected"); 
    }, 
    getTreeStartLocation_: function() { 
      return this.peekToken_().location.start; 
    }, 
    getTreeEndLocation_: function() { 
      return this.scanner_.lastToken.location.end; 
    }, 
    getTreeLocation_: function(start) { 
      return new SourceRange(start, this.getTreeEndLocation_()); 
    }, 
    nextToken_: function() { 
      return this.scanner_.nextToken(); 
    }, 
    nextRegularExpressionLiteralToken_: function() { 
      return this.scanner_.nextRegularExpressionLiteralToken(); 
    }, 
    nextQuasiLiteralPortionToken_: function() { 
      return this.scanner_.nextQuasiLiteralPortionToken(); 
    }, 
    nextQuasiIdentifier_: function() { 
      return this.scanner_.nextQuasiIdentifier(); 
    }, 
    nextQuasiSubstitutionToken_: function() { 
      return this.scanner_.nextQuasiSubstitutionToken(); 
    }, 
    peekEndOfQuasiLiteral_: function() { 
      return this.peekQuasiToken_(TokenType.BACK_QUOTE) || this.peekQuasiToken_(TokenType.END_OF_FILE); 
    }, 
    peekQuasiToken_: function(type) { 
      return this.scanner_.peekQuasiToken(type); 
    }, 
    peek_: function(expectedType, opt_index) { 
      return this.peekType_(opt_index || 0) == expectedType; 
    }, 
    peekType_: function(opt_index) { 
      return this.peekToken_(opt_index || 0).type; 
    }, 
    peekToken_: function(opt_index) { 
      return this.scanner_.peekToken(opt_index || 0); 
    }, 
    peekTokenNoLineTerminator_: function(opt_index) { 
      return this.scanner_.peekTokenNoLineTerminator(opt_index || 0); 
    }, 
    reportError_: function(var_args) { 
      if(arguments.length == 1) { 
        this.errorReporter_.reportError(this.scanner_.getPosition(), arguments[0]); 
      } else { 
        var location = arguments[0]; 
        if(location instanceof Token) { 
          location = location.location; 
        } 
        this.errorReporter_.reportError(location.start, arguments[1]); 
      } 
    }, 
    reportUnexpectedToken_: function() { 
      this.reportError_(this.peekToken_(), 'Unexpected token'); 
    } 
  }, null, true, false); 
  return Object.preventExtensions(Object.create(null, { Parser: { 
      get: function() { 
        return Parser; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_LineNumberTable_js =(function() { 
  "use strict"; 
  var $__76 = $src_util_SourcePosition_js, SourcePosition = $__76.SourcePosition; 
  var $__77 = $src_util_SourceRange_js, SourceRange = $__77.SourceRange; 
  function binarySearch(arr, target) { 
    var left = 0; 
    var right = arr.length - 1; 
    while(left <= right) { 
      var mid =(left + right) >> 1; 
      if(target > arr[mid]) { 
        left = mid + 1; 
      } else if(target < arr[mid]) { 
        right = mid - 1; 
      } else { 
        return mid; 
      } 
    } 
    return -(left + 1); 
  } 
  var MAX_INT_REPRESENTATION = 9007199254740992; 
  function computeLineStartOffsets(source) { 
    var lineStartOffsets =[]; 
    lineStartOffsets.push(0); 
    for(var index = 0; index < source.length; index ++) { 
      var ch = source.charAt(index); 
      if(isLineTerminator(ch)) { 
        if(index < source.length && ch == '\r' && source.charAt(index + 1) == '\n') { 
          index ++; 
        } 
        lineStartOffsets.push(index + 1); 
      } 
    } 
    lineStartOffsets.push(MAX_INT_REPRESENTATION); 
    return lineStartOffsets; 
  } 
  function isLineTerminator(ch) { 
    switch(ch) { 
      case '\n': 
      case '\r': 
      case '\u2028': 
      case '\u2029': 
        return true; 

      default: 
        return false; 

    } 
  } 
  var LineNumberTable = traceur.runtime.createClass({ 
    constructor: function(sourceFile) { 
      this.sourceFile_ = sourceFile; 
      this.lineStartOffsets_ = computeLineStartOffsets(sourceFile.contents); 
    }, 
    getSourcePosition: function(offset) { 
      var line = this.getLine(offset); 
      return new SourcePosition(this.sourceFile_, offset, line, this.getColumn(line, offset)); 
    }, 
    getLine: function(offset) { 
      var index = binarySearch(this.lineStartOffsets_, offset); 
      if(index >= 0) { 
        return index; 
      } 
      return - index - 2; 
    }, 
    offsetOfLine: function(line) { 
      return this.lineStartOffsets_[line]; 
    }, 
    getColumn: function(var_args) { 
      var line, offset; 
      if(arguments.length >= 2) { 
        line = arguments[0]; 
        offset = arguments[1]; 
      } else { 
        offset = arguments[0]; 
        line = this.getLine(offset); 
      } 
      return offset - this.offsetOfLine(line); 
    }, 
    getSourceRange: function(startOffset, endOffset) { 
      return new SourceRange(this.getSourcePosition(startOffset), this.getSourcePosition(endOffset)); 
    } 
  }, null, true, false); 
  return Object.preventExtensions(Object.create(null, { LineNumberTable: { 
      get: function() { 
        return LineNumberTable; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_SourceFile_js =(function() { 
  "use strict"; 
  var $__78 = $src_syntax_LineNumberTable_js, LineNumberTable = $__78.LineNumberTable; 
  var SourceFile = traceur.runtime.createClass({ constructor: function(name, contents) { 
      this.name = name; 
      this.contents = contents; 
      this.lineNumberTable = new LineNumberTable(this); 
      this.uid = traceur.getUid(); 
    } }, null, true, false); 
  return Object.preventExtensions(Object.create(null, { SourceFile: { 
      get: function() { 
        return SourceFile; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_ParseTreeFactory_js =(function() { 
  "use strict"; 
  var $__79 = $src_syntax_IdentifierToken_js, IdentifierToken = $__79.IdentifierToken; 
  var $__80 = $src_syntax_LiteralToken_js, LiteralToken = $__80.LiteralToken; 
  var $__81 = $src_syntax_trees_ParseTree_js, ParseTree = $__81.ParseTree, ParseTreeType = $__81.ParseTreeType; 
  var $__82 = $src_syntax_PredefinedName_js, BIND = $__82.BIND, CALL = $__82.CALL, CREATE = $__82.CREATE, DEFINE_PROPERTY = $__82.DEFINE_PROPERTY, FREEZE = $__82.FREEZE, OBJECT = $__82.OBJECT, PREVENT_EXTENSIONS = $__82.PREVENT_EXTENSIONS, STATE = $__82.STATE, UNDEFINED = $__82.UNDEFINED, getParameterName = $__82.getParameterName; 
  var $__83 = $src_syntax_Token_js, Token = $__83.Token; 
  var $__84 = $src_syntax_TokenType_js, TokenType = $__84.TokenType; 
  var $__85 = $src_syntax_trees_ParseTrees_js, NullTree = $__85.NullTree, ParseTree = $__85.ParseTree, ParseTreeType = $__85.ParseTreeType, ArgumentList = $__85.ArgumentList, ArrayComprehension = $__85.ArrayComprehension, ArrayLiteralExpression = $__85.ArrayLiteralExpression, ArrayPattern = $__85.ArrayPattern, ArrowFunctionExpression = $__85.ArrowFunctionExpression, AtNameExpression = $__85.AtNameExpression, AtNameDeclaration = $__85.AtNameDeclaration, AwaitStatement = $__85.AwaitStatement, BinaryOperator = $__85.BinaryOperator, BindThisParameter = $__85.BindThisParameter, BindingIdentifier = $__85.BindingIdentifier, BindingElement = $__85.BindingElement, Block = $__85.Block, BreakStatement = $__85.BreakStatement, CallExpression = $__85.CallExpression, CascadeExpression = $__85.CascadeExpression, CaseClause = $__85.CaseClause, Catch = $__85.Catch, ClassDeclaration = $__85.ClassDeclaration, ClassExpression = $__85.ClassExpression, CommaExpression = $__85.CommaExpression, ComprehensionFor = $__85.ComprehensionFor, ConditionalExpression = $__85.ConditionalExpression, ContinueStatement = $__85.ContinueStatement, DebuggerStatement = $__85.DebuggerStatement, DefaultClause = $__85.DefaultClause, DoWhileStatement = $__85.DoWhileStatement, EmptyStatement = $__85.EmptyStatement, ExportDeclaration = $__85.ExportDeclaration, ExportMappingList = $__85.ExportMappingList, ExportMapping = $__85.ExportMapping, ExportSpecifier = $__85.ExportSpecifier, ExportSpecifierSet = $__85.ExportSpecifierSet, ExpressionStatement = $__85.ExpressionStatement, Finally = $__85.Finally, ForOfStatement = $__85.ForOfStatement, ForInStatement = $__85.ForInStatement, FormalParameterList = $__85.FormalParameterList, ForStatement = $__85.ForStatement, FunctionDeclaration = $__85.FunctionDeclaration, GeneratorComprehension = $__85.GeneratorComprehension, GetAccessor = $__85.GetAccessor, IdentifierExpression = $__85.IdentifierExpression, IfStatement = $__85.IfStatement, ImportDeclaration = $__85.ImportDeclaration, ImportBinding = $__85.ImportBinding, ImportSpecifier = $__85.ImportSpecifier, ImportSpecifierSet = $__85.ImportSpecifierSet, LabelledStatement = $__85.LabelledStatement, LiteralExpression = $__85.LiteralExpression, MemberExpression = $__85.MemberExpression, MemberLookupExpression = $__85.MemberLookupExpression, MissingPrimaryExpression = $__85.MissingPrimaryExpression, ModuleDeclaration = $__85.ModuleDeclaration, ModuleDefinition = $__85.ModuleDefinition, ModuleExpression = $__85.ModuleExpression, ModuleRequire = $__85.ModuleRequire, ModuleSpecifier = $__85.ModuleSpecifier, NameStatement = $__85.NameStatement, NewExpression = $__85.NewExpression, ObjectLiteralExpression = $__85.ObjectLiteralExpression, ObjectPatternField = $__85.ObjectPatternField, ObjectPattern = $__85.ObjectPattern, ParenExpression = $__85.ParenExpression, PostfixExpression = $__85.PostfixExpression, Program = $__85.Program, PropertyMethodAssignment = $__85.PropertyMethodAssignment, PropertyNameAssignment = $__85.PropertyNameAssignment, PropertyNameShorthand = $__85.PropertyNameShorthand, QuasiLiteralExpression = $__85.QuasiLiteralExpression, QuasiLiteralPortion = $__85.QuasiLiteralPortion, QuasiSubstitution = $__85.QuasiSubstitution, RequiresMember = $__85.RequiresMember, RestParameter = $__85.RestParameter, ReturnStatement = $__85.ReturnStatement, SetAccessor = $__85.SetAccessor, SpreadExpression = $__85.SpreadExpression, SpreadPatternElement = $__85.SpreadPatternElement, SuperExpression = $__85.SuperExpression, SwitchStatement = $__85.SwitchStatement, ThisExpression = $__85.ThisExpression, ThrowStatement = $__85.ThrowStatement, TryStatement = $__85.TryStatement, UnaryExpression = $__85.UnaryExpression, VariableDeclarationList = $__85.VariableDeclarationList, VariableDeclaration = $__85.VariableDeclaration, VariableStatement = $__85.VariableStatement, WhileStatement = $__85.WhileStatement, WithStatement = $__85.WithStatement, YieldStatement = $__85.YieldStatement; 
  var slice = Array.prototype.slice.call.bind(Array.prototype.slice); 
  var map = Array.prototype.map.call.bind(Array.prototype.map); 
  function createOperatorToken(operator) { 
    return new Token(operator, null); 
  } 
  function createIdentifierToken(identifier) { 
    return new IdentifierToken(null, identifier); 
  } 
  function createPropertyNameToken(propertyName) { 
    return createIdentifierToken(propertyName); 
  } 
  function createStringLiteralToken(value) { 
    return new LiteralToken(TokenType.STRING, JSON.stringify(value), null); 
  } 
  function createBooleanLiteralToken(value) { 
    return new Token(value ? TokenType.TRUE: TokenType.FALSE, null); 
  } 
  function createNullLiteralToken() { 
    return new LiteralToken(TokenType.NULL, 'null', null); 
  } 
  function createNumberLiteralToken(value) { 
    return new LiteralToken(TokenType.NUMBER, String(value), null); 
  } 
  function createEmptyParameters() { 
    return[]; 
  } 
  function createStatementList(statementsOrHead, var_args) { 
    if(statementsOrHead instanceof Array) { 
      var result = statementsOrHead.slice(); 
      result.push.apply(result, slice(arguments, 1)); 
      return result; 
    } 
    return slice(arguments); 
  } 
  function createBindingElement(arg) { 
    var binding = createBindingIdentifier(arg); 
    return new BindingElement(null, binding, null); 
  } 
  function createParameterList(arg0, var_args) { 
    if(typeof arg0 == 'string') { 
      var parameterList = map(arguments, createBindingElement); 
      return new FormalParameterList(null, parameterList); 
    } 
    if(typeof arg0 == 'number') return createParameterListHelper(arg0, false); 
    if(arg0 instanceof IdentifierToken) { 
      return new FormalParameterList(null,[createBindingElement(arg0)]); 
    } 
    var builder = arg0.map(createBindingElement); 
    return new FormalParameterList(null, builder); 
  } 
  function createParameterListHelper(numberOfParameters, hasRestParams) { 
    var builder =[]; 
    for(var index = 0; index < numberOfParameters; index ++) { 
      var parameterName = getParameterName(index); 
      var isRestParameter = index == numberOfParameters - 1 && hasRestParams; 
      builder.push(isRestParameter ? createRestParameter(parameterName): createBindingElement(parameterName)); 
    } 
    return new FormalParameterList(null, builder); 
  } 
  function createParameterListWithRestParams(numberOfParameters) { 
    return createParameterListHelper(numberOfParameters, true); 
  } 
  function createParameterReference(index) { 
    return createIdentifierExpression(getParameterName(index)); 
  } 
  function createEmptyParameterList() { 
    return new FormalParameterList(null,[]); 
  } 
  function createEmptyList() { 
    return[]; 
  } 
  function createArgumentList(numberListOrFirst, var_args) { 
    if(typeof numberListOrFirst == 'number') { 
      return createArgumentListFromParameterList(createParameterList(numberListOrFirst)); 
    } 
    var list; 
    if(numberListOrFirst instanceof Array) list = numberListOrFirst; else list = slice(arguments); 
    return new ArgumentList(null, list); 
  } 
  function createArgumentListFromParameterList(formalParameterList) { 
    var builder = formalParameterList.parameters.map(function(parameter) { 
      if(parameter.isRestParameter()) { 
        return createSpreadExpression(createIdentifierExpression(parameter.identifier)); 
      } else { 
        return parameter; 
      } 
    }); 
    return new ArgumentList(null, builder); 
  } 
  function createEmptyArgumentList() { 
    return new ArgumentList(null, createEmptyList()); 
  } 
  function createArrayLiteralExpression(list) { 
    return new ArrayLiteralExpression(null, list); 
  } 
  function createEmptyArrayLiteralExpression() { 
    return createArrayLiteralExpression(createEmptyList()); 
  } 
  function createArrayPattern(list) { 
    return new ArrayPattern(null, list); 
  } 
  function createAssignmentExpression(lhs, rhs) { 
    return new BinaryOperator(null, lhs, createOperatorToken(TokenType.EQUAL), rhs); 
  } 
  function createBinaryOperator(left, operator, right) { 
    return new BinaryOperator(null, left, operator, right); 
  } 
  function createBindingIdentifier(identifier) { 
    if(typeof identifier === 'string') identifier = createIdentifierToken(identifier); else if(identifier.type === ParseTreeType.BINDING_IDENTIFIER) return identifier; else if(identifier.type === ParseTreeType.IDENTIFIER_EXPRESSION) return new BindingIdentifier(identifier.location, identifier.identifierToken); 
    return new BindingIdentifier(null, identifier); 
  } 
  function createEmptyStatement() { 
    return new EmptyStatement(null); 
  } 
  function createEmptyBlock() { 
    return createBlock(createEmptyList()); 
  } 
  function createBlock(statements) { 
    if(statements instanceof ParseTree) statements = slice(arguments); 
    return new Block(null, statements); 
  } 
  function createScopedStatements(statements) { 
    if(statements instanceof ParseTree) statements = slice(arguments); 
    return createScopedBlock(createBlock(statements)); 
  } 
  function createScopedBlock(block) { 
    return createExpressionStatement(createScopedExpression(block)); 
  } 
  function createScopedExpression(block) { 
    return createCallCall(createParenExpression(createFunctionExpression(createEmptyParameterList(), block)), createThisExpression()); 
  } 
  function createCallExpression(operand, opt_args) { 
    var args = opt_args || createEmptyArgumentList(); 
    return new CallExpression(null, operand, args); 
  } 
  function createBoundCall(func, thisTree) { 
    return createCallExpression(createMemberExpression(func.type == ParseTreeType.FUNCTION_DECLARATION ? createParenExpression(func): func, BIND), createArgumentList(thisTree)); 
  } 
  function createBreakStatement(opt_name) { 
    return new BreakStatement(null, opt_name || null); 
  } 
  function createCallCall(func, thisExpression, args, var_args) { 
    if(args instanceof ParseTree) args = slice(arguments, 2); 
    var builder =[]; 
    builder.push(thisExpression); 
    builder.push.apply(builder, args); 
    return createCallExpression(createMemberExpression(func, CALL), createArgumentList(builder)); 
  } 
  function createCallCallStatement(func, thisExpression, var_args) { 
    var args = slice(arguments, 2); 
    return createExpressionStatement(createCallCall(func, thisExpression, args)); 
  } 
  function createCaseClause(expression, statements) { 
    return new CaseClause(null, expression, statements); 
  } 
  function createCatch(identifier, catchBody) { 
    identifier = createBindingIdentifier(identifier); 
    return new Catch(null, identifier, catchBody); 
  } 
  function createCascadeExpression(operand, expressions) { 
    return new CascadeExpression(null, operand, expressions); 
  } 
  function createClassDeclaration(name, superClass, elements) { 
    return new ClassDeclaration(null, name, superClass, elements); 
  } 
  function createCommaExpression(expressions) { 
    return new CommaExpression(null, expressions); 
  } 
  function createConditionalExpression(condition, left, right) { 
    return new ConditionalExpression(null, condition, left, right); 
  } 
  function createContinueStatement(opt_name) { 
    return new ContinueStatement(null, opt_name || null); 
  } 
  function createDefaultClause(statements) { 
    return new DefaultClause(null, statements); 
  } 
  function createDoWhileStatement(body, condition) { 
    return new DoWhileStatement(null, body, condition); 
  } 
  function createAssignmentStatement(lhs, rhs) { 
    return createExpressionStatement(createAssignmentExpression(lhs, rhs)); 
  } 
  function createCallStatement(operand, opt_args) { 
    if(opt_args) { 
      return createExpressionStatement(createCallExpression(operand, opt_args)); 
    } 
    return createExpressionStatement(createCallExpression(operand)); 
  } 
  function createExpressionStatement(expression) { 
    return new ExpressionStatement(null, expression); 
  } 
  function createFinally(block) { 
    return new Finally(null, block); 
  } 
  function createForOfStatement(initializer, collection, body) { 
    return new ForOfStatement(null, initializer, collection, body); 
  } 
  function createForInStatement(initializer, collection, body) { 
    return new ForInStatement(null, initializer, collection, body); 
  } 
  function createForStatement(variables, condition, increment, body) { 
    return new ForStatement(null, variables, condition, increment, body); 
  } 
  function createFunctionExpressionFormals(formalParameters, functionBody) { 
    if(formalParameters instanceof Array) formalParameters = createParameterList(formalParameters); 
    return new FunctionDeclaration(null, null, false, formalParameters, functionBody); 
  } 
  function createFunctionDeclaration(name, formalParameterList, functionBody) { 
    if(name !== null) name = createBindingIdentifier(name); 
    return new FunctionDeclaration(null, name, false, formalParameterList, functionBody); 
  } 
  function createFunctionExpression(formalParameterList, functionBody) { 
    return new FunctionDeclaration(null, null, false, formalParameterList, functionBody); 
  } 
  function createGetAccessor(propertyName, body) { 
    if(typeof propertyName == 'string') propertyName = createPropertyNameToken(propertyName); 
    return new GetAccessor(null, propertyName, body); 
  } 
  function createIdentifierExpression(identifier) { 
    if(typeof identifier == 'string') identifier = createIdentifierToken(identifier); else if(identifier instanceof BindingIdentifier) identifier = identifier.identifierToken; 
    return new IdentifierExpression(null, identifier); 
  } 
  function createUndefinedExpression() { 
    return createIdentifierExpression(UNDEFINED); 
  } 
  function createIfStatement(condition, ifClause, opt_elseClause) { 
    return new IfStatement(null, condition, ifClause, opt_elseClause || null); 
  } 
  function createLabelledStatement(name, statement) { 
    return new LabelledStatement(null, name, statement); 
  } 
  function createStringLiteral(value) { 
    return new LiteralExpression(null, createStringLiteralToken(value)); 
  } 
  function createBooleanLiteral(value) { 
    return new LiteralExpression(null, createBooleanLiteralToken(value)); 
  } 
  function createTrueLiteral() { 
    return createBooleanLiteral(true); 
  } 
  function createFalseLiteral() { 
    return createBooleanLiteral(false); 
  } 
  function createNullLiteral() { 
    return new LiteralExpression(null, createNullLiteralToken()); 
  } 
  function createNumberLiteral(value) { 
    return new LiteralExpression(null, createNumberLiteralToken(value)); 
  } 
  function createMemberExpression(operand, memberName, memberNames) { 
    if(typeof operand == 'string' || operand instanceof IdentifierToken) operand = createIdentifierExpression(operand); 
    if(typeof memberName == 'string') memberName = createIdentifierToken(memberName); 
    var tree = new MemberExpression(null, operand, memberName); 
    for(var i = 2; i < arguments.length; i ++) { 
      tree = createMemberExpression(tree, arguments[i]); 
    } 
    return tree; 
  } 
  function createMemberLookupExpression(operand, memberExpression) { 
    return new MemberLookupExpression(null, operand, memberExpression); 
  } 
  function createThisExpression(memberName) { 
    if(memberName) return createMemberExpression(createThisExpression(), memberName); 
    return new ThisExpression(null); 
  } 
  function createNewExpression(operand, args) { 
    return new NewExpression(null, operand, args); 
  } 
  function createObjectFreeze(value) { 
    return createCallExpression(createMemberExpression(OBJECT, FREEZE), createArgumentList(value)); 
  } 
  function createObjectPreventExtensions(value) { 
    return createCallExpression(createMemberExpression(OBJECT, PREVENT_EXTENSIONS), createArgumentList(value)); 
  } 
  function createObjectCreate(protoExpression, descriptors) { 
    var argumentList =[protoExpression]; 
    if(descriptors) argumentList.push(descriptors); 
    return createCallExpression(createMemberExpression(OBJECT, CREATE), createArgumentList(argumentList)); 
  } 
  function createPropertyDescriptor(descr) { 
    var propertyNameAndValues = Object.keys(descr).map(function(name) { 
      var value = descr[name]; 
      if(!(value instanceof ParseTree)) value = createBooleanLiteral(! ! value); 
      return createPropertyNameAssignment(name, value); 
    }); 
    return createObjectLiteralExpression(propertyNameAndValues); 
  } 
  function createDefineProperty(tree, name, descr) { 
    if(typeof name === 'string') name = createStringLiteral(name); 
    return createCallExpression(createMemberExpression(OBJECT, DEFINE_PROPERTY), createArgumentList(tree, name, createPropertyDescriptor(descr))); 
  } 
  function createObjectLiteralExpression(propertyNameAndValues) { 
    if(propertyNameAndValues instanceof ParseTree) propertyNameAndValues = slice(arguments); 
    return new ObjectLiteralExpression(null, propertyNameAndValues); 
  } 
  function createObjectPattern(list) { 
    return new ObjectPattern(null, list); 
  } 
  function createObjectPatternField(identifier, element) { 
    identifier = createBindingIdentifier(identifier); 
    return new ObjectPatternField(null, identifier, element); 
  } 
  function createParenExpression(expression) { 
    return new ParenExpression(null, expression); 
  } 
  function createPostfixExpression(operand, operator) { 
    return new PostfixExpression(null, operand, operator); 
  } 
  function createProgram(programElements) { 
    return new Program(null, programElements); 
  } 
  function createPropertyNameAssignment(identifier, value) { 
    if(typeof identifier == 'string') identifier = createIdentifierToken(identifier); 
    return new PropertyNameAssignment(null, identifier, value); 
  } 
  function createRestParameter(identifier) { 
    return new RestParameter(null, createBindingIdentifier(identifier)); 
  } 
  function createReturnStatement(expression) { 
    return new ReturnStatement(null, expression); 
  } 
  function createYieldStatement(expression, isYieldFor) { 
    return new YieldStatement(null, expression, isYieldFor); 
  } 
  function createSetAccessor(propertyName, parameter, body) { 
    if(typeof propertyName == 'string') propertyName = createPropertyNameToken(propertyName); 
    if(typeof parameter == 'string') parameter = createIdentifierToken(parameter); 
    return new SetAccessor(null, propertyName, parameter, body); 
  } 
  function createSpreadExpression(expression) { 
    return new SpreadExpression(null, expression); 
  } 
  function createSpreadPatternElement(lvalue) { 
    return new SpreadPatternElement(null, lvalue); 
  } 
  function createSwitchStatement(expression, caseClauses) { 
    return new SwitchStatement(null, expression, caseClauses); 
  } 
  function createThrowStatement(value) { 
    return new ThrowStatement(null, value); 
  } 
  function createTryStatement(body, catchOrFinallyBlock, opt_finallyBlock) { 
    var catchBlock, finallyBlock; 
    if(arguments.length > 2) { 
      catchBlock = arguments[1]; 
      finallyBlock = arguments[2]; 
    } else { 
      catchBlock = null; 
      finallyBlock = arguments[1]; 
    } 
    return new TryStatement(null, body, catchBlock, finallyBlock); 
  } 
  function createUnaryExpression(operator, operand) { 
    return new UnaryExpression(null, operator, operand); 
  } 
  function createUseStrictDirective() { 
    return createExpressionStatement(createStringLiteral('use strict')); 
  } 
  function createVariableDeclarationList(binding, identifierOrDeclarations, initializer) { 
    if(identifierOrDeclarations instanceof Array) { 
      var declarations = identifierOrDeclarations; 
      return new VariableDeclarationList(null, binding, declarations); 
    } 
    var identifier = identifierOrDeclarations; 
    return createVariableDeclarationList(binding,[createVariableDeclaration(identifier, initializer)]); 
  } 
  function createVariableDeclaration(identifier, initializer) { 
    if(!(identifier instanceof ParseTree) || identifier.type !== ParseTreeType.BINDING_IDENTIFIER && identifier.type !== ParseTreeType.OBJECT_PATTERN && identifier.type !== ParseTreeType.ARRAY_PATTERN) { 
      identifier = createBindingIdentifier(identifier); 
    } 
    return new VariableDeclaration(null, identifier, initializer); 
  } 
  function createVariableStatement(listOrBinding, identifier, initializer) { 
    if(listOrBinding instanceof VariableDeclarationList) return new VariableStatement(null, listOrBinding); 
    var binding = listOrBinding; 
    var list = createVariableDeclarationList(binding, identifier, initializer); 
    return createVariableStatement(list); 
  } 
  function createVoid0() { 
    return createParenExpression(createUnaryExpression(createOperatorToken(TokenType.VOID), createNumberLiteral(0))); 
  } 
  function createWhileStatement(condition, body) { 
    return new WhileStatement(null, condition, body); 
  } 
  function createWithStatement(expression, body) { 
    return new WithStatement(null, expression, body); 
  } 
  function createAssignStateStatement(state) { 
    return createAssignmentStatement(createIdentifierExpression(STATE), createNumberLiteral(state)); 
  } 
  return Object.preventExtensions(Object.create(null, { 
    createOperatorToken: { 
      get: function() { 
        return createOperatorToken; 
      }, 
      enumerable: true 
    }, 
    createIdentifierToken: { 
      get: function() { 
        return createIdentifierToken; 
      }, 
      enumerable: true 
    }, 
    createPropertyNameToken: { 
      get: function() { 
        return createPropertyNameToken; 
      }, 
      enumerable: true 
    }, 
    createStringLiteralToken: { 
      get: function() { 
        return createStringLiteralToken; 
      }, 
      enumerable: true 
    }, 
    createBooleanLiteralToken: { 
      get: function() { 
        return createBooleanLiteralToken; 
      }, 
      enumerable: true 
    }, 
    createNullLiteralToken: { 
      get: function() { 
        return createNullLiteralToken; 
      }, 
      enumerable: true 
    }, 
    createNumberLiteralToken: { 
      get: function() { 
        return createNumberLiteralToken; 
      }, 
      enumerable: true 
    }, 
    createEmptyParameters: { 
      get: function() { 
        return createEmptyParameters; 
      }, 
      enumerable: true 
    }, 
    createStatementList: { 
      get: function() { 
        return createStatementList; 
      }, 
      enumerable: true 
    }, 
    createBindingElement: { 
      get: function() { 
        return createBindingElement; 
      }, 
      enumerable: true 
    }, 
    createParameterList: { 
      get: function() { 
        return createParameterList; 
      }, 
      enumerable: true 
    }, 
    createParameterListWithRestParams: { 
      get: function() { 
        return createParameterListWithRestParams; 
      }, 
      enumerable: true 
    }, 
    createParameterReference: { 
      get: function() { 
        return createParameterReference; 
      }, 
      enumerable: true 
    }, 
    createEmptyParameterList: { 
      get: function() { 
        return createEmptyParameterList; 
      }, 
      enumerable: true 
    }, 
    createEmptyList: { 
      get: function() { 
        return createEmptyList; 
      }, 
      enumerable: true 
    }, 
    createArgumentList: { 
      get: function() { 
        return createArgumentList; 
      }, 
      enumerable: true 
    }, 
    createArgumentListFromParameterList: { 
      get: function() { 
        return createArgumentListFromParameterList; 
      }, 
      enumerable: true 
    }, 
    createEmptyArgumentList: { 
      get: function() { 
        return createEmptyArgumentList; 
      }, 
      enumerable: true 
    }, 
    createArrayLiteralExpression: { 
      get: function() { 
        return createArrayLiteralExpression; 
      }, 
      enumerable: true 
    }, 
    createEmptyArrayLiteralExpression: { 
      get: function() { 
        return createEmptyArrayLiteralExpression; 
      }, 
      enumerable: true 
    }, 
    createArrayPattern: { 
      get: function() { 
        return createArrayPattern; 
      }, 
      enumerable: true 
    }, 
    createAssignmentExpression: { 
      get: function() { 
        return createAssignmentExpression; 
      }, 
      enumerable: true 
    }, 
    createBinaryOperator: { 
      get: function() { 
        return createBinaryOperator; 
      }, 
      enumerable: true 
    }, 
    createBindingIdentifier: { 
      get: function() { 
        return createBindingIdentifier; 
      }, 
      enumerable: true 
    }, 
    createEmptyStatement: { 
      get: function() { 
        return createEmptyStatement; 
      }, 
      enumerable: true 
    }, 
    createEmptyBlock: { 
      get: function() { 
        return createEmptyBlock; 
      }, 
      enumerable: true 
    }, 
    createBlock: { 
      get: function() { 
        return createBlock; 
      }, 
      enumerable: true 
    }, 
    createScopedStatements: { 
      get: function() { 
        return createScopedStatements; 
      }, 
      enumerable: true 
    }, 
    createScopedBlock: { 
      get: function() { 
        return createScopedBlock; 
      }, 
      enumerable: true 
    }, 
    createScopedExpression: { 
      get: function() { 
        return createScopedExpression; 
      }, 
      enumerable: true 
    }, 
    createCallExpression: { 
      get: function() { 
        return createCallExpression; 
      }, 
      enumerable: true 
    }, 
    createBoundCall: { 
      get: function() { 
        return createBoundCall; 
      }, 
      enumerable: true 
    }, 
    createBreakStatement: { 
      get: function() { 
        return createBreakStatement; 
      }, 
      enumerable: true 
    }, 
    createCallCall: { 
      get: function() { 
        return createCallCall; 
      }, 
      enumerable: true 
    }, 
    createCallCallStatement: { 
      get: function() { 
        return createCallCallStatement; 
      }, 
      enumerable: true 
    }, 
    createCaseClause: { 
      get: function() { 
        return createCaseClause; 
      }, 
      enumerable: true 
    }, 
    createCatch: { 
      get: function() { 
        return createCatch; 
      }, 
      enumerable: true 
    }, 
    createCascadeExpression: { 
      get: function() { 
        return createCascadeExpression; 
      }, 
      enumerable: true 
    }, 
    createClassDeclaration: { 
      get: function() { 
        return createClassDeclaration; 
      }, 
      enumerable: true 
    }, 
    createCommaExpression: { 
      get: function() { 
        return createCommaExpression; 
      }, 
      enumerable: true 
    }, 
    createConditionalExpression: { 
      get: function() { 
        return createConditionalExpression; 
      }, 
      enumerable: true 
    }, 
    createContinueStatement: { 
      get: function() { 
        return createContinueStatement; 
      }, 
      enumerable: true 
    }, 
    createDefaultClause: { 
      get: function() { 
        return createDefaultClause; 
      }, 
      enumerable: true 
    }, 
    createDoWhileStatement: { 
      get: function() { 
        return createDoWhileStatement; 
      }, 
      enumerable: true 
    }, 
    createAssignmentStatement: { 
      get: function() { 
        return createAssignmentStatement; 
      }, 
      enumerable: true 
    }, 
    createCallStatement: { 
      get: function() { 
        return createCallStatement; 
      }, 
      enumerable: true 
    }, 
    createExpressionStatement: { 
      get: function() { 
        return createExpressionStatement; 
      }, 
      enumerable: true 
    }, 
    createFinally: { 
      get: function() { 
        return createFinally; 
      }, 
      enumerable: true 
    }, 
    createForOfStatement: { 
      get: function() { 
        return createForOfStatement; 
      }, 
      enumerable: true 
    }, 
    createForInStatement: { 
      get: function() { 
        return createForInStatement; 
      }, 
      enumerable: true 
    }, 
    createForStatement: { 
      get: function() { 
        return createForStatement; 
      }, 
      enumerable: true 
    }, 
    createFunctionExpressionFormals: { 
      get: function() { 
        return createFunctionExpressionFormals; 
      }, 
      enumerable: true 
    }, 
    createFunctionDeclaration: { 
      get: function() { 
        return createFunctionDeclaration; 
      }, 
      enumerable: true 
    }, 
    createFunctionExpression: { 
      get: function() { 
        return createFunctionExpression; 
      }, 
      enumerable: true 
    }, 
    createGetAccessor: { 
      get: function() { 
        return createGetAccessor; 
      }, 
      enumerable: true 
    }, 
    createIdentifierExpression: { 
      get: function() { 
        return createIdentifierExpression; 
      }, 
      enumerable: true 
    }, 
    createUndefinedExpression: { 
      get: function() { 
        return createUndefinedExpression; 
      }, 
      enumerable: true 
    }, 
    createIfStatement: { 
      get: function() { 
        return createIfStatement; 
      }, 
      enumerable: true 
    }, 
    createLabelledStatement: { 
      get: function() { 
        return createLabelledStatement; 
      }, 
      enumerable: true 
    }, 
    createStringLiteral: { 
      get: function() { 
        return createStringLiteral; 
      }, 
      enumerable: true 
    }, 
    createBooleanLiteral: { 
      get: function() { 
        return createBooleanLiteral; 
      }, 
      enumerable: true 
    }, 
    createTrueLiteral: { 
      get: function() { 
        return createTrueLiteral; 
      }, 
      enumerable: true 
    }, 
    createFalseLiteral: { 
      get: function() { 
        return createFalseLiteral; 
      }, 
      enumerable: true 
    }, 
    createNullLiteral: { 
      get: function() { 
        return createNullLiteral; 
      }, 
      enumerable: true 
    }, 
    createNumberLiteral: { 
      get: function() { 
        return createNumberLiteral; 
      }, 
      enumerable: true 
    }, 
    createMemberExpression: { 
      get: function() { 
        return createMemberExpression; 
      }, 
      enumerable: true 
    }, 
    createMemberLookupExpression: { 
      get: function() { 
        return createMemberLookupExpression; 
      }, 
      enumerable: true 
    }, 
    createThisExpression: { 
      get: function() { 
        return createThisExpression; 
      }, 
      enumerable: true 
    }, 
    createNewExpression: { 
      get: function() { 
        return createNewExpression; 
      }, 
      enumerable: true 
    }, 
    createObjectFreeze: { 
      get: function() { 
        return createObjectFreeze; 
      }, 
      enumerable: true 
    }, 
    createObjectPreventExtensions: { 
      get: function() { 
        return createObjectPreventExtensions; 
      }, 
      enumerable: true 
    }, 
    createObjectCreate: { 
      get: function() { 
        return createObjectCreate; 
      }, 
      enumerable: true 
    }, 
    createPropertyDescriptor: { 
      get: function() { 
        return createPropertyDescriptor; 
      }, 
      enumerable: true 
    }, 
    createDefineProperty: { 
      get: function() { 
        return createDefineProperty; 
      }, 
      enumerable: true 
    }, 
    createObjectLiteralExpression: { 
      get: function() { 
        return createObjectLiteralExpression; 
      }, 
      enumerable: true 
    }, 
    createObjectPattern: { 
      get: function() { 
        return createObjectPattern; 
      }, 
      enumerable: true 
    }, 
    createObjectPatternField: { 
      get: function() { 
        return createObjectPatternField; 
      }, 
      enumerable: true 
    }, 
    createParenExpression: { 
      get: function() { 
        return createParenExpression; 
      }, 
      enumerable: true 
    }, 
    createPostfixExpression: { 
      get: function() { 
        return createPostfixExpression; 
      }, 
      enumerable: true 
    }, 
    createProgram: { 
      get: function() { 
        return createProgram; 
      }, 
      enumerable: true 
    }, 
    createPropertyNameAssignment: { 
      get: function() { 
        return createPropertyNameAssignment; 
      }, 
      enumerable: true 
    }, 
    createRestParameter: { 
      get: function() { 
        return createRestParameter; 
      }, 
      enumerable: true 
    }, 
    createReturnStatement: { 
      get: function() { 
        return createReturnStatement; 
      }, 
      enumerable: true 
    }, 
    createYieldStatement: { 
      get: function() { 
        return createYieldStatement; 
      }, 
      enumerable: true 
    }, 
    createSetAccessor: { 
      get: function() { 
        return createSetAccessor; 
      }, 
      enumerable: true 
    }, 
    createSpreadExpression: { 
      get: function() { 
        return createSpreadExpression; 
      }, 
      enumerable: true 
    }, 
    createSpreadPatternElement: { 
      get: function() { 
        return createSpreadPatternElement; 
      }, 
      enumerable: true 
    }, 
    createSwitchStatement: { 
      get: function() { 
        return createSwitchStatement; 
      }, 
      enumerable: true 
    }, 
    createThrowStatement: { 
      get: function() { 
        return createThrowStatement; 
      }, 
      enumerable: true 
    }, 
    createTryStatement: { 
      get: function() { 
        return createTryStatement; 
      }, 
      enumerable: true 
    }, 
    createUnaryExpression: { 
      get: function() { 
        return createUnaryExpression; 
      }, 
      enumerable: true 
    }, 
    createUseStrictDirective: { 
      get: function() { 
        return createUseStrictDirective; 
      }, 
      enumerable: true 
    }, 
    createVariableDeclarationList: { 
      get: function() { 
        return createVariableDeclarationList; 
      }, 
      enumerable: true 
    }, 
    createVariableDeclaration: { 
      get: function() { 
        return createVariableDeclaration; 
      }, 
      enumerable: true 
    }, 
    createVariableStatement: { 
      get: function() { 
        return createVariableStatement; 
      }, 
      enumerable: true 
    }, 
    createVoid0: { 
      get: function() { 
        return createVoid0; 
      }, 
      enumerable: true 
    }, 
    createWhileStatement: { 
      get: function() { 
        return createWhileStatement; 
      }, 
      enumerable: true 
    }, 
    createWithStatement: { 
      get: function() { 
        return createWithStatement; 
      }, 
      enumerable: true 
    }, 
    createAssignStateStatement: { 
      get: function() { 
        return createAssignStateStatement; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var $src_codegeneration_RuntimeInliner_js =(function() { 
  "use strict"; 
  var $__86 = $src_util_MutedErrorReporter_js, MutedErrorReporter = $__86.MutedErrorReporter; 
  var $__87 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__87.ParseTreeTransformer; 
  var $__88 = $src_syntax_Parser_js, Parser = $__88.Parser; 
  var $__89 = $src_syntax_trees_ParseTrees_js, Program = $__89.Program; 
  var $__90 = $src_syntax_SourceFile_js, SourceFile = $__90.SourceFile; 
  var $__91 = $src_syntax_TokenType_js, TokenType = $__91.TokenType; 
  var $__92 = $src_codegeneration_ParseTreeFactory_js, createIdentifierExpression = $__92.createIdentifierExpression, createVariableDeclaration = $__92.createVariableDeclaration, createVariableDeclarationList = $__92.createVariableDeclarationList, createVariableStatement = $__92.createVariableStatement; 
  var $__93 = $src_util_util_js, createObject = $__93.createObject; 
  var shared = { toObject: "function(value) {\n        if (value == null)\n          throw TypeError();\n        return Object(value);\n      }" }; 
  function parse(source, name) { 
    var file = new SourceFile(name + '@runtime', source); 
    var errorReporter = new MutedErrorReporter(); 
    return new Parser(errorReporter, file).parseAssignmentExpression(); 
  } 
  var RuntimeInliner = traceur.runtime.createClass({ 
    constructor: function(identifierGenerator) { 
      traceur.runtime.superCall(this, RuntimeInliner, "constructor",[]); 
      this.identifierGenerator = identifierGenerator; 
      this.map_ = Object.create(null); 
    }, 
    transformProgram: function(tree) { 
      var names = Object.keys(this.map_); 
      if(! names.length) return tree; 
      var vars = names.filter(function(name) { 
        return ! this.map_[name].inserted; 
      }, this).map(function(name) { 
        var item = this.map_[name]; 
        item.inserted = true; 
        return createVariableDeclaration(item.uid, item.expression); 
      }, this); 
      if(! vars.length) return tree; 
      var variableStatement = createVariableStatement(createVariableDeclarationList(TokenType.VAR, vars)); 
      var programElements =[variableStatement]; 
      [].push.apply(programElements, tree.programElements); 
      return new Program(tree.location, programElements); 
    }, 
    register: function(name, source) { 
      if(name in this.map_) return; 
      var self = this; 
      source = source.replace(/%([a-zA-Z0-9_$]+)/g, function(_, name) { 
        if(name in shared) { 
          self.register(name, shared[name]); 
        } 
        return self.getAsString(name); 
      }); 
      var uid = this.identifierGenerator.generateUniqueIdentifier(); 
      this.map_[name]= { 
        expression: parse(source, name), 
        uid: uid, 
        inserted: false 
      }; 
    }, 
    getAsIdentifierExpression: function(name) { 
      return createIdentifierExpression(this.map_[name].uid); 
    }, 
    getAsString: function(name) { 
      return this.map_[name].uid; 
    }, 
    get: function(name, opt_source) { 
      if(!(name in this.map_)) { 
        if(name in shared) opt_source = shared[name]; 
        traceur.assert(opt_source); 
        this.register(name, opt_source); 
      } 
      return this.getAsIdentifierExpression(name); 
    } 
  }, ParseTreeTransformer, true, true); 
  return Object.preventExtensions(Object.create(null, { RuntimeInliner: { 
      get: function() { 
        return RuntimeInliner; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_UniqueIdentifierGenerator_js =(function() { 
  "use strict"; 
  function UniqueIdentifierGenerator() { 
    this.identifierIndex = 0; 
    this.nameMap_ = Object.create(null); 
  } 
  UniqueIdentifierGenerator.prototype = { 
    generateUniqueIdentifier: function() { 
      return("$__" + this.identifierIndex ++); 
    }, 
    getUniqueIdentifier: function(name) { 
      var newName = this.nameMap_[name]; 
      if(! newName) return this.nameMap_[name]= this.generateUniqueIdentifier(); 
      return newName; 
    } 
  }; 
  return Object.preventExtensions(Object.create(null, { UniqueIdentifierGenerator: { 
      get: function() { 
        return UniqueIdentifierGenerator; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_semantics_symbols_Project_js =(function() { 
  "use strict"; 
  var $__94 = $src_util_ArrayMap_js, ArrayMap = $__94.ArrayMap; 
  var $__95 = $src_semantics_symbols_ExportSymbol_js, ExportSymbol = $__95.ExportSymbol; 
  var $__96 = $src_semantics_symbols_ModuleSymbol_js, ModuleSymbol = $__96.ModuleSymbol; 
  var $__97 = $src_util_ObjectMap_js, ObjectMap = $__97.ObjectMap; 
  var $__98 = $src_codegeneration_RuntimeInliner_js, RuntimeInliner = $__98.RuntimeInliner; 
  var $__99 = $src_codegeneration_UniqueIdentifierGenerator_js, UniqueIdentifierGenerator = $__99.UniqueIdentifierGenerator; 
  var $__100 = $src_util_url_js, resolveUrl = $__100.resolveUrl; 
  function addAll(self, other) { 
    for(var key in other) { 
      self[key]= other[key]; 
    } 
  } 
  function values(map) { 
    return Object.keys(map).map((function(key) { 
      return map[key]; 
    })); 
  } 
  var standardModuleUrlRegExp = /^@\w+$/; 
  var standardModuleCache = Object.create(null); 
  function getStandardModule(url) { 
    if(!(url in standardModuleCache)) { 
      var symbol = new ModuleSymbol(null, null, null, url); 
      var moduleInstance = traceur.runtime.modules[url]; 
      Object.keys(moduleInstance).forEach((function(name) { 
        symbol.addExport(name, new ExportSymbol(null, name, null)); 
      })); 
      standardModuleCache[url]= symbol; 
    } 
    return standardModuleCache[url]; 
  } 
  function Project(url) { 
    this.identifierGenerator = new UniqueIdentifierGenerator(); 
    this.runtimeInliner = new RuntimeInliner(this.identifierGenerator); 
    this.sourceFiles_ = Object.create(null); 
    this.parseTrees_ = new ObjectMap(); 
    this.rootModule_ = new ModuleSymbol(null, null, null, url); 
    this.modulesByUrl_ = Object.create(null); 
    this.moduleExports_ = new ArrayMap(); 
  } 
  Project.prototype = { 
    get url() { 
      return this.rootModule_.url; 
    }, 
    createClone: function() { 
      var p = new Project(this.url); 
      addAll(p.sourceFiles_, this.sourceFiles_); 
      p.parseTrees_.addAll(this.parseTrees_); 
      p.objectClass_ = this.objectClass_; 
      return p; 
    }, 
    hasFile: function(name) { 
      return name in this.sourceFiles_; 
    }, 
    addFile: function(file) { 
      this.sourceFiles_[file.name]= file; 
    }, 
    getFile: function(name) { 
      return this.sourceFiles_[name]; 
    }, 
    getSourceFiles: function() { 
      return values(this.sourceFiles_); 
    }, 
    getSourceTrees: function() { 
      return this.parseTrees_.values(); 
    }, 
    setParseTree: function(file, tree) { 
      if(this.sourceFiles_[file.name]!= file) { 
        throw new Error(); 
      } 
      this.parseTrees_.put(file, tree); 
    }, 
    getParseTree: function(file) { 
      return this.parseTrees_.get(file); 
    }, 
    getRootModule: function() { 
      return this.rootModule_; 
    }, 
    addExternalModule: function(module) { 
      traceur.assert(! this.hasModuleForUrl(module.url)); 
      this.modulesByUrl_[module.url]= module; 
    }, 
    getModuleForUrl: function(url) { 
      url = resolveUrl(this.url, url); 
      traceur.assert(this.hasModuleForUrl(url)); 
      if(standardModuleUrlRegExp.test(url)) return getStandardModule(url); 
      return this.modulesByUrl_[url]; 
    }, 
    hasModuleForUrl: function(url) { 
      if(standardModuleUrlRegExp.test(url)) return url in traceur.runtime.modules; 
      url = resolveUrl(this.url, url); 
      return url in this.modulesByUrl_; 
    }, 
    setModuleForStarTree: function(tree, symbol) { 
      this.moduleExports_.put(tree, symbol); 
    }, 
    getModuleForStarTree: function(tree) { 
      return this.moduleExports_.get(tree); 
    } 
  }; 
  return Object.preventExtensions(Object.create(null, { Project: { 
      get: function() { 
        return Project; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_semantics_VariableBinder_js =(function() { 
  "use strict"; 
  var $__101 = $src_syntax_trees_ParseTrees_js, Block = $__101.Block, Catch = $__101.Catch, ForInStatement = $__101.ForInStatement, ForStatement = $__101.ForStatement, FunctionDeclaration = $__101.FunctionDeclaration, ObjectPatternField = $__101.ObjectPatternField, VariableDeclarationList = $__101.VariableDeclarationList, VariableDeclaration = $__101.VariableDeclaration; 
  var $__102 = $src_syntax_trees_ParseTreeType_js, ARRAY_PATTERN = $__102.ARRAY_PATTERN, BINDING_IDENTIFIER = $__102.BINDING_IDENTIFIER, FUNCTION_DECLARATION = $__102.FUNCTION_DECLARATION, OBJECT_PATTERN = $__102.OBJECT_PATTERN, OBJECT_PATTERN_FIELD = $__102.OBJECT_PATTERN_FIELD, PAREN_EXPRESSION = $__102.PAREN_EXPRESSION, SPREAD_PATTERN_ELEMENT = $__102.SPREAD_PATTERN_ELEMENT; 
  var $__103 = $src_syntax_ParseTreeVisitor_js, ParseTreeVisitor = $__103.ParseTreeVisitor; 
  var $__104 = $src_syntax_TokenType_js, TokenType = $__104.TokenType; 
  var $__105 = $src_util_util_js, createObject = $__105.createObject; 
  function variablesInBlock(tree, includeFunctionScope) { 
    var binder = new VariableBinder(includeFunctionScope, tree); 
    binder.visitAny(tree); 
    return binder.identifiers_; 
  } 
  ; 
  function variablesInFunction(tree) { 
    var binder = new VariableBinder(true, tree.functionBody); 
    binder.bindVariablesInFunction_(tree); 
    return binder.identifiers_; 
  } 
  ; 
  var VariableBinder = traceur.runtime.createClass({ 
    constructor: function(includeFunctionScope, scope) { 
      traceur.runtime.superCall(this, VariableBinder, "constructor",[]); 
      this.includeFunctionScope_ = includeFunctionScope; 
      this.scope_ = scope || null; 
      this.block_ = null; 
      this.identifiers_ = Object.create(null); 
    }, 
    bindVariablesInFunction_: function(tree) { 
      var parameters = tree.formalParameterList.parameters; 
      for(var i = 0; i < parameters.length; i ++) { 
        this.bindParameter_(parameters[i]); 
      } 
      this.visitAny(tree.functionBody); 
    }, 
    visitBlock: function(tree) { 
      var parentBlock = this.block_; 
      this.block_ = tree; 
      tree.statements.forEach((function(s) { 
        if(s.type == FUNCTION_DECLARATION) { 
          this.bindFunctionDeclaration_(s); 
        } else { 
          this.visitAny(s); 
        } 
      }).bind(this)); 
      this.block_ = parentBlock; 
    }, 
    bindFunctionDeclaration_: function(tree) { 
      if(tree.name != null && this.block_ == this.scope_) { 
        this.bind_(tree.name.identifierToken); 
      } 
    }, 
    visitFunctionDeclaration: function(tree) { }, 
    visitVariableDeclarationList: function(tree) { 
      if((tree.declarationType == TokenType.VAR && this.includeFunctionScope_) ||(tree.declarationType != TokenType.VAR && this.block_ == this.scope_)) { 
        traceur.runtime.superCall(this, VariableBinder, "visitVariableDeclarationList",[tree]); 
      } else { 
        var decls = tree.declarations; 
        for(var i = 0; i < decls.length; i ++) { 
          this.visitAny(decls[i].initializer); 
        } 
      } 
    }, 
    visitVariableDeclaration: function(tree) { 
      this.bindVariableDeclaration_(tree.lvalue); 
      traceur.runtime.superCall(this, VariableBinder, "visitVariableDeclaration",[tree]); 
    }, 
    bind_: function(identifier) { 
      traceur.assert(typeof identifier.value == 'string'); 
      this.identifiers_[identifier.value]= true; 
    }, 
    bindParameter_: function(parameter) { 
      if(parameter.isRestParameter()) { 
        this.bind_(parameter.identifier); 
      } else { 
        this.bindVariableDeclaration_(parameter.binding); 
      } 
    }, 
    bindVariableDeclaration_: function(tree) { 
      switch(tree.type) { 
        case BINDING_IDENTIFIER: 
          this.bind_(tree.identifierToken); 
          break; 

        case ARRAY_PATTERN: 
          var elements = tree.elements; 
          for(var i = 0; i < elements.length; i ++) { 
            this.bindVariableDeclaration_(elements[i]); 
          } 
          break; 

        case SPREAD_PATTERN_ELEMENT: 
          this.bindVariableDeclaration_(tree.lvalue); 
          break; 

        case OBJECT_PATTERN: 
          var fields = tree.fields; 
          for(var i = 0; i < fields.length; i ++) { 
            this.bindVariableDeclaration_(fields[i]); 
          } 
          break; 

        case OBJECT_PATTERN_FIELD: 
          var field = tree; 
          if(field.element == null) { 
            this.bind_(field.identifier); 
          } else { 
            this.bindVariableDeclaration_(field.element); 
          } 
          break; 

        case PAREN_EXPRESSION: 
          this.bindVariableDeclaration_(tree.expression); 
          break; 

        default: 
          throw new Error('unreachable'); 

      } 
    } 
  }, ParseTreeVisitor, true, true); 
  return Object.preventExtensions(Object.create(null, { 
    variablesInBlock: { 
      get: function() { 
        return variablesInBlock; 
      }, 
      enumerable: true 
    }, 
    variablesInFunction: { 
      get: function() { 
        return variablesInFunction; 
      }, 
      enumerable: true 
    }, 
    VariableBinder: { 
      get: function() { 
        return VariableBinder; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var $src_util_TestErrorReporter_js =(function() { 
  "use strict"; 
  var $__106 = $src_util_ErrorReporter_js, ErrorReporter = $__106.ErrorReporter; 
  var $__107 = $src_util_util_js, createObject = $__107.createObject; 
  var TestErrorReporter = traceur.runtime.createClass({ 
    constructor: function() { 
      this.errors =[]; 
    }, 
    reportMessageInternal: function(location, kind, format, args) { 
      if(kind !== 'error') return; 
      this.errors.push(ErrorReporter.format(location, format, args)); 
    }, 
    hasMatchingError: function(expected) { 
      return this.errors.some((function(error) { 
        return error.indexOf(expected) !== - 1; 
      })); 
    } 
  }, ErrorReporter, true, true); 
  return Object.preventExtensions(Object.create(null, { TestErrorReporter: { 
      get: function() { 
        return TestErrorReporter; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_util_StringBuilder_js =(function() { 
  "use strict"; 
  var StringBuilder = traceur.runtime.createClass({ 
    constructor: function() { 
      this.strings_ =[]; 
      this.length = 0; 
    }, 
    append: function(str) { 
      str = str.toString(); 
      this.length += str.length; 
      this.strings_.push(str); 
      return this; 
    }, 
    toString: function() { 
      return this.strings_.join(''); 
    }, 
    lastChar: function() { 
      var last = this.strings_[this.strings_.length - 1]; 
      if(last) { 
        last = last[last.length - 1]; 
      } 
      return last; 
    }, 
    deleteLastChar: function() { 
      var lastString = this.strings_.length - 1; 
      var last = this.strings_[lastString]; 
      if(last) { 
        this.strings_[lastString]= last.substring(0, last.length - 1); 
      } 
    } 
  }, null, true, false); 
  ; 
  return Object.preventExtensions(Object.create(null, { StringBuilder: { 
      get: function() { 
        return StringBuilder; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_outputgeneration_ParseTreeWriter_js =(function() { 
  "use strict"; 
  var $__108 = $src_syntax_Keywords_js, Keywords = $__108.Keywords; 
  var $__109 = $src_syntax_ParseTreeVisitor_js, ParseTreeVisitor = $__109.ParseTreeVisitor; 
  var $__110 = $src_syntax_PredefinedName_js, FROM = $__110.FROM, GET = $__110.GET, OF = $__110.OF, MODULE = $__110.MODULE, REQUIRES = $__110.REQUIRES, SET = $__110.SET; 
  var $__111 = $src_util_StringBuilder_js, StringBuilder = $__111.StringBuilder; 
  var $__112 = $src_syntax_TokenType_js, TokenType = $__112.TokenType; 
  var $__113 = $src_util_util_js, createObject = $__113.createObject; 
  var NEW_LINE = '\n'; 
  var PRETTY_PRINT = true; 
  var ParseTreeWriter = traceur.runtime.createClass({ 
    constructor: function(highlighted, showLineNumbers) { 
      traceur.runtime.superCall(this, ParseTreeWriter, "constructor",[]); 
      this.highlighted_ = highlighted; 
      this.showLineNumbers_ = showLineNumbers; 
      this.result_ = new StringBuilder(); 
      this.currentLine_ = new StringBuilder(); 
      this.currentLineComment_ = null; 
      this.indentDepth_ = 0; 
    }, 
    visitAny: function(tree) { 
      if(! tree) { 
        return; 
      } 
      if(tree === this.highlighted_) { 
        this.write_('\x1B[41m'); 
      } 
      if(tree.location !== null && tree.location.start !== null && this.showLineNumbers_) { 
        var line = tree.location.start.line + 1; 
        var column = tree.location.start.column; 
        this.currentLineComment_ =("Line: " + line + "." + column); 
      } 
      this.currentLocation = tree.location; 
      traceur.runtime.superCall(this, ParseTreeWriter, "visitAny",[tree]); 
      if(tree === this.highlighted_) { 
        this.write_('\x1B[0m'); 
      } 
    }, 
    visitArgumentList: function(tree) { 
      this.write_(TokenType.OPEN_PAREN); 
      this.writeList_(tree.args, TokenType.COMMA, false); 
      this.write_(TokenType.CLOSE_PAREN); 
    }, 
    visitArrayComprehension: function(tree) { 
      this.write_(TokenType.OPEN_SQUARE); 
      this.visitAny(tree.expression); 
      this.visitList(tree.comprehensionForList); 
      if(tree.ifExpression) { 
        this.write_(TokenType.IF); 
        this.visitAny(tree.ifExpression); 
      } 
      this.write_(TokenType.CLOSE_SQUARE); 
    }, 
    visitArrayLiteralExpression: function(tree) { 
      this.write_(TokenType.OPEN_SQUARE); 
      this.writeList_(tree.elements, TokenType.COMMA, false); 
      this.write_(TokenType.CLOSE_SQUARE); 
    }, 
    visitArrayPattern: function(tree) { 
      this.write_(TokenType.OPEN_SQUARE); 
      this.writeList_(tree.elements, TokenType.COMMA, false); 
      this.write_(TokenType.CLOSE_SQUARE); 
    }, 
    visitArrowFunctionExpression: function(tree) { 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.formalParameters); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.write_(TokenType.ARROW); 
      this.visitAny(tree.functionBody); 
    }, 
    visitAtNameExpression: function(tree) { 
      this.write_(tree.atNameToken); 
    }, 
    visitAtNameDeclaration: function(tree) { 
      this.write_(tree.atNameToken); 
      if(tree.initializer) { 
        this.write_(TokenType.EQUAL); 
        this.visitAny(tree.initializer); 
      } 
    }, 
    visitAwaitStatement: function(tree) { 
      this.write_(TokenType.AWAIT); 
      if(tree.identifier !== null) { 
        this.write_(tree.identifier); 
        this.write_(TokenType.EQUAL); 
      } 
      this.visitAny(tree.expression); 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitBinaryOperator: function(tree) { 
      this.visitAny(tree.left); 
      this.write_(tree.operator); 
      this.visitAny(tree.right); 
    }, 
    visitBindThisParameter: function(tree) { 
      this.write_(TokenType.THIS); 
      this.write_(TokenType.EQUAL); 
      this.visitAny(tree.expression); 
    }, 
    visitBindingElement: function(tree) { 
      this.visitAny(tree.binding); 
      if(tree.initializer) { 
        this.write_(TokenType.EQUAL); 
        this.visitAny(tree.initializer); 
      } 
    }, 
    visitBindingIdentifier: function(tree) { 
      this.write_(tree.identifierToken); 
    }, 
    visitBlock: function(tree) { 
      this.write_(TokenType.OPEN_CURLY); 
      this.writelnList_(tree.statements); 
      this.write_(TokenType.CLOSE_CURLY); 
    }, 
    visitBreakStatement: function(tree) { 
      this.write_(TokenType.BREAK); 
      if(tree.name !== null) { 
        this.write_(tree.name); 
      } 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitCallExpression: function(tree) { 
      this.visitAny(tree.operand); 
      this.visitAny(tree.args); 
    }, 
    visitCaseClause: function(tree) { 
      this.write_(TokenType.CASE); 
      this.visitAny(tree.expression); 
      this.write_(TokenType.COLON); 
      this.indentDepth_ ++; 
      this.writelnList_(tree.statements); 
      this.indentDepth_ --; 
    }, 
    visitCatch: function(tree) { 
      this.write_(TokenType.CATCH); 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.binding); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.visitAny(tree.catchBody); 
    }, 
    visitCascadeExpression: function(tree) { 
      this.visitAny(tree.operand); 
      this.write_(TokenType.PERIOD_OPEN_CURLY); 
      this.writelnList_(tree.expressions, TokenType.SEMI_COLON, false); 
      this.write_(TokenType.CLOSE_CURLY); 
    }, 
    visitClassShared_: function(tree) { 
      this.write_(TokenType.CLASS); 
      if(tree.name) this.write_(tree.name); 
      if(tree.superClass !== null) { 
        this.write_(TokenType.EXTENDS); 
        this.visitAny(tree.superClass); 
      } 
      this.write_(TokenType.OPEN_CURLY); 
      this.writelnList_(tree.elements); 
      this.write_(TokenType.CLOSE_CURLY); 
    }, 
    visitClassDeclaration: function(tree) { 
      this.visitClassShared_(tree); 
    }, 
    visitClassExpression: function(tree) { 
      this.visitClassShared_(tree); 
    }, 
    visitCommaExpression: function(tree) { 
      this.writeList_(tree.expressions, TokenType.COMMA, false); 
    }, 
    visitComprehensionFor: function(tree) { 
      this.write_(TokenType.FOR); 
      this.visitAny(tree.left); 
      this.write_(OF); 
      this.visitAny(tree.iterator); 
    }, 
    visitConditionalExpression: function(tree) { 
      this.visitAny(tree.condition); 
      this.write_(TokenType.QUESTION); 
      this.visitAny(tree.left); 
      this.write_(TokenType.COLON); 
      this.visitAny(tree.right); 
    }, 
    visitContinueStatement: function(tree) { 
      this.write_(TokenType.CONTINUE); 
      if(tree.name !== null) { 
        this.write_(tree.name); 
      } 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitDebuggerStatement: function(tree) { 
      this.write_(TokenType.DEBUGGER); 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitDefaultClause: function(tree) { 
      this.write_(TokenType.DEFAULT); 
      this.write_(TokenType.COLON); 
      this.indentDepth_ ++; 
      this.writelnList_(tree.statements); 
      this.indentDepth_ --; 
    }, 
    visitDoWhileStatement: function(tree) { 
      this.write_(TokenType.DO); 
      this.visitAny(tree.body); 
      this.write_(TokenType.WHILE); 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.condition); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitEmptyStatement: function(tree) { 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitExportDeclaration: function(tree) { 
      this.write_(TokenType.EXPORT); 
      this.visitAny(tree.declaration); 
    }, 
    visitExportMappingList: function(tree) { 
      this.writeList_(tree.paths, TokenType.COMMA, false); 
    }, 
    visitExportMapping: function(tree) { 
      this.visitAny(tree.specifierSet); 
      if(tree.moduleExpression) { 
        this.write_(FROM); 
        this.visitAny(tree.moduleExpression); 
      } 
    }, 
    visitExportSpecifier: function(tree) { 
      this.write_(tree.lhs); 
      if(tree.rhs) { 
        this.write_(TokenType.COLON); 
        this.write_(tree.rhs); 
      } 
    }, 
    visitExportSpecifierSet: function(tree) { 
      this.write_(TokenType.OPEN_CURLY); 
      this.writeList_(tree.specifiers, TokenType.COMMA, false); 
      this.write_(TokenType.CLOSE_CURLY); 
    }, 
    visitExpressionStatement: function(tree) { 
      this.visitAny(tree.expression); 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitFinally: function(tree) { 
      this.write_(TokenType.FINALLY); 
      this.visitAny(tree.block); 
    }, 
    visitForOfStatement: function(tree) { 
      this.write_(TokenType.FOR); 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.initializer); 
      this.write_(OF); 
      this.visitAny(tree.collection); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.visitAny(tree.body); 
    }, 
    visitForInStatement: function(tree) { 
      this.write_(TokenType.FOR); 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.initializer); 
      this.write_(TokenType.IN); 
      this.visitAny(tree.collection); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.visitAny(tree.body); 
    }, 
    visitForStatement: function(tree) { 
      this.write_(TokenType.FOR); 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.initializer); 
      this.write_(TokenType.SEMI_COLON); 
      this.visitAny(tree.condition); 
      this.write_(TokenType.SEMI_COLON); 
      this.visitAny(tree.increment); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.visitAny(tree.body); 
    }, 
    visitFormalParameterList: function(tree) { 
      var first = true; 
      for(var i = 0; i < tree.parameters.length; i ++) { 
        var parameter = tree.parameters[i]; 
        if(first) { 
          first = false; 
        } else { 
          this.write_(TokenType.COMMA); 
        } 
        this.visitAny(parameter); 
      } 
    }, 
    visitFunctionDeclaration: function(tree) { 
      this.write_(Keywords.FUNCTION); 
      if(tree.isGenerator) { 
        this.write_(TokenType.STAR); 
      } 
      this.visitAny(tree.name); 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.formalParameterList); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.visitAny(tree.functionBody); 
    }, 
    visitGeneratorComprehension: function(tree) { 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.expression); 
      this.visitList(tree.comprehensionForList); 
      if(tree.ifExpression) { 
        this.write_(TokenType.IF); 
        this.visitAny(tree.ifExpression); 
      } 
      this.write_(TokenType.CLOSE_PAREN); 
    }, 
    visitGetAccessor: function(tree) { 
      this.write_(GET); 
      this.write_(tree.propertyName); 
      this.write_(TokenType.OPEN_PAREN); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.visitAny(tree.body); 
    }, 
    visitIdentifierExpression: function(tree) { 
      this.write_(tree.identifierToken); 
    }, 
    visitIfStatement: function(tree) { 
      this.write_(TokenType.IF); 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.condition); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.visitAny(tree.ifClause); 
      if(tree.elseClause) { 
        this.write_(TokenType.ELSE); 
        this.visitAny(tree.elseClause); 
      } 
    }, 
    visitImportDeclaration: function(tree) { 
      this.write_(TokenType.IMPORT); 
      this.writeList_(tree.importPathList, TokenType.COMMA, false); 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitImportBinding: function(tree) { 
      this.visitAny(tree.importSpecifierSet); 
      if(tree.moduleExpression) { 
        this.write_(FROM); 
        this.visitAny(tree.moduleExpression); 
      } 
    }, 
    visitImportSpecifier: function(tree) { 
      this.write_(tree.importedName); 
      if(tree.destinationName !== null) { 
        this.write_(TokenType.COLON); 
        this.write_(tree.destinationName); 
      } 
    }, 
    visitImportSpecifierSet: function(tree) { 
      if(tree.specifiers.type == TokenType.STAR) this.write_(TokenType.STAR); else this.visitList(tree.specifiers); 
    }, 
    visitLabelledStatement: function(tree) { 
      this.write_(tree.name); 
      this.write_(TokenType.COLON); 
      this.visitAny(tree.statement); 
    }, 
    visitLiteralExpression: function(tree) { 
      this.write_(tree.literalToken); 
    }, 
    visitMemberExpression: function(tree) { 
      this.visitAny(tree.operand); 
      this.write_(TokenType.PERIOD); 
      this.write_(tree.memberName); 
    }, 
    visitMemberLookupExpression: function(tree) { 
      this.visitAny(tree.operand); 
      this.write_(TokenType.OPEN_SQUARE); 
      this.visitAny(tree.memberExpression); 
      this.write_(TokenType.CLOSE_SQUARE); 
    }, 
    visitMissingPrimaryExpression: function(tree) { 
      this.write_('MissingPrimaryExpression'); 
    }, 
    visitModuleDeclaration: function(tree) { 
      this.write_(MODULE); 
      this.writeList_(tree.specifiers, TokenType.COMMA, false); 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitModuleDefinition: function(tree) { 
      this.write_(MODULE); 
      this.write_(tree.name); 
      this.write_(TokenType.OPEN_CURLY); 
      this.writeln_(); 
      this.writeList_(tree.elements, null, true); 
      this.write_(TokenType.CLOSE_CURLY); 
      this.writeln_(); 
    }, 
    visitModuleExpression: function(tree) { 
      this.visitAny(tree.reference); 
      for(var i = 0; i < tree.identifiers.length; i ++) { 
        this.write_(TokenType.PERIOD); 
        this.write_(tree.identifiers[i]); 
      } 
    }, 
    visitModuleRequire: function(tree) { 
      this.write_(tree.url); 
    }, 
    visitModuleSpecifier: function(tree) { 
      this.write_(tree.identifier); 
      this.write_(FROM); 
      this.visitAny(tree.expression); 
    }, 
    visitNameStatement: function(tree) { 
      this.write_(TokenType.PRIVATE); 
      this.writeList_(tree.declarations, TokenType.COMMA, false); 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitNewExpression: function(tree) { 
      this.write_(TokenType.NEW); 
      this.visitAny(tree.operand); 
      this.visitAny(tree.args); 
    }, 
    visitNullTree: function(tree) { }, 
    visitObjectLiteralExpression: function(tree) { 
      this.write_(TokenType.OPEN_CURLY); 
      if(tree.propertyNameAndValues.length > 1) this.writeln_(); 
      this.writelnList_(tree.propertyNameAndValues, TokenType.COMMA); 
      if(tree.propertyNameAndValues.length > 1) this.writeln_(); 
      this.write_(TokenType.CLOSE_CURLY); 
    }, 
    visitObjectPattern: function(tree) { 
      this.write_(TokenType.OPEN_CURLY); 
      this.writelnList_(tree.fields, TokenType.COMMA); 
      this.write_(TokenType.CLOSE_CURLY); 
    }, 
    visitObjectPatternField: function(tree) { 
      this.write_(tree.identifier); 
      if(tree.element !== null) { 
        this.write_(TokenType.COLON); 
        this.visitAny(tree.element); 
      } 
    }, 
    visitParenExpression: function(tree) { 
      this.write_(TokenType.OPEN_PAREN); 
      traceur.runtime.superCall(this, ParseTreeWriter, "visitParenExpression",[tree]); 
      this.write_(TokenType.CLOSE_PAREN); 
    }, 
    visitPostfixExpression: function(tree) { 
      this.visitAny(tree.operand); 
      this.write_(tree.operator); 
    }, 
    visitProgram: function(tree) { 
      this.writelnList_(tree.programElements); 
    }, 
    visitPropertyMethodAssignment: function(tree) { 
      if(tree.isGenerator) this.write_(TokenType.STAR); 
      this.write_(tree.name); 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.formalParameterList); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.visitAny(tree.functionBody); 
    }, 
    visitPropertyNameAssignment: function(tree) { 
      this.write_(tree.name); 
      this.write_(TokenType.COLON); 
      this.visitAny(tree.value); 
    }, 
    visitPropertyNameShorthand: function(tree) { 
      this.write_(tree.name); 
    }, 
    visitQuasiLiteralExpression: function(tree) { 
      this.visitAny(tree.operand); 
      this.writeRaw_(TokenType.BACK_QUOTE); 
      this.visitList(tree.elements); 
      this.writeRaw_(TokenType.BACK_QUOTE); 
    }, 
    visitQuasiLiteralPortion: function(tree) { 
      this.writeRaw_(tree.value); 
    }, 
    visitQuasiSubstitution: function(tree) { 
      this.writeRaw_(TokenType.DOLLAR); 
      this.writeRaw_(TokenType.OPEN_CURLY); 
      this.visitAny(tree.expression); 
      this.writeRaw_(TokenType.CLOSE_CURLY); 
    }, 
    visitRequiresMember: function(tree) { 
      this.write_(REQUIRES); 
      this.write_(tree.name); 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitReturnStatement: function(tree) { 
      this.write_(TokenType.RETURN); 
      this.visitAny(tree.expression); 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitRestParameter: function(tree) { 
      this.write_(TokenType.DOT_DOT_DOT); 
      this.write_(tree.identifier); 
    }, 
    visitSetAccessor: function(tree) { 
      this.write_(SET); 
      this.write_(tree.propertyName); 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.parameter); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.visitAny(tree.body); 
    }, 
    visitSpreadExpression: function(tree) { 
      this.write_(TokenType.DOT_DOT_DOT); 
      this.visitAny(tree.expression); 
    }, 
    visitSpreadPatternElement: function(tree) { 
      this.write_(TokenType.DOT_DOT_DOT); 
      this.visitAny(tree.lvalue); 
    }, 
    visitStateMachine: function(tree) { 
      throw new Error('State machines cannot be converted to source'); 
    }, 
    visitSuperExpression: function(tree) { 
      this.write_(TokenType.SUPER); 
    }, 
    visitSwitchStatement: function(tree) { 
      this.write_(TokenType.SWITCH); 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.expression); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.write_(TokenType.OPEN_CURLY); 
      this.writelnList_(tree.caseClauses); 
      this.write_(TokenType.CLOSE_CURLY); 
    }, 
    visitThisExpression: function(tree) { 
      this.write_(TokenType.THIS); 
    }, 
    visitThrowStatement: function(tree) { 
      this.write_(TokenType.THROW); 
      this.visitAny(tree.value); 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitTryStatement: function(tree) { 
      this.write_(TokenType.TRY); 
      this.visitAny(tree.body); 
      this.visitAny(tree.catchBlock); 
      this.visitAny(tree.finallyBlock); 
    }, 
    visitUnaryExpression: function(tree) { 
      this.write_(tree.operator); 
      this.visitAny(tree.operand); 
    }, 
    visitVariableDeclarationList: function(tree) { 
      this.write_(tree.declarationType); 
      this.writeList_(tree.declarations, TokenType.COMMA, false); 
    }, 
    visitVariableDeclaration: function(tree) { 
      this.visitAny(tree.lvalue); 
      if(tree.initializer !== null) { 
        this.write_(TokenType.EQUAL); 
        this.visitAny(tree.initializer); 
      } 
    }, 
    visitVariableStatement: function(tree) { 
      traceur.runtime.superCall(this, ParseTreeWriter, "visitVariableStatement",[tree]); 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    visitWhileStatement: function(tree) { 
      this.write_(TokenType.WHILE); 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.condition); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.visitAny(tree.body); 
    }, 
    visitWithStatement: function(tree) { 
      this.write_(TokenType.WITH); 
      this.write_(TokenType.OPEN_PAREN); 
      this.visitAny(tree.expression); 
      this.write_(TokenType.CLOSE_PAREN); 
      this.visitAny(tree.body); 
    }, 
    visitYieldStatement: function(tree) { 
      this.write_(TokenType.YIELD); 
      if(tree.isYieldFor) { 
        this.write_(TokenType.STAR); 
      } 
      this.visitAny(tree.expression); 
      this.write_(TokenType.SEMI_COLON); 
    }, 
    writeln_: function() { 
      if(this.currentLineComment_ !== null) { 
        while(this.currentLine_.length < 80) { 
          this.currentLine_.append(' '); 
        } 
        this.currentLine_.append(' // ').append(this.currentLineComment_); 
        this.currentLineComment_ = null; 
      } 
      this.result_.append(this.currentLine_.toString()); 
      this.result_.append(NEW_LINE); 
      this.outputLineCount ++; 
      this.currentLine_ = new StringBuilder(); 
    }, 
    writelnList_: function(list, delimiter) { 
      if(delimiter) { 
        this.writeList_(list, delimiter, true); 
      } else { 
        if(list.length > 0) this.writeln_(); 
        this.writeList_(list, null, true); 
        if(list.length > 0) this.writeln_(); 
      } 
    }, 
    writeList_: function(list, delimiter, writeNewLine) { 
      var first = true; 
      for(var i = 0; i < list.length; i ++) { 
        var element = list[i]; 
        if(first) { 
          first = false; 
        } else { 
          if(delimiter !== null) { 
            this.write_(delimiter); 
          } 
          if(writeNewLine) { 
            this.writeln_(); 
          } 
        } 
        this.visitAny(element); 
      } 
    }, 
    writeTokenList_: function(list, delimiter, writeNewLine) { 
      var first = true; 
      for(var i = 0; i < list.length; i ++) { 
        var element = list[i]; 
        if(first) { 
          first = false; 
        } else { 
          if(delimiter !== null) { 
            this.write_(delimiter); 
          } 
          if(writeNewLine) { 
            this.writeln_(); 
          } 
        } 
        this.write_(element); 
      } 
    }, 
    writeRaw_: function(value) { 
      if(value !== null) { 
        this.currentLine_.append(value.toString()); 
      } 
    }, 
    write_: function(value) { 
      if(value === TokenType.CLOSE_CURLY) { 
        this.indentDepth_ --; 
      } 
      var spaceBefore = true; 
      var spaceAfter = true; 
      switch(value) { 
        case TokenType.PERIOD: 
        case TokenType.OPEN_SQUARE: 
        case TokenType.OPEN_PAREN: 
        case TokenType.CLOSE_SQUARE: 
          spaceBefore = false; 
          spaceAfter = false; 
          break; 

        case TokenType.COLON: 
        case TokenType.COMMA: 
        case TokenType.SEMI_COLON: 
        case TokenType.CLOSE_PAREN: 
          spaceBefore = false; 
          break; 

      } 
      if(value !== null) { 
        if(PRETTY_PRINT) { 
          if(this.currentLine_.length === 0) { 
            for(var i = 0, indent = this.indentDepth_ * 2; i < indent; ++ i) { 
              this.currentLine_.append(' '); 
            } 
          } else { 
            if(spaceBefore === false && this.currentLine_.lastChar() === ' ') { 
              this.currentLine_.deleteLastChar(); 
            } 
          } 
        } 
        this.currentLine_.append(value.toString()); 
        if(spaceAfter) { 
          this.currentLine_.append(' '); 
        } 
      } 
      if(value === TokenType.OPEN_CURLY) { 
        this.indentDepth_ ++; 
      } 
    } 
  }, ParseTreeVisitor, true, true); 
  return Object.preventExtensions(Object.create(null, { ParseTreeWriter: { 
      get: function() { 
        return ParseTreeWriter; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_outputgeneration_ParseTreeMapWriter_js =(function() { 
  "use strict"; 
  var $__114 = $src_outputgeneration_ParseTreeWriter_js, ParseTreeWriter = $__114.ParseTreeWriter; 
  var $__115 = $src_util_util_js, createObject = $__115.createObject; 
  function ParseTreeMapWriter(highlighted, showLineNumbers, sourceMapGenerator) { 
    ParseTreeWriter.call(this, highlighted, showLineNumbers); 
    this.sourceMapGenerator_ = sourceMapGenerator; 
    this.outputLineCount = 0; 
  } 
  ParseTreeMapWriter.prototype = createObject(ParseTreeWriter.prototype, { 
    write_: function(value) { 
      if(this.currentLocation) { 
        this.addMapping(); 
      } 
      ParseTreeWriter.prototype.write_.apply(this,[value]); 
    }, 
    addMapping: function() { 
      var mapping = { 
        generated: { 
          line: this.outputLineCount + 1, 
          column: this.currentLine_.length 
        }, 
        original: { 
          line: this.currentLocation.start.line + 1, 
          column: this.currentLocation.start.column 
        }, 
        source: this.currentLocation.start.source.name 
      }; 
      this.sourceMapGenerator_.addMapping(mapping); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { ParseTreeMapWriter: { 
      get: function() { 
        return ParseTreeMapWriter; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_outputgeneration_TreeWriter_js =(function() { 
  "use strict"; 
  var $__116 = $src_outputgeneration_ParseTreeMapWriter_js, ParseTreeMapWriter = $__116.ParseTreeMapWriter; 
  var $__117 = $src_outputgeneration_ParseTreeWriter_js, ParseTreeWriter = $__117.ParseTreeWriter; 
  function TreeWriter() { } 
  TreeWriter.write = function(tree, opt_options) { 
    var showLineNumbers; 
    var highlighted = null; 
    var sourceMapGenerator; 
    if(opt_options) { 
      showLineNumbers = opt_options.showLineNumbers; 
      highlighted = opt_options.highlighted || null; 
      sourceMapGenerator = opt_options.sourceMapGenerator; 
    } 
    var writer; 
    if(sourceMapGenerator) { 
      writer = new ParseTreeMapWriter(highlighted, showLineNumbers, sourceMapGenerator); 
    } else { 
      writer = new ParseTreeWriter(highlighted, showLineNumbers); 
    } 
    writer.visitAny(tree); 
    if(writer.currentLine_.length > 0) { 
      writer.writeln_(); 
    } 
    if(sourceMapGenerator) { 
      opt_options.sourceMap = sourceMapGenerator.toString(); 
    } 
    return writer.result_.toString(); 
  }; 
  return Object.preventExtensions(Object.create(null, { TreeWriter: { 
      get: function() { 
        return TreeWriter; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_ParseTreeValidator_js =(function() { 
  "use strict"; 
  var $__118 = $src_syntax_trees_ParseTrees_js, NewExpression = $__118.NewExpression; 
  var $__119 = $src_syntax_ParseTreeVisitor_js, ParseTreeVisitor = $__119.ParseTreeVisitor; 
  var $__120 = $src_syntax_PredefinedName_js, IS = $__120.IS, ISNT = $__120.ISNT; 
  var $__121 = $src_syntax_TokenType_js, TokenType = $__121.TokenType; 
  var $__122 = $src_outputgeneration_TreeWriter_js, TreeWriter = $__122.TreeWriter; 
  var $__123 = $src_util_util_js, createObject = $__123.createObject; 
  var $__124 = $src_syntax_trees_ParseTreeType_js, ARGUMENT_LIST = $__124.ARGUMENT_LIST, ARRAY_COMPREHENSION = $__124.ARRAY_COMPREHENSION, ARRAY_LITERAL_EXPRESSION = $__124.ARRAY_LITERAL_EXPRESSION, ARRAY_PATTERN = $__124.ARRAY_PATTERN, ARROW_FUNCTION_EXPRESSION = $__124.ARROW_FUNCTION_EXPRESSION, AT_NAME_EXPRESSION = $__124.AT_NAME_EXPRESSION, AT_NAME_DECLARATION = $__124.AT_NAME_DECLARATION, AWAIT_STATEMENT = $__124.AWAIT_STATEMENT, BINARY_OPERATOR = $__124.BINARY_OPERATOR, BIND_THIS_PARAMETER = $__124.BIND_THIS_PARAMETER, BINDING_ELEMENT = $__124.BINDING_ELEMENT, BINDING_IDENTIFIER = $__124.BINDING_IDENTIFIER, BLOCK = $__124.BLOCK, BREAK_STATEMENT = $__124.BREAK_STATEMENT, CALL_EXPRESSION = $__124.CALL_EXPRESSION, CASCADE_EXPRESSION = $__124.CASCADE_EXPRESSION, CASE_CLAUSE = $__124.CASE_CLAUSE, CATCH = $__124.CATCH, CLASS_DECLARATION = $__124.CLASS_DECLARATION, CLASS_EXPRESSION = $__124.CLASS_EXPRESSION, COMMA_EXPRESSION = $__124.COMMA_EXPRESSION, COMPREHENSION_FOR = $__124.COMPREHENSION_FOR, CONDITIONAL_EXPRESSION = $__124.CONDITIONAL_EXPRESSION, CONTINUE_STATEMENT = $__124.CONTINUE_STATEMENT, DEBUGGER_STATEMENT = $__124.DEBUGGER_STATEMENT, DEFAULT_CLAUSE = $__124.DEFAULT_CLAUSE, DO_WHILE_STATEMENT = $__124.DO_WHILE_STATEMENT, EMPTY_STATEMENT = $__124.EMPTY_STATEMENT, EXPORT_DECLARATION = $__124.EXPORT_DECLARATION, EXPORT_MAPPING_LIST = $__124.EXPORT_MAPPING_LIST, EXPORT_MAPPING = $__124.EXPORT_MAPPING, EXPORT_SPECIFIER = $__124.EXPORT_SPECIFIER, EXPORT_SPECIFIER_SET = $__124.EXPORT_SPECIFIER_SET, EXPRESSION_STATEMENT = $__124.EXPRESSION_STATEMENT, FINALLY = $__124.FINALLY, FOR_OF_STATEMENT = $__124.FOR_OF_STATEMENT, FOR_IN_STATEMENT = $__124.FOR_IN_STATEMENT, FORMAL_PARAMETER_LIST = $__124.FORMAL_PARAMETER_LIST, FOR_STATEMENT = $__124.FOR_STATEMENT, FUNCTION_DECLARATION = $__124.FUNCTION_DECLARATION, GENERATOR_COMPREHENSION = $__124.GENERATOR_COMPREHENSION, GET_ACCESSOR = $__124.GET_ACCESSOR, IDENTIFIER_EXPRESSION = $__124.IDENTIFIER_EXPRESSION, IF_STATEMENT = $__124.IF_STATEMENT, IMPORT_DECLARATION = $__124.IMPORT_DECLARATION, IMPORT_BINDING = $__124.IMPORT_BINDING, IMPORT_SPECIFIER = $__124.IMPORT_SPECIFIER, IMPORT_SPECIFIER_SET = $__124.IMPORT_SPECIFIER_SET, LABELLED_STATEMENT = $__124.LABELLED_STATEMENT, LITERAL_EXPRESSION = $__124.LITERAL_EXPRESSION, MEMBER_EXPRESSION = $__124.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__124.MEMBER_LOOKUP_EXPRESSION, MISSING_PRIMARY_EXPRESSION = $__124.MISSING_PRIMARY_EXPRESSION, MODULE_DECLARATION = $__124.MODULE_DECLARATION, MODULE_DEFINITION = $__124.MODULE_DEFINITION, MODULE_EXPRESSION = $__124.MODULE_EXPRESSION, MODULE_REQUIRE = $__124.MODULE_REQUIRE, MODULE_SPECIFIER = $__124.MODULE_SPECIFIER, NAME_STATEMENT = $__124.NAME_STATEMENT, NEW_EXPRESSION = $__124.NEW_EXPRESSION, NULL_TREE = $__124.NULL_TREE, OBJECT_LITERAL_EXPRESSION = $__124.OBJECT_LITERAL_EXPRESSION, OBJECT_PATTERN_FIELD = $__124.OBJECT_PATTERN_FIELD, OBJECT_PATTERN = $__124.OBJECT_PATTERN, PAREN_EXPRESSION = $__124.PAREN_EXPRESSION, POSTFIX_EXPRESSION = $__124.POSTFIX_EXPRESSION, PROGRAM = $__124.PROGRAM, PROPERTY_METHOD_ASSIGNMENT = $__124.PROPERTY_METHOD_ASSIGNMENT, PROPERTY_NAME_ASSIGNMENT = $__124.PROPERTY_NAME_ASSIGNMENT, PROPERTY_NAME_SHORTHAND = $__124.PROPERTY_NAME_SHORTHAND, QUASI_LITERAL_EXPRESSION = $__124.QUASI_LITERAL_EXPRESSION, QUASI_LITERAL_PORTION = $__124.QUASI_LITERAL_PORTION, QUASI_SUBSTITUTION = $__124.QUASI_SUBSTITUTION, REQUIRES_MEMBER = $__124.REQUIRES_MEMBER, REST_PARAMETER = $__124.REST_PARAMETER, RETURN_STATEMENT = $__124.RETURN_STATEMENT, SET_ACCESSOR = $__124.SET_ACCESSOR, STATE_MACHINE = $__124.STATE_MACHINE, SPREAD_EXPRESSION = $__124.SPREAD_EXPRESSION, SPREAD_PATTERN_ELEMENT = $__124.SPREAD_PATTERN_ELEMENT, SUPER_EXPRESSION = $__124.SUPER_EXPRESSION, SWITCH_STATEMENT = $__124.SWITCH_STATEMENT, THIS_EXPRESSION = $__124.THIS_EXPRESSION, THROW_STATEMENT = $__124.THROW_STATEMENT, TRY_STATEMENT = $__124.TRY_STATEMENT, UNARY_EXPRESSION = $__124.UNARY_EXPRESSION, VARIABLE_DECLARATION_LIST = $__124.VARIABLE_DECLARATION_LIST, VARIABLE_DECLARATION = $__124.VARIABLE_DECLARATION, VARIABLE_STATEMENT = $__124.VARIABLE_STATEMENT, WHILE_STATEMENT = $__124.WHILE_STATEMENT, WITH_STATEMENT = $__124.WITH_STATEMENT, YIELD_STATEMENT = $__124.YIELD_STATEMENT; 
  var ValidationError = traceur.runtime.createClass({ constructor: function(tree, message) { 
      this.tree = tree; 
      this.message = message; 
    } }, Error, true, true); 
  var ParseTreeValidator = traceur.runtime.createClass({ 
    fail_: function(tree, message) { 
      throw new ValidationError(tree, message); 
    }, 
    check_: function(condition, tree, message) { 
      if(! condition) { 
        this.fail_(tree, message); 
      } 
    }, 
    checkVisit_: function(condition, tree, message) { 
      this.check_(condition, tree, message); 
      this.visitAny(tree); 
    }, 
    checkType_: function(type, tree, message) { 
      this.checkVisit_(tree.type === type, tree, message); 
    }, 
    visitArgumentList: function(tree) { 
      for(var i = 0; i < tree.args.length; i ++) { 
        var argument = tree.args[i]; 
        this.checkVisit_(argument.isAssignmentOrSpread(), argument, 'assignment or spread expected'); 
      } 
    }, 
    visitArrayLiteralExpression: function(tree) { 
      for(var i = 0; i < tree.elements.length; i ++) { 
        var element = tree.elements[i]; 
        this.checkVisit_(element.isNull() || element.isAssignmentOrSpread(), element, 'assignment or spread expected'); 
      } 
    }, 
    visitArrayPattern: function(tree) { 
      for(var i = 0; i < tree.elements.length; i ++) { 
        var element = tree.elements[i]; 
        this.checkVisit_(element === null || element.type === BINDING_ELEMENT || element.type == IDENTIFIER_EXPRESSION || element.isLeftHandSideExpression() || element.isPattern() || element.isSpreadPatternElement(), element, 'null, sub pattern, left hand side expression or spread expected'); 
        if(element && element.isSpreadPatternElement()) { 
          this.check_(i ===(tree.elements.length - 1), element, 'spread in array patterns must be the last element'); 
        } 
      } 
    }, 
    visitAwaitStatement: function(tree) { 
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'await must be expression'); 
    }, 
    visitBinaryOperator: function(tree) { 
      switch(tree.operator.type) { 
        case TokenType.EQUAL: 
        case TokenType.STAR_EQUAL: 
        case TokenType.SLASH_EQUAL: 
        case TokenType.PERCENT_EQUAL: 
        case TokenType.PLUS_EQUAL: 
        case TokenType.MINUS_EQUAL: 
        case TokenType.LEFT_SHIFT_EQUAL: 
        case TokenType.RIGHT_SHIFT_EQUAL: 
        case TokenType.UNSIGNED_RIGHT_SHIFT_EQUAL: 
        case TokenType.AMPERSAND_EQUAL: 
        case TokenType.CARET_EQUAL: 
        case TokenType.BAR_EQUAL: 
          this.check_(tree.left.isLeftHandSideExpression() || tree.left.isPattern(), tree.left, 'left hand side expression or pattern expected'); 
          this.check_(tree.right.isArrowFunctionExpression(), tree.right, 'assignment expression expected'); 
          break; 

        case TokenType.AND: 
        case TokenType.OR: 
        case TokenType.BAR: 
        case TokenType.CARET: 
        case TokenType.AMPERSAND: 
        case TokenType.EQUAL_EQUAL: 
        case TokenType.NOT_EQUAL: 
        case TokenType.EQUAL_EQUAL_EQUAL: 
        case TokenType.NOT_EQUAL_EQUAL: 
        case TokenType.OPEN_ANGLE: 
        case TokenType.CLOSE_ANGLE: 
        case TokenType.GREATER_EQUAL: 
        case TokenType.LESS_EQUAL: 
        case TokenType.INSTANCEOF: 
        case TokenType.IN: 
        case TokenType.LEFT_SHIFT: 
        case TokenType.RIGHT_SHIFT: 
        case TokenType.UNSIGNED_RIGHT_SHIFT: 
        case TokenType.PLUS: 
        case TokenType.MINUS: 
        case TokenType.STAR: 
        case TokenType.SLASH: 
        case TokenType.PERCENT: 
          this.check_(tree.left.isArrowFunctionExpression(), tree.left, 'assignment expression expected'); 
          this.check_(tree.right.isArrowFunctionExpression(), tree.right, 'assignment expression expected'); 
          break; 

        case TokenType.IDENTIFIER: 
          var foundIsIdentifier = false; 
          switch(tree.operator.value) { 
            case IS: 
            case ISNT: 
              foundIsIdentifier = true; 

          } 
          if(foundIsIdentifier) break; 

        default: 
          this.fail_(tree, 'unexpected binary operator'); 

      } 
      this.visitAny(tree.left); 
      this.visitAny(tree.right); 
    }, 
    visitBindingElement: function(tree) { 
      var binding = tree.binding; 
      this.checkVisit_(binding.type == BINDING_IDENTIFIER || binding.type == OBJECT_PATTERN || binding.type == ARRAY_PATTERN, binding, 'expected valid binding element'); 
      this.visitAny(tree.initializer); 
    }, 
    visitBlock: function(tree) { 
      for(var i = 0; i < tree.statements.length; i ++) { 
        var statement = tree.statements[i]; 
        this.checkVisit_(statement.isSourceElement(), statement, 'statement or function declaration expected'); 
      } 
    }, 
    visitCallExpression: function(tree) { 
      this.check_(tree.operand.isMemberExpression(), tree.operand, 'member expression expected'); 
      if(tree.operand instanceof NewExpression) { 
        this.check_(tree.operand.args !== null, tree.operand, 'new args expected'); 
      } 
      this.visitAny(tree.operand); 
      this.visitAny(tree.args); 
    }, 
    visitCaseClause: function(tree) { 
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected'); 
      for(var i = 0; i < tree.statements.length; i ++) { 
        var statement = tree.statements[i]; 
        this.checkVisit_(statement.isStatement(), statement, 'statement expected'); 
      } 
    }, 
    visitCatch: function(tree) { 
      this.checkVisit_(tree.binding.isPattern() || tree.binding.type == BINDING_IDENTIFIER, tree.binding, 'binding identifier expected'); 
      this.checkVisit_(tree.catchBody.type === BLOCK, tree.catchBody, 'block expected'); 
    }, 
    visitClassDeclaration: function(tree) { 
      for(var i = 0; i < tree.elements.length; i ++) { 
        var element = tree.elements[i]; 
        switch(element.type) { 
          case GET_ACCESSOR: 
          case SET_ACCESSOR: 
          case PROPERTY_METHOD_ASSIGNMENT: 
            break; 

          default: 
            this.fail_(element, 'class element expected'); 

        } 
        this.visitAny(element); 
      } 
    }, 
    visitCommaExpression: function(tree) { 
      for(var i = 0; i < tree.expressions.length; i ++) { 
        var expression = tree.expressions[i]; 
        this.checkVisit_(expression.isArrowFunctionExpression(), expression, 'expression expected'); 
      } 
    }, 
    visitConditionalExpression: function(tree) { 
      this.checkVisit_(tree.condition.isArrowFunctionExpression(), tree.condition, 'expression expected'); 
      this.checkVisit_(tree.left.isArrowFunctionExpression(), tree.left, 'expression expected'); 
      this.checkVisit_(tree.right.isArrowFunctionExpression(), tree.right, 'expression expected'); 
    }, 
    visitDefaultClause: function(tree) { 
      for(var i = 0; i < tree.statements.length; i ++) { 
        var statement = tree.statements[i]; 
        this.checkVisit_(statement.isStatement(), statement, 'statement expected'); 
      } 
    }, 
    visitDoWhileStatement: function(tree) { 
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected'); 
      this.checkVisit_(tree.condition.isExpression(), tree.condition, 'expression expected'); 
    }, 
    visitExportDeclaration: function(tree) { 
      var declType = tree.declaration.type; 
      this.checkVisit_(declType == VARIABLE_STATEMENT || declType == FUNCTION_DECLARATION || declType == MODULE_DEFINITION || declType == MODULE_DECLARATION || declType == CLASS_DECLARATION || declType == EXPORT_MAPPING_LIST, tree.declaration, 'expected valid export tree'); 
    }, 
    visitExportMapping: function(tree) { 
      if(tree.moduleExpression) { 
        this.checkVisit_(tree.moduleExpression.type == MODULE_EXPRESSION, tree.moduleExpression, 'module expression expected'); 
      } 
      var specifierType = tree.specifierSet.type; 
      this.checkVisit_(specifierType == EXPORT_SPECIFIER_SET || specifierType == IDENTIFIER_EXPRESSION, tree.specifierSet, 'specifier set or identifier expected'); 
    }, 
    visitExportMappingList: function(tree) { 
      this.check_(tree.paths.length > 0, tree, 'expected at least one path'); 
      for(var i = 0; i < tree.paths.length; i ++) { 
        var path = tree.paths[i]; 
        var type = path.type; 
        this.checkVisit_(type == EXPORT_MAPPING, path, 'expected export mapping'); 
      } 
    }, 
    visitExportSpecifierSet: function(tree) { 
      this.check_(tree.specifiers.length > 0, tree, 'expected at least one identifier'); 
      for(var i = 0; i < tree.specifiers.length; i ++) { 
        var specifier = tree.specifiers[i]; 
        this.checkVisit_(specifier.type == EXPORT_SPECIFIER || specifier.type == IDENTIFIER_EXPRESSION, specifier, 'expected valid export specifier'); 
      } 
    }, 
    visitExpressionStatement: function(tree) { 
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected'); 
    }, 
    visitFinally: function(tree) { 
      this.checkVisit_(tree.block.type === BLOCK, tree.block, 'block expected'); 
    }, 
    visitForOfStatement: function(tree) { 
      this.checkVisit_(tree.initializer.isPattern() || tree.initializer.type === IDENTIFIER_EXPRESSION || tree.initializer.type === VARIABLE_DECLARATION_LIST && tree.initializer.declarations.length === 1, tree.initializer, 'for-each statement may not have more than one variable declaration'); 
      this.checkVisit_(tree.collection.isExpression(), tree.collection, 'expression expected'); 
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected'); 
    }, 
    visitForInStatement: function(tree) { 
      if(tree.initializer.type === VARIABLE_DECLARATION_LIST) { 
        this.checkVisit_(tree.initializer.declarations.length <= 1, tree.initializer, 'for-in statement may not have more than one variable declaration'); 
      } else { 
        this.checkVisit_(tree.initializer.isPattern() || tree.initializer.isExpression(), tree.initializer, 'variable declaration, expression or ' + 'pattern expected'); 
      } 
      this.checkVisit_(tree.collection.isExpression(), tree.collection, 'expression expected'); 
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected'); 
    }, 
    visitFormalParameterList: function(tree) { 
      for(var i = 0; i < tree.parameters.length; i ++) { 
        var parameter = tree.parameters[i]; 
        switch(parameter.type) { 
          case BINDING_ELEMENT: 
            break; 

          case REST_PARAMETER: 
            this.checkVisit_(i === tree.parameters.length - 1, parameter, 'rest parameters must be the last parameter in a parameter list'); 
            this.checkType_(BINDING_IDENTIFIER, parameter.identifier, 'binding identifier expected'); 
            break; 

          default: 
            this.fail_(parameter, 'parameters must be identifiers or rest' +(" parameters. Found: " + parameter.type)); 
            break; 

        } 
        this.visitAny(parameter); 
      } 
    }, 
    visitForStatement: function(tree) { 
      if(tree.initializer !== null && ! tree.initializer.isNull()) { 
        this.checkVisit_(tree.initializer.isExpression() || tree.initializer.type === VARIABLE_DECLARATION_LIST, tree.initializer, 'variable declaration list or expression expected'); 
      } 
      if(tree.condition !== null) { 
        this.checkVisit_(tree.condition.isExpression(), tree.condition, 'expression expected'); 
      } 
      if(tree.increment !== null) { 
        this.checkVisit_(tree.condition.isExpression(), tree.increment, 'expression expected'); 
      } 
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected'); 
    }, 
    visitFunctionDeclaration: function(tree) { 
      if(tree.name !== null) { 
        this.checkType_(BINDING_IDENTIFIER, tree.name, 'binding identifier expected'); 
      } 
      this.checkType_(FORMAL_PARAMETER_LIST, tree.formalParameterList, 'formal parameters expected'); 
      this.checkType_(BLOCK, tree.functionBody, 'block expected'); 
    }, 
    visitGetAccessor: function(tree) { 
      this.checkType_(BLOCK, tree.body, 'block expected'); 
    }, 
    visitIfStatement: function(tree) { 
      this.checkVisit_(tree.condition.isExpression(), tree.condition, 'expression expected'); 
      this.checkVisit_(tree.ifClause.isStatement(), tree.ifClause, 'statement expected'); 
      if(tree.elseClause !== null) { 
        this.checkVisit_(tree.elseClause.isStatement(), tree.elseClause, 'statement expected'); 
      } 
    }, 
    visitLabelledStatement: function(tree) { 
      this.checkVisit_(tree.statement.isStatement(), tree.statement, 'statement expected'); 
    }, 
    visitMemberExpression: function(tree) { 
      this.check_(tree.operand.isMemberExpression(), tree.operand, 'member expression expected'); 
      if(tree.operand instanceof NewExpression) { 
        this.check_(tree.operand.args !== null, tree.operand, 'new args expected'); 
      } 
      this.visitAny(tree.operand); 
    }, 
    visitMemberLookupExpression: function(tree) { 
      this.check_(tree.operand.isMemberExpression(), tree.operand, 'member expression expected'); 
      if(tree.operand instanceof NewExpression) { 
        this.check_(tree.operand.args !== null, tree.operand, 'new args expected'); 
      } 
      this.visitAny(tree.operand); 
    }, 
    visitMissingPrimaryExpression: function(tree) { 
      this.fail_(tree, 'parse tree contains errors'); 
    }, 
    visitModuleDeclaration: function(tree) { 
      for(var i = 0; i < tree.specifiers.length; i ++) { 
        var specifier = tree.specifiers[i]; 
        this.checkType_(MODULE_SPECIFIER, specifier, 'module specifier expected'); 
      } 
    }, 
    visitModuleDefinition: function(tree) { 
      for(var i = 0; i < tree.elements.length; i ++) { 
        var element = tree.elements[i]; 
        this.checkVisit_((element.isStatement() && element.type !== BLOCK) || element.type === CLASS_DECLARATION || element.type === EXPORT_DECLARATION || element.type === IMPORT_DECLARATION || element.type === MODULE_DEFINITION || element.type === MODULE_DECLARATION, element, 'module element expected'); 
      } 
    }, 
    visitModuleRequire: function(tree) { 
      this.check_(tree.url.type == TokenType.STRING, tree.url, 'string expected'); 
    }, 
    visitModuleSpecifier: function(tree) { 
      this.checkType_(MODULE_EXPRESSION, tree.expression, 'module expression expected'); 
    }, 
    visitNewExpression: function(tree) { 
      this.checkVisit_(tree.operand.isMemberExpression(), tree.operand, 'member expression expected'); 
      this.visitAny(tree.args); 
    }, 
    visitObjectLiteralExpression: function(tree) { 
      for(var i = 0; i < tree.propertyNameAndValues.length; i ++) { 
        var propertyNameAndValue = tree.propertyNameAndValues[i]; 
        switch(propertyNameAndValue.type) { 
          case GET_ACCESSOR: 
          case SET_ACCESSOR: 
          case PROPERTY_METHOD_ASSIGNMENT: 
          case PROPERTY_NAME_ASSIGNMENT: 
          case PROPERTY_NAME_SHORTHAND: 
            break; 

          default: 
            this.fail_(propertyNameAndValue, 'accessor, property name assignment or property method assigment expected'); 

        } 
        this.visitAny(propertyNameAndValue); 
      } 
    }, 
    visitObjectPattern: function(tree) { 
      for(var i = 0; i < tree.fields.length; i ++) { 
        var field = tree.fields[i]; 
        this.checkVisit_(field.type === OBJECT_PATTERN_FIELD || field.type === BINDING_ELEMENT || field.type === IDENTIFIER_EXPRESSION, field, 'object pattern field expected'); 
      } 
    }, 
    visitObjectPatternField: function(tree) { 
      this.checkVisit_(tree.element.type === BINDING_ELEMENT || tree.element.isPattern() || tree.element.isLeftHandSideExpression(), tree.element, 'binding element expected'); 
    }, 
    visitParenExpression: function(tree) { 
      if(tree.expression.isPattern()) { 
        this.visitAny(tree.expression); 
      } else { 
        this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected'); 
      } 
    }, 
    visitPostfixExpression: function(tree) { 
      this.checkVisit_(tree.operand.isArrowFunctionExpression(), tree.operand, 'assignment expression expected'); 
    }, 
    visitProgram: function(tree) { 
      for(var i = 0; i < tree.programElements.length; i ++) { 
        var programElement = tree.programElements[i]; 
        this.checkVisit_(programElement.isProgramElement(), programElement, 'global program element expected'); 
      } 
    }, 
    visitPropertyNameAssignment: function(tree) { 
      this.checkVisit_(tree.value.isArrowFunctionExpression(), tree.value, 'assignment expression expected'); 
    }, 
    visitPropertyNameShorthand: function(tree) { }, 
    visitQuasiLiteralExpression: function(tree) { 
      if(tree.operand) { 
        this.checkVisit_(tree.operand.isMemberExpression(), tree.operand, 'member or call expression expected'); 
      } 
      for(var i = 0; i < tree.elements.length; i ++) { 
        var element = tree.elements[i]; 
        if(i % 2) { 
          this.checkType_(QUASI_SUBSTITUTION, element, 'Quasi substitution expected'); 
        } else { 
          this.checkType_(QUASI_LITERAL_PORTION, element, 'Quasi literal portion expected'); 
        } 
      } 
    }, 
    visitReturnStatement: function(tree) { 
      if(tree.expression !== null) { 
        this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected'); 
      } 
    }, 
    visitSetAccessor: function(tree) { 
      this.checkType_(BLOCK, tree.body, 'block expected'); 
    }, 
    visitSpreadExpression: function(tree) { 
      this.checkVisit_(tree.expression.isArrowFunctionExpression(), tree.expression, 'assignment expression expected'); 
    }, 
    visitStateMachine: function(tree) { 
      this.fail_(tree, 'State machines are never valid outside of the ' + 'GeneratorTransformer pass.'); 
    }, 
    visitSwitchStatement: function(tree) { 
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected'); 
      var defaultCount = 0; 
      for(var i = 0; i < tree.caseClauses.length; i ++) { 
        var caseClause = tree.caseClauses[i]; 
        if(caseClause.type === DEFAULT_CLAUSE) { 
          ++ defaultCount; 
          this.checkVisit_(defaultCount <= 1, caseClause, 'no more than one default clause allowed'); 
        } else { 
          this.checkType_(CASE_CLAUSE, caseClause, 'case or default clause expected'); 
        } 
      } 
    }, 
    visitThrowStatement: function(tree) { 
      if(tree.value === null) { 
        return; 
      } 
      this.checkVisit_(tree.value.isExpression(), tree.value, 'expression expected'); 
    }, 
    visitTryStatement: function(tree) { 
      this.checkType_(BLOCK, tree.body, 'block expected'); 
      if(tree.catchBlock !== null && ! tree.catchBlock.isNull()) { 
        this.checkType_(CATCH, tree.catchBlock, 'catch block expected'); 
      } 
      if(tree.finallyBlock !== null && ! tree.finallyBlock.isNull()) { 
        this.checkType_(FINALLY, tree.finallyBlock, 'finally block expected'); 
      } 
      if((tree.catchBlock === null || tree.catchBlock.isNull()) &&(tree.finallyBlock === null || tree.finallyBlock.isNull())) { 
        this.fail_(tree, 'either catch or finally must be present'); 
      } 
    }, 
    visitUnaryExpression: function(tree) { 
      this.checkVisit_(tree.operand.isArrowFunctionExpression(), tree.operand, 'assignment expression expected'); 
    }, 
    visitVariableDeclaration: function(tree) { 
      this.checkVisit_(tree.lvalue.isPattern() || tree.lvalue.type == BINDING_IDENTIFIER, tree.lvalue, 'binding identifier expected, found: ' + tree.lvalue.type); 
      if(tree.initializer !== null) { 
        this.checkVisit_(tree.initializer.isArrowFunctionExpression(), tree.initializer, 'assignment expression expected'); 
      } 
    }, 
    visitWhileStatement: function(tree) { 
      this.checkVisit_(tree.condition.isExpression(), tree.condition, 'expression expected'); 
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected'); 
    }, 
    visitWithStatement: function(tree) { 
      this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected'); 
      this.checkVisit_(tree.body.isStatement(), tree.body, 'statement expected'); 
    }, 
    visitYieldStatement: function(tree) { 
      if(tree.expression !== null) { 
        this.checkVisit_(tree.expression.isExpression(), tree.expression, 'expression expected'); 
      } 
    }, 
    constructor: function() { 
      var args = Array.prototype.slice.call(arguments, 0); 
      traceur.runtime.superCall(this, ParseTreeValidator, "constructor", $__465(args)); 
    } 
  }, ParseTreeVisitor, false, true); 
  ParseTreeValidator.validate = function(tree) { 
    var validator = new ParseTreeValidator(); 
    try { 
      validator.visitAny(tree); 
    } catch(e) { 
      if(!(e instanceof ValidationError)) { 
        throw e; 
      } 
      var location = null; 
      if(e.tree !== null) { 
        location = e.tree.location; 
      } 
      if(location === null) { 
        location = tree.location; 
      } 
      var locationString = location !== null ? location.start.toString(): '(unknown)'; 
      throw new Error(("Parse tree validation failure '" + e.message + "' at " + locationString + ":") + '\n\n' + TreeWriter.write(tree, { 
        highlighted: e.tree, 
        showLineNumbers: true 
      }) + '\n'); 
    } 
  }; 
  return Object.preventExtensions(Object.create(null, { ParseTreeValidator: { 
      get: function() { 
        return ParseTreeValidator; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_outputgeneration_ProjectWriter_js =(function() { 
  "use strict"; 
  var $__125 = $src_outputgeneration_TreeWriter_js, TreeWriter = $__125.TreeWriter; 
  function ProjectWriter() { } 
  ProjectWriter.write = function(results, opt_options) { 
    return results.keys().map(function(file) { 
      return TreeWriter.write(results.get(file), opt_options); 
    }).join(''); 
  }; 
  return Object.preventExtensions(Object.create(null, { ProjectWriter: { 
      get: function() { 
        return ProjectWriter; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_outputgeneration_SourceMapIntegration_js =(function() { 
  "use strict"; 
  var base64 = this.sourceMapModule['base64']; 
  var base64Vlq = this.sourceMapModule['base64-vlq']; 
  var binarySearch = this.sourceMapModule['binary-search']; 
  var util = this.sourceMapModule['util']; 
  var SourceMapGenerator = this.sourceMapModule['source-map-generator']; 
  var SourceMapConsumer = this.sourceMapModule['source-map-consumer']; 
  var SourceNode = this.sourceMapModule['source-node']; 
  return Object.preventExtensions(Object.create(null, { 
    base64: { 
      get: function() { 
        return base64; 
      }, 
      enumerable: true 
    }, 
    base64Vlq: { 
      get: function() { 
        return base64Vlq; 
      }, 
      enumerable: true 
    }, 
    binarySearch: { 
      get: function() { 
        return binarySearch; 
      }, 
      enumerable: true 
    }, 
    util: { 
      get: function() { 
        return util; 
      }, 
      enumerable: true 
    }, 
    SourceMapGenerator: { 
      get: function() { 
        return SourceMapGenerator; 
      }, 
      enumerable: true 
    }, 
    SourceMapConsumer: { 
      get: function() { 
        return SourceMapConsumer; 
      }, 
      enumerable: true 
    }, 
    SourceNode: { 
      get: function() { 
        return SourceNode; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var $src_codegeneration_module_ModuleRequireVisitor_js =(function() { 
  "use strict"; 
  var $__126 = $src_syntax_ParseTreeVisitor_js, ParseTreeVisitor = $__126.ParseTreeVisitor; 
  var $__127 = $src_util_url_js, canonicalizeUrl = $__127.canonicalizeUrl; 
  var $__128 = $src_util_util_js, createObject = $__128.createObject; 
  var $__129 = $src_semantics_util_js, evaluateStringLiteral = $__129.evaluateStringLiteral; 
  var ModuleRequireVisitor = traceur.runtime.createClass({ 
    constructor: function(reporter) { 
      traceur.runtime.superCall(this, ModuleRequireVisitor, "constructor",[]); 
      this.urls_ = Object.create(null); 
    }, 
    get requireUrls() { 
      return Object.keys(this.urls_); 
    }, 
    visitModuleRequire: function(tree) { 
      this.urls_[canonicalizeUrl(evaluateStringLiteral(tree.url))]= true; 
    } 
  }, ParseTreeVisitor, true, true); 
  return Object.preventExtensions(Object.create(null, { ModuleRequireVisitor: { 
      get: function() { 
        return ModuleRequireVisitor; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_ModuleTransformer_js =(function() { 
  "use strict"; 
  var $__130 = $src_syntax_trees_ParseTrees_js, BindingElement = $__130.BindingElement, BindingIdentifier = $__130.BindingIdentifier, IdentifierExpression = $__130.IdentifierExpression, LiteralExpression = $__130.LiteralExpression, ObjectPattern = $__130.ObjectPattern, ObjectPatternField = $__130.ObjectPatternField, Program = $__130.Program; 
  var $__131 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__131.ParseTreeTransformer; 
  var $__132 = $src_syntax_PredefinedName_js, GET_MODULE_INSTANCE_BY_URL = $__132.GET_MODULE_INSTANCE_BY_URL, RUNTIME = $__132.RUNTIME, TRACEUR = $__132.TRACEUR; 
  var $__133 = $src_syntax_trees_ParseTreeType_js, CLASS_DECLARATION = $__133.CLASS_DECLARATION, EXPORT_DECLARATION = $__133.EXPORT_DECLARATION, EXPORT_MAPPING_LIST = $__133.EXPORT_MAPPING_LIST, EXPORT_SPECIFIER = $__133.EXPORT_SPECIFIER, FUNCTION_DECLARATION = $__133.FUNCTION_DECLARATION, IDENTIFIER_EXPRESSION = $__133.IDENTIFIER_EXPRESSION, IMPORT_DECLARATION = $__133.IMPORT_DECLARATION, MODULE_DECLARATION = $__133.MODULE_DECLARATION, MODULE_DEFINITION = $__133.MODULE_DEFINITION, MODULE_REQUIRE = $__133.MODULE_REQUIRE, VARIABLE_STATEMENT = $__133.VARIABLE_STATEMENT; 
  var $__134 = $src_syntax_TokenType_js, TokenType = $__134.TokenType; 
  var $__135 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__135.createArgumentList, createBindingIdentifier = $__135.createBindingIdentifier, createBlock = $__135.createBlock, createCallExpression = $__135.createCallExpression, createEmptyParameterList = $__135.createEmptyParameterList, createExpressionStatement = $__135.createExpressionStatement, createFunctionExpression = $__135.createFunctionExpression, createIdentifierExpression = $__135.createIdentifierExpression, createMemberExpression = $__135.createMemberExpression, createNullLiteral = $__135.createNullLiteral, createObjectCreate = $__135.createObjectCreate, createObjectLiteralExpression = $__135.createObjectLiteralExpression, createObjectPreventExtensions = $__135.createObjectPreventExtensions, createProgram = $__135.createProgram, createPropertyDescriptor = $__135.createPropertyDescriptor, createPropertyNameAssignment = $__135.createPropertyNameAssignment, createReturnStatement = $__135.createReturnStatement, createScopedExpression = $__135.createScopedExpression, createUseStrictDirective = $__135.createUseStrictDirective, createVariableDeclaration = $__135.createVariableDeclaration, createVariableDeclarationList = $__135.createVariableDeclarationList, createVariableStatement = $__135.createVariableStatement; 
  var $__136 = $src_util_util_js, createObject = $__136.createObject; 
  var $__137 = $src_semantics_util_js, hasUseStrict = $__137.hasUseStrict; 
  function toBindingIdentifier(tree) { 
    return new BindingIdentifier(tree.location, tree.identifierToken); 
  } 
  function getGetterExport(project, symbol) { 
    var name = symbol.name; 
    var tree = symbol.tree; 
    var returnExpression; 
    switch(tree.type) { 
      case EXPORT_SPECIFIER: 
        returnExpression = transformSpecifier(project, tree.lhs, symbol.relatedTree); 
        break; 

      case IDENTIFIER_EXPRESSION: 
        if(! symbol.relatedTree) { 
          returnExpression = tree; 
        } else { 
          returnExpression = transformSpecifier(project, tree.identifierToken, symbol.relatedTree); 
        } 
        break; 

      default: 
        returnExpression = createIdentifierExpression(name); 
        break; 

    } 
    var fun = createFunctionExpression(createEmptyParameterList(), createBlock(createReturnStatement(returnExpression))); 
    var descriptor = createPropertyDescriptor({ 
      get: fun, 
      enumerable: true 
    }); 
    return createPropertyNameAssignment(name, descriptor); 
  } 
  function transformSpecifier(project, identifierToken, moduleExpression) { 
    if(moduleExpression) { 
      var operand = new ModuleTransformer(project).transformAny(moduleExpression); 
      return createMemberExpression(operand, identifierToken); 
    } 
    return createIdentifierExpression(identifierToken); 
  } 
  var ModuleTransformer = traceur.runtime.createClass({ 
    constructor: function(project) { 
      traceur.runtime.superCall(this, ModuleTransformer, "constructor",[]); 
      this.project_ = project; 
    }, 
    transformModuleExpression: function(tree) { 
      var reference = tree.reference; 
      if(reference.type == MODULE_REQUIRE) { 
        return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, GET_MODULE_INSTANCE_BY_URL), createArgumentList(new LiteralExpression(null, reference.url))); 
      } 
      if(tree.identifiers.length == 0) return reference; 
      return createMemberExpression(reference, tree.identifiers); 
    }, 
    transformModuleSpecifier: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      return createVariableDeclaration(tree.identifier, expression); 
    }, 
    transformImportDeclaration: function(tree) { 
      var declarations = this.transformList(tree.importPathList); 
      return createVariableStatement(createVariableDeclarationList(TokenType.VAR, declarations)); 
    }, 
    transformImportBinding: function(tree) { 
      var importSpecifierSet; 
      if(tree.importSpecifierSet.type == IDENTIFIER_EXPRESSION) { 
        var field = new BindingElement(tree.location, createBindingIdentifier(tree.importSpecifierSet.identifierToken), null); 
        importSpecifierSet = new ObjectPattern(tree.location,[field]); 
      } else { 
        importSpecifierSet = this.transformAny(tree.importSpecifierSet); 
      } 
      var moduleExpression = this.transformAny(tree.moduleExpression); 
      return createVariableDeclaration(importSpecifierSet, moduleExpression); 
    }, 
    transformImportSpecifierSet: function(tree) { 
      var fields; 
      if(tree.specifiers.type === TokenType.STAR) { 
        var module = this.project_.getModuleForStarTree(tree); 
        var fields = module.getExports().map((function(exportSymbol) { 
          return new BindingElement(tree.location, createBindingIdentifier(exportSymbol.name), null); 
        })); 
      } else { 
        fields = this.transformList(tree.specifiers); 
      } 
      return new ObjectPattern(null, fields); 
    }, 
    transformImportSpecifier: function(tree) { 
      if(tree.rhs) { 
        var binding = new BindingIdentifier(tree.location, tree.rhs); 
        var bindingElement = new BindingElement(tree.location, binding, null); 
        return new ObjectPatternField(tree.location, tree.lhs, bindingElement); 
      } 
      return new BindingElement(tree.location, createBindingIdentifier(tree.lhs), null); 
    } 
  }, ParseTreeTransformer, true, true); 
  ModuleTransformer.transform = function(project, tree) { 
    var module = project.getRootModule(); 
    var useStrictCount = hasUseStrict(tree.programElements) ? 1: 0; 
    var elements = tree.programElements.map((function(element) { 
      switch(element.type) { 
        case MODULE_DEFINITION: 
          return transformDefinition(project, module, element, useStrictCount); 

        case MODULE_DECLARATION: 
          return transformDeclaration(project, module, element); 

        case IMPORT_DECLARATION: 
          return new ModuleTransformer(project).transformAny(element); 

        default: 
          return element; 

      } 
    })); 
    return new Program(tree.location, elements); 
  }; 
  ModuleTransformer.transformAsModule = function(project, module, tree) { 
    var callExpression = transformModuleElements(project, module, tree.programElements); 
    return createProgram([createExpressionStatement(callExpression)]); 
  }; 
  function transformModuleElements(project, module, elements, useStrictCount) { 
    var statements =[]; 
    useStrictCount = useStrictCount || 0; 
    if(! useStrictCount) statements.push(createUseStrictDirective()); 
    elements.forEach((function(element) { 
      switch(element.type) { 
        case MODULE_DECLARATION: 
          statements.push(transformDeclaration(project, module, element)); 
          break; 

        case MODULE_DEFINITION: 
          statements.push(transformDefinition(project, module, element, useStrictCount + 1)); 
          break; 

        case EXPORT_DECLARATION: 
          var declaration = element.declaration; 
          switch(declaration.type) { 
            case MODULE_DEFINITION: 
              statements.push(transformDefinition(project, module, declaration, useStrictCount + 1)); 
              break; 

            case MODULE_DECLARATION: 
              statements.push(transformDeclaration(project, module, declaration)); 
              break; 

            case EXPORT_MAPPING_LIST: 
              break; 

            case CLASS_DECLARATION: 
            case FUNCTION_DECLARATION: 
            case VARIABLE_STATEMENT: 
              statements.push(declaration); 
              break; 

            default: 
              throw new Error('unreachable'); 

          } 
          break; 

        case IMPORT_DECLARATION: 
          var transformer = new ModuleTransformer(project); 
          statements.push(transformer.transformAny(element)); 
          break; 

        default: 
          statements.push(element); 

      } 
    })); 
    var properties = module.getExports().map((function(exp) { 
      return getGetterExport(project, exp); 
    })); 
    var descriptors = createObjectLiteralExpression(properties); 
    statements.push(createReturnStatement(createObjectPreventExtensions(createObjectCreate(createNullLiteral(), descriptors)))); 
    return createScopedExpression(createBlock(statements)); 
  } 
  function transformDefinition(project, parent, tree, useStrictCount) { 
    var module = parent.getModule(tree.name.value); 
    var callExpression = transformModuleElements(project, module, tree.elements, useStrictCount); 
    return createVariableStatement(TokenType.VAR, module.name, callExpression); 
  } 
  function transformDeclaration(project, parent, tree) { 
    var transformer = new ModuleTransformer(project); 
    var list = tree.specifiers.map(transformer.transformAny, transformer); 
    var variableDeclarationList = createVariableDeclarationList(TokenType.VAR, list); 
    return createVariableStatement(variableDeclarationList); 
  } 
  return Object.preventExtensions(Object.create(null, { ModuleTransformer: { 
      get: function() { 
        return ModuleTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_AlphaRenamer_js =(function() { 
  "use strict"; 
  var $__138 = $src_syntax_trees_ParseTrees_js, Block = $__138.Block, Catch = $__138.Catch, FunctionDeclaration = $__138.FunctionDeclaration, IdentifierExpression = $__138.IdentifierExpression; 
  var $__139 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__139.ParseTreeTransformer; 
  var $__140 = $src_syntax_PredefinedName_js, ARGUMENTS = $__140.ARGUMENTS, THIS = $__140.THIS; 
  var $__141 = $src_codegeneration_ParseTreeFactory_js, createFunctionDeclaration = $__141.createFunctionDeclaration, createIdentifierExpression = $__141.createIdentifierExpression; 
  var $__142 = $src_util_util_js, createObject = $__142.createObject; 
  var $__143 = $src_semantics_VariableBinder_js, variablesInBlock = $__143.variablesInBlock, variablesInFunction = $__143.variablesInFunction; 
  var AlphaRenamer = traceur.runtime.createClass({ 
    constructor: function(oldName, newName) { 
      traceur.runtime.superCall(this, AlphaRenamer, "constructor",[]); 
      this.oldName_ = oldName; 
      this.newName_ = newName; 
    }, 
    transformBlock: function(tree) { 
      if(this.oldName_ in variablesInBlock(tree)) { 
        return tree; 
      } else { 
        return traceur.runtime.superCall(this, AlphaRenamer, "transformBlock",[tree]); 
      } 
    }, 
    transformIdentifierExpression: function(tree) { 
      if(this.oldName_ == tree.identifierToken.value) { 
        return createIdentifierExpression(this.newName_); 
      } else { 
        return tree; 
      } 
    }, 
    transformThisExpression: function(tree) { 
      if(this.oldName_ !== THIS) return tree; 
      return createIdentifierExpression(this.newName_); 
    }, 
    transformFunctionDeclaration: function(tree) { 
      if(this.oldName_ == tree.name) { 
        tree = createFunctionDeclaration(this.newName_, tree.formalParameterList, tree.functionBody); 
      } 
      var doNotRecurse = this.oldName_ === ARGUMENTS || this.oldName_ === THIS || this.oldName_ in variablesInFunction(tree); 
      if(doNotRecurse) return tree; else return traceur.runtime.superCall(this, AlphaRenamer, "transformFunctionDeclaration",[tree]); 
    }, 
    transformCatch: function(tree) { 
      if(! tree.binding.isPattern() && this.oldName_ === tree.binding.identifierToken.value) { 
        return tree; 
      } 
      return traceur.runtime.superCall(this, AlphaRenamer, "transformCatch",[tree]); 
    } 
  }, ParseTreeTransformer, true, true); 
  AlphaRenamer.rename = function(tree, oldName, newName) { 
    return new AlphaRenamer(oldName, newName).transformAny(tree); 
  }; 
  return Object.preventExtensions(Object.create(null, { AlphaRenamer: { 
      get: function() { 
        return AlphaRenamer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_FindVisitor_js =(function() { 
  "use strict"; 
  var $__144 = $src_syntax_ParseTreeVisitor_js, ParseTreeVisitor = $__144.ParseTreeVisitor; 
  var $__145 = $src_util_util_js, createObject = $__145.createObject; 
  var foundSentinel = { }; 
  var FindVisitor = traceur.runtime.createClass({ 
    constructor: function(tree, keepOnGoing) { 
      this.found_ = false; 
      this.keepOnGoing_ = keepOnGoing; 
      try { 
        this.visitAny(tree); 
      } catch(ex) { 
        if(ex !== foundSentinel) throw ex; 
      } 
    }, 
    get found() { 
      return this.found_; 
    }, 
    set found(v) { 
      if(v) { 
        this.found_ = true; 
        if(! this.keepOnGoing_) throw foundSentinel; 
      } 
    } 
  }, ParseTreeVisitor, true, true); 
  return Object.preventExtensions(Object.create(null, { FindVisitor: { 
      get: function() { 
        return FindVisitor; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_FindInFunctionScope_js =(function() { 
  "use strict"; 
  var $__146 = $src_codegeneration_FindVisitor_js, FindVisitor = $__146.FindVisitor; 
  var $__147 = $src_util_util_js, createObject = $__147.createObject; 
  function FindInFunctionScope(tree) { 
    FindVisitor.call(this, tree); 
  } 
  FindInFunctionScope.prototype = createObject(FindVisitor.prototype, { 
    visitFunctionDeclaration: function(tree) { }, 
    visitSetAccessor: function(tree) { }, 
    visitGetAccessor: function(tree) { }, 
    visitPropertyMethodAssignment: function(tree) { } 
  }); 
  return Object.preventExtensions(Object.create(null, { FindInFunctionScope: { 
      get: function() { 
        return FindInFunctionScope; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_TempVarTransformer_js =(function() { 
  "use strict"; 
  var $__148 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__148.ParseTreeTransformer; 
  var $__149 = $src_syntax_trees_ParseTrees_js, Program = $__149.Program; 
  var $__150 = $src_syntax_TokenType_js, TokenType = $__150.TokenType; 
  var $__151 = $src_codegeneration_ParseTreeFactory_js, createBlock = $__151.createBlock, createVariableDeclaration = $__151.createVariableDeclaration, createVariableDeclarationList = $__151.createVariableDeclarationList, createVariableStatement = $__151.createVariableStatement; 
  var $__152 = $src_util_util_js, createObject = $__152.createObject; 
  function transformStatements(self, statements) { 
    self.tempVarStack_.push([]); 
    var transformedStatements = self.transformList(statements); 
    var vars = self.tempVarStack_.pop(); 
    if(! vars.length) return transformedStatements; 
    var variableStatement = createVariableStatement(createVariableDeclarationList(TokenType.VAR, vars)); 
    transformedStatements =[variableStatement].concat(transformedStatements); 
    return transformedStatements; 
  } 
  function getVars(self) { 
    var vars = self.tempVarStack_[self.tempVarStack_.length - 1]; 
    if(! vars) throw new Error('Invalid use of addTempVar'); 
    return vars; 
  } 
  var TempVarTransformer = traceur.runtime.createClass({ 
    constructor: function(identifierGenerator) { 
      traceur.runtime.superCall(this, TempVarTransformer, "constructor",[]); 
      this.identifierGenerator = identifierGenerator; 
      this.tempVarStack_ =[]; 
    }, 
    transformProgram: function(tree) { 
      var elements = transformStatements(this, tree.programElements); 
      if(elements == tree.programElements) { 
        return tree; 
      } 
      return new Program(null, elements); 
    }, 
    transformFunctionBody: function(tree) { 
      var statements = transformStatements(this, tree.statements); 
      if(statements == tree.statements) return tree; 
      return createBlock(statements); 
    }, 
    addTempVar: function(opt_initializer) { 
      var vars = getVars(this); 
      var uid = this.identifierGenerator.generateUniqueIdentifier(); 
      vars.push(createVariableDeclaration(uid, opt_initializer || null)); 
      return uid; 
    }, 
    removeTempVar: function(name) { 
      var vars = getVars(this); 
      var index = - 1; 
      for(var i = 0; i < vars.length; i ++) { 
        if(vars[i].lvalue.identifierToken.value === name) { 
          index = i; 
          break; 
        } 
      } 
      if(index !== - 1) vars.splice(index, 1); 
    } 
  }, ParseTreeTransformer, true, true); 
  return Object.preventExtensions(Object.create(null, { TempVarTransformer: { 
      get: function() { 
        return TempVarTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_ComprehensionTransformer_js =(function() { 
  "use strict"; 
  var $__153 = $src_syntax_PredefinedName_js, ARGUMENTS = $__153.ARGUMENTS, THIS = $__153.THIS; 
  var $__154 = $src_codegeneration_AlphaRenamer_js, AlphaRenamer = $__154.AlphaRenamer; 
  var $__155 = $src_codegeneration_FindInFunctionScope_js, FindInFunctionScope = $__155.FindInFunctionScope; 
  var $__156 = $src_syntax_trees_ParseTrees_js, FunctionDeclaration = $__156.FunctionDeclaration; 
  var $__157 = $src_codegeneration_TempVarTransformer_js, TempVarTransformer = $__157.TempVarTransformer; 
  var $__158 = $src_syntax_TokenType_js, TokenType = $__158.TokenType; 
  var $__159 = $src_codegeneration_ParseTreeFactory_js, createBlock = $__159.createBlock, createCallExpression = $__159.createCallExpression, createEmptyParameterList = $__159.createEmptyParameterList, createForOfStatement = $__159.createForOfStatement, createIdentifierExpression = $__159.createIdentifierExpression, createIfStatement = $__159.createIfStatement, createParenExpression = $__159.createParenExpression, createThisExpression = $__159.createThisExpression, createVariableDeclarationList = $__159.createVariableDeclarationList; 
  var $__160 = $src_util_util_js, createObject = $__160.createObject; 
  function ThisFinder(tree) { 
    FindInFunctionScope.call(this, tree); 
  } 
  ThisFinder.prototype = createObject(FindInFunctionScope.prototype, { visitThisExpression: function(tree) { 
      this.found = true; 
    } }); 
  function ArgumentsFinder(tree) { 
    FindInFunctionScope.call(this, tree); 
  } 
  ArgumentsFinder.prototype = createObject(FindInFunctionScope.prototype, { visitIdentifierExpression: function(tree) { 
      if(tree.identifierToken.value === ARGUMENTS) this.found = true; 
    } }); 
  function ComprehensionTransformer(identifierGenerator) { 
    TempVarTransformer.call(this, identifierGenerator); 
  } 
  var proto = TempVarTransformer.prototype; 
  ComprehensionTransformer.prototype = createObject(proto, { transformComprehension: function(tree, statement, isGenerator, initStatement, returnStatement) { 
      var bindingKind = isGenerator ? TokenType.VAR: TokenType.LET; 
      if(tree.ifExpression) { 
        var ifExpression = this.transformAny(tree.ifExpression); 
        statement = createIfStatement(ifExpression, statement); 
      } 
      for(var i = tree.comprehensionForList.length - 1; i >= 0; i --) { 
        var item = tree.comprehensionForList[i]; 
        var left = this.transformAny(item.left); 
        var iterator = this.transformAny(item.iterator); 
        var initializer = createVariableDeclarationList(bindingKind, left, null); 
        statement = createForOfStatement(initializer, iterator, statement); 
      } 
      var argumentsFinder = new ArgumentsFinder(statement); 
      if(argumentsFinder.found) { 
        var tempVar = this.addTempVar(createIdentifierExpression(ARGUMENTS)); 
        statement = AlphaRenamer.rename(statement, ARGUMENTS, tempVar); 
      } 
      var thisFinder = new ThisFinder(statement); 
      if(thisFinder.found) { 
        var tempVar = this.addTempVar(createThisExpression()); 
        statement = AlphaRenamer.rename(statement, THIS, tempVar); 
      } 
      var statements =[]; 
      if(initStatement) statements.push(initStatement); 
      statements.push(statement); 
      if(returnStatement) statements.push(returnStatement); 
      var func = new FunctionDeclaration(null, null, isGenerator, createEmptyParameterList(), createBlock(statements)); 
      return createParenExpression(createCallExpression(func)); 
    } }); 
  return Object.preventExtensions(Object.create(null, { ComprehensionTransformer: { 
      get: function() { 
        return ComprehensionTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_ArrayComprehensionTransformer_js =(function() { 
  "use strict"; 
  var $__161 = $src_codegeneration_ComprehensionTransformer_js, ComprehensionTransformer = $__161.ComprehensionTransformer; 
  var $__162 = $src_syntax_TokenType_js, TokenType = $__162.TokenType; 
  var $__163 = $src_codegeneration_ParseTreeFactory_js, createArrayLiteralExpression = $__163.createArrayLiteralExpression, createAssignmentStatement = $__163.createAssignmentStatement, createIdentifierExpression = $__163.createIdentifierExpression, createMemberLookupExpression = $__163.createMemberLookupExpression, createNumberLiteral = $__163.createNumberLiteral, createPostfixExpression = $__163.createPostfixExpression, createReturnStatement = $__163.createReturnStatement, createVariableDeclaration = $__163.createVariableDeclaration, createVariableDeclarationList = $__163.createVariableDeclarationList, createVariableStatement = $__163.createVariableStatement; 
  var $__164 = $src_util_util_js, createObject = $__164.createObject; 
  function ArrayComprehensionTransformer(identifierGenerator) { 
    ComprehensionTransformer.call(this, identifierGenerator); 
  } 
  ArrayComprehensionTransformer.transformTree = function(identifierGenerator, tree) { 
    return new ArrayComprehensionTransformer(identifierGenerator).transformAny(tree); 
  }; 
  ArrayComprehensionTransformer.prototype = createObject(ComprehensionTransformer.prototype, { transformArrayComprehension: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      var indexName = this.identifierGenerator.generateUniqueIdentifier(); 
      var resultName = this.identifierGenerator.generateUniqueIdentifier(); 
      var resultIdentifier = createIdentifierExpression(resultName); 
      var initStatement = createVariableStatement(createVariableDeclarationList(TokenType.VAR,[createVariableDeclaration(indexName, createNumberLiteral(0)), createVariableDeclaration(resultName, createArrayLiteralExpression([]))])); 
      var statement = createAssignmentStatement(createMemberLookupExpression(resultIdentifier, createPostfixExpression(createIdentifierExpression(indexName), TokenType.PLUS_PLUS)), expression); 
      var returnStatement = createReturnStatement(resultIdentifier); 
      var isGenerator = false; 
      return this.transformComprehension(tree, statement, isGenerator, initStatement, returnStatement); 
    } }); 
  return Object.preventExtensions(Object.create(null, { ArrayComprehensionTransformer: { 
      get: function() { 
        return ArrayComprehensionTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_ArrowFunctionTransformer_js =(function() { 
  "use strict"; 
  var $__165 = $src_syntax_PredefinedName_js, BIND = $__165.BIND; 
  var $__166 = $src_codegeneration_FindInFunctionScope_js, FindInFunctionScope = $__166.FindInFunctionScope; 
  var $__167 = $src_syntax_trees_ParseTrees_js, FormalParameterList = $__167.FormalParameterList, ThisExpression = $__167.ThisExpression; 
  var $__168 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__168.ParseTreeTransformer; 
  var $__169 = $src_syntax_trees_ParseTreeType_js, BLOCK = $__169.BLOCK; 
  var $__170 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__170.createArgumentList, createBlock = $__170.createBlock, createCallExpression = $__170.createCallExpression, createFunctionExpression = $__170.createFunctionExpression, createMemberExpression = $__170.createMemberExpression, createParenExpression = $__170.createParenExpression, createReturnStatement = $__170.createReturnStatement, createThisExpression = $__170.createThisExpression; 
  var $__171 = $src_util_util_js, createObject = $__171.createObject; 
  var ThisFinder = traceur.runtime.createClass({ 
    visitThisExpression: function(tree) { 
      this.found = true; 
    }, 
    constructor: function() { 
      var args = Array.prototype.slice.call(arguments, 0); 
      traceur.runtime.superCall(this, ThisFinder, "constructor", $__465(args)); 
    } 
  }, FindInFunctionScope, false, true); 
  var ArrowFunctionTransformer = traceur.runtime.createClass({ 
    constructor: function(reporter) { 
      traceur.runtime.superCall(this, ArrowFunctionTransformer, "constructor",[]); 
      this.reporter_ = reporter; 
    }, 
    transformArrowFunctionExpression: function(tree) { 
      var parameters; 
      if(tree.formalParameters) { 
        parameters = this.transformAny(tree.formalParameters).parameters; 
      } else { 
        parameters =[]; 
      } 
      var functionBody = this.transformAny(tree.functionBody); 
      if(functionBody.type != BLOCK) { 
        functionBody = createBlock(createReturnStatement(functionBody)); 
      } 
      var result = createParenExpression(createFunctionExpression(new FormalParameterList(null, parameters), functionBody)); 
      var finder = new ThisFinder(functionBody); 
      if(finder.found) { 
        return createCallExpression(createMemberExpression(result, BIND), createArgumentList(createThisExpression())); 
      } 
      return result; 
    } 
  }, ParseTreeTransformer, true, true); 
  ArrowFunctionTransformer.transformTree = function(reporter, tree) { 
    return new ArrowFunctionTransformer(reporter).transformAny(tree); 
  }; 
  return Object.preventExtensions(Object.create(null, { ArrowFunctionTransformer: { 
      get: function() { 
        return ArrowFunctionTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_OperatorExpander_js =(function() { 
  "use strict"; 
  var $__172 = $src_syntax_trees_ParseTreeType_js, IDENTIFIER_EXPRESSION = $__172.IDENTIFIER_EXPRESSION, SUPER_EXPRESSION = $__172.SUPER_EXPRESSION; 
  var $__173 = $src_syntax_TokenType_js, TokenType = $__173.TokenType; 
  var $__174 = $src_codegeneration_ParseTreeFactory_js, createAssignmentExpression = $__174.createAssignmentExpression, createBinaryOperator = $__174.createBinaryOperator, createCommaExpression = $__174.createCommaExpression, createIdentifierExpression = $__174.createIdentifierExpression, createMemberExpression = $__174.createMemberExpression, createMemberLookupExpression = $__174.createMemberLookupExpression, createOperatorToken = $__174.createOperatorToken, createParenExpression = $__174.createParenExpression; 
  function getBinaryOperator(type) { 
    switch(type) { 
      case TokenType.STAR_EQUAL: 
        return TokenType.STAR; 

      case TokenType.SLASH_EQUAL: 
        return TokenType.SLASH; 

      case TokenType.PERCENT_EQUAL: 
        return TokenType.PERCENT; 

      case TokenType.PLUS_EQUAL: 
        return TokenType.PLUS; 

      case TokenType.MINUS_EQUAL: 
        return TokenType.MINUS; 

      case TokenType.LEFT_SHIFT_EQUAL: 
        return TokenType.LEFT_SHIFT; 

      case TokenType.RIGHT_SHIFT_EQUAL: 
        return TokenType.RIGHT_SHIFT; 

      case TokenType.UNSIGNED_RIGHT_SHIFT_EQUAL: 
        return TokenType.UNSIGNED_RIGHT_SHIFT; 

      case TokenType.AMPERSAND_EQUAL: 
        return TokenType.AMPERSAND; 

      case TokenType.CARET_EQUAL: 
        return TokenType.CARET; 

      case TokenType.BAR_EQUAL: 
        return TokenType.BAR; 

      default: 
        throw Error('unreachable'); 

    } 
  } 
  function expandMemberLookupExpression(tree, tempVarTransformer) { 
    var tmp1; 
    var expressions =[]; 
    if(tree.left.operand.type == SUPER_EXPRESSION || tree.left.operand.type == IDENTIFIER_EXPRESSION) { 
      tmp1 = tree.left.operand; 
    } else { 
      tmp1 = createIdentifierExpression(tempVarTransformer.addTempVar()); 
      expressions.push(createAssignmentExpression(tmp1, tree.left.operand)); 
    } 
    var tmp2 = createIdentifierExpression(tempVarTransformer.addTempVar()); 
    expressions.push(createAssignmentExpression(tmp2, tree.left.memberExpression), createAssignmentExpression(createMemberLookupExpression(tmp1, tmp2), createBinaryOperator(createMemberLookupExpression(tmp1, tmp2), createOperatorToken(getBinaryOperator(tree.operator.type)), tree.right))); 
    return createParenExpression(createCommaExpression(expressions)); 
  } 
  function expandMemberExpression(tree, tempVarTransformer) { 
    var tmp; 
    var expressions =[]; 
    if(tree.left.operand.type == SUPER_EXPRESSION || tree.left.operand.type == IDENTIFIER_EXPRESSION) { 
      tmp = tree.left.operand; 
    } else { 
      tmp = createIdentifierExpression(tempVarTransformer.addTempVar()); 
      expressions.push(createAssignmentExpression(tmp, tree.left.operand)); 
    } 
    expressions.push(createAssignmentExpression(createMemberExpression(tmp, tree.left.memberName), createBinaryOperator(createMemberExpression(tmp, tree.left.memberName), createOperatorToken(getBinaryOperator(tree.operator.type)), tree.right))); 
    return createParenExpression(createCommaExpression(expressions)); 
  } 
  return Object.preventExtensions(Object.create(null, { 
    expandMemberLookupExpression: { 
      get: function() { 
        return expandMemberLookupExpression; 
      }, 
      enumerable: true 
    }, 
    expandMemberExpression: { 
      get: function() { 
        return expandMemberExpression; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var $src_codegeneration_AtNameMemberTransformer_js =(function() { 
  "use strict"; 
  var $__175 = $src_syntax_trees_ParseTrees_js, AtNameExpression = $__175.AtNameExpression; 
  var $__176 = $src_syntax_PredefinedName_js, DELETE_PROPERTY = $__176.DELETE_PROPERTY, GET_PROPERTY = $__176.GET_PROPERTY, RUNTIME = $__176.RUNTIME, SET_PROPERTY = $__176.SET_PROPERTY, TRACEUR = $__176.TRACEUR; 
  var $__177 = $src_syntax_trees_ParseTreeType_js, MEMBER_EXPRESSION = $__177.MEMBER_EXPRESSION; 
  var $__178 = $src_codegeneration_TempVarTransformer_js, TempVarTransformer = $__178.TempVarTransformer; 
  var $__179 = $src_syntax_TokenType_js, TokenType = $__179.TokenType; 
  var $__180 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__180.createArgumentList, createAssignmentExpression = $__180.createAssignmentExpression, createCallCall = $__180.createCallCall, createCallExpression = $__180.createCallExpression, createCommaExpression = $__180.createCommaExpression, createIdentifierExpression = $__180.createIdentifierExpression, createMemberExpression = $__180.createMemberExpression, createParenExpression = $__180.createParenExpression; 
  var $__181 = $src_util_util_js, createObject = $__181.createObject; 
  var $__182 = $src_codegeneration_OperatorExpander_js, expandMemberExpression = $__182.expandMemberExpression; 
  function AtNameMemberTransformer(identifierGenerator) { 
    TempVarTransformer.call(this, identifierGenerator); 
  } 
  AtNameMemberTransformer.transformTree = function(identifierGenerator, tree) { 
    return new AtNameMemberTransformer(identifierGenerator).transformAny(tree); 
  }; 
  var base = TempVarTransformer.prototype; 
  AtNameMemberTransformer.prototype = createObject(base, { 
    transformBinaryOperator: function(tree) { 
      if(tree.left.type === MEMBER_EXPRESSION && tree.left.memberName.type === TokenType.AT_NAME && tree.operator.isAssignmentOperator()) { 
        if(tree.operator.type !== TokenType.EQUAL) { 
          tree = expandMemberExpression(tree, this); 
          return this.transformAny(tree); 
        } 
        var operand = this.transformAny(tree.left.operand); 
        var memberName = tree.left.memberName; 
        var atNameExpression = new AtNameExpression(memberName.location, memberName); 
        var value = this.transformAny(tree.right); 
        return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, SET_PROPERTY), createArgumentList(operand, atNameExpression, value)); 
      } 
      return base.transformBinaryOperator.call(this, tree); 
    }, 
    transformCallExpression: function(tree) { 
      if(tree.operand.type !== MEMBER_EXPRESSION || tree.operand.memberName.type !== TokenType.AT_NAME) return base.transformCallExpression.call(this, tree); 
      var operand = this.transformAny(tree.operand.operand); 
      var memberName = tree.operand.memberName; 
      var ident = createIdentifierExpression(this.addTempVar()); 
      var elements = tree.args.args.map(this.transformAny, this); 
      var atNameExpression = new AtNameExpression(memberName.location, memberName); 
      var callExpr = createCallCall(createCallExpression(createMemberExpression(TRACEUR, RUNTIME, GET_PROPERTY), createArgumentList(ident, atNameExpression)), ident, elements); 
      var expressions =[createAssignmentExpression(ident, operand), callExpr]; 
      return createParenExpression(createCommaExpression(expressions)); 
    }, 
    transformMemberExpression: function(tree) { 
      if(tree.memberName.type !== TokenType.AT_NAME) return base.transformMemberExpression.call(this, tree); 
      var atNameExpression = new AtNameExpression(tree.memberName.location, tree.memberName); 
      return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, GET_PROPERTY), createArgumentList(tree.operand, atNameExpression)); 
    }, 
    transformUnaryExpression: function(tree) { 
      if(tree.operator.type !== TokenType.DELETE || tree.operand.type !== MEMBER_EXPRESSION || tree.operand.memberName.type !== TokenType.AT_NAME) { 
        return base.transformUnaryExpression.call(this, tree); 
      } 
      var operand = this.transformAny(tree.operand.operand); 
      var memberName = tree.operand.memberName; 
      var atNameExpression = new AtNameExpression(memberName.location, memberName); 
      return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, DELETE_PROPERTY), createArgumentList(operand, atNameExpression)); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { AtNameMemberTransformer: { 
      get: function() { 
        return AtNameMemberTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_BlockBindingTransformer_js =(function() { 
  "use strict"; 
  var $__183 = $src_codegeneration_AlphaRenamer_js, AlphaRenamer = $__183.AlphaRenamer; 
  var $__184 = $src_syntax_trees_ParseTreeType_js, BINDING_IDENTIFIER = $__184.BINDING_IDENTIFIER, BLOCK = $__184.BLOCK, FUNCTION_DECLARATION = $__184.FUNCTION_DECLARATION, VARIABLE_DECLARATION_LIST = $__184.VARIABLE_DECLARATION_LIST; 
  var $__185 = $src_syntax_trees_ParseTrees_js, Block = $__185.Block, ClassDeclaration = $__185.ClassDeclaration, ForInStatement = $__185.ForInStatement, ForStatement = $__185.ForStatement, FunctionDeclaration = $__185.FunctionDeclaration, GetAccessor = $__185.GetAccessor, Program = $__185.Program, SetAccessor = $__185.SetAccessor, VariableDeclarationList = $__185.VariableDeclarationList, VariableDeclaration = $__185.VariableDeclaration, VariableStatement = $__185.VariableStatement; 
  var $__186 = $src_syntax_trees_NullTree_js, NullTree = $__186.NullTree; 
  var $__187 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__187.ParseTreeTransformer; 
  var $__188 = $src_syntax_TokenType_js, TokenType = $__188.TokenType; 
  var $__189 = $src_codegeneration_ParseTreeFactory_js, createAssignmentExpression = $__189.createAssignmentExpression, createBindingIdentifier = $__189.createBindingIdentifier, createBlock = $__189.createBlock, createCatch = $__189.createCatch, createEmptyStatement = $__189.createEmptyStatement, createExpressionStatement = $__189.createExpressionStatement, createFinally = $__189.createFinally, createForInStatement = $__189.createForInStatement, createForStatement = $__189.createForStatement, createFunctionDeclaration = $__189.createFunctionDeclaration, createGetAccessor = $__189.createGetAccessor, createIdentifierExpression = $__189.createIdentifierExpression, createIdentifierToken = $__189.createIdentifierToken, createSetAccessor = $__189.createSetAccessor, createThrowStatement = $__189.createThrowStatement, createTryStatement = $__189.createTryStatement, createUndefinedExpression = $__189.createUndefinedExpression, createVariableDeclaration = $__189.createVariableDeclaration, createVariableDeclarationList = $__189.createVariableDeclarationList, createVariableStatement = $__189.createVariableStatement; 
  var $__190 = $src_util_util_js, createObject = $__190.createObject; 
  var CONST = TokenType.CONST; 
  var LET = TokenType.LET; 
  var VAR = TokenType.VAR; 
  var ScopeType = { 
    PROGRAM: 'PROGRAM', 
    FUNCTION: 'FUNCTION', 
    BLOCK: 'BLOCK' 
  }; 
  var Scope = traceur.runtime.createClass({ 
    constructor: function(parent, type) { 
      this.parent = parent; 
      this.type = type; 
      this.blockVariables = null; 
    }, 
    addBlockScopedVariable: function(value) { 
      if(! this.blockVariables) { 
        this.blockVariables = Object.create(null); 
      } 
      this.blockVariables[value]= true; 
    } 
  }, null, true, false); 
  ; 
  function Rename(oldName, newName) { 
    this.oldName = oldName; 
    this.newName = newName; 
  } 
  function renameAll(renames, tree) { 
    renames.forEach((function(rename) { 
      tree = AlphaRenamer.rename(tree, rename.oldName, rename.newName); 
    })); 
    return tree; 
  } 
  function toBlock(statement) { 
    return statement.type == BLOCK ? statement: createBlock(statement); 
  } 
  var BlockBindingTransformer = traceur.runtime.createClass({ 
    constructor: function(stateAllocator) { 
      traceur.runtime.superCall(this, BlockBindingTransformer, "constructor",[]); 
      this.scope_ = null; 
    }, 
    createProgramScope_: function() { 
      return new Scope(this.scope_, ScopeType.PROGRAM); 
    }, 
    createFunctionScope_: function() { 
      if(this.scope_ == null) { 
        throw new Error('Top level function scope found.'); 
      } 
      return new Scope(this.scope_, ScopeType.FUNCTION); 
    }, 
    createBlockScope_: function() { 
      if(this.scope_ == null) { 
        throw new Error('Top level block scope found.'); 
      } 
      return new Scope(this.scope_, ScopeType.BLOCK); 
    }, 
    push_: function(scope) { 
      this.scope_ = scope; 
      return scope; 
    }, 
    pop_: function(scope) { 
      if(this.scope_ != scope) { 
        throw new Error('BlockBindingTransformer scope mismatch'); 
      } 
      this.scope_ = scope.parent; 
    }, 
    transformBlock: function(tree) { 
      var scope = this.push_(this.createBlockScope_()); 
      var statements = tree.statements.map((function(statement) { 
        switch(statement.type) { 
          case FUNCTION_DECLARATION: 
            return this.transformFunctionDeclarationStatement_(statement); 

          default: 
            return this.transformAny(statement); 

        } 
      }).bind(this)); 
      if(scope.blockVariables != null) { 
        tree = toBlock(this.rewriteAsCatch_(scope.blockVariables, createBlock(statements))); 
      } else if(statements != tree.statements) { 
        tree = createBlock(statements); 
      } 
      this.pop_(scope); 
      return tree; 
    }, 
    rewriteAsCatch_: function(blockVariables, statement) { 
      for(var variable in blockVariables) { 
        statement = createTryStatement(createBlock(createThrowStatement(createUndefinedExpression())), createCatch(createBindingIdentifier(variable), toBlock(statement)), null); 
      } 
      return statement; 
    }, 
    transformClassDeclaration: function(tree) { 
      throw new Error('ClassDeclaration should be transformed away.'); 
    }, 
    transformForInStatement: function(tree) { 
      var treeBody = tree.body; 
      var initializer; 
      if(tree.initializer != null && tree.initializer.type == VARIABLE_DECLARATION_LIST) { 
        var variables = tree.initializer; 
        if(variables.declarations.length != 1) { 
          throw new Error('for .. in has != 1 variables'); 
        } 
        var variable = variables.declarations[0]; 
        var variableName = this.getVariableName_(variable); 
        switch(variables.declarationType) { 
          case LET: 
          case CONST: 
            { 
              if(variable.initializer != null) { 
                throw new Error('const/let in for-in may not have an initializer'); 
              } 
              initializer = createVariableDeclarationList(TokenType.VAR,("$" + variableName), null); 
              treeBody = this.prependToBlock_(createVariableStatement(TokenType.LET, variableName, createIdentifierExpression(("$" + variableName))), treeBody); 
              break; 
            } 

          case VAR: 
            initializer = this.transformVariables_(variables); 
            break; 

          default: 
            throw new Error('Unreachable.'); 

        } 
      } else { 
        initializer = this.transformAny(tree.initializer); 
      } 
      var result = tree; 
      var collection = this.transformAny(tree.collection); 
      var body = this.transformAny(treeBody); 
      if(initializer != tree.initializer || collection != tree.collection || body != tree.body) { 
        result = createForInStatement(initializer, collection, body); 
      } 
      return result; 
    }, 
    prependToBlock_: function(statement, body) { 
      if(body.type == BLOCK) { 
        var block = body; 
        var list =[]; 
        list.push(statement); 
        list.push.apply(list, block.statements); 
        return createBlock(list); 
      } else { 
        return createBlock(statement, body); 
      } 
    }, 
    transformForStatement: function(tree) { 
      var initializer; 
      if(tree.initializer != null && tree.initializer.type == VARIABLE_DECLARATION_LIST) { 
        var variables = tree.initializer; 
        switch(variables.declarationType) { 
          case LET: 
          case CONST: 
            return this.transformForLet_(tree, variables); 

          case VAR: 
            initializer = this.transformVariables_(variables); 
            break; 

          default: 
            throw new Error('Reached unreachable.'); 

        } 
      } else { 
        initializer = this.transformAny(tree.initializer); 
      } 
      var condition = this.transformAny(tree.condition); 
      var increment = this.transformAny(tree.increment); 
      var body = this.transformAny(tree.body); 
      var result = tree; 
      if(initializer != tree.initializer || condition != tree.condition || increment != tree.increment || body != tree.body) { 
        result = createForStatement(initializer, condition, increment, body); 
      } 
      return result; 
    }, 
    transformForLet_: function(tree, variables) { 
      var copyFwd =[]; 
      var copyBak =[]; 
      var hoisted =[]; 
      var renames =[]; 
      variables.declarations.forEach((function(variable) { 
        var variableName = this.getVariableName_(variable); 
        var hoistedName =("$" + variableName); 
        var initializer = renameAll(renames, variable.initializer); 
        hoisted.push(createVariableDeclaration(hoistedName, initializer)); 
        copyFwd.push(createVariableDeclaration(variableName, createIdentifierExpression(hoistedName))); 
        copyBak.push(createExpressionStatement(createAssignmentExpression(createIdentifierExpression(hoistedName), createIdentifierExpression(variableName)))); 
        renames.push(new Rename(variableName, hoistedName)); 
      }).bind(this)); 
      var condition = renameAll(renames, tree.condition); 
      var increment = renameAll(renames, tree.increment); 
      var transformedForLoop = createBlock(createVariableStatement(createVariableDeclarationList(TokenType.LET, hoisted)), createForStatement(new NullTree(), condition, increment, createBlock(createVariableStatement(createVariableDeclarationList(TokenType.LET, copyFwd)), createTryStatement(tree.body, new NullTree(), createFinally(createBlock(copyBak)))))); 
      return this.transformAny(transformedForLoop); 
    }, 
    transformFunctionDeclarationStatement_: function(tree) { 
      var body = this.transformFunctionBody(tree.functionBody); 
      if(tree.name != null && this.scope_.type == ScopeType.BLOCK) { 
        this.scope_.addBlockScopedVariable(tree.name.identifierToken.value); 
        return createExpressionStatement(createAssignmentExpression(createIdentifierExpression(tree.name.identifierToken), createFunctionDeclaration(tree.name, tree.formalParameterList, body))); 
      } else if(body != tree.functionBody) { 
        return createFunctionDeclaration(tree.name, tree.formalParameterList, body); 
      } else { 
        return tree; 
      } 
    }, 
    transformProgram: function(tree) { 
      var scope = this.push_(this.createProgramScope_()); 
      var result = traceur.runtime.superCall(this, BlockBindingTransformer, "transformProgram",[tree]); 
      this.pop_(scope); 
      return result; 
    }, 
    transformVariableDeclaration: function(tree) { 
      throw new Error('Should never see variable declaration tree.'); 
    }, 
    transformVariableDeclarationList: function(tree) { 
      throw new Error('Should never see variable declaration list.'); 
    }, 
    transformVariableStatement: function(tree) { 
      if(this.scope_.type == ScopeType.BLOCK) { 
        switch(tree.declarations.declarationType) { 
          case CONST: 
          case LET: 
            return this.transformBlockVariables_(tree.declarations); 

          default: 
            break; 

        } 
      } 
      var variables = this.transformVariables_(tree.declarations); 
      if(variables != tree.declarations) { 
        tree = createVariableStatement(variables); 
      } 
      return tree; 
    }, 
    transformBlockVariables_: function(tree) { 
      var variables = tree.declarations; 
      var comma =[]; 
      variables.forEach((function(variable) { 
        switch(tree.declarationType) { 
          case LET: 
          case CONST: 
            break; 

          default: 
            throw new Error('Only let/const allowed here.'); 

        } 
        var variableName = this.getVariableName_(variable); 
        this.scope_.addBlockScopedVariable(variableName); 
        var initializer = this.transformAny(variable.initializer); 
        if(initializer != null) { 
          comma.push(createAssignmentExpression(createIdentifierExpression(variableName), initializer)); 
        } 
      }).bind(this)); 
      switch(comma.length) { 
        case 0: 
          return createEmptyStatement(); 

        case 1: 
          return createExpressionStatement(comma[0]); 

        default: 
          for(var i = 0; i < comma.length; i ++) { 
            comma[i]= createExpressionStatement(comma[i]); 
          } 
          return createBlock(comma); 

      } 
    }, 
    transformVariables_: function(tree) { 
      var variables = tree.declarations; 
      var transformed = null; 
      for(var index = 0; index < variables.length; index ++) { 
        var variable = variables[index]; 
        var variableName = this.getVariableName_(variable); 
        var initializer = this.transformAny(variable.initializer); 
        if(transformed != null || initializer != variable.initializer) { 
          if(transformed == null) { 
            transformed =[]; 
            transformed.push.apply(transformed, variables.slice(0, index)); 
          } 
          transformed.push(createVariableDeclaration(createIdentifierToken(variableName), initializer)); 
        } 
      } 
      if(transformed != null || tree.declarationType != TokenType.VAR) { 
        var declarations = transformed != null ? transformed: tree.declarations; 
        var declarationType = tree.declarationType != TokenType.VAR ? TokenType.VAR: tree.declarationType; 
        tree = createVariableDeclarationList(declarationType, declarations); 
      } 
      return tree; 
    }, 
    transformFunctionBody: function(body) { 
      var scope = this.push_(this.createFunctionScope_()); 
      body = this.transformBlockStatements_(body); 
      this.pop_(scope); 
      return body; 
    }, 
    transformBlockStatements_: function(tree) { 
      var statements = this.transformSourceElements(tree.statements); 
      if(this.scope_.blockVariables != null) { 
        tree = toBlock(this.rewriteAsCatch_(this.scope_.blockVariables, createBlock(statements))); 
      } else if(statements != tree.statements) { 
        tree = createBlock(statements); 
      } 
      return tree; 
    }, 
    getVariableName_: function(variable) { 
      var lvalue = variable.lvalue; 
      if(lvalue.type == BINDING_IDENTIFIER) { 
        return lvalue.identifierToken.value; 
      } 
      throw new Error('Unexpected destructuring declaration found.'); 
    } 
  }, ParseTreeTransformer, true, true); 
  BlockBindingTransformer.transformTree = function(tree) { 
    return new BlockBindingTransformer().transformAny(tree); 
  }; 
  return Object.preventExtensions(Object.create(null, { BlockBindingTransformer: { 
      get: function() { 
        return BlockBindingTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_CascadeExpressionTransformer_js =(function() { 
  "use strict"; 
  var $__191 = $src_syntax_trees_ParseTreeType_js, BINARY_OPERATOR = $__191.BINARY_OPERATOR, CALL_EXPRESSION = $__191.CALL_EXPRESSION, CALL_EXPRESSION = $__191.CALL_EXPRESSION, CASCADE_EXPRESSION = $__191.CASCADE_EXPRESSION, CASCADE_EXPRESSION = $__191.CASCADE_EXPRESSION, IDENTIFIER_EXPRESSION = $__191.IDENTIFIER_EXPRESSION, MEMBER_EXPRESSION = $__191.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__191.MEMBER_LOOKUP_EXPRESSION; 
  var $__192 = $src_syntax_trees_ParseTrees_js, BinaryOperator = $__192.BinaryOperator; 
  var $__193 = $src_codegeneration_TempVarTransformer_js, TempVarTransformer = $__193.TempVarTransformer; 
  var $__194 = $src_codegeneration_ParseTreeFactory_js, createAssignmentExpression = $__194.createAssignmentExpression, createBinaryOperator = $__194.createBinaryOperator, createCallExpression = $__194.createCallExpression, createCascadeExpression = $__194.createCascadeExpression, createCommaExpression = $__194.createCommaExpression, createIdentifierExpression = $__194.createIdentifierExpression, createMemberExpression = $__194.createMemberExpression, createMemberLookupExpression = $__194.createMemberLookupExpression, createParenExpression = $__194.createParenExpression; 
  var $__195 = $src_util_util_js, createObject = $__195.createObject; 
  function prependMemberExpression(name, rest) { 
    switch(rest.type) { 
      case MEMBER_EXPRESSION: 
        return createMemberExpression(prependMemberExpression(name, rest.operand), rest.memberName); 

      case MEMBER_LOOKUP_EXPRESSION: 
        return createMemberLookupExpression(prependMemberExpression(name, rest.operand), rest.memberExpression); 

      case IDENTIFIER_EXPRESSION: 
        return createMemberExpression(name, rest.identifierToken); 

      case CALL_EXPRESSION: 
        return createCallExpression(prependMemberExpression(name, rest.operand), rest.args); 

      case CASCADE_EXPRESSION: 
        return createCascadeExpression(prependMemberExpression(name, rest.operand), rest.expressions); 

      default: 
        throw Error('Not reachable'); 

    } 
  } 
  function CascadeExpressionTransformer(identifierGenerator, reporter) { 
    TempVarTransformer.call(this, identifierGenerator); 
    this.reporter_ = reporter; 
  } 
  CascadeExpressionTransformer.transformTree = function(identifierGenerator, reporter, tree) { 
    return new CascadeExpressionTransformer(identifierGenerator, reporter).transformAny(tree); 
  }; 
  var proto = TempVarTransformer.prototype; 
  CascadeExpressionTransformer.prototype = createObject(proto, { 
    transformCascadeExpression: function(tree) { 
      var operand = this.transformAny(tree.operand); 
      var ident = createIdentifierExpression(this.addTempVar()); 
      var expressions = this.transformList(tree.expressions.map(this.desugarExpression_.bind(this, ident))); 
      expressions.unshift(createAssignmentExpression(ident, operand)); 
      expressions.push(ident); 
      return createParenExpression(createCommaExpression(expressions)); 
    }, 
    desugarExpression_: function(ident, tree) { 
      switch(tree.type) { 
        case BINARY_OPERATOR: 
          return this.desugarBinaryExpression_(ident, tree); 

        case CALL_EXPRESSION: 
          return this.desugarCallExpression_(ident, tree); 

        case CASCADE_EXPRESSION: 
          return this.desugarCascadeExpression_(ident, tree); 

        default: 
          this.reporter_.reportError(tree.location.start, 'Unsupported expression type in cascade: %s', tree.type); 

      } 
    }, 
    desugarBinaryExpression_: function(ident, tree) { 
      return createBinaryOperator(prependMemberExpression(ident, tree.left), tree.operator, tree.right); 
    }, 
    desugarCallExpression_: function(ident, tree) { 
      var newOperand = prependMemberExpression(ident, tree.operand); 
      return createCallExpression(newOperand, tree.args); 
    }, 
    desugarCascadeExpression_: function(ident, tree) { 
      var newOperand = prependMemberExpression(ident, tree.operand); 
      return createCascadeExpression(newOperand, tree.expressions); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { CascadeExpressionTransformer: { 
      get: function() { 
        return CascadeExpressionTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_SuperTransformer_js =(function() { 
  "use strict"; 
  var $__196 = $src_syntax_trees_ParseTreeType_js, MEMBER_EXPRESSION = $__196.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__196.MEMBER_LOOKUP_EXPRESSION, SUPER_EXPRESSION = $__196.SUPER_EXPRESSION; 
  var $__197 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__197.ParseTreeTransformer; 
  var $__198 = $src_syntax_PredefinedName_js, RUNTIME = $__198.RUNTIME, SUPER_CALL = $__198.SUPER_CALL, SUPER_GET = $__198.SUPER_GET, SUPER_SET = $__198.SUPER_SET, TRACEUR = $__198.TRACEUR; 
  var $__199 = $src_syntax_TokenType_js, TokenType = $__199.TokenType; 
  var $__200 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__200.createArgumentList, createArrayLiteralExpression = $__200.createArrayLiteralExpression, createCallExpression = $__200.createCallExpression, createMemberExpression = $__200.createMemberExpression, createStringLiteral = $__200.createStringLiteral, createThisExpression = $__200.createThisExpression; 
  var $__201 = $src_util_util_js, createObject = $__201.createObject; 
  var $__202 = $src_codegeneration_OperatorExpander_js, expandMemberExpression = $__202.expandMemberExpression, expandMemberLookupExpression = $__202.expandMemberLookupExpression; 
  var SuperTransformer = traceur.runtime.createClass({ 
    constructor: function(tempVarTransformer, reporter, className, methodTree) { 
      traceur.runtime.superCall(this, SuperTransformer, "constructor",[]); 
      this.tempVarTransformer_ = tempVarTransformer; 
      this.className_ = className; 
      this.method_ = methodTree; 
      this.reporter_ = reporter; 
      this.superFound_ = false; 
    }, 
    get hasSuper() { 
      return this.superFound_; 
    }, 
    transformFunctionDeclaration: function(tree) { 
      return tree; 
    }, 
    transformGetAccessor: function(tree) { 
      return tree; 
    }, 
    transformSetAccessor: function(tree) { 
      return tree; 
    }, 
    transformPropertyMethodAssignMent: function(tree) { 
      return tree; 
    }, 
    transformCallExpression: function(tree) { 
      if(this.method_ && tree.operand.type == SUPER_EXPRESSION) { 
        this.superFound_ = true; 
        var methodName = this.method_.name.value; 
        return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, SUPER_CALL), createArgumentList(createThisExpression(), this.className_, createStringLiteral(methodName), createArrayLiteralExpression(tree.args.args))); 
      } 
      if((tree.operand.type == MEMBER_EXPRESSION || tree.operand.type == MEMBER_LOOKUP_EXPRESSION) && tree.operand.operand.type == SUPER_EXPRESSION) { 
        this.superFound_ = true; 
        var nameExpression; 
        if(tree.operand.type == MEMBER_EXPRESSION) { 
          nameExpression = createStringLiteral(tree.operand.memberName.value); 
        } else { 
          nameExpression = tree.operand.memberExpression; 
        } 
        return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, SUPER_CALL), createArgumentList(createThisExpression(), this.className_, nameExpression, createArrayLiteralExpression(tree.args.args))); 
      } 
      return traceur.runtime.superCall(this, SuperTransformer, "transformCallExpression",[tree]); 
    }, 
    transformMemberShared_: function(tree, name) { 
      return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, SUPER_GET), createArgumentList(createThisExpression(), this.className_, name)); 
    }, 
    transformMemberExpression: function(tree) { 
      if(tree.operand.type === SUPER_EXPRESSION) { 
        return this.transformMemberShared_(tree, createStringLiteral(tree.memberName.value)); 
      } 
      return traceur.runtime.superCall(this, SuperTransformer, "transformMemberExpression",[tree]); 
    }, 
    transformMemberLookupExpression: function(tree) { 
      if(tree.operand.type === SUPER_EXPRESSION) return this.transformMemberShared_(tree, tree.memberExpression); 
      return traceur.runtime.superCall(this, SuperTransformer, "transformMemberLookupExpression",[tree]); 
    }, 
    transformBinaryOperator: function(tree) { 
      if(tree.operator.isAssignmentOperator() &&(tree.left.type === MEMBER_EXPRESSION || tree.left.type === MEMBER_LOOKUP_EXPRESSION) && tree.left.operand.type === SUPER_EXPRESSION) { 
        if(tree.operator.type !== TokenType.EQUAL) { 
          if(tree.left.type === MEMBER_LOOKUP_EXPRESSION) { 
            tree = expandMemberLookupExpression(tree, this.tempVarTransformer_); 
          } else { 
            tree = expandMemberExpression(tree, this.tempVarTransformer_); 
          } 
          return this.transformAny(tree); 
        } 
        this.superFound_ = true; 
        var name = tree.left.type === MEMBER_LOOKUP_EXPRESSION ? tree.left.memberExpression: createStringLiteral(tree.left.memberName.value); 
        return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, SUPER_SET), createArgumentList(createThisExpression(), this.className_, name, this.transformAny(tree.right))); 
      } 
      return traceur.runtime.superCall(this, SuperTransformer, "transformBinaryOperator",[tree]); 
    }, 
    transformSuperExpression: function(tree) { 
      this.reportError_(tree, '"super" may only be used on the LHS of a member access expression before a call (TODO wording)'); 
      return tree; 
    }, 
    reportError_: function(tree, format, var_args) { 
      var args = Array.prototype.slice.call(arguments); 
      args[0]= tree.location.start; 
      this.reporter_.reportError.apply(this.reporter_, args); 
    } 
  }, ParseTreeTransformer, true, true); 
  return Object.preventExtensions(Object.create(null, { SuperTransformer: { 
      get: function() { 
        return SuperTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_ClassTransformer_js =(function() { 
  "use strict"; 
  var $__203 = $src_syntax_PredefinedName_js, CONSTRUCTOR = $__203.CONSTRUCTOR, CREATE_CLASS = $__203.CREATE_CLASS, RUNTIME = $__203.RUNTIME, TRACEUR = $__203.TRACEUR; 
  var $__204 = $src_syntax_trees_ParseTrees_js, FormalParameterList = $__204.FormalParameterList, FunctionDeclaration = $__204.FunctionDeclaration, GetAccessor = $__204.GetAccessor, PropertyMethodAssignment = $__204.PropertyMethodAssignment, PropertyNameAssignment = $__204.PropertyNameAssignment, SetAccessor = $__204.SetAccessor, SuperExpression = $__204.SuperExpression; 
  var $__205 = $src_syntax_trees_ParseTreeType_js, GET_ACCESSOR = $__205.GET_ACCESSOR, PROPERTY_METHOD_ASSIGNMENT = $__205.PROPERTY_METHOD_ASSIGNMENT, SET_ACCESSOR = $__205.SET_ACCESSOR; 
  var $__206 = $src_codegeneration_SuperTransformer_js, SuperTransformer = $__206.SuperTransformer; 
  var $__207 = $src_codegeneration_TempVarTransformer_js, TempVarTransformer = $__207.TempVarTransformer; 
  var $__208 = $src_syntax_TokenType_js, TokenType = $__208.TokenType; 
  var $__209 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__209.createArgumentList, createAssignmentExpression = $__209.createAssignmentExpression, createBlock = $__209.createBlock, createBooleanLiteral = $__209.createBooleanLiteral, createCallExpression = $__209.createCallExpression, createExpressionStatement = $__209.createExpressionStatement, createFunctionExpression = $__209.createFunctionExpression, createIdentifierExpression = $__209.createIdentifierExpression, createIdentifierToken = $__209.createIdentifierToken, createMemberExpression = $__209.createMemberExpression, createNullLiteral = $__209.createNullLiteral, createObjectLiteralExpression = $__209.createObjectLiteralExpression, createParenExpression = $__209.createParenExpression, createPropertyNameAssignment = $__209.createPropertyNameAssignment, createRestParameter = $__209.createRestParameter, createSpreadExpression = $__209.createSpreadExpression, createVariableStatement = $__209.createVariableStatement; 
  var $__210 = $src_util_util_js, createObject = $__210.createObject; 
  var $__211 = $src_options_js, transformOptions = $__211.transformOptions; 
  var stack =[]; 
  function State(classTree) { 
    this.tree = classTree; 
    this.name = null; 
    this.hasSuper = false; 
  } 
  function peekState() { 
    return stack[stack.length - 1]; 
  } 
  function ClassTransformer(identifierGenerator, reporter) { 
    TempVarTransformer.call(this, identifierGenerator); 
    this.reporter_ = reporter; 
  } 
  ClassTransformer.transform = function(identifierGenerator, reporter, tree) { 
    return new ClassTransformer(identifierGenerator, reporter).transformAny(tree); 
  }; 
  var proto = TempVarTransformer.prototype; 
  ClassTransformer.prototype = createObject(proto, { 
    transformClassShared_: function(tree, name) { 
      var superClass = this.transformAny(tree.superClass); 
      var state = new State(tree); 
      stack.push(state); 
      state.name = createIdentifierExpression(name); 
      var constructor; 
      var elements = tree.elements.map((function(tree) { 
        switch(tree.type) { 
          case GET_ACCESSOR: 
            return this.transformGetAccessor_(tree); 

          case SET_ACCESSOR: 
            return this.transformSetAccessor_(tree); 

          case PROPERTY_METHOD_ASSIGNMENT: 
            if(tree.name.value === CONSTRUCTOR) return constructor = this.transformConstructor_(tree); 
            return this.transformPropertyMethodAssignment_(tree); 

          default: 
            throw new Error(("Unexpected class element: " + tree.type)); 

        } 
      }).bind(this)); 
      if(! constructor) elements.push(this.getDefaultConstructor_(tree)); 
      stack.pop(); 
      var hasConstructor = ! ! constructor; 
      var hasExtendsExpression = ! ! superClass; 
      return[createCallExpression(createMemberExpression(TRACEUR, RUNTIME, CREATE_CLASS), createArgumentList(createObjectLiteralExpression(elements), superClass || createNullLiteral(), createBooleanLiteral(hasConstructor), createBooleanLiteral(hasExtendsExpression))), state.hasSuper]; 
    }, 
    transformClassDeclaration: function(tree) { 
      return createVariableStatement(transformOptions.blockBinding ? TokenType.LET: TokenType.VAR, tree.name, this.transformClassShared_(tree, tree.name.identifierToken)[0]); 
    }, 
    transformClassExpression: function(tree) { 
      var tempIdent = this.addTempVar(); 
      var transformResult = this.transformClassShared_(tree, tempIdent); 
      var classTree = transformResult[0]; 
      var hasSuper = transformResult[1]; 
      if(hasSuper) { 
        return createParenExpression(createAssignmentExpression(createIdentifierExpression(tempIdent), classTree)); 
      } 
      this.removeTempVar(tempIdent); 
      return classTree; 
    }, 
    transformPropertyMethodAssignment_: function(tree) { 
      var formalParameterList = this.transformAny(tree.formalParameterList); 
      var functionBody = this.transformSuperInBlock_(tree, tree.functionBody); 
      if(formalParameterList === tree.formalParameterList && functionBody === tree.functionBody) { 
        return tree; 
      } 
      return new PropertyMethodAssignment(tree.location, tree.name, tree.isGenerator, formalParameterList, functionBody); 
    }, 
    transformGetAccessor_: function(tree) { 
      var body = this.transformSuperInBlock_(tree, tree.body); 
      if(body === tree.body) return tree; 
      return new GetAccessor(tree.location, tree.propertyName, body); 
    }, 
    transformSetAccessor_: function(tree) { 
      var parameter = this.transformAny(tree.parameter); 
      var body = this.transformSuperInBlock_(tree, tree.body); 
      if(body === tree.body) return tree; 
      return new SetAccessor(tree.location, tree.propertyName, parameter, body); 
    }, 
    transformConstructor_: function(tree) { 
      var state = peekState(); 
      var parameters = this.transformAny(tree.formalParameterList); 
      var functionBody = this.transformSuperInBlock_(tree, tree.functionBody); 
      var func = createFunctionExpression(parameters, functionBody); 
      return createPropertyNameAssignment(CONSTRUCTOR, func); 
    }, 
    transformSuperInBlock_: function(methodTree, tree) { 
      var state = peekState(); 
      var className = state.name; 
      var superTransformer = new SuperTransformer(this, this.reporter_, className, methodTree); 
      var transformedTree = superTransformer.transformAny(proto.transformAny.call(this, tree)); 
      if(superTransformer.hasSuper) state.hasSuper = true; 
      return transformedTree; 
    }, 
    getDefaultConstructor_: function(tree) { 
      var restParam = createRestParameter('args'); 
      var params = new FormalParameterList(null,[restParam]); 
      var body = createBlock(createExpressionStatement(createCallExpression(new SuperExpression(null), createArgumentList(createSpreadExpression(createIdentifierExpression('args')))))); 
      var constr = new PropertyMethodAssignment(null, createIdentifierToken(CONSTRUCTOR), false, params, body); 
      return this.transformConstructor_(constr); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { ClassTransformer: { 
      get: function() { 
        return ClassTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_CollectionTransformer_js =(function() { 
  "use strict"; 
  var $__212 = $src_syntax_PredefinedName_js, ELEMENT_DELETE = $__212.ELEMENT_DELETE, ELEMENT_GET = $__212.ELEMENT_GET, ELEMENT_HAS = $__212.ELEMENT_HAS, ELEMENT_SET = $__212.ELEMENT_SET, RUNTIME = $__212.RUNTIME, TRACEUR = $__212.TRACEUR; 
  var $__213 = $src_syntax_trees_ParseTreeType_js, MEMBER_LOOKUP_EXPRESSION = $__213.MEMBER_LOOKUP_EXPRESSION; 
  var $__214 = $src_codegeneration_TempVarTransformer_js, TempVarTransformer = $__214.TempVarTransformer; 
  var $__215 = $src_syntax_TokenType_js, TokenType = $__215.TokenType; 
  var $__216 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__216.createArgumentList, createAssignmentExpression = $__216.createAssignmentExpression, createCallCall = $__216.createCallCall, createCallExpression = $__216.createCallExpression, createCommaExpression = $__216.createCommaExpression, createIdentifierExpression = $__216.createIdentifierExpression, createMemberExpression = $__216.createMemberExpression, createParenExpression = $__216.createParenExpression; 
  var $__217 = $src_util_util_js, createObject = $__217.createObject; 
  var $__218 = $src_codegeneration_OperatorExpander_js, expandMemberLookupExpression = $__218.expandMemberLookupExpression; 
  function CollectionTransformer(identifierGenerator) { 
    TempVarTransformer.call(this, identifierGenerator); 
  } 
  CollectionTransformer.transformTree = function(identifierGenerator, tree) { 
    return new CollectionTransformer(identifierGenerator).transformAny(tree); 
  }; 
  var proto = TempVarTransformer.prototype; 
  CollectionTransformer.prototype = createObject(proto, { 
    transformBinaryOperator: function(tree) { 
      if(tree.operator.type === TokenType.IN) { 
        var name = this.transformAny(tree.left); 
        var object = this.transformAny(tree.right); 
        return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, ELEMENT_HAS), createArgumentList(object, name)); 
      } 
      if(tree.left.type === MEMBER_LOOKUP_EXPRESSION && tree.operator.isAssignmentOperator()) { 
        if(tree.operator.type !== TokenType.EQUAL) { 
          tree = expandMemberLookupExpression(tree, this); 
          return this.transformAny(tree); 
        } 
        var operand = this.transformAny(tree.left.operand); 
        var memberExpression = this.transformAny(tree.left.memberExpression); 
        var value = this.transformAny(tree.right); 
        return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, ELEMENT_SET), createArgumentList(operand, memberExpression, value)); 
      } 
      return proto.transformBinaryOperator.call(this, tree); 
    }, 
    transformCallExpression: function(tree) { 
      if(tree.operand.type !== MEMBER_LOOKUP_EXPRESSION) return proto.transformCallExpression.call(this, tree); 
      var operand = this.transformAny(tree.operand.operand); 
      var memberExpression = this.transformAny(tree.operand.memberExpression); 
      var ident = createIdentifierExpression(this.addTempVar()); 
      var elements = tree.args.args.map(this.transformAny, this); 
      var callExpr = createCallCall(createCallExpression(createMemberExpression(TRACEUR, RUNTIME, ELEMENT_GET), createArgumentList(ident, memberExpression)), ident, elements); 
      var expressions =[createAssignmentExpression(ident, operand), callExpr]; 
      return createParenExpression(createCommaExpression(expressions)); 
    }, 
    transformMemberLookupExpression: function(tree) { 
      return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, ELEMENT_GET), createArgumentList(tree.operand, tree.memberExpression)); 
    }, 
    transformUnaryExpression: function(tree) { 
      if(tree.operator.type !== TokenType.DELETE || tree.operand.type !== MEMBER_LOOKUP_EXPRESSION) { 
        return proto.transformUnaryExpression.call(this, tree); 
      } 
      var operand = this.transformAny(tree.operand.operand); 
      var memberExpression = this.transformAny(tree.operand.memberExpression); 
      return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, ELEMENT_DELETE), createArgumentList(operand, memberExpression)); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { CollectionTransformer: { 
      get: function() { 
        return CollectionTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_DefaultParametersTransformer_js =(function() { 
  "use strict"; 
  var $__219 = $src_syntax_trees_ParseTrees_js, FormalParameterList = $__219.FormalParameterList, FunctionDeclaration = $__219.FunctionDeclaration; 
  var $__220 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__220.ParseTreeTransformer; 
  var $__221 = $src_syntax_PredefinedName_js, ARGUMENTS = $__221.ARGUMENTS; 
  var $__222 = $src_syntax_trees_ParseTreeType_js, REST_PARAMETER = $__222.REST_PARAMETER; 
  var $__223 = $src_syntax_TokenType_js, TokenType = $__223.TokenType; 
  var $__224 = $src_codegeneration_ParseTreeFactory_js, createBinaryOperator = $__224.createBinaryOperator, createBlock = $__224.createBlock, createConditionalExpression = $__224.createConditionalExpression, createIdentifierExpression = $__224.createIdentifierExpression, createMemberExpression = $__224.createMemberExpression, createMemberLookupExpression = $__224.createMemberLookupExpression, createNumberLiteral = $__224.createNumberLiteral, createOperatorToken = $__224.createOperatorToken, createVariableStatement = $__224.createVariableStatement, createVoid0 = $__224.createVoid0; 
  var $__225 = $src_util_util_js, createObject = $__225.createObject; 
  var stack =[]; 
  var DefaultParametersTransformer = traceur.runtime.createClass({ 
    transformFunctionDeclaration: function(tree) { 
      stack.push([]); 
      var transformedTree = traceur.runtime.superCall(this, DefaultParametersTransformer, "transformFunctionDeclaration",[tree]); 
      var statements = stack.pop(); 
      if(! statements.length) return transformedTree; 
      statements.push.apply(statements, transformedTree.functionBody.statements); 
      return new FunctionDeclaration(transformedTree.location, transformedTree.name, transformedTree.isGenerator, transformedTree.formalParameterList, createBlock(statements)); 
    }, 
    transformFormalParameterList: function(tree) { 
      var parameters =[]; 
      var statements = stack[stack.length - 1]; 
      var changed = false; 
      var defaultToUndefined = false; 
      for(var i = 0; i < tree.parameters.length; i ++) { 
        var param = this.transformAny(tree.parameters[i]); 
        if(param !== tree.parameters[i]) changed = true; 
        if(param.type === REST_PARAMETER || ! param.initializer && ! defaultToUndefined) { 
          parameters.push(param); 
        } else { 
          defaultToUndefined = true; 
          changed = true; 
          statements.push(createVariableStatement(TokenType.VAR, param.binding, createConditionalExpression(createBinaryOperator(createMemberLookupExpression(createIdentifierExpression(ARGUMENTS), createNumberLiteral(i)), createOperatorToken(TokenType.NOT_EQUAL_EQUAL), createVoid0()), createMemberLookupExpression(createIdentifierExpression(ARGUMENTS), createNumberLiteral(i)), param.initializer || createVoid0()))); 
        } 
      } 
      if(! changed) return tree; 
      return new FormalParameterList(tree.location, parameters); 
    }, 
    constructor: function() { 
      var args = Array.prototype.slice.call(arguments, 0); 
      traceur.runtime.superCall(this, DefaultParametersTransformer, "constructor", $__465(args)); 
    } 
  }, ParseTreeTransformer, false, true); 
  DefaultParametersTransformer.transformTree = function(tree) { 
    return new DefaultParametersTransformer().transformAny(tree); 
  }; 
  return Object.preventExtensions(Object.create(null, { DefaultParametersTransformer: { 
      get: function() { 
        return DefaultParametersTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_DestructuringTransformer_js =(function() { 
  "use strict"; 
  var $__226 = $src_syntax_PredefinedName_js, ARRAY = $__226.ARRAY, CALL = $__226.CALL, PROTOTYPE = $__226.PROTOTYPE, SLICE = $__226.SLICE; 
  var $__227 = $src_syntax_trees_ParseTreeType_js, ARRAY_PATTERN = $__227.ARRAY_PATTERN, BINDING_ELEMENT = $__227.BINDING_ELEMENT, BINDING_ELEMENT = $__227.BINDING_ELEMENT, BLOCK = $__227.BLOCK, IDENTIFIER_EXPRESSION = $__227.IDENTIFIER_EXPRESSION, IDENTIFIER_EXPRESSION = $__227.IDENTIFIER_EXPRESSION, OBJECT_PATTERN = $__227.OBJECT_PATTERN, OBJECT_PATTERN_FIELD = $__227.OBJECT_PATTERN_FIELD, PAREN_EXPRESSION = $__227.PAREN_EXPRESSION, VARIABLE_DECLARATION_LIST = $__227.VARIABLE_DECLARATION_LIST; 
  var $__228 = $src_syntax_trees_ParseTrees_js, BindingElement = $__228.BindingElement, BindingIdentifier = $__228.BindingIdentifier, Catch = $__228.Catch, ForInStatement = $__228.ForInStatement, ForOfStatement = $__228.ForOfStatement, FunctionDeclaration = $__228.FunctionDeclaration, LiteralExpression = $__228.LiteralExpression, SetAccessor = $__228.SetAccessor, VariableDeclaration = $__228.VariableDeclaration, VariableDeclarationList = $__228.VariableDeclarationList; 
  var $__229 = $src_codegeneration_TempVarTransformer_js, TempVarTransformer = $__229.TempVarTransformer; 
  var $__230 = $src_syntax_TokenType_js, TokenType = $__230.TokenType; 
  var $__231 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__231.createArgumentList, createAssignmentExpression = $__231.createAssignmentExpression, createBinaryOperator = $__231.createBinaryOperator, createBindingIdentifier = $__231.createBindingIdentifier, createBlock = $__231.createBlock, createCallExpression = $__231.createCallExpression, createCommaExpression = $__231.createCommaExpression, createConditionalExpression = $__231.createConditionalExpression, createExpressionStatement = $__231.createExpressionStatement, createIdentifierExpression = $__231.createIdentifierExpression, createMemberExpression = $__231.createMemberExpression, createMemberLookupExpression = $__231.createMemberLookupExpression, createNumberLiteral = $__231.createNumberLiteral, createOperatorToken = $__231.createOperatorToken, createParenExpression = $__231.createParenExpression, createStringLiteral = $__231.createStringLiteral, createVariableDeclaration = $__231.createVariableDeclaration, createVariableDeclarationList = $__231.createVariableDeclarationList, createVariableStatement = $__231.createVariableStatement; 
  var $__232 = $src_util_util_js, createObject = $__232.createObject; 
  var stack =[]; 
  function Desugaring(rvalue) { 
    this.rvalue = rvalue; 
  } 
  function AssignmentExpressionDesugaring(rvalue) { 
    Desugaring.call(this, rvalue); 
    this.expressions =[]; 
  } 
  AssignmentExpressionDesugaring.prototype = createObject(Desugaring.prototype, { assign: function(lvalue, rvalue) { 
      this.expressions.push(createAssignmentExpression(lvalue, rvalue)); 
    } }); 
  function VariableDeclarationDesugaring(rvalue) { 
    Desugaring.call(this, rvalue); 
    this.declarations =[]; 
  } 
  VariableDeclarationDesugaring.prototype = createObject(Desugaring.prototype, { assign: function(lvalue, rvalue) { 
      if(lvalue.type === BINDING_ELEMENT) { 
        this.declarations.push(createVariableDeclaration(lvalue.binding, rvalue)); 
        return; 
      } 
      if(lvalue.type == IDENTIFIER_EXPRESSION) lvalue = createBindingIdentifier(lvalue); 
      this.declarations.push(createVariableDeclaration(lvalue, rvalue)); 
    } }); 
  function createConditionalMemberExpression(rvalue, identToken, initializer) { 
    if(identToken.type !== TokenType.IDENTIFIER) { 
      return createConditionalMemberLookupExpression(rvalue, new LiteralExpression(null, identToken), initializer); 
    } 
    if(! initializer) return createMemberExpression(rvalue, identToken); 
    return createConditionalExpression(createBinaryOperator(createStringLiteral(identToken.value), createOperatorToken(TokenType.IN), rvalue), createMemberExpression(rvalue, identToken), initializer); 
  } 
  function createConditionalMemberLookupExpression(rvalue, index, initializer) { 
    if(! initializer) return createMemberLookupExpression(rvalue, index); 
    return createConditionalExpression(createBinaryOperator(index, createOperatorToken(TokenType.IN), rvalue), createMemberLookupExpression(rvalue, index), initializer); 
  } 
  function DestructuringTransformer(identifierGenerator) { 
    TempVarTransformer.call(this, identifierGenerator); 
  } 
  DestructuringTransformer.transformTree = function(identifierGenerator, tree) { 
    return new DestructuringTransformer(identifierGenerator).transformAny(tree); 
  }; 
  var proto = TempVarTransformer.prototype; 
  DestructuringTransformer.prototype = createObject(proto, { 
    transformArrayPattern: function(tree) { 
      throw new Error('unreachable'); 
    }, 
    transformObjectPattern: function(tree) { 
      throw new Error('unreachable'); 
    }, 
    transformBinaryOperator: function(tree) { 
      if(tree.operator.type == TokenType.EQUAL && tree.left.isPattern()) { 
        return this.transformAny(this.desugarAssignment_(tree.left, tree.right)); 
      } else { 
        return proto.transformBinaryOperator.call(this, tree); 
      } 
    }, 
    desugarAssignment_: function(lvalue, rvalue) { 
      var tempIdent = createIdentifierExpression(this.addTempVar()); 
      var desugaring = new AssignmentExpressionDesugaring(tempIdent); 
      this.desugarPattern_(desugaring, lvalue); 
      desugaring.expressions.unshift(createAssignmentExpression(tempIdent, rvalue)); 
      desugaring.expressions.push(tempIdent); 
      return createParenExpression(createCommaExpression(desugaring.expressions)); 
    }, 
    transformVariableDeclarationList: function(tree) { 
      if(! this.destructuringInDeclaration_(tree)) { 
        return proto.transformVariableDeclarationList.call(this, tree); 
      } 
      var desugaredDeclarations =[]; 
      tree.declarations.forEach((function(declaration) { 
        if(declaration.lvalue.isPattern()) { 
          desugaredDeclarations.push.apply(desugaredDeclarations, this.desugarVariableDeclaration_(declaration)); 
        } else { 
          desugaredDeclarations.push(declaration); 
        } 
      }).bind(this)); 
      return this.transformVariableDeclarationList(createVariableDeclarationList(tree.declarationType, desugaredDeclarations)); 
    }, 
    transformForInStatement: function(tree) { 
      return this.transformForInOrOf_(tree, proto.transformForInStatement, ForInStatement); 
    }, 
    transformForOfStatement: function(tree) { 
      return this.transformForInOrOf_(tree, proto.transformForOfStatement, ForOfStatement); 
    }, 
    transformForInOrOf_: function(tree, superMethod, constr) { 
      if(! tree.initializer.isPattern() &&(tree.initializer.type !== VARIABLE_DECLARATION_LIST || ! this.destructuringInDeclaration_(tree.initializer))) { 
        return superMethod.call(this, tree); 
      } 
      var declarationType, lvalue; 
      if(tree.initializer.isPattern()) { 
        declarationType = null; 
        lvalue = tree.initializer; 
      } else { 
        declarationType = tree.initializer.declarationType; 
        lvalue = tree.initializer.declarations[0].lvalue; 
      } 
      var statements =[]; 
      var binding = this.desugarBinding_(lvalue, statements, declarationType); 
      var initializer = createVariableDeclarationList(TokenType.VAR, binding, null); 
      var collection = this.transformAny(tree.collection); 
      var body = this.transformAny(tree.body); 
      if(body.type !== BLOCK) body = createBlock(body); 
      statements.push.apply(statements, body.statements); 
      body = createBlock(statements); 
      return new constr(tree.location, initializer, collection, body); 
    }, 
    transformFunctionDeclaration: function(tree) { 
      stack.push([]); 
      var transformedTree = proto.transformFunctionDeclaration.call(this, tree); 
      var statements = stack.pop(); 
      if(! statements.length) return transformedTree; 
      statements.push.apply(statements, transformedTree.functionBody.statements); 
      return new FunctionDeclaration(transformedTree.location, transformedTree.name, transformedTree.isGenerator, transformedTree.formalParameterList, createBlock(statements)); 
    }, 
    transformSetAccessor: function(tree) { 
      stack.push([]); 
      var transformedTree = proto.transformSetAccessor.call(this, tree); 
      var statements = stack.pop(); 
      if(! statements.length) return transformedTree; 
      statements.push.apply(statements, transformedTree.body.statements); 
      return new SetAccessor(transformedTree.location, transformedTree.propertyName, transformedTree.parameter, createBlock(statements)); 
    }, 
    transformBindingElement: function(tree) { 
      if(! tree.binding.isPattern() || tree.initializer) return tree; 
      var statements = stack[stack.length - 1]; 
      var binding = this.desugarBinding_(tree.binding, statements, TokenType.VAR); 
      return new BindingElement(null, binding, null); 
    }, 
    transformCatch: function(tree) { 
      if(! tree.binding.isPattern()) return proto.transformCatch.call(this, tree); 
      var body = this.transformAny(tree.catchBody); 
      var statements =[]; 
      var binding = this.desugarBinding_(tree.binding, statements, TokenType.LET); 
      statements.push.apply(statements, body.statements); 
      return new Catch(tree.location, binding, createBlock(statements)); 
    }, 
    desugarBinding_: function(bindingTree, statements, declarationType) { 
      var varName = this.identifierGenerator.generateUniqueIdentifier(); 
      var binding = createBindingIdentifier(varName); 
      var idExpr = createIdentifierExpression(varName); 
      var desugaring; 
      if(declarationType === null) desugaring = new AssignmentExpressionDesugaring(idExpr); else desugaring = new VariableDeclarationDesugaring(idExpr); 
      this.desugarPattern_(desugaring, bindingTree); 
      if(declarationType === null) { 
        statements.push(createExpressionStatement(createCommaExpression(desugaring.expressions))); 
      } else { 
        statements.push(createVariableStatement(this.transformVariableDeclarationList(createVariableDeclarationList(declarationType, desugaring.declarations)))); 
      } 
      return binding; 
    }, 
    destructuringInDeclaration_: function(tree) { 
      return tree.declarations.some((function(declaration) { 
        return declaration.lvalue.isPattern(); 
      })); 
    }, 
    desugarVariableDeclaration_: function(tree) { 
      var tempIdent = this.identifierGenerator.generateUniqueIdentifier(); 
      var desugaring = new VariableDeclarationDesugaring(createIdentifierExpression(tempIdent)); 
      desugaring.assign(desugaring.rvalue, tree.initializer); 
      this.desugarPattern_(desugaring, tree.lvalue); 
      return desugaring.declarations; 
    }, 
    desugarPattern_: function(desugaring, tree) { 
      switch(tree.type) { 
        case ARRAY_PATTERN: 
          { 
            var pattern = tree; 
            for(var i = 0; i < pattern.elements.length; i ++) { 
              var lvalue = pattern.elements[i]; 
              if(lvalue === null) { 
                continue; 
              } else if(lvalue.isSpreadPatternElement()) { 
                desugaring.assign(lvalue.lvalue, createCallExpression(createMemberExpression(ARRAY, PROTOTYPE, SLICE, CALL), createArgumentList(desugaring.rvalue, createNumberLiteral(i)))); 
              } else { 
                desugaring.assign(lvalue, createConditionalMemberLookupExpression(desugaring.rvalue, createNumberLiteral(i), lvalue.initializer)); 
              } 
            } 
            break; 
          } 

        case OBJECT_PATTERN: 
          { 
            var pattern = tree; 
            pattern.fields.forEach((function(field) { 
              var lookup; 
              switch(field.type) { 
                case BINDING_ELEMENT: 
                  lookup = createConditionalMemberExpression(desugaring.rvalue, field.binding.identifierToken, field.initializer); 
                  desugaring.assign(createIdentifierExpression(field.binding), lookup); 
                  break; 

                case OBJECT_PATTERN_FIELD: 
                  lookup = createConditionalMemberExpression(desugaring.rvalue, field.identifier, field.element.initializer); 
                  desugaring.assign(field.element, lookup); 
                  break; 

                case IDENTIFIER_EXPRESSION: 
                  lookup = createMemberExpression(desugaring.rvalue, field.identifierToken); 
                  desugaring.assign(field, lookup); 
                  break; 

                default: 
                  throw Error('unreachable'); 

              } 
            })); 
            break; 
          } 

        case PAREN_EXPRESSION: 
          this.desugarPattern_(desugaring, tree.expression); 
          break; 

        default: 
          throw new Error('unreachable'); 

      } 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { DestructuringTransformer: { 
      get: function() { 
        return DestructuringTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_ForOfTransformer_js =(function() { 
  "use strict"; 
  var $__233 = $src_syntax_PredefinedName_js, CLOSE = $__233.CLOSE, CURRENT = $__233.CURRENT, GET_ITERATOR = $__233.GET_ITERATOR, MOVE_NEXT = $__233.MOVE_NEXT, RUNTIME = $__233.RUNTIME, TRACEUR = $__233.TRACEUR; 
  var $__234 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__234.ParseTreeTransformer; 
  var $__235 = $src_syntax_trees_ParseTreeType_js, VARIABLE_DECLARATION_LIST = $__235.VARIABLE_DECLARATION_LIST; 
  var $__236 = $src_syntax_TokenType_js, TokenType = $__236.TokenType; 
  var $__237 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__237.createArgumentList, createAssignmentExpression = $__237.createAssignmentExpression, createBlock = $__237.createBlock, createCallExpression = $__237.createCallExpression, createCallStatement = $__237.createCallStatement, createExpressionStatement = $__237.createExpressionStatement, createFinally = $__237.createFinally, createIfStatement = $__237.createIfStatement, createMemberExpression = $__237.createMemberExpression, createStringLiteral = $__237.createStringLiteral, createTryStatement = $__237.createTryStatement, createVariableStatement = $__237.createVariableStatement, createWhileStatement = $__237.createWhileStatement; 
  var $__238 = $src_util_util_js, createObject = $__238.createObject; 
  var ForOfTransformer = traceur.runtime.createClass({ 
    constructor: function(identifierGenerator) { 
      traceur.runtime.superCall(this, ForOfTransformer, "constructor",[]); 
      this.identifierGenerator_ = identifierGenerator; 
    }, 
    transformForOfStatement: function(original) { 
      var tree = traceur.runtime.superCall(this, ForOfTransformer, "transformForOfStatement",[original]); 
      var iter = this.identifierGenerator_.generateUniqueIdentifier(); 
      var initializer = createVariableStatement(TokenType.VAR, iter, createCallExpression(createMemberExpression(TRACEUR, RUNTIME, GET_ITERATOR), createArgumentList(tree.collection))); 
      var statement; 
      if(tree.initializer.type === VARIABLE_DECLARATION_LIST) { 
        statement = createVariableStatement(tree.initializer.declarationType, tree.initializer.declarations[0].lvalue, createMemberExpression(iter, CURRENT)); 
      } else { 
        statement = createExpressionStatement(createAssignmentExpression(tree.initializer, createMemberExpression(iter, CURRENT))); 
      } 
      var body = createBlock(statement, tree.body); 
      var loop = createWhileStatement(createCallExpression(createMemberExpression(iter, MOVE_NEXT)), body); 
      var finallyBody = createIfStatement(createMemberExpression(iter, CLOSE), createCallStatement(createMemberExpression(iter, CLOSE))); 
      return createBlock(initializer, createTryStatement(createBlock(loop), null, createFinally(createBlock(finallyBody)))); 
    } 
  }, ParseTreeTransformer, true, true); 
  ForOfTransformer.transformTree = function(identifierGenerator, tree) { 
    return new ForOfTransformer(identifierGenerator).transformAny(tree); 
  }; 
  return Object.preventExtensions(Object.create(null, { ForOfTransformer: { 
      get: function() { 
        return ForOfTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_semantics_FreeVariableChecker_js =(function() { 
  "use strict"; 
  var $__239 = $src_syntax_PredefinedName_js, ARGUMENTS = $__239.ARGUMENTS; 
  var $__240 = $src_syntax_trees_ParseTrees_js, BindingIdentifier = $__240.BindingIdentifier, IdentifierExpression = $__240.IdentifierExpression; 
  var $__241 = $src_syntax_IdentifierToken_js, IdentifierToken = $__241.IdentifierToken; 
  var $__242 = $src_syntax_trees_ParseTreeType_js, PAREN_EXPRESSION = $__242.PAREN_EXPRESSION, BINDING_IDENTIFIER = $__242.BINDING_IDENTIFIER, FUNCTION_DECLARATION = $__242.FUNCTION_DECLARATION; 
  var $__243 = $src_syntax_ParseTreeVisitor_js, ParseTreeVisitor = $__243.ParseTreeVisitor; 
  var $__244 = $src_util_SourcePosition_js, SourcePosition = $__244.SourcePosition; 
  var $__245 = $src_syntax_TokenType_js, TokenType = $__245.TokenType; 
  var $__246 = $src_util_util_js, createObject = $__246.createObject; 
  var Scope = traceur.runtime.createClass({ constructor: function(parent) { 
      this.parent = parent; 
      this.references = Object.create(null); 
      this.declarations = Object.create(null); 
    } }, null, true, false); 
  function getVariableName(name) { 
    if(name instanceof IdentifierExpression) { 
      name = name.identifierToken; 
    } else if(name instanceof BindingIdentifier) { 
      name = name.identifierToken; 
    } 
    if(name instanceof IdentifierToken) { 
      name = name.value; 
    } 
    return name; 
  } 
  function getIdentifier(tree) { 
    while(tree.type == PAREN_EXPRESSION) { 
      tree = tree.expression; 
    } 
    if(tree.type == BINDING_IDENTIFIER) { 
      return tree; 
    } 
    return null; 
  } 
  var FreeVariableChecker = traceur.runtime.createClass({ 
    constructor: function(reporter) { 
      traceur.runtime.superCall(this, FreeVariableChecker, "constructor",[]); 
      this.reporter_ = reporter; 
      this.scope_ = null; 
    }, 
    pushScope_: function() { 
      return this.scope_ = new Scope(this.scope_); 
    }, 
    pop_: function(scope) { 
      if(this.scope_ != scope) { 
        throw new Error('FreeVariableChecker scope mismatch'); 
      } 
      this.validateScope_(); 
      this.scope_ = scope.parent; 
    }, 
    visitBlock: function(tree) { 
      this.visitStatements_(tree.statements); 
    }, 
    visitProgram: function(tree, global) { 
      var scope = this.pushScope_(); 
      var object = global; 
      while(object) { 
        Object.getOwnPropertyNames(object).forEach(this.declareVariable_, this); 
        object = Object.getPrototypeOf(object); 
      } 
      this.visitStatements_(tree.programElements); 
      this.pop_(scope); 
    }, 
    visitStatements_: function(statements) { 
      statements.forEach((function(s) { 
        if(s.type == FUNCTION_DECLARATION) { 
          this.declareVariable_(s.name); 
        } 
        this.visitAny(s); 
      }).bind(this)); 
    }, 
    visitFunction_: function(name, formalParameterList, body) { 
      var scope = this.pushScope_(); 
      if(name) this.declareVariable_(name); 
      this.declareVariable_(ARGUMENTS); 
      this.visitAny(formalParameterList); 
      this.visitAny(body); 
      this.pop_(scope); 
    }, 
    visitFunctionDeclaration: function(tree) { 
      this.visitFunction_(tree.name, tree.formalParameterList, tree.functionBody); 
    }, 
    visitArrowFunctionExpression: function(tree) { 
      this.visitFunction_(null, tree.formalParameters, tree.functionBody); 
    }, 
    visitGetAccessor: function(tree) { 
      var scope = this.pushScope_(); 
      this.visitAny(tree.body); 
      this.pop_(scope); 
    }, 
    visitSetAccessor: function(tree) { 
      var scope = this.pushScope_(); 
      this.declareVariable_(tree.parameter.binding); 
      this.visitAny(tree.body); 
      this.pop_(scope); 
    }, 
    visitCatch: function(tree) { 
      var scope = this.pushScope_(); 
      this.visitAny(tree.binding); 
      this.visitAny(tree.catchBody); 
      this.pop_(scope); 
    }, 
    visitVariableDeclarationList: function(tree) { 
      if(tree.declarationType != TokenType.VAR) { 
        throw new Error('let and const should have been rewritten'); 
      } 
      tree.declarations.forEach((function(d) { 
        this.declareVariable_(d.lvalue); 
        this.visitAny(d.initializer); 
      }).bind(this)); 
    }, 
    visitBindingIdentifier: function(tree) { 
      this.declareVariable_(tree); 
    }, 
    visitIdentifierExpression: function(tree) { 
      var name = getVariableName(tree); 
      var scope = this.scope_; 
      if(!(name in scope.references)) { 
        scope.references[name]= tree.location; 
      } 
    }, 
    declareVariable_: function(tree) { 
      var name = getVariableName(tree); 
      if(name) { 
        var scope = this.scope_; 
        if(!(name in scope.declarations)) { 
          scope.declarations[name]= tree.location; 
        } 
      } 
    }, 
    validateScope_: function() { 
      var scope = this.scope_; 
      var errors =[]; 
      for(var name in scope.references) { 
        if(!(name in scope.declarations)) { 
          var location = scope.references[name]; 
          if(! scope.parent) { 
            if(! location) { 
              throw new Error(("generated variable " + name + " is not defined")); 
            } 
            errors.push([location.start, '%s is not defined', name]); 
          } else if(!(name in scope.parent.references)) { 
            scope.parent.references[name]= location; 
          } 
        } 
      } 
      if(errors.length) { 
        errors.sort((function(x, y) { 
          return x[0].offset - y[0].offset; 
        })); 
        errors.forEach((function(e) { 
          this.reportError_.apply(this, e); 
        }).bind(this)); 
      } 
    }, 
    reportError_: function(location, format, var_args) { 
      var args = Array.prototype.slice.call(arguments); 
      args[0]= location; 
      this.reporter_.reportError.apply(this.reporter_, args); 
    } 
  }, ParseTreeVisitor, true, true); 
  var global = this; 
  FreeVariableChecker.checkProgram = function(reporter, tree) { 
    new FreeVariableChecker(reporter).visitProgram(tree, global); 
  }; 
  return Object.preventExtensions(Object.create(null, { FreeVariableChecker: { 
      get: function() { 
        return FreeVariableChecker; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_GeneratorComprehensionTransformer_js =(function() { 
  "use strict"; 
  var $__247 = $src_codegeneration_ComprehensionTransformer_js, ComprehensionTransformer = $__247.ComprehensionTransformer; 
  var $__248 = $src_util_util_js, createObject = $__248.createObject; 
  var $__249 = $src_codegeneration_ParseTreeFactory_js, createYieldStatement = $__249.createYieldStatement; 
  function GeneratorComprehensionTransformer(identifierGenerator) { 
    ComprehensionTransformer.call(this, identifierGenerator); 
  } 
  GeneratorComprehensionTransformer.transformTree = function(identifierGenerator, tree) { 
    return new GeneratorComprehensionTransformer(identifierGenerator).transformAny(tree); 
  }; 
  GeneratorComprehensionTransformer.prototype = createObject(ComprehensionTransformer.prototype, { transformGeneratorComprehension: function(tree) { 
      var expression = this.transformAny(tree.expression); 
      var statement = createYieldStatement(expression); 
      var isGenerator = true; 
      return this.transformComprehension(tree, statement, isGenerator); 
    } }); 
  return Object.preventExtensions(Object.create(null, { GeneratorComprehensionTransformer: { 
      get: function() { 
        return GeneratorComprehensionTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_State_js =(function() { 
  "use strict"; 
  var $__250 = $src_syntax_PredefinedName_js, FINALLY_FALL_THROUGH = $__250.FINALLY_FALL_THROUGH; 
  var $__251 = $src_codegeneration_ParseTreeFactory_js, createAssignStateStatement = $__251.createAssignStateStatement, createAssignmentStatement = $__251.createAssignmentStatement, createBreakStatement = $__251.createBreakStatement, createCaseClause = $__251.createCaseClause, createIdentifierExpression = $__251.createIdentifierExpression, createNumberLiteral = $__251.createNumberLiteral, createStatementList = $__251.createStatementList, createStatementList = $__251.createStatementList; 
  function State(id) { 
    this.id = id; 
  } 
  State.INVALID_STATE = - 1; 
  State.generateJump = function(enclosingFinally, fallThroughState) { 
    return createStatementList(State.generateAssignState(enclosingFinally, fallThroughState), createBreakStatement()); 
  }; 
  State.generateJumpThroughFinally = function(finallyState, destination) { 
    return createStatementList(State.generateAssignStateOutOfFinally_(destination, finallyState), createBreakStatement()); 
  }; 
  State.generateAssignState = function(enclosingFinally, fallThroughState) { 
    var assignState; 
    if(isFinallyExit(enclosingFinally, fallThroughState)) { 
      assignState = State.generateAssignStateOutOfFinally(enclosingFinally, fallThroughState); 
    } else { 
      assignState = createStatementList(createAssignStateStatement(fallThroughState)); 
    } 
    return assignState; 
  }; 
  function isFinallyExit(enclosingFinally, destination) { 
    return enclosingFinally != null && enclosingFinally.tryStates.indexOf(destination) < 0; 
  } 
  State.generateAssignStateOutOfFinally = function(enclosingFinally, destination) { 
    return State.generateAssignStateOutOfFinally_(destination, enclosingFinally.finallyState); 
  }; 
  State.generateAssignStateOutOfFinally_ = function(destination, finallyState) { 
    return createStatementList(createAssignStateStatement(finallyState), createAssignmentStatement(createIdentifierExpression(FINALLY_FALL_THROUGH), createNumberLiteral(destination))); 
  }; 
  State.replaceStateList = function(oldStates, oldState, newState) { 
    var states =[]; 
    for(var i = 0; i < oldStates.length; i ++) { 
      states.push(State.replaceStateId(oldStates[i], oldState, newState)); 
    } 
    return states; 
  }; 
  State.replaceStateId = function(current, oldState, newState) { 
    return current == oldState ? newState: current; 
  }; 
  State.replaceAllStates = function(exceptionBlocks, oldState, newState) { 
    var result =[]; 
    for(var i = 0; i < exceptionBlocks.length; i ++) { 
      result.push(exceptionBlocks[i].replaceState(oldState, newState)); 
    } 
    return result; 
  }; 
  State.prototype = { 
    transformMachineState: function(enclosingFinally, machineEndState, reporter) { 
      return createCaseClause(createNumberLiteral(this.id), this.transform(enclosingFinally, machineEndState, reporter)); 
    }, 
    transformBreak: function(labelSet, breakState) { 
      return this; 
    }, 
    transformBreakOrContinue: function(labelSet, breakState, continueState) { 
      return this; 
    } 
  }; 
  return Object.preventExtensions(Object.create(null, { State: { 
      get: function() { 
        return State; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_FallThroughState_js =(function() { 
  "use strict"; 
  var $__252 = $src_codegeneration_generator_State_js, State = $__252.State; 
  var $__253 = $src_util_util_js, createObject = $__253.createObject; 
  function FallThroughState(id, fallThroughState, statements) { 
    State.call(this, id); 
    this.fallThroughState = fallThroughState; 
    this.statements = statements; 
  } 
  FallThroughState.prototype = createObject(State.prototype, { 
    replaceState: function(oldState, newState) { 
      return new FallThroughState(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.statements); 
    }, 
    transform: function(enclosingFinally, machineEndState, reporter) { 
      var statements =[]; 
      statements.push.apply(statements, this.statements); 
      statements.push.apply(statements, State.generateJump(enclosingFinally, this.fallThroughState)); 
      return statements; 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { FallThroughState: { 
      get: function() { 
        return FallThroughState; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_BreakState_js =(function() { 
  "use strict"; 
  var $__254 = $src_codegeneration_generator_FallThroughState_js, FallThroughState = $__254.FallThroughState; 
  var $__255 = $src_codegeneration_generator_State_js, State = $__255.State; 
  var $__256 = $src_util_util_js, createObject = $__256.createObject; 
  var $__257 = $src_codegeneration_ParseTreeFactory_js, createStatementList = $__257.createStatementList; 
  function BreakState(id, label) { 
    State.call(this, id); 
    this.label = label; 
  } 
  BreakState.prototype = createObject(State.prototype, { 
    replaceState: function(oldState, newState) { 
      return new BreakState(State.replaceStateId(this.id, oldState, newState), this.label); 
    }, 
    transform: function(enclosingFinally, machineEndState, reporter) { 
      throw new Error('These should be removed before the transform step'); 
    }, 
    transformBreak: function(labelSet, breakState) { 
      if(this.label == null || this.label in labelSet) { 
        return new FallThroughState(this.id, breakState, createStatementList()); 
      } 
      return this; 
    }, 
    transformBreakOrContinue: function(labelSet, breakState, continueState) { 
      return this.transformBreak(labelSet, breakState); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { BreakState: { 
      get: function() { 
        return BreakState; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_ContinueState_js =(function() { 
  "use strict"; 
  var $__258 = $src_codegeneration_generator_FallThroughState_js, FallThroughState = $__258.FallThroughState; 
  var $__259 = $src_codegeneration_generator_State_js, State = $__259.State; 
  var $__260 = $src_util_util_js, createObject = $__260.createObject; 
  var $__261 = $src_codegeneration_ParseTreeFactory_js, createStatementList = $__261.createStatementList; 
  function ContinueState(id, label) { 
    State.call(this, id); 
    this.label = label; 
  } 
  ContinueState.prototype = createObject(State.prototype, { 
    replaceState: function(oldState, newState) { 
      return new ContinueState(State.replaceStateId(this.id, oldState, newState), this.label); 
    }, 
    transform: function(enclosingFinally, machineEndState, reporter) { 
      throw new Error('These should be removed before the transform step'); 
    }, 
    transformBreakOrContinue: function(labelSet, breakState, continueState) { 
      if(this.label == null || this.label in labelSet) { 
        return new FallThroughState(this.id, continueState, createStatementList()); 
      } 
      return this; 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { ContinueState: { 
      get: function() { 
        return ContinueState; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_TryState_js =(function() { 
  "use strict"; 
  var $__262 = $src_codegeneration_generator_State_js, State = $__262.State; 
  var Kind = { 
    CATCH: 'catch', 
    FINALLY: 'finally' 
  }; 
  function TryState(kind, tryStates, nestedTrys) { 
    this.kind = kind; 
    this.tryStates = tryStates; 
    this.nestedTrys = nestedTrys; 
  } 
  TryState.Kind = Kind; 
  TryState.prototype = { 
    replaceAllStates: function(oldState, newState) { 
      return State.replaceStateList(this.tryStates, oldState, newState); 
    }, 
    replaceNestedTrys: function(oldState, newState) { 
      var states =[]; 
      for(var i = 0; i < this.nestedTrys.length; i ++) { 
        states.push(this.nestedTrys[i].replaceState(oldState, newState)); 
      } 
      return states; 
    } 
  }; 
  return Object.preventExtensions(Object.create(null, { TryState: { 
      get: function() { 
        return TryState; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_syntax_trees_StateMachine_js =(function() { 
  "use strict"; 
  var $__263 = $src_syntax_trees_ParseTree_js, ParseTree = $__263.ParseTree; 
  var $__264 = $src_syntax_trees_ParseTreeType_js, STATE_MACHINE = $__264.STATE_MACHINE; 
  var $__265 = $src_codegeneration_generator_TryState_js, TryState = $__265.TryState; 
  var $__266 = $src_util_util_js, createObject = $__266.createObject; 
  function addCatchOrFinallyStates(kind, enclosingMap, tryStates) { 
    for(var i = 0; i < tryStates.length; i ++) { 
      var tryState = tryStates[i]; 
      if(tryState.kind == kind) { 
        for(var j = 0; j < tryState.tryStates.length; j ++) { 
          var id = tryState.tryStates[j]; 
          enclosingMap[id]= tryState; 
        } 
      } 
      addCatchOrFinallyStates(kind, enclosingMap, tryState.nestedTrys); 
    } 
  } 
  function addAllCatchStates(tryStates, catches) { 
    for(var i = 0; i < tryStates.length; i ++) { 
      var tryState = tryStates[i]; 
      if(tryState.kind == TryState.Kind.CATCH) { 
        catches.push(tryState); 
      } 
      addAllCatchStates(tryState.nestedTrys, catches); 
    } 
  } 
  var StateMachine = traceur.runtime.createClass({ 
    constructor: function(startState, fallThroughState, states, exceptionBlocks) { 
      traceur.runtime.superCall(this, StateMachine, "constructor",[STATE_MACHINE, null]); 
      this.startState = startState; 
      this.fallThroughState = fallThroughState; 
      this.states = states; 
      this.exceptionBlocks = exceptionBlocks; 
    }, 
    hasExceptionBlocks: function() { 
      return this.exceptionBlocks.length > 0; 
    }, 
    getAllStateIDs: function() { 
      var result =[]; 
      for(var i = 0; i < this.states.length; i ++) { 
        result.push(this.states[i].id); 
      } 
      return result; 
    }, 
    getEnclosingFinallyMap: function() { 
      var enclosingMap = Object.create(null); 
      addCatchOrFinallyStates(TryState.Kind.FINALLY, enclosingMap, this.exceptionBlocks); 
      return enclosingMap; 
    }, 
    getEnclosingCatchMap: function() { 
      var enclosingMap = Object.create(null); 
      addCatchOrFinallyStates(TryState.Kind.CATCH, enclosingMap, this.exceptionBlocks); 
      return enclosingMap; 
    }, 
    allCatchStates: function() { 
      var catches =[]; 
      addAllCatchStates(this.exceptionBlocks, catches); 
      return catches; 
    } 
  }, ParseTree, true, true); 
  return Object.preventExtensions(Object.create(null, { StateMachine: { 
      get: function() { 
        return StateMachine; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_BreakContinueTransformer_js =(function() { 
  "use strict"; 
  var $__267 = $src_codegeneration_generator_BreakState_js, BreakState = $__267.BreakState; 
  var $__268 = $src_syntax_trees_ParseTrees_js, BreakStatement = $__268.BreakStatement, ContinueStatement = $__268.ContinueStatement, DoWhileStatement = $__268.DoWhileStatement, ForOfStatement = $__268.ForOfStatement, ForStatement = $__268.ForStatement, FunctionDeclaration = $__268.FunctionDeclaration, SwitchStatement = $__268.SwitchStatement, WhileStatement = $__268.WhileStatement; 
  var $__269 = $src_codegeneration_generator_ContinueState_js, ContinueState = $__269.ContinueState; 
  var $__270 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__270.ParseTreeTransformer; 
  var $__271 = $src_syntax_trees_StateMachine_js, StateMachine = $__271.StateMachine; 
  var $__272 = $src_util_util_js, createObject = $__272.createObject; 
  function safeGetLabel(tree) { 
    return tree.name ? tree.name.value: null; 
  } 
  var BreakContinueTransformer = traceur.runtime.createClass({ 
    constructor: function(stateAllocator) { 
      traceur.runtime.superCall(this, BreakContinueTransformer, "constructor",[]); 
      this.transformBreaks_ = true; 
      this.stateAllocator_ = stateAllocator; 
    }, 
    allocateState_: function() { 
      return this.stateAllocator_.allocateState(); 
    }, 
    stateToStateMachine_: function(newState) { 
      var fallThroughState = this.allocateState_(); 
      return new StateMachine(newState.id, fallThroughState,[newState],[]); 
    }, 
    transformBreakStatement: function(tree) { 
      return this.transformBreaks_ ? this.stateToStateMachine_(new BreakState(this.allocateState_(), safeGetLabel(tree))): tree; 
    }, 
    transformContinueStatement: function(tree) { 
      return this.stateToStateMachine_(new ContinueState(this.allocateState_(), safeGetLabel(tree))); 
    }, 
    transformDoWhileStatement: function(tree) { 
      return tree; 
    }, 
    transformForOfStatement: function(tree) { 
      return tree; 
    }, 
    transformForStatement: function(tree) { 
      return tree; 
    }, 
    transformFunctionDeclaration: function(tree) { 
      return tree; 
    }, 
    transformStateMachine: function(tree) { 
      return tree; 
    }, 
    transformSwitchStatement: function(tree) { 
      var oldState = this.transformBreaks_; 
      this.transformBreaks = false; 
      var result = traceur.runtime.superCall(this, BreakContinueTransformer, "transformSwitchStatement",[tree]); 
      this.transformBreaks_ = oldState; 
      return result; 
    }, 
    transformWhileStatement: function(tree) { 
      return tree; 
    } 
  }, ParseTreeTransformer, true, true); 
  return Object.preventExtensions(Object.create(null, { BreakContinueTransformer: { 
      get: function() { 
        return BreakContinueTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_CatchState_js =(function() { 
  "use strict"; 
  var $__273 = $src_codegeneration_generator_State_js, State = $__273.State; 
  var $__274 = $src_codegeneration_generator_TryState_js, TryState = $__274.TryState; 
  var $__275 = $src_util_util_js, createObject = $__275.createObject; 
  function CatchState(identifier, catchState, fallThroughState, allStates, nestedTrys) { 
    TryState.call(this, TryState.Kind.CATCH, allStates, nestedTrys); 
    this.identifier = identifier; 
    this.catchState = catchState; 
    this.fallThroughState = fallThroughState; 
  } 
  CatchState.prototype = createObject(TryState.prototype, { replaceState: function(oldState, newState) { 
      return new CatchState(this.identifier, State.replaceStateId(this.catchState, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.replaceAllStates(oldState, newState), this.replaceNestedTrys(oldState, newState)); 
    } }); 
  return Object.preventExtensions(Object.create(null, { CatchState: { 
      get: function() { 
        return CatchState; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_ConditionalState_js =(function() { 
  "use strict"; 
  var $__276 = $src_codegeneration_generator_State_js, State = $__276.State; 
  var $__277 = $src_codegeneration_ParseTreeFactory_js, createBlock = $__277.createBlock, createIfStatement = $__277.createIfStatement; 
  var $__278 = $src_util_util_js, createObject = $__278.createObject; 
  function ConditionalState(id, ifState, elseState, condition) { 
    State.call(this, id); 
    this.ifState = ifState; 
    this.elseState = elseState; 
    this.condition = condition; 
  } 
  ConditionalState.prototype = createObject(State.prototype, { 
    replaceState: function(oldState, newState) { 
      return new ConditionalState(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.ifState, oldState, newState), State.replaceStateId(this.elseState, oldState, newState), this.condition); 
    }, 
    transform: function(enclosingFinally, machineEndState, reporter) { 
      return[createIfStatement(this.condition, createBlock(State.generateJump(enclosingFinally, this.ifState)), createBlock(State.generateJump(enclosingFinally, this.elseState)))]; 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { ConditionalState: { 
      get: function() { 
        return ConditionalState; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_FinallyFallThroughState_js =(function() { 
  "use strict"; 
  var $__279 = $src_codegeneration_generator_State_js, State = $__279.State; 
  var $__280 = $src_util_util_js, createObject = $__280.createObject; 
  function FinallyFallThroughState(id) { 
    State.call(this, id); 
  } 
  FinallyFallThroughState.prototype = createObject(State.prototype, { 
    replaceState: function(oldState, newState) { 
      return new FinallyFallThroughState(State.replaceStateId(this.id, oldState, newState)); 
    }, 
    transformMachineState: function(enclosingFinally, machineEndState, reporter) { 
      return null; 
    }, 
    transform: function(enclosingFinally, machineEndState, reporter) { 
      throw new Error('these are generated in addFinallyFallThroughDispatches'); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { FinallyFallThroughState: { 
      get: function() { 
        return FinallyFallThroughState; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_FinallyState_js =(function() { 
  "use strict"; 
  var $__281 = $src_codegeneration_generator_State_js, State = $__281.State; 
  var $__282 = $src_codegeneration_generator_TryState_js, TryState = $__282.TryState; 
  var $__283 = $src_util_util_js, createObject = $__283.createObject; 
  function FinallyState(finallyState, fallThroughState, allStates, nestedTrys) { 
    TryState.call(this, TryState.Kind.FINALLY, allStates, nestedTrys); 
    this.finallyState = finallyState; 
    this.fallThroughState = fallThroughState; 
  } 
  FinallyState.prototype = createObject(TryState.prototype, { replaceState: function(oldState, newState) { 
      return new FinallyState(State.replaceStateId(this.finallyState, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.replaceAllStates(oldState, newState), this.replaceNestedTrys(oldState, newState)); 
    } }); 
  return Object.preventExtensions(Object.create(null, { FinallyState: { 
      get: function() { 
        return FinallyState; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_StateAllocator_js =(function() { 
  "use strict"; 
  var $__284 = $src_codegeneration_generator_State_js, State = $__284.State; 
  function StateAllocator() { } 
  StateAllocator.prototype = { 
    nextState_: State.INVALID_STATE + 1, 
    allocateState: function() { 
      return this.nextState_ ++; 
    } 
  }; 
  return Object.preventExtensions(Object.create(null, { StateAllocator: { 
      get: function() { 
        return StateAllocator; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_SwitchState_js =(function() { 
  "use strict"; 
  var $__285 = $src_syntax_trees_ParseTrees_js, CaseClause = $__285.CaseClause, DefaultClause = $__285.DefaultClause, SwitchStatement = $__285.SwitchStatement; 
  var $__286 = $src_codegeneration_generator_State_js, State = $__286.State; 
  var $__287 = $src_codegeneration_ParseTreeFactory_js, createBreakStatement = $__287.createBreakStatement, createStatementList = $__287.createStatementList; 
  var $__288 = $src_util_util_js, createObject = $__288.createObject; 
  function SwitchClause(first, second) { 
    this.first = first; 
    this.second = second; 
  } 
  function SwitchState(id, expression, clauses) { 
    State.call(this, id); 
    this.expression = expression; 
    this.clauses = clauses; 
  } 
  SwitchState.prototype = createObject(State.prototype, { 
    replaceState: function(oldState, newState) { 
      var clauses = this.clauses.map((function(clause) { 
        return new SwitchClause(clause.first, State.replaceStateId(clause.second, oldState, newState)); 
      })); 
      return new SwitchState(State.replaceStateId(this.id, oldState, newState), this.expression, clauses); 
    }, 
    transform: function(enclosingFinally, machineEndState, reporter) { 
      var clauses =[]; 
      for(var i = 0; i < this.clauses.length; i ++) { 
        var clause = this.clauses[i]; 
        if(clause.first == null) { 
          clauses.push(new DefaultClause(null, State.generateJump(enclosingFinally, clause.second))); 
        } else { 
          clauses.push(new CaseClause(null, clause.first, State.generateJump(enclosingFinally, clause.second))); 
        } 
      } 
      return createStatementList(new SwitchStatement(null, this.expression, clauses), createBreakStatement()); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { 
    SwitchClause: { 
      get: function() { 
        return SwitchClause; 
      }, 
      enumerable: true 
    }, 
    SwitchState: { 
      get: function() { 
        return SwitchState; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var $src_codegeneration_generator_CPSTransformer_js =(function() { 
  "use strict"; 
  var $__289 = $src_codegeneration_generator_BreakContinueTransformer_js, BreakContinueTransformer = $__289.BreakContinueTransformer; 
  var $__290 = $src_syntax_trees_ParseTreeType_js, CASE_CLAUSE = $__290.CASE_CLAUSE, STATE_MACHINE = $__290.STATE_MACHINE, VARIABLE_DECLARATION_LIST = $__290.VARIABLE_DECLARATION_LIST, VARIABLE_STATEMENT = $__290.VARIABLE_STATEMENT; 
  var $__291 = $src_syntax_trees_ParseTrees_js, CaseClause = $__291.CaseClause, IdentifierExpression = $__291.IdentifierExpression, SwitchStatement = $__291.SwitchStatement; 
  var $__292 = $src_codegeneration_generator_CatchState_js, CatchState = $__292.CatchState; 
  var $__293 = $src_codegeneration_generator_ConditionalState_js, ConditionalState = $__293.ConditionalState; 
  var $__294 = $src_codegeneration_generator_FallThroughState_js, FallThroughState = $__294.FallThroughState; 
  var $__295 = $src_codegeneration_generator_FinallyFallThroughState_js, FinallyFallThroughState = $__295.FinallyFallThroughState; 
  var $__296 = $src_codegeneration_generator_FinallyState_js, FinallyState = $__296.FinallyState; 
  var $__297 = $src_syntax_IdentifierToken_js, IdentifierToken = $__297.IdentifierToken; 
  var $__298 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__298.ParseTreeTransformer; 
  var $__299 = $src_syntax_PredefinedName_js, $ARGUMENTS = $__299.$ARGUMENTS, $THAT = $__299.$THAT, ARGUMENTS = $__299.ARGUMENTS, CAUGHT_EXCEPTION = $__299.CAUGHT_EXCEPTION, FINALLY_FALL_THROUGH = $__299.FINALLY_FALL_THROUGH, STATE = $__299.STATE, STORED_EXCEPTION = $__299.STORED_EXCEPTION; 
  var $__300 = $src_codegeneration_generator_State_js, State = $__300.State; 
  var $__301 = $src_codegeneration_generator_StateAllocator_js, StateAllocator = $__301.StateAllocator; 
  var $__302 = $src_syntax_trees_StateMachine_js, StateMachine = $__302.StateMachine; 
  var $__303 = $src_codegeneration_generator_SwitchState_js, SwitchClause = $__303.SwitchClause, SwitchState = $__303.SwitchState; 
  var $__304 = $src_syntax_TokenType_js, TokenType = $__304.TokenType; 
  var $__305 = $src_codegeneration_generator_TryState_js, TryState = $__305.TryState; 
  var $__306 = $src_codegeneration_ParseTreeFactory_js, createArrayLiteralExpression = $__306.createArrayLiteralExpression, createAssignStateStatement = $__306.createAssignStateStatement, createAssignmentExpression = $__306.createAssignmentExpression, createAssignmentStatement = $__306.createAssignmentStatement, createBinaryOperator = $__306.createBinaryOperator, createBindingIdentifier = $__306.createBindingIdentifier, createBlock = $__306.createBlock, createBoundCall = $__306.createBoundCall, createBreakStatement = $__306.createBreakStatement, createCaseClause = $__306.createCaseClause, createCatch = $__306.createCatch, createDefaultClause = $__306.createDefaultClause, createEmptyParameterList = $__306.createEmptyParameterList, createEmptyStatement = $__306.createEmptyStatement, createExpressionStatement = $__306.createExpressionStatement, createFunctionExpression = $__306.createFunctionExpression, createIdentifierExpression = $__306.createIdentifierExpression, createIdentifierToken = $__306.createIdentifierToken, createNumberLiteral = $__306.createNumberLiteral, createOperatorToken = $__306.createOperatorToken, createStatementList = $__306.createStatementList, createStringLiteral = $__306.createStringLiteral, createSwitchStatement = $__306.createSwitchStatement, createThisExpression = $__306.createThisExpression, createThrowStatement = $__306.createThrowStatement, createTrueLiteral = $__306.createTrueLiteral, createTryStatement = $__306.createTryStatement, createVariableStatement = $__306.createVariableStatement, createWhileStatement = $__306.createWhileStatement; 
  var $__307 = $src_util_util_js, createObject = $__307.createObject; 
  var $__308 = $src_semantics_VariableBinder_js, variablesInBlock = $__308.variablesInBlock; 
  var CPSTransformer = traceur.runtime.createClass({ 
    constructor: function(reporter) { 
      traceur.runtime.superCall(this, CPSTransformer, "constructor",[]); 
      this.reporter = reporter; 
      this.stateAllocator_ = new StateAllocator(); 
      this.labelSet_ = Object.create(null); 
    }, 
    allocateState: function() { 
      return this.stateAllocator_.allocateState(); 
    }, 
    transformBlock: function(tree) { 
      this.clearLabels_(); 
      var transformedTree = traceur.runtime.superCall(this, CPSTransformer, "transformBlock",[tree]); 
      var machine = this.transformStatementList_(transformedTree.statements); 
      return machine == null ? transformedTree: machine; 
    }, 
    transformStatementList_: function(someTransformed) { 
      if(! this.containsStateMachine_(someTransformed)) { 
        return null; 
      } 
      var currentMachine = this.ensureTransformed_(someTransformed[0]); 
      for(var index = 1; index < someTransformed.length; index ++) { 
        currentMachine = this.createSequence_(currentMachine, this.ensureTransformed_(someTransformed[index])); 
      } 
      return currentMachine; 
    }, 
    containsStateMachine_: function(statements) { 
      if(statements instanceof Array) { 
        for(var i = 0; i < statements.length; i ++) { 
          if(statements[i].type == STATE_MACHINE) { 
            return true; 
          } 
        } 
        return false; 
      } 
      traceur.assert(statements instanceof SwitchStatement); 
      for(var i = 0; i < statements.caseClauses.length; i ++) { 
        var clause = statements.caseClauses[i]; 
        if(clause.type == CASE_CLAUSE) { 
          if(this.containsStateMachine_(clause.statements)) { 
            return true; 
          } 
        } else { 
          if(this.containsStateMachine_(clause.statements)) { 
            return true; 
          } 
        } 
      } 
      return false; 
    }, 
    transformCaseClause: function(tree) { 
      var result = traceur.runtime.superCall(this, CPSTransformer, "transformCaseClause",[tree]); 
      var machine = this.transformStatementList_(result.statements); 
      return machine == null ? result: new CaseClause(null, result.expression, createStatementList(machine)); 
    }, 
    transformDoWhileStatement: function(tree) { 
      var labels = this.clearLabels_(); 
      var result = traceur.runtime.superCall(this, CPSTransformer, "transformDoWhileStatement",[tree]); 
      if(result.body.type != STATE_MACHINE) { 
        return result; 
      } 
      var loopBodyMachine = result.body; 
      var startState = loopBodyMachine.startState; 
      var conditionState = loopBodyMachine.fallThroughState; 
      var fallThroughState = this.allocateState(); 
      var states =[]; 
      this.addLoopBodyStates_(loopBodyMachine, conditionState, fallThroughState, labels, states); 
      states.push(new ConditionalState(conditionState, startState, fallThroughState, result.condition)); 
      return new StateMachine(startState, fallThroughState, states, loopBodyMachine.exceptionBlocks); 
    }, 
    addLoopBodyStates_: function(loopBodyMachine, continueState, breakState, labels, states) { 
      for(var i = 0; i < loopBodyMachine.states.length; i ++) { 
        var state = loopBodyMachine.states[i]; 
        states.push(state.transformBreakOrContinue(labels, breakState, continueState)); 
      } 
    }, 
    transformForStatement: function(tree) { 
      var labels = this.clearLabels_(); 
      var result = traceur.runtime.superCall(this, CPSTransformer, "transformForStatement",[tree]); 
      if(result.body.type != STATE_MACHINE) { 
        return result; 
      } 
      var loopBodyMachine = result.body; 
      var incrementState = loopBodyMachine.fallThroughState; 
      var conditionState = result.increment == null && result.condition != null ? incrementState: this.allocateState(); 
      var startState = result.initializer == null ? conditionState: this.allocateState(); 
      var fallThroughState = this.allocateState(); 
      var states =[]; 
      if(result.initializer != null) { 
        states.push(new FallThroughState(startState, conditionState, createStatementList(createExpressionStatement(result.initializer)))); 
      } 
      if(result.condition != null) { 
        states.push(new ConditionalState(conditionState, loopBodyMachine.startState, fallThroughState, result.condition)); 
      } else { 
        states.push(new FallThroughState(conditionState, loopBodyMachine.startState, createStatementList())); 
      } 
      if(result.increment != null) { 
        states.push(new FallThroughState(incrementState, conditionState, createStatementList(createExpressionStatement(result.increment)))); 
      } 
      this.addLoopBodyStates_(loopBodyMachine, incrementState, fallThroughState, labels, states); 
      return new StateMachine(startState, fallThroughState, states, loopBodyMachine.exceptionBlocks); 
    }, 
    transformForInStatement: function(tree) { 
      return tree; 
    }, 
    transformForOfStatement: function(tree) { 
      throw new Error('for of statements should be transformed before this pass'); 
    }, 
    transformIfStatement: function(tree) { 
      this.clearLabels_(); 
      var result = traceur.runtime.superCall(this, CPSTransformer, "transformIfStatement",[tree]); 
      if(result.ifClause.type != STATE_MACHINE &&(result.elseClause == null || result.elseClause.type != STATE_MACHINE)) { 
        return result; 
      } 
      var ifClause = this.ensureTransformed_(result.ifClause); 
      var elseClause = this.ensureTransformed_(result.elseClause); 
      var startState = this.allocateState(); 
      var fallThroughState = ifClause.fallThroughState; 
      var ifState = ifClause.startState; 
      var elseState = elseClause == null ? fallThroughState: elseClause.startState; 
      var states =[]; 
      var exceptionBlocks =[]; 
      states.push(new ConditionalState(startState, ifState, elseState, result.condition)); 
      states.push.apply(states, ifClause.states); 
      exceptionBlocks.push.apply(exceptionBlocks, ifClause.exceptionBlocks); 
      if(elseClause != null) { 
        this.replaceAndAddStates_(elseClause.states, elseClause.fallThroughState, fallThroughState, states); 
        exceptionBlocks.push.apply(exceptionBlocks, State.replaceAllStates(elseClause.exceptionBlocks, elseClause.fallThroughState, fallThroughState)); 
      } 
      return new StateMachine(startState, fallThroughState, states, exceptionBlocks); 
    }, 
    replaceAndAddStates_: function(oldStates, oldState, newState, newStates) { 
      for(var i = 0; i < oldStates.length; i ++) { 
        newStates.push(oldStates[i].replaceState(oldState, newState)); 
      } 
    }, 
    transformLabelledStatement: function(tree) { 
      var oldLabels = this.addLabel_(tree.name.value); 
      var result = this.transformAny(tree.statement); 
      this.restoreLabels_(oldLabels); 
      return result; 
    }, 
    clearLabels_: function() { 
      var result = this.labelSet_; 
      this.labelSet_ = Object.create(null); 
      return result; 
    }, 
    restoreLabels_: function(oldLabels) { 
      this.labelSet_ = oldLabels; 
    }, 
    addLabel_: function(label) { 
      var oldLabels = this.labelSet_; 
      var labelSet = Object.create(null); 
      for(var k in this.labelSet_) { 
        labelSet[k]= k; 
      } 
      labelSet[label]= label; 
      this.labelSet_ = labelSet; 
      return oldLabels; 
    }, 
    transformSwitchStatement: function(tree) { 
      var labels = this.clearLabels_(); 
      var result = traceur.runtime.superCall(this, CPSTransformer, "transformSwitchStatement",[tree]); 
      if(! this.containsStateMachine_(result)) { 
        return result; 
      } 
      var startState = this.allocateState(); 
      var fallThroughState = this.allocateState(); 
      var nextState = fallThroughState; 
      var states =[]; 
      var clauses =[]; 
      var tryStates =[]; 
      var hasDefault = false; 
      for(var index = result.caseClauses.length - 1; index >= 0; index --) { 
        var clause = result.caseClauses[index]; 
        if(clause.type == CASE_CLAUSE) { 
          var caseClause = clause; 
          nextState = this.addSwitchClauseStates_(nextState, fallThroughState, labels, caseClause.statements, states, tryStates); 
          clauses.push(new SwitchClause(caseClause.expression, nextState)); 
        } else { 
          hasDefault = true; 
          var defaultClause = clause; 
          nextState = this.addSwitchClauseStates_(nextState, fallThroughState, labels, defaultClause.statements, states, tryStates); 
          clauses.push(new SwitchClause(null, nextState)); 
        } 
      } 
      if(! hasDefault) { 
        clauses.push(new SwitchClause(null, fallThroughState)); 
      } 
      states.push(new SwitchState(startState, result.expression, clauses.reverse())); 
      return new StateMachine(startState, fallThroughState, states.reverse(), tryStates); 
    }, 
    addSwitchClauseStates_: function(nextState, fallThroughState, labels, statements, states, tryStates) { 
      var machine = this.ensureTransformedList_(statements); 
      for(var i = 0; i < machine.states.length; i ++) { 
        var state = machine.states[i]; 
        var transformedState = state.transformBreak(labels, fallThroughState); 
        states.push(transformedState.replaceState(machine.fallThroughState, nextState)); 
      } 
      tryStates.push.apply(tryStates, machine.exceptionBlocks); 
      return machine.startState; 
    }, 
    transformTryStatement: function(tree) { 
      this.clearLabels_(); 
      var result = traceur.runtime.superCall(this, CPSTransformer, "transformTryStatement",[tree]); 
      if(result.body.type != STATE_MACHINE &&(result.catchBlock == null || result.catchBlock.catchBody.type != STATE_MACHINE)) { 
        return result; 
      } 
      var tryMachine = this.ensureTransformed_(result.body); 
      if(result.catchBlock != null) { 
        var catchBlock = result.catchBlock; 
        var exceptionName = catchBlock.binding.identifierToken.value; 
        var catchMachine = this.ensureTransformed_(catchBlock.catchBody); 
        var startState = tryMachine.startState; 
        var fallThroughState = tryMachine.fallThroughState; 
        var catchStart = this.allocateState(); 
        var states =[]; 
        states.push.apply(states, tryMachine.states); 
        states.push(new FallThroughState(catchStart, catchMachine.startState, createStatementList(createAssignmentStatement(createIdentifierExpression(exceptionName), createIdentifierExpression(STORED_EXCEPTION))))); 
        this.replaceAndAddStates_(catchMachine.states, catchMachine.fallThroughState, fallThroughState, states); 
        tryMachine = new StateMachine(startState, fallThroughState, states,[new CatchState(exceptionName, catchStart, fallThroughState, tryMachine.getAllStateIDs(), tryMachine.exceptionBlocks)]); 
      } 
      if(result.finallyBlock != null) { 
        var finallyBlock = result.finallyBlock; 
        var finallyMachine = this.ensureTransformed_(finallyBlock.block); 
        var startState = tryMachine.startState; 
        var fallThroughState = tryMachine.fallThroughState; 
        var states =[]; 
        states.push.apply(states, tryMachine.states); 
        states.push.apply(states, finallyMachine.states); 
        states.push(new FinallyFallThroughState(finallyMachine.fallThroughState)); 
        tryMachine = new StateMachine(startState, fallThroughState, states,[new FinallyState(finallyMachine.startState, finallyMachine.fallThroughState, tryMachine.getAllStateIDs(), tryMachine.exceptionBlocks)]); 
      } 
      return tryMachine; 
    }, 
    transformVariableStatement: function(tree) { 
      var declarations = this.transformVariableDeclarationList(tree.declarations); 
      if(declarations == tree.declarations) { 
        return tree; 
      } 
      if(declarations == null) { 
        return createEmptyStatement(); 
      } 
      if(declarations.type == VARIABLE_DECLARATION_LIST) { 
        return createVariableStatement(declarations); 
      } 
      return createExpressionStatement(declarations); 
    }, 
    transformVariableDeclarationList: function(tree) { 
      if(tree.declarationType == TokenType.VAR) { 
        var expressions =[]; 
        for(var i = 0; i < tree.declarations.length; i ++) { 
          var declaration = tree.declarations[i]; 
          if(declaration.initializer != null) { 
            expressions.push(createAssignmentExpression(createIdentifierExpression(this.transformAny(declaration.lvalue)), this.transformAny(declaration.initializer))); 
          } 
        } 
        var list = expressions; 
        if(list.length == 0) { 
          return null; 
        } else if(list.length == 1) { 
          return list[0]; 
        } else { 
          return createArrayLiteralExpression(expressions); 
        } 
      } 
      return traceur.runtime.superCall(this, CPSTransformer, "transformVariableDeclarationList",[tree]); 
    }, 
    transformWhileStatement: function(tree) { 
      var labels = this.clearLabels_(); 
      var result = traceur.runtime.superCall(this, CPSTransformer, "transformWhileStatement",[tree]); 
      if(result.body.type != STATE_MACHINE) { 
        return result; 
      } 
      var loopBodyMachine = result.body; 
      var startState = loopBodyMachine.fallThroughState; 
      var fallThroughState = this.allocateState(); 
      var states =[]; 
      states.push(new ConditionalState(startState, loopBodyMachine.startState, fallThroughState, result.condition)); 
      this.addLoopBodyStates_(loopBodyMachine, startState, fallThroughState, labels, states); 
      return new StateMachine(startState, fallThroughState, states, loopBodyMachine.exceptionBlocks); 
    }, 
    transformWithStatement: function(tree) { 
      var result = traceur.runtime.superCall(this, CPSTransformer, "transformWithStatement",[tree]); 
      if(result.body.type != STATE_MACHINE) { 
        return result; 
      } 
      throw new Error('Unreachable - with statement not allowed in strict mode/harmony'); 
    }, 
    transformThisExpression: function(tree) { 
      return new IdentifierExpression(tree.location, new IdentifierToken(tree.location, $THAT)); 
    }, 
    transformIdentifierExpression: function(tree) { 
      if(tree.identifierToken.value === ARGUMENTS) { 
        return new IdentifierExpression(tree.location, new IdentifierToken(tree.location, $ARGUMENTS)); 
      } 
      return tree; 
    }, 
    generateMachineMethod: function(machine) { 
      return createFunctionExpression(createEmptyParameterList(), createBlock(createWhileStatement(createTrueLiteral(), this.generateMachine(machine)))); 
    }, 
    generateHoistedThis: function() { 
      return createVariableStatement(TokenType.VAR, $THAT, createThisExpression()); 
    }, 
    generateHoistedArguments: function() { 
      return createVariableStatement(TokenType.VAR, $ARGUMENTS, createIdentifierExpression(ARGUMENTS)); 
    }, 
    generateMachine: function(machine) { 
      var enclosingFinallyState = machine.getEnclosingFinallyMap(); 
      var enclosingCatchState = machine.getEnclosingCatchMap(); 
      var rethrowState = this.allocateState(); 
      var machineEndState = this.allocateState(); 
      var body = createSwitchStatement(createIdentifierExpression(STATE), this.transformMachineStates(machine, machineEndState, rethrowState, enclosingFinallyState)); 
      var caseClauses =[]; 
      this.addExceptionCases_(rethrowState, enclosingFinallyState, enclosingCatchState, machine.getAllStateIDs(), caseClauses); 
      caseClauses.push(createDefaultClause(this.machineUncaughtExceptionStatements(rethrowState))); 
      body = createTryStatement(createBlock(body), createCatch(createBindingIdentifier(CAUGHT_EXCEPTION), createBlock(createAssignmentStatement(createIdentifierExpression(STORED_EXCEPTION), createIdentifierExpression(CAUGHT_EXCEPTION)), createSwitchStatement(createIdentifierExpression(STATE), caseClauses))), null); 
      return body; 
    }, 
    getMachineVariables: function(tree, machine) { 
      var statements =[]; 
      statements.push(createVariableStatement(TokenType.VAR, STATE, createNumberLiteral(machine.startState))); 
      statements.push(createVariableStatement(TokenType.VAR, STORED_EXCEPTION, null)); 
      statements.push(createVariableStatement(TokenType.VAR, FINALLY_FALL_THROUGH, null)); 
      var liftedIdentifiers = variablesInBlock(tree, true); 
      var allCatchStates = machine.allCatchStates(); 
      for(var i = 0; i < allCatchStates.length; i ++) { 
        liftedIdentifiers[allCatchStates[i].identifier]= true; 
      } 
      var liftedIdentifierList = Object.keys(liftedIdentifiers).sort(); 
      for(var i = 0; i < liftedIdentifierList.length; i ++) { 
        var liftedIdentifier = liftedIdentifierList[i]; 
        statements.push(createVariableStatement(TokenType.VAR, liftedIdentifier, null)); 
      } 
      return statements; 
    }, 
    addExceptionCases_: function(rethrowState, enclosingFinallyState, enclosingCatchState, allStates, caseClauses) { 
      for(var i = 0; i < allStates.length; i ++) { 
        var state = allStates[i]; 
        var finallyState = enclosingFinallyState[state]; 
        var catchState = enclosingCatchState[state]; 
        if(catchState != null && finallyState != null && catchState.tryStates.indexOf(finallyState.finallyState) >= 0) { 
          caseClauses.push(createCaseClause(createNumberLiteral(state), State.generateJumpThroughFinally(finallyState.finallyState, catchState.catchState))); 
        } else if(catchState != null) { 
          caseClauses.push(createCaseClause(createNumberLiteral(state), createStatementList(createAssignStateStatement(catchState.catchState), createBreakStatement()))); 
        } else if(finallyState != null) { 
          caseClauses.push(createCaseClause(createNumberLiteral(state), State.generateJumpThroughFinally(finallyState.finallyState, rethrowState))); 
        } else { } 
      } 
    }, 
    transformFunctionDeclaration: function(tree) { 
      this.clearLabels_(); 
      return tree; 
    }, 
    transformGetAccessor: function(tree) { 
      return tree; 
    }, 
    transformSetAccessor: function(tree) { 
      return tree; 
    }, 
    transformStateMachine: function(tree) { 
      return tree; 
    }, 
    statementToStateMachine_: function(statement) { 
      return this.statementsToStateMachine_([statement]); 
    }, 
    statementsToStateMachine_: function(statements) { 
      var startState = this.allocateState(); 
      var fallThroughState = this.allocateState(); 
      return this.stateToStateMachine_(new FallThroughState(startState, fallThroughState, statements), fallThroughState); 
    }, 
    stateToStateMachine_: function(newState, fallThroughState) { 
      return new StateMachine(newState.id, fallThroughState,[newState],[]); 
    }, 
    transformMachineStates: function(machine, machineEndState, rethrowState, enclosingFinallyState) { 
      var cases =[]; 
      for(var i = 0; i < machine.states.length; i ++) { 
        var state = machine.states[i]; 
        var stateCase = state.transformMachineState(enclosingFinallyState[state.id], machineEndState, this.reporter); 
        if(stateCase != null) { 
          cases.push(stateCase); 
        } 
      } 
      this.addFinallyFallThroughDispatches(null, machine.exceptionBlocks, cases); 
      cases.push(createCaseClause(createNumberLiteral(machine.fallThroughState), this.machineFallThroughStatements(machineEndState))); 
      cases.push(createCaseClause(createNumberLiteral(machineEndState), this.machineEndStatements())); 
      cases.push(createCaseClause(createNumberLiteral(rethrowState), this.machineRethrowStatements(machineEndState))); 
      cases.push(createDefaultClause([createThrowStatement(createBinaryOperator(createStringLiteral('traceur compiler bug: invalid state in state machine'), createOperatorToken(TokenType.PLUS), createIdentifierExpression(STATE)))])); 
      return cases; 
    }, 
    addFinallyFallThroughDispatches: function(enclosingFinallyState, tryStates, cases) { 
      for(var i = 0; i < tryStates.length; i ++) { 
        var tryState = tryStates[i]; 
        if(tryState.kind == TryState.Kind.FINALLY) { 
          var finallyState = tryState; 
          if(enclosingFinallyState != null) { 
            var caseClauses =[]; 
            var index = 0; 
            for(var j = 0; j < enclosingFinallyState.tryStates.length; j ++) { 
              var destination = enclosingFinallyState.tryStates[j]; 
              index ++; 
              var statements; 
              if(index < enclosingFinallyState.tryStates.length) { 
                statements = createStatementList(); 
              } else { 
                statements = createStatementList(createAssignmentStatement(createIdentifierExpression(STATE), createIdentifierExpression(FINALLY_FALL_THROUGH)), createAssignmentStatement(createIdentifierExpression(FINALLY_FALL_THROUGH), createNumberLiteral(State.INVALID_STATE)), createBreakStatement()); 
              } 
              caseClauses.push(createCaseClause(createNumberLiteral(destination), statements)); 
            } 
            caseClauses.push(createDefaultClause(createStatementList(createAssignStateStatement(enclosingFinallyState.finallyState), createBreakStatement()))); 
            cases.push(createCaseClause(createNumberLiteral(finallyState.fallThroughState), createStatementList(createSwitchStatement(createIdentifierExpression(FINALLY_FALL_THROUGH), caseClauses), createBreakStatement()))); 
          } else { 
            cases.push(createCaseClause(createNumberLiteral(finallyState.fallThroughState), createStatementList(createAssignmentStatement(createIdentifierExpression(STATE), createIdentifierExpression(FINALLY_FALL_THROUGH)), createBreakStatement()))); 
          } 
          this.addFinallyFallThroughDispatches(finallyState, finallyState.nestedTrys, cases); 
        } else { 
          this.addFinallyFallThroughDispatches(enclosingFinallyState, tryState.nestedTrys, cases); 
        } 
      } 
    }, 
    createSequence_: function(head, tail) { 
      var states =[]; 
      states.push.apply(states, head.states); 
      for(var i = 0; i < tail.states.length; i ++) { 
        var tailState = tail.states[i]; 
        states.push(tailState.replaceState(tail.startState, head.fallThroughState)); 
      } 
      var exceptionBlocks =[]; 
      exceptionBlocks.push.apply(exceptionBlocks, head.exceptionBlocks); 
      for(var i = 0; i < tail.exceptionBlocks.length; i ++) { 
        var tryState = tail.exceptionBlocks[i]; 
        exceptionBlocks.push(tryState.replaceState(tail.startState, head.fallThroughState)); 
      } 
      return new StateMachine(head.startState, tail.fallThroughState, states, exceptionBlocks); 
    }, 
    maybeTransformStatement_: function(maybeTransformedStatement) { 
      if(maybeTransformedStatement.type == VARIABLE_STATEMENT && maybeTransformedStatement.declarations.declarationType != TokenType.VAR) { 
        this.reporter.reportError(maybeTransformedStatement.location != null ? maybeTransformedStatement.location.start: null, 'traceur: const/let declaration may not be in a block containing a yield.'); 
      } 
      var breakContinueTransformed = new BreakContinueTransformer(this.stateAllocator_).transformAny(maybeTransformedStatement); 
      if(breakContinueTransformed != maybeTransformedStatement) { 
        breakContinueTransformed = this.transformAny(breakContinueTransformed); 
      } 
      return breakContinueTransformed; 
    }, 
    ensureTransformed_: function(statement) { 
      if(statement == null) { 
        return null; 
      } 
      var maybeTransformed = this.maybeTransformStatement_(statement); 
      return maybeTransformed.type == STATE_MACHINE ? maybeTransformed: this.statementToStateMachine_(maybeTransformed); 
    }, 
    ensureTransformedList_: function(statements) { 
      var maybeTransformedStatements =[]; 
      var foundMachine = false; 
      for(var i = 0; i < statements.length; i ++) { 
        var statement = statements[i]; 
        var maybeTransformedStatement = this.maybeTransformStatement_(statement); 
        maybeTransformedStatements.push(maybeTransformedStatement); 
        if(maybeTransformedStatement.type == STATE_MACHINE) { 
          foundMachine = true; 
        } 
      } 
      if(! foundMachine) { 
        return this.statementsToStateMachine_(statements); 
      } 
      return this.transformStatementList_(maybeTransformedStatements); 
    } 
  }, ParseTreeTransformer, true, true); 
  return Object.preventExtensions(Object.create(null, { CPSTransformer: { 
      get: function() { 
        return CPSTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_EndState_js =(function() { 
  "use strict"; 
  var $__309 = $src_codegeneration_generator_State_js, State = $__309.State; 
  var $__310 = $src_util_util_js, createObject = $__310.createObject; 
  function EndState(id) { 
    State.call(this, id); 
  } 
  EndState.prototype = createObject(State.prototype, { 
    replaceState: function(oldState, newState) { 
      return new EndState(State.replaceStateId(this.id, oldState, newState)); 
    }, 
    transform: function(enclosingFinally, machineEndState, reporter) { 
      return State.generateJump(enclosingFinally, machineEndState); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { EndState: { 
      get: function() { 
        return EndState; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_AsyncTransformer_js =(function() { 
  "use strict"; 
  var $__311 = $src_codegeneration_generator_CPSTransformer_js, CPSTransformer = $__311.CPSTransformer; 
  var $__312 = $src_codegeneration_generator_EndState_js, EndState = $__312.EndState; 
  var $__313 = $src_codegeneration_generator_FallThroughState_js, FallThroughState = $__313.FallThroughState; 
  var $__314 = $src_syntax_PredefinedName_js, $VALUE = $__314.$VALUE, CALLBACK = $__314.CALLBACK, CONTINUATION = $__314.CONTINUATION, CREATE_CALLBACK = $__314.CREATE_CALLBACK, CREATE_ERRBACK = $__314.CREATE_ERRBACK, CREATE_PROMISE = $__314.CREATE_PROMISE, DEFERRED = $__314.DEFERRED, ERR = $__314.ERR, ERRBACK = $__314.ERRBACK, NEW_STATE = $__314.NEW_STATE, RESULT = $__314.RESULT, STATE = $__314.STATE, STORED_EXCEPTION = $__314.STORED_EXCEPTION, THEN = $__314.THEN, WAIT_TASK = $__314.WAIT_TASK; 
  var $__315 = $src_syntax_trees_ParseTreeType_js, STATE_MACHINE = $__315.STATE_MACHINE; 
  var $__316 = $src_syntax_trees_StateMachine_js, StateMachine = $__316.StateMachine; 
  var $__317 = $src_syntax_TokenType_js, TokenType = $__317.TokenType; 
  var $__318 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__318.createArgumentList, createAssignStateStatement = $__318.createAssignStateStatement, createAssignmentStatement = $__318.createAssignmentStatement, createBlock = $__318.createBlock, createBreakStatement = $__318.createBreakStatement, createCallExpression = $__318.createCallExpression, createCallStatement = $__318.createCallStatement, createEmptyArgumentList = $__318.createEmptyArgumentList, createFunctionExpression = $__318.createFunctionExpression, createIdentifierExpression = $__318.createIdentifierExpression, createMemberExpression = $__318.createMemberExpression, createNewExpression = $__318.createNewExpression, createNumberLiteral = $__318.createNumberLiteral, createParameterList = $__318.createParameterList, createParameterReference = $__318.createParameterReference, createReturnStatement = $__318.createReturnStatement, createStatementList = $__318.createStatementList, createThrowStatement = $__318.createThrowStatement, createUndefinedExpression = $__318.createUndefinedExpression, createVariableStatement = $__318.createVariableStatement; 
  var $__319 = $src_util_util_js, createObject = $__319.createObject; 
  function AsyncTransformer(reporter) { 
    CPSTransformer.call(this, reporter); 
  } 
  AsyncTransformer.transformAsyncBody = function(reporter, body) { 
    return new AsyncTransformer(reporter).transformAsyncBody(body); 
  }; 
  var proto = CPSTransformer.prototype; 
  AsyncTransformer.prototype = createObject(proto, { 
    transformYieldStatement: function(tree) { 
      this.reporter.reportError(tree.location.start, 'Async function may not have a yield statement.'); 
      return tree; 
    }, 
    transformAwaitStatement: function(tree) { 
      var createTaskState = this.allocateState(); 
      var callbackState = this.allocateState(); 
      var errbackState = this.allocateState(); 
      var fallThroughState = this.allocateState(); 
      var states =[]; 
      states.push(new FallThroughState(createTaskState, callbackState, createStatementList(createAssignmentStatement(createIdentifierExpression(WAIT_TASK), tree.expression), createCallStatement(createMemberExpression(WAIT_TASK, THEN), createArgumentList(createCallExpression(createIdentifierExpression(CREATE_CALLBACK), createArgumentList(createNumberLiteral(callbackState))), createCallExpression(createIdentifierExpression(CREATE_ERRBACK), createArgumentList(createNumberLiteral(errbackState))))), createReturnStatement(null)))); 
      var assignment; 
      if(tree.identifier != null) { 
        assignment = createStatementList(createAssignmentStatement(createIdentifierExpression(tree.identifier), createIdentifierExpression($VALUE))); 
      } else { 
        assignment = createStatementList(); 
      } 
      states.push(new FallThroughState(callbackState, fallThroughState, assignment)); 
      states.push(new FallThroughState(errbackState, fallThroughState, createStatementList(createThrowStatement(createIdentifierExpression(ERR))))); 
      return new StateMachine(createTaskState, fallThroughState, states,[]); 
    }, 
    transformFinally: function(tree) { 
      var result = proto.transformFinally.call(this, tree); 
      if(result.block.type != STATE_MACHINE) { 
        return result; 
      } 
      this.reporter.reportError(tree.location.start, 'async not permitted within a finally block.'); 
      return result; 
    }, 
    transformReturnStatement: function(tree) { 
      var result = tree.expression; 
      if(result == null) { 
        result = createUndefinedExpression(); 
      } 
      var startState = this.allocateState(); 
      var endState = this.allocateState(); 
      var completeState = new FallThroughState(startState, endState, createStatementList(this.createCompleteTask_(result))); 
      var end = new EndState(endState); 
      return new StateMachine(startState, this.allocateState(),[completeState, end],[]); 
    }, 
    createCompleteTask_: function(result) { 
      return createCallStatement(createMemberExpression(RESULT, CALLBACK), createArgumentList(result)); 
    }, 
    transformAsyncBody: function(tree) { 
      var transformedTree = this.transformAny(tree); 
      if(this.reporter.hadError()) { 
        return tree; 
      } 
      var machine = transformedTree; 
      var statements =[]; 
      statements.push(this.generateHoistedThis()); 
      statements.push.apply(statements, this.getMachineVariables(tree, machine)); 
      statements.push(createVariableStatement(TokenType.VAR, $VALUE, null)); 
      statements.push(createVariableStatement(TokenType.VAR, ERR, null)); 
      statements.push(createVariableStatement(TokenType.VAR, RESULT, createNewExpression(createIdentifierExpression(DEFERRED), createEmptyArgumentList()))); 
      statements.push(createVariableStatement(TokenType.VAR, WAIT_TASK, null)); 
      statements.push(createVariableStatement(TokenType.VAR, CONTINUATION, this.generateMachineMethod(machine))); 
      statements.push(createVariableStatement(TokenType.VAR, CREATE_CALLBACK, createFunctionExpression(createParameterList(NEW_STATE), createBlock(createReturnStatement(createFunctionExpression(createParameterList(1), createBlock(createAssignmentStatement(createIdentifierExpression(STATE), createIdentifierExpression(NEW_STATE)), createAssignmentStatement(createIdentifierExpression($VALUE), createParameterReference(0)), createCallStatement(createIdentifierExpression(CONTINUATION))))))))); 
      statements.push(createVariableStatement(TokenType.VAR, CREATE_ERRBACK, createFunctionExpression(createParameterList(NEW_STATE), createBlock(createReturnStatement(createFunctionExpression(createParameterList(1), createBlock(createAssignmentStatement(createIdentifierExpression(STATE), createIdentifierExpression(NEW_STATE)), createAssignmentStatement(createIdentifierExpression(ERR), createParameterReference(0)), createCallStatement(createIdentifierExpression(CONTINUATION))))))))); 
      statements.push(createCallStatement(createIdentifierExpression(CONTINUATION))); 
      statements.push(createReturnStatement(createCallExpression(createMemberExpression(RESULT, CREATE_PROMISE)))); 
      return createBlock(statements); 
    }, 
    machineUncaughtExceptionStatements: function(rethrowState) { 
      return createStatementList(createAssignStateStatement(rethrowState), createBreakStatement()); 
    }, 
    machineEndStatements: function() { 
      return createStatementList(createReturnStatement(null)); 
    }, 
    machineFallThroughStatements: function(machineEndState) { 
      return createStatementList(this.createCompleteTask_(createUndefinedExpression()), createAssignStateStatement(machineEndState), createBreakStatement()); 
    }, 
    machineRethrowStatements: function(machineEndState) { 
      return createStatementList(createCallStatement(createMemberExpression(RESULT, ERRBACK), createArgumentList(createIdentifierExpression(STORED_EXCEPTION))), createAssignStateStatement(machineEndState), createBreakStatement()); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { AsyncTransformer: { 
      get: function() { 
        return AsyncTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_ForInTransformPass_js =(function() { 
  "use strict"; 
  var $__320 = $src_syntax_trees_ParseTreeType_js, BLOCK = $__320.BLOCK, VARIABLE_DECLARATION_LIST = $__320.VARIABLE_DECLARATION_LIST, IDENTIFIER_EXPRESSION = $__320.IDENTIFIER_EXPRESSION; 
  var $__321 = $src_syntax_trees_ParseTrees_js, IdentifierExpression = $__321.IdentifierExpression; 
  var $__322 = $src_syntax_PredefinedName_js, LENGTH = $__322.LENGTH, PUSH = $__322.PUSH; 
  var $__323 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__323.ParseTreeTransformer; 
  var $__324 = $src_syntax_TokenType_js, TokenType = $__324.TokenType; 
  var $__325 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__325.createArgumentList, createAssignmentStatement = $__325.createAssignmentStatement, createBinaryOperator = $__325.createBinaryOperator, createBlock = $__325.createBlock, createCallStatement = $__325.createCallStatement, createContinueStatement = $__325.createContinueStatement, createEmptyArrayLiteralExpression = $__325.createEmptyArrayLiteralExpression, createForInStatement = $__325.createForInStatement, createForStatement = $__325.createForStatement, createIdentifierExpression = $__325.createIdentifierExpression, createIfStatement = $__325.createIfStatement, createMemberExpression = $__325.createMemberExpression, createMemberLookupExpression = $__325.createMemberLookupExpression, createNumberLiteral = $__325.createNumberLiteral, createOperatorToken = $__325.createOperatorToken, createParenExpression = $__325.createParenExpression, createPostfixExpression = $__325.createPostfixExpression, createUnaryExpression = $__325.createUnaryExpression, createVariableDeclarationList = $__325.createVariableDeclarationList, createVariableStatement = $__325.createVariableStatement; 
  var $__326 = $src_util_util_js, createObject = $__326.createObject; 
  var ForInTransformPass = traceur.runtime.createClass({ 
    constructor: function(identifierGenerator) { 
      traceur.runtime.superCall(this, ForInTransformPass, "constructor",[]); 
      this.identifierGenerator_ = identifierGenerator; 
    }, 
    transformForInStatement: function(original) { 
      var tree = original; 
      var bodyStatements =[]; 
      var body = this.transformAny(tree.body); 
      if(body.type == BLOCK) { 
        bodyStatements.push.apply(bodyStatements, body.statements); 
      } else { 
        bodyStatements.push(body); 
      } 
      var elements =[]; 
      var keys = this.identifierGenerator_.generateUniqueIdentifier(); 
      elements.push(createVariableStatement(TokenType.VAR, keys, createEmptyArrayLiteralExpression())); 
      var collection = this.identifierGenerator_.generateUniqueIdentifier(); 
      elements.push(createVariableStatement(TokenType.VAR, collection, tree.collection)); 
      var p = this.identifierGenerator_.generateUniqueIdentifier(); 
      elements.push(createForInStatement(createVariableDeclarationList(TokenType.VAR, p, null), createIdentifierExpression(collection), createCallStatement(createMemberExpression(keys, PUSH), createArgumentList(createIdentifierExpression(p))))); 
      var i = this.identifierGenerator_.generateUniqueIdentifier(); 
      var lookup = createMemberLookupExpression(createIdentifierExpression(keys), createIdentifierExpression(i)); 
      var originalKey, assignOriginalKey; 
      if(tree.initializer.type == VARIABLE_DECLARATION_LIST) { 
        var decList = tree.initializer; 
        originalKey = createIdentifierExpression(decList.declarations[0].lvalue); 
        assignOriginalKey = createVariableStatement(decList.declarationType, originalKey.identifierToken, lookup); 
      } else if(tree.initializer.type == IDENTIFIER_EXPRESSION) { 
        originalKey = tree.initializer; 
        assignOriginalKey = createAssignmentStatement(tree.initializer, lookup); 
      } else { 
        throw new Error('Invalid left hand side of for in loop'); 
      } 
      var innerBlock =[]; 
      innerBlock.push(assignOriginalKey); 
      innerBlock.push(createIfStatement(createUnaryExpression(createOperatorToken(TokenType.BANG), createParenExpression(createBinaryOperator(originalKey, createOperatorToken(TokenType.IN), createIdentifierExpression(collection)))), createContinueStatement(), null)); 
      innerBlock.push.apply(innerBlock, bodyStatements); 
      elements.push(createForStatement(createVariableDeclarationList(TokenType.VAR, i, createNumberLiteral(0)), createBinaryOperator(createIdentifierExpression(i), createOperatorToken(TokenType.OPEN_ANGLE), createMemberExpression(keys, LENGTH)), createPostfixExpression(createIdentifierExpression(i), createOperatorToken(TokenType.PLUS_PLUS)), createBlock(innerBlock))); 
      return createBlock(elements); 
    } 
  }, ParseTreeTransformer, true, true); 
  ForInTransformPass.transformTree = function(identifierGenerator, tree) { 
    return new ForInTransformPass(identifierGenerator).transformAny(tree); 
  }; 
  return Object.preventExtensions(Object.create(null, { ForInTransformPass: { 
      get: function() { 
        return ForInTransformPass; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_YieldState_js =(function() { 
  "use strict"; 
  var $__327 = $src_syntax_PredefinedName_js, CURRENT = $__327.CURRENT, RESULT = $__327.RESULT; 
  var $__328 = $src_codegeneration_generator_State_js, State = $__328.State; 
  var $__329 = $src_codegeneration_ParseTreeFactory_js, createAssignmentStatement = $__329.createAssignmentStatement, createMemberExpression = $__329.createMemberExpression, createReturnStatement = $__329.createReturnStatement, createTrueLiteral = $__329.createTrueLiteral; 
  var $__330 = $src_util_util_js, createObject = $__330.createObject; 
  function YieldState(id, fallThroughState, expression) { 
    State.call(this, id); 
    this.fallThroughState = fallThroughState; 
    this.expression = expression; 
  } 
  YieldState.prototype = createObject(State.prototype, { 
    replaceState: function(oldState, newState) { 
      return new YieldState(State.replaceStateId(this.id, oldState, newState), State.replaceStateId(this.fallThroughState, oldState, newState), this.expression); 
    }, 
    transform: function(enclosingFinally, machineEndState, reporter) { 
      var result =[]; 
      result.push(createAssignmentStatement(createMemberExpression(RESULT, CURRENT), this.expression)); 
      result.push.apply(result, State.generateAssignState(enclosingFinally, this.fallThroughState)); 
      result.push(createReturnStatement(createTrueLiteral())); 
      return result; 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { YieldState: { 
      get: function() { 
        return YieldState; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_generator_GeneratorTransformer_js =(function() { 
  "use strict"; 
  var $__331 = $src_codegeneration_generator_CPSTransformer_js, CPSTransformer = $__331.CPSTransformer; 
  var $__332 = $src_codegeneration_generator_EndState_js, EndState = $__332.EndState; 
  var $__333 = $src_syntax_PredefinedName_js, MARK_AS_GENERATOR = $__333.MARK_AS_GENERATOR, MOVE_NEXT = $__333.MOVE_NEXT, RESULT = $__333.RESULT, RUNTIME = $__333.RUNTIME, STORED_EXCEPTION = $__333.STORED_EXCEPTION, TRACEUR = $__333.TRACEUR; 
  var $__334 = $src_syntax_trees_ParseTreeType_js, STATE_MACHINE = $__334.STATE_MACHINE; 
  var $__335 = $src_syntax_trees_StateMachine_js, StateMachine = $__335.StateMachine; 
  var $__336 = $src_syntax_TokenType_js, TokenType = $__336.TokenType; 
  var $__337 = $src_codegeneration_generator_YieldState_js, YieldState = $__337.YieldState; 
  var $__338 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__338.createArgumentList, createAssignStateStatement = $__338.createAssignStateStatement, createAssignmentStatement = $__338.createAssignmentStatement, createBlock = $__338.createBlock, createCallExpression = $__338.createCallExpression, createEmptyParameterList = $__338.createEmptyParameterList, createExpressionStatement = $__338.createExpressionStatement, createFalseLiteral = $__338.createFalseLiteral, createFunctionExpression = $__338.createFunctionExpression, createIdentifierExpression = $__338.createIdentifierExpression, createMemberExpression = $__338.createMemberExpression, createObjectLiteralExpression = $__338.createObjectLiteralExpression, createPropertyNameAssignment = $__338.createPropertyNameAssignment, createReturnStatement = $__338.createReturnStatement, createStatementList = $__338.createStatementList, createStringLiteral = $__338.createStringLiteral, createThisExpression = $__338.createThisExpression, createThrowStatement = $__338.createThrowStatement, createVariableStatement = $__338.createVariableStatement; 
  var $__339 = $src_util_util_js, createObject = $__339.createObject; 
  function GeneratorTransformer(reporter) { 
    CPSTransformer.call(this, reporter); 
  } 
  GeneratorTransformer.transformGeneratorBody = function(reporter, body) { 
    return new GeneratorTransformer(reporter).transformGeneratorBody(body); 
  }; 
  GeneratorTransformer.prototype = createObject(CPSTransformer.prototype, { 
    transformYieldStatement: function(tree) { 
      if(tree.expression != null) { 
        var startState = this.allocateState(); 
        var fallThroughState = this.allocateState(); 
        return this.stateToStateMachine_(new YieldState(startState, fallThroughState, this.transformAny(tree.expression)), fallThroughState); 
      } 
      var stateId = this.allocateState(); 
      return new StateMachine(stateId, this.allocateState(),[new EndState(stateId)],[]); 
    }, 
    transformAwaitStatement: function(tree) { 
      this.reporter.reportError(tree.location.start, 'Generator function may not have an async statement.'); 
      return tree; 
    }, 
    transformFinally: function(tree) { 
      var result = CPSTransformer.prototype.transformFinally.call(this, tree); 
      if(result.block.type != STATE_MACHINE) { 
        return result; 
      } 
      this.reporter.reportError(tree.location.start, 'yield not permitted from within a finally block.'); 
      return result; 
    }, 
    transformReturnStatement: function(tree) { 
      this.reporter.reportError(tree.location.start, 'Generator function may not have a return statement.'); 
      return tree; 
    }, 
    transformGeneratorBody: function(tree) { 
      var transformedTree = this.transformAny(tree); 
      if(this.reporter.hadError()) { 
        return tree; 
      } 
      var machine = transformedTree; 
      var statements =[]; 
      statements.push(this.generateHoistedThis()); 
      statements.push(this.generateHoistedArguments()); 
      statements.push.apply(statements, this.getMachineVariables(tree, machine)); 
      statements.push(createVariableStatement(TokenType.VAR, RESULT, createObjectLiteralExpression(createPropertyNameAssignment(MOVE_NEXT, this.generateMachineMethod(machine))))); 
      statements.push(createExpressionStatement(createCallExpression(createMemberExpression(TRACEUR, RUNTIME, MARK_AS_GENERATOR), createArgumentList(createIdentifierExpression(RESULT))))); 
      statements.push(createReturnStatement(createIdentifierExpression(RESULT))); 
      return createBlock(statements); 
    }, 
    machineUncaughtExceptionStatements: function(rethrowState) { 
      return createStatementList(createThrowStatement(createIdentifierExpression(STORED_EXCEPTION))); 
    }, 
    machineRethrowStatements: function(machineEndState) { 
      return createStatementList(createThrowStatement(createIdentifierExpression(STORED_EXCEPTION))); 
    }, 
    machineFallThroughStatements: function(machineEndState) { 
      return createStatementList(createAssignStateStatement(machineEndState)); 
    }, 
    machineEndStatements: function() { 
      return[createReturnStatement(createFalseLiteral())]; 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { GeneratorTransformer: { 
      get: function() { 
        return GeneratorTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_GeneratorTransformPass_js =(function() { 
  "use strict"; 
  var $__340 = $src_codegeneration_generator_AsyncTransformer_js, AsyncTransformer = $__340.AsyncTransformer; 
  var $__341 = $src_codegeneration_generator_ForInTransformPass_js, ForInTransformPass = $__341.ForInTransformPass; 
  var $__342 = $src_codegeneration_ForOfTransformer_js, ForOfTransformer = $__342.ForOfTransformer; 
  var $__343 = $src_syntax_trees_ParseTrees_js, FunctionDeclaration = $__343.FunctionDeclaration, GetAccessor = $__343.GetAccessor, SetAccessor = $__343.SetAccessor; 
  var $__344 = $src_codegeneration_generator_GeneratorTransformer_js, GeneratorTransformer = $__344.GeneratorTransformer; 
  var $__345 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__345.ParseTreeTransformer; 
  var $__346 = $src_syntax_ParseTreeVisitor_js, ParseTreeVisitor = $__346.ParseTreeVisitor; 
  var $__347 = $src_syntax_TokenType_js, TokenType = $__347.TokenType; 
  var $__348 = $src_codegeneration_ParseTreeFactory_js, createForOfStatement = $__348.createForOfStatement, createIdentifierExpression = $__348.createIdentifierExpression, createVariableDeclarationList = $__348.createVariableDeclarationList, createYieldStatement = $__348.createYieldStatement; 
  var $__349 = $src_util_util_js, createObject = $__349.createObject; 
  var $__350 = $src_options_js, transformOptions = $__350.transformOptions; 
  var YieldFinder = traceur.runtime.createClass({ 
    constructor: function(tree) { 
      this.hasYield = false; 
      this.hasYieldFor = false; 
      this.hasForIn = false; 
      this.hasAsync = false; 
      this.visitAny(tree); 
    }, 
    hasAnyGenerator: function() { 
      return this.hasYield || this.hasAsync; 
    }, 
    visitYieldStatement: function(tree) { 
      this.hasYield = true; 
      this.hasYieldFor = tree.isYieldFor; 
    }, 
    visitAwaitStatement: function(tree) { 
      this.hasAsync = true; 
    }, 
    visitForInStatement: function(tree) { 
      this.hasForIn = true; 
      traceur.runtime.superCall(this, YieldFinder, "visitForInStatement",[tree]); 
    }, 
    visitFunctionDeclaration: function(tree) { }, 
    visitSetAccessor: function(tree) { }, 
    visitGetAccessor: function(tree) { } 
  }, ParseTreeVisitor, true, true); 
  var YieldForTransformer = traceur.runtime.createClass({ 
    constructor: function(identifierGenerator) { 
      traceur.runtime.superCall(this, YieldForTransformer, "constructor",[]); 
      this.identifierGenerator_ = identifierGenerator; 
    }, 
    transformYieldStatement: function(tree) { 
      if(tree.isYieldFor) { 
        var id = createIdentifierExpression(this.identifierGenerator_.generateUniqueIdentifier()); 
        var forEach = createForOfStatement(createVariableDeclarationList(TokenType.VAR, id, null), tree.expression, createYieldStatement(id, false)); 
        var result = ForOfTransformer.transformTree(this.identifierGenerator_, forEach); 
        return result; 
      } 
      return tree; 
    } 
  }, ParseTreeTransformer, true, true); 
  YieldForTransformer.transformTree = function(identifierGenerator, tree) { 
    return new YieldForTransformer(identifierGenerator).transformAny(tree); 
  }; 
  var GeneratorTransformPass = traceur.runtime.createClass({ 
    constructor: function(identifierGenerator, reporter) { 
      traceur.runtime.superCall(this, GeneratorTransformPass, "constructor",[]); 
      this.identifierGenerator_ = identifierGenerator; 
      this.reporter_ = reporter; 
    }, 
    transformFunctionDeclaration: function(tree) { 
      var body = this.transformBody_(tree.functionBody); 
      if(body == tree.functionBody) { 
        return tree; 
      } 
      return new FunctionDeclaration(null, tree.name, false, tree.formalParameterList, body); 
    }, 
    transformBody_: function(tree) { 
      var finder = new YieldFinder(tree); 
      var body = traceur.runtime.superCall(this, GeneratorTransformPass, "transformBlock",[tree]); 
      if(! finder.hasAnyGenerator()) { 
        return body; 
      } 
      if(finder.hasForIn &&(transformOptions.generators || transformOptions.deferredFunctions)) { 
        body = ForInTransformPass.transformTree(this.identifierGenerator_, body); 
      } 
      if(finder.hasYieldFor && transformOptions.generators) { 
        body = YieldForTransformer.transformTree(this.identifierGenerator_, body); 
      } 
      if(finder.hasYield) { 
        if(transformOptions.generators) { 
          body = GeneratorTransformer.transformGeneratorBody(this.reporter_, body); 
        } 
      } else if(transformOptions.deferredFunctions) { 
        body = AsyncTransformer.transformAsyncBody(this.reporter_, body); 
      } 
      return body; 
    }, 
    transformGetAccessor: function(tree) { 
      var body = this.transformBody_(tree.body); 
      if(body == tree.body) { 
        return tree; 
      } 
      return new GetAccessor(null, tree.propertyName, body); 
    }, 
    transformSetAccessor: function(tree) { 
      var body = this.transformBody_(tree.body); 
      if(body == tree.body) { 
        return tree; 
      } 
      return new SetAccessor(null, tree.propertyName, tree.parameter, body); 
    } 
  }, ParseTreeTransformer, true, true); 
  GeneratorTransformPass.transformTree = function(identifierGenerator, reporter, tree) { 
    return new GeneratorTransformPass(identifierGenerator, reporter).transformAny(tree); 
  }; 
  return Object.preventExtensions(Object.create(null, { GeneratorTransformPass: { 
      get: function() { 
        return GeneratorTransformPass; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_IsExpressionTransformer_js =(function() { 
  "use strict"; 
  var $__351 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__351.ParseTreeTransformer; 
  var $__352 = $src_syntax_PredefinedName_js, IS = $__352.IS, ISNT = $__352.ISNT, RUNTIME = $__352.RUNTIME, TRACEUR = $__352.TRACEUR; 
  var $__353 = $src_syntax_trees_ParseTreeType_js, LITERAL_EXPRESSION = $__353.LITERAL_EXPRESSION; 
  var $__354 = $src_syntax_TokenType_js, TokenType = $__354.TokenType; 
  var $__355 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__355.createArgumentList, createBinaryOperator = $__355.createBinaryOperator, createCallExpression = $__355.createCallExpression, createMemberExpression = $__355.createMemberExpression, createOperatorToken = $__355.createOperatorToken; 
  var $__356 = $src_util_util_js, createObject = $__356.createObject; 
  function isGoodLiteral(tree) { 
    if(tree.type !== LITERAL_EXPRESSION) return false; 
    var token = tree.literalToken; 
    if(token.type === TokenType.NUMBER) return Number(token.value) !== 0; 
    return true; 
  } 
  var IsExpressionTransformer = traceur.runtime.createClass({ 
    transformBinaryOperator: function(tree) { 
      var operator = tree.operator; 
      if(operator.type !== TokenType.IDENTIFIER || operator.value !== IS && operator.value !== ISNT) { 
        return traceur.runtime.superCall(this, IsExpressionTransformer, "transformBinaryOperator",[tree]); 
      } 
      var left = this.transformAny(tree.left); 
      var right = this.transformAny(tree.right); 
      if(isGoodLiteral(left) || isGoodLiteral(right)) { 
        var op = operator.value === IS ? TokenType.EQUAL_EQUAL_EQUAL: TokenType.NOT_EQUAL_EQUAL; 
        return createBinaryOperator(left, createOperatorToken(op), right); 
      } 
      return createCallExpression(createMemberExpression(TRACEUR, RUNTIME, operator.value), createArgumentList(left, right)); 
    }, 
    constructor: function() { 
      var args = Array.prototype.slice.call(arguments, 0); 
      traceur.runtime.superCall(this, IsExpressionTransformer, "constructor", $__465(args)); 
    } 
  }, ParseTreeTransformer, false, true); 
  IsExpressionTransformer.transformTree = function(tree) { 
    return new IsExpressionTransformer().transformAny(tree); 
  }; 
  return Object.preventExtensions(Object.create(null, { IsExpressionTransformer: { 
      get: function() { 
        return IsExpressionTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_ObjectLiteralTransformer_js =(function() { 
  "use strict"; 
  var $__357 = $src_codegeneration_FindVisitor_js, FindVisitor = $__357.FindVisitor; 
  var $__358 = $src_syntax_trees_ParseTrees_js, FormalParameterList = $__358.FormalParameterList, FunctionDeclaration = $__358.FunctionDeclaration, IdentifierExpression = $__358.IdentifierExpression, LiteralExpression = $__358.LiteralExpression; 
  var $__359 = $src_syntax_Keywords_js, Keywords = $__359.Keywords; 
  var $__360 = $src_codegeneration_TempVarTransformer_js, TempVarTransformer = $__360.TempVarTransformer; 
  var $__361 = $src_syntax_TokenType_js, TokenType = $__361.TokenType; 
  var $__362 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__362.createArgumentList, createAssignmentExpression = $__362.createAssignmentExpression, createBindingIdentifier = $__362.createBindingIdentifier, createCallExpression = $__362.createCallExpression, createCommaExpression = $__362.createCommaExpression, createDefineProperty = $__362.createDefineProperty, createEmptyParameterList = $__362.createEmptyParameterList, createFunctionExpression = $__362.createFunctionExpression, createIdentifierExpression = $__362.createIdentifierExpression, createMemberExpression = $__362.createMemberExpression, createObjectCreate = $__362.createObjectCreate, createObjectLiteralExpression = $__362.createObjectLiteralExpression, createParenExpression = $__362.createParenExpression, createPropertyDescriptor = $__362.createPropertyDescriptor, createPropertyNameAssignment = $__362.createPropertyNameAssignment, createStringLiteral = $__362.createStringLiteral; 
  var $__363 = $src_util_util_js, createObject = $__363.createObject; 
  var $__364 = $src_semantics_util_js, evaluateStringLiteral = $__364.evaluateStringLiteral; 
  var $__365 = $src_options_js, transformOptions = $__365.transformOptions; 
  function findAtNameInProperty(propertyName) { 
    return function(tree) { 
      if(transformOptions.privateNameSyntax && tree[propertyName].type === TokenType.AT_NAME) { 
        this.found = true; 
      } 
    }; 
  } 
  function AtNameFinder(tree) { 
    this.protoExpression = null; 
    FindVisitor.call(this, tree, true); 
  } 
  AtNameFinder.prototype = createObject(FindVisitor.prototype, { 
    visitPropertyNameAssignment: function(tree) { 
      if(transformOptions.privateNameSyntax && tree.name.type === TokenType.AT_NAME) { 
        this.found = true; 
      } else if(getPropertyNameForToken(tree.name) === '__proto__') { 
        this.protoExpression = tree.value; 
      } 
    }, 
    visitGetAccessor: findAtNameInProperty('propertyName'), 
    visitSetAccessor: findAtNameInProperty('propertyName'), 
    visitPropertyMethodAssignment: findAtNameInProperty('name'), 
    visitPropertyNameShorthand: findAtNameInProperty('name') 
  }); 
  function getPropertyNameForToken(nameToken) { 
    if(nameToken.type === TokenType.STRING) return evaluateStringLiteral(nameToken); 
    return nameToken.value; 
  } 
  function ObjectLiteralTransformer(identifierGenerator) { 
    TempVarTransformer.call(this, identifierGenerator); 
    this.protoExpression = null; 
    this.needsAtNameTransform = false; 
    this.seenAccessors = null; 
  } 
  ObjectLiteralTransformer.transformTree = function(identifierGenerator, tree) { 
    return new ObjectLiteralTransformer(identifierGenerator).transformAny(tree); 
  }; 
  var base = TempVarTransformer.prototype; 
  ObjectLiteralTransformer.prototype = createObject(base, { 
    createProperty_: function(name, descr) { 
      if(descr.get || descr.set) { 
        var lookupName = getPropertyNameForToken(name); 
        var oldAccessor = this.seenAccessors[lookupName]; 
        if(oldAccessor) { 
          oldAccessor.get = descr.get || oldAccessor.get; 
          oldAccessor.set = descr.set || oldAccessor.set; 
          delete this.seenAccessors[lookupName]; 
          return null; 
        } else { 
          this.seenAccessors[lookupName]= descr; 
        } 
      } 
      return[name, descr]; 
    }, 
    getPropertyName_: function(token) { 
      switch(token.type) { 
        case TokenType.AT_NAME: 
          return createIdentifierExpression(this.identifierGenerator.getUniqueIdentifier(token.value)); 

        case TokenType.IDENTIFIER: 
          return createStringLiteral(token.value); 

        default: 
          if(Keywords.isKeyword(token.type)) return createStringLiteral(token.type); 
          return new LiteralExpression(token.location, token); 

      } 
    }, 
    transformObjectLiteralExpression: function(tree) { 
      var oldNeedsTransform = this.needsAtNameTransform; 
      var oldSeenAccessors = this.seenAccessors; 
      try { 
        var finder = new AtNameFinder(tree); 
        if(! finder.found) { 
          this.needsAtNameTransform = false; 
          return base.transformObjectLiteralExpression.call(this, tree); 
        } 
        this.needsAtNameTransform = true; 
        this.seenAccessors = Object.create(null); 
        var properties = this.transformList(tree.propertyNameAndValues); 
        properties = properties.filter((function(tree) { 
          return tree; 
        })); 
        var tempVar = this.addTempVar(); 
        var tempVarIdentifierExpression = createIdentifierExpression(tempVar); 
        var expressions = properties.map((function(property) { 
          var name = property[0]; 
          var descr = property[1]; 
          return createDefineProperty(tempVarIdentifierExpression, this.getPropertyName_(name), descr); 
        }).bind(this)); 
        var protoExpression = this.transformAny(finder.protoExpression); 
        var objectExpression; 
        if(protoExpression) objectExpression = createObjectCreate(protoExpression); else objectExpression = createObjectLiteralExpression([]); 
        expressions.unshift(createAssignmentExpression(tempVarIdentifierExpression, objectExpression)); 
        expressions.push(tempVarIdentifierExpression); 
        return createParenExpression(createCommaExpression(expressions)); 
      } finally { 
        this.needsAtNameTransform = oldNeedsTransform; 
        this.seenAccessors = oldSeenAccessors; 
      } 
    }, 
    transformPropertyNameAssignment: function(tree) { 
      if(! this.needsAtNameTransform) return base.transformPropertyNameAssignment.call(this, tree); 
      if(getPropertyNameForToken(tree.name) === '__proto__') return null; 
      return this.createProperty_(tree.name, { 
        value: this.transformAny(tree.value), 
        configurable: true, 
        enumerable: true, 
        writable: true 
      }); 
    }, 
    transformGetAccessor: function(tree) { 
      if(! this.needsAtNameTransform) return base.transformGetAccessor.call(this, tree); 
      var body = this.transformAny(tree.body); 
      var func = createFunctionExpression(createEmptyParameterList(), body); 
      return this.createProperty_(tree.propertyName, { 
        get: func, 
        configurable: true, 
        enumerable: true 
      }); 
    }, 
    transformSetAccessor: function(tree) { 
      if(! this.needsAtNameTransform) return base.transformSetAccessor.call(this, tree); 
      var body = this.transformAny(tree.body); 
      var parameter = this.transformAny(tree.parameter); 
      var parameterList = new FormalParameterList(parameter.location,[parameter]); 
      var func = createFunctionExpression(parameterList, body); 
      return this.createProperty_(tree.propertyName, { 
        set: func, 
        configurable: true, 
        enumerable: true 
      }); 
    }, 
    transformPropertyMethodAssignment: function(tree) { 
      var func = new FunctionDeclaration(tree.location, null, tree.isGenerator, this.transformAny(tree.formalParameterList), this.transformAny(tree.functionBody)); 
      if(! this.needsAtNameTransform) { 
        return createPropertyNameAssignment(tree.name, func); 
      } 
      var body = this.transformAny(tree.functionBody); 
      var parameters = this.transformAny(tree.formalParameterList); 
      return this.createProperty_(tree.name, { 
        value: func, 
        configurable: true, 
        enumerable: true, 
        writable: true 
      }); 
    }, 
    transformPropertyNameShorthand: function(tree) { 
      if(! this.needsAtNameTransform) return base.transformPropertyNameShorthand.call(this, tree); 
      return this.createProperty_(tree.name, { 
        value: new IdentifierExpression(tree.location, tree.name), 
        configurable: true, 
        enumerable: false, 
        writable: true 
      }); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { ObjectLiteralTransformer: { 
      get: function() { 
        return ObjectLiteralTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_PrivateNameSyntaxTransformer_js =(function() { 
  "use strict"; 
  var $__366 = $src_syntax_PredefinedName_js, ASSERT_NAME = $__366.ASSERT_NAME, CREATE_NAME = $__366.CREATE_NAME, RUNTIME = $__366.RUNTIME, TRACEUR = $__366.TRACEUR; 
  var $__367 = $src_codegeneration_TempVarTransformer_js, TempVarTransformer = $__367.TempVarTransformer; 
  var $__368 = $src_syntax_TokenType_js, TokenType = $__368.TokenType; 
  var $__369 = $src_syntax_trees_ParseTrees_js, VariableDeclarationList = $__369.VariableDeclarationList, VariableStatement = $__369.VariableStatement; 
  var $__370 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__370.createArgumentList, createCallExpression = $__370.createCallExpression, createEmptyArgumentList = $__370.createEmptyArgumentList, createIdentifierExpression = $__370.createIdentifierExpression, createMemberExpression = $__370.createMemberExpression, createVariableDeclaration = $__370.createVariableDeclaration; 
  var $__371 = $src_util_util_js, createObject = $__371.createObject; 
  function PrivateNameSyntaxTransformer(identifierGenerator) { 
    TempVarTransformer.call(this, identifierGenerator); 
  } 
  PrivateNameSyntaxTransformer.transformTree = function(identifierGenerator, tree) { 
    return new PrivateNameSyntaxTransformer(identifierGenerator).transformAny(tree); 
  }; 
  var base = TempVarTransformer.prototype; 
  PrivateNameSyntaxTransformer.prototype = createObject(base, { 
    getTransformedName_: function(token) { 
      return this.identifierGenerator.getUniqueIdentifier(token.value); 
    }, 
    transformAtNameExpression: function(tree) { 
      var transformedName = this.getTransformedName_(tree.atNameToken); 
      return createIdentifierExpression(transformedName); 
    }, 
    transformNameStatement: function(tree) { 
      var declarations = this.transformList(tree.declarations); 
      return new VariableStatement(tree.location, new VariableDeclarationList(tree.location, TokenType.CONST, declarations)); 
    }, 
    transformAtNameDeclaration: function(tree) { 
      var transformedName = this.getTransformedName_(tree.atNameToken); 
      var args, name; 
      if(tree.initializer) { 
        args = createArgumentList(this.transformAny(tree.initializer)); 
        name = ASSERT_NAME; 
      } else { 
        args = createEmptyArgumentList(); 
        name = CREATE_NAME; 
      } 
      return createVariableDeclaration(transformedName, createCallExpression(createMemberExpression(TRACEUR, RUNTIME, name), args)); 
    } 
  }); 
  return Object.preventExtensions(Object.create(null, { PrivateNameSyntaxTransformer: { 
      get: function() { 
        return PrivateNameSyntaxTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_PropertyNameShorthandTransformer_js =(function() { 
  "use strict"; 
  var $__372 = $src_syntax_trees_ParseTrees_js, IdentifierExpression = $__372.IdentifierExpression, PropertyNameAssignment = $__372.PropertyNameAssignment; 
  var $__373 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__373.ParseTreeTransformer; 
  var $__374 = $src_util_util_js, createObject = $__374.createObject; 
  var PropertyNameShorthandTransformer = traceur.runtime.createClass({ 
    transformPropertyNameShorthand: function(tree) { 
      return new PropertyNameAssignment(tree.location, tree.name, new IdentifierExpression(tree.location, tree.name)); 
    }, 
    constructor: function() { 
      var args = Array.prototype.slice.call(arguments, 0); 
      traceur.runtime.superCall(this, PropertyNameShorthandTransformer, "constructor", $__465(args)); 
    } 
  }, ParseTreeTransformer, false, true); 
  PropertyNameShorthandTransformer.transformTree = function(tree) { 
    return new PropertyNameShorthandTransformer().transformAny(tree); 
  }; 
  return Object.preventExtensions(Object.create(null, { PropertyNameShorthandTransformer: { 
      get: function() { 
        return PropertyNameShorthandTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_QuasiLiteralTransformer_js =(function() { 
  "use strict"; 
  var $__375 = $src_syntax_trees_ParseTreeType_js, BINARY_OPERATOR = $__375.BINARY_OPERATOR, COMMA_EXPRESSION = $__375.COMMA_EXPRESSION, CONDITIONAL_EXPRESSION = $__375.CONDITIONAL_EXPRESSION, QUASI_LITERAL_PORTION = $__375.QUASI_LITERAL_PORTION; 
  var $__376 = $src_syntax_trees_ParseTrees_js, LiteralExpression = $__376.LiteralExpression, ParenExpression = $__376.ParenExpression, Program = $__376.Program; 
  var $__377 = $src_syntax_LiteralToken_js, LiteralToken = $__377.LiteralToken; 
  var $__378 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__378.ParseTreeTransformer; 
  var $__379 = $src_syntax_PredefinedName_js, RAW = $__379.RAW; 
  var $__380 = $src_syntax_TokenType_js, TokenType = $__380.TokenType; 
  var $__381 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__381.createArgumentList, createArrayLiteralExpression = $__381.createArrayLiteralExpression, createAssignmentExpression = $__381.createAssignmentExpression, createBinaryOperator = $__381.createBinaryOperator, createCallExpression = $__381.createCallExpression, createCommaExpression = $__381.createCommaExpression, createDefineProperty = $__381.createDefineProperty, createIdentifierExpression = $__381.createIdentifierExpression, createMemberExpression = $__381.createMemberExpression, createObjectFreeze = $__381.createObjectFreeze, createObjectLiteralExpression = $__381.createObjectLiteralExpression, createOperatorToken = $__381.createOperatorToken, createParenExpression = $__381.createParenExpression, createVariableDeclaration = $__381.createVariableDeclaration, createVariableDeclarationList = $__381.createVariableDeclarationList, createVariableStatement = $__381.createVariableStatement; 
  var $__382 = $src_util_util_js, createObject = $__382.createObject; 
  function createCallSiteIdObject(tempVarName, tree) { 
    var elements = tree.elements; 
    var expressions =[createDefineProperty(createAssignmentExpression(createIdentifierExpression(tempVarName), createCookedStringArray(elements)), RAW, { value: createObjectFreeze(createRawStringArray(elements)) }), createObjectFreeze(createIdentifierExpression(tempVarName))]; 
    return createParenExpression(createCommaExpression(expressions)); 
  } 
  function createRawStringArray(elements) { 
    var items =[]; 
    for(var i = 0; i < elements.length; i += 2) { 
      var str = replaceRaw(JSON.stringify(elements[i].value.value)); 
      var loc = elements[i].location; 
      var expr = new LiteralExpression(loc, new LiteralToken(TokenType.STRING, str, loc)); 
      items.push(expr); 
    } 
    return createArrayLiteralExpression(items); 
  } 
  function createCookedStringLiteralExpression(tree) { 
    var str = cookString(tree.value.value); 
    var loc = tree.location; 
    return new LiteralExpression(loc, new LiteralToken(TokenType.STRING, str, loc)); 
  } 
  function createCookedStringArray(elements) { 
    var items =[]; 
    for(var i = 0; i < elements.length; i += 2) { 
      items.push(createCookedStringLiteralExpression(elements[i])); 
    } 
    return createArrayLiteralExpression(items); 
  } 
  function replaceRaw(s) { 
    return s.replace(/\u2028|\u2029/g, function(c) { 
      switch(c) { 
        case '\u2028': 
          return '\\u2028'; 

        case '\u2029': 
          return '\\u2029'; 

        default: 
          throw Error('Not reachable'); 

      } 
    }); 
  } 
  function cookString(s) { 
    var sb =['"']; 
    var i = 0, k = 1, c, c2; 
    while(i < s.length) { 
      c = s[i ++]; 
      switch(c) { 
        case '\\': 
          c2 = s[i ++]; 
          switch(c2) { 
            case '\n': 
            case '\u2028': 
            case '\u2029': 
              break; 

            case '\r': 
              if(s[i + 1]=== '\n') { 
                i ++; 
              } 
              break; 

            default: 
              sb[k ++]= c; 
              sb[k ++]= c2; 

          } 
          break; 

        case '"': 
          sb[k ++]= '\\"'; 
          break; 

        case '\n': 
          sb[k ++]= '\\n'; 
          break; 

        case '\r': 
          sb[k ++]= '\\r'; 
          break; 

        case '\t': 
          sb[k ++]= '\\t'; 
          break; 

        case '\f': 
          sb[k ++]= '\\f'; 
          break; 

        case '\b': 
          sb[k ++]= '\\b'; 
          break; 

        case '\u2028': 
          sb[k ++]= '\\u2028'; 
          break; 

        case '\u2029': 
          sb[k ++]= '\\u2029'; 
          break; 

        default: 
          sb[k ++]= c; 

      } 
    } 
    sb[k ++]= '"'; 
    return sb.join(''); 
  } 
  var QuasiLiteralTransformer = traceur.runtime.createClass({ 
    constructor: function(identifierGenerator) { 
      traceur.runtime.superCall(this, QuasiLiteralTransformer, "constructor",[]); 
      this.identifierGenerator_ = identifierGenerator; 
      this.tempVarName_ = identifierGenerator.generateUniqueIdentifier(); 
    }, 
    transformProgram: function(tree) { 
      this.callsiteDecls_ =[]; 
      var elements = this.transformList(tree.programElements); 
      if(elements == tree.programElements) { 
        return tree; 
      } 
      if(this.callsiteDecls_.length > 0) { 
        var tempVarStatement = createVariableStatement(createVariableDeclarationList(TokenType.VAR, this.tempVarName_, null)); 
        var varStatement = createVariableStatement(createVariableDeclarationList(TokenType.CONST, this.callsiteDecls_)); 
        elements.unshift(tempVarStatement, varStatement); 
      } 
      return new Program(tree.location, elements); 
    }, 
    transformQuasiLiteralExpression: function(tree) { 
      if(! tree.operand) return this.createDefaultQuasi(tree); 
      var operand = this.transformAny(tree.operand); 
      var elements = tree.elements; 
      var args =[]; 
      var idName = this.identifierGenerator_.generateUniqueIdentifier(); 
      var callsiteId = createCallSiteIdObject(this.tempVarName_, tree); 
      var variableDecl = createVariableDeclaration(idName, callsiteId); 
      this.callsiteDecls_.push(variableDecl); 
      args.push(createIdentifierExpression(idName)); 
      for(var i = 1; i < elements.length; i += 2) { 
        args.push(this.transformAny(elements[i])); 
      } 
      return createCallExpression(operand, createArgumentList(args)); 
    }, 
    transformQuasiSubstitution: function(tree) { 
      var transformedTree = this.transformAny(tree.expression); 
      switch(transformedTree.type) { 
        case BINARY_OPERATOR: 
          switch(transformedTree.operator.type) { 
            case TokenType.STAR: 
            case TokenType.PERCENT: 
            case TokenType.SLASH: 
              return transformedTree; 

          } 

        case COMMA_EXPRESSION: 
        case CONDITIONAL_EXPRESSION: 
          return new ParenExpression(null, transformedTree); 

      } 
      return transformedTree; 
    }, 
    transformQuasiLiteralPortion: function(tree) { 
      return createCookedStringLiteralExpression(tree); 
    }, 
    createDefaultQuasi: function(tree) { 
      var length = tree.elements.length; 
      if(length === 0) { 
        var loc = tree.location; 
        return new LiteralExpression(loc, new LiteralToken(TokenType.STRING, '""', loc)); 
      } 
      var binaryExpression = this.transformAny(tree.elements[0]); 
      if(length == 1) return binaryExpression; 
      var plusToken = createOperatorToken(TokenType.PLUS); 
      for(var i = 1; i < length; i ++) { 
        var element = tree.elements[i]; 
        if(element.type === QUASI_LITERAL_PORTION && element.value.value === '') { 
          continue; 
        } 
        var transformedTree = this.transformAny(tree.elements[i]); 
        binaryExpression = createBinaryOperator(binaryExpression, plusToken, transformedTree); 
      } 
      return new ParenExpression(null, binaryExpression); 
    } 
  }, ParseTreeTransformer, true, true); 
  QuasiLiteralTransformer.transformTree = function(identifierGenerator, tree) { 
    return new QuasiLiteralTransformer(identifierGenerator).transformAny(tree); 
  }; 
  return Object.preventExtensions(Object.create(null, { QuasiLiteralTransformer: { 
      get: function() { 
        return QuasiLiteralTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_RestParameterTransformer_js =(function() { 
  "use strict"; 
  var $__383 = $src_syntax_trees_ParseTrees_js, FormalParameterList = $__383.FormalParameterList; 
  var $__384 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__384.ParseTreeTransformer; 
  var $__385 = $src_syntax_PredefinedName_js, ARGUMENTS = $__385.ARGUMENTS, ARRAY = $__385.ARRAY, CALL = $__385.CALL, PROTOTYPE = $__385.PROTOTYPE; 
  var $__386 = $src_syntax_TokenType_js, TokenType = $__386.TokenType; 
  var $__387 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__387.createArgumentList, createBlock = $__387.createBlock, createCallExpression = $__387.createCallExpression, createFunctionDeclaration = $__387.createFunctionDeclaration, createIdentifierExpression = $__387.createIdentifierExpression, createMemberExpression = $__387.createMemberExpression, createNumberLiteral = $__387.createNumberLiteral, createVariableStatement = $__387.createVariableStatement; 
  var $__388 = $src_util_util_js, createObject = $__388.createObject; 
  function hasRestParameter(formalParameterList) { 
    var parameters = formalParameterList.parameters; 
    return parameters.length > 0 && parameters[parameters.length - 1].isRestParameter(); 
  } 
  function getRestParameterName(formalParameterList) { 
    var parameters = formalParameterList.parameters; 
    return parameters[parameters.length - 1].identifier.identifierToken.value; 
  } 
  var RestParameterTransformer = traceur.runtime.createClass({ 
    transformFunctionDeclaration: function(tree) { 
      if(hasRestParameter(tree.formalParameterList)) { 
        return this.desugarRestParameters_(tree); 
      } else { 
        return traceur.runtime.superCall(this, RestParameterTransformer, "transformFunctionDeclaration",[tree]); 
      } 
    }, 
    desugarRestParameters_: function(tree) { 
      var parametersWithoutRestParam = new FormalParameterList(tree.formalParameterList.location, tree.formalParameterList.parameters.slice(0, tree.formalParameterList.parameters.length - 1)); 
      var sliceExpression = createCallExpression(createMemberExpression(ARRAY, PROTOTYPE, 'slice', CALL), createArgumentList(createIdentifierExpression(ARGUMENTS), createNumberLiteral(tree.formalParameterList.parameters.length - 1))); 
      var variable = createVariableStatement(TokenType.VAR, getRestParameterName(tree.formalParameterList), sliceExpression); 
      var statements =[]; 
      statements.push(variable); 
      statements.push.apply(statements, tree.functionBody.statements); 
      return createFunctionDeclaration(tree.name, parametersWithoutRestParam, this.transformAny(createBlock(statements))); 
    }, 
    constructor: function() { 
      var args = Array.prototype.slice.call(arguments, 0); 
      traceur.runtime.superCall(this, RestParameterTransformer, "constructor", $__465(args)); 
    } 
  }, ParseTreeTransformer, false, true); 
  RestParameterTransformer.transformTree = function(tree) { 
    return new RestParameterTransformer().transformAny(tree); 
  }; 
  return Object.preventExtensions(Object.create(null, { RestParameterTransformer: { 
      get: function() { 
        return RestParameterTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_SpreadTransformer_js =(function() { 
  "use strict"; 
  var $__389 = $src_syntax_PredefinedName_js, APPLY = $__389.APPLY; 
  var $__390 = $src_syntax_trees_ParseTreeType_js, MEMBER_EXPRESSION = $__390.MEMBER_EXPRESSION, MEMBER_LOOKUP_EXPRESSION = $__390.MEMBER_LOOKUP_EXPRESSION, SPREAD_EXPRESSION = $__390.SPREAD_EXPRESSION; 
  var $__391 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__391.ParseTreeTransformer; 
  var $__392 = $src_codegeneration_ParseTreeFactory_js, createArgumentList = $__392.createArgumentList, createArrayLiteralExpression = $__392.createArrayLiteralExpression, createBlock = $__392.createBlock, createBooleanLiteral = $__392.createBooleanLiteral, createCallExpression = $__392.createCallExpression, createFunctionExpression = $__392.createFunctionExpression, createMemberExpression = $__392.createMemberExpression, createMemberLookupExpression = $__392.createMemberLookupExpression, createNullLiteral = $__392.createNullLiteral, createParameterList = $__392.createParameterList, createParameterReference = $__392.createParameterReference, createParenExpression = $__392.createParenExpression, createReturnStatement = $__392.createReturnStatement; 
  var $__393 = $src_util_util_js, createObject = $__393.createObject; 
  var SPREAD_CODE = "\n    function(items) {\n      var retval = [];\n      var k = 0;\n      for (var i = 0; i < items.length; i += 2) {\n        var value = items[i + 1];\n        // spread\n        if (items[i]) {\n          value = %toObject(value);\n          for (var j = 0; j < value.length; j++) {\n            retval[k++] = value[j];\n          }\n        } else {\n          retval[k++] = value;\n        }\n      }\n      return retval;\n    }"; 
  var SPREAD_NEW_CODE = "\n    function(ctor, items) {\n      var args = %spread(items);\n      args.unshift(null);\n      return new (Function.prototype.bind.apply(ctor, args));\n    }"; 
  function hasSpreadMember(trees) { 
    return trees.some((function(tree) { 
      return tree.type == SPREAD_EXPRESSION; 
    })); 
  } 
  function createInterleavedArgumentsArray(elements) { 
    var args =[]; 
    elements.forEach((function(element) { 
      if(element.type == SPREAD_EXPRESSION) { 
        args.push(createBooleanLiteral(true)); 
        args.push(element.expression); 
      } else { 
        args.push(createBooleanLiteral(false)); 
        args.push(element); 
      } 
    })); 
    return createArrayLiteralExpression(args); 
  } 
  var SpreadTransformer = traceur.runtime.createClass({ 
    constructor: function(runtimeInliner) { 
      traceur.runtime.superCall(this, SpreadTransformer, "constructor",[]); 
      this.runtimeInliner_ = runtimeInliner; 
    }, 
    createExpandCall_: function(elements) { 
      if(elements.length === 1) { 
        return createCallExpression(this.toObject_, createArgumentList(elements[0].expression)); 
      } 
      var args = createInterleavedArgumentsArray(elements); 
      return createCallExpression(this.spread_, createArgumentList(args)); 
    }, 
    get spread_() { 
      return this.runtimeInliner_.get('spread', SPREAD_CODE); 
    }, 
    get spreadNew_() { 
      this.runtimeInliner_.register('spread', SPREAD_CODE); 
      return this.runtimeInliner_.get('spreadNew', SPREAD_NEW_CODE); 
    }, 
    get toObject_() { 
      return this.runtimeInliner_.get('toObject'); 
    }, 
    desugarArraySpread_: function(tree) { 
      return this.createExpandCall_(tree.elements); 
    }, 
    desugarCallSpread_: function(tree) { 
      if(tree.operand.type == MEMBER_EXPRESSION) { 
        var expression = tree.operand; 
        return this.desugarSpreadMethodCall_(tree, expression.operand, createMemberExpression(createParameterReference(0), expression.memberName)); 
      } else if(tree.operand.type == MEMBER_LOOKUP_EXPRESSION) { 
        var lookupExpression = tree.operand; 
        return this.desugarSpreadMethodCall_(tree, lookupExpression.operand, createMemberLookupExpression(createParameterReference(0), lookupExpression.memberExpression)); 
      } 
      return createCallExpression(createMemberExpression(tree.operand, APPLY), createArgumentList(createNullLiteral(), this.createExpandCall_(tree.args.args))); 
    }, 
    desugarSpreadMethodCall_: function(tree, operand, memberLookup) { 
      var body = createBlock(createReturnStatement(createCallExpression(createMemberExpression(memberLookup, APPLY), createArgumentList(createParameterReference(0), createParameterReference(1))))); 
      var func = createParenExpression(createFunctionExpression(createParameterList(2), body)); 
      return createCallExpression(func, createArgumentList(operand, this.createExpandCall_(tree.args.args))); 
    }, 
    desugarNewSpread_: function(tree) { 
      return createCallExpression(this.spreadNew_, createArgumentList(tree.operand, createInterleavedArgumentsArray(tree.args.args))); 
    }, 
    transformArrayLiteralExpression: function(tree) { 
      if(hasSpreadMember(tree.elements)) { 
        return this.desugarArraySpread_(tree); 
      } 
      return traceur.runtime.superCall(this, SpreadTransformer, "transformArrayLiteralExpression",[tree]); 
    }, 
    transformCallExpression: function(tree) { 
      if(hasSpreadMember(tree.args.args)) { 
        return this.desugarCallSpread_(tree); 
      } 
      return traceur.runtime.superCall(this, SpreadTransformer, "transformCallExpression",[tree]); 
    }, 
    transformNewExpression: function(tree) { 
      if(tree.args != null && hasSpreadMember(tree.args.args)) { 
        return this.desugarNewSpread_(tree); 
      } 
      return traceur.runtime.superCall(this, SpreadTransformer, "transformNewExpression",[tree]); 
    } 
  }, ParseTreeTransformer, true, true); 
  SpreadTransformer.transformTree = function(runtimeInliner, tree) { 
    return new SpreadTransformer(runtimeInliner).transformAny(tree); 
  }; 
  return Object.preventExtensions(Object.create(null, { SpreadTransformer: { 
      get: function() { 
        return SpreadTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_ProgramTransformer_js =(function() { 
  "use strict"; 
  var $__394 = $src_codegeneration_ArrayComprehensionTransformer_js, ArrayComprehensionTransformer = $__394.ArrayComprehensionTransformer; 
  var $__395 = $src_codegeneration_ArrowFunctionTransformer_js, ArrowFunctionTransformer = $__395.ArrowFunctionTransformer; 
  var $__396 = $src_codegeneration_AtNameMemberTransformer_js, AtNameMemberTransformer = $__396.AtNameMemberTransformer; 
  var $__397 = $src_codegeneration_BlockBindingTransformer_js, BlockBindingTransformer = $__397.BlockBindingTransformer; 
  var $__398 = $src_codegeneration_CascadeExpressionTransformer_js, CascadeExpressionTransformer = $__398.CascadeExpressionTransformer; 
  var $__399 = $src_codegeneration_ClassTransformer_js, ClassTransformer = $__399.ClassTransformer; 
  var $__400 = $src_codegeneration_CollectionTransformer_js, CollectionTransformer = $__400.CollectionTransformer; 
  var $__401 = $src_codegeneration_DefaultParametersTransformer_js, DefaultParametersTransformer = $__401.DefaultParametersTransformer; 
  var $__402 = $src_codegeneration_DestructuringTransformer_js, DestructuringTransformer = $__402.DestructuringTransformer; 
  var $__403 = $src_codegeneration_ForOfTransformer_js, ForOfTransformer = $__403.ForOfTransformer; 
  var $__404 = $src_semantics_FreeVariableChecker_js, FreeVariableChecker = $__404.FreeVariableChecker; 
  var $__405 = $src_codegeneration_GeneratorComprehensionTransformer_js, GeneratorComprehensionTransformer = $__405.GeneratorComprehensionTransformer; 
  var $__406 = $src_codegeneration_GeneratorTransformPass_js, GeneratorTransformPass = $__406.GeneratorTransformPass; 
  var $__407 = $src_codegeneration_IsExpressionTransformer_js, IsExpressionTransformer = $__407.IsExpressionTransformer; 
  var $__408 = $src_codegeneration_ModuleTransformer_js, ModuleTransformer = $__408.ModuleTransformer; 
  var $__409 = $src_codegeneration_ObjectLiteralTransformer_js, ObjectLiteralTransformer = $__409.ObjectLiteralTransformer; 
  var $__410 = $src_util_ObjectMap_js, ObjectMap = $__410.ObjectMap; 
  var $__411 = $src_syntax_ParseTreeValidator_js, ParseTreeValidator = $__411.ParseTreeValidator; 
  var $__412 = $src_codegeneration_PrivateNameSyntaxTransformer_js, PrivateNameSyntaxTransformer = $__412.PrivateNameSyntaxTransformer; 
  var $__413 = $src_codegeneration_PropertyNameShorthandTransformer_js, PropertyNameShorthandTransformer = $__413.PropertyNameShorthandTransformer; 
  var $__414 = $src_codegeneration_QuasiLiteralTransformer_js, QuasiLiteralTransformer = $__414.QuasiLiteralTransformer; 
  var $__415 = $src_codegeneration_RestParameterTransformer_js, RestParameterTransformer = $__415.RestParameterTransformer; 
  var $__416 = $src_codegeneration_SpreadTransformer_js, SpreadTransformer = $__416.SpreadTransformer; 
  var $__417 = $src_options_js, options = $__417.options, transformOptions = $__417.transformOptions; 
  function ProgramTransformer(reporter, project) { 
    this.project_ = project; 
    this.reporter_ = reporter; 
    this.results_ = new ObjectMap(); 
  } 
  ProgramTransformer.transform = function(reporter, project) { 
    var transformer = new ProgramTransformer(reporter, project); 
    transformer.transform_(); 
    return transformer.results_; 
  }; 
  ProgramTransformer.transformFile = function(reporter, project, sourceFile) { 
    var transformer = new ProgramTransformer(reporter, project); 
    transformer.transformFile_(sourceFile); 
    return transformer.results_; 
  }; 
  ProgramTransformer.transformFileAsModule = function(reporter, project, module, sourceFile) { 
    var transformer = new ProgramTransformer(reporter, project); 
    transformer.transformFileAsModule_(module, sourceFile); 
    return transformer.results_; 
  }; 
  ProgramTransformer.prototype = { 
    transform_: function() { 
      this.project_.getSourceFiles().forEach((function(file) { 
        this.transformFile_(file); 
      }).bind(this)); 
    }, 
    transformFile_: function(file) { 
      var result = this.transform(this.project_.getParseTree(file)); 
      this.results_.put(file, result); 
    }, 
    transformFileAsModule_: function(module, file) { 
      var result = this.transformTree_(this.project_.getParseTree(file), module); 
      this.results_.put(file, result); 
    }, 
    transform: function(tree) { 
      return this.transformTree_(tree); 
    }, 
    transformTree_: function(tree, opt_module) { 
      var identifierGenerator = this.project_.identifierGenerator; 
      var runtimeInliner = this.project_.runtimeInliner; 
      var reporter = this.reporter_; 
      function chain(enabled, transformer, var_args) { 
        if(! enabled) return; 
        if(! reporter.hadError()) { 
          if(options.validate) { 
            ParseTreeValidator.validate(tree); 
          } 
          var args = Array.prototype.slice.call(arguments, 2); 
          args.push(tree); 
          tree = transformer.apply(null, args) || tree; 
        } 
      } 
      if(transformOptions.modules && ! reporter.hadError()) { 
        if(options.validate) { 
          ParseTreeValidator.validate(tree); 
        } 
        tree = this.transformModules_(tree, opt_module); 
      } 
      chain(transformOptions.quasi, QuasiLiteralTransformer.transformTree, identifierGenerator); 
      chain(transformOptions.arrowFunctions, ArrowFunctionTransformer.transformTree, reporter); 
      chain(transformOptions.classes, ClassTransformer.transform, identifierGenerator, reporter); 
      chain(transformOptions.propertyNameShorthand, PropertyNameShorthandTransformer.transformTree); 
      chain(transformOptions.propertyMethods || transformOptions.privateNameSyntax && transformOptions.privateNames, ObjectLiteralTransformer.transformTree, identifierGenerator); 
      chain(transformOptions.isExpression, IsExpressionTransformer.transformTree); 
      chain(transformOptions.generatorComprehension, GeneratorComprehensionTransformer.transformTree, identifierGenerator); 
      chain(transformOptions.arrayComprehension, ArrayComprehensionTransformer.transformTree, identifierGenerator); 
      chain(transformOptions.forOf, ForOfTransformer.transformTree, identifierGenerator); 
      chain(transformOptions.restParameters, RestParameterTransformer.transformTree); 
      chain(transformOptions.defaultParameters, DefaultParametersTransformer.transformTree); 
      chain(transformOptions.generators || transformOptions.deferredFunctions, GeneratorTransformPass.transformTree, identifierGenerator, reporter); 
      chain(transformOptions.privateNames && transformOptions.privateNameSyntax, AtNameMemberTransformer.transformTree, identifierGenerator); 
      chain(transformOptions.privateNames && transformOptions.privateNameSyntax, PrivateNameSyntaxTransformer.transformTree, identifierGenerator); 
      chain(transformOptions.destructuring, DestructuringTransformer.transformTree, identifierGenerator); 
      chain(transformOptions.spread, SpreadTransformer.transformTree, runtimeInliner); 
      chain(true, runtimeInliner.transformAny.bind(runtimeInliner)); 
      chain(transformOptions.blockBinding, BlockBindingTransformer.transformTree); 
      chain(transformOptions.cascadeExpression, CascadeExpressionTransformer.transformTree, identifierGenerator, reporter); 
      chain(transformOptions.trapMemberLookup || transformOptions.privateNames, CollectionTransformer.transformTree, identifierGenerator); 
      chain(options.freeVariableChecker, FreeVariableChecker.checkProgram, reporter); 
      return tree; 
    }, 
    transformModules_: function(tree, opt_module) { 
      if(opt_module) { 
        return ModuleTransformer.transformAsModule(this.project_, opt_module, tree); 
      } else { 
        return ModuleTransformer.transform(this.project_, tree); 
      } 
    } 
  }; 
  return Object.preventExtensions(Object.create(null, { ProgramTransformer: { 
      get: function() { 
        return ProgramTransformer; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_codegeneration_Compiler_js =(function() { 
  "use strict"; 
  var $__418 = $src_semantics_ModuleAnalyzer_js, ModuleAnalyzer = $__418.ModuleAnalyzer; 
  var $__419 = $src_syntax_Parser_js, Parser = $__419.Parser; 
  var $__420 = $src_codegeneration_ProgramTransformer_js, ProgramTransformer = $__420.ProgramTransformer; 
  var $__421 = $src_semantics_symbols_Project_js, Project = $__421.Project; 
  Compiler.compile = function(reporter, project) { 
    return new Compiler(reporter, project).compile_(); 
  }; 
  Compiler.compileFile = function(reporter, sourceFile, url) { 
    var project = new Project(url); 
    project.addFile(sourceFile); 
    return new Compiler(reporter, project).compileFile_(sourceFile); 
  }; 
  function Compiler(reporter, project) { 
    this.reporter_ = reporter; 
    this.project_ = project; 
  } 
  Compiler.prototype = { 
    compile_: function() { 
      this.parse_(); 
      this.analyze_(); 
      this.transform_(); 
      if(this.hadError_()) { 
        return null; 
      } 
      return this.results_; 
    }, 
    compileFile_: function(file) { 
      this.parseFile_(file); 
      this.analyzeFile_(file); 
      this.transformFile_(file); 
      if(this.hadError_()) { 
        return null; 
      } 
      return this.results_.get(file); 
    }, 
    transform_: function() { 
      if(this.hadError_()) { 
        return; 
      } 
      this.results_ = ProgramTransformer.transform(this.reporter_, this.project_); 
    }, 
    transformFile_: function(sourceFile) { 
      if(this.hadError_()) { 
        return; 
      } 
      this.results_ = ProgramTransformer.transformFile(this.reporter_, this.project_, sourceFile); 
    }, 
    analyze_: function() { 
      if(this.hadError_()) { 
        return; 
      } 
      var analyzer = new ModuleAnalyzer(this.reporter_, this.project_); 
      analyzer.analyze(); 
    }, 
    analyzeFile_: function(sourceFile) { 
      if(this.hadError_()) { 
        return; 
      } 
      var analyzer = new ModuleAnalyzer(this.reporter_, this.project_); 
      analyzer.analyzeFile(sourceFile); 
    }, 
    parse_: function() { 
      this.project_.getSourceFiles().forEach(this.parseFile_, this); 
    }, 
    parseFile_: function(file) { 
      if(this.hadError_()) { 
        return; 
      } 
      this.project_.setParseTree(file, new Parser(this.reporter_, file).parseProgram(true)); 
    }, 
    hadError_: function() { 
      return this.reporter_.hadError(); 
    } 
  }; 
  return Object.preventExtensions(Object.create(null, { Compiler: { 
      get: function() { 
        return Compiler; 
      }, 
      enumerable: true 
    } })); 
}).call(this); 
var $src_runtime_modules_js =(function() { 
  "use strict"; 
  var $__422 = $src_util_ArrayMap_js, ArrayMap = $__422.ArrayMap; 
  var $__423 = $src_semantics_ModuleAnalyzer_js, ModuleAnalyzer = $__423.ModuleAnalyzer; 
  var $__424 = $src_codegeneration_module_ModuleRequireVisitor_js, ModuleRequireVisitor = $__424.ModuleRequireVisitor; 
  var $__425 = $src_semantics_symbols_ModuleSymbol_js, ModuleSymbol = $__425.ModuleSymbol; 
  var $__426 = $src_codegeneration_ModuleTransformer_js, ModuleTransformer = $__426.ModuleTransformer; 
  var $__427 = $src_util_ObjectMap_js, ObjectMap = $__427.ObjectMap; 
  var $__428 = $src_syntax_Parser_js, Parser = $__428.Parser; 
  var $__429 = $src_codegeneration_ProgramTransformer_js, ProgramTransformer = $__429.ProgramTransformer; 
  var $__430 = $src_semantics_symbols_Project_js, Project = $__430.Project; 
  var $__431 = $src_syntax_SourceFile_js, SourceFile = $__431.SourceFile; 
  var $__432 = $src_outputgeneration_TreeWriter_js, TreeWriter = $__432.TreeWriter; 
  var $__433 = $src_util_url_js, canonicalizeUrl = $__433.canonicalizeUrl, resolveUrl = $__433.resolveUrl; 
  var $__434 = $src_util_util_js, createObject = $__434.createObject; 
  var base = Object.freeze(Object.create(null, { 
    Array: { value: Array }, 
    Boolean: { value: Boolean }, 
    Date: { value: Date }, 
    Error: { value: Error }, 
    EvalError: { value: EvalError }, 
    Function: { value: Function }, 
    JSON: { value: JSON }, 
    Math: { value: Math }, 
    Number: { value: Number }, 
    Object: { value: Object }, 
    RangeError: { value: RangeError }, 
    ReferenceError: { value: ReferenceError }, 
    RegExp: { value: RegExp }, 
    String: { value: String }, 
    SyntaxError: { value: SyntaxError }, 
    TypeError: { value: TypeError }, 
    URIError: { value: URIError }, 
    undefined: { value: void 0 } 
  })); 
  var NOT_STARTED = 0; 
  var LOADING = 1; 
  var LOADED = 2; 
  var PARSED = 3; 
  var TRANSFORMED = 4; 
  var COMPLETE = 5; 
  var ERROR = 6; 
  function CodeUnit(loader, url, state) { 
    this.loader = loader; 
    this.url = url; 
    this.state = state; 
    this.uid = traceur.getUid(); 
  } 
  CodeUnit.prototype = { 
    state_: NOT_STARTED, 
    get state() { 
      return this.state_; 
    }, 
    set state(state) { 
      if(state < this.state_) { 
        throw new Error('Invalid state change'); 
      } 
      this.state_ = state; 
    }, 
    get reporter() { 
      return this.loader.reporter; 
    }, 
    get project() { 
      return this.loader.project; 
    }, 
    get tree() { 
      return this.project.getParseTree(this.file); 
    }, 
    get moduleSymbol() { 
      return this.project.getRootModule(); 
    }, 
    addListener: function(callback, errback) { 
      if(! this.listeners) { 
        this.listeners =[]; 
      } 
      this.listeners.push(callback, errback); 
    }, 
    dispatchError: function(value) { 
      this.dispatch_(value, 1); 
    }, 
    dispatchComplete: function(value) { 
      this.dispatch_(value, 0); 
    }, 
    dispatch_: function(value, error) { 
      var listeners = this.listeners; 
      if(! listeners) { 
        return; 
      } 
      listeners = listeners.concat(); 
      this.listeners =[]; 
      for(var i = error; i < listeners.length; i += 2) { 
        var f = listeners[i]; 
        if(f) { 
          f(value); 
        } 
      } 
    }, 
    parse: function() { 
      var reporter = this.reporter; 
      var project = this.project; 
      var url = this.url; 
      var program = this.text; 
      var file = new SourceFile(url, program); 
      project.addFile(file); 
      this.file = file; 
      var parser = new Parser(reporter, file); 
      var tree = parser.parseProgram(this.allowLoad); 
      if(reporter.hadError()) { 
        this.error = 'Parse error'; 
        return false; 
      } 
      project.setParseTree(file, tree); 
      this.state = PARSED; 
      return true; 
    }, 
    transform: function() { 
      return ProgramTransformer.transformFile(this.reporter, this.project, this.file); 
    } 
  }; 
  function LoadCodeUnit(loader, url) { 
    CodeUnit.call(this, loader, url, NOT_STARTED); 
  } 
  LoadCodeUnit.prototype = createObject(CodeUnit.prototype, { 
    allowLoad: true, 
    get moduleSymbol() { 
      return this.project.getModuleForUrl(this.url); 
    }, 
    parse: function() { 
      if(! CodeUnit.prototype.parse.call(this)) { 
        return false; 
      } 
      var project = this.loader.project; 
      var tree = this.tree; 
      var url = this.url; 
      var moduleSymbol = new ModuleSymbol(null, null, tree, url); 
      project.addExternalModule(moduleSymbol); 
      return true; 
    }, 
    transform: function() { 
      return ProgramTransformer.transformFileAsModule(this.reporter, this.project, this.moduleSymbol, this.file); 
    } 
  }); 
  function EvalCodeUnit(loader, code) { 
    CodeUnit.call(this, loader, loader.url, LOADED); 
    this.text = code; 
  } 
  EvalCodeUnit.prototype = createObject(CodeUnit.prototype, { allowLoad: false }); 
  function EvalLoadCodeUnit(loader, code) { 
    CodeUnit.call(this, loader, loader.url, LOADED); 
    this.text = code; 
  } 
  EvalLoadCodeUnit.prototype = createObject(CodeUnit.prototype, { allowLoad: true }); 
  function InternalLoader(reporter, project) { 
    this.reporter = reporter; 
    this.project = project; 
    this.cache = new ArrayMap(); 
    this.urlToKey = Object.create(null); 
  } 
  InternalLoader.prototype = { 
    get url() { 
      return this.project.url; 
    }, 
    loadTextFile: function(url, callback, errback) { 
      var xhr = new XMLHttpRequest(); 
      xhr.onload = function() { 
        if(xhr.status == 200 || xhr.status == 0) { 
          callback(xhr.responseText); 
        } else { 
          errback(); 
        } 
        xhr = null; 
      }; 
      xhr.onerror = function() { 
        errback(); 
      }; 
      xhr.open('GET', url, true); 
      xhr.send(); 
      return xhr; 
    }, 
    load: function(url) { 
      url = resolveUrl(this.url, url); 
      var codeUnit = this.getCodeUnit(url); 
      if(codeUnit.state != NOT_STARTED || codeUnit.state == ERROR) { 
        return codeUnit; 
      } 
      codeUnit.state = LOADING; 
      var loader = this; 
      var xhr = codeUnit.xhr = this.loadTextFile(url, function(text) { 
        codeUnit.text = text; 
        codeUnit.state = LOADED; 
        loader.handleCodeUnitLoaded(codeUnit); 
      }, function() { 
        codeUnit.state = ERROR; 
        loader.handleCodeUnitLoadError(codeUnit); 
      }); 
      return codeUnit; 
    }, 
    evalLoad: function(code) { 
      var codeUnit = new EvalLoadCodeUnit(this, code); 
      this.cache.put({ }, codeUnit); 
      return codeUnit; 
    }, 
    eval: function(code) { 
      var codeUnit = new EvalCodeUnit(this, code); 
      this.cache.put({ }, codeUnit); 
      this.handleCodeUnitLoaded(codeUnit); 
      return codeUnit; 
    }, 
    getKey: function(url) { 
      if(url in this.urlToKey) { 
        return this.urlToKey[url]; 
      } 
      return this.urlToKey[url]= { }; 
    }, 
    getCodeUnit: function(url) { 
      var key = this.getKey(url); 
      var cacheObject = this.cache.get(key); 
      if(! cacheObject) { 
        cacheObject = new LoadCodeUnit(this, url); 
        this.cache.put(key, cacheObject); 
      } 
      return cacheObject; 
    }, 
    areAll: function(state) { 
      return this.cache.values().every((function(codeUnit) { 
        return codeUnit.state >= state; 
      })); 
    }, 
    handleCodeUnitLoaded: function(codeUnit) { 
      if(! codeUnit.parse()) { 
        this.abortAll(); 
        return; 
      } 
      var requireVisitor = new ModuleRequireVisitor(this.reporter); 
      requireVisitor.visit(codeUnit.tree); 
      var baseUrl = codeUnit.url; 
      codeUnit.dependencies = requireVisitor.requireUrls.map((function(url) { 
        url = resolveUrl(baseUrl, url); 
        return this.load(url); 
      }).bind(this)); 
      if(this.areAll(PARSED)) { 
        this.analyze(); 
        this.transform(); 
        this.evaluate(); 
      } 
    }, 
    handleCodeUnitLoadError: function(codeUnit) { 
      this.error = codeUnit.error = 'Failed to load \'' + codeUnit.url + '\''; 
      this.abortAll(); 
    }, 
    abortAll: function() { 
      this.cache.values().forEach((function(codeUnit) { 
        if(codeUnit.xhr) { 
          codeUnit.xhr.abort(); 
          codeUnit.state = ERROR; 
        } 
      })); 
      this.cache.values().forEach((function(codeUnit) { 
        codeUnit.dispatchError(codeUnit.error); 
      })); 
    }, 
    analyze: function() { 
      var project = this.project; 
      var dependencies = this.cache.values(); 
      var trees =[]; 
      var modules =[]; 
      for(var i = 0; i < dependencies.length; i ++) { 
        var codeUnit = dependencies[i]; 
        traceur.assert(codeUnit.state >= PARSED); 
        if(codeUnit.state == PARSED) { 
          trees.push(codeUnit.tree); 
          modules.push(codeUnit.moduleSymbol); 
        } 
      } 
      var analyzer = new ModuleAnalyzer(this.reporter, this.project); 
      analyzer.analyzeModuleTrees(trees, modules); 
      if(this.reporter.hadError()) { 
        for(var i = 0; i < dependencies.length; i ++) { 
          var codeUnit = dependencies[i]; 
          if(codeUnit.state >= COMPLETE) { 
            continue; 
          } 
          codeUnit.state = ERROR; 
        } 
        for(var i = 0; i < dependencies.length; i ++) { 
          var codeUnit = dependencies[i]; 
          if(codeUnit.state == ERROR) { 
            codeUnit.dispatchError('Failed to analyze'); 
          } 
        } 
      } 
    }, 
    transform: function() { 
      var dependencies = this.cache.values(); 
      for(var i = 0; i < dependencies.length; i ++) { 
        var codeUnit = dependencies[i]; 
        if(codeUnit.state >= TRANSFORMED) { 
          continue; 
        } 
        codeUnit.transformedTree = this.transformCodeUnit(codeUnit); 
        codeUnit.state = TRANSFORMED; 
      } 
    }, 
    transformCodeUnit: function(codeUnit) { 
      var results = codeUnit.transform(); 
      return results.get(codeUnit.file); 
    }, 
    evaluate: function() { 
      var visited = new ObjectMap(); 
      var ordered =[]; 
      function orderCodeUnits(codeUnit) { 
        if(visited.has(codeUnit)) { 
          return; 
        } 
        visited.put(codeUnit, true); 
        codeUnit.dependencies.forEach(orderCodeUnits); 
        ordered.push(codeUnit); 
      } 
      this.cache.values().forEach(orderCodeUnits); 
      var dependencies = ordered; 
      for(var i = 0; i < dependencies.length; i ++) { 
        var codeUnit = dependencies[i]; 
        if(codeUnit.state >= COMPLETE) { 
          continue; 
        } 
        traceur.assert(currentCodeUnit === undefined); 
        currentCodeUnit = codeUnit; 
        var result; 
        try { 
          result = this.evalCodeUnit(codeUnit); 
        } catch(ex) { 
          codeUnit.error = ex.message; 
          this.abortAll(); 
          return; 
        } finally { 
          traceur.assert(currentCodeUnit === codeUnit); 
          currentCodeUnit = undefined; 
        } 
        codeUnit.result = result; 
        codeUnit.transformedTree = null; 
        codeUnit.text = null; 
      } 
      for(var i = 0; i < dependencies.length; i ++) { 
        var codeUnit = dependencies[i]; 
        if(codeUnit.state >= COMPLETE) { 
          continue; 
        } 
        codeUnit.state = COMPLETE; 
        codeUnit.dispatchComplete(codeUnit.result); 
      } 
    }, 
    evalCodeUnit: function(codeUnit) { 
      return traceur.strictGlobalEval(TreeWriter.write(codeUnit.transformedTree)); 
    } 
  }; 
  var currentCodeUnit; 
  var standardModuleUrlRegExp = /^@\w+$/; 
  function getModuleInstanceByUrl(url) { 
    if(standardModuleUrlRegExp.test(url)) return traceur.runtime.modules[url]|| null; 
    traceur.assert(currentCodeUnit); 
    url = resolveUrl(currentCodeUnit.url, url); 
    for(var i = 0; i < currentCodeUnit.dependencies.length; i ++) { 
      if(currentCodeUnit.dependencies[i].url == url) { 
        return currentCodeUnit.dependencies[i].result; 
      } 
    } 
    return null; 
  } 
  function CodeLoader(reporter, project, parentLoader, opt_resolver) { 
    this.internalLoader_ = new InternalLoader(reporter, project); 
  } 
  CodeLoader.prototype = { 
    load: function(url, callback, opt_errback) { 
      var codeUnit = this.internalLoader_.load(url); 
      codeUnit.addListener(callback, opt_errback); 
    }, 
    eval: function(program) { 
      var codeUnit = this.internalLoader_.eval(program); 
      return codeUnit.result; 
    }, 
    evalLoad: function(program, callback, opt_errback) { 
      var codeUnit = this.internalLoader_.evalLoad(program); 
      codeUnit.addListener(callback, opt_errback); 
      this.internalLoader_.handleCodeUnitLoaded(codeUnit); 
    }, 
    'import': function(moduleInstanceObject) { 
      throw Error('Not implemented'); 
    }, 
    defineGlobal: function(name, value) { 
      throw Error('Not implemented'); 
    }, 
    defineModule: function(name, moduleInstanceObject, opt_cacheKey) { 
      throw Error('Not implemented'); 
    }, 
    create: function(moduleInstanceObject, opt_resolver) { 
      var url = this.project_.url; 
      var project = new Project(url); 
      var loader = new CodeLoader(this.reporter, project, this, opt_resolver); 
      return loader; 
    }, 
    createBase: function() { 
      return base; 
    } 
  }; 
  var internals =(function() { 
    return Object.preventExtensions(Object.create(null, { 
      CodeUnit: { 
        get: function() { 
          return CodeUnit; 
        }, 
        enumerable: true 
      }, 
      EvalCodeUnit: { 
        get: function() { 
          return EvalCodeUnit; 
        }, 
        enumerable: true 
      }, 
      EvalLoadCodeUnit: { 
        get: function() { 
          return EvalLoadCodeUnit; 
        }, 
        enumerable: true 
      }, 
      InternalLoader: { 
        get: function() { 
          return InternalLoader; 
        }, 
        enumerable: true 
      }, 
      LoadCodeUnit: { 
        get: function() { 
          return LoadCodeUnit; 
        }, 
        enumerable: true 
      } 
    })); 
  }).call(this); 
  ; 
  return Object.preventExtensions(Object.create(null, { 
    getModuleInstanceByUrl: { 
      get: function() { 
        return getModuleInstanceByUrl; 
      }, 
      enumerable: true 
    }, 
    CodeLoader: { 
      get: function() { 
        return CodeLoader; 
      }, 
      enumerable: true 
    }, 
    internals: { 
      get: function() { 
        return internals; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
var traceur =(function() { 
  "use strict"; 
  var global = this; 
  var traceurRuntime = global.traceur.runtime; 
  var runtime = traceurRuntime; 
  var $__435 = $src_options_js, options = $__435.options; 
  var $__436 = $src_util_util_js, createObject = $__436.createObject; 
  function exportPath(name) { 
    var parts = name.split('.'); 
    var cur = traceur; 
    for(var part; parts.length &&(part = parts.shift());) { 
      if(part in cur) { 
        cur = cur[part]; 
      } else { 
        cur = cur[part]= { }; 
      } 
    } 
    return cur; 
  } 
  ; 
  function generateNameForUrl(url, commonPath) { 
    return '$' + url.replace(commonPath, '').replace(/[^\d\w$]/g, '_'); 
  } 
  ; 
  function getModuleForTesting(name) { 
    return global[$__466([false, '$src', true, name.split('.'), false, 'js']).join('_')]; 
  } 
  ; 
  function define(name, fun) { 
    var obj = exportPath(name); 
    var exports = fun(); 
    for(var propertyName in exports) { 
      var propertyDescriptor = Object.getOwnPropertyDescriptor(exports, propertyName); 
      if(propertyDescriptor) Object.defineProperty(obj, propertyName, propertyDescriptor); 
    } 
  } 
  function assert(b) { 
    if(! b && options.debug) throw Error('Assertion failed'); 
  } 
  function strictGlobalEval(code) { 
    return('global', eval)('"use strict";' + code); 
  } 
  var uidCounter = 0; 
  function getUid() { 
    return ++ uidCounter; 
  } 
  var semantics =(function() { 
    var $__437 = $src_semantics_ModuleAnalyzer_js, ModuleAnalyzer = $__437.ModuleAnalyzer; 
    var symbols =(function() { 
      var $__438 = $src_semantics_symbols_Project_js, Project = $__438.Project; 
      return Object.preventExtensions(Object.create(null, { Project: { 
          get: function() { 
            return Project; 
          }, 
          enumerable: true 
        } })); 
    }).call(this); 
    var $__439 = $src_semantics_VariableBinder_js, VariableBinder = $__439.VariableBinder; 
    var $__440 = $src_semantics_util_js, evaluateStringLiteral = $__440.evaluateStringLiteral; 
    return Object.preventExtensions(Object.create(null, { 
      ModuleAnalyzer: { 
        get: function() { 
          return ModuleAnalyzer; 
        }, 
        enumerable: true 
      }, 
      symbols: { 
        get: function() { 
          return symbols; 
        }, 
        enumerable: true 
      }, 
      VariableBinder: { 
        get: function() { 
          return VariableBinder; 
        }, 
        enumerable: true 
      }, 
      evaluateStringLiteral: { 
        get: function() { 
          return evaluateStringLiteral; 
        }, 
        enumerable: true 
      } 
    })); 
  }).call(this); 
  var util =(function() { 
    var $__441 = $src_util_url_js, canonicalizeUrl = $__441.canonicalizeUrl, resolveUrl = $__441.resolveUrl; 
    var $__442 = $src_util_ErrorReporter_js, ErrorReporter = $__442.ErrorReporter; 
    var $__443 = $src_util_TestErrorReporter_js, TestErrorReporter = $__443.TestErrorReporter; 
    var $__444 = $src_util_SourcePosition_js, SourcePosition = $__444.SourcePosition; 
    var $__445 = $src_util_MutedErrorReporter_js, MutedErrorReporter = $__445.MutedErrorReporter; 
    var $__446 = $src_util_url_js, removeDotSegments = $__446.removeDotSegments; 
    return Object.preventExtensions(Object.create(null, { 
      canonicalizeUrl: { 
        get: function() { 
          return canonicalizeUrl; 
        }, 
        enumerable: true 
      }, 
      resolveUrl: { 
        get: function() { 
          return resolveUrl; 
        }, 
        enumerable: true 
      }, 
      ErrorReporter: { 
        get: function() { 
          return ErrorReporter; 
        }, 
        enumerable: true 
      }, 
      TestErrorReporter: { 
        get: function() { 
          return TestErrorReporter; 
        }, 
        enumerable: true 
      }, 
      SourcePosition: { 
        get: function() { 
          return SourcePosition; 
        }, 
        enumerable: true 
      }, 
      MutedErrorReporter: { 
        get: function() { 
          return MutedErrorReporter; 
        }, 
        enumerable: true 
      }, 
      removeDotSegments: { 
        get: function() { 
          return removeDotSegments; 
        }, 
        enumerable: true 
      } 
    })); 
  }).call(this); 
  var syntax =(function() { 
    var $__447 = $src_syntax_Scanner_js, Scanner = $__447.Scanner; 
    var $__448 = $src_syntax_SourceFile_js, SourceFile = $__448.SourceFile; 
    var trees = $src_syntax_trees_ParseTrees_js; 
    var $__449 = $src_syntax_Parser_js, Parser = $__449.Parser; 
    var $__450 = $src_syntax_Token_js, Token = $__450.Token; 
    var $__451 = $src_syntax_TokenType_js, TokenType = $__451.TokenType; 
    var $__452 = $src_syntax_IdentifierToken_js, IdentifierToken = $__452.IdentifierToken; 
    var $__453 = $src_syntax_LiteralToken_js, LiteralToken = $__453.LiteralToken; 
    var $__454 = $src_syntax_ParseTreeValidator_js, ParseTreeValidator = $__454.ParseTreeValidator; 
    return Object.preventExtensions(Object.create(null, { 
      Scanner: { 
        get: function() { 
          return Scanner; 
        }, 
        enumerable: true 
      }, 
      SourceFile: { 
        get: function() { 
          return SourceFile; 
        }, 
        enumerable: true 
      }, 
      trees: { 
        get: function() { 
          return trees; 
        }, 
        enumerable: true 
      }, 
      Parser: { 
        get: function() { 
          return Parser; 
        }, 
        enumerable: true 
      }, 
      Token: { 
        get: function() { 
          return Token; 
        }, 
        enumerable: true 
      }, 
      TokenType: { 
        get: function() { 
          return TokenType; 
        }, 
        enumerable: true 
      }, 
      IdentifierToken: { 
        get: function() { 
          return IdentifierToken; 
        }, 
        enumerable: true 
      }, 
      LiteralToken: { 
        get: function() { 
          return LiteralToken; 
        }, 
        enumerable: true 
      }, 
      ParseTreeValidator: { 
        get: function() { 
          return ParseTreeValidator; 
        }, 
        enumerable: true 
      } 
    })); 
  }).call(this); 
  var outputgeneration =(function() { 
    var $__455 = $src_outputgeneration_ProjectWriter_js, ProjectWriter = $__455.ProjectWriter; 
    var $__456 = $src_outputgeneration_TreeWriter_js, TreeWriter = $__456.TreeWriter; 
    var $__457 = $src_outputgeneration_SourceMapIntegration_js, SourceMapConsumer = $__457.SourceMapConsumer; 
    var $__458 = $src_outputgeneration_SourceMapIntegration_js, SourceMapGenerator = $__458.SourceMapGenerator; 
    return Object.preventExtensions(Object.create(null, { 
      ProjectWriter: { 
        get: function() { 
          return ProjectWriter; 
        }, 
        enumerable: true 
      }, 
      TreeWriter: { 
        get: function() { 
          return TreeWriter; 
        }, 
        enumerable: true 
      }, 
      SourceMapConsumer: { 
        get: function() { 
          return SourceMapConsumer; 
        }, 
        enumerable: true 
      }, 
      SourceMapGenerator: { 
        get: function() { 
          return SourceMapGenerator; 
        }, 
        enumerable: true 
      } 
    })); 
  }).call(this); 
  var codegeneration =(function() { 
    var ParseTreeFactory = $src_codegeneration_ParseTreeFactory_js; 
    var module =(function() { 
      var $__459 = $src_codegeneration_module_ModuleRequireVisitor_js, ModuleRequireVisitor = $__459.ModuleRequireVisitor; 
      return Object.preventExtensions(Object.create(null, { ModuleRequireVisitor: { 
          get: function() { 
            return ModuleRequireVisitor; 
          }, 
          enumerable: true 
        } })); 
    }).call(this); 
    var $__460 = $src_codegeneration_ParseTreeTransformer_js, ParseTreeTransformer = $__460.ParseTreeTransformer; 
    var $__461 = $src_codegeneration_ModuleTransformer_js, ModuleTransformer = $__461.ModuleTransformer; 
    var $__462 = $src_codegeneration_ProgramTransformer_js, ProgramTransformer = $__462.ProgramTransformer; 
    var $__463 = $src_codegeneration_Compiler_js, Compiler = $__463.Compiler; 
    return Object.preventExtensions(Object.create(null, { 
      ParseTreeFactory: { 
        get: function() { 
          return ParseTreeFactory; 
        }, 
        enumerable: true 
      }, 
      module: { 
        get: function() { 
          return module; 
        }, 
        enumerable: true 
      }, 
      ParseTreeTransformer: { 
        get: function() { 
          return ParseTreeTransformer; 
        }, 
        enumerable: true 
      }, 
      ModuleTransformer: { 
        get: function() { 
          return ModuleTransformer; 
        }, 
        enumerable: true 
      }, 
      ProgramTransformer: { 
        get: function() { 
          return ProgramTransformer; 
        }, 
        enumerable: true 
      }, 
      Compiler: { 
        get: function() { 
          return Compiler; 
        }, 
        enumerable: true 
      } 
    })); 
  }).call(this); 
  var $__464 = $src_runtime_modules_js, internals = $__464.internals, getModuleInstanceByUrl = $__464.getModuleInstanceByUrl, CodeLoader = $__464.CodeLoader; 
  runtime.internals = internals; 
  runtime.getModuleInstanceByUrl = getModuleInstanceByUrl; 
  runtime.CodeLoader = CodeLoader; 
  return Object.preventExtensions(Object.create(null, { 
    runtime: { 
      get: function() { 
        return runtime; 
      }, 
      enumerable: true 
    }, 
    options: { 
      get: function() { 
        return options; 
      }, 
      enumerable: true 
    }, 
    createObject: { 
      get: function() { 
        return createObject; 
      }, 
      enumerable: true 
    }, 
    generateNameForUrl: { 
      get: function() { 
        return generateNameForUrl; 
      }, 
      enumerable: true 
    }, 
    getModuleForTesting: { 
      get: function() { 
        return getModuleForTesting; 
      }, 
      enumerable: true 
    }, 
    define: { 
      get: function() { 
        return define; 
      }, 
      enumerable: true 
    }, 
    assert: { 
      get: function() { 
        return assert; 
      }, 
      enumerable: true 
    }, 
    strictGlobalEval: { 
      get: function() { 
        return strictGlobalEval; 
      }, 
      enumerable: true 
    }, 
    getUid: { 
      get: function() { 
        return getUid; 
      }, 
      enumerable: true 
    }, 
    semantics: { 
      get: function() { 
        return semantics; 
      }, 
      enumerable: true 
    }, 
    util: { 
      get: function() { 
        return util; 
      }, 
      enumerable: true 
    }, 
    syntax: { 
      get: function() { 
        return syntax; 
      }, 
      enumerable: true 
    }, 
    outputgeneration: { 
      get: function() { 
        return outputgeneration; 
      }, 
      enumerable: true 
    }, 
    codegeneration: { 
      get: function() { 
        return codegeneration; 
      }, 
      enumerable: true 
    } 
  })); 
}).call(this); 
