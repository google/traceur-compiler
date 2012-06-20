function accumulate(iterator) {
  var result = '';
  for (var value of iterator) {
    result = result + String(value);
  }
  return result;
}

function* range() {
  for (var i = 0; i < 5; i++) {
    yield i;
  }
}

var iter = (x for x of [0, 1, 2, 3, 4]);
assertEquals('01234', accumulate(iter));

var iter2 = (x + '' + y for x of [0, 1, 2, 3, 4] for y of [0, 1, 2, 3, 4]);
assertEquals('00010203041011121314202122232430313233344041424344',
             accumulate(iter2));

var iter3 = (x + '' + y for x of [0, 1, 2, 3, 4]
                        for y of range()
                        if x === y);
assertEquals('0011223344', accumulate(iter3));

// Ensure this works as expression statement
(testVar for testVar of []);
