module a {
  export var i = 0;
  export function inc() {
    i++;
  }
}

(function() {
  // TODO(arv): Modules are strict. The codegen for modules should ensure that
  // they are strict.
  'use strict';
  assert.equal(0, a.i);
  a.inc();
  assert.equal(1, a.i);

  assertThrows(function() {
    a.i = 2;
  });
})();

// NestedExports
module b {
  export module c {
    export var d = 42;
    export module c2 {
      export var d2 = 43;
    }
  }
}
assert.equal(42, b.c.d);

// DeclarationAlias
module b2 from b;
assert.equal(42, b2.c.d);

// NestedDeclarations
module c {
  export * from b
}
assert.equal(42, c.c.d);

// NestedDeclarations1
module d from c;
assert.equal(42, d.c.d);

// ExportModuleDeclaration
module e {
  module n {
    export var val = 44;
  }
  export module o from n;
  export module o2 from n;
}
assert.equal(44, e.o.val);
assert.equal(44, e.o2.val);

// ExportLexicalModule
module m2 {
  module n {
    export var name = 'n';
  }
  export module n2 {
    export module o2 from n;
  }
}
assert.equal('n', m2.n2.o2.name);

// ExportLexicalModule2
module p2 {
  module q {
    export var name = 'q';
  }
  export module q2 {
    export {name as name} from q;
  }
}
assert.equal('q', p2.q2.name);

// ExportIdentifier
module f {
  var g = 'g';
  export {g};
}
assert.equal('g', f.g);

// ExportModuleExpression
module h {
  module i {
    export var j = 'j';
    export var l = 'l';
  }
  export {j} from i;
  export {j as k, l} from i;
}
assert.equal('j', h.j);
assert.equal('j', h.k);
assert.equal('l', h.l);

// ExportSpecifierSet
module m {
  var n = 'n';

  module o {
    export var q = 'q';
  }

  export {n};
  export {o as n2};
  export {q} from o;
  export {q as p} from o;
}
assert.equal('n', m.n);
assert.equal('q', m.n2.q);
assert.equal('q', m.p);
assert.equal('q', m.q);
