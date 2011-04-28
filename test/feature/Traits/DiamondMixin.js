trait CommonTrait {
  common() { return 'common'; }
}

trait MixinCommonFirst {
  mixin CommonTrait;
  first() { return 'first'; }
}

trait MixinCommonSecond {
  mixin CommonTrait;
  second() { return 'second'; }
}

class DiamondMixinClass {
  mixin MixinCommonFirst;
  mixin MixinCommonSecond;
}

// ----------------------------------------------------------------------------

var obj = new DiamondMixinClass();
assertEquals('common', obj.common());
assertEquals('first', obj.first());
assertEquals('second', obj.second());
