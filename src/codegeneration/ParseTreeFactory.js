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

import {IdentifierToken} from '../syntax/IdentifierToken';
import {LiteralToken} from '../syntax/LiteralToken';
import {
  ParseTree,
  ParseTreeType
} from '../syntax/trees/ParseTree';
import {
  BIND,
  CALL,
  CREATE,
  DEFINE_PROPERTY,
  FREEZE,
  OBJECT,
  PREVENT_EXTENSIONS,
  UNDEFINED,
  getParameterName
} from '../syntax/PredefinedName';
import {Token} from '../syntax/Token';
import {
  EQUAL,
  FALSE,
  NULL,
  NUMBER,
  STRING,
  TRUE,
  VOID
} from '../syntax/TokenType';
import {assert} from '../util/assert';

import {
  ArgumentList,
  ArrayComprehension,
  ArrayLiteralExpression,
  ArrayPattern,
  ArrowFunctionExpression,
  BinaryOperator,
  BindingElement,
  BindingIdentifier,
  Block,
  BreakStatement,
  CallExpression,
  CaseClause,
  Catch,
  ClassDeclaration,
  ClassExpression,
  CommaExpression,
  ComprehensionFor,
  ComprehensionIf,
  ComputedPropertyName,
  ConditionalExpression,
  ContinueStatement,
  CoverFormals,
  CoverInitialisedName,
  DebuggerStatement,
  DefaultClause,
  DoWhileStatement,
  EmptyStatement,
  ExportDeclaration,
  ExportSpecifier,
  ExportSpecifierSet,
  ExportStar,
  ExpressionStatement,
  Finally,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  FormalParameter,
  FormalParameterList,
  FunctionBody,
  FunctionDeclaration,
  FunctionExpression,
  GeneratorComprehension,
  GetAccessor,
  IdentifierExpression,
  IfStatement,
  ImportDeclaration,
  ImportSpecifier,
  ImportSpecifierSet,
  LabelledStatement,
  LiteralExpression,
  LiteralPropertyName,
  MemberExpression,
  MemberLookupExpression,
  Module,
  ModuleDeclaration,
  ModuleSpecifier,
  NamedExport,
  NewExpression,
  ObjectLiteralExpression,
  ObjectPattern,
  ObjectPatternField,
  ParenExpression,
  PostfixExpression,
  PredefinedType,
  Script,
  PropertyMethodAssignment,
  PropertyNameAssignment,
  PropertyNameShorthand,
  RestParameter,
  ReturnStatement,
  SetAccessor,
  SpreadExpression,
  SpreadPatternElement,
  SuperExpression,
  SwitchStatement,
  SyntaxErrorTree,
  TemplateLiteralExpression,
  TemplateLiteralPortion,
  TemplateSubstitution,
  ThisExpression,
  ThrowStatement,
  TryStatement,
  TypeName,
  UnaryExpression,
  VariableDeclaration,
  VariableDeclarationList,
  VariableStatement,
  WhileStatement,
  WithStatement,
  YieldExpression
} from '../syntax/trees/ParseTrees';

// Helpers so we can use these on Arguments objects.
var slice = Array.prototype.slice.call.bind(Array.prototype.slice);
var map = Array.prototype.map.call.bind(Array.prototype.map);

// Tokens

/**
 * @param {TokenType} operator
 * @return {Token}
 */
export function createOperatorToken(operator) {
  return new Token(operator, null);
}

/**
 * @param {string} identifier
 * @return {IdentifierToken}
 */
export function createIdentifierToken(identifier) {
  return new IdentifierToken(null, identifier);
}

/**
 * @param {string} name
 * @return {Token}
 */
export function createPropertyNameToken(name) {
  // TODO: properties with non identifier names
  return createIdentifierToken(name);
}

export function createStringLiteralToken(value) {
  return new LiteralToken(STRING, JSON.stringify(value), null);
}

export function createBooleanLiteralToken(value) {
  return new Token(value ? TRUE : FALSE, null);
}

export function createNullLiteralToken() {
  return new LiteralToken(NULL, 'null', null);
}


export function createNumberLiteralToken(value) {
  return new LiteralToken(NUMBER, String(value), null);
}

// Token lists

/**
 * @return {Array.<string>}
 */
export function createEmptyParameters() {
  return [];
}

