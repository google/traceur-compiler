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

  var IdentifierToken = traceur.syntax.IdentifierToken;
  var LiteralToken = traceur.syntax.LiteralToken;
  var ParseTreeType = traceur.syntax.ParseTreeType;
  var PredefinedName = traceur.syntax.PredefinedName;
  var Token = traceur.syntax.Token;
  var TokenType = traceur.syntax.TokenType;

  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;

  var ArgumentList = traceur.syntax.trees.ArgumentList;
  var ArrayLiteralExpression = traceur.syntax.trees.ArrayLiteralExpression;
  var ArrayPattern = traceur.syntax.trees.ArrayPattern;
  var BinaryOperator = traceur.syntax.trees.BinaryOperator;
  var BindingElement = traceur.syntax.trees.BindingElement;
  var BindingIdentifier = traceur.syntax.trees.BindingIdentifier;
  var Block = traceur.syntax.trees.Block;
  var BreakStatement = traceur.syntax.trees.BreakStatement;
  var CallExpression = traceur.syntax.trees.CallExpression;
  var CascadeExpression = traceur.syntax.trees.CascadeExpression;
  var CaseClause = traceur.syntax.trees.CaseClause;
  var Catch = traceur.syntax.trees.Catch;
  var ClassDeclaration = traceur.syntax.trees.ClassDeclaration;
  var CommaExpression = traceur.syntax.trees.CommaExpression;
  var ConditionalExpression = traceur.syntax.trees.ConditionalExpression;
  var ContinueStatement = traceur.syntax.trees.ContinueStatement;
  var DefaultClause = traceur.syntax.trees.DefaultClause;
  var DoWhileStatement = traceur.syntax.trees.DoWhileStatement;
  var EmptyStatement = traceur.syntax.trees.EmptyStatement;
  var ExpressionStatement = traceur.syntax.trees.ExpressionStatement;
  var Finally = traceur.syntax.trees.Finally;
  var ForInStatement = traceur.syntax.trees.ForInStatement;
  var ForOfStatement = traceur.syntax.trees.ForOfStatement;
  var ForStatement = traceur.syntax.trees.ForStatement;
  var FormalParameterList = traceur.syntax.trees.FormalParameterList;
  var FunctionDeclaration = traceur.syntax.trees.FunctionDeclaration;
  var GetAccessor = traceur.syntax.trees.GetAccessor;
  var IdentifierExpression = traceur.syntax.trees.IdentifierExpression;
  var IfStatement = traceur.syntax.trees.IfStatement;
  var LabelledStatement = traceur.syntax.trees.LabelledStatement;
  var LiteralExpression = traceur.syntax.trees.LiteralExpression;
  var MemberExpression = traceur.syntax.trees.MemberExpression;
  var MemberLookupExpression = traceur.syntax.trees.MemberLookupExpression;
  var NewExpression = traceur.syntax.trees.NewExpression;
  var ObjectLiteralExpression = traceur.syntax.trees.ObjectLiteralExpression;
  var ObjectPattern = traceur.syntax.trees.ObjectPattern;
  var ObjectPatternField = traceur.syntax.trees.ObjectPatternField;
  var ParenExpression = traceur.syntax.trees.ParenExpression;
  var PostfixExpression = traceur.syntax.trees.PostfixExpression;
  var Program = traceur.syntax.trees.Program;
  var PropertyNameAssignment = traceur.syntax.trees.PropertyNameAssignment;
  var RestParameter = traceur.syntax.trees.RestParameter;
  var ReturnStatement = traceur.syntax.trees.ReturnStatement;
  var YieldStatement = traceur.syntax.trees.YieldStatement;
  var SetAccessor = traceur.syntax.trees.SetAccessor;
  var SpreadExpression = traceur.syntax.trees.SpreadExpression;
  var SpreadPatternElement = traceur.syntax.trees.SpreadPatternElement;
  var SwitchStatement = traceur.syntax.trees.SwitchStatement;
  var ThisExpression = traceur.syntax.trees.ThisExpression;
  var ThrowStatement = traceur.syntax.trees.ThrowStatement;
  var TryStatement = traceur.syntax.trees.TryStatement;
  var UnaryExpression = traceur.syntax.trees.UnaryExpression;
  var VariableDeclarationList = traceur.syntax.trees.VariableDeclarationList;
  var VariableDeclaration = traceur.syntax.trees.VariableDeclaration;
  var VariableStatement = traceur.syntax.trees.VariableStatement;
  var WhileStatement = traceur.syntax.trees.WhileStatement;
  var WithStatement = traceur.syntax.trees.WithStatement;

  // Helpers so we can use these on Arguments objects.
  var slice = Array.prototype.slice.call.bind(Array.prototype.slice);
  var map = Array.prototype.map.call.bind(Array.prototype.map);

  // Tokens

  /**
   * @param {TokenType} operator
   * @return {Token}
   */
  function createOperatorToken(operator) {
    return new Token(operator, null);
  }

  /**
   * @param {string} identifier
   * @return {IdentifierToken}
   */
  function createIdentifierToken(identifier) {
    return new IdentifierToken(null, identifier);
  }

  /**
   * @param {string} propertyName
   * @return {Token}
   */
  function createPropertyNameToken(propertyName) {
    // TODO: properties with non identifier names
    return createIdentifierToken(propertyName);
  }

  function createStringLiteralToken(value) {
    return new LiteralToken(TokenType.STRING, JSON.stringify(value), null);
  }

  function createBooleanLiteralToken(value) {
    return new Token(value ? TokenType.TRUE : TokenType.FALSE, null);
  }

  function createNullLiteralToken() {
    return new LiteralToken(TokenType.NULL, 'null', null);
  }


  function createNumberLiteralToken(value) {
    return new LiteralToken(TokenType.NUMBER, String(value), null);
  }

  // Token lists

  /**
   * @return {Array.<string>}
   */
  function createEmptyParameters() {
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
   * @param {...ParseTree} var_args
   * @return {Array.<ParseTree>}
   */
  function createStatementList(statementsOrHead, var_args) {
    if (statementsOrHead instanceof Array) {
      var result = statementsOrHead.slice();
      result.push.apply(result, slice(arguments, 1));
      return result;
    }
    return slice(arguments);
  }

  /**
   * @param {string|IdentifierToken|IdentifierExpression|BindingIdentifier}
   *           identifier
   * @return {BindingElement}
   */
  function createBindingElement(arg) {
    var binding = createBindingIdentifier(arg);
    return new BindingElement(null, binding, null);
  }

  /**
   * TODO(arv): Make this less overloaded.
   *
   * @param {string|number|IdentifierToken|Array.<string>} arg0
   * @param {...string} var_args
   * @return {FormalParameterList}
   */
  function createParameterList(arg0, var_args) {
    if (typeof arg0 == 'string') {
      // var_args of strings
      var parameterList = map(arguments, createBindingElement);
      return new FormalParameterList(null, parameterList);
    }

    if (typeof arg0 == 'number')
      return createParameterListHelper(arg0, false);

    if (arg0 instanceof IdentifierToken) {
      return new FormalParameterList(
          null, [createBindingElement(arg0)]);
    }

    // Array.<string>
    var builder = arg0.map(createBindingElement);
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
      var parameterName = PredefinedName.getParameterName(index);
      var isRestParameter = index == numberOfParameters - 1 && hasRestParams;
      builder.push(
          isRestParameter ?
              createRestParameter(parameterName) :
              createBindingElement(parameterName));
    }

    return new FormalParameterList(null, builder);
  }

  /**
   * @param {number} numberOfParameters
   * @return {FormalParameterList}
   */
  function createParameterListWithRestParams(numberOfParameters) {
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
  function createParameterReference(index) {
    return createIdentifierExpression(PredefinedName.getParameterName(index));
  }

  /**
   * @return {FormalParameterList}
   */
  function createEmptyParameterList() {
    return new FormalParameterList(null, []);
  }

  // Tree Lists

  function createEmptyList() {
    // TODO(arv): Remove
    return [];
  }

  // Trees

  /**
   * @param {Array.<ParseTree>|ParseTree|number} numberListOrFirst
   * @param {...ParseTree} var_args
   * @return {ArgumentList}
   */
  function createArgumentList(numberListOrFirst, var_args) {
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
   * @param {FormalParameterList} formalParameterList
   * @return {ArgumentList}
   */
  function createArgumentListFromParameterList(formalParameterList) {
    var builder = formalParameterList.parameters.map(function(parameter) {
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
  function createEmptyArgumentList() {
    return new ArgumentList(null, createEmptyList());
  }

  /**
   * @param {Array.<ParseTree>} list
   * @return {ArrayLiteralExpression}
   */
  function createArrayLiteralExpression(list) {
    return new ArrayLiteralExpression(null, list);
  }

  /**
   * @return {ArrayLiteralExpression}
   */
  function createEmptyArrayLiteralExpression() {
    return createArrayLiteralExpression(createEmptyList());
  }

  /**
   * @param {Array.<ParseTree>} list
   * @return {ArrayPattern}
   */
  function createArrayPattern(list) {
    return new ArrayPattern(null, list);
  }

  /**
   * @param {ParseTree} lhs
   * @param {ParseTree} rhs
   * @return {BinaryOperator}
   */
  function createAssignmentExpression(lhs, rhs) {
    return new BinaryOperator(null, lhs,
        createOperatorToken(TokenType.EQUAL), rhs);
  }

  /**
   * @return {BinaryOperator}
   */
  function createBinaryOperator(left, operator, right) {
    return new BinaryOperator(null, left, operator, right);
  }

  /**
   * @param {string|IdentifierToken|IdentifierExpression|BindingIdentifier} identifier
   * @return {BindingIdentifier}
   */
  function createBindingIdentifier(identifier) {
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
  function createEmptyStatement() {
    return new EmptyStatement(null);
  }

  /**
   * @return {Block}
   */
  function createEmptyBlock() {
    return createBlock(createEmptyList());
  }

  /**
   * @param {Array.<ParseTree>|ParseTree} statements
   * @param {...ParseTree} var_args
   * @return {Block}
   */
  function createBlock(statements) {
    if (statements instanceof ParseTree)
      statements = slice(arguments);
    return new Block(null, statements);
  }

  /**
   * @param {Array.<ParseTree>|ParseTree} statements
   * @param {...ParseTree} var_args
   * @return {ParseTree}
   */
  function createScopedStatements(statements) {
    if (statements instanceof ParseTree)
      statements = slice(arguments);
    return createScopedBlock(createBlock(statements));
  }

  /**
   * @param {Block} block
   * @return {ParseTree}
   */
  function createScopedBlock(block) {
    return createExpressionStatement(createScopedExpression(block));
  }

  /**
   * @param {Block} block
   * @return {CallExpression}
   */
  function createScopedExpression(block) {
    return createCallCall(
        createParenExpression(
            createFunctionExpression(createEmptyParameterList(), block)),
        createThisExpression());
  }

  /**
   * @param {ParseTree} operand
   * @param {ArgumentList=} opt_args
   * @return {CallExpression}
   */
  function createCallExpression(operand, opt_args) {
    var args = opt_args || createEmptyArgumentList();
    return new CallExpression(null, operand, args);
  }

  /**
   * @param {ParseTree} func
   * @param {ParseTree} thisTree
   * @return {CallExpression}
   */
  function createBoundCall(func, thisTree) {
    return createCallExpression(
        createMemberExpression(
            func.type == ParseTreeType.FUNCTION_DECLARATION ?
                createParenExpression(func) :
                func,
            PredefinedName.BIND),
        createArgumentList(thisTree));
  }

  /**
   * @return {BreakStatement}
   */
  function createBreakStatement(opt_name) {
    return new BreakStatement(null, opt_name || null);
  }

  // function.call(this, arguments)
  /**
   * @param {ParseTree} func
   * @param {ParseTree} thisExpression
   * @param {ParseTree|Array.<ParseTree>} args
   * @param {...ParseTree} var_args
   * @return {CallExpression}
   */
  function createCallCall(func, thisExpression, args, var_args) {
    if (args instanceof ParseTree)
      args = slice(arguments, 2);

    var builder = [];

    builder.push(thisExpression);
    builder.push.apply(builder, args);

    return createCallExpression(
        createMemberExpression(func, PredefinedName.CALL),
        createArgumentList(builder));
  }

  /**
   * @param {ParseTree} func
   * @param {ParseTree} thisExpression
   * @param {...ParseTree} var_args
   * @return {ParseTree}
   */
  function createCallCallStatement(func, thisExpression, var_args) {
    var args = slice(arguments, 2);
    return createExpressionStatement(
        createCallCall(func, thisExpression, args));
  }

  /**
   * @param {ParseTree} expression
   * @param {Array.<ParseTree>} statements
   * @return {CaseClause}
   */
  function createCaseClause(expression, statements) {
    return new CaseClause(null, expression, statements);
  }

  /**
   * @param {BindingIdentifier|IdentifierToken} identifier
   * @param {ParseTree} catchBody
   * @return {Catch}
   */
  function createCatch(identifier, catchBody) {
    identifier = createBindingIdentifier(identifier);
    return new Catch(null, identifier, catchBody);
  }

  function createCascadeExpression(operand, expressions) {
    return new CascadeExpression(null, operand, expressions)
  }

  /**
   * @param {IdentifierToken} name
   * @param {ParseTree} superClass
   * @param {Array.<ParseTree>} elements
   * @return {ClassDeclaration}
   */
  function createClassDeclaration(name, superClass, elements) {
    return new ClassDeclaration(null, name, superClass, elements);
  }

  /**
   * @param {Array.<ParseTree>} expressions
   * @return {CommaExpression}
   */
  function createCommaExpression(expressions) {
    return new CommaExpression(null, expressions);
  }

  /**
   * @param {ParseTree} condition
   * @param {ParseTree} left
   * @param {ParseTree} right
   * @return {ConditionalExpression}
   */
  function createConditionalExpression(condition, left, right) {
    return new ConditionalExpression(null, condition, left, right);
  }

  /**
   * @return {ContinueStatement}
   */
  function createContinueStatement(opt_name) {
    return new ContinueStatement(null, opt_name || null);
  }

  /**
   * @param {Array.<ParseTree>} statements
   * @return {DefaultClause}
   */
  function createDefaultClause(statements) {
    return new DefaultClause(null, statements);
  }

  /**
   * @param {ParseTree} body
   * @param {ParseTree} condition
   * @return {DoWhileStatement}
   */
  function createDoWhileStatement(body, condition) {
    return new DoWhileStatement(null, body, condition);
  }

  /**
   * @param {ParseTree} lhs
   * @param {ParseTree} rhs
   * @return {ExpressionStatement}
   */
  function createAssignmentStatement(lhs, rhs) {
    return createExpressionStatement(createAssignmentExpression(lhs, rhs));
  }

  /**
   * @param {ParseTree} operand
   * @param {ArgumentList=} opt_args
   * @return {ExpressionStatement}
   */
  function createCallStatement(operand, opt_args) {
    if (opt_args) {
      return createExpressionStatement(
          createCallExpression(operand, opt_args));
    }
    return createExpressionStatement(createCallExpression(operand));
  }

  /**
   * @param {ParseTree} expression
   * @return {ExpressionStatement}
   */
  function createExpressionStatement(expression) {
    return new ExpressionStatement(null, expression);
  }

  /**
   * @param {ParseTree} block
   * @return {Finally}
   */
  function createFinally(block) {
    return new Finally(null, block);
  }

  /**
   * @param {VariableDeclarationList} initializer
   * @param {ParseTree} collection
   * @param {ParseTree} body
   * @return {ForOfStatement}
   */
  function createForOfStatement(initializer, collection, body) {
    return new ForOfStatement(null, initializer, collection, body);
  }

  /**
   * @param {ParseTree} initializer
   * @param {ParseTree} collection
   * @param {ParseTree} body
   * @return {ForInStatement}
   */
  function createForInStatement(initializer, collection, body) {
    return new ForInStatement(null, initializer, collection, body);
  }

  /**
   * @param {ParseTree} variables
   * @param {ParseTree} condition
   * @param {ParseTree} increment
   * @param {ParseTree} body
   * @return {ForStatement}
   */
  function createForStatement(variables, condition, increment, body) {
    return new ForStatement(null, variables, condition, increment, body);
  }

  /**
   * @param {Array.<string>|FormalParameterList} formalParameterList
   * @param {Block} functionBody
   * @return {FunctionDeclaration}
   */
  function createFunctionExpressionFormals(formalParameters, functionBody) {
    if (formalParameters instanceof Array)
      formalParameters = createParameterList(formalParameters);
    return new FunctionDeclaration(null, null, false, formalParameters,
        functionBody);
  }

  /**
   * @param {string|IdentifierToken|BindingIdentifier} name
   * @param {FormalParameterList} formalParameterList
   * @param {Block} functionBody
   * @return {FunctionDeclaration}
   */
  function createFunctionDeclaration(name, formalParameterList, functionBody) {
    if (name !== null)
      name = createBindingIdentifier(name);
    return new FunctionDeclaration(null, name, false, formalParameterList,
        functionBody);
  }

  /**
   * @param {FormalParameterList} formalParameterList
   * @param {Block} functionBody
   * @return {FunctionDeclaration}
   */
  function createFunctionExpression(formalParameterList, functionBody) {
    return new FunctionDeclaration(null, null, false,
                                   formalParameterList, functionBody);
  }

  // get propertyName () { ... }
  /**
   * @param {string|Token} propertyName
   * @param {Block} body
   * @return {GetAccessor}
   */
  function createGetAccessor(propertyName, body) {
    if (typeof propertyName == 'string')
      propertyName = createPropertyNameToken(propertyName);
    return new GetAccessor(null, propertyName, body);
  }

  /**
   * @param {string|IdentifierToken} identifier
   * @return {IdentifierExpression}
   */
  function createIdentifierExpression(identifier) {
    if (typeof identifier == 'string')
      identifier = createIdentifierToken(identifier);
    else if (identifier instanceof BindingIdentifier)
      identifier = identifier.identifierToken;
    return new IdentifierExpression(null, identifier);
  }

  /**
   * @return {IdentifierExpression}
   */
  function createUndefinedExpression() {
    return createIdentifierExpression(PredefinedName.UNDEFINED);
  }

  /**
   * @param {ParseTree} condition
   * @param {ParseTree} ifClause
   * @param {ParseTree=} opt_elseClause
   * @return {IfStatement}
   */
  function createIfStatement(condition, ifClause, opt_elseClause) {
    return new IfStatement(null, condition, ifClause,
        opt_elseClause || null);
  }

  /**
   * @param {IdentifierToken} name
   * @param {ParseTree} statement
   * @return {LabelledStatement}
   */
  function createLabelledStatement(name, statement) {
    return new LabelledStatement(null, name, statement);
  }

  /**
   * @param {string} value
   * @return {ParseTree}
   */
  function createStringLiteral(value) {
    return new LiteralExpression(null, createStringLiteralToken(value));
  }

  /**
   * @param {boolean} value
   * @return {ParseTree}
   */
  function createBooleanLiteral(value) {
    return new LiteralExpression(null, createBooleanLiteralToken(value));
  }

  /**
   * @return {ParseTree}
   */
  function createTrueLiteral() {
    return createBooleanLiteral(true);
  }

  /**
   * @return {ParseTree}
   */
  function createFalseLiteral() {
    return createBooleanLiteral(false);
  }

  /**
   * @return {ParseTree}
   */
  function createNullLiteral() {
    return new LiteralExpression(null, createNullLiteralToken());
  }

  /**
   * @param {number} value
   * @return {ParseTree}
   */
  function createNumberLiteral(value) {
    return new LiteralExpression(null, createNumberLiteralToken(value));
  }

  /**
   * @param {string|IdentifierToken|ParseTree} operand
   * @param {string|IdentifierToken} memberName
   * @param {...string|IdentifierToken} memberNames
   * @return {MemberExpression}
   */
  function createMemberExpression(operand, memberName, memberNames) {
    if (typeof operand == 'string' || operand instanceof IdentifierToken)
      operand = createIdentifierExpression(operand);
    if (typeof memberName == 'string')
      memberName = createIdentifierToken(memberName);

    var tree = new MemberExpression(null, operand, memberName);
    for (var i = 2; i < arguments.length; i++) {
      tree = createMemberExpression(tree, arguments[i]);
    }
    return tree;
  }

  /**
   * @return {MemberLookupExpression}
   */
  function createMemberLookupExpression(operand,  memberExpression) {
    return new MemberLookupExpression(null, operand, memberExpression);
  }

  /**
   * @param {IdentifierToken|string=} opt_memberName
   * @return {ParseTree}
   */
  function createThisExpression(memberName) {
    if (memberName)
      return createMemberExpression(createThisExpression(), memberName);
    return new ThisExpression(null);
  }

  /**
   * @param {ParseTree} operand
   * @param {ArgumentList} args
   * @return {NewExpression}
   */
  function createNewExpression(operand, args) {
    return new NewExpression(null, operand, args);
  }

  /**
   * @param {ParseTree} value
   * @return {ParseTree}
   */
  function createObjectFreeze(value) {
    // Object.freeze(value)
    return createCallExpression(
        createMemberExpression(PredefinedName.OBJECT, PredefinedName.FREEZE),
        createArgumentList(value));
  }

  /**
   * Creates an object literal tree representing a property descriptor.
   * @param {Object} descr This is a normal js object. The values in the descr
   *     may be true, false or a ParseTree.
   * @return {ObjectLiteralExpression}
   */
  function createPropertyDescriptor(descr) {
    var propertyNameAndValues = Object.keys(descr).map(function(name) {
      var value = descr[name];
      if (!(value instanceof ParseTree))
        value = createBooleanLiteral(!!value);
      return createPropertyNameAssignment(name, value)
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
  function createDefineProperty(tree, name, descr) {
    if (typeof name === 'string')
      name = createStringLiteral(name);

    return createCallExpression(
      createMemberExpression(PredefinedName.OBJECT,
                             PredefinedName.DEFINE_PROPERTY),
      createArgumentList(tree,
          name,
          createPropertyDescriptor(descr)));
  }

  /**
   * @param {Array.<ParseTree>|ParseTree} propertyNameAndValues
   * @param {...ParseTree} var_args
   * @return {ObjectLiteralExpression}
   */
  function createObjectLiteralExpression(propertyNameAndValues) {
    if (propertyNameAndValues instanceof ParseTree)
      propertyNameAndValues = slice(arguments);
    return new ObjectLiteralExpression(null, propertyNameAndValues);
  }

  /**
   * @param {Array.<ParseTree>} list
   * @return {ObjectPattern}
   */
  function createObjectPattern(list) {
    return new ObjectPattern(null, list);
  }

  /**
   * @param {IdentifierToken} identifier
   * @param {ParseTree} element
   * @return {ObjectPatternField}
   */
  function createObjectPatternField(identifier, element) {
    identifier = createBindingIdentifier(identifier);
    return new ObjectPatternField(null, identifier, element);
  }

  /**
   * @param {ParseTree} expression
   * @return {ParenExpression}
   */
  function createParenExpression(expression) {
    return new ParenExpression(null, expression);
  }

  /**
   * @param {ParseTree} operand
   * @param {ParseTree} operator
   * @return {PostfixExpression}
   */
  function createPostfixExpression(operand, operator) {
    return new PostfixExpression(null, operand, operator);
  }

  /**
   * @param {Array.<ParseTree>} programElements
   * @return {Program}
   */
  function createProgram(programElements) {
    return new Program(null, programElements);
  }

  /**
   * @param {string|IdentifierToken} identifier
   * @param {ParseTree} value
   * @return {PropertyNameAssignment}
   */
  function createPropertyNameAssignment(identifier, value) {
    if (typeof identifier == 'string')
      identifier = createIdentifierToken(identifier);
    return new PropertyNameAssignment(null, identifier, value);
  }

  /**
   * @param {string|IdentifierToken|BindingIdentifier} identifier
   * @return {RestParameter}
   */
  function createRestParameter(identifier) {
    return new RestParameter(null, createBindingIdentifier(identifier));
  }

  /**
   * @param {ParseTree} expression
   * @return {ReturnStatement}
   */
  function createReturnStatement(expression) {
    return new ReturnStatement(null, expression);
  }

  /**
   * @param {ParseTree} expression
   * @param {boolean} isYieldFor
   * @return {YieldStatement}
   */
  function createYieldStatement(expression, isYieldFor) {
    return new YieldStatement(null, expression, isYieldFor);
  }

  /**
   * @param {string|Token} propertyName
   * @param {string|IdentifierToken} parameter
   * @param {Block} body
   * @return {SetAccessor}
   */
  function createSetAccessor(propertyName, parameter, body) {
    if (typeof propertyName == 'string')
      propertyName = createPropertyNameToken(propertyName);
    if (typeof parameter == 'string')
      parameter = createIdentifierToken(parameter);
    return new SetAccessor(null, propertyName, parameter, body);
  }

  /**
   * @param {ParseTree} expression
   * @return {SpreadExpression}
   */
  function createSpreadExpression(expression) {
    return new SpreadExpression(null, expression);
  }

  /**
   * @param {ParseTree} lvalue
   * @return {SpreadPatternElement}
   */
  function createSpreadPatternElement(lvalue) {
    return new SpreadPatternElement(null, lvalue);
  }

  /**
   * @param {ParseTree} expression
   * @param {Array.<ParseTree>} caseClauses
   * @return {SwitchStatement}
   */
  function createSwitchStatement(expression, caseClauses) {
    return new SwitchStatement(null, expression, caseClauses);
  }

  /**
   * @param {ParseTree} value
   * @return {ThrowStatement}
   */
  function createThrowStatement(value) {
    return new ThrowStatement(null, value);
  }

  /**
   * @param {ParseTree} body
   * @param {ParseTree} catchOrFinallyBlock
   * @param {ParseTree=} opt_finallyBlock
   * @return {TryStatement}
   */
  function createTryStatement(body, catchOrFinallyBlock, opt_finallyBlock) {
    // TODO(arv): Remove 2 params case and enforce a catchBlack (may be null).
    var catchBlock, finallyBlock;
    if (arguments.length > 2) {
      catchBlock = arguments[1];
      finallyBlock = arguments[2];
    } else {
      catchBlock = null;
      finallyBlock = arguments[1];
    }

    return new TryStatement(null, body, catchBlock, finallyBlock);
  }

  /**
   * @param {Token} operator
   * @param {ParseTree} operand
   * @return {UnaryExpression}
   */
  function createUnaryExpression(operator, operand) {
    return new UnaryExpression(null, operator, operand);
  }

  /**
   * @return {ParseTree}
   */
  function createUseStrictDirective() {
    return createExpressionStatement(createStringLiteral('use strict'));
  }

  /**
   * @param {TokenType} binding
   * @param {IdentifierToken|Array.<VariableDeclaration>} identifierOrDeclarations
   * @param {ParseTree=} initializer
   * @return {VariableDeclarationList}
   */
  function createVariableDeclarationList(binding, identifierOrDeclarations, initializer) {
    if (identifierOrDeclarations instanceof Array) {
      var declarations = identifierOrDeclarations;
      return new VariableDeclarationList(null, binding, declarations);
    }

    var identifier = identifierOrDeclarations;
    return createVariableDeclarationList(
        binding, [createVariableDeclaration(identifier, initializer)]);
  }

  /**
   * @param {string|IdentifierToken|ParseTree} identifier
   * @param {ParseTree} initializer
   * @return {VariableDeclaration}
   */
  function createVariableDeclaration(identifier, initializer) {
    if (!(identifier instanceof ParseTree) ||
        identifier.type !== ParseTreeType.BINDING_IDENTIFIER &&
        identifier.type !== ParseTreeType.OBJECT_PATTERN &&
        identifier.type !== ParseTreeType.ARRAY_PATTERN) {
      identifier = createBindingIdentifier(identifier);
    }

    return new VariableDeclaration(null, identifier, initializer);
  }

  /**
   * @param {VariableDeclarationList|TokenType} listOrBinding
   * @param {string|IdentifierToken=} identifier
   * @param {ParseTree=} initializer
   * @return {VariableStatement}
   */
  function createVariableStatement(listOrBinding, identifier, initializer) {
    if (listOrBinding instanceof VariableDeclarationList)
      return new VariableStatement(null, listOrBinding);
    var binding = listOrBinding;
    var list = createVariableDeclarationList(binding, identifier, initializer);
    return createVariableStatement(list);
  }

  /**
   * Creates a (void 0) expression.
   * @return {ParenExpression}
   */
  function createVoid0() {
    return createParenExpression(
      createUnaryExpression(
        createOperatorToken(TokenType.VOID),
        createNumberLiteral(0)));
  }

  /**
   * @param {ParseTree} condition
   * @param {ParseTree} body
   * @return {WhileStatement}
   */
  function createWhileStatement(condition, body) {
    return new WhileStatement(null, condition, body);
  }

  /**
   * @param {ParseTree} expression
   * @param {ParseTree} body
   * @return {WithStatement}
   */
  function createWithStatement(expression, body) {
    return new WithStatement(null, expression, body);
  }

  /**
   * @param {number} state
   * @return {ExpressionStatement}
   */
  function createAssignStateStatement(state) {
    return createAssignmentStatement(
        createIdentifierExpression(PredefinedName.STATE),
        createNumberLiteral(state));
  }

  return {
    ParseTreeFactory: {
      createArgumentList: createArgumentList,
      createArgumentListFromParameterList: createArgumentListFromParameterList,
      createArrayLiteralExpression: createArrayLiteralExpression,
      createArrayPattern: createArrayPattern,
      createAssignStateStatement: createAssignStateStatement,
      createAssignmentExpression: createAssignmentExpression,
      createAssignmentStatement: createAssignmentStatement,
      createBinaryOperator: createBinaryOperator,
      createBindingIdentifier: createBindingIdentifier,
      createBlock: createBlock,
      createBooleanLiteral: createBooleanLiteral,
      createBooleanLiteralToken: createBooleanLiteralToken,
      createBoundCall: createBoundCall,
      createBreakStatement: createBreakStatement,
      createCallCall: createCallCall,
      createCallCallStatement: createCallCallStatement,
      createCallExpression: createCallExpression,
      createCallStatement: createCallStatement,
      createCaseClause: createCaseClause,
      createBindingElement: createBindingElement,
      createCascadeExpression: createCascadeExpression,
      createCatch: createCatch,
      createClassDeclaration: createClassDeclaration,
      createCommaExpression: createCommaExpression,
      createConditionalExpression: createConditionalExpression,
      createContinueStatement: createContinueStatement,
      createDefaultClause: createDefaultClause,
      createDefineProperty: createDefineProperty,
      createDoWhileStatement: createDoWhileStatement,
      createEmptyArgumentList: createEmptyArgumentList,
      createEmptyArrayLiteralExpression: createEmptyArrayLiteralExpression,
      createEmptyBlock: createEmptyBlock,
      createEmptyList: createEmptyList,
      createEmptyParameterList: createEmptyParameterList,
      createEmptyParameters: createEmptyParameters,
      createEmptyStatement: createEmptyStatement,
      createExpressionStatement: createExpressionStatement,
      createFalseLiteral: createFalseLiteral,
      createFinally: createFinally,
      createForInStatement: createForInStatement,
      createForOfStatement: createForOfStatement,
      createForStatement: createForStatement,
      createFunctionDeclaration: createFunctionDeclaration,
      createFunctionExpression: createFunctionExpression,
      createFunctionExpressionFormals: createFunctionExpressionFormals,
      createGetAccessor: createGetAccessor,
      createIdentifierExpression: createIdentifierExpression,
      createIdentifierToken: createIdentifierToken,
      createIfStatement: createIfStatement,
      createLabelledStatement: createLabelledStatement,
      createMemberExpression: createMemberExpression,
      createMemberLookupExpression: createMemberLookupExpression,
      createNewExpression: createNewExpression,
      createNullLiteral: createNullLiteral,
      createNullLiteralToken: createNullLiteralToken,
      createNumberLiteral: createNumberLiteral,
      createNumberLiteralToken: createNumberLiteralToken,
      createObjectFreeze: createObjectFreeze,
      createObjectLiteralExpression: createObjectLiteralExpression,
      createObjectPattern: createObjectPattern,
      createObjectPatternField: createObjectPatternField,
      createOperatorToken: createOperatorToken,
      createParameterList: createParameterList,
      createParameterListWithRestParams: createParameterListWithRestParams,
      createParameterReference: createParameterReference,
      createParenExpression: createParenExpression,
      createPostfixExpression: createPostfixExpression,
      createProgram: createProgram,
      createPropertyDescriptor: createPropertyDescriptor,
      createPropertyNameAssignment: createPropertyNameAssignment,
      createPropertyNameToken: createPropertyNameToken,
      createRestParameter: createRestParameter,
      createReturnStatement: createReturnStatement,
      createScopedBlock: createScopedBlock,
      createScopedExpression: createScopedExpression,
      createScopedStatements: createScopedStatements,
      createSetAccessor: createSetAccessor,
      createSpreadExpression: createSpreadExpression,
      createSpreadPatternElement: createSpreadPatternElement,
      createStatementList: createStatementList,
      createStringLiteral: createStringLiteral,
      createStringLiteralToken: createStringLiteralToken,
      createSwitchStatement: createSwitchStatement,
      createThisExpression: createThisExpression,
      createThrowStatement: createThrowStatement,
      createTrueLiteral: createTrueLiteral,
      createTryStatement: createTryStatement,
      createUnaryExpression: createUnaryExpression,
      createUndefinedExpression: createUndefinedExpression,
      createUseStrictDirective: createUseStrictDirective,
      createVariableDeclaration: createVariableDeclaration,
      createVariableDeclarationList: createVariableDeclarationList,
      createVariableStatement: createVariableStatement,
      createVoid0: createVoid0,
      createWhileStatement: createWhileStatement,
      createWithStatement: createWithStatement,
      createYieldStatement: createYieldStatement
    }
  };
});
