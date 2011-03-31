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

'use strict';

traceur.PredefinedName = traceur.PredefinedName || {};

traceur.PredefinedName.ADD_CONTINUATION = 'addContinuation';
traceur.PredefinedName.APPLY = 'apply';
traceur.PredefinedName.ARGUMENTS = 'arguments';
traceur.PredefinedName.ARRAY = 'Array';
traceur.PredefinedName.BIND = 'bind';
traceur.PredefinedName.CALL = 'call';
traceur.PredefinedName.CAPTURED_ARGUMENTS = '$arguments';
traceur.PredefinedName.CAPTURED_THIS = '$this';
traceur.PredefinedName.CAUGHT_EXCEPTION = '$caughtException';
traceur.PredefinedName.CLOSE = 'close';
traceur.PredefinedName.COMPLETE = 'complete';
traceur.PredefinedName.COMPLETE_EXCEPTION = 'completeException';
traceur.PredefinedName.CONFIGURABLE = 'configurable';
traceur.PredefinedName.CONSTRUCTOR = 'constructor';
traceur.PredefinedName.CONTINUATION = '$continuation';
traceur.PredefinedName.CREATE = 'create';
traceur.PredefinedName.CREATE_CLASS = 'createClass';
traceur.PredefinedName.CURRENT = 'current';
traceur.PredefinedName.DEFINE_GETTER = '__defineGetter__';
traceur.PredefinedName.DEFINE_PROPERTY = 'defineProperty';
traceur.PredefinedName.DEFINE_SETTER = '__defineSetter__';
traceur.PredefinedName.ENUMERABLE = 'enumerable';
traceur.PredefinedName.FINALLY_FALL_THROUGH = '$finallyFallThrough';
traceur.PredefinedName.FIELD_INITIALIZER_METHOD = '$field_initializer_';
traceur.PredefinedName.FREEZE = 'freeze';
traceur.PredefinedName.GET = 'get';
traceur.PredefinedName.INIT = '$init';
traceur.PredefinedName.IS_DONE = 'isDone';
traceur.PredefinedName.ITERATOR = '__iterator__';
traceur.PredefinedName.JSPP = 'jspp';
traceur.PredefinedName.LENGTH = 'length';
traceur.PredefinedName.LOOKUP_GETTER = '__lookupGetter__';
traceur.PredefinedName.LOOKUP_SETTER = '__lookupSetter__';
traceur.PredefinedName.MIXIN = 'mixin';
traceur.PredefinedName.MODULE = 'module';
traceur.PredefinedName.MOVE_NEXT = 'moveNext';
traceur.PredefinedName.NEW_FACTORY = '$new';
traceur.PredefinedName.OBJECT = 'Object';
traceur.PredefinedName.OBJECT_NAME = 'Object';
traceur.PredefinedName.PARAM = '$param';
traceur.PredefinedName.PROTO = '__proto__';
traceur.PredefinedName.PROTOTYPE = 'prototype';
traceur.PredefinedName.PUSH = 'push';
traceur.PredefinedName.REQUIRES = 'requires';
traceur.PredefinedName.RESULT = '$result';
traceur.PredefinedName.SET = 'set';
traceur.PredefinedName.SLICE = 'slice';
traceur.PredefinedName.STATE = '$state';
traceur.PredefinedName.STATIC = '$static';
traceur.PredefinedName.STORED_EXCEPTION = '$storedException';
traceur.PredefinedName.SUPER_CALL = 'superCall';
traceur.PredefinedName.SUPER_GET = 'superGet';
traceur.PredefinedName.TASK = 'Task';
traceur.PredefinedName.THAT = '$that';
traceur.PredefinedName.TRAIT = 'trait';
traceur.PredefinedName.TYPE_ERROR = 'TypeError';
traceur.PredefinedName.UNDEFINED = 'undefined';
traceur.PredefinedName.VALUE = 'value';
traceur.PredefinedName.WAIT_TASK = '$waitTask';
traceur.PredefinedName.WRITABLE = 'writable';

traceur.PredefinedName.getParameterName(index) {
  // TODO: consider caching these
  return '$' + index.toString();
}
