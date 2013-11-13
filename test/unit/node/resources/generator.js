function* f(x, y) {
  yield x;
  yield y;
}

var result = [];

for (var value of f(1, 2)) {
  result.push(value);
}

for (var value of (for (x of f(3, 4)) x * x)) {
  result.push(value);
}
