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
  Catch,
  FunctionBody,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  VariableDeclarationList,
  VariableStatement
} from '../syntax/trees/ParseTrees';
import {
  OBJECT_PATTERN,
  VARIABLE_DECLARATION_LIST
} from '../syntax/trees/ParseTreeType';
import {ParseTreeTransformer} from './ParseTreeTransformer';
import {VAR} from '../syntax/TokenType';
import {
  createAssignmentExpression,
  createCommaExpression,
  createExpressionStatement,
  createIdentifierExpression as id,
  createParenExpression,
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
  /**
   * @param {boolean} shouldHoistFunctions Whether to also hoist function
   *     declarations.
   */
  constructor(shouldHoistFunctions = false) {
    super();
    this.hoistedFunctions_ = [];
    this.hoistedVariables_ = Object.create(null);
    this.keepBindingIdentifiers_ = false;
    this.inBlockOrFor_ = false;
    this.shouldHoistFunctions_ = shouldHoistFunctions;
  }

  transformFunctionBody(tree) {
    var statements = this.transformList(tree.statements);
    if (statements === tree.statements)
      return tree;

    statements = this.prependVariables(statements);
    statements = this.prependFunctions(statements);
    return new FunctionBody(tree.location, statements);
  }

  addVariable(name) {
    this.hoistedVariables_[name] = true;
  }

  addFunctionDeclaration(tree) {
    this.hoistedFunctions_.push(tree);
  }

  hasVariables() {
    for (var key in this.hoistedVariables_) {
      return true;
    }
    return false;
  }

  hasFunctions() {
    return this.hoistedFunctions_.length > 0;
  }

  getVariableNames() {
    return Object.keys(this.hoistedVariables_);
  }

  getVariableStatement() {
    if (!this.hasVariables())
      return new AnonBlock(null, []);

    var declarations = this.getVariableNames().map((name) => {
      return createVariableDeclaration(name, null);
    });

    return new VariableStatement(null,
        new VariableDeclarationList(null, VAR, declarations));
  }

  getFunctions() {
    return this.hoistedFunctions_;
  }

  prependVariables(statements) {
    if (!this.hasVariables())
      return statements;
    return prependStatements(statements, this.getVariableStatement());
  }

  prependFunctions(statements) {
    if (!this.hasFunctions())
      return statements;
    return prependStatements(statements, this.getFunctionDeclarations());
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

  transformVariableDeclaration(tree) {
    var lvalue = this.transformAny(tree.lvalue);
    var initializer = this.transformAny(tree.initializer);
    if (initializer) {
      var expression = createAssignmentExpression(lvalue, initializer);
      if (lvalue.type === OBJECT_PATTERN)
        expression = createParenExpression(expression);
      return expression;
    }
    return null;
  }

  transformObjectPattern(tree) {
    // AssignmentPatterns incorrectly uses BindingIdentifiers.
    // https://github.com/google/traceur-compiler/issues/969
    var keepBindingIdentifiers = this.keepBindingIdentifiers_;
    this.keepBindingIdentifiers_ = true;
    var transformed = super(tree);
    this.keepBindingIdentifiers_ = keepBindingIdentifiers;
    return transformed;
  }

  transformArrayPattern(tree) {
    // AssignmentPatterns incorrectly uses BindingIdentifiers.
    // https://github.com/google/traceur-compiler/issues/969
    var keepBindingIdentifiers = this.keepBindingIdentifiers_;
    this.keepBindingIdentifiers_ = true;
    var transformed = super(tree);
    this.keepBindingIdentifiers_ = keepBindingIdentifiers;
    return transformed;
  }

  transformBindingIdentifier(tree) {
    var idToken = tree.identifierToken;
    this.addVariable(idToken.value);
    if (this.keepBindingIdentifiers_)
      return tree;
    return id(idToken);
  }

  transformVariableDeclarationList(tree) {
    // Hoist var declarations and top-level let/const declarations. If
    // const-ness is ever enforced, note that all hoisted declarations become
    // var declarations.
    if (tree.declarationType === VAR || !this.inBlockOrFor_) {
      var expressions = this.transformList(tree.declarations);

      // Any var without an initializer becomes null in
      // transformVariableDeclaration Remove these null trees now.
      expressions = expressions.filter((tree) => tree);

      if (expressions.length === 0)
        return null;

      if (expressions.length == 1)
        return expressions[0];

      return createCommaExpression(expressions);
    }

    // let/const - do not transform.
    return tree;
  }

  transformCatch(tree) {
    // Ensure that we do not transform the catch binding.
    var catchBody = this.transformAny(tree.catchBody);
    if (catchBody === tree.catchBody)
      return tree;
    return new Catch(tree.location, tree.binding, catchBody);
  }

  transformForInStatement(tree) {
    return this.transformLoop_(tree, ForInStatement);
  }

  transformForOfStatement(tree) {
    return this.transformLoop_(tree, ForOfStatement);
  }

  transformLoop_(tree, ctor) {
    var initializer = this.transformLoopIninitaliser_(tree.initializer);
    var collection = this.transformAny(tree.collection);
    var body = this.transformAny(tree.body);
    if (initializer === tree.initializer &&
        collection === tree.collection &&
        body === tree.body) {
      return tree;
    }

    return new ctor(tree.location, initializer, collection, body);
  }

  transformLoopIninitaliser_(tree) {
    if (tree.type !== VARIABLE_DECLARATION_LIST || tree.declarationType !== VAR)
      return tree;
    return this.transformAny(tree.declarations[0].lvalue);
  }

  transformForStatement(tree) {
    var inBlockOrFor = this.inBlockOrFor_;
    this.inBlockOrFor_ = true;
    var initializer = this.transformAny(tree.initializer);
    this.inBlockOrFor_ = inBlockOrFor;
    var condition = this.transformAny(tree.condition);
    var increment = this.transformAny(tree.increment);
    var body = this.transformAny(tree.body);
    if (initializer === tree.initializer &&
        condition === tree.condition &&
        increment === tree.increment &&
        body === tree.body) {
      return tree;
    }
    return new ForStatement(tree.location, initializer,
                            condition, increment, body);
  }

  transformBlock(tree) {
    var inBlockOrFor = this.inBlockOrFor_;
    this.inBlockOrFor_ = true;
    tree = super(tree);
    this.inBlockOrFor_ = inBlockOrFor;
    return tree;
  }

  addMachineVariable(name) {
    this.machineVariables_[name] = true;
  }

  transformClassDeclaration(tree) {
    return tree;
  }

  transformClassExpression(tree) {
    return tree;
  }

  transformFunctionDeclaration(tree) {
    if (this.shouldHoistFunctions_) {
      this.addFunctionDeclaration(tree);
      return new AnonBlock(null, []);
    }
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

  transformPropertyMethodAssignment(tree) {
    return tree;
  }

  transformArrowFunctionExpression(tree) {
    return tree;
  }

  transformComprehensionFor(tree) {
    return tree;
  }
}

export default HoistVariablesTransformer;
