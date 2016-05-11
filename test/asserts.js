// Copyright 2015 Traceur Authors.
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

let chai;
if (typeof require === 'undefined') {
  // In the browwser we have no synchronous way of importing chai,
  // we have to rely on manual user include of <script>
  if (!window.chai) {
    throw new Error('Missing global "chai"');
  }
  chai = window.chai;
} else {
  chai = require('chai');
}

export let assert = chai.assert;
export let AssertionError = chai.AssertionError;
