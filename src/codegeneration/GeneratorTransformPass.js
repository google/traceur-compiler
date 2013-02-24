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

import AsyncTransformer from 'generator/AsyncTransformer.js';
import ForInTransformPass from 'generator/ForInTransformPass.js';
import ForOfTransformer from 'ForOfTransformer.js';
import {
  GetAccessor,
  SetAccessor
} from '../syntax/trees/ParseTrees.js';
import GeneratorTransformer from 'generator/GeneratorTransformer.js';
import ParseTreeVisitor from '../syntax/ParseTreeVisitor.js';
import parseStatement from 'PlaceholderParser.js';
import TempVarTransformer from 'TempVarTransformer.js';
import ParseTreeTransformer from 'ParseTreeTransformer.js';
import {
  EQUAL,
  VAR
} from '../syntax/TokenType.js';
import {
  BINARY_OPERATOR,
  COMMA_EXPRESSION,
  IDENTIFIER_EXPRESSION,
  PAREN_EXPRESSION,
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
import {
  ACTION_SEND,
  ACTION_THROW,
  ACTION_CLOSE,
  YIELD_ACTION,
  YIELD_SENT
} from '../syntax/PredefinedName.js';
import transformOptions from '../options.js';

/**
 * @param {BinaryOperator} tree
 * @return {boolean}
 */
function isYieldAssign(tree) {
  return tree.operator.type === EQUAL &&
      tree.right.type === YIELD_EXPRESSION &&
      tree.left.isLeftHandSideExpression();
}

var id = createIdentifierExpression;

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

var throwClose;

class YieldExpressionTransformer extends TempVarTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   */
  constructor(identifierGenerator) {
    super(identifierGenerator);

    // Initialize unless already cached.
    if (!throwClose) {
      // Inserted after every simple yield expression in order to handle
      // 'throw' and 'close'. No extra action is needed to handle 'send'.
      throwClose = parseStatement `
          switch (${id(YIELD_ACTION)}) {
            case ${ACTION_THROW}:
              ${id(YIELD_ACTION)} = ${ACTION_SEND};
              throw ${id(YIELD_SENT)};
            case ${ACTION_CLOSE}:
              break $close;
          }`;
    }
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

      case YIELD_EXPRESSION:
        if (e.isYieldFor)
          return this.transformYieldForExpression_(e);
        return createBlock(tree, throwClose);
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
    if (rhs.isYieldFor)
      return createBlock(
          this.transformYieldForExpression_(rhs),
          wrap(lhs, id(YIELD_SENT)));

    return createBlock([
        createExpressionStatement(rhs),
        throwClose,
        wrap(lhs, id(YIELD_SENT))]);
  }

  /**
   * Turns "yield* E" into what is essentially, a generator-specific ForOf.
   * @param {YieldExpression} tree Must be a 'yield *'.
   * @return {ParseTree}
   * @private
   */
  transformYieldForExpression_(tree) {
    var g = createIdentifierExpression(this.getTempIdentifier());
    var next = createIdentifierExpression(this.getTempIdentifier());

    // http://wiki.ecmascript.org/doku.php?id=harmony:generators
    //
    // The expression yield* <<expr>> is equivalent to:
    //
    //   let (g = <<expr>>) {
    //     let received = void 0, send = true, result = void 0;
    //     try {
    //       while (true) {
    //         let next = send ? g.send(received) : g.throw(received);
    //         try {
    //           received = yield next;
    //           send = true;
    //         } catch (e) {
    //           received = e;
    //           send = false;
    //         }
    //       }
    //     } catch (e) {
    //       if (!isStopIteration(e))
    //         throw e;
    //       result = e.value;
    //     } finally {
    //       try { g.close(); } catch (ignored) { }
    //     }
    //     result
    //   }

    return parseStatement `
        {
          var ${g} = traceur.runtime.getIterator(${tree.expression}), ${next};

          // TODO: Should 'yield *' handle non-generator iterators? A strict
          // interpretation of harmony:generators would indicate 'no', but
          // 'yes' seems makes more sense from a language-user's perspective.

          // received = void 0;
          ${id(YIELD_SENT)} = void 0;
          // send = true; // roughly equivalent
          ${id(YIELD_ACTION)} = ${ACTION_SEND};
          try {
            while (true) {
              switch (${id(YIELD_ACTION)}) {
                case ${ACTION_SEND}:
                  if (!${g}.send)
                    ${next} = ${g}.next();
                  else
                    ${next} = ${g}.send(${id(YIELD_SENT)});
                  break;
                case ${ACTION_THROW}:
                  ${id(YIELD_ACTION)} = ${ACTION_SEND};
                  if (!${g}.throw)
                    throw ${id(YIELD_SENT)};
                  ${next} = ${g}.throw(${id(YIELD_SENT)});
                  break;
                case ${ACTION_CLOSE}:
                  // TODO: Another deviation from harmony:generators. This line
                  // is needed if we want any given generator function G to be
                  // identical in behavior to GG when 'close' is used.
                  //   function* GG() { yield* G(); }
                  if (${g}.close)
                    ${g}.close();
                  break $close;
              }
              ${createYieldStatement(next)};
            }
          } catch(e) {
            if (!traceur.runtime.isStopIteration(e))
              throw e;
            // result = e.value;
            ${id(YIELD_SENT)} = e.value;
          } finally {
            try {
              ${g}.close();
            } catch(e) {}
          }
        }`;
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  static transformTree(identifierGenerator, tree) {
    return new YieldExpressionTransformer(identifierGenerator).
        transformAny(tree);
  }
}

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

    // We need to transform for-in loops because the object key iteration
    // cannot be interrupted.
    if (finder.hasForIn &&
        (transformOptions.generators || transformOptions.deferredFunctions)) {
      body = ForInTransformPass.transformTree(this.identifierGenerator, body);
    }

    if (finder.hasYield) {
      if (transformOptions.generators) {
        // The labeled do-while serves as a jump target for 'ACTION_CLOSE'.
        // See the var 'throwClose' and the class 'YieldExpressionTransformer'
        // for more details.
        body = parseStatement `
            {
              $close: do {
                ${YieldExpressionTransformer.
                      transformTree(this.identifierGenerator, body)}
              } while (0);
            }`;

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
    if (body === tree.body)
      return tree;

    return new GetAccessor(
        tree.location,
        tree.isStatic,
        tree.name,
        body);
  }

  /**
   * @param {SetAccessor} tree
   * @return {ParseTree}
   */
  transformSetAccessor(tree) {
    var body = this.transformBody_(tree.body);
    if (body === tree.body)
      return tree;

    return new SetAccessor(
        tree.location,
        tree.isStatic,
        tree.name,
        tree.parameter,
        body);
  }

  static transformTree(identifierGenerator, reporter, tree) {
    return new GeneratorTransformPass(identifierGenerator, reporter).
        transformAny(tree);
  }
}
