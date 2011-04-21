// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

traceur.define('syntax.trees', function() {
  'use strict';

  var assert = traceur.assert;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  //TODO: var NewExpression = traceur.syntax.trees.NewExpression;
  //TODO: var ParenExpression = traceur.syntax.trees.ParenExpression;

  /**
   * An abstract syntax tree for JavaScript parse trees.
   * Immutable.
   * A plain old data structure. Should include data members and simple
   * accessors only.
   *
   * Derived classes should have a 'Tree' suffix. Each concrete derived class
   * should have a ParseTreeType whose name matches the derived class name.
   *
   * A parse tree derived from source should have a non-null location. A parse
   * tree that is synthesized by the compiler may have a null location.
   *
   * When adding a new subclass of ParseTree you must also do the following:
   *   - add a new entry to ParseTreeType
   *   - add ParseTree.asXTree()
   *   - modify ParseTreeVisitor.visit(ParseTree) for new ParseTreeType
   *   - add ParseTreeVisitor.visit(XTree)
   *   - modify ParseTreeTransformer.transform(ParseTree) for new ParseTreeType
   *   - add ParseTreeTransformer.transform(XTree)
   *   - add ParseTreeWriter.visit(XTree)
   *   - add ParseTreeValidator.visit(XTree)
   *
   * @param {traceur.syntax.trees.ParseTreeType} type
   * @param {traceur.util.SourceRange} location
   * @constructor
   */
  function ParseTree(type, location) {
    this.type = type;
    this.location = location;
  }

  /**
   * This replacer is for use to when converting to a JSON string if you
   * don't want location. Call JSON.stringfy(tree, ParseTree.stripLocation)
   * @param {string} key
   * @param {*} value
   * @return {*}
   */
  ParseTree.stripLocation = function(key, value) {
    if (key === 'location') {
      return undefined;
    }
    return value;
  };

  ParseTree.prototype = {
    /** @return {traceur.syntax.trees.ArgumentList} */
    asArgumentList: function() {
      assert(this instanceof traceur.syntax.trees.ArgumentList);
      return this;
    },

    /** @return {traceur.syntax.trees.ArrayLiteralExpression} */
    asArrayLiteralExpression: function() {
      assert(this instanceof traceur.syntax.trees.ArrayLiteralExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.ArrayPattern} */
    asArrayPattern: function() {
      assert(this instanceof traceur.syntax.trees.ArrayPattern);
      return this;
    },

    /** @return {traceur.syntax.trees.AwaitStatement} */
    asAwaitStatement: function() {
      assert(this instanceof traceur.syntax.trees.AwaitStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.BinaryOperator} */
    asBinaryOperator: function() {
      assert(this instanceof traceur.syntax.trees.BinaryOperator);
      return this;
    },

    /** @return {traceur.syntax.trees.Block} */
    asBlock: function() {
      assert(this instanceof traceur.syntax.trees.Block);
      return this;
    },

    /** @return {traceur.syntax.trees.BreakStatement} */
    asBreakStatement: function() {
      assert(this instanceof traceur.syntax.trees.BreakStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.CallExpression} */
    asCallExpression: function() {
      assert(this instanceof traceur.syntax.trees.CallExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.CaseClause} */
    asCaseClause: function() {
      assert(this instanceof traceur.syntax.trees.CaseClause);
      return this;
    },

    /** @return {traceur.syntax.trees.Catch} */
    asCatch: function() {
      assert(this instanceof traceur.syntax.trees.Catch);
      return this;
    },

    /** @return {traceur.syntax.trees.ClassDeclaration} */
    asClassDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.ClassDeclaration);
      return this;
    },

    /** @return {traceur.syntax.trees.ClassExpression} */
    asClassExpression: function() {
      assert(this instanceof traceur.syntax.trees.ClassExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.CommaExpression} */
    asCommaExpression: function() {
      assert(this instanceof traceur.syntax.trees.CommaExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.ConditionalExpression} */
    asConditionalExpression: function() {
      assert(this instanceof traceur.syntax.trees.ConditionalExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.ContinueStatement} */
    asContinueStatement: function() {
      assert(this instanceof traceur.syntax.trees.ContinueStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.DebuggerStatement} */
    asDebuggerStatement: function() {
      assert(this instanceof traceur.syntax.trees.DebuggerStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.DefaultClause} */
    asDefaultClause: function() {
      assert(this instanceof traceur.syntax.trees.DefaultClause);
      return this;
    },

    /** @return {traceur.syntax.trees.DefaultParameter} */
    asDefaultParameter: function() {
      assert(this instanceof traceur.syntax.trees.DefaultParameter);
      return this;
    },

    /** @return {traceur.syntax.trees.DoWhileStatement} */
    asDoWhileStatement: function() {
      assert(this instanceof traceur.syntax.trees.DoWhileStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.EmptyStatement} */
    asEmptyStatement: function() {
      assert(this instanceof traceur.syntax.trees.EmptyStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.ExportDeclaration} */
    asExportDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.ExportDeclaration);
      return this;
    },

    /** @return {traceur.syntax.trees.ExpressionStatement} */
    asExpressionStatement: function() {
      assert(this instanceof traceur.syntax.trees.ExpressionStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.FieldDeclaration} */
    asFieldDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.FieldDeclaration);
      return this;
    },

    /** @return {traceur.syntax.trees.Finally} */
    asFinally: function() {
      assert(this instanceof traceur.syntax.trees.Finally);
      return this;
    },

    /** @return {traceur.syntax.trees.ForEachStatement} */
    asForEachStatement: function() {
      assert(this instanceof traceur.syntax.trees.ForEachStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.ForInStatement} */
    asForInStatement: function() {
      assert(this instanceof traceur.syntax.trees.ForInStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.FormalParameterList} */
    asFormalParameterList: function() {
      assert(this instanceof traceur.syntax.trees.FormalParameterList);
      return this;
    },

    /** @return {traceur.syntax.trees.ForStatement} */
    asForStatement: function() {
      assert(this instanceof traceur.syntax.trees.ForStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.FunctionDeclaration} */
    asFunctionDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.FunctionDeclaration);
      return this;
    },

    /** @return {traceur.codegeneration.generator.StateMachineTree} */
    asStateMachine: function() {
      assert(this instanceof traceur.codegeneration.generator.StateMachineTree);
      return this;
    },

    /** @return {traceur.syntax.trees.GetAccessor} */
    asGetAccessor: function() {
      assert(this instanceof traceur.syntax.trees.GetAccessor);
      return this;
    },

    /** @return {traceur.syntax.trees.IdentifierExpression} */
    asIdentifierExpression: function() {
      assert(this instanceof traceur.syntax.trees.IdentifierExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.IfStatement} */
    asIfStatement: function() {
      assert(this instanceof traceur.syntax.trees.IfStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.ImportDeclaration} */
    asImportDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.ImportDeclaration);
      return this;
    },

    /** @return {traceur.syntax.trees.ImportPathTree} */
    asImportPath: function() {
      assert(this instanceof traceur.syntax.trees.ImportPathTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ImportSpecifier} */
    asImportSpecifier: function() {
      assert(this instanceof traceur.syntax.trees.ImportSpecifier);
      return this;
    },

    /** @return {traceur.syntax.trees.LabelledStatement} */
    asLabelledStatement: function() {
      assert(this instanceof traceur.syntax.trees.LabelledStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.LiteralExpression} */
    asLiteralExpression: function() {
      assert(this instanceof traceur.syntax.trees.LiteralExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.MemberExpression} */
    asMemberExpression: function() {
      assert(this instanceof traceur.syntax.trees.MemberExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.MemberLookupExpression} */
    asMemberLookupExpression: function() {
      assert(this instanceof traceur.syntax.trees.MemberLookupExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.MissingPrimaryExpression} */
    asMissingPrimaryExpression: function() {
      assert(this instanceof traceur.syntax.trees.MissingPrimaryExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.Mixin} */
    asMixin: function() {
      assert(this instanceof traceur.syntax.trees.Mixin);
      return this;
    },

    /** @return {traceur.syntax.trees.MixinResolve} */
    asMixinResolve: function() {
      assert(this instanceof traceur.syntax.trees.MixinResolve);
      return this;
    },

    /** @return {traceur.syntax.trees.MixinResolveList} */
    asMixinResolveList: function() {
      assert(this instanceof traceur.syntax.trees.MixinResolveList);
      return this;
    },

    /** @return {traceur.syntax.trees.ModuleDeclaration} */
    asModuleDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.ModuleDeclaration);
      return this;
    },

    /** @return {traceur.syntax.trees.ModuleDefinition} */
    asModuleDefinition: function() {
      assert(this instanceof traceur.syntax.trees.ModuleDefinition);
      return this;
    },

    /** @return {traceur.syntax.trees.ModuleExpression} */
    asModuleExpression: function() {
      assert(this instanceof traceur.syntax.trees.ModuleExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.ModuleRequire} */
    asModuleRequire: function() {
      assert(this instanceof traceur.syntax.trees.ModuleRequire);
      return this;
    },

    /** @return {traceur.syntax.trees.ModuleSpecifier} */
    asModuleSpecifier: function() {
      assert(this instanceof traceur.syntax.trees.ModuleSpecifier);
      return this;
    },

    /** @return {traceur.syntax.trees.NewExpression} */
    asNewExpression: function() {
      assert(this instanceof traceur.syntax.trees.NewExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.NullTree} */
    asNull: function() {
      assert(this instanceof traceur.syntax.trees.NullTree);
      return this;
    },

    /** @return {traceur.syntax.trees.ObjectLiteralExpression} */
    asObjectLiteralExpression: function() {
      assert(this instanceof traceur.syntax.trees.ObjectLiteralExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.ObjectPattern} */
    asObjectPattern: function() {
      assert(this instanceof traceur.syntax.trees.ObjectPattern);
      return this;
    },

    /** @return {traceur.syntax.trees.ObjectPatternField} */
    asObjectPatternField: function() {
      assert(this instanceof traceur.syntax.trees.ObjectPatternField);
      return this;
    },

    /** @return {traceur.syntax.trees.ParenExpression} */
    asParenExpression: function() {
      assert(this instanceof traceur.syntax.trees.ParenExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.PostfixExpression} */
    asPostfixExpression: function() {
      assert(this instanceof traceur.syntax.trees.PostfixExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.Program} */
    asProgram: function() {
      assert(this instanceof traceur.syntax.trees.Program);
      return this;
    },

    /** @return {traceur.syntax.trees.PropertyNameAssignment} */
    asPropertyNameAssignment: function() {
      assert(this instanceof traceur.syntax.trees.PropertyNameAssignment);
      return this;
    },

    /** @return {traceur.syntax.trees.RequiresMember} */
    asRequiresMember: function() {
      assert(this instanceof traceur.syntax.trees.RequiresMember);
      return this;
    },

    /** @return {traceur.syntax.trees.RestParameter} */
    asRestParameter: function() {
      assert(this instanceof traceur.syntax.trees.RestParameter);
      return this;
    },

    /** @return {traceur.syntax.trees.ReturnStatement} */
    asReturnStatement: function() {
      assert(this instanceof traceur.syntax.trees.ReturnStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.SetAccessor} */
    asSetAccessor: function() {
      assert(this instanceof traceur.syntax.trees.SetAccessor);
      return this;
    },

    /** @return {traceur.syntax.trees.SpreadExpression} */
    asSpreadExpression: function() {
      assert(this instanceof traceur.syntax.trees.SpreadExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.SpreadPatternElement} */
    asSpreadPatternElement: function() {
      assert(this instanceof traceur.syntax.trees.SpreadPatternElement);
      return this;
    },

    /** @return {traceur.syntax.trees.SuperExpression} */
    asSuperExpression: function() {
      assert(this instanceof traceur.syntax.trees.SuperExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.SwitchStatement} */
    asSwitchStatement: function() {
      assert(this instanceof traceur.syntax.trees.SwitchStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.ThisExpression} */
    asThisExpression: function() {
      assert(this instanceof traceur.syntax.trees.ThisExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.ThrowStatement} */
    asThrowStatement: function() {
      assert(this instanceof traceur.syntax.trees.ThrowStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.TraitDeclaration} */
    asTraitDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.TraitDeclaration);
      return this;
    },

    /** @return {traceur.syntax.trees.TryStatement} */
    asTryStatement: function() {
      assert(this instanceof traceur.syntax.trees.TryStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.UnaryExpression} */
    asUnaryExpression: function() {
      assert(this instanceof traceur.syntax.trees.UnaryExpression);
      return this;
    },

    /** @return {traceur.syntax.trees.VariableDeclarationList} */
    asVariableDeclarationList: function() {
      assert(this instanceof traceur.syntax.trees.VariableDeclarationList);
      return this;
    },

    /** @return {traceur.syntax.trees.VariableDeclaration} */
    asVariableDeclaration: function() {
      assert(this instanceof traceur.syntax.trees.VariableDeclaration);
      return this;
    },

    /** @return {traceur.syntax.trees.VariableStatement} */
    asVariableStatement: function() {
      assert(this instanceof traceur.syntax.trees.VariableStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.WhileStatement} */
    asWhileStatement: function() {
      assert(this instanceof traceur.syntax.trees.WhileStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.WithStatement} */
    asWithStatement: function() {
      assert(this instanceof traceur.syntax.trees.WithStatement);
      return this;
    },

    /** @return {traceur.syntax.trees.YieldStatement} */
    asYieldStatement: function() {
      assert(this instanceof traceur.syntax.trees.YieldStatement);
      return this;
    },


    /** @return {boolean} */
    isNull: function() {
      return this.type === ParseTreeType.NULL;
    },

    /** @return {boolean} */
    isPattern: function() {
      switch (this.type) {
        case ParseTreeType.ARRAY_PATTERN:
        case ParseTreeType.OBJECT_PATTERN:
          return true;
        case ParseTreeType.PAREN_EXPRESSION:
          return this.asParenExpression().expression.isPattern();
        default:
          return false;
      }
    },

    /** @return {boolean} */
    isLeftHandSideExpression: function() {
      switch (this.type) {
        case ParseTreeType.THIS_EXPRESSION:
        case ParseTreeType.CLASS_EXPRESSION:
        case ParseTreeType.SUPER_EXPRESSION:
        case ParseTreeType.IDENTIFIER_EXPRESSION:
        case ParseTreeType.LITERAL_EXPRESSION:
        case ParseTreeType.ARRAY_LITERAL_EXPRESSION:
        case ParseTreeType.OBJECT_LITERAL_EXPRESSION:
        case ParseTreeType.NEW_EXPRESSION:
        case ParseTreeType.MEMBER_EXPRESSION:
        case ParseTreeType.MEMBER_LOOKUP_EXPRESSION:
        case ParseTreeType.CALL_EXPRESSION:
        case ParseTreeType.FUNCTION_DECLARATION:
          return true;
        case ParseTreeType.PAREN_EXPRESSION:
          return this.asParenExpression().expression.isLeftHandSideExpression();
        default:
          return false;
      }
    },

    // TODO: enable classes and traits
    /** @return {boolean} */
    isAssignmentExpression: function() {
      switch (this.type) {
        case ParseTreeType.FUNCTION_DECLARATION:
        case ParseTreeType.BINARY_OPERATOR:
        case ParseTreeType.THIS_EXPRESSION:
        case ParseTreeType.IDENTIFIER_EXPRESSION:
        case ParseTreeType.LITERAL_EXPRESSION:
        case ParseTreeType.ARRAY_LITERAL_EXPRESSION:
        case ParseTreeType.OBJECT_LITERAL_EXPRESSION:
        case ParseTreeType.MISSING_PRIMARY_EXPRESSION:
        case ParseTreeType.CONDITIONAL_EXPRESSION:
        case ParseTreeType.UNARY_EXPRESSION:
        case ParseTreeType.POSTFIX_EXPRESSION:
        case ParseTreeType.MEMBER_EXPRESSION:
        case ParseTreeType.NEW_EXPRESSION:
        case ParseTreeType.CALL_EXPRESSION:
        case ParseTreeType.MEMBER_LOOKUP_EXPRESSION:
        case ParseTreeType.PAREN_EXPRESSION:
        case ParseTreeType.SUPER_EXPRESSION:
          return true;
        default:
          return false;
      }
    },

    // ECMA 262 11.2:
    // MemberExpression :
    //    PrimaryExpression
    //    FunctionExpression
    //    MemberExpression [ Expression ]
    //    MemberExpression . IdentifierName
    //    new MemberExpression Arguments
    /** @return {boolean} */
    isMemberExpression: function() {
      switch (this.type) {
        // PrimaryExpression
        case ParseTreeType.THIS_EXPRESSION:
        case ParseTreeType.CLASS_EXPRESSION:
        case ParseTreeType.SUPER_EXPRESSION:
        case ParseTreeType.IDENTIFIER_EXPRESSION:
        case ParseTreeType.LITERAL_EXPRESSION:
        case ParseTreeType.ARRAY_LITERAL_EXPRESSION:
        case ParseTreeType.OBJECT_LITERAL_EXPRESSION:
        case ParseTreeType.PAREN_EXPRESSION:
        // FunctionExpression
        case ParseTreeType.FUNCTION_DECLARATION:
        // MemberExpression [ Expression ]
        case ParseTreeType.MEMBER_LOOKUP_EXPRESSION:
        // MemberExpression . IdentifierName
        case ParseTreeType.MEMBER_EXPRESSION:
        // CallExpression:
        //   CallExpression . IdentifierName
        case ParseTreeType.CALL_EXPRESSION:
          return true;

        // new MemberExpression Arguments
        case ParseTreeType.NEW_EXPRESSION:
          return this.asNewExpression().args != null;
      }

      return false;
    },

    /** @return {boolean} */
    isExpression: function() {
      return this.isAssignmentExpression() ||
          this.type == ParseTreeType.COMMA_EXPRESSION;
    },

    /** @return {boolean} */
    isAssignmentOrSpread: function() {
      return this.isAssignmentExpression() ||
          this.type == ParseTreeType.SPREAD_EXPRESSION;
    },

    /** @return {boolean} */
    isRestParameter: function() {
      return this.type == ParseTreeType.REST_PARAMETER;
    },

    /** @return {boolean} */
    isSpreadPatternElement: function() {
      return this.type == ParseTreeType.SPREAD_PATTERN_ELEMENT;
    },

    /**
     * In V8 any source element may appear where statement appears in the ECMA
     * grammar.
     * @return {boolean}
     */
    isStatement: function() {
      return this.isSourceElement();
    },

    /**
     * This function reflects the ECMA standard, or what we would expect to
     * become the ECMA standard. Most places use isStatement instead which
     * reflects where code on the web diverges from the standard.
     * @return {boolean}
     */
    isStatementStandard: function() {
      switch (this.type) {
        case ParseTreeType.BLOCK:
        case ParseTreeType.AWAIT_STATEMENT:
        case ParseTreeType.VARIABLE_STATEMENT:
        case ParseTreeType.EMPTY_STATEMENT:
        case ParseTreeType.EXPRESSION_STATEMENT:
        case ParseTreeType.IF_STATEMENT:
        case ParseTreeType.DO_WHILE_STATEMENT:
        case ParseTreeType.WHILE_STATEMENT:
        case ParseTreeType.FOR_EACH_STATEMENT:
        case ParseTreeType.FOR_IN_STATEMENT:
        case ParseTreeType.FOR_STATEMENT:
        case ParseTreeType.CONTINUE_STATEMENT:
        case ParseTreeType.BREAK_STATEMENT:
        case ParseTreeType.RETURN_STATEMENT:
        case ParseTreeType.YIELD_STATEMENT:
        case ParseTreeType.WITH_STATEMENT:
        case ParseTreeType.SWITCH_STATEMENT:
        case ParseTreeType.LABELLED_STATEMENT:
        case ParseTreeType.THROW_STATEMENT:
        case ParseTreeType.TRY_STATEMENT:
        case ParseTreeType.DEBUGGER_STATEMENT:
          return true;
        default:
          return false;
      }
    },

    /** @return {boolean} */
    isSourceElement: function() {
      return this.isStatementStandard() ||
          this.type == ParseTreeType.FUNCTION_DECLARATION;
    }
  };

  return {
    ParseTree: ParseTree
  };
});
