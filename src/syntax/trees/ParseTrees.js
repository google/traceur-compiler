// Copyright 2012 Google Inc.
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

import ParseTree from 'ParseTree.js';
module ParseTreeType from 'ParseTreeType.js';
import * from ParseTreeType;

export class ArgumentList extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} args
   */
  constructor(location, args) {
    super(ARGUMENT_LIST, location);
    this.args = args;
  }
}

export class ArrayComprehension extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} expression
   * @param {Array.<ParseTree>} comprehensionForList
   * @param {ParseTree} ifExpression
   */
  constructor(location, expression, comprehensionForList, ifExpression) {
    super(ARRAY_COMPREHENSION, location);
    this.expression = expression;
    this.comprehensionForList = comprehensionForList;
    this.ifExpression = ifExpression;
  }
}

export class ArrayLiteralExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} elements
   */
  constructor(location, elements) {
    super(ARRAY_LITERAL_EXPRESSION, location);
    this.elements = elements;
  }
}

export class ArrayPattern extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} elements
   */
  constructor(location, elements) {
    super(ARRAY_PATTERN, location);
    this.elements = elements;
  }
}

export class ArrowFunctionExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {FormalParameterList} formalParameters
   * @param {TokenType} arrow
   * @param {ParseTree} functionBody
   */
  constructor(location, formalParameters, functionBody) {
    super(ARROW_FUNCTION_EXPRESSION, location);
    this.formalParameters = formalParameters;
    this.functionBody = functionBody;
  }
}

export class AtNameExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {AtNameToken} atNameToken
   */
  constructor(location, atNameToken) {
    super(AT_NAME_EXPRESSION, location);
    this.atNameToken = atNameToken;
  }
}

export class AtNameDeclaration extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {AtNameToken} atNameToken
   * @param {ParseTree} initializer
   */
  constructor(location, atNameToken, initializer) {
    super(AT_NAME_DECLARATION, location);
    this.atNameToken = atNameToken;
    this.initializer = initializer;
  }
}

export class AwaitStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {IdentifierToken} identifier
   * @param {ParseTree} expression
   */
  constructor(location, identifier, expression) {
    super(AWAIT_STATEMENT, location);
    this.identifier = identifier;
    this.expression = expression;
  }
}

export class BinaryOperator extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} left
   * @param {Token} operator
   * @param {ParseTree} right
   */
  constructor(location, left, operator, right) {
    super(BINARY_OPERATOR, location);
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}

export class BindingIdentifier extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {IdentifierToken} identifierToken
   */
  constructor(location, identifierToken) {
    super(BINDING_IDENTIFIER, location);
    this.identifierToken = identifierToken;
  }
}

/**
 * BindingElement is used for formal parameters and destructuring variable
 * declarations. The binding is either a pattern consisting of other binding
 * elements or binding identifiers or a binding identifier.
 *
 * The initializer may be null in the case when there is no default value.
 */
export class BindingElement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {BindingIdentifier|ObjectPattern|ArrayPattern} binding
   * @param {ParseTree} initializer
   */
  constructor(location, binding, initializer) {
    super(BINDING_ELEMENT, location);
    this.binding = binding;
    this.initializer = initializer;
  }
}

export class Block extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} statements
   */
  constructor(location, statements) {
    super(BLOCK, location);
    this.statements = statements;
  }
}

export class BreakStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {traceur.syntax.IdentifierToken} name
   */
  constructor(location, name) {
    super(BREAK_STATEMENT, location);
    this.name = name;
  }
}

export class CallExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} operand
   * @param {ArgumentList} args
   */
  constructor(location, operand, args) {
    super(CALL_EXPRESSION, location);
    this.operand = operand;
    this.args = args;
  }
}

export class CascadeExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} operand
   * @param {Array.<ParseTree>} expressions
   */
  constructor(location, operand, expressions) {
    super(CASCADE_EXPRESSION, location);
    this.operand = operand;
    this.expressions = expressions;
  }
}

export class CaseClause extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} expression
   * @param {Array.<ParseTree>} statements
   */
  constructor(location, expression, statements) {
    super(CASE_CLAUSE, location);
    this.expression = expression;
    this.statements = statements;
  }
}

