// Copyright 2012 Traceur Authors.
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

import * as ParseTreeType from './ParseTreeType.js';
import {
  IDENTIFIER,
  STAR,
  STRING,
  VAR,
} from '../TokenType.js';
import {Token} from '../Token.js';
import * as utilJSON from '../../util/JSON.js';
import {ASYNC} from '../PredefinedName.js';

import {
  ARRAY_COMPREHENSION,
  ARRAY_LITERAL_EXPRESSION,
  ARRAY_PATTERN,
  ARROW_FUNCTION_EXPRESSION,
  AWAIT_EXPRESSION,
  BINARY_EXPRESSION,
  BINDING_IDENTIFIER,
  BLOCK,
  BREAK_STATEMENT,
  CALL_EXPRESSION,
  CLASS_DECLARATION,
  CLASS_EXPRESSION,
  COMMA_EXPRESSION,
  CONDITIONAL_EXPRESSION,
  CONTINUE_STATEMENT,
  DEBUGGER_STATEMENT,
  DO_WHILE_STATEMENT,
  EMPTY_STATEMENT,
  EXPORT_DECLARATION,
  EXPRESSION_STATEMENT,
  FORMAL_PARAMETER,
  FOR_IN_STATEMENT,
  FOR_OF_STATEMENT,
  FOR_STATEMENT,
  FUNCTION_DECLARATION,
  FUNCTION_EXPRESSION,
  GENERATOR_COMPREHENSION,
  IDENTIFIER_EXPRESSION,
  IF_STATEMENT,
  IMPORTED_BINDING,
  IMPORT_DECLARATION,
  INTERFACE_DECLARATION,
  LABELLED_STATEMENT,
  LITERAL_EXPRESSION,
  MEMBER_EXPRESSION,
  MEMBER_LOOKUP_EXPRESSION,
  MODULE_DECLARATION,
  NEW_EXPRESSION,
  OBJECT_LITERAL_EXPRESSION,
  OBJECT_PATTERN,
  PAREN_EXPRESSION,
  POSTFIX_EXPRESSION,
  PREDEFINED_TYPE,
  PROPERTY_NAME_SHORTHAND,
  REST_PARAMETER,
  RETURN_STATEMENT,
  SPREAD_EXPRESSION,
  SPREAD_PATTERN_ELEMENT,
  SUPER_EXPRESSION,
  SWITCH_STATEMENT,
  TEMPLATE_LITERAL_EXPRESSION,
  THIS_EXPRESSION,
  THROW_STATEMENT,
  TRY_STATEMENT,
  TYPE_REFERENCE,
  UNARY_EXPRESSION,
  VARIABLE_DECLARATION,
  VARIABLE_STATEMENT,
  WHILE_STATEMENT,
  WITH_STATEMENT,
  YIELD_EXPRESSION
} from './ParseTreeType.js';

export {ParseTreeType};

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
 *   - add ParseTreeWriter.visit(XTree)
 *   - add ParseTreeValidator.visit(XTree)
 */
export class ParseTree {
  /**
   * @param {ParseTreeType} type
   * @param {SourceRange} location
   */
  constructor(type, location) {
    throw new Error("Don't use for now. 'super' is currently very slow.");
    this.type = type;
    this.location = location;
  }

  /** @return {boolean} */
  isPattern() {
    switch (this.type) {
      case ARRAY_PATTERN:
      case OBJECT_PATTERN:
        return true;
      default:
        return false;
    }
  }

  /** @return {boolean} */
  isLeftHandSideExpression() {
    switch (this.type) {
      case THIS_EXPRESSION:
      case CLASS_EXPRESSION:
      case SUPER_EXPRESSION:
      case IDENTIFIER_EXPRESSION:
      case LITERAL_EXPRESSION:
      case ARRAY_LITERAL_EXPRESSION:
      case OBJECT_LITERAL_EXPRESSION:
      case NEW_EXPRESSION:
      case MEMBER_EXPRESSION:
      case MEMBER_LOOKUP_EXPRESSION:
      case CALL_EXPRESSION:
      case FUNCTION_EXPRESSION:
      case TEMPLATE_LITERAL_EXPRESSION:
        return true;
      case PAREN_EXPRESSION:
        return this.expression.isLeftHandSideExpression();
      default:
        return false;
    }
  }

