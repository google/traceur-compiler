function tryCatchGenerator() {
  var x;
  try {
    yield 1;
    throw 2;
    yield 3;
  } catch (e) {
    x = e;
  }
  yield x;
}

function accumulate(iterator) {
  var result = '';
  for (var value : iterator) {
    result = result + String(value);
  }
  return result;
}

// ----------------------------------------------------------------------------

assertEquals('12', accumulate(tryCatchGenerator()));
