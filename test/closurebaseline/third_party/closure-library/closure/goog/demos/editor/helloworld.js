
goog.provide('goog.demos.editor.HelloWorld'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.editor.Plugin'); 
goog.demos.editor.HelloWorld = function() { 
  goog.editor.Plugin.call(this); 
}; 
goog.inherits(goog.demos.editor.HelloWorld, goog.editor.Plugin); 
goog.demos.editor.HelloWorld.prototype.getTrogClassId = function() { 
  return 'HelloWorld'; 
}; 
goog.demos.editor.HelloWorld.COMMAND = { HELLO_WORLD: '+helloWorld' }; 
goog.demos.editor.HelloWorld.prototype.isSupportedCommand = function(command) { 
  return command == goog.demos.editor.HelloWorld.COMMAND.HELLO_WORLD; 
}; 
goog.demos.editor.HelloWorld.prototype.execCommandInternal = function(command) { 
  var domHelper = this.fieldObject.getEditableDomHelper(); 
  var range = this.fieldObject.getRange(); 
  range.removeContents(); 
  var newNode = domHelper.createDom(goog.dom.TagName.SPAN, null, 'Hello World!'); 
  range.insertNode(newNode, false); 
}; 
