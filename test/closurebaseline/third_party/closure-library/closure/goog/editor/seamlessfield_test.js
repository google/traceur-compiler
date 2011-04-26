
goog.provide('goog.editor.seamlessfield_test'); 
goog.require('goog.dom'); 
goog.require('goog.editor.BrowserFeature'); 
goog.require('goog.editor.SeamlessField'); 
goog.require('goog.events'); 
goog.require('goog.style'); 
goog.require('goog.testing.MockClock'); 
goog.require('goog.testing.MockRange'); 
goog.require('goog.testing.jsunit'); 
goog.setTestOnly('seamlessfield_test'); 
var fieldElem; 
var fieldElemClone; 
function setUp() { 
  fieldElem = goog.dom.getElement('field'); 
  fieldElemClone = fieldElem.cloneNode(true); 
} 
function tearDown() { 
  fieldElem.parentNode.replaceChild(fieldElemClone, fieldElem); 
} 
function testBlankField() { 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    assertAttachSeamlessIframeSizesCorrectly(initSeamlessField('&nbsp;', { }), createSeamlessIframe()); 
  } 
} 
function testFieldWithContent() { 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    assertAttachSeamlessIframeSizesCorrectly(initSeamlessField('Hi!', { }), createSeamlessIframe()); 
  } 
} 
function testFieldWithPadding() { 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    assertAttachSeamlessIframeSizesCorrectly(initSeamlessField('Hi!', { 'padding': '2px 5px' }), createSeamlessIframe()); 
  } 
} 
function testFieldWithMargin() { 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    assertAttachSeamlessIframeSizesCorrectly(initSeamlessField('Hi!', { 'margin': '2px 5px' }), createSeamlessIframe()); 
  } 
} 
function testFieldWithBorder() { 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    assertAttachSeamlessIframeSizesCorrectly(initSeamlessField('Hi!', { 'border': '2px 5px' }), createSeamlessIframe()); 
  } 
} 
function testFieldWithOverflow() { 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    assertAttachSeamlessIframeSizesCorrectly(initSeamlessField(['1', '2', '3', '4', '5', '6', '7'].join('<p/>'), { 
      'overflow': 'auto', 
      'position': 'relative', 
      'height': '20px' 
    }), createSeamlessIframe()); 
    assertEquals(20, fieldElem.offsetHeight); 
  } 
} 
function testFieldWithOverflowAndPadding() { 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    var blendedField = initSeamlessField(['1', '2', '3', '4', '5', '6', '7'].join('<p/>'), { 
      'overflow': 'auto', 
      'position': 'relative', 
      'height': '20px', 
      'padding': '2px 3px' 
    }); 
    var blendedIframe = createSeamlessIframe(); 
    assertAttachSeamlessIframeSizesCorrectly(blendedField, blendedIframe); 
    assertEquals(24, fieldElem.offsetHeight); 
  } 
} 
function testIframeHeightGrowsOnWrap() { 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    var clock = new goog.testing.MockClock(true); 
    var blendedField; 
    try { 
      blendedField = initSeamlessField('', { 
        'border': '1px solid black', 
        'height': '20px' 
      }); 
      blendedField.makeEditable(); 
      blendedField.setHtml(false, 'Content that should wrap after resize.'); 
      clock.tick(1); 
      var unwrappedIframeHeight = blendedField.getEditableIframe().offsetHeight; 
      fieldElem.style.width = '200px'; 
      blendedField.doFieldSizingGecko(); 
      var wrappedIframeHeight = blendedField.getEditableIframe().offsetHeight; 
      assertTrue('Wrapped text should cause iframe to grow - initial height: ' + unwrappedIframeHeight + ', wrapped height: ' + wrappedIframeHeight, wrappedIframeHeight > unwrappedIframeHeight); 
    } finally { 
      blendedField.dispose(); 
      clock.dispose(); 
    } 
  } 
} 
function testDispatchBlur() { 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE && ! goog.editor.BrowserFeature.CLEARS_SELECTION_WHEN_FOCUS_LEAVES) { 
    var blendedField = initSeamlessField('Hi!', { 'border': '2px 5px' }); 
    var iframe = createSeamlessIframe(); 
    blendedField.attachIframe(iframe); 
    var blurCalled = false; 
    goog.events.listenOnce(blendedField, goog.editor.Field.EventType.BLUR, function() { 
      blurCalled = true; 
    }); 
    var clearSelection = goog.dom.Range.clearSelection; 
    var cleared = false; 
    var clearedWindow; 
    blendedField.editableDomHelper = new goog.dom.DomHelper(); 
    blendedField.editableDomHelper.getWindow = goog.functions.constant(iframe.contentWindow); 
    var mockRange = new goog.testing.MockRange(); 
    blendedField.getRange = function() { 
      return mockRange; 
    }; 
    goog.dom.Range.clearSelection = function(opt_window) { 
      clearSelection(opt_window); 
      cleared = true; 
      clearedWindow = opt_window; 
    }; 
    var clock = new goog.testing.MockClock(true); 
    mockRange.collapse(true); 
    mockRange.select(); 
    mockRange.$replay(); 
    blendedField.dispatchBlur(); 
    clock.tick(1); 
    assertTrue('Blur must be dispatched.', blurCalled); 
    assertTrue('Selection must be cleared.', cleared); 
    assertEquals('Selection must be cleared in iframe', iframe.contentWindow, clearedWindow); 
    mockRange.$verify(); 
    clock.dispose(); 
  } 
} 
function testSetMinHeight() { 
  if(! goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    var clock = new goog.testing.MockClock(true); 
    try { 
      var field = initSeamlessField(['1', '2', '3', '4', '5', '6', '7'].join('<p/>'), { 
        'position': 'relative', 
        'height': '60px' 
      }); 
      var iframe = createSeamlessIframe(); 
      field.attachIframe(iframe); 
      field.iframeFieldLoadHandler(iframe, '', { }); 
      clock.tick(1000); 
      var normalHeight = goog.style.getSize(iframe).height; 
      var delayedChangeCalled = false; 
      goog.events.listen(field, goog.editor.Field.EventType.DELAYEDCHANGE, function() { 
        delayedChangeCalled = true; 
      }); 
      field.setMinHeight(30); 
      clock.tick(1000); 
      assertEquals('Iframe height must match min height.', 30, goog.style.getSize(iframe).height); 
      assertFalse('Setting min height must not cause delayed change event.', delayedChangeCalled); 
      field.setMinHeight(0); 
      clock.tick(1000); 
      assertEquals(normalHeight, goog.style.getSize(iframe).height); 
      assertFalse('Setting min height must not cause delayed change event.', delayedChangeCalled); 
    } finally { 
      goog.events.removeAll(); 
      field.dispose(); 
      clock.dispose(); 
    } 
  } 
} 
function testSetMinHeightWithNoIframe() { 
  if(goog.editor.BrowserFeature.HAS_CONTENT_EDITABLE) { 
    try { 
      var field = initSeamlessField('&nbsp;', { }); 
      field.makeEditable(); 
      field.setMinHeight(30); 
    } finally { 
      field.dispose(); 
      goog.events.removeAll(); 
    } 
  } 
} 
function testStartChangeEvents() { 
  if(goog.editor.BrowserFeature.USE_MUTATION_EVENTS) { 
    var clock = new goog.testing.MockClock(true); 
    try { 
      var field = initSeamlessField('&nbsp;', { }); 
      field.makeEditable(); 
      var changeCalled = false; 
      goog.events.listenOnce(field, goog.editor.Field.EventType.CHANGE, function() { 
        changeCalled = true; 
      }); 
      var delayedChangeCalled = false; 
      goog.events.listenOnce(field, goog.editor.Field.EventType.CHANGE, function() { 
        delayedChangeCalled = true; 
      }); 
      field.stopChangeEvents(true, true); 
      if(field.changeTimerGecko_) { 
        field.changeTimerGecko_.start(); 
      } 
      field.startChangeEvents(); 
      clock.tick(1000); 
      assertFalse(changeCalled); 
      assertFalse(delayedChangeCalled); 
    } finally { 
      clock.dispose(); 
      field.dispose(); 
    } 
  } 
} 
function testManipulateDom() { 
  var editableField = initSeamlessField('&nbsp;', { }); 
  var clock = new goog.testing.MockClock(true); 
  var delayedChangeCalled = 0; 
  goog.events.listen(editableField, goog.editor.Field.EventType.DELAYEDCHANGE, function() { 
    delayedChangeCalled ++; 
  }); 
  assertFalse(editableField.isLoaded()); 
  editableField.manipulateDom(goog.nullFunction); 
  clock.tick(1000); 
  assertEquals('Must not fire delayed change events if field is not loaded.', 0, delayedChangeCalled); 
  editableField.makeEditable(); 
  var usesIframe = editableField.usesIframe(); 
  try { 
    editableField.manipulateDom(goog.nullFunction); 
    clock.tick(1000); 
    assertEquals('By default must fire a single delayed change event.', 1, delayedChangeCalled); 
    editableField.manipulateDom(goog.nullFunction, true); 
    clock.tick(1000); 
    assertEquals('Must prevent all delayed change events.', 1, delayedChangeCalled); 
    editableField.manipulateDom(function() { 
      this.handleChange(); 
      this.handleChange(); 
      if(this.changeTimerGecko_) { 
        this.changeTimerGecko_.fire(); 
      } 
      this.dispatchDelayedChange_(); 
      this.delayedChangeTimer_.fire(); 
    }, false, editableField); 
    clock.tick(1000); 
    assertEquals('Must ignore dispatch delayed change called within func.', 2, delayedChangeCalled); 
  } finally { 
    editableField.dispose(); 
    clock.dispose(); 
  } 
} 
function testAttachIframe() { 
  var blendedField = initSeamlessField('Hi!', { }); 
  var iframe = createSeamlessIframe(); 
  try { 
    blendedField.attachIframe(iframe); 
  } catch(err) { 
    fail('Error occurred while attaching iframe.'); 
  } 
} 
function createSeamlessIframe() { 
  return goog.dom.createDom('IFRAME', { 
    'frameBorder': '0', 
    'style': 'padding:0;' 
  }); 
} 
function initSeamlessField(innerHTML, styles) { 
  var field = new goog.editor.SeamlessField('field'); 
  fieldElem.innerHTML = innerHTML; 
  goog.style.setStyle(fieldElem, styles); 
  return field; 
} 
function assertAttachSeamlessIframeSizesCorrectly(fieldObj, iframe) { 
  var size = goog.style.getSize(fieldObj.getOriginalElement()); 
  fieldObj.attachIframe(iframe); 
  var newSize = goog.style.getSize(fieldObj.getOriginalElement()); 
  assertEquals(size.width, newSize.width); 
  assertEquals(size.height, newSize.height); 
} 
