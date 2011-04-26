
goog.provide('goog.silverlight'); 
goog.silverlight._silverlightCount = 0; 
goog.silverlight.__onSilverlightInstalledCalled = false; 
goog.silverlight.fwlinkRoot = 'http://go2.microsoft.com/fwlink/?LinkID='; 
goog.silverlight.__installationEventFired = false; 
goog.silverlight.onGetSilverlight = null; 
goog.silverlight.onSilverlightInstalled = function() { 
  window.location.reload(false); 
}; 
goog.silverlight.isInstalled = function(version) { 
  if(version == undefined) version = null; 
  var isVersionSupported = false; 
  var container = null; 
  try { 
    var control = null; 
    var tryNS = false; 
    if(typeof ActiveXObject == 'undefined') { 
      try { 
        control = new ActiveXObject('AgControl.AgControl'); 
        if(version === null) { 
          isVersionSupported = true; 
        } else if(control.isVersionSupported(version)) { 
          isVersionSupported = true; 
        } 
        control = null; 
      } catch(e) { 
        tryNS = true; 
      } 
    } else { 
      tryNS = true; 
    } 
    if(tryNS) { 
      var plugin = navigator.plugins['Silverlight Plug-In']; 
      if(plugin) { 
        if(version === null) { 
          isVersionSupported = true; 
        } else { 
          var actualVer = plugin.description; 
          if(actualVer === '1.0.30226.2') actualVer = '2.0.30226.2'; 
          var actualVerArray = actualVer.split('.'); 
          while(actualVerArray.length > 3) { 
            actualVerArray.pop(); 
          } 
          while(actualVerArray.length < 4) { 
            actualVerArray.push(0); 
          } 
          var reqVerArray = version.split('.'); 
          while(reqVerArray.length > 4) { 
            reqVerArray.pop(); 
          } 
          var requiredVersionPart; 
          var actualVersionPart; 
          var index = 0; 
          do { 
            requiredVersionPart = parseInt(reqVerArray[index], 10); 
            actualVersionPart = parseInt(actualVerArray[index], 10); 
            index ++; 
          } while(index < reqVerArray.length && requiredVersionPart === actualVersionPart); 
          if(requiredVersionPart <= actualVersionPart && ! isNaN(requiredVersionPart)) { 
            isVersionSupported = true; 
          } 
        } 
      } 
    } 
  } catch(e) { 
    isVersionSupported = false; 
  } 
  return isVersionSupported; 
}; 
goog.silverlight.waitForInstallCompletion = function() { 
  if(! goog.silverlight.isBrowserRestartRequired && goog.silverlight.onSilverlightInstalled) { 
    try { 
      navigator.plugins.refresh(); 
    } catch(e) { } 
    if(goog.silverlight.isInstalled(null) && ! goog.silverlight.__onSilverlightInstalledCalled) { 
      goog.silverlight.onSilverlightInstalled(); 
      goog.silverlight.__onSilverlightInstalledCalled = true; 
    } else { 
      setTimeout(goog.silverlight.waitForInstallCompletion, 3000); 
    } 
  } 
}; 
goog.silverlight.startup = function() { 
  navigator.plugins.refresh(); 
  goog.silverlight.isBrowserRestartRequired = goog.silverlight.isInstalled(null); 
  if(! goog.silverlight.isBrowserRestartRequired) { 
    goog.silverlight.waitForInstallCompletion(); 
    if(! goog.silverlight.__installationEventFired) { 
      goog.silverlight.onInstallRequired(); 
      goog.silverlight.__installationEventFired = true; 
    } 
  } else if(window.navigator.mimeTypes) { 
    var mimeSL2 = navigator.mimeTypes['application/x-silverlight-2']; 
    var mimeSL2b2 = navigator.mimeTypes['application/x-silverlight-2-b2']; 
    var mimeSL2b1 = navigator.mimeTypes['application/x-silverlight-2-b1']; 
    var mimeHighestBeta = mimeSL2b1; 
    if(mimeSL2b2) mimeHighestBeta = mimeSL2b2; 
    if(! mimeSL2 &&(mimeSL2b1 || mimeSL2b2)) { 
      if(! goog.silverlight.__installationEventFired) { 
        goog.silverlight.onUpgradeRequired(); 
        goog.silverlight.__installationEventFired = true; 
      } 
    } else if(mimeSL2 && mimeHighestBeta) { 
      if(mimeSL2.enabledPlugin && mimeHighestBeta.enabledPlugin) { 
        if(mimeSL2.enabledPlugin.description != mimeHighestBeta.enabledPlugin.description) { 
          if(! goog.silverlight.__installationEventFired) { 
            goog.silverlight.onRestartRequired(); 
            goog.silverlight.__installationEventFired = true; 
          } 
        } 
      } 
    } 
  } 
}; 
goog.silverlight.createObject = function(source, parentElement, opt_id, opt_properties, opt_events, opt_initParams, opt_userContext) { 
  var slPluginHelper = { }; 
  var slProperties = opt_properties; 
  var slEvents = opt_events; 
  slPluginHelper.version = slProperties.version; 
  slProperties.source = source; 
  slPluginHelper.alt = slProperties.alt; 
  if(opt_initParams) slProperties.initParams = opt_initParams; 
  if(slProperties.isWindowless && ! slProperties.windowless) slProperties.windowless = slProperties.isWindowless; 
  if(slProperties.framerate && ! slProperties.maxFramerate) slProperties.maxFramerate = slProperties.framerate; 
  if(opt_id && ! slProperties.id) slProperties.id = opt_id; 
  delete slProperties.ignoreBrowserVer; 
  delete slProperties.inplaceInstallPrompt; 
  delete slProperties.version; 
  delete slProperties.isWindowless; 
  delete slProperties.framerate; 
  delete slProperties.data; 
  delete slProperties.src; 
  delete slProperties.alt; 
  var slPluginHtml; 
  if(goog.silverlight.isInstalled(slPluginHelper.version)) { 
    for(var name in slEvents) { 
      if(slEvents[name]) { 
        if(name == 'onLoad' && typeof slEvents[name]== 'function' && slEvents[name].length != 1) { 
          var onLoadHandler = slEvents[name]; 
          slEvents[name]= function(sender) { 
            return onLoadHandler(document.getElementById(opt_id), opt_userContext, sender); 
          }; 
        } 
        var handlerName = goog.silverlight.getHandlerName(slEvents[name]); 
        if(handlerName != null) { 
          slProperties[name]= handlerName; 
          slEvents[name]= null; 
        } else { 
          throw 'typeof events.' + name + " must be 'function' or 'string'"; 
        } 
      } 
    } 
    slPluginHtml = goog.silverlight.buildHtml(slProperties); 
  } else { 
    slPluginHtml = goog.silverlight.buildPromptHtml(slPluginHelper); 
  } 
  if(parentElement) { 
    parentElement.innerHTML = slPluginHtml; 
  } else { 
    return slPluginHtml; 
  } 
  return null; 
}; 
goog.silverlight.buildHtml = function(slProperties) { 
  var htmlBuilder =[]; 
  htmlBuilder.push('<object type=\"application/x-silverlight\" ' + 'data="data:application/x-silverlight,"'); 
  if(slProperties.id != null) { 
    htmlBuilder.push(' id="' + goog.silverlight.htmlAttributeEncode(slProperties.id) + '"'); 
  } 
  if(slProperties.width != null) { 
    htmlBuilder.push(' width="' + slProperties.width + '"'); 
  } 
  if(slProperties.height != null) { 
    htmlBuilder.push(' height="' + slProperties.height + '"'); 
  } 
  htmlBuilder.push(' >'); 
  delete slProperties.id; 
  delete slProperties.width; 
  delete slProperties.height; 
  for(var name in slProperties) { 
    if(slProperties[name]) { 
      htmlBuilder.push('<param name="' + goog.silverlight.htmlAttributeEncode(name) + '" value="' + goog.silverlight.htmlAttributeEncode(slProperties[name]) + '" />'); 
    } 
  } 
  htmlBuilder.push('<\/object>'); 
  return htmlBuilder.join(''); 
}; 
goog.silverlight.createObjectEx = function(params) { 
  var unused = { 
    properties: 0, 
    events: 0, 
    context: 0 
  }; 
  var parameters = params; 
  var html = goog.silverlight.createObject(parameters.source, parameters.parentElement, parameters.id, parameters.properties, parameters.events, parameters.initParams, parameters.context); 
  if(parameters.parentElement == null) { 
    return html; 
  } 
  return null; 
}; 
goog.silverlight.buildPromptHtml = function(slPluginHelper) { 
  var slPluginHtml = ''; 
  var urlRoot = goog.silverlight.fwlinkRoot; 
  var version = slPluginHelper.version; 
  if(slPluginHelper.alt) { 
    slPluginHtml = slPluginHelper.alt; 
  } else { 
    if(! version) { 
      version = ''; 
    } 
    slPluginHtml = "<a href='javascript:goog.silverlight.getSilverlight(\"{1}\");' " + "style='text-decoration: none;'><img src='{2}' " + "alt='Get Microsoft Silverlight' style='border-style: none'/></a>"; 
    slPluginHtml = slPluginHtml.replace('{1}', version); 
    slPluginHtml = slPluginHtml.replace('{2}', urlRoot + '108181'); 
  } 
  return slPluginHtml; 
}; 
goog.silverlight.getSilverlight = function(version) { 
  if(goog.silverlight.onGetSilverlight) { 
    goog.silverlight.onGetSilverlight(); 
  } 
  var shortVer = ''; 
  var reqVerArray = String(version).split('.'); 
  if(reqVerArray.length > 1) { 
    var majorNum = parseInt(reqVerArray[0], 10); 
    if(isNaN(majorNum) || majorNum < 2) { 
      shortVer = '1.0'; 
    } else { 
      shortVer = reqVerArray[0]+ '.' + reqVerArray[1]; 
    } 
  } 
  var verArg = ''; 
  if(shortVer.match(/^\d+\056\d+$/)) { 
    verArg = '&v=' + shortVer; 
  } 
  goog.silverlight.followFWLink('149156' + verArg); 
}; 
goog.silverlight.followFWLink = function(linkid) { 
  top.location = goog.silverlight.fwlinkRoot + String(linkid); 
}; 
goog.silverlight.htmlAttributeEncode = function(strInput) { 
  var c; 
  var retVal = ''; 
  if(strInput == null) { 
    return null; 
  } 
  for(var cnt = 0; cnt < strInput.length; cnt ++) { 
    c = strInput.charCodeAt(cnt); 
    if(((c > 96) &&(c < 123)) ||((c > 64) &&(c < 91)) ||((c > 43) &&(c < 58) &&(c != 47)) ||(c == 95)) { 
      retVal = retVal + String.fromCharCode(c); 
    } else { 
      retVal = retVal + '&#' + c + ';'; 
    } 
  } 
  return retVal; 
}; 
goog.silverlight.defaultErrorHandler = function(sender, args) { 
  var iErrorCode; 
  var errorType = args.errorType; 
  iErrorCode = args.errorCode; 
  var errMsg = '\nSilverlight error message     \n'; 
  errMsg += 'ErrorCode: ' + iErrorCode + '\n'; 
  errMsg += 'ErrorType: ' + errorType + '       \n'; 
  errMsg += 'Message: ' + args.errorMessage + '     \n'; 
  if(errorType == 'ParserError') { 
    errMsg += 'XamlFile: ' + args.xamlFile + '     \n'; 
    errMsg += 'Line: ' + args.lineNumber + '     \n'; 
    errMsg += 'Position: ' + args.charPosition + '     \n'; 
  } else if(errorType == 'RuntimeError') { 
    if(args.lineNumber != 0) { 
      errMsg += 'Line: ' + args.lineNumber + '     \n'; 
      errMsg += 'Position: ' + args.charPosition + '     \n'; 
    } 
    errMsg += 'MethodName: ' + args.methodName + '     \n'; 
  } 
  alert(errMsg); 
}; 
goog.silverlight.__cleanup = function() { 
  for(var i = goog.silverlight._silverlightCount - 1; i >= 0; i --) { 
    goog.global['__closure_slEvent' + i]= null; 
  } 
  goog.silverlight._silverlightCount = 0; 
  if(window.removeEventListener) { 
    window.removeEventListener('unload', goog.silverlight.__cleanup, false); 
  } else { 
    window.detachEvent('onunload', goog.silverlight.__cleanup); 
  } 
}; 
goog.silverlight.getHandlerName = function(handler) { 
  var handlerName = ''; 
  if(typeof handler == 'string') { 
    handlerName = handler; 
  } else if(typeof handler == 'function') { 
    if(goog.silverlight._silverlightCount == 0) { 
      if(window.addEventListener) { 
        window.addEventListener('unload', goog.silverlight.__cleanup, false); 
      } else { 
        window.attachEvent('onunload', goog.silverlight.__cleanup); 
      } 
    } 
    var count = goog.silverlight._silverlightCount ++; 
    handlerName = '__closure_slEvent' + count; 
    goog.global[handlerName]= handler; 
  } else { 
    handlerName = null; 
  } 
  return handlerName; 
}; 
goog.silverlight.disposeHandlerName = function(handlerName) { 
  delete goog.global[handlerName]; 
}; 
goog.silverlight.onRequiredVersionAvailable = function() { }; 
goog.silverlight.onRestartRequired = function() { }; 
goog.silverlight.onUpgradeRequired = function() { }; 
goog.silverlight.onInstallRequired = function() { }; 
goog.silverlight.isVersionAvailableOnError = function(sender, args) { 
  var retVal = false; 
  try { 
    if(args.errorCode == 8001 && ! goog.silverlight.__installationEventFired) { 
      goog.silverlight.onUpgradeRequired(); 
      goog.silverlight.__installationEventFired = true; 
    } else if(args.errorCode == 8002 && ! goog.silverlight.__installationEventFired) { 
      goog.silverlight.onRestartRequired(); 
      goog.silverlight.__installationEventFired = true; 
    } else if(args.errorCode == 5014 || args.errorCode == 2106) { 
      if(goog.silverlight.__verifySilverlight2UpgradeSuccess(args.getHost())) { 
        retVal = true; 
      } 
    } else { 
      retVal = true; 
    } 
  } catch(e) { } 
  return retVal; 
}; 
goog.silverlight.isVersionAvailableOnLoad = function(sender) { 
  var retVal = false; 
  try { 
    if(goog.silverlight.__verifySilverlight2UpgradeSuccess(sender.getHost())) { 
      retVal = true; 
    } 
  } catch(e) { } 
  return retVal; 
}; 
goog.silverlight.__verifySilverlight2UpgradeSuccess = function(host) { 
  var retVal = false; 
  var version = '4.0.50401'; 
  var installationEvent = null; 
  try { 
    if(host.isVersionSupported(version + '.99')) { 
      installationEvent = goog.silverlight.onRequiredVersionAvailable; 
      retVal = true; 
    } else if(host.isVersionSupported(version + '.0')) { 
      installationEvent = goog.silverlight.onRestartRequired; 
    } else { 
      installationEvent = goog.silverlight.onUpgradeRequired; 
    } 
    if(installationEvent && ! goog.silverlight.__installationEventFired) { 
      installationEvent(); 
      goog.silverlight.__installationEventFired = true; 
    } 
  } catch(e) { } 
  return retVal; 
}; 
