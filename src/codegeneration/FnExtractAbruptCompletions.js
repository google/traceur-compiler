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

import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import alphaRenameThisAndArguments from './alphaRenameThisAndArguments.js';
import {parseStatement} from './PlaceholderParser.js';
import {
  AnonBlock,
  BreakStatement,
  ContinueStatement,
  FormalParameterList,
  ReturnStatement
} from '../syntax/trees/ParseTrees.js';
import {
  createArgumentList,
  createAssignmentStatement,
  createAssignmentExpression,
  createBlock,
  createCallExpression,
  createCaseClause,
  createDefaultClause,
  createExpressionStatement,
  createFunctionBody,
  createFunctionExpression,
  createIdentifierExpression,
  createNumberLiteral,
  createObjectLiteral,
  createSwitchStatement,
  createThisExpression,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  createVoid0
} from './ParseTreeFactory.js';
import {ARGUMENTS} from '../syntax/PredefinedName.js';
import {VAR} from '../syntax/TokenType.js';


/**
 * Givens a list of statements, this extracts all the needed `return`s,
 * `break`s and `continue`s (abrupt completions statements).
 * It returns an object containing
 * - variableStatement: Might contain aliases to `this` and `arguments`,
 *    and also a function
 * - loopBody: Might contain a call to the function defined above, and also
 *    a switch statement for the abrupt completions
 */
export class FnExtractAbruptCompletions extends ParseTreeTransformer {

  constructor(idGenerator, requestParentLabel) {
    this.idGenerator_ = idGenerator;
    this.inLoop_ = 0;
    this.inBreakble_ = 0;
    this.variableDeclarations_ = [];
    this.extractedStatements_ = [];
    this.requestParentLabel_ = requestParentLabel;
    this.labelledStatements_ = {};
  }

  createIIFE(body, paramList, argsList) {
    body = this.transformAny(body);

    body = alphaRenameThisAndArguments(this, body);
    var tmpFnName = this.idGenerator_.generateUniqueIdentifier();
    // function (...) { ... }
    var functionExpression = createFunctionExpression(
        new FormalParameterList(null, paramList),
        createFunctionBody(body.statements || [body]));
    // var $tmpFn = ${functionExpression}
    this.variableDeclarations_.push(
        createVariableDeclaration(tmpFnName, functionExpression));
    // $tmpFn(...)
    var functionCall = createCallExpression(
        createIdentifierExpression(tmpFnName),
        createArgumentList(argsList));

    var loopBody = null;
    if (this.extractedStatements_.length || this.hasReturns) {
      var tmpVarName = createIdentifierExpression(
          this.idGenerator_.generateUniqueIdentifier());
      // hoist declaration
      this.variableDeclarations_.push(
          createVariableDeclaration(tmpVarName, null));

      var maybeReturn;
      if (this.hasReturns) {
        // ${tmpVarName} is either a number of an object
        // this check is enough since it's never null
        maybeReturn = parseStatement `if (typeof ${tmpVarName} === "object")
            return ${tmpVarName}.v;`;
      }

      if (this.extractedStatements_.length) {
        // handle each extractedStatement as a case clause
        var caseClauses = this.extractedStatements_.map(
            (statement, index) => createCaseClause(
                createNumberLiteral(index), [statement])
        );

        // default clause is the return statement, if it's needed
        if (maybeReturn) {
          caseClauses.push(createDefaultClause([maybeReturn]));
        }

        // $tmpVar = $tmpFn(...); switch($tmpVar) {...}
        loopBody = createBlock([
          createExpressionStatement(
              createAssignmentExpression(tmpVarName, functionCall)),
          createSwitchStatement(tmpVarName, caseClauses)
        ]);
      } else {
        // $tmpVar = $tmpFn(...); ${maybeReturn}
        loopBody = createBlock( [
          createExpressionStatement(
              createAssignmentExpression(tmpVarName, functionCall)),
          maybeReturn
        ]);
      }
    } else {
      // $tmpFn(...)
      loopBody = createBlock([createExpressionStatement(functionCall)]);
    }


    return {
      variableStatements: createVariableStatement(
          createVariableDeclarationList(VAR, this.variableDeclarations_)),
      loopBody: loopBody
    };
  }

