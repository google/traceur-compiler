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

'use strong';

import {AlphaRenamer} from './AlphaRenamer.js';
import {
  CONSTRUCTOR
} from '../syntax/PredefinedName.js';
import {
  AnonBlock,
  ExportDeclaration,
  FunctionExpression,
  GetAccessor,
  PropertyMethodAssignment,
  SetAccessor
} from '../syntax/trees/ParseTrees.js';
import {
  createBindingIdentifier,
  createIdentifierToken
} from '../codegeneration/ParseTreeFactory.js';
import {
  CALL_EXPRESSION,
  COMPUTED_PROPERTY_NAME,
  EXPRESSION_STATEMENT,
  GET_ACCESSOR,
  PROPERTY_METHOD_ASSIGNMENT,
  PROPERTY_VARIABLE_DECLARATION,
  SET_ACCESSOR,
  SUPER_EXPRESSION
} from '../syntax/trees/ParseTreeType.js';
import {SuperTransformer} from './SuperTransformer.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {
  VAR,
  STRING
} from '../syntax/TokenType.js';
import {MakeStrictTransformer} from './MakeStrictTransformer.js';
import {
  createEmptyParameterList,
  createExpressionStatement,
  createFunctionBody,
  createIdentifierExpression as id,
  createMemberExpression,
  createObjectLiteralExpression,
  createParenExpression,
  createPropertyNameAssignment,
  createThisExpression,
  createVariableStatement
} from './ParseTreeFactory.js';
import {hasUseStrict} from '../semantics/util.js';
import {
  parseExpression,
  parseStatement,
  parseStatements
} from './PlaceholderParser.js';
import {propName} from '../staticsemantics/PropName.js';
import {prependStatements} from './PrependStatements.js';

// Interaction between ClassTransformer and SuperTransformer:
// - The initial call to SuperTransformer will always be a transformBlock on
//   the body of a function -- method, getter, setter, or constructor.
// - SuperTransformer will never see anything that has not been touched first
//   by ClassTransformer and (if applicable) a previous invocation of
//   SuperTransformer on the functions of any inner classes. [see ref_1]
// - This means that SuperTransformer should only ever see desugared class
//   declarations, and should never see any super expressions that refer to
//   any inner (or outer) classes.


// Maximally minimal classes
//
//   http://wiki.ecmascript.org/doku.php?id=strawman:maximally_minimal_classes
//
// This transforms class declarations and class expressions.
//
//   class C extends B {
//     constructor(x) {
//       super();
//     }
//     method() {
//       super.m();
//     }
//   }
//
//   =>
//
//   var C = function(x) {
//     $traceurRuntime.superConstructor($C).call(this));
//   };
//   var $C = $traceurRuntime.createClass(C, {
//     method: function() {
//       $traceurRuntime.superGet(this, $C.prototype, 'm').call(this);
//     }
//   }, {}, B);
//

function classCall(func, object, staticObject, superClass) {
  if (superClass) {
    return parseExpression
        `($traceurRuntime.createClass)(${func}, ${object}, ${staticObject},
                                       ${superClass})`;
  }
  return parseExpression
      `($traceurRuntime.createClass)(${func}, ${object}, ${staticObject})`;
}

function methodNameFromTree(tree) {
  // COMPUTED_PROPERTY_NAME such as [Symbol.iterator]
  if (tree.type === COMPUTED_PROPERTY_NAME) {
    return '';
  }

  if (tree.literalToken && tree.literalToken.type === STRING) {
    return tree.getStringValue().substr(1, -1);
  }

  // identifier, delete, import, catch, etc.
  return tree.getStringValue();
}

function classMethodDebugName(className, methodName, isStatic) {
  if (isStatic) {
    return createBindingIdentifier('$__' + className + '_' + methodName);
  }

  return createBindingIdentifier('$__' + className + '_prototype_' + methodName);
}

