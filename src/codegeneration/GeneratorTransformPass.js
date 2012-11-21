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

import AsyncTransformer from 'generator/AsyncTransformer.js';
import ForInTransformPass from 'generator/ForInTransformPass.js';
import ForOfTransformer from 'ForOfTransformer.js';
import {
  GetAccessor,
  SetAccessor
} from '../syntax/trees/ParseTrees.js';
import GeneratorTransformer from 'generator/GeneratorTransformer.js';
import ParseTreeVisitor from '../syntax/ParseTreeVisitor.js';
import TempVarTransformer from 'TempVarTransformer.js';
import ParseTreeTransformer from 'ParseTreeTransformer.js';
import TokenType from '../syntax/TokenType.js';
import {
  BINARY_OPERATOR,
  COMMA_EXPRESSION,
  IDENTIFIER_EXPRESSION,
  PAREN_EXPRESSION,
  VARIABLE_DECLARATION,
  YIELD_EXPRESSION
} from '../syntax/trees/ParseTreeType.js';
import {
  createAssignmentExpression,
  createAssignmentStatement,
  createBlock,
  createCommaExpression,
  createExpressionStatement,
  createForOfStatement,
  createIdentifierExpression,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  createYieldStatement
} from 'ParseTreeFactory.js';
import YIELD_SENT from '../syntax/PredefinedName.js';
import transformOptions from '../options.js';

/**
 * @param {BinaryOperator} tree
 * @return {boolean}
 */
function isYieldAssign(tree) {
  return tree.operator.type === TokenType.EQUAL &&
      tree.right.type === YIELD_EXPRESSION &&
      tree.left.type === IDENTIFIER_EXPRESSION;
}

/**
 * Can tell you if function body contains a yield statement. Does not search
 * into nested functions.
 */
class YieldFinder extends ParseTreeVisitor {
  /**
   * @param {ParseTree} tree
   */
  constructor(tree) {
    this.hasYield = false;
    this.hasYieldFor = false;
    this.hasForIn = false;
    this.hasAsync = false;
    this.visitAny(tree);
  }

  /** @return {boolean} */
  hasAnyGenerator() {
    return this.hasYield || this.hasAsync;
  }

  visitYieldExpression(tree) {
    this.hasYield = true;
    this.hasYieldFor = tree.isYieldFor;
  }

  /** @param {AwaitStatement} tree */
  visitAwaitStatement(tree) {
    this.hasAsync = true;
  }

  /** @param {ForInStatement} tree */
  visitForInStatement(tree) {
    this.hasForIn = true;
    super.visitForInStatement(tree);
  }

  // don't visit function children or bodies
  visitFunction(tree) {}
  visitSetAccessor(tree) {}
  visitGetAccessor(tree) {}
}

/**
 * This transformer turns "yield* E" into a ForOf that
 * contains a yield and is lowered by the ForOfTransformer.
 */
class YieldForTransformer extends TempVarTransformer {

  /**
   * @param {YieldExpression} tree Must be a 'yield *'.
   * @return {ParseTree}
   * @private
   */
  transformYieldForExpression_(tree) {
    // yield* expression
    //   becomes
    // for (var $temp of expression) { yield $temp; }

    var idTemp = createIdentifierExpression(this.getTempIdentifier());

    var varTemp = createVariableDeclarationList(TokenType.VAR, idTemp, null);
    var expression = tree.expression;
    var yieldTemp = createYieldStatement(idTemp, false);

    var forEach = createForOfStatement(varTemp, expression, yieldTemp);

    return ForOfTransformer.transformTree(this.identifierGenerator, forEach);
  }

  /**
   * @param {ExpressionStatement} tree
   * @return {ParseTree}
   */
  transformExpressionStatement(tree) {
    var e = tree.expression;
    if (e.type === YIELD_EXPRESSION && e.isYieldFor)
      return this.transformYieldForExpression_(e);

    return tree;
  }
}

YieldForTransformer.transformTree = function(identifierGenerator, tree) {
  return new YieldForTransformer(identifierGenerator).transformAny(tree);
};

class YieldExpressionTransformer extends ParseTreeTransformer {
  constructor() {
    super();
    this.sentId = createIdentifierExpression(YIELD_SENT);
  }

