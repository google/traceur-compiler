
goog.provide('goog.ds.Expr'); 
goog.require('goog.ds.BasicNodeList'); 
goog.require('goog.ds.EmptyNodeList'); 
goog.require('goog.string'); 
goog.ds.Expr = function(opt_expr) { 
  if(opt_expr) { 
    this.setSource_(opt_expr); 
  } 
}; 
goog.ds.Expr.prototype.setSource_ = function(expr, opt_parts, opt_childExpr, opt_prevExpr) { 
  this.src_ = expr; 
  if(! opt_childExpr && ! opt_prevExpr) { 
    if(goog.string.endsWith(expr, goog.ds.Expr.String_.CAN_BE_EMPTY)) { 
      this.canBeEmpty_ = true; 
      expr = expr.substring(0, expr.length - 1); 
    } 
    if(goog.string.endsWith(expr, '()')) { 
      if(goog.string.endsWith(expr, goog.ds.Expr.String_.NAME_EXPR) || goog.string.endsWith(expr, goog.ds.Expr.String_.COUNT_EXPR) || goog.string.endsWith(expr, goog.ds.Expr.String_.POSITION_EXPR)) { 
        var lastPos = expr.lastIndexOf(goog.ds.Expr.String_.SEPARATOR); 
        if(lastPos != - 1) { 
          this.exprFn_ = expr.substring(lastPos + 1); 
          expr = expr.substring(0, lastPos); 
        } else { 
          this.exprFn_ = expr; 
          expr = goog.ds.Expr.String_.CURRENT_NODE_EXPR; 
        } 
        if(this.exprFn_ == goog.ds.Expr.String_.COUNT_EXPR) { 
          this.isCount_ = true; 
        } 
      } 
    } 
  } 
  this.parts_ = opt_parts || expr.split('/'); 
  this.size_ = this.parts_.length; 
  this.last_ = this.parts_[this.size_ - 1]; 
  this.root_ = this.parts_[0]; 
  if(this.size_ == 1) { 
    this.rootExpr_ = this; 
    this.isAbsolute_ = goog.string.startsWith(expr, '$'); 
  } else { 
    this.rootExpr_ = goog.ds.Expr.createInternal_(this.root_, null, this, null); 
    this.isAbsolute_ = this.rootExpr_.isAbsolute_; 
    this.root_ = this.rootExpr_.root_; 
  } 
  if(this.size_ == 1 && ! this.isAbsolute_) { 
    this.isCurrent_ =(expr == goog.ds.Expr.String_.CURRENT_NODE_EXPR || expr == goog.ds.Expr.String_.EMPTY_EXPR); 
    this.isJustAttribute_ = goog.string.startsWith(expr, goog.ds.Expr.String_.ATTRIBUTE_START); 
    this.isAllChildNodes_ = expr == goog.ds.Expr.String_.ALL_CHILD_NODES_EXPR; 
    this.isAllAttributes_ = expr == goog.ds.Expr.String_.ALL_ATTRIBUTES_EXPR; 
    this.isAllElements_ = expr == goog.ds.Expr.String_.ALL_ELEMENTS_EXPR; 
  } 
}; 
goog.ds.Expr.prototype.getSource = function() { 
  return this.src_; 
}; 
goog.ds.Expr.prototype.getLast = function() { 
  return this.last_; 
}; 
goog.ds.Expr.prototype.getParent = function() { 
  if(! this.parentExprSet_) { 
    if(this.size_ > 1) { 
      this.parentExpr_ = goog.ds.Expr.createInternal_(null, this.parts_.slice(0, this.parts_.length - 1), this, null); 
    } 
    this.parentExprSet_ = true; 
  } 
  return this.parentExpr_; 
}; 
goog.ds.Expr.prototype.getNext = function() { 
  if(! this.nextExprSet_) { 
    if(this.size_ > 1) { 
      this.nextExpr_ = goog.ds.Expr.createInternal_(null, this.parts_.slice(1), null, this); 
    } 
    this.nextExprSet_ = true; 
  } 
  return this.nextExpr_; 
}; 
goog.ds.Expr.prototype.getValue = function(opt_ds) { 
  if(opt_ds == null) { 
    opt_ds = goog.ds.DataManager.getInstance(); 
  } else if(this.isAbsolute_) { 
    opt_ds = opt_ds.getDataRoot ? opt_ds.getDataRoot(): goog.ds.DataManager.getInstance(); 
  } 
  if(this.isCount_) { 
    var nodes = this.getNodes(opt_ds); 
    return nodes.getCount(); 
  } 
  if(this.size_ == 1) { 
    return opt_ds.getChildNodeValue(this.root_); 
  } else if(this.size_ == 0) { 
    return opt_ds.get(); 
  } 
  var nextDs = opt_ds.getChildNode(this.root_); 
  if(nextDs == null) { 
    return null; 
  } else { 
    return this.getNext().getValue(nextDs); 
  } 
}; 
goog.ds.Expr.prototype.getNodes = function(opt_ds, opt_canCreate) { 
  return(this.getNodes_(opt_ds, false, opt_canCreate)); 
}; 
goog.ds.Expr.prototype.getNode = function(opt_ds, opt_canCreate) { 
  return(this.getNodes_(opt_ds, true, opt_canCreate)); 
}; 
goog.ds.Expr.prototype.getNodes_ = function(opt_ds, opt_selectOne, opt_canCreate) { 
  if(opt_ds == null) { 
    opt_ds = goog.ds.DataManager.getInstance(); 
  } else if(this.isAbsolute_) { 
    opt_ds = opt_ds.getDataRoot ? opt_ds.getDataRoot(): goog.ds.DataManager.getInstance(); 
  } 
  if(this.size_ == 0 && opt_selectOne) { 
    return opt_ds; 
  } else if(this.size_ == 0 && ! opt_selectOne) { 
    return new goog.ds.BasicNodeList([opt_ds]); 
  } else if(this.size_ == 1) { 
    if(opt_selectOne) { 
      return opt_ds.getChildNode(this.root_, opt_canCreate); 
    } else { 
      var possibleListChild = opt_ds.getChildNode(this.root_); 
      if(possibleListChild && possibleListChild.isList()) { 
        return possibleListChild.getChildNodes(); 
      } else { 
        return opt_ds.getChildNodes(this.root_); 
      } 
    } 
  } else { 
    var nextDs = opt_ds.getChildNode(this.root_, opt_canCreate); 
    if(nextDs == null && opt_selectOne) { 
      return null; 
    } else if(nextDs == null && ! opt_selectOne) { 
      return new goog.ds.EmptyNodeList(); 
    } 
    return this.getNext().getNodes_(nextDs, opt_selectOne, opt_canCreate); 
  } 
}; 
goog.ds.Expr.prototype.canBeEmpty_ = false; 
goog.ds.Expr.prototype.parts_ =[]; 
goog.ds.Expr.prototype.size_ = null; 
goog.ds.Expr.prototype.root_; 
goog.ds.Expr.prototype.last_ = null; 
goog.ds.Expr.prototype.isCurrent_ = false; 
goog.ds.Expr.prototype.isJustAttribute_ = false; 
goog.ds.Expr.prototype.isAllChildNodes_ = false; 
goog.ds.Expr.prototype.isAllAttributes_ = false; 
goog.ds.Expr.prototype.isAllElements_ = false; 
goog.ds.Expr.prototype.exprFn_ = null; 
goog.ds.Expr.prototype.parentExpr_ = null; 
goog.ds.Expr.prototype.nextExpr_ = null; 
goog.ds.Expr.create = function(expr) { 
  var result = goog.ds.Expr.cache_[expr]; 
  if(result == null) { 
    result = new goog.ds.Expr(expr); 
    goog.ds.Expr.cache_[expr]= result; 
  } 
  return result; 
}; 
goog.ds.Expr.createInternal_ = function(opt_expr, opt_parts, opt_childExpr, opt_prevExpr) { 
  var expr = opt_expr || opt_parts.join('/'); 
  var result = goog.ds.Expr.cache_[expr]; 
  if(result == null) { 
    result = new goog.ds.Expr(); 
    result.setSource_(expr, opt_parts, opt_childExpr, opt_prevExpr); 
    goog.ds.Expr.cache_[expr]= result; 
  } 
  return result; 
}; 
goog.ds.Expr.cache_ = { }; 
goog.ds.Expr.String_ = { 
  SEPARATOR: '/', 
  CURRENT_NODE_EXPR: '.', 
  EMPTY_EXPR: '', 
  ATTRIBUTE_START: '@', 
  ALL_CHILD_NODES_EXPR: '*|text()', 
  ALL_ATTRIBUTES_EXPR: '@*', 
  ALL_ELEMENTS_EXPR: '*', 
  NAME_EXPR: 'name()', 
  COUNT_EXPR: 'count()', 
  POSITION_EXPR: 'position()', 
  INDEX_START: '[', 
  INDEX_END: ']', 
  CAN_BE_EMPTY: '?' 
}; 
goog.ds.Expr.CURRENT = goog.ds.Expr.create(goog.ds.Expr.String_.CURRENT_NODE_EXPR); 
goog.ds.Expr.ALL_CHILD_NODES = goog.ds.Expr.create(goog.ds.Expr.String_.ALL_CHILD_NODES_EXPR); 
goog.ds.Expr.ALL_ELEMENTS = goog.ds.Expr.create(goog.ds.Expr.String_.ALL_ELEMENTS_EXPR); 
goog.ds.Expr.ALL_ATTRIBUTES = goog.ds.Expr.create(goog.ds.Expr.String_.ALL_ATTRIBUTES_EXPR); 
goog.ds.Expr.NAME = goog.ds.Expr.create(goog.ds.Expr.String_.NAME_EXPR); 
goog.ds.Expr.COUNT = goog.ds.Expr.create(goog.ds.Expr.String_.COUNT_EXPR); 
goog.ds.Expr.POSITION = goog.ds.Expr.create(goog.ds.Expr.String_.POSITION_EXPR); 