export class ClassTransformer extends TempVarTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   * @param {Options} options
   */
  constructor(identifierGenerator, reporter, options) {
    super(identifierGenerator);
    this.options_ = options;
    this.strictCount_ = 0;
    this.state_ = null;
    this.reporter_ = reporter;
    this.showDebugNames_ = options.debugNames;
  }

  // Override to handle AnonBlock
  transformExportDeclaration(tree) {
    var transformed = super.transformExportDeclaration(tree);
    if (transformed === tree)
      return tree;

    var declaration = transformed.declaration;
    if (declaration instanceof AnonBlock) {
      var statements = [
        new ExportDeclaration(null, declaration.statements[0], []),
        ...declaration.statements.slice(1)
      ];
      return new AnonBlock(null, statements);
    }
    return transformed;
  }

  transformModule(tree) {
    this.strictCount_ = 1;
    return super.transformModule(tree);
  }

  transformScript(tree) {
    this.strictCount_ = +hasUseStrict(tree.scriptItemList);
    return super.transformScript(tree);
  }

  transformFunctionBody(tree) {
    var useStrict = +hasUseStrict(tree.statements);
    this.strictCount_ += useStrict;
    var result = super.transformFunctionBody(tree);
    this.strictCount_ -= useStrict;
    return result;
  }

  makeStrict_(tree) {
    if (this.strictCount_)
      return tree;

    return MakeStrictTransformer.transformTree(tree);
  }

  transformClassElements_(tree, internalName, originalName) {
    var oldState = this.state_;
    this.state_ = {hasSuper: false};
    var superClass = this.transformAny(tree.superClass);

    var hasConstructor = false;
    var protoElements = [], staticElements = [];
    var initInstanceVars = [], initStaticVars = [];
    var constructor;

    tree.elements.forEach((tree) => {
      var elements, homeObject, initVars;
      if (tree.isStatic) {
        elements = staticElements;
        homeObject = internalName;
        initVars = initStaticVars;
      } else {
        elements = protoElements;
        homeObject = createMemberExpression(internalName, 'prototype');
        initVars = initInstanceVars;
      }

      switch (tree.type) {
        case GET_ACCESSOR:
          elements.push(this.transformGetAccessor_(tree, homeObject));
          break;

        case SET_ACCESSOR:
          elements.push(this.transformSetAccessor_(tree, homeObject));
          break;

        case PROPERTY_METHOD_ASSIGNMENT:
          if (!tree.isStatic && propName(tree) === CONSTRUCTOR) {
            hasConstructor = true;
            constructor = tree;
          } else {
            var transformed = this.transformPropertyMethodAssignment_(
                tree, homeObject, internalName, originalName);
            elements.push(transformed);
          }
          break;

        case PROPERTY_VARIABLE_DECLARATION:
          this.transformAny(tree);
          if (tree.initializer !== null) {
            initVars.push(tree);
          }
          break;

        default:
          throw new Error(`Unexpected class element: ${tree.type}`);
      }
    });

    var object = createObjectLiteralExpression(protoElements);
    var staticObject = createObjectLiteralExpression(staticElements);
    var initStatements = getInstanceInitStatements(initInstanceVars);
    var func;

    if (!hasConstructor) {
      func = this.getDefaultConstructor_(tree, internalName, initStatements);
    } else {
      if (this.options_.memberVariables) {
        constructor = this.appendInstanceInitializers_(constructor,
            initStatements, tree.superClass);
      }
      var homeObject = createMemberExpression(internalName, 'prototype');
      var transformedCtor = this.transformPropertyMethodAssignment_(
          constructor, homeObject, internalName);
      func = new FunctionExpression(tree.location, tree.name, false,
          transformedCtor.parameterList, null, [], transformedCtor.body);
    }

    var state = this.state_;
    this.state_ = oldState;

    return {
      func,
      superClass,
      object,
      staticObject,
      hasSuper: state.hasSuper,
      initStaticVars,
    };
  }

  /**
   * Transforms a single class declaration
   *
   * @param {ClassDeclaration} tree
   * @return {ParseTree}
   */
  transformClassDeclaration(tree) {
    var name = tree.name.identifierToken;
    var internalName = id(`$${name}`);

    var renamed = AlphaRenamer.rename(tree, name.value, internalName.identifierToken.value);
    var referencesClassName = renamed !== tree
    var tree = renamed;

    var {
      func,
      hasSuper,
      object,
      staticObject,
      superClass,
      initStaticVars,
    } = this.transformClassElements_(tree, internalName, name);

    // TODO(arv): Use let.
    var statements = parseStatements `var ${name} = ${func}`;

    staticObject = appendStaticInitializers(staticObject, initStaticVars);

    var expr = classCall(name, object, staticObject, superClass);

    if (hasSuper || referencesClassName) {
      // The internal name is so that super lookups continue to work even in
      // case someone overrides the class binding name.
      // Also, ClassExpression binds the class name in the class body.
      // TODO(arv): Use const for the internal name.
      statements.push(parseStatement `var ${internalName} = ${name}`);
    }
    statements.push(createExpressionStatement(expr));

    var anonBlock = new AnonBlock(null, statements);
    return this.makeStrict_(anonBlock);
  }

  transformClassExpression(tree) {
    this.pushTempScope();

    var name;
    if (tree.name)
      name = tree.name.identifierToken;
    else
      name = createIdentifierToken(this.getTempIdentifier());

    var internalName = id(`${name}`);

    var {
      func,
      hasSuper,
      object,
      staticObject,
      superClass,
      initStaticVars,
    } = this.transformClassElements_(tree, internalName, name);

    var expression;

    staticObject = appendStaticInitializers(staticObject, initStaticVars);

    if (hasSuper || tree.name) {
      // We need a binding name that can be referenced in the super calls and
      // we hide this name in an IIFE.
      // TODO(arv): Use const.
      if (superClass) {
        expression = parseExpression `function($__super) {
          var ${internalName} = ${func};
          return ($traceurRuntime.createClass)(${internalName}, ${object},
                                               ${staticObject}, $__super);
        }(${superClass})`;
      } else {
        expression = parseExpression `function() {
          var ${internalName} = ${func};
          return ($traceurRuntime.createClass)(${internalName}, ${object},
                                               ${staticObject});
        }()`;
      }
    } else {
      expression = classCall(func, object, staticObject, superClass);
    }

    this.popTempScope();

    return createParenExpression(this.makeStrict_(expression));
  }

  transformPropertyMethodAssignment_(tree, homeObject, internalName, originalName) {
    var parameterList = this.transformAny(tree.parameterList);
    var body = this.transformSuperInFunctionBody_(
        tree.body, homeObject, internalName);

    if (this.showDebugNames_) {
      tree.debugName = classMethodDebugName(originalName, methodNameFromTree(tree.name), isStatic);
    }

    if (!tree.isStatic &&
        parameterList === tree.parameterList &&
        body === tree.body) {
      return tree;
    }

    var isStatic = false;
    return new PropertyMethodAssignment(tree.location, isStatic,
        tree.functionKind, tree.name, parameterList, tree.typeAnnotation,
        tree.annotations, body, tree.debugName);
  }

  transformGetAccessor_(tree, homeObject) {
    var body = this.transformSuperInFunctionBody_(tree.body, homeObject);
    if (!tree.isStatic && body === tree.body)
      return tree;
    // not static
    return new GetAccessor(tree.location, false, tree.name, tree.typeAnnotation,
                           tree.annotations, body);
  }

  transformSetAccessor_(tree, homeObject) {
    var parameterList = this.transformAny(tree.parameterList);
    var body = this.transformSuperInFunctionBody_(tree.body, homeObject);
    if (!tree.isStatic && body === tree.body)
      return tree;
    return new SetAccessor(tree.location, false, tree.name, parameterList,
                           tree.annotations, body);
  }

  transformSuperInFunctionBody_(tree, homeObject, internalName) {
    this.pushTempScope();
    var thisName = this.getTempIdentifier();
    var thisDecl = createVariableStatement(VAR, thisName,
                                           createThisExpression());
    var superTransformer = new SuperTransformer(this, homeObject,
                                                thisName, internalName);
    // ref_1: the inner transformFunctionBody call is key to proper super nesting.
    var transformedTree =
        superTransformer.transformFunctionBody(this.transformFunctionBody(tree));

    if (superTransformer.hasSuper)
      this.state_.hasSuper = true;

    this.popTempScope();

    if (superTransformer.nestedSuper)
      return createFunctionBody([thisDecl].concat(transformedTree.statements));
    return transformedTree;
  }

  getDefaultConstructor_(tree, internalName, initStatements) {
    var constructorParams = createEmptyParameterList();
    var constructorBody;
    if (tree.superClass) {
      var statement = parseStatement `$traceurRuntime.superConstructor(
          ${internalName}).apply(this, arguments)`;
      constructorBody = createFunctionBody([statement, ...initStatements]);
      this.state_.hasSuper = true;
    } else {
      constructorBody = createFunctionBody(initStatements);
    }

    return new FunctionExpression(tree.location, tree.name, false,
                                  constructorParams, null, [], constructorBody);
  }

  appendInstanceInitializers_(constructor, initStatements, superClass) {
    var statements = constructor.body.statements;

    if (superClass) {
      var superExpressionIndex = -1;

      for (var index = 0; index < statements.length; index++) {
        var statement = statements[index];
        if (statement.isDirectivePrologue()) {
          continue;
        }
        if (isSuper(statement)) {
          superExpressionIndex = index;
          break;
        }
        if (initStatements.length > 0) {
          this.reporter_.reportError(statement.location.start,
              'The first statement of the constructor must be a super ' +
              'call when the memberVariables option is enabled and the ' +
              'class contains initialized instance variables');
        }
      }

      if (superExpressionIndex === -1) {
        this.reporter_.reportError(constructor.location.start,
            'Constructors of derived class must contain a super call ' +
            'when the memberVariables option is enabled');
      }
      if (initStatements.length === 0) return constructor;
      statements = statements.slice();
      statements.splice(superExpressionIndex + 1, 0, ...initStatements);
    } else {
      if (initStatements.length === 0) return constructor;
      statements = prependStatements(statements, ...initStatements);
    }

    return new PropertyMethodAssignment(constructor.location, false,
        constructor.functionKind, constructor.name, constructor.parameterList,
        constructor.typeAnnotation, constructor.annotations,
        createFunctionBody(statements));
  }
}

// TODO(vicb): Does not handle computed properties
function appendStaticInitializers(staticObject, initStaticMemberVars) {
  // Initializes static member variables
  if (initStaticMemberVars.length === 0) return staticObject;

  var properties =[];
  for (var i = 0; i < initStaticMemberVars.length; i++) {
    var mv = initStaticMemberVars[i];
    properties.push(createPropertyNameAssignment(mv.name, mv.initializer));
  }
  return createObjectLiteralExpression(
      staticObject.propertyNameAndValues.concat(properties));
}

// TODO(vicb): Does not handle computed properties
function getInstanceInitStatements(initInstanceVars) {
    // Compute instance member variable initialization statements
    var initStatements = [];
    for (var i = 0; i < initInstanceVars.length; i++) {
      var mv = initInstanceVars[i];
      var name = mv.name.literalToken;
      initStatements.push(parseStatement `this.${name} = ${mv.initializer};`);
    }
  return initStatements;
}

function isSuper(statement) {
  return statement.type === EXPRESSION_STATEMENT &&
         statement.expression.type === CALL_EXPRESSION &&
         statement.expression.operand.type === SUPER_EXPRESSION;
}
