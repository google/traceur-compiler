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

traceur.define('codegeneration', function() {
  'use strict';

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;

  var createBlock = ParseTreeFactory.createBlock;
  var createReturnStatement = ParseTreeFactory.createReturnStatement;

  /**
   * Desugars concise function bodies.
   *
   *   var object = {
   *     method() alert(42),
   *     set x(v) this._x = v,
   *     get x() 42
   *   }
   *
   * This is part of the ES6 draft.
   *
   * @extends {ParseTreeTransformer}
   * @constructor
   */
  function ConciseBodyTransformer() {}

  ConciseBodyTransformer.transformTree = function(tree) {
    return new ConciseBodyTransformer().transformAny(tree);
  };

  ConciseBodyTransformer.transformFunctionBody = function(tree) {
    return new ConciseBodyTransformer().transformFunctionBody(tree);
  };

  ConciseBodyTransformer.prototype = traceur.createObject(
      ParseTreeTransformer.prototype, {

    transformFunctionBody: function(tree) {
      var transformedTree =
          ParseTreeTransformer.prototype.transformFunctionBody.call(this, tree);
      if (transformedTree.type === ParseTreeType.BLOCK)
        return transformedTree;

      // { return expr; }
      return createBlock(createReturnStatement(transformedTree));
    },
  });

  return {
    ConciseBodyTransformer: ConciseBodyTransformer
  };
});
