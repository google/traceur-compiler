
goog.provide('goog.ui.tree.TreeNode'); 
goog.require('goog.ui.tree.BaseNode'); 
goog.ui.tree.TreeNode = function(html, opt_config, opt_domHelper) { 
  goog.ui.tree.BaseNode.call(this, html, opt_config, opt_domHelper); 
}; 
goog.inherits(goog.ui.tree.TreeNode, goog.ui.tree.BaseNode); 
goog.ui.tree.TreeNode.prototype.tree_ = null; 
goog.ui.tree.TreeNode.prototype.getTree = function() { 
  if(this.tree_) { 
    return this.tree_; 
  } 
  var parent = this.getParent(); 
  if(parent) { 
    var tree = parent.getTree(); 
    if(tree) { 
      this.setTreeInternal(tree); 
      return tree; 
    } 
  } 
  return null; 
}; 
goog.ui.tree.TreeNode.prototype.getCalculatedIconClass = function() { 
  var expanded = this.getExpanded(); 
  if(expanded && this.expandedIconClass_) { 
    return this.expandedIconClass_; 
  } 
  if(! expanded && this.iconClass_) { 
    return this.iconClass_; 
  } 
  var config = this.getConfig(); 
  if(this.hasChildren()) { 
    if(expanded && config.cssExpandedFolderIcon) { 
      return config.cssTreeIcon + ' ' + config.cssExpandedFolderIcon; 
    } else if(! expanded && config.cssCollapsedFolderIcon) { 
      return config.cssTreeIcon + ' ' + config.cssCollapsedFolderIcon; 
    } 
  } else { 
    if(config.cssFileIcon) { 
      return config.cssTreeIcon + ' ' + config.cssFileIcon; 
    } 
  } 
  return ''; 
}; 
