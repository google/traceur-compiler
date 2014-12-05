import {getFunctionName} from '../../../src/runtime/polyfills/Function';

assert.isTrue(getFunctionName(function funcDecl(){}) === "funcDecl");
assert.isTrue(getFunctionName((function funcExpr(){})) === "funcExpr");
assert.isTrue(getFunctionName((function(){})) === '');

assert.isTrue(getFunctionName(class ClassDecl {}) === "ClassDecl");
assert.isTrue(getFunctionName((class ClassExpr {})) === "ClassExpr");

assert.isTrue(getFunctionName((new Function)) === "anonymous");