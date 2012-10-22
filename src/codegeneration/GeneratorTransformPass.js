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
import ParseTreeTransformer from 'ParseTreeTransformer.js';
import ParseTreeVisitor from '../syntax/ParseTreeVisitor.js';
import TokenType from '../syntax/TokenType.js';
import {
  createForOfStatement,
  createIdentifierExpression,
  createVariableDeclarationList,
  createYieldStatement
} from 'ParseTreeFactory.js';
import createObject from '../util/util.js';
import transformOptions from '../options.js';

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
class YieldForTransformer extends ParseTreeTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   */
  constructor(identifierGenerator) {
    super();
    this.identifierGenerator_ = identifierGenerator;
  }

  transformYieldStatement(tree) {
    if (tree.isYieldFor) {
      // yield* E
      //   becomes
      // for (var $TEMP of E) { yield $TEMP; }

      var id = createIdentifierExpression(
          this.identifierGenerator_.generateUniqueIdentifier());

      var forEach = createForOfStatement(
          createVariableDeclarationList(
              TokenType.VAR,
              id,
              null // initializer
          ),
          tree.expression,
          createYieldStatement(id, false /* isYieldFor */));

      var result = ForOfTransformer.transformTree(
          this.identifierGenerator_,
          forEach);

      return result;
    }

    return tree;
  }
}

YieldForTransformer.transformTree = function(identifierGenerator, tree) {
  return new YieldForTransformer(identifierGenerator).transformAny(tree);
};

/**
 * This pass just finds function bodies with yields in them and passes them
 * off to the GeneratorTransformer for the heavy lifting.
 */
export class GeneratorTransformPass extends ParseTreeTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   */
  constructor(identifierGenerator, reporter) {
    super();
    this.identifierGenerator_ = identifierGenerator;
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

    // We need to transform for-in loops because the object key iteration
    // cannot be interrupted.
    if (finder.hasForIn &&
        (transformOptions.generators || transformOptions.deferredFunctions)) {
      body = ForInTransformPass.transformTree(this.identifierGenerator_, body);
    }

    if (finder.hasYieldFor && transformOptions.generators) {
      body = YieldForTransformer.transformTree(this.identifierGenerator_, body);
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
        tree.propertyName,
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
        tree.propertyName,
        tree.parameter,
        body);
  }
}

GeneratorTransformPass.transformTree = function(identifierGenerator, reporter,
    tree) {
  return new GeneratorTransformPass(identifierGenerator, reporter).
      transformAny(tree);
}