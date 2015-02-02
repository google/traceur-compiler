// Copyright 2014 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function spread() {
  var rv = [], j = 0, iterResult;

  for (var i = 0; i < arguments.length; i++) {
    var valueToSpread = $traceurRuntime.checkObjectCoercible(arguments[i]);

    if (typeof valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)] !== 'function') {
      throw new TypeError('Cannot spread non-iterable object.');
    }

    var iter = valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)]();

    while (!(iterResult = iter.next()).done) {
      rv[j++] = iterResult.value;
    }
  }

  return rv;
}

$traceurRuntime.spread = spread;
