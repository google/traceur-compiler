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
   */
  var ParseTreeType = {
    PROGRAM: 'PROGRAM',
    FUNCTION_DECLARATION: 'FUNCTION_DECLARATION',
    BLOCK: 'BLOCK',
    VARIABLE_STATEMENT: 'VARIABLE_STATEMENT',
    VARIABLE_DECLARATION: 'VARIABLE_DECLARATION',
    EMPTY_STATEMENT: 'EMPTY_STATEMENT',
    EXPRESSION_STATEMENT: 'EXPRESSION_STATEMENT',
    IF_STATEMENT: 'IF_STATEMENT',
    DO_WHILE_STATEMENT: 'DO_WHILE_STATEMENT',
    WHILE_STATEMENT: 'WHILE_STATEMENT',
    FOR_IN_STATEMENT: 'FOR_IN_STATEMENT',
    FOR_STATEMENT: 'FOR_STATEMENT',
    VARIABLE_DECLARATION_LIST: 'VARIABLE_DECLARATION_LIST',
    CONTINUE_STATEMENT: 'CONTINUE_STATEMENT',
    BREAK_STATEMENT: 'BREAK_STATEMENT',
    RETURN_STATEMENT: 'RETURN_STATEMENT',
    WITH_STATEMENT: 'WITH_STATEMENT',
    CASE_CLAUSE: 'CASE_CLAUSE',
    DEFAULT_CLAUSE: 'DEFAULT_CLAUSE',
    SWITCH_STATEMENT: 'SWITCH_STATEMENT',
    LABELLED_STATEMENT: 'LABELLED_STATEMENT',
    THROW_STATEMENT: 'THROW_STATEMENT',
    CATCH: 'CATCH',
    TRY_STATEMENT: 'TRY_STATEMENT',
    DEBUGGER_STATEMENT: 'DEBUGGER_STATEMENT',
    THIS_EXPRESSION: 'THIS_EXPRESSION',
    IDENTIFIER_EXPRESSION: 'IDENTIFIER_EXPRESSION',
    LITERAL_EXPRESSION: 'LITERAL_EXPRESSION',
    ARRAY_LITERAL_EXPRESSION: 'ARRAY_LITERAL_EXPRESSION',
    OBJECT_LITERAL_EXPRESSION: 'OBJECT_LITERAL_EXPRESSION',
    GET_ACCESSOR: 'GET_ACCESSOR',
    SET_ACCESSOR: 'SET_ACCESSOR',
    PROPERTY_NAME_ASSIGNMENT: 'PROPERTY_NAME_ASSIGNMENT',
    MISSING_PRIMARY_EXPRESSION: 'MISSING_PRIMARY_EXPRESSION',
    COMMA_EXPRESSION: 'COMMA_EXPRESSION',
    BINARY_OPERATOR: 'BINARY_OPERATOR',
    CONDITIONAL_EXPRESSION: 'CONDITIONAL_EXPRESSION',
    UNARY_EXPRESSION: 'UNARY_EXPRESSION',
    POSTFIX_EXPRESSION: 'POSTFIX_EXPRESSION',
    MEMBER_EXPRESSION: 'MEMBER_EXPRESSION',
    NEW_EXPRESSION: 'NEW_EXPRESSION',
    ARGUMENT_LIST: 'ARGUMENT_LIST',
    CALL_EXPRESSION: 'CALL_EXPRESSION',
    CLASS_DECLARATION: 'CLASS_DECLARATION',
    MEMBER_LOOKUP_EXPRESSION: 'MEMBER_LOOKUP_EXPRESSION',
    PAREN_EXPRESSION: 'PAREN_EXPRESSION',
    FINALLY: 'FINALLY',
    TRAIT_DECLARATION: 'TRAIT_DECLARATION',
    MIXIN: 'MIXIN',
    MIXIN_RESOLVE: 'MIXIN_RESOLVE',
    MIXIN_RESOLVE_LIST: 'MIXIN_RESOLVE_LIST',
    FIELD_DECLARATION: 'FIELD_DECLARATION',
    REQUIRES_MEMBER: 'REQUIRES_MEMBER',
    SUPER_EXPRESSION: 'SUPER_EXPRESSION',
    ARRAY_PATTERN: 'ARRAY_PATTERN',
    SPREAD_PATTERN_ELEMENT: 'SPREAD_PATTERN_ELEMENT',
    OBJECT_PATTERN: 'OBJECT_PATTERN',
    OBJECT_PATTERN_FIELD: 'OBJECT_PATTERN_FIELD',
    FORMAL_PARAMETER_LIST: 'FORMAL_PARAMETER_LIST',
    SPREAD_EXPRESSION: 'SPREAD_EXPRESSION',
    NULL: 'NULL',
    CLASS_EXPRESSION: 'CLASS_EXPRESSION',
    REST_PARAMETER: 'REST_PARAMETER',
    MODULE_DEFINITION: 'MODULE_DEFINITION',
    EXPORT_DECLARATION: 'EXPORT_DECLARATION',
    IMPORT_SPECIFIER: 'IMPORT_SPECIFIER',
    IMPORT_PATH: 'IMPORT_PATH',
    IMPORT_DECLARATION: 'IMPORT_DECLARATION',
    FOR_EACH_STATEMENT: 'FOR_EACH_STATEMENT',
    YIELD_STATEMENT: 'YIELD_STATEMENT',
    STATE_MACHINE: 'STATE_MACHINE',
    ASYNC_STATEMENT: 'ASYNC_STATEMENT',
    DEFAULT_PARAMETER: 'DEFAULT_PARAMETER'
  };

  return {
    ParseTreeType: ParseTreeType
  };
});