export class Catch extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} binding
   * @param {ParseTree} catchBody
   */
  constructor(location, binding, catchBody) {
    super(CATCH, location);
    this.binding = binding;
    this.catchBody = catchBody;
  }
}

export class ClassDeclaration extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {traceur.syntax.IdentifierToken} name
   * @param {ParseTree} superClass
   * @param {Array.<ParseTree>} elements
   */
  constructor(location, name, superClass, elements) {
    super(CLASS_DECLARATION, location);
    this.name = name;
    this.superClass = superClass;
    this.elements = elements;
  }
}

export class ClassExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {traceur.syntax.IdentifierToken} name
   * @param {ParseTree} superClass
   * @param {Array.<ParseTree>} elements
   */
  constructor(location, name, superClass, elements) {
    super(CLASS_EXPRESSION, location);
    this.name = name;
    this.superClass = superClass;
    this.elements = elements;
  }
}

export class CommaExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} expressions
   */
  constructor(location, expressions) {
    super(COMMA_EXPRESSION, location);
    this.expressions = expressions;
  }
}

export class ComprehensionFor extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} left
   * @param {ParseTree} iterator
   */
  constructor(location, left, iterator) {
    super(COMPREHENSION_FOR, location);
    this.left = left;
    this.iterator = iterator;
  }
}

export class ConditionalExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} condition
   * @param {ParseTree} left
   * @param {ParseTree} right
   */
  constructor(location, condition, left, right) {
    super(CONDITIONAL_EXPRESSION, location);
    this.condition = condition;
    this.left = left;
    this.right = right;
  }
}

export class ContinueStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {traceur.syntax.IdentifierToken} name
   */
  constructor(location, name) {
    super(CONTINUE_STATEMENT, location);
    this.name = name;
  }
}

export class DebuggerStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   */
  constructor(location) {
    super(DEBUGGER_STATEMENT, location);

  }
}

export class DefaultClause extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} statements
   */
  constructor(location, statements) {
    super(DEFAULT_CLAUSE, location);
    this.statements = statements;
  }
}

export class DoWhileStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} body
   * @param {ParseTree} condition
   */
  constructor(location, body, condition) {
    super(DO_WHILE_STATEMENT, location);
    this.body = body;
    this.condition = condition;
  }
}

export class EmptyStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   */
  constructor(location) {
    super(EMPTY_STATEMENT, location);

  }
}

export class ExportDeclaration extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} declaration
   */
  constructor(location, declaration) {
    super(EXPORT_DECLARATION, location);
    this.declaration = declaration;
  }
}

export class ExportMappingList extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} paths
   */
  constructor(location, paths) {
    super(EXPORT_MAPPING_LIST, location);
    this.paths = paths;
  }
}

export class ExportMapping extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ModuleExpression} moduleExpression
   * @param {ExportSpecifierSet|IdentifierExpression} specifierSet
   */
  constructor(location, moduleExpression, specifierSet) {
    super(EXPORT_MAPPING, location);
    this.moduleExpression = moduleExpression;
    this.specifierSet = specifierSet;
  }
}

export class ExportSpecifier extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Token} lhs
   * @param {Token} rhs
   */
  constructor(location, lhs, rhs) {
    super(EXPORT_SPECIFIER, location);
    this.lhs = lhs;
    this.rhs = rhs;
  }
}

export class ExportSpecifierSet extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} specifiers
   */
  constructor(location, specifiers) {
    super(EXPORT_SPECIFIER_SET, location);
    this.specifiers = specifiers;
  }
}

export class ExportStar extends ParseTree {
  /**
   * @param {SourceRange} location
   */
  constructor(location) {
    super(EXPORT_STAR, location);
  }
}

export class ExpressionStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} expression
   */
  constructor(location, expression) {
    super(EXPRESSION_STATEMENT, location);
    this.expression = expression;
  }
}

export class Finally extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} block
   */
  constructor(location, block) {
    super(FINALLY, location);
    this.block = block;
  }
}

export class ForOfStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {VariableDeclarationList} initializer
   * @param {ParseTree} collection
   * @param {ParseTree} body
   */
  constructor(location, initializer, collection, body) {
    super(FOR_OF_STATEMENT, location);
    this.initializer = initializer;
    this.collection = collection;
    this.body = body;
  }
}

