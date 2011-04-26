
goog.provide('goog.editor.plugins.TableEditor'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.editor.Plugin'); 
goog.require('goog.editor.Table'); 
goog.require('goog.editor.node'); 
goog.require('goog.editor.range'); 
goog.require('goog.object'); 
goog.editor.plugins.TableEditor = function() { 
  goog.base(this); 
  this.isTableEditableFunctions_ =[]; 
  this.isUserEditableTableBound_ = goog.bind(this.isUserEditableTable_, this); 
}; 
goog.inherits(goog.editor.plugins.TableEditor, goog.editor.Plugin); 
goog.editor.plugins.TableEditor.prototype.getTrogClassId = function() { 
  return String(goog.getUid(this.constructor)); 
}; 
goog.editor.plugins.TableEditor.COMMAND = { 
  TABLE: '+table', 
  INSERT_ROW_AFTER: '+insertRowAfter', 
  INSERT_ROW_BEFORE: '+insertRowBefore', 
  INSERT_COLUMN_AFTER: '+insertColumnAfter', 
  INSERT_COLUMN_BEFORE: '+insertColumnBefore', 
  REMOVE_ROWS: '+removeRows', 
  REMOVE_COLUMNS: '+removeColumns', 
  SPLIT_CELL: '+splitCell', 
  MERGE_CELLS: '+mergeCells', 
  REMOVE_TABLE: '+removeTable' 
}; 
goog.editor.plugins.TableEditor.SUPPORTED_COMMANDS_ = goog.object.transpose(goog.editor.plugins.TableEditor.COMMAND); 
goog.editor.plugins.TableEditor.prototype.isSupportedCommand = function(command) { 
  return command in goog.editor.plugins.TableEditor.SUPPORTED_COMMANDS_; 
}; 
goog.editor.plugins.TableEditor.prototype.enable = function(fieldObject) { 
  goog.base(this, 'enable', fieldObject); 
  if(goog.userAgent.GECKO) { 
    var doc = this.getFieldDomHelper().getDocument(); 
    doc.execCommand('enableObjectResizing', false, 'true'); 
  } 
}; 
goog.editor.plugins.TableEditor.prototype.getCurrentTable_ = function() { 
  var selectedElement = this.fieldObject.getRange().getContainer(); 
  return this.getAncestorTable_(selectedElement); 
}; 
goog.editor.plugins.TableEditor.prototype.getAncestorTable_ = function(node) { 
  var ancestor = goog.dom.getAncestor(node, this.isUserEditableTableBound_, true); 
  if(goog.editor.node.isEditable(ancestor)) { 
    return(ancestor); 
  } else { 
    return null; 
  } 
}; 
goog.editor.plugins.TableEditor.prototype.queryCommandValue = function(command) { 
  if(command == goog.editor.plugins.TableEditor.COMMAND.TABLE) { 
    return ! ! this.getCurrentTable_(); 
  } 
}; 
goog.editor.plugins.TableEditor.prototype.execCommandInternal = function(command, opt_arg) { 
  var result = null; 
  var cursorCell = null; 
  var range = this.fieldObject.getRange(); 
  if(command == goog.editor.plugins.TableEditor.COMMAND.TABLE) { 
    if(! goog.editor.range.isEditable(range)) { 
      return null; 
    } 
    var tableProps = opt_arg || { 
      width: 4, 
      height: 2 
    }; 
    var doc = this.getFieldDomHelper().getDocument(); 
    var table = goog.editor.Table.createDomTable(doc, tableProps.width, tableProps.height); 
    range.replaceContentsWithNode(table); 
    if(! goog.userAgent.IE) { 
      cursorCell = table.getElementsByTagName('td')[0]; 
    } 
  } else { 
    var cellSelection = new goog.editor.plugins.TableEditor.CellSelection_(range, goog.bind(this.getAncestorTable_, this)); 
    var table = cellSelection.getTable(); 
    if(! table) { 
      return null; 
    } 
    switch(command) { 
      case goog.editor.plugins.TableEditor.COMMAND.INSERT_ROW_BEFORE: 
        table.insertRow(cellSelection.getFirstRowIndex()); 
        break; 

      case goog.editor.plugins.TableEditor.COMMAND.INSERT_ROW_AFTER: 
        table.insertRow(cellSelection.getLastRowIndex() + 1); 
        break; 

      case goog.editor.plugins.TableEditor.COMMAND.INSERT_COLUMN_BEFORE: 
        table.insertColumn(cellSelection.getFirstColumnIndex()); 
        break; 

      case goog.editor.plugins.TableEditor.COMMAND.INSERT_COLUMN_AFTER: 
        table.insertColumn(cellSelection.getLastColumnIndex() + 1); 
        break; 

      case goog.editor.plugins.TableEditor.COMMAND.REMOVE_ROWS: 
        var startRow = cellSelection.getFirstRowIndex(); 
        var endRow = cellSelection.getLastRowIndex(); 
        if(startRow == 0 && endRow ==(table.rows.length - 1)) { 
          return this.execCommandInternal(goog.editor.plugins.TableEditor.COMMAND.REMOVE_TABLE); 
        } 
        var startColumn = cellSelection.getFirstColumnIndex(); 
        var rowCount =(endRow - startRow) + 1; 
        for(var i = 0; i < rowCount; i ++) { 
          table.removeRow(startRow); 
        } 
        if(table.rows.length > 0) { 
          var closestRow = Math.min(startRow, table.rows.length - 1); 
          cursorCell = table.rows[closestRow].columns[startColumn].element; 
        } 
        break; 

      case goog.editor.plugins.TableEditor.COMMAND.REMOVE_COLUMNS: 
        var startCol = cellSelection.getFirstColumnIndex(); 
        var endCol = cellSelection.getLastColumnIndex(); 
        if(startCol == 0 && endCol ==(table.rows[0].columns.length - 1)) { 
          return this.execCommandInternal(goog.editor.plugins.TableEditor.COMMAND.REMOVE_TABLE); 
        } 
        var startRow = cellSelection.getFirstRowIndex(); 
        var removeCount =(endCol - startCol) + 1; 
        for(var i = 0; i < removeCount; i ++) { 
          table.removeColumn(startCol); 
        } 
        var currentRow = table.rows[startRow]; 
        if(currentRow) { 
          var closestCol = Math.min(startCol, currentRow.columns.length - 1); 
          cursorCell = currentRow.columns[closestCol].element; 
        } 
        break; 

      case goog.editor.plugins.TableEditor.COMMAND.MERGE_CELLS: 
        if(cellSelection.isRectangle()) { 
          table.mergeCells(cellSelection.getFirstRowIndex(), cellSelection.getFirstColumnIndex(), cellSelection.getLastRowIndex(), cellSelection.getLastColumnIndex()); 
        } 
        break; 

      case goog.editor.plugins.TableEditor.COMMAND.SPLIT_CELL: 
        if(cellSelection.containsSingleCell()) { 
          table.splitCell(cellSelection.getFirstRowIndex(), cellSelection.getFirstColumnIndex()); 
        } 
        break; 

      case goog.editor.plugins.TableEditor.COMMAND.REMOVE_TABLE: 
        table.element.parentNode.removeChild(table.element); 
        break; 

      default: 
    } 
  } 
  if(cursorCell) { 
    range = goog.dom.Range.createFromNodeContents(cursorCell); 
    range.collapse(false); 
    range.select(); 
  } 
  return result; 
}; 
goog.editor.plugins.TableEditor.prototype.isUserEditableTable_ = function(element) { 
  if(element.tagName != goog.dom.TagName.TABLE) { 
    return false; 
  } 
  return goog.array.every(this.isTableEditableFunctions_, function(func) { 
    return func(element); 
  }); 
}; 
goog.editor.plugins.TableEditor.prototype.addIsTableEditableFunction = function(func) { 
  goog.array.insert(this.isTableEditableFunctions_, func); 
}; 
goog.editor.plugins.TableEditor.CellSelection_ = function(range, getParentTableFunction) { 
  this.cells_ =[]; 
  var browserSelection = range.getBrowserRangeObject(); 
  var elementInSelection; 
  var selectionContainer; 
  if(browserSelection && browserSelection.rangeCount > 1) { 
    var rangeElements =[]; 
    for(var i = 0; i < browserSelection.rangeCount; i ++) { 
      var browserRange = browserSelection.getRangeAt(i); 
      rangeElements.push(browserRange.startContainer.childNodes[browserRange.startOffset]); 
    } 
    elementInSelection = function(element) { 
      for(var i = 0; i < rangeElements.length; i ++) { 
        if(element == rangeElements[i]) { 
          return true; 
        } 
      } 
      return false; 
    }; 
    selectionContainer = browserSelection.getRangeAt(0).startContainer; 
  } else { 
    selectionContainer = range.getContainerElement(); 
    elementInSelection = function(node) { 
      return selectionContainer == node || selectionContainer.parentNode == node || range.containsNode(node, false); 
    }; 
  } 
  var parentTableElement = selectionContainer && getParentTableFunction(selectionContainer); 
  if(! parentTableElement) { 
    return; 
  } 
  var parentTable = new goog.editor.Table(parentTableElement); 
  if(! parentTable.rows.length || ! parentTable.rows[0].columns.length) { 
    return; 
  } 
  for(var i = 0, row; row = parentTable.rows[i]; i ++) { 
    for(var j = 0, cell; cell = row.columns[j]; j ++) { 
      if(elementInSelection(cell.element)) { 
        if(! this.cells_.length) { 
          this.firstRowIndex_ = cell.startRow; 
          this.lastRowIndex_ = cell.endRow; 
          this.firstColIndex_ = cell.startCol; 
          this.lastColIndex_ = cell.endCol; 
        } else { 
          this.firstRowIndex_ = Math.min(this.firstRowIndex_, cell.startRow); 
          this.lastRowIndex_ = Math.max(this.lastRowIndex_, cell.endRow); 
          this.firstColIndex_ = Math.min(this.firstColIndex_, cell.startCol); 
          this.lastColIndex_ = Math.max(this.lastColIndex_, cell.endCol); 
        } 
        this.cells_.push(cell); 
      } 
    } 
  } 
  this.parentTable_ = parentTable; 
}; 
goog.editor.plugins.TableEditor.CellSelection_.prototype.getTable = function() { 
  return this.parentTable_; 
}; 
goog.editor.plugins.TableEditor.CellSelection_.prototype.getFirstRowIndex = function() { 
  return this.firstRowIndex_; 
}; 
goog.editor.plugins.TableEditor.CellSelection_.prototype.getLastRowIndex = function() { 
  return this.lastRowIndex_; 
}; 
goog.editor.plugins.TableEditor.CellSelection_.prototype.getFirstColumnIndex = function() { 
  return this.firstColIndex_; 
}; 
goog.editor.plugins.TableEditor.CellSelection_.prototype.getLastColumnIndex = function() { 
  return this.lastColIndex_; 
}; 
goog.editor.plugins.TableEditor.CellSelection_.prototype.getCells = function() { 
  return this.cells_; 
}; 
goog.editor.plugins.TableEditor.CellSelection_.prototype.isRectangle = function() { 
  if(! this.cells_.length) { 
    return false; 
  } 
  var firstCell = this.cells_[0]; 
  var lastCell = this.cells_[this.cells_.length - 1]; 
  return !(this.firstRowIndex_ < firstCell.startRow || this.lastRowIndex_ > lastCell.endRow || this.firstColIndex_ < firstCell.startCol || this.lastColIndex_ > lastCell.endCol); 
}; 
goog.editor.plugins.TableEditor.CellSelection_.prototype.containsSingleCell = function() { 
  var cellCount = this.cells_.length; 
  return cellCount > 0 &&(this.cells_[0]== this.cells_[cellCount - 1]); 
}; 
