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
export var BIND = 'bind';
export var CALL = 'call';
export var CAUGHT_EXCEPTION = '$caughtException';
export var CLOSE = 'close';
export var CONFIGURABLE = 'configurable';
export var CONSTRUCTOR = 'constructor';
export var CREATE = 'create';
export var CURRENT = 'current';
export var DEFINE_PROPERTIES = 'defineProperties';
export var DEFINE_PROPERTY = 'defineProperty';
export var ENUMERABLE = 'enumerable';
export var FINALLY_FALL_THROUGH = '$finallyFallThrough';
export var FREEZE = 'freeze';
export var FROM = 'from';
export var FUNCTION = 'Function';
export var GET = 'get';
export var HAS = 'has';
export var LENGTH = 'length';
export var MODULE = 'module';
export var NEW = 'new';
export var OBJECT = 'Object';
export var OBJECT_NAME = 'Object';
export var OF = 'of';
export var PREVENT_EXTENSIONS = 'preventExtensions';
export var PROTOTYPE = 'prototype';
export var PUSH = 'push';
export var RAW = 'raw';
export var SET = 'set';
export var SLICE = 'slice';
export var STATE = '$state';
export var STORED_EXCEPTION = '$storedException';
export var THEN = 'then';
export var THIS = 'this';
export var TRACEUR_RUNTIME = '$traceurRuntime';
export var UNDEFINED = 'undefined';
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
