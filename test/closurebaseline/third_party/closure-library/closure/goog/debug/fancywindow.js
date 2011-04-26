
goog.provide('goog.debug.FancyWindow'); 
goog.require('goog.debug.DebugWindow'); 
goog.require('goog.debug.LogManager'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.debug.Logger.Level'); 
goog.require('goog.dom.DomHelper'); 
goog.require('goog.object'); 
goog.require('goog.userAgent'); 
goog.debug.FancyWindow = function(opt_identifier, opt_prefix) { 
  goog.debug.DebugWindow.call(this, opt_identifier, opt_prefix); 
}; 
goog.inherits(goog.debug.FancyWindow, goog.debug.DebugWindow); 
goog.debug.FancyWindow.prototype.writeBufferToLog_ = function(html) { 
  this.lastCall_ = goog.now(); 
  if(this.hasActiveWindow()) { 
    var logel = this.dh_.getElement('log'); 
    var scroll = logel.scrollHeight -(logel.scrollTop + logel.offsetHeight) <= 100; 
    for(var i = 0; i < this.outputBuffer_.length; i ++) { 
      var div = this.dh_.createDom('div', 'logmsg'); 
      div.innerHTML = this.outputBuffer_[i]; 
      logel.appendChild(div); 
    } 
    this.outputBuffer_.length = 0; 
    this.resizeStuff_(); 
    if(scroll) { 
      logel.scrollTop = logel.scrollHeight; 
    } 
  } 
}; 
goog.debug.FancyWindow.prototype.writeInitialDocument_ = function() { 
  if(! this.hasActiveWindow()) { 
    return; 
  } 
  var doc = this.win_.document; 
  doc.open(); 
  doc.write(this.getHtml_()); 
  doc.close(); 
  (goog.userAgent.IE ? doc.body: this.win_).onresize = goog.bind(this.resizeStuff_, this); 
  this.dh_ = new goog.dom.DomHelper(doc); 
  this.dh_.getElement('openbutton').onclick = goog.bind(this.openOptions_, this); 
  this.dh_.getElement('closebutton').onclick = goog.bind(this.closeOptions_, this); 
  this.dh_.getElement('clearbutton').onclick = goog.bind(this.clear_, this); 
  this.dh_.getElement('exitbutton').onclick = goog.bind(this.exit_, this); 
  this.writeSavedMessages_(); 
}; 
goog.debug.FancyWindow.prototype.openOptions_ = function() { 
  var el = this.dh_.getElement('optionsarea'); 
  el.innerHTML = ''; 
  var loggers = goog.debug.FancyWindow.getLoggers_(); 
  var dh = this.dh_; 
  for(var i = 0; i < loggers.length; i ++) { 
    var logger = goog.debug.Logger.getLogger(loggers[i]); 
    var curlevel = logger.getLevel() ? logger.getLevel().name: 'INHERIT'; 
    var div = dh.createDom('div', { }, this.getDropDown_('sel' + loggers[i], curlevel), dh.createDom('span', { }, loggers[i]|| '(root)')); 
    el.appendChild(div); 
  } 
  this.dh_.getElement('options').style.display = 'block'; 
  return false; 
}; 
goog.debug.FancyWindow.prototype.getDropDown_ = function(id, selected) { 
  var dh = this.dh_; 
  var sel = dh.createDom('select', { 'id': id }); 
  var levels = goog.debug.Logger.Level.PREDEFINED_LEVELS; 
  for(var i = 0; i < levels.length; i ++) { 
    var level = levels[i]; 
    var option = dh.createDom('option', { }, level.name); 
    if(selected == level.name) { 
      option.selected = true; 
    } 
    sel.appendChild(option); 
  } 
  sel.appendChild(dh.createDom('option', { 'selected': selected == 'INHERIT' }, 'INHERIT')); 
  return sel; 
}; 
goog.debug.FancyWindow.prototype.closeOptions_ = function() { 
  this.dh_.getElement('options').style.display = 'none'; 
  var loggers = goog.debug.FancyWindow.getLoggers_(); 
  var dh = this.dh_; 
  for(var i = 0; i < loggers.length; i ++) { 
    var logger = goog.debug.Logger.getLogger(loggers[i]); 
    var sel = dh.getElement('sel' + loggers[i]); 
    var level = sel.options[sel.selectedIndex].text; 
    if(level == 'INHERIT') { 
      logger.setLevel(null); 
    } else { 
      logger.setLevel(goog.debug.Logger.Level.getPredefinedLevel(level)); 
    } 
  } 
  return false; 
}; 
goog.debug.FancyWindow.prototype.resizeStuff_ = function() { 
  var dh = this.dh_; 
  var logel = dh.getElement('log'); 
  var headel = dh.getElement('head'); 
  logel.style.top = headel.offsetHeight + 'px'; 
  logel.style.height =(dh.getDocument().body.offsetHeight - headel.offsetHeight -(goog.userAgent.IE ? 4: 0)) + 'px'; 
}; 
goog.debug.FancyWindow.getLoggers_ = function() { 
  var loggers = goog.object.getKeys(goog.debug.LogManager.getLoggers()); 
  loggers.sort(); 
  return loggers; 
}; 
goog.debug.FancyWindow.prototype.exit_ = function(e) { 
  this.setEnabled(false); 
  if(this.win_) { 
    this.win_.close(); 
  } 
}; 
goog.debug.FancyWindow.prototype.getStyleRules = function() { 
  return goog.debug.FancyWindow.superClass_.getStyleRules.call(this) + 'html,body{height:100%;width:100%;margin:0px;padding:0px;' + 'background-color:#FFF;overflow:hidden}' + '*{}' + '.logmsg{border-bottom:1px solid #CCC;padding:2px;font:medium monospace;}' + '#head{position:absolute;width:100%;font:x-small arial;' + 'border-bottom:2px solid #999;background-color:#EEE;}' + '#head p{margin:0px 5px;}' + '#log{position:absolute;width:100%;background-color:#FFF;}' + '#options{position:absolute;right:0px;width:50%;height:100%;border-left:' + '1px solid #999;background-color:#DDD;display:none;padding-left: 5px;' + 'font:normal small arial;overflow:auto;}' + '#openbutton,#closebutton{text-decoration:underline;color:#00F;cursor:' + 'pointer;position:absolute;top:0px;right:5px;font:x-small arial;}' + '#clearbutton{text-decoration:underline;color:#00F;cursor:' + 'pointer;position:absolute;top:0px;right:80px;font:x-small arial;}' + '#exitbutton{text-decoration:underline;color:#00F;cursor:' + 'pointer;position:absolute;top:0px;right:50px;font:x-small arial;}' + 'select{font:x-small arial;margin-right:10px;}' + 'hr{border:0;height:5px;background-color:#8c8;color:#8c8;}'; 
}; 
goog.debug.FancyWindow.prototype.getHtml_ = function() { 
  return '' + '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"' + '"http://www.w3.org/TR/html4/loose.dtd">' + '<html><head><title>Logging: ' + this.identifier_ + '</title>' + '<style>' + this.getStyleRules() + '</style>' + '</head><body>' + '<div id="log" style="overflow:auto"></div>' + '<div id="head">' + '<p><b>Logging: ' + this.identifier_ + '</b></p><p>' + this.welcomeMessage + '</p>' + '<span id="clearbutton">clear</span>' + '<span id="exitbutton">exit</span>' + '<span id="openbutton">options</span>' + '</div>' + '<div id="options">' + '<big><b>Options:</b></big>' + '<div id="optionsarea"></div>' + '<span id="closebutton">save and close</span>' + '</div>' + '</body></html>'; 
}; 
