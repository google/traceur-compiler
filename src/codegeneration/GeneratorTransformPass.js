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
import {FindInFunctionScope} from './FindInFunctionScope';
import {
  FunctionDeclaration,
  FunctionExpression
} from '../syntax/trees/ParseTrees';
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

class ForInFinder extends FindInFunctionScope {
  visitForInStatement(tree) {
    this.found = true;
  }
}

function needsTransform(tree) {
  return transformOptions.generators && tree.isGenerator() ||
      transformOptions.asyncFunctions && tree.isAsyncFunction();
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
    if (!needsTransform(tree))
      return super(tree);

    return this.transformFunction_(tree, FunctionDeclaration);
  }

  /**
   * @param {FunctionExpression} tree
   * @return {ParseTree}
   */
  transformFunctionExpression(tree) {
    if (!needsTransform(tree))
      return super(tree);

    return this.transformFunction_(tree, FunctionExpression);
  }

  transformFunction_(tree, constructor) {
    var body = super.transformFunctionBody(tree.functionBody);

    // We need to transform for-in loops because the object key iteration
    // cannot be interrupted.
    var finder = new ForInFinder(body);
    if (finder.found) {
      body = new ForInTransformPass(this.identifierGenerator).
          transformAny(body);
    }

    if (transformOptions.generators && tree.isGenerator()) {
      body = GeneratorTransformer.transformGeneratorBody(
          this.identifierGenerator,
          this.reporter_,
          body);

    } else if (transformOptions.asyncFunctions && tree.isAsyncFunction()) {
      body = AsyncTransformer.transformAsyncBody(
          this.identifierGenerator,
          this.reporter_,
          body);
    }

    // The generator has been transformed away.
    var functionKind = null;

    return new constructor(null, tree.name, functionKind,
                           tree.parameterList, tree.typeAnnotation,
                           tree.annotations, body);
  }
}
