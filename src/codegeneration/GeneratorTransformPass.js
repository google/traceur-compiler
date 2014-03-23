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

import {AsyncTransformer} from './generator/AsyncTransformer';
import {ForInTransformPass} from './generator/ForInTransformPass';
import {
  GetAccessor,
  SetAccessor
} from '../syntax/trees/ParseTrees';
import {GeneratorTransformer} from './generator/GeneratorTransformer';
import {ParseTreeVisitor} from '../syntax/ParseTreeVisitor';
import {parseStatement} from './PlaceholderParser';
import {TempVarTransformer} from './TempVarTransformer';
import {
  EQUAL,
  STAR
} from '../syntax/TokenType';
import {
  BINARY_OPERATOR,
  COMMA_EXPRESSION,
  PAREN_EXPRESSION,
  YIELD_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {
  FunctionDeclaration,
  FunctionExpression
} from '../syntax/trees/ParseTrees';
import {YieldFinder} from './generator/YieldFinder';
import {
  createAssignmentExpression,
  createAssignmentStatement,
  createBlock,
  createCommaExpression,
  createExpressionStatement,
  createIdentifierExpression as id,
  createMemberExpression,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  createYieldStatement
} from './ParseTreeFactory';
import {
  transformOptions,
  options
} from '../options';

function isAsync(functionKind) {
  return functionKind !== null && functionKind.value === 'async';
}

function isGenerator(functionKind) {
  return functionKind !== null && functionKind.type === STAR;
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
   * @param {FunctionDeclaration} tree
   * @return {ParseTree}
   */
  transformFunctionDeclaration(tree) {
    return this.transformFunction_(tree, FunctionDeclaration);
  }

  /**
   * @param {FunctionExpression} tree
   * @return {ParseTree}
   */
  transformFunctionExpression(tree) {
    return this.transformFunction_(tree, FunctionExpression);
  }

  transformFunction_(tree, constructor) {
    var body = this.transformBody_(tree.functionBody, tree.functionKind);
    if (body === tree.functionBody)
      return tree;

    // The generator has been transformed away.
    var functionKind = null;

    return new constructor(null, tree.name, functionKind,
                           tree.formalParameterList, tree.typeAnnotation,
                           tree.annotations, body);
  }

  /**
   * @param {FunctionBody} tree
   * @return {FunctionBody}
   */
  transformBody_(tree, functionKind) {
    var finder;

    // transform nested functions
    var body = super.transformFunctionBody(tree);

    if (transformOptions.generators && isGenerator(functionKind) ||
        transformOptions.asyncFunctions && isAsync(functionKind) ||
        transformOptions.deferredFunctions) {
      // TODO(arv): Once deferredFunctions is gone the only thing we care about
      // is wether we need the ForInTransformPass below.
      finder = new YieldFinder(tree);
      if (!functionKind && !finder.hasAwait)
        return body;
    } else {
      return body;
    }

    // We need to transform for-in loops because the object key iteration
    // cannot be interrupted.
    if (finder.hasForIn) {
      body = new ForInTransformPass(this.identifierGenerator).transformAny(body);
    }

    if (transformOptions.generators && isGenerator(functionKind)) {
      body = GeneratorTransformer.transformGeneratorBody(
          this.identifierGenerator,
          this.reporter_,
          body);

    } else if (transformOptions.asyncFunctions && isAsync(functionKind) ||
               transformOptions.deferredFunctions && finder.hasAwait) {
      body = AsyncTransformer.transformAsyncBody(
          this.identifierGenerator, this.reporter_, body);
    }
    return body;
  }

  /**
   * @param {GetAccessor} tree
   * @return {ParseTree}
   */
  transformGetAccessor(tree) {
    var body = this.transformBody_(tree.body, null);
    if (body === tree.body)
      return tree;

    return new GetAccessor(
        tree.location,
        tree.isStatic,
        tree.name,
        tree.typeAnnotation,
        tree.annotations,
        body);
  }

  /**
   * @param {SetAccessor} tree
   * @return {ParseTree}
   */
  transformSetAccessor(tree) {
    var body = this.transformBody_(tree.body, null);
    if (body === tree.body)
      return tree;

    return new SetAccessor(
        tree.location,
        tree.isStatic,
        tree.name,
        tree.parameter,
        tree.annotations,
        body);
  }
}
