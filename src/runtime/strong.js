// Copyright 2015 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This file cannot be strong mode.

const $TypeError = TypeError;
const $pow = Math.pow;

const message = 'In strong mode, implicit conversions are deprecated';

function checkBothNumbers(x, y) {
  if ((typeof x !== 'number') || (typeof y !== 'number')) {
    throw new $TypeError(message);
  }
}

function checkBothStringsOrBothNumbers(x, y) {
  if (typeof x === 'string' && typeof y === 'string' ||
      typeof x === 'number' && typeof y === 'number') {
    return;
  }
  throw new $TypeError(message);
}

function assertNumber(x) {
  if (typeof x !== 'number') {
    throw new $TypeError(message);
  }
  return x;
}

function strongBitAnd(x, y) {
  checkBothNumbers(x, y);
  return x & y;
}

function strongBitOr(x, y) {
  checkBothNumbers(x, y);
  return x | y;
}

function strongBitXor(x, y) {
  checkBothNumbers(x, y);
  return x ^ y;
}

function strongLeftShift(x, y) {
  checkBothNumbers(x, y);
  return x << y;
}

function strongMinus(x, y) {
  checkBothNumbers(x, y);
  return x - y;
}

function strongMod(x, y) {
  checkBothNumbers(x, y);
  return x % y;
}

function strongRightShift(x, y) {
  checkBothNumbers(x, y);
  return x >> y;
}

function strongDiv(x, y) {
  checkBothNumbers(x, y);
  return x / y;
}

function strongMul(x, y) {
  checkBothNumbers(x, y);
  return x * y;
}

function strongPow(x, y) {
  checkBothNumbers(x, y);
  return $pow(x, y);
}

function strongUnsignedRightShift(x, y) {
  checkBothNumbers(x, y);
  return x >>> y;
}

function strongPlus(x, y) {
  checkBothStringsOrBothNumbers(x, y);
  return x + y;
}

function strongLessThan(x, y) {
  checkBothStringsOrBothNumbers(x, y);
  return x < y;
}

function strongLessThanEqual(x, y) {
  checkBothStringsOrBothNumbers(x, y);
  return x <= y;
}

function strongGreaterThan(x, y) {
  checkBothStringsOrBothNumbers(x, y);
  return x > y;
}

function strongGreaterThanEqual(x, y) {
  checkBothStringsOrBothNumbers(x, y);
  return x >= y;
}

$traceurRuntime.strongBitAnd = strongBitAnd;
$traceurRuntime.strongBitOr = strongBitOr;
$traceurRuntime.strongBitXor = strongBitXor;
$traceurRuntime.strongLeftShift = strongLeftShift;
$traceurRuntime.strongMinus = strongMinus;
$traceurRuntime.strongMod = strongMod;
$traceurRuntime.strongRightShift = strongRightShift;
$traceurRuntime.strongDiv = strongDiv;
$traceurRuntime.strongMul = strongMul;
$traceurRuntime.strongPow = strongPow;
$traceurRuntime.strongUnsignedRightShift = strongUnsignedRightShift;

$traceurRuntime.strongPlus = strongPlus;
$traceurRuntime.strongLessThan = strongLessThan;
$traceurRuntime.strongLessThanEqual = strongLessThanEqual;
$traceurRuntime.strongGreaterThan = strongGreaterThan;
$traceurRuntime.strongGreaterThanEqual = strongGreaterThanEqual;

$traceurRuntime.assertNumber = assertNumber;
