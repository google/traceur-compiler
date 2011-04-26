
goog.provide('goog.ds.JsonDataSource'); 
goog.require('goog.Uri'); 
goog.require('goog.dom'); 
goog.require('goog.ds.DataManager'); 
goog.require('goog.ds.JsDataSource'); 
goog.require('goog.ds.LoadState'); 
goog.require('goog.ds.logger'); 
goog.ds.JsonDataSource = function(uri, name, opt_callbackParamName) { 
  goog.ds.JsDataSource.call(this, null, name, null); 
  if(uri) { 
    this.uri_ = new goog.Uri(uri); 
  } else { 
    this.uri_ = null; 
  } 
  this.callbackParamName_ = opt_callbackParamName || 'callback'; 
}; 
goog.inherits(goog.ds.JsonDataSource, goog.ds.JsDataSource); 
goog.ds.JsonDataSource.prototype.loadState_ = goog.ds.LoadState.NOT_LOADED; 
goog.ds.JsonDataSource['dataSources']= { }; 
goog.ds.JsonDataSource.prototype.load = function() { 
  if(this.uri_) { 
    goog.ds.JsonDataSource['dataSources'][this.dataName_]= this; 
    goog.ds.logger.info('Sending JS request for DataSource ' + this.getDataName() + ' to ' + this.uri_); 
    this.loadState_ = goog.ds.LoadState.LOADING; 
    var uriToCall = new goog.Uri(this.uri_); 
    uriToCall.setParameterValue(this.callbackParamName_, 'JsonReceive.' + this.dataName_); 
    goog.global['JsonReceive'][this.dataName_]= goog.bind(this.receiveData, this); 
    var scriptEl = goog.dom.createDom('script', { 'src': uriToCall }); 
    goog.dom.getElementsByTagNameAndClass('head')[0].appendChild(scriptEl); 
  } else { 
    this.root_ = { }; 
    this.loadState_ = goog.ds.LoadState.NOT_LOADED; 
  } 
}; 
goog.ds.JsonDataSource.prototype.getLoadState = function() { 
  return this.loadState_; 
}; 
goog.ds.JsonDataSource.prototype.receiveData = function(obj) { 
  this.setRoot(obj); 
  this.loadState_ = goog.ds.LoadState.LOADED; 
  goog.ds.DataManager.getInstance().fireDataChange(this.getDataName()); 
}; 
goog.global['JsonReceive']= { }; 
