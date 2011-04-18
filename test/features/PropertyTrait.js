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
