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

suite('HTMLImportScriptTraceur.js', function() {
  if (typeof document === 'undefined')
    return;

  var iframe;

  teardown(function() {
    if (iframe)
      iframe.parentNode.removeChild(iframe);
  });

  test('HTMLImport Scripts are transpiled', function(done) {
    iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.style.cssText = 'position: absolute; top: -1000px';
    iframe.addEventListener('load', function() {
      var hello = iframe.contentDocument.querySelector('h1');
      assert.equal('Success!', hello.textContent);
      var world = iframe.contentDocument.querySelector('h2');
      assert.equal('Traceur is the best!', world.textContent);
      done();
    });
    iframe.src = 'test/unit/tools/HTMLImportTranscoder/basic/index.html'
  });

  // based on http://w3c.github.io/webcomponents/spec/imports/#dfn-import-link-list
  test('HTMLImport Scripts are loaded in correct order', function(done) {
    iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.style.cssText = 'position: absolute; top: -1000px';
    iframe.addEventListener('load', function() {
      // expected import order
      var expectedLoadOrder = ["f", "d", "b", "h", "e", "g", "c", "a"];
      for(var index=0; index<expectedLoadOrder.length; index++)
        assert.equal(expectedLoadOrder[index], iframe.contentDocument.actualLoadOrder[index]);

      done();
    });
    iframe.src = 'test/unit/tools/HTMLImportTranscoder/import-order/index.html'
  });


});
