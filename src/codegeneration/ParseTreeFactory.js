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

  var ArgumentListTree = traceur.syntax.trees.ArgumentListTree;
  var ArrayLiteralExpressionTree = traceur.syntax.trees.ArrayLiteralExpressionTree;
  var ArrayPatternTree = traceur.syntax.trees.ArrayPatternTree;
  var BinaryOperatorTree = traceur.syntax.trees.BinaryOperatorTree;
  var BlockTree = traceur.syntax.trees.BlockTree;
  var CallExpressionTree = traceur.syntax.trees.CallExpressionTree;
  var CaseClauseTree = traceur.syntax.trees.CaseClauseTree;
  var CatchTree = traceur.syntax.trees.CatchTree;
  var ClassDeclarationTree = traceur.syntax.trees.ClassDeclarationTree;
  var CommaExpressionTree = traceur.syntax.trees.CommaExpressionTree;
  var ConditionalExpressionTree = traceur.syntax.trees.ConditionalExpressionTree;
  var ContinueStatementTree = traceur.syntax.trees.ContinueStatementTree;
  var DefaultClauseTree = traceur.syntax.trees.DefaultClauseTree;
  var DefaultParameterTree = traceur.syntax.trees.DefaultParameterTree;
  var DoWhileStatementTree = traceur.syntax.trees.DoWhileStatementTree;
  var ExpressionStatementTree = traceur.syntax.trees.ExpressionStatementTree;
  var FieldDeclarationTree = traceur.syntax.trees.FieldDeclarationTree;
  var FinallyTree = traceur.syntax.trees.FinallyTree;
  var ForEachStatementTree = traceur.syntax.trees.ForEachStatementTree;
  var ForInStatementTree = traceur.syntax.trees.ForInStatementTree;
  var ForStatementTree = traceur.syntax.trees.ForStatementTree;
  var FormalParameterListTree = traceur.syntax.trees.FormalParameterListTree;
  var FunctionDeclarationTree = traceur.syntax.trees.FunctionDeclarationTree;
  var GetAccessorTree = traceur.syntax.trees.GetAccessorTree;
  var IdentifierExpressionTree = traceur.syntax.trees.IdentifierExpressionTree;
  var IfStatementTree = traceur.syntax.trees.IfStatementTree;
  var LabelledStatementTree = traceur.syntax.trees.LabelledStatementTree;
  var LiteralExpressionTree = traceur.syntax.trees.LiteralExpressionTree;
  var MemberExpressionTree = traceur.syntax.trees.MemberExpressionTree;
  var MemberLookupExpressionTree = traceur.syntax.trees.MemberLookupExpressionTree;
  var MixinTree = traceur.syntax.trees.MixinTree;
  var MixinResolveListTree = traceur.syntax.trees.MixinResolveListTree;
  var NewExpressionTree = traceur.syntax.trees.NewExpressionTree;
  var ObjectLiteralExpressionTree = traceur.syntax.trees.ObjectLiteralExpressionTree;
  var ObjectPatternTree = traceur.syntax.trees.ObjectPatternTree;
  var ObjectPatternFieldTree = traceur.syntax.trees.ObjectPatternFieldTree;
  var ParenExpressionTree = traceur.syntax.trees.ParenExpressionTree;
  var PostfixExpressionTree = traceur.syntax.trees.PostfixExpressionTree;
  var ProgramTree = traceur.syntax.trees.ProgramTree;
  var PropertyNameAssignmentTree = traceur.syntax.trees.PropertyNameAssignmentTree;
  var RestParameterTree = traceur.syntax.trees.RestParameterTree;
  var ReturnStatementTree = traceur.syntax.trees.ReturnStatementTree;
  var YieldStatementTree = traceur.syntax.trees.YieldStatementTree;
  var SetAccessorTree = traceur.syntax.trees.SetAccessorTree;
  var SpreadExpressionTree = traceur.syntax.trees.SpreadExpressionTree;
  var SpreadPatternElementTree = traceur.syntax.trees.SpreadPatternElementTree;
  var SwitchStatementTree = traceur.syntax.trees.SwitchStatementTree;
  var ThisExpressionTree = traceur.syntax.trees.ThisExpressionTree;
  var ThrowStatementTree = traceur.syntax.trees.ThrowStatementTree;
  var TraitDeclarationTree = traceur.syntax.trees.TraitDeclarationTree;
  var TryStatementTree = traceur.syntax.trees.TryStatementTree;
  var UnaryExpressionTree = traceur.syntax.trees.UnaryExpressionTree;
  var VariableDeclarationListTree = traceur.syntax.trees.VariableDeclarationListTree;
  var VariableDeclarationTree = traceur.syntax.trees.VariableDeclarationTree;
  var VariableStatementTree = traceur.syntax.trees.VariableStatementTree;
  var WhileStatementTree = traceur.syntax.trees.WhileStatementTree;
  var WithStatementTree = traceur.syntax.trees.WithStatementTree;

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
    // TODO: escape string literal token
    return new LiteralToken(TokenType.STRING, '"' + value + '"', null);
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
   * @param {IdentifierToken|FormalParameterListTree}
   * @return {Array.<string>}
   */
  function createParameters(parameter) {
    if (parameter instanceof IdentifierToken)
      return [parameter.value];

    var builder = [];

    parameters.parameters.forEach(function(parameter) {
      if (!parameter.isRestParameter()) {
        // TODO: array and object patterns
        builder.push(parameter.asIdentifierExpression().identifierToken.value);
      }
    });

    return builder;
  }

  /**
   * @param {Array.<ParseTree>|ParseTree} statementsOrHead
   * @param {...ParseTree} var_args
   * @return {Array.<ParseTree>}
   */
  function createStatementList(statementsOrHead, var_args) {
    if (statementsOrHead instanceof Array)
      return statementsOrHead;
    return slice(arguments);
  }

  /**
   * TODO(arv): Make this less overloaded.
   *
   * @param {string|number|IdentifierToken|Array.<string>} arg0
   * @param {...string} var_args
   * @return {FormalParameterListTree}
   */
  function createParameterList(arg0, var_args) {
    if (typeof arg0 == 'string') {
      // var_args of strings
      var parameterList = map(arguments, createIdentifierExpression);
      return new FormalParameterListTree(null, parameterList);
    }

    if (typeof arg0 == 'number')
      return createParameterListHelper(arg0, false);

    if (arg0 instanceof IdentifierToken) {
      return new FormalParameterListTree(
          null, [createIdentifierExpression(arg0)]);
    }

    // Array.<string>
    var builder = arg0.map(createIdentifierExpression);
    return new FormalParameterListTree(null, builder);
  }

  /**
   * Helper for building parameter lists with and without rest params.
   * @param {number} numberOfParameters
   * @param {boolean} hasRestParams
   * @return {FormalParameterListTree}
   */
  function createParameterListHelper(numberOfParameters, hasRestParams) {
    var builder = [];

    for (var index = 0; index < numberOfParameters; index++) {
      var parameterName = PredefinedName.getParameterName(index);
      var isRestParameter = index == numberOfParameters - 1 && hasRestParams;
      builder.push(
          isRestParameter ?
              createRestParameter(parameterName) :
              createIdentifierExpression(parameterName));
    }

    return new FormalParameterListTree(null, builder);
  }

  /**
   * @param {number} numberOfParameters
   * @return {FormalParameterListTree}
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
   * @return {IdentifierExpressionTree}
   */
  function createParameterReference(index) {
    return createIdentifierExpression(PredefinedName.getParameterName(index));
  }

  /**
   * @return {FormalParameterListTree}
   */
  function createEmptyParameterList() {
    return new FormalParameterListTree(null, []);
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
   * @return {ArgumentListTree}
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

    return new ArgumentListTree(null, list);
  }

  /**
   * @param {FormalParameterListTree} formalParameterList
   * @return {ArgumentListTree}
   */
  function createArgumentListFromParameterList(formalParameterList) {
    var builder = formalParameterList.parameters.map(function(parameter) {
      if (parameter.isRestParameter()) {
        return createSpreadExpression(
            createIdentifierExpression(
                parameter.asRestParameter().identifier));
      } else {
        // TODO: implement pattern -> array, object literal translation
        return parameter;
      }
    });

    return new ArgumentListTree(null, builder);
  }

  /**
   * @return {ArgumentListTree}
   */
  function createEmptyArgumentList() {
    return new ArgumentListTree(null, createEmptyList());
  }

  /**
   * @param {Array.<ParseTree> list
   * @return {ArrayLiteralExpressionTree}
   */
  function createArrayLiteralExpression(list) {
    return new ArrayLiteralExpressionTree(null, list);
  }

  /**
   * @return {ArrayLiteralExpressionTree}
   */
  function createEmptyArrayLiteralExpression() {
    return createArrayLiteralExpression(createEmptyList());
  }

  /**
   * @param {Array.<ParseTree> list
   * @return {ArrayPatternTree}
   */
  function createArrayPattern(list) {
    return new ArrayPatternTree(null, list);
  }

  /**
   * @param {ParseTree} lhs
   * @param {ParseTree} rhs
   * @return {BinaryOperatorTree}
   */
  function createAssignmentExpression(lhs, rhs) {
    return new BinaryOperatorTree(null, lhs,
                                  createOperatorToken(TokenType.EQUAL), rhs);
  }

  /**
   * @return {BinaryOperatorTree}
   */
  function createBinaryOperator(left, operator, right) {
    return new BinaryOperatorTree(null, left, operator, right);
  }

  /**
   * @return {EmptyStatementTree}
   */
  function createEmptyStatement() {
    return new EmptyStatementTree(null);
  }

  /**
   * @return {BlockTree}
   */
  function createEmptyBlock() {
    return createBlock(createEmptyList());
  }

  /**
   * @param {Array.<ParseTree>|ParseTree} statements
   * @param {...ParseTree} var_args
   * @return {BlockTree}
   */
  function createBlock(statements) {
    if (statements instanceof ParseTree)
      statements = slice(arguments);
    return new BlockTree(null, statements);
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
   * @param {BlockTree} block
   * @return {ParseTree}
   */
  function createScopedBlock(block) {
    return createExpressionStatement(createScopedExpression(block));
  }

  /**
   * @param {BlockTree} block
   * @return {CallExpressionTree}
   */
  function createScopedExpression(block) {
    return createCallCall(
        createParenExpression(
            createFunctionExpression(createEmptyParameterList(), block)),
            createThisExpression());
  }

  /**
   * @param {ParseTree} operand
   * @parm {ArgumentListTree=} opt_args
   * @return {CallExpressionTree}
   */
  function createCallExpression(operand, opt_args) {
    var args = opt_args || createEmptyArgumentList();
    return new CallExpressionTree(null, operand, args);
  }

  /**
   * @param {ParseTree} func
   * @param {ParseTree} thisTree
   * @return {CallExpressionTree}
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
   * @param {string} aggregateName
   * @param {string} propertyName
   * @return {CallExpressionTree}
   */
  function createLookupGetter(aggregateName, propertyName) {
    // TODO(arv): Use ES5 method instead of relying on propriatary extensions.
    return createCallExpression(
        createMemberExpression(
            aggregateName,
            PredefinedName.PROTOTYPE,
            PredefinedName.LOOKUP_GETTER),
        createArgumentList(createStringLiteral(propertyName)));
  }

  /**
   * @return {BreakStatementTree}
   */
  function createBreakStatement() {
    return new BreakStatementTree(null, null);
  }

  // function.call(this, arguments)
  /**
   * @param {ParseTree} func
   * @param {ParseTree} thisExpression
   * @param {ParseTree|Array.<ParseTree>} args
   * @param {...ParseTree} var_args
   * @return {CallExpressionTree}
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
   * @param Array.<ParseTree>} statements
   * @return {CaseClauseTree}
   */
  function createCaseClause(expression, statements) {
    return new CaseClauseTree(null, expression, statements);
  }

  /**
   * @param {IdentifierToken} exceptionName
   * @param {ParseTree} catchBody
   * @return {CatchTree}
   */
  function createCatch(exceptionName, catchBody) {
    return new CatchTree(null, exceptionName, catchBody);
  }

  /**
   * @param {IdentifierToken} name
   * @param {ParseTree} superClass
   * @param {Array.<ParseTree> elements
   * @return {ClassDeclarationTree}
   */
  function createClassDeclaration(name, superClass, elements) {
    return new ClassDeclarationTree(null, name, superClass, elements);
  }

  /**
   * @param {Array.<ParseTree> expressions
   * @return {CommaExpressionTree}
   */
  function createCommaExpression(expressions) {
    return new CommaExpressionTree(null, expressions);
  }

  /**
   * @param {ParseTree} condition
   * @param {ParseTree} left
   * @param {ParseTree} right
   * @return {ConditionalExpressionTree}
   */
  function createConditionalExpression(condition, left, right) {
    return new ConditionalExpressionTree(null, condition, left, right);
  }

  /**
   * @return {ContinueStatementTree}
   */
  function createContinueStatement() {
    return new ContinueStatementTree(null, null);
  }

  /**
   * @param Array.<ParseTree>} statements
   * @return {DefaultClauseTree}
   */
  function createDefaultClause(statements) {
    return new DefaultClauseTree(null, statements);
  }

  /**
   * @param {IdentifierExpressionTree} identifier
   * @param {ParseTree} expression
   * @return {DefaultParameterTree}
   */
  function createDefaultParameter(identifier, expression) {
    return new DefaultParameterTree(null, identifier, expression);
  }

  /**
   * @param {ParseTree} body
   * @param {ParseTree} condition
   * @return {DoWhileStatementTree}
   */
  function createDoWhileStatement(body, condition) {
    return new DoWhileStatementTree(null, body, condition);
  }

  /**
   * @param {ParseTree} lhs
   * @param {ParseTree} rhs
   * @return {ExpressionStatementTree}
   */
  function createAssignmentStatement(lhs, rhs) {
    return createExpressionStatement(createAssignmentExpression(lhs, rhs));
  }

  /**
   * @param {ParseTree} operand
   * @param {ArgumentListTree=} opt_args
   * @return {ExpressionStatementTree}
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
   * @return {ExpressionStatementTree}
   */
  function createExpressionStatement(expression) {
    return new ExpressionStatementTree(null, expression);
  }

  /**
   * @param {boolean} isStatic
   * @param {boolean} isConst
   * @param {Array.<VariableDeclarationTree} expression
   * @return {FieldDeclarationTree}
   */
  function createFieldDeclaration(isStatic, isConst, declarations) {
    return new FieldDeclarationTree(null, isStatic, isConst, declarations);
  }

  /**
   * @param {ParseTree} block
   * @return {FinallyTree}
   */
  function createFinally(block) {
    return new FinallyTree(null, block);
  }

  /**
   * @param {VariableDeclarationListTree} initializer
   * @param {ParseTree} collection
   * @param {ParseTree} body
   * @return {ForEachStatementTree}
   */
  function createForEachStatement(initializer, collection, body) {
    return new ForEachStatementTree(null, initializer, collection, body);
  }

  /**
   * @param {ParseTree} initializer
   * @param {ParseTree} collection
   * @param {ParseTree} body
   * @return {ForInStatementTree}
   */
  function createForInStatement(initializer, collection, body) {
    return new ForInStatementTree(null, initializer, collection, body);
  }

  /**
   * @param {ParseTree} variables
   * @param {ParseTree} condition
   * @param {ParseTree} increment
   * @param {ParseTree} body
   * @return {ForStatementTree}
   */
  function createForStatement(variables, condition, increment, body) {
    return new ForStatementTree(null, variables, condition, increment, body);
  }

  /**
   * @param {Array.<string>|FormalParameterListTree} formalParameterList
   * @param {BlockTree} functionBody
   * @return {FunctionDeclarationTree}
   */
  function createFunctionExpressionFormals(formalParameters, functionBody) {
    if (formalParameters instanceof Array)
      formalParameters = createParameterList(formalParameters);
    return new FunctionDeclarationTree(null, null, false, formalParameterList,
                                       functionBody);
  }

  /**
   * @param {string|IdentifierToken} name
   * @param {FormalParameterListTree} formalParameterList
   * @param {BlockTree} functionBody
   * @return FunctionDeclarationTree}
   */
  function createFunctionDeclaration(name, formalParameterList, functionBody) {
    if (typeof name == 'string')
      name = createIdentifierToken(name);
    return new FunctionDeclarationTree(null, name, false, formalParameterList,
                                       functionBody);
  }

  /**
   * @param {FormalParameterListTree} formalParameterList
   * @param {BlockTree} functionBody
   * @return {FunctionDeclarationTree}
   */
  function createFunctionExpression(formalParameterList, functionBody) {
    return new FunctionDeclarationTree(null, null, false, formalParameterList,
                                       functionBody);
  }

  // [static] get propertyName () { ... }
  /**
   * @param {string|Token} propertyName
   * @param {boolean} isStatic
   * @param {BlockTree} body
   * @return {GetAccessorTree}
   */
  function createGetAccessor(propertyName, isStatic, body) {
    if (typeof propertyName == 'string')
      propertyName = createPropertyNameToken(propertyName);
    return new GetAccessorTree(null, propertyName, isStatic, body);
  }

  /**
   * @param {string|IdentifierToken} identifier
   * @return {IdentifierExpressionTree}
   */
  function createIdentifierExpression(identifier) {
    if (typeof identifier == 'string')
      identifier = createIdentifierToken(identifier);
    return new IdentifierExpressionTree(null, identifier);
  }

  /**
   * @return {IdentifierExpressionTree}
   */
  function createUndefinedExpression() {
    return createIdentifierExpression(PredefinedName.UNDEFINED);
  }

  /**
   * @param {ParseTree} condition
   * @param {ParseTree} ifClause
   * @param {ParseTree=} opt_elseClause
   * @return {IfStatementTree}
   */
  function createIfStatement(condition, ifClause, opt_elseClause) {
    return new IfStatementTree(null, condition, ifClause,
                               opt_elseClause || null);
  }

  /**
   * @param {IdentifierToken} name
   * @param {ParseTree} statement
   * @return {LabelledStatementTree}
   */
  function createLabelledStatement(name, statement) {
    return new LabelledStatementTree(null, name, statement);
  }

  /**
   * @param {string} value
   * @return {ParseTree}
   */
  function createStringLiteral(value) {
    return new LiteralExpressionTree(null, createStringLiteralToken(value));
  }

  /**
   * @param {boolean} value
   * @return {ParseTree}
   */
  function createBooleanLiteral(value) {
    return new LiteralExpressionTree(null, createBooleanLiteralToken(value));
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
    return new LiteralExpressionTree(null, createNullLiteralToken());
  }

  /**
   * @param {number} value
   * @return {ParseTree}
   */
  function createNumberLiteral(value) {
    return new LiteralExpressionTree(null, createNumberLiteralToken(value));
  }

  /**
   * @param {string|ParseTree} operand
   * @param {string|IdentifierToken} memberName
   * @param {...string} memberNames
   * @return {MemberExpressionTree}
   */
  function createMemberExpression(operand, memberName, memberNames) {
    if (typeof operand == 'string')
      operand = createIdentifierExpression(operand);
    if (typeof memberName == 'string')
      memberName = createIdentifierToken(memberName);

    var tree = new MemberExpressionTree(null, operand, memberName);
    for (var i = 2; i < arguments.length; i++) {
      tree = createMemberExpression(tree, arguments[i]);
    }
    return tree;
  }

  /**
   * @return {MemberLookupExpressionTree}
   */
  function createMemberLookupExpression(operand,  memberExpression) {
    return new MemberLookupExpressionTree(null, operand, memberExpression);
  }

  /**
   * @param {IdentifierToken|string=} opt_memberName
   * @return {ParseTree}
   */
  function createThisExpression(memberName) {
    if (opt_memberName)
      return createMemberExpression(createThisExpression(), memberName);
    return new ThisExpressionTree(null);
  }

  /**
   * @param {IdentifierToken} name
   * @param {MixinResolveListTree mixinResolves
   * @return {MixinTree}
   */
  function createMixin(name, mixinResolves) {
    return new MixinTree(null, name, mixinResolves);
  }

  /**
   * @param {Array.<ParseTree>} resolves
   * @return {MixinResolveListTree}
   */
  function createMixinResolveList(resolves) {
    return new MixinResolveListTree(null, resolves);
  }

  /**
   * @param {ParseTree} operand
   * @param {ArgumentListTree} args
   * @return {NewExpressionTree}
   */
  function createNewExpression(operand, args) {
    return new NewExpressionTree(null, operand, args);
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
   * @param {Array.<ParseTree>|ParseTree} propertyNameAndValues
   * @param {...ParseTree} var_args
   * @return {ObjectLiteralExpressionTree}
   */
  function createObjectLiteralExpression(propertyNameAndValues) {
    if (propertyNameAndValues instanceof ParseTree)
      propertyNameAndValues = slice(arguments);
    return new ObjectLiteralExpressionTree(null, propertyNameAndValues);
  }

  /**
   * @param {Array.<ParseTree>} list
   * @return {ObjectPatternTree}
   */
  function createObjectPattern(list) {
    return new ObjectPatternTree(null, list);
  }

  /**
   * @param {IdentifierToken} identifier
   * @param {ParseTree} element
   * @return {ObjectPatternFieldTree}
   */
  function createObjectPatternField(identifier, element) {
    return new ObjectPatternFieldTree(null, identifier, element);
  }

  /**
   * @param {ParseTree} expression
   * @return {ParenExpressionTree}
   */
  function createParenExpression(expression) {
    return new ParenExpressionTree(null, expression);
  }

  /**
   * @param {ParseTree} operand
   * @param {ParseTree} operator
   * @return {PostfixExpressionTree}
   */
  function createPostfixExpression(operand, operator) {
    return new PostfixExpressionTree(null, operand, operator);
  }

  /**
   * @param {Array.<ParseTree>} sourceElements
   * @return {ProgramTree}
   */
  function createProgramTree(ourceElements) {
    return new ProgramTree(null, sourceElements);
  }

  /**
   * @param {string|IdentifierToken} identifier
   * @param {ParseTree} value
   * @return {PropertyNameAssignmentTree}
   */
  function createPropertyNameAssignment(identifier, value) {
    if (typeof identifier == 'string')
      identifier = createIdentifierToken(identifier);
    return new PropertyNameAssignmentTree(null, identifier, value);
  }

  /**
   * @param {string|IdentifierToken} identifier
   * @return {RestParameterTree}
   */
  function createRestParameter(identifier) {
    if (typeof identifier == 'string')
      identifier = createIdentifierToken(identifier);
    return new RestParameterTree(null, identifier);
  }

  /**
   * @param {ParseTree} expression
   * @return {ReturnStatementTree}
   */
  function createReturnStatement(expression) {
    return new ReturnStatementTree(null, expression);
  }

  /**
   * @param {ParseTree} expression
   * @return {YieldStatementTree}
   */
  function createYieldStatement(expression) {
    return new YieldStatementTree(null, expression);
  }

  /**
   * @param {string|Token} propertyName
   * @param {boolean} isStatic
   * @param {string|IdentifierToken} parameter
   * @param {BlockTree} body
   * @return {SetAccessorTree}
   */
  function createSetAccessor(propertyName, isStatic, parameter, body) {
    if (typeof propertyName == 'string')
      propertyName = createPropertyNameToken(propertyName);
    if (typeof parameter == 'string')
      parameter = createIdentifierToken(parameter);
    return new SetAccessorTree(null, propertyName, isStatic, parameter, body);
  }

  /**
   * @param {ParseTree} expression
   * @return {SpreadExpressionTree}
   */
  function createSpreadExpression(expression) {
    return new SpreadExpressionTree(null, expression);
  }

  /**
   * @param {ParseTree} lvalue
   * @return {SpreadPatternElementTree}
   */
  function createSpreadPatternElement(lvalue) {
    return new SpreadPatternElementTree(null, lvalue);
  }

  /**
   * @param {ParseTree} expression
   * @param {Array.<ParseTree>} caseClauses
   * @return {SwitchStatementTree}
   */
  function createSwitchStatement(expression, caseClauses) {
    return new SwitchStatementTree(null, expression, caseClauses);
  }

  /**
   * @param {ParseTree} value
   * @return {ThrowStatementTree}
   */
  function createThrowStatement(value) {
    return new ThrowStatementTree(null, value);
  }

  /**
   * @pararm {IdentifierToken} name
   * @param {Array.<ParseTree>} elements
   * @return {TraitDeclarationTree}
   */
  function createTraitDeclaration(name, elements) {
    return new TraitDeclarationTree(null, name, elements);
  }

  /**
   * @param {ParseTree} body
   * @param {ParseTree} catchOrFinallyBlock
   * @param {ParseTree=} opt_finallyBlock
   * @return {TryStatementTree}
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

    return new TryStatementTree(null, body, catchBlock, finallyBlock);
  }

  /**
   * @param {Token} operator
   * @param {ParseTree} operand
   * @return {UnaryExpressionTree}
   */
  function createUnaryExpression(operator, operand) {
    return new UnaryExpressionTree(null, operator, operand);
  }

  /**
   * @param {TokenType} binding
   * @param {IdentifierToken|Array.<VariableDeclarationTree>} identifierOrDeclarations
   * @param {ParseTree=} initializer
   * @return {VariableDeclarationListTree}
   */
  function createVariableDeclarationList(binding, identifierOrDeclarations, initializer) {
    if (identifierOrDeclarations instanceof Array) {
      var declarations = identifierOrDeclarations;
      return new VariableDeclarationListTree(null, binding, declarations);
    }

    var identifier = identifierOrDeclarations;
    if (typeof identifier == 'string')
      identifier = createIdentifierToken(identifier);

    return createVariableDeclarationList(
          binding, [createVariableDeclaration(identifier, initializer)]);
  }

  /**
   * @param {string|IdentifierToken|ParseTree} identifier
   * @param {ParseTree} initializer
   * @return {VariableDeclarationTree}
   */
  function createVariableDeclaration(identifier, initializer) {
    if (typeof identifier == 'string' || identifier instanceof IdentifierToken)
      identifier = createIdentifierExpression(identifier);
    return new VariableDeclarationTree(null, identifier, initializer);
  }

  /**
   * @param {VariableDeclarationListTree|TokenType} listOrBinding
   * @param {string|IdentifierToken=} identifier
   * @param {ParseTree=} initializer
   * @return {VariableStatementTree}
   */
  function createVariableStatement(listOrBinding, identifier, initializer) {
    if (listOrBinding instanceof VariableDeclarationListTree)
      return new VariableStatementTree(null, listOrBinding);
    var binding = listOrBinding;
    if (typeof identifier == 'string')
      identifier = createIdentifierToken(identifier);
    var list = createVariableDeclarationList(binding, identifier, initializer);
    return createVariableStatement(list);
  }

  /**
   * @param {ParseTree} condition
   * @param {ParseTree} body
   * @return {WhileStatementTree}
   */
  function createWhileStatement(condition, body) {
    return new WhileStatementTree(null, condition, body);
  }

  /**
   * @param {ParseTree} expression
   * @param {ParseTree} body
   * @return {WithStatementTree}
   */
  function createWithStatement(expression, body) {
    return new WithStatementTree(null, expression, body);
  }

  /**
   * @param {number} state
   * @return {ExpressionStatementTree}
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
      createCatch: createCatch,
      createClassDeclaration: createClassDeclaration,
      createCommaExpression: createCommaExpression,
      createConditionalExpression: createConditionalExpression,
      createContinueStatement: createContinueStatement,
      createDefaultClause: createDefaultClause,
      createDefaultParameter: createDefaultParameter,
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
      createFieldDeclaration: createFieldDeclaration,
      createFinally: createFinally,
      createForEachStatement: createForEachStatement,
      createForInStatement: createForInStatement,
      createForStatement: createForStatement,
      createFunctionDeclaration: createFunctionDeclaration,
      createFunctionExpression: createFunctionExpression,
      createFunctionExpressionFormals: createFunctionExpressionFormals,
      createGetAccessor: createGetAccessor,
      createIdentifierExpression: createIdentifierExpression,
      createIdentifierToken: createIdentifierToken,
      createIfStatement: createIfStatement,
      createLabelledStatement: createLabelledStatement,
      createLookupGetter: createLookupGetter,
      createMemberExpression: createMemberExpression,
      createMemberLookupExpression: createMemberLookupExpression,
      createMixin: createMixin,
      createMixinResolveList: createMixinResolveList,
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
      createParameters: createParameters,
      createParenExpression: createParenExpression,
      createPostfixExpression: createPostfixExpression,
      createProgramTree: createProgramTree,
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
      createTraitDeclaration: createTraitDeclaration,
      createTrueLiteral: createTrueLiteral,
      createTryStatement: createTryStatement,
      createUnaryExpression: createUnaryExpression,
      createUndefinedExpression: createUndefinedExpression,
      createVariableDeclaration: createVariableDeclaration,
      createVariableDeclarationList: createVariableDeclarationList,
      createVariableStatement: createVariableStatement,
      createWhileStatement: createWhileStatement,
      createWithStatement: createWithStatement,
      createYieldStatement: createYieldStatement
    }
  };
});
