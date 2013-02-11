function* tryCatchGenerator() {
  var x;
  try {
    yield 1;
    throw 2;
    yield 3;
  } catch (e) {
    x = e;
  }
  yield x;
}

function accumulate(iterator) {
  var result = '';
  for (var value of iterator) {
    result += value;
  }
  return result;
}

// ----------------------------------------------------------------------------

assertEquals('12', accumulate(tryCatchGenerator()));

// ----------------------------------------------------------------------------

function* throwGenerator() {
  yield 1;
  throw 2;
  yield 3;
}

function* throwFromCatchGenerator() {
  try {
    throw 1;
  } catch(e) {
    yield e;
    throw 2;
    yield 3;
  }
}

function* throwFromFinallyGenerator() {
  try {
    yield 1;
  } finally {
    throw 2;
  }
  yield 3;
}

function accumulateCatch(iterator) {
  var result = '';
  var i;
  for (i = 0; i < 8; i++) {
    try {
      for (var value of iterator) {
        result += value;
      }
    } catch(e) {
      result += ' [' + e + ']';
    }
  }
  return result;
}

// ----------------------------------------------------------------------------

assertEquals('1 [2]', accumulateCatch(throwGenerator()));
assertEquals('1 [2]', accumulateCatch(throwFromCatchGenerator()));
assertEquals('1 [2]', accumulateCatch(throwFromFinallyGenerator()));

// ----------------------------------------------------------------------------

// out-of-band info
var oob;

function* throwOOBGen() {
  try {
    yield 1;
    throw 2;
    oob += 3;
  } finally {
    oob += 4;
  }
  oob += 5;
  yield 6;
}

function* throwOOB2xGen() {
  try {
    try {
      yield 1;
      throw 2;
      oob += 3;
    } finally {
      oob += 4;
    }
    oob += 5;
    yield 6;
  } catch(e) {
    yield 7 + '(' + e + ')';
    throw 8;
  } finally {
    oob += 9;
  }
}

function accumulateCatchOOB(iterator) {
  var result = '';
  var i;

  for (i = 0; i < 4; i++) {
    oob = '';
    try {
      for (var value of iterator) {
        result += value;
      }
    } catch(e) {
      result += ' [' + e + ']';
    } finally {
      result += ' <' + oob + '>';
    }
  }
  return result;
}

// ----------------------------------------------------------------------------

assertEquals('1 [2] <4> <> <> <>', accumulateCatchOOB(throwOOBGen()));
assertEquals('17(2) [8] <49> <> <> <>', accumulateCatchOOB(throwOOB2xGen()));
