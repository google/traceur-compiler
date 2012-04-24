// Should not compile.
// Error: z is not defined

function testBlock() {
  {
    let z = 'z value';
  }

  var x = z;
}

// ----------------------------------------------------------------------------

