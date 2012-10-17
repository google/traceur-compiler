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

import FindVisitor from 'FindVisitor.js';
import Keywords from '../syntax/Keywords.js';
import PredefinedName from '../syntax/PredefinedName.js';
import TempVarTransformer from 'TempVarTransformer.js';
import TokenType from '../syntax/TokenType.js';
import {
  createArgumentList,
  createAssignmentExpression,
  createBindingIdentifier,
  createCallExpression,
  createCommaExpression,
  createDefineProperty,
  createEmptyParameterList,
  createFunctionExpression,
  createIdentifierExpression,
  createMemberExpression,
  createObjectCreate,
  createObjectLiteralExpression,
  createParenExpression,
  createPropertyDescriptor,
  createPropertyNameAssignment,
  createStringLiteral
} from 'ParseTreeFactory.js';
import {
  createObject,
  evaluateStringLiteral
} from '../util/util.js';
import {options: traceurOptions} from '../options.js';
import trees from '../syntax/trees/ParseTrees.js';

var FormalParameterList = trees.FormalParameterList;
var FunctionDeclaration = trees.FunctionDeclaration;
var IdentifierExpression = trees.IdentifierExpression;
var LiteralExpression = trees.LiteralExpression;


var options = traceurOptions.transform;

function getAtNameFinder(propertyName) {
  return function(tree) {
    if (options.privateNameSyntax &&
        tree[propertyName].type === TokenType.AT_NAME) {
      this.foundAtName = true;
    }
  }
}

/**
 * Finder class that finds if an object literal contains an at name or a
 * method.
 * @param {ObjectLiteralTree} tree
 */
function Finder(tree) {
  this.protoExpression = null;
  this.foundAtName_ = false;
  FindVisitor.call(this, tree, true);
}
Finder.prototype = createObject(
    FindVisitor.prototype, {
  get foundAtName() {
    return this.foundAtName_;
  },
  set foundAtName(v) {
    if (v) {
      this.foundAtName_ = true;
      this.found = true;
    }
  },
  visitPropertyNameAssignment: function(tree) {
    if (options.privateNameSyntax && tree.name.type === TokenType.AT_NAME)
      this.foundAtName = true;
    else if (getPropertyNameForToken(tree.name) === '__proto__')
      this.protoExpression = tree.value;
  },
  visitGetAccessor: getAtNameFinder('propertyName'),
  visitSetAccessor: getAtNameFinder('propertyName'),
  visitPropertyMethodAssignment: function(tree) {
    if (options.propertyMethods)
      this.found = true;
    if (options.privateNameSyntax && tree.name.type === TokenType.AT_NAME)
      this.foundAtName = true;
  },
  visitPropertyNameShorthand: getAtNameFinder('name'),
});

/**
 * The property name as a string.
 * @param {Token} nameToken
 * @return {string}
 */
