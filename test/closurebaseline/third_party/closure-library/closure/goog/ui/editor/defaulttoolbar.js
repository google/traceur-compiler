
goog.provide('goog.ui.editor.DefaultToolbar'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.classes'); 
goog.require('goog.editor.Command'); 
goog.require('goog.string.StringBuffer'); 
goog.require('goog.style'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.editor.ToolbarFactory'); 
goog.require('goog.ui.editor.messages'); 
goog.ui.editor.DefaultToolbar.MSG_FONT_NORMAL = goog.getMsg('Normal'); 
goog.ui.editor.DefaultToolbar.MSG_FONT_NORMAL_SERIF = goog.getMsg('Normal / serif'); 
goog.ui.editor.DefaultToolbar.FONTS_ =[{ 
  caption: goog.ui.editor.DefaultToolbar.MSG_FONT_NORMAL, 
  value: 'arial,sans-serif' 
}, { 
  caption: goog.ui.editor.DefaultToolbar.MSG_FONT_NORMAL_SERIF, 
  value: 'times new roman,serif' 
}, { 
  caption: 'Courier New', 
  value: 'courier new,monospace' 
}, { 
  caption: 'Georgia', 
  value: 'georgia,serif' 
}, { 
  caption: 'Trebuchet', 
  value: 'trebuchet ms,sans-serif' 
}, { 
  caption: 'Verdana', 
  value: 'verdana,sans-serif' 
}]; 
goog.ui.editor.DefaultToolbar.I18N_FONTS_ = { 
  'ja':[{ 
    caption: '\uff2d\uff33 \uff30\u30b4\u30b7\u30c3\u30af', 
    value: 'ms pgothic,sans-serif' 
  }, { 
    caption: '\uff2d\uff33 \uff30\u660e\u671d', 
    value: 'ms pmincho,serif' 
  }, { 
    caption: '\uff2d\uff33 \u30b4\u30b7\u30c3\u30af', 
    value: 'ms gothic,monospace' 
  }], 
  'ko':[{ 
    caption: '\uad74\ub9bc', 
    value: 'gulim,sans-serif' 
  }, { 
    caption: '\ubc14\ud0d5', 
    value: 'batang,serif' 
  }, { 
    caption: '\uad74\ub9bc\uccb4', 
    value: 'gulimche,monospace' 
  }], 
  'zh-tw':[{ 
    caption: '\u65b0\u7d30\u660e\u9ad4', 
    value: 'pmingliu,serif' 
  }, { 
    caption: '\u7d30\u660e\u9ad4', 
    value: 'mingliu,serif' 
  }], 
  'zh-cn':[{ 
    caption: '\u5b8b\u4f53', 
    value: 'simsun,serif' 
  }, { 
    caption: '\u9ed1\u4f53', 
    value: 'simhei,sans-serif' 
  }, { 
    caption: 'MS Song', 
    value: 'ms song,monospace' 
  }]
}; 
goog.ui.editor.DefaultToolbar.locale_ = 'en-us'; 
goog.ui.editor.DefaultToolbar.setLocale = function(locale) { 
  goog.ui.editor.DefaultToolbar.locale_ = locale; 
}; 
goog.ui.editor.DefaultToolbar.addDefaultFonts = function(button) { 
  var locale = goog.ui.editor.DefaultToolbar.locale_.replace(/_/, '-').toLowerCase(); 
  var fontlist =[]; 
  if(locale in goog.ui.editor.DefaultToolbar.I18N_FONTS_) { 
    fontlist = goog.ui.editor.DefaultToolbar.I18N_FONTS_[locale]; 
  } 
  if(fontlist.length) { 
    goog.ui.editor.ToolbarFactory.addFonts(button, fontlist); 
  } 
  goog.ui.editor.ToolbarFactory.addFonts(button, goog.ui.editor.DefaultToolbar.FONTS_); 
}; 
goog.ui.editor.DefaultToolbar.MSG_FONT_SIZE_SMALL = goog.getMsg('Small'); 
goog.ui.editor.DefaultToolbar.MSG_FONT_SIZE_NORMAL = goog.getMsg('Normal'); 
goog.ui.editor.DefaultToolbar.MSG_FONT_SIZE_LARGE = goog.getMsg('Large'); 
goog.ui.editor.DefaultToolbar.MSG_FONT_SIZE_HUGE = goog.getMsg('Huge'); 
goog.ui.editor.DefaultToolbar.FONT_SIZES_ =[{ 
  caption: goog.ui.editor.DefaultToolbar.MSG_FONT_SIZE_SMALL, 
  value: 1 
}, { 
  caption: goog.ui.editor.DefaultToolbar.MSG_FONT_SIZE_NORMAL, 
  value: 2 
}, { 
  caption: goog.ui.editor.DefaultToolbar.MSG_FONT_SIZE_LARGE, 
  value: 4 
}, { 
  caption: goog.ui.editor.DefaultToolbar.MSG_FONT_SIZE_HUGE, 
  value: 6 
}]; 
goog.ui.editor.DefaultToolbar.addDefaultFontSizes = function(button) { 
  goog.ui.editor.ToolbarFactory.addFontSizes(button, goog.ui.editor.DefaultToolbar.FONT_SIZES_); 
}; 
goog.ui.editor.DefaultToolbar.MSG_FORMAT_HEADING = goog.getMsg('Heading'); 
goog.ui.editor.DefaultToolbar.MSG_FORMAT_SUBHEADING = goog.getMsg('Subheading'); 
goog.ui.editor.DefaultToolbar.MSG_FORMAT_MINOR_HEADING = goog.getMsg('Minor heading'); 
goog.ui.editor.DefaultToolbar.MSG_FORMAT_NORMAL = goog.getMsg('Normal'); 
goog.ui.editor.DefaultToolbar.FORMAT_OPTIONS_ =[{ 
  caption: goog.ui.editor.DefaultToolbar.MSG_FORMAT_HEADING, 
  command: goog.dom.TagName.H2 
}, { 
  caption: goog.ui.editor.DefaultToolbar.MSG_FORMAT_SUBHEADING, 
  command: goog.dom.TagName.H3 
}, { 
  caption: goog.ui.editor.DefaultToolbar.MSG_FORMAT_MINOR_HEADING, 
  command: goog.dom.TagName.H4 
}, { 
  caption: goog.ui.editor.DefaultToolbar.MSG_FORMAT_NORMAL, 
  command: goog.dom.TagName.P 
}]; 
goog.ui.editor.DefaultToolbar.addDefaultFormatOptions = function(button) { 
  goog.ui.editor.ToolbarFactory.addFormatOptions(button, goog.ui.editor.DefaultToolbar.FORMAT_OPTIONS_); 
}; 
goog.ui.editor.DefaultToolbar.makeDefaultToolbar = function(elem, opt_isRightToLeft) { 
  var isRightToLeft = opt_isRightToLeft || goog.style.isRightToLeft(elem); 
  var buttons = isRightToLeft ? goog.ui.editor.DefaultToolbar.DEFAULT_BUTTONS_RTL: goog.ui.editor.DefaultToolbar.DEFAULT_BUTTONS; 
  return goog.ui.editor.DefaultToolbar.makeToolbar(buttons, elem, opt_isRightToLeft); 
}; 
goog.ui.editor.DefaultToolbar.makeToolbar = function(items, elem, opt_isRightToLeft) { 
  var domHelper = goog.dom.getDomHelper(elem); 
  var controls =[]; 
  for(var i = 0, button; button = items[i]; i ++) { 
    if(goog.isString(button)) { 
      button = goog.ui.editor.DefaultToolbar.makeBuiltInToolbarButton(button, domHelper); 
    } 
    if(button) { 
      controls.push(button); 
    } 
  } 
  return goog.ui.editor.ToolbarFactory.makeToolbar(controls, elem, opt_isRightToLeft); 
}; 
goog.ui.editor.DefaultToolbar.makeBuiltInToolbarButton = function(command, opt_domHelper) { 
  var button; 
  var descriptor = goog.ui.editor.DefaultToolbar.buttons_[command]; 
  if(descriptor) { 
    var factory = descriptor.factory || goog.ui.editor.ToolbarFactory.makeToggleButton; 
    var id = descriptor.command; 
    var tooltip = descriptor.tooltip; 
    var caption = descriptor.caption; 
    var classNames = descriptor.classes; 
    var domHelper = opt_domHelper || goog.dom.getDomHelper(); 
    button = factory(id, tooltip, caption, classNames, null, domHelper); 
    if(descriptor.queryable) { 
      button.queryable = true; 
    } 
  } 
  return button; 
}; 
goog.ui.editor.DefaultToolbar.DEFAULT_BUTTONS =[goog.editor.Command.IMAGE, goog.editor.Command.LINK, goog.editor.Command.BOLD, goog.editor.Command.ITALIC, goog.editor.Command.UNORDERED_LIST, goog.editor.Command.FONT_COLOR, goog.editor.Command.FONT_FACE, goog.editor.Command.FONT_SIZE, goog.editor.Command.JUSTIFY_LEFT, goog.editor.Command.JUSTIFY_CENTER, goog.editor.Command.JUSTIFY_RIGHT, goog.editor.Command.EDIT_HTML]; 
goog.ui.editor.DefaultToolbar.DEFAULT_BUTTONS_RTL =[goog.editor.Command.IMAGE, goog.editor.Command.LINK, goog.editor.Command.BOLD, goog.editor.Command.ITALIC, goog.editor.Command.UNORDERED_LIST, goog.editor.Command.FONT_COLOR, goog.editor.Command.FONT_FACE, goog.editor.Command.FONT_SIZE, goog.editor.Command.JUSTIFY_RIGHT, goog.editor.Command.JUSTIFY_CENTER, goog.editor.Command.JUSTIFY_LEFT, goog.editor.Command.DIR_RTL, goog.editor.Command.DIR_LTR, goog.editor.Command.EDIT_HTML]; 
goog.ui.editor.DefaultToolbar.rtlButtonFactory_ = function(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper) { 
  var button = goog.ui.editor.ToolbarFactory.makeToggleButton(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper); 
  button.updateFromValue = function(value) { 
    var isRtl = ! ! value; 
    goog.dom.classes.enable(button.getParent().getElement(), goog.getCssName('tr-rtl-mode'), isRtl); 
    button.setChecked(isRtl); 
  }; 
  return button; 
}; 
goog.ui.editor.DefaultToolbar.undoRedoButtonFactory_ = function(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper) { 
  var button = goog.ui.editor.ToolbarFactory.makeButton(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper); 
  button.updateFromValue = function(value) { 
    button.setEnabled(value); 
  }; 
  return button; 
}; 
goog.ui.editor.DefaultToolbar.fontFaceFactory_ = function(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper) { 
  var button = goog.ui.editor.ToolbarFactory.makeSelectButton(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper); 
  goog.ui.editor.DefaultToolbar.addDefaultFonts(button); 
  button.setDefaultCaption(goog.ui.editor.DefaultToolbar.MSG_FONT_NORMAL); 
  goog.dom.classes.add(button.getMenu().getContentElement(), goog.getCssName('goog-menu-noaccel')); 
  button.updateFromValue = function(value) { 
    var item = null; 
    if(value && value.length > 0) { 
      item =(button.getMenu().getChild(goog.ui.editor.ToolbarFactory.getPrimaryFont(value))); 
    } 
    var selectedItem = button.getSelectedItem(); 
    if(item != selectedItem) { 
      button.setSelectedItem(item); 
    } 
  }; 
  return button; 
}; 
goog.ui.editor.DefaultToolbar.fontSizeFactory_ = function(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper) { 
  var button = goog.ui.editor.ToolbarFactory.makeSelectButton(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper); 
  goog.ui.editor.DefaultToolbar.addDefaultFontSizes(button); 
  button.setDefaultCaption(goog.ui.editor.DefaultToolbar.MSG_FONT_SIZE_NORMAL); 
  goog.dom.classes.add(button.getMenu().getContentElement(), goog.getCssName('goog-menu-noaccel')); 
  button.updateFromValue = function(value) { 
    if(goog.isString(value) && goog.style.getLengthUnits(value) == 'px') { 
      value = goog.ui.editor.ToolbarFactory.getLegacySizeFromPx(parseInt(value, 10)); 
    } 
    value = value > 0 ? value: null; 
    if(value != button.getValue()) { 
      button.setValue(value); 
    } 
  }; 
  return button; 
}; 
goog.ui.editor.DefaultToolbar.colorUpdateFromValue_ = function(button, value) { 
  try { 
    if(goog.userAgent.IE) { 
      var hex = '000000' + value.toString(16); 
      var bgr = hex.substr(hex.length - 6, 6); 
      value = new goog.string.StringBuffer('#', bgr.substring(4, 6), bgr.substring(2, 4), bgr.substring(0, 2)).toString(); 
    } 
    if(value != button.getValue()) { 
      button.setValue((value)); 
    } 
  } catch(ex) { } 
}; 
goog.ui.editor.DefaultToolbar.fontColorFactory_ = function(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper) { 
  var button = goog.ui.editor.ToolbarFactory.makeColorMenuButton(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper); 
  button.setSelectedColor('#000'); 
  button.updateFromValue = goog.partial(goog.ui.editor.DefaultToolbar.colorUpdateFromValue_, button); 
  return button; 
}; 
goog.ui.editor.DefaultToolbar.backgroundColorFactory_ = function(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper) { 
  var button = goog.ui.editor.ToolbarFactory.makeColorMenuButton(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper); 
  button.setSelectedColor('#FFF'); 
  button.updateFromValue = goog.partial(goog.ui.editor.DefaultToolbar.colorUpdateFromValue_, button); 
  return button; 
}; 
goog.ui.editor.DefaultToolbar.formatBlockFactory_ = function(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper) { 
  var button = goog.ui.editor.ToolbarFactory.makeSelectButton(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper); 
  goog.ui.editor.DefaultToolbar.addDefaultFormatOptions(button); 
  button.setDefaultCaption(goog.ui.editor.DefaultToolbar.MSG_FORMAT_NORMAL); 
  goog.dom.classes.add(button.getMenu().getContentElement(), goog.getCssName('goog-menu-noaccel')); 
  button.updateFromValue = function(value) { 
    value = value && value.length > 0 ? value: null; 
    if(value != button.getValue()) { 
      button.setValue(value); 
    } 
  }; 
  return button; 
}; 
goog.ui.editor.DefaultToolbar.MSG_FORMAT_BLOCK_TITLE = goog.getMsg('Format'); 
goog.ui.editor.DefaultToolbar.MSG_FORMAT_BLOCK_CAPTION = goog.getMsg('Format'); 
goog.ui.editor.DefaultToolbar.MSG_UNDO_TITLE = goog.getMsg('Undo'); 
goog.ui.editor.DefaultToolbar.MSG_REDO_TITLE = goog.getMsg('Redo'); 
goog.ui.editor.DefaultToolbar.MSG_FONT_FACE_TITLE = goog.getMsg('Font'); 
goog.ui.editor.DefaultToolbar.MSG_FONT_SIZE_TITLE = goog.getMsg('Font size'); 
goog.ui.editor.DefaultToolbar.MSG_FONT_COLOR_TITLE = goog.getMsg('Text color'); 
goog.ui.editor.DefaultToolbar.MSG_BOLD_TITLE = goog.getMsg('Bold'); 
goog.ui.editor.DefaultToolbar.MSG_ITALIC_TITLE = goog.getMsg('Italic'); 
goog.ui.editor.DefaultToolbar.MSG_UNDERLINE_TITLE = goog.getMsg('Underline'); 
goog.ui.editor.DefaultToolbar.MSG_BACKGROUND_COLOR_TITLE = goog.getMsg('Text background color'); 
goog.ui.editor.DefaultToolbar.MSG_LINK_TITLE = goog.getMsg('Add or remove link'); 
goog.ui.editor.DefaultToolbar.MSG_ORDERED_LIST_TITLE = goog.getMsg('Numbered list'); 
goog.ui.editor.DefaultToolbar.MSG_UNORDERED_LIST_TITLE = goog.getMsg('Bullet list'); 
goog.ui.editor.DefaultToolbar.MSG_OUTDENT_TITLE = goog.getMsg('Decrease indent'); 
goog.ui.editor.DefaultToolbar.MSG_INDENT_TITLE = goog.getMsg('Increase indent'); 
goog.ui.editor.DefaultToolbar.MSG_ALIGN_LEFT_TITLE = goog.getMsg('Align left'); 
goog.ui.editor.DefaultToolbar.MSG_ALIGN_CENTER_TITLE = goog.getMsg('Align center'); 
goog.ui.editor.DefaultToolbar.MSG_ALIGN_RIGHT_TITLE = goog.getMsg('Align right'); 
goog.ui.editor.DefaultToolbar.MSG_JUSTIFY_TITLE = goog.getMsg('Justify'); 
goog.ui.editor.DefaultToolbar.MSG_REMOVE_FORMAT_TITLE = goog.getMsg('Remove formatting'); 
goog.ui.editor.DefaultToolbar.MSG_IMAGE_TITLE = goog.getMsg('Insert image'); 
goog.ui.editor.DefaultToolbar.MSG_STRIKE_THROUGH_TITLE = goog.getMsg('Strikethrough'); 
goog.ui.editor.DefaultToolbar.MSG_DIR_LTR_TITLE = goog.getMsg('Left-to-right'); 
goog.ui.editor.DefaultToolbar.MSG_DIR_RTL_TITLE = goog.getMsg('Right-to-left'); 
goog.ui.editor.DefaultToolbar.MSG_BLOCKQUOTE_TITLE = goog.getMsg('Quote'); 
goog.ui.editor.DefaultToolbar.MSG_EDIT_HTML_TITLE = goog.getMsg('Edit HTML source'); 
goog.ui.editor.DefaultToolbar.MSG_SUBSCRIPT = goog.getMsg('Subscript'); 
goog.ui.editor.DefaultToolbar.MSG_SUPERSCRIPT = goog.getMsg('Superscript'); 
goog.ui.editor.DefaultToolbar.MSG_EDIT_HTML_CAPTION = goog.getMsg('Edit HTML'); 
goog.ui.editor.DefaultToolbar.buttons_ = { }; 
goog.ui.editor.ButtonDescriptor; 
goog.ui.editor.DefaultToolbar.BUTTONS_ =[{ 
  command: goog.editor.Command.UNDO, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_UNDO_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-undo'), 
  factory: goog.ui.editor.DefaultToolbar.undoRedoButtonFactory_, 
  queryable: true 
}, { 
  command: goog.editor.Command.REDO, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_REDO_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-redo'), 
  factory: goog.ui.editor.DefaultToolbar.undoRedoButtonFactory_, 
  queryable: true 
}, { 
  command: goog.editor.Command.FONT_FACE, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_FONT_FACE_TITLE, 
  classes: goog.getCssName('tr-fontName'), 
  factory: goog.ui.editor.DefaultToolbar.fontFaceFactory_, 
  queryable: true 
}, { 
  command: goog.editor.Command.FONT_SIZE, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_FONT_SIZE_TITLE, 
  classes: goog.getCssName('tr-fontSize'), 
  factory: goog.ui.editor.DefaultToolbar.fontSizeFactory_, 
  queryable: true 
}, { 
  command: goog.editor.Command.BOLD, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_BOLD_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-bold'), 
  queryable: true 
}, { 
  command: goog.editor.Command.ITALIC, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_ITALIC_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-italic'), 
  queryable: true 
}, { 
  command: goog.editor.Command.UNDERLINE, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_UNDERLINE_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-underline'), 
  queryable: true 
}, { 
  command: goog.editor.Command.FONT_COLOR, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_FONT_COLOR_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-foreColor'), 
  factory: goog.ui.editor.DefaultToolbar.fontColorFactory_, 
  queryable: true 
}, { 
  command: goog.editor.Command.BACKGROUND_COLOR, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_BACKGROUND_COLOR_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-backColor'), 
  factory: goog.ui.editor.DefaultToolbar.backgroundColorFactory_, 
  queryable: true 
}, { 
  command: goog.editor.Command.LINK, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_LINK_TITLE, 
  caption: goog.ui.editor.messages.MSG_LINK_CAPTION, 
  classes: goog.getCssName('tr-link'), 
  queryable: true 
}, { 
  command: goog.editor.Command.ORDERED_LIST, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_ORDERED_LIST_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-insertOrderedList'), 
  queryable: true 
}, { 
  command: goog.editor.Command.UNORDERED_LIST, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_UNORDERED_LIST_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-insertUnorderedList'), 
  queryable: true 
}, { 
  command: goog.editor.Command.OUTDENT, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_OUTDENT_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-outdent'), 
  factory: goog.ui.editor.ToolbarFactory.makeButton 
}, { 
  command: goog.editor.Command.INDENT, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_INDENT_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-indent'), 
  factory: goog.ui.editor.ToolbarFactory.makeButton 
}, { 
  command: goog.editor.Command.JUSTIFY_LEFT, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_ALIGN_LEFT_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-justifyLeft'), 
  queryable: true 
}, { 
  command: goog.editor.Command.JUSTIFY_CENTER, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_ALIGN_CENTER_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-justifyCenter'), 
  queryable: true 
}, { 
  command: goog.editor.Command.JUSTIFY_RIGHT, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_ALIGN_RIGHT_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-justifyRight'), 
  queryable: true 
}, { 
  command: goog.editor.Command.JUSTIFY_FULL, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_JUSTIFY_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-justifyFull'), 
  queryable: true 
}, { 
  command: goog.editor.Command.REMOVE_FORMAT, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_REMOVE_FORMAT_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-removeFormat'), 
  factory: goog.ui.editor.ToolbarFactory.makeButton 
}, { 
  command: goog.editor.Command.IMAGE, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_IMAGE_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-image'), 
  factory: goog.ui.editor.ToolbarFactory.makeButton 
}, { 
  command: goog.editor.Command.STRIKE_THROUGH, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_STRIKE_THROUGH_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-strikeThrough'), 
  queryable: true 
}, { 
  command: goog.editor.Command.SUBSCRIPT, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_SUBSCRIPT, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-subscript'), 
  queryable: true 
}, { 
  command: goog.editor.Command.SUPERSCRIPT, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_SUPERSCRIPT, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-superscript'), 
  queryable: true 
}, { 
  command: goog.editor.Command.DIR_LTR, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_DIR_LTR_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-ltr'), 
  queryable: true 
}, { 
  command: goog.editor.Command.DIR_RTL, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_DIR_RTL_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-rtl'), 
  factory: goog.ui.editor.DefaultToolbar.rtlButtonFactory_, 
  queryable: true 
}, { 
  command: goog.editor.Command.BLOCKQUOTE, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_BLOCKQUOTE_TITLE, 
  classes: goog.getCssName('tr-icon') + ' ' + goog.getCssName('tr-BLOCKQUOTE'), 
  queryable: true 
}, { 
  command: goog.editor.Command.FORMAT_BLOCK, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_FORMAT_BLOCK_TITLE, 
  caption: goog.ui.editor.DefaultToolbar.MSG_FORMAT_BLOCK_CAPTION, 
  classes: goog.getCssName('tr-formatBlock'), 
  factory: goog.ui.editor.DefaultToolbar.formatBlockFactory_, 
  queryable: true 
}, { 
  command: goog.editor.Command.EDIT_HTML, 
  tooltip: goog.ui.editor.DefaultToolbar.MSG_EDIT_HTML_TITLE, 
  caption: goog.ui.editor.DefaultToolbar.MSG_EDIT_HTML_CAPTION, 
  classes: goog.getCssName('tr-editHtml'), 
  factory: goog.ui.editor.ToolbarFactory.makeButton 
}]; 
(function() { 
  for(var i = 0, button; button = goog.ui.editor.DefaultToolbar.BUTTONS_[i]; i ++) { 
    goog.ui.editor.DefaultToolbar.buttons_[button.command]= button; 
  } 
  delete goog.ui.editor.DefaultToolbar.BUTTONS_; 
})(); 