export class ForInStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} initializer
   * @param {ParseTree} collection
   * @param {ParseTree} body
   */
  constructor(location, initializer, collection, body) {
    super(FOR_IN_STATEMENT, location);
    this.initializer = initializer;
    this.collection = collection;
    this.body = body;
  }
}

export class FormalParameterList extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} parameters
   */
  constructor(location, parameters) {
    super(FORMAL_PARAMETER_LIST, location);
    this.parameters = parameters;
  }
}

export class ForStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} initializer
   * @param {ParseTree} condition
   * @param {ParseTree} increment
   * @param {ParseTree} body
   */
  constructor(location, initializer, condition, increment, body) {
    super(FOR_STATEMENT, location);
    this.initializer = initializer;
    this.condition = condition;
    this.increment = increment;
    this.body = body;
  }
}

export class FunctionDeclaration extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {BindingIdentifier} name
   * @param {boolean} isGenerator
   * @param {FormalParameterList} formalParameterList
   * @param {Block} functionBody
   */
  constructor(location, name, isGenerator, formalParameterList, functionBody) {
    super(FUNCTION_DECLARATION, location);
    this.name = name;
    this.isGenerator = isGenerator;
    this.formalParameterList = formalParameterList;
    this.functionBody = functionBody;
  }
}

export class GeneratorComprehension extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} expression
   * @param {Array.<ParseTree>} comprehensionForList
   * @param {ParseTree} ifExpression
   */
  constructor(location, expression, comprehensionForList, ifExpression) {
    super(GENERATOR_COMPREHENSION, location);
    this.expression = expression;
    this.comprehensionForList = comprehensionForList;
    this.ifExpression = ifExpression;
  }
}

export class GetAccessor extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Token} name
   * @param {Block} body
   */
  constructor(location, name, body) {
    super(GET_ACCESSOR, location);
    this.name = name;
    this.body = body;
  }
}

export class IdentifierExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {traceur.syntax.IdentifierToken} identifierToken
   */
  constructor(location, identifierToken) {
    super(IDENTIFIER_EXPRESSION, location);
    this.identifierToken = identifierToken;
  }
}

export class IfStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} condition
   * @param {ParseTree} ifClause
   * @param {ParseTree} elseClause
   */
  constructor(location, condition, ifClause, elseClause) {
    super(IF_STATEMENT, location);
    this.condition = condition;
    this.ifClause = ifClause;
    this.elseClause = elseClause;
  }
}

export class ImportDeclaration extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} importPathList
   */
  constructor(location, importPathList) {
    super(IMPORT_DECLARATION, location);
    this.importPathList = importPathList;
  }
}

export class ImportBinding extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ModuleExpression} moduleExpression
   * @param {ImportSpecifierSet} importSpecifierSet
   */
  constructor(location, moduleExpression, importSpecifierSet) {
    super(IMPORT_BINDING, location);
    this.moduleExpression = moduleExpression;
    this.importSpecifierSet = importSpecifierSet;
  }
}

export class ImportSpecifier extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {traceur.syntax.IdentifierToken} lhs
   * @param {traceur.syntax.IdentifierToken} rhs
   */
  constructor(location, lhs, rhs) {
    super(IMPORT_SPECIFIER, location);
    this.lhs = lhs;
    this.rhs = rhs;
  }
}

export class ImportSpecifierSet extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {trauce.syntax.Token|
   *     traceur.syntax.IdentifierToken|Array.<ImportSpecifier>} specifiers
   */
  constructor(location, specifiers) {
    super(IMPORT_SPECIFIER_SET, location);
    this.specifiers = specifiers;
  }
}

export class LabelledStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {traceur.syntax.IdentifierToken} name
   * @param {ParseTree} statement
   */
  constructor(location, name, statement) {
    super(LABELLED_STATEMENT, location);
    this.name = name;
    this.statement = statement;
  }
}

export class LiteralExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Token} literalToken
   */
  constructor(location, literalToken) {
    super(LITERAL_EXPRESSION, location);
    this.literalToken = literalToken;
  }
}

export class MemberExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} operand
   * @param {traceur.syntax.IdentifierToken} memberName
   */
  constructor(location, operand, memberName) {
    super(MEMBER_EXPRESSION, location);
    this.operand = operand;
    this.memberName = memberName;
  }
}