/**
 * Either creates an array from the arguments, or if the first argument is an
 * array, creates a new array with its elements followed by the other
 * arguments.
 *
 * TODO(jmesserly): this API is a bit goofy. Can we replace it with something
 * simpler? In most use cases, square brackets could replace calls to this.
 *
 * @param {Array.<ParseTree>|ParseTree} statementsOrHead
 * @param {...ParseTree} args
 * @return {Array.<ParseTree>}
 */
export function createStatementList(statementsOrHead, ...args) {
  if (statementsOrHead instanceof Array)
    return [...statementsOrHead, ...args];
  return slice(arguments);
}

/**
 * @param {string|IdentifierToken|IdentifierExpression|BindingIdentifier}
 *           identifier
 * @return {BindingElement}
 */
export function createBindingElement(arg) {
  var binding = createBindingIdentifier(arg);
  return new BindingElement(null, binding, null);
}

/**
 * @param {string|IdentifierToken|IdentifierExpression|BindingIdentifier}
 *           identifier
 * @return {FormalParameter}
 */
export function createFormalParameter(arg) {
  return new FormalParameter(null, createBindingElement(arg), null, []);
}

/**
 * TODO(arv): Make this less overloaded.
 *
 * @param {string|number|IdentifierToken|Array.<string>} arg0
 * @param {...string} var_args
 * @return {FormalParameterList}
 */
export function createParameterList(arg0, var_args) {
  if (typeof arg0 == 'string') {
    // var_args of strings
    var parameterList = map(arguments, createFormalParameter);
    return new FormalParameterList(null, parameterList);
  }

  if (typeof arg0 == 'number')
    return createParameterListHelper(arg0, false);

  if (arg0 instanceof IdentifierToken) {
    return new FormalParameterList(
        null, [createFormalParameter(arg0)]);
  }

  // Array.<string>
  var builder = arg0.map(createFormalParameter);
  return new FormalParameterList(null, builder);
}

/**
 * Helper for building parameter lists with and without rest params.
 * @param {number} numberOfParameters
 * @param {boolean} hasRestParams
 * @return {FormalParameterList}
 */
function createParameterListHelper(numberOfParameters, hasRestParams) {
  var builder = [];

  for (var index = 0; index < numberOfParameters; index++) {
    var parameterName = getParameterName(index);
    var isRestParameter = index == numberOfParameters - 1 && hasRestParams;
    builder.push(
        isRestParameter ?
            new FormalParameter(null, createRestParameter(parameterName), null, []) :
            createFormalParameter(parameterName));
  }

  return new FormalParameterList(null, builder);
}

/**
 * @param {number} numberOfParameters
 * @return {FormalParameterList}
 */
export function createParameterListWithRestParams(numberOfParameters) {
  return createParameterListHelper(numberOfParameters, true);
}

/**
 * Creates an expression that refers to the {@code index}-th
 * parameter by its predefined name.
 *
 * @see PredefinedName#getParameterName
 *
 * @param {number} index
 * @return {IdentifierExpression}
 */
export function createParameterReference(index) {
  return createIdentifierExpression(getParameterName(index));
}

/**
 * @return {FormalParameterList}
 */
export function createEmptyParameterList() {
  return new FormalParameterList(null, []);
}

// Tree Lists

export function createEmptyList() {
  // TODO(arv): Remove
  return [];
}

// Trees

/**
 * @param {Array.<ParseTree>|ParseTree|number} numberListOrFirst
 * @param {...ParseTree} var_args
 * @return {ArgumentList}
 */
export function createArgumentList(numberListOrFirst, var_args) {
  if (typeof numberListOrFirst == 'number') {
    return createArgumentListFromParameterList(
        createParameterList(numberListOrFirst));
  }

  var list;
  if (numberListOrFirst instanceof Array)
    list = numberListOrFirst;
  else
    list = slice(arguments);

  return new ArgumentList(null, list);
}

/**
 * @param {FormalParameterList} parameterList
 * @return {ArgumentList}
 */
export function createArgumentListFromParameterList(parameterList) {
  var builder = parameterList.parameters.map(function(parameter) {
    if (parameter.isRestParameter()) {
      return createSpreadExpression(
          createIdentifierExpression(
              parameter.identifier));
    } else {
      // TODO: implement pattern -> array, object literal translation
      return parameter;
    }
  });

  return new ArgumentList(null, builder);
}

/**
 * @return {ArgumentList}
 */
export function createEmptyArgumentList() {
  return new ArgumentList(null, createEmptyList());
}

