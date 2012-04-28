// Should not compile.
// Error: innerX is not defined

try {
  throw [0];
} catch ([innerX]) {

}

innerX;
