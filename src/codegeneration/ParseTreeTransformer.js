// Copyright 2012 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * from '../syntax/trees/ParseTrees.js';

/**
 * A base class for transforming parse trees.
 *
 * The ParseTreeTransformer walks every node and gives derived classes the opportunity
 * (but not the obligation) to transform every node in a tree. By default the ParseTreeTransformer
 * performs the identity transform.
 */
export class ParseTreeTransformer {

  /**
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  transformAny(tree) {
    return tree && tree.transform(this);
  }

  /**
   * @param {Array.<ParseTree>} list
   * @return {Array.<ParseTree>}
   */
  transformList(list) {
    if (list == null || list.length == 0) {
      return list;
    }

    var builder = null;

    for (var index = 0; index < list.length; index++) {
      var element = list[index];
      var transformed = this.transformAny(element);

      if (builder != null || element != transformed) {
        if (builder == null) {
          builder = list.slice(0, index);
        }
        builder.push(transformed);
      }
    }

    return builder || list;
  }

  /**
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  toSourceElement(tree) {
    return tree.isSourceElement() ?
        tree : new ExpressionStatement(tree.location, tree);
  }

  /**
   * @param {Array.<ParseTree>} list
   * @return {Array.<ParseTree>}
   */
  transformSourceElements(list) {
    if (list == null || list.length == 0) {
      return list;
    }

    var builder = null;

    for (var index = 0; index < list.length; index++) {
      var element = list[index];
      var transformed = this.toSourceElement(this.transformAny(element));

      if (builder != null || element != transformed) {
        if (builder == null) {
          builder = list.slice(0, index);
        }
        builder.push(transformed);
      }
    }

    return builder || list;
  }

  /**
   * @param {ArgumentList} tree
   * @return {ParseTree}
   */
  transformArgumentList(tree) {
    var args = this.transformList(tree.args);
    if (args == tree.args) {
      return tree;
    }
    return new ArgumentList(tree.location, args);
  }

  /**
   * @param {ArrayComprehension} tree
   * @return {ParseTree}
   */
  transformArrayComprehension(tree) {
    var comprehensionList = this.transformList(tree.comprehensionList);
    var expression = this.transformAny(tree.expression);
    if (comprehensionList === tree.comprehensionList &&
        expression === tree.expression) {
      return tree;
    }
    return new ArrayComprehension(tree.location,
                                  comprehensionList,
                                  expression);
  }

  /**
   * @param {ArrayLiteralExpression} tree
   * @return {ParseTree}
   */
  transformArrayLiteralExpression(tree) {
    var elements = this.transformList(tree.elements);
    if (elements == tree.elements) {
      return tree;
    }
    return new ArrayLiteralExpression(tree.location, elements);
  }

  /**
   * @param {ArrayPattern} tree
   * @return {ParseTree}
   */
  transformArrayPattern(tree) {
    var elements = this.transformList(tree.elements);
    if (elements == tree.elements) {
      return tree;
    }
    return new ArrayPattern(tree.location, elements);
  }

 /**
   * @param {ArrowFunctionExpression} tree
   * @return {ParseTree}
   */
  transformArrowFunctionExpression(tree) {
    var parameters = this.transformAny(tree.formalParameters);
    var body = this.transformAny(tree.functionBody);
    if (parameters == tree.formalParameters && body == tree.functionBody) {
      return tree;
    }
    return new ArrowFunctionExpression(null, parameters, body);
  }

  /**
   * @param {AtNameExpression} tree
   * @return {ParseTree}
   */
  transformAtNameExpression(tree) {
    return tree;
  }

  /**
   * @param {AtNameDeclaration} tree
   * @return {ParseTree}
   */
  transformAtNameDeclaration(tree) {
    var initializer = this.transformAny(tree.initializer);
    if (initializer === tree.initializer)
      return tree;
    return new AtNameDeclaration(tree.location, tree.atNameToken,
                                 initializer);
  }

  /**
   * @param {AwaitStatement} tree
   * @return {ParseTree}
   */
  transformAwaitStatement(tree) {
    var expression = this.transformAny(tree.expression);
    if (tree.expression == expression) {
      return tree;
    }
    return new AwaitStatement(tree.location, tree.identifier, expression);
  }

  /**
   * @param {BinaryOperator} tree
   * @return {ParseTree}
   */
  transformBinaryOperator(tree) {
    var left = this.transformAny(tree.left);
    var right = this.transformAny(tree.right);
    if (left == tree.left && right == tree.right) {
      return tree;
    }
    return new BinaryOperator(tree.location, left, tree.operator, right);
  }

