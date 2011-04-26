
var COMPILED = false; 
var goog = goog || { }; 
goog.global = this; 
goog.DEBUG = true; 
goog.LOCALE = 'en'; 
goog.evalWorksForGlobals_ = null; 
goog.provide = function(name) { 
  if(! COMPILED) { 
    if(goog.isProvided_(name)) { 
      throw Error('Namespace "' + name + '" already declared.'); 
    } 
    delete goog.implicitNamespaces_[name]; 
    var namespace = name; 
    while((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) { 
      if(goog.getObjectByName(namespace)) { 
        break; 
      } 
      goog.implicitNamespaces_[namespace]= true; 
    } 
  } 
  goog.exportPath_(name); 
}; 
goog.isProvided_ = function(name) { 
  return ! goog.implicitNamespaces_[name]&& ! ! goog.getObjectByName(name); 
}; 
goog.setTestOnly = function(opt_message) { 
  if(COMPILED && ! goog.DEBUG) { 
    opt_message = opt_message || ''; 
    throw Error('Importing test-only code into non-debug environment' + opt_message ? ': ' + opt_message: '.'); 
  } 
}; 
if(! COMPILED) { 
  goog.implicitNamespaces_ = { }; 
} 
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) { 
  var parts = name.split('.'); 
  var cur = opt_objectToExportTo || goog.global; 
  if(!(parts[0]in cur) && cur.execScript) { 
    cur.execScript('var ' + parts[0]); 
  } 
  for(var part; parts.length &&(part = parts.shift());) { 
    if(! parts.length && goog.isDef(opt_object)) { 
      cur[part]= opt_object; 
    } else if(cur[part]) { 
      cur = cur[part]; 
    } else { 
      cur = cur[part]= { }; 
    } 
  } 
}; 
goog.getObjectByName = function(name, opt_obj) { 
  var parts = name.split('.'); 
  var cur = opt_obj || goog.global; 
  for(var part; part = parts.shift();) { 
    if(goog.isDefAndNotNull(cur[part])) { 
      cur = cur[part]; 
    } else { 
      return null; 
    } 
  } 
  return cur; 
}; 
goog.globalize = function(obj, opt_global) { 
  var global = opt_global || goog.global; 
  for(var x in obj) { 
    global[x]= obj[x]; 
  } 
}; 
goog.addDependency = function(relPath, provides, requires) { 
  if(! COMPILED) { 
    var provide, require; 
    var path = relPath.replace(/\\/g, '/'); 
    var deps = goog.dependencies_; 
    for(var i = 0; provide = provides[i]; i ++) { 
      deps.nameToPath[provide]= path; 
      if(!(path in deps.pathToNames)) { 
        deps.pathToNames[path]= { }; 
      } 
      deps.pathToNames[path][provide]= true; 
    } 
    for(var j = 0; require = requires[j]; j ++) { 
      if(!(path in deps.requires)) { 
        deps.requires[path]= { }; 
      } 
      deps.requires[path][require]= true; 
    } 
  } 
}; 
goog.require = function(rule) { 
  if(! COMPILED) { 
    if(goog.getObjectByName(rule)) { 
      return; 
    } 
    var path = goog.getPathFromDeps_(rule); 
    if(path) { 
      goog.included_[path]= true; 
      goog.writeScripts_(); 
    } else { 
      var errorMessage = 'goog.require could not find: ' + rule; 
      if(goog.global.console) { 
        goog.global.console['error'](errorMessage); 
      } 
      throw Error(errorMessage); 
    } 
  } 
}; 
goog.basePath = ''; 
goog.global.CLOSURE_BASE_PATH; 
goog.global.CLOSURE_NO_DEPS; 
goog.global.CLOSURE_IMPORT_SCRIPT; 
goog.nullFunction = function() { }; 
goog.identityFunction = function(var_args) { 
  return arguments[0]; 
}; 
goog.abstractMethod = function() { 
  throw Error('unimplemented abstract method'); 
}; 
goog.addSingletonGetter = function(ctor) { 
  ctor.getInstance = function() { 
    return ctor.instance_ ||(ctor.instance_ = new ctor()); 
  }; 
}; 
if(! COMPILED) { 
  goog.included_ = { }; 
  goog.dependencies_ = { 
    pathToNames: { }, 
    nameToPath: { }, 
    requires: { }, 
    visited: { }, 
    written: { } 
  }; 
  goog.inHtmlDocument_ = function() { 
    var doc = goog.global.document; 
    return typeof doc != 'undefined' && 'write' in doc; 
  }; 
  goog.findBasePath_ = function() { 
    if(goog.global.CLOSURE_BASE_PATH) { 
      goog.basePath = goog.global.CLOSURE_BASE_PATH; 
      return; 
    } else if(! goog.inHtmlDocument_()) { 
      return; 
    } 
    var doc = goog.global.document; 
    var scripts = doc.getElementsByTagName('script'); 
    for(var i = scripts.length - 1; i >= 0; -- i) { 
      var src = scripts[i].src; 
      var qmark = src.lastIndexOf('?'); 
      var l = qmark == - 1 ? src.length: qmark; 
      if(src.substr(l - 7, 7) == 'base.js') { 
        goog.basePath = src.substr(0, l - 7); 
        return; 
      } 
    } 
  }; 
  goog.importScript_ = function(src) { 
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_; 
    if(! goog.dependencies_.written[src]&& importScript(src)) { 
      goog.dependencies_.written[src]= true; 
    } 
  }; 
  goog.writeScriptTag_ = function(src) { 
    if(goog.inHtmlDocument_()) { 
      var doc = goog.global.document; 
      doc.write('<script type="text/javascript" src="' + src + '"></' + 'script>'); 
      return true; 
    } else { 
      return false; 
    } 
  }; 
  goog.writeScripts_ = function() { 
    var scripts =[]; 
    var seenScript = { }; 
    var deps = goog.dependencies_; 
    function visitNode(path) { 
      if(path in deps.written) { 
        return; 
      } 
      if(path in deps.visited) { 
        if(!(path in seenScript)) { 
          seenScript[path]= true; 
          scripts.push(path); 
        } 
        return; 
      } 
      deps.visited[path]= true; 
      if(path in deps.requires) { 
        for(var requireName in deps.requires[path]) { 
          if(! goog.isProvided_(requireName)) { 
            if(requireName in deps.nameToPath) { 
              visitNode(deps.nameToPath[requireName]); 
            } else { 
              throw Error('Undefined nameToPath for ' + requireName); 
            } 
          } 
        } 
      } 
      if(!(path in seenScript)) { 
        seenScript[path]= true; 
        scripts.push(path); 
      } 
    } 
    for(var path in goog.included_) { 
      if(! deps.written[path]) { 
        visitNode(path); 
      } 
    } 
    for(var i = 0; i < scripts.length; i ++) { 
      if(scripts[i]) { 
        goog.importScript_(goog.basePath + scripts[i]); 
      } else { 
        throw Error('Undefined script input'); 
      } 
    } 
  }; 
  goog.getPathFromDeps_ = function(rule) { 
    if(rule in goog.dependencies_.nameToPath) { 
      return goog.dependencies_.nameToPath[rule]; 
    } else { 
      return null; 
    } 
  }; 
  goog.findBasePath_(); 
  if(! goog.global.CLOSURE_NO_DEPS) { 
    goog.importScript_(goog.basePath + 'deps.js'); 
  } 
} 
goog.typeOf = function(value) { 
  var s = typeof value; 
  if(s == 'object') { 
    if(value) { 
      if(value instanceof Array) { 
        return 'array'; 
      } else if(value instanceof Object) { 
        return s; 
      } 
      var className = Object.prototype.toString.call((value)); 
      if(className == '[object Window]') { 
        return 'object'; 
      } 
      if((className == '[object Array]' || typeof value.length == 'number' && typeof value.splice != 'undefined' && typeof value.propertyIsEnumerable != 'undefined' && ! value.propertyIsEnumerable('splice'))) { 
        return 'array'; 
      } 
      if((className == '[object Function]' || typeof value.call != 'undefined' && typeof value.propertyIsEnumerable != 'undefined' && ! value.propertyIsEnumerable('call'))) { 
        return 'function'; 
      } 
    } else { 
      return 'null'; 
    } 
  } else if(s == 'function' && typeof value.call == 'undefined') { 
    return 'object'; 
  } 
  return s; 
}; 
goog.propertyIsEnumerableCustom_ = function(object, propName) { 
  if(propName in object) { 
    for(var key in object) { 
      if(key == propName && Object.prototype.hasOwnProperty.call(object, propName)) { 
        return true; 
      } 
    } 
  } 
  return false; 
}; 
goog.propertyIsEnumerable_ = function(object, propName) { 
  if(object instanceof Object) { 
    return Object.prototype.propertyIsEnumerable.call(object, propName); 
  } else { 
    return goog.propertyIsEnumerableCustom_(object, propName); 
  } 
}; 
goog.isDef = function(val) { 
  return val !== undefined; 
}; 
goog.isNull = function(val) { 
  return val === null; 
}; 
goog.isDefAndNotNull = function(val) { 
  return val != null; 
}; 
goog.isArray = function(val) { 
  return goog.typeOf(val) == 'array'; 
}; 
goog.isArrayLike = function(val) { 
  var type = goog.typeOf(val); 
  return type == 'array' || type == 'object' && typeof val.length == 'number'; 
}; 
goog.isDateLike = function(val) { 
  return goog.isObject(val) && typeof val.getFullYear == 'function'; 
}; 
goog.isString = function(val) { 
  return typeof val == 'string'; 
}; 
goog.isBoolean = function(val) { 
  return typeof val == 'boolean'; 
}; 
goog.isNumber = function(val) { 
  return typeof val == 'number'; 
}; 
goog.isFunction = function(val) { 
  return goog.typeOf(val) == 'function'; 
}; 
goog.isObject = function(val) { 
  var type = goog.typeOf(val); 
  return type == 'object' || type == 'array' || type == 'function'; 
}; 
goog.getUid = function(obj) { 
  return obj[goog.UID_PROPERTY_]||(obj[goog.UID_PROPERTY_]= ++ goog.uidCounter_); 
}; 
goog.removeUid = function(obj) { 
  if('removeAttribute' in obj) { 
    obj.removeAttribute(goog.UID_PROPERTY_); 
  } 
  try { 
    delete obj[goog.UID_PROPERTY_]; 
  } catch(ex) { } 
}; 
goog.UID_PROPERTY_ = 'closure_uid_' + Math.floor(Math.random() * 2147483648).toString(36); 
goog.uidCounter_ = 0; 
goog.getHashCode = goog.getUid; 
goog.removeHashCode = goog.removeUid; 
goog.cloneObject = function(obj) { 
  var type = goog.typeOf(obj); 
  if(type == 'object' || type == 'array') { 
    if(obj.clone) { 
      return obj.clone(); 
    } 
    var clone = type == 'array' ?[]: { }; 
    for(var key in obj) { 
      clone[key]= goog.cloneObject(obj[key]); 
    } 
    return clone; 
  } 
  return obj; 
}; 
Object.prototype.clone; 
goog.bindNative_ = function(fn, selfObj, var_args) { 
  return(fn.call.apply(fn.bind, arguments)); 
}; 
goog.bindJs_ = function(fn, selfObj, var_args) { 
  var context = selfObj || goog.global; 
  if(arguments.length > 2) { 
    var boundArgs = Array.prototype.slice.call(arguments, 2); 
    return function() { 
      var newArgs = Array.prototype.slice.call(arguments); 
      Array.prototype.unshift.apply(newArgs, boundArgs); 
      return fn.apply(context, newArgs); 
    }; 
  } else { 
    return function() { 
      return fn.apply(context, arguments); 
    }; 
  } 
}; 
goog.bind = function(fn, selfObj, var_args) { 
  if(Function.prototype.bind && Function.prototype.bind.toString().indexOf('native code') != - 1) { 
    goog.bind = goog.bindNative_; 
  } else { 
    goog.bind = goog.bindJs_; 
  } 
  return goog.bind.apply(null, arguments); 
}; 
goog.partial = function(fn, var_args) { 
  var args = Array.prototype.slice.call(arguments, 1); 
  return function() { 
    var newArgs = Array.prototype.slice.call(arguments); 
    newArgs.unshift.apply(newArgs, args); 
    return fn.apply(this, newArgs); 
  }; 
}; 
goog.mixin = function(target, source) { 
  for(var x in source) { 
    target[x]= source[x]; 
  } 
}; 
goog.now = Date.now ||(function() { 
  return + new Date(); 
}); 
goog.globalEval = function(script) { 
  if(goog.global.execScript) { 
    goog.global.execScript(script, 'JavaScript'); 
  } else if(goog.global.eval) { 
    if(goog.evalWorksForGlobals_ == null) { 
      goog.global.eval('var _et_ = 1;'); 
      if(typeof goog.global['_et_']!= 'undefined') { 
        delete goog.global['_et_']; 
        goog.evalWorksForGlobals_ = true; 
      } else { 
        goog.evalWorksForGlobals_ = false; 
      } 
    } 
    if(goog.evalWorksForGlobals_) { 
      goog.global.eval(script); 
    } else { 
      var doc = goog.global.document; 
      var scriptElt = doc.createElement('script'); 
      scriptElt.type = 'text/javascript'; 
      scriptElt.defer = false; 
      scriptElt.appendChild(doc.createTextNode(script)); 
      doc.body.appendChild(scriptElt); 
      doc.body.removeChild(scriptElt); 
    } 
  } else { 
    throw Error('goog.globalEval not available'); 
  } 
}; 
goog.cssNameMapping_; 
goog.cssNameMappingStyle_; 
goog.getCssName = function(className, opt_modifier) { 
  var getMapping = function(cssName) { 
    return goog.cssNameMapping_[cssName]|| cssName; 
  }; 
  var renameByParts = function(cssName) { 
    var parts = cssName.split('-'); 
    var mapped =[]; 
    for(var i = 0; i < parts.length; i ++) { 
      mapped.push(getMapping(parts[i])); 
    } 
    return mapped.join('-'); 
  }; 
  var rename; 
  if(goog.cssNameMapping_) { 
    rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ? getMapping: renameByParts; 
  } else { 
    rename = function(a) { 
      return a; 
    }; 
  } 
  if(opt_modifier) { 
    return className + '-' + rename(opt_modifier); 
  } else { 
    return rename(className); 
  } 
}; 
goog.setCssNameMapping = function(mapping, style) { 
  goog.cssNameMapping_ = mapping; 
  goog.cssNameMappingStyle_ = style; 
}; 
goog.getMsg = function(str, opt_values) { 
  var values = opt_values || { }; 
  for(var key in values) { 
    var value =('' + values[key]).replace(/\$/g, '$$$$'); 
    str = str.replace(new RegExp('\\{\\$' + key + '\\}', 'gi'), value); 
  } 
  return str; 
}; 
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) { 
  goog.exportPath_(publicPath, object, opt_objectToExportTo); 
}; 
goog.exportProperty = function(object, publicName, symbol) { 
  object[publicName]= symbol; 
}; 
goog.inherits = function(childCtor, parentCtor) { 
  function tempCtor() { } 
  ; 
  tempCtor.prototype = parentCtor.prototype; 
  childCtor.superClass_ = parentCtor.prototype; 
  childCtor.prototype = new tempCtor(); 
  childCtor.prototype.constructor = childCtor; 
}; 
goog.base = function(me, opt_methodName, var_args) { 
  var caller = arguments.callee.caller; 
  if(caller.superClass_) { 
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1)); 
  } 
  var args = Array.prototype.slice.call(arguments, 2); 
  var foundCaller = false; 
  for(var ctor = me.constructor; ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) { 
    if(ctor.prototype[opt_methodName]=== caller) { 
      foundCaller = true; 
    } else if(foundCaller) { 
      return ctor.prototype[opt_methodName].apply(me, args); 
    } 
  } 
  if(me[opt_methodName]=== caller) { 
    return me.constructor.prototype[opt_methodName].apply(me, args); 
  } else { 
    throw Error('goog.base called from a method of one name ' + 'to a method of a different name'); 
  } 
}; 
goog.scope = function(fn) { 
  fn.call(goog.global); 
}; 
