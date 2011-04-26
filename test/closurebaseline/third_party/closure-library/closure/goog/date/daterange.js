
goog.provide('goog.date.DateRange'); 
goog.provide('goog.date.DateRange.Iterator'); 
goog.provide('goog.date.DateRange.StandardDateRangeKeys'); 
goog.require('goog.date.Date'); 
goog.require('goog.date.Interval'); 
goog.require('goog.iter.Iterator'); 
goog.require('goog.iter.StopIteration'); 
goog.date.DateRange = function(startDate, endDate) { 
  this.startDate_ = startDate; 
  this.endDate_ = endDate; 
}; 
goog.date.DateRange.MINIMUM_DATE = new goog.date.Date(0000, 0, 1); 
goog.date.DateRange.MAXIMUM_DATE = new goog.date.Date(9999, 11, 31); 
goog.date.DateRange.prototype.getStartDate = function() { 
  return this.startDate_; 
}; 
goog.date.DateRange.prototype.getEndDate = function() { 
  return this.endDate_; 
}; 
goog.date.DateRange.prototype.iterator = function() { 
  return new goog.date.DateRange.Iterator(this); 
}; 
goog.date.DateRange.equals = function(a, b) { 
  if(a === b) { 
    return true; 
  } 
  if(a == null || b == null) { 
    return false; 
  } 
  return a.startDate_.equals(b.startDate_) && a.endDate_.equals(b.endDate_); 
}; 
goog.date.DateRange.offsetInDays_ = function(date, offset) { 
  var newDate = date.clone(); 
  newDate.add(new goog.date.Interval(goog.date.Interval.DAYS, offset)); 
  return newDate; 
}; 
goog.date.DateRange.currentOrLastMonday_ = function(date) { 
  var newDate = date.clone(); 
  newDate.add(new goog.date.Interval(goog.date.Interval.DAYS, - newDate.getIsoWeekday())); 
  return newDate; 
}; 
goog.date.DateRange.offsetInMonths_ = function(date, offset) { 
  var newDate = date.clone(); 
  newDate.setDate(1); 
  newDate.add(new goog.date.Interval(goog.date.Interval.MONTHS, offset)); 
  return newDate; 
}; 
goog.date.DateRange.yesterday = function(opt_today) { 
  var today = goog.date.DateRange.cloneOrCreate_(opt_today); 
  var yesterday = goog.date.DateRange.offsetInDays_(today, - 1); 
  return new goog.date.DateRange(yesterday, yesterday); 
}; 
goog.date.DateRange.today = function(opt_today) { 
  var today = goog.date.DateRange.cloneOrCreate_(opt_today); 
  return new goog.date.DateRange(today, today); 
}; 
goog.date.DateRange.last7Days = function(opt_today) { 
  var today = goog.date.DateRange.cloneOrCreate_(opt_today); 
  var yesterday = goog.date.DateRange.offsetInDays_(today, - 1); 
  return new goog.date.DateRange(goog.date.DateRange.offsetInDays_(today, - 7), yesterday); 
}; 
goog.date.DateRange.thisMonth = function(opt_today) { 
  var today = goog.date.DateRange.cloneOrCreate_(opt_today); 
  return new goog.date.DateRange(goog.date.DateRange.offsetInMonths_(today, 0), goog.date.DateRange.offsetInDays_(goog.date.DateRange.offsetInMonths_(today, 1), - 1)); 
}; 
goog.date.DateRange.lastMonth = function(opt_today) { 
  var today = goog.date.DateRange.cloneOrCreate_(opt_today); 
  return new goog.date.DateRange(goog.date.DateRange.offsetInMonths_(today, - 1), goog.date.DateRange.offsetInDays_(goog.date.DateRange.offsetInMonths_(today, 0), - 1)); 
}; 
goog.date.DateRange.thisWeek = function(opt_today) { 
  var today = goog.date.DateRange.cloneOrCreate_(opt_today); 
  var iso = today.getIsoWeekday(); 
  var firstDay = today.getFirstDayOfWeek(); 
  var i18nFirstDay =(iso >= firstDay) ? iso - firstDay: iso +(7 - firstDay); 
  var start = goog.date.DateRange.offsetInDays_(today, - i18nFirstDay); 
  var end = goog.date.DateRange.offsetInDays_(start, 6); 
  return new goog.date.DateRange(start, end); 
}; 
goog.date.DateRange.lastWeek = function(opt_today) { 
  var thisWeek = goog.date.DateRange.thisWeek(opt_today); 
  var start = goog.date.DateRange.offsetInDays_(thisWeek.getStartDate(), - 7); 
  var end = goog.date.DateRange.offsetInDays_(thisWeek.getEndDate(), - 7); 
  return new goog.date.DateRange(start, end); 
}; 
goog.date.DateRange.lastBusinessWeek = function(opt_today) { 
  var today = goog.date.DateRange.cloneOrCreate_(opt_today); 
  var start = goog.date.DateRange.offsetInDays_(today, - 7 - today.getIsoWeekday()); 
  var end = goog.date.DateRange.offsetInDays_(start, 4); 
  return new goog.date.DateRange(start, end); 
}; 
goog.date.DateRange.allTime = function(opt_today) { 
  return new goog.date.DateRange(goog.date.DateRange.MINIMUM_DATE, goog.date.DateRange.MAXIMUM_DATE); 
}; 
goog.date.DateRange.StandardDateRangeKeys = { 
  YESTERDAY: 'yesterday', 
  TODAY: 'today', 
  LAST_7_DAYS: 'last7days', 
  THIS_MONTH: 'thismonth', 
  LAST_MONTH: 'lastmonth', 
  THIS_WEEK: 'thisweek', 
  LAST_WEEK: 'lastweek', 
  LAST_BUSINESS_WEEK: 'lastbusinessweek', 
  ALL_TIME: 'alltime' 
}; 
goog.date.DateRange.standardDateRange = function(dateRangeKey, opt_today) { 
  switch(dateRangeKey) { 
    case goog.date.DateRange.StandardDateRangeKeys.YESTERDAY: 
      return goog.date.DateRange.yesterday(opt_today); 

    case goog.date.DateRange.StandardDateRangeKeys.TODAY: 
      return goog.date.DateRange.today(opt_today); 

    case goog.date.DateRange.StandardDateRangeKeys.LAST_7_DAYS: 
      return goog.date.DateRange.last7Days(opt_today); 

    case goog.date.DateRange.StandardDateRangeKeys.THIS_MONTH: 
      return goog.date.DateRange.thisMonth(opt_today); 

    case goog.date.DateRange.StandardDateRangeKeys.LAST_MONTH: 
      return goog.date.DateRange.lastMonth(opt_today); 

    case goog.date.DateRange.StandardDateRangeKeys.THIS_WEEK: 
      return goog.date.DateRange.thisWeek(opt_today); 

    case goog.date.DateRange.StandardDateRangeKeys.LAST_WEEK: 
      return goog.date.DateRange.lastWeek(opt_today); 

    case goog.date.DateRange.StandardDateRangeKeys.LAST_BUSINESS_WEEK: 
      return goog.date.DateRange.lastBusinessWeek(opt_today); 

    case goog.date.DateRange.StandardDateRangeKeys.ALL_TIME: 
      return goog.date.DateRange.allTime(opt_today); 

    default: 
      throw Error('no such date range key: ' + dateRangeKey); 

  } 
}; 
goog.date.DateRange.cloneOrCreate_ = function(opt_today) { 
  return opt_today ? opt_today.clone(): new goog.date.Date(); 
}; 
goog.date.DateRange.Iterator = function(dateRange) { 
  this.nextDate_ = dateRange.getStartDate().clone(); 
  this.endDate_ = Number(dateRange.getEndDate().toIsoString()); 
}; 
goog.inherits(goog.date.DateRange.Iterator, goog.iter.Iterator); 
goog.date.DateRange.Iterator.prototype.next = function() { 
  if(Number(this.nextDate_.toIsoString()) > this.endDate_) { 
    throw goog.iter.StopIteration; 
  } 
  var rv = this.nextDate_.clone(); 
  this.nextDate_.add(new goog.date.Interval(goog.date.Interval.DAYS, 1)); 
  return rv; 
}; 
