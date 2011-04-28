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

  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;

  /**
   * This creates the ParseTree class for the given type and arguments.
   * @param {ParseTreeType} type The type of token this tree represents.
   * @param {...string} var_args Name of the arguments and fields to create on
   *     the class.
   * @return {Function}
   */
  function create(type, var_args) {
    var args = arguments;
    var Tree = function(location) {
      traceur.syntax.trees.ParseTree.call(this, type, location);
      for (var i = 1; i < args.length; i++) {
        this[args[i]] = arguments[i];
      }
      Object.freeze(this);
    };
    Tree.prototype = {
      __proto__: ParseTree.prototype
    };
    return Tree;
  }

  // All trees but NullTree

  return {
    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} args
     * @constructor
     * @extends {ParseTree}
     */
    ArgumentList: create(
        ParseTreeType.ARGUMENT_LIST,
        'args'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ArrayLiteralExpression: create(
        ParseTreeType.ARRAY_LITERAL_EXPRESSION,
        'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ArrayPattern: create(
        ParseTreeType.ARRAY_PATTERN,
        'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {IdentifierToken} identifier
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    AwaitStatement: create(
        ParseTreeType.AWAIT_STATEMENT,
        'identifier',
        'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} left
     * @param {Token} operator
     * @param {ParseTree} right
     * @constructor
     * @extends {ParseTree}
     */
    BinaryOperator: create(
        ParseTreeType.BINARY_OPERATOR,
        'left',
        'operator',
        'right'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} statements
     * @constructor
     * @extends {ParseTree}
     */
    Block: create(
        ParseTreeType.BLOCK,
        'statements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @constructor
     * @extends {ParseTree}
     */
    BreakStatement: create(
        ParseTreeType.BREAK_STATEMENT,
        'name'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {ArgumentList} args
     * @constructor
     * @extends {ParseTree}
     */
    CallExpression: create(
        ParseTreeType.CALL_EXPRESSION,
        'operand',
        'args'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {Array.<ParseTree>} statements
     * @constructor
     * @extends {ParseTree}
     */
    CaseClause: create(
        ParseTreeType.CASE_CLAUSE,
        'expression',
        'statements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} exceptionName
     * @param {ParseTree} catchBody
     * @constructor
     * @extends {ParseTree}
     */
    Catch: create(
        ParseTreeType.CATCH,
        'exceptionName',
        'catchBody'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {ParseTree} superClass
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ClassDeclaration: create(
        ParseTreeType.CLASS_DECLARATION,
        'name',
        'superClass',
        'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    ClassExpression: create(ParseTreeType.CLASS_EXPRESSION),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} expressions
     * @constructor
     * @extends {ParseTree}
     */
    CommaExpression: create(
        ParseTreeType.COMMA_EXPRESSION,
        'expressions'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} condition
     * @param {ParseTree} left
     * @param {ParseTree} right
     * @constructor
     * @extends {ParseTree}
     */
    ConditionalExpression: create(
        ParseTreeType.CONDITIONAL_EXPRESSION,
        'condition',
        'left',
        'right'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @constructor
     * @extends {ParseTree}
     */
    ContinueStatement: create(
        ParseTreeType.CONTINUE_STATEMENT,
        'name'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    DebuggerStatement: create(ParseTreeType.DEBUGGER_STATEMENT),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} statements
     * @constructor
     * @extends {ParseTree}
     */
    DefaultClause: create(
        ParseTreeType.DEFAULT_CLAUSE,
        'statements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.IdentifierExpression} identifier
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    DefaultParameter: create(
        ParseTreeType.DEFAULT_PARAMETER,
        'identifier',
        'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} body
     * @param {ParseTree} condition
     * @constructor
     * @extends {ParseTree}
     */
    DoWhileStatement: create(
        ParseTreeType.DO_WHILE_STATEMENT,
        'body',
        'condition'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    EmptyStatement: create(ParseTreeType.EMPTY_STATEMENT),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} declaration
     * @constructor
     * @extends {ParseTree}
     */
    ExportDeclaration: create(
        ParseTreeType.EXPORT_DECLARATION,
        'declaration'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} paths
     * @constructor
     * @extends {ParseTree}
     */
    ExportPathList: create(ParseTreeType.EXPORT_PATH_LIST, 'paths'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} specifiers
     * @constructor
     * @extends {ParseTree}
     */
    ExportPathSpecifierSet: create(ParseTreeType.EXPORT_PATH_SPECIFIER_SET, 'specifiers'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Token} identifier
     * @param {ParseTree} specifier
     * @constructor
     * @extends {ParseTree}
     */
    ExportPathSpecifier: create(ParseTreeType.EXPORT_PATH_SPECIFIER, 'identifier', 'specifier'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} moduleExpression
     * @param {ParseTree} specifier
     * @constructor
     * @extends {ParseTree}
     */
    ExportPath: create(ParseTreeType.EXPORT_PATH, 'moduleExpression', 'specifier'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Token} lhs
     * @param {Token} rhs
     * @constructor
     * @extends {ParseTree}
     */
    ExportSpecifier: create(ParseTreeType.EXPORT_SPECIFIER, 'lhs', 'rhs'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} specifiers
     * @constructor
     * @extends {ParseTree}
     */
    ExportSpecifierSet: create(ParseTreeType.EXPORT_SPECIFIER_SET, 'specifiers'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    ExpressionStatement: create(
        ParseTreeType.EXPRESSION_STATEMENT,
        'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {boolean} isStatic
     * @param {boolean} isConst
     * @param {Array.<traceur.syntax.trees.VariableDeclaration>}
     *     declarations
     * @constructor
     * @extends {ParseTree}
     */
    FieldDeclaration: create(
        ParseTreeType.FIELD_DECLARATION,
        'isStatic',
        'isConst',
        'declarations'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} block
     * @constructor
     * @extends {ParseTree}
     */
    Finally: create(
        ParseTreeType.FINALLY,
        'block'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.VariableDeclarationList} initializer
     * @param {ParseTree} collection
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    ForEachStatement: create(
        ParseTreeType.FOR_EACH_STATEMENT,
        'initializer',
        'collection',
        'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} initializer
     * @param {ParseTree} collection
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    ForInStatement: create(
        ParseTreeType.FOR_IN_STATEMENT,
        'initializer',
        'collection',
        'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} parameters
     * @constructor
     * @extends {ParseTree}
     */
    FormalParameterList: create(
        ParseTreeType.FORMAL_PARAMETER_LIST,
        'parameters'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} initializer
     * @param {ParseTree} condition
     * @param {ParseTree} increment
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    ForStatement: create(
        ParseTreeType.FOR_STATEMENT,
        'initializer',
        'condition',
        'increment',
        'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {Boolean} isStatic
     * @param {traceur.syntax.trees.FormalParameterList} formalParameterList
     * @param {traceur.syntax.trees.Block} functionBody
     * @constructor
     * @extends {ParseTree}
     */
    FunctionDeclaration: create(
        ParseTreeType.FUNCTION_DECLARATION,
        'name',
        'isStatic',
        'formalParameterList',
        'functionBody'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} propertyName
     * @param {boolean} isStatic
     * @param {Block} body
     * @constructor
     * @extends {ParseTree}
     */
    GetAccessor: create(
        ParseTreeType.GET_ACCESSOR,
        'propertyName',
        'isStatic',
        'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} identifierToken
     * @constructor
     * @extends {ParseTree}
     */
    IdentifierExpression: create(
        ParseTreeType.IDENTIFIER_EXPRESSION,
        'identifierToken'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} condition
     * @param {ParseTree} ifClause
     * @param {ParseTree} elseClause
     * @constructor
     * @extends {ParseTree}
     */
    IfStatement: create(
        ParseTreeType.IF_STATEMENT,
        'condition',
        'ifClause',
        'elseClause'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} importPathList
     * @constructor
     * @extends {ParseTree}
     */
    ImportDeclaration: create(
        ParseTreeType.IMPORT_DECLARATION,
        'importPathList'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.ModuleExpression} moduleExpression
     * @param {traceur.syntax.trees.ImportSpecifierSet} importSpecifierSet
     * @constructor
     * @extends {ParseTree}
     */
    ImportPath: create(
        ParseTreeType.IMPORT_PATH,
        'moduleExpression',
        'importSpecifierSet'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} lhs
     * @param {traceur.syntax.IdentifierToken} rhs
     * @constructor
     * @extends {ParseTree}
     */
    ImportSpecifier: create(
        ParseTreeType.IMPORT_SPECIFIER,
        'lhs',
        'rhs'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {trauce.syntax.Token|
     *     traceur.syntax.IdentifierToken|Array.<ImportSpecifier>} specifiers
     * @constructor
     * @extends {ParseTree}
     */
    ImportSpecifierSet: create(
        ParseTreeType.IMPORT_SPECIFIER_SET,
        'specifiers'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {ParseTree} statement
     * @constructor
     * @extends {ParseTree}
     */
    LabelledStatement: create(
        ParseTreeType.LABELLED_STATEMENT,
        'name',
        'statement'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} literalToken
     * @constructor
     * @extends {ParseTree}
     */
    LiteralExpression: create(
        ParseTreeType.LITERAL_EXPRESSION,
        'literalToken'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {traceur.syntax.IdentifierToken} memberName
     * @constructor
     * @extends {ParseTree}
     */
    MemberExpression: create(
        ParseTreeType.MEMBER_EXPRESSION,
        'operand',
        'memberName'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {ParseTree} memberExpression
     * @constructor
     * @extends {ParseTree}
     */
    MemberLookupExpression: create(
        ParseTreeType.MEMBER_LOOKUP_EXPRESSION,
        'operand',
        'memberExpression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} nextToken
     * @constructor
     * @extends {ParseTree}
     */
    MissingPrimaryExpression: create(
        ParseTreeType.MISSING_PRIMARY_EXPRESSION,
        'nextToken'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} resolves
     * @constructor
     * @extends {ParseTree}
     */
    MixinResolveList: create(
        ParseTreeType.MIXIN_RESOLVE_LIST,
        'resolves'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} from
     * @param {traceur.syntax.IdentifierToken} to
     * @constructor
     * @extends {ParseTree}
     */
    MixinResolve: create(
        ParseTreeType.MIXIN_RESOLVE,
        'from',
        'to'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {traceur.syntax.trees.MixinResolveList} mixinResolves
     * @constructor
     * @extends {ParseTree}
     */
    Mixin: create(
        ParseTreeType.MIXIN,
        'name',
        'mixinResolves'),


    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} specifiers
     * @constructor
     * @extends {ParseTree}
     */
    ModuleDeclaration: create(
        ParseTreeType.MODULE_DECLARATION,
        'specifiers'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ModuleDefinition: create(
        ParseTreeType.MODULE_DEFINITION,
        'name',
        'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.ParseTree} reference
     * @param {Array.<traceur.syntax.IdentifierToken>} identifiers
     * @constructor
     * @extends {ParseTree}
     */
    ModuleExpression: create(
        ParseTreeType.MODULE_EXPRESSION,
        'reference',
        'identifiers'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} url
     * @constructor
     * @extends {ParseTree}
     */
    ModuleRequire: create(
        ParseTreeType.MODULE_REQUIRE,
        'url'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} identifier
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    ModuleSpecifier: create(
        ParseTreeType.MODULE_SPECIFIER,
        'identifier',
        'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {traceur.syntax.trees.ArgumentList} args
     * @constructor
     * @extends {ParseTree}
     */
    NewExpression: create(
        ParseTreeType.NEW_EXPRESSION,
        'operand',
        'args'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} propertyNameAndValues
     * @constructor
     * @extends {ParseTree}
     */
    ObjectLiteralExpression: create(
        ParseTreeType.OBJECT_LITERAL_EXPRESSION,
        'propertyNameAndValues'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} identifier
     * @param {?ParseTree} element
     * @constructor
     * @extends {ParseTree}
     */
    ObjectPatternField: create(
        ParseTreeType.OBJECT_PATTERN_FIELD,
        'identifier',
        'element'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} fields
     * @constructor
     * @extends {ParseTree}
     */
    ObjectPattern: create(
        ParseTreeType.OBJECT_PATTERN,
        'fields'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    ParenExpression: create(
        ParseTreeType.PAREN_EXPRESSION,
        'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {traceur.syntax.Token} operator
     * @constructor
     * @extends {ParseTree}
     */
    PostfixExpression: create(
        ParseTreeType.POSTFIX_EXPRESSION,
        'operand',
        'operator'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} programElements
     * @constructor
     * @extends {ParseTree}
     */
    Program: create(
        ParseTreeType.PROGRAM,
        'programElements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} name
     * @param {ParseTree} value
     * @constructor
     * @extends {ParseTree}
     */
    PropertyNameAssignment: create(
        ParseTreeType.PROPERTY_NAME_ASSIGNMENT,
        'name',
        'value'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} moduleExpression
     * @param {Token} identifier
     * @constructor
     * @extends {ParseTree}
     */
    QualifiedReference: create(ParseTreeType.QUALIFIED_REFERENCE, 'moduleExpression', 'identifier'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @constructor
     * @extends {ParseTree}
     */
    RequiresMember: create(
        ParseTreeType.REQUIRES_MEMBER,
        'name'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} identifier
     * @constructor
     * @extends {ParseTree}
     */
    RestParameter: create(
        ParseTreeType.REST_PARAMETER,
        'identifier'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    ReturnStatement: create(
        ParseTreeType.RETURN_STATEMENT,
        'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} propertyName
     * @param {boolean} isStatic
     * @param {traceur.syntax.IdentifierToken} parameter
     * @param {traceur.syntax.trees.Block} body
     * @constructor
     * @extends {ParseTree}
     */
    SetAccessor: create(
        ParseTreeType.SET_ACCESSOR,
        'propertyName',
        'isStatic',
        'parameter',
        'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    SpreadExpression: create(
        ParseTreeType.SPREAD_EXPRESSION,
        'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} lvalue
     * @constructor
     * @extends {ParseTree}
     */
    SpreadPatternElement: create(
        ParseTreeType.SPREAD_PATTERN_ELEMENT,
        'lvalue'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    SuperExpression: create(ParseTreeType.SUPER_EXPRESSION),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {Array.<ParseTree>} caseClauses
     * @constructor
     * @extends {ParseTree}
     */
    SwitchStatement: create(
        ParseTreeType.SWITCH_STATEMENT,
        'expression',
        'caseClauses'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    ThisExpression: create(ParseTreeType.THIS_EXPRESSION),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} value
     * @constructor
     * @extends {ParseTree}
     */
    ThrowStatement: create(
        ParseTreeType.THROW_STATEMENT,
        'value'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    TraitDeclaration: create(
        ParseTreeType.TRAIT_DECLARATION,
        'name',
        'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} body
     * @param {ParseTree} catchBlock
     * @param {ParseTree} finallyBlock
     * @constructor
     * @extends {ParseTree}
     */
    TryStatement: create(
        ParseTreeType.TRY_STATEMENT,
        'body',
        'catchBlock',
        'finallyBlock'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} operator
     * @param {ParseTree} operand
     * @constructor
     * @extends {ParseTree}
     */
    UnaryExpression: create(
        ParseTreeType.UNARY_EXPRESSION,
        'operator',
        'operand'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.TokenType} declarationType
     * @param {Array.<traceur.syntax.trees.VariableDeclaration>}
     *     declarations
     * @constructor
     * @extends {ParseTree}
     */
    VariableDeclarationList: create(
        ParseTreeType.VARIABLE_DECLARATION_LIST,
        'declarationType',
        'declarations'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} lvalue
     * @param {ParseTree} initializer
     * @constructor
     * @extends {ParseTree}
     */
    VariableDeclaration: create(
        ParseTreeType.VARIABLE_DECLARATION,
        'lvalue',
        'initializer'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.VariableDeclarationList} declarations
     * @constructor
     * @extends {ParseTree}
     */
    VariableStatement: create(
        ParseTreeType.VARIABLE_STATEMENT,
        'declarations'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} condition
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    WhileStatement: create(
        ParseTreeType.WHILE_STATEMENT,
        'condition',
        'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    WithStatement: create(
        ParseTreeType.WITH_STATEMENT,
        'expression',
        'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {boolean} isYieldFor
     * @constructor
     * @extends {ParseTree}
     */
    YieldStatement: create(
        ParseTreeType.YIELD_STATEMENT,
        'expression',
        'isYieldFor')
  };
});
