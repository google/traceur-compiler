import {ScopeVisitor} from '../semantics/ScopeVisitor';

/**
 * FindIdentifiers class traverses a tree searching for identifier
 * expressions till it finds one that passes the filter function. The logic of
 * the filter function is provided by the caller of the class.
 *
 * This is used by FindBlockBindingInLoop to check if a function in a loop uses
 * any block variables that are declared in the surrounding loop.
 *
 * This class wants to both be a ScopeVisitor and a FindVisitor,
 * so FindVisitor's methods were copied and slightly modified here.
 */
export class FindIdentifiers extends ScopeVisitor {
  constructor(tree, filterFunction) {
    super();
    this.filterFunction_ = filterFunction;
    this.found_ = false;
    this.visitAny(tree);
  }

  visitIdentifierExpression(tree) {
    if (this.filterFunction_(tree.identifierToken.value, this.scope.tree)) {
      this.found = true;
    }
  }

  /**
   * Whether the searched for tree was found. Setting this to true aborts the
   * search.
   * @type {boolean}
   */
  get found() {
    return this.found_;
  }

  set found(v) {
    if (v) {
      this.found_ = true;
    }
  }

  visitAny(tree) {
    !this.found_ && tree && tree.visit(this);
  }

  visitList(list) {
    if (list) {
      for (var i = 0; !this.found_ && i < list.length; i++) {
        this.visitAny(list[i]);
      }
    }
  }
}
