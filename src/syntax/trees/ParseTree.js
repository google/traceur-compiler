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

  var typeToNameMap = Object.create(null);

  // Add the exceptions
  typeToNameMap[ParseTreeType.NULL] = 'NullTree';
  typeToNameMap[ParseTreeType.IMPORT_PATH] = 'ImportPath';

  function getCapitalizedName(type) {
    var name = type.toString();
    return ('_' + name.toLowerCase()).replace(/_(\w)/g, function(_, c) {
      return c.toUpperCase();
    });
  }

  /**
   * This returns the name for a ParseTreeType. For example if the type
   * CASE_CLAUSE is passed in this returns CaseClause.
   * @param {ParseTreeType} type
   * @return {string}
   */
  function getTreeNameForType(type) {
    // Cache.
    if (type in typeToNameMap)
      return typeToNameMap[type];

    var name = getCapitalizedName(type);
    return typeToNameMap[type] = name;
  }

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
          return this.expression.isPattern();
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
          return this.expression.isLeftHandSideExpression();
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
          return this.args != null;
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
      switch (this.type) {
        case ParseTreeType.FUNCTION_DECLARATION:
        case ParseTreeType.CLASS_DECLARATION:
        case ParseTreeType.TRAIT_DECLARATION:
          return true;
      }
      return this.isStatementStandard();
    },

    /** @return {boolean} */
    isProgramElement: function() {
      switch (this.type) {
        case ParseTreeType.VARIABLE_DECLARATION:
        case ParseTreeType.FUNCTION_DECLARATION:
        case ParseTreeType.IMPORT_DECLARATION:
        case ParseTreeType.MODULE_DECLARATION:
        case ParseTreeType.MODULE_DEFINITION:
        case ParseTreeType.EXPORT_DECLARATION:
        case ParseTreeType.CLASS_DECLARATION:
        case ParseTreeType.TRAIT_DECLARATION:
          return true;
      }
      return this.isStatementStandard();
    }
  };

  return {
    getTreeNameForType: getTreeNameForType,
    ParseTree: ParseTree
  };
});
