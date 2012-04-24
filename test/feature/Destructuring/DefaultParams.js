function f([x] = [1], {y} = {y: 2}) {
  return x + y;
}

assertEquals(3, f());