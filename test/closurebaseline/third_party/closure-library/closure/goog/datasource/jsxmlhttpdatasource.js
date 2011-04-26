
goog.provide('goog.ds.JsXmlHttpDataSource'); 
goog.require('goog.Uri'); 
goog.require('goog.ds.DataManager'); 
goog.require('goog.ds.FastDataNode'); 
goog.require('goog.ds.LoadState'); 
goog.require('goog.ds.logger'); 
goog.require('goog.events'); 
goog.require('goog.net.EventType'); 
goog.require('goog.net.XhrIo'); 
goog.ds.JsXmlHttpDataSource = function(uri, name, opt_startText, opt_endText, opt_usePost) { 
  goog.ds.FastDataNode.call(this, { }, name, null); 
  if(uri) { 
    this.uri_ = new goog.Uri(uri); 
    this.xhr_ = new goog.net.XhrIo(); 
    this.usePost_ = ! ! opt_usePost; 
    goog.events.listen(this.xhr_, goog.net.EventType.COMPLETE, this.completed_, false, this); 
  } else { 
    this.uri_ = null; 
  } 
  this.startText_ = opt_startText; 
  this.endText_ = opt_endText; 
}; 
goog.inherits(goog.ds.JsXmlHttpDataSource, goog.ds.FastDataNode); 
goog.ds.JsXmlHttpDataSource.prototype.startText_; 
goog.ds.JsXmlHttpDataSource.prototype.endText_; 
goog.ds.JsXmlHttpDataSource.prototype.getLoadState = function() { 
  return this.loadState_; 
}; 
goog.ds.JsXmlHttpDataSource.prototype.setQueryData = function(data) { 
  this.queryData_ = data; 
}; 
goog.ds.JsXmlHttpDataSource.prototype.load = function() { 
  goog.ds.logger.info('Sending JS request for DataSource ' + this.getDataName() + ' to ' + this.uri_); 
  if(this.uri_) { 
    if(this.usePost_) { 
      var queryData; 
      if(! this.queryData_) { 
        queryData = this.uri_.getQueryData().toString(); 
      } else { 
        queryData = this.queryData_; 
      } 
      var uriNoQuery = this.uri_.clone(); 
      uriNoQuery.setQueryData(null); 
      this.xhr_.send(String(uriNoQuery), 'POST', queryData); 
    } else { 
      this.xhr_.send(String(this.uri_)); 
    } 
  } else { 
    this.loadState_ = goog.ds.LoadState.NOT_LOADED; 
  } 
}; 
goog.ds.JsXmlHttpDataSource.prototype.success_ = function() { 
  goog.ds.DataManager.getInstance().fireDataChange(this.getDataName()); 
}; 
goog.ds.JsXmlHttpDataSource.prototype.completed_ = function(e) { 
  if(this.xhr_.isSuccess()) { 
    goog.ds.logger.info('Got data for DataSource ' + this.getDataName()); 
    var text = this.xhr_.getResponseText(); 
    if(this.startText_) { 
      var startpos = text.indexOf(this.startText_); 
      text = text.substring(startpos + this.startText_.length); 
    } 
    if(this.endText_) { 
      var endpos = text.lastIndexOf(this.endText_); 
      text = text.substring(0, endpos); 
    } 
    try { 
      var jsonObj = eval('[' + text + '][0]'); 
      this.extendWith_(jsonObj); 
      this.loadState_ = goog.ds.LoadState.LOADED; 
    } catch(ex) { 
      this.loadState_ = goog.ds.LoadState.FAILED; 
      goog.ds.logger.severe('Failed to parse data: ' + ex.message); 
    } 
    goog.global.setTimeout(goog.bind(this.success_, this), 0); 
  } else { 
    goog.ds.logger.info('Data retrieve failed for DataSource ' + this.getDataName()); 
    this.loadState_ = goog.ds.LoadState.FAILED; 
  } 
}; 
