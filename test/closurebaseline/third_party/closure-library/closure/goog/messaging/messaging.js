
goog.provide('goog.messaging'); 
goog.require('goog.messaging.MessageChannel'); 
goog.messaging.pipe = function(channel1, channel2) { 
  channel1.registerDefaultService(goog.bind(channel2.send, channel2)); 
  channel2.registerDefaultService(goog.bind(channel1.send, channel1)); 
}; 
