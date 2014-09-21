import {getFunctionName} from '../../../src/runtime/polyfills/Function';

function namedFn () {}
var anonymousFn = function() {};

assert.isTrue(getFunctionName(namedFn) === "namedFn");
assert.isTrue(getFunctionName(anonymousFn) === undefined);