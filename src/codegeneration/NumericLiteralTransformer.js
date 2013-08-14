// Copyright 2013 Traceur Authors.
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

import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import {
  GetAccessor,
  LiteralExpression,
  PropertyMethodAssignment,
  PropertyNameAssignment,
  SetAccessor,
} from '../syntax/trees/ParseTrees.js';
import {LiteralToken} from '../syntax/LiteralToken.js';
import {
  NUMBER
} from '../syntax/TokenType.js';

function needsTransform(token) {
  return token.type === NUMBER && /^0[bBoO]/.test(token.value);
}

function transformToken(token) {
  return new LiteralToken(NUMBER,
                          String(token.processedValue),
                          token.location);
}

export class NumericLiteralTransformer extends ParseTreeTransformer {
  transformLiteralExpression(tree) {
    var token = tree.literalToken;
    if (needsTransform(token))
      return new LiteralExpression(tree.location, transformToken(token));
    return tree;
  }

  transformPropertyNameAssignment(tree) {
    var token = tree.name;
    if (needsTransform(token)) {
      var value = this.transformAny(tree.value);
      return new PropertyNameAssignment(
          tree.location,
          transformToken(token),
          value);
    }
    return super.transformPropertyNameAssignment(tree);
  }

  transformGetAccessor(tree) {
    var token = tree.name;
    if (needsTransform(token)) {
      var body = this.transformAny(tree.body);
      return new GetAccessor(
          tree.location,
          tree.isStatic,
          transformToken(token),
          body);
    }
    return super.transformGetAccessor(tree);
  }

  transformSetAccessor(tree) {
    var token = tree.name;
    if (needsTransform(token)) {
      var parameter = this.transformAny(tree.parameter);
      var body = this.transformAny(tree.body);
      return new SetAccessor(
          tree.location,
          tree.isStatic,
          transformToken(token),
          parameter,
          body);
    }
    return super.transformSetAccessor(tree);
  }

  transformPropertyMethodAssignment(tree) {
    var token = tree.name;
    if (needsTransform(token)) {
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var functionBody = this.transformAny(tree.functionBody);
      return new PropertyMethodAssignment(
          tree.location,
          tree.isStatic,
          tree.isGenerator,
          transformToken(token),
          formalParameterList,
          functionBody);
    }
    return super.transformPropertyMethodAssignment(tree);
  }

  /**
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  static transformTree(tree) {
    return new NumericLiteralTransformer().transformAny(tree);
  }
}
