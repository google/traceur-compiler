
goog.provide('goog.osapi'); 
var osapi = osapi || { }; 
goog.exportSymbol('osapi', osapi); 
goog.osapi.handleGadgetRpcMethod = function(requests) { 
  var responses = new Array(requests.length); 
  var callCount = 0; 
  var callback = osapi.callback; 
  var dummy = function(params, apiCallback) { 
    apiCallback({ }); 
  }; 
  for(var i = 0; i < requests.length; i ++) { 
    var current = osapi; 
    if(requests[i]['method'].indexOf('_') == - 1) { 
      var path = requests[i]['method'].split('.'); 
      for(var j = 0; j < path.length; j ++) { 
        if(current.hasOwnProperty(path[j])) { 
          current = current[path[j]]; 
        } else { 
          current = dummy; 
          break; 
        } 
      } 
    } else { 
      current = dummy; 
    } 
    current(requests[i]['params'], function(i) { 
      return function(response) { 
        responses[i]= { 
          'id': requests[i].id, 
          'data': response 
        }; 
        callCount ++; 
        if(callCount == requests.length) { 
          callback(responses); 
        } 
      }; 
    }(i)); 
  } 
}; 
goog.osapi.init = function() { 
  if(gadgets && gadgets.rpc) { 
    gadgets.rpc.register('osapi._handleGadgetRpcMethod', goog.osapi.handleGadgetRpcMethod); 
  } 
}; 
