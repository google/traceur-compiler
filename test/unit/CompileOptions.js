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

  var CompileOptions = get('src/CompileOptions').CompileOptions;
  var CommandOptions = get('src/CompileOptions').CommandOptions;

  test('CompileOptions instance', function() {
    var options = new CompileOptions();
    // default is false
    assert(options.experimental === false);
    options.experimental = true;
    assert(options.experimental === true);

    options.modules = false;
    assert(options.modules === 'register');
    options.modules = 'inline';
    assert(options.modules === 'inline');
    var assertThrown = false;
    try {
      options.modules = true;
    } catch(ex) {
      assertThrown = true;
    }
    assert(assertThrown);
  });

  test('CompileOptions reset', function() {
    var options = new CompileOptions();
    options.experimental = true;
    options.reset();
    assert(options.experimental === false);
    assert(options.classes === true);
    options.reset(true);
    assert(options.classes === false);
  });

  test('CompileOptions from options', function() {
    var mutatedOptions = new CompileOptions();
    assert(mutatedOptions.classes === true);
    mutatedOptions.classes = false;
    assert(mutatedOptions.classes === false);
    var options = new CompileOptions(mutatedOptions);
    assert(options.classes === false);
    var moreOptions = new CompileOptions();
    mutatedOptions.modules = 'amd';
    assert(mutatedOptions.modules === 'amd');
    moreOptions.setFromObject(mutatedOptions);
    assert(moreOptions.modules === 'amd');
  });

  test('CommandOptions fromString', function() {
    assert(CommandOptions.fromString('--blockBinding').blockBinding === true);
    assert(CommandOptions.fromString('--block-binding').blockBinding === true);
    assert(CommandOptions.fromString('--blockBinding=true').
      blockBinding === true);
    assert(CommandOptions.fromString('--classes=false').classes === false);
    assert(CommandOptions.fromString('--modules=amd').modules == 'amd');
    assert(CommandOptions.fromString('--modules=false').modules == 'register');
    assert(CommandOptions.fromString('--referrer=traceur@0.0.1').
      referrer === 'traceur@0.0.1');
  });
});