/**
 * @param {Array.<ParseTree>} list
 * @return {ArrayLiteralExpression}
 */
export function createArrayLiteralExpression(list) {
  return new ArrayLiteralExpression(null, list);
}

/**
 * @return {ArrayLiteralExpression}
 */
export function createEmptyArrayLiteralExpression() {
  return createArrayLiteralExpression(createEmptyList());
}

/**
 * @param {Array.<ParseTree>} list
 * @return {ArrayPattern}
 */
export function createArrayPattern(list) {
  return new ArrayPattern(null, list);
}

/**
 * @param {ParseTree} lhs
 * @param {ParseTree} rhs
 * @return {BinaryOperator}
 */
export function createAssignmentExpression(lhs, rhs) {
  return new BinaryOperator(null, lhs,
      createOperatorToken(EQUAL), rhs);
}

/**
 * @return {BinaryOperator}
 */
export function createBinaryOperator(left, operator, right) {
  return new BinaryOperator(null, left, operator, right);
}

/**
 * @param {string|IdentifierToken|IdentifierExpression|BindingIdentifier}
 *     identifier
 * @return {BindingIdentifier}
 */
export function createBindingIdentifier(identifier) {
  if (typeof identifier === 'string')
    identifier = createIdentifierToken(identifier);
  else if (identifier.type === ParseTreeType.BINDING_IDENTIFIER)
    return identifier;
  else if (identifier.type === ParseTreeType.IDENTIFIER_EXPRESSION)
    return new BindingIdentifier(identifier.location,
                                 identifier.identifierToken);
  return new BindingIdentifier(null, identifier);
}

/**
 * @return {EmptyStatement}
 */
export function createEmptyStatement() {
  return new EmptyStatement(null);
}

/**
 * @return {Block}
 */
export function createEmptyBlock() {
  return createBlock(createEmptyList());
}

/**
 * @param {Array.<ParseTree>|ParseTree} statements
 * @param {...ParseTree} var_args
 * @return {Block}
 */
export function createBlock(statements) {
  if (statements instanceof ParseTree)
    statements = slice(arguments);
  return new Block(null, statements);
}

/**
 * @param {Array.<ParseTree>} statements
 * @return {FunctionBody}
 */
export function createFunctionBody(statements) {
  return new FunctionBody(null, statements);
}

/**
 * @param {FunctionBody} body
 * @return {CallExpression}
 */
export function createScopedExpression(body, scope = createThisExpression()) {
  assert(body.type === 'FUNCTION_BODY');
  return createCallCall(
      createParenExpression(
          createFunctionExpression(createEmptyParameterList(), body)),
      scope);
}

/**
 * @param {FunctionBody} body
 * @return {CallExpression}
 */
export function createImmediatelyInvokedFunctionExpression(body) {
  assert(body.type === 'FUNCTION_BODY');
  return createCallExpression(createParenExpression(
          createFunctionExpression(createEmptyParameterList(), body)));
}

/**
 * @param {ParseTree} operand
 * @param {ArgumentList=} args
 * @return {CallExpression}
 */
export function createCallExpression(operand,
                                     args = createEmptyArgumentList()) {
  return new CallExpression(null, operand, args);
}

/**
 * @param {ParseTree} func
 * @param {ParseTree} thisTree
 * @return {CallExpression}
 */
export function createBoundCall(func, thisTree) {
  return createCallExpression(
      createMemberExpression(
          func.type == ParseTreeType.FUNCTION_EXPRESSION ?
              createParenExpression(func) :
              func,
          BIND),
      createArgumentList(thisTree));
}

/**
 * @return {BreakStatement}
 */
export function createBreakStatement(name = null) {
  return new BreakStatement(null, name);
}

// function.call(this, arguments)
/**
 * @param {ParseTree} func
 * @param {ParseTree} thisExpression
 * @param {ParseTree|Array.<ParseTree>} args
 * @param {...ParseTree} var_args
 * @return {CallExpression}
 */
export function createCallCall(func, thisExpression, args, var_args) {
  if (args instanceof ParseTree)
    args = slice(arguments, 2);

  var builder = [thisExpression];
  if (args)
    builder.push(...args);

  return createCallExpression(
      createMemberExpression(func, CALL),
      createArgumentList(builder));
}

/**
 * @param {ParseTree} func
 * @param {ParseTree} thisExpression
 * @param {...ParseTree} args
 * @return {ParseTree}
 */
