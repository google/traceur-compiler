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
  //TODO: var NewExpressionTree = traceur.syntax.trees.NewExpressionTree;
  //TODO: var ParenExpressionTree = traceur.syntax.trees.ParenExpressionTree;
  
  /**
   * A Token in a javascript file.
   * Immutable.
   * A plain old data structure. Should contain data members and simple
   * accessors only.
   */
  function ParseTree(type, location) {
    this.type = type;
    this.location = location;
  }

  ParseTree.prototype = {
    asNewExpression: function() {
      assert(this instanceof NewExpressionTree);
      return this;
    },
    
    asParenExpression: function() {
      assert(this instanceof ParenExpressionTree);
      return this;
    },
    
    isNull: function() {
      return this.type === ParseTreeType.NULL;
    },

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
          return asNewExpression().arguments != null;
      }
  
      return false;
    },
  
    isExpression: function() {
      return isAssignmentExpression() ||
        this.type == ParseTreeType.COMMA_EXPRESSION;
    },
  
    isAssignmentOrSpread: function() {
      return isAssignmentExpression() ||
        this.type == ParseTreeType.SPREAD_EXPRESSION;
    },
  
    isRestParameter: function() {
      return this.type == ParseTreeType.REST_PARAMETER;
    },
  
    isSpreadPatternElement: function() {
      return this.type == ParseTreeType.SPREAD_PATTERN_ELEMENT;
    },
  
    /**
     * In V8 any source element may appear where statement appears in the ECMA
     * grammar.
     */
    isStatement: function() {
      return this.isSourceElement();
    },
  
    /**
     * This function reflects the ECMA standard, or what we would expect to
     * become the ECMA standard. Most places use isStatement instead which
     * reflects where code on the web diverges from the standard.
     */
    isStatementStandard: function() {
      switch (this.type) {
        case ParseTreeType.BLOCK:
        case ParseTreeType.ASYNC_STATEMENT:
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
  
    isSourceElement: function() {
      return isStatementStandard() || this.type == ParseTreeType.FUNCTION_DECLARATION;
    }
  };

  return {
    ParseTree: ParseTree
  };
});
