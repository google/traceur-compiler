// Copyright 2014 Traceur Authors.
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

// This file describes the different ParseTree classes. We use this file to
// generate ParseTrees.js at build time.

interface Annotation {
  location: SourceRange;
  name: ParseTree;
  args: ArgumentList;
}

interface AnonBlock {
  location: SourceRange;
  statements: Array<ParseTree>;
}

interface ArgumentList {
  location: SourceRange;
  args: Array<ParseTree>;
}

interface ArrayComprehension {
  location: SourceRange;
  comprehensionList: Array<ParseTree>;
  expression: ParseTree;
}

interface ArrayLiteralExpression {
  location: SourceRange;
  elements: Array<ParseTree>;
}

interface ArrayPattern {
  location: SourceRange;
  elements: Array<ParseTree>;
}

interface ArrayType {
  location: SourceRange;
  elementType: ParseTree;
}

interface ArrowFunctionExpression {
  location: SourceRange;
  functionKind: Token;
  parameterList: FormalParameterList;
  body: ParseTree;
}

interface AssignmentElement {
  location: SourceRange;
  assignment: ParseTree;
  initializer: ParseTree;
}

interface AwaitExpression {
  location: SourceRange;
  expression: ParseTree;
}

interface BinaryExpression {
  location: SourceRange;
  left: ParseTree;
  operator: Token;
  right: ParseTree;
}

interface BindingElement {
  location: SourceRange;
  binding: BindingIdentifier | ObjectPattern | ArrayPattern;
  initializer: ParseTree;
}

interface BindingIdentifier {
  location: SourceRange;
  identifierToken: IdentifierToken;
}

interface Block {
  location: SourceRange;
  statements: Array<ParseTree>;
}

interface BreakStatement {
  location: SourceRange;
  name: IdentifierToken;
}

interface CallExpression {
  location: SourceRange;
  operand: ParseTree;
  args: ArgumentList;
}

interface CallSignature {
  location: SourceRange;
  typeParameters: TypeParameters;
  parameterList: FormalParameterList;
  returnType: ParseTree;
}

interface CaseClause {
  location: SourceRange;
  expression: ParseTree;
  statements: Array<ParseTree>;
}

interface Catch {
  location: SourceRange;
  binding: ParseTree;
  catchBody: ParseTree;
}

interface ClassDeclaration {
  location: SourceRange;
  name: BindingIdentifier;
  superClass: ParseTree;
  elements: Array<ParseTree>;
  annotations: Array<ParseTree>;
}

interface ClassExpression {
  location: SourceRange;
  name: BindingIdentifier;
  superClass: ParseTree;
  elements: Array<ParseTree>;
  annotations: Array<ParseTree>;
}

interface CommaExpression {
  location: SourceRange;
  expressions: Array<ParseTree>;
}

interface ComprehensionFor {
  location: SourceRange;
  left: ParseTree;
  iterator: ParseTree;
}

interface ComprehensionIf {
  location: SourceRange;
  expression: ParseTree;
}

interface ComputedPropertyName {
  location: SourceRange;
  expression: ParseTree;
}

interface ConditionalExpression {
  location: SourceRange;
  condition: ParseTree;
  left: ParseTree;
  right: ParseTree;
}

interface ConstructSignature {
  location: SourceRange;
  typeParameters: TypeParameters;
  parameterList: FormalParameterList;
  returnType: ParseTree;
}

interface ConstructorType {
  location: SourceRange;
  typeParameters: TypeParameters;
  parameterList: FormalParameterList;
  returnType: ParseTree;
}

interface ContinueStatement {
  location: SourceRange;
  name: IdentifierToken;
}

interface CoverFormals {
  location: SourceRange;
  expressions: Array<ParseTree>;
}

interface CoverInitializedName {
  location: SourceRange;
  name: Token;
  equalToken: Token;
  initializer: ParseTree;
}

interface DebuggerStatement {
  location: SourceRange;
}

interface DefaultClause {
  location: SourceRange;
  statements: Array<ParseTree>;
}

interface DoWhileStatement {
  location: SourceRange;
  body: Block | ParseTree;
  condition: ParseTree;
}

interface EmptyStatement {
  location: SourceRange;
}

interface ExportDeclaration {
  location: SourceRange;
  declaration: ParseTree;
  annotations: Array<ParseTree>;
}

interface ExportDefault {
  location: SourceRange;
  expression: ParseTree;
}

interface ExportSpecifier {
  location: SourceRange;
  lhs: IdentifierToken;
  rhs: IdentifierToken;
}

