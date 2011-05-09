class StaticMembers {
  class var staticField = 1;
  class staticMethod(value) {
    class.staticField = value;
  }
  class get staticProp () { return class.staticField; }
  class set staticProp(value) { class.staticField = value; }

  var instanceField;
  instanceMethod(value) {
    class.staticMethod(value + 1);
    this.instanceField = class.staticField + 1;
  }

  class getStaticProp() { return class.staticProp; }
  class setStaticProp(value) { class.staticProp = value; }
}

// ----------------------------------------------------------------------------

assertEquals(1, StaticMembers.staticField);
assertEquals(1, StaticMembers.staticProp);
assertEquals(1, StaticMembers.getStaticProp());

StaticMembers.staticMethod(2);
assertEquals(2, StaticMembers.staticField);
assertEquals(2, StaticMembers.staticProp);
assertEquals(2, StaticMembers.getStaticProp());

StaticMembers.staticProp = 3;
assertEquals(3, StaticMembers.staticField);
assertEquals(3, StaticMembers.staticProp);
assertEquals(3, StaticMembers.getStaticProp());

StaticMembers.setStaticProp(4);
assertEquals(4, StaticMembers.staticField);
assertEquals(4, StaticMembers.staticProp);
assertEquals(4, StaticMembers.getStaticProp());

assertUndefined(StaticMembers.instanceField);

var obj = new StaticMembers();
assertUndefined(obj.instanceField);

obj.instanceMethod(5);
assertEquals(7, obj.instanceField);
assertEquals(6, StaticMembers.staticField);
assertEquals(6, StaticMembers.staticProp);
assertEquals(6, StaticMembers.getStaticProp());
