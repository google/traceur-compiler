class StaticMembers {
  static var staticField = 1;
  static staticMethod(value) {
    StaticMembers.staticField = value;
  }
  static get staticProp () { return StaticMembers.staticField; }
  static set staticProp(value) { StaticMembers.staticField = value; }

  var instanceField;
  instanceMethod(value) {
    StaticMembers.staticMethod(value + 1);
    this.instanceField = StaticMembers.staticField + 1;
  }
  
  static getStaticProp() { return StaticMembers.staticProp; }
  static setStaticProp(value) { StaticMembers.staticProp = value; } 
}
