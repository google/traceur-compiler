
goog.provide('goog.testing.MultiTestRunner'); 
goog.provide('goog.testing.MultiTestRunner.TestFrame'); 
goog.require('goog.Timer'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.functions'); 
goog.require('goog.string'); 
goog.require('goog.ui.Component'); 
goog.require('goog.ui.ServerChart'); 
goog.require('goog.ui.ServerChart.ChartType'); 
goog.require('goog.ui.TableSorter'); 
goog.testing.MultiTestRunner = function(opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.allTests_ =[]; 
  this.activeTests_ =[]; 
  this.eh_ = new goog.events.EventHandler(this); 
  this.tableSorter_ = new goog.ui.TableSorter(this.dom_); 
}; 
goog.inherits(goog.testing.MultiTestRunner, goog.ui.Component); 
goog.testing.MultiTestRunner.DEFAULT_TIMEOUT_MS = 45 * 1000; 
goog.testing.MultiTestRunner.STATES =['waiting for test runner', 'initializing tests', 'waiting for tests to finish']; 
goog.testing.MultiTestRunner.prototype.name_ = ''; 
goog.testing.MultiTestRunner.prototype.basePath_ = ''; 
goog.testing.MultiTestRunner.prototype.finished_ = null; 
goog.testing.MultiTestRunner.prototype.verbosePasses_ = false; 
goog.testing.MultiTestRunner.prototype.hidePasses_ = false; 
goog.testing.MultiTestRunner.prototype.stopped_ = false; 
goog.testing.MultiTestRunner.prototype.active_ = false; 
goog.testing.MultiTestRunner.prototype.startedCount_ = 0; 
goog.testing.MultiTestRunner.prototype.resultCount_ = 0; 
goog.testing.MultiTestRunner.prototype.passes_ = 0; 
goog.testing.MultiTestRunner.prototype.startTime_ = 0; 
goog.testing.MultiTestRunner.prototype.filterFn_ = goog.functions.TRUE; 
goog.testing.MultiTestRunner.prototype.timeoutMs_ = goog.testing.MultiTestRunner.DEFAULT_TIMEOUT_MS; 
goog.testing.MultiTestRunner.prototype.stats_ = null; 
goog.testing.MultiTestRunner.prototype.startButtonEl_ = null; 
goog.testing.MultiTestRunner.prototype.stopButtonEl_ = null; 
goog.testing.MultiTestRunner.prototype.logEl_ = null; 
goog.testing.MultiTestRunner.prototype.reportEl_ = null; 
goog.testing.MultiTestRunner.prototype.statsEl_ = null; 
goog.testing.MultiTestRunner.prototype.progressEl_ = null; 
goog.testing.MultiTestRunner.prototype.progressRow_ = null; 
goog.testing.MultiTestRunner.prototype.logTabEl_ = null; 
goog.testing.MultiTestRunner.prototype.reportTabEl_ = null; 
goog.testing.MultiTestRunner.prototype.statsTabEl_ = null; 
goog.testing.MultiTestRunner.prototype.poolSize_ = 1; 
goog.testing.MultiTestRunner.prototype.numFilesStatsBucketSize_ = 20; 
goog.testing.MultiTestRunner.prototype.runTimeStatsBucketSize_ = 500; 
goog.testing.MultiTestRunner.prototype.setName = function(name) { 
  this.name_ = name; 
  return this; 
}; 
goog.testing.MultiTestRunner.prototype.getName = function() { 
  return this.name_; 
}; 
goog.testing.MultiTestRunner.prototype.setBasePath = function(path) { 
  this.basePath_ = path; 
  return this; 
}; 
goog.testing.MultiTestRunner.prototype.getBasePath = function() { 
  return this.basePath_; 
}; 
goog.testing.MultiTestRunner.prototype.setVerbosePasses = function(verbose) { 
  this.verbosePasses_ = verbose; 
  return this; 
}; 
goog.testing.MultiTestRunner.prototype.getVerbosePasses = function() { 
  return this.verbosePasses_; 
}; 
goog.testing.MultiTestRunner.prototype.setHidePasses = function(hide) { 
  this.hidePasses_ = hide; 
  return this; 
}; 
goog.testing.MultiTestRunner.prototype.getHidePasses = function() { 
  return this.hidePasses_; 
}; 
goog.testing.MultiTestRunner.prototype.setStatsBucketSizes = function(f, t) { 
  this.numFilesStatsBucketSize_ = f; 
  this.runTimeStatsBucketSize_ = t; 
  return this; 
}; 
goog.testing.MultiTestRunner.prototype.setTimeout = function(timeout) { 
  this.timeoutMs_ = timeout; 
  return this; 
}; 
goog.testing.MultiTestRunner.prototype.getTimeout = function() { 
  return this.timeoutMs_; 
}; 
goog.testing.MultiTestRunner.prototype.setPoolSize = function(size) { 
  this.poolSize_ = size; 
  return this; 
}; 
goog.testing.MultiTestRunner.prototype.getPoolSize = function() { 
  return this.poolSize_; 
}; 
goog.testing.MultiTestRunner.prototype.setFilterFunction = function(filterFn) { 
  this.filterFn_ = filterFn; 
  return this; 
}; 
goog.testing.MultiTestRunner.prototype.getFilterFunction = function() { 
  return this.filterFn_; 
}; 
goog.testing.MultiTestRunner.prototype.addTests = function(tests) { 
  goog.array.extend(this.allTests_, tests); 
  return this; 
}; 
goog.testing.MultiTestRunner.prototype.getAllTests = function() { 
  return this.allTests_; 
}; 
goog.testing.MultiTestRunner.prototype.getTestsToRun = function() { 
  return goog.array.filter(this.allTests_, this.filterFn_); 
}; 
goog.testing.MultiTestRunner.prototype.getTestsThatFailed = function() { 
  var stats = this.stats_; 
  var failedTests =[]; 
  if(stats) { 
    for(var i = 0, stat; stat = stats[i]; i ++) { 
      if(! stat.success) { 
        failedTests.push(stat.testFile); 
      } 
    } 
  } 
  return failedTests; 
}; 
goog.testing.MultiTestRunner.prototype.resetProgressDom_ = function() { 
  goog.dom.removeChildren(this.progressEl_); 
  var progressTable = this.dom_.createDom('table'); 
  var progressTBody = this.dom_.createDom('tbody'); 
  this.progressRow_ = this.dom_.createDom('tr'); 
  for(var i = 0; i < this.activeTests_.length; i ++) { 
    var progressCell = this.dom_.createDom('td'); 
    this.progressRow_.appendChild(progressCell); 
  } 
  progressTBody.appendChild(this.progressRow_); 
  progressTable.appendChild(progressTBody); 
  this.progressEl_.appendChild(progressTable); 
}; 
goog.testing.MultiTestRunner.prototype.createDom = function() { 
  goog.testing.MultiTestRunner.superClass_.createDom.call(this); 
  var el = this.getElement(); 
  el.className = goog.getCssName('goog-testrunner'); 
  this.progressEl_ = this.dom_.createDom('div'); 
  this.progressEl_.className = goog.getCssName('goog-testrunner-progress'); 
  el.appendChild(this.progressEl_); 
  var buttons = this.dom_.createDom('div'); 
  buttons.className = goog.getCssName('goog-testrunner-buttons'); 
  this.startButtonEl_ = this.dom_.createDom('button', null, 'Start'); 
  this.stopButtonEl_ = this.dom_.createDom('button', { 'disabled': true }, 'Stop'); 
  buttons.appendChild(this.startButtonEl_); 
  buttons.appendChild(this.stopButtonEl_); 
  el.appendChild(buttons); 
  this.eh_.listen(this.startButtonEl_, 'click', this.onStartClicked_); 
  this.eh_.listen(this.stopButtonEl_, 'click', this.onStopClicked_); 
  this.logEl_ = this.dom_.createElement('div'); 
  this.logEl_.className = goog.getCssName('goog-testrunner-log'); 
  el.appendChild(this.logEl_); 
  this.reportEl_ = this.dom_.createElement('div'); 
  this.reportEl_.className = goog.getCssName('goog-testrunner-report'); 
  this.reportEl_.style.display = 'none'; 
  el.appendChild(this.reportEl_); 
  this.statsEl_ = this.dom_.createElement('div'); 
  this.statsEl_.className = goog.getCssName('goog-testrunner-stats'); 
  this.statsEl_.style.display = 'none'; 
  el.appendChild(this.statsEl_); 
  this.logTabEl_ = this.dom_.createDom('div', null, 'Log'); 
  this.logTabEl_.className = goog.getCssName('goog-testrunner-logtab') + ' ' + goog.getCssName('goog-testrunner-activetab'); 
  el.appendChild(this.logTabEl_); 
  this.reportTabEl_ = this.dom_.createDom('div', null, 'Report'); 
  this.reportTabEl_.className = goog.getCssName('goog-testrunner-reporttab'); 
  el.appendChild(this.reportTabEl_); 
  this.statsTabEl_ = this.dom_.createDom('div', null, 'Stats'); 
  this.statsTabEl_.className = goog.getCssName('goog-testrunner-statstab'); 
  el.appendChild(this.statsTabEl_); 
  this.eh_.listen(this.logTabEl_, 'click', this.onLogTabClicked_); 
  this.eh_.listen(this.reportTabEl_, 'click', this.onReportTabClicked_); 
  this.eh_.listen(this.statsTabEl_, 'click', this.onStatsTabClicked_); 
}; 
goog.testing.MultiTestRunner.prototype.disposeInternal = function() { 
  goog.testing.MultiTestRunner.superClass_.disposeInternal.call(this); 
  this.tableSorter_.dispose(); 
  this.eh_.dispose(); 
  this.startButtonEl_ = null; 
  this.stopButtonEl_ = null; 
  this.logEl_ = null; 
  this.reportEl_ = null; 
  this.progressEl_ = null; 
  this.logTabEl_ = null; 
  this.reportTabEl_ = null; 
  this.statsTabEl_ = null; 
  this.statsEl_ = null; 
}; 
goog.testing.MultiTestRunner.prototype.start = function() { 
  this.startButtonEl_.disabled = true; 
  this.stopButtonEl_.disabled = false; 
  this.stopped_ = false; 
  this.active_ = true; 
  this.finished_ = { }; 
  this.activeTests_ = this.getTestsToRun(); 
  this.startedCount_ = 0; 
  this.resultCount_ = 0; 
  this.passes_ = 0; 
  this.stats_ =[]; 
  this.startTime_ = goog.now(); 
  this.resetProgressDom_(); 
  goog.dom.removeChildren(this.logEl_); 
  this.resetReport_(); 
  this.clearStats_(); 
  this.showTab_(0); 
  while(this.getChildCount() > this.poolSize_) { 
    this.removeChildAt(0, true).dispose(); 
  } 
  for(var i = 0; i < this.poolSize_; i ++) { 
    if(i >= this.getChildCount()) { 
      var testFrame = new goog.testing.MultiTestRunner.TestFrame(this.basePath_, this.timeoutMs_, this.verbosePasses_, this.dom_); 
      this.addChild(testFrame, true); 
    } 
    this.runNextTest_((this.getChildAt(i))); 
  } 
}; 
goog.testing.MultiTestRunner.prototype.log = function(msg) { 
  if(msg != '.') { 
    msg = this.getTimeStamp_() + ' : ' + msg; 
  } 
  this.logEl_.appendChild(this.dom_.createDom('div', null, msg)); 
  var top = this.logEl_.scrollTop; 
  var height = this.logEl_.scrollHeight - this.logEl_.offsetHeight; 
  if(top == 0 || top > height - 50) { 
    this.logEl_.scrollTop = height; 
  } 
}; 
goog.testing.MultiTestRunner.prototype.processResult = function(frame) { 
  var success = frame.isSuccess(); 
  var report = frame.getReport(); 
  var test = frame.getTestFile(); 
  this.stats_.push(frame.getStats()); 
  this.finished_[test]= true; 
  var prefix = success ? '': '*** FAILURE *** '; 
  this.log(prefix + this.trimFileName_(test) + ' : ' +(success ? 'Passed': 'Failed')); 
  this.resultCount_ ++; 
  if(success) { 
    this.passes_ ++; 
  } 
  this.drawProgressSegment_(test, success); 
  this.writeCurrentSummary_(); 
  if(!(success && this.hidePasses_)) { 
    this.drawTestResult_(test, success, report); 
  } 
  if(! this.stopped_ && this.startedCount_ < this.activeTests_.length) { 
    this.runNextTest_(frame); 
  } else if(this.resultCount_ == this.activeTests_.length) { 
    this.finish_(); 
  } 
}; 
goog.testing.MultiTestRunner.prototype.runNextTest_ = function(frame) { 
  if(this.startedCount_ < this.activeTests_.length) { 
    var nextTest = this.activeTests_[this.startedCount_ ++]; 
    this.log(this.trimFileName_(nextTest) + ' : Loading'); 
    frame.runTest(nextTest); 
  } 
}; 
goog.testing.MultiTestRunner.prototype.finish_ = function() { 
  if(this.stopped_) { 
    this.log('Stopped'); 
  } else { 
    this.log('Finished'); 
  } 
  this.startButtonEl_.disabled = false; 
  this.stopButtonEl_.disabled = true; 
  this.active_ = false; 
  this.showTab_(1); 
  this.drawStats_(); 
  while(this.getChildCount() > 0) { 
    this.removeChildAt(0, true).disposeInternal(); 
  } 
  var unfinished =[]; 
  for(var i = 0; i < this.activeTests_.length; i ++) { 
    var test = this.activeTests_[i]; 
    if(! this.finished_[test]) { 
      unfinished.push(test); 
    } 
  } 
  if(unfinished.length) { 
    this.reportEl_.appendChild(goog.dom.createDom('pre', undefined, 'Theses tests did not finish:\n' + unfinished.join('\n'))); 
  } 
}; 
goog.testing.MultiTestRunner.prototype.resetReport_ = function() { 
  goog.dom.removeChildren(this.reportEl_); 
  var summary = this.dom_.createDom('div'); 
  summary.className = goog.getCssName('goog-testrunner-progress-summary'); 
  this.reportEl_.appendChild(summary); 
  this.writeCurrentSummary_(); 
}; 
goog.testing.MultiTestRunner.prototype.drawStats_ = function() { 
  this.drawFilesHistogram_(); 
  if(this.poolSize_ == 1) { 
    this.drawRunTimePie_(); 
    this.drawTimeHistogram_(); 
  } 
  this.drawWorstTestsTable_(); 
}; 
goog.testing.MultiTestRunner.prototype.drawFilesHistogram_ = function() { 
  this.drawStatsHistogram_('numFilesLoaded', this.numFilesStatsBucketSize_, goog.functions.identity, 500, 'Histogram showing distribution of\nnumber of files loaded per test'); 
}; 
goog.testing.MultiTestRunner.prototype.drawTimeHistogram_ = function() { 
  this.drawStatsHistogram_('totalTime', this.runTimeStatsBucketSize_, function(x) { 
    return x / 1000; 
  }, 500, 'Histogram showing distribution of\ntime spent running tests in s'); 
}; 
goog.testing.MultiTestRunner.prototype.drawStatsHistogram_ = function(statsField, bucketSize, valueTransformFn, width, title) { 
  var hist = { }, data =[], xlabels =[], ylabels =[]; 
  var max = 0; 
  for(var i = 0; i < this.stats_.length; i ++) { 
    var num = this.stats_[i][statsField]; 
    var bucket = Math.floor(num / bucketSize) * bucketSize; 
    if(bucket > max) { 
      max = bucket; 
    } 
    if(! hist[bucket]) { 
      hist[bucket]= 1; 
    } else { 
      hist[bucket]++; 
    } 
  } 
  var maxBucketSize = 0; 
  for(var i = 0; i <= max; i += bucketSize) { 
    xlabels.push(valueTransformFn(i)); 
    var count = hist[i]|| 0; 
    if(count > maxBucketSize) { 
      maxBucketSize = count; 
    } 
    data.push(count); 
  } 
  var diff = Math.max(1, Math.ceil(maxBucketSize / 10)); 
  for(var i = 0; i <= maxBucketSize; i += diff) { 
    ylabels.push(i); 
  } 
  var chart = new goog.ui.ServerChart(goog.ui.ServerChart.ChartType.VERTICAL_STACKED_BAR, width, 250); 
  chart.setTitle(title); 
  chart.addDataSet(data, 'ff9900'); 
  chart.setLeftLabels(ylabels); 
  chart.setGridY(ylabels.length - 1); 
  chart.setXLabels(xlabels); 
  chart.render(this.statsEl_); 
}; 
goog.testing.MultiTestRunner.prototype.drawRunTimePie_ = function() { 
  var totalTime = 0, runTime = 0; 
  for(var i = 0; i < this.stats_.length; i ++) { 
    var stat = this.stats_[i]; 
    totalTime += stat.totalTime; 
    runTime += stat.runTime; 
  } 
  var loadTime = totalTime - runTime; 
  var pie = new goog.ui.ServerChart(goog.ui.ServerChart.ChartType.PIE, 500, 250); 
  pie.setMinValue(0); 
  pie.setMaxValue(totalTime); 
  pie.addDataSet([runTime, loadTime], 'ff9900'); 
  pie.setXLabels(['Test execution (' + runTime + 'ms)', 'Loading (' + loadTime + 'ms)']); 
  pie.render(this.statsEl_); 
}; 
goog.testing.MultiTestRunner.prototype.drawWorstTestsTable_ = function() { 
  this.stats_.sort(function(a, b) { 
    return b['numFilesLoaded']- a['numFilesLoaded']; 
  }); 
  var tbody = goog.bind(this.dom_.createDom, this.dom_, 'tbody'); 
  var thead = goog.bind(this.dom_.createDom, this.dom_, 'thead'); 
  var tr = goog.bind(this.dom_.createDom, this.dom_, 'tr'); 
  var th = goog.bind(this.dom_.createDom, this.dom_, 'th'); 
  var td = goog.bind(this.dom_.createDom, this.dom_, 'td'); 
  var a = goog.bind(this.dom_.createDom, this.dom_, 'a'); 
  var head = thead({ 'style': 'cursor: pointer' }, tr(null, th(null, ' '), th(null, 'Test file'), th('center', 'Num files loaded'), th('center', 'Run time (ms)'), th('center', 'Total time (ms)'))); 
  var body = tbody(); 
  var table = this.dom_.createDom('table', null, head, body); 
  for(var i = 0; i < this.stats_.length; i ++) { 
    var stat = this.stats_[i]; 
    body.appendChild(tr(null, td('center', String(i + 1)), td(null, a({ 
      'href': this.basePath_ + stat['testFile'], 
      'target': '_blank' 
    }, stat['testFile'])), td('center', String(stat['numFilesLoaded'])), td('center', String(stat['runTime'])), td('center', String(stat['totalTime'])))); 
  } 
  this.statsEl_.appendChild(table); 
  this.tableSorter_.setDefaultSortFunction(goog.ui.TableSorter.numericSort); 
  this.tableSorter_.setSortFunction(1, goog.ui.TableSorter.alphaSort); 
  this.tableSorter_.decorate(table); 
}; 
goog.testing.MultiTestRunner.prototype.clearStats_ = function() { 
  goog.dom.removeChildren(this.statsEl_); 
}; 
goog.testing.MultiTestRunner.prototype.writeCurrentSummary_ = function() { 
  var total = this.activeTests_.length; 
  var executed = this.resultCount_; 
  var passes = this.passes_; 
  var duration = Math.round((goog.now() - this.startTime_) / 1000); 
  var text = executed + ' of ' + total + ' tests executed.<br>' + passes + ' passed, ' +(executed - passes) + ' failed.<br>' + 'Duration: ' + duration + 's.'; 
  this.reportEl_.firstChild.innerHTML = text; 
}; 
goog.testing.MultiTestRunner.prototype.drawProgressSegment_ = function(title, success) { 
  var part = this.progressRow_.cells[this.resultCount_ - 1]; 
  part.title = title + ' : ' +(success ? 'SUCCESS': 'FAILURE'); 
  part.style.backgroundColor = success ? '#090': '#900'; 
}; 
goog.testing.MultiTestRunner.prototype.drawTestResult_ = function(test, success, report) { 
  var text = goog.string.isEmpty(report) ? 'No report for ' + test + '\n': report; 
  var el = this.dom_.createDom('div'); 
  text = goog.string.htmlEscape(text).replace(/\n/g, '<br>'); 
  if(success) { 
    el.className = goog.getCssName('goog-testrunner-report-success'); 
  } else { 
    text += '<a href="' + this.basePath_ + test + '">Run individually &raquo;</a><br>&nbsp;'; 
    el.className = goog.getCssName('goog-testrunner-report-failure'); 
  } 
  el.innerHTML = text; 
  this.reportEl_.appendChild(el); 
}; 
goog.testing.MultiTestRunner.prototype.getTimeStamp_ = function() { 
  var d = new Date; 
  return goog.string.padNumber(d.getHours(), 2) + ':' + goog.string.padNumber(d.getMinutes(), 2) + ':' + goog.string.padNumber(d.getSeconds(), 2); 
}; 
goog.testing.MultiTestRunner.prototype.trimFileName_ = function(name) { 
  if(name.length < 35) { 
    return name; 
  } 
  var parts = name.split('/'); 
  var result = ''; 
  while(result.length < 35 && parts.length > 0) { 
    result = '/' + parts.pop() + result; 
  } 
  return '...' + result; 
}; 
goog.testing.MultiTestRunner.prototype.showTab_ = function(tab) { 
  var activeTabCssClass = goog.getCssName('goog-testrunner-activetab'); 
  if(tab == 0) { 
    this.logEl_.style.display = ''; 
    goog.dom.classes.add(this.logTabEl_, activeTabCssClass); 
  } else { 
    this.logEl_.style.display = 'none'; 
    goog.dom.classes.remove(this.logTabEl_, activeTabCssClass); 
  } 
  if(tab == 1) { 
    this.reportEl_.style.display = ''; 
    goog.dom.classes.add(this.reportTabEl_, activeTabCssClass); 
  } else { 
    this.reportEl_.style.display = 'none'; 
    goog.dom.classes.remove(this.reportTabEl_, activeTabCssClass); 
  } 
  if(tab == 2) { 
    this.statsEl_.style.display = ''; 
    goog.dom.classes.add(this.statsTabEl_, activeTabCssClass); 
  } else { 
    this.statsEl_.style.display = 'none'; 
    goog.dom.classes.remove(this.statsTabEl_, activeTabCssClass); 
  } 
}; 
goog.testing.MultiTestRunner.prototype.onStartClicked_ = function(e) { 
  this.start(); 
}; 
goog.testing.MultiTestRunner.prototype.onStopClicked_ = function(e) { 
  this.stopped_ = true; 
  this.finish_(); 
}; 
goog.testing.MultiTestRunner.prototype.onLogTabClicked_ = function(e) { 
  this.showTab_(0); 
}; 
goog.testing.MultiTestRunner.prototype.onReportTabClicked_ = function(e) { 
  this.showTab_(1); 
}; 
goog.testing.MultiTestRunner.prototype.onStatsTabClicked_ = function(e) { 
  this.showTab_(2); 
}; 
goog.testing.MultiTestRunner.TestFrame = function(basePath, timeoutMs, verbosePasses, opt_domHelper) { 
  goog.ui.Component.call(this, opt_domHelper); 
  this.basePath_ = basePath; 
  this.timeoutMs_ = timeoutMs; 
  this.verbosePasses_ = verbosePasses; 
  this.eh_ = new goog.events.EventHandler(this); 
}; 
goog.inherits(goog.testing.MultiTestRunner.TestFrame, goog.ui.Component); 
goog.testing.MultiTestRunner.TestFrame.prototype.iframeEl_ = null; 
goog.testing.MultiTestRunner.TestFrame.prototype.iframeLoaded_ = false; 
goog.testing.MultiTestRunner.TestFrame.prototype.testFile_ = ''; 
goog.testing.MultiTestRunner.TestFrame.prototype.report_ = ''; 
goog.testing.MultiTestRunner.TestFrame.prototype.totalTime_ = 0; 
goog.testing.MultiTestRunner.TestFrame.prototype.runTime_ = 0; 
goog.testing.MultiTestRunner.TestFrame.prototype.numFilesLoaded_ = 0; 
goog.testing.MultiTestRunner.TestFrame.prototype.isSuccess_ = null; 
goog.testing.MultiTestRunner.TestFrame.prototype.startTime_ = 0; 
goog.testing.MultiTestRunner.TestFrame.prototype.lastStateTime_ = 0; 
goog.testing.MultiTestRunner.TestFrame.prototype.currentState_ = 0; 
goog.testing.MultiTestRunner.TestFrame.prototype.disposeInternal = function() { 
  goog.testing.MultiTestRunner.TestFrame.superClass_.disposeInternal.call(this); 
  this.dom_.removeNode(this.iframeEl_); 
  this.eh_.dispose(); 
  this.iframeEl_ = null; 
}; 
goog.testing.MultiTestRunner.TestFrame.prototype.runTest = function(testFile) { 
  this.lastStateTime_ = this.startTime_ = goog.now(); 
  if(! this.iframeEl_) { 
    this.createIframe_(); 
  } 
  this.iframeLoaded_ = false; 
  this.currentState_ = 0; 
  this.isSuccess_ = null; 
  this.report_ = ''; 
  this.testFile_ = testFile; 
  try { 
    this.iframeEl_.src = this.basePath_ + testFile; 
  } catch(e) { 
    this.report_ = this.testFile_ + ' failed to load : ' + e.message; 
    this.isSuccess_ = false; 
    this.finish_(); 
    return; 
  } 
  this.checkForCompletion_(); 
}; 
goog.testing.MultiTestRunner.TestFrame.prototype.getTestFile = function() { 
  return this.testFile_; 
}; 
goog.testing.MultiTestRunner.TestFrame.prototype.getStats = function() { 
  return { 
    'testFile': this.testFile_, 
    'success': this.isSuccess_, 
    'runTime': this.runTime_, 
    'totalTime': this.totalTime_, 
    'numFilesLoaded': this.numFilesLoaded_ 
  }; 
}; 
goog.testing.MultiTestRunner.TestFrame.prototype.getReport = function() { 
  return this.report_; 
}; 
goog.testing.MultiTestRunner.TestFrame.prototype.isSuccess = function() { 
  return this.isSuccess_; 
}; 
goog.testing.MultiTestRunner.TestFrame.prototype.finish_ = function() { 
  this.totalTime_ = goog.now() - this.startTime_; 
  if(this.getParent() && this.getParent().processResult) { 
    this.getParent().processResult(this); 
  } 
}; 
goog.testing.MultiTestRunner.TestFrame.prototype.createIframe_ = function() { 
  this.iframeEl_ =(this.dom_.createDom('iframe')); 
  this.getElement().appendChild(this.iframeEl_); 
  this.eh_.listen(this.iframeEl_, 'load', this.onIframeLoaded_); 
}; 
goog.testing.MultiTestRunner.TestFrame.prototype.onIframeLoaded_ = function(e) { 
  this.iframeLoaded_ = true; 
}; 
goog.testing.MultiTestRunner.TestFrame.prototype.checkForCompletion_ = function() { 
  var js = goog.dom.getFrameContentWindow(this.iframeEl_); 
  switch(this.currentState_) { 
    case 0: 
      if(this.iframeLoaded_ && js['G_testRunner']) { 
        this.lastStateTime_ = goog.now(); 
        this.currentState_ ++; 
      } 
      break; 

    case 1: 
      if(js['G_testRunner']['isInitialized']()) { 
        this.lastStateTime_ = goog.now(); 
        this.currentState_ ++; 
      } 
      break; 

    case 2: 
      if(js['G_testRunner']['isFinished']()) { 
        var tr = js['G_testRunner']; 
        this.isSuccess_ = tr['isSuccess'](); 
        this.report_ = tr['getReport'](this.verbosePasses_); 
        this.runTime_ = tr['getRunTime'](); 
        this.numFilesLoaded_ = tr['getNumFilesLoaded'](); 
        this.finish_(); 
        return; 
      } 

  } 
  if(goog.now() - this.lastStateTime_ > this.timeoutMs_) { 
    this.report_ = this.testFile_ + ' timed out  ' + goog.testing.MultiTestRunner.STATES[this.currentState_]; 
    this.isSuccess_ = false; 
    this.finish_(); 
    return; 
  } 
  goog.Timer.callOnce(this.checkForCompletion_, 100, this); 
}; 
