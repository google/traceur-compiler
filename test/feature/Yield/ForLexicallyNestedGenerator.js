function forLexicallyNestedGenerator() {
  yield for (function() { yield [1,2,3]; yield for [4,5,6]; })();
}

function accumulate(iterator) {
  var result = '';
  for (var value : iterator) {
    result = result + String(value);
  }
  return result;
}

// ----------------------------------------------------------------------------

assertEquals('1,2,3456', accumulate(forLexicallyNestedGenerator()));
