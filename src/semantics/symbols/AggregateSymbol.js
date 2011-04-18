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

traceur.define('semantics.symbols', function() {
  'use strict';

  var Symbol = traceur.semantics.symbols.Symbol;
  var PredefinedName = traceur.syntax.PredefinedName;
  var FieldSymbol = traceur.semantics.symbols.FieldSymbol;
  var MethodSymbol = traceur.semantics.symbols.MethodSymbol;

  function values(object) {
    return Object.keys(object).map(function(key) {
      return object[key];
    });
  }

  /**
   * Aggregate State progresses forward, never goes backwards.
   * @enum {number}
   */
  var State = {
    Declared: 1,
    BeginDeclaringMembers: 2,
    MembersDeclared: 3
  };


  /**
   * A base class for ClassSymbol and TraitSymbol. Also has one short-lived derived class MixinSymbol.
   *
   * Aggregates have a state which moves forward from Declared, to SuperClassResolved, to
   * MembersDeclared. An aggregate must transition through all intermediate states on its way to
   * MemberDeclared. An aggregate state never goes backwards.
   *
   * @param {SymbolType} type
   * @param {ParseTree} tree
   * @param {string} name
   * @constructor
   * @extends {Symbol}
   */
  function AggregateSymbol(type, tree, name) {
    Symbol.call(this, type, tree, name);

    this.state_ = State.Declared;
    this.instanceMembers = Object.create(null);
    this.staticMembers = Object.create(null);
    this.mixins = [];
  }

  AggregateSymbol.prototype = {
    __proto__: Symbol.prototype,

    /**
     * @return {boolean}
     */
    isDeclaringMembers: function() {
      return this.state_ == State.BeginDeclaringMembers;
    },

    /**
     * @return {boolean}
     */
    isMembersDeclared: function() {
      return this.state_ == State.MembersDeclared;
    },

    /**
     * @return {void}
     */
    beginDeclaringMembers: function() {
      this.state_ = State.BeginDeclaringMembers;
    },

    /**
     * @return {void}
     */
    endDeclaringMembers: function() {
      if (!this.isDeclaringMembers()) {
        throw new Error();
      }
      this.state_ = State.MembersDeclared;
    },

    /**
     * Returns an instance member with a given name defined in this class or one of this class's base class.
     *
     * @param {string} name
     * @return {MemberSymbol}
     */
    lookupInstanceSymbol: function(name) {
      return this.getInstanceMember(name);
    },

    /**
     * Does this class contain an instance member with name. Does not search base classes.
     *
     * @param {string} name
     * @return {boolean}
     */
    hasInstanceMember: function(name) {
      return name in this.instanceMembers;
    },

    /**
     * Does this class contain a static member with name. Does not search base classes.
     *
     * @param {string} name
     * @return {boolean}
     */
    hasStaticMember: function(name) {
      return name in this.staticMembers;
    },

    /**
     * Returns an instance member defined in this class with a given name. Does not search base classes.
     *
     * @param {string} name
     * @return {MemberSymbol}
     */
    getInstanceMember: function(name) {
      return this.instanceMembers[name];
    },

    /**
     * Returns a static member defined in this class with a given name. Does not search base classes.
     */
    /**
     * @param {string} name
     * @return {MemberSymbol}
     */
    getStaticMember: function(name) {
      return this.staticMembers[name];
    },

    /**
     * @param {MemberSymbol} member
     * @return {void}
     */
    addMember: function(member) {
      var map = member.isStatic ? this.staticMembers : this.instanceMembers;
      delete map[member.name];
      map[member.name] = member;
    },

    /**
     * @return {Array.<MemberSymbol>}
     */
    getInstanceMembers: function() {
      return values(this.instanceMembers);
    },

    /**
     * @return {Array.<MemberSymbol>}
     */
    getStaticMembers: function() {
      return values(this.staticMembers);
    },

    /**
     * @return {Array.<MethodSymbol>}
     */
    getInstanceMethods: function() {
      return this.getInstanceMembers().filter(function(m) {
        return m instanceof MethodSymbol;
      });
    },

    /**
     * @return {Array.<FieldSymbol>}
     */
    getInstanceFields: function() {
      return this.getInstanceMembers().filter(function(m) {
        return m instanceof FieldSymbol;
      });
    },

    /**
     * @return {MethodSymbol}
     */
    getConstructor: function() {
      return this.getInstanceMember(PredefinedName.NEW);
    },

    /**
     * @return {MethodSymbol}
     */
    getStaticConstructor: function() {
      return this.getStaticMember(PredefinedName.NEW);
    },

    /**
     * @return {boolean}
     */
    hasConstructor: function() {
      return !!this.getConstructor();
    }
  };

  return {
    AggregateSymbol: AggregateSymbol
  };
});
