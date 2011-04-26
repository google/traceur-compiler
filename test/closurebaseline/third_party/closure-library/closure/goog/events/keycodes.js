
goog.provide('goog.events.KeyCodes'); 
goog.require('goog.userAgent'); 
goog.events.KeyCodes = { 
  MAC_ENTER: 3, 
  BACKSPACE: 8, 
  TAB: 9, 
  NUM_CENTER: 12, 
  ENTER: 13, 
  SHIFT: 16, 
  CTRL: 17, 
  ALT: 18, 
  PAUSE: 19, 
  CAPS_LOCK: 20, 
  ESC: 27, 
  SPACE: 32, 
  PAGE_UP: 33, 
  PAGE_DOWN: 34, 
  END: 35, 
  HOME: 36, 
  LEFT: 37, 
  UP: 38, 
  RIGHT: 39, 
  DOWN: 40, 
  PRINT_SCREEN: 44, 
  INSERT: 45, 
  DELETE: 46, 
  ZERO: 48, 
  ONE: 49, 
  TWO: 50, 
  THREE: 51, 
  FOUR: 52, 
  FIVE: 53, 
  SIX: 54, 
  SEVEN: 55, 
  EIGHT: 56, 
  NINE: 57, 
  QUESTION_MARK: 63, 
  A: 65, 
  B: 66, 
  C: 67, 
  D: 68, 
  E: 69, 
  F: 70, 
  G: 71, 
  H: 72, 
  I: 73, 
  J: 74, 
  K: 75, 
  L: 76, 
  M: 77, 
  N: 78, 
  O: 79, 
  P: 80, 
  Q: 81, 
  R: 82, 
  S: 83, 
  T: 84, 
  U: 85, 
  V: 86, 
  W: 87, 
  X: 88, 
  Y: 89, 
  Z: 90, 
  META: 91, 
  CONTEXT_MENU: 93, 
  NUM_ZERO: 96, 
  NUM_ONE: 97, 
  NUM_TWO: 98, 
  NUM_THREE: 99, 
  NUM_FOUR: 100, 
  NUM_FIVE: 101, 
  NUM_SIX: 102, 
  NUM_SEVEN: 103, 
  NUM_EIGHT: 104, 
  NUM_NINE: 105, 
  NUM_MULTIPLY: 106, 
  NUM_PLUS: 107, 
  NUM_MINUS: 109, 
  NUM_PERIOD: 110, 
  NUM_DIVISION: 111, 
  F1: 112, 
  F2: 113, 
  F3: 114, 
  F4: 115, 
  F5: 116, 
  F6: 117, 
  F7: 118, 
  F8: 119, 
  F9: 120, 
  F10: 121, 
  F11: 122, 
  F12: 123, 
  NUMLOCK: 144, 
  SEMICOLON: 186, 
  DASH: 189, 
  EQUALS: 187, 
  COMMA: 188, 
  PERIOD: 190, 
  SLASH: 191, 
  APOSTROPHE: 192, 
  SINGLE_QUOTE: 222, 
  OPEN_SQUARE_BRACKET: 219, 
  BACKSLASH: 220, 
  CLOSE_SQUARE_BRACKET: 221, 
  WIN_KEY: 224, 
  MAC_FF_META: 224, 
  WIN_IME: 229, 
  PHANTOM: 255 
}; 
goog.events.KeyCodes.isTextModifyingKeyEvent = function(e) { 
  if(e.altKey && ! e.ctrlKey || e.metaKey || e.keyCode >= goog.events.KeyCodes.F1 && e.keyCode <= goog.events.KeyCodes.F12) { 
    return false; 
  } 
  switch(e.keyCode) { 
    case goog.events.KeyCodes.ALT: 
    case goog.events.KeyCodes.CAPS_LOCK: 
    case goog.events.KeyCodes.CONTEXT_MENU: 
    case goog.events.KeyCodes.CTRL: 
    case goog.events.KeyCodes.DOWN: 
    case goog.events.KeyCodes.END: 
    case goog.events.KeyCodes.ESC: 
    case goog.events.KeyCodes.HOME: 
    case goog.events.KeyCodes.INSERT: 
    case goog.events.KeyCodes.LEFT: 
    case goog.events.KeyCodes.MAC_FF_META: 
    case goog.events.KeyCodes.META: 
    case goog.events.KeyCodes.NUMLOCK: 
    case goog.events.KeyCodes.NUM_CENTER: 
    case goog.events.KeyCodes.PAGE_DOWN: 
    case goog.events.KeyCodes.PAGE_UP: 
    case goog.events.KeyCodes.PAUSE: 
    case goog.events.KeyCodes.PHANTOM: 
    case goog.events.KeyCodes.PRINT_SCREEN: 
    case goog.events.KeyCodes.RIGHT: 
    case goog.events.KeyCodes.SHIFT: 
    case goog.events.KeyCodes.UP: 
    case goog.events.KeyCodes.WIN_KEY: 
      return false; 

    default: 
      return true; 

  } 
}; 
goog.events.KeyCodes.firesKeyPressEvent = function(keyCode, opt_heldKeyCode, opt_shiftKey, opt_ctrlKey, opt_altKey) { 
  if(! goog.userAgent.IE && !(goog.userAgent.WEBKIT && goog.userAgent.isVersion('525'))) { 
    return true; 
  } 
  if(goog.userAgent.MAC && opt_altKey) { 
    return goog.events.KeyCodes.isCharacterKey(keyCode); 
  } 
  if(opt_altKey && ! opt_ctrlKey) { 
    return false; 
  } 
  if(! opt_shiftKey &&(opt_heldKeyCode == goog.events.KeyCodes.CTRL || opt_heldKeyCode == goog.events.KeyCodes.ALT)) { 
    return false; 
  } 
  if(goog.userAgent.IE && opt_ctrlKey && opt_heldKeyCode == keyCode) { 
    return false; 
  } 
  switch(keyCode) { 
    case goog.events.KeyCodes.ENTER: 
      return true; 

    case goog.events.KeyCodes.ESC: 
      return ! goog.userAgent.WEBKIT; 

  } 
  return goog.events.KeyCodes.isCharacterKey(keyCode); 
}; 
goog.events.KeyCodes.isCharacterKey = function(keyCode) { 
  if(keyCode >= goog.events.KeyCodes.ZERO && keyCode <= goog.events.KeyCodes.NINE) { 
    return true; 
  } 
  if(keyCode >= goog.events.KeyCodes.NUM_ZERO && keyCode <= goog.events.KeyCodes.NUM_MULTIPLY) { 
    return true; 
  } 
  if(keyCode >= goog.events.KeyCodes.A && keyCode <= goog.events.KeyCodes.Z) { 
    return true; 
  } 
  if(goog.userAgent.WEBKIT && keyCode == 0) { 
    return true; 
  } 
  switch(keyCode) { 
    case goog.events.KeyCodes.SPACE: 
    case goog.events.KeyCodes.QUESTION_MARK: 
    case goog.events.KeyCodes.NUM_PLUS: 
    case goog.events.KeyCodes.NUM_MINUS: 
    case goog.events.KeyCodes.NUM_PERIOD: 
    case goog.events.KeyCodes.NUM_DIVISION: 
    case goog.events.KeyCodes.SEMICOLON: 
    case goog.events.KeyCodes.DASH: 
    case goog.events.KeyCodes.EQUALS: 
    case goog.events.KeyCodes.COMMA: 
    case goog.events.KeyCodes.PERIOD: 
    case goog.events.KeyCodes.SLASH: 
    case goog.events.KeyCodes.APOSTROPHE: 
    case goog.events.KeyCodes.SINGLE_QUOTE: 
    case goog.events.KeyCodes.OPEN_SQUARE_BRACKET: 
    case goog.events.KeyCodes.BACKSLASH: 
    case goog.events.KeyCodes.CLOSE_SQUARE_BRACKET: 
      return true; 

    default: 
      return false; 

  } 
}; 
