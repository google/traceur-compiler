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

import {ParseTreeTransformer} from './ParseTreeTransformer';
import {
  Module,
  Script
} from '../syntax/trees/ParseTrees';
import {ARGUMENTS} from '../syntax/PredefinedName';
import {VAR} from '../syntax/TokenType';
import {
  createFunctionBody,
  createThisExpression,
  createIdentifierExpression,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement
} from './ParseTreeFactory';
import {prependStatements} from './PrependStatements';

function getVars(self) {
    var vars = self.tempVarStack_[self.tempVarStack_.length - 1];
    if (!vars)
      throw new Error('Invalid use of addTempVar');
    return vars;
}

class TempVarStatement {
  constructor(name, initialiser) {
    this.name = name;
    this.initialiser = initialiser;
  }
}

class TempScope {
  constructor() {
    this.thisName = null;
    this.argumentName = null;
    this.identifiers = [];
  }

  push(identifier) {
    this.identifiers.push(identifier);
  }

  pop() {
    return this.identifiers.pop();
  }

  release(obj) {
    for (var i = this.identifiers.length - 1; i >= 0; i--) {
      obj.release_(this.identifiers[i]);
    }
  }
}

/**
 * A generic transformer that allows you to easily create a expression with
 * temporary variables.
 */
export class TempVarTransformer extends ParseTreeTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   */
  constructor(identifierGenerator) {
    super();
    this.identifierGenerator = identifierGenerator;
    // Stack used for variable declarations.
    this.tempVarStack_ = [[]];
    // Stack used for the temporary names currently being used.
    this.tempScopeStack_ = [new TempScope()];
    // Names that can be reused.
    this.namePool_ = [];
  }

  /**
   * Transforms a an array of statements and adds a new temp var stack.
   * @param {Array.<ParseTree>} statements
   * @return {Array.<ParseTree>}
   * @private
   */
  transformStatements_(statements) {
    this.tempVarStack_.push([]);

    var transformedStatements = this.transformList(statements);

    var vars = this.tempVarStack_.pop();
    if (!vars.length)
      return transformedStatements;

    // Remove duplicates.
    var seenNames = Object.create(null);
    vars = vars.filter((tempVarStatement) => {
      var {name, initialiser} = tempVarStatement;
      if (name in seenNames) {
        if (seenNames[name].initialiser || initialiser)
          throw new Error('Invalid use of TempVarTransformer');
        return false;
      }
      seenNames[name] = tempVarStatement;
      return true;
    });

    var variableStatement = createVariableStatement(
        createVariableDeclarationList(
            VAR,
            vars.map(({name, initialiser}) => {
              return createVariableDeclaration(name, initialiser);
            })));

    return prependStatements(transformedStatements, variableStatement);
  }

  transformScript(tree) {
    var scriptItemList = this.transformStatements_(tree.scriptItemList);
    if (scriptItemList == tree.scriptItemList) {
      return tree;
    }
    return new Script(tree.location, scriptItemList, tree.moduleName);
  }

  transformModule(tree) {
    var scriptItemList = this.transformStatements_(tree.scriptItemList);
    if (scriptItemList == tree.scriptItemList) {
      return tree;
    }
    return new Module(tree.location, scriptItemList, tree.moduleName);
  }

  transformFunctionBody(tree) {
    this.pushTempVarState();
    var statements = this.transformStatements_(tree.statements);
    this.popTempVarState();
    if (statements == tree.statements)
      return tree;
    return createFunctionBody(statements);
  }

  /**
   * @return {string} An identifier string that can may be reused after the
   *     current scope has been exited.
   */
  getTempIdentifier() {
    var name = this.namePool_.length ?
        this.namePool_.pop() :
        this.identifierGenerator.generateUniqueIdentifier();
    this.tempScopeStack_[this.tempScopeStack_.length - 1].push(name);
    return name;
  }

  /**
   * Adds a new temporary variable to the current function scope.
   * @param {ParseTree=} initialiser If present then the variable will
   *     have this as the initialiser expression.
   * @return {string} The name of the temporary variable.
   */
  addTempVar(initialiser = null) {
    var vars = getVars(this);
    var uid = this.getTempIdentifier();
    vars.push(new TempVarStatement(uid, initialiser));
    return uid;
  }

  addTempVarForThis() {
    var tempScope = this.tempScopeStack_[this.tempScopeStack_.length - 1];
    return tempScope.thisName ||
        (tempScope.thisName = this.addTempVar(createThisExpression()));
  }

  addTempVarForArguments() {
    var tempScope = this.tempScopeStack_[this.tempScopeStack_.length - 1];
    return tempScope.argumentName || (tempScope.argumentName =
        this.addTempVar(createIdentifierExpression(ARGUMENTS)));
  }

  /**
   * Pushes a new temporary variable state. This is useful if you know that
   * your temporary variable can be reused sooner than after the current
   * lexical scope has been exited.
   */
  pushTempVarState() {
    this.tempScopeStack_.push(new TempScope());
  }

  popTempVarState() {
    this.tempScopeStack_.pop().release(this);
  }

  /**
   * Put back the |name| into the pool of reusable temporary varible names.
   * @param {string} name
   * @private
   */
  release_(name) {
    this.namePool_.push(name);
  }
}
