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

function checkTypes(x, y) {
  if ((typeof x !== 'number') || (typeof y !== 'number')) {
    throw new $TypeError(message);
  }
}

function assertNumber(x) {
  if (typeof x !== 'number') {
    throw new $TypeError(message);
  }
  return x;
}

function strongBitAnd(x, y) {
  checkTypes(x, y);
  return x & y;
}

function strongBitOr(x, y) {
  checkTypes(x, y);
  return x | y;
}

function strongBitXor(x, y) {
  checkTypes(x, y);
  return x ^ y;
}

function strongLeftShift(x, y) {
  checkTypes(x, y);
  return x << y;
}

function strongMinus(x, y) {
  checkTypes(x, y);
  return x - y;
}

function strongMod(x, y) {
  checkTypes(x, y);
  return x % y;
}

function strongPlus(x, y) {
  if (typeof x === 'string' && typeof y === 'string' ||
      typeof x === 'number' && typeof y === 'number') {
    return x + y;
  }
  throw new $TypeError(message);
}

function strongRightShift(x, y) {
  checkTypes(x, y);
  return x >> y;
}

function strongDiv(x, y) {
  checkTypes(x, y);
  return x / y;
}

function strongMul(x, y) {
  checkTypes(x, y);
  return x * y;
}

function strongPow(x, y) {
  checkTypes(x, y);
  return $pow(x, y);
}

function strongUnsignedRightShift(x, y) {
  checkTypes(x, y);
  return x >>> y;
}

$traceurRuntime.strongBitAnd = strongBitAnd;
$traceurRuntime.strongBitOr = strongBitOr;
$traceurRuntime.strongBitXor = strongBitXor;
$traceurRuntime.strongLeftShift = strongLeftShift;
$traceurRuntime.strongMinus = strongMinus;
$traceurRuntime.strongMod = strongMod;
$traceurRuntime.strongPlus = strongPlus;
$traceurRuntime.strongRightShift = strongRightShift;
$traceurRuntime.strongDiv = strongDiv;
$traceurRuntime.strongMul = strongMul;
$traceurRuntime.strongPow = strongPow;
$traceurRuntime.strongUnsignedRightShift = strongUnsignedRightShift;

$traceurRuntime.assertNumber = assertNumber;
