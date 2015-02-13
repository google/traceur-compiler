// Copyright 2015 Traceur Authors.
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

'use strong';

import {AsyncGeneratorTransformer} from './AsyncGeneratorTransformer.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {
  AnonBlock,
  FunctionDeclaration,
  FunctionExpression
} from '../syntax/trees/ParseTrees.js';
import {
  createBindingIdentifier,
  createIdentifierExpression as id,
  createIdentifierToken
} from './ParseTreeFactory.js';
import {
  parseExpression,
  parseStatement
} from './PlaceholderParser.js';

export class AsyncGeneratorTransformPass extends TempVarTransformer {
  // TODO: This class is modelled after GeneratorTransformPass. When the spec
  // for async generators will have stabilized, it may be an option to merge
  // this class into GeneratorTransformPass. However, note: This transformer
  // itself produces async functions so GeneratorTransformPass may then
  // have to run twice.
  constructor(identifierGenerator, reporter, options) {
    super(identifierGenerator);
    this.transformOptions_ = options.transformOptions;
    this.inBlock_ = false;
  }

  needsTransform_(tree) {
    return this.transformOptions_.asyncGenerators && tree.isAsyncGenerator();
  }

  transformFunctionDeclaration(tree) {
    if (!this.needsTransform_(tree))
      return super.transformFunctionDeclaration(tree);

    var nameIdExpression = id(tree.name.identifierToken);

    var setupPrototypeExpression = parseExpression
        `$traceurRuntime.initAsyncGeneratorFunction(${nameIdExpression})`;

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

  transformFunctionExpression(tree) {
    if (!this.needsTransform_(tree)) {
      return super.transformFunctionExpression(tree);
    }
    
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
        `$traceurRuntime.initAsyncGeneratorFunction(${functionExpression })`;
  }

  transformFunction_(tree, constructor, nameExpression) {
    var body = super.transformAny(tree.body);
    body = AsyncGeneratorTransformer.transformAsyncGeneratorBody(
          this.identifierGenerator, this.reporter_, body, nameExpression);

    // The async generator has been transformed away.
    var functionKind = null;

    return new constructor(tree.location, tree.name, functionKind,
                           tree.parameterList, tree.typeAnnotation || null,
                           tree.annotations || null, body);
  }

  transformBlock(tree) {
    var inBlock = this.inBlock_;
    this.inBlock_ = true;
    var rv = super.transformBlock(tree);
    this.inBlock_ = inBlock;
    return rv;
  }
}
