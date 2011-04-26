
self.CLOSURE_BASE_PATH = '../../'; 
importScripts('../../bootstrap/webworkers.js'); 
importScripts('../../base.js'); 
importScripts('../../../../third_party/closure/goog/deps.js'); 
goog.provide('goog.messaging.testdata.portchannel_worker'); 
goog.require('goog.messaging.PortChannel'); 
function registerPing(channel) { 
  channel.registerService('ping', function(msg) { 
    channel.send('pong', msg); 
  }, true); 
} 
function startListening() { 
  var channel = new goog.messaging.PortChannel(self); 
  registerPing(channel); 
  channel.registerService('addPort', function(port) { 
    port.start(); 
    registerPing(new goog.messaging.PortChannel(port)); 
  }, true); 
} 
startListening(); 
