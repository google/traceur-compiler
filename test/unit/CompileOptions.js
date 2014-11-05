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

suite('options', function() {
  function get(name) {
    return $traceurRuntime.ModuleStore.getForTesting(name);
  }

  var Options = get('src/Options.js').Options;
  var CommandOptions = get('src/Options.js').CommandOptions;

  test('Options instance', function() {
    var options = new Options();
    // default is false
    assert.isFalse(options.experimental);
    options.experimental = true;
    assert.isTrue(options.experimental);

    options.modules = false;
    assert.equal(options.modules, 'register');
    options.modules = 'inline';
    assert.equal(options.modules, 'inline');
    assert.throws(function() {
      options.modules = true
    }, Error);
    assert.isFalse(options.sourceMaps, 'sourceMaps option default false');
  });

  test('Options reset', function() {
    var options = new Options();
    options.experimental = true;
    options.reset();
    assert.isFalse(options.experimental);
    assert.isTrue(options.classes);
    assert.isFalse(options.sourceMaps);
    options.reset(true);
    assert.isFalse(options.classes);
  });

  test('Options from options', function() {
    var mutatedOptions = new Options();
    assert.isTrue(mutatedOptions.classes);
    mutatedOptions.classes = false;
    assert.isFalse(mutatedOptions.classes);
    assert.isFalse(mutatedOptions.sourceMaps);
    mutatedOptions.sourceMaps = 'inline';
    assert.equal(mutatedOptions.sourceMaps, 'inline');
    var options = new Options(mutatedOptions);
    assert.isFalse(options.classes);
    assert.equal(mutatedOptions.sourceMaps, 'inline');
    var moreOptions = new Options();
    mutatedOptions.modules = 'amd';
    assert.equal(mutatedOptions.modules,'amd');
    moreOptions.setFromObject(mutatedOptions);
    assert.equal(moreOptions.modules,'amd');
  });

  test('CommandOptions fromString', function() {
    assert.isTrue(CommandOptions.fromString('--blockBinding').blockBinding);
    assert.isTrue(CommandOptions.fromString('--block-binding').blockBinding);
    assert.isTrue(CommandOptions.fromString('--blockBinding=true').
      blockBinding);
    assert.isFalse(CommandOptions.fromString('--classes=false').classes);
    assert.equal(CommandOptions.fromString('--modules=amd').modules,'amd');
    assert.equal(CommandOptions.fromString('--modules=false').modules, 'register');
    assert.equal(CommandOptions.fromString('--referrer=traceur@0.0.1').
      referrer,'traceur@0.0.1');

    assert.equal(CommandOptions.fromString('--source-maps=inline').sourceMaps,
        'inline');
    assert.equal(CommandOptions.fromString(' --source-maps  --blockBinding').sourceMaps,
        'file');
    assert.equal(CommandOptions.fromString('--source-maps=memory').sourceMaps,
        'memory');
  });
});