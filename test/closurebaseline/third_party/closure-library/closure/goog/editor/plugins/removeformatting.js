
goog.provide('goog.editor.plugins.RemoveFormatting'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.Range'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.editor.node'); 
goog.require('goog.editor.range'); 
goog.require('goog.string'); 
goog.editor.plugins.RemoveFormatting = function() { 
  goog.editor.Plugin.call(this); 
  this.optRemoveFormattingFunc_ = null; 
}; 
goog.inherits(goog.editor.plugins.RemoveFormatting, goog.editor.Plugin); 
goog.editor.plugins.RemoveFormatting.REMOVE_FORMATTING_COMMAND = '+removeFormat'; 
goog.editor.plugins.RemoveFormatting.BLOCK_RE_ = /^(DIV|TR|LI|BLOCKQUOTE|H\d|PRE|XMP)/; 
goog.editor.plugins.RemoveFormatting.appendNewline_ = function(sb) { 
  sb.push('<br>'); 
}; 
goog.editor.plugins.RemoveFormatting.createRangeDelimitedByRanges_ = function(startRange, endRange) { 
  return goog.dom.Range.createFromNodes(startRange.getStartNode(), startRange.getStartOffset(), endRange.getEndNode(), endRange.getEndOffset()); 
}; 
goog.editor.plugins.RemoveFormatting.prototype.getTrogClassId = function() { 
  return 'RemoveFormatting'; 
}; 
goog.editor.plugins.RemoveFormatting.prototype.isSupportedCommand = function(command) { 
  return command == goog.editor.plugins.RemoveFormatting.REMOVE_FORMATTING_COMMAND; 
}; 
goog.editor.plugins.RemoveFormatting.prototype.execCommandInternal = function(command, var_args) { 
  if(command == goog.editor.plugins.RemoveFormatting.REMOVE_FORMATTING_COMMAND) { 
    this.removeFormatting_(); 
  } 
}; 
goog.editor.plugins.RemoveFormatting.prototype.handleKeyboardShortcut = function(e, key, isModifierPressed) { 
  if(! isModifierPressed) { 
    return false; 
  } 
  if(key == ' ') { 
    this.fieldObject.execCommand(goog.editor.plugins.RemoveFormatting.REMOVE_FORMATTING_COMMAND); 
    return true; 
  } 
  return false; 
}; 
goog.editor.plugins.RemoveFormatting.prototype.removeFormatting_ = function() { 
  var range = this.fieldObject.getRange(); 
  if(range.isCollapsed()) { 
    return; 
  } 
  var convFunc = this.optRemoveFormattingFunc_ || goog.bind(this.removeFormattingWorker_, this); 
  this.convertSelectedHtmlText_(convFunc); 
  var doc = this.getFieldDomHelper().getDocument(); 
  doc.execCommand('RemoveFormat', false, undefined); 
  if(goog.editor.BrowserFeature.ADDS_NBSPS_IN_REMOVE_FORMAT) { 
    this.convertSelectedHtmlText_(function(text) { 
      var nbspRegExp = goog.userAgent.isVersion('528') ? /&nbsp;/g: /\u00A0/g; 
      return text.replace(nbspRegExp, ' '); 
    }); 
  } 
}; 
goog.editor.plugins.RemoveFormatting.getTableAncestor_ = function(nodeToCheck) { 
  return goog.dom.getAncestor(nodeToCheck, function(node) { 
    return node.tagName == goog.dom.TagName.TABLE; 
  }, true); 
}; 
goog.editor.plugins.RemoveFormatting.prototype.pasteHtml_ = function(html) { 
  var range = this.fieldObject.getRange(); 
  var dh = this.getFieldDomHelper(); 
  var startSpanId = goog.string.createUniqueString(); 
  var endSpanId = goog.string.createUniqueString(); 
  html = '<span id="' + startSpanId + '"></span>' + html + '<span id="' + endSpanId + '"></span>'; 
  var dummyNodeId = goog.string.createUniqueString(); 
  var dummySpanText = '<span id="' + dummyNodeId + '"></span>'; 
  if(goog.editor.BrowserFeature.HAS_IE_RANGES) { 
    var textRange = range.getTextRange(0).getBrowserRangeObject(); 
    textRange.pasteHTML(dummySpanText); 
    var parent; 
    while((parent = textRange.parentElement()) && goog.editor.node.isEmpty(parent) && ! goog.editor.node.isEditableContainer(parent)) { 
      var tag = parent.nodeName; 
      if(tag == goog.dom.TagName.TD || tag == goog.dom.TagName.TR || tag == goog.dom.TagName.TH) { 
        break; 
      } 
      goog.dom.removeNode(parent); 
    } 
    textRange.pasteHTML(html); 
    var dummySpan = dh.getElement(dummyNodeId); 
    if(dummySpan) { 
      goog.dom.removeNode(dummySpan); 
    } 
  } else if(goog.editor.BrowserFeature.HAS_W3C_RANGES) { 
    dh.getDocument().execCommand('insertImage', false, dummyNodeId); 
    var dummyImageNodePattern = new RegExp('<[^<]*' + dummyNodeId + '[^>]*>'); 
    var parent = this.fieldObject.getRange().getContainerElement(); 
    if(parent.nodeType == goog.dom.NodeType.TEXT) { 
      parent = parent.parentNode; 
    } 
    while(! dummyImageNodePattern.test(parent.innerHTML)) { 
      parent = parent.parentNode; 
    } 
    if(goog.userAgent.GECKO) { 
      parent.innerHTML = parent.innerHTML.replace(dummyImageNodePattern, html); 
    } else { 
      parent.innerHTML = parent.innerHTML.replace(dummyImageNodePattern, dummySpanText); 
      var dummySpan = dh.getElement(dummyNodeId); 
      parent = dummySpan; 
      while((parent = dummySpan.parentNode) && goog.editor.node.isEmpty(parent) && ! goog.editor.node.isEditableContainer(parent)) { 
        var tag = parent.nodeName; 
        if(tag == goog.dom.TagName.TD || tag == goog.dom.TagName.TR || tag == goog.dom.TagName.TH) { 
          break; 
        } 
        goog.dom.insertSiblingAfter(dummySpan, parent); 
        goog.dom.removeNode(parent); 
      } 
      parent.innerHTML = parent.innerHTML.replace(new RegExp(dummySpanText, 'i'), html); 
    } 
  } 
  var startSpan = dh.getElement(startSpanId); 
  var endSpan = dh.getElement(endSpanId); 
  goog.dom.Range.createFromNodes(startSpan, 0, endSpan, endSpan.childNodes.length).select(); 
  goog.dom.removeNode(startSpan); 
  goog.dom.removeNode(endSpan); 
}; 
goog.editor.plugins.RemoveFormatting.prototype.getHtmlText_ = function(range) { 
  var div = this.getFieldDomHelper().createDom('div'); 
  var textRange = range.getBrowserRangeObject(); 
  if(goog.editor.BrowserFeature.HAS_W3C_RANGES) { 
    div.appendChild(textRange.cloneContents()); 
  } else if(goog.editor.BrowserFeature.HAS_IE_RANGES) { 
    var rngText = range.getText(); 
    rngText = rngText.replace(/\r\n/g, '\r'); 
    var rngTextLength = rngText.length; 
    var left = rngTextLength - goog.string.trimLeft(rngText).length; 
    var right = rngTextLength - goog.string.trimRight(rngText).length; 
    textRange.moveStart('character', left); 
    textRange.moveEnd('character', - right); 
    var htmlText = textRange.htmlText; 
    if(textRange.queryCommandValue('formatBlock') == 'Formatted') { 
      htmlText = goog.string.newLineToBr(textRange.htmlText); 
    } 
    div.innerHTML = htmlText; 
  } 
  return div.innerHTML; 
}; 
goog.editor.plugins.RemoveFormatting.prototype.adjustRangeForTables_ = function(range, startInTable, endInTable) { 
  var savedCaretRange = goog.editor.range.saveUsingNormalizedCarets(range); 
  var startNode = range.getStartNode(); 
  var startOffset = range.getStartOffset(); 
  var endNode = range.getEndNode(); 
  var endOffset = range.getEndOffset(); 
  var dh = this.getFieldDomHelper(); 
  if(startInTable) { 
    var textNode = dh.createTextNode(''); 
    goog.dom.insertSiblingAfter(textNode, startInTable); 
    startNode = textNode; 
    startOffset = 0; 
  } 
  if(endInTable) { 
    var textNode = dh.createTextNode(''); 
    goog.dom.insertSiblingBefore(textNode, endInTable); 
    endNode = textNode; 
    endOffset = 0; 
  } 
  goog.dom.Range.createFromNodes(startNode, startOffset, endNode, endOffset).select(); 
  return savedCaretRange; 
}; 
goog.editor.plugins.RemoveFormatting.prototype.putCaretInCave_ = function(caretRange, isStart) { 
  var cavedCaret = goog.dom.removeNode(caretRange.getCaret(isStart)); 
  if(isStart) { 
    this.startCaretInCave_ = cavedCaret; 
  } else { 
    this.endCaretInCave_ = cavedCaret; 
  } 
}; 
goog.editor.plugins.RemoveFormatting.prototype.restoreCaretsFromCave_ = function() { 
  var field = this.fieldObject.getElement(); 
  if(this.startCaretInCave_) { 
    field.insertBefore(this.startCaretInCave_, field.firstChild); 
    this.startCaretInCave_ = null; 
  } 
  if(this.endCaretInCave_) { 
    field.appendChild(this.endCaretInCave_); 
    this.endCaretInCave_ = null; 
  } 
}; 
goog.editor.plugins.RemoveFormatting.prototype.convertSelectedHtmlText_ = function(convertFunc) { 
  var range = this.fieldObject.getRange(); 
  if(range.getTextRangeCount() > 1) { 
    return; 
  } 
  if(goog.userAgent.GECKO) { 
    var expandedRange = goog.editor.range.expand(range, this.fieldObject.getElement()); 
    var startInTable = goog.editor.plugins.RemoveFormatting.getTableAncestor_(expandedRange.getStartNode()); 
    var endInTable = goog.editor.plugins.RemoveFormatting.getTableAncestor_(expandedRange.getEndNode()); 
    if(startInTable || endInTable) { 
      if(startInTable == endInTable) { 
        return; 
      } 
      var savedCaretRange = this.adjustRangeForTables_(range, startInTable, endInTable); 
      if(! startInTable) { 
        this.putCaretInCave_(savedCaretRange, true); 
      } 
      if(! endInTable) { 
        this.putCaretInCave_(savedCaretRange, false); 
      } 
      range = this.fieldObject.getRange(); 
      expandedRange = goog.editor.range.expand(range, this.fieldObject.getElement()); 
    } 
    expandedRange.select(); 
    range = expandedRange; 
  } 
  var text = this.getHtmlText_(range); 
  this.pasteHtml_(convertFunc(text)); 
  if(goog.userAgent.GECKO && savedCaretRange) { 
    range = this.fieldObject.getRange(); 
    this.restoreCaretsFromCave_(); 
    var realSavedCaretRange = savedCaretRange.toAbstractRange(); 
    var startRange = startInTable ? realSavedCaretRange: range; 
    var endRange = endInTable ? realSavedCaretRange: range; 
    var restoredRange = goog.editor.plugins.RemoveFormatting.createRangeDelimitedByRanges_(startRange, endRange); 
    restoredRange.select(); 
    savedCaretRange.dispose(); 
  } 
}; 
goog.editor.plugins.RemoveFormatting.prototype.removeFormattingWorker_ = function(html) { 
  var el = goog.dom.createElement('div'); 
  el.innerHTML = html; 
  var sb =[]; 
  var stack =[el.childNodes, 0]; 
  var preTagStack =[]; 
  var preTagLevel = 0; 
  var tableStack =[]; 
  var tableLevel = 0; 
  for(var sp = 0; sp >= 0; sp -= 2) { 
    var changedLevel = false; 
    while(tableLevel > 0 && sp <= tableStack[tableLevel - 1]) { 
      tableLevel --; 
      changedLevel = true; 
    } 
    if(changedLevel) { 
      goog.editor.plugins.RemoveFormatting.appendNewline_(sb); 
    } 
    changedLevel = false; 
    while(preTagLevel > 0 && sp <= preTagStack[preTagLevel - 1]) { 
      preTagLevel --; 
      changedLevel = true; 
    } 
    if(changedLevel) { 
      goog.editor.plugins.RemoveFormatting.appendNewline_(sb); 
    } 
    var nodeList = stack[sp]; 
    var numNodesProcessed = stack[sp + 1]; 
    while(numNodesProcessed < nodeList.length) { 
      var node = nodeList[numNodesProcessed ++]; 
      var nodeName = node.nodeName; 
      var formatted = this.getValueForNode(node); 
      if(goog.isDefAndNotNull(formatted)) { 
        sb.push(formatted); 
        continue; 
      } 
      switch(nodeName) { 
        case '#text': 
          var nodeValue = preTagLevel > 0 ? node.nodeValue: goog.string.stripNewlines(node.nodeValue); 
          nodeValue = goog.string.htmlEscape(nodeValue); 
          sb.push(nodeValue); 
          continue; 

        case goog.dom.TagName.P: 
          goog.editor.plugins.RemoveFormatting.appendNewline_(sb); 
          goog.editor.plugins.RemoveFormatting.appendNewline_(sb); 
          break; 

        case goog.dom.TagName.BR: 
          goog.editor.plugins.RemoveFormatting.appendNewline_(sb); 
          continue; 

        case goog.dom.TagName.TABLE: 
          goog.editor.plugins.RemoveFormatting.appendNewline_(sb); 
          tableStack[tableLevel ++]= sp; 
          break; 

        case goog.dom.TagName.PRE: 
        case 'XMP': 
          preTagStack[preTagLevel ++]= sp; 
          break; 

        case goog.dom.TagName.STYLE: 
        case goog.dom.TagName.SCRIPT: 
        case goog.dom.TagName.SELECT: 
          continue; 

        case goog.dom.TagName.A: 
          if(node.href && node.href != '') { 
            sb.push("<a href='"); 
            sb.push(node.href); 
            sb.push("'>"); 
            sb.push(this.removeFormattingWorker_(node.innerHTML)); 
            sb.push('</a>'); 
            continue; 
          } else { 
            break; 
          } 

        case goog.dom.TagName.IMG: 
          sb.push("<img src='"); 
          sb.push(node.src); 
          sb.push("'"); 
          if(node.border == '0') { 
            sb.push(" border='0'"); 
          } 
          sb.push('>'); 
          continue; 

        case goog.dom.TagName.TD: 
          if(node.previousSibling) { 
            sb.push(' '); 
          } 
          break; 

        case goog.dom.TagName.TR: 
          if(node.previousSibling) { 
            goog.editor.plugins.RemoveFormatting.appendNewline_(sb); 
          } 
          break; 

        case goog.dom.TagName.DIV: 
          var parent = node.parentNode; 
          if(parent.firstChild == node && goog.editor.plugins.RemoveFormatting.BLOCK_RE_.test(parent.tagName)) { 
            break; 
          } 

        default: 
          if(goog.editor.plugins.RemoveFormatting.BLOCK_RE_.test(nodeName)) { 
            goog.editor.plugins.RemoveFormatting.appendNewline_(sb); 
          } 

      } 
      var children = node.childNodes; 
      if(children.length > 0) { 
        stack[sp ++]= nodeList; 
        stack[sp ++]= numNodesProcessed; 
        nodeList = children; 
        numNodesProcessed = 0; 
      } 
    } 
  } 
  return goog.string.normalizeSpaces(sb.join('')); 
}; 
goog.editor.plugins.RemoveFormatting.prototype.getValueForNode = function(node) { 
  return null; 
}; 
goog.editor.plugins.RemoveFormatting.prototype.setRemoveFormattingFunc = function(removeFormattingFunc) { 
  this.optRemoveFormattingFunc_ = removeFormattingFunc; 
}; 
