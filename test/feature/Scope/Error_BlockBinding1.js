// Should not compile.
// Options: --free-variable-checker
// Error: inner is not defined

function testBlock() {
  {
    let inner = 'inner value';
  }

  var x = inner;
}

// ----------------------------------------------------------------------------
