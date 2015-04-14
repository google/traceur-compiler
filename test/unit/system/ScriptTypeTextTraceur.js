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

import {
  suite,
  test,
  assert,
  teardown
} from '../../unit/unitTestRunner.js';

suite('ScriptTypeTextTraceur.js', function() {
  if (typeof document === 'undefined')
    return;

  var iframe;

  teardown(function() {
    if (iframe)
      iframe.parentNode.removeChild(iframe);
  });

  test('text/traceur', function(done) {
    iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.style.cssText = 'position: absolute; top: -1000px';
    iframe.addEventListener('load', function() {
      var hello = iframe.contentDocument.querySelector('h1');
      assert.equal('Success!', hello.textContent);
      done();
    });
    iframe.src = '../test/unit/system/ScriptTypeTextTraceur.html'
  });

});
