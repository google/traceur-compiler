// Should not compile.
// Error: innerX is not defined
(function() {
  try {
    throw [0];
  } catch ([innerX]) {

  }
}());
(function() {
  innerX;
}());
