
goog.provide('goog.tweak.EntriesPanel'); 
goog.provide('goog.tweak.TweakUi'); 
goog.require('goog.array'); 
goog.require('goog.asserts'); 
goog.require('goog.dom.DomHelper'); 
goog.require('goog.object'); 
goog.require('goog.style'); 
goog.require('goog.tweak'); 
goog.require('goog.ui.Zippy'); 
goog.require('goog.userAgent'); 
goog.tweak.TweakUi = function(registry, opt_domHelper) { 
  this.registry_ = registry; 
  this.entriesPanel_; 
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper(); 
  registry.addOnRegisterListener(goog.bind(this.onNewRegisteredEntry_, this)); 
}; 
goog.tweak.TweakUi.ROOT_PANEL_CLASS_ = goog.getCssName('goog-tweak-root'); 
goog.tweak.TweakUi.ENTRY_CSS_CLASS_ = goog.getCssName('goog-tweak-entry'); 
goog.tweak.TweakUi.ENTRY_CSS_CLASSES_ = goog.tweak.TweakUi.ENTRY_CSS_CLASS_ + ' ' + goog.getCssName('goog-inline-block'); 
goog.tweak.TweakUi.ENTRY_GROUP_CSS_CLASSES_ = goog.tweak.TweakUi.ENTRY_CSS_CLASS_; 
goog.tweak.TweakUi.STYLE_SHEET_INSTALLED_MARKER_ = '__closure_tweak_installed_'; 
goog.tweak.TweakUi.CSS_STYLES_ =(function() { 
  var MOBILE = goog.userAgent.MOBILE; 
  var IE = goog.userAgent.IE; 
  var ENTRY_CLASS = '.' + goog.tweak.TweakUi.ENTRY_CSS_CLASS_; 
  var ROOT_PANEL_CLASS = '.' + goog.tweak.TweakUi.ROOT_PANEL_CLASS_; 
  var GOOG_INLINE_BLOCK_CLASS = '.' + goog.getCssName('goog-inline-block'); 
  var ret = ROOT_PANEL_CLASS + '{background:#ffc; padding:0 4px}'; 
  if(! IE) { 
    ret += GOOG_INLINE_BLOCK_CLASS + '{display:inline-block}'; 
  } 
  if(MOBILE) { 
    ret += ROOT_PANEL_CLASS + ',' + ROOT_PANEL_CLASS + ' fieldset{' + 'line-height:2em;' + '}'; 
  } 
  return ret; 
})(); 
goog.tweak.TweakUi.create = function(opt_domHelper) { 
  var registry = goog.tweak.getRegistry(); 
  if(registry) { 
    var ui = new goog.tweak.TweakUi(registry, opt_domHelper); 
    ui.render(); 
    return ui.getRootElement(); 
  } 
}; 
goog.tweak.TweakUi.createCollapsible = function(opt_domHelper) { 
  var registry = goog.tweak.getRegistry(); 
  if(registry) { 
    try { 
      throw undefined; 
    } catch(lazyCreate) { 
      var dh = opt_domHelper || goog.dom.getDomHelper(); 
      var showLink = dh.createDom('a', { href: 'javascript:;' }, 'Show Tweaks'); 
      var hideLink = dh.createDom('a', { href: 'javascript:;' }, 'Hide Tweaks'); 
      var ret = dh.createDom('div', null, showLink); 
      (lazyCreate = function lazyCreate() { 
        var ui = new goog.tweak.TweakUi((registry), dh); 
        ui.render(); 
        hideLink.style.marginRight = '10px'; 
        var tweakElem = ui.getRootElement(); 
        tweakElem.insertBefore(hideLink, tweakElem.firstChild); 
        ret.appendChild(tweakElem); 
        return tweakElem; 
      }); 
      new goog.ui.Zippy(showLink, lazyCreate, false, hideLink); 
      return ret; 
    } 
  } 
}; 
goog.tweak.TweakUi.entryCompare_ = function(a, b) { 
  return(goog.array.defaultCompare(a instanceof goog.tweak.NamespaceEntry_, b instanceof goog.tweak.NamespaceEntry_) || goog.array.defaultCompare(a instanceof goog.tweak.BooleanGroup, b instanceof goog.tweak.BooleanGroup) || goog.array.defaultCompare(a instanceof goog.tweak.ButtonAction, b instanceof goog.tweak.ButtonAction) || goog.array.defaultCompare(a.label, b.label) || goog.array.defaultCompare(a.getId(), b.getId())); 
}; 
goog.tweak.TweakUi.isGroupEntry_ = function(entry) { 
  return entry instanceof goog.tweak.NamespaceEntry_ || entry instanceof goog.tweak.BooleanGroup; 
}; 
goog.tweak.TweakUi.extractBooleanGroupEntries_ = function(group) { 
  var ret = goog.object.getValues(group.getChildEntries()); 
  ret.sort(goog.tweak.TweakUi.entryCompare_); 
  return ret; 
}; 
goog.tweak.TweakUi.extractNamespace_ = function(entry) { 
  var namespaceMatch = /.+(?=\.)/.exec(entry.getId()); 
  return namespaceMatch ? namespaceMatch[0]: ''; 
}; 
goog.tweak.TweakUi.getNamespacedLabel_ = function(entry) { 
  var label = entry.label; 
  if(label == entry.getId()) { 
    label = label.substr(label.lastIndexOf('.') + 1); 
  } 
  return label; 
}; 
goog.tweak.TweakUi.prototype.getRootElement = function() { 
  goog.asserts.assert(this.entriesPanel_, 'TweakUi.getRootElement called before render().'); 
  return this.entriesPanel_.getRootElement(); 
}; 
goog.tweak.TweakUi.prototype.restartWithAppliedTweaks_ = function() { 
  var queryString = this.registry_.makeUrlQuery(); 
  var wnd = this.domHelper_.getWindow(); 
  if(queryString != wnd.location.search) { 
    wnd.location.search = queryString; 
  } else { 
    wnd.location.reload(); 
  } 
}; 
goog.tweak.TweakUi.prototype.installStyles_ = function() { 
  var doc = this.domHelper_.getDocument(); 
  if(!(goog.tweak.TweakUi.STYLE_SHEET_INSTALLED_MARKER_ in doc)) { 
    goog.style.installStyles(goog.tweak.TweakUi.CSS_STYLES_, doc); 
    doc[goog.tweak.TweakUi.STYLE_SHEET_INSTALLED_MARKER_]= true; 
  } 
}; 
goog.tweak.TweakUi.prototype.render = function() { 
  this.installStyles_(); 
  var dh = this.domHelper_; 
  var submitButton = dh.createDom('button', { style: 'font-weight:bold' }, 'Apply Tweaks'); 
  submitButton.onclick = goog.bind(this.restartWithAppliedTweaks_, this); 
  var rootPanel = new goog.tweak.EntriesPanel([], dh); 
  var rootPanelDiv = rootPanel.render(submitButton); 
  rootPanelDiv.className += ' ' + goog.tweak.TweakUi.ROOT_PANEL_CLASS_; 
  this.entriesPanel_ = rootPanel; 
  var entries = this.registry_.extractEntries(true, false); 
  for(var i = 0, entry; entry = entries[i]; i ++) { 
    this.insertEntry_(entry); 
  } 
  return rootPanelDiv; 
}; 
goog.tweak.TweakUi.prototype.onNewRegisteredEntry_ = function(entry) { 
  if(this.entriesPanel_) { 
    this.insertEntry_(entry); 
  } 
}; 
goog.tweak.TweakUi.prototype.insertEntry_ = function(entry) { 
  var panel = this.entriesPanel_; 
  var namespace = goog.tweak.TweakUi.extractNamespace_(entry); 
  if(namespace) { 
    var namespaceEntryId = goog.tweak.NamespaceEntry_.ID_PREFIX + namespace; 
    var nsPanel = panel.childPanels[namespaceEntryId]; 
    if(nsPanel) { 
      panel = nsPanel; 
    } else { 
      entry = new goog.tweak.NamespaceEntry_(namespace,[entry]); 
    } 
  } 
  if(entry instanceof goog.tweak.BooleanInGroupSetting) { 
    var group = entry.getGroup(); 
    panel = panel.childPanels[group.getId()]; 
  } 
  goog.asserts.assert(panel, 'Missing panel for entry %s', entry.getId()); 
  panel.insertEntry(entry); 
}; 
goog.tweak.EntriesPanel = function(entries, opt_domHelper) { 
  this.entries_ = entries; 
  var self = this; 
  this.boundHelpOnClickHandler_ = function() { 
    self.onHelpClick_(this.parentNode); 
  }; 
  this.rootElem_; 
  this.mainPanel_; 
  this.showAllDescriptionsState_; 
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper(); 
  this.childPanels = { }; 
}; 
goog.tweak.EntriesPanel.prototype.getRootElement = function() { 
  goog.asserts.assert(this.rootElem_, 'EntriesPanel.getRootElement called before render().'); 
  return(this.rootElem_); 
}; 
goog.tweak.EntriesPanel.prototype.render = function(opt_endElement) { 
  var dh = this.domHelper_; 
  var entries = this.entries_; 
  var ret = dh.createDom('div'); 
  var showAllDescriptionsLink = dh.createDom('a', { 
    href: 'javascript:;', 
    onclick: goog.bind(this.toggleAllDescriptions, this) 
  }, 'Toggle all Descriptions'); 
  ret.appendChild(showAllDescriptionsLink); 
  var mainPanel = dh.createElement('div'); 
  this.mainPanel_ = mainPanel; 
  for(var i = 0, entry; entry = entries[i]; i ++) { 
    mainPanel.appendChild(this.createEntryElem_(entry)); 
  } 
  if(opt_endElement) { 
    mainPanel.appendChild(opt_endElement); 
  } 
  ret.appendChild(mainPanel); 
  this.rootElem_ = ret; 
  return(ret); 
}; 
goog.tweak.EntriesPanel.prototype.insertEntry = function(entry) { 
  var insertIndex = - goog.array.binarySearch(this.entries_, entry, goog.tweak.TweakUi.entryCompare_) - 1; 
  goog.asserts.assert(insertIndex >= 0, 'insertEntry failed for %s', entry.getId()); 
  goog.array.insertAt(this.entries_, entry, insertIndex); 
  this.mainPanel_.insertBefore(this.createEntryElem_(entry), this.mainPanel_.childNodes[insertIndex]|| null); 
}; 
goog.tweak.EntriesPanel.prototype.createEntryElem_ = function(entry) { 
  var dh = this.domHelper_; 
  var isGroupEntry = goog.tweak.TweakUi.isGroupEntry_(entry); 
  var classes = isGroupEntry ? goog.tweak.TweakUi.ENTRY_GROUP_CSS_CLASSES_: goog.tweak.TweakUi.ENTRY_CSS_CLASSES_; 
  var containerNodeName = isGroupEntry ? 'span': 'label'; 
  var ret = dh.createDom('div', classes, dh.createDom(containerNodeName, { 
    title: entry.description, 
    style: 'color:' +(entry.isRestartRequired() ? '': 'blue') 
  }, this.createTweakEntryDom_(entry)), this.createHelpElem_(entry)); 
  return ret; 
}; 
goog.tweak.EntriesPanel.prototype.onHelpClick_ = function(entryDiv) { 
  this.showDescription_(entryDiv, ! entryDiv.style.display); 
}; 
goog.tweak.EntriesPanel.prototype.showDescription_ = function(entryDiv, show) { 
  var descriptionElem = entryDiv.lastChild.lastChild; 
  goog.style.showElement((descriptionElem), show); 
  entryDiv.style.display = show ? 'block': ''; 
}; 
goog.tweak.EntriesPanel.prototype.createHelpElem_ = function(entry) { 
  var ret = this.domHelper_.createElement('span'); 
  ret.innerHTML = '<b style="padding:0 1em 0 .5em">?</b>' + '<span style="display:none;color:#666"></span>'; 
  ret.onclick = this.boundHelpOnClickHandler_; 
  var descriptionElem = ret.lastChild; 
  goog.dom.setTextContent((descriptionElem), entry.description); 
  if(! entry.isRestartRequired()) { 
    descriptionElem.innerHTML += ' <span style="color:blue">(no restart required)</span>'; 
  } 
  return ret; 
}; 
goog.tweak.EntriesPanel.prototype.toggleAllDescriptions = function() { 
  var show = ! this.showAllDescriptionsState_; 
  this.showAllDescriptionsState_ = show; 
  var entryDivs = this.domHelper_.getElementsByTagNameAndClass('div', goog.tweak.TweakUi.ENTRY_CSS_CLASS_, this.rootElem_); 
  for(var i = 0, div; div = entryDivs[i]; i ++) { 
    this.showDescription_(div, show); 
  } 
}; 
goog.tweak.EntriesPanel.prototype.createComboBoxDom_ = function(tweak, label, onchangeFunc) { 
  var dh = this.domHelper_; 
  var ret = dh.getDocument().createDocumentFragment(); 
  ret.appendChild(dh.createTextNode(label + ': ')); 
  var selectElem = dh.createElement('select'); 
  var values = tweak.getValidValues(); 
  for(var i = 0, il = values.length; i < il; ++ i) { 
    var optionElem = dh.createElement('option'); 
    optionElem.text = String(values[i]); 
    optionElem.value = String(values[i]); 
    selectElem.appendChild(optionElem); 
  } 
  ret.appendChild(selectElem); 
  selectElem.value = tweak.getNewValue(); 
  selectElem.onchange = onchangeFunc; 
  tweak.addCallback(function() { 
    selectElem.value = tweak.getNewValue(); 
  }); 
  return ret; 
}; 
goog.tweak.EntriesPanel.prototype.createBooleanSettingDom_ = function(tweak, label) { 
  var dh = this.domHelper_; 
  var ret = dh.getDocument().createDocumentFragment(); 
  var checkbox = dh.createDom('input', { type: 'checkbox' }); 
  ret.appendChild(checkbox); 
  ret.appendChild(dh.createTextNode(label)); 
  checkbox.defaultChecked = tweak.getNewValue(); 
  checkbox.checked = tweak.getNewValue(); 
  checkbox.onchange = function() { 
    tweak.setValue(checkbox.checked); 
  }; 
  tweak.addCallback(function() { 
    checkbox.checked = tweak.getNewValue(); 
  }); 
  return ret; 
}; 
goog.tweak.EntriesPanel.prototype.createSubPanelDom_ = function(entry, label, childEntries) { 
  var dh = this.domHelper_; 
  var toggleLink = dh.createDom('a', { href: 'javascript:;' }, label + ' \xBB'); 
  var toggleLink2 = dh.createDom('a', { href: 'javascript:;' }, '\xAB ' + label); 
  toggleLink2.style.marginRight = '10px'; 
  var innerUi = new goog.tweak.EntriesPanel(childEntries, dh); 
  this.childPanels[entry.getId()]= innerUi; 
  var elem = innerUi.render(); 
  var descriptionsLink = elem.firstChild; 
  var childrenElem = dh.createDom('fieldset', goog.getCssName('goog-inline-block'), dh.createDom('legend', null, toggleLink2, descriptionsLink), elem); 
  new goog.ui.Zippy(toggleLink, childrenElem, false, toggleLink2); 
  var ret = dh.getDocument().createDocumentFragment(); 
  ret.appendChild(toggleLink); 
  ret.appendChild(childrenElem); 
  return ret; 
}; 
goog.tweak.EntriesPanel.prototype.createTextBoxDom_ = function(tweak, label, onchangeFunc) { 
  var dh = this.domHelper_; 
  var ret = dh.getDocument().createDocumentFragment(); 
  ret.appendChild(dh.createTextNode(label + ': ')); 
  var textBox = dh.createDom('input', { 
    value: tweak.getNewValue(), 
    size: 5, 
    onblur: onchangeFunc 
  }); 
  ret.appendChild(textBox); 
  tweak.addCallback(function() { 
    textBox.value = tweak.getNewValue(); 
  }); 
  return ret; 
}; 
goog.tweak.EntriesPanel.prototype.createButtonActionDom_ = function(tweak, label) { 
  return this.domHelper_.createDom('button', { onclick: goog.bind(tweak.fireCallbacks, tweak) }, label); 
}; 
goog.tweak.EntriesPanel.prototype.createTweakEntryDom_ = function(entry) { 
  var label = goog.tweak.TweakUi.getNamespacedLabel_(entry); 
  if(entry instanceof goog.tweak.BooleanSetting) { 
    return this.createBooleanSettingDom_(entry, label); 
  } else if(entry instanceof goog.tweak.BooleanGroup) { 
    var childEntries = goog.tweak.TweakUi.extractBooleanGroupEntries_(entry); 
    return this.createSubPanelDom_(entry, label, childEntries); 
  } else if(entry instanceof goog.tweak.StringSetting) { 
    var setValueFunc = function() { 
      entry.setValue(this.value); 
    }; 
    return entry.getValidValues() ? this.createComboBoxDom_(entry, label, setValueFunc): this.createTextBoxDom_(entry, label, setValueFunc); 
  } else if(entry instanceof goog.tweak.NumericSetting) { 
    setValueFunc = function() { 
      if(isNaN(this.value)) { 
        this.value = entry.getNewValue(); 
      } else { 
        entry.setValue(+ this.value); 
      } 
    }; 
    return entry.getValidValues() ? this.createComboBoxDom_(entry, label, setValueFunc): this.createTextBoxDom_(entry, label, setValueFunc); 
  } else if(entry instanceof goog.tweak.NamespaceEntry_) { 
    return this.createSubPanelDom_(entry, entry.label, entry.entries); 
  } 
  goog.asserts.assertInstanceof(entry, goog.tweak.ButtonAction, 'invalid entry: %s', entry); 
  return this.createButtonActionDom_((entry), label); 
}; 
goog.tweak.NamespaceEntry_ = function(namespace, entries) { 
  goog.tweak.BaseEntry.call(this, goog.tweak.NamespaceEntry_.ID_PREFIX + namespace, 'Tweaks within the ' + namespace + ' namespace.'); 
  this.entries = entries; 
  this.label = namespace; 
}; 
goog.inherits(goog.tweak.NamespaceEntry_, goog.tweak.BaseEntry); 
goog.tweak.NamespaceEntry_.ID_PREFIX = '!'; 
