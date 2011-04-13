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

traceur.define('codegeneration.generator', function() {
  'use strict';

  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var BreakStatementTree = traceur.syntax.trees.BreakStatementTree;
  var ContinueStatementTree = traceur.syntax.trees.ContinueStatementTree;
  var DoWhileStatementTree = traceur.syntax.trees.DoWhileStatementTree;
  var ForEachStatementTree = traceur.syntax.trees.ForEachStatementTree;
  var ForStatementTree = traceur.syntax.trees.ForStatementTree;
  var FunctionDeclarationTree = traceur.syntax.trees.FunctionDeclarationTree;
  var ParseTree = traceur.syntax.trees.ParseTree;
  var SwitchStatementTree = traceur.syntax.trees.SwitchStatementTree;
  var WhileStatementTree = traceur.syntax.trees.WhileStatementTree;

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;

  var BreakState = traceur.codegeneration.generator.BreakState;
  var ContinueState = traceur.codegeneration.generator.ContinueState;
  var State = traceur.codegeneration.generator.State;
  var StateAllocator = traceur.codegeneration.generator.StateAllocator;
  var StateMachineTree = traceur.codegeneration.generator.StateMachineTree;

  var BoundIdentifierAccumulator = traceur.semantics.BoundIdentifierAccumulator;

  /**
   * Converts statements which do not contain a yield, to a state machine. Always called from a
   * context where the containing block contains a yield. Normally this just wraps the statement into
   * a single state StateMachineTree. However, if the statement contains a break or continue which
   * exits the statement, then the non-local break/continue must be converted into state machines.
   *
   * Note that parents of non-local break/continue statements are themselves translated into
   * state machines by the caller.
   *
   * @param {StateAllocator} stateAllocator
   * @extends {ParseTreeTransformer}
   * @constructor
   */
  function BreakContinueTransformer(stateAllocator) {
    ParseTreeTransformer.call(this);
    this.transformBreaks_ = true;
    this.stateAllocator_ = stateAllocator;
  }

  /**
   * @param {BreakStatementTree|ContinueStatementTree} tree
   * @return {string}
   */
  function safeGetLabel(tree) {
    return tree.name ? tree.name.value : null;
  }

  var proto = ParseTreeTransformer.prototype;
  BreakContinueTransformer.prototype = {
    __proto__: proto,

    /** @return {number} */
    allocateState_: function() {
      return this.stateAllocator_.allocateState();
    },

    /**
     * @param {State} newState
     * @return {StateMachibneTree}
     */
    stateToStateMachine_: function(newState) {
      // TODO: this shouldn't be required, but removing it requires making consumers resilient
      // TODO: to a machine with INVALID fallThroughState
      var fallThroughState = this.allocateState_();
      return new StateMachineTree(newState.id, fallThroughState, [newState], []);
    },

    /**
     * @param {BreakStatementTree} tree
     * @return {ParseTree}
     */
    transformBreakStatementTree: function(tree) {
      return this.transformBreaks_ ?
          this.stateToStateMachine_(new BreakState(this.allocateState_(), safeGetLabel(tree))) :
          tree;
    },

    /**
     * @param {ContinueStatementTree} tree
     * @return {ParseTree}
     */
    transformContinueStatementTree: function(tree) {
      return this.stateToStateMachine_(new ContinueState(this.allocateState_(), safeGetLabel(tree)));
    },

    /**
     * @param {DoWhileStatementTree} tree
     * @return {ParseTree}
     */
    transformDoWhileStatementTree: function(tree) {
      return tree;
    },

    /**
     * @param {ForEachStatementTree} tree
     * @return {ParseTree}
     */
    transformForEachStatementTree: function(tree) {
      return tree;
    },

    /**
     * @param {ForStatementTree} tree
     * @return {ParseTree}
     */
    transformForStatementTree: function(tree) {
      return tree;
    },

    /**
     * @param {FunctionDeclarationTree} tree
     * @return {ParseTree}
     */
    transformFunctionDeclarationTree: function(tree) {
      return tree;
    },

    /**
     * @param {StateMachineTree} tree
     * @return {ParseTree}
     */
    transformStateMachineTree: function(tree) {
      return tree;
    },

    /**
     * @param {SwitchStatementTree} tree
     * @return {ParseTree}
     */
    transformSwitchStatementTree: function(tree) {
      var oldState = this.transformBreaks_;
      this.transformBreaks = false;
      var result = proto.transformSwitchStatementTree.call(this, tree);
      this.transformBreaks_ = oldState;
      return result;
    },

    /**
     * @param {WhileStatementTree} tree
     * @return {ParseTree}
     */
    transformWhileStatementTree: function(tree) {
      return tree;
    }
  };

  return {
    BreakContinueTransformer: BreakContinueTransformer
  };
});
