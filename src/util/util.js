// Copyright 2012 Google Inc.
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

/**
 * Similar to {@code Object.create} but instead of taking a property
 * descriptor it takes an ordinary object.
 * @param {Object} proto The object acting as the proto.
 * @param {Object} obj The object describing the fields of the object.
 * @return {Object} A new object that has the same propertieas as {@code obj}
 *     and its proto set to {@code proto}.
 */
export function createObject(proto, obj) {
  var newObject = Object.create(proto);
  Object.getOwnPropertyNames(obj).forEach((name) => {
    Object.defineProperty(newObject, name,
                          Object.getOwnPropertyDescriptor(obj, name));
  });
  return newObject;
}