function getPropertyNameForToken(nameToken) {
  if (nameToken.type === TokenType.STRING)
    return evaluateStringLiteral(nameToken);
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
 *
 * @param {UniqueIdentifierGenerator} identifierGenerator
 * @constructor
 * @extends {TempVarTransformer}
 */
export function ObjectLiteralTransformer(identifierGenerator) {
  TempVarTransformer.call(this, identifierGenerator);
  this.protoExpression = null;
  this.needsTransform = false;
  this.seenAccessors = null;
}

/**
 * @param {UniqueIdentifierGenerator} identifierGenerator
 * @param {ParseTree} tree
 */
ObjectLiteralTransformer.transformTree = function(identifierGenerator,
                                                  tree) {
  return new ObjectLiteralTransformer(identifierGenerator).
      transformAny(tree);
};

var base = TempVarTransformer.prototype;
ObjectLiteralTransformer.prototype = createObject(base, {

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
  createProperty_: function(name, descr) {
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
  },

  /**
   * Creates the expression to use as the name for:
   *
   *   Object.defineProperty(object, name, descr)
   *
   * @private
   * @param {Token} token
   * @return {ParseTree}
   */
  getPropertyName_: function(token) {
    switch (token.type) {
      case TokenType.AT_NAME:
        return createIdentifierExpression(
            this.identifierGenerator.getUniqueIdentifier(token.value));
      case TokenType.IDENTIFIER:
        return createStringLiteral(token.value);
      default:
        if (Keywords.isKeyword(token.type))
          return createStringLiteral(token.type);
        return new LiteralExpression(token.location, token);
    }
  },

  transformObjectLiteralExpression: function(tree) {
    // If the object literal needs to be transformed this calls the
    // transformation of the individual transformations of the property names
    // and values and then assembles the result of those into either a call
    // to Object.create or a temporary object that we call defineProperty/ies
    // on.

    var oldNeedsTransform = this.needsTransform;
    var oldSeenAccessors = this.seenAccessors;

    try {
      var finder = new Finder(tree);
      if (!finder.found) {
        this.needsTransform = false;
        return base.transformObjectLiteralExpression.call(this, tree);
      }

      this.needsTransform = true;
      this.seenAccessors = Object.create(null);

      var properties = this.transformList(tree.propertyNameAndValues);
      // Filter out the __proto__ here which is represented as a null value.
      properties = properties.filter((tree) => tree);

      // (tmp = ..., Object.defineProperty(...), ..., tmp)
      if (finder.foundAtName) {
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

      // Object.create(proto, descriptors)
      } else {
        properties = properties.map((property) => {
          var name = property[0];
          var descr = property[1];
          var descriptorTree = createPropertyDescriptor(descr);
          return createPropertyNameAssignment(name, descriptorTree);
        });

        var descriptors = createObjectLiteralExpression(properties);

        // Use
        //   Object.create(proto, { descriptors })
        // or
        //   Object.defineProperties({}, descriptors);
        var baseObject, methodName;
        if (protoExpression) {
          baseObject = protoExpression;
          methodName = PredefinedName.CREATE;
        } else {
          baseObject = createObjectLiteralExpression([]);
          methodName = PredefinedName.DEFINE_PROPERTIES;
        }

        return createCallExpression(
            createMemberExpression(
                PredefinedName.OBJECT,
                methodName),
            createArgumentList([
                baseObject,
                descriptors]));
      }
    } finally {
      this.needsTransform = oldNeedsTransform;
      this.seenAccessors = oldSeenAccessors;
    }
  },

  transformPropertyNameAssignment: function(tree) {
    if (!this.needsTransform)
      return base.transformPropertyNameAssignment.call(this, tree);

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
  },
  transformGetAccessor: function(tree) {
    if (!this.needsTransform)
      return base.transformGetAccessor.call(this, tree);

    var body = this.transformAny(tree.body);
    var func = createFunctionExpression(createEmptyParameterList(), body);
    return this.createProperty_(tree.propertyName,
        {
          get: func,
          configurable: true,
          enumerable: true
        });
  },
  transformSetAccessor: function(tree) {
    if (!this.needsTransform)
      return base.transformSetAccessor.call(this, tree);

    var body = this.transformAny(tree.body);
    var parameter = this.transformAny(tree.parameter);
    var parameterList = new FormalParameterList(parameter.location,
                                                [parameter]);
    var func = createFunctionExpression(parameterList, body);
    return this.createProperty_(tree.propertyName,
        {
          set: func,
          configurable: true,
          enumerable: true
        });
  },

  transformPropertyMethodAssignment: function(tree) {
    if (!this.needsTransform)
      return base.transformPropertyMethodAssignment.call(this, tree);

    var body = this.transformAny(tree.functionBody);
    var parameters = this.transformAny(tree.formalParameterList);

    var func = new FunctionDeclaration(tree.location, null, tree.isGenerator,
                                       parameters, body);

    return this.createProperty_(tree.name,
        {
          value: func,
          configurable: true,
          enumerable: false,
          writable: true
        });
  },

  transformPropertyNameShorthand: function(tree) {
    if (!this.needsTransform)
      return base.transformPropertyNameShorthand.call(this, tree);

    return this.createProperty_(tree.name,
        {
          value: new IdentifierExpression(tree.location, tree.name),
          configurable: true,
          enumerable: false,
          writable: true
        });
  }
});
