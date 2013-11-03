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

import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import {ClassTransformer} from './ClassTransformer.js';
import {
  createArgumentList,
  createAssignmentStatement,
  createCallExpression,
  createFunctionBody,
  createFunctionExpression,
  createIdentifierExpression,
  createParameterList,
  createParenExpression,
  createReturnStatement,
  createScript
} from './ParseTreeFactory.js';
import {
  parseExpression,
  parseStatement
} from './PlaceholderParser.js';
import {propName} from '../staticsemantics/PropName.js';

var DECORATE_CLASS_CODE =
    `function(constructor, decorator) {
      if (typeof decorator !== "function")
        throw new TypeError();
      var constructorReplacement = decorator.call(undefined, constructor);
      if (constructorReplacement) {
        var $__proto = %getProtoParent(constructor);
        constructor = (%createClass)({constructor: constructorReplacement}, {}, $__proto, constructor, true);
      }
      return constructor;
    }`;

/**
 * Decorator extension  
 *
 */
export class DecoratedClassTransformer extends ParseTreeTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {RuntimeInliner} runtimeInliner
   * @param {ErrorReporter} reporter
   */
  constructor(identifierGenerator, runtimeInliner, reporter) {
    super();
    this.identifierGenerator_ = identifierGenerator;
    this.runtimeInliner_ = runtimeInliner;
    this.reporter_ = reporter;
    this.classTransformer_ = new ClassTransformer(identifierGenerator, runtimeInliner, reporter);
  }

  transformDecoratedClassDeclaration(tree) {    
    var transformedClass = this.classTransformer_.transformAny(tree.decoratedClass);
    var decoratorStatements = [];
    var constructorName = createIdentifierExpression('constructor');
    for (var decorator of tree.decorations) {

      decoratorStatements.push(createAssignmentStatement(constructorName,
        createCallExpression(this.decorateClass_,
          createArgumentList(constructorName, decorator))));
    }

    decoratorStatements.push(createReturnStatement(constructorName));

    var decorateStatement = createAssignmentStatement(tree.decoratedClass.name, 
      createCallExpression(
        createParenExpression(
          createFunctionExpression(createParameterList('constructor'), createFunctionBody(decoratorStatements))),
        createArgumentList(tree.decoratedClass.name)));
    return createScript([transformedClass, decorateStatement]);
  }

  get decorateClass_() {
    // force the createClass and getProtoParent functions to get generated
    this.classTransformer_.createClass_;
    this.classTransformer_.getProtoParent_;
    return this.runtimeInliner_.get('decorateClass', DECORATE_CLASS_CODE);
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {RuntimeInliner} runtimeInliner
   * @param {ErrorReporter} reporter
   * @param {Script} tree
   * @return {Script}
   */
  static transformTree(identifierGenerator, runtimeInliner, reporter, tree) {
    return new DecoratedClassTransformer(identifierGenerator, runtimeInliner, reporter).transformAny(tree);
  }
}