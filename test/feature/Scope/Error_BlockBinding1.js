// Error: :8:11: inner is not defined

function testBlock() {
  {
    let inner = 'inner value';
  }

  var x = inner;
}

// ----------------------------------------------------------------------------