interface ExportSpecifierSet {
  location: SourceRange;
  specifiers: Array<ExportSpecifier>;
}

interface ExportStar {
  location: SourceRange;
}

interface ExpressionStatement {
  location: SourceRange;
  expression: ParseTree;
}

interface Finally {
  location: SourceRange;
  block: Block;
}

interface ForInStatement {
  location: SourceRange;
  initializer: ParseTree;
  collection: ParseTree;
  body: Block | ParseTree;
}

interface ForOfStatement {
  location: SourceRange;
  initializer: ParseTree;
  collection: ParseTree;
  body: Block | ParseTree;
}

interface ForStatement {
  location: SourceRange;
  initializer: ParseTree;
  condition: ParseTree;
  increment: ParseTree;
  body: Block | ParseTree;
}

interface FormalParameter {
  location: SourceRange;
  parameter: BindingElement | RestParameter;
  typeAnnotation: ParseTree;
  annotations: Array<Annotation>;
}

interface FormalParameterList {
  location: SourceRange;
  parameters: Array<FormalParameter>;
}

interface FunctionBody {
  location: SourceRange;
  statements: Array<ParseTree>;
}

// FunctionDeclaration and FunctionExpression needs to have the exact same
// shape.
interface FunctionDeclaration {
  location: SourceRange;
  name: BindingIdentifier;
  functionKind: Token;
  parameterList: FormalParameterList;
  typeAnnotation: ParseTree;
  annotations: Array<ParseTree>;
  body: FunctionBody;
}

interface FunctionExpression {
  location: SourceRange;
  name: BindingIdentifier;
  functionKind: Token;
  parameterList: FormalParameterList;
  typeAnnotation: ParseTree;
  annotations: Array<ParseTree>;
  body: FunctionBody;
}

interface FunctionType {
  location: SourceRange;
  typeParameters: TypeParameters;
  parameterList: FormalParameterList;
  returnType: ParseTree;
}

interface GeneratorComprehension {
  location: SourceRange;
  comprehensionList: Array<ParseTree>;
  expression: ParseTree;
}

interface GetAccessor {
  location: SourceRange;
  isStatic: boolean;
  name: ParseTree;
  typeAnnotation: ParseTree;
  annotations: Array<ParseTree>;
  body: FunctionBody;
}

interface IdentifierExpression {
  location: SourceRange;
  identifierToken: IdentifierToken;
}

interface IfStatement {
  location: SourceRange;
  condition: ParseTree;
  ifClause: Block | ParseTree;
  elseClause: Block | ParseTree;
}

interface ImportedBinding {
  location: SourceRange;
  binding: ParseTree;
}

interface ImportDeclaration {
  location: SourceRange;
  importClause: ParseTree;
  moduleSpecifier: ParseTree;
}

interface ImportSpecifier {
  location: SourceRange;
  binding: ImportedBinding;
  name: IdentifierToken;
}

interface ImportSpecifierSet {
  location: SourceRange;
  specifiers: Array<ImportSpecifier>;
}

interface IndexSignature {
  location: SourceRange;
  name: IdentifierToken;
  indexType: ParseTree;
  typeAnnotation: ParseTree;
}

interface InterfaceDeclaration {
  location: SourceRange;
  name: IdentifierToken;
  typeParameters: TypeParameters;
  extendsClause: Array<ParseTree>;
  objectType: ObjectType;
}

interface LabelledStatement {
  location: SourceRange;
  name: IdentifierToken;
  statement: ParseTree;
}

interface LiteralExpression {
  location: SourceRange;
  literalToken: Token;
}

interface LiteralPropertyName {
  location: SourceRange;
  literalToken: Token;
}

interface MemberExpression {
  location: SourceRange;
  operand: ParseTree;
  memberName: IdentifierToken;
}

interface MemberLookupExpression {
  location: SourceRange;
  operand: ParseTree;
  memberExpression: ParseTree;
}

interface MethodSignature {
  location: SourceRange;
  name: ParseTree;
  optional: boolean;
  callSignature: CallSignature;
}

interface Module {
  location: SourceRange;
  scriptItemList: Array<ParseTree>;
  moduleName: string;
}

interface ModuleDeclaration {
  location: SourceRange;
  binding: ImportedBinding;
  expression: ParseTree;
}

interface ModuleSpecifier {
  location: SourceRange;
  token: Token;
}

interface NamedExport {
  location: SourceRange;
  moduleSpecifier: ParseTree;
  specifierSet: ParseTree;
}

interface NewExpression {
  location: SourceRange;
  operand: ParseTree;
  args: ArgumentList;
}