export function createCallCallStatement(func, thisExpression, ...args) {
  return createExpressionStatement(
      createCallCall(func, thisExpression, args));
}

/**
 * @param {ParseTree} expression
 * @param {Array.<ParseTree>} statements
 * @return {CaseClause}
 */
export function createCaseClause(expression, statements) {
  return new CaseClause(null, expression, statements);
}

/**
 * @param {BindingIdentifier|IdentifierToken} identifier
 * @param {ParseTree} catchBody
 * @return {Catch}
 */
export function createCatch(identifier, catchBody) {
  identifier = createBindingIdentifier(identifier);
  return new Catch(null, identifier, catchBody);
}

/**
 * @param {IdentifierToken} name
 * @param {ParseTree} superClass
 * @param {Array.<ParseTree>} elements
 * @return {ClassDeclaration}
 */
export function createClassDeclaration(name, superClass, elements) {
  return new ClassDeclaration(null, name, superClass, elements, []);
}

/**
 * @param {Array.<ParseTree>} expressions
 * @return {CommaExpression}
 */
export function createCommaExpression(expressions) {
  return new CommaExpression(null, expressions);
}

/**
 * @param {ParseTree} condition
 * @param {ParseTree} left
 * @param {ParseTree} right
 * @return {ConditionalExpression}
 */
export function createConditionalExpression(condition, left, right) {
  return new ConditionalExpression(null, condition, left, right);
}

/**
 * @return {ContinueStatement}
 */
export function createContinueStatement(name = null) {
  return new ContinueStatement(null, name);
}

/**
 * @param {Array.<ParseTree>} statements
 * @return {DefaultClause}
 */
export function createDefaultClause(statements) {
  return new DefaultClause(null, statements);
}

/**
 * @param {ParseTree} body
 * @param {ParseTree} condition
 * @return {DoWhileStatement}
 */
export function createDoWhileStatement(body, condition) {
  return new DoWhileStatement(null, body, condition);
}

/**
 * @param {ParseTree} lhs
 * @param {ParseTree} rhs
 * @return {ExpressionStatement}
 */
export function createAssignmentStatement(lhs, rhs) {
  return createExpressionStatement(createAssignmentExpression(lhs, rhs));
}

/**
 * @param {ParseTree} operand
 * @param {ArgumentList=} args
 * @return {ExpressionStatement}
 */
export function createCallStatement(operand, args = undefined) {
  return createExpressionStatement(createCallExpression(operand, args));
}

/**
 * @param {ParseTree} expression
 * @return {ExpressionStatement}
 */
export function createExpressionStatement(expression) {
  return new ExpressionStatement(null, expression);
}

/**
 * @param {ParseTree} block
 * @return {Finally}
 */
export function createFinally(block) {
  return new Finally(null, block);
}

/**
 * @param {VariableDeclarationList} initialiser
 * @param {ParseTree} collection
 * @param {ParseTree} body
 * @return {ForOfStatement}
 */
export function createForOfStatement(initialiser, collection, body) {
  return new ForOfStatement(null, initialiser, collection, body);
}

/**
 * @param {ParseTree} initialiser
 * @param {ParseTree} collection
 * @param {ParseTree} body
 * @return {ForInStatement}
 */
export function createForInStatement(initialiser, collection, body) {
  return new ForInStatement(null, initialiser, collection, body);
}

/**
 * @param {ParseTree} variables
 * @param {ParseTree} condition
 * @param {ParseTree} increment
 * @param {ParseTree} body
 * @return {ForStatement}
 */
export function createForStatement(variables, condition, increment, body) {
  return new ForStatement(null, variables, condition, increment, body);
}

/**
 * @param {FormalParameterList} parameterList
 * @param {FunctionBody} body
 * @return {FunctionExpression}
 */
export function createFunctionExpression(parameterList, body) {
  assert(body.type === 'FUNCTION_BODY');
  return new FunctionExpression(null, null, false,
                                parameterList, null, [], body);
}

// get name () { ... }
/**
 * @param {string|Token} name
 * @param {Block} body
 * @return {GetAccessor}
 */
export function createGetAccessor(name, body) {
  if (typeof name == 'string')
    name = createPropertyNameToken(name);
  var isStatic = false;
  return new GetAccessor(null, isStatic, name, null, [], body);
}

/**
 * @param {string|IdentifierToken} identifier
 * @return {IdentifierExpression}
 */
