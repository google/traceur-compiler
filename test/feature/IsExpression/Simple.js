assertTrue(1 is 1);
assertTrue(0 is 0);
assertTrue(-0 is -0);
assertTrue(NaN is NaN);
assertTrue(Infinity is Infinity);
assertTrue(-Infinity is -Infinity);

assertTrue(0 isnt -0);
assertTrue(-0 isnt 0);
assertFalse(0 is -0);
assertFalse(-0 is 0);
assertTrue(Infinity isnt -Infinity);
assertTrue(-Infinity isnt Infinity);

assertTrue(true is true);
assertTrue(false is false);

assertTrue(null is null);
assertTrue(undefined is undefined);

assertTrue('' is '');
assertTrue('a' is 'a');

{
  var object = {};
  assertTrue(object is object);
}

assertFalse(new String('a') is new String('a'));
assertFalse(new Boolean is new Boolean);
assertFalse(new Number is new Number);
assertFalse(new Date(0) is new Date(0));
assertFalse(/re/ is /re/);
assertFalse({} is {});
assertFalse([] is []);
assertFalse(function() {} is function() {});

assertTrue(new String('a') isnt new String('a'));
assertTrue(new Boolean isnt new Boolean);
assertTrue(new Number isnt new Number);
assertTrue(new Date(0) isnt new Date(0));
assertTrue(/re/ isnt /re/);
assertTrue({} isnt {});
assertTrue([] isnt []);
assertTrue(function() {} isnt function() {});
