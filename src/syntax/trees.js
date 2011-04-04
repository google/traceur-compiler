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
    var c = function(location) {
      traceur.syntax.trees.ParseTree.call(this, type, location);
      for (var i = 1; i < args.length; i++) {
        this[args[i]] = arguments[i];
      }
    };
    c.prototype = {
      __proto__: ParseTree.prototype
    };
    return c;
  }

  // All trees but NullTree and ImportPathTree

  return {
    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} args
     * @constructor
     * @extends {ParseTree}
     */
    ArgumentListTree: create(ParseTreeType.ARGUMENT_LIST, 'args'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ArrayLiteralExpressionTree: create(ParseTreeType.ARRAY_LITERAL_EXPRESSION, 'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ArrayPatternTree: create(ParseTreeType.ARRAY_PATTERN, 'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {IdentifierToken} identifier
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    AsyncStatementTree: create(ParseTreeType.ASYNC_STATEMENT, 'identifier', 'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} left
     * @param {Token} operator
     * @param {ParseTree} right
     * @constructor
     * @extends {ParseTree}
     */
    BinaryOperatorTree: create(ParseTreeType.BINARY_OPERATOR, 'left', 'operator', 'right'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} statements
     * @constructor
     * @extends {ParseTree}
     */
    BlockTree: create(ParseTreeType.BLOCK, 'statements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @constructor
     * @extends {ParseTree}
     */
    BreakStatementTree: create(ParseTreeType.BREAK_STATEMENT, 'name'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {ArgumentListTree} arguments
     * @constructor
     * @extends {ParseTree}
     */
    CallExpressionTree: create(ParseTreeType.CALL_EXPRESSION, 'operand', 'arguments'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {Array.<ParseTree>} statements
     * @constructor
     * @extends {ParseTree}
     */
    CaseClauseTree: create(ParseTreeType.CASE_CLAUSE, 'expression', 'statements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} exceptionName
     * @param {ParseTree} catchBody
     * @constructor
     * @extends {ParseTree}
     */
    CatchTree: create(ParseTreeType.CATCH, 'exceptionName', 'catchBody'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {ParseTree} superClass
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ClassDeclarationTree: create(ParseTreeType.CLASS_DECLARATION, 'name', 'superClass', 'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    ClassExpressionTree: create(ParseTreeType.CLASS_EXPRESSION),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} expressions
     * @constructor
     * @extends {ParseTree}
     */
    CommaExpressionTree: create(ParseTreeType.COMMA_EXPRESSION, 'expressions'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} condition
     * @param {ParseTree} left
     * @param {ParseTree} right
     * @constructor
     * @extends {ParseTree}
     */
    ConditionalExpressionTree: create(ParseTreeType.CONDITIONAL_EXPRESSION, 'condition', 'left', 'right'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @constructor
     * @extends {ParseTree}
     */
    ContinueStatementTree: create(ParseTreeType.CONTINUE_STATEMENT, 'name'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    DebuggerStatementTree: create(ParseTreeType.DEBUGGER_STATEMENT),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} statements
     * @constructor
     * @extends {ParseTree}
     */
    DefaultClauseTree: create(ParseTreeType.DEFAULT_CLAUSE, 'statements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.IdentifierExpressionTree} identifier
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    DefaultParameterTree: create(ParseTreeType.DEFAULT_PARAMETER, 'identifier', 'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} body
     * @param {ParseTree} condition
     * @constructor
     * @extends {ParseTree}
     */
    DoWhileStatementTree: create(ParseTreeType.DO_WHILE_STATEMENT, 'body', 'condition'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    EmptyStatementTree: create(ParseTreeType.EMPTY_STATEMENT),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} declaration
     * @constructor
     * @extends {ParseTree}
     */
    ExportDeclarationTree: create(ParseTreeType.EXPORT_DECLARATION, 'declaration'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    ExpressionStatementTree: create(ParseTreeType.EXPRESSION_STATEMENT, 'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {boolean} isStatic
     * @param {boolean} isConst
     * @param {Array.<traceur.syntax.trees.VariableDeclarationTree>} declarations
     * @constructor
     * @extends {ParseTree}
     */
    FieldDeclarationTree: create(ParseTreeType.FIELD_DECLARATION, 'isStatic', 'isConst', 'declarations'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} block
     * @constructor
     * @extends {ParseTree}
     */
    FinallyTree: create(ParseTreeType.FINALLY, 'block'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.VariableDeclarationListTree} initializer
     * @param {ParseTree} collection
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    ForEachStatementTree: create(ParseTreeType.FOR_EACH_STATEMENT, 'initializer', 'collection', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} initializer
     * @param {ParseTree} collection
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    ForInStatementTree: create(ParseTreeType.FOR_IN_STATEMENT, 'initializer', 'collection', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} variables
     * @param {ParseTree} condition
     * @param {ParseTree} increment
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    ForStatementTree: create(ParseTreeType.FOR_STATEMENT, 'variables', 'condition', 'increment', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} propertyName
     * @param {boolean} isStatic
     * @param {BlockTree} body
     * @constructor
     * @extends {ParseTree}
     */
    GetAccessorTree: create(ParseTreeType.GET_ACCESSOR, 'propertyName', 'isStatic', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} condition
     * @param {ParseTree} ifClause
     * @param {ParseTree} elseClause
     * @constructor
     * @extends {ParseTree}
     */
    IfStatementTree: create(ParseTreeType.IF_STATEMENT, 'condition', 'ifClause', 'elseClause'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} importPathList
     * @constructor
     * @extends {ParseTree}
     */
    ImportDeclarationTree: create(ParseTreeType.IMPORT_DECLARATION, 'importPathList'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} importedName
     * @param {traceur.syntax.IdentifierToken} destinationName
     * @constructor
     * @extends {ParseTree}
     */
    ImportSpecifierTree: create(ParseTreeType.IMPORT_SPECIFIER, 'importedName', 'destinationName'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {ParseTree} statement
     * @constructor
     * @extends {ParseTree}
     */
    LabelledStatementTree: create(ParseTreeType.LABELLED_STATEMENT, 'name', 'statement'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {traceur.syntax.IdentifierToken} memberName
     * @constructor
     * @extends {ParseTree}
     */
    MemberExpressionTree: create(ParseTreeType.MEMBER_EXPRESSION, 'operand', 'memberName'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {ParseTree} memberExpression
     * @constructor
     * @extends {ParseTree}
     */
    MemberLookupExpressionTree: create(ParseTreeType.MEMBER_LOOKUP_EXPRESSION, 'operand', 'memberExpression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} nextToken
     * @constructor
     * @extends {ParseTree}
     */
    MissingPrimaryExpressionTree: create(ParseTreeType.MISSING_PRIMARY_EXPRESSION, 'nextToken'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} resolves
     * @constructor
     * @extends {ParseTree}
     */
    MixinResolveListTree: create(ParseTreeType.MIXIN_RESOLVE_LIST, 'resolves'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} from
     * @param {traceur.syntax.IdentifierToken} to
     * @constructor
     * @extends {ParseTree}
     */
    MixinResolveTree: create(ParseTreeType.MIXIN_RESOLVE, 'from', 'to'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {traceur.syntax.trees.MixinResolveListTree} mixinResolves
     * @constructor
     * @extends {ParseTree}
     */
    MixinTree: create(ParseTreeType.MIXIN, 'name', 'mixinResolves'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ModuleDefinitionTree: create(ParseTreeType.MODULE_DEFINITION, 'name', 'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {traceur.syntax.trees.ArgumentListTree} args
     * @constructor
     * @extends {ParseTree}
     */
    NewExpressionTree: create(ParseTreeType.NEW_EXPRESSION, 'operand', 'args'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} propertyNameAndValues
     * @constructor
     * @extends {ParseTree}
     */
    ObjectLiteralExpressionTree: create(ParseTreeType.OBJECT_LITERAL_EXPRESSION, 'propertyNameAndValues'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} identifier
     * @param {ParseTree|null} element
     * @constructor
     * @extends {ParseTree}
     */
    ObjectPatternFieldTree: create(ParseTreeType.OBJECT_PATTERN_FIELD, 'identifier', 'element'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} fields
     * @constructor
     * @extends {ParseTree}
     */
    ObjectPatternTree: create(ParseTreeType.OBJECT_PATTERN, 'fields'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    ParenExpressionTree: create(ParseTreeType.PAREN_EXPRESSION, 'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {traceur.syntax.Token} operator
     * @constructor
     * @extends {ParseTree}
     */
    PostfixExpressionTree: create(ParseTreeType.POSTFIX_EXPRESSION, 'operand', 'operator'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} name
     * @param {ParseTree} value
     * @constructor
     * @extends {ParseTree}
     */
    PropertyNameAssignmentTree: create(ParseTreeType.PROPERTY_NAME_ASSIGNMENT, 'name', 'value'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @constructor
     * @extends {ParseTree}
     */
    RequiresMemberTree: create(ParseTreeType.REQUIRES_MEMBER, 'name'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    ReturnStatementTree: create(ParseTreeType.RETURN_STATEMENT, 'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} propertyName
     * @param {boolean} isStatic
     * @param {traceur.syntax.IdentifierToken} parameter
     * @param {traceur.syntax.trees.BlockTree} body
     * @constructor
     * @extends {ParseTree}
     */
    SetAccessorTree: create(ParseTreeType.SET_ACCESSOR, 'propertyName', 'isStatic', 'parameter', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    SpreadExpressionTree: create(ParseTreeType.SPREAD_EXPRESSION, 'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} lvalue
     * @constructor
     * @extends {ParseTree}
     */
    SpreadPatternElementTree: create(ParseTreeType.SPREAD_PATTERN_ELEMENT, 'lvalue'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    SuperExpressionTree: create(ParseTreeType.SUPER_EXPRESSION),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {Array.<ParseTree>} caseClauses
     * @constructor
     * @extends {ParseTree}
     */
    SwitchStatementTree: create(ParseTreeType.SWITCH_STATEMENT, 'expression', 'caseClauses'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    ThisExpressionTree: create(ParseTreeType.THIS_EXPRESSION),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} value
     * @constructor
     * @extends {ParseTree}
     */
    ThrowStatementTree: create(ParseTreeType.THROW_STATEMENT, 'value'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    TraitDeclarationTree: create(ParseTreeType.TRAIT_DECLARATION, 'name', 'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} body
     * @param {ParseTree} catchBlock
     * @param {ParseTree} finallyBlock
     * @constructor
     * @extends {ParseTree}
     */
    TryStatementTree: create(ParseTreeType.TRY_STATEMENT, 'body', 'catchBlock', 'finallyBlock'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    WithStatementTree: create(ParseTreeType.WITH_STATEMENT, 'expression', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    YieldStatementTree: create(ParseTreeType.YIELD_STATEMENT, 'expression')
  };
});
