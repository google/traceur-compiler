trait SimpleValue {
  get value () { return this.getValue(); }
  set value(newValue) {
    this.setValue(newValue);
  }

  requires getValue;
  requires setValue;
} 

class MixinSimpleValue {
  v;

  mixin SimpleValue;

  getValue() {
    return this.v;
  }
  setValue(x) {
    this.v = x;
  }
} 

// ----------------------------------------------------------------------------

var obj = new MixinSimpleValue();
obj.v = 5;
assertEquals(5, obj.value);

obj.setValue(7);
assertEquals(7, obj.v);
