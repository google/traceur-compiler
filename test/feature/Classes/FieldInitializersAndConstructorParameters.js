class FieldInitializersAndConstructorParameters {
  field = constructorArg;
  constructor(constructorArg) { }
}

// ----------------------------------------------------------------------------

var constructorArg = 12;
var obj = new FieldInitializersAndConstructorParameters(42);
assertEquals(12, obj.field);
