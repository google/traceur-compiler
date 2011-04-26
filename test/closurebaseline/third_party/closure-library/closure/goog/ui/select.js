
goog.provide('goog.ui.Select'); 
goog.require('goog.events.EventType'); 
goog.require('goog.ui.Component.EventType'); 
goog.require('goog.ui.ControlContent'); 
goog.require('goog.ui.MenuButton'); 
goog.require('goog.ui.SelectionModel'); 
goog.require('goog.ui.registry'); 
goog.ui.Select = function(caption, opt_menu, opt_renderer, opt_domHelper) { 
  goog.ui.MenuButton.call(this, caption, opt_menu, opt_renderer, opt_domHelper); 
  this.setDefaultCaption(caption); 
}; 
goog.inherits(goog.ui.Select, goog.ui.MenuButton); 
goog.ui.Select.prototype.selectionModel_ = null; 
goog.ui.Select.prototype.defaultCaption_ = null; 
goog.ui.Select.prototype.enterDocument = function() { 
  goog.ui.Select.superClass_.enterDocument.call(this); 
  this.updateCaption_(); 
  this.listenToSelectionModelEvents_(); 
}; 
goog.ui.Select.prototype.decorateInternal = function(element) { 
  goog.ui.Select.superClass_.decorateInternal.call(this, element); 
  var caption = this.getCaption(); 
  if(caption) { 
    this.setDefaultCaption(caption); 
  } else { 
    this.setSelectedIndex(0); 
  } 
}; 
goog.ui.Select.prototype.disposeInternal = function() { 
  goog.ui.Select.superClass_.disposeInternal.call(this); 
  if(this.selectionModel_) { 
    this.selectionModel_.dispose(); 
    this.selectionModel_ = null; 
  } 
  this.defaultCaption_ = null; 
}; 
goog.ui.Select.prototype.handleMenuAction = function(e) { 
  this.setSelectedItem((e.target)); 
  goog.ui.Select.superClass_.handleMenuAction.call(this, e); 
  e.stopPropagation(); 
  this.dispatchEvent(goog.ui.Component.EventType.ACTION); 
}; 
goog.ui.Select.prototype.handleSelectionChange = function(e) { 
  var item = this.getSelectedItem(); 
  goog.ui.Select.superClass_.setValue.call(this, item && item.getValue()); 
  this.updateCaption_(); 
}; 
goog.ui.Select.prototype.setMenu = function(menu) { 
  var oldMenu = goog.ui.Select.superClass_.setMenu.call(this, menu); 
  if(menu != oldMenu) { 
    if(this.selectionModel_) { 
      this.selectionModel_.clear(); 
    } 
    if(menu) { 
      if(this.selectionModel_) { 
        menu.forEachChild(function(child, index) { 
          this.selectionModel_.addItem(child); 
        }, this); 
      } else { 
        this.createSelectionModel_(menu); 
      } 
    } 
  } 
  return oldMenu; 
}; 
goog.ui.Select.prototype.getDefaultCaption = function() { 
  return this.defaultCaption_; 
}; 
goog.ui.Select.prototype.setDefaultCaption = function(caption) { 
  this.defaultCaption_ = caption; 
  this.updateCaption_(); 
}; 
goog.ui.Select.prototype.addItem = function(item) { 
  goog.ui.Select.superClass_.addItem.call(this, item); 
  if(this.selectionModel_) { 
    this.selectionModel_.addItem(item); 
  } else { 
    this.createSelectionModel_(this.getMenu()); 
  } 
}; 
goog.ui.Select.prototype.addItemAt = function(item, index) { 
  goog.ui.Select.superClass_.addItemAt.call(this, item, index); 
  if(this.selectionModel_) { 
    this.selectionModel_.addItemAt(item, index); 
  } else { 
    this.createSelectionModel_(this.getMenu()); 
  } 
}; 
goog.ui.Select.prototype.removeItem = function(item) { 
  goog.ui.Select.superClass_.removeItem.call(this, item); 
  if(this.selectionModel_) { 
    this.selectionModel_.removeItem(item); 
  } 
}; 
goog.ui.Select.prototype.removeItemAt = function(index) { 
  goog.ui.Select.superClass_.removeItemAt.call(this, index); 
  if(this.selectionModel_) { 
    this.selectionModel_.removeItemAt(index); 
  } 
}; 
goog.ui.Select.prototype.setSelectedItem = function(item) { 
  if(this.selectionModel_) { 
    this.selectionModel_.setSelectedItem(item); 
  } 
}; 
goog.ui.Select.prototype.setSelectedIndex = function(index) { 
  if(this.selectionModel_) { 
    this.setSelectedItem((this.selectionModel_.getItemAt(index))); 
  } 
}; 
goog.ui.Select.prototype.setValue = function(value) { 
  if(goog.isDefAndNotNull(value) && this.selectionModel_) { 
    for(var i = 0, item; item = this.selectionModel_.getItemAt(i); i ++) { 
      if(item && typeof item.getValue == 'function' && item.getValue() == value) { 
        this.setSelectedItem((item)); 
        return; 
      } 
    } 
  } 
  this.setSelectedItem(null); 
}; 
goog.ui.Select.prototype.getSelectedItem = function() { 
  return this.selectionModel_ ?(this.selectionModel_.getSelectedItem()): null; 
}; 
goog.ui.Select.prototype.getSelectedIndex = function() { 
  return this.selectionModel_ ? this.selectionModel_.getSelectedIndex(): - 1; 
}; 
goog.ui.Select.prototype.getSelectionModel = function() { 
  return this.selectionModel_; 
}; 
goog.ui.Select.prototype.createSelectionModel_ = function(opt_component) { 
  this.selectionModel_ = new goog.ui.SelectionModel(); 
  if(opt_component) { 
    opt_component.forEachChild(function(child, index) { 
      this.selectionModel_.addItem(child); 
    }, this); 
  } 
  this.listenToSelectionModelEvents_(); 
}; 
goog.ui.Select.prototype.listenToSelectionModelEvents_ = function() { 
  if(this.selectionModel_) { 
    this.getHandler().listen(this.selectionModel_, goog.events.EventType.SELECT, this.handleSelectionChange); 
  } 
}; 
goog.ui.Select.prototype.updateCaption_ = function() { 
  var item = this.getSelectedItem(); 
  this.setContent(item ? item.getCaption(): this.defaultCaption_); 
}; 
goog.ui.Select.prototype.setOpen = function(open, opt_e) { 
  goog.ui.Select.superClass_.setOpen.call(this, open, opt_e); 
  if(this.isOpen()) { 
    this.getMenu().setHighlightedIndex(this.getSelectedIndex()); 
  } 
}; 
goog.ui.registry.setDecoratorByClassName(goog.getCssName('goog-select'), function() { 
  return new goog.ui.Select(null); 
}); 
