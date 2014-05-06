import {toLength, isCallable} from './utils';

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-22.1.3.6
export function fill(value, start=0, end=this.length) {
    var object = Object(this),
        len = toLength(object.length),
        fillStart = parseInt(start, 10),
        fillEnd = parseInt(end, 10);

    // this must not be null
    if (this === null) {
        throw TypeError();
    }

    // set the start and end
    fillStart = (fillStart < 0) ? Math.max(len + fillStart, 0) : Math.min(fillStart, len);
    fillEnd = (fillEnd < 0) ? Math.max(len + fillEnd, 0) : Math.min(fillEnd, len);

    // set the values
    while (fillStart < fillEnd) {
        object[fillStart.toString()] = value;
        fillStart++;
    }

    return object;
}

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-22.1.3.9
export function findIndex(predicate, thisArg=undefined) {
    var object = Object(this),
        len = toLength(object.length);

    // this must not be null and predicate must be callable
    if (this === null || !isCallable(predicate)) {
        throw TypeError();
    }

    // run through until predicate returns true
    for (var i = 0; i < len; i++) {
        if (predicate.call(thisArg, object[i], i, object)) {
            return i;
        }
    }

    return -1;
}