export class MemberLookupExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} operand
   * @param {ParseTree} memberExpression
   */
  constructor(location, operand, memberExpression) {
    super(MEMBER_LOOKUP_EXPRESSION, location);
    this.operand = operand;
    this.memberExpression = memberExpression;
  }
}

export class MissingPrimaryExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Token} nextToken
   */
  constructor(location, nextToken) {
    super(MISSING_PRIMARY_EXPRESSION, location);
    this.nextToken = nextToken;
  }
}

export class ModuleDeclaration extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} specifiers
   */
  constructor(location, specifiers) {
    super(MODULE_DECLARATION, location);
    this.specifiers = specifiers;
  }
}

export class ModuleDefinition extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {traceur.syntax.IdentifierToken} name
   * @param {Array.<ParseTree>} elements
   */
  constructor(location, name, elements) {
    super(MODULE_DEFINITION, location);
    this.name = name;
    this.elements = elements;
  }
}

export class ModuleExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} reference
   * @param {Array.<traceur.syntax.IdentifierToken>} identifiers
   */
  constructor(location, reference, identifiers) {
    super(MODULE_EXPRESSION, location);
    this.reference = reference;
    this.identifiers = identifiers;
  }
}

export class ModuleRequire extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Token} url
   */
  constructor(location, url) {
    super(MODULE_REQUIRE, location);
    this.url = url;
  }
}

export class ModuleSpecifier extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {traceur.syntax.IdentifierToken} identifier
   * @param {ParseTree} expression
   */
  constructor(location, identifier, expression) {
    super(MODULE_SPECIFIER, location);
    this.identifier = identifier;
    this.expression = expression;
  }
}

export class NameStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<AtNameDeclaration>} declarations
   */
  constructor(location, declarations) {
    super(NAME_STATEMENT, location);
    this.declarations = declarations;
  }
}

export class NewExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} operand
   * @param {ArgumentList} args
   */
  constructor(location, operand, args) {
    super(NEW_EXPRESSION, location);
    this.operand = operand;
    this.args = args;
  }
}

export class NullTree extends ParseTree {
  constructor() {
    super(NULL_TREE, null);
  }
}

export class ObjectLiteralExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} propertyNameAndValues
   */
  constructor(location, propertyNameAndValues) {
    super(OBJECT_LITERAL_EXPRESSION, location);
    this.propertyNameAndValues = propertyNameAndValues;
  }
}

export class ObjectPatternField extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {traceur.syntax.IdentifierToken} identifier
   * @param {?ParseTree} element
   */
  constructor(location, identifier, element) {
    super(OBJECT_PATTERN_FIELD, location);
    this.identifier = identifier;
    this.element = element;
  }
}

export class ObjectPattern extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} fields
   */
  constructor(location, fields) {
    super(OBJECT_PATTERN, location);
    this.fields = fields;
  }
}

export class ParenExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} expression
   */
  constructor(location, expression) {
    super(PAREN_EXPRESSION, location);
    this.expression = expression;
  }
}

export class PostfixExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} operand
   * @param {Token} operator
   */
  constructor(location, operand, operator) {
    super(POSTFIX_EXPRESSION, location);
    this.operand = operand;
    this.operator = operator;
  }
}

export class Program extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Array.<ParseTree>} programElements
   */
  constructor(location, programElements) {
    super(PROGRAM, location);
    this.programElements = programElements;
  }
}

export class PropertyMethodAssignment extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Token} name
   * @param {boolean} isGenerator
   * @param {FormalParameterList} formalParameterList
   * @param {Block} functionBody
   */
  constructor(location, name, isGenerator, formalParameterList, functionBody) {
    super(PROPERTY_METHOD_ASSIGNMENT, location);
    this.name = name;
    this.isGenerator = isGenerator;
    this.formalParameterList = formalParameterList;
    this.functionBody = functionBody;
  }
}

export class PropertyNameAssignment extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Token} name
   * @param {ParseTree} value
   */
  constructor(location, name, value) {
    super(PROPERTY_NAME_ASSIGNMENT, location);
    this.name = name;
    this.value = value;
  }
}

export class PropertyNameShorthand extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Token} name
   */
  constructor(location, name) {
    super(PROPERTY_NAME_SHORTHAND, location);
    this.name = name;
  }
}