  /** @return {boolean} */
  isAssignmentExpression() {
    switch (this.type) {
      case ARRAY_COMPREHENSION:
      case ARRAY_LITERAL_EXPRESSION:
      case ARROW_FUNCTION_EXPRESSION:
      case AWAIT_EXPRESSION:
      case BINARY_EXPRESSION:
      case CALL_EXPRESSION:
      case CLASS_EXPRESSION:
      case CONDITIONAL_EXPRESSION:
      case FUNCTION_EXPRESSION:
      case GENERATOR_COMPREHENSION:
      case IDENTIFIER_EXPRESSION:
      case LITERAL_EXPRESSION:
      case MEMBER_EXPRESSION:
      case MEMBER_LOOKUP_EXPRESSION:
      case NEW_EXPRESSION:
      case OBJECT_LITERAL_EXPRESSION:
      case PAREN_EXPRESSION:
      case POSTFIX_EXPRESSION:
      case TEMPLATE_LITERAL_EXPRESSION:
      case SUPER_EXPRESSION:
      case THIS_EXPRESSION:
      case UNARY_EXPRESSION:
      case YIELD_EXPRESSION:
        return true;
      default:
        return false;
    }
  }

  // ECMA 262 11.2:
  // MemberExpression :
  //    PrimaryExpression
  //    FunctionExpression
  //    MemberExpression [ Expression ]
  //    MemberExpression . IdentifierName
  //    new MemberExpression Arguments
  /** @return {boolean} */
  isMemberExpression() {
    switch (this.type) {
      // PrimaryExpression
      case THIS_EXPRESSION:
      case CLASS_EXPRESSION:
      case SUPER_EXPRESSION:
      case IDENTIFIER_EXPRESSION:
      case LITERAL_EXPRESSION:
      case ARRAY_LITERAL_EXPRESSION:
      case OBJECT_LITERAL_EXPRESSION:
      case PAREN_EXPRESSION:
      case TEMPLATE_LITERAL_EXPRESSION:
      case FUNCTION_EXPRESSION:
      // MemberExpression [ Expression ]
      case MEMBER_LOOKUP_EXPRESSION:
      // MemberExpression . IdentifierName
      case MEMBER_EXPRESSION:
      // CallExpression:
      //   CallExpression . IdentifierName
      case CALL_EXPRESSION:
        return true;

      // new MemberExpression Arguments
      case NEW_EXPRESSION:
        return this.args != null;
    }

    return false;
  }

  /** @return {boolean} */
  isExpression() {
    return this.isAssignmentExpression() ||
        this.type == COMMA_EXPRESSION;
  }

  /** @return {boolean} */
  isAssignmentOrSpread() {
    return this.isAssignmentExpression() ||
        this.type == SPREAD_EXPRESSION;
  }

  /** @return {boolean} */
  isRestParameter() {
    return this.type == REST_PARAMETER ||
        (this.type == FORMAL_PARAMETER && this.parameter.isRestParameter());
  }

  /** @return {boolean} */
  isSpreadPatternElement() {
    return this.type == SPREAD_PATTERN_ELEMENT;
  }

  isStatementListItem() {
    return this.isStatement() || this.isDeclaration();
  }

  isStatement() {
    switch (this.type) {
      case BLOCK:
      case VARIABLE_STATEMENT:
      case EMPTY_STATEMENT:
      case EXPRESSION_STATEMENT:
      case IF_STATEMENT:
      case CONTINUE_STATEMENT:
      case BREAK_STATEMENT:
      case RETURN_STATEMENT:
      case WITH_STATEMENT:
      case LABELLED_STATEMENT:
      case THROW_STATEMENT:
      case TRY_STATEMENT:
      case DEBUGGER_STATEMENT:
        return true;
    }

    return this.isBreakableStatement();
  }

  // Declaration :
  //   FunctionDeclaration
  //   GeneratorDeclaration
  //   ClassDeclaration
  //   LexicalDeclaration
  isDeclaration() {
    switch (this.type) {
      case FUNCTION_DECLARATION:
      // GeneratorDeclaration is covered by FUNCTION_DECLARATION.
      case CLASS_DECLARATION:
       return true;
    }

    return this.isLexicalDeclaration();
  }

