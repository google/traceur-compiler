
self.CLOSURE_BASE_PATH = '../../'; 
importScripts('../../bootstrap/webworkers.js'); 
importScripts('../../base.js'); 
importScripts('../../../../third_party/closure/goog/deps.js'); 
goog.provide('goog.messaging.testdata.portnetwork_worker2'); 
goog.require('goog.messaging.PortCaller'); 
goog.require('goog.messaging.PortChannel'); 
function startListening() { 
  var caller = new goog.messaging.PortCaller(new goog.messaging.PortChannel(self)); 
  caller.dial('main').registerService('sendToFrame', function(msg) { 
    msg.push('worker2'); 
    caller.dial('frame').send('sendToWorker1', msg); 
  }, true); 
} 
startListening(); 