  // alphaRenameThisAndArguments
  addTempVarForArguments() {
    var tmpVarName = this.idGenerator_.generateUniqueIdentifier();
    this.variableDeclarations_.push(createVariableDeclaration(
        tmpVarName, createIdentifierExpression(ARGUMENTS)));
    return tmpVarName;
  }
  // alphaRenameThisAndArguments
  addTempVarForThis() {
    var tmpVarName = this.idGenerator_.generateUniqueIdentifier();
    this.variableDeclarations_.push(createVariableDeclaration(
        tmpVarName, createThisExpression()));
    return tmpVarName;
  }

  transformAny(tree) {
    if (tree) {
      if (tree.isBreakableStatement()) this.inBreakble_++;
      if (tree.isIterationStatement()) this.inLoop_++;
      tree = super.transformAny(tree);
      if (tree.isBreakableStatement()) this.inBreakble_--;
      if (tree.isIterationStatement()) this.inLoop_--;
    }
    return tree;
  }

  transformReturnStatement(tree) {
    this.hasReturns = true;
    return new ReturnStatement(tree.location, createObjectLiteral({
      v: tree.expression || createVoid0()
    }));
  }

  transformAbruptCompletion_(tree) {
    this.extractedStatements_.push(tree);

    var index = this.extractedStatements_.length - 1;
    return parseStatement `return ${index};`
  }

  transformBreakStatement(tree) {
    if (!tree.name) {
      if (this.inBreakble_) {
        return super.transformBreakStatement(tree);
      } else {
        tree = new BreakStatement(tree.location,
            this.requestParentLabel_());
      }
    } else if (this.labelledStatements_[tree.name]) {
      return super.transformBreakStatement(tree);
    }
    return this.transformAbruptCompletion_(tree);
  }

  transformContinueStatement(tree) {
    if (!tree.name) {
      if (this.inLoop_) {
        return super.transformContinueStatement(tree);
      } else {
        tree = new ContinueStatement(tree.location,
            this.requestParentLabel_());
      }
    } else if (this.labelledStatements_[tree.name]) {
      return super.transformContinueStatement(tree);
    }
    return this.transformAbruptCompletion_(tree);
  }

  // keep track of labels in the tree
  transformLabelledStatement(tree) {
    this.labelledStatements_[tree.name] = true;
    return super.transformLabelledStatement(tree);
  }

  transformVariableStatement(tree) {
    if (tree.declarations.declarationType === VAR) {
      var assignments = [];
      tree.declarations.declarations.forEach((variableDeclaration) => {
        var variableName = variableDeclaration.lvalue.getStringValue();
        var initializer = super.transformAny(variableDeclaration.initializer);

        this.variableDeclarations_.push(
            createVariableDeclaration(variableName, null));

        assignments.push(createAssignmentStatement(
            createIdentifierExpression(variableName), initializer));
      });

      return new AnonBlock(null, assignments);
    }

    return super.transformVariableStatement(tree);
  }


  // don't transform children functions
  transformFunctionDeclaration(tree) {return tree;}
  transformFunctionExpression(tree) {return tree;}
  transformSetAccessor(tree) {return tree;}
  transformGetAccessor(tree) {return tree;}
  transformPropertyMethodAssignment(tree) {return tree;}
  transformArrowFunctionExpression(tree) {return tree;}


  static createIIFE(idGenerator, body, paramList, argsList, requestParentLabel) {
    return new FnExtractAbruptCompletions(idGenerator, requestParentLabel)
        .createIIFE(body, paramList, argsList);
  }
}