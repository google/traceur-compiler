function endYieldGenerator() {
  yield 1;
  yield;
  yield 2;
}

function accumulate(iterator) {
  var result = '';
  for (var value : iterator) {
    result = result + String(value);
  }
  return result;
}

// ----------------------------------------------------------------------------

assertEquals('1', accumulate(endYieldGenerator()));
