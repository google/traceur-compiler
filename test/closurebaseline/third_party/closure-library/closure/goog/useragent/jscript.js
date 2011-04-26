
goog.provide('goog.userAgent.jscript'); 
goog.require('goog.string'); 
goog.userAgent.jscript.ASSUME_NO_JSCRIPT = false; 
goog.userAgent.jscript.init_ = function() { 
  var hasScriptEngine = 'ScriptEngine' in goog.global; 
  goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ = hasScriptEngine && goog.global['ScriptEngine']() == 'JScript'; 
  goog.userAgent.jscript.DETECTED_VERSION_ = goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ ?(goog.global['ScriptEngineMajorVersion']() + '.' + goog.global['ScriptEngineMinorVersion']() + '.' + goog.global['ScriptEngineBuildVersion']()): '0'; 
}; 
if(! goog.userAgent.jscript.ASSUME_NO_JSCRIPT) { 
  goog.userAgent.jscript.init_(); 
} 
goog.userAgent.jscript.HAS_JSCRIPT = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? false: goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_; 
goog.userAgent.jscript.VERSION = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? '0': goog.userAgent.jscript.DETECTED_VERSION_; 
goog.userAgent.jscript.isVersion = function(version) { 
  return goog.string.compareVersions(goog.userAgent.jscript.VERSION, version) >= 0; 
}; 
