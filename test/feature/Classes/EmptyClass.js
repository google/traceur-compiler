class Empty {}

// ----------------------------------------------------------------------------

var e = new Empty();
assertNotNull(e);

for (var element in e) {
  fail('Empty contains :' + element);
}

for (var element in Empty) {
  fail('Empty contains static member : ' + element);
}

var e2 = new Empty();
assertNotEquals(e, e2);
