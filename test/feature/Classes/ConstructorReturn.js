var SingletonInstance = { }
var SingletonInstanceTwo = { }

class NewA {
  static constructor() { return SingletonInstance; }
}

class NewB : NewA {
}

class SkipNewA {
  static constructor() { return SingletonInstance; }
}

class SkipNewB : SkipNewA {}

class SkipNewC : SkipNewB {
  static constructor() { return SingletonInstanceTwo; }
}

class SkipNewD : SkipNewC {}

// ----------------------------------------------------------------------------

var na = new NewA();
var nb = new NewB();

assertEquals(true, na === SingletonInstance);
assertEquals(true, nb === SingletonInstance);

var a = new SkipNewA();
var b = new SkipNewB();
var c = new SkipNewC();
var d = new SkipNewD();

assertEquals(SingletonInstance, a);
assertEquals(SingletonInstance, b);
assertEquals(SingletonInstanceTwo, c);
assertEquals(SingletonInstanceTwo, d);
