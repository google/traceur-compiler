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

import {
  BindingIdentifier,
  IdentifierExpression
} from '../syntax/trees/ParseTrees';
import {IdentifierToken} from '../syntax/IdentifierToken';

/**
 * Gets the string value of an identifier expression, binding identifier or an
 * identifier token.
 * @param {BindingIdentifier|IdentifierToken|string} name
 * @returns {string}
 */
export function getVariableName(name) {
  if (name instanceof IdentifierExpression) {
    name = name.identifierToken;
  } else if (name instanceof BindingIdentifier) {
    name = name.identifierToken;
  }
  if (name instanceof IdentifierToken) {
    name = name.value;
  }
  return name;
}
