import {isStopIteration} from '@iter';

// A hack to give useful error messages upon test failure.
function assertCish(f) {
  if (!f()) {
    fail('assertion failed: ' + f.toString());
  }
}

function checkInvariants(StopIteration, GeneratorReturn, instanceofCheck) {
  assertCish(() => 'object' === typeof StopIteration);
  assertCish(() => 'function' === typeof GeneratorReturn);
  assertCish(() => isStopIteration(StopIteration));
  assertCish(() => isStopIteration(new GeneratorReturn()));
  if (instanceofCheck) {
    assertCish(() => StopIteration instanceof GeneratorReturn);
  }

  var g = function*() { yield 42; }();
  var gr = assertThrows(() => (g.next(), g.next()));
  assertCish(() => StopIteration === gr);
  assertCish(() => isStopIteration(gr));

  var h = function*() { return 42; }();
  var hr = assertThrows(() => h.next());
  assertCish(() => hr instanceof GeneratorReturn);
  assertCish(() => 42 === hr.value);
}

//-----------------------------------------------------------------------------

var origStopIteration = StopIteration;
var origGeneratorReturn = $traceurRuntime.GeneratorReturn;

//----

checkInvariants(StopIteration, $traceurRuntime.GeneratorReturn, false);

//-----------------------------------------------------------------------------

var tmp = {}, tmpStopIteration = {};

$traceurRuntime.setStopIteration(tmpStopIteration, tmp);

//----

assertEquals(tmpStopIteration, tmp.StopIteration);
checkInvariants(tmp.StopIteration, $traceurRuntime.GeneratorReturn, false);

//-----------------------------------------------------------------------------

$traceurRuntime.setStopIteration(undefined, tmp);

//----

checkInvariants(tmp.StopIteration, $traceurRuntime.GeneratorReturn, true);

//-----------------------------------------------------------------------------

var prevStopIteration = tmp.StopIteration;
var prevGeneratorReturn = $traceurRuntime.GeneratorReturn;

$traceurRuntime.setGeneratorReturn(function(v) { this.value = v; }, tmp);

//----

assertNotEquals(prevStopIteration, tmp.StopIteration);
assertNotEquals(prevGeneratorReturn, $traceurRuntime.GeneratorReturn);

checkInvariants(tmp.StopIteration, $traceurRuntime.GeneratorReturn, true);

//-----------------------------------------------------------------------------

// Restore original state to avoid confounding other tests.
$traceurRuntime.setGeneratorReturn(origGeneratorReturn);
$traceurRuntime.setStopIteration(origStopIteration);

//----

checkInvariants(StopIteration, $traceurRuntime.GeneratorReturn, false);