  /**
   * @param {BindingElement} tree
   * @return {ParseTree}
   */
  transformBindingElement(tree) {
    var binding = this.transformAny(tree.binding);
    var initializer = this.transformAny(tree.initializer);
    if (binding === tree.binding && initializer === tree.initializer)
      return tree;
    return new BindingElement(tree.location, binding, initializer);
  }

  /**
   * @param {BindingIdentifier} tree
   * @return {ParseTree}
   */
  transformBindingIdentifier(tree) {
    return tree;
  }

  /**
   * @param {Block} tree
   * @return {ParseTree}
   */
  transformBlock(tree) {
    var elements = this.transformList(tree.statements);
    if (elements == tree.statements) {
      return tree;
    }
    return new Block(tree.location, elements);
  }

  /**
   * @param {BreakStatement} tree
   * @return {ParseTree}
   */
  transformBreakStatement(tree) {
    return tree;
  }

  /**
   * @param {CallExpression} tree
   * @return {ParseTree}
   */
  transformCallExpression(tree) {
    var operand = this.transformAny(tree.operand);
    var args = this.transformAny(tree.args);
    if (operand == tree.operand && args == tree.args) {
      return tree;
    }
    return new CallExpression(tree.location, operand, args);
  }

  /**
   * @param {CaseClause} tree
   * @return {ParseTree}
   */
  transformCaseClause(tree) {
    var expression = this.transformAny(tree.expression);
    var statements = this.transformList(tree.statements);
    if (expression == tree.expression && statements == tree.statements) {
      return tree;
    }
    return new CaseClause(tree.location, expression, statements);
  }

  /**
   * @param {Catch} tree
   * @return {ParseTree}
   */
  transformCatch(tree) {
    var catchBody = this.transformAny(tree.catchBody);
    var binding = this.transformAny(tree.binding);
    if (catchBody == tree.catchBody && binding == tree.binding) {
      return tree;
    }
    return new Catch(tree.location, binding, catchBody);
  }

  /**
   * @param {CascadeExpression} tree
   * @return {ParseTree}
   */
  transformCascadeExpression(tree) {
    var operand = this.transformAny(tree.operand);
    var expressions = this.transformList(tree.expressions);
    if (operand == tree.operand && expressions == tree.expressions) {
      return tree;
    }
    return new CascadeExpression(tree.location, operand, expressions);
  }

  /**
   * @param {ClassDeclaration} tree
   * @return {ParseTree}
   */
  transformClassDeclaration(tree) {
    var superClass = this.transformAny(tree.superClass);
    var elements = this.transformList(tree.elements);
    if (superClass == tree.superClass && elements == tree.elements)
      return tree;
    return new ClassDeclaration(tree.location, tree.name, superClass,
                                elements);
  }

  /**
   * @param {ClassExpression} tree
   * @return {ParseTree}
   */
  transformClassExpression(tree) {
    var superClass = this.transformAny(tree.superClass);
    var elements = this.transformList(tree.elements);
    if (superClass == tree.superClass && elements == tree.elements)
      return tree;
    return new ClassExpression(tree.location, tree.name, superClass,
                               elements);
  }

  /**
   * @param {CommaExpression} tree
   * @return {ParseTree}
   */
  transformCommaExpression(tree) {
    var expressions = this.transformList(tree.expressions);
    if (expressions == tree.expressions) {
      return tree;
    }
    return new CommaExpression(tree.location, expressions);
  }

  /**
   * @param {ComprehensionFor} tree
   * @return {ParseTree}
   */
  transformComprehensionFor(tree) {
    var left = this.transformAny(tree.left);
    var iterator = this.transformAny(tree.iterator);
    if (left === tree.left && iterator === tree.iterator)
      return tree;
    return new ComprehensionFor(tree.location, left, iterator);
  }

  /**
   * @param {ComprehensionIf} tree
   * @return {ParseTree}
   */
  transformComprehensionIf(tree) {
    var expression = this.transformAny(tree.expression);
    if (expression === tree.expression)
      return tree;
    return new ComprehensionIf(tree.location, expression);
  }


