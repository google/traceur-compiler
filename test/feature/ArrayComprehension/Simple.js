function* range() {
  for (var i = 0; i < 5; i++) {
    yield i;
  }
}

var array = [x for x of [0, 1, 2, 3]];
assertArrayEquals([0, 1, 2, 3], array);

var array2 = [x + '' + y for x of [0, 1, 2] for y of [0, 1, 2]];
assertArrayEquals(['00', '01', '02', '10', '11', '12', '20', '21', '22'],
             array2);

var array3 = [x + '' + y for x of [0, 1, 2, 3, 4]
                         for y of range()
                         if x === y];
assertArrayEquals(['00', '11', '22', '33', '44'], array3);

// Ensure this works as expression statement
[testVar for testVar of []];
