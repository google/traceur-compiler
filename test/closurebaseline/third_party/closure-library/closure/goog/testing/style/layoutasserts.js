
goog.provide('goog.testing.style.layoutasserts'); 
goog.require('goog.style'); 
goog.require('goog.testing.asserts'); 
function assertIsVisible(a, opt_b) { 
  _validateArguments(1, arguments); 
  var element = nonCommentArg(1, 1, arguments); 
  _assert(commentArg(1, arguments), goog.testing.style.layoutasserts.isVisible_(element) && goog.testing.style.layoutasserts.hasVisibleDimension_(element), 'Specified element should be visible.'); 
} 
function assertNotVisible(a, opt_b) { 
  _validateArguments(1, arguments); 
  var element = nonCommentArg(1, 1, arguments); 
  if(! element) { 
    return; 
  } 
  _assert(commentArg(1, arguments), ! goog.testing.style.layoutasserts.isVisible_(element) || ! goog.testing.style.layoutasserts.hasVisibleDimension_(element), 'Specified element should not be visible.'); 
} 
function assertIntersect(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var element = nonCommentArg(1, 2, arguments); 
  var otherElement = nonCommentArg(2, 2, arguments); 
  _assert(commentArg(1, arguments), goog.testing.style.layoutasserts.intersects_(element, otherElement), 'Elements should intersect.'); 
} 
function assertNoIntersect(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var element = nonCommentArg(1, 2, arguments); 
  var otherElement = nonCommentArg(2, 2, arguments); 
  _assert(commentArg(1, arguments), ! goog.testing.style.layoutasserts.intersects_(element, otherElement), 'Elements should not intersect.'); 
} 
function assertWidth(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var element = nonCommentArg(1, 2, arguments); 
  var width = nonCommentArg(2, 2, arguments); 
  var size = goog.style.getSize(element); 
  var elementWidth = size.width; 
  _assert(commentArg(1, arguments), goog.testing.style.layoutasserts.isWithinThreshold_(width, elementWidth, 0), 'Element should have width ' + width + ' but was ' + elementWidth + '.'); 
} 
function assertWidthWithinTolerance(a, b, c, opt_d) { 
  _validateArguments(3, arguments); 
  var element = nonCommentArg(1, 3, arguments); 
  var width = nonCommentArg(2, 3, arguments); 
  var tolerance = nonCommentArg(3, 3, arguments); 
  var size = goog.style.getSize(element); 
  var elementWidth = size.width; 
  _assert(commentArg(1, arguments), goog.testing.style.layoutasserts.isWithinThreshold_(width, elementWidth, tolerance), 'Element width(' + elementWidth + ') should be within given width(' + width + ') with tolerance value of ' + tolerance + '.'); 
} 
function assertHeight(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var element = nonCommentArg(1, 2, arguments); 
  var height = nonCommentArg(2, 2, arguments); 
  var size = goog.style.getSize(element); 
  var elementHeight = size.height; 
  _assert(commentArg(1, arguments), goog.testing.style.layoutasserts.isWithinThreshold_(height, elementHeight, 0), 'Element should have height ' + height + '.'); 
} 
function assertHeightWithinTolerance(a, b, c, opt_d) { 
  _validateArguments(3, arguments); 
  var element = nonCommentArg(1, 3, arguments); 
  var height = nonCommentArg(2, 3, arguments); 
  var tolerance = nonCommentArg(3, 3, arguments); 
  var size = goog.style.getSize(element); 
  var elementHeight = size.height; 
  _assert(commentArg(1, arguments), goog.testing.style.layoutasserts.isWithinThreshold_(height, elementHeight, tolerance), 'Element width(' + elementHeight + ') should be within given width(' + height + ') with tolerance value of ' + tolerance + '.'); 
} 
function assertIsLeftOf(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var element = nonCommentArg(1, 2, arguments); 
  var otherElement = nonCommentArg(2, 2, arguments); 
  var elementRect = goog.style.getBounds(element); 
  var otherElementRect = goog.style.getBounds(otherElement); 
  _assert(commentArg(1, arguments), elementRect.left < otherElementRect.left, 'Elements should be left to right.'); 
} 
function assertIsStrictlyLeftOf(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var element = nonCommentArg(1, 2, arguments); 
  var otherElement = nonCommentArg(2, 2, arguments); 
  var elementRect = goog.style.getBounds(element); 
  var otherElementRect = goog.style.getBounds(otherElement); 
  _assert(commentArg(1, arguments), elementRect.left + elementRect.width < otherElementRect.left, 'Elements should be strictly left to right.'); 
} 
function assertIsAbove(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var element = nonCommentArg(1, 2, arguments); 
  var otherElement = nonCommentArg(2, 2, arguments); 
  var elementRect = goog.style.getBounds(element); 
  var otherElementRect = goog.style.getBounds(otherElement); 
  _assert(commentArg(1, arguments), elementRect.top < otherElementRect.top, 'Elements should be top to bottom.'); 
} 
function assertIsStrictlyAbove(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var element = nonCommentArg(1, 2, arguments); 
  var otherElement = nonCommentArg(2, 2, arguments); 
  var elementRect = goog.style.getBounds(element); 
  var otherElementRect = goog.style.getBounds(otherElement); 
  _assert(commentArg(1, arguments), elementRect.top + elementRect.height < otherElementRect.top, 'Elements should be strictly top to bottom.'); 
} 
function assertContained(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var element = nonCommentArg(1, 2, arguments); 
  var otherElement = nonCommentArg(2, 2, arguments); 
  var elementRect = goog.style.getBounds(element); 
  var otherElementRect = goog.style.getBounds(otherElement); 
  _assert(commentArg(1, arguments), elementRect.contains(otherElementRect), 'Element should be contained within the other element.'); 
} 
goog.testing.style.layoutasserts.intersects_ = function(element, otherElement) { 
  var elementRect = goog.style.getBounds(element); 
  var otherElementRect = goog.style.getBounds(otherElement); 
  return goog.math.Rect.intersects(elementRect, otherElementRect); 
}; 
goog.testing.style.layoutasserts.isWithinThreshold_ = function(val1, val2, threshold) { 
  return Math.abs(val1 - val2) <= threshold; 
}; 
goog.testing.style.layoutasserts.hasVisibleDimension_ = function(element) { 
  var elSize = goog.style.getSize(element); 
  var longest = elSize.getLongest(); 
  if(longest <= 0) { 
    return false; 
  } 
  return true; 
}; 
goog.testing.style.layoutasserts.isVisible_ = function(element) { 
  var visibilityStyle = goog.testing.style.layoutasserts.getAvailableStyle_(element, 'visibility'); 
  var displayStyle = goog.testing.style.layoutasserts.getAvailableStyle_(element, 'display'); 
  return(visibilityStyle != 'hidden' && displayStyle != 'none'); 
}; 
goog.testing.style.layoutasserts.getAvailableStyle_ = function(element, style) { 
  return goog.style.getComputedStyle(element, style) || goog.style.getCascadedStyle(element, style) || goog.style.getStyle(element, style); 
}; 
