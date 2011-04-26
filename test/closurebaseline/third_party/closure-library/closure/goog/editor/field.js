
goog.provide('goog.editor.Field'); 
goog.provide('goog.editor.Field.EventType'); 
goog.require('goog.array'); 
goog.require('goog.async.Delay'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.dom.Range'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.classes'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.Command'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.editor.icontent'); 
goog.require('goog.editor.icontent.FieldFormatInfo'); 
goog.require('goog.editor.icontent.FieldStyleInfo'); 
goog.require('goog.editor.node'); 
goog.require('goog.editor.range'); 
goog.require('goog.events'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyCodes'); 
goog.require('goog.functions'); 
goog.require('goog.string'); 
goog.require('goog.string.Unicode'); 
goog.require('goog.style'); 
goog.require('goog.userAgent'); 
goog.editor.Field = function(id, opt_doc) { 
  goog.events.EventTarget.call(this); 
  this.id = id; 
  this.hashCode_ = id; 
  this.editableDomHelper = null; 
  this.plugins_ = { }; 
  this.indexedPlugins_ = { }; 
  for(var op in goog.editor.Plugin.OPCODE) { 
    this.indexedPlugins_[op]=[]; 
  } 
  this.cssStyles = ''; 
  if(goog.userAgent.WEBKIT && goog.userAgent.isVersion('525.13') && goog.string.compareVersions(goog.userAgent.VERSION, '525.18') <= 0) { 
    this.workaroundClassName_ = goog.getCssName('tr-webkit-workaround'); 
    this.cssStyles = '.' + this.workaroundClassName_ + '>*{padding-right:1}'; 
  } 
  this.stoppedEvents_ = { }; 
  this.stopEvent(goog.editor.Field.EventType.CHANGE); 
  this.stopEvent(goog.editor.Field.EventType.DELAYEDCHANGE); 
  this.isModified_ = false; 
  this.isEverModified_ = false; 
  this.delayedChangeTimer_ = new goog.async.Delay(this.dispatchDelayedChange_, goog.editor.Field.DELAYED_CHANGE_FREQUENCY, this); 
  this.debouncedEvents_ = { }; 
  for(var key in goog.editor.Field.EventType) { 
    this.debouncedEvents_[goog.editor.Field.EventType[key]]= 0; 
  } 
  if(goog.editor.BrowserFeature.USE_MUTATION_EVENTS) { 
    this.changeTimerGecko_ = new goog.async.Delay(this.handleChange, goog.editor.Field.CHANGE_FREQUENCY, this); 
  } 
  this.eventRegister = new goog.events.EventHandler(this); 
  this.wrappers_ =[]; 
  this.loadState_ = goog.editor.Field.LoadState_.UNEDITABLE; 
  var doc = opt_doc || document; 
  this.originalDomHelper = goog.dom.getDomHelper(doc); 
  this.originalElement = this.originalDomHelper.getElement(this.id); 
  this.appWindow_ = this.originalDomHelper.getWindow(); 
}; 
goog.inherits(goog.editor.Field, goog.events.EventTarget); 
goog.editor.Field.prototype.field = null; 
goog.editor.Field.prototype.originalElement = null; 
goog.editor.Field.prototype.logger = goog.debug.Logger.getLogger('goog.editor.Field'); 
goog.editor.Field.EventType = { 
  COMMAND_VALUE_CHANGE: 'cvc', 
  LOAD: 'load', 
  UNLOAD: 'unload', 
  BEFORECHANGE: 'beforechange', 
  CHANGE: 'change', 
  DELAYEDCHANGE: 'delayedchange', 
  BEFOREFOCUS: 'beforefocus', 
  FOCUS: 'focus', 
  BLUR: 'blur', 
  BEFORETAB: 'beforetab', 
  SELECTIONCHANGE: 'selectionchange' 
}; 
goog.editor.Field.LoadState_ = { 
  UNEDITABLE: 0, 
  LOADING: 1, 
  EDITABLE: 2 
}; 
goog.editor.Field.DEBOUNCE_TIME_MS_ = 500; 
goog.editor.Field.activeFieldId_ = null; 
goog.editor.Field.prototype.inModalMode_ = false; 
goog.editor.Field.prototype.appWindow_; 
goog.editor.Field.prototype.originalDomHelper; 
goog.editor.Field.prototype.selectionChangeTarget_; 
goog.editor.Field.setActiveFieldId = function(fieldId) { 
  goog.editor.Field.activeFieldId_ = fieldId; 
}; 
goog.editor.Field.getActiveFieldId = function() { 
  return goog.editor.Field.activeFieldId_; 
}; 
goog.editor.Field.prototype.inModalMode = function() { 
  return this.inModalMode_; 
}; 
goog.editor.Field.prototype.setModalMode = function(inModalMode) { 
  this.inModalMode_ = inModalMode; 
}; 
goog.editor.Field.prototype.getHashCode = function() { 
  return this.hashCode_; 
}; 
goog.editor.Field.prototype.getElement = function() { 
  return this.field; 
}; 
goog.editor.Field.prototype.getOriginalElement = function() { 
  return this.originalElement; 
}; 
goog.editor.Field.prototype.addListener = function(type, listener, opt_capture, opt_handler) { 
  var elem = this.getElement(); 
  if(elem && goog.editor.BrowserFeature.USE_DOCUMENT_FOR_KEY_EVENTS) { 
    elem = elem.ownerDocument; 
  } 
  this.eventRegister.listen(elem, type, listener, opt_capture, opt_handler); 
}; 
goog.editor.Field.prototype.getPluginByClassId = function(classId) { 
  return this.plugins_[classId]; 
}; 
goog.editor.Field.prototype.registerPlugin = function(plugin) { 
  var classId = plugin.getTrogClassId(); 
  if(this.plugins_[classId]) { 
    this.logger.severe('Cannot register the same class of plugin twice.'); 
  } 
  this.plugins_[classId]= plugin; 
  for(var op in goog.editor.Plugin.OPCODE) { 
    var opcode = goog.editor.Plugin.OPCODE[op]; 
    if(plugin[opcode]) { 
      this.indexedPlugins_[op].push(plugin); 
    } 
  } 
  plugin.registerFieldObject(this); 
  if(this.isLoaded()) { 
    plugin.enable(this); 
  } 
}; 
goog.editor.Field.prototype.unregisterPlugin = function(plugin) { 
  var classId = plugin.getTrogClassId(); 
  if(! this.plugins_[classId]) { 
    this.logger.severe('Cannot unregister a plugin that isn\'t registered.'); 
  } 
  delete this.plugins_[classId]; 
  for(var op in goog.editor.Plugin.OPCODE) { 
    var opcode = goog.editor.Plugin.OPCODE[op]; 
    if(plugin[opcode]) { 
      goog.array.remove(this.indexedPlugins_[op], plugin); 
    } 
  } 
  plugin.unregisterFieldObject(this); 
}; 
goog.editor.Field.prototype.setInitialStyle = function(cssText) { 
  this.cssText = cssText; 
}; 
goog.editor.Field.prototype.resetOriginalElemProperties = function() { 
  var field = this.getOriginalElement(); 
  field.removeAttribute('contentEditable'); 
  field.removeAttribute('g_editable'); 
  if(! this.id) { 
    field.removeAttribute('id'); 
  } else { 
    field.id = this.id; 
  } 
  field.className = this.savedClassName_ || ''; 
  var cssText = this.cssText; 
  if(! cssText) { 
    field.removeAttribute('style'); 
  } else { 
    goog.dom.setProperties(field, { 'style': cssText }); 
  } 
  if(goog.isString(this.originalFieldLineHeight_)) { 
    goog.style.setStyle(field, 'lineHeight', this.originalFieldLineHeight_); 
    this.originalFieldLineHeight_ = null; 
  } 
}; 
goog.editor.Field.prototype.isModified = function(opt_useIsEverModified) { 
  return opt_useIsEverModified ? this.isEverModified_: this.isModified_; 
}; 
goog.editor.Field.CHANGE_FREQUENCY = 15; 
goog.editor.Field.DELAYED_CHANGE_FREQUENCY = 250; 
goog.editor.Field.prototype.usesIframe = goog.functions.TRUE; 
goog.editor.Field.prototype.isFixedHeight = goog.functions.TRUE; 
goog.editor.Field.KEYS_CAUSING_CHANGES_ = { 
  46: true, 
  8: true 
}; 
if(! goog.userAgent.IE) { 
  goog.editor.Field.KEYS_CAUSING_CHANGES_[9]= true; 
} 
goog.editor.Field.CTRL_KEYS_CAUSING_CHANGES_ = { 
  86: true, 
  88: true 
}; 
if(goog.userAgent.IE) { 
  goog.editor.Field.KEYS_CAUSING_CHANGES_[229]= true; 
} 
goog.editor.Field.isGeneratingKey_ = function(e, testAllKeys) { 
  if(goog.editor.Field.isSpecialGeneratingKey_(e)) { 
    return true; 
  } 
  return ! !(testAllKeys && !(e.ctrlKey || e.metaKey) &&(! goog.userAgent.GECKO || e.charCode)); 
}; 
goog.editor.Field.isSpecialGeneratingKey_ = function(e) { 
  var testCtrlKeys =(e.ctrlKey || e.metaKey) && e.keyCode in goog.editor.Field.CTRL_KEYS_CAUSING_CHANGES_; 
  var testRegularKeys = !(e.ctrlKey || e.metaKey) && e.keyCode in goog.editor.Field.KEYS_CAUSING_CHANGES_; 
  return testCtrlKeys || testRegularKeys; 
}; 
goog.editor.Field.prototype.setAppWindow = function(appWindow) { 
  this.appWindow_ = appWindow; 
}; 
goog.editor.Field.prototype.getAppWindow = function() { 
  return this.appWindow_; 
}; 
goog.editor.Field.prototype.setBaseZindex = function(zindex) { 
  this.baseZindex_ = zindex; 
}; 
goog.editor.Field.prototype.getBaseZindex = function() { 
  return this.baseZindex_ || 0; 
}; 
goog.editor.Field.prototype.setupFieldObject = function(field) { 
  this.loadState_ = goog.editor.Field.LoadState_.EDITABLE; 
  this.field = field; 
  this.editableDomHelper = goog.dom.getDomHelper(field); 
  this.isModified_ = false; 
  this.isEverModified_ = false; 
  field.setAttribute('g_editable', 'true'); 
}; 
goog.editor.Field.prototype.tearDownFieldObject_ = function() { 
  this.loadState_ = goog.editor.Field.LoadState_.UNEDITABLE; 
  for(var classId in this.plugins_) { 
    var plugin = this.plugins_[classId]; 
    if(! plugin.activeOnUneditableFields()) { 
      plugin.disable(this); 
    } 
  } 
  this.field = null; 
  this.editableDomHelper = null; 
}; 
goog.editor.Field.prototype.setupChangeListeners_ = function() { 
  if(goog.userAgent.OPERA && this.usesIframe()) { 
    this.boundFocusListenerOpera_ = goog.bind(this.dispatchFocusAndBeforeFocus_, this); 
    this.boundBlurListenerOpera_ = goog.bind(this.dispatchBlur, this); 
    var editWindow = this.getEditableDomHelper().getWindow(); 
    editWindow.addEventListener(goog.events.EventType.FOCUS, this.boundFocusListenerOpera_, false); 
    editWindow.addEventListener(goog.events.EventType.BLUR, this.boundBlurListenerOpera_, false); 
  } else { 
    if(goog.editor.BrowserFeature.SUPPORTS_FOCUSIN) { 
      this.addListener(goog.events.EventType.FOCUS, this.dispatchFocus_); 
      this.addListener(goog.events.EventType.FOCUSIN, this.dispatchBeforeFocus_); 
    } else { 
      this.addListener(goog.events.EventType.FOCUS, this.dispatchFocusAndBeforeFocus_); 
    } 
    this.addListener(goog.events.EventType.BLUR, this.dispatchBlur, goog.editor.BrowserFeature.USE_MUTATION_EVENTS); 
  } 
  if(goog.editor.BrowserFeature.USE_MUTATION_EVENTS) { 
    this.setupMutationEventHandlersGecko(); 
  } else { 
    this.addListener(['beforecut', 'beforepaste', 'drop', 'dragend'], this.dispatchBeforeChange); 
    this.addListener(['cut', 'paste'], this.dispatchChange); 
    this.addListener('drop', this.handleDrop_); 
  } 
  var dropEventName = goog.userAgent.WEBKIT ? 'dragend': 'dragdrop'; 
  this.addListener(dropEventName, this.handleDrop_); 
  this.addListener(goog.events.EventType.KEYDOWN, this.handleKeyDown_); 
  this.addListener(goog.events.EventType.KEYPRESS, this.handleKeyPress_); 
  this.addListener(goog.events.EventType.KEYUP, this.handleKeyUp_); 
  this.selectionChangeTimer_ = new goog.async.Delay(this.handleSelectionChangeTimer_, goog.editor.Field.SELECTION_CHANGE_FREQUENCY_, this); 
  if(goog.editor.BrowserFeature.FOLLOWS_EDITABLE_LINKS) { 
    this.addListener(goog.events.EventType.CLICK, goog.editor.Field.cancelLinkClick_); 
  } 
  this.addListener(goog.events.EventType.MOUSEDOWN, this.handleMouseDown_); 
  this.addListener(goog.events.EventType.MOUSEUP, this.handleMouseUp_); 
}; 
goog.editor.Field.SELECTION_CHANGE_FREQUENCY_ = 250; 
goog.editor.Field.prototype.clearListeners_ = function() { 
  if(this.eventRegister) { 
    this.eventRegister.removeAll(); 
  } 
  if(goog.userAgent.OPERA && this.usesIframe()) { 
    try { 
      var editWindow = this.getEditableDomHelper().getWindow(); 
      editWindow.removeEventListener(goog.events.EventType.FOCUS, this.boundFocusListenerOpera_, false); 
      editWindow.removeEventListener(goog.events.EventType.BLUR, this.boundBlurListenerOpera_, false); 
    } catch(e) { } 
    delete this.boundFocusListenerOpera_; 
    delete this.boundBlurListenerOpera_; 
  } 
  if(this.changeTimerGecko_) { 
    this.changeTimerGecko_.stop(); 
  } 
  this.delayedChangeTimer_.stop(); 
}; 
goog.editor.Field.prototype.disposeInternal = function() { 
  if(this.isLoading() || this.isLoaded()) { 
    this.logger.warning('Disposing a field that is in use.'); 
  } 
  if(this.getOriginalElement()) { 
    this.execCommand(goog.editor.Command.CLEAR_LOREM); 
  } 
  this.tearDownFieldObject_(); 
  this.clearListeners_(); 
  this.originalDomHelper = null; 
  if(this.eventRegister) { 
    this.eventRegister.dispose(); 
    this.eventRegister = null; 
  } 
  this.removeAllWrappers(); 
  if(goog.editor.Field.getActiveFieldId() == this.id) { 
    goog.editor.Field.setActiveFieldId(null); 
  } 
  for(var classId in this.plugins_) { 
    var plugin = this.plugins_[classId]; 
    if(plugin.isAutoDispose()) { 
      plugin.dispose(); 
    } 
  } 
  delete(this.plugins_); 
  goog.editor.Field.superClass_.disposeInternal.call(this); 
}; 
goog.editor.Field.prototype.attachWrapper = function(wrapper) { 
  this.wrappers_.push(wrapper); 
}; 
goog.editor.Field.prototype.removeAllWrappers = function() { 
  var wrapper; 
  while(wrapper = this.wrappers_.pop()) { 
    wrapper.dispose(); 
  } 
}; 
goog.editor.Field.MUTATION_EVENTS_GECKO =['DOMNodeInserted', 'DOMNodeRemoved', 'DOMNodeRemovedFromDocument', 'DOMNodeInsertedIntoDocument', 'DOMCharacterDataModified']; 
goog.editor.Field.prototype.setupMutationEventHandlersGecko = function() { 
  if(goog.editor.BrowserFeature.HAS_DOM_SUBTREE_MODIFIED_EVENT) { 
    this.eventRegister.listen(this.getElement(), 'DOMSubtreeModified', this.handleMutationEventGecko_); 
  } else { 
    var doc = this.getEditableDomHelper().getDocument(); 
    this.eventRegister.listen(doc, goog.editor.Field.MUTATION_EVENTS_GECKO, this.handleMutationEventGecko_, true); 
    this.eventRegister.listen(doc, 'DOMAttrModified', goog.bind(this.handleDomAttrChange, this, this.handleMutationEventGecko_), true); 
  } 
}; 
goog.editor.Field.prototype.handleBeforeChangeKeyEvent_ = function(e) { 
  var block =(e.keyCode == goog.events.KeyCodes.TAB && ! this.dispatchBeforeTab_(e)) ||(goog.userAgent.GECKO && e.metaKey &&(e.keyCode == goog.events.KeyCodes.LEFT || e.keyCode == goog.events.KeyCodes.RIGHT)); 
  if(block) { 
    e.preventDefault(); 
    return false; 
  } else { 
    this.gotGeneratingKey_ = e.charCode || goog.editor.Field.isGeneratingKey_(e, goog.userAgent.GECKO); 
    if(this.gotGeneratingKey_) { 
      this.dispatchBeforeChange(); 
    } 
  } 
  return true; 
}; 
goog.editor.Field.SELECTION_CHANGE_KEYCODES_ = { 
  8: 1, 
  9: 1, 
  13: 1, 
  33: 1, 
  34: 1, 
  35: 1, 
  36: 1, 
  37: 1, 
  38: 1, 
  39: 1, 
  40: 1, 
  46: 1 
}; 
goog.editor.Field.CTRL_KEYS_CAUSING_SELECTION_CHANGES_ = { 
  65: true, 
  86: true, 
  88: true 
}; 
goog.editor.Field.POTENTIAL_SHORTCUT_KEYCODES_ = { 
  8: 1, 
  9: 1, 
  13: 1, 
  27: 1, 
  33: 1, 
  34: 1, 
  37: 1, 
  38: 1, 
  39: 1, 
  40: 1 
}; 
goog.editor.Field.prototype.invokeShortCircuitingOp_ = function(op, var_args) { 
  var plugins = this.indexedPlugins_[op]; 
  var argList = goog.array.slice(arguments, 1); 
  for(var i = 0; i < plugins.length; ++ i) { 
    var plugin = plugins[i]; 
    if((plugin.isEnabled(this) || goog.editor.Plugin.IRREPRESSIBLE_OPS[op]) && plugin[goog.editor.Plugin.OPCODE[op]].apply(plugin, argList)) { 
      return true; 
    } 
  } 
  return false; 
}; 
goog.editor.Field.prototype.invokeOp_ = function(op, var_args) { 
  var plugins = this.indexedPlugins_[op]; 
  var argList = goog.array.slice(arguments, 1); 
  for(var i = 0; i < plugins.length; ++ i) { 
    var plugin = plugins[i]; 
    if(plugin.isEnabled(this) || goog.editor.Plugin.IRREPRESSIBLE_OPS[op]) { 
      plugin[goog.editor.Plugin.OPCODE[op]].apply(plugin, argList); 
    } 
  } 
}; 
goog.editor.Field.prototype.reduceOp_ = function(op, arg, var_args) { 
  var plugins = this.indexedPlugins_[op]; 
  var argList = goog.array.slice(arguments, 1); 
  for(var i = 0; i < plugins.length; ++ i) { 
    var plugin = plugins[i]; 
    if(plugin.isEnabled(this) || goog.editor.Plugin.IRREPRESSIBLE_OPS[op]) { 
      argList[0]= plugin[goog.editor.Plugin.OPCODE[op]].apply(plugin, argList); 
    } 
  } 
  return argList[0]; 
}; 
goog.editor.Field.prototype.injectContents = function(contents, field) { 
  var styles = { }; 
  var newHtml = this.getInjectableContents(contents, styles); 
  goog.style.setStyle(field, styles); 
  field.innerHTML = newHtml; 
}; 
goog.editor.Field.prototype.getInjectableContents = function(contents, styles) { 
  return this.reduceOp_(goog.editor.Plugin.Op.PREPARE_CONTENTS_HTML, contents || '', styles); 
}; 
goog.editor.Field.prototype.handleKeyDown_ = function(e) { 
  if(! goog.editor.BrowserFeature.USE_MUTATION_EVENTS) { 
    if(! this.handleBeforeChangeKeyEvent_(e)) { 
      return; 
    } 
  } 
  if(! this.invokeShortCircuitingOp_(goog.editor.Plugin.Op.KEYDOWN, e) && goog.editor.BrowserFeature.USES_KEYDOWN) { 
    this.handleKeyboardShortcut_(e); 
  } 
}; 
goog.editor.Field.prototype.handleKeyPress_ = function(e) { 
  if(goog.editor.BrowserFeature.USE_MUTATION_EVENTS) { 
    if(! this.handleBeforeChangeKeyEvent_(e)) { 
      return; 
    } 
  } else { 
    this.gotGeneratingKey_ = true; 
    this.dispatchBeforeChange(); 
  } 
  if(! this.invokeShortCircuitingOp_(goog.editor.Plugin.Op.KEYPRESS, e) && ! goog.editor.BrowserFeature.USES_KEYDOWN) { 
    this.handleKeyboardShortcut_(e); 
  } 
}; 
goog.editor.Field.prototype.handleKeyUp_ = function(e) { 
  if(! goog.editor.BrowserFeature.USE_MUTATION_EVENTS &&(this.gotGeneratingKey_ || goog.editor.Field.isSpecialGeneratingKey_(e))) { 
    this.handleChange(); 
  } 
  this.invokeShortCircuitingOp_(goog.editor.Plugin.Op.KEYUP, e); 
  if(this.isEventStopped(goog.editor.Field.EventType.SELECTIONCHANGE)) { 
    return; 
  } 
  if(goog.editor.Field.SELECTION_CHANGE_KEYCODES_[e.keyCode]||((e.ctrlKey || e.metaKey) && goog.editor.Field.CTRL_KEYS_CAUSING_SELECTION_CHANGES_[e.keyCode])) { 
    this.selectionChangeTimer_.start(); 
  } 
}; 
goog.editor.Field.prototype.handleKeyboardShortcut_ = function(e) { 
  if(e.altKey) { 
    return; 
  } 
  var isModifierPressed = goog.userAgent.MAC ? e.metaKey: e.ctrlKey; 
  if(isModifierPressed || goog.editor.Field.POTENTIAL_SHORTCUT_KEYCODES_[e.keyCode]) { 
    var key = e.charCode || e.keyCode; 
    if(key == 17) { 
      return; 
    } 
    var stringKey = String.fromCharCode(key).toLowerCase(); 
    if(this.invokeShortCircuitingOp_(goog.editor.Plugin.Op.SHORTCUT, e, stringKey, isModifierPressed)) { 
      e.preventDefault(); 
    } 
  } 
}; 
goog.editor.Field.prototype.execCommand = function(command, var_args) { 
  var args = arguments; 
  var result; 
  var plugins = this.indexedPlugins_[goog.editor.Plugin.Op.EXEC_COMMAND]; 
  for(var i = 0; i < plugins.length; ++ i) { 
    var plugin = plugins[i]; 
    if(plugin.isEnabled(this) && plugin.isSupportedCommand(command)) { 
      result = plugin.execCommand.apply(plugin, args); 
      break; 
    } 
  } 
  return result; 
}; 
goog.editor.Field.prototype.queryCommandValue = function(commands) { 
  var isEditable = this.isLoaded() && this.isSelectionEditable(); 
  if(goog.isString(commands)) { 
    return this.queryCommandValueInternal_(commands, isEditable); 
  } else { 
    var state = { }; 
    for(var i = 0; i < commands.length; i ++) { 
      state[commands[i]]= this.queryCommandValueInternal_(commands[i], isEditable); 
    } 
    return state; 
  } 
}; 
goog.editor.Field.prototype.queryCommandValueInternal_ = function(command, isEditable) { 
  var plugins = this.indexedPlugins_[goog.editor.Plugin.Op.QUERY_COMMAND]; 
  for(var i = 0; i < plugins.length; ++ i) { 
    var plugin = plugins[i]; 
    if(plugin.isEnabled(this) && plugin.isSupportedCommand(command) &&(isEditable || plugin.activeOnUneditableFields())) { 
      return plugin.queryCommandValue(command); 
    } 
  } 
  return isEditable ? null: false; 
}; 
goog.editor.Field.prototype.handleDomAttrChange = function(handler, e) { 
  if(this.isEventStopped(goog.editor.Field.EventType.CHANGE)) { 
    return; 
  } 
  e = e.getBrowserEvent(); 
  try { 
    if(e.originalTarget.prefix || e.originalTarget.nodeName == 'scrollbar') { 
      return; 
    } 
  } catch(ex1) { 
    return; 
  } 
  if(e.prevValue == e.newValue) { 
    return; 
  } 
  handler.call(this, e); 
}; 
goog.editor.Field.prototype.handleMutationEventGecko_ = function(e) { 
  if(this.isEventStopped(goog.editor.Field.EventType.CHANGE)) { 
    return; 
  } 
  e = e.getBrowserEvent ? e.getBrowserEvent(): e; 
  if(e.target.firebugIgnore) { 
    return; 
  } 
  this.isModified_ = true; 
  this.isEverModified_ = true; 
  this.changeTimerGecko_.start(); 
}; 
goog.editor.Field.prototype.handleDrop_ = function(e) { 
  if(goog.userAgent.IE) { 
    this.execCommand(goog.editor.Command.CLEAR_LOREM, true); 
  } 
  if(goog.editor.BrowserFeature.USE_MUTATION_EVENTS) { 
    this.dispatchFocusAndBeforeFocus_(); 
  } 
  this.dispatchChange(); 
}; 
goog.editor.Field.prototype.getEditableIframe = function() { 
  var dh; 
  if(this.usesIframe() &&(dh = this.getEditableDomHelper())) { 
    var win = dh.getWindow(); 
    return(win && win.frameElement); 
  } 
  return null; 
}; 
goog.editor.Field.prototype.getEditableDomHelper = function() { 
  return this.editableDomHelper; 
}; 
goog.editor.Field.prototype.getRange = function() { 
  var win = this.editableDomHelper && this.editableDomHelper.getWindow(); 
  return win && goog.dom.Range.createFromWindow(win); 
}; 
goog.editor.Field.prototype.dispatchSelectionChangeEvent = function(opt_e, opt_target) { 
  if(this.isEventStopped(goog.editor.Field.EventType.SELECTIONCHANGE)) { 
    return; 
  } 
  var range = this.getRange(); 
  var rangeContainer = range && range.getContainerElement(); 
  this.isSelectionEditable_ = ! ! rangeContainer && goog.dom.contains(this.getElement(), rangeContainer); 
  this.dispatchCommandValueChange(); 
  this.dispatchEvent({ 
    type: goog.editor.Field.EventType.SELECTIONCHANGE, 
    originalType: opt_e && opt_e.type 
  }); 
  this.invokeShortCircuitingOp_(goog.editor.Plugin.Op.SELECTION, opt_e, opt_target); 
}; 
goog.editor.Field.prototype.handleSelectionChangeTimer_ = function() { 
  var t = this.selectionChangeTarget_; 
  this.selectionChangeTarget_ = null; 
  this.dispatchSelectionChangeEvent(undefined, t); 
}; 
goog.editor.Field.prototype.dispatchBeforeChange = function() { 
  if(this.isEventStopped(goog.editor.Field.EventType.BEFORECHANGE)) { 
    return; 
  } 
  this.dispatchEvent(goog.editor.Field.EventType.BEFORECHANGE); 
}; 
goog.editor.Field.prototype.dispatchBeforeTab_ = function(e) { 
  return this.dispatchEvent({ 
    type: goog.editor.Field.EventType.BEFORETAB, 
    shiftKey: e.shiftKey, 
    altKey: e.altKey, 
    ctrlKey: e.ctrlKey 
  }); 
}; 
goog.editor.Field.prototype.stopChangeEvents = function(opt_stopChange, opt_stopDelayedChange) { 
  if(opt_stopChange) { 
    if(this.changeTimerGecko_) { 
      this.changeTimerGecko_.fireIfActive(); 
    } 
    this.stopEvent(goog.editor.Field.EventType.CHANGE); 
  } 
  if(opt_stopDelayedChange) { 
    this.clearDelayedChange(); 
    this.stopEvent(goog.editor.Field.EventType.DELAYEDCHANGE); 
  } 
}; 
goog.editor.Field.prototype.startChangeEvents = function(opt_fireChange, opt_fireDelayedChange) { 
  if(! opt_fireChange && this.changeTimerGecko_) { 
    this.changeTimerGecko_.fireIfActive(); 
  } 
  this.startEvent(goog.editor.Field.EventType.CHANGE); 
  this.startEvent(goog.editor.Field.EventType.DELAYEDCHANGE); 
  if(opt_fireChange) { 
    this.handleChange(); 
  } 
  if(opt_fireDelayedChange) { 
    this.dispatchDelayedChange_(); 
  } 
}; 
goog.editor.Field.prototype.stopEvent = function(eventType) { 
  this.stoppedEvents_[eventType]= 1; 
}; 
goog.editor.Field.prototype.startEvent = function(eventType) { 
  this.stoppedEvents_[eventType]= 0; 
}; 
goog.editor.Field.prototype.debounceEvent = function(eventType) { 
  this.debouncedEvents_[eventType]= goog.now(); 
}; 
goog.editor.Field.prototype.isEventStopped = function(eventType) { 
  return ! ! this.stoppedEvents_[eventType]||(this.debouncedEvents_[eventType]&&(goog.now() - this.debouncedEvents_[eventType]<= goog.editor.Field.DEBOUNCE_TIME_MS_)); 
}; 
goog.editor.Field.prototype.manipulateDom = function(func, opt_preventDelayedChange, opt_handler) { 
  this.stopChangeEvents(true, true); 
  try { 
    func.call(opt_handler); 
  } finally { 
    if(this.isLoaded()) { 
      if(opt_preventDelayedChange) { 
        this.startEvent(goog.editor.Field.EventType.CHANGE); 
        this.handleChange(); 
        this.startEvent(goog.editor.Field.EventType.DELAYEDCHANGE); 
      } else { 
        this.dispatchChange(); 
      } 
    } 
  } 
}; 
goog.editor.Field.prototype.dispatchCommandValueChange = function(opt_commands) { 
  if(opt_commands) { 
    this.dispatchEvent({ 
      type: goog.editor.Field.EventType.COMMAND_VALUE_CHANGE, 
      commands: opt_commands 
    }); 
  } else { 
    this.dispatchEvent(goog.editor.Field.EventType.COMMAND_VALUE_CHANGE); 
  } 
}; 
goog.editor.Field.prototype.dispatchChange = function(opt_noDelay) { 
  this.startChangeEvents(true, opt_noDelay); 
}; 
goog.editor.Field.prototype.handleChange = function() { 
  if(this.isEventStopped(goog.editor.Field.EventType.CHANGE)) { 
    return; 
  } 
  if(this.changeTimerGecko_) { 
    this.changeTimerGecko_.stop(); 
  } 
  this.isModified_ = true; 
  this.isEverModified_ = true; 
  if(this.isEventStopped(goog.editor.Field.EventType.DELAYEDCHANGE)) { 
    return; 
  } 
  this.delayedChangeTimer_.start(); 
}; 
goog.editor.Field.prototype.dispatchDelayedChange_ = function() { 
  if(this.isEventStopped(goog.editor.Field.EventType.DELAYEDCHANGE)) { 
    return; 
  } 
  this.delayedChangeTimer_.stop(); 
  this.isModified_ = false; 
  this.dispatchEvent(goog.editor.Field.EventType.DELAYEDCHANGE); 
}; 
goog.editor.Field.prototype.clearDelayedChange = function() { 
  if(this.changeTimerGecko_) { 
    this.changeTimerGecko_.fireIfActive(); 
  } 
  this.delayedChangeTimer_.fireIfActive(); 
}; 
goog.editor.Field.prototype.dispatchFocusAndBeforeFocus_ = function() { 
  this.dispatchBeforeFocus_(); 
  this.dispatchFocus_(); 
}; 
goog.editor.Field.prototype.dispatchBeforeFocus_ = function() { 
  if(this.isEventStopped(goog.editor.Field.EventType.BEFOREFOCUS)) { 
    return; 
  } 
  this.execCommand(goog.editor.Command.CLEAR_LOREM, true); 
  this.dispatchEvent(goog.editor.Field.EventType.BEFOREFOCUS); 
}; 
goog.editor.Field.prototype.dispatchFocus_ = function() { 
  if(this.isEventStopped(goog.editor.Field.EventType.FOCUS)) { 
    return; 
  } 
  goog.editor.Field.setActiveFieldId(this.id); 
  this.isSelectionEditable_ = true; 
  this.dispatchEvent(goog.editor.Field.EventType.FOCUS); 
  if(goog.editor.BrowserFeature.PUTS_CURSOR_BEFORE_FIRST_BLOCK_ELEMENT_ON_FOCUS) { 
    var field = this.getElement(); 
    var range = this.getRange(); 
    if(range) { 
      var focusNode = range.getFocusNode(); 
      if(range.getFocusOffset() == 0 &&(! focusNode || focusNode == field || focusNode.tagName == goog.dom.TagName.BODY)) { 
        goog.editor.range.selectNodeStart(field); 
      } 
    } 
  } 
  if(! goog.editor.BrowserFeature.CLEARS_SELECTION_WHEN_FOCUS_LEAVES && this.usesIframe()) { 
    var parent = this.getEditableDomHelper().getWindow().parent; 
    parent.getSelection().removeAllRanges(); 
  } 
}; 
goog.editor.Field.prototype.dispatchBlur = function() { 
  if(this.isEventStopped(goog.editor.Field.EventType.BLUR)) { 
    return; 
  } 
  if(goog.editor.Field.getActiveFieldId() == this.id) { 
    goog.editor.Field.setActiveFieldId(null); 
  } 
  this.isSelectionEditable_ = false; 
  this.dispatchEvent(goog.editor.Field.EventType.BLUR); 
}; 
goog.editor.Field.prototype.isSelectionEditable = function() { 
  return this.isSelectionEditable_; 
}; 
goog.editor.Field.cancelLinkClick_ = function(e) { 
  if(goog.dom.getAncestorByTagNameAndClass((e.target), goog.dom.TagName.A)) { 
    e.preventDefault(); 
  } 
}; 
goog.editor.Field.prototype.handleMouseDown_ = function(e) { 
  if(! goog.editor.Field.getActiveFieldId()) { 
    goog.editor.Field.setActiveFieldId(this.id); 
  } 
  if(goog.userAgent.IE) { 
    var targetElement = e.target; 
    if(targetElement && targetElement.tagName == goog.dom.TagName.A && e.ctrlKey) { 
      this.originalDomHelper.getWindow().open(targetElement.href); 
    } 
  } 
}; 
goog.editor.Field.prototype.handleMouseUp_ = function(e) { 
  this.dispatchSelectionChangeEvent(e); 
  if(goog.userAgent.IE) { 
    this.selectionChangeTarget_ =(e.target); 
    this.selectionChangeTimer_.start(); 
  } 
}; 
goog.editor.Field.prototype.getCleanContents = function() { 
  if(this.queryCommandValue(goog.editor.Command.USING_LOREM)) { 
    return goog.string.Unicode.NBSP; 
  } 
  if(! this.isLoaded()) { 
    var elem = this.getOriginalElement(); 
    if(! elem) { 
      this.logger.shout("Couldn't get the field element to read the contents"); 
    } 
    return elem.innerHTML; 
  } 
  var fieldCopy = this.getFieldCopy(); 
  this.invokeOp_(goog.editor.Plugin.Op.CLEAN_CONTENTS_DOM, fieldCopy); 
  return this.reduceOp_(goog.editor.Plugin.Op.CLEAN_CONTENTS_HTML, fieldCopy.innerHTML); 
}; 
goog.editor.Field.prototype.getFieldCopy = function() { 
  var field = this.getElement(); 
  var fieldCopy =(field.cloneNode(false)); 
  var html = field.innerHTML; 
  if(goog.userAgent.IE && html.match(/^\s*<script/i)) { 
    html = goog.string.Unicode.NBSP + html; 
  } 
  fieldCopy.innerHTML = html; 
  return fieldCopy; 
}; 
goog.editor.Field.prototype.setHtml = function(addParas, html, opt_dontFireDelayedChange, opt_applyLorem) { 
  if(this.isLoading()) { 
    this.logger.severe("Can't set html while loading Trogedit"); 
    return; 
  } 
  if(opt_applyLorem) { 
    this.execCommand(goog.editor.Command.CLEAR_LOREM); 
  } 
  if(html && addParas) { 
    html = '<p>' + html + '</p>'; 
  } 
  if(opt_dontFireDelayedChange) { 
    this.stopChangeEvents(false, true); 
  } 
  this.setInnerHtml_(html); 
  if(opt_applyLorem) { 
    this.execCommand(goog.editor.Command.UPDATE_LOREM); 
  } 
  if(this.isLoaded()) { 
    if(opt_dontFireDelayedChange) { 
      if(goog.editor.BrowserFeature.USE_MUTATION_EVENTS) { 
        this.changeTimerGecko_.fireIfActive(); 
      } 
      this.startChangeEvents(); 
    } else { 
      this.dispatchChange(); 
    } 
  } 
}; 
goog.editor.Field.prototype.setInnerHtml_ = function(html) { 
  var field = this.getElement(); 
  if(field) { 
    if(this.usesIframe() && goog.editor.BrowserFeature.MOVES_STYLE_TO_HEAD) { 
      var heads = field.ownerDocument.getElementsByTagName('HEAD'); 
      for(var i = heads.length - 1; i >= 1; -- i) { 
        heads[i].parentNode.removeChild(heads[i]); 
      } 
    } 
  } else { 
    field = this.getOriginalElement(); 
  } 
  if(field) { 
    this.injectContents(html, field); 
  } 
}; 
goog.editor.Field.prototype.turnOnDesignModeGecko = function() { 
  var doc = this.getEditableDomHelper().getDocument(); 
  doc.designMode = 'on'; 
  if(goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS) { 
    doc.execCommand('styleWithCSS', false, false); 
  } 
}; 
goog.editor.Field.prototype.installStyles = function() { 
  if(this.cssStyles && this.shouldLoadAsynchronously()) { 
    goog.style.installStyles(this.cssStyles, this.getElement()); 
  } 
}; 
goog.editor.Field.prototype.dispatchLoadEvent_ = function() { 
  var field = this.getElement(); 
  if(this.workaroundClassName_) { 
    goog.dom.classes.add(field, this.workaroundClassName_); 
  } 
  this.installStyles(); 
  this.startChangeEvents(); 
  this.logger.info('Dispatching load ' + this.id); 
  this.dispatchEvent(goog.editor.Field.EventType.LOAD); 
}; 
goog.editor.Field.prototype.isUneditable = function() { 
  return this.loadState_ == goog.editor.Field.LoadState_.UNEDITABLE; 
}; 
goog.editor.Field.prototype.isLoaded = function() { 
  return this.loadState_ == goog.editor.Field.LoadState_.EDITABLE; 
}; 
goog.editor.Field.prototype.isLoading = function() { 
  return this.loadState_ == goog.editor.Field.LoadState_.LOADING; 
}; 
goog.editor.Field.prototype.focus = function() { 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE || goog.userAgent.WEBKIT) { 
    this.getEditableDomHelper().getWindow().focus(); 
  } else { 
    if(goog.userAgent.OPERA) { 
      var scrollX = this.appWindow_.pageXOffset; 
      var scrollY = this.appWindow_.pageYOffset; 
    } 
    this.getElement().focus(); 
    if(goog.userAgent.OPERA) { 
      this.appWindow_.scrollTo((scrollX),(scrollY)); 
    } 
  } 
}; 
goog.editor.Field.prototype.focusAndPlaceCursorAtStart = function() { 
  if(goog.editor.BrowserFeature.HAS_IE_RANGES || goog.userAgent.WEBKIT) { 
    this.placeCursorAtStart(); 
  } 
  this.focus(); 
}; 
goog.editor.Field.prototype.placeCursorAtStart = function() { 
  var field = this.getElement(); 
  if(field) { 
    var cursorPosition = goog.editor.node.getLeftMostLeaf(field); 
    if(field == cursorPosition) { 
      goog.dom.Range.createCaret(field, 0).select(); 
    } else { 
      goog.editor.range.placeCursorNextTo(cursorPosition, true); 
    } 
    this.dispatchSelectionChangeEvent(); 
  } 
}; 
goog.editor.Field.prototype.makeEditable = function(opt_iframeSrc) { 
  this.loadState_ = goog.editor.Field.LoadState_.LOADING; 
  var field = this.getOriginalElement(); 
  this.nodeName = field.nodeName; 
  this.savedClassName_ = field.className; 
  this.setInitialStyle(field.style.cssText); 
  field.className += ' editable'; 
  this.makeEditableInternal(opt_iframeSrc); 
}; 
goog.editor.Field.prototype.makeEditableInternal = function(opt_iframeSrc) { 
  this.makeIframeField_(opt_iframeSrc); 
}; 
goog.editor.Field.prototype.handleFieldLoad = function() { 
  if(goog.userAgent.IE) { 
    goog.dom.Range.clearSelection(this.editableDomHelper.getWindow()); 
  } 
  if(goog.editor.Field.getActiveFieldId() != this.id) { 
    this.execCommand(goog.editor.Command.UPDATE_LOREM); 
  } 
  this.setupChangeListeners_(); 
  this.dispatchLoadEvent_(); 
  for(var classId in this.plugins_) { 
    this.plugins_[classId].enable(this); 
  } 
}; 
goog.editor.Field.prototype.makeUneditable = function(opt_skipRestore) { 
  if(this.isUneditable()) { 
    throw Error('makeUneditable: Field is already uneditable'); 
  } 
  this.clearDelayedChange(); 
  this.selectionChangeTimer_.fireIfActive(); 
  this.execCommand(goog.editor.Command.CLEAR_LOREM); 
  var html = null; 
  if(! opt_skipRestore && this.getElement()) { 
    html = this.getCleanContents(); 
  } 
  this.clearFieldLoadListener_(); 
  var field = this.getOriginalElement(); 
  if(goog.editor.Field.getActiveFieldId() == field.id) { 
    goog.editor.Field.setActiveFieldId(null); 
  } 
  this.clearListeners_(); 
  if(goog.isString(html)) { 
    field.innerHTML = html; 
    this.resetOriginalElemProperties(); 
  } 
  this.restoreDom(); 
  this.tearDownFieldObject_(); 
  if(goog.userAgent.WEBKIT) { 
    field.blur(); 
  } 
  this.execCommand(goog.editor.Command.UPDATE_LOREM); 
  this.dispatchEvent(goog.editor.Field.EventType.UNLOAD); 
}; 
goog.editor.Field.prototype.restoreDom = function() { 
  var field = this.getOriginalElement(); 
  if(field) { 
    var iframe = this.getEditableIframe(); 
    if(iframe) { 
      goog.dom.replaceNode(field, iframe); 
    } 
  } 
}; 
goog.editor.Field.prototype.shouldLoadAsynchronously = function() { 
  if(! goog.isDef(this.isHttps_)) { 
    this.isHttps_ = false; 
    if(goog.userAgent.IE && this.usesIframe()) { 
      var win = this.originalDomHelper.getWindow(); 
      while(win != win.parent) { 
        try { 
          win = win.parent; 
        } catch(e) { 
          break; 
        } 
      } 
      var loc = win.location; 
      this.isHttps_ = loc.protocol == 'https:' && loc.search.indexOf('nocheckhttps') == - 1; 
    } 
  } 
  return this.isHttps_; 
}; 
goog.editor.Field.prototype.makeIframeField_ = function(opt_iframeSrc) { 
  var field = this.getOriginalElement(); 
  if(field) { 
    var html = field.innerHTML; 
    var styles = { }; 
    html = this.reduceOp_(goog.editor.Plugin.Op.PREPARE_CONTENTS_HTML, html, styles); 
    var iframe =(this.originalDomHelper.createDom(goog.dom.TagName.IFRAME, this.getIframeAttributes())); 
    if(this.shouldLoadAsynchronously()) { 
      var onLoad = goog.bind(this.iframeFieldLoadHandler, this, iframe, html, styles); 
      this.fieldLoadListenerKey_ = goog.events.listen(iframe, goog.events.EventType.LOAD, onLoad, true); 
      if(opt_iframeSrc) { 
        iframe.src = opt_iframeSrc; 
      } 
    } 
    this.attachIframe(iframe); 
    if(! this.shouldLoadAsynchronously()) { 
      this.iframeFieldLoadHandler(iframe, html, styles); 
    } 
  } 
}; 
goog.editor.Field.prototype.attachIframe = function(iframe) { 
  var field = this.getOriginalElement(); 
  iframe.className = field.className; 
  iframe.id = field.id; 
  goog.dom.replaceNode(iframe, field); 
}; 
goog.editor.Field.prototype.getFieldFormatInfo = function(extraStyles) { 
  var originalElement = this.getOriginalElement(); 
  var isStandardsMode = goog.editor.node.isStandardsMode(originalElement); 
  return new goog.editor.icontent.FieldFormatInfo(this.id, isStandardsMode, false, false, extraStyles); 
}; 
goog.editor.Field.prototype.writeIframeContent = function(iframe, innerHtml, extraStyles) { 
  var formatInfo = this.getFieldFormatInfo(extraStyles); 
  if(this.shouldLoadAsynchronously()) { 
    var doc = goog.dom.getFrameContentDocument(iframe); 
    goog.editor.icontent.writeHttpsInitialIframe(formatInfo, doc, innerHtml); 
  } else { 
    var styleInfo = new goog.editor.icontent.FieldStyleInfo(this.getElement(), this.cssStyles); 
    goog.editor.icontent.writeNormalInitialIframe(formatInfo, innerHtml, styleInfo, iframe); 
  } 
}; 
goog.editor.Field.prototype.iframeFieldLoadHandler = function(iframe, innerHtml, styles) { 
  this.clearFieldLoadListener_(); 
  iframe.allowTransparency = 'true'; 
  this.writeIframeContent(iframe, innerHtml, styles); 
  var doc = goog.dom.getFrameContentDocument(iframe); 
  var body = doc.body; 
  this.setupFieldObject(body); 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    this.turnOnDesignModeGecko(); 
  } 
  this.handleFieldLoad(); 
}; 
goog.editor.Field.prototype.clearFieldLoadListener_ = function() { 
  if(this.fieldLoadListenerKey_) { 
    goog.events.unlistenByKey(this.fieldLoadListenerKey_); 
    this.fieldLoadListenerKey_ = null; 
  } 
}; 
goog.editor.Field.prototype.getIframeAttributes = function() { 
  var iframeStyle = 'padding:0;' + this.getOriginalElement().style.cssText; 
  if(! goog.string.endsWith(iframeStyle, ';')) { 
    iframeStyle += ';'; 
  } 
  iframeStyle += 'background-color:white;'; 
  if(goog.userAgent.IE) { 
    iframeStyle += 'overflow:visible;'; 
  } 
  return { 
    'frameBorder': 0, 
    'style': iframeStyle 
  }; 
}; 
