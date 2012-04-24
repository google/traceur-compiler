function f([a, b, ...c], d) {
  return [a, b, c, d];
}

assertArrayEquals([1, 2, [3, 4], 5], f([1, 2, 3, 4], 5));