export function createIdentifierExpression(identifier) {
  if (typeof identifier == 'string')
    identifier = createIdentifierToken(identifier);
  else if (identifier instanceof BindingIdentifier)
    identifier = identifier.identifierToken;
  return new IdentifierExpression(null, identifier);
}

/**
 * @return {IdentifierExpression}
 */
export function createUndefinedExpression() {
  return createIdentifierExpression(UNDEFINED);
}

/**
 * @param {ParseTree} condition
 * @param {ParseTree} ifClause
 * @param {ParseTree=} elseClause
 * @return {IfStatement}
 */
export function createIfStatement(condition, ifClause, elseClause = null) {
  return new IfStatement(null, condition, ifClause, elseClause);
}

/**
 * @param {IdentifierToken} name
 * @param {ParseTree} statement
 * @return {LabelledStatement}
 */
export function createLabelledStatement(name, statement) {
  return new LabelledStatement(null, name, statement);
}

/**
 * @param {string} value
 * @return {ParseTree}
 */
export function createStringLiteral(value) {
  return new LiteralExpression(null, createStringLiteralToken(value));
}

/**
 * @param {boolean} value
 * @return {ParseTree}
 */
export function createBooleanLiteral(value) {
  return new LiteralExpression(null, createBooleanLiteralToken(value));
}

/**
 * @return {ParseTree}
 */
export function createTrueLiteral() {
  return createBooleanLiteral(true);
}

/**
 * @return {ParseTree}
 */
export function createFalseLiteral() {
  return createBooleanLiteral(false);
}

/**
 * @return {ParseTree}
 */
export function createNullLiteral() {
  return new LiteralExpression(null, createNullLiteralToken());
}

/**
 * @param {number} value
 * @return {ParseTree}
 */
export function createNumberLiteral(value) {
  return new LiteralExpression(null, createNumberLiteralToken(value));
}

/**
 * Creates 'operand.memberName' or 'operand[memberName]' if memberName
 * is a LiteralToken or LiteralExpression.
 *
 * @param {string|IdentifierToken|ParseTree} operand
 * @param {string|IdentifierToken|LiteralToken|LiteralExpression} memberName
 * @param {...string|IdentifierToken} memberNames
 * @return {MemberExpression|MemberLookupExpression}
 */
export function createMemberExpression(operand, memberName, memberNames) {
  if (typeof operand == 'string' || operand instanceof IdentifierToken)
    operand = createIdentifierExpression(operand);
  if (typeof memberName == 'string')
    memberName = createIdentifierToken(memberName);
  if (memberName instanceof LiteralToken)
    memberName = new LiteralExpression(null, memberName);

  var tree = memberName instanceof LiteralExpression ?
      new MemberLookupExpression(null, operand, memberName) :
      new MemberExpression(null, operand, memberName);
  for (var i = 2; i < arguments.length; i++) {
    tree = createMemberExpression(tree, arguments[i]);
  }
  return tree;
}

/**
 * @return {MemberLookupExpression}
 */
export function createMemberLookupExpression(operand,  memberExpression) {
  return new MemberLookupExpression(null, operand, memberExpression);
}

/**
 * Creates 'this' or 'this.memberName'.
 * @param {string=} memberName
 * @return {ParseTree}
 */
export function createThisExpression(memberName = undefined) {
  var result = new ThisExpression(null);
  if (memberName) {
    result = createMemberExpression(result, memberName);
  }
  return result;
}

/**
 * @param {ParseTree} operand
 * @param {ArgumentList} args
 * @return {NewExpression}
 */
export function createNewExpression(operand, args) {
  return new NewExpression(null, operand, args);
}

/**
 * @param {ParseTree} value
 * @return {ParseTree}
 */
export function createObjectFreeze(value) {
  // Object.freeze(value)
  return createCallExpression(
      createMemberExpression(OBJECT, FREEZE),
      createArgumentList(value));
}

/**
 * @param {ParseTree} value
 * @return {ParseTree}
 */
export function createObjectPreventExtensions(value) {
  // Object.preventExtensions(value)
  return createCallExpression(
      createMemberExpression(OBJECT,
                             PREVENT_EXTENSIONS),
      createArgumentList(value));
}

/**
 * @param {ParseTree} protoExpression
 * @param {ObjectLiteralExpression=} descriptors
 * @return {ParseTree}
 */