interface ObjectLiteralExpression {
  location: SourceRange;
  propertyNameAndValues: Array<ParseTree>;
}

interface ObjectPattern {
  location: SourceRange;
  fields: Array<ParseTree>;
}

interface ObjectPatternField {
  location: SourceRange;
  name: ParseTree;
  element: ParseTree;
}

interface ObjectType {
  location: SourceRange;
  typeMembers: Array<ParseTree>;
}

interface ParenExpression {
  location: SourceRange;
  expression: ParseTree;
}

interface PostfixExpression {
  location: SourceRange;
  operand: ParseTree;
  operator: Token;
}

interface PredefinedType {
  location: SourceRange;
  typeToken: Token;
}

interface Script {
  location: SourceRange;
  scriptItemList: Array<ParseTree>;
  moduleName: string;
}

interface PropertyMethodAssignment {
  location: SourceRange;
  isStatic: boolean;
  functionKind: Token;
  name: ParseTree;
  parameterList: FormalParameterList;
  typeAnnotation: ParseTree;
  annotations: Array<ParseTree>;
  body: FunctionBody;
}

interface PropertyNameAssignment {
  location: SourceRange;
  name: ParseTree;
  value: ParseTree;
}

interface PropertyNameShorthand {
  location: SourceRange;
  name: IdentifierToken;
}

interface PropertyVariableDeclaration {
  location: SourceRange;
  isStatic: boolean;
  name: ParseTree;
  typeAnnotation: ParseTree;
  annotations: Array<ParseTree>;
}

interface PropertySignature {
  location: SourceRange;
  name: ParseTree;
  optional: boolean;
  typeAnnotation: ParseTree;
}

interface RestParameter {
  location: SourceRange;
  identifier: BindingIdentifier;
  typeAnnotation: ParseTree;
}

interface ReturnStatement {
  location: SourceRange;
  expression: ParseTree;
}

interface SetAccessor {
  location: SourceRange;
  isStatic: boolean;
  name: ParseTree;
  parameterList: FormalParameterList;
  annotations: Array<ParseTree>;
  body: FunctionBody;
}

interface SpreadExpression {
  location: SourceRange;
  expression: ParseTree;
}

interface SpreadPatternElement {
  location: SourceRange;
  lvalue: ParseTree;
}

interface SuperExpression {
  location: SourceRange;
}

interface SwitchStatement {
  location: SourceRange;
  expression: ParseTree;
  caseClauses: Array<ParseTree>;
}

interface SyntaxErrorTree {
  location: SourceRange;
  nextToken: Token;
  message: string;
}

interface TemplateLiteralExpression {
  location: SourceRange;
  operand: ParseTree;
  elements: Array<ParseTree>;
}

interface TemplateLiteralPortion {
  location: SourceRange;
  value: Token;
}

interface TemplateSubstitution {
  location: SourceRange;
  expression: ParseTree;
}

interface ThisExpression {
  location: SourceRange;
}

interface ThrowStatement {
  location: SourceRange;
  value: ParseTree;
}

interface TryStatement {
  location: SourceRange;
  body: Block;
  catchBlock: Catch;
  finallyBlock: Finally;
}

interface TypeArguments {
  location: SourceRange;
  args: Array<ParseTree>;
}

interface TypeName {
  location: SourceRange;
  moduleName: TypeName;
  name: IdentifierToken;
}

interface TypeParameter {
  location: SourceRange;
  identifierToken: IdentifierToken;
  extendsType: ParseTree;
}

interface TypeParameters {
  location: SourceRange;
  parameters: Array<TypeParameter>;
}

interface TypeReference {
  location: SourceRange;
  typeName: TypeName;
  args: TypeArguments;
}

interface UnaryExpression {
  location: SourceRange;
  operator: Token;
  operand: ParseTree;
}

interface UnionType {
  location: SourceRange;
  types: Array<ParseTree>;
}

interface VariableDeclaration {
  location: SourceRange;
  lvalue: ParseTree;
  typeAnnotation: ParseTree;
  initializer: ParseTree;
}

interface VariableDeclarationList {
  location: SourceRange;
  declarationType: TokenType;
  declarations: Array<VariableDeclaration>;
}

interface VariableStatement {
  location: SourceRange;
  declarations: VariableDeclarationList;
}

interface WhileStatement {
  location: SourceRange;
  condition: ParseTree;
  body: Block | ParseTree;
}

interface WithStatement {
  location: SourceRange;
  expression: ParseTree;
  body: Block | ParseTree;
}

interface YieldExpression {
  location: SourceRange;
  expression: ParseTree;
  isYieldFor: boolean;
}