  isLexicalDeclaration() {
    switch (this.type) {
      case VARIABLE_STATEMENT:
        return this.declarations.declarationType !== VAR;
    }
    return false;
  }

  // BreakableStatement :
  //   IterationStatement
  //   SwitchStatement
  isBreakableStatement() {
    switch (this.type) {
      case SWITCH_STATEMENT:
        return true;
    }
    return this.isIterationStatement();
  }

  isIterationStatement() {
    switch (this.type) {
      case DO_WHILE_STATEMENT:
      case FOR_IN_STATEMENT:
      case FOR_OF_STATEMENT:
      case FOR_STATEMENT:
      case WHILE_STATEMENT:
        return true;
    }
    return false;
  }

  /** @return {boolean} */
  isScriptElement() {
    switch (this.type) {
      case CLASS_DECLARATION:
      case EXPORT_DECLARATION:
      case FUNCTION_DECLARATION:
      case IMPORT_DECLARATION:
      case INTERFACE_DECLARATION:
      case MODULE_DECLARATION:
      case VARIABLE_DECLARATION:
        return true;
    }
    return this.isStatement();
  }

  isGenerator() {
    return this.functionKind !== null && this.functionKind.type === STAR;
  }

  isAsyncFunction() {
    return this.functionKind !== null &&
        this.functionKind.type === IDENTIFIER &&
        this.functionKind.value === ASYNC;
  }

  isType() {
    switch (this.type) {
      case PREDEFINED_TYPE:
      case TYPE_REFERENCE:
      // TODO(arv): Implement the rest.
      // case TYPE_QUERY:
      // case OBJECT_TYPE:
      // case FUNCTION_TYPE:
      // case CONSTRUCTOR_TYPE:
        return true;
    }
    return false;
  }

  getDirectivePrologueStringToken_() {
    var tree = this;
    if (tree.type !== EXPRESSION_STATEMENT || !(tree = tree.expression))
      return null;
    if (tree.type !== LITERAL_EXPRESSION   || !(tree = tree.literalToken))
      return null;
    if (tree.type !== STRING)
      return null;
    return tree;
  }

  isDirectivePrologue() {
    return this.getDirectivePrologueStringToken_() !== null;
  }

  isUseStrictDirective() {
    var token = this.getDirectivePrologueStringToken_();
    if (!token)
      return false;
    var v = token.value;
    // A Use Strict Directive may not contain an EscapeSequence or
    // LineContinuation. For example, 'use str\x69ct' is not a valid Use Strict
    // Directive.
    return v === '"use strict"' || v === "'use strict'";
  }

  toJSON() {
    return utilJSON.transform(this, ParseTree.replacer);
  }

  stringify(indent = 2) {
    return JSON.stringify(this, ParseTree.replacer, indent);
  }

  /**
   * Gets the string value of a tree. This matches the StringValue static
   * semantics of the spec.
   * @returns {string}
   */
  getStringValue() {
    switch (this.type) {
      case IDENTIFIER_EXPRESSION:
      case BINDING_IDENTIFIER:
        return this.identifierToken.toString();
      case IMPORTED_BINDING:
        return this.binding.getStringValue();
      case PROPERTY_NAME_SHORTHAND:
        return this.name.toString();
    }

    throw new Error('Not yet implemented');

  }

  /**
   * This replacer is for use to when converting to a JSON string if you
   * don't want location. Call JSON.stringfy(tree, ParseTree.stripLocation)
   * @param {string} key
   * @param {*} value
   * @return {*}
   */
  static stripLocation(key, value) {
    if (key === 'location') {
      return undefined;
    }
    return value;
  }

  /**
   * Like stripLocation, but also adds 'type' properties to the output.
   * @param {string} key
   * @param {*} value
   * @return {*}
   */
  static replacer(k, v) {
    if (v instanceof ParseTree || v instanceof Token) {
      var rv = {type: v.type};
      Object.keys(v).forEach(function(name) {
        // assigns 'type' again for Token, but no big deal.
        if (name !== 'location')
          rv[name] = v[name];
      });
      return rv;
    }
    return v;
  }
}
