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
  assertEquals(0, a.i);
  a.inc();
  assertEquals(1, a.i);

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
assertEquals(42, b.c.d);

// DeclarationAlias
module b2 from b;
assertEquals(42, b2.c.d);

// NestedDeclarations
module c from b.c;
assertEquals(42, c.d);

// NestedDeclarations1
module d from c;
assertEquals(42, d.d);

// NestedDeclarations2
module d2 from c.c2;
assertEquals(43, d2.d2);

// ExportModuleDeclaration
module e {
  module n {
    export var val = 44;
  }
  export module o from n, o2 from n;
}
assertEquals(44, e.o.val);
assertEquals(44, e.o2.val);

// ExportLexicalModule
module m2 {
  module n {
    export var name = 'n';
  }
  export module n2 {
    export module o2 from n;
  }
}
assertEquals('n', m2.n2.o2.name);

// ExportLexicalModule2
module p2 {
  module q {
    export var name = 'q';
  }
  export module q2 {
    export {name: name} from q;
  }
}
assertEquals('q', p2.q2.name);

// ExportIdentifier
module f {
  var g = 'g';
  export g;
}
assertEquals('g', f.g);

// ExportModuleExpression
module h {
  module i {
    export var j = 'j';
    export var l = 'l';
  }
  export j from i, {j: k, l} from i;
}
assertEquals('j', h.j);
assertEquals('j', h.k);
assertEquals('l', h.l);

// ExportSpecifierSet
module m {
  var n = 'n';

  module o {
    export var q = 'q';
  }

  export n, {o: n2}, q from o, {q: p} from o;
}
assertEquals('n', m.n);
assertEquals('q', m.n2.q);
assertEquals('q', m.p);
assertEquals('q', m.q);
