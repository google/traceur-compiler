
goog.provide('goog.ui.registry'); 
goog.require('goog.dom.classes'); 
goog.ui.registry.getDefaultRenderer = function(componentCtor) { 
  var key; 
  var rendererCtor; 
  while(componentCtor) { 
    key = goog.getUid(componentCtor); 
    if((rendererCtor = goog.ui.registry.defaultRenderers_[key])) { 
      break; 
    } 
    componentCtor = componentCtor.superClass_ ? componentCtor.superClass_.constructor: null; 
  } 
  if(rendererCtor) { 
    return goog.isFunction(rendererCtor.getInstance) ? rendererCtor.getInstance(): new rendererCtor(); 
  } 
  return null; 
}; 
goog.ui.registry.setDefaultRenderer = function(componentCtor, rendererCtor) { 
  if(! goog.isFunction(componentCtor)) { 
    throw Error('Invalid component class ' + componentCtor); 
  } 
  if(! goog.isFunction(rendererCtor)) { 
    throw Error('Invalid renderer class ' + rendererCtor); 
  } 
  var key = goog.getUid(componentCtor); 
  goog.ui.registry.defaultRenderers_[key]= rendererCtor; 
}; 
goog.ui.registry.getDecoratorByClassName = function(className) { 
  return className in goog.ui.registry.decoratorFunctions_ ? goog.ui.registry.decoratorFunctions_[className](): null; 
}; 
goog.ui.registry.setDecoratorByClassName = function(className, decoratorFn) { 
  if(! className) { 
    throw Error('Invalid class name ' + className); 
  } 
  if(! goog.isFunction(decoratorFn)) { 
    throw Error('Invalid decorator function ' + decoratorFn); 
  } 
  goog.ui.registry.decoratorFunctions_[className]= decoratorFn; 
}; 
goog.ui.registry.getDecorator = function(element) { 
  var decorator; 
  var classNames = goog.dom.classes.get(element); 
  for(var i = 0, len = classNames.length; i < len; i ++) { 
    if((decorator = goog.ui.registry.getDecoratorByClassName(classNames[i]))) { 
      return decorator; 
    } 
  } 
  return null; 
}; 
goog.ui.registry.reset = function() { 
  goog.ui.registry.defaultRenderers_ = { }; 
  goog.ui.registry.decoratorFunctions_ = { }; 
}; 
goog.ui.registry.defaultRenderers_ = { }; 
goog.ui.registry.decoratorFunctions_ = { }; 
