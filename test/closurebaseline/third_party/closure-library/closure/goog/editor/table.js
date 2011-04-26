
goog.provide('goog.editor.Table'); 
goog.provide('goog.editor.TableCell'); 
goog.provide('goog.editor.TableRow'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.string.Unicode'); 
goog.require('goog.style'); 
goog.editor.Table = function(node) { 
  this.element = goog.dom.getAncestorByTagNameAndClass(node, goog.dom.TagName.TABLE); 
  if(! this.element) { 
    this.logger_.severe("Can't create Table based on a node " + "that isn't a table, or descended from a table."); 
  } 
  this.dom_ = goog.dom.getDomHelper(this.element); 
  this.refresh(); 
}; 
goog.editor.Table.prototype.logger_ = goog.debug.Logger.getLogger('goog.editor.Table'); 
goog.editor.Table.prototype.refresh = function() { 
  var rows = this.rows =[]; 
  var tbody = this.element.getElementsByTagName(goog.dom.TagName.TBODY)[0]; 
  if(! tbody) { 
    return; 
  } 
  var trs =[]; 
  for(var child = tbody.firstChild; child; child = child.nextSibling) { 
    if(child.nodeName == goog.dom.TagName.TR) { 
      trs.push(child); 
    } 
  } 
  for(var rowNum = 0, tr; tr = trs[rowNum]; rowNum ++) { 
    var existingRow = rows[rowNum]; 
    var tds = goog.editor.Table.getChildCellElements(tr); 
    var columnNum = 0; 
    for(var cellNum = 0, td; td = tds[cellNum]; cellNum ++) { 
      while(existingRow && existingRow.columns[columnNum]) { 
        columnNum ++; 
      } 
      var cell = new goog.editor.TableCell(td, rowNum, columnNum); 
      for(var i = 0; i < cell.rowSpan; i ++) { 
        var cellRowNum = rowNum + i; 
        var cellRow = rows[cellRowNum]; 
        if(! cellRow) { 
          rows.push(cellRow = new goog.editor.TableRow(trs[cellRowNum], cellRowNum)); 
        } 
        var minimumColumnLength = columnNum + cell.colSpan; 
        if(cellRow.columns.length < minimumColumnLength) { 
          cellRow.columns.length = minimumColumnLength; 
        } 
        for(var j = 0; j < cell.colSpan; j ++) { 
          var cellColumnNum = columnNum + j; 
          cellRow.columns[cellColumnNum]= cell; 
        } 
      } 
      columnNum += cell.colSpan; 
    } 
  } 
}; 
goog.editor.Table.getChildCellElements = function(tr) { 
  var cells =[]; 
  for(var i = 0, cell; cell = tr.childNodes[i]; i ++) { 
    if(cell.nodeName == goog.dom.TagName.TD || cell.nodeName == goog.dom.TagName.TH) { 
      cells.push(cell); 
    } 
  } 
  return cells; 
}; 
goog.editor.Table.prototype.insertRow = function(opt_rowIndex) { 
  var rowIndex = goog.isDefAndNotNull(opt_rowIndex) ? opt_rowIndex: this.rows.length; 
  var refRow; 
  var insertAfter; 
  if(rowIndex == 0) { 
    refRow = this.rows[0]; 
    insertAfter = false; 
  } else { 
    refRow = this.rows[rowIndex - 1]; 
    insertAfter = true; 
  } 
  var newTr = this.dom_.createElement('tr'); 
  for(var i = 0, cell; cell = refRow.columns[i]; i += 1) { 
    if((insertAfter && cell.endRow > rowIndex) ||(! insertAfter && cell.startRow < rowIndex)) { 
      cell.setRowSpan(cell.rowSpan + 1); 
      if(cell.colSpan > 1) { 
        i += cell.colSpan - 1; 
      } 
    } else { 
      newTr.appendChild(this.createEmptyTd()); 
    } 
    if(insertAfter) { 
      goog.dom.insertSiblingAfter(newTr, refRow.element); 
    } else { 
      goog.dom.insertSiblingBefore(newTr, refRow.element); 
    } 
  } 
  this.refresh(); 
  return newTr; 
}; 
goog.editor.Table.prototype.insertColumn = function(opt_colIndex) { 
  var colIndex = goog.isDefAndNotNull(opt_colIndex) ? opt_colIndex:(this.rows[0]&& this.rows[0].columns.length) || 0; 
  var newTds =[]; 
  for(var rowNum = 0, row; row = this.rows[rowNum]; rowNum ++) { 
    var existingCell = row.columns[colIndex]; 
    if(existingCell && existingCell.endCol >= colIndex && existingCell.startCol < colIndex) { 
      existingCell.setColSpan(existingCell.colSpan + 1); 
      rowNum += existingCell.rowSpan - 1; 
    } else { 
      var newTd = this.createEmptyTd(); 
      newTd.style.width = goog.editor.Table.OPTIMUM_EMPTY_CELL_WIDTH + 'px'; 
      this.insertCellElement(newTd, rowNum, colIndex); 
      newTds.push(newTd); 
    } 
  } 
  this.refresh(); 
  return newTds; 
}; 
goog.editor.Table.prototype.removeRow = function(rowIndex) { 
  var row = this.rows[rowIndex]; 
  if(! row) { 
    this.logger_.warning("Can't remove row at position " + rowIndex + ': no such row.'); 
  } 
  for(var i = 0, cell; cell = row.columns[i]; i += cell.colSpan) { 
    if(cell.rowSpan > 1) { 
      cell.setRowSpan(cell.rowSpan - 1); 
      if(cell.startRow == rowIndex) { 
        this.insertCellElement(cell.element, rowIndex + 1, cell.startCol); 
      } 
    } 
  } 
  row.element.parentNode.removeChild(row.element); 
  this.refresh(); 
}; 
goog.editor.Table.prototype.removeColumn = function(colIndex) { 
  for(var i = 0, row; row = this.rows[i]; i ++) { 
    var cell = row.columns[colIndex]; 
    if(! cell) { 
      this.logger_.severe("Can't remove cell at position " + i + ', ' + colIndex + ': no such cell.'); 
    } 
    if(cell.colSpan > 1) { 
      cell.setColSpan(cell.colSpan - 1); 
    } else { 
      cell.element.parentNode.removeChild(cell.element); 
    } 
    i += cell.rowSpan - 1; 
  } 
  this.refresh(); 
}; 
goog.editor.Table.prototype.mergeCells = function(startRowIndex, startColIndex, endRowIndex, endColIndex) { 
  var cells =[]; 
  var cell; 
  if(startRowIndex == endRowIndex && startColIndex == endColIndex) { 
    this.logger_.warning("Can't merge single cell"); 
    return false; 
  } 
  for(var i = startRowIndex; i <= endRowIndex; i ++) { 
    for(var j = startColIndex; j <= endColIndex; j ++) { 
      cell = this.rows[i].columns[j]; 
      if(cell.startRow < startRowIndex || cell.endRow > endRowIndex || cell.startCol < startColIndex || cell.endCol > endColIndex) { 
        this.logger_.warning("Can't merge cells: the cell in row " + i + ', column ' + j + 'extends outside the supplied rectangle.'); 
        return false; 
      } 
      cells.push(cell); 
    } 
  } 
  var targetCell = cells[0]; 
  var targetTd = targetCell.element; 
  var doc = this.dom_.getDocument(); 
  for(var i = 1; cell = cells[i]; i ++) { 
    var td = cell.element; 
    if(! td.parentNode || td == targetTd) { 
      continue; 
    } 
    if(targetTd.lastChild && targetTd.lastChild.nodeType == goog.dom.NodeType.TEXT) { 
      targetTd.appendChild(doc.createTextNode(' ')); 
    } 
    var childNode; 
    while((childNode = td.firstChild)) { 
      targetTd.appendChild(childNode); 
    } 
    td.parentNode.removeChild(td); 
  } 
  targetCell.setColSpan((endColIndex - startColIndex) + 1); 
  targetCell.setRowSpan((endRowIndex - startRowIndex) + 1); 
  if(endColIndex > startColIndex) { 
    targetTd.removeAttribute('width'); 
    targetTd.style.width = null; 
  } 
  this.refresh(); 
  return true; 
}; 
goog.editor.Table.prototype.splitCell = function(rowIndex, colIndex) { 
  var row = this.rows[rowIndex]; 
  var cell = row.columns[colIndex]; 
  var newTds =[]; 
  for(var i = 0; i < cell.rowSpan; i ++) { 
    for(var j = 0; j < cell.colSpan; j ++) { 
      if(i > 0 || j > 0) { 
        var newTd = this.createEmptyTd(); 
        this.insertCellElement(newTd, rowIndex + i, colIndex + j); 
        newTds.push(newTd); 
      } 
    } 
  } 
  cell.setColSpan(1); 
  cell.setRowSpan(1); 
  this.refresh(); 
  return newTds; 
}; 
goog.editor.Table.prototype.insertCellElement = function(td, rowIndex, colIndex) { 
  var row = this.rows[rowIndex]; 
  var nextSiblingElement = null; 
  for(var i = colIndex, cell; cell = row.columns[i]; i += cell.colSpan) { 
    if(cell.startRow == rowIndex) { 
      nextSiblingElement = cell.element; 
      break; 
    } 
  } 
  row.element.insertBefore(td, nextSiblingElement); 
}; 
goog.editor.Table.prototype.createEmptyTd = function() { 
  return this.dom_.createDom(goog.dom.TagName.TD, { }, goog.string.Unicode.NBSP); 
}; 
goog.editor.TableRow = function(trElement, rowIndex) { 
  this.index = rowIndex; 
  this.element = trElement; 
  this.columns =[]; 
}; 
goog.editor.TableCell = function(td, startRow, startCol) { 
  this.element = td; 
  this.colSpan = parseInt(td.colSpan, 10) || 1; 
  this.rowSpan = parseInt(td.rowSpan, 10) || 1; 
  this.startRow = startRow; 
  this.startCol = startCol; 
  this.updateCoordinates_(); 
}; 
goog.editor.TableCell.prototype.updateCoordinates_ = function() { 
  this.endCol = this.startCol + this.colSpan - 1; 
  this.endRow = this.startRow + this.rowSpan - 1; 
}; 
goog.editor.TableCell.prototype.setColSpan = function(colSpan) { 
  if(colSpan != this.colSpan) { 
    if(colSpan > 1) { 
      this.element.colSpan = colSpan; 
    } else { 
      this.element.colSpan = 1, this.element.removeAttribute('colSpan'); 
    } 
    this.colSpan = colSpan; 
    this.updateCoordinates_(); 
  } 
}; 
goog.editor.TableCell.prototype.setRowSpan = function(rowSpan) { 
  if(rowSpan != this.rowSpan) { 
    if(rowSpan > 1) { 
      this.element.rowSpan = rowSpan.toString(); 
    } else { 
      this.element.rowSpan = '1'; 
      this.element.removeAttribute('rowSpan'); 
    } 
    this.rowSpan = rowSpan; 
    this.updateCoordinates_(); 
  } 
}; 
goog.editor.Table.OPTIMUM_EMPTY_CELL_WIDTH = 60; 
goog.editor.Table.OPTIMUM_MAX_NEW_TABLE_WIDTH = 600; 
goog.editor.Table.DEFAULT_BORDER_COLOR = '#888'; 
goog.editor.Table.createDomTable = function(doc, columns, rows, opt_tableStyle) { 
  var style = { 
    borderWidth: '1', 
    borderColor: goog.editor.Table.DEFAULT_BORDER_COLOR 
  }; 
  for(var prop in opt_tableStyle) { 
    style[prop]= opt_tableStyle[prop]; 
  } 
  var dom = new goog.dom.DomHelper(doc); 
  var tableElement = dom.createTable(rows, columns, true); 
  var minimumCellWidth = 10; 
  var cellWidth = Math.max(minimumCellWidth, Math.min(goog.editor.Table.OPTIMUM_EMPTY_CELL_WIDTH, goog.editor.Table.OPTIMUM_MAX_NEW_TABLE_WIDTH / columns)); 
  var tds = tableElement.getElementsByTagName(goog.dom.TagName.TD); 
  for(var i = 0, td; td = tds[i]; i ++) { 
    td.style.width = cellWidth + 'px'; 
  } 
  goog.style.setStyle(tableElement, { 
    'borderCollapse': 'collapse', 
    'borderColor': style.borderColor, 
    'borderWidth': style.borderWidth + 'px' 
  }); 
  tableElement.border = style.borderWidth; 
  tableElement.setAttribute('bordercolor', style.borderColor); 
  tableElement.setAttribute('cellspacing', '0'); 
  return tableElement; 
}; 
