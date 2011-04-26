
self.CLOSURE_BASE_PATH = '../../'; 
importScripts('../../bootstrap/webworkers.js'); 
importScripts('../../base.js'); 
importScripts('../../../../third_party/closure/goog/deps.js'); 
goog.provide('goog.messaging.testdata.portnetwork_worker1'); 
goog.require('goog.messaging.PortCaller'); 
goog.require('goog.messaging.PortChannel'); 
function startListening() { 
  var caller = new goog.messaging.PortCaller(new goog.messaging.PortChannel(self)); 
  caller.dial('frame').registerService('sendToMain', function(msg) { 
    msg.push('worker1'); 
    caller.dial('main').send('result', msg); 
  }, true); 
} 
startListening(); 
