
goog.provide('goog.userAgent.adobeReader'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
(function() { 
  var version = ''; 
  if(goog.userAgent.IE) { 
    try { 
      throw undefined; 
    } catch(detectOnIe) { 
      (detectOnIe = function detectOnIe(classId) { 
        try { 
          new ActiveXObject(classId); 
          return true; 
        } catch(ex) { 
          return false; 
        } 
      }); 
      if(detectOnIe('AcroPDF.PDF.1')) { 
        version = '7'; 
      } else if(detectOnIe('PDF.PdfCtrl.6')) { 
        version = '6'; 
      } 
    } 
  } else { 
    if(navigator.mimeTypes && navigator.mimeTypes.length > 0) { 
      var mimeType = navigator.mimeTypes['application/pdf']; 
      if(mimeType && mimeType.enabledPlugin) { 
        var description = mimeType.enabledPlugin.description; 
        if(description && description.indexOf('Adobe') != - 1) { 
          version = description.indexOf('Version') != - 1 ? description.split('Version')[1]: '7'; 
        } 
      } 
    } 
  } 
  goog.userAgent.adobeReader.HAS_READER = ! ! version; 
  goog.userAgent.adobeReader.VERSION = version; 
  goog.userAgent.adobeReader.SILENT_PRINT = goog.userAgent.WINDOWS && goog.string.compareVersions(version, '6') >= 0; 
})(); 
