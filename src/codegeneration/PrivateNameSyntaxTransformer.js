// Copyright 2012 Google Inc.
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

import PredefinedName from '../syntax/PredefinedName.js';
import TempVarTransformer from 'TempVarTransformer.js';
import TokenType from '../syntax/TokenType.js';
import {
  createArgumentList,
  createCallExpression,
  createEmptyArgumentList,
  createIdentifierExpression,
  createMemberExpression,
  createVariableDeclaration
} from 'ParseTreeFactory.js';
import createObject from '../util/util.js';
import trees from '../syntax/trees/ParseTrees.js';

var VariableDeclarationList = trees.VariableDeclarationList;
var VariableStatement = trees.VariableStatement;


/**
 * Desugars the private name syntax, @name.
 *
 * @see http://wiki.ecmascript.org/doku.php?id=strawman:syntactic_support_for_private_names
 *
 * @param {UniqueIdentifierGenerator} identifierGenerator
 * @extends {TempVarTransformer}
 * @constructor
 */
export function PrivateNameSyntaxTransformer(identifierGenerator) {
  TempVarTransformer.call(this, identifierGenerator);
}

/**
 * @param {UniqueIdentifierGenerator} identifierGenerator
 * @param {ParseTree} tree
 */
PrivateNameSyntaxTransformer.transformTree = function(identifierGenerator,
                                                      tree) {
  return new PrivateNameSyntaxTransformer(identifierGenerator).
      transformAny(tree);
};

var base = TempVarTransformer.prototype;
PrivateNameSyntaxTransformer.prototype = createObject(base, {

  getTransformedName_: function(token) {
    return this.identifierGenerator.getUniqueIdentifier(token.value);
  },

  transformAtNameExpression: function(tree) {
    var transformedName = this.getTransformedName_(tree.atNameToken);
    return createIdentifierExpression(transformedName);
  },

  transformNameStatement: function(tree) {
    // private @a, @b = expr;
    //  =>
    // const __a = traceur.runtime.createName(),
    //       __b = traceur.runtime.assertName(expr)
    var declarations = this.transformList(tree.declarations);
    return new VariableStatement(tree.location,
        new VariableDeclarationList(tree.location, TokenType.CONST,
                                    declarations));
  },

  transformAtNameDeclaration: function(tree) {
    var transformedName = this.getTransformedName_(tree.atNameToken);

    var args, name;
    if (tree.initializer) {
      args = createArgumentList(this.transformAny(tree.initializer));
      name = PredefinedName.ASSERT_NAME;
    } else {
      args = createEmptyArgumentList();
      name = PredefinedName.CREATE_NAME;
    }

    return createVariableDeclaration(transformedName,
      createCallExpression(
        createMemberExpression(
            PredefinedName.TRACEUR,
            PredefinedName.RUNTIME,
            name),
        args));
  }
});
