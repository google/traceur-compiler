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

import {suite, test, assert, setup} from '../../unit/unitTestRunner.js';

import {Options} from '../../../src/Options.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {ParseTreeValidator} from '../../../src/syntax/ParseTreeValidator.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {ES6ClassTransformer} from '../../../src/codegeneration/ES6ClassTransformer.js';
import {UniqueIdentifierGenerator} from '../../../src/codegeneration/UniqueIdentifierGenerator.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';

suite('ES6ClassTransformer.js', function() {
  var transformer;

  setup(function() {
    transformer = new ES6ClassTransformer(new UniqueIdentifierGenerator());
  });

  function parseScript(content, memberVariables = true) {
    var file = new SourceFile('test', content);
    var options = new Options({
      memberVariables: memberVariables,
      annotations: true,
      validate: true,
    });
    var parser = new Parser(file, null, options);
    var tree = parser.parseScript();
    ParseTreeValidator.validate(tree);
    return tree;
  }

  function normalizeScript(content) {
    var tree = parseScript(content, false);
    return write(tree);
  }

  function testTransform(name, content, expected) {
    test(name, function() {
      var tree = parseScript(content);
      var transformed = transformer.transformAny(tree);
      assert.equal(normalizeScript(expected), write(transformed));
    });
  }

  testTransform('ClassDeclaration no ctor',
    `class C {
      static c0 = 0;
      c1 = 1;
      c2 = 2;
      c3;
    }`,
    `class C {
      constructor() {
        this.c1 = 1, this.c2 = 2;
      }
    }
    Object.defineProperty(C, "c0", {
      enumerable: true, configurable: true, value: 0, writable: true
    });`
  );

  testTransform('ClassDeclaration with ctor',
    `class C {
      static c0 = 0;
      c1 = 1;
      c2 = 2;
      c3;
      constructor() {
        fn();
      }
    }`,
    `class C {
      constructor() {
        this.c1 = 1, this.c2 = 2;
        fn();
      }
    }
    Object.defineProperty(C, "c0", {
      enumerable: true, configurable: true, value: 0, writable: true
    });`
  );

  testTransform('derived ClassDeclaration no ctor',
    `class C extends B {
      static c0 = 0;
      c1 = 1;
      c2 = 2;
      c3;
    }`,
    `class C extends B {
      constructor(...args) {
        (super(...args), this.c1 = 1, this.c2 = 2, this);
      }
    }
    Object.defineProperty(C, "c0", {
      enumerable: true, configurable: true, value: 0, writable: true
    });`
  );

  testTransform('derived ClassDeclaration with ctor',
    `class C extends B {
      static c0 = 0;
      c1 = 1;
      c2 = 2;
      c3;
      constructor() {
        super(null);
        fn();
      }
    }`,
    `class C extends B {
      constructor() {
        (super(null), this.c1 = 1, this.c2 = 2, this);
        fn();
      }
    }
    Object.defineProperty(C, "c0", {
      enumerable: true, configurable: true, value: 0, writable: true
    });`
  );

  testTransform('preserve annotations',
    `@Annotation() class C {}`,
    `@Annotation() class C {}`
  );

  testTransform('preserve setters, getters and methods',
    `class C {
      static get sa() {}
      get a() {}
      static set sa(v) {}
      set a(v) {}
      fn() {}
      static fn() {}
    }`,
    `class C {
      static get sa() {}
      get a() {}
      static set sa(v) {}
      set a(v) {}
      fn() {}
      static fn() {}
    }`
  );

  testTransform('ClassExpression',
    `var c = class {
      static c0 = 0;
      c1 = 1;
      c2 = 2;
      c3;
    }`,
    `var c = (function() {
      let $__0 = class {
        constructor() {
          this.c1 = 1, this.c2 = 2;
        }
      };
      Object.defineProperty($__0, "c0", {
        enumerable: true, configurable: true, value: 0, writable: true
      });
      return $__0;
    })();`
  );
});
