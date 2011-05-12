function ifGenerator(condition) {
  if (condition) {
    yield 1;
  }
  if (!condition) {
    yield 2;
  }
  if (condition) {
    yield 3;
  } else {
    yield 4;
  }
}

function accumulate(iterator) {
  var result = '';
  for (var value : iterator) {
    result = result + String(value);
  }
  return result;
}

// ----------------------------------------------------------------------------

assertEquals('13', accumulate(ifGenerator(true)));
assertEquals('24', accumulate(ifGenerator(false)));