  /**
   * @param {ConditionalExpression} tree
   * @return {ParseTree}
   */
  transformConditionalExpression(tree) {
    var condition = this.transformAny(tree.condition);
    var left = this.transformAny(tree.left);
    var right = this.transformAny(tree.right);
    if (condition == tree.condition && left == tree.left && right == tree.right) {
      return tree;
    }
    return new ConditionalExpression(tree.location, condition, left, right);
  }

  /**
   * @param {ContinueStatement} tree
   * @return {ParseTree}
   */
  transformContinueStatement(tree) {
    return tree;
  }

  /**
   * @param {DebuggerStatement} tree
   * @return {ParseTree}
   */
  transformDebuggerStatement(tree) {
    return tree;
  }

  /**
   * @param {DefaultClause} tree
   * @return {ParseTree}
   */
  transformDefaultClause(tree) {
    var statements = this.transformList(tree.statements);
    if (statements == tree.statements) {
      return tree;
    }
    return new DefaultClause(tree.location, statements);
  }

  /**
   * @param {DoWhileStatement} tree
   * @return {ParseTree}
   */
  transformDoWhileStatement(tree) {
    var body = this.transformAny(tree.body);
    var condition = this.transformAny(tree.condition);
    if (body == tree.body && condition == tree.condition) {
      return tree;
    }
    return new DoWhileStatement(tree.location, body, condition);
  }

  /**
   * @param {EmptyStatement} tree
   * @return {ParseTree}
   */
  transformEmptyStatement(tree) {
    return tree;
  }

  /**
   * @param {ExportDeclaration} tree
   * @return {ParseTree}
   */
  transformExportDeclaration(tree) {
    var declaration = this.transformAny(tree.declaration);
    if (tree.declaration == declaration) {
      return tree;
    }
    return new ExportDeclaration(tree.location, declaration);
  }

  /**
   * @param {ExportMappingList} tree
   * @return {ParseTree}
   */
  transformExportMappingList(tree) {
    var paths = this.transformList(tree.paths);
    if (paths == tree.paths) {
      return tree;
    }

    return new ExportMappingList(tree.location, paths);
  }

  /**
   * @param {ExportMapping} tree
   * @return {ParseTree}
   */
  transformExportMapping(tree) {
    var moduleExpression = this.transformAny(tree.moduleExpression);
    var specifierSet = this.transformAny(tree.specifierSet);
    if (moduleExpression == tree.moduleExpression &&
        specifierSet == tree.specifierSet) {
      return tree;
    }
    return new ExportMapping(tree.location, moduleExpression, specifierSet);
  }

  /**
   * @param {ExportSpecifier} tree
   * @return {ParseTree}
   */
  transformExportSpecifier(tree) {
    return tree;
  }

  /**
   * @param {ExportSpecifierSet} tree
   * @return {ParseTree}
   */
  transformExportSpecifierSet(tree) {
    var specifiers = this.transformList(tree.specifiers);
    if (specifiers == tree.specifiers) {
      return tree;
    }

    return new ExportSpecifierSet(tree.location, specifiers);
  }

  /**
   * @param {ExportStar} tree
   * @return {ParseTree}
   */
  transformExportStar(tree) {
    return tree;
  }

  /**
   * @param {ExpressionStatement} tree
   * @return {ParseTree}
   */
  transformExpressionStatement(tree) {
    var expression = this.transformAny(tree.expression);
    if (expression == tree.expression) {
      return tree;
    }
    return new ExpressionStatement(tree.location, expression);
  }

  /**
   * @param {Finally} tree
   * @return {ParseTree}
   */
  transformFinally(tree) {
    var block = this.transformAny(tree.block);
    if (block == tree.block) {
      return tree;
    }
    return new Finally(tree.location, block);
  }

  /**
   * @param {ForOfStatement} tree
   * @return {ParseTree}
   */
  transformForOfStatement(tree) {
    var initializer = this.transformAny(tree.initializer);
    var collection = this.transformAny(tree.collection);
    var body = this.transformAny(tree.body);
    if (initializer == tree.initializer && collection == tree.collection &&
        body == tree.body) {
      return tree;
    }
    return new ForOfStatement(tree.location, initializer, collection, body);
  }

  /**
   * @param {ForInStatement} tree
   * @return {ParseTree}
   */
  transformForInStatement(tree) {
    var initializer = this.transformAny(tree.initializer);
    var collection = this.transformAny(tree.collection);
    var body = this.transformAny(tree.body);
    if (initializer == tree.initializer && collection == tree.collection &&
        body == tree.body) {
      return tree;
    }
    return new ForInStatement(tree.location, initializer, collection, body);
  }

