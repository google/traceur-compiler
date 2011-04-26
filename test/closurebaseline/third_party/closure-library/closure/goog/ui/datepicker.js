
goog.provide('goog.ui.DatePicker'); 
goog.provide('goog.ui.DatePicker.Events'); 
goog.provide('goog.ui.DatePickerEvent'); 
goog.require('goog.date'); 
goog.require('goog.date.Date'); 
goog.require('goog.date.Interval'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.KeyHandler'); 
goog.require('goog.events.KeyHandler.EventType'); 
goog.require('goog.i18n.DateTimeFormat'); 
goog.require('goog.i18n.DateTimeSymbols'); 
goog.require('goog.style'); 
goog.require('goog.ui.Component'); 
goog.ui.DatePicker = function(opt_date, opt_dateTimeSymbols, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.symbols_ = opt_dateTimeSymbols || goog.i18n.DateTimeSymbols; 
  this.wdayNames_ = this.symbols_.SHORTWEEKDAYS; 
  this.date_ = new goog.date.Date(opt_date); 
  this.date_.setFirstWeekCutOffDay(this.symbols_.FIRSTWEEKCUTOFFDAY); 
  this.date_.setFirstDayOfWeek(this.symbols_.FIRSTDAYOFWEEK); 
  this.activeMonth_ = this.date_.clone(); 
  this.activeMonth_.setDate(1); 
  this.wdayStyles_ =['', '', '', '', '', '', '']; 
  this.wdayStyles_[this.symbols_.WEEKENDRANGE[0]]= goog.getCssName(this.getBaseCssClass(), 'wkend-start'); 
  this.wdayStyles_[this.symbols_.WEEKENDRANGE[1]]= goog.getCssName(this.getBaseCssClass(), 'wkend-end'); 
  this.keyHandlers_ = { }; 
  this.dom_ = opt_domHelper || goog.dom.getDomHelper(); 
}; 
goog.inherits(goog.ui.DatePicker, goog.ui.Component); 
goog.ui.DatePicker.prototype.showFixedNumWeeks_ = true; 
goog.ui.DatePicker.prototype.showOtherMonths_ = true; 
goog.ui.DatePicker.prototype.extraWeekAtEnd_ = true; 
goog.ui.DatePicker.prototype.showWeekNum_ = true; 
goog.ui.DatePicker.prototype.showWeekdays_ = true; 
goog.ui.DatePicker.prototype.allowNone_ = true; 
goog.ui.DatePicker.prototype.showToday_ = true; 
goog.ui.DatePicker.prototype.simpleNavigation_ = false; 
goog.ui.DatePicker.prototype.decoratorFunction_ = null; 
goog.ui.DatePicker.prototype.elNavRow_ = null; 
goog.ui.DatePicker.prototype.elFootRow_ = null; 
goog.ui.DatePicker.nextId_ = 0; 
goog.ui.DatePicker.BASE_CSS_CLASS_ = goog.getCssName('goog-date-picker'); 
goog.ui.DatePicker.Events = { 
  CHANGE: 'change', 
  SELECT: 'select' 
}; 
goog.ui.DatePicker.prototype.isCreated = goog.ui.DatePicker.prototype.isInDocument; 
goog.ui.DatePicker.prototype.getFirstWeekday = function() { 
  return this.activeMonth_.getFirstDayOfWeek(); 
}; 
goog.ui.DatePicker.prototype.getWeekdayClass = function(wday) { 
  return this.wdayStyles_[wday]; 
}; 
goog.ui.DatePicker.prototype.getShowFixedNumWeeks = function() { 
  return this.showFixedNumWeeks_; 
}; 
goog.ui.DatePicker.prototype.getShowOtherMonths = function() { 
  return this.showOtherMonths_; 
}; 
goog.ui.DatePicker.prototype.getExtraWeekAtEnd = function() { 
  return this.extraWeekAtEnd_; 
}; 
goog.ui.DatePicker.prototype.getShowWeekNum = function() { 
  return this.showWeekNum_; 
}; 
goog.ui.DatePicker.prototype.getShowWeekdayNames = function() { 
  return this.showWeekdays_; 
}; 
goog.ui.DatePicker.prototype.getAllowNone = function() { 
  return this.allowNone_; 
}; 
goog.ui.DatePicker.prototype.getShowToday = function() { 
  return this.showToday_; 
}; 
goog.ui.DatePicker.prototype.getBaseCssClass = function() { 
  return goog.ui.DatePicker.BASE_CSS_CLASS_; 
}; 
goog.ui.DatePicker.prototype.setFirstWeekday = function(wday) { 
  this.activeMonth_.setFirstDayOfWeek(wday); 
  this.updateCalendarGrid_(); 
  this.redrawWeekdays_(); 
}; 
goog.ui.DatePicker.prototype.setWeekdayClass = function(wday, className) { 
  this.wdayStyles_[wday]= className; 
  this.redrawCalendarGrid_(); 
}; 
goog.ui.DatePicker.prototype.setShowFixedNumWeeks = function(b) { 
  this.showFixedNumWeeks_ = b; 
  this.updateCalendarGrid_(); 
}; 
goog.ui.DatePicker.prototype.setShowOtherMonths = function(b) { 
  this.showOtherMonths_ = b; 
  this.redrawCalendarGrid_(); 
}; 
goog.ui.DatePicker.prototype.setUseSimpleNavigationMenu = function(b) { 
  this.simpleNavigation_ = b; 
  this.updateNavigationRow_(); 
  this.updateCalendarGrid_(); 
}; 
goog.ui.DatePicker.prototype.setExtraWeekAtEnd = function(b) { 
  this.extraWeekAtEnd_ = b; 
  this.updateCalendarGrid_(); 
}; 
goog.ui.DatePicker.prototype.setShowWeekNum = function(b) { 
  this.showWeekNum_ = b; 
  this.updateNavigationRow_(); 
  this.updateCalendarGrid_(); 
}; 
goog.ui.DatePicker.prototype.setShowWeekdayNames = function(b) { 
  this.showWeekdays_ = b; 
  this.redrawCalendarGrid_(); 
}; 
goog.ui.DatePicker.prototype.setUseNarrowWeekdayNames = function(b) { 
  this.wdayNames_ = b ? this.symbols_.NARROWWEEKDAYS: this.symbols_.SHORTWEEKDAYS; 
  this.redrawWeekdays_(); 
}; 
goog.ui.DatePicker.prototype.setAllowNone = function(b) { 
  this.allowNone_ = b; 
  if(this.elNone_) { 
    this.updateTodayAndNone_(); 
  } 
}; 
goog.ui.DatePicker.prototype.setShowToday = function(b) { 
  this.showToday_ = b; 
  if(this.elToday_) { 
    this.updateTodayAndNone_(); 
  } 
}; 
goog.ui.DatePicker.prototype.updateTodayAndNone_ = function() { 
  goog.style.showElement(this.elToday_, this.showToday_); 
  goog.style.showElement(this.elNone_, this.allowNone_); 
  goog.style.showElement(this.tableFoot_, this.showToday_ || this.allowNone_); 
}; 
goog.ui.DatePicker.prototype.setDecorator = function(f) { 
  this.decoratorFunction_ = f; 
}; 
goog.ui.DatePicker.prototype.previousMonth = function() { 
  this.activeMonth_.add(new goog.date.Interval(goog.date.Interval.MONTHS, - 1)); 
  this.updateCalendarGrid_(); 
}; 
goog.ui.DatePicker.prototype.nextMonth = function() { 
  this.activeMonth_.add(new goog.date.Interval(goog.date.Interval.MONTHS, 1)); 
  this.updateCalendarGrid_(); 
}; 
goog.ui.DatePicker.prototype.previousYear = function() { 
  this.activeMonth_.add(new goog.date.Interval(goog.date.Interval.YEARS, - 1)); 
  this.updateCalendarGrid_(); 
}; 
goog.ui.DatePicker.prototype.nextYear = function() { 
  this.activeMonth_.add(new goog.date.Interval(goog.date.Interval.YEARS, 1)); 
  this.updateCalendarGrid_(); 
}; 
goog.ui.DatePicker.prototype.selectToday = function() { 
  this.setDate(new goog.date.Date()); 
}; 
goog.ui.DatePicker.prototype.selectNone = function() { 
  if(this.allowNone_) { 
    this.setDate(null); 
  } 
}; 
goog.ui.DatePicker.prototype.getDate = function() { 
  return this.date_; 
}; 
goog.ui.DatePicker.prototype.setDate = function(date) { 
  var changed = date != this.date_ && !(date && this.date_ && date.getFullYear() == this.date_.getFullYear() && date.getMonth() == this.date_.getMonth() && date.getDate() == this.date_.getDate()); 
  this.date_ = date && new goog.date.Date(date); 
  if(date) { 
    this.activeMonth_.set(this.date_); 
    this.activeMonth_.setDate(1); 
  } 
  this.updateCalendarGrid_(); 
  var selectEvent = new goog.ui.DatePickerEvent(goog.ui.DatePicker.Events.SELECT, this, this.date_); 
  this.dispatchEvent(selectEvent); 
  if(changed) { 
    var changeEvent = new goog.ui.DatePickerEvent(goog.ui.DatePicker.Events.CHANGE, this, this.date_); 
    this.dispatchEvent(changeEvent); 
  } 
}; 
goog.ui.DatePicker.prototype.updateNavigationRow_ = function() { 
  if(! this.elNavRow_) { 
    return; 
  } 
  var row = this.elNavRow_; 
  while(row.firstChild) { 
    row.removeChild(row.firstChild); 
  } 
  var cell, monthCell, yearCell; 
  if(this.simpleNavigation_) { 
    cell = this.dom_.createElement('td'); 
    cell.colSpan = this.showWeekNum_ ? 1: 2; 
    this.createButton_(cell, '\u00AB', this.previousMonth); 
    row.appendChild(cell); 
    cell = this.dom_.createElement('td'); 
    cell.colSpan = this.showWeekNum_ ? 6: 5; 
    cell.className = goog.getCssName(this.getBaseCssClass(), 'monthyear'); 
    row.appendChild(cell); 
    this.elMonthYear_ = cell; 
    cell = this.dom_.createElement('td'); 
    this.createButton_(cell, '\u00BB', this.nextMonth); 
    row.appendChild(cell); 
  } else { 
    var fullDateFormat = this.symbols_.DATEFORMATS[goog.i18n.DateTimeFormat.Format.FULL_DATE].toLowerCase(); 
    monthCell = this.dom_.createElement('td'); 
    monthCell.colSpan = 5; 
    this.createButton_(monthCell, '\u00AB', this.previousMonth); 
    this.elMonth_ = this.createButton_(monthCell, '', this.showMonthMenu_, goog.getCssName(this.getBaseCssClass(), 'month')); 
    this.createButton_(monthCell, '\u00BB', this.nextMonth); 
    yearCell = this.dom_.createElement('td'); 
    yearCell.colSpan = 3; 
    this.createButton_(yearCell, '\u00AB', this.previousYear); 
    this.elYear_ = this.createButton_(yearCell, '', this.showYearMenu_, goog.getCssName(this.getBaseCssClass(), 'year')); 
    this.createButton_(yearCell, '\u00BB', this.nextYear); 
    if(fullDateFormat.indexOf('y') < fullDateFormat.indexOf('m')) { 
      row.appendChild(yearCell); 
      row.appendChild(monthCell); 
    } else { 
      row.appendChild(monthCell); 
      row.appendChild(yearCell); 
    } 
  } 
}; 
goog.ui.DatePicker.prototype.updateFooterRow_ = function() { 
  var row = this.elFootRow_; 
  goog.dom.removeChildren(row); 
  var cell = this.dom_.createElement('td'); 
  cell.colSpan = 2; 
  cell.className = goog.getCssName(this.getBaseCssClass(), 'today-cont'); 
  var MSG_DATEPICKER_TODAY_BUTTON_LABEL = goog.getMsg('Today'); 
  this.elToday_ = this.createButton_(cell, MSG_DATEPICKER_TODAY_BUTTON_LABEL, this.selectToday); 
  row.appendChild(cell); 
  cell = this.dom_.createElement('td'); 
  cell.colSpan = 4; 
  row.appendChild(cell); 
  cell = this.dom_.createElement('td'); 
  cell.colSpan = 2; 
  cell.className = goog.getCssName(this.getBaseCssClass(), 'none-cont'); 
  var MSG_DATEPICKER_NONE = goog.getMsg('None'); 
  this.elNone_ = this.createButton_(cell, MSG_DATEPICKER_NONE, this.selectNone); 
  row.appendChild(cell); 
  this.updateTodayAndNone_(); 
}; 
goog.ui.DatePicker.prototype.decorateInternal = function(el) { 
  goog.ui.DatePicker.superClass_.decorateInternal.call(this, el); 
  el.className = this.getBaseCssClass(); 
  var table = this.dom_.createElement('table'); 
  var thead = this.dom_.createElement('thead'); 
  var tbody = this.dom_.createElement('tbody'); 
  var tfoot = this.dom_.createElement('tfoot'); 
  goog.dom.a11y.setRole(tbody, 'grid'); 
  tbody.tabIndex = '0'; 
  this.tableBody_ = tbody; 
  this.tableFoot_ = tfoot; 
  var row = this.dom_.createElement('tr'); 
  row.className = goog.getCssName(this.getBaseCssClass(), 'head'); 
  this.elNavRow_ = row; 
  this.updateNavigationRow_(); 
  thead.appendChild(row); 
  var cell; 
  this.elTable_ =[]; 
  for(var i = 0; i < 7; i ++) { 
    row = this.dom_.createElement('tr'); 
    this.elTable_[i]=[]; 
    for(var j = 0; j < 8; j ++) { 
      cell = this.dom_.createElement(j == 0 || i == 0 ? 'th': 'td'); 
      if((j == 0 || i == 0) && j != i) { 
        cell.className =(j == 0) ? goog.getCssName(this.getBaseCssClass(), 'week'): goog.getCssName(this.getBaseCssClass(), 'wday'); 
        goog.dom.a11y.setRole(cell, j == 0 ? 'rowheader': 'columnheader'); 
      } 
      row.appendChild(cell); 
      this.elTable_[i][j]= cell; 
    } 
    tbody.appendChild(row); 
  } 
  row = this.dom_.createElement('tr'); 
  row.className = goog.getCssName(this.getBaseCssClass(), 'foot'); 
  this.elFootRow_ = row; 
  this.updateFooterRow_(); 
  tfoot.appendChild(row); 
  table.cellSpacing = '0'; 
  table.cellPadding = '0'; 
  table.appendChild(thead); 
  table.appendChild(tbody); 
  table.appendChild(tfoot); 
  el.appendChild(table); 
  this.redrawWeekdays_(); 
  this.updateCalendarGrid_(); 
  el.tabIndex = 0; 
}; 
goog.ui.DatePicker.prototype.createDom = function() { 
  goog.ui.DatePicker.superClass_.createDom.call(this); 
  this.decorateInternal(this.getElement()); 
}; 
goog.ui.DatePicker.prototype.enterDocument = function() { 
  goog.ui.DatePicker.superClass_.enterDocument.call(this); 
  var eh = this.getHandler(); 
  eh.listen(this.tableBody_, goog.events.EventType.CLICK, this.handleGridClick_); 
  eh.listen(this.getKeyHandlerForElement_(this.getElement()), goog.events.KeyHandler.EventType.KEY, this.handleGridKeyPress_); 
}; 
goog.ui.DatePicker.prototype.exitDocument = function() { 
  goog.ui.DatePicker.superClass_.exitDocument.call(this); 
  this.destroyMenu_(); 
  for(var uid in this.keyHandlers_) { 
    this.keyHandlers_[uid].dispose(); 
  } 
  this.keyHandlers_ = { }; 
}; 
goog.ui.DatePicker.prototype.create = goog.ui.DatePicker.prototype.decorate; 
goog.ui.DatePicker.prototype.disposeInternal = function() { 
  goog.ui.DatePicker.superClass_.disposeInternal.call(this); 
  this.elTable_ = null; 
  this.tableBody_ = null; 
  this.tableFoot_ = null; 
  this.elNavRow_ = null; 
  this.elFootRow_ = null; 
  this.elMonth_ = null; 
  this.elMonthYear_ = null; 
  this.elYear_ = null; 
  this.elToday_ = null; 
  this.elNone_ = null; 
}; 
goog.ui.DatePicker.prototype.handleGridClick_ = function(event) { 
  if(event.target.tagName == 'TD') { 
    var el, x = - 2, y = - 2; 
    for(el = event.target; el; el = el.previousSibling, x ++) { } 
    for(el = event.target.parentNode; el; el = el.previousSibling, y ++) { } 
    var obj = this.grid_[y][x]; 
    this.setDate(obj.clone()); 
  } 
}; 
goog.ui.DatePicker.prototype.handleGridKeyPress_ = function(event) { 
  var months, days; 
  switch(event.keyCode) { 
    case 33: 
      event.preventDefault(); 
      months = - 1; 
      break; 

    case 34: 
      event.preventDefault(); 
      months = 1; 
      break; 

    case 37: 
      event.preventDefault(); 
      days = - 1; 
      break; 

    case 39: 
      event.preventDefault(); 
      days = 1; 
      break; 

    case 38: 
      event.preventDefault(); 
      days = - 7; 
      break; 

    case 40: 
      event.preventDefault(); 
      days = 7; 
      break; 

    case 36: 
      event.preventDefault(); 
      this.selectToday(); 

    case 46: 
      event.preventDefault(); 
      this.selectNone(); 

    default: 
      return; 

  } 
  var date; 
  if(this.date_) { 
    date = this.date_.clone(); 
    date.add(new goog.date.Interval(0, months, days)); 
  } else { 
    date = this.activeMonth_.clone(); 
    date.setDate(1); 
  } 
  this.setDate(date); 
}; 
goog.ui.DatePicker.prototype.showMonthMenu_ = function(event) { 
  event.stopPropagation(); 
  var list =[]; 
  for(var i = 0; i < 12; i ++) { 
    list.push(this.symbols_.MONTHS[i]); 
  } 
  this.createMenu_(this.elMonth_, list, this.handleMonthMenuClick_, this.symbols_.MONTHS[this.activeMonth_.getMonth()]); 
}; 
goog.ui.DatePicker.prototype.showYearMenu_ = function(event) { 
  event.stopPropagation(); 
  var list =[]; 
  var year = this.activeMonth_.getFullYear() - 5; 
  for(var i = 0; i < 11; i ++) { 
    list.push(String(year + i)); 
  } 
  this.createMenu_(this.elYear_, list, this.handleYearMenuClick_, String(this.activeMonth_.getFullYear())); 
}; 
goog.ui.DatePicker.prototype.handleMonthMenuClick_ = function(target) { 
  var el = target; 
  for(var i = - 1; el; el = goog.dom.getPreviousElementSibling(el), i ++) { } 
  this.activeMonth_.setMonth(i); 
  this.updateCalendarGrid_(); 
  if(this.elMonth_.focus) { 
    this.elMonth_.focus(); 
  } 
}; 
goog.ui.DatePicker.prototype.handleYearMenuClick_ = function(target) { 
  if(target.firstChild.nodeType == goog.dom.NodeType.TEXT) { 
    this.activeMonth_.setFullYear(Number(target.firstChild.nodeValue)); 
    this.updateCalendarGrid_(); 
  } 
  this.elYear_.focus(); 
}; 
goog.ui.DatePicker.prototype.createMenu_ = function(srcEl, items, method, selected) { 
  this.destroyMenu_(); 
  var el = this.dom_.createElement('div'); 
  el.className = goog.getCssName(this.getBaseCssClass(), 'menu'); 
  this.menuSelected_ = null; 
  var ul = this.dom_.createElement('ul'); 
  for(var i = 0; i < items.length; i ++) { 
    var li = this.dom_.createDom('li', null, items[i]); 
    if(items[i]== selected) { 
      this.menuSelected_ = li; 
    } 
    ul.appendChild(li); 
  } 
  el.appendChild(ul); 
  el.style.left = srcEl.offsetLeft + srcEl.parentNode.offsetLeft + 'px'; 
  el.style.top = srcEl.offsetTop + 'px'; 
  el.style.width = srcEl.clientWidth + 'px'; 
  this.elMonth_.parentNode.appendChild(el); 
  this.menu_ = el; 
  if(! this.menuSelected_) { 
    this.menuSelected_ = ul.firstChild; 
  } 
  this.menuSelected_.className = goog.getCssName(this.getBaseCssClass(), 'menu-selected'); 
  this.menuCallback_ = method; 
  var eh = this.getHandler(); 
  eh.listen(this.menu_, goog.events.EventType.CLICK, this.handleMenuClick_); 
  eh.listen(this.getKeyHandlerForElement_(this.menu_), goog.events.KeyHandler.EventType.KEY, this.handleMenuKeyPress_); 
  eh.listen(this.dom_.getDocument(), goog.events.EventType.CLICK, this.destroyMenu_); 
  el.tabIndex = 0; 
  el.focus(); 
}; 
goog.ui.DatePicker.prototype.handleMenuClick_ = function(event) { 
  event.stopPropagation(); 
  this.destroyMenu_(); 
  if(this.menuCallback_) { 
    this.menuCallback_(event.target); 
  } 
}; 
goog.ui.DatePicker.prototype.handleMenuKeyPress_ = function(event) { 
  event.stopPropagation(); 
  var el; 
  var menuSelected = this.menuSelected_; 
  switch(event.keyCode) { 
    case 35: 
      event.preventDefault(); 
      el = menuSelected.parentNode.lastChild; 
      break; 

    case 36: 
      event.preventDefault(); 
      el = menuSelected.parentNode.firstChild; 
      break; 

    case 38: 
      event.preventDefault(); 
      el = menuSelected.previousSibling; 
      break; 

    case 40: 
      event.preventDefault(); 
      el = menuSelected.nextSibling; 
      break; 

    case 13: 
    case 9: 
    case 0: 
      event.preventDefault(); 
      this.destroyMenu_(); 
      this.menuCallback_(menuSelected); 
      break; 

  } 
  if(el && el != menuSelected) { 
    menuSelected.className = ''; 
    el.className = goog.getCssName(this.getBaseCssClass(), 'menu-selected'); 
    this.menuSelected_ = el; 
  } 
}; 
goog.ui.DatePicker.prototype.destroyMenu_ = function() { 
  if(this.menu_) { 
    var eh = this.getHandler(); 
    eh.unlisten(this.menu_, goog.events.EventType.CLICK, this.handleMenuClick_); 
    eh.unlisten(this.getKeyHandlerForElement_(this.menu_), goog.events.KeyHandler.EventType.KEY, this.handleMenuKeyPress_); 
    eh.unlisten(this.dom_.getDocument(), goog.events.EventType.CLICK, this.destroyMenu_); 
    goog.dom.removeNode(this.menu_); 
    delete this.menu_; 
  } 
}; 
goog.ui.DatePicker.prototype.createButton_ = function(parentNode, label, method, opt_className) { 
  var classes =[goog.getCssName(this.getBaseCssClass(), 'btn')]; 
  if(opt_className) { 
    classes.push(opt_className); 
  } 
  var el = this.dom_.createElement('button'); 
  el.className = classes.join(' '); 
  el.appendChild(this.dom_.createTextNode(label)); 
  parentNode.appendChild(el); 
  this.getHandler().listen(el, goog.events.EventType.CLICK, function(e) { 
    e.preventDefault(); 
    method.call(this, e); 
  }); 
  return el; 
}; 
goog.ui.DatePicker.prototype.updateCalendarGrid_ = function() { 
  if(! this.getElement()) { 
    return; 
  } 
  var date = this.activeMonth_.clone(); 
  date.setDate(1); 
  if(this.elMonthYear_) { 
    goog.dom.setTextContent(this.elMonthYear_, goog.date.formatMonthAndYear(this.symbols_.MONTHS[date.getMonth()], date.getFullYear())); 
  } 
  if(this.elMonth_) { 
    goog.dom.setTextContent(this.elMonth_, this.symbols_.MONTHS[date.getMonth()]); 
  } 
  if(this.elYear_) { 
    goog.dom.setTextContent(this.elYear_, String(date.getFullYear())); 
  } 
  var wday = date.getWeekday(); 
  var days = date.getNumberOfDaysInMonth(); 
  date.add(new goog.date.Interval(goog.date.Interval.MONTHS, - 1)); 
  date.setDate(date.getNumberOfDaysInMonth() -(wday - 1)); 
  if(this.showFixedNumWeeks_ && ! this.extraWeekAtEnd_ && days + wday < 33) { 
    date.add(new goog.date.Interval(goog.date.Interval.DAYS, - 7)); 
  } 
  var dayInterval = new goog.date.Interval(goog.date.Interval.DAYS, 1); 
  this.grid_ =[]; 
  for(var y = 0; y < 6; y ++) { 
    this.grid_[y]=[]; 
    for(var x = 0; x < 7; x ++) { 
      this.grid_[y][x]= date.clone(); 
      date.add(dayInterval); 
    } 
  } 
  this.redrawCalendarGrid_(); 
}; 
goog.ui.DatePicker.prototype.redrawCalendarGrid_ = function() { 
  if(! this.getElement()) { 
    return; 
  } 
  var month = this.activeMonth_.getMonth(); 
  var today = new goog.date.Date(); 
  var todayYear = today.getFullYear(); 
  var todayMonth = today.getMonth(); 
  var todayDate = today.getDate(); 
  for(var y = 0; y < 6; y ++) { 
    if(this.showWeekNum_) { 
      goog.dom.setTextContent(this.elTable_[y + 1][0], this.grid_[y][0].getWeekNumber()); 
      goog.dom.classes.set(this.elTable_[y + 1][0], goog.getCssName(this.getBaseCssClass(), 'week')); 
    } else { 
      goog.dom.setTextContent(this.elTable_[y + 1][0], ''); 
      goog.dom.classes.set(this.elTable_[y + 1][0], ''); 
    } 
    for(var x = 0; x < 7; x ++) { 
      var o = this.grid_[y][x]; 
      var el = this.elTable_[y + 1][x + 1]; 
      if(! el.id) { 
        el.id = 'goog-dp-' + goog.ui.DatePicker.nextId_ ++; 
      } 
      goog.dom.a11y.setRole(el, 'gridcell'); 
      var classes =[goog.getCssName(this.getBaseCssClass(), 'date')]; 
      if(this.showOtherMonths_ || o.getMonth() == month) { 
        if(o.getMonth() != month) { 
          classes.push(goog.getCssName(this.getBaseCssClass(), 'other-month')); 
        } 
        var wday =(x + this.activeMonth_.getFirstDayOfWeek() + 7) % 7; 
        if(this.wdayStyles_[wday]) { 
          classes.push(this.wdayStyles_[wday]); 
        } 
        if(o.getDate() == todayDate && o.getMonth() == todayMonth && o.getFullYear() == todayYear) { 
          classes.push(goog.getCssName(this.getBaseCssClass(), 'today')); 
        } 
        if(this.date_ && o.getDate() == this.date_.getDate() && o.getMonth() == this.date_.getMonth() && o.getFullYear() == this.date_.getFullYear()) { 
          classes.push(goog.getCssName(this.getBaseCssClass(), 'selected')); 
          goog.dom.a11y.setState(this.tableBody_, 'activedescendant', el.id); 
        } 
        if(this.decoratorFunction_) { 
          var customClass = this.decoratorFunction_(o); 
          if(customClass) { 
            classes.push(customClass); 
          } 
        } 
        goog.dom.setTextContent(el, o.getDate()); 
      } else { 
        goog.dom.setTextContent(el, ''); 
      } 
      goog.dom.classes.set(el, classes.join(' ')); 
    } 
    if(y >= 4) { 
      goog.style.showElement(this.elTable_[y + 1][0].parentNode, this.grid_[y][0].getMonth() == month || this.showFixedNumWeeks_); 
    } 
  } 
}; 
goog.ui.DatePicker.prototype.redrawWeekdays_ = function() { 
  if(! this.getElement()) { 
    return; 
  } 
  if(this.showWeekdays_) { 
    for(var x = 0; x < 7; x ++) { 
      var el = this.elTable_[0][x + 1]; 
      var wday =(x + this.activeMonth_.getFirstDayOfWeek() + 7) % 7; 
      goog.dom.setTextContent(el, this.wdayNames_[(wday + 1) % 7]); 
    } 
  } 
  goog.style.showElement(this.elTable_[0][0].parentNode, this.showWeekdays_); 
}; 
goog.ui.DatePicker.prototype.getKeyHandlerForElement_ = function(el) { 
  var uid = goog.getUid(el); 
  if(!(uid in this.keyHandlers_)) { 
    this.keyHandlers_[uid]= new goog.events.KeyHandler(el); 
  } 
  return this.keyHandlers_[uid]; 
}; 
goog.ui.DatePickerEvent = function(type, target, date) { 
  goog.events.Event.call(this, type, target); 
  this.date = date; 
}; 
goog.inherits(goog.ui.DatePickerEvent, goog.events.Event); 