export function createObjectCreate(protoExpression, descriptors) {
  var argumentList = [protoExpression];
  if (descriptors)
    argumentList.push(descriptors);

  return createCallExpression(
      createMemberExpression(OBJECT,
                             CREATE),
      createArgumentList(argumentList));
}

/**
 * Creates an object literal tree representing a property descriptor.
 * @param {Object} descr This is a normal js object. The values in the descr
 *     may be true, false or a ParseTree.
 * @return {ObjectLiteralExpression}
 */
export function createPropertyDescriptor(descr) {
  var propertyNameAndValues = Object.keys(descr).map(function(name) {
    var value = descr[name];
    if (!(value instanceof ParseTree))
      value = createBooleanLiteral(!!value);
    return createPropertyNameAssignment(name, value);
  });
  return createObjectLiteralExpression(propertyNameAndValues);
}

/**
 * Creates a call expression to Object.defineProperty(tree, name, descr).
 *
 * @param {ParseTree} tree
 * @param {string|ParseTree} name
 * @param {Object} descr This is a normal js object. The values in the descr
 *     may be true, false or a ParseTree.
 * @return {ParseTree}
 */
export function createDefineProperty(tree, name, descr) {
  if (typeof name === 'string')
    name = createStringLiteral(name);

  return createCallExpression(
    createMemberExpression(OBJECT,
                           DEFINE_PROPERTY),
    createArgumentList(tree,
        name,
        createPropertyDescriptor(descr)));
}

/**
 * @param {Array.<ParseTree>|ParseTree} propertyNameAndValues
 * @param {...ParseTree} var_args
 * @return {ObjectLiteralExpression}
 */
export function createObjectLiteralExpression(propertyNameAndValues) {
  if (propertyNameAndValues instanceof ParseTree)
    propertyNameAndValues = slice(arguments);
  return new ObjectLiteralExpression(null, propertyNameAndValues);
}

/**
 * @param {Array.<ParseTree>} list
 * @return {ObjectPattern}
 */
export function createObjectPattern(list) {
  return new ObjectPattern(null, list);
}

/**
 * @param {IdentifierToken} identifier
 * @param {ParseTree} element
 * @return {ObjectPatternField}
 */
export function createObjectPatternField(identifier, element) {
  identifier = createBindingIdentifier(identifier);
  return new ObjectPatternField(null, identifier, element);
}

/**
 * @param {ParseTree} expression
 * @return {ParenExpression}
 */
export function createParenExpression(expression) {
  return new ParenExpression(null, expression);
}

/**
 * @param {ParseTree} operand
 * @param {ParseTree} operator
 * @return {PostfixExpression}
 */
export function createPostfixExpression(operand, operator) {
  return new PostfixExpression(null, operand, operator);
}

/**
 * @param {Array.<ParseTree>} scriptItemList
 * @return {Script}
 */
export function createScript(scriptItemList) {
  return new Script(null, scriptItemList);
}

/**
 * @param {string|ParseTree} identifier
 * @param {ParseTree} value
 * @return {PropertyNameAssignment}
 */
export function createPropertyNameAssignment(identifier, value) {
  if (typeof identifier == 'string')
    identifier = createLiteralPropertyName(identifier);
  return new PropertyNameAssignment(null, identifier, value);
}

/**
 * @param {string} name
 * @return {LiteralPropertyName}
 */
export function createLiteralPropertyName(name) {
  return new LiteralPropertyName(null, createIdentifierToken(name));
}

/**
 * @param {string|IdentifierToken|BindingIdentifier} identifier
 * @return {RestParameter}
 */
export function createRestParameter(identifier) {
  return new RestParameter(null, createBindingIdentifier(identifier));
}

/**
 * @param {ParseTree} expression
 * @return {ReturnStatement}
 */
export function createReturnStatement(expression) {
  return new ReturnStatement(null, expression);
}

/**
 * @param {ParseTree} expression
 * @param {boolean} isYieldFor
 * @return {ExpressionStatement}
 */
export function createYieldStatement(expression, isYieldFor) {
  return createExpressionStatement(new YieldExpression(null, expression,
                                                       isYieldFor));
}

/**
 * @param {string|Token} name
 * @param {string|IdentifierToken} parameter
 * @param {Block} body
 * @return {SetAccessor}
 */
