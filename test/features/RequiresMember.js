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