  /**
   * @param {ForStatement} tree
   * @return {ParseTree}
   */
  transformForStatement(tree) {
    var initializer = this.transformAny(tree.initializer);
    var condition = this.transformAny(tree.condition);
    var increment = this.transformAny(tree.increment);
    var body = this.transformAny(tree.body);
    if (initializer == tree.initializer && condition == tree.condition &&
        increment == tree.increment && body == tree.body) {
      return tree;
    }
    return new ForStatement(tree.location, initializer, condition, increment,
                            body);
  }

  /**
   * @param {FormalParameterList} tree
   * @return {ParseTree}
   */
  transformFormalParameterList(tree) {
    var parameters = this.transformList(tree.parameters);
    if (parameters == tree.parameters)
      return tree;
    return new FormalParameterList(tree.location, parameters);
  }

  /**
   * @param {FunctionDeclaration|FunctionExpression} tree
   * @return {ParseTree}
   */
  transformFunction(tree) {
    var name = this.transformAny(tree.name);
    var formalParameterList =
        this.transformAny(tree.formalParameterList);
    var functionBody = this.transformFunctionBody(tree.functionBody);
    if (name === tree.name &&
        formalParameterList === tree.formalParameterList &&
        functionBody === tree.functionBody) {
      return tree;
    }

    return new tree.constructor(tree.location, name, tree.isGenerator,
                                formalParameterList, functionBody);
  }

  /**
   * @param {FunctionDeclaration} tree
   * @return {ParseTree}
   */
  transformFunctionDeclaration(tree) {
    return this.transformFunction(tree);
  }

  /**
   * @param {FunctionExpression} tree
   * @return {ParseTree}
   */
  transformFunctionExpression(tree) {
    return this.transformFunction(tree);
  }

  /**
   * Even though function bodies are just Block trees the transformer calls
   * transformFunctionBody when transforming functions bodies.
   * @param  {Body} tree
   * @return {ParseTree}
   */
  transformFunctionBody(tree) {
    return this.transformAny(tree);
  }

  /**
   * @param {GeneratorComprehension} tree
   * @return {ParseTree}
   */
  transformGeneratorComprehension(tree) {
    var comprehensionList = this.transformList(tree.comprehensionList);
    var expression = this.transformAny(tree.expression);
    if (comprehensionList === tree.comprehensionList &&
        expression === tree.expression) {
      return tree;
    }
    return new GeneratorComprehension(tree.location,
                                      comprehensionList,
                                      expression);
  }

  /**
   * @param {GetAccessor} tree
   * @return {ParseTree}
   */
  transformGetAccessor(tree) {
    var body = this.transformFunctionBody(tree.body);
    if (body == tree.body)
      return tree;
    return new GetAccessor(tree.location, tree.isStatic, tree.name, body);
  }

  /**
   * @param {IdentifierExpression} tree
   * @return {ParseTree}
   */
  transformIdentifierExpression(tree) {
    return tree;
  }

  /**
   * @param {IfStatement} tree
   * @return {ParseTree}
   */
  transformIfStatement(tree) {
    var condition = this.transformAny(tree.condition);
    var ifClause = this.transformAny(tree.ifClause);
    var elseClause = this.transformAny(tree.elseClause);
    if (condition == tree.condition && ifClause == tree.ifClause && elseClause == tree.elseClause) {
      return tree;
    }
    return new IfStatement(tree.location, condition, ifClause, elseClause);
  }

  /**
   * @param {ImportDeclaration} tree
   * @return {ParseTree}
   */
  transformImportDeclaration(tree) {
    var importPathList = this.transformList(tree.importPathList);
    if (importPathList == tree.importPathList) {
      return tree;
    }
    return new ImportDeclaration(tree.location, importPathList);
  }

  /**
   * @param {ImportBinding} tree
   * @return {ParseTree}
   */
  transformImportBinding(tree) {
    var moduleExpression = this.transformAny(tree.moduleExpression);
    var importSpecifierSet = this.transformList(tree.importSpecifierSet);
    if (moduleExpression == tree.moduleExpression &&
        importSpecifierSet == tree.importSpecifierSet) {
      return tree;
    }
    return new ImportBinding(tree.location, moduleExpression, importSpecifierSet);
  }

  /**
   * @param {ImportSpecifier} tree
   * @return {ParseTree}
   */
  transformImportSpecifier(tree) {
    return tree;
  }

