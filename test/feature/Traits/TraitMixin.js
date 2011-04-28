trait FirstMixin {
  first() { return 'first'; }
}

trait SecondMixin {
  mixin FirstMixin;
  second() { return 'second'; }
}

class MixinOfMixinClass {
  mixin SecondMixin;
}

// ----------------------------------------------------------------------------

var obj = new MixinOfMixinClass();
assertEquals('first', obj.first());
assertEquals('second', obj.second());
