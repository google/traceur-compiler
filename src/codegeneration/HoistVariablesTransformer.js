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
  AnonBlock,
  FunctionBody,
  ForInStatement,
  ForOfStatement,
  VariableDeclarationList,
  VariableStatement
} from '../syntax/trees/ParseTrees';
import {
  BINDING_IDENTIFIER,
  VARIABLE_DECLARATION_LIST
} from '../syntax/trees/ParseTreeType';
import {ParseTreeTransformer} from './ParseTreeTransformer';
import {VAR} from '../syntax/TokenType';
import {assert} from '../util/assert';
import {
  createAssignmentExpression,
  createCommaExpression,
  createExpressionStatement,
  createIdentifierExpression as id,
  createVariableDeclaration
} from './ParseTreeFactory';
import {prependStatements} from './PrependStatements';

/**
 * Hoists variables to the top of the function body. This only transforms the
 * current function scope. This does not yet handle destructuring so
 * destructuring should have been transformed away earlier.
 *
 *   function f() {
 *     foo();
 *     var x = 1, y, z = 2;
 *     for (var w in obj) {}
 *   }
 *
 * =>
 *
 *   function f() {
 *     var x, y, z, w;
 *     foo();
 *     x = 1, z = 2;
 *     for (w in obj) {}
 *   }
 */
class HoistVariablesTransformer extends ParseTreeTransformer {
  constructor() {
    super();
    this.hoistedVariables_ = Object.create(null);
  }

  transformFunctionBody(tree) {
    var statements = this.transformList(tree.statements);
    if (statements === tree.statements)
      return tree;

    var prepended = this.prependVariables(statements);
    return new FunctionBody(tree.location, prepended);
  }

  addVariable(name) {
    this.hoistedVariables_[name] = true;
  }

  hasVariables() {
    for (var key in this.hoistedVariables_) {
      return true;
    }
    return false;
  }

  getVariableNames() {
    return Object.keys(this.hoistedVariables_);
  }

  getVariableStatement() {
    if (!this.hasVariables())
      return null;

    var declarations = this.getVariableNames().map((name) => {
      return createVariableDeclaration(name, null);
    });

    return new VariableStatement(null,
        new VariableDeclarationList(null, VAR, declarations));
  }

  prependVariables(statements) {
    if (!this.hasVariables())
      return statements;
    return prependStatements(statements, this.getVariableStatement());
  }

  transformVariableStatement(tree) {
    var declarations = this.transformAny(tree.declarations);
    if (declarations == tree.declarations)
      return tree;

    if (declarations === null)
      return new AnonBlock(null, []);

    // let/const are not hoisted. Just return a variable statement.
    if (declarations.type === VARIABLE_DECLARATION_LIST)
      return new VariableStatement(tree.location, declarations);

    return createExpressionStatement(declarations);
  }

  transformVariableDeclarationList(tree) {
    if (tree.declarationType == VAR) {
      var expressions = [];
      var declarations = this.transformList(tree.declarations);
      for (var i = 0; i < declarations.length; i++) {
        var declaration = declarations[i];
        assert(declaration.lvalue.type === BINDING_IDENTIFIER);
        // This only works if destructuring has been taken care off already.
        var idToken = declaration.lvalue.identifierToken;
        this.addVariable(idToken.value);
        if (declaration.initialiser !== null) {
          expressions.push(
              createAssignmentExpression(
                  id(idToken),
                  declaration.initialiser));
        }
      }

      if (expressions.length === 0)
        return null;

      if (expressions.length == 1)
        return expressions[0];

      return createCommaExpression(expressions);
    }

    // let/const - just transform for now
    return super(tree);
  }

  transformForInStatement(tree) {
    return this.transformLoop_(tree, ForInStatement);
  }

  transformForOfStatement(tree) {
    return this.transformLoop_(tree, ForOfStatement);
  }

  transformLoop_(tree, ctor) {
    var initialiser = this.transformLoopIninitaliser_(tree.initialiser);
    var collection = this.transformAny(tree.collection);
    var body = this.transformAny(tree.body);
    if (initialiser === tree.initialiser &&
        collection === tree.collection &&
        body === tree.body) {
      return tree;
    }

    return new ctor(tree.location, initialiser, collection, body);
  }

  transformLoopIninitaliser_(tree) {
    if (tree.type !== VARIABLE_DECLARATION_LIST)
      return tree;
    var token = tree.declarations[0].lvalue.identifierToken
    this.addVariable(token.value);
    return id(token);
  }

  addMachineVariable(name) {
    this.machineVariables_[name] = true;
  }

  transformFunctionDeclaration(tree) {
    return tree;
  }

  transformFunctionExpression(tree) {
    return tree;
  }

  transformGetAccessor(tree) {
    return tree;
  }

  transformSetAccessor(tree) {
    return tree;
  }
}

export default HoistVariablesTransformer;
