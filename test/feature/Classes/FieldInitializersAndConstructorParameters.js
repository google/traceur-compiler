class FieldInitializersAndConstructorParameters {
  field = constructorArg;
  new(constructorArg) { }
}

// ----------------------------------------------------------------------------

var constructorArg = 12;
var obj = new FieldInitializersAndConstructorParameters(42);
assertEquals(12, obj.field);
