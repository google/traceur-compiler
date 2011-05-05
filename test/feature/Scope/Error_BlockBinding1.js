// Should not compile.

function testBlock() {
  {
    let z = 'z value';
  }

  var x = z;
}

// ----------------------------------------------------------------------------

