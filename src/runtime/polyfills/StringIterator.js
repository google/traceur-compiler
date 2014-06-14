import {
  createIteratorResultObject,
  isObject
} from './utils';

var {hasOwnProperty, toProperty} = $traceurRuntime;

// 21.1.5.3 Properties of String Iterator Instances

// The String value whose elements are being iterated.
var iteratedString = Symbol('iteratedString');

// The integer index of the next string index to be examined by this iteration.
var stringIteratorNextIndex = Symbol('stringIteratorNextIndex');

// 21.1.5 String Iterator Objects
class StringIterator {

  // 21.1.5.2.1 StringIterator.prototype.next( )
  next() {
    var o = this;

    if (!isObject(o) || !hasOwnProperty(o, iteratedString)) {
      throw new TypeError('this must be a StringIterator object');
    }

    var s = o[toProperty(iteratedString)];
    if (s === undefined) {
      return createIteratorResultObject(undefined, true);
    }

    var position = o[toProperty(stringIteratorNextIndex)];
    var len = s.length;

    if (position >= len) {
      o[toProperty(iteratedString)] = undefined;
      return createIteratorResultObject(undefined, true);
    }

    var first = s.charCodeAt(position);

    var resultString;
    if (first < 0xD800 || first > 0xDBFF || position + 1 === len) {
      resultString = String.fromCharCode(first);
    } else {
      var second = s.charCodeAt(position + 1);
      if (second < 0xDC00 || second > 0xDFFF) {
        resultString = String.fromCharCode(first);
      } else {
        resultString = String.fromCharCode(first) + String.fromCharCode(second);
      }
    }

    o[toProperty(stringIteratorNextIndex)] = position + resultString.length;
    return createIteratorResultObject(resultString, false);
  }

  // 21.1.5.2.2 StringIterator.prototype[@@iterator]( )
  [Symbol.iterator]() {
    return this;
  }
}

// 21.1.5.1 CreateStringIterator Abstract Operation
export function createStringIterator(string) {
  var s = String(string);
  var iterator = Object.create(StringIterator.prototype);
  iterator[toProperty(iteratedString)] = s;
  iterator[toProperty(stringIteratorNextIndex)] = 0;
  return iterator;
}
