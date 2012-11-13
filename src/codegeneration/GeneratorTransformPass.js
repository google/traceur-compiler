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
  FunctionDeclaration,
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
  IDENTIFIER_EXPRESSION,
  PAREN_EXPRESSION,
  YIELD_EXPRESSION
} from '../syntax/trees/ParseTreeType.js';
import {
  createAssignmentStatement,
  createBlock,
  createExpressionStatement,
  createForOfStatement,
  createIdentifierExpression,
  createVariableDeclarationList,
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
 * Can tell you if function body contains a yield statement. Does not search into
 * nested functions.
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

  /** @param {YieldStatement} tree */
  visitYieldStatement(tree) {
    this.hasYield = true;
    this.hasYieldFor = tree.isYieldFor;
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
  visitFunctionDeclaration(tree) {}
  visitSetAccessor(tree) {}
  visitGetAccessor(tree) {}
}

/**
 * This transformer turns "yield* E" into a ForOf that
 * contains a yield and is lowered by the ForOfTransformer.
 */
class YieldForTransformer extends TempVarTransformer {

  transformYieldStatement(tree) {
    if (tree.isYieldFor) {
      // yield* E
      //   becomes
      // for (var $TEMP of E) { yield $TEMP; }

      var id = createIdentifierExpression(
          this.getTempIdentifier());

      var forEach = createForOfStatement(
          createVariableDeclarationList(
              TokenType.VAR,
              id,
              null // initializer
          ),
          tree.expression,
          createYieldStatement(id, false /* isYieldFor */));

      var result = ForOfTransformer.transformTree(
          this.identifierGenerator,
          forEach);

      return result;
    }

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

    switch (e.type) {
      case YIELD_EXPRESSION:
        return createYieldStatement(e.expression, e.isYieldFor);
      case BINARY_OPERATOR:
        if (isYieldAssign(e))
          return this.factor_(e.left, e.right, createAssignmentStatement);

        break;
    }
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
   * @param {FunctionDeclaration} tree
   * @return {ParseTree}
   */
  transformFunctionDeclaration(tree) {
    var body = this.transformBody_(tree.functionBody);
    if (body == tree.functionBody) {
      return tree;
    }
    return new FunctionDeclaration(
        null,
        tree.name,
        false, // The generator has been transformed away.
        tree.formalParameterList,
        body);
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
