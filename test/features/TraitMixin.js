trait FirstMixin {
  first() { return "first"; }
}

trait SecondMixin {
  mixin FirstMixin;
  second() { return "second"; }
}

class MixinOfMixinClass {
  mixin SecondMixin;
}


