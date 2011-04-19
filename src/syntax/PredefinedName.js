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

  var PredefinedName = {
    ADD_CONTINUATION: 'addContinuation',
    APPLY: 'apply',
    ARGUMENTS: 'arguments',
    ARRAY: 'Array',
    BIND: 'bind',
    CALL: 'call',
    CALLBACK: 'callback',
    CAPTURED_ARGUMENTS: '$arguments',
    CAPTURED_THIS: '$this',
    CAUGHT_EXCEPTION: '$caughtException',
    CLOSE: 'close',
    CONFIGURABLE: 'configurable',
    CONSTRUCTOR: 'constructor',
    CONTINUATION: '$continuation',
    CREATE: 'create',
    CREATE_CALLBACK: '$createCallback',
    CREATE_CLASS: 'createClass',
    CREATE_ERRBACK: '$createErrback',
    CREATE_PROMISE: 'createPromise',
    CREATE_TRAIT: 'createTrait',
    CURRENT: 'current',
    DEFERRED: 'Deferred',
    DEFINE_GETTER: '__defineGetter__',
    DEFINE_PROPERTY: 'defineProperty',
    DEFINE_SETTER: '__defineSetter__',
    ENUMERABLE: 'enumerable',
    ERR: '$err',
    ERRBACK: 'errback',
    FINALLY_FALL_THROUGH: '$finallyFallThrough',
    FIELD_INITIALIZER_METHOD: '$field_initializer_',
    FREEZE: 'freeze',
    GET: 'get',
    INIT: '$init',
    IS_DONE: 'isDone',
    ITERATOR: '__iterator__',
    LENGTH: 'length',
    LOOKUP_GETTER: '__lookupGetter__',
    LOOKUP_SETTER: '__lookupSetter__',
    MIXIN: 'mixin',
    MODULE: 'module',
    MOVE_NEXT: 'moveNext',
    NEW: 'new',
    NEW_STATE: '$newState',
    OBJECT: 'Object',
    OBJECT_NAME: 'Object',
    PARAM: '$param',
    PROTO: '__proto__',
    PROTOTYPE: 'prototype',
    PUSH: 'push',
    REQUIRE: 'require',
    RESOLVE: 'resolve',
    REQUIRES: 'requires',
    REQUIRED: 'required',
    RESULT: '$result',
    RUNTIME: 'runtime',
    SET: 'set',
    SPREAD: 'spread',
    SPREAD_NEW: 'spreadNew',
    SLICE: 'slice',
    STATE: '$state',
    STATIC: '$static',
    STORED_EXCEPTION: '$storedException',
    SUPER_CALL: 'superCall',
    SUPER_GET: 'superGet',
    THAT: '$that',
    THEN: 'then',
    TRACEUR: 'traceur',
    TRAIT: 'trait',
    TYPE_ERROR: 'TypeError',
    UNDEFINED: 'undefined',
    VALUE: 'value',
    $VALUE: '$value',
    WAIT_TASK: '$waitTask',
    WRITABLE: 'writable',
    getParameterName: function(index) {
      // TODO: consider caching these
      return '$' + index;
    }
  };

  // Export
  return {
    PredefinedName: PredefinedName
  };
});