  /**
   * @param {LabelledStatement} tree
   * @return {ParseTree}
   */
  transformLabelledStatement(tree) {
    var statement = this.transformAny(tree.statement);
    if (statement == tree.statement) {
      return tree;
    }
    return new LabelledStatement(tree.location, tree.name, statement);
  }

  /**
   * @param {LiteralExpression} tree
   * @return {ParseTree}
   */
  transformLiteralExpression(tree) {
    return tree;
  }

  /**
   * @param {MemberExpression} tree
   * @return {ParseTree}
   */
  transformMemberExpression(tree) {
    var operand = this.transformAny(tree.operand);
    if (operand == tree.operand) {
      return tree;
    }
    return new MemberExpression(tree.location, operand, tree.memberName);
  }

  /**
   * @param {MemberLookupExpression} tree
   * @return {ParseTree}
   */
  transformMemberLookupExpression(tree) {
    var operand = this.transformAny(tree.operand);
    var memberExpression = this.transformAny(tree.memberExpression);
    if (operand == tree.operand &&
        memberExpression == tree.memberExpression) {
      return tree;
    }
    return new MemberLookupExpression(tree.location, operand,
                                      memberExpression);
  }

  /**
   * @param {MissingPrimaryExpression} tree
   * @return {ParseTree}
   */
  transformMissingPrimaryExpression(tree) {
    throw new Error('Should never transform trees that had errors during parse');
  }

  /**
   * @param {ModuleDeclaration} tree
   * @return {ParseTree}
   */
  transformModuleDeclaration(tree) {
    var specifiers = this.transformList(tree.specifiers);
    if (specifiers == tree.specifiers) {
      return tree;
    }

    return new ModuleDeclaration(tree.location, specifiers);
  }

  /**
   * @param {ModuleDefinition} tree
   * @return {ParseTree}
   */
  transformModuleDefinition(tree) {
    var elements = this.transformList(tree.elements);
    if (elements == tree.elements) {
      return tree;
    }

    return new ModuleDefinition(tree.location, tree.name, elements);
  }

  /**
   * @param {ModuleExpression} tree
   * @return {ParseTree}
   */
  transformModuleExpression(tree) {
    var reference = this.transformAny(tree.reference);
    if (reference == tree.reference) {
      return tree;
    }
    return new ModuleExpression(tree.location, reference, tree.identifiers);
  }

  /**
   * @param {ModuleRequire} tree
   * @return {ParseTree}
   */
  transformModuleRequire(tree) {
    return tree;
  }

  /**
   * @param {ModuleSpecifier} tree
   * @return {ParseTree}
   */
  transformModuleSpecifier(tree) {
    var expression = this.transformAny(tree.expression);
    if (expression == tree.expression) {
      return tree;
    }
    return new ModuleSpecifier(tree.location, tree.identifier, expression);
  }

  /**
   * @param {NameStatement} tree
   * @return {ParseTree}
   */
  transformNameStatement(tree) {
    var declarations = this.transformList(tree.declarations);
    if (declarations === tree.declarations)
      return tree;
    return new NameStatement(tree.location, declarations);
  }

  /**
   * @param {NewExpression} tree
   * @return {ParseTree}
   */
  transformNewExpression(tree) {
    var operand = this.transformAny(tree.operand);
    var args = this.transformAny(tree.args);

    if (operand == tree.operand && args == tree.args) {
      return tree;
    }
    return new NewExpression(tree.location, operand, args);
  }

  /**
   * @param {ObjectLiteralExpression} tree
   * @return {ParseTree}
   */
  transformObjectLiteralExpression(tree) {
    var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
    if (propertyNameAndValues == tree.propertyNameAndValues) {
      return tree;
    }
    return new ObjectLiteralExpression(tree.location, propertyNameAndValues);
  }

  /**
   * @param {ObjectPattern} tree
   * @return {ParseTree}
   */
  transformObjectPattern(tree) {
    var fields = this.transformList(tree.fields);
    if (fields == tree.fields) {
      return tree;
    }
    return new ObjectPattern(tree.location, fields);
  }

  /**
   * @param {ObjectPatternField} tree
   * @return {ParseTree}
   */
  transformObjectPatternField(tree) {
    var element = this.transformAny(tree.element);
    if (element == tree.element) {
      return tree;
    }
    return new ObjectPatternField(tree.location, tree.identifier, element);
  }

