// Copyright 2012 Traceur Authors.
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
  ASSERT_NAME,
  CREATE_NAME,
  RUNTIME,
  TRACEUR_RUNTIME
} from '../syntax/PredefinedName.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {CONST} from '../syntax/TokenType.js';
import {
  VariableDeclarationList,
  VariableStatement
} from '../syntax/trees/ParseTrees.js';
import {
  createArgumentList,
  createCallExpression,
  createEmptyArgumentList,
  createIdentifierExpression,
  createMemberExpression,
  createVariableDeclaration
} from './ParseTreeFactory.js';

/**
 * Desugars the private name syntax, @name.
 *
 * @see http://wiki.ecmascript.org/doku.php?id=strawman:syntactic_support_for_private_names
 */
export class PrivateNameSyntaxTransformer extends TempVarTransformer {

  getTransformedName_(token) {
    return this.identifierGenerator.getUniqueIdentifier(token.value);
  }

  transformAtNameExpression(tree) {
    var transformedName = this.getTransformedName_(tree.atNameToken);
    return createIdentifierExpression(transformedName);
  }

  transformNameStatement(tree) {
    // private @a, @b = expr;
    //  =>
    // const __a = traceurRuntime.createName(),
    //       __b = traceurRuntime.assertName(expr)
    var declarations = this.transformList(tree.declarations);
    return new VariableStatement(tree.location,
        new VariableDeclarationList(tree.location, CONST, declarations));
  }

  transformAtNameDeclaration(tree) {
    var transformedName = this.getTransformedName_(tree.atNameToken);

    var args, name;
    if (tree.initializer) {
      args = createArgumentList(this.transformAny(tree.initializer));
      name = ASSERT_NAME;
    } else {
      args = createEmptyArgumentList();
      name = CREATE_NAME;
    }

    return createVariableDeclaration(transformedName,
      createCallExpression(
        createMemberExpression(TRACEUR_RUNTIME, name),
        args));
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   */
  static transformTree(identifierGenerator, tree) {
    return new PrivateNameSyntaxTransformer(identifierGenerator).
        transformAny(tree);
  }
}
