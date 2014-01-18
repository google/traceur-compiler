// Copyright 2014 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  CALL_EXPRESSION,
  IDENTIFIER_EXPRESSION,
  MEMBER_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {parseExpression} from './PlaceholderParser';
import {options} from '../options';

export default function assertType(expression, typeAnnotation) {
  if (expression === null || typeAnnotation === null || !options.typeAssertions)
    return expression;
  return parseExpression `assert.type(${expression}, ${typeAnnotation.name})`;
}

