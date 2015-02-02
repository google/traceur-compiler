// Copyright 2014 Traceur Authors.
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

// ### Primitive value types
var types = {
  any: {name: 'any'},
  boolean: {name: 'boolean'},
  number: {name: 'number'},
  string: {name: 'string'},
  symbol: {name: 'symbol'},
  void: {name: 'void'},
};

class GenericType {
  constructor(type, argumentTypes) {
    this.type = type;
    this.argumentTypes = argumentTypes;
  }
}

var typeRegister = Object.create(null);

/**
 * Returns an instance of {@code GenericType}.
 *
 * A same instance is returned across calls given the same
 * {@code type} and {@code argumentTypes}.
 *
 * @param type
 * @param argumentTypes
 * @returns {GenericType}
 */
function genericType(type, ...argumentTypes) {
  var typeMap = typeRegister;

  var key = $traceurRuntime.getOwnHashObject(type).hash;
  if (!typeMap[key]) {
    typeMap[key] = Object.create(null);
  }
  typeMap = typeMap[key];

  for (var i = 0; i < argumentTypes.length - 1; i++) {
    key = $traceurRuntime.getOwnHashObject(argumentTypes[i]).hash;
    if (!typeMap[key]) {
      typeMap[key] = Object.create(null);
    }
    typeMap = typeMap[key];
  }

  var tail = argumentTypes[argumentTypes.length - 1];
  key = $traceurRuntime.getOwnHashObject(tail).hash;
  if (!typeMap[key]) {
    typeMap[key] = new GenericType(type, argumentTypes);
  }

  return typeMap[key];
}

$traceurRuntime.GenericType = GenericType;
$traceurRuntime.genericType = genericType;
$traceurRuntime.type = types;
