// Copyright 2012 Traceur Authors.
//
// Licensed under the Apache License; Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing; software
// distributed under the License is distributed on an 'AS IS' BASIS;
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND; either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export var ANY = 'any';
export var $ARGUMENTS = '$arguments';
export var $THAT = '$that';
export var $VALUE = '$value';
export var ADD_CONTINUATION = 'addContinuation';
export var APPLY = 'apply';
export var ARGUMENTS = 'arguments';
export var ARRAY = 'Array';
export var AS = 'as';
export var ASSERT_NAME = 'assertName';
export var BIND = 'bind';
export var BOOL = 'bool';
export var CALL = 'call';
export var CALLBACK = 'callback';
export var CAUGHT_EXCEPTION = '$caughtException';
export var CLOSE = 'close';
export var CONFIGURABLE = 'configurable';
export var CONSTRUCTOR = 'constructor';
export var CONTINUATION = '$continuation';
export var CREATE = 'create';
export var CREATE_CALLBACK = '$createCallback';
export var CREATE_ERRBACK = '$createErrback';
export var CREATE_PROMISE = 'createPromise';
export var CURRENT = 'current';
export var DEFERRED = 'Deferred';
export var DEFINE_PROPERTIES = 'defineProperties';
export var DEFINE_PROPERTY = 'defineProperty';
export var DELETE_PROPERTY = 'deleteProperty';
export var ELEMENT_DELETE = 'elementDelete';
export var ELEMENT_GET = 'elementGet';
export var ELEMENT_HAS = 'elementHas';
export var ELEMENT_SET = 'elementSet';
export var ENUMERABLE = 'enumerable';
export var ERR = '$err';
export var ERRBACK = 'errback';
export var FINALLY_FALL_THROUGH = '$finallyFallThrough';
export var FREEZE = 'freeze';
export var FROM = 'from';
export var FUNCTION = 'Function';
export var GET = 'get';
export var HAS = 'has';
export var LENGTH = 'length';
export var MODULE = 'module';
export var NEW = 'new';
export var NEW_STATE = '$newState';
export var NUMBER = 'number';
export var OBJECT = 'Object';
export var OBJECT_NAME = 'Object';
export var OF = 'of';
export var PREVENT_EXTENSIONS = 'preventExtensions';
export var PROTOTYPE = 'prototype';
export var PUSH = 'push';
export var RAW = 'raw';
export var RESULT = '$result';
export var SET = 'set';
export var SLICE = 'slice';
export var SPREAD = 'spread';
export var SPREAD_NEW = 'spreadNew';
export var STATE = '$state';
export var STORED_EXCEPTION = '$storedException';
export var STRING = 'string';
export var THEN = 'then';
export var THIS = 'this';
export var TRACEUR_RUNTIME = '$traceurRuntime';
export var UNDEFINED = 'undefined';
export var WAIT_TASK = '$waitTask';
export var WRITABLE = 'writable';
export var YIELD_ACTION = '$yieldAction';
export var YIELD_RETURN = 'yieldReturn';
export var YIELD_SENT = '$yieldSent';
export function getParameterName(index) {
  // TODO: consider caching these
  return '$' + index;
};

// constants for generator actions
export var ACTION_SEND = 0;
export var ACTION_THROW = 1;
