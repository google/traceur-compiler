
goog.provide('goog.ui.PaletteRenderer'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.NodeType'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.classes'); 
goog.require('goog.style'); 
goog.require('goog.ui.ControlRenderer'); 
goog.require('goog.userAgent'); 
goog.ui.PaletteRenderer = function() { 
  goog.ui.ControlRenderer.call(this); 
}; 
goog.inherits(goog.ui.PaletteRenderer, goog.ui.ControlRenderer); 
goog.addSingletonGetter(goog.ui.PaletteRenderer); 
goog.ui.PaletteRenderer.cellId_ = 0; 
goog.ui.PaletteRenderer.CSS_CLASS = goog.getCssName('goog-palette'); 
goog.ui.PaletteRenderer.prototype.createDom = function(palette) { 
  var classNames = this.getClassNames(palette); 
  return palette.getDomHelper().createDom('div', classNames ? classNames.join(' '): null, this.createGrid((palette.getContent()), palette.getSize(), palette.getDomHelper())); 
}; 
goog.ui.PaletteRenderer.prototype.createGrid = function(items, size, dom) { 
  var rows =[]; 
  for(var row = 0, index = 0; row < size.height; row ++) { 
    var cells =[]; 
    for(var column = 0; column < size.width; column ++) { 
      var item = items && items[index ++]; 
      cells.push(this.createCell(item, dom)); 
    } 
    rows.push(this.createRow(cells, dom)); 
  } 
  return this.createTable(rows, dom); 
}; 
goog.ui.PaletteRenderer.prototype.createTable = function(rows, dom) { 
  var table = dom.createDom('table', goog.getCssName(this.getCssClass(), 'table'), dom.createDom('tbody', goog.getCssName(this.getCssClass(), 'body'), rows)); 
  table.cellSpacing = 0; 
  table.cellPadding = 0; 
  goog.dom.a11y.setRole(table, 'grid'); 
  return table; 
}; 
goog.ui.PaletteRenderer.prototype.createRow = function(cells, dom) { 
  return dom.createDom('tr', goog.getCssName(this.getCssClass(), 'row'), cells); 
}; 
goog.ui.PaletteRenderer.prototype.createCell = function(node, dom) { 
  var cell = dom.createDom('td', { 
    'class': goog.getCssName(this.getCssClass(), 'cell'), 
    'id': goog.getCssName(this.getCssClass(), 'cell-') + goog.ui.PaletteRenderer.cellId_ ++ 
  }, node); 
  goog.dom.a11y.setRole(cell, 'gridcell'); 
  return cell; 
}; 
goog.ui.PaletteRenderer.prototype.canDecorate = function(element) { 
  return false; 
}; 
goog.ui.PaletteRenderer.prototype.decorate = function(palette, element) { 
  return null; 
}; 
goog.ui.PaletteRenderer.prototype.setContent = function(element, items) { 
  if(element) { 
    var tbody = goog.dom.getElementsByTagNameAndClass('tbody', goog.getCssName(this.getCssClass(), 'body'), element)[0]; 
    if(tbody) { 
      var index = 0; 
      goog.array.forEach(tbody.rows, function(row) { 
        goog.array.forEach(row.cells, function(cell) { 
          goog.dom.removeChildren(cell); 
          if(items) { 
            var item = items[index ++]; 
            if(item) { 
              goog.dom.appendChild(cell, item); 
            } 
          } 
        }); 
      }); 
      if(index < items.length) { 
        var cells =[]; 
        var dom = goog.dom.getDomHelper(element); 
        var width = tbody.rows[0].cells.length; 
        while(index < items.length) { 
          var item = items[index ++]; 
          cells.push(this.createCell(item, dom)); 
          if(cells.length == width) { 
            var row = this.createRow(cells, dom); 
            goog.dom.appendChild(tbody, row); 
            cells.length = 0; 
          } 
        } 
        if(cells.length > 0) { 
          while(cells.length < width) { 
            cells.push(this.createCell('', dom)); 
          } 
          var row = this.createRow(cells, dom); 
          goog.dom.appendChild(tbody, row); 
        } 
      } 
    } 
    goog.style.setUnselectable(element, true, goog.userAgent.GECKO); 
  } 
}; 
goog.ui.PaletteRenderer.prototype.getContainingItem = function(palette, node) { 
  var root = palette.getElement(); 
  while(node && node.nodeType == goog.dom.NodeType.ELEMENT && node != root) { 
    if(node.tagName == 'TD' && goog.dom.classes.has((node), goog.getCssName(this.getCssClass(), 'cell'))) { 
      return node.firstChild; 
    } 
    node = node.parentNode; 
  } 
  return null; 
}; 
goog.ui.PaletteRenderer.prototype.highlightCell = function(palette, node, highlight) { 
  if(node) { 
    var cell =(node.parentNode); 
    goog.dom.classes.enable(cell, goog.getCssName(this.getCssClass(), 'cell-hover'), highlight); 
    var table =(palette.getElement().firstChild); 
    goog.dom.a11y.setState(table, 'activedescendent', cell.id); 
  } 
}; 
goog.ui.PaletteRenderer.prototype.selectCell = function(palette, node, select) { 
  if(node) { 
    var cell =(node.parentNode); 
    goog.dom.classes.enable(cell, goog.getCssName(this.getCssClass(), 'cell-selected'), select); 
  } 
}; 
goog.ui.PaletteRenderer.prototype.getCssClass = function() { 
  return goog.ui.PaletteRenderer.CSS_CLASS; 
}; 
