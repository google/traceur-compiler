
goog.provide('goog.ui.TableSorter'); 
goog.provide('goog.ui.TableSorter.EventType'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.events.EventType'); 
goog.require('goog.functions'); 
goog.require('goog.ui.Component'); 
goog.ui.TableSorter = function(opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.column_ = - 1; 
  this.reversed_ = false; 
  this.defaultSortFunction_ = goog.ui.TableSorter.numericSort; 
  this.sortFunctions_ =[]; 
}; 
goog.inherits(goog.ui.TableSorter, goog.ui.Component); 
goog.ui.TableSorter.EventType = { 
  BEFORESORT: 'beforesort', 
  SORT: 'sort' 
}; 
goog.ui.TableSorter.prototype.canDecorate = function(element) { 
  return element.tagName == goog.dom.TagName.TABLE; 
}; 
goog.ui.TableSorter.prototype.enterDocument = function() { 
  goog.ui.TableSorter.superClass_.enterDocument.call(this); 
  var table = this.getElement(); 
  var headerRow = table.getElementsByTagName(goog.dom.TagName.TR)[0]; 
  goog.events.listen(headerRow, goog.events.EventType.CLICK, this.sort_, false, this); 
}; 
goog.ui.TableSorter.prototype.getSortColumn = function() { 
  return this.column_; 
}; 
goog.ui.TableSorter.prototype.isSortReversed = function() { 
  return this.reversed_; 
}; 
goog.ui.TableSorter.prototype.getDefaultSortFunction = function() { 
  return this.defaultSortFunction_; 
}; 
goog.ui.TableSorter.prototype.setDefaultSortFunction = function(sortFunction) { 
  this.defaultSortFunction_ = sortFunction; 
}; 
goog.ui.TableSorter.prototype.getSortFunction = function(column) { 
  return this.sortFunctions_[column]|| this.defaultSortFunction_; 
}; 
goog.ui.TableSorter.prototype.setSortFunction = function(column, sortFunction) { 
  this.sortFunctions_[column]= sortFunction; 
}; 
goog.ui.TableSorter.prototype.sort_ = function(e) { 
  var target =(e.target); 
  var th = goog.dom.getAncestorByTagNameAndClass(target, goog.dom.TagName.TH); 
  var col = th.cellIndex; 
  var reverse = col == this.column_ ? ! this.reversed_: false; 
  if(this.dispatchEvent(goog.ui.TableSorter.EventType.BEFORESORT)) { 
    if(this.sort(col, reverse)) { 
      this.dispatchEvent(goog.ui.TableSorter.EventType.SORT); 
    } 
  } 
}; 
goog.ui.TableSorter.prototype.sort = function(column, opt_reverse) { 
  var sortFunction = this.getSortFunction(column); 
  if(sortFunction === goog.ui.TableSorter.noSort) { 
    return false; 
  } 
  var table = this.getElement(); 
  var tBody = table.tBodies[0]; 
  var rows = tBody.rows; 
  var headers = table.tHead.rows[0].cells; 
  if(this.column_ >= 0) { 
    var oldHeader = headers[this.column_]; 
    goog.dom.classes.remove(oldHeader, this.reversed_ ? goog.getCssName('goog-tablesorter-sorted-reverse'): goog.getCssName('goog-tablesorter-sorted')); 
  } 
  this.reversed_ = ! ! opt_reverse; 
  var header = headers[column]; 
  var values =[]; 
  for(var i = 0, len = rows.length; i < len; i ++) { 
    var row = rows[i]; 
    var value = goog.dom.getTextContent(row.cells[column]); 
    values.push([value, row]); 
  } 
  var multiplier = this.reversed_ ? - 1: 1; 
  goog.array.stableSort(values, function(a, b) { 
    return sortFunction(a[0], b[0]) * multiplier; 
  }); 
  table.removeChild(tBody); 
  for(i = 0; i < len; i ++) { 
    tBody.appendChild(values[i][1]); 
  } 
  table.insertBefore(tBody, table.tBodies[0]|| null); 
  this.column_ = column; 
  goog.dom.classes.add(header, this.reversed_ ? goog.getCssName('goog-tablesorter-sorted-reverse'): goog.getCssName('goog-tablesorter-sorted')); 
  return true; 
}; 
goog.ui.TableSorter.noSort = goog.functions.error('no sort'); 
goog.ui.TableSorter.numericSort = function(a, b) { 
  return parseFloat(a) - parseFloat(b); 
}; 
goog.ui.TableSorter.alphaSort = goog.array.defaultCompare; 
goog.ui.TableSorter.createReverseSort = function(sortFunction) { 
  return function(a, b) { 
    return - 1 * sortFunction(a, b); 
  }; 
}; 
