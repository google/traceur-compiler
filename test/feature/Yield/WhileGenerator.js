function whileGenerator(max, continueValue, breakValue) {
  var i = 0;
  while (i < max) {
    i++;
    if (i == continueValue) {
      continue;
    }
    if (i == breakValue) {
      break;
    }
    yield i;
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

assertEquals('13', accumulate(whileGenerator(10, 2, 4)));
