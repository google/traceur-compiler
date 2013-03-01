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

import {FindVisitor} from './FindVisitor.js';
import {
  FormalParameterList,
  FunctionExpression,
  IdentifierExpression,
  LiteralExpression
} from '../syntax/trees/ParseTrees.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {
  AT_NAME,
  IDENTIFIER,
  STRING
} from '../syntax/TokenType.js';
import {
  createAssignmentExpression,
  createCommaExpression,
  createDefineProperty,
  createEmptyParameterList,
  createFunctionExpression,
  createIdentifierExpression,
  createObjectCreate,
  createObjectLiteralExpression,
  createParenExpression,
  createPropertyNameAssignment,
  createStringLiteral
} from './ParseTreeFactory.js';
import {transformOptions} from '../options.js';

function findAtNameInProperty(propertyName) {
  return function(tree) {
    if (transformOptions.privateNameSyntax &&
        tree[propertyName].type === AT_NAME) {
      this.found = true;
    }
  };
}

/**
 * AtNameFinder class that finds if an object literal contains an at name.
 */
class AtNameFinder extends FindVisitor {
  /**
   * @param {ObjectLiteralTree} tree
   */
  constructor(tree) {
    this.protoExpression = null;
    super(tree, true);
  }

  checkAtName_(tree) {
    if (transformOptions.privateNameSyntax &&
        tree.name.type === AT_NAME) {
      return this.found = true;
    }
    return false;
  }

  visitPropertyNameAssignment(tree) {
    if (this.checkAtName_(tree))
      return;
    if (getPropertyNameForToken(tree.name) === '__proto__') {
      this.protoExpression = tree.value;
    }
  }

  visitGetAccessor(tree) {
    this.checkAtName_(tree);
  }

  visitSetAccessor(tree) {
    this.checkAtName_(tree);
  }

  visitPropertyMethodAssignment(tree) {
    this.checkAtName_(tree);
  }

  visitPropertyNameShorthand(tree) {
    this.checkAtName_(tree);
  }
}

/**
 * The property name as a string.
 * @param {Token} nameToken
 * @return {string}
 */
function getPropertyNameForToken(nameToken) {
  if (nameToken.type === STRING)
    return nameToken.processedValue;
  return nameToken.value;
}

/**
 * Transforms object literals, both for the propertyMethods and the
 * privateNameSyntax passes.
 *
 * If the object liteal contains an at name then we need to use a temporary
 * object and then use Object.defineProperty.
 *
 * If there is a method but no at names we use Object.create/defineProperties.
 */
