
goog.provide('goog.testing.JsUnitException'); 
goog.provide('goog.testing.asserts'); 
goog.require('goog.testing.stacktrace'); 
goog.testing.asserts.ArrayLike; 
var DOUBLE_EQUALITY_PREDICATE = function(var1, var2) { 
  return var1 == var2; 
}; 
var JSUNIT_UNDEFINED_VALUE; 
var TO_STRING_EQUALITY_PREDICATE = function(var1, var2) { 
  return var1.toString() === var2.toString(); 
}; 
var PRIMITIVE_EQUALITY_PREDICATES = { 
  'String': DOUBLE_EQUALITY_PREDICATE, 
  'Number': DOUBLE_EQUALITY_PREDICATE, 
  'Boolean': DOUBLE_EQUALITY_PREDICATE, 
  'Date': function(date1, date2) { 
    return date1.getTime() == date2.getTime(); 
  }, 
  'RegExp': TO_STRING_EQUALITY_PREDICATE, 
  'Function': TO_STRING_EQUALITY_PREDICATE 
}; 
function _trueTypeOf(something) { 
  var result = typeof something; 
  try { 
    switch(result) { 
      case 'string': 
        break; 

      case 'boolean': 
        break; 

      case 'number': 
        break; 

      case 'object': 
        if(something == null) { 
          result = 'null'; 
          break; 
        } 

      case 'function': 
        switch(something.constructor) { 
          case new String('').constructor: 
            result = 'String'; 
            break; 

          case new Boolean(true).constructor: 
            result = 'Boolean'; 
            break; 

          case new Number(0).constructor: 
            result = 'Number'; 
            break; 

          case new Array().constructor: 
            result = 'Array'; 
            break; 

          case new RegExp().constructor: 
            result = 'RegExp'; 
            break; 

          case new Date().constructor: 
            result = 'Date'; 
            break; 

          case Function: 
            result = 'Function'; 
            break; 

          default: 
            var m = something.constructor.toString().match(/function\s*([^( ]+)\(/); 
            if(m) { 
              result = m[1]; 
            } else { 
              break; 
            } 

        } 
        break; 

    } 
  } catch(e) { } finally { 
    result = result.substr(0, 1).toUpperCase() + result.substr(1); 
  } 
  return result; 
} 
function _displayStringForValue(aVar) { 
  var result = '<' + aVar + '>'; 
  if(!(aVar === null || aVar === JSUNIT_UNDEFINED_VALUE)) { 
    result += ' (' + _trueTypeOf(aVar) + ')'; 
  } 
  return result; 
} 
function fail(failureMessage) { 
  goog.testing.asserts.raiseException_('Call to fail()', failureMessage); 
} 
function argumentsIncludeComments(expectedNumberOfNonCommentArgs, args) { 
  return args.length == expectedNumberOfNonCommentArgs + 1; 
} 
function commentArg(expectedNumberOfNonCommentArgs, args) { 
  if(argumentsIncludeComments(expectedNumberOfNonCommentArgs, args)) { 
    return args[0]; 
  } 
  return null; 
} 
function nonCommentArg(desiredNonCommentArgIndex, expectedNumberOfNonCommentArgs, args) { 
  return argumentsIncludeComments(expectedNumberOfNonCommentArgs, args) ? args[desiredNonCommentArgIndex]: args[desiredNonCommentArgIndex - 1]; 
} 
function _validateArguments(expectedNumberOfNonCommentArgs, args) { 
  var valid = args.length == expectedNumberOfNonCommentArgs || args.length == expectedNumberOfNonCommentArgs + 1 && goog.isString(args[0]); 
  _assert(null, valid, 'Incorrect arguments passed to assert function'); 
} 
function _assert(comment, booleanValue, failureMessage) { 
  if(! booleanValue) { 
    goog.testing.asserts.raiseException_(comment, failureMessage); 
  } 
} 
function assert(a, opt_b) { 
  _validateArguments(1, arguments); 
  var comment = commentArg(1, arguments); 
  var booleanValue = nonCommentArg(1, 1, arguments); 
  _assert(comment, goog.isBoolean(booleanValue), 'Bad argument to assert(boolean)'); 
  _assert(comment, booleanValue, 'Call to assert(boolean) with false'); 
} 
function assertThrows(a, opt_b) { 
  _validateArguments(1, arguments); 
  var func = nonCommentArg(1, 1, arguments); 
  var comment = commentArg(1, arguments); 
  _assert(comment, typeof func == 'function', 'Argument passed to assertThrows is not a function'); 
  try { 
    func(); 
  } catch(e) { 
    if(e && goog.isString(e['stacktrace']) && goog.isString(e['message'])) { 
      var startIndex = e['message'].length - e['stacktrace'].length; 
      if(e['message'].indexOf(e['stacktrace'], startIndex) == startIndex) { 
        e['message']= e['message'].substr(0, startIndex - 14); 
      } 
    } 
    return e; 
  } 
  goog.testing.asserts.raiseException_(comment, 'No exception thrown from function passed to assertThrows'); 
} 
function assertNotThrows(a, opt_b) { 
  _validateArguments(1, arguments); 
  var func = nonCommentArg(1, 1, arguments); 
  _assert(commentArg(1, arguments), typeof func == 'function', 'Argument passed to assertNotThrows is not a function'); 
  var isOk = true; 
  try { 
    func(); 
  } catch(e) { 
    isOk = false; 
  } 
  _assert(commentArg(1, arguments), isOk, 'A non expected exception was thrown from function passed to ' + 'assertNotThrows'); 
} 
function assertThrowsJsUnitException(callback, opt_expectedMessage) { 
  var failed = false; 
  try { 
    goog.testing.asserts.callWithoutLogging(callback); 
  } catch(ex) { 
    if(! ex.isJsUnitException) { 
      fail('Expected a JsUnitException'); 
    } 
    if(typeof opt_expectedMessage != 'undefined' && ex.message != opt_expectedMessage) { 
      fail('Expected message [' + opt_expectedMessage + '] but got [' + ex.message + ']'); 
    } 
    failed = true; 
  } 
  if(! failed) { 
    fail('Expected a failure: ' + opt_expectedMessage); 
  } 
} 
function assertTrue(a, opt_b) { 
  _validateArguments(1, arguments); 
  var comment = commentArg(1, arguments); 
  var booleanValue = nonCommentArg(1, 1, arguments); 
  _assert(comment, goog.isBoolean(booleanValue), 'Bad argument to assertTrue(boolean)'); 
  _assert(comment, booleanValue, 'Call to assertTrue(boolean) with false'); 
} 
function assertFalse(a, opt_b) { 
  _validateArguments(1, arguments); 
  var comment = commentArg(1, arguments); 
  var booleanValue = nonCommentArg(1, 1, arguments); 
  _assert(comment, goog.isBoolean(booleanValue), 'Bad argument to assertFalse(boolean)'); 
  _assert(comment, ! booleanValue, 'Call to assertFalse(boolean) with true'); 
} 
function assertEquals(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var var1 = nonCommentArg(1, 2, arguments); 
  var var2 = nonCommentArg(2, 2, arguments); 
  _assert(commentArg(2, arguments), var1 === var2, 'Expected ' + _displayStringForValue(var1) + ' but was ' + _displayStringForValue(var2)); 
} 
function assertNotEquals(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var var1 = nonCommentArg(1, 2, arguments); 
  var var2 = nonCommentArg(2, 2, arguments); 
  _assert(commentArg(2, arguments), var1 !== var2, 'Expected not to be ' + _displayStringForValue(var2)); 
} 
function assertNull(a, opt_b) { 
  _validateArguments(1, arguments); 
  var aVar = nonCommentArg(1, 1, arguments); 
  _assert(commentArg(1, arguments), aVar === null, 'Expected ' + _displayStringForValue(null) + ' but was ' + _displayStringForValue(aVar)); 
} 
function assertNotNull(a, opt_b) { 
  _validateArguments(1, arguments); 
  var aVar = nonCommentArg(1, 1, arguments); 
  _assert(commentArg(1, arguments), aVar !== null, 'Expected not to be ' + _displayStringForValue(null)); 
} 
function assertUndefined(a, opt_b) { 
  _validateArguments(1, arguments); 
  var aVar = nonCommentArg(1, 1, arguments); 
  _assert(commentArg(1, arguments), aVar === JSUNIT_UNDEFINED_VALUE, 'Expected ' + _displayStringForValue(JSUNIT_UNDEFINED_VALUE) + ' but was ' + _displayStringForValue(aVar)); 
} 
function assertNotUndefined(a, opt_b) { 
  _validateArguments(1, arguments); 
  var aVar = nonCommentArg(1, 1, arguments); 
  _assert(commentArg(1, arguments), aVar !== JSUNIT_UNDEFINED_VALUE, 'Expected not to be ' + _displayStringForValue(JSUNIT_UNDEFINED_VALUE)); 
} 
function assertNotNullNorUndefined(a, opt_b) { 
  _validateArguments(1, arguments); 
  assertNotNull.apply(null, arguments); 
  assertNotUndefined.apply(null, arguments); 
} 
function assertNonEmptyString(a, opt_b) { 
  _validateArguments(1, arguments); 
  var aVar = nonCommentArg(1, 1, arguments); 
  _assert(commentArg(1, arguments), aVar !== JSUNIT_UNDEFINED_VALUE && aVar !== null && typeof aVar == 'string' && aVar !== '', 'Expected non-empty string but was ' + _displayStringForValue(aVar)); 
} 
function assertNaN(a, opt_b) { 
  _validateArguments(1, arguments); 
  var aVar = nonCommentArg(1, 1, arguments); 
  _assert(commentArg(1, arguments), isNaN(aVar), 'Expected NaN'); 
} 
function assertNotNaN(a, opt_b) { 
  _validateArguments(1, arguments); 
  var aVar = nonCommentArg(1, 1, arguments); 
  _assert(commentArg(1, arguments), ! isNaN(aVar), 'Expected not NaN'); 
} 
goog.testing.asserts.callWithoutLogging = function(fn) { 
  var testRunner = goog.global['G_testRunner']; 
  var oldLogTestFailure = testRunner['logTestFailure']; 
  try { 
    testRunner['logTestFailure']= undefined; 
    fn(); 
  } finally { 
    testRunner['logTestFailure']= oldLogTestFailure; 
  } 
}; 
goog.testing.asserts.findDifferences = function(expected, actual) { 
  var failures =[]; 
  var seen1 =[]; 
  var seen2 =[]; 
  function innerAssert(var1, var2, path) { 
    var depth = seen1.length; 
    if(depth % 2) { 
      var mid = depth >> 1; 
      var match1 = seen1[mid]=== var1; 
      var match2 = seen2[mid]=== var2; 
      if(match1 || match2) { 
        if(! match1 || ! match2) { 
          failures.push('Asymmetric cycle detected at ' + path); 
        } 
        return; 
      } 
    } 
    seen1.push(var1); 
    seen2.push(var2); 
    innerAssert_(var1, var2, path); 
    seen1.pop(); 
    seen2.pop(); 
  } 
  function innerAssert_(var1, var2, path) { 
    if(var1 === var2) { 
      return; 
    } 
    var typeOfVar1 = _trueTypeOf(var1); 
    var typeOfVar2 = _trueTypeOf(var2); 
    if(typeOfVar1 == typeOfVar2) { 
      var isArray = typeOfVar1 == 'Array'; 
      var equalityPredicate = PRIMITIVE_EQUALITY_PREDICATES[typeOfVar1]; 
      if(equalityPredicate) { 
        if(! equalityPredicate(var1, var2)) { 
          failures.push(path + ' expected ' + _displayStringForValue(var1) + ' but was ' + _displayStringForValue(var2)); 
        } 
      } else if(isArray && var1.length != var2.length) { 
        failures.push(path + ' expected ' + var1.length + '-element array ' + 'but got a ' + var2.length + '-element array'); 
      } else { 
        var childPath = path +(isArray ? '[%s]':(path ? '.%s': '%s')); 
        if(! var1['__iterator__']) { 
          for(var prop in var1) { 
            if(isArray && goog.testing.asserts.isArrayIndexProp_(prop)) { 
              continue; 
            } 
            if(prop in var2) { 
              innerAssert(var1[prop], var2[prop], childPath.replace('%s', prop)); 
            } else { 
              failures.push('property ' + prop + ' not present in actual ' +(path || typeOfVar2)); 
            } 
          } 
          for(var prop in var2) { 
            if(isArray && goog.testing.asserts.isArrayIndexProp_(prop)) { 
              continue; 
            } 
            if(!(prop in var1)) { 
              failures.push('property ' + prop + ' not present in expected ' +(path || typeOfVar1)); 
            } 
          } 
          if(isArray) { 
            for(prop = 0; prop < var1.length; prop ++) { 
              innerAssert(var1[prop], var2[prop], childPath.replace('%s', String(prop))); 
            } 
          } 
        } else { 
          if(goog.isFunction(var1.equals)) { 
            if(! var1.equals(var2)) { 
              failures.push('equals() returned false for ' +(path || typeOfVar1)); 
            } 
          } else if(var1.map_) { 
            innerAssert(var1.map_, var2.map_, childPath.replace('%s', 'map_')); 
          } else { 
            failures.push('unable to check ' +(path || typeOfVar1) + ' for equality: it has an iterator we do not ' + 'know how to handle. please add an equals method'); 
          } 
        } 
      } 
    } else { 
      failures.push(path + ' expected ' + _displayStringForValue(var1) + ' but was ' + _displayStringForValue(var2)); 
    } 
  } 
  innerAssert(expected, actual, ''); 
  return failures.length == 0 ? null: 'Expected ' + _displayStringForValue(expected) + ' but was ' + _displayStringForValue(actual) + '\n   ' + failures.join('\n   '); 
}; 
function assertObjectEquals(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var v1 = nonCommentArg(1, 2, arguments); 
  var v2 = nonCommentArg(2, 2, arguments); 
  var failureMessage = commentArg(2, arguments) ? commentArg(2, arguments): ''; 
  var differences = goog.testing.asserts.findDifferences(v1, v2); 
  _assert(failureMessage, ! differences, differences); 
} 
function assertArrayEquals(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var v1 = nonCommentArg(1, 2, arguments); 
  var v2 = nonCommentArg(2, 2, arguments); 
  var failureMessage = commentArg(2, arguments) ? commentArg(2, arguments): ''; 
  var typeOfVar1 = _trueTypeOf(v1); 
  _assert(failureMessage, typeOfVar1 == 'Array', 'Expected an array for assertArrayEquals but found a ' + typeOfVar1); 
  var typeOfVar2 = _trueTypeOf(v2); 
  _assert(failureMessage, typeOfVar2 == 'Array', 'Expected an array for assertArrayEquals but found a ' + typeOfVar2); 
  assertObjectEquals.apply(null, arguments); 
} 
function assertElementsEquals(a, b, c) { 
  _validateArguments(2, arguments); 
  var v1 = nonCommentArg(1, 2, arguments); 
  var v2 = nonCommentArg(2, 2, arguments); 
  var failureMessage = commentArg(2, arguments) ? commentArg(2, arguments): ''; 
  if(! v1) { 
    assert(failureMessage, ! v2); 
  } else { 
    assertEquals('length mismatch: ' + failureMessage, v1.length, v2.length); 
    for(var i = 0; i < v1.length; ++ i) { 
      assertEquals('mismatch at index ' + i + ': ' + failureMessage, v1[i], v2[i]); 
    } 
  } 
} 
function assertElementsRoughlyEqual(a, b, c, d) { 
  _validateArguments(3, arguments); 
  var v1 = nonCommentArg(1, 3, arguments); 
  var v2 = nonCommentArg(2, 3, arguments); 
  var tolerance = nonCommentArg(3, 3, arguments); 
  var failureMessage = commentArg(3, arguments) ? commentArg(3, arguments): ''; 
  if(! v1) { 
    assert(failureMessage, ! v2); 
  } else { 
    assertEquals('length mismatch: ' + failureMessage, v1.length, v2.length); 
    for(var i = 0; i < v1.length; ++ i) { 
      assertRoughlyEquals(failureMessage, v2[i], v1[i], tolerance); 
    } 
  } 
} 
function assertSameElements(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var expected = nonCommentArg(1, 2, arguments); 
  var actual = nonCommentArg(2, 2, arguments); 
  var message = commentArg(2, arguments); 
  assertTrue('Bad arguments to assertSameElements(opt_message, expected: ' + 'ArrayLike, actual: ArrayLike)', goog.isArrayLike(expected) && goog.isArrayLike(actual)); 
  expected = goog.testing.asserts.toArray_(expected); 
  actual = goog.testing.asserts.toArray_(actual); 
  _assert(message, expected.length == actual.length, 'Expected ' + expected.length + ' elements: [' + expected + '], ' + 'got ' + actual.length + ' elements: [' + actual + ']'); 
  var toFind = goog.testing.asserts.toArray_(expected); 
  for(var i = 0; i < actual.length; i ++) { 
    var index = goog.testing.asserts.indexOf_(toFind, actual[i]); 
    _assert(message, index != - 1, 'Expected [' + expected + '], got [' + actual + ']'); 
    toFind.splice(index, 1); 
  } 
} 
function assertEvaluatesToTrue(a, opt_b) { 
  _validateArguments(1, arguments); 
  var value = nonCommentArg(1, 1, arguments); 
  if(! value) { 
    _assert(commentArg(1, arguments), false, 'Expected to evaluate to true'); 
  } 
} 
function assertEvaluatesToFalse(a, opt_b) { 
  _validateArguments(1, arguments); 
  var value = nonCommentArg(1, 1, arguments); 
  if(value) { 
    _assert(commentArg(1, arguments), false, 'Expected to evaluate to false'); 
  } 
} 
function assertHTMLEquals(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var var1 = nonCommentArg(1, 2, arguments); 
  var var2 = nonCommentArg(2, 2, arguments); 
  var var1Standardized = standardizeHTML(var1); 
  var var2Standardized = standardizeHTML(var2); 
  _assert(commentArg(2, arguments), var1Standardized === var2Standardized, 'Expected ' + _displayStringForValue(var1Standardized) + ' but was ' + _displayStringForValue(var2Standardized)); 
} 
function assertCSSValueEquals(a, b, c, opt_d) { 
  _validateArguments(3, arguments); 
  var propertyName = nonCommentArg(1, 3, arguments); 
  var expectedValue = nonCommentArg(2, 3, arguments); 
  var actualValue = nonCommentArg(3, 3, arguments); 
  var expectedValueStandardized = standardizeCSSValue(propertyName, expectedValue); 
  var actualValueStandardized = standardizeCSSValue(propertyName, actualValue); 
  _assert(commentArg(3, arguments), expectedValueStandardized == actualValueStandardized, 'Expected ' + _displayStringForValue(expectedValueStandardized) + ' but was ' + _displayStringForValue(actualValueStandardized)); 
} 
function assertHashEquals(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var var1 = nonCommentArg(1, 2, arguments); 
  var var2 = nonCommentArg(2, 2, arguments); 
  var message = commentArg(2, arguments); 
  for(var key in var1) { 
    _assert(message, key in var2, 'Expected hash had key ' + key + ' that was not found'); 
    _assert(message, var1[key]== var2[key], 'Value for key ' + key + ' mismatch - expected = ' + var1[key]+ ', actual = ' + var2[key]); 
  } 
  for(var key in var2) { 
    _assert(message, key in var1, 'Actual hash had key ' + key + ' that was not expected'); 
  } 
} 
function assertRoughlyEquals(a, b, c, opt_d) { 
  _validateArguments(3, arguments); 
  var expected = nonCommentArg(1, 3, arguments); 
  var actual = nonCommentArg(2, 3, arguments); 
  var tolerance = nonCommentArg(3, 3, arguments); 
  _assert(commentArg(3, arguments), Math.abs(expected - actual) <= tolerance, 'Expected ' + expected + ', but got ' + actual + ' which was more than ' + tolerance + ' away'); 
} 
function assertContains(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var contained = nonCommentArg(1, 2, arguments); 
  var container = nonCommentArg(2, 2, arguments); 
  _assert(commentArg(2, arguments), goog.testing.asserts.contains_(container, contained), 'Expected \'' + container + '\' to contain \'' + contained + '\''); 
} 
function assertNotContains(a, b, opt_c) { 
  _validateArguments(2, arguments); 
  var contained = nonCommentArg(1, 2, arguments); 
  var container = nonCommentArg(2, 2, arguments); 
  _assert(commentArg(2, arguments), ! goog.testing.asserts.contains_(container, contained), 'Expected \'' + container + '\' not to contain \'' + contained + '\''); 
} 
goog.testing.asserts.toArray_ = function(arrayLike) { 
  var ret =[]; 
  for(var i = 0; i < arrayLike.length; i ++) { 
    ret[i]= arrayLike[i]; 
  } 
  return ret; 
}; 
goog.testing.asserts.indexOf_ = function(container, contained) { 
  if(container.indexOf) { 
    return container.indexOf(contained); 
  } else { 
    for(var i = 0; i < container.length; i ++) { 
      if(container[i]=== contained) { 
        return i; 
      } 
    } 
    return - 1; 
  } 
}; 
goog.testing.asserts.contains_ = function(container, contained) { 
  return goog.testing.asserts.indexOf_(container, contained) != - 1; 
}; 
function standardizeHTML(html) { 
  var translator = document.createElement('DIV'); 
  translator.innerHTML = html; 
  return translator.innerHTML.replace(/^\s+|\s+$/g, ''); 
} 
function standardizeCSSValue(propertyName, value) { 
  var styleDeclaration = document.createElement('DIV').style; 
  styleDeclaration[propertyName]= value; 
  return styleDeclaration[propertyName]; 
} 
goog.testing.asserts.raiseException_ = function(comment, opt_message) { 
  if(goog.global['CLOSURE_INSPECTOR___']&& goog.global['CLOSURE_INSPECTOR___']['supportsJSUnit']) { 
    goog.global['CLOSURE_INSPECTOR___']['jsUnitFailure'](comment, opt_message); 
  } 
  throw new goog.testing.JsUnitException(comment, opt_message); 
}; 
goog.testing.asserts.isArrayIndexProp_ = function(prop) { 
  return(prop | 0) == prop; 
}; 
goog.testing.JsUnitException = function(comment, opt_message) { 
  this.isJsUnitException = true; 
  this.message =(comment ? comment: '') +(comment && opt_message ? '\n': '') +(opt_message ? opt_message: ''); 
  this.stackTrace = goog.testing.stacktrace.get(); 
  this.comment = comment || null; 
  this.jsUnitMessage = opt_message || ''; 
}; 
goog.testing.JsUnitException.prototype.toString = function() { 
  return '[JsUnitException]'; 
}; 
goog.exportSymbol('fail', fail); 
goog.exportSymbol('assert', assert); 
goog.exportSymbol('assertThrows', assertThrows); 
goog.exportSymbol('assertNotThrows', assertNotThrows); 
goog.exportSymbol('assertTrue', assertTrue); 
goog.exportSymbol('assertFalse', assertFalse); 
goog.exportSymbol('assertEquals', assertEquals); 
goog.exportSymbol('assertNotEquals', assertNotEquals); 
goog.exportSymbol('assertNull', assertNull); 
goog.exportSymbol('assertNotNull', assertNotNull); 
goog.exportSymbol('assertUndefined', assertUndefined); 
goog.exportSymbol('assertNotUndefined', assertNotUndefined); 
goog.exportSymbol('assertNotNullNorUndefined', assertNotNullNorUndefined); 
goog.exportSymbol('assertNonEmptyString', assertNonEmptyString); 
goog.exportSymbol('assertNaN', assertNaN); 
goog.exportSymbol('assertNotNaN', assertNotNaN); 
goog.exportSymbol('assertObjectEquals', assertObjectEquals); 
goog.exportSymbol('assertArrayEquals', assertArrayEquals); 
goog.exportSymbol('assertElementsEquals', assertElementsEquals); 
goog.exportSymbol('assertSameElements', assertSameElements); 
goog.exportSymbol('assertEvaluatesToTrue', assertEvaluatesToTrue); 
goog.exportSymbol('assertEvaluatesToFalse', assertEvaluatesToFalse); 
goog.exportSymbol('assertHTMLEquals', assertHTMLEquals); 
goog.exportSymbol('assertHashEquals', assertHashEquals); 
goog.exportSymbol('assertRoughlyEquals', assertRoughlyEquals); 
goog.exportSymbol('assertContains', assertContains); 
goog.exportSymbol('assertNotContains', assertNotContains); 
