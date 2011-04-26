
goog.provide('goog.editor.plugins.BasicTextFormatter'); 
goog.provide('goog.editor.plugins.BasicTextFormatter.COMMAND'); 
goog.require('goog.array'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.Link'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.editor.node'); 
goog.require('goog.editor.range'); 
goog.require('goog.iter'); 
goog.require('goog.object'); 
goog.require('goog.string'); 
goog.require('goog.string.Unicode'); 
goog.require('goog.style'); 
goog.require('goog.ui.editor.messages'); 
goog.require('goog.userAgent'); 
goog.editor.plugins.BasicTextFormatter = function() { 
  goog.editor.Plugin.call(this); 
}; 
goog.inherits(goog.editor.plugins.BasicTextFormatter, goog.editor.Plugin); 
goog.editor.plugins.BasicTextFormatter.prototype.getTrogClassId = function() { 
  return 'BTF'; 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.logger = goog.debug.Logger.getLogger('goog.editor.plugins.BasicTextFormatter'); 
goog.editor.plugins.BasicTextFormatter.COMMAND = { 
  LINK: '+link', 
  FORMAT_BLOCK: '+formatBlock', 
  INDENT: '+indent', 
  OUTDENT: '+outdent', 
  STRIKE_THROUGH: '+strikeThrough', 
  HORIZONTAL_RULE: '+insertHorizontalRule', 
  SUBSCRIPT: '+subscript', 
  SUPERSCRIPT: '+superscript', 
  UNDERLINE: '+underline', 
  BOLD: '+bold', 
  ITALIC: '+italic', 
  FONT_SIZE: '+fontSize', 
  FONT_FACE: '+fontName', 
  FONT_COLOR: '+foreColor', 
  BACKGROUND_COLOR: '+backColor', 
  ORDERED_LIST: '+insertOrderedList', 
  UNORDERED_LIST: '+insertUnorderedList', 
  JUSTIFY_CENTER: '+justifyCenter', 
  JUSTIFY_FULL: '+justifyFull', 
  JUSTIFY_RIGHT: '+justifyRight', 
  JUSTIFY_LEFT: '+justifyLeft' 
}; 
goog.editor.plugins.BasicTextFormatter.SUPPORTED_COMMANDS_ = goog.object.transpose(goog.editor.plugins.BasicTextFormatter.COMMAND); 
goog.editor.plugins.BasicTextFormatter.prototype.isSupportedCommand = function(command) { 
  return command in goog.editor.plugins.BasicTextFormatter.SUPPORTED_COMMANDS_; 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.getRange_ = function() { 
  return this.fieldObject.getRange(); 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.getDocument_ = function() { 
  return this.getFieldDomHelper().getDocument(); 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.execCommandInternal = function(command, var_args) { 
  var preserveDir, styleWithCss, needsFormatBlockDiv, hasDummySelection; 
  var result; 
  var opt_arg = arguments[1]; 
  switch(command) { 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.BACKGROUND_COLOR: 
      if(! goog.isNull(opt_arg)) { 
        if(goog.editor.BrowserFeature.EATS_EMPTY_BACKGROUND_COLOR) { 
          this.applyBgColorManually_(opt_arg); 
        } else if(goog.userAgent.OPERA) { 
          this.execCommandHelper_('hiliteColor', opt_arg); 
        } else { 
          this.execCommandHelper_(command, opt_arg); 
        } 
      } 
      break; 

    case goog.editor.plugins.BasicTextFormatter.COMMAND.LINK: 
      result = this.toggleLink_(opt_arg); 
      break; 

    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_CENTER: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_FULL: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT: 
      this.justify_(command); 
      break; 

    default: 
      if(goog.userAgent.IE && command == goog.editor.plugins.BasicTextFormatter.COMMAND.FORMAT_BLOCK && opt_arg) { 
        opt_arg = '<' + opt_arg + '>'; 
      } 
      if(command == goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_COLOR && goog.isNull(opt_arg)) { 
        break; 
      } 
      switch(command) { 
        case goog.editor.plugins.BasicTextFormatter.COMMAND.INDENT: 
        case goog.editor.plugins.BasicTextFormatter.COMMAND.OUTDENT: 
          if(goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS) { 
            if(goog.userAgent.GECKO) { 
              styleWithCss = true; 
            } 
            if(goog.userAgent.OPERA) { 
              if(command == goog.editor.plugins.BasicTextFormatter.COMMAND.OUTDENT) { 
                styleWithCss = ! this.getDocument_().queryCommandEnabled('outdent'); 
              } else { 
                styleWithCss = true; 
              } 
            } 
          } 

        case goog.editor.plugins.BasicTextFormatter.COMMAND.ORDERED_LIST: 
        case goog.editor.plugins.BasicTextFormatter.COMMAND.UNORDERED_LIST: 
          if(goog.editor.BrowserFeature.LEAVES_P_WHEN_REMOVING_LISTS && this.queryCommandStateInternal_(this.getDocument_(), command)) { 
            needsFormatBlockDiv = this.fieldObject.queryCommandValue(goog.editor.Command.DEFAULT_TAG) != goog.dom.TagName.P; 
          } else if(! goog.editor.BrowserFeature.CAN_LISTIFY_BR) { 
            this.convertBreaksToDivs_(); 
          } 
          if(goog.userAgent.GECKO && goog.editor.BrowserFeature.FORGETS_FORMATTING_WHEN_LISTIFYING && ! this.queryCommandValue(command)) { 
            hasDummySelection |= this.beforeInsertListGecko_(); 
          } 

        case goog.editor.plugins.BasicTextFormatter.COMMAND.FORMAT_BLOCK: 
          preserveDir = ! ! this.fieldObject.getPluginByClassId('Bidi'); 
          break; 

        case goog.editor.plugins.BasicTextFormatter.COMMAND.SUBSCRIPT: 
        case goog.editor.plugins.BasicTextFormatter.COMMAND.SUPERSCRIPT: 
          if(goog.editor.BrowserFeature.NESTS_SUBSCRIPT_SUPERSCRIPT) { 
            this.applySubscriptSuperscriptWorkarounds_(command); 
          } 
          break; 

        case goog.editor.plugins.BasicTextFormatter.COMMAND.UNDERLINE: 
        case goog.editor.plugins.BasicTextFormatter.COMMAND.BOLD: 
        case goog.editor.plugins.BasicTextFormatter.COMMAND.ITALIC: 
          styleWithCss = goog.userAgent.GECKO && goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS && this.queryCommandValue(command); 
          break; 

        case goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_COLOR: 
        case goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_FACE: 
          styleWithCss = goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS && goog.userAgent.GECKO; 

      } 
      this.execCommandHelper_(command, opt_arg, preserveDir, styleWithCss); 
      if(hasDummySelection) { 
        this.getDocument_().execCommand('Delete', false, true); 
      } 
      if(needsFormatBlockDiv) { 
        this.getDocument_().execCommand('FormatBlock', false, '<div>'); 
      } 

  } 
  if(goog.userAgent.GECKO && ! this.fieldObject.inModalMode()) { 
    this.focusField_(); 
  } 
  return result; 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.focusField_ = function() { 
  this.getFieldDomHelper().getWindow().focus(); 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.queryCommandValue = function(command) { 
  var styleWithCss; 
  switch(command) { 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.LINK: 
      return this.isNodeInState_(goog.dom.TagName.A); 

    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_CENTER: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_FULL: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_RIGHT: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.JUSTIFY_LEFT: 
      return this.isJustification_(command); 

    case goog.editor.plugins.BasicTextFormatter.COMMAND.FORMAT_BLOCK: 
      return goog.editor.plugins.BasicTextFormatter.getSelectionBlockState_(this.fieldObject.getRange()); 

    case goog.editor.plugins.BasicTextFormatter.COMMAND.INDENT: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.OUTDENT: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.HORIZONTAL_RULE: 
      return false; 

    case goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_SIZE: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_FACE: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.FONT_COLOR: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.BACKGROUND_COLOR: 
      return this.queryCommandValueInternal_(this.getDocument_(), command, goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS && goog.userAgent.GECKO); 

    case goog.editor.plugins.BasicTextFormatter.COMMAND.UNDERLINE: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.BOLD: 
    case goog.editor.plugins.BasicTextFormatter.COMMAND.ITALIC: 
      styleWithCss = goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS && goog.userAgent.GECKO; 

    default: 
      return this.queryCommandStateInternal_(this.getDocument_(), command, styleWithCss); 

  } 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.prepareContentsHtml = function(html) { 
  if(goog.editor.BrowserFeature.COLLAPSES_EMPTY_NODES && html.match(/^\s*<script/i)) { 
    html = '&nbsp;' + html; 
  } 
  if(goog.editor.BrowserFeature.CONVERT_TO_B_AND_I_TAGS) { 
    html = html.replace(/<(\/?)strong([^\w])/gi, '<$1b$2'); 
    html = html.replace(/<(\/?)em([^\w])/gi, '<$1i$2'); 
  } 
  return html; 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.cleanContentsDom = function(fieldCopy) { 
  var images = fieldCopy.getElementsByTagName(goog.dom.TagName.IMG); 
  for(var i = 0, image; image = images[i]; i ++) { 
    if(goog.editor.BrowserFeature.SHOWS_CUSTOM_ATTRS_IN_INNER_HTML) { 
      image.removeAttribute('tabIndex'); 
      image.removeAttribute('tabIndexSet'); 
      goog.removeUid(image); 
      image.oldTabIndex; 
      if(image.oldTabIndex) { 
        image.tabIndex = image.oldTabIndex; 
      } 
    } 
  } 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.cleanContentsHtml = function(html) { 
  if(goog.editor.BrowserFeature.MOVES_STYLE_TO_HEAD) { 
    var heads = this.fieldObject.getEditableDomHelper().getElementsByTagNameAndClass(goog.dom.TagName.HEAD); 
    var stylesHtmlArr =[]; 
    var numHeads = heads.length; 
    for(var i = 1; i < numHeads; ++ i) { 
      var styles = heads[i].getElementsByTagName(goog.dom.TagName.STYLE); 
      var numStyles = styles.length; 
      for(var j = 0; j < numStyles; ++ j) { 
        stylesHtmlArr.push(styles[j].outerHTML); 
      } 
    } 
    return stylesHtmlArr.join('') + html; 
  } 
  return html; 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.handleKeyboardShortcut = function(e, key, isModifierPressed) { 
  if(! isModifierPressed) { 
    return false; 
  } 
  var command; 
  switch(key) { 
    case 'b': 
      command = goog.editor.plugins.BasicTextFormatter.COMMAND.BOLD; 
      break; 

    case 'i': 
      command = goog.editor.plugins.BasicTextFormatter.COMMAND.ITALIC; 
      break; 

    case 'u': 
      command = goog.editor.plugins.BasicTextFormatter.COMMAND.UNDERLINE; 
      break; 

    case 's': 
      return true; 

  } 
  if(command) { 
    this.fieldObject.execCommand(command); 
    return true; 
  } 
  return false; 
}; 
goog.editor.plugins.BasicTextFormatter.BR_REGEXP_ = goog.userAgent.IE ? /<br([^\/>]*)\/?>/gi: /<br([^\/>]*)\/?>(?!<\/(div|p)>)/gi; 
goog.editor.plugins.BasicTextFormatter.prototype.convertBreaksToDivs_ = function() { 
  if(! goog.userAgent.IE && ! goog.userAgent.OPERA) { 
    return false; 
  } 
  var range = this.getRange_(); 
  var parent = range.getContainerElement(); 
  var doc = this.getDocument_(); 
  goog.editor.plugins.BasicTextFormatter.BR_REGEXP_.lastIndex = 0; 
  if(goog.editor.plugins.BasicTextFormatter.BR_REGEXP_.test(parent.innerHTML)) { 
    var savedRange = range.saveUsingCarets(); 
    if(parent.tagName == goog.dom.TagName.P) { 
      goog.editor.plugins.BasicTextFormatter.convertParagraphToDiv_(parent, true); 
    } else { 
      var attribute = 'trtempbr'; 
      var value = 'temp_br'; 
      parent.innerHTML = parent.innerHTML.replace(goog.editor.plugins.BasicTextFormatter.BR_REGEXP_, '<p$1 ' + attribute + '="' + value + '">'); 
      var paragraphs = goog.array.toArray(parent.getElementsByTagName(goog.dom.TagName.P)); 
      goog.iter.forEach(paragraphs, function(paragraph) { 
        if(paragraph.getAttribute(attribute) == value) { 
          paragraph.removeAttribute(attribute); 
          if(goog.string.isBreakingWhitespace(goog.dom.getTextContent(paragraph))) { 
            var child = goog.userAgent.IE ? doc.createTextNode(goog.string.Unicode.NBSP): doc.createElement(goog.dom.TagName.BR); 
            paragraph.appendChild(child); 
          } 
          goog.editor.plugins.BasicTextFormatter.convertParagraphToDiv_(paragraph); 
        } 
      }); 
    } 
    savedRange.restore(); 
    return true; 
  } 
  return false; 
}; 
goog.editor.plugins.BasicTextFormatter.convertParagraphToDiv_ = function(paragraph, opt_convertBrs) { 
  if(! goog.userAgent.IE && ! goog.userAgent.OPERA) { 
    return; 
  } 
  var outerHTML = paragraph.outerHTML.replace(/<(\/?)p/gi, '<$1div'); 
  if(opt_convertBrs) { 
    outerHTML = outerHTML.replace(goog.editor.plugins.BasicTextFormatter.BR_REGEXP_, '</div><div$1>'); 
  } 
  if(goog.userAgent.OPERA && ! /<\/div>$/i.test(outerHTML)) { 
    outerHTML += '</div>'; 
  } 
  paragraph.outerHTML = outerHTML; 
}; 
goog.editor.plugins.BasicTextFormatter.convertToRealExecCommand_ = function(command) { 
  return command.indexOf('+') == 0 ? command.substring(1): command; 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.justify_ = function(command) { 
  this.execCommandHelper_(command, null, false, true); 
  if(goog.userAgent.GECKO) { 
    this.execCommandHelper_(command, null, false, true); 
  } 
  if(!(goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS && goog.userAgent.GECKO)) { 
    goog.iter.forEach(this.fieldObject.getRange(), goog.editor.plugins.BasicTextFormatter.convertContainerToTextAlign_); 
  } 
}; 
goog.editor.plugins.BasicTextFormatter.convertContainerToTextAlign_ = function(node) { 
  var container = goog.editor.style.getContainer(node); 
  if(container.align) { 
    container.style.textAlign = container.align; 
    container.removeAttribute('align'); 
  } 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.execCommandHelper_ = function(command, opt_value, opt_preserveDir, opt_styleWithCss) { 
  var dir = null; 
  if(opt_preserveDir) { 
    dir = this.fieldObject.queryCommandValue(goog.editor.Command.DIR_RTL) ? 'rtl': this.fieldObject.queryCommandValue(goog.editor.Command.DIR_LTR) ? 'ltr': null; 
  } 
  command = goog.editor.plugins.BasicTextFormatter.convertToRealExecCommand_(command); 
  var endDiv, nbsp; 
  if(goog.userAgent.IE) { 
    var ret = this.applyExecCommandIEFixes_(command); 
    endDiv = ret[0]; 
    nbsp = ret[1]; 
  } 
  if(goog.userAgent.WEBKIT) { 
    endDiv = this.applyExecCommandSafariFixes_(command); 
  } 
  if(goog.userAgent.GECKO) { 
    this.applyExecCommandGeckoFixes_(command); 
  } 
  if(goog.editor.BrowserFeature.DOESNT_OVERRIDE_FONT_SIZE_IN_STYLE_ATTR && command.toLowerCase() == 'fontsize') { 
    this.removeFontSizeFromStyleAttrs_(); 
  } 
  var doc = this.getDocument_(); 
  if(opt_styleWithCss && goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS) { 
    doc.execCommand('styleWithCSS', false, true); 
    if(goog.userAgent.OPERA) { 
      this.invalidateInlineCss_(); 
    } 
  } 
  doc.execCommand(command, false, opt_value); 
  if(opt_styleWithCss && goog.editor.BrowserFeature.HAS_STYLE_WITH_CSS) { 
    doc.execCommand('styleWithCSS', false, false); 
  } 
  if(goog.userAgent.WEBKIT && ! goog.userAgent.isVersion('526') && command.toLowerCase() == 'formatblock' && opt_value && /^[<]?h\d[>]?$/i.test(opt_value)) { 
    this.cleanUpSafariHeadings_(); 
  } 
  if(/insert(un)?orderedlist/i.test(command)) { 
    if(goog.userAgent.WEBKIT) { 
      this.fixSafariLists_(); 
    } 
    if(goog.userAgent.IE) { 
      this.fixIELists_(); 
      if(nbsp) { 
        goog.dom.removeNode(nbsp); 
      } 
    } 
  } 
  if(endDiv) { 
    goog.dom.removeNode(endDiv); 
  } 
  if(dir) { 
    this.fieldObject.execCommand(dir); 
  } 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.applyBgColorManually_ = function(bgColor) { 
  var needsSpaceInTextNode = goog.userAgent.GECKO; 
  var range = this.fieldObject.getRange(); 
  var textNode; 
  var parentTag; 
  if(range && range.isCollapsed()) { 
    textNode = this.getFieldDomHelper().createTextNode(needsSpaceInTextNode ? ' ': ''); 
    var containerNode = range.getStartNode(); 
    parentTag = containerNode.nodeType == goog.dom.NodeType.ELEMENT ? containerNode: containerNode.parentNode; 
    if(parentTag.innerHTML == '') { 
      parentTag.style.textIndent = '-10000px'; 
      parentTag.appendChild(textNode); 
    } else { 
      parentTag = this.getFieldDomHelper().createDom('span', { 'style': 'text-indent:-10000px' }, textNode); 
      range.replaceContentsWithNode(parentTag); 
    } 
    goog.dom.Range.createFromNodeContents(textNode).select(); 
  } 
  this.execCommandHelper_('hiliteColor', bgColor, false, true); 
  if(textNode) { 
    if(needsSpaceInTextNode) { 
      textNode.data = ''; 
    } 
    parentTag.style.textIndent = ''; 
  } 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.toggleLink_ = function(opt_target) { 
  if(! this.fieldObject.isSelectionEditable()) { 
    this.focusField_(); 
  } 
  var range = this.getRange_(); 
  var parent = range && range.getContainerElement(); 
  var link =(goog.dom.getAncestorByTagNameAndClass(parent, goog.dom.TagName.A)); 
  if(link && goog.editor.node.isEditable(link)) { 
    goog.dom.flattenElement(link); 
  } else { 
    var editableLink = this.createLink_(range, '/', opt_target); 
    if(editableLink) { 
      if(! this.fieldObject.execCommand(goog.editor.Command.MODAL_LINK_EDITOR, editableLink)) { 
        var url = this.fieldObject.getAppWindow().prompt(goog.ui.editor.messages.MSG_LINK_TO, 'http://'); 
        if(url) { 
          editableLink.setTextAndUrl(editableLink.getCurrentText() || url, url); 
          editableLink.placeCursorRightOf(); 
        } else { 
          var savedRange = goog.editor.range.saveUsingNormalizedCarets(goog.dom.Range.createFromNodeContents(editableLink.getAnchor())); 
          editableLink.removeLink(); 
          savedRange.restore().select(); 
          return null; 
        } 
      } 
      return editableLink; 
    } 
  } 
  return null; 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.createLink_ = function(range, url, opt_target) { 
  var anchor = null; 
  var parent = range && range.getContainerElement(); 
  if(parent && parent.tagName == goog.dom.TagName.IMG) { 
    return null; 
  } 
  if(range && range.isCollapsed()) { 
    var textRange = range.getTextRange(0).getBrowserRangeObject(); 
    if(goog.editor.BrowserFeature.HAS_W3C_RANGES) { 
      anchor = this.getFieldDomHelper().createElement(goog.dom.TagName.A); 
      textRange.insertNode(anchor); 
    } else if(goog.editor.BrowserFeature.HAS_IE_RANGES) { 
      textRange.pasteHTML("<a id='newLink'></a>"); 
      anchor = this.getFieldDomHelper().getElement('newLink'); 
      anchor.removeAttribute('id'); 
    } 
  } else { 
    var uniqueId = goog.string.createUniqueString(); 
    this.execCommandHelper_('CreateLink', uniqueId); 
    var setHrefAndLink = function(element, index, arr) { 
      if(goog.string.endsWith(element.href, uniqueId)) { 
        anchor = element; 
      } 
    }; 
    goog.array.forEach(this.fieldObject.getElement().getElementsByTagName(goog.dom.TagName.A), setHrefAndLink); 
  } 
  return goog.editor.Link.createNewLink((anchor), url, opt_target); 
}; 
goog.editor.plugins.BasicTextFormatter.brokenExecCommandsIE_ = { 
  'indent': 1, 
  'outdent': 1, 
  'insertOrderedList': 1, 
  'insertUnorderedList': 1, 
  'justifyCenter': 1, 
  'justifyFull': 1, 
  'justifyRight': 1, 
  'justifyLeft': 1, 
  'ltr': 1, 
  'rtl': 1 
}; 
goog.editor.plugins.BasicTextFormatter.blockquoteHatingCommandsIE_ = { 
  'insertOrderedList': 1, 
  'insertUnorderedList': 1 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.applySubscriptSuperscriptWorkarounds_ = function(command) { 
  if(! this.queryCommandValue(command)) { 
    var oppositeCommand =(command == goog.editor.plugins.BasicTextFormatter.COMMAND.SUBSCRIPT ? goog.editor.plugins.BasicTextFormatter.COMMAND.SUPERSCRIPT: goog.editor.plugins.BasicTextFormatter.COMMAND.SUBSCRIPT); 
    var oppositeExecCommand = goog.editor.plugins.BasicTextFormatter.convertToRealExecCommand_(oppositeCommand); 
    if(! this.queryCommandValue(oppositeCommand)) { 
      this.getDocument_().execCommand(oppositeExecCommand, false, null); 
    } 
    this.getDocument_().execCommand(oppositeExecCommand, false, null); 
  } 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.removeFontSizeFromStyleAttrs_ = function() { 
  var range = goog.editor.range.expand(this.fieldObject.getRange(), this.fieldObject.getElement()); 
  goog.iter.forEach(goog.iter.filter(range, function(tag, dummy, iter) { 
    return iter.isStartTag() && range.containsNode(tag); 
  }), function(node) { 
    goog.style.setStyle(node, 'font-size', ''); 
    if(goog.userAgent.GECKO && node.style.length == 0 && node.getAttribute('style') != null) { 
      node.removeAttribute('style'); 
    } 
  }); 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.applyExecCommandIEFixes_ = function(command) { 
  var toRemove =[]; 
  var endDiv = null; 
  var range = this.getRange_(); 
  var dh = this.getFieldDomHelper(); 
  if(command in goog.editor.plugins.BasicTextFormatter.blockquoteHatingCommandsIE_) { 
    var parent = range && range.getContainerElement(); 
    if(parent) { 
      var blockquotes = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.BLOCKQUOTE, null, parent); 
      var bq; 
      for(var i = 0; i < blockquotes.length; i ++) { 
        if(range.containsNode(blockquotes[i])) { 
          bq = blockquotes[i]; 
          break; 
        } 
      } 
      var bqThatNeedsDummyDiv = bq || goog.dom.getAncestorByTagNameAndClass(parent, 'BLOCKQUOTE'); 
      if(bqThatNeedsDummyDiv) { 
        endDiv = dh.createDom('div', { style: 'height:0' }); 
        goog.dom.appendChild(bqThatNeedsDummyDiv, endDiv); 
        toRemove.push(endDiv); 
        if(bq) { 
          range = goog.dom.Range.createFromNodes(bq, 0, endDiv, 0); 
        } else if(range.containsNode(endDiv)) { 
          range = goog.dom.Range.createFromNodes(range.getStartNode(), range.getStartOffset(), endDiv, 0); 
        } 
        range.select(); 
      } 
    } 
  } 
  var fieldObject = this.fieldObject; 
  if(! fieldObject.usesIframe() && ! endDiv) { 
    if(command in goog.editor.plugins.BasicTextFormatter.brokenExecCommandsIE_) { 
      var field = fieldObject.getElement(); 
      if(range && range.isCollapsed() && ! goog.dom.getFirstElementChild(field)) { 
        var selection = range.getTextRange(0).getBrowserRangeObject(); 
        var testRange = selection.duplicate(); 
        testRange.moveToElementText(field); 
        testRange.collapse(false); 
        if(testRange.isEqual(selection)) { 
          var nbsp = dh.createTextNode(goog.string.Unicode.NBSP); 
          field.appendChild(nbsp); 
          selection.move('character', 1); 
          selection.move('character', - 1); 
          selection.select(); 
          toRemove.push(nbsp); 
        } 
      } 
      endDiv = dh.createDom('div', { style: 'height:0' }); 
      goog.dom.appendChild(field, endDiv); 
      toRemove.push(endDiv); 
    } 
  } 
  return toRemove; 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.cleanUpSafariHeadings_ = function() { 
  goog.iter.forEach(this.getRange_(), function(node) { 
    if(node.className == 'Apple-style-span') { 
      node.style.fontSize = ''; 
      node.style.fontWeight = ''; 
    } 
  }); 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.fixSafariLists_ = function() { 
  var previousList = false; 
  goog.iter.forEach(this.getRange_(), function(node) { 
    var tagName = node.tagName; 
    if(tagName == goog.dom.TagName.UL || tagName == goog.dom.TagName.OL) { 
      if(! previousList) { 
        previousList = true; 
        return; 
      } 
      var previousElementSibling = goog.dom.getPreviousElementSibling(node); 
      if(! previousElementSibling) { 
        return; 
      } 
      var range = node.ownerDocument.createRange(); 
      range.setStartAfter(previousElementSibling); 
      range.setEndBefore(node); 
      if(! goog.string.isEmpty(range.toString())) { 
        return; 
      } 
      if(previousElementSibling.nodeName == node.nodeName) { 
        while(previousElementSibling.lastChild) { 
          node.insertBefore(previousElementSibling.lastChild, node.firstChild); 
        } 
        previousElementSibling.parentNode.removeChild(previousElementSibling); 
      } 
    } 
  }); 
}; 
goog.editor.plugins.BasicTextFormatter.orderedListTypes_ = { 
  '1': 1, 
  'a': 1, 
  'A': 1, 
  'i': 1, 
  'I': 1 
}; 
goog.editor.plugins.BasicTextFormatter.unorderedListTypes_ = { 
  'disc': 1, 
  'circle': 1, 
  'square': 1 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.fixIELists_ = function() { 
  var range = this.getRange_(); 
  var container = range && range.getContainer(); 
  while(container && container.tagName != goog.dom.TagName.UL && container.tagName != goog.dom.TagName.OL) { 
    container = container.parentNode; 
  } 
  if(container) { 
    container = container.parentNode; 
  } 
  if(! container) return; 
  var lists = goog.array.toArray(container.getElementsByTagName(goog.dom.TagName.UL)); 
  goog.array.extend(lists, goog.array.toArray(container.getElementsByTagName(goog.dom.TagName.OL))); 
  goog.array.forEach(lists, function(node) { 
    var type = node.type; 
    if(type) { 
      var saneTypes =(node.tagName == goog.dom.TagName.UL ? goog.editor.plugins.BasicTextFormatter.unorderedListTypes_: goog.editor.plugins.BasicTextFormatter.orderedListTypes_); 
      if(! saneTypes[type]) { 
        node.type = ''; 
      } 
    } 
  }); 
}; 
goog.editor.plugins.BasicTextFormatter.brokenExecCommandsSafari_ = { 
  'justifyCenter': 1, 
  'justifyFull': 1, 
  'justifyRight': 1, 
  'justifyLeft': 1, 
  'formatBlock': 1 
}; 
goog.editor.plugins.BasicTextFormatter.hangingExecCommandWebkit_ = { 
  'insertOrderedList': 1, 
  'insertUnorderedList': 1 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.applyExecCommandSafariFixes_ = function(command) { 
  var div; 
  if(goog.editor.plugins.BasicTextFormatter.brokenExecCommandsSafari_[command]) { 
    div = this.getFieldDomHelper().createDom('div', { 'style': 'height: 0' }, 'x'); 
    goog.dom.appendChild(this.fieldObject.getElement(), div); 
  } 
  if(goog.editor.plugins.BasicTextFormatter.hangingExecCommandWebkit_[command]) { 
    var field = this.fieldObject.getElement(); 
    div = this.getFieldDomHelper().createDom('div', { 'style': 'height: 0' }, 'x'); 
    field.insertBefore(div, field.firstChild); 
  } 
  return div; 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.applyExecCommandGeckoFixes_ = function(command) { 
  if(goog.userAgent.isVersion('1.9') && command.toLowerCase() == 'formatblock') { 
    var range = this.getRange_(); 
    var startNode = range.getStartNode(); 
    if(range.isCollapsed() && startNode && startNode.tagName == goog.dom.TagName.BODY) { 
      var startOffset = range.getStartOffset(); 
      var childNode = startNode.childNodes[startOffset]; 
      if(childNode && childNode.tagName == goog.dom.TagName.BR) { 
        var browserRange = range.getBrowserRangeObject(); 
        browserRange.setStart(childNode, 0); 
        browserRange.setEnd(childNode, 0); 
      } 
    } 
  } 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.invalidateInlineCss_ = function() { 
  var ancestors =[]; 
  var ancestor = this.fieldObject.getRange().getContainerElement(); 
  do { 
    ancestors.push(ancestor); 
  } while(ancestor = ancestor.parentNode); 
  var nodesInSelection = goog.iter.chain(goog.iter.toIterator(this.fieldObject.getRange()), goog.iter.toIterator(ancestors)); 
  var containersInSelection = goog.iter.filter(nodesInSelection, goog.editor.style.isContainer); 
  goog.iter.forEach(containersInSelection, function(element) { 
    var oldOutline = element.style.outline; 
    element.style.outline = '0px solid red'; 
    element.style.outline = oldOutline; 
  }); 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.beforeInsertListGecko_ = function() { 
  var tag = this.fieldObject.queryCommandValue(goog.editor.Command.DEFAULT_TAG); 
  if(tag == goog.dom.TagName.P || tag == goog.dom.TagName.DIV) { 
    return false; 
  } 
  var range = this.getRange_(); 
  if(range.isCollapsed() &&(range.getContainer().nodeType != goog.dom.NodeType.TEXT)) { 
    var tempTextNode = this.getFieldDomHelper().createTextNode(goog.string.Unicode.NBSP); 
    range.insertNode(tempTextNode, false); 
    goog.dom.Range.createFromNodeContents(tempTextNode).select(); 
    return true; 
  } 
  return false; 
}; 
goog.editor.plugins.BasicTextFormatter.getSelectionBlockState_ = function(range) { 
  var tagName = null; 
  goog.iter.forEach(range, function(node, ignore, it) { 
    if(! it.isEndTag()) { 
      var container = goog.editor.style.getContainer(node); 
      var thisTagName = container.tagName; 
      tagName = tagName || thisTagName; 
      if(tagName != thisTagName) { 
        tagName = null; 
        throw goog.iter.StopIteration; 
      } 
      it.skipTag(); 
    } 
  }); 
  return tagName; 
}; 
goog.editor.plugins.BasicTextFormatter.SUPPORTED_JUSTIFICATIONS_ = { 
  'center': 1, 
  'justify': 1, 
  'right': 1, 
  'left': 1 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.isJustification_ = function(command) { 
  var alignment = command.replace('+justify', '').toLowerCase(); 
  if(alignment == 'full') { 
    alignment = 'justify'; 
  } 
  var bidiPlugin = this.fieldObject.getPluginByClassId('Bidi'); 
  if(bidiPlugin) { 
    bidiPlugin.getSelectionAlignment; 
    return alignment == bidiPlugin.getSelectionAlignment(); 
  } else { 
    var range = this.getRange_(); 
    if(! range) { 
      return false; 
    } 
    var parent = range.getContainerElement(); 
    var nodes = goog.array.filter(parent.childNodes, function(node) { 
      return goog.editor.node.isImportant(node) && range.containsNode(node, true); 
    }); 
    nodes = nodes.length ? nodes:[parent]; 
    for(var i = 0; i < nodes.length; i ++) { 
      var current = nodes[i]; 
      var container = goog.editor.style.getContainer((current)); 
      if(alignment != goog.editor.plugins.BasicTextFormatter.getNodeJustification_(container)) { 
        return false; 
      } 
    } 
    return true; 
  } 
}; 
goog.editor.plugins.BasicTextFormatter.getNodeJustification_ = function(element) { 
  var value = goog.style.getComputedTextAlign(element); 
  value = value.replace(/^-(moz|webkit)-/, ''); 
  if(! goog.editor.plugins.BasicTextFormatter.SUPPORTED_JUSTIFICATIONS_[value]) { 
    value = element.align || 'left'; 
  } 
  return(value); 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.isNodeInState_ = function(nodeName) { 
  var range = this.getRange_(); 
  var node = range && range.getContainerElement(); 
  var ancestor = goog.dom.getAncestorByTagNameAndClass(node, nodeName); 
  return ! ! ancestor && goog.editor.node.isEditable(ancestor); 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.queryCommandStateInternal_ = function(queryObject, command, opt_styleWithCss) { 
  return(this.queryCommandHelper_(true, queryObject, command, opt_styleWithCss)); 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.queryCommandValueInternal_ = function(queryObject, command, opt_styleWithCss) { 
  return this.queryCommandHelper_(false, queryObject, command, opt_styleWithCss); 
}; 
goog.editor.plugins.BasicTextFormatter.prototype.queryCommandHelper_ = function(isGetQueryCommandState, queryObject, command, opt_styleWithCss) { 
  command = goog.editor.plugins.BasicTextFormatter.convertToRealExecCommand_(command); 
  if(opt_styleWithCss) { 
    var doc = this.getDocument_(); 
    doc.execCommand('styleWithCSS', false, true); 
  } 
  var ret = isGetQueryCommandState ? queryObject.queryCommandState(command): queryObject.queryCommandValue(command); 
  if(opt_styleWithCss) { 
    doc.execCommand('styleWithCSS', false, false); 
  } 
  return ret; 
}; 
