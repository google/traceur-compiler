
goog.provide('goog.demos.editor.HelloWorldDialog'); 
goog.provide('goog.demos.editor.HelloWorldDialog.OkEvent'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.events.Event'); 
goog.require('goog.string'); 
goog.require('goog.ui.editor.AbstractDialog'); 
goog.require('goog.ui.editor.AbstractDialog.Builder'); 
goog.require('goog.ui.editor.AbstractDialog.EventType'); 
goog.demos.editor.HelloWorldDialog = function(domHelper) { 
  goog.ui.editor.AbstractDialog.call(this, domHelper); 
}; 
goog.inherits(goog.demos.editor.HelloWorldDialog, goog.ui.editor.AbstractDialog); 
goog.demos.editor.HelloWorldDialog.OkEvent = function(message) { 
  this.message = message; 
}; 
goog.inherits(goog.demos.editor.HelloWorldDialog.OkEvent, goog.events.Event); 
goog.demos.editor.HelloWorldDialog.OkEvent.prototype.type = goog.ui.editor.AbstractDialog.EventType.OK; 
goog.demos.editor.HelloWorldDialog.OkEvent.prototype.message; 
goog.demos.editor.HelloWorldDialog.prototype.createDialogControl = function() { 
  var builder = new goog.ui.editor.AbstractDialog.Builder(this); 
  var MSG_HELLO_WORLD_DIALOG_TITLE = goog.getMsg('Add a Hello World message'); 
  builder.setTitle(MSG_HELLO_WORLD_DIALOG_TITLE).setContent(this.createContent_()); 
  return builder.build(); 
}; 
goog.demos.editor.HelloWorldDialog.prototype.createOkEvent = function(e) { 
  var message = this.getMessage_(); 
  if(message && goog.demos.editor.HelloWorldDialog.isValidHelloWorld_(message)) { 
    return new goog.demos.editor.HelloWorldDialog.OkEvent(message); 
  } else { 
    var MSG_HELLO_WORLD_DIALOG_ERROR = goog.getMsg('Your message must contain the words "hello" and "world".'); 
    this.dom.getWindow().alert(MSG_HELLO_WORLD_DIALOG_ERROR); 
    return null; 
  } 
}; 
goog.demos.editor.HelloWorldDialog.prototype.input_; 
goog.demos.editor.HelloWorldDialog.prototype.createContent_ = function() { 
  var MSG_HELLO_WORLD_DIALOG_SAMPLE = goog.getMsg('Hello, world!'); 
  this.input_ = this.dom.createDom(goog.dom.TagName.INPUT, { 
    size: 25, 
    value: MSG_HELLO_WORLD_DIALOG_SAMPLE 
  }); 
  var MSG_HELLO_WORLD_DIALOG_PROMPT = goog.getMsg('Enter your Hello World message'); 
  return this.dom.createDom(goog.dom.TagName.DIV, null,[MSG_HELLO_WORLD_DIALOG_PROMPT, this.input_]); 
}; 
goog.demos.editor.HelloWorldDialog.prototype.getMessage_ = function() { 
  return this.input_ && this.input_.value; 
}; 
goog.demos.editor.HelloWorldDialog.isValidHelloWorld_ = function(message) { 
  message = message.toLowerCase(); 
  return goog.string.contains(message, 'hello') && goog.string.contains(message, 'world'); 
}; 
