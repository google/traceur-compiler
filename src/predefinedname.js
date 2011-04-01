// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

traceur.define('syntax', function() {
  'use strict';
  
  PredefinedName = {
    ADD_CONTINUATION: 'addContinuation',
    APPLY: 'apply',
    ARGUMENTS: 'arguments',
    ARRAY: 'Array',
    BIND: 'bind',
    CALL: 'call',
    CAPTURED_ARGUMENTS: '$arguments',
    CAPTURED_THIS: '$this',
    CAUGHT_EXCEPTION: '$caughtException',
    CLOSE: 'close',
    COMPLETE: 'complete',
    COMPLETE_EXCEPTION: 'completeException',
    CONFIGURABLE: 'configurable',
    CONSTRUCTOR: 'constructor',
    CONTINUATION: '$continuation',
    CREATE: 'create',
    CREATE_CLASS: 'createClass',
    CURRENT: 'current',
    DEFINE_GETTER: '__defineGetter__',
    DEFINE_PROPERTY: 'defineProperty',
    DEFINE_SETTER: '__defineSetter__',
    ENUMERABLE: 'enumerable',
    FINALLY_FALL_THROUGH: '$finallyFallThrough',
    FIELD_INITIALIZER_METHOD: '$field_initializer_',
    FREEZE: 'freeze',
    GET: 'get',
    INIT: '$init',
    IS_DONE: 'isDone',
    ITERATOR: '__iterator__',
    JSPP: 'jspp',
    LENGTH: 'length',
    LOOKUP_GETTER: '__lookupGetter__',
    LOOKUP_SETTER: '__lookupSetter__',
    MIXIN: 'mixin',
    MODULE: 'module',
    MOVE_NEXT: 'moveNext',
    NEW_FACTORY: '$new',
    OBJECT: 'Object',
    OBJECT_NAME: 'Object',
    PARAM: '$param',
    PROTO: '__proto__',
    PROTOTYPE: 'prototype',
    PUSH: 'push',
    REQUIRES: 'requires',
    RESULT: '$result',
    SET: 'set',
    SLICE: 'slice',
    STATE: '$state',
    STATIC: '$static',
    STORED_EXCEPTION: '$storedException',
    SUPER_CALL: 'superCall',
    SUPER_GET: 'superGet',
    TASK: 'Task',
    THAT: '$that',
    TRAIT: 'trait',
    TYPE_ERROR: 'TypeError',
    UNDEFINED: 'undefined',
    VALUE: 'value',
    WAIT_TASK: '$waitTask',
    WRITABLE: 'writable',
    getParameterName: function(index) {
      // TODO: consider caching these
      return '$' + index.toString();
    }
  };
  
  // Export
  return {
    PredefinedName: PredefinedName
  };
})();