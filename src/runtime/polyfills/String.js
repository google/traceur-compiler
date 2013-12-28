// Copyright 2013 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var $toString = Object.prototype.toString;
var $indexOf = String.prototype.indexOf;
var $lastIndexOf = String.prototype.lastIndexOf;

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.startswith
export function startsWith(search) {
  /*! http://mths.be/startswith v0.1.0 by @mathias */
  var string = String(this);
  if (this == null || $toString.call(search) == '[object RegExp]') {
    throw TypeError();
  }
  var stringLength = string.length;
  var searchString = String(search);
  var searchLength = searchString.length;
  var position = arguments.length > 1 ? arguments[1] : undefined;
  // `ToInteger`
  var pos = position ? Number(position) : 0;
  if (isNaN(pos)) {
    pos = 0;
  }
  var start = Math.min(Math.max(pos, 0), stringLength);
  return $indexOf.call(string, searchString, pos) == start;
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.endswith
export function endsWith(search) {
  /*! http://mths.be/endswith v0.1.0 by @mathias */
  var string = String(this);
  if (this == null || $toString.call(search) == '[object RegExp]') {
    throw TypeError();
  }
  var stringLength = string.length;
  var searchString = String(search);
  var searchLength = searchString.length;
  var pos = stringLength;
  if (arguments.length > 1) {
    var position = arguments[1];
    if (position !== undefined) {
      // `ToInteger`
      pos = position ? Number(position) : 0;
      if (isNaN(pos)) {
        pos = 0;
      }
    }
  }
  var end = Math.min(Math.max(pos, 0), stringLength);
  var start = end - searchLength;
  if (start < 0) {
    return false;
  }
  return $lastIndexOf.call(string, searchString, start) == start;
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.contains
export function contains(search) {
  /*! http://mths.be/contains v0.1.0 by @mathias */
  if (this == null) {
    throw TypeError();
  }
  var string = String(this);
  var stringLength = string.length;
  var searchString = String(search);
  var searchLength = searchString.length;
  var position = arguments.length > 1 ? arguments[1] : undefined;
  // `ToInteger`
  var pos = position ? Number(position) : 0;
  if (isNaN(pos)) {
    pos = 0;
  }
  var start = Math.min(Math.max(pos, 0), stringLength);
  return $indexOf.call(string, searchString, pos) != -1;
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.repeat
export function repeat(count) {
  /*! http://mths.be/repeat v0.1.0 by @mathias */
  if (this == null) {
    throw TypeError();
  }
  var string = String(this);
  // `ToInteger`
  var n = count ? Number(count) : 0;
  if (isNaN(n)) {
    n = 0;
  }
  // Account for out-of-bounds indices
  if (n < 0 || n == Infinity) {
    throw RangeError();
  }
  if (n == 0) {
    return '';
  }
  var result = '';
  while (n--) {
    result += string;
  }
  return result;
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype.codepointat
export function codePointAt(position) {
  /*! http://mths.be/codepointat v0.1.0 by @mathias */
  if (this == null) {
    throw TypeError();
  }
  var string = String(this);
  var size = string.length;
  // `ToInteger`
  var index = position ? Number(position) : 0;
  if (isNaN(index)) {
    index = 0;
  }
  // Account for out-of-bounds indices:
  if (index < 0 || index >= size) {
    return undefined;
  }
  // Get the first code unit
  var first = string.charCodeAt(index);
  var second;
  if ( // check if it’s the start of a surrogate pair
    first >= 0xD800 && first <= 0xDBFF && // high surrogate
    size > index + 1 // there is a next code unit
  ) {
    second = string.charCodeAt(index + 1);
    if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
      // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }
  return first;
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.raw
export function raw(callsite) {
  var raw = callsite.raw;
  var len = raw.length >>> 0;  // ToUint
  if (len === 0)
    return '';
  var s = '';
  var i = 0;
  while (true) {
    s += raw[i];
    if (i + 1 === len)
      return s;
    s += arguments[++i];
  }
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.fromcodepoint
export function fromCodePoint() {
  // http://mths.be/fromcodepoint v0.1.0 by @mathias
  var codeUnits = [];
  var floor = Math.floor;
  var highSurrogate;
  var lowSurrogate;
  var index = -1;
  var length = arguments.length;
  if (!length) {
    return '';
  }
  while (++index < length) {
    var codePoint = Number(arguments[index]);
    if (
      !isFinite(codePoint) ||  // `NaN`, `+Infinity`, or `-Infinity`
      codePoint < 0 ||  // not a valid Unicode code point
      codePoint > 0x10FFFF ||  // not a valid Unicode code point
      floor(codePoint) != codePoint  // not an integer
    ) {
      throw RangeError('Invalid code point: ' + codePoint);
    }
    if (codePoint <= 0xFFFF) {  // BMP code point
      codeUnits.push(codePoint);
    } else {  // Astral code point; split in surrogate halves
      // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      codePoint -= 0x10000;
      highSurrogate = (codePoint >> 10) + 0xD800;
      lowSurrogate = (codePoint % 0x400) + 0xDC00;
      codeUnits.push(highSurrogate, lowSurrogate);
    }
  }
  return String.fromCharCode.apply(null, codeUnits);
}
