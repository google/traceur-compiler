trait TraitRequiresAndInheritance {
  requires r;

  function callR() { return this.r(); }
}

class BaseImplementsRequires {
  function r() { return 'base r'; }
}

class DerivedWithRequires extends BaseImplementsRequires {
  mixin TraitRequiresAndInheritance;
}

// ----------------------------------------------------------------------------

var obj = new DerivedWithRequires();
assertEquals('base r', obj.callR());