export function createSetAccessor(name, parameter, body) {
  if (typeof name == 'string')
    name = createPropertyNameToken(name);
  if (typeof parameter == 'string')
    parameter = createIdentifierToken(parameter);
  var parameterList = createParameterList(parameter);
  var isStatic = false;
  return new SetAccessor(null, isStatic, name, parameterList, [], body);
}

/**
 * @param {ParseTree} expression
 * @return {SpreadExpression}
 */
export function createSpreadExpression(expression) {
  return new SpreadExpression(null, expression);
}

/**
 * @param {ParseTree} lvalue
 * @return {SpreadPatternElement}
 */
export function createSpreadPatternElement(lvalue) {
  return new SpreadPatternElement(null, lvalue);
}

/**
 * @param {ParseTree} expression
 * @param {Array.<ParseTree>} caseClauses
 * @return {SwitchStatement}
 */
export function createSwitchStatement(expression, caseClauses) {
  return new SwitchStatement(null, expression, caseClauses);
}

/**
 * @param {ParseTree} value
 * @return {ThrowStatement}
 */
export function createThrowStatement(value) {
  return new ThrowStatement(null, value);
}

/**
 * @param {ParseTree} body
 * @param {ParseTree} catchBlock
 * @param {ParseTree=} finallyBlock
 * @return {TryStatement}
 */
export function createTryStatement(body, catchBlock, finallyBlock = null) {
  return new TryStatement(null, body, catchBlock, finallyBlock);
}

/**
 * @param {Token} operator
 * @param {ParseTree} operand
 * @return {UnaryExpression}
 */
export function createUnaryExpression(operator, operand) {
  return new UnaryExpression(null, operator, operand);
}

/**
 * @return {ParseTree}
 */
export function createUseStrictDirective() {
  return createExpressionStatement(createStringLiteral('use strict'));
}

/**
 * @param {TokenType} binding
 * @param {IdentifierToken|Array.<VariableDeclaration>} identifierOrDeclarations
 * @param {ParseTree=} initialiser
 * @return {VariableDeclarationList}
 */
export function createVariableDeclarationList(binding,
                                              identifierOrDeclarations,
                                              initialiser) {
  if (identifierOrDeclarations instanceof Array) {
    var declarations = identifierOrDeclarations;
    return new VariableDeclarationList(null, binding, declarations);
  }

  var identifier = identifierOrDeclarations;
  return createVariableDeclarationList(
      binding, [createVariableDeclaration(identifier, initialiser)]);
}

/**
 * @param {string|IdentifierToken|ParseTree} identifier
 * @param {ParseTree} initialiser
 * @return {VariableDeclaration}
 */
export function createVariableDeclaration(identifier, initialiser) {
  if (!(identifier instanceof ParseTree) ||
      identifier.type !== ParseTreeType.BINDING_IDENTIFIER &&
      identifier.type !== ParseTreeType.OBJECT_PATTERN &&
      identifier.type !== ParseTreeType.ARRAY_PATTERN) {
    identifier = createBindingIdentifier(identifier);
  }

  return new VariableDeclaration(null, identifier, null, initialiser);
}

/**
 * @param {VariableDeclarationList|TokenType} listOrBinding
 * @param {string|IdentifierToken=} identifier
 * @param {ParseTree=} initialiser
 * @return {VariableStatement}
 */
export function createVariableStatement(listOrBinding,
                                        identifier,
                                        initialiser) {
  if (listOrBinding instanceof VariableDeclarationList)
    return new VariableStatement(null, listOrBinding);
  var binding = listOrBinding;
  var list = createVariableDeclarationList(binding, identifier, initialiser);
  return createVariableStatement(list);
}

/**
 * Creates a (void 0) expression.
 * @return {ParenExpression}
 */
export function createVoid0() {
  return createParenExpression(
    createUnaryExpression(
      createOperatorToken(VOID),
      createNumberLiteral(0)));
}

/**
 * @param {ParseTree} condition
 * @param {ParseTree} body
 * @return {WhileStatement}
 */
export function createWhileStatement(condition, body) {
  return new WhileStatement(null, condition, body);
}

/**
 * @param {ParseTree} expression
 * @param {ParseTree} body
 * @return {WithStatement}
 */
export function createWithStatement(expression, body) {
  return new WithStatement(null, expression, body);
}

/**
 * @param {number} state
 * @return {ExpressionStatement}
 */
export function createAssignStateStatement(state) {
  return createAssignmentStatement(
      createMemberExpression('$ctx', 'state'),
      createNumberLiteral(state));
}
