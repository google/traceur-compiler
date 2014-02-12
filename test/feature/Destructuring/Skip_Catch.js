// Skip.
// https://github.com/google/traceur-compiler/issues/759

try {
  throw [0];
} catch ([innerX]) {

}

innerX;
