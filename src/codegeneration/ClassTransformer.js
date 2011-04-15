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

  var TokenType = traceur.syntax.TokenType;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var PredefinedName = traceur.syntax.PredefinedName;
  var ProgramTree = traceur.syntax.trees.ProgramTree;
  var ClassAnalyzer = traceur.semantics.ClassAnalyzer;
  var FunctionTransformer = traceur.codegeneration.FunctionTransformer;
  var ClassSymbol = traceur.semantics.symbols.ClassSymbol;
  var SymbolType = traceur.semantics.symbols.SymbolType;
  var MethodSymbol = traceur.semantics.symbols.MethodSymbol;
  var PropertySymbol = traceur.semantics.symbols.PropertySymbol;
  var FieldSymbol = traceur.semantics.symbols.FieldSymbol;
  var AggregateSymbol = traceur.semantics.symbols.AggregateSymbol;

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createAssignmentStatement = ParseTreeFactory.createAssignmentStatement;
  var createBlock = ParseTreeFactory.createBlock;
  var createBooleanLiteral = ParseTreeFactory.createBooleanLiteral;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createCallStatement = ParseTreeFactory.createCallStatement;
  var createClass = ParseTreeFactory.createClass;
  var createEmptyParameterList = ParseTreeFactory.createEmptyParameterList;
  var createEmptyParameters = ParseTreeFactory.createEmptyParameters;
  var createFunctionDeclaration = ParseTreeFactory.createFunctionDeclaration;
  var createFunctionExpression = ParseTreeFactory.createFunctionExpression;
  var createFunctionExpressionFormals = ParseTreeFactory.createFunctionExpressionFormals;
  var createGetAccessor = ParseTreeFactory.createGetAccessor;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createNullLiteral = ParseTreeFactory.createNullLiteral;
  var createObjectLiteralExpression = ParseTreeFactory.createObjectLiteralExpression;
  var createParameters = ParseTreeFactory.createParameters;
  var createPropertyNameAssignment = ParseTreeFactory.createPropertyNameAssignment;
  var createSetAccessor = ParseTreeFactory.createSetAccessor;
  var createStringLiteral = ParseTreeFactory.createStringLiteral;
  var createThisExpression = ParseTreeFactory.createThisExpression;
  var createTrueLiteral = ParseTreeFactory.createTrueLiteral;
  var createUndefinedExpression = ParseTreeFactory.createUndefinedExpression;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;

  /**
   * Transforms a Traceur class to JS.
   *
   * @param {ErrorReporter} reporter
   * @constructor
   */
  function ClassTransformer(reporter) {
    this.reporter_ = reporter;
  }

  /**
   * Transforms all classes in the program
   *
   * @param {ErrorReporter} errors
   * @param {ProgramTree} tree
   * @return {ProgramTree}
   */
  ClassTransformer.transformClasses = function(reporter, tree) {
    var elements = tree.sourceElements.map(function(element) {
      if (element.type == ParseTreeType.CLASS_DECLARATION) {
        var sym = ClassAnalyzer.analyzeClass(reporter, element);
        return new ClassTransformer(reporter).transformClass_(sym);
      }
      return element;
    });

    return new ProgramTree(tree.location, elements);
  };

  ClassTransformer.prototype = {
    /**
     * Transforms a single class declaration
     *
     * @param {ClassSymbol} sym
     * @return {ParseTree}
     */
    transformClass_: function(sym) {
      var classInstance = createThisExpression();
      var baseClass = sym.tree.superClass;
      if (!baseClass) {
        baseClass = createNullLiteral();
      }

      // traceur.runtime.createClass(base, <new>, <ctor>, <field init>, prototype, <static init>)
      return createVariableStatement(
          TokenType.VAR,
          sym.name,
          createCallExpression(
              createMemberExpression(
                  PredefinedName.TRACEUR,
                  PredefinedName.RUNTIME,
                  PredefinedName.CREATE_CLASS),
              createArgumentList(
                  //name
                  createStringLiteral(sym.name),
                  // base
                  baseClass,
                  // $new
                  this.createStaticConstructor_(sym),
                  // ctor
                  this.createConstructor_(sym),
                  // $init
                  this.createFieldInitializerMethod_(sym),
                  // prototype
                  createObjectLiteralExpression(this.transformInstanceMembers_(sym)),
                  // static member decorator
                  // (function that will apply the static members)
                  createFunctionDeclaration(
                      PredefinedName.STATIC,
                      createEmptyParameterList(),
                      createBlock(this.createStaticMembers_(classInstance, sym))))));
    },

    /**
     * @param {ParseTree} classInstance
     * @param {ClassSymbol} sym
     * @return {Array.<ParseTree>}
     */
    createStaticMembers_: function(classInstance, sym) {
      var result = [];

      // do methods first so that static field initializers can reference static methods
      sym.getStaticMembers().forEach(function(member) {
        switch (member.type) {
          case SymbolType.METHOD:
            result.push(this.transformStaticMethodAssignment_(classInstance, member.asMethod()));
            break;
          case SymbolType.PROPERTY:
            result.push(this.transformStaticAccessor_(classInstance, member.asProperty()));
            break;
          case SymbolType.FIELD:
            break;
          case SymbolType.MIXIN_MEMBER:
          case SymbolType.REQUIRES:
          default:
            throw new Error('Unexpected member type');
        }
      }, this);

      // now do static fields
      sym.getStaticMembers().forEach(function(member) {
        switch (member.type) {
          case SymbolType.METHOD:
          case SymbolType.PROPERTY:
            break;
          case SymbolType.FIELD:
            result.push(this.transformStaticField_(classInstance, member.asField()));
            break;
          case SymbolType.MIXIN_MEMBER:
          case SymbolType.REQUIRES:
          default:
            throw new Error('Unexpected member type');
        }
      }, this);

      return result;
    },

    /**
     * @param {ParseTree} classInstance
     * @param {PropertySymbol} property
     * @return {ParseTree}
     */
    transformStaticAccessor_: function(classInstance, property) {
      // Object.defineProperty(
      //    ident,
      //    name,
      //    {
      //        get: ...
      //        set: ...
      //        enumerable: true,
      //        configurable: true
      //    }

      var get = property.get;
      var set = property.set;
      var aggregate = property.containingAggregate;

      var fields = [];
      fields.push(createPropertyNameAssignment(PredefinedName.ENUMERABLE, createTrueLiteral()));
      fields.push(createPropertyNameAssignment(PredefinedName.CONFIGURABLE, createTrueLiteral()));

      if (get != null) {
        fields.push(createPropertyNameAssignment(PredefinedName.GET,
            this.transformStaticMethod_(
                aggregate,
                createEmptyParameters(),
                get.tree.body)));
      }

      if (set != null) {
        fields.push(createPropertyNameAssignment(PredefinedName.SET,
            this.transformStaticMethod_(
                aggregate,
                createParameters(set.tree.parameter),
                set.tree.body)));
      }

      return createCallStatement(
          createMemberExpression(PredefinedName.OBJECT, PredefinedName.DEFINE_PROPERTY),
          createArgumentList(
              classInstance,
              createStringLiteral(property.name),
              createObjectLiteralExpression(fields)));
    },

    /**
     * @param {ParseTree} classInstance
     * @param {MethodSymbol} method
     * @return {ParseTree}
     */
    transformStaticMethodAssignment_: function(classInstance, method) {
      // aggregate.method  = function (args) { ... };
      return createAssignmentStatement(
          createMemberExpression(classInstance, method.name),
          this.transformStaticMethod_(
              method.containingAggregate,
              createParameters(method.tree.formalParameterList),
              method.tree.functionBody));
    },

    /**
     * @param {AggregateSymbol} aggregate
     * @param {Array.<string>} formalParameters
     * @param {BlockTree} functionBody
     * @return {FunctionDeclarationTree}
     */
    transformStaticMethod_: function(aggregate, formalParameters, functionBody) {
      return createFunctionExpressionFormals(
          formalParameters,
          this.createFunctionTransformer_(aggregate).transformBlockTree(functionBody));
    },

    /**
     * @param {ParseTree} classInstance
     * @param {FieldSymbol} field
     * @return {ParseTree}
     */
    transformStaticField_: function(classInstance, field) {
      var initializer;
      if (field.tree.initializer == null) {
        initializer = createUndefinedExpression();
      } else {
        initializer = this.transformStaticFieldInitializer_(field, field.tree.initializer);
      }
      // aggregate.field = initializer;
      return createAssignmentStatement(
          createMemberExpression(
              classInstance,
              field.name),
          initializer);
    },

    /**
     * @param {FieldSymbol} field
     * @param {ParseTree} tree
     * @return {ParseTree}
     */
    transformStaticFieldInitializer_: function(field, tree) {
      var transformer = this.createFunctionTransformer_(field.containingAggregate);
      return transformer.transformAny(tree);
    },

    /**
     * @param {AggregateSymbol} aggregate
     * @return {Array.<ParseTree>}
     */
    transformInstanceMembers_: function(sym) {
      var result = [];
      sym.getInstanceMembers().forEach(function(member) {
        switch (member.type) {
          case SymbolType.METHOD:
            if (!member.isConstructor()) {
              result.push(this.transformInstanceMethod_(member.asMethod()));
            }
            break;
          case SymbolType.PROPERTY:
            var property = member.asProperty();
            if (property.get != null) {
              result.push(this.transformInstanceGetAccessor_(property.get));
            }
            if (property.set != null) {
              result.push(this.transformInstanceSetAccessor_(property.set));
            }
            break;
          case SymbolType.FIELD:
            break;
          case SymbolType.MIXIN_MEMBER:
            throw new Error('transformMixinMember not implemented');
          case SymbolType.REQUIRES:
            break;
          default:
            throw new Error('Unexpected member type');
        }
      }, this);
      return result;
    },

    /**
     * @param {GetAccessor} aggregate
     * @return {ParseTree}
     */
    transformInstanceGetAccessor_: function(get) {
      var transformer = this.createFunctionTransformer_(get.getContainingAggregate());
      return createGetAccessor(
          get.getName(),
          false,
          transformer.transformBlockTree(get.tree.body));
    },

    /**
     * @param {GetAccessor} aggregate
     * @return {ParseTree}
     */
    transformInstanceSetAccessor_: function(set) {
      var transformer = this.createFunctionTransformer_(set.getContainingAggregate());
      return createSetAccessor(
          set.getName(),
          false,
          set.tree.parameter,
          transformer.transformBlockTree(set.tree.body));
    },

    /**
     * @param {MethodSymbol} method
     * @return {ParseTree}
     */
    transformInstanceMethod_: function(method) {
      return createPropertyNameAssignment(
          method.name,
          createFunctionExpression(
              method.tree.formalParameterList,
              this.transformMethodBody_(method)));
    },

    /**
     * @param {MethodSymbol} method
     * @return {BlockTree}
     */
    transformMethodBody_: function(method) {
      var body = method.tree.functionBody;
      return this.createFunctionTransformer_(method).transformBlockTree(body);
    },

    /**
     * @param {AggregateSymbol} sym
     * @return {ParseTree}
     */
    createFieldInitializerMethod_: function(sym) {
      var init = this.transformFieldInitializers_(sym);
      if (init.length == 0) {
        return createUndefinedExpression();
      }

      return createFunctionDeclaration(
          PredefinedName.INIT,
          createEmptyParameterList(),
          createBlock(init));
    },

    /**
     * @param {AggregateSymbol} sym
     * @return {ParseTree}
     */
    createStaticConstructor_: function(sym) {
      var method = sym.getStaticConstructor();
      if (!method) {
        return createNullLiteral();
      } else {
        var methodTree = method.tree;
        return this.transformStaticMethod_(
            sym,
            createParameters(methodTree.formalParameterList),
            methodTree.functionBody);
      }
    },

    /**
     * @param {AggregateSymbol} sym
     * @return {ParseTree}
     */
    createConstructor_: function(sym) {
      var method = sym.getConstructor();
      if (!method) {
        return createNullLiteral();
      } else {
        return createFunctionExpression(
            method.tree.formalParameterList,
            this.transformMethodBody_(method));
      }
    },

    /**
     * @param {AggregateSymbol} sym
     * @return {Array.<ParseTree>}
     */
    transformFieldInitializers_: function(sym) {

      // this class's field initializers
      var transformer = this.createFunctionTransformer_(sym);
      var results = sym.getInstanceFields().map(function(field) {
        var initializer;
        if (field.tree.initializer == null) {
          initializer = createUndefinedExpression();
        } else {
          initializer = transformer.transformAny(field.tree.initializer);
        }

        // Object.defineProperty(
        //    this,
        //    field.name,
        //    {
        //        value: initializer,
        //        writable: field.isConst,
        //        enumerable: true,
        //        configurable: true
        //    }
        return createCallStatement(
            createMemberExpression(PredefinedName.OBJECT, PredefinedName.DEFINE_PROPERTY),
            createArgumentList(
                createThisExpression(),
                createStringLiteral(field.name),
                createObjectLiteralExpression(
                    createPropertyNameAssignment(PredefinedName.VALUE, initializer),
                    createPropertyNameAssignment(PredefinedName.WRITABLE, createBooleanLiteral(!field.isConst())),
                    createPropertyNameAssignment(PredefinedName.ENUMERABLE, createTrueLiteral()),
                    createPropertyNameAssignment(PredefinedName.CONFIGURABLE, createTrueLiteral()))));
      });

      return results;
    },

    /**
     * Helper to create a FunctionTransformer
     * @param {Symbol} sym
     * @return {FunctionTransformer}
     */
    createFunctionTransformer_: function(sym) {
      return new FunctionTransformer(this.reporter_, sym);
    }
  };

  return {
    ClassTransformer: ClassTransformer
  };
});
