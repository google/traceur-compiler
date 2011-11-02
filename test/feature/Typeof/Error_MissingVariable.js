
assertEquals('number', typeof 42);
assertEquals('string', typeof 'hello');
assertEquals('boolean', typeof true);
assertEquals('null', typeof null);
assertEquals('undefined', typeof undefined);
assertEquals('object', typeof {});
assertEquals('function', typeof function() {});

var numberVar = 42;
var stringVar = 'hello';
var booleanVar = true;
var nullVar = null;
var undefinedVar = undefined;
var objectVar = {};
var functionVar = function() {};

assertEquals('number', typeof numberVar);
assertEquals('string', typeof stringVar);
assertEquals('boolean', typeof booleanVar);
assertEquals('null', typeof nullVar);
assertEquals('undefined', typeof undefinedVar);
assertEquals('object', typeof objectVar);
assertEquals('function', typeof functionVar);

var object = {
  number: 42,
  string: 'hello',
  boolean: true,
  null: null,
  undefined: undefined,
  object: {},
  function: function() {},
};

assertEquals('number', typeof object.number);
assertEquals('string', typeof object.string);
assertEquals('boolean', typeof object.boolean);
assertEquals('null', typeof object.null);
assertEquals('undefined', typeof object.undefined);
assertEquals('object', typeof object.object);
assertEquals('function', typeof object.function);