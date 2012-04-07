// Copyright 2011 Google Inc.
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

traceur.define('codegeneration', function() {
  'use strict';

  var ParseTreeVisitor = traceur.syntax.ParseTreeVisitor;
  var FunctionDeclaration = traceur.syntax.trees.FunctionDeclaration;
  var GetAccessor = traceur.syntax.trees.GetAccessor;
  var SetAccessor = traceur.syntax.trees.SetAccessor;

  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var ForOfTransformer = traceur.codegeneration.ForOfTransformer;

  var ForInTransformPass = traceur.codegeneration.generator.ForInTransformPass;
  var GeneratorTransformer = traceur.codegeneration.generator.GeneratorTransformer;
  var AsyncTransformer = traceur.codegeneration.generator.AsyncTransformer;

  var createForOfStatement = traceur.codegeneration.ParseTreeFactory.createForOfStatement;
  var createVariableDeclarationList = traceur.codegeneration.ParseTreeFactory.createVariableDeclarationList;
  var createYieldStatement = traceur.codegeneration.ParseTreeFactory.createYieldStatement;
  var createIdentifierExpression = traceur.codegeneration.ParseTreeFactory.createIdentifierExpression;

  var TokenType = traceur.syntax.TokenType;

  var options = traceur.options.transform;

  /**
   * Can tell you if function body contains a yield statement. Does not search into
   * nested functions.
   * @param {ParseTree} tree
   * @extends {ParseTreeVisitor}
   * @constructor
   */
  function YieldFinder(tree) {
    this.visitAny(tree);
  }

  YieldFinder.prototype = traceur.createObject(ParseTreeVisitor.prototype, {

    hasYield: false,
    hasYieldFor: false,
    hasForIn: false,
    hasAsync: false,

    /** @return {boolean} */
    hasAnyGenerator: function() {
      return this.hasYield || this.hasAsync;
    },

    /** @param {YieldStatement} tree */
    visitYieldStatement: function(tree) {
      this.hasYield = true;
      this.hasYieldFor = tree.isYieldFor;
    },

    /** @param {AwaitStatement} tree */
    visitAwaitStatement: function(tree) {
      this.hasAsync = true;
    },

    /** @param {ForInStatement} tree */
    visitForInStatement: function(tree) {
      this.hasForIn = true;
      ParseTreeVisitor.prototype.visitForInStatement.call(this, tree);
    },

    // don't visit function children or bodies
    visitFunctionDeclaration: function(tree) {},
    visitSetAccessor: function(tree) {},
    visitGetAccessor: function(tree) {}
  });

  /**
   * This transformer turns "yield* E" into a ForOf that
   * contains a yield and is lowered by the ForOfTransformer.
   */
  function YieldForTransformer(identifierGenerator) {
    ParseTreeTransformer.call(this);
    this.identifierGenerator_ = identifierGenerator;
  }

  YieldForTransformer.transformTree = function(identifierGenerator, tree) {
    return new YieldForTransformer(identifierGenerator).transformAny(tree);
  };

  YieldForTransformer.prototype = traceur.createObject(
      ParseTreeTransformer.prototype, {

    transformYieldStatement: function(tree) {
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
  });

  /**
   * This pass just finds function bodies with yields in them and passes them
   * off to the GeneratorTransformer for the heavy lifting.
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   * @extends {ParseTreeTransformer}
   * @constructor
   */
  function GeneratorTransformPass(identifierGenerator, reporter) {
    ParseTreeTransformer.call(this);
    this.identifierGenerator_ = identifierGenerator;
    this.reporter_ = reporter;
  }

  GeneratorTransformPass.transformTree = function(identifierGenerator, reporter,
      tree) {
    return new GeneratorTransformPass(identifierGenerator, reporter).
        transformAny(tree);
  }

  GeneratorTransformPass.prototype = traceur.createObject(
      ParseTreeTransformer.prototype, {

    /**
     * @param {FunctionDeclaration} tree
     * @return {ParseTree}
     */
    transformFunctionDeclaration: function(tree) {
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
    },

    /**
     * @param {Block} tree
     * @return {Block}
     */
    transformBody_: function(tree) {
      var finder = new YieldFinder(tree);

      // transform nested functions
      var body = ParseTreeTransformer.prototype.transformBlock.call(this, tree);

      if (!finder.hasAnyGenerator()) {
        return body;
      }

      // We need to transform for-in loops because the object key iteration
      // cannot be interrupted.
      if (finder.hasForIn &&
          (options.generators || options.deferredFunctions)) {
        body = ForInTransformPass.transformTree(this.identifierGenerator_,
                                                body);
      }

      if (finder.hasYieldFor && options.generators) {
        body = YieldForTransformer.transformTree(this.identifierGenerator_,
                                                 body);
      }

      if (finder.hasYield) {
        if (options.generators) {
          body = GeneratorTransformer.transformGeneratorBody(this.reporter_,
                                                             body);
        }
      } else if (options.deferredFunctions) {
        body = AsyncTransformer.transformAsyncBody(this.reporter_, body);
      }
      return body;
    },

    /**
     * @param {GetAccessor} tree
     * @return {ParseTree}
     */
    transformGetAccessor: function(tree) {
      var body = this.transformBody_(tree.body);
      if (body == tree.body) {
        return tree;
      }
      return new GetAccessor(
          null,
          tree.propertyName,
          body);
    },

    /**
     * @param {SetAccessor} tree
     * @return {ParseTree}
     */
    transformSetAccessor: function(tree) {
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
  });

  return {
    GeneratorTransformPass: GeneratorTransformPass
  };
});
