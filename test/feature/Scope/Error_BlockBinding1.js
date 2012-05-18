// Should not compile.
// Error: inner is not defined

function testBlock() {
  {
    let inner = 'inner value';
  }

  var x = inner;
}

// ----------------------------------------------------------------------------

