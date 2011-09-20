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
  var Program = traceur.syntax.trees.Program;
  var ClassAnalyzer = traceur.semantics.ClassAnalyzer;
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var FunctionTransformer = traceur.codegeneration.FunctionTransformer;
  var ClassSymbol = traceur.semantics.symbols.ClassSymbol;
  var SymbolType = traceur.semantics.symbols.SymbolType;
  var MethodSymbol = traceur.semantics.symbols.MethodSymbol;
  var PropertySymbol = traceur.semantics.symbols.PropertySymbol;
  var FieldSymbol = traceur.semantics.symbols.FieldSymbol;
  var AggregateSymbol = traceur.semantics.symbols.AggregateSymbol;

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createArrayLiteralExpression = ParseTreeFactory.createArrayLiteralExpression;
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
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createNullLiteral = ParseTreeFactory.createNullLiteral;
  var createObjectLiteralExpression = ParseTreeFactory.createObjectLiteralExpression;
  var createParameterList = ParseTreeFactory.createParameterList;
  var createPropertyNameAssignment = ParseTreeFactory.createPropertyNameAssignment;
  var createSetAccessor = ParseTreeFactory.createSetAccessor;
  var createStringLiteral = ParseTreeFactory.createStringLiteral;
  var createThisExpression = ParseTreeFactory.createThisExpression;
  var createTrueLiteral = ParseTreeFactory.createTrueLiteral;
  var createUndefinedExpression = ParseTreeFactory.createUndefinedExpression;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;

  /**
   * Transforms a Traceur class or trait to JS.
   *
   * @param {ErrorReporter} reporter
   * @constructor
   * @extends {ParseTreeTransformer}
   */
  function ClassTransformer(reporter) {
    this.reporter_ = reporter;
  }

  /**
   * Transforms all classes and traits in the program
   *
   * @param {ErrorReporter} errors
   * @param {Program} tree
   * @return {Program}
   */
  ClassTransformer.transform = function(reporter, tree) {
    return new ClassTransformer(reporter).transformAny(tree);
  };

  function createRequiresExpression() {
    // traceur.truntime.trait.required
    return createMemberExpression(
        PredefinedName.TRACEUR,
        PredefinedName.RUNTIME,
        PredefinedName.TRAIT,
        PredefinedName.REQUIRED);
  }

  var proto = ParseTreeTransformer.prototype;
  ClassTransformer.prototype = traceur.createObject(proto, {

    /**
     * Transforms a single trait declaration
     *
     * @param {TraitDeclaration} tree
     * @return {ParseTree}
     */
    transformTraitDeclaration: function(tree) {
      tree = proto.transformTraitDeclaration.call(this, tree);
      var sym = ClassAnalyzer.analyzeTrait(this.reporter_, tree);

      //var <traitName> = traceur.truntime.createTrait(<prototype>, <mixins>)
      return createVariableStatement(
          TokenType.LET,
          sym.name,
          createCallExpression(
              createMemberExpression(
                  PredefinedName.TRACEUR,
                  PredefinedName.RUNTIME,
                  PredefinedName.CREATE_TRAIT),
              createArgumentList(
                  createObjectLiteralExpression(this.transformInstanceMembers_(sym)),
                  this.createMixins_(sym))));
    },

    /**
     * Transforms a single class declaration
     *
     * @param {ClassDeclaration} tree
     * @return {ParseTree}
     */
    transformClassDeclaration: function(tree) {
      tree = proto.transformClassDeclaration.call(this, tree);
      var sym = ClassAnalyzer.analyzeClass(this.reporter_, tree);

      var classInstance = createThisExpression();
      var baseClass = sym.tree.superClass;
      if (!baseClass) {
        baseClass = createNullLiteral();
      }

      // var <className> = traceur.runtime.createClass(base, <new>, <ctor>,
      //     <field init>, <prototype>, <static init>, <mixins>)
      return createVariableStatement(
          TokenType.LET,
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
                      createBlock(this.createStaticMembers_(classInstance, sym))),
                  this.createMixins_(sym))));
    },

    /**
     * @param {AggregateSymbol} sym
     * @return {ParseTree}
     */
    createMixins_: function(sym) {
      if (sym.mixins.length == 0) {
        return createNullLiteral();
      }
      return createArrayLiteralExpression(
          sym.mixins.map(this.createMixin_, this));
    },

    /**
     * @param {Mixin} mixin
     * @return {ParseTree}
     */
    createMixin_: function(mixin) {
      var trait = createIdentifierExpression(mixin.name);
      var resolves = mixin.mixinResolves;
      if (!resolves || resolves.resolves.length == 0) {
        return trait;
      }

      resolves = resolves.resolves.map(function(r) {
        return createPropertyNameAssignment(r.from,
            r.to == PredefinedName.REQUIRES ?
                createRequiresExpression() :
                createStringLiteral(r.to));
      });

      return createCallExpression(
          createMemberExpression(
              PredefinedName.TRACEUR,
              PredefinedName.RUNTIME,
              PredefinedName.TRAIT,
              PredefinedName.RESOLVE),
          createArgumentList(
              createObjectLiteralExpression(resolves),
              trait));
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
            result.push(this.transformStaticMethodAssignment_(classInstance, member));
            break;
          case SymbolType.PROPERTY:
            result.push(this.transformStaticAccessor_(classInstance, member));
            break;
          case SymbolType.FIELD:
            break;
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
            result.push(this.transformStaticField_(classInstance, member));
            break;
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
                createParameterList(set.tree.parameter),
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
              method.tree.formalParameterList,
              method.tree.functionBody));
    },

    /**
     * @param {AggregateSymbol} aggregate
     * @param {FormalParameterList} formalParameters
     * @param {Block} functionBody
     * @return {FunctionDeclaration}
     */
    transformStaticMethod_: function(aggregate, formalParameters, functionBody) {
      return createFunctionExpressionFormals(
          formalParameters,
          this.createFunctionTransformer_(aggregate).transformBlock(functionBody));
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
              result.push(this.transformInstanceMethod_(member));
            }
            break;
          case SymbolType.PROPERTY:
            var property = member;
            if (property.get != null) {
              result.push(this.transformInstanceGetAccessor_(property.get));
            }
            if (property.set != null) {
              result.push(this.transformInstanceSetAccessor_(property.set));
            }
            break;
          case SymbolType.FIELD:
            break;
          case SymbolType.REQUIRES:
            result.push(createPropertyNameAssignment(
                member.name, createRequiresExpression()));
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
          transformer.transformBlock(get.tree.body));
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
          transformer.transformBlock(set.tree.body));
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
     * @return {Block}
     */
    transformMethodBody_: function(method) {
      var body = method.tree.functionBody;
      return this.createFunctionTransformer_(method).transformBlock(body);
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
            methodTree.formalParameterList,
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
  });

  return {
    ClassTransformer: ClassTransformer
  };
});
