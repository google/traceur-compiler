// Options: --types --type-assertions --type-assertion-module=./resources/assert.js
import {AssertionError} from '../../asserts.js';

function single(a: number) {}
function multiple(a: number, b: boolean) {}
function untyped(a) {}
function onlySome(a, b: number) {}

single(1);
multiple(1, true);
untyped();
onlySome(null, 1);

assert.throw(() => { single(''); }, AssertionError);
assert.throw(() => { multiple('', false); }, AssertionError);
assert.throw(() => { multiple(false, 1); }, AssertionError);
assert.throw(() => { multiple(1, ''); }, AssertionError);
assert.throw(() => { onlySome(1, true); }, AssertionError);