export class QuasiLiteralExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} operand
   * @param {Array.<ParseTree>} elements
   */
  constructor(location, operand, elements) {
    super(QUASI_LITERAL_EXPRESSION, location);
    this.operand = operand;
    this.elements = elements;
  }
}

export class QuasiLiteralPortion extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Token} value
   */
  constructor(location, value) {
    super(QUASI_LITERAL_PORTION, location);
    this.value = value;
  }
}

export class QuasiSubstitution extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} expression
   */
  constructor(location, expression) {
    super(QUASI_SUBSTITUTION, location);
    this.expression = expression;
  }
}

export class RestParameter extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {BindingIdentifier} identifier
   */
  constructor(location, identifier) {
    super(REST_PARAMETER, location);
    this.identifier = identifier;
  }
}

export class ReturnStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} expression
   */
  constructor(location, expression) {
    super(RETURN_STATEMENT, location);
    this.expression = expression;
  }
}

export class SetAccessor extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Token} name
   * @param {traceur.syntax.IdentifierToken} parameter
   * @param {Block} body
   */
  constructor(location, name, parameter, body) {
    super(SET_ACCESSOR, location);
    this.name = name;
    this.parameter = parameter;
    this.body = body;
  }
}

export class SpreadExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} expression
   */
  constructor(location, expression) {
    super(SPREAD_EXPRESSION, location);
    this.expression = expression;
  }
}

export class SpreadPatternElement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} lvalue
   */
  constructor(location, lvalue) {
    super(SPREAD_PATTERN_ELEMENT, location);
    this.lvalue = lvalue;
  }
}

export class SuperExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   */
  constructor(location) {
    super(SUPER_EXPRESSION, location);

  }
}

export class SwitchStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} expression
   * @param {Array.<ParseTree>} caseClauses
   */
  constructor(location, expression, caseClauses) {
    super(SWITCH_STATEMENT, location);
    this.expression = expression;
    this.caseClauses = caseClauses;
  }
}

export class ThisExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   */
  constructor(location) {
    super(THIS_EXPRESSION, location);

  }
}

export class ThrowStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} value
   */
  constructor(location, value) {
    super(THROW_STATEMENT, location);
    this.value = value;
  }
}

export class TryStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} body
   * @param {ParseTree} catchBlock
   * @param {ParseTree} finallyBlock
   */
  constructor(location, body, catchBlock, finallyBlock) {
    super(TRY_STATEMENT, location);
    this.body = body;
    this.catchBlock = catchBlock;
    this.finallyBlock = finallyBlock;
  }
}

export class UnaryExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {Token} operator
   * @param {ParseTree} operand
   */
  constructor(location, operator, operand) {
    super(UNARY_EXPRESSION, location);
    this.operator = operator;
    this.operand = operand;
  }
}

export class VariableDeclarationList extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {TokenType} declarationType
   * @param {Array.<VariableDeclaration>}
   *     declarations
   */
  constructor(location, declarationType, declarations) {
    super(VARIABLE_DECLARATION_LIST, location);
    this.declarationType = declarationType;
    this.declarations = declarations;
  }
}

export class VariableDeclaration extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} lvalue
   * @param {ParseTree} initializer
   */
  constructor(location, lvalue, initializer) {
    super(VARIABLE_DECLARATION, location);
    this.lvalue = lvalue;
    this.initializer = initializer;
  }
}

export class VariableStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {VariableDeclarationList} declarations
   */
  constructor(location, declarations) {
    super(VARIABLE_STATEMENT, location);
    this.declarations = declarations;
  }
}

export class WhileStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} condition
   * @param {ParseTree} body
   */
  constructor(location, condition, body) {
    super(WHILE_STATEMENT, location);
    this.condition = condition;
    this.body = body;
  }
}

export class WithStatement extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} expression
   * @param {ParseTree} body
   */
  constructor(location, expression, body) {
    super(WITH_STATEMENT, location);
    this.expression = expression;
    this.body = body;
  }
}

export class YieldExpression extends ParseTree {
  /**
   * @param {SourceRange} location
   * @param {ParseTree} expression
   * @param {boolean} isYieldFor
   */
  constructor(location, expression, isYieldFor) {
    super(YIELD_EXPRESSION, location);
    this.expression = expression;
    this.isYieldFor = isYieldFor;
  }
}
