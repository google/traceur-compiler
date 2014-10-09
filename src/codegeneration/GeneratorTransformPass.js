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

import {ArrowFunctionTransformer} from './ArrowFunctionTransformer';
import {AsyncTransformer} from './generator/AsyncTransformer';
import {ForInTransformPass} from './generator/ForInTransformPass';
import {GeneratorTransformer} from './generator/GeneratorTransformer';
import {
  parseExpression,
  parseStatement
} from './PlaceholderParser';
import {TempVarTransformer} from './TempVarTransformer';
import {FindInFunctionScope} from './FindInFunctionScope';
import {
  AnonBlock,
  FunctionDeclaration,
  FunctionExpression
} from '../syntax/trees/ParseTrees';
import {
  createBindingIdentifier,
  createIdentifierExpression as id,
  createIdentifierToken
} from './ParseTreeFactory';
import {transformOptions} from '../Options';

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
    this.inBlock_ = false;
  }

  /**
   * @param {FunctionDeclaration} tree
   * @return {ParseTree}
   */
  transformFunctionDeclaration(tree) {
    if (!needsTransform(tree))
      return super(tree);

    if (tree.isGenerator())
      return this.transformGeneratorDeclaration_(tree);

    return this.transformFunction_(tree, FunctionDeclaration, null);
  }

  transformGeneratorDeclaration_(tree) {
    var nameIdExpression = id(tree.name.identifierToken);

    var setupPrototypeExpression = parseExpression
        `$traceurRuntime.initGeneratorFunction(${nameIdExpression})`;

    // Function declarations in blocks do not hoist. In that case we add the
    // variable declaration after the function declaration.

    var tmpVar = id(this.inBlock_ ?
        this.getTempIdentifier() : this.addTempVar(setupPrototypeExpression));
    var funcDecl = this.transformFunction_(tree, FunctionDeclaration, tmpVar);

    if (!this.inBlock_)
      return funcDecl;

    return new AnonBlock(null, [
      funcDecl,
      parseStatement `var ${tmpVar} = ${setupPrototypeExpression}`
    ]);
  }

  /**
   * @param {FunctionExpression} tree
   * @return {ParseTree}
   */
  transformFunctionExpression(tree) {
    if (!needsTransform(tree))
      return super(tree);

    if (tree.isGenerator())
      return this.transformGeneratorExpression_(tree);

    return this.transformFunction_(tree, FunctionExpression, null);
  }

  transformGeneratorExpression_(tree) {
    var name;
    if (!tree.name) {
      // We need a name to be able to reference the function object.
      name = createIdentifierToken(this.getTempIdentifier());
      tree = new FunctionExpression(tree.location,
          createBindingIdentifier(name), tree.functionKind,
          tree.parameterList, tree.typeAnnotation, tree.annotations,
          tree.body);
    } else {
      name = tree.name.identifierToken;
    }

    var functionExpression =
        this.transformFunction_(tree, FunctionExpression, id(name));
    return parseExpression
        `$traceurRuntime.initGeneratorFunction(${functionExpression })`;
  }

  transformFunction_(tree, constructor, nameExpression) {
    var body = super.transformAny(tree.body);

    // We need to transform for-in loops because the object key iteration
    // cannot be interrupted.
    var finder = new ForInFinder(body);
    if (finder.found) {
      body = new ForInTransformPass(this.identifierGenerator).
          transformAny(body);
    }

    if (transformOptions.generators && tree.isGenerator()) {
      body = GeneratorTransformer.transformGeneratorBody(
          this.identifierGenerator, this.reporter_, body, nameExpression);

    } else if (transformOptions.asyncFunctions && tree.isAsyncFunction()) {
      body = AsyncTransformer.transformAsyncBody(
          this.identifierGenerator, this.reporter_, body);
    }

    // The generator has been transformed away.
    var functionKind = null;

    return new constructor(tree.location, tree.name, functionKind,
                           tree.parameterList, tree.typeAnnotation || null,
                           tree.annotations || null, body);
  }

  transformArrowFunctionExpression(tree) {
    if (!tree.isAsyncFunction())
      return super(tree);

    return this.transformAny(ArrowFunctionTransformer.transform(this, tree));
  }

  transformBlock(tree) {
    var inBlock = this.inBlock_;
    this.inBlock_ = true;
    var rv = super(tree);
    this.inBlock_ = inBlock;
    return rv;
  }
}
