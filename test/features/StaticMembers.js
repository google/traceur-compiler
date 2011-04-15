class StaticMembers {
  class var staticField = 1;
  class staticMethod(value) {
    StaticMembers.staticField = value;
  }
  class get staticProp () { return StaticMembers.staticField; }
  class set staticProp(value) { StaticMembers.staticField = value; }

  var instanceField;
  instanceMethod(value) {
    StaticMembers.staticMethod(value + 1);
    this.instanceField = StaticMembers.staticField + 1;
  }
  
  class getStaticProp() { return StaticMembers.staticProp; }
  class setStaticProp(value) { StaticMembers.staticProp = value; } 
}
