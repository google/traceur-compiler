// Copyright 2011 Google Inc.
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

traceur.define('codegeneration', function() {
  'use strict';

  var ArgumentList = traceur.syntax.trees.ArgumentList;
  var ArrayLiteralExpression = traceur.syntax.trees.ArrayLiteralExpression;
  var ArrayPattern = traceur.syntax.trees.ArrayPattern;
  var ArrowFunctionExpression = traceur.syntax.trees.ArrowFunctionExpression;
  var AwaitStatement = traceur.syntax.trees.AwaitStatement;
  var BinaryOperator = traceur.syntax.trees.BinaryOperator;
  var BindThisParameter = traceur.syntax.trees.BindThisParameter;
  var BindingElement = traceur.syntax.trees.BindingElement;
  var Block = traceur.syntax.trees.Block;
  var CallExpression = traceur.syntax.trees.CallExpression;
  var CascadeExpression = traceur.syntax.trees.CascadeExpression;
  var CaseClause = traceur.syntax.trees.CaseClause;
  var Catch = traceur.syntax.trees.Catch;
  var ClassDeclaration = traceur.syntax.trees.ClassDeclaration;
  var ClassExpression = traceur.syntax.trees.ClassExpression;
  var CommaExpression = traceur.syntax.trees.CommaExpression;
  var ConditionalExpression = traceur.syntax.trees.ConditionalExpression;
  var DefaultClause = traceur.syntax.trees.DefaultClause;
  var DoWhileStatement = traceur.syntax.trees.DoWhileStatement;
  var ExportDeclaration = traceur.syntax.trees.ExportDeclaration;
  var ExportMapping = traceur.syntax.trees.ExportMapping;
  var ExportMappingList = traceur.syntax.trees.ExportMappingList;
  var ExportSpecifier = traceur.syntax.trees.ExportSpecifier;
  var ExportSpecifierSet = traceur.syntax.trees.ExportSpecifierSet;
  var ExpressionStatement = traceur.syntax.trees.ExpressionStatement;
  var Finally = traceur.syntax.trees.Finally;
  var ForInStatement = traceur.syntax.trees.ForInStatement;
  var ForOfStatement = traceur.syntax.trees.ForOfStatement;
  var ForStatement = traceur.syntax.trees.ForStatement;
  var FormalParameterList = traceur.syntax.trees.FormalParameterList;
  var FunctionDeclaration = traceur.syntax.trees.FunctionDeclaration;
  var GetAccessor = traceur.syntax.trees.GetAccessor;
  var IfStatement = traceur.syntax.trees.IfStatement;
  var ImportBinding = traceur.syntax.trees.ImportBinding;
  var ImportDeclaration = traceur.syntax.trees.ImportDeclaration;
  var LabelledStatement = traceur.syntax.trees.LabelledStatement;
  var MemberExpression = traceur.syntax.trees.MemberExpression;
  var MemberLookupExpression = traceur.syntax.trees.MemberLookupExpression;
  var ModuleDeclaration = traceur.syntax.trees.ModuleDeclaration;
  var ModuleDefinition = traceur.syntax.trees.ModuleDefinition;
  var ModuleExpression = traceur.syntax.trees.ModuleExpression;
  var ModuleSpecifier = traceur.syntax.trees.ModuleSpecifier;
  var NewExpression = traceur.syntax.trees.NewExpression;
  var ObjectLiteralExpression = traceur.syntax.trees.ObjectLiteralExpression;
  var ObjectPattern = traceur.syntax.trees.ObjectPattern;
  var ObjectPatternField = traceur.syntax.trees.ObjectPatternField;
  var ParenExpression = traceur.syntax.trees.ParenExpression;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var PostfixExpression = traceur.syntax.trees.PostfixExpression;
  var Program = traceur.syntax.trees.Program;
  var PropertyMethodAssignment = traceur.syntax.trees.PropertyMethodAssignment;
  var PropertyNameAssignment = traceur.syntax.trees.PropertyNameAssignment;
  var QuasiLiteralExpression = traceur.syntax.trees.QuasiLiteralExpression;
  var QuasiSubstitution = traceur.syntax.trees.QuasiSubstitution;
  var ReturnStatement = traceur.syntax.trees.ReturnStatement;
  var SetAccessor = traceur.syntax.trees.SetAccessor;
  var SpreadExpression = traceur.syntax.trees.SpreadExpression;
  var SpreadPatternElement = traceur.syntax.trees.SpreadPatternElement;
  var SwitchStatement = traceur.syntax.trees.SwitchStatement;
  var ThrowStatement = traceur.syntax.trees.ThrowStatement;
  var TryStatement = traceur.syntax.trees.TryStatement;
  var UnaryExpression = traceur.syntax.trees.UnaryExpression;
  var VariableDeclaration = traceur.syntax.trees.VariableDeclaration;
  var VariableDeclarationList = traceur.syntax.trees.VariableDeclarationList;
  var VariableStatement = traceur.syntax.trees.VariableStatement;
  var WhileStatement = traceur.syntax.trees.WhileStatement;
  var WithStatement = traceur.syntax.trees.WithStatement;
  var YieldStatement = traceur.syntax.trees.YieldStatement;

  var getTreeNameForType = traceur.syntax.trees.getTreeNameForType;

  /**
   * A base class for transforming parse trees.
   *
   * The ParseTreeTransformer walks every node and gives derived classes the opportunity
   * (but not the obligation) to transform every node in a tree. By default the ParseTreeTransformer
   * performs the identity transform.
   */
  function ParseTreeTransformer() {}

  ParseTreeTransformer.prototype = {

    /**
     * @param {ParseTree} tree
     * @return {ParseTree}
     */
    transformAny: function(tree) {
      if (tree == null) {
        return null;
      }

      var name = getTreeNameForType(tree.type);
      return this['transform' + name](tree);
    },

    /**
     * @param {Array.<ParseTree>} list
     * @return {Array.<ParseTree>}
     */
    transformList: function(list) {
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
    },

    /**
     * @param {ParseTree} tree
     * @return {ParseTree}
     */
    toSourceElement: function(tree) {
      return tree.isSourceElement() ?
          tree : new ExpressionStatement(tree.location, tree);
    },

    /**
     * @param {Array.<ParseTree>} list
     * @return {Array.<ParseTree>}
     */
    transformSourceElements: function(list) {
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
    },

    /**
     * @param {ArgumentList} tree
     * @return {ParseTree}
     */
    transformArgumentList: function(tree) {
      var args = this.transformList(tree.args);
      if (args == tree.args) {
        return tree;
      }
      return new ArgumentList(tree.location, args);
    },

    /**
     * @param {ArrayLiteralExpression} tree
     * @return {ParseTree}
     */
    transformArrayLiteralExpression: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements == tree.elements) {
        return tree;
      }
      return new ArrayLiteralExpression(tree.location, elements)
    },

    /**
     * @param {ArrayPattern} tree
     * @return {ParseTree}
     */
    transformArrayPattern: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements == tree.elements) {
        return tree;
      }
      return new ArrayPattern(tree.location, elements);
    },

   /**
     * @param {ArrowFunctionExpression} tree
     * @return {ParseTree}
     */
    transformArrowFunctionExpression: function(tree) {
      var parameters = this.transformAny(tree.formalParameters);
      var body = this.transformAny(tree.functionBody);
      if (parameters == tree.formalParameters && body == tree.functionBody) {
        return tree;
      }
      return new ArrowFunctionExpression(null, parameters, body);
    },

    /**
     * @param {AwaitStatement} tree
     * @return {ParseTree}
     */
    transformAwaitStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (tree.expression == expression) {
        return tree;
      }
      return new AwaitStatement(tree.location, tree.identifier, expression);
    },

    /**
     * @param {BinaryOperator} tree
     * @return {ParseTree}
     */
    transformBinaryOperator: function(tree) {
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (left == tree.left && right == tree.right) {
        return tree;
      }
      return new BinaryOperator(tree.location, left, tree.operator, right);
    },

    /**
     * @param {BindThisParameter} tree
     * @return {ParseTree}
     */
    transformBindThisParameter: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (tree.expression == expression) {
        return tree;
      }
      return new BindThisParameter(tree.location, expression);
    },

    /**
     * @param {BindingElement} tree
     * @return {ParseTree}
     */
    transformBindingElement: function(tree) {
      var binding = this.transformAny(tree.binding);
      var initializer = this.transformAny(tree.initializer);
      if (binding === tree.binding && initializer === tree.initializer)
        return tree;
      return new BindingElement(tree.location, binding, initializer);
    },

    /**
     * @param {BindingIdentifier} tree
     * @return {ParseTree}
     */
    transformBindingIdentifier: function(tree) {
      return tree;
    },

    /**
     * @param {Block} tree
     * @return {ParseTree}
     */
    transformBlock: function(tree) {
      var elements = this.transformList(tree.statements);
      if (elements == tree.statements) {
        return tree;
      }
      return new Block(tree.location, elements);
    },

    /**
     * @param {BreakStatement} tree
     * @return {ParseTree}
     */
    transformBreakStatement: function(tree) {
      return tree;
    },

    /**
     * @param {CallExpression} tree
     * @return {ParseTree}
     */
    transformCallExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var args = this.transformAny(tree.args);
      if (operand == tree.operand && args == tree.args) {
        return tree;
      }
      return new CallExpression(tree.location, operand, args);
    },

    /**
     * @param {CaseClause} tree
     * @return {ParseTree}
     */
    transformCaseClause: function(tree) {
      var expression = this.transformAny(tree.expression);
      var statements = this.transformList(tree.statements);
      if (expression == tree.expression && statements == tree.statements) {
        return tree;
      }
      return new CaseClause(tree.location, expression, statements);
    },

    /**
     * @param {Catch} tree
     * @return {ParseTree}
     */
    transformCatch: function(tree) {
      var catchBody = this.transformAny(tree.catchBody);
      var binding = this.transformAny(tree.binding);
      if (catchBody == tree.catchBody && binding == tree.binding) {
        return tree;
      }
      return new Catch(tree.location, binding, catchBody);
    },

    /**
     * @param {CascadeExpression} tree
     * @return {ParseTree}
     */
    transformCascadeExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var expressions = this.transformList(tree.expressions);
      if (operand == tree.operand && expressions == tree.expressions) {
        return tree;
      }
      return new CascadeExpression(tree.location, operand, expressions);
    },

    /**
     * @param {ClassDeclaration} tree
     * @return {ParseTree}
     */
    transformClassDeclaration: function(tree) {
      var superClass = this.transformAny(tree.superClass);
      var elements = this.transformList(tree.elements);
      if (superClass == tree.superClass && elements == tree.elements)
        return tree;
      return new ClassDeclaration(tree.location, tree.name, superClass,
                                  elements);
    },

    /**
     * @param {ClassExpression} tree
     * @return {ParseTree}
     */
    transformClassExpression: function(tree) {
      var superClass = this.transformAny(tree.superClass);
      var elements = this.transformList(tree.elements);
      if (superClass == tree.superClass && elements == tree.elements)
        return tree;
      return new ClassExpression(tree.location, tree.name, superClass,
                                 elements);
    },

    /**
     * @param {CommaExpression} tree
     * @return {ParseTree}
     */
    transformCommaExpression: function(tree) {
      var expressions = this.transformList(tree.expressions);
      if (expressions == tree.expressions) {
        return tree;
      }
      return new CommaExpression(tree.location, expressions);
    },

    /**
     * @param {ConditionalExpression} tree
     * @return {ParseTree}
     */
    transformConditionalExpression: function(tree) {
      var condition = this.transformAny(tree.condition);
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (condition == tree.condition && left == tree.left && right == tree.right) {
        return tree;
      }
      return new ConditionalExpression(tree.location, condition, left, right);
    },

    /**
     * @param {ContinueStatement} tree
     * @return {ParseTree}
     */
    transformContinueStatement: function(tree) {
      return tree;
    },

    /**
     * @param {DebuggerStatement} tree
     * @return {ParseTree}
     */
    transformDebuggerStatement: function(tree) {
      return tree;
    },

    /**
     * @param {DefaultClause} tree
     * @return {ParseTree}
     */
    transformDefaultClause: function(tree) {
      var statements = this.transformList(tree.statements);
      if (statements == tree.statements) {
        return tree;
      }
      return new DefaultClause(tree.location, statements);
    },

    /**
     * @param {DoWhileStatement} tree
     * @return {ParseTree}
     */
    transformDoWhileStatement: function(tree) {
      var body = this.transformAny(tree.body);
      var condition = this.transformAny(tree.condition);
      if (body == tree.body && condition == tree.condition) {
        return tree;
      }
      return new DoWhileStatement(tree.location, body, condition);
    },

    /**
     * @param {EmptyStatement} tree
     * @return {ParseTree}
     */
    transformEmptyStatement: function(tree) {
      return tree;
    },

    /**
     * @param {ExportDeclaration} tree
     * @return {ParseTree}
     */
    transformExportDeclaration: function(tree) {
      var declaration = this.transformAny(tree.declaration);
      if (tree.declaration == declaration) {
        return tree;
      }
      return new ExportDeclaration(tree.location, declaration);
    },

    /**
     * @param {ExportMappingList} tree
     * @return {ParseTree}
     */
    transformExportMappingList: function(tree) {
      var paths = this.transformList(tree.paths);
      if (paths == tree.paths) {
        return tree;
      }

      return new ExportMappingList(tree.location, paths);
    },

    /**
     * @param {ExportMapping} tree
     * @return {ParseTree}
     */
    transformExportMapping: function(tree) {
      var moduleExpression = this.transformAny(tree.moduleExpression);
      var specifierSet = this.transformAny(tree.specifierSet);
      if (moduleExpression == tree.moduleExpression &&
          specifierSet == tree.specifierSet) {
        return tree;
      }
      return new ExportMapping(tree.location, moduleExpression, specifierSet);
    },

    /**
     * @param {ExportSpecifier} tree
     * @return {ParseTree}
     */
    transformExportSpecifier: function(tree) {
      return tree;
    },

    /**
     * @param {ExportSpecifierSet} tree
     * @return {ParseTree}
     */
    transformExportSpecifierSet: function(tree) {
      var specifiers = this.transformList(tree.specifiers);
      if (specifiers == tree.specifiers) {
        return tree;
      }

      return new ExportSpecifierSet(tree.location, specifiers);
    },

    /**
     * @param {ExpressionStatement} tree
     * @return {ParseTree}
     */
    transformExpressionStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return new ExpressionStatement(tree.location, expression);
    },

    /**
     * @param {Finally} tree
     * @return {ParseTree}
     */
    transformFinally: function(tree) {
      var block = this.transformAny(tree.block);
      if (block == tree.block) {
        return tree;
      }
      return new Finally(tree.location, block);
    },

    /**
     * @param {ForOfStatement} tree
     * @return {ParseTree}
     */
    transformForOfStatement: function(tree) {
      var initializer = this.transformAny(tree.initializer);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (initializer == tree.initializer && collection == tree.collection &&
          body == tree.body) {
        return tree;
      }
      return new ForOfStatement(tree.location, initializer, collection, body);
    },

    /**
     * @param {ForInStatement} tree
     * @return {ParseTree}
     */
    transformForInStatement: function(tree) {
      var initializer = this.transformAny(tree.initializer);
      var collection = this.transformAny(tree.collection);
      var body = this.transformAny(tree.body);
      if (initializer == tree.initializer && collection == tree.collection &&
          body == tree.body) {
        return tree;
      }
      return new ForInStatement(tree.location, initializer, collection, body);
    },

    /**
     * @param {ForStatement} tree
     * @return {ParseTree}
     */
    transformForStatement: function(tree) {
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
    },

    /**
     * @param {FormalParameterList} tree
     * @return {ParseTree}
     */
    transformFormalParameterList: function(tree) {
      var parameters = this.transformList(tree.parameters);
      if (parameters == tree.parameters)
        return tree;
      return new FormalParameterList(tree.location, parameters);
    },

    /**
     * @param {FunctionDeclaration} tree
     * @return {ParseTree}
     */
    transformFunctionDeclaration: function(tree) {
      var formalParameterList =
          this.transformAny(tree.formalParameterList);
      var functionBody = this.transformFunctionBody(tree.functionBody);
      if (formalParameterList == tree.formalParameterList &&
          functionBody == tree.functionBody) {
        return tree;
      }
      return new FunctionDeclaration(tree.location, tree.name, tree.isGenerator,
                                     formalParameterList, functionBody);
    },

    /**
     * Even though function bodies are just Block trees the transformer calls
     * transformFunctionBody when transforming functions bodies.
     * @param  {Body} tree
     * @return {ParseTree}
     */
    transformFunctionBody: function(tree) {
      return this.transformAny(tree);
    },

    /**
     * @param {GetAccessor} tree
     * @return {ParseTree}
     */
    transformGetAccessor: function(tree) {
      var body = this.transformFunctionBody(tree.body);
      if (body == tree.body)
        return tree;
      return new GetAccessor(tree.location, tree.propertyName, body);
    },

    /**
     * @param {IdentifierExpression} tree
     * @return {ParseTree}
     */
    transformIdentifierExpression: function(tree) {
      return tree;
    },

    /**
     * @param {IfStatement} tree
     * @return {ParseTree}
     */
    transformIfStatement: function(tree) {
      var condition = this.transformAny(tree.condition);
      var ifClause = this.transformAny(tree.ifClause);
      var elseClause = this.transformAny(tree.elseClause);
      if (condition == tree.condition && ifClause == tree.ifClause && elseClause == tree.elseClause) {
        return tree;
      }
      return new IfStatement(tree.location, condition, ifClause, elseClause);
    },

    /**
     * @param {ImportDeclaration} tree
     * @return {ParseTree}
     */
    transformImportDeclaration: function(tree) {
      var importPathList = this.transformList(tree.importPathList);
      if (importPathList == tree.importPathList) {
        return tree;
      }
      return new ImportDeclaration(tree.location, importPathList);
    },

    /**
     * @param {ImportBinding} tree
     * @return {ParseTree}
     */
    transformImportBinding: function(tree) {
      var moduleExpression = this.transformAny(tree.moduleExpression);
      var importSpecifierSet = this.transformList(tree.importSpecifierSet);
      if (moduleExpression == tree.moduleExpression &&
          importSpecifierSet == tree.importSpecifierSet) {
        return tree;
      }
      return new ImportBinding(tree.location, moduleExpression, importSpecifierSet);
    },

    /**
     * @param {ImportSpecifier} tree
     * @return {ParseTree}
     */
    transformImportSpecifier: function(tree) {
      return tree;
    },

    /**
     * @param {LabelledStatement} tree
     * @return {ParseTree}
     */
    transformLabelledStatement: function(tree) {
      var statement = this.transformAny(tree.statement);
      if (statement == tree.statement) {
        return tree;
      }
      return new LabelledStatement(tree.location, tree.name, statement);
    },

    /**
     * @param {LiteralExpression} tree
     * @return {ParseTree}
     */
    transformLiteralExpression: function(tree) {
      return tree;
    },

    /**
     * @param {MemberExpression} tree
     * @return {ParseTree}
     */
    transformMemberExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand == tree.operand) {
        return tree;
      }
      return new MemberExpression(tree.location, operand, tree.memberName);
    },

    /**
     * @param {MemberLookupExpression} tree
     * @return {ParseTree}
     */
    transformMemberLookupExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var memberExpression = this.transformAny(tree.memberExpression);
      if (operand == tree.operand &&
          memberExpression == tree.memberExpression) {
        return tree;
      }
      return new MemberLookupExpression(tree.location, operand,
                                        memberExpression);
    },

    /**
     * @param {MissingPrimaryExpression} tree
     * @return {ParseTree}
     */
    transformMissingPrimaryExpression: function(tree) {
      throw new Error('Should never transform trees that had errors during parse');
    },

    /**
     * @param {ModuleDeclaration} tree
     * @return {ParseTree}
     */
    transformModuleDeclaration: function(tree) {
      var specifiers = this.transformList(tree.specifiers);
      if (specifiers == tree.specifiers) {
        return tree;
      }

      return new ModuleDeclaration(tree.location, specifiers);
    },

    /**
     * @param {ModuleDefinition} tree
     * @return {ParseTree}
     */
    transformModuleDefinition: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements == tree.elements) {
        return tree;
      }

      return new ModuleDefinition(tree.location, tree.name, elements);
    },

    /**
     * @param {ModuleExpression} tree
     * @return {ParseTree}
     */
    transformModuleExpression: function(tree) {
      var reference = this.transformAny(tree.reference);
      if (reference == tree.reference) {
        return tree;
      }
      return new ModuleExpression(tree.location, reference, tree.identifiers);
    },

    /**
     * @param {ModuleRequire} tree
     * @return {ParseTree}
     */
    transformModuleRequire: function(tree) {
      return tree;
    },

    /**
     * @param {ModuleSpecifier} tree
     * @return {ParseTree}
     */
    transformModuleSpecifier: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return new ModuleSpecifier(tree.location, tree.identifier, expression);
    },

    /**
     * @param {NewExpression} tree
     * @return {ParseTree}
     */
    transformNewExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      var args = this.transformAny(tree.args);

      if (operand == tree.operand && args == tree.args) {
        return tree;
      }
      return new NewExpression(tree.location, operand, args);
    },

    /**
     * @param {NullTree} tree
     * @return {ParseTree}
     */
    transformNullTree: function(tree) {
      return tree;
    },

    /**
     * @param {ObjectLiteralExpression} tree
     * @return {ParseTree}
     */
    transformObjectLiteralExpression: function(tree) {
      var propertyNameAndValues = this.transformList(tree.propertyNameAndValues);
      if (propertyNameAndValues == tree.propertyNameAndValues) {
        return tree;
      }
      return new ObjectLiteralExpression(tree.location, propertyNameAndValues);
    },

    /**
     * @param {ObjectPattern} tree
     * @return {ParseTree}
     */
    transformObjectPattern: function(tree) {
      var fields = this.transformList(tree.fields);
      if (fields == tree.fields) {
        return tree;
      }
      return new ObjectPattern(tree.location, fields);
    },

    /**
     * @param {ObjectPatternField} tree
     * @return {ParseTree}
     */
    transformObjectPatternField: function(tree) {
      var element = this.transformAny(tree.element);
      if (element == tree.element) {
        return tree;
      }
      return new ObjectPatternField(tree.location, tree.identifier, element);
    },

    /**
     * @param {ParenExpression} tree
     * @return {ParseTree}
     */
    transformParenExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return new ParenExpression(tree.location, expression);
    },

    /**
     * @param {PostfixExpression} tree
     * @return {ParseTree}
     */
    transformPostfixExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand == tree.operand) {
        return tree;
      }
      return new PostfixExpression(tree.location, operand, tree.operator);
    },

    /**
     * @param {Program} tree
     * @return {ParseTree}
     */
    transformProgram: function(tree) {
      var elements = this.transformList(tree.programElements);
      if (elements == tree.programElements) {
        return tree;
      }
      return new Program(tree.location, elements);
    },

    /**
     * @param {PropertyMethodAssignment} tree
     * @return {ParseTree}
     */
    transformPropertyMethodAssignment: function(tree) {
      var parameters = this.transformAny(tree.formalParameterList);
      var functionBody = this.transformFunctionBody(tree.functionBody);
      if (parameters == tree.formalParameterList &&
          functionBody == tree.functionBody) {
        return tree;
      }
      return new PropertyMethodAssignment(tree.location, tree.name,
                                          tree.isGenerator,
                                          parameters, functionBody);
    },

    /**
     * @param {PropertyNameAssignment} tree
     * @return {ParseTree}
     */
    transformPropertyNameAssignment: function(tree) {
      var value = this.transformAny(tree.value);
      if (value == tree.value) {
        return tree;
      }
      return new PropertyNameAssignment(tree.location, tree.name, value);
    },

    /**
     * @param {PropertyNameShorthand} tree
     * @return {ParseTree}
     */
    transformPropertyNameShorthand: function(tree) {
      return tree;
    },

    /**
     * @param {QuasiLiteralExpression} tree
     * @return {ParseTree}
     */
    transformQuasiLiteralExpression: function(tree) {
      var elements = this.transformList(tree.elements);
      if (elements == tree.elements) {
        return tree;
      }
      return new QuasiLiteralExpression(tree.location, tree.name, elements);
    },

    /**
     * @param {QuasiLiteralPortion} tree
     * @return {ParseTree}
     */
    transformQuasiLiteralPortion: function(tree) {
      return tree;
    },


    /**
     * @param {QuasiSubstitution} tree
     * @return {ParseTree}
     */
    transformQuasiSubstitution: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return new QuasiSubstitution(tree.location, expression);
    },

    /**
     * @param {RequiresMember} tree
     * @return {ParseTree}
     */
    transformRequiresMember: function(tree) {
      return tree;
    },

    /**
     * @param {RestParameter} tree
     * @return {ParseTree}
     */
    transformRestParameter: function(tree) {
      return tree;
    },

    /**
     * @param {ReturnStatement} tree
     * @return {ParseTree}
     */
    transformReturnStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return new ReturnStatement(tree.location, expression);
    },

    /**
     * @param {SetAccessor} tree
     * @return {ParseTree}
     */
    transformSetAccessor: function(tree) {
      var parameter = this.transformAny(tree.parameter);
      var body = this.transformFunctionBody(tree.body);
      if (parameter === tree.parameter && body === tree.body)
        return tree;
      return new SetAccessor(tree.location, tree.propertyName, parameter, body);
    },

    /**
     * @param {SpreadExpression} tree
     * @return {ParseTree}
     */
    transformSpreadExpression: function(tree) {
      var expression = this.transformAny(tree.expression);
      if (expression == tree.expression) {
        return tree;
      }
      return new SpreadExpression(tree.location, expression);
    },

    /**
     * @param {SpreadPatternElement} tree
     * @return {ParseTree}
     */
    transformSpreadPatternElement: function(tree) {
      var lvalue = this.transformAny(tree.lvalue);
      if (lvalue == tree.lvalue) {
        return tree;
      }
      return new SpreadPatternElement(tree.location, lvalue);
    },

    /**
     * @param {StateMachine} tree
     * @return {ParseTree}
     */
    transformStateMachine: function(tree) {
      throw new Error();
    },

    /**
     * @param {SuperExpression} tree
     * @return {ParseTree}
     */
    transformSuperExpression: function(tree) {
      return tree;
    },

    /**
     * @param {SwitchStatement} tree
     * @return {ParseTree}
     */
    transformSwitchStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      var caseClauses = this.transformList(tree.caseClauses);
      if (expression == tree.expression && caseClauses == tree.caseClauses) {
        return tree;
      }
      return new SwitchStatement(tree.location, expression, caseClauses);
    },

    /**
     * @param {ThisExpression} tree
     * @return {ParseTree}
     */
    transformThisExpression: function(tree) {
      return tree;
    },

    /**
     * @param {ThrowStatement} tree
     * @return {ParseTree}
     */
    transformThrowStatement: function(tree) {
      var value = this.transformAny(tree.value);
      if (value == tree.value) {
        return tree;
      }
      return new ThrowStatement(tree.location, value);
    },

    /**
     * @param {TryStatement} tree
     * @return {ParseTree}
     */
    transformTryStatement: function(tree) {
      var body = this.transformAny(tree.body);
      var catchBlock = this.transformAny(tree.catchBlock);
      var finallyBlock = this.transformAny(tree.finallyBlock);
      if (body == tree.body && catchBlock == tree.catchBlock &&
          finallyBlock == tree.finallyBlock) {
        return tree;
      }
      return new TryStatement(tree.location, body, catchBlock, finallyBlock);
    },

    /**
     * @param {UnaryExpression} tree
     * @return {ParseTree}
     */
    transformUnaryExpression: function(tree) {
      var operand = this.transformAny(tree.operand);
      if (operand == tree.operand) {
        return tree;
      }
      return new UnaryExpression(tree.location, tree.operator, operand);
    },

    /**
     * @param {VariableDeclaration} tree
     * @return {ParseTree}
     */
    transformVariableDeclaration: function(tree) {
      var lvalue = this.transformAny(tree.lvalue);
      var initializer = this.transformAny(tree.initializer);
      if (lvalue == tree.lvalue && initializer == tree.initializer) {
        return tree;
      }
      return new VariableDeclaration(tree.location, lvalue, initializer);
    },

    /**
     * @param {VariableDeclarationList} tree
     * @return {ParseTree}
     */
    transformVariableDeclarationList: function(tree) {
      var declarations = this.transformList(tree.declarations);
      if (declarations == tree.declarations) {
        return tree;
      }
      return new VariableDeclarationList(tree.location, tree.declarationType,
                                         declarations);
    },

    /**
     * @param {VariableStatement} tree
     * @return {ParseTree}
     */
    transformVariableStatement: function(tree) {
      var declarations = this.transformAny(tree.declarations);
      if (declarations == tree.declarations) {
        return tree;
      }
      return new VariableStatement(tree.location, declarations);
    },

    /**
     * @param {WhileStatement} tree
     * @return {ParseTree}
     */
    transformWhileStatement: function(tree) {
      var condition = this.transformAny(tree.condition);
      var body = this.transformAny(tree.body);
      if (condition == tree.condition && body == tree.body) {
        return tree;
      }
      return new WhileStatement(tree.location, condition, body);
    },

    /**
     * @param {WithStatement} tree
     * @return {ParseTree}
     */
    transformWithStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      var body = this.transformAny(tree.body);
      if (expression == tree.expression && body == tree.body) {
        return tree;
      }
      return new WithStatement(tree.location, expression, body);
    },

    /**
     * @param {YieldStatement} tree
     * @return {ParseTree}
     */
    transformYieldStatement: function(tree) {
      var expression = this.transformAny(tree.expression);
      var isYieldFor = tree.isYieldFor;
      if (expression == tree.expression) {
        return tree;
      }
      return new YieldStatement(tree.location, expression, isYieldFor);
    }
  };

  return {
    ParseTreeTransformer: ParseTreeTransformer
  };
});
