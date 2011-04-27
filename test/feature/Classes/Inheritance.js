class SimpleBase {}
class SimpleDerived : SimpleBase {}

// ----------------------------------------------------------------------------

var derived = new SimpleDerived();
assertTrue(derived instanceof SimpleDerived);
assertTrue(derived instanceof SimpleBase);
assertTrue(derived instanceof Object);
