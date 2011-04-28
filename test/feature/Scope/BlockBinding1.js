function testBlock() {
  {
    let z = 'z value';
  }

  try {
    var x = z;
  } catch (e) {
    return 'pass';
  }
  return 'fail';
}

// ----------------------------------------------------------------------------

assertEquals('pass', testBlock());
