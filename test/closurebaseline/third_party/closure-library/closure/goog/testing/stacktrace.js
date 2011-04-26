
goog.provide('goog.testing.stacktrace'); 
goog.provide('goog.testing.stacktrace.Frame'); 
goog.testing.stacktrace.Frame = function(context, name, alias, args, path) { 
  this.context_ = context; 
  this.name_ = name; 
  this.alias_ = alias; 
  this.args_ = args; 
  this.path_ = path; 
}; 
goog.testing.stacktrace.Frame.prototype.getName = function() { 
  return this.name_; 
}; 
goog.testing.stacktrace.Frame.prototype.isAnonymous = function() { 
  return ! this.name_ || this.context_ == '[object Object]'; 
}; 
goog.testing.stacktrace.Frame.prototype.toCanonicalString = function() { 
  var htmlEscape = goog.testing.stacktrace.htmlEscape_; 
  var deobfuscate = goog.testing.stacktrace.maybeDeobfuscateFunctionName_; 
  var canonical =[this.context_ ? htmlEscape(this.context_) + '.': '', this.name_ ? htmlEscape(deobfuscate(this.name_)): 'anonymous', htmlEscape(this.args_), this.alias_ ? ' [as ' + htmlEscape(deobfuscate(this.alias_)) + ']': '']; 
  if(this.path_) { 
    canonical.push(' at '); 
    if(goog.testing.stacktrace.isClosureInspectorActive_()) { 
      var lineNumber = this.path_.match(/\d+$/)[0]; 
      canonical.push('<a href="" onclick="CLOSURE_INSPECTOR___.showLine(\'', htmlEscape(this.path_), '\', \'', lineNumber, '\'); return false">', htmlEscape(this.path_), '</a>'); 
    } else { 
      canonical.push(htmlEscape(this.path_)); 
    } 
  } 
  return canonical.join(''); 
}; 
goog.testing.stacktrace.MAX_DEPTH_ = 20; 
goog.testing.stacktrace.MAX_FIREFOX_FRAMESTRING_LENGTH_ = 500000; 
goog.testing.stacktrace.IDENTIFIER_PATTERN_ = '[a-zA-Z_$][\\w$]*'; 
goog.testing.stacktrace.CHROME_ALIAS_PATTERN_ = '(?: \\[as (' + goog.testing.stacktrace.IDENTIFIER_PATTERN_ + ')\\])?'; 
goog.testing.stacktrace.CHROME_FUNCTION_NAME_PATTERN_ = '(?:new )?(?:' + goog.testing.stacktrace.IDENTIFIER_PATTERN_ + '|<anonymous>)'; 
goog.testing.stacktrace.CHROME_FUNCTION_CALL_PATTERN_ = ' (?:(.*?)\\.)?(' + goog.testing.stacktrace.CHROME_FUNCTION_NAME_PATTERN_ + ')' + goog.testing.stacktrace.CHROME_ALIAS_PATTERN_; 
goog.testing.stacktrace.URL_PATTERN_ = '((?:http|https|file)://[^\\s)]+|javascript:.*)'; 
goog.testing.stacktrace.CHROME_URL_PATTERN_ = ' (?:' + '\\(unknown source\\)' + '|' + '\\(native\\)' + '|' + '\\((?:eval at )?' + goog.testing.stacktrace.URL_PATTERN_ + '\\)' + '|' + goog.testing.stacktrace.URL_PATTERN_ + ')'; 
goog.testing.stacktrace.CHROME_STACK_FRAME_REGEXP_ = new RegExp('^    at' + '(?:' + goog.testing.stacktrace.CHROME_FUNCTION_CALL_PATTERN_ + ')?' + goog.testing.stacktrace.CHROME_URL_PATTERN_ + '$'); 
goog.testing.stacktrace.FIREFOX_FUNCTION_CALL_PATTERN_ = '(' + goog.testing.stacktrace.IDENTIFIER_PATTERN_ + ')?' + '(\\(.*\\))?@'; 
goog.testing.stacktrace.FIREFOX_STACK_FRAME_REGEXP_ = new RegExp('^' + goog.testing.stacktrace.FIREFOX_FUNCTION_CALL_PATTERN_ + '(?::0|' + goog.testing.stacktrace.URL_PATTERN_ + ')$'); 
goog.testing.stacktrace.FUNCTION_SOURCE_REGEXP_ = new RegExp('^function (' + goog.testing.stacktrace.IDENTIFIER_PATTERN_ + ')'); 
goog.testing.stacktrace.followCallChain_ = function() { 
  var frames =[]; 
  var fn = arguments.callee.caller; 
  var depth = 0; 
  while(fn && depth < goog.testing.stacktrace.MAX_DEPTH_) { 
    var fnString = Function.prototype.toString.call(fn); 
    var match = fnString.match(goog.testing.stacktrace.FUNCTION_SOURCE_REGEXP_); 
    var functionName = match ? match[1]: ''; 
    var argsBuilder =['(']; 
    if(fn.arguments) { 
      for(var i = 0; i < fn.arguments.length; i ++) { 
        var arg = fn.arguments[i]; 
        if(i > 0) { 
          argsBuilder.push(', '); 
        } 
        if(goog.isString(arg)) { 
          argsBuilder.push('"', arg, '"'); 
        } else { 
          if(arg && arg['$replay']) { 
            argsBuilder.push('goog.testing.Mock'); 
          } else { 
            argsBuilder.push(String(arg)); 
          } 
        } 
      } 
    } else { 
      argsBuilder.push('unknown'); 
    } 
    argsBuilder.push(')'); 
    var args = argsBuilder.join(''); 
    frames.push(new goog.testing.stacktrace.Frame('', functionName, '', args, '')); 
    try { 
      fn = fn.caller; 
    } catch(e) { 
      break; 
    } 
    depth ++; 
  } 
  return frames; 
}; 
goog.testing.stacktrace.parseStackFrame_ = function(frameStr) { 
  var m = frameStr.match(goog.testing.stacktrace.CHROME_STACK_FRAME_REGEXP_); 
  if(m) { 
    return new goog.testing.stacktrace.Frame(m[1]|| '', m[2]|| '', m[3]|| '', '', m[4]|| m[5]|| ''); 
  } 
  if(frameStr.length > goog.testing.stacktrace.MAX_FIREFOX_FRAMESTRING_LENGTH_) { 
    return goog.testing.stacktrace.parseLongFirefoxFrame_(frameStr); 
  } 
  m = frameStr.match(goog.testing.stacktrace.FIREFOX_STACK_FRAME_REGEXP_); 
  if(m) { 
    return new goog.testing.stacktrace.Frame('', m[1]|| '', '', m[2]|| '', m[3]|| ''); 
  } 
  return null; 
}; 
goog.testing.stacktrace.parseLongFirefoxFrame_ = function(frameStr) { 
  var firstParen = frameStr.indexOf('('); 
  var lastAmpersand = frameStr.lastIndexOf('@'); 
  var lastColon = frameStr.lastIndexOf(':'); 
  var functionName = ''; 
  if((firstParen >= 0) &&(firstParen < lastAmpersand)) { 
    functionName = frameStr.substring(0, firstParen); 
  } 
  var loc = ''; 
  if((lastAmpersand >= 0) &&(lastAmpersand + 1 < lastColon)) { 
    loc = frameStr.substring(lastAmpersand + 1); 
  } 
  var args = ''; 
  if((firstParen >= 0 && lastAmpersand > 0) &&(firstParen < lastAmpersand)) { 
    args = frameStr.substring(firstParen, lastAmpersand); 
  } 
  return new goog.testing.stacktrace.Frame('', functionName, '', args, loc); 
}; 
goog.testing.stacktrace.deobfuscateFunctionName_; 
goog.testing.stacktrace.setDeobfuscateFunctionName = function(fn) { 
  goog.testing.stacktrace.deobfuscateFunctionName_ = fn; 
}; 
goog.testing.stacktrace.maybeDeobfuscateFunctionName_ = function(name) { 
  return goog.testing.stacktrace.deobfuscateFunctionName_ ? goog.testing.stacktrace.deobfuscateFunctionName_(name): name; 
}; 
goog.testing.stacktrace.isClosureInspectorActive_ = function() { 
  return Boolean(goog.global['CLOSURE_INSPECTOR___']&& goog.global['CLOSURE_INSPECTOR___']['supportsJSUnit']); 
}; 
goog.testing.stacktrace.htmlEscape_ = function(text) { 
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); 
}; 
goog.testing.stacktrace.framesToString_ = function(frames) { 
  var lastIndex = frames.length - 1; 
  while(frames[lastIndex]&& frames[lastIndex].isAnonymous()) { 
    lastIndex --; 
  } 
  var privateAssertIndex = - 1; 
  for(var i = 0; i < frames.length; i ++) { 
    if(frames[i]&& frames[i].getName() == '_assert') { 
      privateAssertIndex = i; 
      break; 
    } 
  } 
  var canonical =[]; 
  for(var i = privateAssertIndex + 1; i <= lastIndex; i ++) { 
    canonical.push('> '); 
    if(frames[i]) { 
      canonical.push(frames[i].toCanonicalString()); 
    } else { 
      canonical.push('(unknown)'); 
    } 
    canonical.push('\n'); 
  } 
  return canonical.join(''); 
}; 
goog.testing.stacktrace.parse_ = function(stack) { 
  var lines = stack.replace(/\s*$/, '').split('\n'); 
  var frames =[]; 
  for(var i = 0; i < lines.length; i ++) { 
    frames.push(goog.testing.stacktrace.parseStackFrame_(lines[i])); 
  } 
  return frames; 
}; 
goog.testing.stacktrace.canonicalize = function(stack) { 
  var frames = goog.testing.stacktrace.parse_(stack); 
  return goog.testing.stacktrace.framesToString_(frames); 
}; 
goog.testing.stacktrace.get = function() { 
  var stack = new Error().stack; 
  var frames = stack ? goog.testing.stacktrace.parse_(stack): goog.testing.stacktrace.followCallChain_(); 
  return goog.testing.stacktrace.framesToString_(frames); 
}; 
goog.exportSymbol('setDeobfuscateFunctionName', goog.testing.stacktrace.setDeobfuscateFunctionName); 
