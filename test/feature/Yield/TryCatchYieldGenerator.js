// yield form within a catch block
function tryCatchYieldGenerator() {
  var x = 3;
  try {
    throw 5;
  } catch (e) {
    yield e * x;
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

assertEquals('15', accumulate(tryCatchYieldGenerator()));