export class ObjectLiteralTransformer extends TempVarTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   */
  constructor(identifierGenerator) {
    super(identifierGenerator);
    this.protoExpression = null;
    this.needsAtNameTransform = false;
    this.seenAccessors = null;
  }

  /**
   * Creates an intermediate data structure (Array) which is later used to
   * assemble the properties in the transformObjectLiteralExpression.
   *
   * @private
   * @param {Token} name
   * @param {Object} descr Descriptor where get, set and value are parse
   *     trees.
   * @return {Array} This returns null when we are completing an existing
   *     accessor.
   */
  createProperty_(name, descr) {
    if (descr.get || descr.set) {
      var lookupName = getPropertyNameForToken(name);
      var oldAccessor = this.seenAccessors[lookupName];
      if (oldAccessor) {
        oldAccessor.get = descr.get || oldAccessor.get;
        oldAccessor.set = descr.set || oldAccessor.set;
        delete this.seenAccessors[lookupName];
        return null;
      } else {
        this.seenAccessors[lookupName] = descr;
      }
    }
    return [name, descr];
  }

  /**
   * Creates the expression to use as the name for:
   *
   *   Object.defineProperty(object, name, descr)
   *
   * @private
   * @param {Token} token
   * @return {ParseTree}
   */
  getPropertyName_(token) {
    switch (token.type) {
      case AT_NAME:
        return createIdentifierExpression(
            this.identifierGenerator.getUniqueIdentifier(token.value));
      case IDENTIFIER:
        return createStringLiteral(token.value);
      default:
        if (token.isKeyword())
          return createStringLiteral(token.type);
        return new LiteralExpression(token.location, token);
    }
  }

  transformObjectLiteralExpression(tree) {
    // If the object literal needs to be transformed this calls the
    // transformation of the individual transformations of the property names
    // and values and then assembles the result of those into either a call
    // to Object.create or a temporary object that we call defineProperty/ies
    // on.

    var oldNeedsTransform = this.needsAtNameTransform;
    var oldSeenAccessors = this.seenAccessors;

    try {
      var finder = new AtNameFinder(tree);
      if (!finder.found) {
        this.needsAtNameTransform = false;
        return super.transformObjectLiteralExpression(tree);
      }

      this.needsAtNameTransform = true;
      this.seenAccessors = Object.create(null);

      var properties = this.transformList(tree.propertyNameAndValues);
      // Filter out the __proto__ here which is represented as a null value.
      properties = properties.filter((tree) => tree);

      // (tmp = ..., Object.defineProperty(...), ..., tmp)
      var tempVar = this.addTempVar();
      var tempVarIdentifierExpression = createIdentifierExpression(tempVar);

      var expressions = properties.map((property) => {
        var name = property[0];
        var descr = property[1];
        return createDefineProperty(
            tempVarIdentifierExpression,
            this.getPropertyName_(name),
            descr);
      });

      var protoExpression = this.transformAny(finder.protoExpression);
      var objectExpression;
      if (protoExpression)
        objectExpression = createObjectCreate(protoExpression);
      else
        objectExpression = createObjectLiteralExpression([]);

      expressions.unshift(
          createAssignmentExpression(
              tempVarIdentifierExpression,
              objectExpression));
      expressions.push(tempVarIdentifierExpression);
      return createParenExpression(createCommaExpression(expressions));
    } finally {
      this.needsAtNameTransform = oldNeedsTransform;
      this.seenAccessors = oldSeenAccessors;
    }
  }

  transformPropertyNameAssignment(tree) {
    if (!this.needsAtNameTransform)
      return super.transformPropertyNameAssignment(tree);

    // __proto__ is handled separately.
    if (getPropertyNameForToken(tree.name) === '__proto__')
      return null;

    return this.createProperty_(tree.name,
        {
          value: this.transformAny(tree.value),
          configurable: true,
          enumerable: true,
          writable: true
        });
  }
  transformGetAccessor(tree) {
    if (!this.needsAtNameTransform)
      return super.transformGetAccessor(tree);

    var body = this.transformAny(tree.body);
    var func = createFunctionExpression(createEmptyParameterList(), body);
    return this.createProperty_(tree.name,
        {
          get: func,
          configurable: true,
          enumerable: true
        });
  }
  transformSetAccessor(tree) {
    if (!this.needsAtNameTransform)
      return super.transformSetAccessor(tree);

    var body = this.transformAny(tree.body);
    var parameter = this.transformAny(tree.parameter);
    var parameterList = new FormalParameterList(parameter.location,
                                                [parameter]);
    var func = createFunctionExpression(parameterList, body);
    return this.createProperty_(tree.name,
        {
          set: func,
          configurable: true,
          enumerable: true
        });
  }

  transformPropertyMethodAssignment(tree) {
    var func = new FunctionExpression(tree.location, null, tree.isGenerator,
        this.transformAny(tree.formalParameterList),
        this.transformAny(tree.functionBody));
    if (!this.needsAtNameTransform) {
      // m() { }
      //  =>
      // m: function() { }
      return createPropertyNameAssignment(tree.name, func);
    }

    return this.createProperty_(tree.name,
        {
          value: func,
          configurable: true,
          enumerable: true,
          writable: true
        });
  }

  transformPropertyNameShorthand(tree) {
    if (!this.needsAtNameTransform)
      return super.transformPropertyNameShorthand(tree);

    return this.createProperty_(tree.name,
        {
          value: new IdentifierExpression(tree.location, tree.name),
          configurable: true,
          enumerable: false,
          writable: true
        });
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   */
  static transformTree(identifierGenerator, tree) {
    return new ObjectLiteralTransformer(identifierGenerator).transformAny(tree);
  }
}
