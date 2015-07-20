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

import {suite, test, assert} from '../unit/unitTestRunner.js';
import {CommandOptions, Options} from '../../src/Options.js';

suite('options', function() {

  test('Options instance', function() {
    var options = new Options();
    // default is false
    assert.isFalse(options.experimental);
    options.experimental = true;
    assert.isTrue(options.experimental);

    options.modules = false;
    assert.equal(options.modules, 'bootstrap');
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
    assert.equal(CommandOptions.fromString('--modules=false').modules, 'bootstrap');
    assert.equal(CommandOptions.fromString('--referrer=traceur@0.0.1').
      referrer,'traceur@0.0.1');

    assert.equal(CommandOptions.fromString('--source-maps=inline').sourceMaps,
        'inline');
    assert.equal(CommandOptions.fromString(' --source-maps  --blockBinding').sourceMaps,
        'file');
    assert.equal(CommandOptions.fromString('--source-maps=memory').sourceMaps,
        'memory');
  });

  test('experimental static', function(){
    var experimental = Options.experimental();

    assert.equal(experimental.annotations, true);
    assert.equal(experimental.arrayComprehension, true);
    assert.equal(experimental.asyncFunctions, true);
    assert.equal(experimental.exponentiation, true);
    assert.equal(experimental.generatorComprehension, true);
    assert.equal(experimental.require, true);
    assert.equal(experimental.types, true);
    assert.equal(experimental.memberVariables, true);

    var butNotTypes = Options.experimental().setFromObject({types: false});
    assert.equal(butNotTypes.types, false);
    assert.equal(butNotTypes.diff(experimental).length, 1);
  });

  test('atscript static', function() {
    var options = Options.atscript();

    assert.equal(options.types, true);
    assert.equal(options.annotations, true);
    assert.equal(options.memberVariables, true);
  });

  test('atscript setter', function() {
    var options = new Options();

    options.atscript = true;

    assert.equal(options.types, true);
    assert.equal(options.annotations, true);
    assert.equal(options.memberVariables, true);
  });

  test('atscript getter', function() {
    var options = new Options();

    assert.equal(options.atscript, false);

    options.types = true;
    assert.equal(options.atscript, false);

    options.annotations = true;
    assert.equal(options.atscript, false);

    options.memberVariables = true;
    assert.equal(options.atscript, true);
  });

  test('sourceRoot', function() {
    var options = new Options();
    assert.equal(options.sourceRoot, '');

    options.sourceRoot = false;
    assert.equal(options.sourceRoot, '');

    var from = new Options(options);
    assert.equal(from.sourceRoot, '');

    options.sourceRoot = '/tmp';
    assert.equal(options.sourceRoot, '/tmp');

    from = new Options(options);
    assert.equal(from.sourceRoot, '/tmp');

    options.sourceRoot = true;
    assert.equal(options.sourceRoot, true);
  });

  test('listUnknownOptions', function() {
    let unknown = Options.listUnknownOptions({});
    assert.equal(unknown.length, 0);
    unknown = Options.listUnknownOptions({junk: true});
    assert.deepEqual(unknown, ['junk']);
    unknown = Options.listUnknownOptions(new Options());
    assert.equal(unknown.length, 0);
  });
});
