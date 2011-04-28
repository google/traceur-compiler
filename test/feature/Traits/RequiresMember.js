trait TraitWithRequires {
  requires requiresMember;

  member() {
    return this.requiresMember();
  }
}

class ClassMixinRequires {
  mixin TraitWithRequires;

  requiresMember () { return 42; }
}

// ----------------------------------------------------------------------------

var obj = new ClassMixinRequires();
assertEquals(42, obj.member());
assertEquals(42, obj.requiresMember());