  /**
   * @param {ExpressionStatement} tree
   * @return {ParseTree}
   */
  transformExpressionStatement(tree) {
    var e = tree.expression, ex;

    // Inside EXPRESSION_STATEMENT, we should always be able to safely remove
    // parens from BINARY_OPERATOR and COMMA_EXPRESSION. This will need to be
    // revisited if the switch afterwards ever supports more than that.
    while (e.type === PAREN_EXPRESSION) {
      e = e.expression;
    }

    function commaWrap(lhs, rhs) {
      return createExpressionStatement(
          createCommaExpression(
              [createAssignmentExpression(lhs, rhs), ...ex.slice(1)]));
    }

    switch (e.type) {
      case BINARY_OPERATOR:
        if (isYieldAssign(e))
          return this.factor_(e.left, e.right, createAssignmentStatement);

        break;
      case COMMA_EXPRESSION:
        ex = e.expressions;
        if (ex[0].type === BINARY_OPERATOR && isYieldAssign(ex[0]))
          return this.factor_(ex[0].left, ex[0].right, commaWrap);
    }

    return tree;
  }

  transformVariableStatement(tree) {
    var tdd = tree.declarations.declarations;

    function isYieldVarAssign(tree) {
      return tree.initializer && tree.initializer.type === YIELD_EXPRESSION;
    }

    function varWrap(lhs, rhs) {
      return createVariableStatement(
          createVariableDeclarationList(
              tree.declarations.declarationType,
              [createVariableDeclaration(lhs, rhs), ...tdd.slice(1)]));
    }

    if (isYieldVarAssign(tdd[0]))
      return this.factor_(tdd[0].lvalue, tdd[0].initializer, varWrap);

    return tree;
  }

  /**
   * Factor out a simple yield assignment into a simple yield expression and a
   * wrapped $yieldSent assignment.
   * @param {ParseTree} lhs The assignment target.
   * @param {ParseTree} rhs The yield expression.
   * @param {Function} wrap A function that returns a ParseTree wrapping lhs
   *     and $yieldSent properly for its intended context.
   * @return {ParseTree} { yield ...; wrap(lhs, $yieldSent) }
   */
  factor_(lhs, rhs, wrap) {
    return createBlock([
        createExpressionStatement(rhs),
        wrap(lhs, this.sentId)]);
  }
}

YieldExpressionTransformer.transformTree = function(tree) {
  return new YieldExpressionTransformer().transformAny(tree);
};

/**
 * This pass just finds function bodies with yields in them and passes them
 * off to the GeneratorTransformer for the heavy lifting.
 */
export class GeneratorTransformPass extends TempVarTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   */
  constructor(identifierGenerator, reporter) {
    super(identifierGenerator);
    this.reporter_ = reporter;
  }

  /**
   * @param {FunctionDeclaration|FunctionExpression} tree
   * @return {ParseTree}
   */
  transformFunction(tree) {
    var body = this.transformBody_(tree.functionBody);
    if (body === tree.functionBody)
      return tree;

    // The generator has been transformed away.
    var isGenerator = false;

    return new tree.constructor(null, tree.name, isGenerator,
                                tree.formalParameterList, body);
  }

  /**
   * @param {Block} tree
   * @return {Block}
   */
  transformBody_(tree) {
    var finder = new YieldFinder(tree);

    // transform nested functions
    var body = super.transformBlock(tree);

    if (!finder.hasAnyGenerator()) {
      return body;
    }

    body = YieldExpressionTransformer.transformTree(body);

    // We need to transform for-in loops because the object key iteration
    // cannot be interrupted.
    if (finder.hasForIn &&
        (transformOptions.generators || transformOptions.deferredFunctions)) {
      body = ForInTransformPass.transformTree(this.identifierGenerator, body);
    }

    if (finder.hasYieldFor && transformOptions.generators) {
      body = YieldForTransformer.transformTree(this.identifierGenerator, body);
    }

    if (finder.hasYield) {
      if (transformOptions.generators) {
        body = GeneratorTransformer.transformGeneratorBody(this.reporter_,
                                                           body);
      }
    } else if (transformOptions.deferredFunctions) {
      body = AsyncTransformer.transformAsyncBody(this.reporter_, body);
    }
    return body;
  }

  /**
   * @param {GetAccessor} tree
   * @return {ParseTree}
   */
  transformGetAccessor(tree) {
    var body = this.transformBody_(tree.body);
    if (body == tree.body) {
      return tree;
    }
    return new GetAccessor(
        null,
        tree.name,
        body);
  }

  /**
   * @param {SetAccessor} tree
   * @return {ParseTree}
   */
  transformSetAccessor(tree) {
    var body = this.transformBody_(tree.body);
    if (body == tree.body) {
      return tree;
    }
    return new SetAccessor(
        null,
        tree.name,
        tree.parameter,
        body);
  }
}

GeneratorTransformPass.transformTree = function(identifierGenerator, reporter,
    tree) {
  return new GeneratorTransformPass(identifierGenerator, reporter).
      transformAny(tree);
};
