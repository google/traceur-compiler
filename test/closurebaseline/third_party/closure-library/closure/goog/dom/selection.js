
goog.provide('goog.dom.selection'); 
goog.require('goog.string'); 
goog.require('goog.userAgent'); 
goog.dom.selection.setStart = function(textfield, pos) { 
  if(goog.dom.selection.useSelectionProperties_(textfield)) { 
    textfield.selectionStart = pos; 
  } else if(goog.userAgent.IE) { 
    var tmp = goog.dom.selection.getRangeIe_(textfield); 
    var range = tmp[0]; 
    var selectionRange = tmp[1]; 
    if(range.inRange(selectionRange)) { 
      pos = goog.dom.selection.canonicalizePositionIe_(textfield, pos); 
      range.collapse(true); 
      range.move('character', pos); 
      range.select(); 
    } 
  } 
}; 
goog.dom.selection.getStart = function(textfield) { 
  return goog.dom.selection.getEndPoints_(textfield, true)[0]; 
}; 
goog.dom.selection.getEndPointsTextareaIe_ = function(range, selRange, getOnlyStart) { 
  var selectionRange = selRange.duplicate(); 
  var beforeSelectionText = range.text; 
  var untrimmedBeforeSelectionText = beforeSelectionText; 
  var selectionText = selectionRange.text; 
  var untrimmedSelectionText = selectionText; 
  var isRangeEndTrimmed = false; 
  while(! isRangeEndTrimmed) { 
    if(range.compareEndPoints('StartToEnd', range) == 0) { 
      isRangeEndTrimmed = true; 
    } else { 
      range.moveEnd('character', - 1); 
      if(range.text == beforeSelectionText) { 
        untrimmedBeforeSelectionText += '\r\n'; 
      } else { 
        isRangeEndTrimmed = true; 
      } 
    } 
  } 
  if(getOnlyStart) { 
    return[untrimmedBeforeSelectionText.length, - 1]; 
  } 
  var isSelectionRangeEndTrimmed = false; 
  while(! isSelectionRangeEndTrimmed) { 
    if(selectionRange.compareEndPoints('StartToEnd', selectionRange) == 0) { 
      isSelectionRangeEndTrimmed = true; 
    } else { 
      selectionRange.moveEnd('character', - 1); 
      if(selectionRange.text == selectionText) { 
        untrimmedSelectionText += '\r\n'; 
      } else { 
        isSelectionRangeEndTrimmed = true; 
      } 
    } 
  } 
  return[untrimmedBeforeSelectionText.length, untrimmedBeforeSelectionText.length + untrimmedSelectionText.length]; 
}; 
goog.dom.selection.getEndPoints = function(textfield) { 
  return goog.dom.selection.getEndPoints_(textfield, false); 
}; 
goog.dom.selection.getEndPoints_ = function(textfield, getOnlyStart) { 
  var startPos = 0; 
  var endPos = 0; 
  if(goog.dom.selection.useSelectionProperties_(textfield)) { 
    startPos = textfield.selectionStart; 
    endPos = getOnlyStart ? - 1: textfield.selectionEnd; 
  } else if(goog.userAgent.IE) { 
    var tmp = goog.dom.selection.getRangeIe_(textfield); 
    var range = tmp[0]; 
    var selectionRange = tmp[1]; 
    if(range.inRange(selectionRange)) { 
      range.setEndPoint('EndToStart', selectionRange); 
      if(textfield.type == 'textarea') { 
        return goog.dom.selection.getEndPointsTextareaIe_(range, selectionRange, getOnlyStart); 
      } 
      startPos = range.text.length; 
      if(! getOnlyStart) { 
        endPos = range.text.length + selectionRange.text.length; 
      } else { 
        endPos = - 1; 
      } 
    } 
  } 
  return[startPos, endPos]; 
}; 
goog.dom.selection.setEnd = function(textfield, pos) { 
  if(goog.dom.selection.useSelectionProperties_(textfield)) { 
    textfield.selectionEnd = pos; 
  } else if(goog.userAgent.IE) { 
    var tmp = goog.dom.selection.getRangeIe_(textfield); 
    var range = tmp[0]; 
    var selectionRange = tmp[1]; 
    if(range.inRange(selectionRange)) { 
      pos = goog.dom.selection.canonicalizePositionIe_(textfield, pos); 
      var startCursorPos = goog.dom.selection.canonicalizePositionIe_(textfield, goog.dom.selection.getStart(textfield)); 
      selectionRange.collapse(true); 
      selectionRange.moveEnd('character', pos - startCursorPos); 
      selectionRange.select(); 
    } 
  } 
}; 
goog.dom.selection.getEnd = function(textfield) { 
  return goog.dom.selection.getEndPoints_(textfield, false)[1]; 
}; 
goog.dom.selection.setCursorPosition = function(textfield, pos) { 
  if(goog.dom.selection.useSelectionProperties_(textfield)) { 
    textfield.selectionStart = pos; 
    textfield.selectionEnd = pos; 
  } else if(goog.userAgent.IE) { 
    pos = goog.dom.selection.canonicalizePositionIe_(textfield, pos); 
    var sel = textfield.createTextRange(); 
    sel.collapse(true); 
    sel.move('character', pos); 
    sel.select(); 
  } 
}; 
goog.dom.selection.setText = function(textfield, text) { 
  if(goog.dom.selection.useSelectionProperties_(textfield)) { 
    var value = textfield.value; 
    var oldSelectionStart = textfield.selectionStart; 
    var before = value.substr(0, oldSelectionStart); 
    var after = value.substr(textfield.selectionEnd); 
    textfield.value = before + text + after; 
    textfield.selectionStart = oldSelectionStart; 
    textfield.selectionEnd = oldSelectionStart + text.length; 
  } else if(goog.userAgent.IE) { 
    var tmp = goog.dom.selection.getRangeIe_(textfield); 
    var range = tmp[0]; 
    var selectionRange = tmp[1]; 
    if(! range.inRange(selectionRange)) { 
      return; 
    } 
    var range2 = selectionRange.duplicate(); 
    selectionRange.text = text; 
    selectionRange.setEndPoint('StartToStart', range2); 
    selectionRange.select(); 
  } else { 
    throw Error('Cannot set the selection end'); 
  } 
}; 
goog.dom.selection.getText = function(textfield) { 
  if(goog.dom.selection.useSelectionProperties_(textfield)) { 
    var s = textfield.value; 
    return s.substring(textfield.selectionStart, textfield.selectionEnd); 
  } 
  if(goog.userAgent.IE) { 
    var tmp = goog.dom.selection.getRangeIe_(textfield); 
    var range = tmp[0]; 
    var selectionRange = tmp[1]; 
    if(! range.inRange(selectionRange)) { 
      return ''; 
    } else if(textfield.type == 'textarea') { 
      return goog.dom.selection.getSelectionRangeText_(selectionRange); 
    } 
    return selectionRange.text; 
  } 
  throw Error('Cannot get the selection text'); 
}; 
goog.dom.selection.getSelectionRangeText_ = function(selRange) { 
  var selectionRange = selRange.duplicate(); 
  var selectionText = selectionRange.text; 
  var untrimmedSelectionText = selectionText; 
  var isSelectionRangeEndTrimmed = false; 
  while(! isSelectionRangeEndTrimmed) { 
    if(selectionRange.compareEndPoints('StartToEnd', selectionRange) == 0) { 
      isSelectionRangeEndTrimmed = true; 
    } else { 
      selectionRange.moveEnd('character', - 1); 
      if(selectionRange.text == selectionText) { 
        untrimmedSelectionText += '\r\n'; 
      } else { 
        isSelectionRangeEndTrimmed = true; 
      } 
    } 
  } 
  return untrimmedSelectionText; 
}; 
goog.dom.selection.getRangeIe_ = function(el) { 
  var doc = el.ownerDocument || el.document; 
  var selectionRange = doc.selection.createRange(); 
  var range; 
  if(el.type == 'textarea') { 
    range = doc.body.createTextRange(); 
    range.moveToElementText(el); 
  } else { 
    range = el.createTextRange(); 
  } 
  return[range, selectionRange]; 
}; 
goog.dom.selection.canonicalizePositionIe_ = function(textfield, pos) { 
  if(textfield.type == 'textarea') { 
    var value = textfield.value.substring(0, pos); 
    pos = goog.string.canonicalizeNewlines(value).length; 
  } 
  return pos; 
}; 
goog.dom.selection.useSelectionProperties_ = function(el) { 
  try { 
    return typeof el.selectionStart == 'number'; 
  } catch(e) { 
    return false; 
  } 
}; 
