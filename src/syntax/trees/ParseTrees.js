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
  function create(var_args) {
    var args = arguments;
    var Tree = function(location) {
      traceur.syntax.trees.ParseTree.call(this, this.type, location);
      for (var i = 0; i < args.length; i++) {
        this[args[i]] = arguments[i + 1];
      }
    };
    Tree.prototype = Object.create(ParseTree.prototype);
    return Tree;
  }

  // All trees but NullTree

  var parseTrees = {

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} args
     * @constructor
     * @extends {ParseTree}
     */
    ArgumentList: create('args'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {Array.<ParseTree>} comprehensionForList
     * @param {ParseTree} ifExpression
     * @constructor
     * @extends {ParseTree}
     */
    ArrayComprehension: create('expression', 'comprehensionForList',
                               'ifExpression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ArrayLiteralExpression: create('elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ArrayPattern: create('elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.FormalParameterList} formalParameters
     * @param {TokenType} arrow
     * @param {ParseTree} functionBody
     * @constructor
     * @extends {ParseTree}
     */
    ArrowFunctionExpression: create('formalParameters', 'functionBody'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {IdentifierToken} identifier
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    AwaitStatement: create('identifier', 'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} left
     * @param {Token} operator
     * @param {ParseTree} right
     * @constructor
     * @extends {ParseTree}
     */
    BinaryOperator: create('left', 'operator', 'right'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    BindThisParameter: create('expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {IdentifierToken} identifierToken
     * @constructor
     * @extends {ParseTree}
     */
    BindingIdentifier: create('identifierToken'),

    /**
     * BindingElement is used for formal parameters and destructuring variable
     * declarations. The binding is either a pattern consisting of other binding
     * elements or binding identifiers or a binding identifier.
     *
     * The initializer may be null in the case when there is no default value.
     *
     * @param {traceur.util.SourceRange} location
     * @param {BindingIdentifier|ObjectPattern|ArrayPattern} binding
     * @param {ParseTree} initializer
     * @constructor
     * @extends {ParseTree}
     */
    BindingElement: create('binding', 'initializer'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} statements
     * @constructor
     * @extends {ParseTree}
     */
    Block: create('statements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @constructor
     * @extends {ParseTree}
     */
    BreakStatement: create('name'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {ArgumentList} args
     * @constructor
     * @extends {ParseTree}
     */
    CallExpression: create('operand', 'args'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {Array.<ParseTree>} expressions
     * @constructor
     * @extends {ParseTree}
     */
    CascadeExpression: create('operand', 'expressions'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {Array.<ParseTree>} statements
     * @constructor
     * @extends {ParseTree}
     */
    CaseClause: create('expression', 'statements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} binding
     * @param {ParseTree} catchBody
     * @constructor
     * @extends {ParseTree}
     */
    Catch: create('binding', 'catchBody'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {ParseTree} superClass
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ClassDeclaration: create('name', 'superClass', 'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {ParseTree} superClass
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ClassExpression: create('name', 'superClass', 'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} expressions
     * @constructor
     * @extends {ParseTree}
     */
    CommaExpression: create('expressions'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} left
     * @param {ParseTree} iterator
     * @constructor
     * @extends {ParseTree}
     */
    ComprehensionFor: create('left', 'iterator'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} condition
     * @param {ParseTree} left
     * @param {ParseTree} right
     * @constructor
     * @extends {ParseTree}
     */
    ConditionalExpression: create('condition', 'left', 'right'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @constructor
     * @extends {ParseTree}
     */
    ContinueStatement: create('name'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    DebuggerStatement: create(),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} statements
     * @constructor
     * @extends {ParseTree}
     */
    DefaultClause: create('statements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} body
     * @param {ParseTree} condition
     * @constructor
     * @extends {ParseTree}
     */
    DoWhileStatement: create('body', 'condition'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    EmptyStatement: create(),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} declaration
     * @constructor
     * @extends {ParseTree}
     */
    ExportDeclaration: create('declaration'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} paths
     * @constructor
     * @extends {ParseTree}
     */
    ExportMappingList: create('paths'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ModuleExpression} moduleExpression
     * @param {ExportSpecifierSet|IdentifierExpression} specifierSet
     * @constructor
     * @extends {ParseTree}
     */
    ExportMapping: create('moduleExpression', 'specifierSet'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Token} lhs
     * @param {Token} rhs
     * @constructor
     * @extends {ParseTree}
     */
    ExportSpecifier: create('lhs', 'rhs'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} specifiers
     * @constructor
     * @extends {ParseTree}
     */
    ExportSpecifierSet: create('specifiers'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    ExpressionStatement: create('expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} block
     * @constructor
     * @extends {ParseTree}
     */
    Finally: create('block'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.VariableDeclarationList} initializer
     * @param {ParseTree} collection
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    ForOfStatement: create('initializer', 'collection', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} initializer
     * @param {ParseTree} collection
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    ForInStatement: create('initializer', 'collection', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} parameters
     * @constructor
     * @extends {ParseTree}
     */
    FormalParameterList: create('parameters'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} initializer
     * @param {ParseTree} condition
     * @param {ParseTree} increment
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    ForStatement: create('initializer', 'condition', 'increment', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.BindingIdentifier} name
     * @param {boolean} isGenerator
     * @param {traceur.syntax.trees.FormalParameterList} formalParameterList
     * @param {traceur.syntax.trees.Block} functionBody
     * @constructor
     * @extends {ParseTree}
     */
    FunctionDeclaration: create('name', 'isGenerator',
                                'formalParameterList',
                                'functionBody'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {Array.<ParseTree>} comprehensionForList
     * @param {ParseTree} ifExpression
     * @constructor
     * @extends {ParseTree}
     */
    GeneratorComprehension: create('expression', 'comprehensionForList',
                                   'ifExpression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} propertyName
     * @param {Block} body
     * @constructor
     * @extends {ParseTree}
     */
    GetAccessor: create('propertyName', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} identifierToken
     * @constructor
     * @extends {ParseTree}
     */
    IdentifierExpression: create('identifierToken'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} condition
     * @param {ParseTree} ifClause
     * @param {ParseTree} elseClause
     * @constructor
     * @extends {ParseTree}
     */
    IfStatement: create('condition', 'ifClause', 'elseClause'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} importPathList
     * @constructor
     * @extends {ParseTree}
     */
    ImportDeclaration: create('importPathList'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.ModuleExpression} moduleExpression
     * @param {traceur.syntax.trees.ImportSpecifierSet} importSpecifierSet
     * @constructor
     * @extends {ParseTree}
     */
    ImportBinding: create('moduleExpression', 'importSpecifierSet'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} lhs
     * @param {traceur.syntax.IdentifierToken} rhs
     * @constructor
     * @extends {ParseTree}
     */
    ImportSpecifier: create('lhs', 'rhs'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {trauce.syntax.Token|
     *     traceur.syntax.IdentifierToken|Array.<ImportSpecifier>} specifiers
     * @constructor
     * @extends {ParseTree}
     */
    ImportSpecifierSet: create('specifiers'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {ParseTree} statement
     * @constructor
     * @extends {ParseTree}
     */
    LabelledStatement: create('name', 'statement'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} literalToken
     * @constructor
     * @extends {ParseTree}
     */
    LiteralExpression: create('literalToken'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {traceur.syntax.IdentifierToken} memberName
     * @constructor
     * @extends {ParseTree}
     */
    MemberExpression: create('operand', 'memberName'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {ParseTree} memberExpression
     * @constructor
     * @extends {ParseTree}
     */
    MemberLookupExpression: create('operand', 'memberExpression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} nextToken
     * @constructor
     * @extends {ParseTree}
     */
    MissingPrimaryExpression: create('nextToken'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} specifiers
     * @constructor
     * @extends {ParseTree}
     */
    ModuleDeclaration: create('specifiers'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    ModuleDefinition: create('name', 'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.ParseTree} reference
     * @param {Array.<traceur.syntax.IdentifierToken>} identifiers
     * @constructor
     * @extends {ParseTree}
     */
    ModuleExpression: create('reference', 'identifiers'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} url
     * @constructor
     * @extends {ParseTree}
     */
    ModuleRequire: create('url'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} identifier
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    ModuleSpecifier: create('identifier', 'expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {traceur.syntax.trees.ArgumentList} args
     * @constructor
     * @extends {ParseTree}
     */
    NewExpression: create('operand', 'args'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} propertyNameAndValues
     * @constructor
     * @extends {ParseTree}
     */
    ObjectLiteralExpression: create('propertyNameAndValues'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} identifier
     * @param {?ParseTree} element
     * @constructor
     * @extends {ParseTree}
     */
    ObjectPatternField: create('identifier', 'element'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} fields
     * @constructor
     * @extends {ParseTree}
     */
    ObjectPattern: create('fields'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    ParenExpression: create('expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {traceur.syntax.Token} operator
     * @constructor
     * @extends {ParseTree}
     */
    PostfixExpression: create('operand', 'operator'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Array.<ParseTree>} programElements
     * @constructor
     * @extends {ParseTree}
     */
    Program: create('programElements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} name
     * @param {boolean} isGenerator
     * @param {traceur.syntax.trees.FormalParameterList} formalParameterList
     * @param {traceur.syntax.trees.Block} functionBody
     * @constructor
     * @extends {ParseTree}
     */
    PropertyMethodAssignment: create('name', 'isGenerator', 
                                     'formalParameterList', 'functionBody'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} name
     * @param {ParseTree} value
     * @constructor
     * @extends {ParseTree}
     */
    PropertyNameAssignment: create('name', 'value'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} name
     * @constructor
     * @extends {ParseTree}
     */
    PropertyNameShorthand: create('name'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} operand
     * @param {Array.<ParseTree>} elements
     * @constructor
     * @extends {ParseTree}
     */
    QuasiLiteralExpression: create('operand', 'elements'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {Token} value
     * @constructor
     * @extends {ParseTree}
     */
    QuasiLiteralPortion: create('value'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    QuasiSubstitution: create('expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.IdentifierToken} name
     * @constructor
     * @extends {ParseTree}
     */
    RequiresMember: create('name'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {BindingIdentifier} identifier
     * @constructor
     * @extends {ParseTree}
     */
    RestParameter: create('identifier'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    ReturnStatement: create('expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} propertyName
     * @param {traceur.syntax.IdentifierToken} parameter
     * @param {traceur.syntax.trees.Block} body
     * @constructor
     * @extends {ParseTree}
     */
    SetAccessor: create('propertyName', 'parameter', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @constructor
     * @extends {ParseTree}
     */
    SpreadExpression: create('expression'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} lvalue
     * @constructor
     * @extends {ParseTree}
     */
    SpreadPatternElement: create('lvalue'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    SuperExpression: create(),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {Array.<ParseTree>} caseClauses
     * @constructor
     * @extends {ParseTree}
     */
    SwitchStatement: create('expression', 'caseClauses'),

    /**
     * @param {traceur.util.SourceRange} location
     * @constructor
     * @extends {ParseTree}
     */
    ThisExpression: create(),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} value
     * @constructor
     * @extends {ParseTree}
     */
    ThrowStatement: create('value'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} body
     * @param {ParseTree} catchBlock
     * @param {ParseTree} finallyBlock
     * @constructor
     * @extends {ParseTree}
     */
    TryStatement: create('body', 'catchBlock', 'finallyBlock'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.Token} operator
     * @param {ParseTree} operand
     * @constructor
     * @extends {ParseTree}
     */
    UnaryExpression: create('operator', 'operand'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.TokenType} declarationType
     * @param {Array.<traceur.syntax.trees.VariableDeclaration>}
     *     declarations
     * @constructor
     * @extends {ParseTree}
     */
    VariableDeclarationList: create('declarationType', 'declarations'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} lvalue
     * @param {ParseTree} initializer
     * @constructor
     * @extends {ParseTree}
     */
    VariableDeclaration: create('lvalue', 'initializer'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {traceur.syntax.trees.VariableDeclarationList} declarations
     * @constructor
     * @extends {ParseTree}
     */
    VariableStatement: create('declarations'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} condition
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    WhileStatement: create('condition', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {ParseTree} body
     * @constructor
     * @extends {ParseTree}
     */
    WithStatement: create('expression', 'body'),

    /**
     * @param {traceur.util.SourceRange} location
     * @param {ParseTree} expression
     * @param {boolean} isYieldFor
     * @constructor
     * @extends {ParseTree}
     */
    YieldStatement: create('expression', 'isYieldFor')
  };

  // Given a SomeName, converts it to SOME_NAME.
  function getEnumName(name) {
    return name[0] + name.slice(1).replace(/([A-Z])/g, '_$1').toUpperCase();
  }

  // This sets the ParseTreeType for all the trees in this file.
  Object.keys(parseTrees).forEach(function(name) {
    var enumName = getEnumName(name);
    parseTrees[name].prototype.type = ParseTreeType[enumName] = enumName;
  });

  return parseTrees;
});