  /**
   * @param {ParenExpression} tree
   * @return {ParseTree}
   */
  transformParenExpression(tree) {
    var expression = this.transformAny(tree.expression);
    if (expression == tree.expression) {
      return tree;
    }
    return new ParenExpression(tree.location, expression);
  }

  /**
   * @param {PostfixExpression} tree
   * @return {ParseTree}
   */
  transformPostfixExpression(tree) {
    var operand = this.transformAny(tree.operand);
    if (operand == tree.operand) {
      return tree;
    }
    return new PostfixExpression(tree.location, operand, tree.operator);
  }

  /**
   * @param {PredefinedType} tree
   * @return {ParseTree}
   */
  transformPredefinedType(tree) {
    return tree;
  }

  /**
   * @param {Program} tree
   * @return {ParseTree}
   */
  transformProgram(tree) {
    var elements = this.transformList(tree.programElements);
    if (elements == tree.programElements) {
      return tree;
    }
    return new Program(tree.location, elements);
  }

  /**
   * @param {PropertyMethodAssignment} tree
   * @return {ParseTree}
   */
  transformPropertyMethodAssignment(tree) {
    var parameters = this.transformAny(tree.formalParameterList);
    var functionBody = this.transformFunctionBody(tree.functionBody);
    if (parameters == tree.formalParameterList &&
        functionBody == tree.functionBody) {
      return tree;
    }
    return new PropertyMethodAssignment(tree.location, tree.isStatic,
                                        tree.isGenerator, tree.name,
                                        parameters, functionBody);
  }

  /**
   * @param {PropertyNameAssignment} tree
   * @return {ParseTree}
   */
  transformPropertyNameAssignment(tree) {
    var value = this.transformAny(tree.value);
    if (value == tree.value) {
      return tree;
    }
    return new PropertyNameAssignment(tree.location, tree.name, value);
  }

  /**
   * @param {PropertyNameShorthand} tree
   * @return {ParseTree}
   */
  transformPropertyNameShorthand(tree) {
    return tree;
  }

  /**
   * @param {TemplateLiteralExpression} tree
   * @return {ParseTree}
   */
  transformTemplateLiteralExpression(tree) {
    var operand = this.transformAny(tree.operand);
    var elements = this.transformList(tree.elements);
    if (operand === tree.operand && elements == tree.elements)
      return tree;
    return new TemplateLiteralExpression(tree.location, operand, elements);
  }

  /**
   * @param {TemplateLiteralPortion} tree
   * @return {ParseTree}
   */
  transformTemplateLiteralPortion(tree) {
    return tree;
  }

  /**
   * @param {TemplateSubstitution} tree
   * @return {ParseTree}
   */
  transformTemplateSubstitution(tree) {
    var expression = this.transformAny(tree.expression);
    if (expression == tree.expression) {
      return tree;
    }
    return new TemplateSubstitution(tree.location, expression);
  }

  /**
   * @param {RestParameter} tree
   * @return {ParseTree}
   */
  transformRestParameter(tree) {
    return tree;
  }

  /**
   * @param {ReturnStatement} tree
   * @return {ParseTree}
   */
  transformReturnStatement(tree) {
    var expression = this.transformAny(tree.expression);
    if (expression == tree.expression) {
      return tree;
    }
    return new ReturnStatement(tree.location, expression);
  }

  /**
   * @param {SetAccessor} tree
   * @return {ParseTree}
   */
  transformSetAccessor(tree) {
    var parameter = this.transformAny(tree.parameter);
    var body = this.transformFunctionBody(tree.body);
    if (parameter === tree.parameter && body === tree.body)
      return tree;
    return new SetAccessor(tree.location, tree.isStatic, tree.name, parameter,
                           body);
  }

  /**
   * @param {SpreadExpression} tree
   * @return {ParseTree}
   */
  transformSpreadExpression(tree) {
    var expression = this.transformAny(tree.expression);
    if (expression == tree.expression) {
      return tree;
    }
    return new SpreadExpression(tree.location, expression);
  }

  /**
   * @param {SpreadPatternElement} tree
   * @return {ParseTree}
   */
  transformSpreadPatternElement(tree) {
    var lvalue = this.transformAny(tree.lvalue);
    if (lvalue == tree.lvalue) {
      return tree;
    }
    return new SpreadPatternElement(tree.location, lvalue);
  }

  /**
   * @param {StateMachine} tree
   * @return {ParseTree}
   */
  transformStateMachine(tree) {
    throw new Error();
  }

