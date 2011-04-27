var SingletonInstance = { }
var SingletonInstanceTwo = { }

class NewA {
  class new() { return SingletonInstance; }
}

class NewB : NewA {
}

class SkipNewA {
  class new() { return SingletonInstance; }
}

class SkipNewB : SkipNewA {}

class SkipNewC : SkipNewB {
  class new() { return SingletonInstanceTwo; }
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
