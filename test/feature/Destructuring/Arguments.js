function destructureArguments(x, y) {
  [arguments[0], [arguments[1]]] = [1, [2]]
  return x + y;
}

// ----------------------------------------------------------------------------

assertEquals(3, destructureArguments(1, 2));
