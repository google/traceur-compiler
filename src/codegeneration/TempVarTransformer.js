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

import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import {
  ModuleDefinition,
  Program
} from '../syntax/trees/ParseTrees.js';
import {VAR} from '../syntax/TokenType.js';
import {
  createFunctionBody,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement
} from './ParseTreeFactory.js';
import {prependStatements} from './PrependStatements.js';

function getVars(self) {
    var vars = self.tempVarStack_[self.tempVarStack_.length - 1];
    if (!vars)
      throw new Error('Invalid use of addTempVar');
    return vars;
}

class TempVarStatement {
  constructor(name, initializer) {
    this.name = name;
    this.initializer = initializer;
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
    this.tempIdentifierStack_ = [[]];
    // Names that can be reused.
    this.pool_ = [];
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
      var {name, initializer} = tempVarStatement;
      if (name in seenNames) {
        if (seenNames[name].initializer || initializer)
          throw new Error('Invalid use of TempVarTransformer');
        return false;
      }
      seenNames[name] = tempVarStatement;
      return true;
    });

    var variableStatement = createVariableStatement(
        createVariableDeclarationList(
            VAR,
            vars.map(({name, initializer}) => {
              return createVariableDeclaration(name, initializer);
            })));

    return prependStatements(transformedStatements, variableStatement);
  }

  transformProgram(tree) {
    var programElements = this.transformStatements_(tree.programElements);
    if (programElements == tree.programElements) {
      return tree;
    }
    return new Program(tree.location, programElements);
  }

  transformFunctionBody(tree) {
    this.pushTempVarState();
    var statements = this.transformStatements_(tree.statements);
    this.popTempVarState();
    if (statements == tree.statements)
      return tree;
    return createFunctionBody(statements);
  }

  transformModuleDefinition(tree) {
    this.pushTempVarState();
    var elements = this.transformStatements_(tree.elements);
    this.popTempVarState();
    if (elements == tree.elements)
      return tree;
    return new ModuleDefinition(tree.location, tree.name, elements);
  }

  /**
   * @return {string} An identifier string that can may be reused after the
   *     current scope has been exited.
   */
  getTempIdentifier() {
    var name = this.pool_.length ?
      this.pool_.pop() :
      this.identifierGenerator.generateUniqueIdentifier();
    this.tempIdentifierStack_[this.tempIdentifierStack_.length - 1].push(name);
    return name;
  }

  /**
   * Adds a new temporary variable to the current function scope.
   * @param {ParseTree=} initializer If present then the variable will
   *     have this as the initializer expression.
   * @return {string} The name of the temporary variable.
   */
  addTempVar(initializer = null) {
    var vars = getVars(this);
    var uid = this.getTempIdentifier();
    vars.push(new TempVarStatement(uid, initializer));
    return uid;
  }

  /**
   * Pushes a new temporary variable state. This is useful if you know that
   * your temporary variable can be reused sooner than after the current
   * lexical scope has been exited.
   */
  pushTempVarState() {
    this.tempIdentifierStack_.push([]);
  }

  popTempVarState() {
    this.tempIdentifierStack_.pop().forEach(this.release_, this);
  }

  /**
   * Put back the |name| into the pool of reusable temporary varible names.
   * @param {string} name
   * @private
   */
  release_(name) {
    this.pool_.push(name);
  }
}
