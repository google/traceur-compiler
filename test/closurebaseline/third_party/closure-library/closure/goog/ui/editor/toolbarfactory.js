
goog.provide('goog.ui.editor.ToolbarFactory'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.string'); 
goog.require('goog.string.Unicode'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component.State'); 
goog.require('goog.ui.Container.Orientation'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.Option'); 
goog.require('goog.ui.Toolbar'); 
goog.require('goog.ui.ToolbarButton'); 
goog.require('goog.ui.ToolbarColorMenuButton'); 
goog.require('goog.ui.ToolbarMenuButton'); 
goog.require('goog.ui.ToolbarRenderer'); 
goog.require('goog.ui.ToolbarSelect'); 
goog.require('goog.userAgent'); 
goog.ui.editor.ToolbarFactory.getPrimaryFont = function(fontSpec) { 
  var i = fontSpec.indexOf(','); 
  var fontName =(i != - 1 ? fontSpec.substring(0, i): fontSpec).toLowerCase(); 
  return goog.string.stripQuotes(fontName, '"\''); 
}; 
goog.ui.editor.ToolbarFactory.addFonts = function(button, fonts) { 
  goog.array.forEach(fonts, function(font) { 
    goog.ui.editor.ToolbarFactory.addFont(button, font.caption, font.value); 
  }); 
}; 
goog.ui.editor.ToolbarFactory.addFont = function(button, caption, value) { 
  var id = goog.ui.editor.ToolbarFactory.getPrimaryFont(value); 
  var option = new goog.ui.Option(caption, value, button.dom_); 
  option.setId(id); 
  button.addItem(option); 
  option.getContentElement().style.fontFamily = value; 
}; 
goog.ui.editor.ToolbarFactory.addFontSizes = function(button, sizes) { 
  goog.array.forEach(sizes, function(size) { 
    goog.ui.editor.ToolbarFactory.addFontSize(button, size.caption, size.value); 
  }); 
}; 
goog.ui.editor.ToolbarFactory.addFontSize = function(button, caption, value) { 
  var option = new goog.ui.Option(caption, value, button.dom_); 
  button.addItem(option); 
  var content = option.getContentElement(); 
  content.style.fontSize = goog.ui.editor.ToolbarFactory.getPxFromLegacySize(value) + 'px'; 
  content.firstChild.style.height = '1.1em'; 
}; 
goog.ui.editor.ToolbarFactory.getPxFromLegacySize = function(fontSize) { 
  return goog.ui.editor.ToolbarFactory.LEGACY_SIZE_TO_PX_MAP_[fontSize]|| 10; 
}; 
goog.ui.editor.ToolbarFactory.getLegacySizeFromPx = function(px) { 
  return goog.array.lastIndexOf(goog.ui.editor.ToolbarFactory.LEGACY_SIZE_TO_PX_MAP_, px); 
}; 
goog.ui.editor.ToolbarFactory.LEGACY_SIZE_TO_PX_MAP_ =[10, 10, 13, 16, 18, 24, 32, 48]; 
goog.ui.editor.ToolbarFactory.addFormatOptions = function(button, formats) { 
  goog.array.forEach(formats, function(format) { 
    goog.ui.editor.ToolbarFactory.addFormatOption(button, format.caption, format.command); 
  }); 
}; 
goog.ui.editor.ToolbarFactory.addFormatOption = function(button, caption, tag) { 
  var option = new goog.ui.Option(button.dom_.createDom(goog.dom.TagName.DIV, null, caption), tag, button.dom_); 
  option.setId(tag); 
  button.addItem(option); 
}; 
goog.ui.editor.ToolbarFactory.makeToolbar = function(items, elem, opt_isRightToLeft) { 
  var domHelper = goog.dom.getDomHelper(elem); 
  var toolbar = new goog.ui.Toolbar(goog.ui.ToolbarRenderer.getInstance(), goog.ui.Container.Orientation.HORIZONTAL, domHelper); 
  var isRightToLeft = opt_isRightToLeft || goog.style.isRightToLeft(elem); 
  toolbar.setRightToLeft(isRightToLeft); 
  toolbar.setFocusable(false); 
  for(var i = 0, button; button = items[i]; i ++) { 
    button.setSupportedState(goog.ui.Component.State.FOCUSED, false); 
    button.setRightToLeft(isRightToLeft); 
    toolbar.addChild(button, true); 
  } 
  toolbar.render(elem); 
  return toolbar; 
}; 
goog.ui.editor.ToolbarFactory.makeButton = function(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper) { 
  var button = new goog.ui.ToolbarButton(goog.ui.editor.ToolbarFactory.createContent_(caption, opt_classNames, opt_domHelper), opt_renderer, opt_domHelper); 
  button.setId(id); 
  button.setTooltip(tooltip); 
  return button; 
}; 
goog.ui.editor.ToolbarFactory.makeToggleButton = function(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper) { 
  var button = goog.ui.editor.ToolbarFactory.makeButton(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper); 
  button.setSupportedState(goog.ui.Component.State.CHECKED, true); 
  return button; 
}; 
goog.ui.editor.ToolbarFactory.makeMenuButton = function(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper) { 
  var button = new goog.ui.ToolbarMenuButton(goog.ui.editor.ToolbarFactory.createContent_(caption, opt_classNames, opt_domHelper), null, opt_renderer, opt_domHelper); 
  button.setId(id); 
  button.setTooltip(tooltip); 
  return button; 
}; 
goog.ui.editor.ToolbarFactory.makeSelectButton = function(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper) { 
  var button = new goog.ui.ToolbarSelect(null, null, opt_renderer, opt_domHelper); 
  if(opt_classNames) { 
    goog.array.forEach(opt_classNames.split(/\s+/), button.addClassName, button); 
  } 
  button.addClassName(goog.getCssName('goog-toolbar-select')); 
  button.setDefaultCaption(caption); 
  button.setId(id); 
  button.setTooltip(tooltip); 
  return button; 
}; 
goog.ui.editor.ToolbarFactory.makeColorMenuButton = function(id, tooltip, caption, opt_classNames, opt_renderer, opt_domHelper) { 
  var button = new goog.ui.ToolbarColorMenuButton(goog.ui.editor.ToolbarFactory.createContent_(caption, opt_classNames, opt_domHelper), null, opt_renderer, opt_domHelper); 
  button.setId(id); 
  button.setTooltip(tooltip); 
  return button; 
}; 
goog.ui.editor.ToolbarFactory.createContent_ = function(caption, opt_classNames, opt_domHelper) { 
  if((! caption || caption == '') && goog.userAgent.GECKO && ! goog.userAgent.isVersion('1.9a')) { 
    caption = goog.string.Unicode.NBSP; 
  } 
  return(opt_domHelper || goog.dom.getDomHelper()).createDom(goog.dom.TagName.DIV, opt_classNames ? { 'class': opt_classNames }: null, caption); 
}; 
