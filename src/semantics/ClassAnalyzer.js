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

traceur.define('semantics', function() {
  'use strict';

  var PredefinedName = traceur.syntax.PredefinedName;
  var SourceFile = traceur.syntax.SourceFile;
  var Token = traceur.syntax.Token;
  var TokenType = traceur.syntax.TokenType;
  var ClassDeclaration = traceur.syntax.trees.ClassDeclaration;
  var ExportDeclaration = traceur.syntax.trees.ExportDeclaration;
  var FieldDeclaration = traceur.syntax.trees.FieldDeclaration;
  var FunctionDeclaration = traceur.syntax.trees.FunctionDeclaration;
  var GetAccessor = traceur.syntax.trees.GetAccessor;
  var MixinResolve = traceur.syntax.trees.MixinResolve;
  var Mixin = traceur.syntax.trees.Mixin;
  var ModuleDefinition = traceur.syntax.trees.ModuleDefinition;
  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var Program = traceur.syntax.trees.Program;
  var RequiresMember = traceur.syntax.trees.RequiresMember;
  var SetAccessor = traceur.syntax.trees.SetAccessor;
  var TraitDeclaration = traceur.syntax.trees.TraitDeclaration;
  var VariableDeclaration = traceur.syntax.trees.VariableDeclaration;
  var VariableStatement = traceur.syntax.trees.VariableStatement;
  var ErrorReporter = traceur.util.ErrorReporter;
  var ClassSymbol = traceur.semantics.symbols.ClassSymbol;
  var TraitSymbol = traceur.semantics.symbols.TraitSymbol;
  var SymbolType = traceur.semantics.symbols.SymbolType;
  var MethodSymbol = traceur.semantics.symbols.MethodSymbol;
  var PropertySymbol = traceur.semantics.symbols.PropertySymbol;
  var FieldSymbol = traceur.semantics.symbols.FieldSymbol;
  var AggregateSymbol = traceur.semantics.symbols.AggregateSymbol;
  var GetAccessor = traceur.semantics.symbols.GetAccessor;
  var SetAccessor = traceur.semantics.symbols.SetAccessor;
  var RequiresSymbol = traceur.semantics.symbols.RequiresSymbol;

  /**
   * Analyzes a class or trait and creates an AggregateSymbol. This class just
   * collects data for use later by ClassTransformer. The analysis isn't much
   * more than duplicate member checking--so it could quite possibly be folded
   * into ClassTransformer.
   *
   * @param {ErrorReporter} reporter
   * @constructor
   */
  function ClassAnalyzer(reporter) {
    this.reporter_ = reporter;
  }

  /**
   * Analyzes a class and creates a ClassSymbol
   * @param {ErrorReporter} reporter
   * @param {ClassDeclaration} tree
   * @return {ClassSymbol}
   */
  ClassAnalyzer.analyzeClass = function(reporter, tree) {
    return new ClassAnalyzer(reporter).declareAggregate_(tree, ClassSymbol);
  }

  /**
   * Analyzes a trait and creates a TraitSymbol
   * @param {ErrorReporter} reporter
   * @param {TraitDeclaration} tree
   * @return {TraitSymbol}
   */
  ClassAnalyzer.analyzeTrait = function(reporter, tree) {
    return new ClassAnalyzer(reporter).declareAggregate_(tree, TraitSymbol);
  }

  ClassAnalyzer.prototype = {
    /**
     * @param {ClassDeclaration|TraitDeclaration} tree
     * @param {Function} symbolType
     * @return {AggregateSymbol}
     */
    declareAggregate_: function(tree, symbolType) {
      var symbol = new symbolType(tree.name.value, tree);
      this.declareAggregateMembers_(symbol);
      return symbol;
    },

    /** @param {AggregateSymbol} symbol */
    declareAggregateMembers_: function(symbol) {
      symbol.tree.elements.forEach(function(memberTree) {
        this.declareAggregateMember_(symbol, memberTree);
      }, this);
    },

    /**
     * @param {AggregateSymbol} aggregate
     * @param {ParseTree} memberTree
     */
    declareAggregateMember_: function(aggregate, memberTree) {
      switch (memberTree.type) {
        case ParseTreeType.FUNCTION_DECLARATION:
          this.declareFunctionMember_(aggregate, memberTree);
          break;
        case ParseTreeType.FIELD_DECLARATION:
          this.declareFieldMembers_(aggregate, memberTree);
          break;
        case ParseTreeType.GET_ACCESSOR:
          this.declareAccessor_(aggregate, memberTree, 'get', GetAccessor);
          break;
        case ParseTreeType.SET_ACCESSOR:
          this.declareAccessor_(aggregate, memberTree, 'set', SetAccessor);
          break;
        case ParseTreeType.MIXIN:
          aggregate.mixins.push(memberTree);
          break;
        case ParseTreeType.REQUIRES_MEMBER:
          this.declareRequiresMember_(aggregate, memberTree);
          break;
        default:
          throw new Error('Unrecognized parse tree in class declaration:' + memberTree.type);
      }
    },

    /**
     * @param {AggregateSymbol} aggregate
     * @param {RequiresMember} tree
     */
    declareRequiresMember_: function(aggregate, tree) {
      var name = tree.name.value;
      if (!this.checkForDuplicateMemberDeclaration_(aggregate, tree, name, false)) {
        new RequiresSymbol(tree, name, aggregate);
      }
    },

    /**
     * @param {AggregateSymbol} aggregate
     * @param {FieldDeclaration} tree
     */
    declareFieldMembers_: function(aggregate, tree) {
      tree.declarations.forEach(function(declarationTree) {
        this.declareFieldMember_(aggregate, tree, declarationTree);
      }, this);
    },

    /**
     * @param {AggregateSymbol} aggregate
     * @param {FieldDeclaration} field
     * @param {VariableDeclaration} tree
     */
    declareFieldMember_: function(aggregate, field, tree) {
      var name = null;
      switch (tree.lvalue.type) {
        case ParseTreeType.IDENTIFIER_EXPRESSION:
          name = tree.lvalue.identifierToken.value;
          break;
        default:
          // TODO: Should destructuring be allowed in a field declaration?
          this.reportError_(tree, 'Cannot use destructuring in a field declaration');
          break;
      }
      if (PredefinedName.NEW == name) {
        this.reportError_(tree, 'Cannot name a field "new"');
        return;
      }
      if (!this.checkForDuplicateMemberDeclaration_(aggregate, tree, name, field.isStatic)) {
        new FieldSymbol(field, tree, name, aggregate);
      }
    },

    /**
     * @param {AggregateSymbol} aggregate
     * @param {string} kind
     * @param {Function} ctor
     * @param {ParseTree} tree
     */
    declareAccessor_: function(aggregate, tree, kind, ctor) {
      var name = this.getPropertyName_(tree, tree.propertyName);
      if (name == null) {
        return;
      }
      var property = this.getOrCreateProperty_(aggregate, name, tree, tree.isStatic);
      if (property == null) {
        return;
      }
      if (property[kind] != null) {
        this.reportError_(tree, 'Duplicate "%s" accessor "%s"', kind, name);
        this.reportRelatedError_(property[kind].tree);
        return;
      }
      property[kind] = new ctor(property, tree);
    },

    /**
     * @param {AggregateSymbol} aggregate
     * @param {string} name
     * @param {ParseTree} tree
     * @param {boolean} isStatic
     * @return {PropertySymbol}
     */
    getOrCreateProperty_: function(aggregate, name, tree, isStatic) {
      if (isStatic && !aggregate.hasStaticMember(name) ||
          !isStatic && !aggregate.hasInstanceMember(name)) {
        return new PropertySymbol(tree, name, aggregate, isStatic);
      }
      var member = isStatic ? aggregate.getStaticMember(name) : aggregate.getInstanceMember(name);
      if (member.type != SymbolType.PROPERTY) {
        this.reportDuplicateMember_(aggregate, tree, name);
        return null;
      }
      return member;
    },

    /**
     * @param {ParseTree} tree
     * @param {Token} propertyName
     * @return {string}
     */
    getPropertyName_: function(tree, propertyName) {
      var name;
      switch (propertyName.type) {
        case TokenType.IDENTIFIER:
          name = propertyName.value;
          break;
        case TokenType.STRING:
          name = propertyName.value;
          break;
        case TokenType.NUMBER:
          throw new Error('TODO: Property with numeric names');
        default:
          throw new Error('Unexpected property name type');
      }
      if (name == PredefinedName.NEW) {
        this.reportError_(tree, 'Cannot name a property "new"');
        return null;
      }
      return name;
    },

    /**
     * @param {AggregateSymbol} aggregate
     * @param {FunctionDeclaration} tree
     * @return {MethodSymbol}
     */
    declareFunctionMember_: function(aggregate, tree) {
      // TODO: validate super constructor call
      var name = tree.name.value;
      if (!this.checkForDuplicateMemberDeclaration_(aggregate, tree, name, tree.isStatic)) {
        return new MethodSymbol(tree, name, aggregate, tree.isStatic);
      }
      return null;
    },

    /**
     * @param {AggregateSymbol} aggregate
     * @param {ParseTree} tree
     * @param {string} name
     * @param {boolean} isStatic
     * @return {boolean}
     */
    checkForDuplicateMemberDeclaration_: function(aggregate, tree, name, isStatic) {
      if (isStatic && aggregate.hasStaticMember(name) ||
          !isStatic && aggregate.hasInstanceMember(name)) {
        this.reportDuplicateMember_(aggregate, tree, name);
        return true;
      }
      return false;
    },

    /**
     * @param {AggregateSymbol} aggregate
     * @param {ParseTree} tree
     * @param {string} name
     */
    reportDuplicateMember_: function(aggregate, tree, name) {
      this.reportError_(tree, 'Duplicate member "%s"', name);
      this.reportRelatedError_(aggregate.getInstanceMember(name));
    },

    /**
     * @param {Symbol|ParseTree} treeOrSymbol
     * @param {string} format
     * @param {...Object} var_args
     */
    reportError_: function(treeOrSymbol, format, var_args) {
      if (treeOrSymbol instanceof Symbol) {
        treeOrSymbol = treeOrSymbol.tree;
      }
      var args = Array.prototype.slice.call(arguments, 2);
      this.reporter_.reportError(treeOrSymbol.location.start, format, args);
    },

    /** @param {Symbol|ParseTree} treeOrSymbol*/
    reportRelatedError_: function(treeOrSymbol) {
      var msg = 'Location related to previous error';
      if (treeOrSymbol instanceof Symbol) {
        symbol.getRelatedLocations().forEach(function(loc) {
          this.reportError_(loc, msg);
        }, this);
      } else {
        this.reportError_(tree, msg);
      }
    }
  };

  return {
    ClassAnalyzer: ClassAnalyzer
  };
});