  /**
   * @param {SuperExpression} tree
   * @return {ParseTree}
   */
  transformSuperExpression(tree) {
    return tree;
  }

  /**
   * @param {SwitchStatement} tree
   * @return {ParseTree}
   */
  transformSwitchStatement(tree) {
    var expression = this.transformAny(tree.expression);
    var caseClauses = this.transformList(tree.caseClauses);
    if (expression == tree.expression && caseClauses == tree.caseClauses) {
      return tree;
    }
    return new SwitchStatement(tree.location, expression, caseClauses);
  }

  /**
   * @param {ThisExpression} tree
   * @return {ParseTree}
   */
  transformThisExpression(tree) {
    return tree;
  }

  /**
   * @param {ThrowStatement} tree
   * @return {ParseTree}
   */
  transformThrowStatement(tree) {
    var value = this.transformAny(tree.value);
    if (value == tree.value) {
      return tree;
    }
    return new ThrowStatement(tree.location, value);
  }

  /**
   * @param {TryStatement} tree
   * @return {ParseTree}
   */
  transformTryStatement(tree) {
    var body = this.transformAny(tree.body);
    var catchBlock = this.transformAny(tree.catchBlock);
    var finallyBlock = this.transformAny(tree.finallyBlock);
    if (body == tree.body && catchBlock == tree.catchBlock &&
        finallyBlock == tree.finallyBlock) {
      return tree;
    }
    return new TryStatement(tree.location, body, catchBlock, finallyBlock);
  }

  /**
   * @param {TypeName} tree
   * @return {ParseTree}
   */
  transformTypeName(tree) {
    var moduleName = this.transformAny(tree.moduleName);
    if (moduleName == tree.moduleName) {
      return tree;
    }
    return new TypeName(tree.location, moduleName, tree.name);
  }

  /**
   * @param {UnaryExpression} tree
   * @return {ParseTree}
   */
  transformUnaryExpression(tree) {
    var operand = this.transformAny(tree.operand);
    if (operand == tree.operand) {
      return tree;
    }
    return new UnaryExpression(tree.location, tree.operator, operand);
  }

  /**
   * @param {VariableDeclaration} tree
   * @return {ParseTree}
   */
  transformVariableDeclaration(tree) {
    var lvalue = this.transformAny(tree.lvalue);
    var typeAnnotation = this.transformAny(tree.typeAnnotation);
    var initializer = this.transformAny(tree.initializer);
    if (lvalue == tree.lvalue && typeAnnotation == tree.typeAnnotation &&
        initializer == tree.initializer) {
      return tree;
    }
    return new VariableDeclaration(tree.location, lvalue, typeAnnotation,
        initializer);
  }

  /**
   * @param {VariableDeclarationList} tree
   * @return {ParseTree}
   */
  transformVariableDeclarationList(tree) {
    var declarations = this.transformList(tree.declarations);
    if (declarations == tree.declarations) {
      return tree;
    }
    return new VariableDeclarationList(tree.location, tree.declarationType,
                                       declarations);
  }

  /**
   * @param {VariableStatement} tree
   * @return {ParseTree}
   */
  transformVariableStatement(tree) {
    var declarations = this.transformAny(tree.declarations);
    if (declarations == tree.declarations) {
      return tree;
    }
    return new VariableStatement(tree.location, declarations);
  }

  /**
   * @param {WhileStatement} tree
   * @return {ParseTree}
   */
  transformWhileStatement(tree) {
    var condition = this.transformAny(tree.condition);
    var body = this.transformAny(tree.body);
    if (condition == tree.condition && body == tree.body) {
      return tree;
    }
    return new WhileStatement(tree.location, condition, body);
  }

  /**
   * @param {WithStatement} tree
   * @return {ParseTree}
   */
  transformWithStatement(tree) {
    var expression = this.transformAny(tree.expression);
    var body = this.transformAny(tree.body);
    if (expression == tree.expression && body == tree.body) {
      return tree;
    }
    return new WithStatement(tree.location, expression, body);
  }

  /**
   * @param {YieldExpression} tree
   * @return {ParseTree}
   */
  transformYieldExpression(tree) {
    var expression = this.transformAny(tree.expression);
    var isYieldFor = tree.isYieldFor;
    if (expression == tree.expression) {
      return tree;
    }
    return new YieldExpression(tree.location, expression, isYieldFor);
  }
}
